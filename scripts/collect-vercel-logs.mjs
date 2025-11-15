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

  // 1) Get deployments list (JSON)
  let listJsonRaw = await run(`npx --yes vercel ls --json${token}`);
  // Some vercel versions emit multiple JSON objects per line; try to parse sensibly
  let deployments = [];
  try {
    deployments = JSON.parse(listJsonRaw);
  } catch (e) {
    // try NDJSON fallback
    deployments = listJsonRaw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  }
  if (!Array.isArray(deployments) || deployments.length === 0) {
    console.error('[vercel-logs] No deployments found. Are you logged in (vercel login) or using VERCEL_TOKEN?');
    process.exit(1);
  }

  // Pick latest by created/createdAt
  const latest = deployments
    .map((d) => ({
      url: d?.url || d?.inspectUrl || d?.inspectorUrl,
      created: d?.created || d?.createdAt || 0,
      readyState: d?.readyState || d?.state,
      id: d?.uid || d?.id,
    }))
    .sort((a, b) => (b.created || 0) - (a.created || 0))[0];

  if (!latest?.url) {
    console.error('[vercel-logs] Could not determine latest deployment URL from list output.');
    process.exit(1);
  }

  const deployUrl = ensureHttps(latest.url);
  console.log(`[vercel-logs] Latest: ${deployUrl} (state=${latest.readyState || 'unknown'})`);

  // 2) Inspect JSON (build and error context)
  let inspectJson = null;
  try {
  const inspectRaw = await run(`npx --yes vercel inspect ${deployUrl} --json${token}`);
    try {
      inspectJson = JSON.parse(inspectRaw);
    } catch (e) {
      // Some versions wrap JSON in lines; attempt to find last JSON object
      const candidate = inspectRaw.trim().split('\n').reverse().find((l) => l.trim().startsWith('{'));
      if (candidate) inspectJson = JSON.parse(candidate);
    }
  } catch (e) {
    console.warn('[vercel-logs] vercel inspect failed or returned non-JSON output; continuing...');
  }

  if (inspectJson) {
    writeFileSync(path.join(outDir, 'latest-inspect.json'), JSON.stringify(inspectJson, null, 2), 'utf8');
    console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-inspect.json')}`);
  }

  // 3) Runtime logs (may include build/provisioning details in some cases)
  try {
  const logsText = await run(`npx --yes vercel logs ${deployUrl} --all --since=24h${token}`);
    writeFileSync(path.join(outDir, 'latest-logs.txt'), logsText, 'utf8');
    console.log(`[vercel-logs] Wrote ${path.join(outDir, 'latest-logs.txt')}`);
  } catch (e) {
    console.warn('[vercel-logs] vercel logs failed; are you authorized for the project?');
  }

  console.log('[vercel-logs] Done. Share vercel-logs/latest-inspect.json and latest-logs.txt for troubleshooting.');
}

main().catch((err) => {
  console.error('[vercel-logs] Unexpected error:', err);
  process.exit(1);
});
