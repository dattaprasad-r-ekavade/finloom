-- CreateTable
CREATE TABLE "AngelOneCredentials" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "apiKey" TEXT NOT NULL,
    "clientCode" TEXT NOT NULL,
    "mpin" TEXT NOT NULL,
    "totpSecret" TEXT NOT NULL,
    "jwtToken" TEXT,
    "refreshToken" TEXT,
    "feedToken" TEXT,
    "tokenGeneratedAt" TIMESTAMP,
    "tokenExpiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "AngelOneCredentials_check" CHECK (id = 'singleton')
);
