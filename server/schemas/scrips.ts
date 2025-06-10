import { z } from "zod";
import { ScripsExchange, ScripsExchangeType, Service } from "@prisma/client";

// Define the Scrips input schema with all fields as strings
export const ScripsInputSchema = z.object({
    name: z.string(),
    scripcode: z.string(),
    exchange: z.string(),
    exchangeType: z.string(),
    service: z.string(),
    cmp: z.string(),
});

// Define the output schema for Scrips
export const ScripsOutputSchema = z.object({
    name: z.string().min(1, "Name is required"),
    scripcode: z.string().min(1, "Scripcode is required"),
    exchange: z.nativeEnum(ScripsExchange),
    exchangeType: z.nativeEnum(ScripsExchangeType),
    service: z.nativeEnum(Service),
    cmp: z.number(),
});

// TODO Schema to be matched with Primsa client