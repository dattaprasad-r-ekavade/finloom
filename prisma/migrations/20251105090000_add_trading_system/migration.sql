-- Create new enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TradeType') THEN
        CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TradeStatus') THEN
        CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED');
    END IF;
END $$;

-- Create Trade table
CREATE TABLE IF NOT EXISTS "Trade" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "scrip" TEXT NOT NULL,
    "scripFullName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "tradeType" "TradeType" NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "pnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" TIMESTAMP(3),
    "autoSquaredOff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Trade_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "UserChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Trade_challengeId_idx" ON "Trade"("challengeId");
CREATE INDEX IF NOT EXISTS "Trade_status_idx" ON "Trade"("status");
CREATE INDEX IF NOT EXISTS "Trade_challengeId_status_idx" ON "Trade"("challengeId", "status");
CREATE INDEX IF NOT EXISTS "Trade_entryTime_idx" ON "Trade"("entryTime");

-- Create MockedMarketData table
CREATE TABLE IF NOT EXISTS "MockedMarketData" (
    "id" TEXT NOT NULL,
    "scrip" TEXT NOT NULL,
    "scripFullName" TEXT NOT NULL,
    "ltp" DOUBLE PRECISION NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exchange" TEXT NOT NULL,
    "instrumentType" TEXT NOT NULL,

    CONSTRAINT "MockedMarketData_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MockedMarketData_scrip_key" UNIQUE ("scrip")
);

CREATE INDEX IF NOT EXISTS "MockedMarketData_scrip_idx" ON "MockedMarketData"("scrip");
CREATE INDEX IF NOT EXISTS "MockedMarketData_exchange_idx" ON "MockedMarketData"("exchange");

-- Create DailyTradeSummary table
CREATE TABLE IF NOT EXISTS "DailyTradeSummary" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "openTrades" INTEGER NOT NULL DEFAULT 0,
    "closedTrades" INTEGER NOT NULL DEFAULT 0,
    "realizedPnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unrealizedPnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "capitalUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "capitalAvailable" DOUBLE PRECISION NOT NULL,
    "dayPnlPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTradeSummary_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DailyTradeSummary_challengeId_date_key" UNIQUE ("challengeId", "date"),
    CONSTRAINT "DailyTradeSummary_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "UserChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "DailyTradeSummary_challengeId_idx" ON "DailyTradeSummary"("challengeId");
CREATE INDEX IF NOT EXISTS "DailyTradeSummary_date_idx" ON "DailyTradeSummary"("date");
