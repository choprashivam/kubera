import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { xirr, type CashFlow } from "@webcarrot/xirr";
import { MAX_DATE } from "~/constants";
import { TRPCError } from "@trpc/server";

// Define Zod schema for input validation
const ParamsSchema = z.object({
    ifinId: z.string(),
});

export const totalPnlRouter = createTRPCRouter({
    getTotalPnl: protectedProcedure
        .input(ParamsSchema)
        .query(async ({ ctx, input }) => {
            const { ifinId } = input;

            try {
                const [unrealisedPnl, realisedPnlSum, totalLedgerCharges, ledgerInvestmentEntries, ledgerChargesEntries, realisedPnl, investedCash, withdrawnCash, marketValueOfCustomerOwned, buyValueOfiFinOwned, accountOpenDate, marketValueOfCustomerOwnedSum, buyValueOfiFinOwnedSum] = await Promise.all([
                    ctx.db.holdingsTransactions.aggregate({
                        _sum: { unrealisedPnl: true },
                        where: {
                            ifinId,
                            openQuantity: { not: 0 },
                            ownedBy: "IFIN",
                        },
                    }),
                    ctx.db.realisedPnl.aggregate({
                        _sum: { pnl: true },
                        where: {
                            ifinId: ifinId,
                            pnlContributedBy: "IFIN",
                        },
                    }),
                    ctx.db.ledger.aggregate({
                        _sum: { amount: true },
                        where: { ifinId, ledgerEntryType: "CHARGES" },
                    }),
                    ctx.db.ledger.findMany({
                        where: {
                            ifinId,
                            ledgerEntryType: {
                                in: ["INVESTMENT", "INTER_DP_STOCK_SOLD", "CUSTOMER_CONTRIBUTED_PNL"]
                            }
                        },
                        select: { fromDate: true, amount: true },
                    }),
                    ctx.db.ledger.findMany({
                        where: { ifinId, ledgerEntryType: "CHARGES" },
                        select: { fromDate: true, amount: true },
                    }),
                    ctx.db.realisedPnl.findMany({
                        where: {
                            ifinId,
                            pnlContributedBy: "IFIN",
                        },
                        select: { fromDate: true, pnl: true },
                    }),
                    ctx.db.investedCash.findFirst({
                        where: { ifinId, toDate: MAX_DATE },
                        select: { amount: true },
                    }),
                    ctx.db.withdrawnCash.findFirst({
                        where: { ifinId },
                        select: { amount: true },
                    }),
                    ctx.db.holdingsTransactions.findMany({
                        where: { ifinId, ownedBy: "CUSTOMER", sourceOfFunds: "OUTSIDE_ACCOUNT" },
                        select: { buyDate: true, marketValue: true },
                    }),
                    ctx.db.holdingsTransactions.findMany({
                        where: { ifinId, ownedBy: "IFIN", sourceOfFunds: "OUTSIDE_ACCOUNT" },
                        select: { buyDate: true, buyValue: true },
                    }),
                    ctx.db.cRM.findFirst({
                        where: { ifinId },
                        select: { accountOpenDate: true },
                    }),
                    ctx.db.holdingsTransactions.aggregate({
                        _sum: { marketValue: true },
                        where: {
                            ifinId,
                            ownedBy: "CUSTOMER",
                            sourceOfFunds: "OUTSIDE_ACCOUNT",
                        },
                    }),
                    ctx.db.holdingsTransactions.aggregate({
                        _sum: { buyValue: true },
                        where: {
                            ifinId,
                            ownedBy: "IFIN",
                            sourceOfFunds: "OUTSIDE_ACCOUNT",
                        },
                    }),
                ]);

                if (!accountOpenDate?.accountOpenDate) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Account open date is missing',
                    });
                }

                const marketValueOfCustomerOwnedCashflow = marketValueOfCustomerOwned.map(item => {
                    if (!item.buyDate || !item.marketValue) {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: 'Invalid market value data: Missing buyDate or marketValue',
                        });
                    }
                    return {
                        amount: item.marketValue.negated().toNumber(),
                        date: new Date(item.buyDate).getTime() < new Date(accountOpenDate.accountOpenDate).getTime()
                            ? accountOpenDate.accountOpenDate
                            : item.buyDate
                    };
                });

                const buyValueOfiFinOwnedCashflow = buyValueOfiFinOwned.map(item => {
                    if (!item.buyDate || !item.buyValue) {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: 'Invalid buy value data: Missing buyDate or buyValue',
                        });
                    }
                    return {
                        amount: item.buyValue.negated().toNumber(),
                        date: new Date(item.buyDate).getTime() < new Date(accountOpenDate.accountOpenDate).getTime()
                            ? accountOpenDate.accountOpenDate
                            : item.buyDate
                    };
                });

                const currentInvestment = (investedCash?.amount.toNumber() ?? 0) - (withdrawnCash?.amount.toNumber() ?? 0);

                // Convert ledger investment entries with inverted amounts
                const ledgerInvestmentEntriesCashflow = ledgerInvestmentEntries.map(entry => ({
                    amount: entry.amount.negated().toNumber(),
                    date: entry.fromDate,
                }));

                // Convert realisedPnl entries
                const pnlCashflow = realisedPnl.map(entry => ({
                    amount: entry.pnl.toNumber(),
                    date: entry.fromDate,
                }));

                // Convert ledger charges entries
                const ledgerChargesEntriesCashflow = ledgerChargesEntries.map(entry => ({
                    amount: entry.amount.toNumber(),
                    date: entry.fromDate,
                }));

                // Combine both arrays into cashflow
                const cashflow: Array<CashFlow> = [
                    ...ledgerInvestmentEntriesCashflow,
                    ...marketValueOfCustomerOwnedCashflow,
                    ...buyValueOfiFinOwnedCashflow,
                    ...pnlCashflow,
                    ...ledgerChargesEntriesCashflow,
                    { amount: unrealisedPnl._sum.unrealisedPnl?.toNumber() ?? 0, date: new Date() },
                    { amount: currentInvestment, date: new Date() },
                    { amount: marketValueOfCustomerOwnedSum._sum.marketValue?.toNumber() ?? 0, date: new Date() },
                    { amount: buyValueOfiFinOwnedSum._sum.buyValue?.toNumber() ?? 0, date: new Date() },
                ];

                return {
                    totalPnl: (realisedPnlSum._sum.pnl?.toNumber() ?? 0) + (totalLedgerCharges._sum.amount?.toNumber() ?? 0) + (unrealisedPnl._sum.unrealisedPnl?.toNumber() ?? 0),
                    totalPnlPerc: xirr(cashflow),
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch total PnL. Please try again later.",
                    cause: error,
                });
            }
        }),
});