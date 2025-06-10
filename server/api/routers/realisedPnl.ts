import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Define Zod schema for input validation
const ParamsSchema = z.object({
    fromDate: z.string().datetime(),
    toDate: z.string().datetime(),
    ifinId: z.string(),
}).refine(
    (data) => new Date(data.fromDate) <= new Date(data.toDate),
    {
        message: "fromDate must be less than or equal to toDate",
        path: ["fromDate"],
    }
);

// Create the realisedPnlRouter with a single protected procedure 'getPnl'
export const realisedPnlRouter = createTRPCRouter({
    /**
     * Takes IFIN ID and date range and returns the pnl per day. This exludes the holidays and weekends
     */
    getPnl: protectedProcedure
        .input(ParamsSchema) // Validate input parameters using Zod schema
        .query(async ({ ctx, input }) => {
            const { fromDate, toDate, ifinId } = input;

            try {
                // Fetch realised PnL data from the database
                const allRealisedPnl = await ctx.db.realisedPnl.groupBy({
                    by: ['fromDate'],
                    where: {
                        fromDate: { gte: fromDate, lte: toDate },
                        ifinId,
                        pnlContributedBy: "IFIN",
                    },
                    _sum: { pnl: true },
                    orderBy: { fromDate: 'asc' },
                });

                // Transform the fetched data
                return allRealisedPnl.map((item) => ({
                    date: item.fromDate.toISOString(),
                    pnl: item._sum.pnl?.toNumber() ?? null,
                }));
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch realised PnL data. Please try again.",
                    cause: error,
                });
            }
        }),

    /**
     * Takes IFIN ID and date range and returns total pnl and pnl percentage
     */
    getTotalRealisedPnl: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { fromDate, toDate, ifinId } = input;

            try {
                const [realisedPnlSum, totalLedgerCharges] = await Promise.all([
                    ctx.db.realisedPnl.aggregate({
                        _sum: { pnl: true },
                        where: {
                            fromDate: { gte: fromDate, lte: toDate },
                            ifinId,
                            pnlContributedBy: "IFIN"
                        },
                    }),
                    ctx.db.ledger.aggregate({
                        _sum: { amount: true },
                        where: { ifinId, ledgerEntryType: "CHARGES" },
                    }),
                ]);

                return { totalRealisedPnl: (realisedPnlSum._sum.pnl?.toNumber() ?? 0) + (totalLedgerCharges._sum.amount?.toNumber() ?? 0) };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch total realised PnL. Please try again later.",
                    cause: error,
                });
            }
        }),
});