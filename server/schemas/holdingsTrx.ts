import { FundSource, OwnedBy, Service } from "@prisma/client";
import { z } from "zod";

// Define the HoldingsTrx input schema with all fields as strings
export const HoldingsTrxInputSchema = z.object({
    brokerId: z.string(),
    scripcode: z.string(),
    service: z.string(),
    trxType: z.string(),
    trxPrice: z.string(),
    quantity: z.string(),
    trxDate: z.string(),
    ownedBy: z.string(),
    sourceOfFunds: z.string(),
});

// Define the output schema for HoldingsTrx
export const HoldingsTrxOutputSchema = z.object({
    brokerId: z.string().min(1, "Broker ID is required"),
    scripcode: z.string().min(1, "Scripcode is required"),
    service: z.nativeEnum(Service),
    trxType: z.enum(["BUY", "SELL"]),
    trxPrice: z.number(),
    quantity: z.number().positive(),
    trxDate: z.date(),
    ownedBy: z.nativeEnum(OwnedBy),
    sourceOfFunds: z.nativeEnum(FundSource),
});