import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "When to use each automation tool.",
  ansible: "Agentless config with playbooks.",
  "systems-manager": "Patch, run commands, and store params.",
  "lambda-automation": "Event-driven serverless automation.",
  boto3: "Script AWS with Python.",
};

export default function Page() {
  const mod = getModule("automation")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        Stop doing it by hand — configure fleets and trigger AWS actions with
        code.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/automation/${l.slug}`}
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
          <li>Write an Ansible playbook to configure a server</li>
          <li>Run a command across a fleet with Systems Manager</li>
          <li>Trigger a Lambda function for event-driven automation</li>
          <li>Move to Module 09: Monitoring &amp; Reliability</li>
        </ul>
        <Link
          href="/automation/overview"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Start with Lesson 1 →
        </Link>{" "}
        <Link
          href="/monitoring"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Next: Monitoring &amp; Reliability →
        </Link>
      </div>
    </div>
  );
}
