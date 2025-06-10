import { getServerAuthSession } from "~/server/auth";
import HomePage from "../../../components/Dashboard/HomePage";

export default async function Home() {
  const session = await getServerAuthSession();
  return <HomePage initialSession={session} />;
};