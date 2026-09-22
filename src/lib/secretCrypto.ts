import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ENCRYPTION_PREFIX = 'enc:v2:';
const LEGACY_ENCRYPTION_PREFIX = 'enc:v1:';
const ALGORITHM = 'aes-256-gcm';

function resolveEncryptionKey(): Buffer {
  const rawKey = process.env.ANGELONE_CREDENTIALS_KEY;
  if (!rawKey) {
    throw new Error('ANGELONE_CREDENTIALS_KEY must be configured before storing broker credentials.');
  }
  return createHash('sha256').update(rawKey).digest();
}

export function encryptSecret(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, resolveEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return `${ENCRYPTION_PREFIX}${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptSecret(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const isCurrent = value.startsWith(ENCRYPTION_PREFIX);
  const isLegacyEncrypted = value.startsWith(LEGACY_ENCRYPTION_PREFIX);
  if (!isCurrent && !isLegacyEncrypted) {
    // Read legacy plaintext records until credentials are rotated and re-saved.
    return value;
  }

  const payload = value.slice(isCurrent ? ENCRYPTION_PREFIX.length : LEGACY_ENCRYPTION_PREFIX.length);
  const [ivBase64, tagBase64, encryptedBase64] = payload.split(':');

  if (!ivBase64 || !tagBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted secret format.');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(tagBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, resolveEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}
