import { signIn } from "next-auth/react";
import { FaXTwitter } from "react-icons/fa6";

const XSignIn = () => {
    const handleTwitterSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await signIn('twitter', { callbackUrl: "/auth/multipleAccounts" });
        } catch (error) {
            console.error("X sign-in failed:", error);
        }
    };

    return (
        <button
            onClick={handleTwitterSignIn}
            className="my-4 flex w-full items-center justify-center gap-3.5 rounded-lg border-2 border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-form-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50"
        >
            <FaXTwitter size={28}/>
            Continue with X
        </button>
    );
};

export default XSignIn;