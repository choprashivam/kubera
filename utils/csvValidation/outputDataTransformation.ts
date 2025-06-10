import { type pnlContributedBy, type AccountStatus, type AccountType, type EntryType, type FundSource, type LedgerEntryType, type OwnedBy, type ScripsExchange, type ScripsExchangeType, type Service } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { z } from "zod";
import { CurrentLedgerBalanceInputSchema, CurrentLedgerBalanceOutputSchema } from "~/server/schemas/currentLedgerBalance";
import { HoldingsTrxInputSchema, HoldingsTrxOutputSchema } from "~/server/schemas/holdingsTrx";
import { LedgerInputSchema, LedgerOutputSchema } from "~/server/schemas/ledger";
import { RealisedPnlInputSchema, RealisedPnlOutputSchema } from "~/server/schemas/realisedPnl";
import { ScripsInputSchema, ScripsOutputSchema } from "~/server/schemas/scrips";
import { TodayAlgoPnlInputSchema, TodayAlgoPnlOutputSchema } from "~/server/schemas/todayAlgoPnl";
import { UserCrmInputSchema, UserCrmOutputSchema } from "~/server/schemas/userCrm";

type SchemaMap = Record<string, {
    inputSchema: z.ZodType;
    outputSchema: z.ZodType;
    transform: (input: unknown) => unknown;
}>;

const schemaMap: SchemaMap = {
    Scrips: {
        inputSchema: ScripsInputSchema,
        outputSchema: ScripsOutputSchema,
        transform: (input: unknown) => {
            const typedInput = input as {
                exchange: string;
                exchangeType: string;
                service: string;
                cmp: string;
            };
            return {
                ...typedInput, //TODO : Find out why?
                exchange: typedInput.exchange as ScripsExchange,
                exchangeType: typedInput.exchangeType as ScripsExchangeType,
                service: typedInput.service as Service,
                cmp: parseFloat(typedInput.cmp),
            };
        },
    },
    UserCrm: {
        inputSchema: UserCrmInputSchema,
        outputSchema: UserCrmOutputSchema,
        transform: (input: unknown) => {
            const typedInput = input as {
                accountOpenDate: string;
                accountType: string;
                accountStatus: string;
            };
            return {
                ...typedInput,
                accountOpenDate: new Date(typedInput.accountOpenDate),
                accountType: typedInput.accountType
                    .slice(2, -2)  // Remove the outer brackets and quotes
                    .split('", "')  // Split the string into an array
                    .map(type => type.trim()) as AccountType[],  // Trim any whitespace and cast to AccountType[]
                accountStatus: typedInput.accountStatus as AccountStatus,
            };
        },
    },
    HoldingsTrx: {
        inputSchema: HoldingsTrxInputSchema,
        outputSchema: HoldingsTrxOutputSchema,
        transform: (input: unknown) => {
            const typedInput = input as {
                service: string;
                trxType: string;
                trxPrice: string;
                quantity: string;
                trxDate: string;
                ownedBy: string;
                sourceOfFunds: string;
            };
            return {
                ...typedInput,
                service: typedInput.service as Service,
                trxType: typedInput.trxType as "BUY" | "SELL",
                trxPrice: parseFloat(typedInput.trxPrice),
                quantity: parseFloat(typedInput.quantity),
                trxDate: new Date(typedInput.trxDate),
                ownedBy: typedInput.ownedBy as OwnedBy,
                sourceOfFunds: typedInput.sourceOfFunds as FundSource,
            };
        },
    },
    RealisedPnl: {
        inputSchema: RealisedPnlInputSchema,
        outputSchema: RealisedPnlOutputSchema,
        transform: (input: unknown) => {
            const typedInput = input as {
                pnl: string;
                entryType: string;
                pnlContributedBy: string;
                date: string;
            };
            return {
                ...typedInput,
                pnl: parseFloat(typedInput.pnl),
                entryType: typedInput.entryType as EntryType,
                pnlContributedBy: typedInput.pnlContributedBy as pnlContributedBy,
                date: new Date(typedInput.date),
            };
        },
    },
    Ledger: {
        inputSchema: LedgerInputSchema,
        outputSchema: LedgerOutputSchema,
        transform: (input: unknown) => {
            const typedInput = input as {
                amount: string;
                ledgerEntryType: string;
                date: string;
            };
            return {
                ...typedInput,
                amount: parseFloat(typedInput.amount),
                ledgerEntryType: typedInput.ledgerEntryType as LedgerEntryType,
                date: new Date(typedInput.date),
            };
        },
    },
    CurrentLedgerBalance: {
        inputSchema: CurrentLedgerBalanceInputSchema,
        outputSchema: CurrentLedgerBalanceOutputSchema,
        transform: (input: unknown) => {
            const typedInput = input as {
                amount: string;
            };
            return {
                ...typedInput,
                amount: parseFloat(typedInput.amount),
            };
        },
    },
    TodayAlgoPnl: {
        inputSchema: TodayAlgoPnlInputSchema,
        outputSchema: TodayAlgoPnlOutputSchema,
        transform: (input: unknown) => {
            const typedInput = input as {
                amount: string;
            };
            return {
                ...typedInput,
                amount: parseFloat(typedInput.amount),
            };
        },
    },
    // Add more import types here as needed
    // TODO Refactor schema map similar to providers
};

export function validateAndTransformData(importType: string, data: unknown[], headers: string[]): Record<string, unknown[]> {
    const schema = schemaMap[importType];
    if (!schema) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unsupported import type",
        });
    }

    const result: Record<string, unknown[]> = {};
    headers.forEach(header => {
        result[header] = [];
    });
    //TODO : Sample of result

    data.forEach((row, index) => {
        try {
            // Validate input data
            const validatedInput = schema.inputSchema.parse(row) as Record<string, unknown>;

            // Transform data
            const transformedRow = schema.transform(validatedInput);

            // Validate output data
            const validatedOutput = schema.outputSchema.parse(transformedRow) as Record<string, unknown>;

            headers.forEach(header => {
                if (result[header])
                    result[header].push(validatedOutput[header]);
            });
        } catch (error) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Validation error in row ${index + 2}: ${(error as Error).message}`,
            });
        }
    });

    //TODO : Write what result would like
    return result;
};