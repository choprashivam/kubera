import { getProviders } from "next-auth/react";
import SignInClient from "~/components/Authentication/SignInClient";

const SigninPage: React.FC = async () => {
    const providers = await getProviders();
    return (
        <SignInClient providers={providers} />
    );
};

export default SigninPage;