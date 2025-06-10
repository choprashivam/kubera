import { z } from "zod";

// Define the today algo pnl input schema with all fields as strings
export const TodayAlgoPnlInputSchema = z.object({
    brokerId: z.string(),
    amount: z.string(),
});

// Define the output schema for Current Ledger Balance
export const TodayAlgoPnlOutputSchema = z.object({
    brokerId: z.string().min(1, "Broker ID is required"),
    amount: z.number(),
});