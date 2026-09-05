import Link from "next/link";
import { getModule } from "@/data/curriculum";

const descriptions: Record<string, string> = {
  overview: "Account setup, Regions, Free Tier, and cost guardrails.",
  "aws-cli": "Install and authenticate the CLI you will use daily.",
  iam: "Users, roles, and policies with least privilege.",
  vpc: "Networks, subnets, gateways, and security groups.",
  ec2: "Virtual servers, AMIs, key pairs, and EBS volumes.",
  "elb-auto-scaling": "Distribute traffic and scale with demand.",
  s3: "Object storage, versioning, and lifecycle rules.",
  "cloudfront-acm": "CDN delivery and free TLS certificates.",
  route53: "DNS zones, records, and routing.",
  databases: "Managed relational, NoSQL, and caching.",
  "lambda-basics": "Serverless functions and HTTP front doors.",
  "cloudwatch-cloudtrail": "Metrics, logs, alarms, and audit trails.",
  "sns-sqs": "Notifications, queues, and event buses.",
};

export default function Page() {
  const mod = getModule("aws-fundamentals")!;
  return (
    <div>
      <p className="text-sm text-zinc-500">Module {mod.number}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.tagline}</p>

      <p className="mt-4 text-sm leading-7">
        Core AWS building blocks every DevOps engineer uses daily. Work through
        in order — network before compute, compute before deploy.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mod.lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/aws-fundamentals/${l.slug}`}
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
          <li>Secure accounts with IAM and control costs with guardrails</li>
          <li>Build networks, servers, storage, and DNS on AWS</li>
          <li>Observe workloads and wire events with queues and notifications</li>
          <li>Move to Module 05: Infrastructure as Code</li>
        </ul>
        <Link
          href="/aws-fundamentals/overview"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Start with Lesson 1 →
        </Link>
      </div>
    </div>
  );
}
