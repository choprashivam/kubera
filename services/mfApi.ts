import { z } from "zod";

// Zod schema for API response validation
const apiResponseSchema = z.object({
    meta: z.object({
        fund_house: z.string(),
        scheme_type: z.string(),
        scheme_category: z.string(),
        scheme_code: z.number(),
        scheme_name: z.string(),
    }),
    data: z.array(z.object({
        date: z.string(),
        nav: z.string(),
    })),
    status: z.string(),
});

async function fetchMutualFundData(scripcode: string) {
    const mfData = await fetch(`${process.env.MFAPI_URL}/${scripcode}/latest`, {
        method: "GET",
    });

    if (!mfData.ok) {
        throw new Error(`Fetch Mutual Fund Data request failed: ${mfData.status} ${mfData.statusText}`);
    }

    const data: unknown = await mfData.json();
    const validatedData = apiResponseSchema.parse(data);

    if (validatedData.status !== "SUCCESS" || !validatedData.data[0]?.nav) {
        throw new Error('mfApi returned error');
    }

    return {
        nav: validatedData.data[0]?.nav,
        schema_code: validatedData.meta.scheme_code
    }
};

export default fetchMutualFundData;