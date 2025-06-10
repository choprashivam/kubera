import { TRPCError } from "@trpc/server";
import type { createTRPCContext } from "~/server/api/trpc";
import { marketData } from "./iiflMarketApi";
import fetchMutualFundData from "./mfApi";

// Define the Context type based on your createTRPCContext function
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Service factory
const createScripsCmpUpdateFactory = (ctx: Context) => {
    // Service 1: Fetch all scrips of iifl service and mfApi service
    const getScrips = async () => {

        try {
            const [iiflServiceScrips, mfApiServiceScrips] = await Promise.all([
                ctx.db.scrips.findMany({
                    where: { service: "IIFL" },
                    select: { scripsId: true, scripcode: true, exchange: true, exchangeType: true },
                }),
                ctx.db.scrips.findMany({
                    where: { service: "MFAPI" },
                    select: { scripsId: true, scripcode: true },
                }),
            ]);

            return { iiflServiceScrips, mfApiServiceScrips };
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch scips data",
                cause: error,
            });
        }
    };

    // Service 2: Fetch market data of scrips and then update cmp
    const postCmp = async (input: {
        iiflServiceScrips: {
            scripsId: string;
            scripcode: string;
            exchange: "N" | "B" | "M";
            exchangeType: "C" | "D" | "U";
        }[];
        mfApiServiceScrips: {
            scripsId: string;
            scripcode: string;
        }[];
    }) => {
        const { iiflServiceScrips, mfApiServiceScrips } = input;

        try {
            const marketFeedDataArray = iiflServiceScrips.map(scrip => ({
                Exch: scrip.exchange,
                ExchType: scrip.exchangeType,
                ScripCode: scrip.scripcode,
            }));
            const data = await marketData(marketFeedDataArray);

            await Promise.all(data.map(item =>
                ctx.db.scrips.update({
                    where: {
                        likeScripcode: {
                            scripcode: item.Token.toString(),
                            service: "IIFL",
                        },
                    },
                    data: { cmp: item.LastRate },
                })
            ));

            const mfDataPromises = mfApiServiceScrips.map(item => fetchMutualFundData(item.scripcode));
            const mfDataResults = await Promise.all(mfDataPromises);

            await Promise.all(mfDataResults.map(mfData =>
                ctx.db.scrips.update({
                    where: {
                        likeScripcode: {
                            scripcode: mfData.schema_code.toString(),
                            service: "MFAPI",
                        },
                    },
                    data: { cmp: mfData.nav },
                })
            ));
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update scrips cmp",
                cause: error,
            });
        }
    };

    // Process Scrips CMP update
    const processScripsCmpUpdate = async () => {
        try {
            // Step 1: Fetch all scrips
            const { iiflServiceScrips, mfApiServiceScrips } = await getScrips();

            // Step 2: Fetch market data of scrips and then update cmp
            await postCmp({ iiflServiceScrips, mfApiServiceScrips });

            return { success: true, message: "Scrips CMP update processed successfully" }
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process scrips CMP update",
                cause: error,
            });
        }
    };

    return {
        getScrips,
        postCmp,
        processScripsCmpUpdate,
    };
};

export const scripsCmpUpdateFactory = createScripsCmpUpdateFactory;