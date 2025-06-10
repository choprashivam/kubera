import { FundSource, OwnedBy, Service } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { MAX_DATE } from "~/constants";
import type { createTRPCContext } from "~/server/api/trpc";
import type { BuyEntry } from "~/types/holdingsTrxBuyEntryType";
import { ledgerDataEntryFactory } from "./ledgerDataEntry";

// Define the Context type based on your createTRPCContext function
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Define Zod schema for input validation
const ParamsSchema = z.object({
    brokerId: z.array(z.string().min(1, "Broker ID is required")),
    scripcode: z.array(z.string().min(1, "Scripcode is required")),
    service: z.array(z.nativeEnum(Service)),
    trxType: z.array(z.enum(["BUY", "SELL"])),
    trxPrice: z.array(z.number()),
    quantity: z.array(z.number().positive()),
    trxDate: z.array(z.date()),
    ownedBy: z.array(z.nativeEnum(OwnedBy)),
    sourceOfFunds: z.array(z.nativeEnum(FundSource)),
});

type CreateHoldingsTrxDataEntryInput = z.infer<typeof ParamsSchema>;

// Validate that all input arrays are of the same length
const validateInputLength = (input: CreateHoldingsTrxDataEntryInput): void => {
    const { brokerId, scripcode, trxType, trxPrice, quantity, trxDate, ownedBy, sourceOfFunds } = input;
    if (brokerId.length !== scripcode.length || brokerId.length !== trxType.length || brokerId.length !== trxPrice.length || brokerId.length !== quantity.length || brokerId.length !== trxDate.length || brokerId.length !== ownedBy.length || brokerId.length !== sourceOfFunds.length) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All input arrays must be of the same length",
        });
    }
};

// Service factory
const createHoldingsTrxDataEntryFactory = (ctx: Context) => {
    // Service 1: Get IDs
    const getID = async (input: CreateHoldingsTrxDataEntryInput) => {
        validateInputLength(input);
        const { brokerId, scripcode, service } = input;

        try {
            // First Promise: Get IFIN IDs
            const ifinIdsPromise = ctx.db.cRM.findMany({
                where: { brokerId: { in: brokerId } },
                select: { brokerId: true, ifinId: true },
            });

            // Second Promise: Get Scrips IDs using parallel promises for each scripcode-service pair
            const scripsIdsPromises = scripcode.map((code, index) =>
                ctx.db.scrips.findUnique({
                    where: {
                        likeScripcode: {
                            scripcode: code,
                            service: service[index]!,
                        },
                    },
                    select: {
                        scripcode: true,
                        scripsId: true,
                        service: true
                    },
                })
            );

            // Execute all promises in parallel
            const [ifinIds, ...scripsIdsResults] = await Promise.all([
                ifinIdsPromise,
                ...scripsIdsPromises
            ]);

            // Filter out null results and create the final scripsIds array
            const scripsIds = scripsIdsResults
                .filter((result): result is NonNullable<typeof result> => result !== null);

            // Check if all brokerIds are found
            const foundBrokerIds = new Set(ifinIds.map(item => item.brokerId));
            const missingBrokerIds = brokerId.filter(id => !foundBrokerIds.has(id));
            if (missingBrokerIds.length > 0) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `The following broker IDs were not found in the database: ${missingBrokerIds.join(', ')}`,
                });
            }

            // Check if all scripcode-service pairs are found
            const missingPairs = scripcode
                .map((code, index) => ({
                    scripcode: code,
                    service: service[index]
                }))
                .filter(pair => !scripsIds.some(
                    result => result.scripcode === pair.scripcode &&
                        result.service === pair.service
                ));

            if (missingPairs.length > 0) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `The following scripcode-service pairs were not found in the database: ${missingPairs.map(pair =>
                        `(scripcode: ${pair.scripcode}, service: ${pair.service})`
                    ).join(', ')
                        }`,
                });
            }

            return { ifinIds, scripsIds };
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

    // Service 2: Post Buy Transactions
    const postBuyTrx = async (input: CreateHoldingsTrxDataEntryInput & {
        ifinIds: { brokerId: string; ifinId: string; }[];
        scripsIds: { scripcode: string; service: "IIFL" | "MFAPI"; scripsId: string; }[];
    }) => {
        const { brokerId, scripcode, ifinIds, scripsIds, trxType, trxPrice, quantity, trxDate, ownedBy, sourceOfFunds } = input;
        try {
            const buyEntries = brokerId.reduce<BuyEntry[]>((acc, id, index) => {
                if (trxType[index] === "BUY") {
                    const ifinId = ifinIds.find((item) => item.brokerId === id)?.ifinId;
                    const scripsId = scripsIds.find((item) => item.scripcode === scripcode[index])?.scripsId;
                    if (ifinId === undefined || scripsId === undefined || trxPrice[index] === undefined || quantity[index] === undefined || trxDate[index] === undefined || ownedBy[index] === undefined || sourceOfFunds[index] === undefined) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: `Missing data for brokerId: ${id} and scripcode: ${scripcode[index]}`,
                        });
                    }
                    const buyValue = trxPrice[index] * quantity[index];
                    acc.push({
                        ifinId,
                        scripsId,
                        buyQuantity: quantity[index],
                        buyPrice: trxPrice[index],
                        buyValue,
                        buyDate: trxDate[index],
                        openQuantity: quantity[index],
                        ownedBy: ownedBy[index],
                        sourceOfFunds: sourceOfFunds[index],
                        fromDate: new Date(),
                        toDate: new Date(MAX_DATE),
                    });
                }
                return acc;
            }, []);
            await ctx.db.holdingsTransactions.createMany({ data: buyEntries });
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create holdings transactions",
                cause: error,
            });
        }
    };

    // Service 3: Post Sell Transactions
    const postSellTrx = async (input: CreateHoldingsTrxDataEntryInput & {
        ifinIds: { brokerId: string; ifinId: string; }[];
        scripsIds: { scripcode: string; service: "IIFL" | "MFAPI"; scripsId: string; }[];
    }) => {
        const { brokerId, scripcode, ifinIds, scripsIds, trxType, trxPrice, quantity, trxDate, service, sourceOfFunds } = input;
        try {
            for (let i = 0; i < brokerId.length; i++) {
                if (trxType[i] === "SELL") {
                    const latestHoldingsTransactions = await ctx.db.holdingsTransactions.findMany({
                        where: {
                            crm: { brokerId: { in: brokerId } },
                            scrips: { scripcode: { in: scripcode } },
                            openQuantity: { not: 0 },
                        },
                    });
                    // Transform Decimal to number
                    const transformedLatestHoldingsTransactions = latestHoldingsTransactions.map(transaction => ({
                        ...transaction,
                        buyQuantity: transaction.buyQuantity.toNumber(),
                        buyPrice: transaction.buyPrice.toNumber(),
                        buyValue: transaction.buyValue.toNumber(),
                        sellQuantity: transaction.sellQuantity.toNumber(),
                        sellPrice: transaction.sellPrice.toNumber(),
                        sellValue: transaction.sellValue.toNumber(),
                        openQuantity: transaction.openQuantity.toNumber(),
                        unrealisedPnl: transaction.unrealisedPnl.toNumber(),
                    }));
                    const ifinId = ifinIds.find((item) => item.brokerId === brokerId[i])?.ifinId;
                    const scripsId = scripsIds.find((item) => item.scripcode === scripcode[i])?.scripsId;
                    if (ifinId === undefined || scripsId === undefined) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: `Missing data for brokerId: ${brokerId[i]} and scripcode: ${scripcode[i]}`,
                        });
                    }
                    let remainingSellQuantity = quantity[i];
                    if (remainingSellQuantity === undefined) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: `Missing sell quantity for brokerId: ${brokerId[i]} and scripcode: ${scripcode[i]}`,
                        });
                    }
                    const relevantBuyTransactions = transformedLatestHoldingsTransactions
                        .filter(trx => trx.ifinId === ifinId && trx.scripsId === scripsId && trx.buyQuantity > trx.sellQuantity)
                        .sort((a, b) => a.buyDate!.getTime() - b.buyDate!.getTime());
                    const totalAvailableBuyQuantity = relevantBuyTransactions.reduce((acc, trx) => acc + (trx.buyQuantity - trx.sellQuantity), 0);
                    if (remainingSellQuantity > totalAvailableBuyQuantity) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: `Insufficient buy quantity for sell transaction: brokerId ${brokerId[i]}, scripcode ${scripcode[i]}`,
                        });
                    }
                    // Track the total reduction in buyValue for Ledger entry
                    let totalBuyValueReduction = 0;
                    for (const buyTransaction of relevantBuyTransactions) {
                        if (remainingSellQuantity <= 0) break;
                        const availableBuyQuantity = buyTransaction.buyQuantity - buyTransaction.sellQuantity;
                        const sellQuantity = Math.min(remainingSellQuantity, availableBuyQuantity);
                        const updatedSellQuantity = buyTransaction.sellQuantity + sellQuantity;
                        const updatedOpenQuantity = buyTransaction.buyQuantity - updatedSellQuantity;
                        const updatedSellPrice = ((buyTransaction.sellQuantity * buyTransaction.sellPrice) + (sellQuantity * trxPrice[i]!)) / updatedSellQuantity;
                        const updatedSellValue = updatedSellPrice * updatedSellQuantity;
                        const updatedBuyValue = updatedOpenQuantity * buyTransaction.buyPrice;
                        // Calculate the reduction in buyValue
                        const buyValueReduction = buyTransaction.buyValue - updatedBuyValue;
                        totalBuyValueReduction += buyValueReduction;
                        await ctx.db.holdingsTransactions.update({
                            where: { holdingsTransactionsId: buyTransaction.holdingsTransactionsId },
                            data: {
                                buyValue: updatedBuyValue,
                                sellQuantity: updatedSellQuantity,
                                sellPrice: updatedSellPrice,
                                sellValue: updatedSellValue,
                                sellDate: trxDate[i],
                                openQuantity: updatedOpenQuantity,
                                fromDate: new Date(),
                                toDate: MAX_DATE,
                            },
                        });
                        remainingSellQuantity -= sellQuantity;
                    }
                    // If the sell transaction is for IIFL service and OUTSIDE_ACCOUNT, process ledger data
                    if (service[i] === "IIFL" && sourceOfFunds[i] === "OUTSIDE_ACCOUNT" && totalBuyValueReduction > 0) {
                        const ledgerServices = ledgerDataEntryFactory(ctx);
                        await ledgerServices.processLedgerData({
                            brokerId: [brokerId[i]],
                            amount: [totalBuyValueReduction],
                            ledgerEntryType: ["INTER_DP_STOCK_SOLD"],
                            date: [trxDate[i]!],
                        });
                    }
                }
            }
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process sell transactions",
                cause: error,
            });
        }
    };

    // Process Holdings Transaction Data
    const processHoldingsTrxData = async (data: Record<string, unknown[]>) => {
        try {
            const input = ParamsSchema.parse(data);

            // Step 1: Get IDs
            const { ifinIds, scripsIds } = await getID(input);

            // Step 2: Post Buy Transactions
            await postBuyTrx({ ...input, ifinIds, scripsIds });

            // Step 3: Post Sell Transactions
            await postSellTrx({ ...input, ifinIds, scripsIds });

            return { success: true, message: "Holdings transactions processed successfully" };
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process holdings transactions",
                cause: error,
            });
        }
    };

    return {
        getID,
        postBuyTrx,
        postSellTrx,
        processHoldingsTrxData,
    };
};

export const holdingsTrxDataEntryFactory = createHoldingsTrxDataEntryFactory;