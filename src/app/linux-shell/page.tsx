import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "How to use this module and what you will be able to do.",
  "setup-terminal": "Distros, terminal, and WSL setup for hands-on practice.",
  "filesystem-navigation": "Filesystem layout and moving around with pwd, ls, cd.",
  "file-operations": "Create, copy, move, delete, and archive files.",
  "viewing-editing-search": "Read logs, edit files, and search with grep and pipes.",
  "permissions-users": "Users, groups, chmod, chown, and sudo.",
  "packages-services": "Install software and manage services with systemd.",
  "shell-scripting": "Variables, conditions, loops, and full scripts.",
  "cron-logs": "Scheduled jobs, system logs, and troubleshooting.",
  "ssh-remote-tools": "Connect to remote servers and transfer files.",
};

export default function Page() {
  const mod = getModule("linux-shell")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        Learn the terminal skills you will use on every EC2 instance, container,
        and CI job. Work through the lessons in order — each one builds on the
        previous.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/linux-shell/${l.slug}`}
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
          <li>Navigate, manage, and troubleshoot any Linux server</li>
          <li>Write shell scripts and schedule them with cron</li>
          <li>Connect to EC2 instances over SSH and transfer files</li>
          <li>Move to Module 03: Git &amp; GitHub</li>
        </ul>
        <Link
          href="/linux-shell/overview"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Start with Lesson 1 →
        </Link>
      </div>
    </div>
  );
}
