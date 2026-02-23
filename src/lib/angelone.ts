import * as OTPAuth from 'otplib';

import { prisma } from './prisma';
import { decryptSecret, encryptSecret } from './secretCrypto';

const ANGELONE_BASE_URL = 'https://apiconnect.angelone.in';

interface AngelOneSession {
  apiKey: string;
  clientCode: string;
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
  tokenExpiresAt?: Date | null;
}

interface DecryptedAngelOneCredentials {
  apiKey: string;
  clientCode: string;
  mpin: string;
  totpSecret: string;
  jwtToken: string | null;
  refreshToken: string | null;
  feedToken: string | null;
  tokenExpiresAt: Date | null;
}

function decryptRequired(value: string, name: string): string {
  const decrypted = decryptSecret(value);
  if (!decrypted) {
    throw new Error(`AngelOne ${name} is empty after decryption.`);
  }

  return decrypted;
}

function decryptOptional(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const decrypted = decryptSecret(value);
  return decrypted || null;
}

function toDecryptedCredentials(
  credentials: {
    apiKey: string;
    clientCode: string;
    mpin: string;
    totpSecret: string;
    jwtToken: string | null;
    refreshToken: string | null;
    feedToken: string | null;
    tokenExpiresAt: Date | null;
  },
): DecryptedAngelOneCredentials {
  return {
    apiKey: decryptRequired(credentials.apiKey, 'apiKey'),
    clientCode: decryptRequired(credentials.clientCode, 'clientCode'),
    mpin: decryptRequired(credentials.mpin, 'mpin'),
    totpSecret: decryptRequired(credentials.totpSecret, 'totpSecret'),
    jwtToken: decryptOptional(credentials.jwtToken),
    refreshToken: decryptOptional(credentials.refreshToken),
    feedToken: decryptOptional(credentials.feedToken),
    tokenExpiresAt: credentials.tokenExpiresAt,
  };
}

async function ensureCredentialsExist() {
  let credentials = await prisma.angelOneCredentials.findUnique({
    where: { id: 'singleton' },
  });

  if (credentials) {
    return credentials;
  }

  const apiKey = process.env.ANGELONE_API_KEY;
  const clientCode = process.env.ANGELONE_CLIENT_CODE;
  const mpin = process.env.ANGELONE_MPIN;
  const totpSecret = process.env.ANGELONE_TOTP_SECRET;

  if (!apiKey || !clientCode || !mpin || !totpSecret) {
    throw new Error('AngelOne credentials not found in database or environment variables');
  }

  credentials = await prisma.angelOneCredentials.create({
    data: {
      id: 'singleton',
      apiKey: encryptSecret(apiKey),
      clientCode: encryptSecret(clientCode),
      mpin: encryptSecret(mpin),
      totpSecret: encryptSecret(totpSecret),
    },
  });

  return credentials;
}

/**
 * Get or refresh AngelOne session from database.
 * Automatically generates a new token when current one is missing/expired.
 */
export async function getAngelOneSession(): Promise<AngelOneSession> {
  const credentialsRecord = await ensureCredentialsExist();
  const decrypted = toDecryptedCredentials(credentialsRecord);

  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);

  const needsNewToken =
    !decrypted.jwtToken ||
    !decrypted.tokenExpiresAt ||
    now >= decrypted.tokenExpiresAt;

  if (needsNewToken) {
    console.log('Generating new AngelOne session token...');

    const totp = OTPAuth.authenticator.generate(decrypted.totpSecret);

    const loginResponse = await fetch(
      `${ANGELONE_BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '192.168.1.1',
          'X-ClientPublicIP': '192.168.1.1',
          'X-MACAddress': '00:00:00:00:00:00',
          'X-PrivateKey': decrypted.apiKey,
        },
        body: JSON.stringify({
          clientcode: decrypted.clientCode,
          password: decrypted.mpin,
          totp,
        }),
      },
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(`AngelOne login failed: ${loginData.message || 'Unknown error'}`);
    }

    await prisma.angelOneCredentials.update({
      where: { id: 'singleton' },
      data: {
        jwtToken: encryptSecret(loginData.data.jwtToken),
        refreshToken: encryptSecret(loginData.data.refreshToken),
        feedToken: encryptSecret(loginData.data.feedToken),
        tokenGeneratedAt: now,
        tokenExpiresAt: midnight,
      },
    });

    console.log('AngelOne session token generated successfully');

    return {
      apiKey: decrypted.apiKey,
      clientCode: decrypted.clientCode,
      jwtToken: loginData.data.jwtToken,
      refreshToken: loginData.data.refreshToken,
      feedToken: loginData.data.feedToken,
      tokenExpiresAt: midnight,
    };
  }

  if (!decrypted.jwtToken || !decrypted.refreshToken || !decrypted.feedToken) {
    throw new Error('AngelOne session tokens are missing. Reinitialize credentials.');
  }

  return {
    apiKey: decrypted.apiKey,
    clientCode: decrypted.clientCode,
    jwtToken: decrypted.jwtToken,
    refreshToken: decrypted.refreshToken,
    feedToken: decrypted.feedToken,
    tokenExpiresAt: decrypted.tokenExpiresAt,
  };
}

/**
 * Update AngelOne credentials in database.
 */
export async function updateAngelOneCredentials(data: {
  apiKey: string;
  clientCode: string;
  mpin: string;
  totpSecret: string;
}) {
  return prisma.angelOneCredentials.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      apiKey: encryptSecret(data.apiKey),
      clientCode: encryptSecret(data.clientCode),
      mpin: encryptSecret(data.mpin),
      totpSecret: encryptSecret(data.totpSecret),
    },
    update: {
      apiKey: encryptSecret(data.apiKey),
      clientCode: encryptSecret(data.clientCode),
      mpin: encryptSecret(data.mpin),
      totpSecret: encryptSecret(data.totpSecret),
      jwtToken: null,
      refreshToken: null,
      feedToken: null,
      tokenGeneratedAt: null,
      tokenExpiresAt: null,
    },
  });
}
