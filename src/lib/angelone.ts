import { prisma } from './prisma';
import * as OTPAuth from 'otplib';

const ANGELONE_BASE_URL = 'https://apiconnect.angelone.in';

interface AngelOneSession {
  apiKey: string;
  clientCode: string;
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
  tokenExpiresAt?: Date | null;
}

/**
 * Get or refresh AngelOne session from database
 * Automatically generates new token if current one is expired (past midnight)
 */
export async function getAngelOneSession(): Promise<AngelOneSession> {
  // Get credentials from database
  let credentials = await prisma.angelOneCredentials.findUnique({
    where: { id: 'singleton' },
  });

  // If no credentials in DB, try to get from env as fallback
  if (!credentials) {
    const apiKey = process.env.ANGELONE_API_KEY;
    const clientCode = process.env.ANGELONE_CLIENT_CODE;
    const mpin = process.env.ANGELONE_MPIN;
    const totpSecret = process.env.ANGELONE_TOTP_SECRET;

    if (!apiKey || !clientCode || !mpin || !totpSecret) {
      throw new Error(
        'AngelOne credentials not found in database or environment variables'
      );
    }

    // Create initial credentials record
    credentials = await prisma.angelOneCredentials.create({
      data: {
        id: 'singleton',
        apiKey,
        clientCode,
        mpin,
        totpSecret,
      },
    });
  }

  // Check if token is valid (generated today and not past midnight)
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);

  const needsNewToken =
    !credentials.jwtToken ||
    !credentials.tokenExpiresAt ||
    now >= credentials.tokenExpiresAt;

  if (needsNewToken) {
    // Generate new token
    console.log('Generating new AngelOne session token...');
    
    const totp = OTPAuth.authenticator.generate(credentials.totpSecret);

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
          'X-PrivateKey': credentials.apiKey,
        },
        body: JSON.stringify({
          clientcode: credentials.clientCode,
          password: credentials.mpin,
          totp: totp,
        }),
      }
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(
        `AngelOne login failed: ${loginData.message || 'Unknown error'}`
      );
    }

    // Update credentials with new tokens
    credentials = await prisma.angelOneCredentials.update({
      where: { id: 'singleton' },
      data: {
        jwtToken: loginData.data.jwtToken,
        refreshToken: loginData.data.refreshToken,
        feedToken: loginData.data.feedToken,
        tokenGeneratedAt: now,
        tokenExpiresAt: midnight,
      },
    });

    console.log('AngelOne session token generated successfully');
  }

  return {
    apiKey: credentials.apiKey,
    clientCode: credentials.clientCode,
    jwtToken: credentials.jwtToken!,
    refreshToken: credentials.refreshToken!,
    feedToken: credentials.feedToken!,
    tokenExpiresAt: credentials.tokenExpiresAt,
  };
}

/**
 * Update AngelOne credentials in database
 */
export async function updateAngelOneCredentials(data: {
  apiKey: string;
  clientCode: string;
  mpin: string;
  totpSecret: string;
}) {
  return await prisma.angelOneCredentials.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      ...data,
    },
    update: {
      ...data,
      // Clear tokens when credentials change
      jwtToken: null,
      refreshToken: null,
      feedToken: null,
      tokenGeneratedAt: null,
      tokenExpiresAt: null,
    },
  });
}
