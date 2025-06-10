import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionToken } from "./utils/getSessionToken";

export async function middleware(request: NextRequest) {
    // Handle root path redirect first
    if (request.nextUrl.pathname === "/") {
        const homeUrl = new URL("/home", request.url);
        return NextResponse.redirect(homeUrl, {
            status: 307, // Temporary redirect
            headers: {
                "Cache-Control": "no-store, max-age=0",
                "x-middleware-cache": "no-cache",
            },
        });
    }

    //Get all cookies
    const rcArray = request.cookies.getAll();
    // Check for session token
    const sessionToken = getSessionToken(rcArray);

    console.log("Middleware Check, session token = ", sessionToken, " at ", request.url)
    if (!sessionToken && !request.nextUrl.pathname.startsWith("/api/auth")) {
        // Redirect to signin page
        const signInUrl = new URL("/api/auth/signin", request.url);
        return NextResponse.redirect(signInUrl, {
            status: 307, // Temporary redirect
            headers: {
                "Cache-Control": "no-store, max-age=0",
                "x-middleware-cache": "no-cache",
            },
        });
    }

    // Allow the request to continue
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("x-middleware-cache", "no-cache");
    return response;
}

export const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - api/ (All APIs route)
     * - auth/signin (sign-in route)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (images folder)
     */
        "/((?!api/|auth/signin|_next/static|_next/image|images|favicon.ico|manifest.json|privacy|terms|.*\\.(?:svg|png|jpg|jpeg|gif|webp|xml)$).*)",
    ],
};