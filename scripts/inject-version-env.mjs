import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const pkgPath = path.resolve(process.cwd(), 'package.json');
const envPath = path.resolve(process.cwd(), '.env.local');

async function main() {
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
  const version = pkg.version || '0.0.0';
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
  envContent += `\nNEXT_PUBLIC_APP_VERSION=${version}\nNEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=${commit}\n`;
  await fs.writeFile(envPath, envContent.trim() + '\n', 'utf8');
  console.log('Injected version and commit into .env.local:', version, commit);
}

main();