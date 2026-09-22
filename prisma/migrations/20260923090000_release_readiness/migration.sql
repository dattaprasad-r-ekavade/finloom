-- Bring older deployed databases in line with the fields already used by the app.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpiry" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "User_passwordResetToken_key" ON "User"("passwordResetToken");
CREATE INDEX IF NOT EXISTS "User_passwordResetToken_idx" ON "User"("passwordResetToken");

ALTER TABLE "MockedKYC" ADD COLUMN IF NOT EXISTS "panNumber" TEXT;
ALTER TABLE "MockedKYC" ADD COLUMN IF NOT EXISTS "dateOfBirth" TEXT;

ALTER TABLE "Trade" ADD COLUMN IF NOT EXISTS "exchange" TEXT NOT NULL DEFAULT 'NSE';

ALTER TABLE "MockedPayment" ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT;
ALTER TABLE "MockedPayment" ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT;
ALTER TABLE "MockedPayment" ADD COLUMN IF NOT EXISTS "razorpaySignature" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "MockedPayment_razorpayOrderId_key" ON "MockedPayment"("razorpayOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "MockedPayment_razorpayPaymentId_key" ON "MockedPayment"("razorpayPaymentId");
CREATE INDEX IF NOT EXISTS "MockedPayment_razorpayOrderId_idx" ON "MockedPayment"("razorpayOrderId");

DO $$ BEGIN
  CREATE TYPE "ChallengeOrderStatus" AS ENUM ('PENDING', 'PAID');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ChallengeOrder" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  "razorpayOrderId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "ChallengeOrderStatus" NOT NULL DEFAULT 'PENDING',
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChallengeOrder_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChallengeOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ChallengeOrder_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "UserChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ChallengeOrder_razorpayOrderId_key" ON "ChallengeOrder"("razorpayOrderId");
CREATE INDEX IF NOT EXISTS "ChallengeOrder_userId_status_idx" ON "ChallengeOrder"("userId", "status");
CREATE INDEX IF NOT EXISTS "ChallengeOrder_challengeId_status_idx" ON "ChallengeOrder"("challengeId", "status");
