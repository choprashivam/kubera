-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('FNO', 'CASH', 'MF');

-- CreateEnum
CREATE TYPE "ScripsExchange" AS ENUM ('N', 'B', 'M');

-- CreateEnum
CREATE TYPE "ScripsExchangeType" AS ENUM ('C', 'D', 'U');

-- CreateEnum
CREATE TYPE "OwnedBy" AS ENUM ('IFIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('FNO_INTRADAY', 'FNO_EQUITY', 'EQUITY', 'MCX', 'DIVIDEND', 'MF', 'FNO_EQUITY_ADJUSTMENT');

-- CreateTable
CREATE TABLE "Account" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "type" STRING NOT NULL,
    "provider" STRING NOT NULL,
    "providerAccountId" STRING NOT NULL,
    "refresh_token" STRING,
    "access_token" STRING,
    "expires_at" INT4,
    "token_type" STRING,
    "scope" STRING,
    "id_token" STRING,
    "session_state" STRING,
    "refresh_token_expires_in" INT4,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" STRING NOT NULL,
    "ifinId" STRING,
    "sessionToken" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "name" STRING,
    "email" STRING,
    "emailVerified" TIMESTAMP(3),
    "image" STRING,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" STRING NOT NULL,
    "token" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Application" (
    "applicationId" STRING NOT NULL,
    "name" STRING NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "CRM" (
    "ifinId" STRING NOT NULL,
    "clientName" STRING NOT NULL,
    "brokerId" STRING NOT NULL,
    "phoneNo" CHAR(10) NOT NULL,
    "email" STRING NOT NULL,
    "address" STRING NOT NULL,
    "accountOpenDate" DATE NOT NULL,
    "accountType" "AccountType"[] DEFAULT ARRAY[]::"AccountType"[],
    "accountStatus" "AccountStatus" NOT NULL,

    CONSTRAINT "CRM_pkey" PRIMARY KEY ("ifinId")
);

-- CreateTable
CREATE TABLE "ClientMargin" (
    "marginId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "margin" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ClientMargin_pkey" PRIMARY KEY ("marginId")
);

-- CreateTable
CREATE TABLE "Credentials" (
    "credentialsId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "applicationId" STRING NOT NULL,
    "userName" STRING NOT NULL,
    "userPassword" STRING NOT NULL,
    "pin" STRING,

    CONSTRAINT "Credentials_pkey" PRIMARY KEY ("credentialsId")
);

-- CreateTable
CREATE TABLE "Scrips" (
    "scripsId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "scripcode" STRING NOT NULL,
    "exchange" "ScripsExchange" NOT NULL,
    "exchangeType" "ScripsExchangeType" NOT NULL,
    "cmp" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "Scrips_pkey" PRIMARY KEY ("scripsId")
);

-- CreateTable
CREATE TABLE "HoldingsTransactions" (
    "holdingsTransactionsId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "scripsId" STRING NOT NULL,
    "buyQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "buyPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "buyValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "buyDate" DATE,
    "sellQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sellPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sellValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sellDate" DATE,
    "openQuantity" DECIMAL(14,2) NOT NULL,
    "unrealisedPnl" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ownedBy" "OwnedBy" NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,

    CONSTRAINT "HoldingsTransactions_pkey" PRIMARY KEY ("holdingsTransactionsId")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "ledgerId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("ledgerId")
);

-- CreateTable
CREATE TABLE "PnlAdjustment" (
    "pnlAdjustmentId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "adjustment" DECIMAL(14,2) NOT NULL,
    "comment" STRING NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,

    CONSTRAINT "PnlAdjustment_pkey" PRIMARY KEY ("pnlAdjustmentId")
);

-- CreateTable
CREATE TABLE "RealisedPnl" (
    "realisedPnlId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "pnl" DECIMAL(14,2) NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,

    CONSTRAINT "RealisedPnl_pkey" PRIMARY KEY ("realisedPnlId")
);

-- CreateTable
CREATE TABLE "InvestedCash" (
    "investedCashId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,

    CONSTRAINT "InvestedCash_pkey" PRIMARY KEY ("investedCashId")
);

-- CreateTable
CREATE TABLE "WithdrawnCash" (
    "withdrawnCashId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "WithdrawnCash_pkey" PRIMARY KEY ("withdrawnCashId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "CRM_brokerId_key" ON "CRM"("brokerId");

-- CreateIndex
CREATE INDEX "CRM_clientName_idx" ON "CRM"("clientName");

-- CreateIndex
CREATE UNIQUE INDEX "ClientMargin_ifinId_key" ON "ClientMargin"("ifinId");

-- CreateIndex
CREATE UNIQUE INDEX "Scrips_scripcode_key" ON "Scrips"("scripcode");

-- CreateIndex
CREATE INDEX "Scrips_name_idx" ON "Scrips"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawnCash_ifinId_key" ON "WithdrawnCash"("ifinId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRM" ADD CONSTRAINT "CRM_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMargin" ADD CONSTRAINT "ClientMargin_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credentials" ADD CONSTRAINT "Credentials_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("applicationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credentials" ADD CONSTRAINT "Credentials_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoldingsTransactions" ADD CONSTRAINT "HoldingsTransactions_scripsId_fkey" FOREIGN KEY ("scripsId") REFERENCES "Scrips"("scripsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoldingsTransactions" ADD CONSTRAINT "HoldingsTransactions_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PnlAdjustment" ADD CONSTRAINT "PnlAdjustment_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealisedPnl" ADD CONSTRAINT "RealisedPnl_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestedCash" ADD CONSTRAINT "InvestedCash_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawnCash" ADD CONSTRAINT "WithdrawnCash_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;
