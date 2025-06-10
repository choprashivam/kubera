import { TRPCError } from "@trpc/server";
import { CurrentLedgerBalanceInputSchema } from "~/server/schemas/currentLedgerBalance";
import { HoldingsTrxInputSchema } from "~/server/schemas/holdingsTrx";
import { LedgerInputSchema } from "~/server/schemas/ledger";
import { RealisedPnlInputSchema } from "~/server/schemas/realisedPnl";
import { ScripsInputSchema } from "~/server/schemas/scrips";
import { TodayAlgoPnlInputSchema } from "~/server/schemas/todayAlgoPnl";
import { UserCrmInputSchema } from "~/server/schemas/userCrm";

export function validateHeaders(importType: string, headers: string[]): boolean {
    let requiredHeaders: string[];
    switch (importType) {
        case "Scrips":
            requiredHeaders = Object.keys(ScripsInputSchema.shape);
            break;
        case "UserCrm":
            requiredHeaders = Object.keys(UserCrmInputSchema.shape);
            break;
        case "HoldingsTrx":
            requiredHeaders = Object.keys(HoldingsTrxInputSchema.shape);
            break;
        case "RealisedPnl":
            requiredHeaders = Object.keys(RealisedPnlInputSchema.shape);
            break;
        case "Ledger":
            requiredHeaders = Object.keys(LedgerInputSchema.shape);
            break;
        case "CurrentLedgerBalance":
            requiredHeaders = Object.keys(CurrentLedgerBalanceInputSchema.shape);
            break;
        case "TodayAlgoPnl":
            requiredHeaders = Object.keys(TodayAlgoPnlInputSchema.shape);
            break;
        // Add more cases for other import types
        default:
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Unsupported import type",
            });
    }

    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Missing required headers: ${missingHeaders.join(", ")}`,
        });
    }
    return true;
};