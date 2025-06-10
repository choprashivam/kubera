"use client";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { IoWarning } from "react-icons/io5";
import { GiDuality } from "react-icons/gi";


interface Account {
    client: string;
    brokerId: string;
    ifinId: string;
}
interface MultiAccountChooserProps {
    accounts: Account[];

    sessionToken: string;
}

const MultiAccountChooser: React.FC<MultiAccountChooserProps> = ({ accounts, sessionToken }) => {
    const router = useRouter();
    const postSessionIfinId = api.users.postSessionIfinId.useMutation();

    const handleAccountSelection = async (ifinId: string) => {
        try {
            await postSessionIfinId.mutateAsync({
                sessionToken,
                ifinId,
            });

            router.push("/home");
        } catch (error) {
            console.error("Error selecting account:", error);
        }
    };

    return (
        <div className="flex flex-wrap items-center">
            <div className="hidden w-full xl:block xl:w-1/2">
                <div className="flex flex-col items-center justify-center px-26 py-17.5">
                    <IoWarning size={150} color="#ec942c" />
                    <p className="mt-5 mb-5 xl:text-2xl sm:text-lg font-bold text-center">
                        Multiple Accounts detected with this email id!
                    </p>

                    <span className="mt-15 mb-15 inline-block">
                        <GiDuality size={150} color="#3056D3" />
                    </span>
                </div>
            </div>

            <div className="w-full border-stroke  dark:border-strokedark xl:w-1/2 xl:border-l-2">
                <div className="w-full p-4 sm:p-12.5 xl:p-17.5">

                    <div className="mb-10 flex flex-col items-center justify-center text-center font-extrabold xl:hidden">
                        <IoWarning size={180} color="#ec942c" />
                        <h1>Multiple Accounts detected with this email id!</h1>
                    </div>
                    <p className="text-center font-bold xl:text-2xl sm:text-lg pt-5 pb-5">
                        Select an account to proceed
                    </p>

                    {accounts.map((account) => (
                        <button
                            key={account.ifinId}
                            className="my-4 flex w-full items-center justify-center gap-3.5 rounded-lg border-2 border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-form-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50"
                            onClick={() => handleAccountSelection(account.ifinId)}
                        >
                            {account.client} - {account.brokerId}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default MultiAccountChooser;