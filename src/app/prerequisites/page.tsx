import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "How to use this module, who it is for, and completion checklist.",
  "computer-basics":
    "OS, filesystems, permissions, processes, and package managers.",
  "networking-basics": "IP, DNS, HTTP/HTTPS, ports, firewalls, and VPNs.",
  "python-basics": "Python fundamentals for automation: syntax, files, and APIs.",
};

export default function Page() {
  const mod = getModule("prerequisites")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        This module prepares a complete beginner for Linux, AWS, and DevOps
        tooling. Complete the lessons in order. Each lesson contains key
        concepts, hands-on practice, and curated free resources.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/prerequisites/${l.slug}`}
            className="rounded-xl border border-zinc-200 p-5 transition hover:border-black dark:border-zinc-800 dark:hover:border-white"
          >
            <div className="text-xs text-zinc-500">Lesson {i + 1}</div>
            <h2 className="mt-1 font-semibold">{l.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {descriptions[l.slug] ?? ""}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 p-5 text-sm leading-7 dark:border-zinc-800">
        <h2 className="font-semibold">After this module you can</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Explain OS, files, users, and processes</li>
          <li>Explain IP addresses, DNS, HTTP, and common ports</li>
          <li>Write and run basic Python scripts for automation</li>
          <li>Move to Module 02: Linux &amp; Shell</li>
        </ul>
        <Link
          href="/linux-shell"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Next: Linux &amp; Shell →
        </Link>
      </div>
    </div>
  );
}
