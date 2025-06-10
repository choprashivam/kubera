import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AccountStatus, AccountType } from "@prisma/client";
import type { createTRPCContext } from "~/server/api/trpc";

// Define the Context type based on your createTRPCContext function
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Define Zod schema for input validation
const ParamsSchema = z.object({
    entries: z.array(z.object({
        clientName: z.string().min(1, "Client name is required"),
        brokerId: z.string().min(1, "Broker ID is required"),
        phoneNo: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
        email: z.string().email("Invalid email format"),
        address: z.string().min(1, "Address is required"),
        accountOpenDate: z.date(),
        accountType: z.array(z.nativeEnum(AccountType)).min(1, "At least one account type is required"),
        accountStatus: z.nativeEnum(AccountStatus),
    })).min(1, "At least one entry is required"),
});

type UserCrmDataEntryInput = z.infer<typeof ParamsSchema>;

async function userCrmDataEntry(ctx: Context, input: UserCrmDataEntryInput) {
    const { entries } = input;

    // Start a transaction
    return ctx.db.$transaction(async (prisma) => {
        try {
            // Create users first
            const userEntries = entries.map(({ email, clientName }) => ({
                email,
                name: clientName,
            }));

            await prisma.user.createMany({
                data: userEntries,
                skipDuplicates: true,
            });

            // Then create CRM entries
            const crmEntries = entries.map(({
                clientName,
                brokerId,
                phoneNo,
                email,
                address,
                accountOpenDate,
                accountType,
                accountStatus,
            }) => ({
                clientName,
                brokerId,
                phoneNo,
                email,
                address,
                accountOpenDate,
                accountType,
                accountStatus,
            }));

            await prisma.cRM.createMany({
                data: crmEntries,
                skipDuplicates: true,
            });

            return { success: true, message: "User and CRM entries created successfully" };
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred while creating user and CRM entries.",
                cause: error,
            });
        }
    });
};

export async function processUserCrmData(ctx: Context, data: Record<string, unknown[]>) {
    // Type assertion for data
    const typedData = data as {
        clientName: string[];
        brokerId: string[];
        phoneNo: string[];
        email: string[];
        address: string[];
        accountOpenDate: Date[];
        accountType: AccountType[][];
        accountStatus: AccountStatus[];
    };

    if (!typedData.clientName || !typedData.brokerId || !typedData.phoneNo || !typedData.email ||
        !typedData.address || !typedData.accountOpenDate || !typedData.accountType || !typedData.accountStatus) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing required data for UserCrm",
        });
    }

    // Ensure all arrays have the same length
    const length = typedData.clientName.length;
    if ([typedData.brokerId, typedData.phoneNo, typedData.email, typedData.address,
    typedData.accountOpenDate, typedData.accountType, typedData.accountStatus].some(arr => arr.length !== length)) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Inconsistent data lengths in CSV",
        });
    }

    const entries: UserCrmDataEntryInput['entries'] = typedData.clientName.map((_, index) => {
        const clientName = typedData.clientName[index];
        const brokerId = typedData.brokerId[index];
        const phoneNo = typedData.phoneNo[index];
        const email = typedData.email[index];
        const address = typedData.address[index];
        const accountOpenDate = typedData.accountOpenDate[index];
        const accountType = typedData.accountType[index];
        const accountStatus = typedData.accountStatus[index];

        if (clientName === undefined || brokerId === undefined || phoneNo === undefined ||
            email === undefined || address === undefined || accountOpenDate === undefined ||
            accountType === undefined || accountStatus === undefined) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Missing data in row ${index + 1}`,
            });
        }

        return {
            clientName,
            brokerId,
            phoneNo,
            email,
            address,
            accountOpenDate,
            accountType,
            accountStatus,
        };
    });

    const input: UserCrmDataEntryInput = { entries };
    return await userCrmDataEntry(ctx, input);
};