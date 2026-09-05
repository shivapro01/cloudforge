"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return <main className="min-w-0 flex-1">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </>
  );
}
