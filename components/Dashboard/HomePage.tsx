"use client";
import { useState, useEffect, Suspense } from "react";
import CardDataStats from "~/components/Cards/CardDataStats";
import InvestedCashCard from "~/components/Cards/InvestedCashCard";
import InvestedAssetsCard from "~/components/Cards/InvestedAssetsCard";
import PortfolioValueCard from "~/components/Cards/PortfolioValueCard";
import { PnlCardsToggle } from "~/components/Cards/PnlCardsToggle";
import CardSkeleton from "~/components/Cards/CardSkeleton";
import { useClientSelection } from "~/components/Admin/ClientContext";
import type { Session } from "next-auth";
import WithdrawnCashCard from "../Cards/WithdrawnCashCard";
import TodayAlgoPnlCard from "../Cards/TodayAlgoPnl";

interface HomePageProps {
    initialSession: Session | null;
}

const HomePage: React.FC<HomePageProps> = ({ initialSession }) => {
    const [ifinId, setIfinId] = useState<string | undefined>(undefined);
    const { selectedClient } = useClientSelection();

    useEffect(() => {
        if (initialSession?.user.isAdmin) {
            if (selectedClient) {
                try {
                    setIfinId(selectedClient.value);
                } catch (error) {
                    console.error('Error parsing stored client:', error);
                }
            }
        } else {
            setIfinId(initialSession?.ifinId ?? undefined);
        }
    }, [initialSession, selectedClient]);

    // Handle null session case
    if (!initialSession) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <CardDataStats title="Portfolio Value" total="₹ 0.00" />
                <CardDataStats title="Invested Cash" total="₹ 0.00" />
                <CardDataStats title="Invested Assets" total="₹ 0.00" />
                <CardDataStats title="Total PnL" total="₹ 0.00" rate="0.00%" />
                <CardDataStats title="Withdrawn Cash" total="₹ 0.00" />
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <Suspense fallback={<CardSkeleton />}>
                    {ifinId ? <PortfolioValueCard ifinId={ifinId} /> : <CardDataStats title="Portfolio Value" total="₹ 0.00" />}
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    {ifinId ? <InvestedCashCard ifinId={ifinId} /> : <CardDataStats title="Invested Cash" total="₹ 0.00" />}
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    {ifinId ? <InvestedAssetsCard ifinId={ifinId} /> : <CardDataStats title="Invested Assets" total="₹ 0.00" />}
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    {ifinId ? <PnlCardsToggle ifinId={ifinId} /> : <CardDataStats title="Total PnL" total="₹ 0.00" rate="0.00%" />}
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    {ifinId ? <TodayAlgoPnlCard ifinId={ifinId} /> : <CardDataStats title="Today's Algo PnL (Gross)" total="₹ 0.00" rate="0.00%" />}
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    {ifinId ? <WithdrawnCashCard ifinId={ifinId} /> : <CardDataStats title="Withdrawn Cash" total="₹ 0.00" />}
                </Suspense>
                {/* <Suspense fallback={<CardSkeleton />}>
              {ifinId ? <DeployedCashCard ifinId={ifinId} /> : <CardDataStats title="Deployed Cash" total="₹ 0.00" rate="0.00%" />}
            </Suspense> */}
            </div>

            {/* <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
            <ChartOne />
            <ChartTwo />
          </div> */}
        </>
    );
}

export default HomePage;