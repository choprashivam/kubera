import { TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    publicProcedure,
} from "~/server/api/trpc";
import { unrealisedPnlUpdateFactory } from "~/services/unrealisedPnlUpdateService";

export const unrealisedPnlUpdateRouter = createTRPCRouter({
    updatePnl: publicProcedure
        .mutation(async ({ ctx }) => {

            try {
                const unrealisedPnlUpdateServices = unrealisedPnlUpdateFactory(ctx);
                const result = await unrealisedPnlUpdateServices.processUnrealisedPnlUpdate();

                return result;
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update unrealised pnl",
                    cause: error,
                });
            }
        }),
});