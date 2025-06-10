import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MAX_DATE } from "~/constants";

// Define Zod schema for input validation
const ParamsSchema = z.object({
    ifinId: z.string(),
});

// Create portfolioValueRouter with a single protected procedure 'getPortfolioValue'
export const portfolioValueRouter = createTRPCRouter({
    /**
     * Returns NPV for given client ifinId
     */
    getPortfolioValue: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { ifinId } = input;

            try {
                const [investedCash, withdrawnCash, marketValueOfCustomerOwned, buyValueOfiFinOwned, unrealisedPnl, realisedPnlSum, totalLedgerCharges] = await Promise.all([
                    ctx.db.investedCash.findFirst({
                        where: { ifinId, toDate: MAX_DATE },
                        select: { amount: true },
                    }),
                    ctx.db.withdrawnCash.findFirst({
                        where: { ifinId },
                        select: { amount: true },
                    }),
                    ctx.db.holdingsTransactions.aggregate({
                        _sum: { marketValue: true },
                        where: {
                            ifinId,
                            ownedBy: "CUSTOMER",
                            sourceOfFunds: "OUTSIDE_ACCOUNT"
                        },
                    }),
                    ctx.db.holdingsTransactions.aggregate({
                        _sum: { buyValue: true },
                        where: {
                            ifinId,
                            ownedBy: "IFIN",
                            sourceOfFunds: "OUTSIDE_ACCOUNT",
                        },
                    }),
                    ctx.db.holdingsTransactions.aggregate({
                        _sum: { unrealisedPnl: true },
                        where: {
                            ifinId,
                            openQuantity: { not: 0 },
                            ownedBy: "IFIN",
                        },
                    }),
                    ctx.db.realisedPnl.aggregate({
                        _sum: { pnl: true },
                        where: { ifinId: ifinId },
                    }),
                    ctx.db.ledger.aggregate({
                        _sum: { amount: true },
                        where: { ifinId, ledgerEntryType: "CHARGES" },
                    }),
                ]);

                const currentInvestedCash = (investedCash?.amount.toNumber() ?? 0) - (withdrawnCash?.amount.toNumber() ?? 0);
                const investedAssets = (marketValueOfCustomerOwned._sum.marketValue?.toNumber() ?? 0) + (buyValueOfiFinOwned._sum.buyValue?.toNumber() ?? 0);
                const totalPnl = (realisedPnlSum._sum.pnl?.toNumber() ?? 0) + (totalLedgerCharges._sum.amount?.toNumber() ?? 0) + (unrealisedPnl._sum.unrealisedPnl?.toNumber() ?? 0);

                return { portfolioValue: currentInvestedCash + investedAssets + totalPnl };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch portfolio value data. Please try again later.",
                    cause: error,
                });
            }
        }),
});