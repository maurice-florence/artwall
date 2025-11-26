import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const pkgPath = path.resolve(process.cwd(), 'package.json');
const envPath = path.resolve(process.cwd(), '.env.local');


function bumpVersion(version) {
  // Accepts x.y.z or x.y, increments by 0.01 (always as float, keeps 2 decimals)
  let [major, minor, patch] = version.split('.');
  if (patch === undefined) {
    patch = '0';
  }
  let v = parseFloat(`${major}.${minor}${patch}`);
  v = Math.round((v + 0.01) * 100) / 100;
  // Always keep 2 decimals
  return v.toFixed(2);
}

async function main() {
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
  const oldVersion = pkg.version || '0.00';
  const newVersion = bumpVersion(oldVersion);
  pkg.version = newVersion;
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  let commit = '';
  try {
    commit = execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    commit = '';
  }
  let envContent = '';
  try {
    envContent = await fs.readFile(envPath, 'utf8');
  } catch (e) {
    envContent = '';
  }
  envContent = envContent
    .replace(/^NEXT_PUBLIC_APP_VERSION=.*/m, '')
    .replace(/^NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=.*/m, '')
    .replace(/\n+/g, '\n')
    .trim();
  envContent += `\nNEXT_PUBLIC_APP_VERSION=${newVersion}\nNEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=${commit}\n`;
  await fs.writeFile(envPath, envContent.trim() + '\n', 'utf8');
  console.log('Injected version and commit into .env.local:', newVersion, commit);
}

main();