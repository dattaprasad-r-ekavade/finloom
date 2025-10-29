import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL environment variable is not set; skipping .env generation.');
  process.exit(0);
}

const desiredLine = `DATABASE_URL="${databaseUrl}"`;
let existingContent = '';
if (existsSync(envPath)) {
  existingContent = readFileSync(envPath, 'utf8');
}

const databaseUrlPattern = /^DATABASE_URL=.*$/m;
let nextContent = '';

if (databaseUrlPattern.test(existingContent)) {
  nextContent = existingContent.replace(databaseUrlPattern, desiredLine);
} else {
  const trimmed = existingContent.trimEnd();
  nextContent = trimmed ? `${trimmed}\n${desiredLine}\n` : `${desiredLine}\n`;
}

if (nextContent === existingContent) {
  console.log('.env already up to date with DATABASE_URL.');
  process.exit(0);
}

writeFileSync(envPath, nextContent, 'utf8');
console.log(`Wrote DATABASE_URL to ${envPath}.`);
