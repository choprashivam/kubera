import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define Zod schema for input validation
const ParamsSchema = z.object({
    ifinId: z.string(),
});

// Create todayAlgoPnlRouter with a single protected procedure 'getTodayAlgoPnl'
export const todayAlgoPnlRouter = createTRPCRouter({
    /**
     * Returns today algo pnl for a given client ifinId
     */
    getTodayAlgoPnl: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { ifinId } = input;

            try {
                const todayAlgoPnl = await ctx.db.todayAlgoPnl.findFirst({
                    where: { ifinId },
                });

                return { todayAlgoPnl: todayAlgoPnl?.amount.toNumber() ?? null };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch today algo pnl data.",
                    cause: error,
                });
            }
        }),
});