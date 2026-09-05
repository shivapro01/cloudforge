import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Shell from "@/components/Shell";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "CloudForge — AWS DevOps Academy",
  description:
    "Go from zero to AWS DevOps pro with hands-on labs, real architectures, and cost-safe Free Tier guides.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-white text-zinc-950 antialiased dark:bg-black dark:text-zinc-50">
        <Navbar />
        <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
          <Shell>{children}</Shell>
        </div>
        <Footer />
      </body>
    </html>
  );
}
