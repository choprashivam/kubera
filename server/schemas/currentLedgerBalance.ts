import { z } from "zod";

// Define the Current Ledger Balance input schema with all fields as strings
export const CurrentLedgerBalanceInputSchema = z.object({
    brokerId: z.string(),
    amount: z.string(),
});

// Define the output schema for Current Ledger Balance
export const CurrentLedgerBalanceOutputSchema = z.object({
    brokerId: z.string().min(1, "Broker ID is required"),
    amount: z.number(),
});