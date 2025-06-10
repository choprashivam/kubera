"use client";
import { useState, useEffect, useCallback } from 'react';
import { api } from '~/trpc/react';
import type { CachedData, DataType, FinancialData } from '~/types/financialDataType';

export function useCachedFinancialData(ifinId: string, dataType: DataType, fromDate?: string, toDate?: string) {
    const [financialData, setFinancialData] = useState<FinancialData>(() => {
        switch (dataType) {
            case 'realisedPnl':
                return { totalRealisedPnl: null };
            case 'unrealisedPnl':
                return { unrealisedPnl: null };
            case 'investedCash':
                return { investedCash: null };
            case 'deployedCash':
                return { deployedCash: null };
            case 'investedAssets':
                return { investedAssets: null };
            case 'portfolioValue':
                return { portfolioValue: 0 };
            case 'totalPnl':
                return { totalPnl: 0, totalPnlPerc: 0 };
            case 'withdrawnCash':
                return { withdrawnCash: 0 };
            case 'todayAlgoPnl':
                return { todayAlgoPnl: 0 };
        }
    });
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [shouldFetch, setShouldFetch] = useState(false);

    const realisedPnlQuery = api.realisedPnl.getTotalRealisedPnl.useQuery(
        { fromDate: fromDate!, toDate: toDate!, ifinId },
        { enabled: dataType === 'realisedPnl' && shouldFetch }
    );

    const unrealisedPnlQuery = api.unrealisedPnl.getUnrealisedPnl.useQuery(
        { ifinId },
        { enabled: dataType === 'unrealisedPnl' && shouldFetch }
    );

    const investedCashQuery = api.investedCash.getInvestedCash.useQuery(
        { ifinId },
        { enabled: dataType === 'investedCash' && shouldFetch }
    );

    const deployedCashQuery = api.deployedCash.getDeployedCash.useQuery(
        { ifinId },
        { enabled: dataType === 'deployedCash' && shouldFetch }
    );

    const investedAssetsQuery = api.investedAssets.getInvestedAssets.useQuery(
        { ifinId },
        { enabled: dataType === 'investedAssets' && shouldFetch }
    );

    const portfolioValueQuery = api.portfolioValue.getPortfolioValue.useQuery(
        { ifinId },
        { enabled: dataType === 'portfolioValue' && shouldFetch }
    );

    const totalPnlQuery = api.totalPnl.getTotalPnl.useQuery(
        { ifinId },
        { enabled: dataType === 'totalPnl' && shouldFetch }
    );

    const withdrawnCashQuery = api.withdrawnCash.getWithdrawnCash.useQuery(
        { ifinId },
        { enabled: dataType === 'withdrawnCash' && shouldFetch }
    );

    const todayAlgoPnlQuery = api.todayAlgoPnl.getTodayAlgoPnl.useQuery(
        { ifinId },
        { enabled: dataType === 'todayAlgoPnl' && shouldFetch }
    );

    const { data: freshData, isLoading, error: queryError } =
        dataType === 'realisedPnl' ? realisedPnlQuery :
            dataType === 'unrealisedPnl' ? unrealisedPnlQuery :
                dataType === 'investedCash' ? investedCashQuery :
                    dataType === 'deployedCash' ? deployedCashQuery :
                        dataType === 'investedAssets' ? investedAssetsQuery :
                            dataType === 'portfolioValue' ? portfolioValueQuery :
                                dataType === 'totalPnl' ? totalPnlQuery :
                                    dataType === 'withdrawnCash' ? withdrawnCashQuery :
                                        todayAlgoPnlQuery;

    const fetchData = useCallback(async () => {
        const cacheKey = `financialData_${dataType}_${ifinId}`;
        const cachedDataString = localStorage.getItem(cacheKey);
        let cachedData: CachedData | null = null;

        if (cachedDataString) {
            try {
                cachedData = JSON.parse(cachedDataString) as CachedData;
            } catch (error) {
                console.error("Error parsing cached data:", error);
            }
        }

        const now = new Date();
        const today9AMIST = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 3, 30, 0));

        const shouldRefetch = !cachedData || (now >= today9AMIST && new Date(cachedData.lastUpdated) < today9AMIST);

        if (shouldRefetch) {
            setShouldFetch(true);
        } else if (cachedData) {
            setFinancialData(cachedData.data);
            setLastUpdated(cachedData.lastUpdated);
        }
    }, [ifinId, dataType]);

    useEffect(() => {
        fetchData().catch(error => {
            console.error("Error fetching data:", error);
        });
    }, [fetchData]);

    useEffect(() => {
        if (freshData) {
            const now = new Date();
            const cacheKey = `financialData_${dataType}_${ifinId}`;
            let dataToCache: FinancialData;

            if (dataType === 'investedCash' && 'investedCash' in freshData) {
                dataToCache = { investedCash: freshData.investedCash };
            } else if (dataType === 'deployedCash' && 'deployedCash' in freshData) {
                dataToCache = { deployedCash: freshData.deployedCash };
            } else {
                dataToCache = freshData as FinancialData;
            }

            const newCachedData: CachedData = {
                data: dataToCache,
                lastUpdated: now.toISOString(),
            };
            localStorage.setItem(cacheKey, JSON.stringify(newCachedData));
            setFinancialData(dataToCache);
            setLastUpdated(now.toISOString());
            setShouldFetch(false);
        }
    }, [freshData, ifinId, dataType]);

    return { financialData, isLoading: isLoading || shouldFetch, error: queryError, lastUpdated };
};