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
          const pick = prod.find(d => ['ready','building'].includes(String(d.readyState || d.state || '').toLowerCase()))
                   || prod[0]
                   || null;
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
    const listRaw = await run(`npx --yes vercel list${confirm}${token}`);
    // Grab blocks that contain a URL and the word Production; prefer the first URL in the list (newest at top)
    const lines = listRaw.split(/\r?\n/);
    const urls = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/https?:\/\/\S+/);
      if (match) {
        // Constrain to the same line to avoid bleeding status from adjacent rows
        const isProd = /\bProduction\b/i.test(line);
        const isHealthy = /(●\s+Ready|●\s+Building)/i.test(line);
        if (isProd && isHealthy) {
          urls.push(match[0]);
        }
      }
    }
    deployUrl = ensureHttps(urls[0] || urls.find(u => /vercel\.app$/i.test(u)) || urls[0]);
  }
  if (!deployUrl) {
    console.error('[vercel-logs] Unable to determine latest Production deployment URL. Set VERCEL_DEPLOY_URL explicitly.');
    process.exit(1);
  }
  console.log(`[vercel-logs] Latest: ${deployUrl}`);
  if (selectedDeployment) {
    try {
      writeFileSync(path.join(outDir, 'latest-deployment.json'), JSON.stringify(selectedDeployment, null, 2), 'utf8');
      console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-deployment.json')}`);
    } catch {}
  }

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

  console.log('[vercel-logs] Done. Share vercel-logs/latest-inspect.json and latest-logs.txt for troubleshooting.');
}

main().catch((err) => {
  console.error('[vercel-logs] Unexpected error:', err);
  process.exit(1);
});
