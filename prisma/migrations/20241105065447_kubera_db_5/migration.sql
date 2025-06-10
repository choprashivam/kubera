/*
  Warnings:

  - Added the required column `scripType` to the `Scrips` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ScripsType" AS ENUM ('STOCK', 'ETF', 'MF');

-- AlterTable
ALTER TABLE "Scrips" ADD COLUMN     "fetchUrl" STRING;
ALTER TABLE "Scrips" ADD COLUMN     "scripType" "ScripsType" NOT NULL;
