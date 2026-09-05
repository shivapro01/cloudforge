import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "How to use this module and what you will be able to do.",
  "setup-config": "Install Git, set identity, and connect to GitHub.",
  "add-commit-push": "Stage changes, write commits, and push to GitHub.",
  "branching-merging": "Isolate work in branches and merge it back.",
  "remotes-clone-pull": "Clone repos and sync with remotes.",
  "pull-requests": "Propose changes and review them on GitHub.",
  "undo-fix": "Recover from bad commits and merge conflicts.",
  "stash-rebase-gitignore": "Save work in progress and keep history clean.",
  "workflows-devops": "Branching strategies used in CI/CD pipelines.",
};

export default function Page() {
  const mod = getModule("git-github")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        Track every change, collaborate with confidence, and ship safely. Work
        through the lessons in order — each one builds on the previous.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/git-github/${l.slug}`}
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
          <li>Version files with Git and push them to GitHub</li>
          <li>Branch, merge, and review pull requests</li>
          <li>Recover from mistakes and keep history clean</li>
          <li>Move to Module 04: AWS Core Fundamentals</li>
        </ul>
        <Link
          href="/git-github/overview"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Start with Lesson 1 →
        </Link>
      </div>
    </div>
  );
}
