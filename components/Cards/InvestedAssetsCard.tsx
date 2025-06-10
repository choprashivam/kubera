"use client";
import CardDataStats from "~/components/Cards/CardDataStats";
import { useCachedFinancialData } from "~/hooks/useCachedFinancialData";
import { formatFinancialData } from '~/utils/inrFormatter';
import CardSkeleton from './CardSkeleton';

interface InvestedAssetsCardProps {
    ifinId: string;
}

function InvestedAssetsCard({ ifinId }: InvestedAssetsCardProps) {
    const { financialData, isLoading } = useCachedFinancialData(ifinId, 'investedAssets');

    if (isLoading) {
        return <CardSkeleton />;
    }

    const formattedInvestedAssets = formatFinancialData(financialData);

    return (
        <CardDataStats
            title="Invested Assets"
            total={formattedInvestedAssets}
            info="Shows the total value of assets transferred to IIFL"
        />
    );
}

export default InvestedAssetsCard;