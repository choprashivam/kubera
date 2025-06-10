-- CreateTable
CREATE TABLE "CurrentLedgerBalance" (
    "currentLedgerBalanceId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "CurrentLedgerBalance_pkey" PRIMARY KEY ("currentLedgerBalanceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentLedgerBalance_ifinId_key" ON "CurrentLedgerBalance"("ifinId");

-- AddForeignKey
ALTER TABLE "CurrentLedgerBalance" ADD CONSTRAINT "CurrentLedgerBalance_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;
