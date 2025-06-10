import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc";

const GoogleSignIn = () => {
    const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await signIn('google', { callbackUrl: "/auth/multipleAccounts" });
        } catch (error) {
            console.error("Google sign-in failed:", error);
        }
    };

    return (
        <button
            onClick={handleGoogleSignIn}
            className="my-4 flex w-full items-center justify-center gap-3.5 rounded-lg border-2 border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-form-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50"
        >
            <FcGoogle size={28}/>
            Continue with Google
        </button>
    )
};

export default GoogleSignIn;