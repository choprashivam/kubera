import "~/styles/globals.css";

export default function NondashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const currentYear = new Date().getFullYear();
    return (
        <>
            <div className="flex h-screen items-center justify-center">
                <main>
                    <div className="mx-auto max-w-screen-2xl p-4 2xl:p-10">
                        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                            {children}
                        </div>
                    </div>
                <footer className="mt-auto text-center text-xs">
                    © {currentYear} iFinStarts. All rights reserved.
                </footer>
                </main>
            </div>
        </>
    );
};