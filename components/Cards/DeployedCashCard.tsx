"use client";
import CardDataStats from "~/components/Cards/CardDataStats";
import { useCachedFinancialData } from "~/hooks/useCachedFinancialData";
import { formatFinancialData } from '~/utils/inrFormatter';
import CardSkeleton from './CardSkeleton';

interface DeployedCashCardProps {
    ifinId: string;
}

function DeployedCashCard({ ifinId }: DeployedCashCardProps) {
    const { financialData, isLoading } = useCachedFinancialData(ifinId, 'deployedCash');

    if (isLoading) {
        return <CardSkeleton />;
    }

    const formattedDeployedCash = formatFinancialData(financialData);

    return (
        <CardDataStats
            title="Deployed Cash"
            total={formattedDeployedCash}
            info="Shows the amount of invested cash, adjusted for realized profits/losses and withdrawals"
        />
    );
}

export default DeployedCashCard;