import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

//Define Zod schema for input validation
const ParamsSchema = z.object({
    email: z.string().email("Invalid email format"),
});

//Create the usernameRouter with a single protected procedure 'getUser'
export const userRouter = createTRPCRouter({
    /** 
     * Returns one or more user(s) for a given email id and empty if email id does not exist
     */
    getUser: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { email } = input;

            try {
                const users = await ctx.db.cRM.findMany({
                    where: { email },
                    select: {
                        clientName: true,
                        brokerId: true,
                        ifinId: true,
                    },
                });

                // Return the transformed data
                return users.map((item) => ({
                    client: item.clientName,
                    brokerId: item.brokerId,
                    ifinId: item.ifinId,
                }));
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch user data. Please try again later.",
                    cause: error,
                });
            }
        }),

    /**
     * Takes sessionId and ifinId as input and update ifinId in session model
     */
    postSessionIfinId: protectedProcedure
        .input(z.object({
            sessionToken: z.string(),
            ifinId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { sessionToken, ifinId } = input;

            try {
                await ctx.db.session.update({
                    where: { sessionToken: sessionToken },
                    data: { ifinId: ifinId },
                });
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update ifinId in session",
                    cause: error,
                });
            }
        }),
});