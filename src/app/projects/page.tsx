import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "How to work the projects and show them off.",
  "static-site": "Static Site on S3",
  "two-tier-app": "Two-Tier App with Terraform",
  "ecs-pipeline": "ECS App with Pipeline",
  "serverless-api": "Serverless API",
};

export default function Page() {
  const mod = getModule("projects")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        Prove it — four builds that combine Linux, Git, AWS, Terraform, and
        pipelines.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/projects/${l.slug}`}
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
          <li>Deploy all four portfolio projects end to end on AWS</li>
          <li>Publish GitHub repos with READMEs, diagrams, and cleanup steps</li>
          <li>
            Move to Module 12: Certifications &amp; Path —{" "}
            <Link href="/certifications" className="underline underline-offset-4">
              /certifications
            </Link>
          </li>
        </ul>
        <Link
          href="/projects/overview"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Start with Lesson 1 →
        </Link>
      </div>
    </div>
  );
}
