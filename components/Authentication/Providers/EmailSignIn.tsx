"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlineMail } from "react-icons/ai";


const EmailSignIn = () => {
    const [email, setEmail] = useState("");
    const router = useRouter();

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        await signIn("email", { email, callbackUrl: "/auth/multipleAccounts" });
        router.push("/api/auth/verify-request")
        console.log(`Email Signin result for ${email}`)
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    return (
        <div className=''>
            <form onSubmit={handleEmailSignIn}>
                <div className="my-4 flex w-full items-center justify-center gap-3.5">
                    <div className="flex-grow border-t border-stroke dark:border-form-strokedark"></div>
                    <span className="px-4 text-graydark dark:text-white">OR</span>
                    <div className="flex-grow border-t border-stroke dark:border-form-strokedark"></div>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-2 border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none hover:border-primary hover:border-opacity-50 focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:hover:bg-opacity-50 dark:focus:border-primary"
                        />

                        <span className="absolute right-20 top-4">
                            <AiOutlineMail size={28} />
                        </span>
                        <span className="absolute right-0 top-0 h-full p-0.5">
                            <button
                                type="submit"
                                className="h-full rounded-r bg-gray px-4 hover:bg-opacity-50 dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-50"
                            >
                                →
                            </button>
                        </span>
                    </div>
                </div>
                <div className="pt-2">
                    <label className="w-full py-2 text-center text-sm sm:w-1/2 lg:w-2/3">
                        * Use any of the above Authentication service having email id
                        same as your IIFL account
                    </label>
                </div>
            </form>
        </div>
    )
};

export default EmailSignIn;