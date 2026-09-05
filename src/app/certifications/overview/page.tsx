import Link from "next/link";
import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Certifications & Path"
      title="Start Here"
      intro="AWS certifications open doors; projects get you through the interview. This track shows you the recommended exam order for a DevOps career, how each module of this platform maps to each exam, what the exams cost, and how to study so the cert and the real skills arrive together — not one without the other."
      prev={{ href: "/certifications", label: "Certifications" }}
      next={{ href: "/certifications/cloud-practitioner", label: "Cloud Practitioner" }}
      resources={[
        {
          title: "AWS Certification — official exam guides",
          url: "https://aws.amazon.com/certification/",
          description:
            "The canonical page for every exam: exam guides, domain weights, sample questions, and scheduling.",
        },
        {
          title: "AWS Skill Builder",
          url: "https://skillbuilder.aws/",
          description:
            "Free official courses and practice-question sets aligned to each certification path.",
        },
        {
          title: "roadmap.sh — DevOps Roadmap",
          url: "https://roadmap.sh/devops",
          description:
            "Places the AWS certs in the wider DevOps landscape so you see what to learn alongside them.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">The recommended order for DevOps engineers</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Take the exams in increasing difficulty so each one compounds on the last. Skip none of
          the foundations: the Practitioner gives you vocabulary, the Architect teaches you design
          judgment, the Developer and SysOps pair teaches you to build and operate — and only then
          does the Professional&apos;s automation-heavy scenario style become answerable. The
          diagram below is the order this whole track assumes.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Path"
            code={`Practitioner (CLF-C02)  --->  Solutions Architect Associate (SAA-C03)
        |
        v
Developer Associate (DVA-C02) + SysOps Associate (SOA-C02)  [study once, book back-to-back]
        |
        v
DevOps Engineer Professional (DOP-C02)  --->  LAST, after real pipeline + IaC reps`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How this platform maps to each exam</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You do not need a separate course per cert. The modules you already work through here
          cover the exam domains — the table shows where. When a cert page says &quot;maps to
          Modules X&quot;, it means the labs and projects there <em>are</em> your study material
          for those domains.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 font-semibold">Exam</th>
                <th className="p-3 font-semibold">Platform modules that cover it</th>
                <th className="p-3 font-semibold">Capstone proof</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Cloud Practitioner</td>
                <td className="p-3">Prerequisites + AWS Fundamentals</td>
                <td className="p-3">Console + CLI fluency</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Solutions Architect Associate</td>
                <td className="p-3">AWS Fundamentals + Security</td>
                <td className="p-3">Two-tier app project</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Developer + SysOps Associate</td>
                <td className="p-3">CI/CD + Containers + Monitoring + Automation</td>
                <td className="p-3">Serverless API + ECS pipeline projects</td>
              </tr>
              <tr>
                <td className="p-3">DevOps Professional</td>
                <td className="p-3">IaC + Security (DevSecOps) + all pipeline/monitoring labs</td>
                <td className="p-3">Full portfolio: all four projects deployed via IaC + CI/CD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Certs vs skills: the honest trade</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Certifications open doors — recruiters filter on them and hiring managers treat them as
          proof you take the craft seriously. But no exam asks you to debug a red pipeline at
          midnight or explain <em>your</em> architecture choices in an interview. Projects prove
          what certs promise. The rule for this track: <strong>never sit an exam without a
          matching project you can demo and whiteboard</strong>. One cert plus one deployed
          project beats three certs with nothing running.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>What certs do well:</strong> get past resume screens, structure your learning
            into exam domains, and force breadth (billing, support plans, compliance) you would
            otherwise skip.
          </li>
          <li>
            <strong>What only projects do:</strong> teach troubleshooting under real constraints,
            give you STAR stories for interviews, and prove you can ship — which is what the{" "}
            <Link href="/certifications/study-plan" className="underline underline-offset-4">
              Study Plan &amp; Interviews
            </Link>{" "}
            page converts into job offers.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">What exams cost (and how to pay less)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Budget before you book. At current list prices the Practitioner is{" "}
          <strong>$100 [PAID]</strong>, each Associate is <strong>$150 [PAID]</strong>, and the
          Professional is <strong>$300 [PAID]</strong> — so the full DevOps set (one Practitioner,
          three Associates, one Professional) lists around $850. Two reliable discounts exist:
          every passed exam earns a <strong>50% off voucher</strong> toward your next exam, and
          AWS periodically issues free practice-exam vouchers through Skill Builder challenges.
          Chain your bookings Practitioner-first and each subsequent exam costs you half.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Sequence matters financially:</strong> pass Practitioner ($100), apply its 50%
            voucher to your first Associate ($75), apply that voucher to the next, and so on.
          </li>
          <li>
            <strong>Retakes are full price without a voucher</strong> — which is why every page in
            this track insists on consistent 80%+ mock scores before you book.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How to use this certification track</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Work the pages in order and interleave them with the technical modules — do not binge
          all six cert pages first. Read the Cloud Practitioner page while doing AWS Fundamentals,
          the Architect page alongside the two-tier project, the Developer + SysOps page during
          CI/CD and Containers, and the Professional page only once your pipelines and Terraform
          are real. Finish with the{" "}
          <Link href="/certifications/study-plan" className="underline underline-offset-4">
            Study Plan &amp; Interviews
          </Link>{" "}
          page, which turns everything into a weekly system plus interview prep.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tasks (6)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Write down your target exam order and target month for each of the five exams.</li>
          <li>Map your current progress: tick off which platform modules you have finished against the mapping table above.</li>
          <li>Compute your personal exam budget using the list prices and the 50% voucher chain.</li>
          <li>Create a free Skill Builder account and enroll in one exam-prep plan for your next exam.</li>
          <li>Pick the one portfolio project you will pair with your next exam and note why it proves those domains.</li>
          <li>Read the Cloud Practitioner page next and start its 2-week schedule alongside AWS Fundamentals.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
