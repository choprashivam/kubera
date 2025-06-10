import { signIn } from "next-auth/react";
import { FaLinkedin } from "react-icons/fa";

const LinkedInSignIn = () => {
    const handleLinkedInSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await signIn('linkedin', { callbackUrl: "/auth/multipleAccounts" });
        } catch (error) {
            console.error("LinkedIn sign-in failed:", error);
        }
    };

    return (
        <button
            onClick={handleLinkedInSignIn}
            className="my-4 flex w-full items-center justify-center gap-3.5 rounded-lg border-2 border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-form-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50"
        >
            <FaLinkedin size={28} color="#0077B5"/>
            Continue with LinkedIn
        </button>
    );
};

export default LinkedInSignIn;