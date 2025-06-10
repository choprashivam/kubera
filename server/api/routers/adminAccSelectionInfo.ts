import { TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure
} from "../trpc";

// Create adminAccSelectionInfoRouter with a single protected procedure 'getClientsInfo'
export const adminAccSelectionInfoRouter = createTRPCRouter({
    //Returns an array of brokerId and ifinId
    getClientsInfo: protectedProcedure
        .query(async ({ ctx }) => {
            try {
                const clientsInfo = await ctx.db.cRM.findMany({
                    select: { clientName: true, brokerId: true, ifinId: true },
                });

                return { clientsInfo };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch clients info. Please try again later.",
                    cause: error,
                });
            }
        }),
});