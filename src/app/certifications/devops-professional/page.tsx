import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Certifications & Path"
      title="DevOps Engineer Professional"
      intro="The DevOps Engineer Professional (DOP-C02) is the capstone: 75 scenario-heavy questions in 180 minutes testing whether you can automate the whole SDLC, manage everything as code, and respond to events like a senior engineer. Attempt it last — after the Associate exams plus real reps with pipelines, Terraform, and monitoring — and treat preparation as scenario drills, not memorization."
      prev={{ href: "/certifications/developer-sysops", label: "Developer + SysOps Associate" }}
      next={{ href: "/certifications/study-plan", label: "Study Plan & Interviews" }}
      resources={[
        {
          title: "AWS Certification — DevOps Engineer Professional exam guide",
          url: "https://aws.amazon.com/certification/certified-devops-engineer-professional/",
          description:
            "Official DOP-C02 exam guide: domain weights, scenario-style samples, and booking details.",
        },
        {
          title: "AWS Skill Builder — Professional prep",
          url: "https://skillbuilder.aws/",
          description:
            "Official advanced courses and practice scenarios for the Professional-level domains.",
        },
        {
          title: "AWS Documentation — Code services and CloudFormation",
          url: "https://docs.aws.amazon.com/",
          description:
            "Deep docs on pipelines, deployment strategies, and config-as-code — the exam's home turf.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Exam domains (and where the weight sits)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Six domains, but the center of gravity is unmistakable: SDLC automation is the heaviest
          single domain, with configuration-as-code and monitoring/event response close behind.
          High availability and security are tested through an automation lens — not
          &quot;what is KMS?&quot; but &quot;how do you rotate secrets automatically across
          accounts without downtime?&quot;
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 font-semibold">Domain</th>
                <th className="p-3 font-semibold">Weight</th>
                <th className="p-3 font-semibold">What it demands</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">SDLC automation</td>
                <td className="p-3">22%</td>
                <td className="p-3">CI/CD design, deployment strategies, pipeline recovery</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Configuration management &amp; IaC</td>
                <td className="p-3">17%</td>
                <td className="p-3">CloudFormation/Terraform patterns, drift, safe rollouts</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Monitoring &amp; event response</td>
                <td className="p-3">17%</td>
                <td className="p-3">Alarms, EventBridge automation, incident runbooks</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Resilient cloud solutions</td>
                <td className="p-3">15%</td>
                <td className="p-3">Multi-region, failover, backup/restore automation</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Security &amp; compliance automation</td>
                <td className="p-3">14%</td>
                <td className="p-3">Policy-as-code, automated remediation, least privilege at scale</td>
              </tr>
              <tr>
                <td className="p-3">Policies, cost &amp; standards</td>
                <td className="p-3">15%</td>
                <td className="p-3">Tagging/governance, cost controls, multi-account standards</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Why this exam goes last</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          DOP-C02 assumes the Associate layer as prerequisites in all but name: every scenario
          presupposes you already know what an ALB, a Lambda alias, or a CloudFormation stack
          does, and spends its difficulty on <em>combining</em> them under failure and scale
          constraints. Candidates who attempt it early fail on compound questions — pipeline
          plus rollback plus multi-account governance in one stem. The readiness checklist is
          concrete: all three Associates passed, one Terraform-managed environment you built
          yourself, one pipeline you have broken and fixed, and CloudWatch alarms you have
          actually been paged by (even self-paged in a lab).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Scenario drills: pipeline failure, rollback, runbook</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Train the way the exam tests — multi-sentence scenarios with a broken system and four
          plausible fixes. Drill these three weekly until your reasoning is automatic.
        </p>
        <ul className="mt-2 flex flex-col gap-3 text-zinc-700 dark:text-zinc-300">
          <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <strong>Drill 1 — Pipeline failure.</strong> CodePipeline stalls at the deploy stage
            after a CloudFormation change; previous stages are green. Trained response: inspect
            the stack events for the failed resource, check IAM deploy-role permissions and drift
            first, then decide fix-forward vs stop-execution — the exam rewards diagnosing before
            rerunning.
          </li>
          <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <strong>Drill 2 — Bad deploy rollback.</strong> A blue/green ECS deploy shifts traffic
            and error rates spike on green. Trained response: shift traffic back (instant
            rollback is the point of blue/green), freeze the pipeline trigger, root-cause from
            green-task logs and target-group health — never roll forward blindly under alarm.
          </li>
          <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <strong>Drill 3 — Event-driven runbook.</strong> An EC2 fleet shows CPU saturation at
            night with no deploy attached. Trained response: CloudWatch alarm → EventBridge rule
            → SSM automation or Lambda remediation (scale out, capture logs, notify), with the
            incident tagged and the runbook versioned — detect, respond, and record as one motion.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Your 8-week schedule</h2>
        <div className="mt-3">
          <CodeBlock
            label="Schedule"
            code={`Weeks 1-2 — SDLC automation depth
  Multi-stage pipelines, cross-account deploys, CodeDeploy strategies; break + fix one pipeline

Weeks 3-4 — Config-as-code + resilience
  CloudFormation nested/stacks policies, Terraform state/drift; multi-region failover designs

Weeks 5-6 — Monitoring/event response + security automation
  EventBridge rules, SSM runbooks, Config rules + auto-remediation; write 3 runbooks

Weeks 7-8 — Timed scenarios to booking
  4+ full 180-min scenario mocks; drill weakest domain between each; book at 75-80%+`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Classic mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Attempting it as a first or second exam:</strong> without Associate
            foundations the compound scenarios are unreadable — the failure rate for early
            attempts reflects missing prerequisites, not lack of effort.
          </li>
          <li>
            <strong>Memorizing service limits instead of drilling:</strong> Professional
            questions test judgment between valid options — only timed scenario practice builds
            that judgment.
          </li>
          <li>
            <strong>Ignoring the 180-minute stamina factor:</strong> 75 long scenarios exhaust
            unprepared readers — every mock must be full-length and timed, no split sessions.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tasks (6)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Confirm readiness: three Associates passed plus one IaC-managed environment of your own.</li>
          <li>Break a pipeline on purpose and document the full diagnose → fix → rerun cycle.</li>
          <li>Practice a blue/green rollback until traffic-shift-back takes you under five minutes.</li>
          <li>Write three runbooks (pipeline failure, bad deploy, saturation event) with EventBridge triggers.</li>
          <li>Take two full 180-minute timed mocks and drill only the weakest domain between them.</li>
          <li>Book DOP-C02 at 75–80%+ on full mocks, applying your Associate 50% voucher to the $300 fee.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
