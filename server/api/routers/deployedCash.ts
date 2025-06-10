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

// Create the deployedCashRouter with a single protected procedure 'getDeployedCash'
export const deployedCashRouter = createTRPCRouter({
    /**
     * Returns deployed cash for a given client ifinId
     */
    getDeployedCash: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { ifinId } = input;

            try {
                const [investedCash, withdrawnCash, realisedPnl] = await Promise.all([
                    ctx.db.investedCash.findFirst({
                        where: { ifinId, toDate: MAX_DATE },
                        select: {
                            crm: { select: { clientName: true, brokerId: true } },
                            amount: true,
                        },
                    }),
                    ctx.db.withdrawnCash.findFirst({
                        where: { ifinId },
                        select: { amount: true },
                    }),
                    ctx.db.realisedPnl.aggregate({
                        _sum: { pnl: true },
                        where: { ifinId },
                    }),
                ]);

                if (!investedCash) {
                    return {
                        client: null,
                        brokerId: null,
                        deployedCash: null,
                    };
                }

                return {
                    client: investedCash.crm.clientName,
                    brokerId: investedCash.crm.brokerId,
                    deployedCash: (investedCash.amount).plus(realisedPnl._sum.pnl ?? 0).minus(withdrawnCash?.amount ?? 0).toNumber(),
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch deployed cash data. Please try again later.",
                    cause: error,
                });
            }
        }),
});