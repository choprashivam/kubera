"use client";
import CardDataStats from "~/components/Cards/CardDataStats";
import { useCachedFinancialData } from "~/hooks/useCachedFinancialData";
import { formatFinancialData } from '~/utils/inrFormatter';
import CardSkeleton from './CardSkeleton';

interface UnrealisedPnlCardProps {
    ifinId: string;
}

function UnrealisedPnlCard({ ifinId }: UnrealisedPnlCardProps) {
    const { financialData, isLoading } = useCachedFinancialData(ifinId, 'unrealisedPnl');

    if (isLoading) {
        return <CardSkeleton />;
    }

    const formattedUnrealisedPnlValue = formatFinancialData(financialData);

    return (
        <CardDataStats
            title="Unrealised PnL"
            total={formattedUnrealisedPnlValue}
            info="Indicates the profit or loss of your current holdings managed by iFinStrats"
        />
    );
}

export default UnrealisedPnlCard;