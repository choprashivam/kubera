"use client";
import CardDataStats from "./CardDataStats";
import { useCachedFinancialData } from "~/hooks/useCachedFinancialData";
import { formatFinancialData } from "~/utils/inrFormatter";
import CardSkeleton from "./CardSkeleton";

interface PortfolioValueCardProps {
    ifinId: string;
}

function PortfolioValueCard({ ifinId }: PortfolioValueCardProps) {
    const { financialData, isLoading } = useCachedFinancialData(ifinId, 'portfolioValue');

    if (isLoading) {
        return <CardSkeleton />;
    }

    const formattedPortfolioValue = formatFinancialData(financialData);

    return (
        <CardDataStats
            title="Portfolio Value"
            total={formattedPortfolioValue}
            info="Shows the current value of the your entire portfolio, including current invested cash (invested cash - withdrawn cash), total PnL, and invested assets."
        />
    );
}

export default PortfolioValueCard;