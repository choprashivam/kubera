import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Define Zod schema for input validation
const ParamsSchema = z.object({
    ifinId: z.string(),
});

// Create investedAssetsRouter with a single protected procedure 'getInvestedAssets'
export const investedAssetsRouter = createTRPCRouter({
    /**
     * Returns Invested Assets for a given client ifinId
     */
    getInvestedAssets: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { ifinId } = input;

            try {
                const [marketValueOfCustomerOwned, buyValueOfiFinOwned] = await Promise.all([
                    ctx.db.holdingsTransactions.aggregate({
                        _sum: { marketValue: true },
                        where: {
                            ifinId,
                            ownedBy: "CUSTOMER",
                            sourceOfFunds: "OUTSIDE_ACCOUNT",
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
                ]);

                return { investedAssets: (marketValueOfCustomerOwned._sum.marketValue?.toNumber() ?? 0) + (buyValueOfiFinOwned._sum.buyValue?.toNumber() ?? 0) };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch invested assets data",
                    cause: error,
                });
            }
        }),
});