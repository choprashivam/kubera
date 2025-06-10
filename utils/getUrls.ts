export function getOGCompatibleBaseUrl() {
    if (typeof window !== "undefined") return ""; // browser should use relative url
    //console.log("VERCEL_PROJECT_PRODUCTION_URL", process.env.VERCEL_PROJECT_PRODUCTION_URL)
    //console.log("VERCEL_URL", process.env.VERCEL_URL)

    //if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}