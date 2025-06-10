"use client"
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function HeaderSidebarLayout({
    children,
    isAdmin
}: {
    children: React.ReactNode;
    isAdmin: boolean;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <>
            <div className="flex h-screen overflow-hidden">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isAdmin={isAdmin}
                />
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <div className="block lg:hidden">
                        <Header
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                            isAdmin={isAdmin}
                        />
                    </div>
                    <main>
                        <div className="mx-auto max-w-screen-2xl">
                            <div className="h-screen p-4 md:p-6 2xl:p-10">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}