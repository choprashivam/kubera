import type { BuiltInProviderType } from "next-auth/providers/index";
import type { ClientSafeProvider, LiteralUnion } from "next-auth/react";

// Interface definition
export interface SignInClientProps {
    providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null;
}