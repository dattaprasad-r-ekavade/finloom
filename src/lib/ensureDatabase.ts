import { prisma } from './prisma';

let initialisationPromise: Promise<void> | null = null;

const createRoleEnum = async () => {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      CREATE TYPE "UserRole" AS ENUM ('TRADER', 'ADMIN');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
};

const createUserTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "name" TEXT,
      "role" "UserRole" NOT NULL DEFAULT 'TRADER',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
  `);
};

const ensureEmailUniqueIndex = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  `);
};

const ensureUpdatedAtTrigger = async () => {
  // Create the trigger function
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION set_user_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW."updatedAt" = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create the trigger if it doesn't exist
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'user_updated_at_trigger'
      ) THEN
        CREATE TRIGGER user_updated_at_trigger
        BEFORE UPDATE ON "User"
        FOR EACH ROW
        EXECUTE FUNCTION set_user_updated_at();
      END IF;
    END;
    $$;
  `);
};

const initialiseDatabase = async () => {
  await createRoleEnum();
  await createUserTable();
  await ensureEmailUniqueIndex();
  await ensureUpdatedAtTrigger();
};

export const ensureDatabase = async () => {
  if (!initialisationPromise) {
    initialisationPromise = initialiseDatabase();
  }

  return initialisationPromise;
};
