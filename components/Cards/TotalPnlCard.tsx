"use client";
import { useCachedFinancialData } from "~/hooks/useCachedFinancialData";
import CardSkeleton from "./CardSkeleton";
import { formatFinancialDataWithRate } from "~/utils/inrFormatter";
import CardDataStats from "./CardDataStats";

interface TotalPnlCardProps {
    ifinId: string;
}

function TotalPnlCard({ ifinId }: TotalPnlCardProps) {
    const { financialData, isLoading } = useCachedFinancialData(ifinId, 'totalPnl');

    if (isLoading) {
        return <CardSkeleton />;
    }

    const { formattedValue, formattedRate, levelUp, levelDown } = formatFinancialDataWithRate(financialData);

    return (
        <CardDataStats
            title="Total PnL"
            total={formattedValue}
            rate={formattedRate}
            levelUp={levelUp}
            levelDown={levelDown}
            info="Displays the sum of realized PnL and unrealized PnL, with the total PnL percentage calculated using the XIRR method"
        />
    );
}

export default TotalPnlCard;