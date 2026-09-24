ALTER TABLE "Trade" ADD COLUMN "clientOrderId" TEXT;
ALTER TABLE "Trade" ADD COLUMN "entryPriceAsOf" TIMESTAMP(3);
ALTER TABLE "Trade" ADD COLUMN "entryReason" TEXT;
ALTER TABLE "Trade" ADD COLUMN "reviewNote" TEXT;
ALTER TABLE "Trade" ADD COLUMN "exitPriceAsOf" TIMESTAMP(3);
CREATE UNIQUE INDEX "Trade_challengeId_clientOrderId_key" ON "Trade"("challengeId", "clientOrderId");
