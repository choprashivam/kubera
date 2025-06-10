import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MAX_DATE } from "../../../constants";

// Define Zod schema for input validation
const ParamsSchema = z.object({
    ifinId: z.string(),
});

// Create the investedCashRouter with a single protected procedure 'getInvestedCash'
export const investedCashRouter = createTRPCRouter({
    /** 
     * Returns invested cash for a given client ifinId
     */
    getInvestedCash: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { ifinId } = input;

            try {
                const investedCash = await ctx.db.investedCash.findFirst({
                    where: { ifinId: ifinId, toDate: MAX_DATE },
                    select: {
                        crm: { select: { clientName: true, brokerId: true } },
                        amount: true,
                    },
                });

                return {
                    client: investedCash?.crm.clientName ?? null,
                    brokerId: investedCash?.crm.brokerId ?? null,
                    investedCash: investedCash?.amount.toNumber() ?? null,
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch invested cash data. Please try again later.",
                    cause: error,
                });
            }
        }),
});