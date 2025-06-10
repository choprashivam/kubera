import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import MultiAccountChooser from "~/components/Authentication/MultiAccountChooser";
import { getSessionToken } from "~/utils/getSessionToken";
import { cookies } from "next/headers";
import { ADMIN_DOMAIN } from "~/constants";

const MultipleAccounts = async () => {
    const session = await getServerAuthSession();
    const email = session?.user.email;
    if (!email) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: `ERR-001: Request cannot be fulfilled as email cannot be retrieved from the session`,
        });
    }

    const sessionToken = getSessionToken(cookies().getAll());
    if (!sessionToken) {
        //redirect("/api/auth/signin");
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: `ERR-002: Session for ${email} has not been established`,
        });
    }

    const adminStatus = !!session.user.isAdmin;

    if (adminStatus && email.endsWith(ADMIN_DOMAIN)) {
        redirect("/home")
    } else {
        const accounts = await api.users.getUser({ email });
        if (accounts.length === 1 && !adminStatus) {
            const account = accounts[0];
            if (!account?.ifinId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "ERR-003: ifinId is missing for this account. Onboarding needs to be completed",
                });
            }
            await api.users.postSessionIfinId({
                sessionToken: sessionToken,
                ifinId: account.ifinId,
            });
            redirect("/home");
        } else if (accounts.length > 1 && !adminStatus) {
            return (
                <MultiAccountChooser accounts={accounts} sessionToken={sessionToken} />
            )
        }
    }
};

export default MultipleAccounts;