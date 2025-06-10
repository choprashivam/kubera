import { EntryType, pnlContributedBy } from "@prisma/client";
import { z } from "zod";

// Define the RealisedPnl input schema with all fields as strings
export const RealisedPnlInputSchema = z.object({
    brokerId: z.string(),
    pnl: z.string(),
    entryType: z.string(),
    pnlContributedBy: z.string(),
    date: z.string(),
});

// Define the output schema for RealisedPnl
export const RealisedPnlOutputSchema = z.object({
    brokerId: z.string().min(1, "Broker ID is required"),
    pnl: z.number(),
    entryType: z.nativeEnum(EntryType),
    pnlContributedBy: z.nativeEnum(pnlContributedBy),
    date: z.date(),
});