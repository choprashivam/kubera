import { LedgerEntryType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { MAX_DATE } from "~/constants";
import type { createTRPCContext } from "~/server/api/trpc";

// Define the Context type based on your createTRPCContext function
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Define Zod schema for input validation
const ParamsSchema = z.object({
    brokerId: z.array(z.string().min(1, "Broker ID is required")),
    amount: z.array(z.number()),
    ledgerEntryType: z.array(z.nativeEnum(LedgerEntryType)),
    date: z.array(z.date()),
});

type CreateledgerDataEntryInput = z.infer<typeof ParamsSchema>;

// Validate that all input arrays are of the same length
const validateInputLength = (input: CreateledgerDataEntryInput): void => {
    const { brokerId, amount, ledgerEntryType, date } = input;
    if (brokerId.length !== amount.length || brokerId.length !== ledgerEntryType.length || brokerId.length !== date.length) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All input arrays must be of the same length",
        });
    }
};

// Service factory
const createledgerDataEntryFactory = (ctx: Context) => {
    // Service 1: Get ID
    const getID = async (brokerId: string | undefined) => {

        try {
            if (brokerId === undefined) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "service 1 input is undefined",
                });
            }

            const ifinId = await ctx.db.cRM.findFirst({
                where: { brokerId: brokerId },
                select: { ifinId: true },
            });

            if (!ifinId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "ifinId not found",
                });
            }

            return { ifinId };
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

    // Service 2: Post entries to ledger
    const postLedger = async (ifinId: string, amount: number | undefined, ledgerEntryType: "INVESTMENT" | "CHARGES" | "INTER_DP_STOCK_SOLD" | "CUSTOMER_CONTRIBUTED_PNL" | undefined, date: Date | undefined) => {

        try {
            if (amount === undefined || ledgerEntryType === undefined || date === undefined) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "service 2 input is undefined",
                });
            }

            await ctx.db.ledger.createMany({
                data: {
                    ifinId,
                    amount,
                    ledgerEntryType,
                    fromDate: date,
                    toDate: new Date(MAX_DATE),
                },
            });
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create ledger entry",
                cause: error,
            });
        }
    };

    // Service 3: Fetch ledger balance for given broker IDs
    const getLedgerBalance = async (brokerId: string | undefined) => {

        try {
            if (brokerId === undefined) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "service 3 brokerId input is undefined",
                });
            }

            const ledgerBalance = await ctx.db.ledger.aggregate({
                where: {
                    crm: { brokerId },
                    ledgerEntryType: {
                        in: ["INVESTMENT", "INTER_DP_STOCK_SOLD", "CUSTOMER_CONTRIBUTED_PNL"]
                    }
                },
                _sum: { amount: true },
            });

            return { ledgerBalance: ledgerBalance._sum.amount?.toNumber() ?? 0 };
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch Ledger Balance",
                cause: error,
            });
        }
    };

    // Service 4: Fetch invested cash data for given broker IDs
    const getInvestedCash = async (brokerId: string | undefined, ledgerBalance: number, ifinId: string) => {

        try {
            if (brokerId === undefined) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "service 4 input is undefined",
                });
            }

            const investedCashData = await ctx.db.investedCash.findFirst({
                where: {
                    crm: { brokerId: brokerId },
                    toDate: MAX_DATE,
                },
            });

            let investedCash; // This array will contain those investedCash data which needs to be newly entered or updated
            let withdrawnCash; // This array will conatin those investedCash data which is greater than ledgerSum

            // Convert Decimal to number for comparison
            const investedCashAmount = investedCashData?.amount.toNumber() ?? 0;

            if (!investedCashData || ledgerBalance > investedCashAmount) {
                investedCash = {
                    ifinId,
                    amount: investedCashData?.amount.toNumber() ?? null,
                    fromDate: investedCashData?.fromDate ?? null,
                    toDate: investedCashData?.toDate ?? null,
                };
            } else if (ledgerBalance < investedCashAmount) {
                withdrawnCash = {
                    ifinId,
                    amount: investedCashData.amount.toNumber(),
                };
            }

            return { investedCash, withdrawnCash };
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch Invested Cash data",
                cause: error,
            });
        }
    };

    // Service 5: If no entry in Invested cash then create new entry. If ledger sum > invested cash then create new entry and update toDate of previous entry to date provided by user
    const postInvestedCash = async (
        ledgerBalance: number,
        date: Date | undefined,
        ifinId: string,
        investedCash: {
            ifinId: string;
            amount: number | null;
            fromDate: Date | null;
            toDate: Date | null
        },
    ) => {

        try {
            if (date === undefined) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "service 5 input is undefined",
                });
            }

            // Handle new entries
            if (investedCash.amount === null) {
                await ctx.db.investedCash.create({
                    data: {
                        ifinId,
                        amount: ledgerBalance,
                        fromDate: date,
                        toDate: new Date(MAX_DATE),
                    },
                });
            } else {
                await ctx.db.$transaction(async (tx) => {
                    // Update the toDate of the previous entry
                    await tx.investedCash.updateMany({
                        where: {
                            AND: [
                                { ifinId },
                                { toDate: new Date(MAX_DATE) },
                            ],
                        },
                        data: {
                            toDate: date,
                        },
                    });

                    // Create a new entry with the updated amount and date
                    await tx.investedCash.create({
                        data: {
                            ifinId,
                            amount: ledgerBalance,
                            fromDate: date,
                            toDate: new Date(MAX_DATE),
                        },
                    });
                });
            }
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update Invested Cash",
                cause: error,
            });
        }
    };

    // Service 6: If ledger sum < invested cash then upsert withdrawn cash
    const postWithdrawnCash = async (
        ifinId: string,
        ledgerBalance: number,
        withdrawnCash: { ifinId: string; amount: number } | undefined,
    ) => {

        try {
            if (withdrawnCash === undefined) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "service 6 input is undefined",
                });
            }

            await ctx.db.withdrawnCash.upsert({
                where: { ifinId },
                update: { amount: withdrawnCash.amount - ledgerBalance },
                create: { ifinId, amount: withdrawnCash.amount - ledgerBalance },
            });
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to upsert withdraw cash",
                cause: error,
            });
        }
    };

    // Process Ledger Data
    const processLedgerData = async (data: Record<string, unknown[]>) => {
        try {
            const input = ParamsSchema.parse(data);
            validateInputLength(input);

            for (let i = 0; i < input.brokerId.length; i++) {
                // Step 1: Get ID
                const { ifinId } = await getID(input.brokerId[i]);

                // Step 2: Post entries to ledger
                await postLedger(ifinId.ifinId, input.amount[i], input.ledgerEntryType[i], input.date[i]);

                // Step 3: Fetch ledger balance for given broker IDs
                const { ledgerBalance } = await getLedgerBalance(input.brokerId[i]);

                // Step 4: Fetch invested cash data for given broker IDs
                const { investedCash, withdrawnCash } = await getInvestedCash(input.brokerId[i], ledgerBalance, ifinId.ifinId);

                if (investedCash === undefined) {
                    // Step 6: If ledger sum < invested cash then upsert withdrawn cash
                    await postWithdrawnCash(ifinId.ifinId, ledgerBalance, withdrawnCash);
                } else if (withdrawnCash === undefined) {
                    // Step 5: If no entry in Invested cash then create new entry. If ledger sum > invested cash then create new entry and update toDate of previous entry to date provided by user
                    await postInvestedCash(ledgerBalance, input.date[i], ifinId.ifinId, investedCash);
                } else if (investedCash === undefined && withdrawnCash === undefined) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "invested cash and withdrawn cash are both undefined in service 4",
                    });
                }
            }

            return { success: true, message: "Ledger data processed successfully" };
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process ledger data",
                cause: error,
            });
        }
    };

    return {
        getID,
        postLedger,
        getLedgerBalance,
        getInvestedCash,
        postInvestedCash,
        postWithdrawnCash,
        processLedgerData,
    };
};

export const ledgerDataEntryFactory = createledgerDataEntryFactory;