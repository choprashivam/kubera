import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import Papa from "papaparse";
import { processScripsData } from "~/services/scripsDataEntry";
import { validateAndTransformData } from "~/utils/csvValidation/outputDataTransformation";
import { validateHeaders } from "~/utils/csvValidation/inputDataValidation";
import { processUserCrmData } from "~/services/userCrmDataEntry";
import { holdingsTrxDataEntryFactory } from "~/services/holdingsTrxDataEntry";
import { realisedPnlDataEntryFactory } from "~/services/realisedPnlDataEntry";
import { ledgerDataEntryFactory } from "~/services/ledgerDataEntry";
import { currentLedgerBalanceaDataEntryFactory } from "~/services/currentLedgerBalanceDataEntry";
import { todayAlgoPnlDataEntryFactory } from "~/services/todayAlgoPnlDataEntry";


// Define Zod schema for input validation
const ParamsSchema = z.object({
    csvContent: z.string(),
    importType: z.string(), // Add more import types as needed
});

export const fileImportRouter = createTRPCRouter({
    parseCsv: protectedProcedure
        .input(ParamsSchema)
        .mutation(async ({ ctx, input }) => {
            const { csvContent, importType } = input;

            // Parse CSV
            const parsedCSV = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

            if (parsedCSV.errors.length > 0) {
                const errorMessage = parsedCSV.errors[0]?.message ?? "Unknown parsing error";
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Error parsing CSV: " + errorMessage,
                });
            }

            const headers = parsedCSV.meta.fields;
            if (!headers) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "CSV file has no headers",
                });
            }

            // Validate headers based on import type
            validateHeaders(importType, headers); //This will throw TRPC error if csv is malformed

            // Validate and transform data based on import type
            const validatedData = validateAndTransformData(importType, parsedCSV.data, headers);

            // Process the validated data based on the import type
            let result;
            switch (importType) {
                case "Scrips":
                    result = await processScripsData(ctx, validatedData);
                    break;
                case "UserCrm":
                    result = await processUserCrmData(ctx, validatedData);
                    break;
                case "HoldingsTrx":
                    const holdingsTrxServices = holdingsTrxDataEntryFactory(ctx);
                    result = await holdingsTrxServices.processHoldingsTrxData(validatedData);
                    break;
                case "RealisedPnl":
                    const realisedPnlServices = realisedPnlDataEntryFactory(ctx);
                    result = await realisedPnlServices.processRealisedPnlData(validatedData);
                    break;
                case "Ledger":
                    const ledgerServices = ledgerDataEntryFactory(ctx);
                    result = await ledgerServices.processLedgerData(validatedData);
                    break;
                case "CurrentLedgerBalance":
                    const currentLedgerBalanceServices = currentLedgerBalanceaDataEntryFactory(ctx);
                    result = await currentLedgerBalanceServices.processCurrentLedgerBalanceData(validatedData);
                    break;
                case "TodayAlgoPnl":
                    const todayAlgoPnlServices = todayAlgoPnlDataEntryFactory(ctx);
                    result = await todayAlgoPnlServices.processTodayAlgoPnlData(validatedData);
                    break;
                // Add more cases for other import types
                default:
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Unsupported import type",
                    });
            }

            return result;
        }),
});