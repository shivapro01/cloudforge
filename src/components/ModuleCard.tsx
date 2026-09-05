import Link from "next/link";
import type { Module } from "@/data/curriculum";

export default function ModuleCard({ module }: { module: Module }) {
  return (
    <Link
      href={`/${module.slug}`}
      className="rounded-xl border border-zinc-200 p-5 transition hover:border-black dark:border-zinc-800 dark:hover:border-white"
    >
      <div className="text-xs text-zinc-500">{module.number}</div>
      <h2 className="mt-1 font-semibold">{module.title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{module.lessons.length} lessons</p>
    </Link>
  );
}
