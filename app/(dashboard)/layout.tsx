import "~/styles/globals.css";
import React from "react";
import { getServerAuthSession } from "~/server/auth";
import HeaderSidebarLayout from "~/components/HeaderSidebarLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  const adminStatus = session?.user.isAdmin ?? false;

  return <HeaderSidebarLayout isAdmin={adminStatus}>{children}</HeaderSidebarLayout>;
}