/*
  Warnings:

  - You are about to drop the column `scripType` on the `Scrips` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[scripcode,service]` on the table `Scrips` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `service` to the `Scrips` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Service" AS ENUM ('IIFL', 'MFAPI');

-- AlterTable
ALTER TABLE "Scrips" DROP COLUMN "scripType";
ALTER TABLE "Scrips" ADD COLUMN     "service" "Service" NOT NULL;

-- DropEnum
DROP TYPE "ScripsType";

-- CreateIndex
CREATE UNIQUE INDEX "Scrips_scripcode_service_key" ON "Scrips"("scripcode", "service");
