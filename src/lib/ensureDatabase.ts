import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

let initialisationPromise: Promise<void> | null = null;

const runPrismaDbPush = async () => {
  const prismaBinary = join(
    process.cwd(),
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
  );
  const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');

  if (!existsSync(prismaBinary)) {
    throw new Error(
      'Prisma CLI not found. Please run `npm install` before starting the server.'
    );
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      prismaBinary,
      ['db', 'push', `--schema=${schemaPath}`, '--skip-generate'],
      {
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    let stderr = '';
    let stdout = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        const error = new Error(
          `Failed to apply Prisma schema (exit code ${code}).\n${stderr || stdout}`
        );
        reject(error);
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

export const ensureDatabase = async () => {
  if (!initialisationPromise) {
    initialisationPromise = (async () => {
      try {
        await runPrismaDbPush();
      } catch (error) {
        initialisationPromise = null;
        throw error;
      }
    })();
  }

  return initialisationPromise;
};
