"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "@/components/MobileNav";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 tracking-tight">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-black text-white">
            F
          </span>
          <span className="truncate font-semibold">
            CloudForge
            <span className="ml-2 hidden rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] font-normal text-zinc-500 sm:inline dark:border-zinc-800">
              AWS DevOps Academy
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-4 text-sm text-zinc-600 md:flex dark:text-zinc-400">
          <Link href="/" className="hover:text-black dark:hover:text-white">
            Learn
          </Link>
          <Link href="/projects" className="hover:text-black dark:hover:text-white">
            Projects
          </Link>
          <Link href="/certifications" className="hover:text-black dark:hover:text-white">
            Path
          </Link>
          <Link
            href="/prerequisites"
            className="rounded-full bg-zinc-950 px-4 py-1.5 font-medium whitespace-nowrap text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Start free
          </Link>
        </nav>

        {/* Mobile: compact links + Start on home, hamburger only on lesson pages */}
        <div className="flex items-center gap-2 md:hidden">
          {isHome ? (
            <>
              <nav className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Link href="/projects" className="hover:text-black dark:hover:text-white">
                  Projects
                </Link>
                <Link href="/certifications" className="hover:text-black dark:hover:text-white">
                  Path
                </Link>
              </nav>
              <Link
                href="/prerequisites"
                className="rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Start free
              </Link>
            </>
          ) : (
            <MobileNav />
          )}
        </div>
      </div>
    </header>
  );
}
