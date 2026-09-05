"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { modules } from "@/data/curriculum";

function DrawerNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const activeModuleSlug = segments[0] ?? null;
  const activeLessonSlug = segments[1] ?? null;

  return (
    <nav className="flex flex-col gap-1 p-4 text-sm">
      <Link
        href="/"
        onClick={onNavigate}
        className={`rounded px-2 py-2 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
          pathname === "/" ? "bg-zinc-100 dark:bg-zinc-900" : ""
        }`}
      >
        Dashboard
      </Link>
      {modules.map((m) => {
        const isActive = activeModuleSlug === m.slug;
        return (
          <div key={m.slug}>
            <Link
              href={`/${m.slug}`}
              onClick={onNavigate}
              className={`block rounded px-2 py-2 hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white ${
                isActive
                  ? "bg-zinc-100 font-medium text-black dark:bg-zinc-900 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span className="mr-2 text-xs text-zinc-400">{m.number}</span>
              {m.title}
            </Link>
            {isActive ? (
              <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-800">
                {m.lessons.map((l) => {
                  const href = `/${m.slug}/${l.slug}`;
                  const isLessonActive =
                    activeLessonSlug === l.slug ||
                    (activeLessonSlug == null && l.slug === "overview");
                  return (
                    <Link
                      key={l.slug}
                      href={href}
                      onClick={onNavigate}
                      className={`rounded px-2 py-1.5 text-[13px] hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white ${
                        isLessonActive
                          ? "bg-zinc-100 font-medium text-black dark:bg-zinc-900 dark:text-white"
                          : "text-zinc-500"
                      }`}
                    >
                      {l.title}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
      <Link
        href="/prerequisites"
        onClick={onNavigate}
        className="mt-3 rounded-full bg-zinc-950 px-4 py-2.5 text-center font-medium text-white dark:bg-white dark:text-black"
      >
        Start learning free
      </Link>
    </nav>
  );
}

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-black">
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-black text-white">
                      F
                    </span>
                    CloudForge
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close navigation menu"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <DrawerNav onNavigate={() => setOpen(false)} />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
