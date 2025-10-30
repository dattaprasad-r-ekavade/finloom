export interface ChallengeCredentials {
  username: string;
  password: string;
}

export const parseChallengeCredentials = (
  serialized: string | null
): ChallengeCredentials | null => {
  if (!serialized) {
    return null;
  }

  try {
    const parsed = JSON.parse(serialized) as ChallengeCredentials;

    if (parsed.username && parsed.password) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse stored demo credentials', error);
  }

  const [usernamePart, passwordPart] = serialized.split('|').map((part) => part.trim());

  if (
    usernamePart?.toLowerCase().startsWith('username') &&
    passwordPart?.toLowerCase().startsWith('password')
  ) {
    const username = usernamePart.split(':')[1]?.trim();
    const password = passwordPart.split(':')[1]?.trim();

    if (username && password) {
      return { username, password };
    }
  }

  return null;
};

export const serialiseChallengeCredentials = (
  credentials: ChallengeCredentials
): string => JSON.stringify(credentials);
