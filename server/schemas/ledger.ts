import { LedgerEntryType } from "@prisma/client";
import { z } from "zod";

// Define the Ledger input schema with all fields as strings
export const LedgerInputSchema = z.object({
    brokerId: z.string(),
    amount: z.string(),
    ledgerEntryType: z.string(),
    date: z.string(),
});

// Define the output schema for Ledger
export const LedgerOutputSchema = z.object({
    brokerId: z.string().min(1, "Broker ID is required"),
    amount: z.number(),
    ledgerEntryType: z.nativeEnum(LedgerEntryType),
    date: z.date(),
});