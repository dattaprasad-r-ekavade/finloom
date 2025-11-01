-- Step 2: Alter table structure (must be in separate migration after enum values are committed)

-- AlterTable
ALTER TABLE "MockedKYC" ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;
ALTER TABLE "MockedKYC" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3);
ALTER TABLE "MockedKYC" ADD COLUMN IF NOT EXISTS "rejectedBy" TEXT;

-- Change defaults and nullability only if column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'MockedKYC' AND column_name = 'approvedAt') THEN
        ALTER TABLE "MockedKYC" ALTER COLUMN "approvedAt" DROP NOT NULL;
        ALTER TABLE "MockedKYC" ALTER COLUMN "approvedAt" DROP DEFAULT;
    END IF;
END $$;

-- Update status default to PENDING
ALTER TABLE "MockedKYC" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE IF NOT EXISTS "AdminSettings" (
    "id" TEXT NOT NULL,
    "autoApproveKyc" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);
