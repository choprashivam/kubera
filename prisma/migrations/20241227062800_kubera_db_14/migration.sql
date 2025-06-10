/*
  Warnings:

  - Added the required column `pnlContributedBy` to the `RealisedPnl` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "pnlContributedBy" AS ENUM ('IFIN', 'CUSTOMER');

-- AlterTable
ALTER TABLE "RealisedPnl" ADD COLUMN     "pnlContributedBy" "pnlContributedBy" NOT NULL;
