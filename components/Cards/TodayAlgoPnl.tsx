"use client";
import { useCachedFinancialData } from "~/hooks/useCachedFinancialData";
import CardSkeleton from "./CardSkeleton";
import { formatFinancialData } from "~/utils/inrFormatter";
import CardDataStats from "./CardDataStats";

interface TodayAlgoPnlCardProps {
    ifinId: string;
}

function TodayAlgoPnlCard({ ifinId }: TodayAlgoPnlCardProps) {
    const { financialData, isLoading } = useCachedFinancialData(ifinId, 'todayAlgoPnl');

    if (isLoading) {
        return <CardSkeleton />;
    }

    const formattedTodayAlgoPnl = formatFinancialData(financialData);

    return (
        <CardDataStats
            title="Today's Algo PnL (Gross)"
            total={formattedTodayAlgoPnl}
            info="Reflects FNO Algo PnL for today (Gross)"
        />
    );
}

export default TodayAlgoPnlCard;