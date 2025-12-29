import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import Home from "./(unauthenticated)/home/page";

export const metadata: Metadata = {
  title: "Zynthex | AI Automation for Crypto Payments",
  description:
    "Automate your crypto payment workflows with AI. Monitor Solana wallets, process transactions with AI, and trigger actions automatically.",
};

const Index = async () => {
  const user = await currentUser();

  if (!user) {
    return <Home />;
  }

  redirect("/workflows");
};

export default Index;


