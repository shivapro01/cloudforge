import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "Shared responsibility and the module path.",
  "identity-access": "MFA, roles, SCPs, and least privilege.",
  "data-protection": "KMS encryption and secrets handling.",
  "network-security": "WAF, Shield, and private networking.",
  "detection-response": "Find threats with GuardDuty and friends.",
  "devsecops-pipeline": "tfsec, image scans, and policy gates.",
};

export default function Page() {
  const mod = getModule("security")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        Ship fast without getting breached — harden identity, data, network,
        and scan in CI.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/security/${l.slug}`}
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
          <li>Enforce MFA and least-privilege access with roles and SCPs</li>
          <li>Encrypt data with KMS and rotate secrets safely</li>
          <li>Add a security scan gate to a CI pipeline</li>
          <li>
            Move to Module 11: Practical Projects —{" "}
            <Link href="/projects" className="underline underline-offset-4">
              /projects
            </Link>
          </li>
        </ul>
        <Link
          href="/security/overview"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Start with Lesson 1 →
        </Link>
      </div>
    </div>
  );
}
