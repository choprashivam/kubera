import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ScripsExchange, ScripsExchangeType, Service } from "@prisma/client";
import type { createTRPCContext } from "~/server/api/trpc";

// Define the Context type based on your createTRPCContext function
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Define Zod schema for input validation
const ParamsSchema = z.object({
    entries: z.array(z.object({
        name: z.string().min(1, "Name is required"),
        scripcode: z.string().min(1, "Scripcode is required"),
        exchange: z.nativeEnum(ScripsExchange),
        exchangeType: z.nativeEnum(ScripsExchangeType),
        service: z.nativeEnum(Service),
        cmp: z.number(),
    })).min(1, "At least one entry is required"),
});

type ScripsDataEntryInput = z.infer<typeof ParamsSchema>;

async function scripsDatEntry(ctx: Context, input: ScripsDataEntryInput) {
    const { entries } = input;

    try {
        const scripsEntries = entries.map(({
            name,
            scripcode,
            exchange,
            exchangeType,
            service,
            cmp,
        }) => ({
            name,
            scripcode,
            exchange,
            exchangeType,
            service,
            cmp,
        }));

        await ctx.db.scrips.createMany({
            data: scripsEntries,
            skipDuplicates: true,
        });

        return { success: true, message: "Scrips entries created successfully" };
    } catch (error) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An error occured while importing scrips.",
            cause: error,
        });
    }
};

export async function processScripsData(ctx: Context, data: Record<string, unknown[]>) {
    // Type assertion for data
    const typedData = data as {
        name: string[];
        scripcode: string[];
        exchange: string[];
        exchangeType: string[];
        service: string[]
        cmp: (string | number)[];
    };

    if (!typedData.name || !typedData.scripcode || !typedData.exchange || !typedData.exchangeType || !typedData.service || !typedData.cmp) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing required data for Scrips",
        });
    }

    // Ensure all arrays have the same length
    const length = typedData.name.length;
    if ([typedData.scripcode, typedData.exchange, typedData.exchangeType, typedData.service, typedData.cmp].some(arr => arr.length !== length)) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Inconsistent data lengths in CSV",
        });
    }

    const entries: ScripsDataEntryInput['entries'] = typedData.name.map((_, index) => {
        const name = typedData.name[index];
        const scripcode = typedData.scripcode[index];
        const exchange = typedData.exchange[index];
        const exchangeType = typedData.exchangeType[index];
        const service = typedData.service[index];
        const cmp = typedData.cmp[index];

        if (name === undefined || scripcode === undefined || exchange === undefined ||
            exchangeType === undefined || service === undefined || cmp === undefined) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Missing data in row ${index + 1}`,
            });
        }

        if (!(exchange in ScripsExchange)) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Invalid exchange value in row ${index + 1}`,
            });
        }

        if (!(exchangeType in ScripsExchangeType)) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Invalid exchangeType value in row ${index + 1}`,
            });
        }

        if (!(service in Service)) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Invalid service value in row ${index + 1}`,
            });
        }

        return {
            name,
            scripcode,
            exchange: exchange as ScripsExchange,
            exchangeType: exchangeType as ScripsExchangeType,
            service: service as Service,
            cmp: Number(cmp),
        };
    });

    const input: ScripsDataEntryInput = { entries };
    return await scripsDatEntry(ctx, input);
};