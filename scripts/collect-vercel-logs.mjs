#!/usr/bin/env node
import { exec } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { promisify } from 'node:util';
import path from 'node:path';

const pexec = promisify(exec);

async function run(cmd, opts = {}) {
  const { stdout, stderr } = await pexec(cmd, {
    env: { ...process.env },
    maxBuffer: 10 * 1024 * 1024,
    ...opts,
  });
  if (stderr && stderr.trim() && !stderr.includes('warning')) {
    // Allow non-fatal warnings, but surface other stderr
    console.error(stderr);
  }
  return stdout;
}

async function tryRun(cmd, opts = {}) {
  try {
    const { stdout, stderr } = await pexec(cmd, {
      env: { ...process.env },
      maxBuffer: 10 * 1024 * 1024,
      ...opts,
    });
    return { ok: true, stdout, stderr };
  } catch (err) {
    return { ok: false, stdout: err.stdout || '', stderr: err.stderr || String(err) };
  }
}

function ensureHttps(url) {
  if (!url) return url;
  return url.startsWith('http') ? url : `https://${url}`;
}

// Remove ANSI color codes to make CLI parsing robust
function stripAnsi(str) {
  return String(str).replace(/[\u001B\u009B][[\]()#;?]*(?:((?:;[-a-zA-Z\d\/#&.:=?%@~_]+)*|(?:[a-zA-Z\d]+(?:;[a-zA-Z\d]*)*))?\u0007|(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~])/g, '');
}

async function main() {
  console.log('[vercel-logs] Collecting latest deployment logs...');
  // Ensure output folder
  const outDir = path.resolve('vercel-logs');
  mkdirSync(outDir, { recursive: true });

  // If a Vercel token is provided, pass it to all CLI commands to enable non-interactive auth
  const token = process.env.VERCEL_TOKEN ? ` --token=${process.env.VERCEL_TOKEN}` : '';
  const confirm = ' --yes';

  // 1) Get latest Production deployment URL
  // Try REST API first for reliability (requires VERCEL_TOKEN and project id)
  let deployUrl = process.env.VERCEL_DEPLOY_URL;
  let selectedDeployment = null;
  let latestAny = null;
  let latestHealthy = null;
  let latestHealthyUrlStr = null; // from CLI fallback parsing
  let latestError = null;
  if (!deployUrl && process.env.VERCEL_TOKEN) {
    try {
      let projectId = process.env.VERCEL_PROJECT_ID;
      let teamId = process.env.VERCEL_TEAM_ID;
      if (!projectId) {
        const projectFile = path.resolve('.vercel/project.json');
        if (existsSync(projectFile)) {
          const pj = JSON.parse(readFileSync(projectFile, 'utf8'));
          projectId = pj.projectId || pj.projectIdOrName || pj.project || null;
          teamId = teamId || pj.orgId || pj.teamId || null;
        }
      }
      if (projectId) {
  const url = new URL('https://api.vercel.com/v2/deployments');
        url.searchParams.set('projectId', projectId);
        url.searchParams.set('limit', '20');
        url.searchParams.set('target', 'production');
        if (teamId) url.searchParams.set('teamId', teamId);
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data.deployments) ? data.deployments : (Array.isArray(data) ? data : []);
          // Filter production target; prefer ready/building
          const prod = list
            .filter(d => (String(d.target || d.environment || '').toLowerCase() === 'production'))
            .sort((a, b) => (b.createdAt || b.created || 0) - (a.createdAt || a.created || 0));
          latestHealthy = prod.find(d => ['ready','building'].includes(String(d.readyState || d.state || '').toLowerCase())) || null;
          latestError = prod.find(d => String(d.readyState || d.state || '').toLowerCase() === 'error') || null;
          latestAny = prod[0] || null;
          // Prefer the newest healthy (Ready/Building). If none, fall back to newest (may be Error).
          const pick = latestHealthy || latestAny || latestError || null;
          if (pick) {
            selectedDeployment = pick;
            deployUrl = pick.url ? ensureHttps(pick.url) : null;
          }
        }
      }
    } catch (e) {
      // Ignore API errors and fall back to CLI parsing
    }
  }
  // Fallback: parse CLI list output to find newest Production URL
  if (!deployUrl) {
  const listRaw = stripAnsi(await run(`npx --yes vercel list${confirm}${token}`));
    // Grab blocks that contain a URL and the word Production; prefer the first URL in the list (newest at top)
  const lines = listRaw.split(/\r?\n/);
    const okUrls = [];
    const errUrls = [];
    for (let i = 0; i < lines.length; i++) {
  const line = stripAnsi(lines[i]);
      const match = line.match(/https?:\/\/\S+/);
      if (match) {
        // Consider a small window to account for line wrapping in the CLI table
        const windowText = [lines[i], lines[i + 1] || '', lines[i + 2] || '']
          .map(stripAnsi)
          .join(' ');
        const compact = windowText.replace(/\s+/g, '');
        const isProd = /Production/i.test(compact) && !/Preview/i.test(compact);
        const isHealthy = /(Ready|Building)/i.test(compact);
        const isError = /Error/i.test(compact);
        if (isProd && (isError || isHealthy)) {
          if (isHealthy) okUrls.push(match[0]);
          else if (isError) errUrls.push(match[0]);
        }
      }
    }
    // Prefer newest healthy (Ready/Building); else newest error
  const ok = okUrls[0];
    const err = errUrls[0];
  deployUrl = ensureHttps(ok || err || '');
  if (ok) latestHealthyUrlStr = ensureHttps(ok);
  }
  if (!deployUrl) {
    console.error('[vercel-logs] Unable to determine latest Production deployment URL. Set VERCEL_DEPLOY_URL explicitly.');
    process.exit(1);
  }

  // Override VERCEL_DEPLOY_URL if it points to an Error deployment and a newer healthy one exists
  if (process.env.VERCEL_DEPLOY_URL) {
    try {
      const listRawOverride = stripAnsi(await run(`npx --yes vercel list${confirm}${token}`));
      const linesO = listRawOverride.split(/\r?\n/);
      const entries = [];
      for (let i = 0; i < linesO.length; i++) {
        const line = stripAnsi(linesO[i]);
        const match = line.match(/https?:\/\/\S+/);
        if (match) {
          const windowText = [linesO[i], linesO[i + 1] || '', linesO[i + 2] || '']
            .map(stripAnsi)
            .join(' ');
          const compact = windowText.replace(/\s+/g, '');
          const isProd = /Production/i.test(compact) && !/Preview/i.test(compact);
          const isHealthy = /(Ready|Building)/i.test(compact);
          const isError = /Error/i.test(compact);
          if (isProd && (isHealthy || isError)) {
            entries.push({ url: ensureHttps(match[0]), isHealthy, isError });
          }
        }
      }
      const envUrl = ensureHttps(process.env.VERCEL_DEPLOY_URL);
      const envEntryIndex = entries.findIndex(e => e.url === envUrl);
      if (envEntryIndex !== -1 && entries[envEntryIndex].isError) {
        // Find first healthy entry that appears before the error (newer)
        const newerHealthy = entries.find((e, idx) => e.isHealthy && idx < envEntryIndex);
        if (newerHealthy) {
          console.log(`[vercel-logs] Overriding VERCEL_DEPLOY_URL (Error) with newer healthy deployment: ${newerHealthy.url}`);
          deployUrl = newerHealthy.url;
        }
      }
    } catch {}
  }
  console.log(`[vercel-logs] Latest: ${deployUrl}`);
  if (latestHealthy && latestAny && latestHealthy.url !== latestAny.url) {
    console.log(`[vercel-logs] Latest healthy (Ready/Building): ${ensureHttps(latestHealthy.url)}`);
    try {
      writeFileSync(path.join(outDir, 'latest-ready-deployment.json'), JSON.stringify(latestHealthy, null, 2), 'utf8');
      writeFileSync(path.join(outDir, 'latest-ready-url.txt'), ensureHttps(latestHealthy.url), 'utf8');
    } catch {}
  }
  if (selectedDeployment) {
    try {
      writeFileSync(path.join(outDir, 'latest-deployment.json'), JSON.stringify(selectedDeployment, null, 2), 'utf8');
      console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-deployment.json')}`);
    } catch {}
  }
  try {
    writeFileSync(path.join(outDir, 'latest-url.txt'), deployUrl, 'utf8');
  } catch {}

  // 2) Inspect JSON (build and error context)
  let inspectJson = null;
  const insp = await tryRun(`npx --yes vercel inspect ${deployUrl} --json${token}`);
  if (insp.ok) {
    try {
      inspectJson = JSON.parse(insp.stdout);
    } catch (e) {
      const candidate = insp.stdout.trim().split('\n').reverse().find((l) => l.trim().startsWith('{'));
      if (candidate) {
        try { inspectJson = JSON.parse(candidate); } catch {}
      }
    }
  }

  if (inspectJson) {
    writeFileSync(path.join(outDir, 'latest-inspect.json'), JSON.stringify(inspectJson, null, 2), 'utf8');
    console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-inspect.json')}`);
  } else {
  const inspTxt = await tryRun(`npx --yes vercel inspect ${deployUrl}${token}`);
    const inspectOut = [inspTxt.stdout, inspTxt.stderr].filter(Boolean).join('\n\n');
    if (inspectOut.trim()) {
      writeFileSync(path.join(outDir, 'latest-inspect.txt'), inspectOut, 'utf8');
      console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-inspect.txt')}`);
    } else {
      console.warn('[vercel-logs] vercel inspect failed; no output captured.');
    }
  }

  // 3) Runtime logs (may include build/provisioning details in some cases)
  {
  const res = await tryRun(`npx --yes vercel logs ${deployUrl}${token}`);
    if (res.ok && res.stdout.trim()) {
      writeFileSync(path.join(outDir, 'latest-logs.txt'), res.stdout, 'utf8');
      console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-logs.txt')}`);
    } else {
      const errOut = [res.stdout, res.stderr].filter(Boolean).join('\n\n');
      if (errOut.trim()) {
        writeFileSync(path.join(outDir, 'latest-logs-error.txt'), errOut, 'utf8');
        console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-logs-error.txt')}`);
      } else {
        console.warn('[vercel-logs] vercel logs failed; no output captured.');
      }
    }
  }

  // 4) If the selected deployment is in Error, also collect from the most recent healthy (Ready/Building) Production deployment via CLI
  const isError = (inspectJson && String(inspectJson.readyState || inspectJson.state || '').toLowerCase() === 'error')
    || (!inspectJson && existsSync(path.join(outDir, 'latest-inspect.txt')) && /(\bCurrently:\s*●\s*Error\b|\bstatus\s*\t?\s*●\s*Error\b)/i.test(readFileSync(path.join(outDir, 'latest-inspect.txt'), 'utf8')));
  if (isError) {
    // If API provided a latest healthy, persist its URL
    if (latestHealthy && latestHealthy.url) {
      try {
        writeFileSync(path.join(outDir, 'latest-ready-url.txt'), ensureHttps(latestHealthy.url), 'utf8');
      } catch {}
    }
    try {
      const listRaw = stripAnsi(await run(`npx --yes vercel list${confirm}${token}`));
      const lines = listRaw.split(/\r?\n/);
      let healthyUrl = null;
      for (let i = 0; i < lines.length; i++) {
        const line = stripAnsi(lines[i]);
        const m = line.match(/https?:\/\/\S+/);
        if (m) {
          const isProd = /\bProduction\b/i.test(line);
          const isHealthy = /\b(Ready|Building)\b/i.test(line);
          if (isProd && isHealthy) {
            healthyUrl = ensureHttps(m[0]);
            break;
          }
        }
      }
      if (healthyUrl && healthyUrl !== deployUrl) {
        console.log(`[vercel-logs] Latest healthy (Ready/Building): ${healthyUrl}`);
        // Inspect healthy
        const inspH = await tryRun(`npx --yes vercel inspect ${healthyUrl} --json${token}`);
        if (inspH.ok) {
          try {
            const json = JSON.parse(inspH.stdout);
            writeFileSync(path.join(outDir, 'latest-ready-inspect.json'), JSON.stringify(json, null, 2), 'utf8');
            console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-ready-inspect.json')}`);
          } catch {}
        }
        if (!existsSync(path.join(outDir, 'latest-ready-inspect.json'))) {
          const inspTxtH = await tryRun(`npx --yes vercel inspect ${healthyUrl}${token}`);
          const out = [inspTxtH.stdout, inspTxtH.stderr].filter(Boolean).join('\n\n');
          if (out.trim()) {
            writeFileSync(path.join(outDir, 'latest-ready-inspect.txt'), out, 'utf8');
            console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-ready-inspect.txt')}`);
          }
        }
        // Logs healthy
        const logsH = await tryRun(`npx --yes vercel logs ${healthyUrl}${token}`);
        if (logsH.ok && logsH.stdout.trim()) {
          writeFileSync(path.join(outDir, 'latest-ready-logs.txt'), logsH.stdout, 'utf8');
          console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-ready-logs.txt')}`);
        } else {
          const errOutH = [logsH.stdout, logsH.stderr].filter(Boolean).join('\n\n');
          if (errOutH.trim()) {
            writeFileSync(path.join(outDir, 'latest-ready-logs-error.txt'), errOutH, 'utf8');
            console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-ready-logs-error.txt')}`);
          }
        }
      }
    } catch {}
  }

  // 5) Optionally fetch the env-check endpoint using a Vercel bypass token
  if (process.env.VERCEL_BYPASS_TOKEN) {
    try {
      // Prefer a healthy deployment for env-check when available
      let baseUrlForEnv = ensureHttps((latestHealthy && latestHealthy.url) ? latestHealthy.url : (latestHealthyUrlStr || deployUrl));
      // If still not obviously healthy, parse CLI list now to pick the newest Ready Production URL
      if (!latestHealthy && !latestHealthyUrlStr) {
        try {
          const listRawNow = stripAnsi(await run(`npx --yes vercel list${confirm}${token}`));
          const linesNow = listRawNow.split(/\r?\n/);
          for (let i = 0; i < linesNow.length; i++) {
            const lineNow = stripAnsi(linesNow[i]);
            const mNow = lineNow.match(/https?:\/\/\S+/);
            if (mNow) {
              const windowNow = [linesNow[i], linesNow[i + 1] || '', linesNow[i + 2] || '']
                .map(stripAnsi)
                .join(' ')
                .replace(/\s+/g, '');
              const isProdNow = /Production/i.test(windowNow) && !/Preview/i.test(windowNow);
              const isHealthyNow = /(Ready|Building)/i.test(windowNow);
              if (isProdNow && isHealthyNow) {
                baseUrlForEnv = ensureHttps(mNow[0]);
                break;
              }
            }
          }
        } catch {}
      }
      const base = new URL(baseUrlForEnv);
      const envPath = '/api/env-check';
      const withBypass = new URL(envPath, base);
      withBypass.searchParams.set('x-vercel-set-bypass-cookie', 'true');
      withBypass.searchParams.set('x-vercel-protection-bypass', process.env.VERCEL_BYPASS_TOKEN);

      // First request sets the cookie
      const r1 = await fetch(withBypass, { redirect: 'manual' });
      // Extract Set-Cookie headers in a runtime-agnostic way
      let cookieList = [];
      if (typeof r1.headers.getSetCookie === 'function') {
        cookieList = r1.headers.getSetCookie();
      } else if (typeof r1.headers.raw === 'function') {
        const raw = r1.headers.raw();
        cookieList = raw['set-cookie'] || [];
      } else {
        const single = r1.headers.get('set-cookie');
        if (single) cookieList = [single];
      }
      const cookieHeader = cookieList.map((c) => String(c).split(';')[0]).join('; ');

      // Second request includes cookie to access the protected endpoint
      const envUrl = new URL(envPath, base).toString();
      const r2 = await fetch(envUrl, {
        headers: {
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          // Also include the bypass header directly to support environments where cookies aren't captured
          'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN,
          Accept: 'application/json',
        },
      });
      // If still unauthorized, try once more passing the bypass token as query param directly
      let finalStatus = r2.status;
      let bodyText = await r2.text();
      if (finalStatus === 401) {
        const direct = new URL(envPath, base);
        direct.searchParams.set('x-vercel-protection-bypass', process.env.VERCEL_BYPASS_TOKEN);
        const r3 = await fetch(direct, { headers: { Accept: 'application/json' } });
        finalStatus = r3.status;
        bodyText = await r3.text();
      }
      let parsed;
      try { parsed = JSON.parse(bodyText); } catch { parsed = { raw: bodyText }; }
      writeFileSync(
        path.join(outDir, 'env-check.json'),
        JSON.stringify({ url: envUrl, status: finalStatus, data: parsed }, null, 2),
        'utf8'
      );
      console.log(`[vercel-logs] Wrote ${path.join(outDir, 'env-check.json')}`);
    } catch (e) {
      const msg = (e && e.stack) ? e.stack : String(e);
      writeFileSync(path.join(outDir, 'env-check-error.txt'), msg, 'utf8');
      console.warn('[vercel-logs] env-check fetch failed; wrote env-check-error.txt');
    }
  }

  console.log('[vercel-logs] Done. Share vercel-logs/latest-inspect.json (or latest-inspect.txt) and latest-logs.txt (or latest-logs-error.txt). If present, also include latest-ready-* artifacts.');
}

main().catch((err) => {
  console.error('[vercel-logs] Unexpected error:', err);
  process.exit(1);
});
