"use client";
import CardDataStats from "~/components/Cards/CardDataStats";
import { useCachedFinancialData } from "~/hooks/useCachedFinancialData";
import { formatFinancialData } from '~/utils/inrFormatter';
import CardSkeleton from './CardSkeleton';
import { FROMDATE } from "~/constants";

interface RealisedPnlCardProps {
    ifinId: string;
}

function RealisedPnlCard({ ifinId }: RealisedPnlCardProps) {
    const fromDate = FROMDATE;
    const toDate = new Date().toISOString().split('T')[0] + 'T00:00:00Z';

    const { financialData, isLoading } = useCachedFinancialData(ifinId, 'realisedPnl', fromDate, toDate);

    if (isLoading) {
        return <CardSkeleton />;
    }

    const fomrattedRealisedPnlValue = formatFinancialData(financialData);

    return (
        <CardDataStats
            title="Realised PnL"
            total={fomrattedRealisedPnlValue}
            info="Represents the total profit or loss that has been realized to date"
        />
    );
}

export default RealisedPnlCard;