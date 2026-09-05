"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modules } from "@/data/curriculum";

export default function Sidebar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const activeModuleSlug = segments[0] ?? null;
  const activeLessonSlug = segments[1] ?? null;

  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <div className="sticky top-[72px] max-h-[calc(100vh-96px)] overflow-y-auto border-r border-zinc-200 pr-4 dark:border-zinc-800">
        <nav className="flex flex-col gap-1 p-4 pl-0 text-sm">
          <Link
            href="/"
            className={`rounded px-2 py-1.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
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
                  className={`rounded px-2 py-1.5 hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white ${
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
                          className={`rounded px-2 py-1 text-[13px] hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white ${
                            isLessonActive
                              ? "bg-zinc-100 font-medium text-black dark:bg-zinc-900 dark:text-white"
                              : "text-zinc-500 dark:text-zinc-500"
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
        </nav>
      </div>
    </aside>
  );
}
