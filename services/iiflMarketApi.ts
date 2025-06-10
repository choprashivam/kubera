import { z } from "zod";
import type { MarketDataResponse } from "~/types/iiflMarketDataSchema";

// Zod schemas for request body validation
const LoginRequestSchema = z.object({
    head: z.object({ UserKey: z.string() }),
    body: z.object({
        ClientCode: z.string(),
        Pwd: z.string(),
        DOB: z.string(),
    }),
});

const MarketFeedRequestSchema = z.object({
    head: z.object({
        requestCode: z.string(),
        appName: z.string(),
        appVer: z.string(),
        key: z.string(),
        osName: z.string(),
        userId: z.string(),
        password: z.string(),
    }),
    body: z.object({
        ClientCode: z.string(),
        MarketFeedData: z.array(z.object({
            Exch: z.string(),
            ExchType: z.string(),
            ScripCode: z.string(),
        })),
    }),
});

// Zod schema for API response validation
const ApiResponseSchema = z.object({
    body: z.object({
        CacheTime: z.number(),
        Data: z.array(z.any()),
        Message: z.string(),
        Status: z.number(),
        TimeStamp: z.string(),
    }),
    head: z.object({
        responseCode: z.string(),
        status: z.string(),
        statusDescription: z.string(),
    }),
});

// Define more specific types for market feed data
interface MarketFeedDataItem {
    Exch: string;
    ExchType: string;
    ScripCode: string;
}

/**
 * Fetches market data from IIFL API.
 * @param marketFeedDataArray An array of market feed data objects.
 * @returns Promise<MarketDataResponse[]> The market data.
 * @throws Error if any step in the process fails.
 */
export async function marketData(marketFeedDataArray: MarketFeedDataItem[]): Promise<MarketDataResponse[]> {
    try {
        // Step 1: Login
        const cookieValue = await login();

        // Step 2: Fetch Market Data
        const marketData = await fetchMarketFeed(cookieValue, marketFeedDataArray);

        return marketData;
    } catch (error) {
        console.error('Error in marketData:', error);
        throw new Error('Failed to fetch market data');
    }
};

/**
 * Performs login to IIFL API and returns the session cookie value.
 * @returns Promise<string> The session cookie value.
 * @throws Error if login fails or cookie extraction fails.
 */
async function login(): Promise<string> {
    const loginData = LoginRequestSchema.parse({
        head: { UserKey: process.env.IIFL_USER_KEY },
        body: {
            ClientCode: process.env.IIFL_LOGIN_CLIENT_CODE,
            Pwd: process.env.IIFL_LOGIN_PWD,
            DOB: process.env.IIFL_DOB,
        }
    });

    const response = await fetch(process.env.IIFL_LOGIN_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.IIFL_APIM_KEY!,
        },
        body: JSON.stringify(loginData),
    });

    if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const cookieValue = response.headers.get('set-cookie')
        ?.match(/IIFLMarcookie=(\S+);/)?.[1];

    if (!cookieValue) {
        throw new Error("Failed to extract cookie value");
    }

    return cookieValue;
};

/**
 * Fetches market feed data from IIFL API.
 * @param cookieValue The session cookie value obtained from login.
 * @param marketFeedDataArray An array of market feed data objects.
 * @returns Promise<MarketDataResponse[]> The market data.
 * @throws Error if the API request fails or returns an error status.
 */
async function fetchMarketFeed(cookieValue: string, marketFeedDataArray: MarketFeedDataItem[]): Promise<MarketDataResponse[]> {
    const marketFeedData = MarketFeedRequestSchema.parse({
        head: {
            requestCode: "IIFLMarRQMarketFeed",
            appName: process.env.IIFL_APP_NAME,
            appVer: process.env.IIFL_APP_VER,
            key: process.env.IIFL_USER_KEY,
            osName: process.env.IIFL_OS_NAME,
            userId: process.env.IIFL_USER_ID,
            password: process.env.IIFL_PASSWORD,
        },
        body: {
            ClientCode: process.env.IIFL_CLIENT_CODE,
            MarketFeedData: marketFeedDataArray,
        }
    });

    const response = await fetch(process.env.IIFL_MARKET_FEED_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `IIFLMarcookie=${cookieValue}`,
            'Ocp-Apim-Subscription-Key': process.env.IIFL_APIM_KEY!,
        },
        body: JSON.stringify(marketFeedData),
    });

    if (!response.ok) {
        throw new Error(`Market feed request failed: ${response.status} ${response.statusText}`);
    }

    const data: unknown = await response.json();
    const validatedData = ApiResponseSchema.parse(data);

    if (validatedData.body.Status !== 0) {
        throw new Error(`API returned error: ${validatedData.body.Message}`);
    }

    return validatedData.body.Data as MarketDataResponse[];
};