ALTER TABLE "UserChallenge" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserChallenge" ADD COLUMN "demoGrantedBy" TEXT;
