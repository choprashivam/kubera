import { TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    publicProcedure,
} from "~/server/api/trpc";
import { scripsCmpUpdateFactory } from "~/services/scripsCmpUpdateService";

export const scripsCmpUpdateRouter = createTRPCRouter({
    updateCmp: publicProcedure
        .mutation(async ({ ctx }) => {

            try {
                const scripsCmpUpdateServices = scripsCmpUpdateFactory(ctx);
                const result = await scripsCmpUpdateServices.processScripsCmpUpdate();

                return result;
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update scrips cmp",
                    cause: error,
                });
            }
        }),
});