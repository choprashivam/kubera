import { TRPCError } from "@trpc/server";
import type { createTRPCContext } from "~/server/api/trpc";

// Define the Context type based on your createTRPCContext function
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Service factory
const createUnrealiedPnlUpdateFactory = (ctx: Context) => {
    // Service 1: Fetches holdings transactions table and scrips table where open quantity is not 0 and owned by IFIN
    const getHoldingsTransactions = async () => {

        try {
            const holdingsTransactions = await ctx.db.holdingsTransactions.findMany({
                where: { openQuantity: { not: 0 } },
                include: { scrips: true },
            });

            // Transform Decimal to number
            const transformedTransactions = holdingsTransactions.map(transaction => ({
                ...transaction,
                buyQuantity: transaction.buyQuantity.toNumber(),
                buyPrice: transaction.buyPrice.toNumber(),
                sellQuantity: transaction.sellQuantity.toNumber(),
                sellPrice: transaction.sellPrice.toNumber(),
                openQuantity: transaction.openQuantity.toNumber(),
                unrealisedPnl: transaction.unrealisedPnl.toNumber(),
                scrips: {
                    ...transaction.scrips,
                    cmp: transaction.scrips.cmp.toNumber(),
                },
            }));

            return { holdingsTransactions: transformedTransactions };
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch holdings transactions and scrips",
                cause: error,
            });
        }
    };

    // Service 2: Updated unrealised pnl in holdings transactions table using cmp in scrips table
    const postUnrealisedPnl = async (input: {
        holdingsTransactions: {
            holdingsTransactionsId: string;
            ifinId: string;
            scripsId: string;
            buyQuantity: number;
            buyPrice: number;
            buyDate: Date | null;
            sellQuantity: number;
            sellPrice: number;
            sellDate: Date | null;
            openQuantity: number;
            unrealisedPnl: number;
            ownedBy: "IFIN" | "CUSTOMER";
            sourceOfFunds: "INSIDE_ACCOUNT" | "OUTSIDE_ACCOUNT";
            fromDate: Date;
            toDate: Date;
            scrips: {
                scripsId: string;
                name: string;
                scripcode: string;
                exchange: "N" | "B" | "M";
                exchangeType: "C" | "D" | "U";
                cmp: number;
                service: "IIFL" | "MFAPI";
            };
        }[];
    }) => {
        const { holdingsTransactions } = input;

        try {
            for (const ht of holdingsTransactions) {
                const { holdingsTransactionsId, openQuantity, buyPrice, scrips } = ht;
                const unrealisedPnl = (openQuantity * scrips.cmp) - (openQuantity * buyPrice);
                const marketValue = openQuantity * scrips.cmp;

                await ctx.db.$transaction(async (tx) => {
                    // Update unrealised pnl of holdings
                    await tx.holdingsTransactions.update({
                        where: { holdingsTransactionsId },
                        data: { unrealisedPnl },
                    });

                    // Update market value of holdings
                    await tx.holdingsTransactions.update({
                        where: { holdingsTransactionsId },
                        data: { marketValue },
                    });
                },
                    {
                        timeout: 300000,
                    }
                );
            }
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update unrealised pnl",
                cause: error,
            });
        }
    };

    // Process Unrealised Pnl update
    const processUnrealisedPnlUpdate = async () => {
        try {
            // Step 1: Fetches holdings transactions table and scrips table where open quantity is not 0 and owned by IFIN
            const { holdingsTransactions } = await getHoldingsTransactions();

            // Step 2: Updated unrealised pnl in holdings transactions table using cmp in scrips table
            await postUnrealisedPnl({ holdingsTransactions });

            return { success: true, message: "Unrealised Pnl and market value update processed successfully" }
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process scrips unrealised Pnl and market value update",
                cause: error,
            });
        }
    };

    return {
        getHoldingsTransactions,
        postUnrealisedPnl,
        processUnrealisedPnlUpdate,
    };
};

export const unrealisedPnlUpdateFactory = createUnrealiedPnlUpdateFactory;