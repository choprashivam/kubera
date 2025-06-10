/*
  Warnings:

  - Added the required column `ledgerEntryType` to the `Ledger` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('INVESTMENT', 'CHARGES');

-- AlterTable
ALTER TABLE "Ledger" ADD COLUMN     "ledgerEntryType" "LedgerEntryType" NOT NULL;
