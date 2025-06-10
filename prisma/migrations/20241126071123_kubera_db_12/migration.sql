-- CreateTable
CREATE TABLE "TodayAlgoPnl" (
    "todayAlgoPnlId" STRING NOT NULL,
    "ifinId" STRING NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "TodayAlgoPnl_pkey" PRIMARY KEY ("todayAlgoPnlId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TodayAlgoPnl_ifinId_key" ON "TodayAlgoPnl"("ifinId");

-- AddForeignKey
ALTER TABLE "TodayAlgoPnl" ADD CONSTRAINT "TodayAlgoPnl_ifinId_fkey" FOREIGN KEY ("ifinId") REFERENCES "CRM"("ifinId") ON DELETE RESTRICT ON UPDATE CASCADE;
