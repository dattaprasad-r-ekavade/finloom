-- CreateIndex
CREATE INDEX "ChallengeMetrics_challengeId_idx" ON "ChallengeMetrics"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengeMetrics_challengeId_date_idx" ON "ChallengeMetrics"("challengeId", "date");

-- CreateIndex
CREATE INDEX "ChallengePlan_isActive_idx" ON "ChallengePlan"("isActive");

-- CreateIndex
CREATE INDEX "ChallengePlan_level_idx" ON "ChallengePlan"("level");

-- CreateIndex
CREATE INDEX "MockedPayment_userId_idx" ON "MockedPayment"("userId");

-- CreateIndex
CREATE INDEX "MockedPayment_challengeId_idx" ON "MockedPayment"("challengeId");

-- CreateIndex
CREATE INDEX "UserChallenge_userId_idx" ON "UserChallenge"("userId");

-- CreateIndex
CREATE INDEX "UserChallenge_status_idx" ON "UserChallenge"("status");

-- CreateIndex
CREATE INDEX "UserChallenge_userId_status_idx" ON "UserChallenge"("userId", "status");
