import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { createTRPCContext } from "~/server/api/trpc";

// Define the Context type based on your createTRPCContext function
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Define Zod schema for input validation
const ParamsSchema = z.object({
    brokerId: z.array(z.string().min(1, "Broker ID is required")),
    amount: z.array(z.number()),
});

type CreateCurrentLedgerBalanceDataEntryInput = z.infer<typeof ParamsSchema>;

// Validate that all input arrays are of the same length
const validateInputLength = (input: CreateCurrentLedgerBalanceDataEntryInput): void => {
    const { brokerId, amount } = input;
    if (brokerId.length !== amount.length) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All input arrays must be of the same length",
        });
    }
};

// Service factory
const createCurrentLedgerBalanceDataEntryFactory = (ctx: Context) => {
    // Service 1: Get ID
    const getID = async (input: CreateCurrentLedgerBalanceDataEntryInput) => {
        validateInputLength(input);
        const { brokerId } = input;

        try {
            const ifinIds = await ctx.db.cRM.findMany({
                where: { brokerId: { in: brokerId } },
                select: { brokerId: true, ifinId: true },
            });

            // Check if all brokerIds are found
            const foundBrokerIds = new Set(ifinIds.map(item => item.brokerId));
            const missingBrokerIds = brokerId.filter(id => !foundBrokerIds.has(id));
            if (missingBrokerIds.length > 0) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `The following broker IDs were not found in the database: ${missingBrokerIds.join(', ')}`,
                });
            }

            return { ifinIds };
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch IDs for current ledger balance data entry",
                cause: error,
            });
        }
    };

    // Service 2: Upsert current ledger balance
    const postCurrentLedgerBalance = async (input: CreateCurrentLedgerBalanceDataEntryInput & {
        ifinIds: { brokerId: string; ifinId: string; }[];
    }) => {
        const { ifinIds, brokerId, amount } = input;

        try {
            // Create an array to store all upsert operations
            const upsertOperations = brokerId.map(async (currentBrokerId, index) => {
                // Find the corresponding ifinId for the current brokerId
                const matchingRecord = ifinIds.find(
                    record => record.brokerId === currentBrokerId
                );

                if (!matchingRecord) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `No matching ifinId found for brokerId: ${currentBrokerId}`,
                    });
                }

                if (!amount[index]) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Amount in service 2 of current ledger balance data entry is undefined",
                    });
                }

                // Create the upsert data
                await ctx.db.currentLedgerBalance.upsert({
                    where: { ifinId: matchingRecord.ifinId },
                    update: { amount: amount[index] },
                    create: { ifinId: matchingRecord.ifinId, amount: amount[index] },
                });
            });

            await Promise.all(upsertOperations);
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to post current ledger balance",
                cause: error,
            });
        }
    };

    // Process Cuurent ledger Balance Data
    const processCurrentLedgerBalanceData = async (data: Record<string | number | symbol, unknown[]>) => {
        try {
            const input = ParamsSchema.parse(data);

            // Step 1: Get IDs
            const { ifinIds } = await getID(input);

            // Step 2: Post current ledger balance
            await postCurrentLedgerBalance({ ...input, ifinIds });

            return { success: true, message: "Current Ledger Balance Data Entry processed succefully" };
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process Current Ledger Balance Data Entry",
                cause: error,
            });
        }
    };

    return {
        getID,
        postCurrentLedgerBalance,
        processCurrentLedgerBalanceData,
    };
};

export const currentLedgerBalanceaDataEntryFactory = createCurrentLedgerBalanceDataEntryFactory;