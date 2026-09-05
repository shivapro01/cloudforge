import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Certifications & Path"
      title="Solutions Architect Associate"
      intro="The Solutions Architect Associate (SAA-C03) is the most valuable single AWS cert for DevOps engineers: it teaches design judgment — resilient, high-performing, secure, cost-optimized systems — that every pipeline, Terraform module, and incident decision downstream depends on. Expect scenario questions, not trivia: given constraints, pick the best architecture."
      prev={{ href: "/certifications/cloud-practitioner", label: "Cloud Practitioner" }}
      next={{ href: "/certifications/developer-sysops", label: "Developer + SysOps Associate" }}
      resources={[
        {
          title: "AWS Certification — Solutions Architect Associate exam guide",
          url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
          description:
            "Official SAA-C03 exam guide with domain weights, sample scenario questions, and booking.",
        },
        {
          title: "AWS Documentation — Well-Architected Framework",
          url: "https://docs.aws.amazon.com/well-architected/latest/framework/welcome.html",
          description:
            "The design vocabulary the exam rewards: the five pillars behind nearly every correct answer.",
        },
        {
          title: "freeCodeCamp — AWS Solutions Architect full course",
          url: "https://www.freecodecamp.org/news/tag/aws/",
          description:
            "Free long-form video walkthroughs of SAA topics with hands-on demos you can follow along.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Exam domains: the four design lenses</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          SAA-C03 has 65 questions in 130 minutes, and every domain is a design lens you hold up
          to a scenario. Resilient architectures dominate the exam — multi-AZ, failover, and
          decoupling appear constantly — with high-performing, secure, and cost-optimized designs
          splitting the rest.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 font-semibold">Domain</th>
                <th className="p-3 font-semibold">Weight</th>
                <th className="p-3 font-semibold">Core question shape</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Resilient architectures</td>
                <td className="p-3">30%</td>
                <td className="p-3">Survive AZ failure, decouple tiers, design backup/recovery</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">High-performing architectures</td>
                <td className="p-3">28%</td>
                <td className="p-3">Right compute/storage, caching, scaling under load</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Secure architectures</td>
                <td className="p-3">24%</td>
                <td className="p-3">Least privilege, encryption, network isolation</td>
              </tr>
              <tr>
                <td className="p-3">Cost-optimized architectures</td>
                <td className="p-3">18%</td>
                <td className="p-3">Cheapest service that meets constraints, lifecycle rules</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Design patterns the exam loves</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Three patterns answer a large share of SAA questions. <strong>Multi-AZ by
          default:</strong> RDS with standby, ALB across subnets, Auto Scaling across zones —
          anything single-AZ is wrong unless cost constraints explicitly force it.{" "}
          <strong>Decouple with queues:</strong> SQS between tiers absorbs spikes and failures so
          no component blocks another. <strong>Cache at the edge and the database:</strong>{" "}
          CloudFront for static content, ElastiCache or DAX for hot reads — the exam constantly
          rewards removing load instead of adding servers.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Three worked mini-scenarios</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Read each scenario, commit to an answer, then check the reasoning — this
          decide-then-verify loop is exactly how the exam feels.
        </p>
        <ul className="mt-2 flex flex-col gap-3 text-zinc-700 dark:text-zinc-300">
          <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <strong>1. Web app must survive an AZ outage.</strong> A single EC2 + single-AZ RDS
            serves a regional storefront; the requirement is zero manual failover. Answer: ALB
            across two public subnets, Auto Scaling group spanning two AZs, RDS Multi-AZ with
            standby. Why: the load balancer plus multi-AZ data tier removes every single point of
            failure the scenario names.
          </li>
          <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <strong>2. Order spikes overwhelm the backend each sale.</strong> Direct API calls from
            web to workers time out under bursts. Answer: SQS queue between web and worker fleet
            with Auto Scaling on queue depth. Why: the queue buffers bursts and lets workers scale
            on backlog instead of dropping requests — decoupling beats overprovisioning.
          </li>
          <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <strong>3. Global users complain about slow images; database reads are hot.</strong>{" "}
            Static assets served from one region, repeated identical queries hit RDS. Answer:
            CloudFront distribution for assets plus ElastiCache in front of RDS. Why: edge caching
            kills latency for static content while the database cache removes repetitive load —
            the exam&apos;s two favorite caching moves in one scenario.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How this maps to Modules 04–05 and your projects</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The AWS Fundamentals module (compute, storage, databases, networking) is your
          high-performance and resilience syllabus; the Security module is your secure-designs
          syllabus. The two-tier app project is the SAA exam made concrete — ALB, multi-AZ
          instances, managed database — so build it slowly enough to explain every choice, because
          &quot;why this over that?&quot; is both the exam format and the interview format.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Your 6-week schedule</h2>
        <div className="mt-3">
          <CodeBlock
            label="Schedule"
            code={`Weeks 1-2 — Compute/storage/network breadth
  EC2/ASG/ELB + EBS/EFS/S3 tiers + VPC subnets/NAT/gateways; 1 Console lab per service

Weeks 3-4 — Databases, decoupling, caching
  RDS Multi-AZ/read replicas vs DynamoDB vs Aurora; SQS/SNS/EventBridge; CloudFront + ElastiCache

Week 5 — Security + cost lenses
  IAM policies/roles, KMS encryption, SG vs NACL; lifecycle rules, S3 tiers, RI vs Savings Plans

Week 6 — Mocks to booking
  3+ timed mocks (130 min); re-study weakest domain between each; book at 80%+ twice in a row`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Classic mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Picking single-AZ answers under pressure:</strong> when two options both work,
            the multi-AZ one is correct unless the question explicitly says minimize cost.
          </li>
          <li>
            <strong>Overprovisioning instead of caching or queuing:</strong> bigger instances are
            rarely the exam&apos;s answer — look for the CloudFront, ElastiCache, or SQS option
            first.
          </li>
          <li>
            <strong>Studying services, not trade-offs:</strong> flashcards of service features
            stall around 60% — scenario drills (like the three above) are what push you past 80%.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tasks (6)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the multi-AZ two-tier architecture from memory: ALB, ASG, RDS standby, subnets.</li>
          <li>Write the decoupling rule in your own words: when does SQS beat calling the worker directly?</li>
          <li>Do 20 scenario questions untimed, tagging each miss with one of the four domains.</li>
          <li>Build or review the two-tier app project and justify each component choice aloud.</li>
          <li>Take two timed 130-minute mocks and re-study only the weakest domain between them.</li>
          <li>Book SAA-C03 once you clear 80%+ twice, applying your Practitioner 50% voucher.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
