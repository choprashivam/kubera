"use client";
import { useCachedFinancialData } from "~/hooks/useCachedFinancialData";
import CardSkeleton from "./CardSkeleton";
import { formatFinancialData } from "~/utils/inrFormatter";
import CardDataStats from "./CardDataStats";

interface WithdrawnCashCardProps {
    ifinId: string;
}

function WithdrawnCashCard({ ifinId }: WithdrawnCashCardProps) {
    const { financialData, isLoading } = useCachedFinancialData(ifinId, 'withdrawnCash');

    if (isLoading) {
        return <CardSkeleton />;
    }

    const formattedWithdrawnCash = formatFinancialData(financialData);

    return (
        <CardDataStats
            title="Withdrawn Cash"
            total={formattedWithdrawnCash}
            info="Reflects the amount withdrawn by you"
        />
    );
}

export default WithdrawnCashCard;