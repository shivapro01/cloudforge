import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "How to use this module and the CI/CD big picture.",
  "github-actions": "Workflows, jobs, and runners for every push.",
  "aws-code-services": "Native AWS build and deploy services.",
  "ecr-build-push": "Dockerize apps and store images in ECR.",
  "deployment-strategies": "Rolling, blue/green, and canary releases.",
  "pipeline-lab": "Guided end-to-end pipeline build.",
};

export default function Page() {
  const mod = getModule("cicd")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        Automate build, test, and deploy so every push ships safely. GitHub
        Actions first, AWS code services next.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/cicd/${l.slug}`}
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
          <li>Run a GitHub Actions workflow on every push</li>
          <li>Push a Docker image to ECR</li>
          <li>Describe rolling, blue/green, and canary deployment strategies</li>
          <li>Move to Module 07: Containers &amp; Orchestration</li>
        </ul>
        <Link
          href="/cicd/overview"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Start with Lesson 1 →
        </Link>{" "}
        <Link
          href="/containers"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Next: Containers &amp; Orchestration →
        </Link>
      </div>
    </div>
  );
}
