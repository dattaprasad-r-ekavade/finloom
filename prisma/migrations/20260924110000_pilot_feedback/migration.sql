CREATE TABLE "PilotFeedback" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "challengeId" TEXT,
  "rating" INTEGER NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PilotFeedback_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PilotFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PilotFeedback_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);
CREATE INDEX "PilotFeedback_createdAt_idx" ON "PilotFeedback"("createdAt");
CREATE INDEX "PilotFeedback_userId_idx" ON "PilotFeedback"("userId");
