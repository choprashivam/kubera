import "~/styles/globals.css";
import React from "react";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import HeaderSidebarLayout from "~/components/HeaderSidebarLayout";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerAuthSession();
    const adminStatus = session?.user.isAdmin ?? false;

    if (adminStatus === false) {
        redirect("/home")
    }

    return <HeaderSidebarLayout isAdmin={adminStatus}>{children}</HeaderSidebarLayout>;
}