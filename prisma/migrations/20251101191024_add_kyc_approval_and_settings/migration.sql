-- Step 1: Add new enum values (these need to be committed before use)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MockedKycStatus')) THEN
        ALTER TYPE "MockedKycStatus" ADD VALUE 'PENDING' BEFORE 'AUTO_APPROVED';
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'APPROVED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MockedKycStatus')) THEN
        ALTER TYPE "MockedKycStatus" ADD VALUE 'APPROVED' AFTER 'PENDING';
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REJECTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MockedKycStatus')) THEN
        ALTER TYPE "MockedKycStatus" ADD VALUE 'REJECTED' AFTER 'APPROVED';
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
