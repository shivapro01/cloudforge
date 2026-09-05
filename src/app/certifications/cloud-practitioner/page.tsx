import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Certifications & Path"
      title="Cloud Practitioner"
      intro="The Cloud Practitioner (CLF-C02) is your vocabulary exam: cloud concepts, billing, support, and which AWS service solves which problem at a high level. It is the cheapest, shortest cert — and the highest-leverage first step, because every later exam assumes you already speak this language. Two focused weeks alongside the AWS Fundamentals module is enough."
      prev={{ href: "/certifications/overview", label: "Start Here" }}
      next={{ href: "/certifications/solutions-architect", label: "Solutions Architect Associate" }}
      resources={[
        {
          title: "AWS Certification — Cloud Practitioner exam guide",
          url: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
          description:
            "Official exam guide with domain weights, sample questions, and booking details for CLF-C02.",
        },
        {
          title: "AWS Skill Builder — Cloud Practitioner prep",
          url: "https://skillbuilder.aws/",
          description:
            "Free official learning plan and practice-question set built specifically for this exam.",
        },
        {
          title: "AWS Documentation — billing and support overviews",
          url: "https://docs.aws.amazon.com/",
          description:
            "Read the pricing, support-plan, and shared-responsibility docs directly — they are exam source material.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Exam domains and weights</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Four domains, 65 questions, 90 minutes, pass around 700/1000. The weights tell you where
          to spend time: billing and support together outweigh pure technology recall, which
          surprises engineers who study only services.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 font-semibold">Domain</th>
                <th className="p-3 font-semibold">Weight</th>
                <th className="p-3 font-semibold">What it tests</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Cloud Concepts</td>
                <td className="p-3">24%</td>
                <td className="p-3">Benefits, design principles, migration strategies, shared responsibility</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Security &amp; Compliance</td>
                <td className="p-3">30%</td>
                <td className="p-3">IAM basics, encryption, compliance programs, detective controls</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Cloud Technology &amp; Services</td>
                <td className="p-3">34%</td>
                <td className="p-3">Core services, deployment models, global infrastructure</td>
              </tr>
              <tr>
                <td className="p-3">Billing, Pricing &amp; Support</td>
                <td className="p-3">12%</td>
                <td className="p-3">Pricing models, Cost Explorer/Budgets, support plans</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Key services to know (and at what depth)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Practitioner depth is &quot;one sentence each&quot;: what the service does and when you
          would pick it — not how to configure it. Learn EC2 vs Lambda vs ECS (compute choices),
          S3 vs EBS vs EFS (storage choices), RDS vs DynamoDB (SQL vs NoSQL), VPC/CloudFront/Route
          53 (networking edge), IAM/CloudTrail/Config (security spine), and CloudWatch plus the
          billing trio (Cost Explorer, Budgets, Pricing Calculator). If you can place each service
          in one sentence and name its exam-domain home, you are at the right depth.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Your 2-week schedule</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Study alongside the AWS Fundamentals module: mornings learn, evenings click through the
          Console so every term has a screen you have seen. Week one builds vocabulary; week two
          converts it into exam points with mocks.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Schedule"
            code={`Week 1 — Vocabulary + Console
  Mon-Tue: Cloud concepts (regions/AZs, elasticity, shared responsibility) + click each in Console
  Wed-Thu: IAM/security basics + storage & compute one-liners (EC2, S3, RDS, Lambda)
  Fri-Sun: Billing/pricing/support (Cost Explorer, Budgets, support plans) + Skill Builder review

Week 2 — Mocks + gaps
  Mon-Tue: First full practice exam, untimed — log every miss by domain
  Wed-Thu: Re-study weakest domain only, second practice exam timed (90 min)
  Fri: Third mock — book the real exam only at 80%+ twice in a row
  Weekend: Light flashcards + rest — cramming the night before lowers scores`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Practice-exam strategy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Mocks are diagnostic tools, not score-chasing. Take the first one untimed and tag every
          miss with its domain; your study plan for the next three days is simply &quot;weakest
          domain first&quot;. From the second mock on, enforce real conditions — 90 minutes, no
          docs, no pausing — and learn the exam&apos;s favorite traps: answers that confuse
          CloudTrail with CloudWatch, Reserved Instances with Savings Plans, and WAF with
          Shield. Two consecutive timed scores above 80% means book the exam within the week,
          before recall decays.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Classic mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Memorizing without the Console:</strong> terms learned from slides alone
            evaporate under exam pressure — every service you study, open once in the Console so
            recall has a visual anchor.
          </li>
          <li>
            <strong>Ignoring billing and support:</strong> at a combined weight engineers
            underestimate, these are the cheapest points on the exam — a single evening on pricing
            models and support plans pays disproportionately.
          </li>
          <li>
            <strong>Booking before two 80%+ mocks:</strong> without the retake voucher chain from
            earlier exams, a failed $100 attempt is pure loss — let the mocks, not optimism,
            schedule you.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tasks (6)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Open each core service (EC2, S3, RDS, Lambda, IAM, VPC) once in the Console and write a one-sentence purpose for each.</li>
          <li>Explain the shared responsibility model aloud in under a minute without notes.</li>
          <li>Compare the four support plans (Basic/Developer/Business/Enterprise) and note which exam scenarios trigger each.</li>
          <li>Take one untimed practice exam on Skill Builder and tag every miss by domain.</li>
          <li>Re-study only your weakest domain, then take a timed 90-minute mock.</li>
          <li>Book the real exam once you score 80%+ on two consecutive timed mocks.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
