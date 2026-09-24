-- Preserve old identity data while making the migrated table compatible with
-- the current KYC submission model. Dropping idNumber needs a separate audit.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'MockedKYC' AND column_name = 'idNumber') THEN
    ALTER TABLE "MockedKYC" ALTER COLUMN "idNumber" DROP NOT NULL;
  END IF;
END $$;
ALTER TABLE "MockedKYC" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
