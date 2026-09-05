import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "Why IaC, declarative vs imperative, and tool choices.",
  "terraform-setup": "Install Terraform and deploy your first resource.",
  "terraform-resources": "Providers, resources, and data sources.",
  "terraform-state": "State files and S3 remote backends with locking.",
  "terraform-variables": "Inputs, outputs, and tfvars per environment.",
  "terraform-modules": "Reusable modules and clean project layout.",
  "terraform-aws-lab": "Guided VPC + EC2 build and teardown.",
  cloudformation: "Read stacks and templates when you meet them.",
  "cdk-ssm-secrets": "CDK intro plus parameters and secrets.",
};

export default function Page() {
  const mod = getModule("iac-terraform")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        Stop clicking the console — define AWS in code, review it like code,
        and deploy it repeatedly. Terraform first, CloudFormation to read, CDK
        and secrets to round out.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/iac-terraform/${l.slug}`}
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
          <li>Define and deploy AWS resources with Terraform</li>
          <li>Manage state, variables, and reusable modules</li>
          <li>Read CloudFormation stacks and store secrets safely</li>
          <li>Move to Module 06: CI / CD on AWS</li>
        </ul>
        <Link
          href="/iac-terraform/overview"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Start with Lesson 1 →
        </Link>
      </div>
    </div>
  );
}
