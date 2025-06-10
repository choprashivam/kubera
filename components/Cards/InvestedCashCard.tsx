"use client";
import CardDataStats from "~/components/Cards/CardDataStats";
import { useCachedFinancialData } from "~/hooks/useCachedFinancialData";
import { formatFinancialData } from '~/utils/inrFormatter';
import CardSkeleton from './CardSkeleton';

interface InvestedCashCardProps {
    ifinId: string;
}

function InvestedCashCard({ ifinId }: InvestedCashCardProps) {
    const { financialData, isLoading } = useCachedFinancialData(ifinId, 'investedCash');

    if (isLoading) {
        return <CardSkeleton />;
    }

    const formattedInvestedCash = formatFinancialData(financialData);

    return (
        <CardDataStats
            title="Invested Cash"
            total={formattedInvestedCash}
            info="Reflects the total cash amount invested by you"
        />
    );
}

export default InvestedCashCard;