#!/usr/bin/env node
import { exec } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
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

  // 1) Get latest deployment URL
  // Prefer explicit override via env if provided
  let deployUrl = process.env.VERCEL_DEPLOY_URL;
  if (!deployUrl) {
    // Fallback: parse text output of `vercel list --limit 1`
  const listRaw = await run(`npx --yes vercel list${confirm}${token}`);
    // Extract domain-like token, prefer *.vercel.app
    const matches = [];
    const domainRegex = /([a-z0-9.-]+\.(?:vercel\.app|[a-z0-9.-]+\.[a-z]{2,}))/gi;
    let m;
    while ((m = domainRegex.exec(listRaw)) !== null) {
      matches.push(m[1]);
    }
  const preferred = matches.find((u) => /vercel\.app$/i.test(u)) || matches[0];
    if (!preferred) {
      console.error('[vercel-logs] Could not parse latest deployment URL from `vercel list`. You can set VERCEL_DEPLOY_URL to override.');
      process.exit(1);
    }
    deployUrl = preferred;
  }
  deployUrl = ensureHttps(deployUrl);
  console.log(`[vercel-logs] Latest: ${deployUrl}`);

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
