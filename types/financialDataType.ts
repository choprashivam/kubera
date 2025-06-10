//Using this types in useCachedFinancialData hook

interface RealisedPnlData {
    totalRealisedPnl: number | null;
}

interface UnrealisedPnlData {
    unrealisedPnl: number | null;
}

interface InvestedCashData {
    investedCash: number | null;
}

interface DeployedCashData {
    deployedCash: number | null;
}

interface InvestedAssetsData {
    investedAssets: number | null;
}

interface PortfolioValueData {
    portfolioValue: number;
}

interface TotalPnlData {
    totalPnl: number;
    totalPnlPerc: number;
}

interface WithdrawnCashData {
    withdrawnCash: number | null;
}

interface TodayAlgoPnl {
    todayAlgoPnl: number | null;
}

export type FinancialData = RealisedPnlData | UnrealisedPnlData | InvestedCashData | DeployedCashData | InvestedAssetsData | PortfolioValueData | TotalPnlData | WithdrawnCashData | TodayAlgoPnl;

export interface CachedData {
    data: FinancialData;
    lastUpdated: string;
}

export type DataType = 'realisedPnl' | 'unrealisedPnl' | 'investedCash' | 'deployedCash' | 'investedAssets' | 'portfolioValue' | 'totalPnl' | 'withdrawnCash' | 'todayAlgoPnl';