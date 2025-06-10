import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export function getSessionToken(rcArray: RequestCookie[]): string | undefined {
    let secureToken: string | undefined;

    for (const cookie of rcArray) {
        if (cookie.name === '__Secure-next-auth.session-token') {
            return cookie.value; // Prefer secure token and return immediately if found
        } else if (cookie.name === 'next-auth.session-token') {
            secureToken = cookie.value; // Store non-secure token, but keep looking for secure one
        }
    }

    return secureToken; // Return non-secure token if no secure token was found
};