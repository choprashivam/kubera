import { signIn } from "next-auth/react";
import { FaFacebook } from "react-icons/fa";

const FacebookSignIn = () => {
    const handleFacebookSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await signIn('facebook', { callbackUrl: "/auth/multipleAccounts" });
        } catch (error) {
            console.error("Facebook sign-in failed:", error);
        }
    };

    return (
        <button
            onClick={handleFacebookSignIn}
            className="my-4 flex w-full items-center justify-center gap-3.5 rounded-lg border-2 border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-form-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50"
        >
            <FaFacebook size={28} color='#316FF6'/>
            Continue with Facebook
        </button>
    )
};

export default FacebookSignIn;