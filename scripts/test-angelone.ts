/**
 * Diagnostic script: checks DB credentials and tests AngelOne token live.
 * Run: npx tsx scripts/test-angelone.ts
 */
import { PrismaClient } from '@prisma/client';
import { createHash, createDecipheriv } from 'crypto';
import * as OTPAuth from 'otplib';

// Load env manually (tsx doesn't auto-load .env)
import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local', override: true });

const prisma = new PrismaClient();
const ANGELONE_BASE_URL = 'https://apiconnect.angelone.in';
const ENCRYPTION_PREFIX = 'enc:v1:';

function decrypt(value: string | null): string {
  if (!value) return '(null)';
  if (!value.startsWith(ENCRYPTION_PREFIX)) return value;

  const rawKey = process.env.ANGELONE_CREDENTIALS_KEY;
  if (!rawKey) throw new Error('Legacy encrypted value found but ANGELONE_CREDENTIALS_KEY is not set');

  const key = createHash('sha256').update(rawKey).digest();
  const payload = value.slice(ENCRYPTION_PREFIX.length);
  const [ivB64, tagB64, encB64] = payload.split(':');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(encB64, 'base64')), decipher.final()]);
  return dec.toString('utf8');
}

function mask(s: string) {
  if (s.length <= 4) return '****';
  return '*'.repeat(s.length - 4) + s.slice(-4);
}

async function testToken(jwtToken: string, apiKey: string, label: string) {
  console.log(`\n--- Testing token [${label}] ---`);
  const res = await fetch(`${ANGELONE_BASE_URL}/rest/secure/angelbroking/order/v1/searchScrip`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-UserType': 'USER',
      'X-SourceID': 'WEB',
      'X-ClientLocalIP': '192.168.1.1',
      'X-ClientPublicIP': '192.168.1.1',
      'X-MACAddress': '00:00:00:00:00:00',
      'X-PrivateKey': apiKey,
    },
    body: JSON.stringify({ exchange: 'NSE', searchscrip: 'RELIANCE' }),
  });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  console.log(`HTTP ${res.status}`);
  console.log('Response:', JSON.stringify(data, null, 2).slice(0, 800));
  return { httpOk: res.ok, data };
}

async function freshLogin(apiKey: string, clientCode: string, mpin: string, totpSecret: string) {
  const totp = OTPAuth.authenticator.generate(totpSecret);
  console.log(`\n--- Fresh login attempt (TOTP: ${totp}) ---`);
  const res = await fetch(`${ANGELONE_BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-UserType': 'USER',
      'X-SourceID': 'WEB',
      'X-ClientLocalIP': '192.168.1.1',
      'X-ClientPublicIP': '192.168.1.1',
      'X-MACAddress': '00:00:00:00:00:00',
      'X-PrivateKey': apiKey,
    },
    body: JSON.stringify({ clientcode: clientCode, password: mpin, totp }),
  });
  const text = await res.text();
  let data: Record<string, unknown>;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  console.log(`HTTP ${res.status}`);
  console.log('Response:', JSON.stringify(data, null, 2).slice(0, 800));
  return { httpStatus: res.status, data };
}

async function main() {
  console.log('=== AngelOne DB + Token Diagnostic ===\n');

  // 1. Read DB record
  const record = await prisma.angelOneCredentials.findUnique({ where: { id: 'singleton' } });

  if (!record) {
    console.log('❌ No singleton record in DB.');
    console.log('Env vars present:', {
      ANGELONE_API_KEY: !!process.env.ANGELONE_API_KEY,
      ANGELONE_CLIENT_CODE: !!process.env.ANGELONE_CLIENT_CODE,
      ANGELONE_MPIN: !!process.env.ANGELONE_MPIN,
      ANGELONE_TOTP_SECRET: !!process.env.ANGELONE_TOTP_SECRET,
    });
    return;
  }

  const apiKey     = decrypt(record.apiKey);
  const clientCode = decrypt(record.clientCode);
  const mpin       = decrypt(record.mpin);
  const totpSecret = decrypt(record.totpSecret);
  const jwtToken   = record.jwtToken ? decrypt(record.jwtToken) : null;

  console.log('DB record found:');
  console.log('  apiKey      :', mask(apiKey));
  console.log('  clientCode  :', mask(clientCode));
  console.log('  mpin        :', mask(mpin));
  console.log('  totpSecret  :', mask(totpSecret));
  console.log('  jwtToken    :', jwtToken ? mask(jwtToken) : '(null — not stored)');
  console.log('  tokenExpires:', record.tokenExpiresAt ?? '(null)');
  console.log('  now         :', new Date());

  // 2. Test stored token if present
  if (jwtToken) {
    const tokenAge = record.tokenExpiresAt
      ? `expires ${record.tokenExpiresAt.toISOString()}`
      : 'no expiry stored';
    console.log(`\nStored token (${tokenAge}):`);
    await testToken(jwtToken, apiKey, 'stored DB token');
  } else {
    console.log('\nNo JWT stored in DB — skipping stored token test.');
  }

  // 3. Fresh login test
  const loginResult = await freshLogin(apiKey, clientCode, mpin, totpSecret);
  const loginData = loginResult.data as Record<string, unknown>;

  if (loginData.status === true && loginData.data) {
    const tokenData = loginData.data as Record<string, unknown>;
    const newJwt = tokenData.jwtToken as string;
    console.log('\n✅ Fresh login SUCCESS. Testing new token...');
    await testToken(newJwt, apiKey, 'fresh token');

    // Persist fresh token to DB
    const now2 = new Date();
    const expiry = new Date(now2);
    expiry.setHours(23, 29, 59, 999);
    await prisma.angelOneCredentials.update({
      where: { id: 'singleton' },
      data: {
        jwtToken: newJwt,
        refreshToken: (tokenData.refreshToken as string) ?? null,
        feedToken: (tokenData.feedToken as string) ?? null,
        tokenGeneratedAt: now2,
        tokenExpiresAt: expiry,
      },
    });
    console.log(`\n✅ DB updated with fresh token (expires ${expiry.toISOString()})`);
  } else {
    console.log('\n❌ Fresh login FAILED. Check credentials.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
