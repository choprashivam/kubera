import type { FinancialData } from "~/types/financialDataType";

function formatINR(value: number): string {
    const absValue = Math.abs(value);
    const isNegative = value < 0;

    let formattedValue: string;

    if (absValue >= 10000000) { // 1 crore
        formattedValue = `${(absValue / 10000000).toFixed(2)}Cr`;
    } else if (absValue >= 100000) { // 1 lakh
        formattedValue = `${(absValue / 100000).toFixed(2)}L`;
    } else if (absValue >= 1000) { // 1 thousand
        formattedValue = `${(absValue / 1000).toFixed(2)}K`;
    } else {
        formattedValue = absValue.toFixed(2);
    }

    return isNegative ? `₹ (${formattedValue})` : `₹ ${formattedValue}`;
};

function formatRate(value: number): string {
    const percentageValue = value * 100;
    return `${percentageValue.toFixed(2)}%`;
}

export function formatFinancialData(data: FinancialData): string {
    if ('investedCash' in data && data.investedCash !== null) {
        return formatINR(data.investedCash);
    } else if ('deployedCash' in data && data.deployedCash !== null) {
        return formatINR(data.deployedCash);
    } else if ('investedAssets' in data && data.investedAssets !== null) {
        return formatINR(data.investedAssets);
    } else if ('portfolioValue' in data && data.portfolioValue !== null) {
        return formatINR(data.portfolioValue);
    } else if ('totalRealisedPnl' in data && data.totalRealisedPnl !== null) {
        return formatINR(data.totalRealisedPnl);
    } else if ('unrealisedPnl' in data && data.unrealisedPnl !== null) {
        return formatINR(data.unrealisedPnl);
    } else if ('withdrawnCash' in data && data.withdrawnCash !== null) {
        return formatINR(data.withdrawnCash);
    } else if ('todayAlgoPnl' in data && data.todayAlgoPnl !== null) {
        return formatINR(data.todayAlgoPnl);
    }
    return '₹ 0.00';
};

interface FormattedFinancialResult {
    formattedValue: string;
    formattedRate: string;
    levelUp: boolean;
    levelDown: boolean;
}

export function formatFinancialDataWithRate(data: FinancialData): FormattedFinancialResult {
    if ('totalPnl' in data && data.totalPnl !== null && 'totalPnlPerc' in data && data.totalPnlPerc !== null) {
        return {
            formattedValue: formatINR(data.totalPnl),
            formattedRate: formatRate(data.totalPnlPerc),
            levelUp: data.totalPnlPerc >= 0,
            levelDown: data.totalPnlPerc < 0
        };
    }
    return {
        formattedValue: '₹ 0.00',
        formattedRate: '₹ 0.00',
        levelUp: false,
        levelDown: false,
    }
};