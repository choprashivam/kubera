import { z } from "zod";
import { AccountStatus, AccountType } from "@prisma/client";

// Define the UserCrm input schema with all fields as strings
export const UserCrmInputSchema = z.object({
    clientName: z.string(),
    brokerId: z.string(),
    phoneNo: z.string(),
    email: z.string(),
    address: z.string(),
    accountOpenDate: z.string(),
    accountType: z.string(),
    accountStatus: z.string(),
});

// Define the output schema for UserCrm
export const UserCrmOutputSchema = z.object({
    clientName: z.string().min(1, "Client name is required"),
    brokerId: z.string().min(1, "Broker ID is required"),
    phoneNo: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    email: z.string().email("Invalid email format"),
    address: z.string().min(1, "Address is required"),
    accountOpenDate: z.date(),
    accountType: z.array(z.nativeEnum(AccountType)).min(1, "At least one account type is required"),
    accountStatus: z.nativeEnum(AccountStatus),
});