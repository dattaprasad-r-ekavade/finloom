import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type ConnectionStatus =
  | {
      ok: true;
      timestamp: Date;
    }
  | {
      ok: false;
      message: string;
      hint?: string;
    };

async function getConnectionStatus(): Promise<ConnectionStatus> {
  try {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
    const timestamp = result[0]?.now ?? new Date();

    return {
      ok: true as const,
      timestamp,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lowerCaseMessage = message.toLowerCase();

    const hint = lowerCaseMessage.includes('protocol `file:`')
      ? 'Your Prisma client was generated for SQLite. Ensure `prisma generate` runs after updating the datasource provider and redeploy to refresh the client.'
      : undefined;

    return {
      ok: false as const,
      message,
      hint,
    };
  }
}

export default async function DatabaseTestPage() {
  const status = await getConnectionStatus();
  const databaseUrlConfigured = Boolean(process.env.DATABASE_URL);

  return (
    <main
      style={{
        margin: '0 auto',
        maxWidth: '720px',
        padding: '3rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <section>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Database connection test</h1>
        <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
          This server-rendered page attempts to run a simple query against your configured Prisma datasource.
        </p>
      </section>

      <section
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1.75rem',
          boxShadow: '0 10px 30px -15px rgba(15, 23, 42, 0.25)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Status</h2>
        {status.ok ? (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ color: '#047857', fontWeight: 500 }}>Successfully connected to the database.</p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Last checked at {status.timestamp.toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}.
            </p>
          </div>
        ) : (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ color: '#b91c1c', fontWeight: 500 }}>Failed to connect to the database.</p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{status.message}</p>
            {status.hint ? (
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>{status.hint}</p>
            ) : null}
          </div>
        )}
      </section>

      <section
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1.75rem',
          boxShadow: '0 10px 30px -15px rgba(15, 23, 42, 0.25)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Configuration</h2>
        <ul style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
          <li>{databaseUrlConfigured ? 'DATABASE_URL environment variable detected.' : 'DATABASE_URL environment variable is missing.'}</li>
          <li>Prisma uses the environment variable directly at runtime, so no local .env generation step is required.</li>
        </ul>
      </section>
    </main>
  );
}
