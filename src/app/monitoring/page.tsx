import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "How to use this module and reliability basics.",
  "metrics-dashboards": "Metrics, alarms, and dashboards in depth.",
  "centralized-logging": "Aggregate and search logs across services.",
  "prometheus-grafana": "Open-source metrics and visualization.",
  "sre-practices": "SLOs, high availability, and disaster recovery.",
};

export default function Page() {
  const mod = getModule("monitoring")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        Keep production healthy — collect signals, alert on what matters, and
        design for failure.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/monitoring/${l.slug}`}
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
          <li>Build a dashboard with alarms for a real workload</li>
          <li>Query centralized logs to troubleshoot across services</li>
          <li>Define an SLO with an error budget for a service</li>
          <li>
            Move to Module 10: Security (DevSecOps) —{" "}
            <Link href="/security" className="underline underline-offset-4">
              /security
            </Link>
          </li>
        </ul>
        <Link
          href="/monitoring/overview"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Start with Lesson 1 →
        </Link>
      </div>
    </div>
  );
}
