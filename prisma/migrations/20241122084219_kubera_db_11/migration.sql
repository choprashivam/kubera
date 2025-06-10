/*
  Warnings:

  - Added the required column `sourceOfFunds` to the `HoldingsTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FundSource" AS ENUM ('INSIDE_ACCOUNT', 'OUTSIDE_ACCOUNT');

-- AlterTable
ALTER TABLE "HoldingsTransactions" ADD COLUMN     "sourceOfFunds" "FundSource" NOT NULL;
