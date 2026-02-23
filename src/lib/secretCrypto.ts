import { createDecipheriv, createHash } from 'crypto';

const ENCRYPTION_PREFIX = 'enc:v1:';
const ALGORITHM = 'aes-256-gcm';

function resolveLegacyEncryptionKey(): Buffer | null {
  const rawKey = process.env.ANGELONE_CREDENTIALS_KEY;
  if (!rawKey) {
    return null;
  }
  return createHash('sha256').update(rawKey).digest();
}

export function encryptSecret(plainText: string): string {
  // Legacy encryption was removed to simplify operations.
  return plainText;
}

export function decryptSecret(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  if (!value.startsWith(ENCRYPTION_PREFIX)) {
    return value;
  }

  // Backward compatibility for legacy encrypted records.
  const key = resolveLegacyEncryptionKey();
  if (!key) {
    throw new Error(
      'Legacy encrypted broker credentials found. Re-save credentials in admin panel to store them in plaintext mode.',
    );
  }

  const payload = value.slice(ENCRYPTION_PREFIX.length);
  const [ivBase64, tagBase64, encryptedBase64] = payload.split(':');

  if (!ivBase64 || !tagBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted secret format.');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(tagBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}
