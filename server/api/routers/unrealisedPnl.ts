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

// Create unrealisedPnlRouter with a single protected procedure 'getUnrealisedPnl'
export const unrealisedPnlRouter = createTRPCRouter({
    /**
     * Returns unrealised pnl and unrealised pnl percentage for a given client ifinId
     */
    getUnrealisedPnl: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { ifinId } = input;

            try {
                const unrealisedPnl = await ctx.db.holdingsTransactions.aggregate({
                    _sum: { unrealisedPnl: true },
                    where: {
                        ifinId,
                        openQuantity: { not: 0 },
                        ownedBy: "IFIN",
                    },
                });

                return { unrealisedPnl: unrealisedPnl._sum.unrealisedPnl?.toNumber() ?? null };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch unrealised pnl data.",
                    cause: error,
                });
            }
        }),
});