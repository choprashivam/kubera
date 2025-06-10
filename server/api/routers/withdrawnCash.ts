import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define Zod schema for input validation
const ParamsSchema = z.object({
    ifinId: z.string(),
});

// Create withdrawnCashRouter with a single protected procedure 'getWithdrawnCash'
export const withdrawnCashRouter = createTRPCRouter({
    /**
     * Returns withdrawn cash for a given client ifinId
     */
    getWithdrawnCash: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { ifinId } = input;

            try {
                const withdrawnCash = await ctx.db.withdrawnCash.findFirst({
                    where: { ifinId },
                });

                return { withdrawnCash: withdrawnCash?.amount.toNumber() ?? null };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch withdrawn cash data.",
                    cause: error,
                });
            }
        }),
});