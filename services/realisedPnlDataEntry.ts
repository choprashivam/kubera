import { EntryType, pnlContributedBy } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { MAX_DATE } from "~/constants";
import type { createTRPCContext } from "~/server/api/trpc";
import { ledgerDataEntryFactory } from "./ledgerDataEntry";

// Define the Context type based on your createTRPCContext function
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Define Zod schema for input validation
const ParamsSchema = z.object({
    brokerId: z.array(z.string().min(1, "Broker ID is required")),
    pnl: z.array(z.number()),
    entryType: z.array(z.nativeEnum(EntryType)),
    pnlContributedBy: z.array(z.nativeEnum(pnlContributedBy)),
    date: z.array(z.date()),
});

type CreateRealisedPnlDataEntryInput = z.infer<typeof ParamsSchema>;

// Validate that all input arrays are of the same length
const validateInputLength = (input: CreateRealisedPnlDataEntryInput): void => {
    const { brokerId, pnl, entryType, pnlContributedBy, date } = input;
    if (pnl.length !== brokerId.length || entryType.length !== brokerId.length || pnlContributedBy.length !== brokerId.length || date.length !== brokerId.length) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All input arrays must be of the same length",
        });
    }
};

// Service factory
const createRealisedPnlDataEntryFactory = (ctx: Context) => {
    // Service 1: Get ifinIDs
    const getID = async (input: CreateRealisedPnlDataEntryInput) => {
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
                message: "Failed to fetch IDs",
                cause: error,
            });
        }
    };

    // Service 2: Post IFIN contributed Realised Pnl
    const postRealisedPnl = async (input: CreateRealisedPnlDataEntryInput & {
        ifinIds: { brokerId: string; ifinId: string }[];
    }) => {
        const { ifinIds, brokerId, pnl, entryType, pnlContributedBy, date } = input;

        try {
            const entries = brokerId.map((id, index) => {
                // Skip if not IFIN
                if (pnlContributedBy[index] !== "IFIN") {
                    return null;
                }
                const ifinId = ifinIds.find((item) => item.brokerId === id)?.ifinId;
                if (ifinId === undefined || pnl[index] === undefined || entryType[index] === undefined || pnlContributedBy[index] === undefined || date[index] === undefined) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Missing required field(s) for realised PnL entry.",
                    });
                }
                return {
                    ifinId,
                    pnl: pnl[index],
                    entryType: entryType[index],
                    pnlContributedBy: pnlContributedBy[index],
                    fromDate: date[index],
                    toDate: new Date(MAX_DATE),
                };
            }).filter((entry): entry is NonNullable<typeof entry> => entry !== null); // Filter out null entries

            await ctx.db.realisedPnl.createMany({ data: entries });
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create realised PnL entry",
                cause: error,
            });
        }
    };

    //Service 3: Post customer contributions in ledger
    const processCustomerContributions = async (input: CreateRealisedPnlDataEntryInput & {
        ifinIds: { brokerId: string; ifinId: string }[];
    }) => {
        const { brokerId, pnl, entryType, pnlContributedBy, date } = input;

        try {
            // Filter CUSTOMER entries
            const customerEntries = brokerId.map((id, index) => ({
                brokerId: id,
                pnl: pnl[index],
                entryType: entryType[index],
                pnlContributedBy: pnlContributedBy[index],
                date: date[index],
            })).filter(entry => entry.pnlContributedBy === "CUSTOMER");

            // Process each CUSTOMER entry through ledger services
            const ledgerServices = ledgerDataEntryFactory(ctx);
            for (const entry of customerEntries) {
                await ledgerServices.processLedgerData({
                    brokerId: [entry.brokerId],
                    amount: [entry.pnl],
                    ledgerEntryType: ["CUSTOMER_CONTRIBUTED_PNL"],
                    date: [entry.date],
                });
            }
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process customer contributions",
                cause: error,
            });
        }
    };

    // Process Realised PnL Data
    const processRealisedPnlData = async (data: Record<string, unknown[]>) => {
        try {
            const input = ParamsSchema.parse(data);

            // Step 1: Get IDs
            const { ifinIds } = await getID(input);

            // Step 2: Post IFIN contributed Realised Pnl
            await postRealisedPnl({ ...input, ifinIds });

            //Step 3: Post customer contributions in ledger
            await processCustomerContributions({ ...input, ifinIds });

            return { success: true, message: "Realised Pnl Data processed successfully" }
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process realised pnl data",
                cause: error,
            });
        }
    };

    return {
        getID,
        postRealisedPnl,
        processRealisedPnlData,
    };
};

export const realisedPnlDataEntryFactory = createRealisedPnlDataEntryFactory;