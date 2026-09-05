import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Monitoring & Reliability"
      title="SRE: SLOs, HA & DR"
      intro="Monitoring without targets is anxiety with graphs. Site Reliability Engineering turns golden signals into contracts: SLIs measure, SLOs promise, error budgets decide whether you ship features or fix reliability. This lesson adds the other half of reliability — highly available architectures that survive AZ failure, backup and disaster-recovery strategies with honest RTO/RPO, and runbooks plus game days so humans perform under pressure. Finish here and the Security module is your next stop."
      prev={{ href: "/monitoring/prometheus-grafana", label: "Prometheus & Grafana" }}
      next={{ href: "/security", label: "Security" }}
      resources={[
        {
          title: "AWS reliability pillar — Well-Architected Framework",
          url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html",
          description:
            "Official AWS guidance on foundations, change management, and failure management — the framework behind every HA and DR pattern here.",
        },
        {
          title: "AWS Backup and disaster recovery documentation",
          url: "https://docs.aws.amazon.com/backups/",
          description:
            "Centralized backup plans, cross-region copy, and restore testing for EC2, RDS, EFS, and S3.",
        },
        {
          title: "Site Reliability Engineering — freeCodeCamp",
          url: "https://www.freecodecamp.org/news/site-reliability-engineering/",
          description:
            "Plain-language intro to SLIs, SLOs, error budgets, and toil — pairs well with the worked example below.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">SLIs, SLOs, and error budgets: promises with math</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          An <strong>SLI</strong> (indicator) is the measurement: successful requests ÷ total requests. An{" "}
          <strong>SLO</strong> (objective) is the promise: 99.9% of requests succeed over 30 days. The{" "}
          <strong>error budget</strong> is what remains: 0.1% allowed failure. Spend it on deploys and risk;
          exhaust it and feature work pauses until reliability recovers. No budget, no argument about whether
          to ship — the number decides.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`SLI (measure)            SLO (promise)              ERROR BUDGET (remaining risk)
successful / total  -->  99.9% over 30 days    -->  0.1% = 43 min/month downtime
     |                          |                              |
PromQL / Insights         written + agreed               burn rate decides:
query from Lessons 2-4    with stakeholders              ship features vs fix reliability`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Worked example: what does 99.9% actually allow?
python3 -c "for slo in [0.99, 0.999, 0.9995, 0.9999]: print(f'SLO {slo*100:.2f}% -> budget {(1-slo)*100:.3f}% -> {((1-slo)*30*24*60):.1f} min/month, {((1-slo)*24*60):.1f} min/day')"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`SLO 99.00% -> budget 1.000% -> 432.0 min/month, 14.4 min/day
SLO 99.90% -> budget 0.100% -> 43.2 min/month, 1.4 min/day
SLO 99.95% -> budget 0.050% -> 21.6 min/month, 0.7 min/day
SLO 99.99% -> budget 0.010% -> 4.3 min/month, 0.1 min/day
# Each extra nine divides the budget by 10. 99.99% means one bad deploy can burn the month.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Pick SLIs users feel:</strong> checkout success rate, p95 latency on confirm, not CPU. A
            99.99% CPU-idle SLO is worthless if checkout errors at 2%.
          </li>
          <li>
            <strong>Budget policy example:</strong> budget above 50% → ship normally. 10–50% → extra review on
            risky deploys. Below 10% → freeze features, burn-down reliability work only. Write this down before
            the incident, not during.
          </li>
          <li>
            <strong>Burn-rate alarms:</strong> fast-burn (budget consumed 10x normal for 1h → page) plus
            slow-burn (2x normal for 3 days → ticket). Lessons 2 and 4 alarms become budget alarms by dividing
            by the same traffic denominator.
          </li>
          <li>
            <strong>DevOps use:</strong> canary analysis reads budget directly — a release that burns 20% of the
            monthly budget in an hour auto-rolls back.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">HA patterns: survive an AZ failure by design (recap + diagram)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          High availability is Module 02/04 architecture with an SLO attached: <strong>two or more AZs, load
          balancer health checks, auto-scaling replacement</strong>. If any single AZ can take you down, you do
          not have HA — you have hope.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`            Route 53 (health-checked DNS)
                       |
              ALB (2+ AZs, cross-zone on)
              /health checks every 15s
              /                            \\
   AZ-a: ASG 2-4x EC2 /        AZ-b: ASG 2-4x EC2 /
   ECS tasks across subnets    ECS tasks across subnets
         |                                |
   RDS Multi-AZ standby -------- sync replication
   (auto-failover ~60-120s)     S3 + DynamoDB (regional by design)

   AZ-a dies: ALB drains targets in ~30s, ASG replaces in AZ-b,
   RDS fails over, budget burns minutes not hours.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Multi-AZ is the floor:</strong> ALB + ASG across 2–3 AZs, RDS Multi-AZ standby, ElastiCache
            with replicas. Single-AZ RDS or one static EC2 is a planned outage waiting for a date.
          </li>
          <li>
            <strong>Health checks must test depth:</strong> <strong>/health</strong> should verify DB
            connectivity, not just return 200. Shallow checks keep sick targets in rotation.
          </li>
          <li>
            <strong>Stateless app tier:</strong> sessions in ElastiCache/DynamoDB, uploads straight to S3, AMIs
            or containers immutable — so replacement instances join correctly with zero manual steps.
          </li>
          <li>
            <strong>DevOps use:</strong> chaos-style AZ evacuation drill (drain one AZ on staging monthly)
            proves the diagram true before a real failure does it for you.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Backup and DR: RTO/RPO plus pilot-light vs multi-site</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          HA survives component failure; <strong>disaster recovery</strong> survives region failure and data
          loss. Two numbers scope every plan: <strong>RTO</strong> (how long until we are back) and{" "}
          <strong>RPO</strong> (how much data we can lose). Cheaper plans accept bigger numbers — the business
          signs off, not engineering alone.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`STRATEGY       RTO / RPO            COST        WHEN IT FITS
Backup+restore Largest (hours)       $         Dev / internal tools; AMIs + snapshots to second region
Pilot light    Medium (tens of min)  $$        Prod default: data replicated, app tier scaled to zero, ignite on failover
Warm standby   Small (minutes)       $$$       Money-path services: scaled-down live copy, DNS flip
Multi-site     ~Zero (seconds)       $$$$      Global checkout: active-active, Route 53 latency routing

RTO = time to restore service.  RPO = max data loss window (snapshot age + replication lag).`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws rds create-db-snapshot --db-instance-identifier prod-orders --db-snapshot-identifier prod-orders-predeploy-20260401 --region us-east-1
aws rds copy-db-snapshot --source-db-snapshot-identifier arn:aws:rds:us-east-1:123456789012:snapshot:prod-orders-predeploy-20260401 --target-db-snapshot-identifier prod-orders-dr-copy --source-region us-east-1 --region eu-west-1
aws backup start-restore-job --recovery-point-arn arn:aws:rds:us-east-1:123456789012:snapshot:prod-orders-predeploy-20260401 --metadata DBInstanceIdentifier=restore-drill --iam-role-arn arn:aws:iam::123456789012:role/AWSBackupDefaultServiceRole --region us-east-1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`CreateSnapshot: creating (prod-orders-predeploy-20260401, progress 0% -> 100% in ~8 min)
CopySnapshot: copying to eu-west-1 (cross-region DR copy, encrypted with KMS)
RestoreJob: drill instance restore-drill spinning up (quarterly restore TEST - untested backups are rumors)
# Snapshot before every risky migration. Copy daily to DR region. Restore-test quarterly.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>S3/Backup rules that prevent resumes-updating incidents:</strong> versioning on,{" "}
            <strong>cross-region replication</strong> for critical buckets, Backup plans with vault lock, and a
            calendar restore drill with a sign-off.
          </li>
          <li>
            <strong>RDS specifics:</strong> automated snapshots (retention 7–35 days) plus manual pre-deploy
            snapshots, Multi-AZ for HA plus cross-region read replica or snapshot copy for DR — they solve
            different failures.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE TIER] DR drills that cost pennies</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            Snapshots, cross-region copies of small dev databases, Backup vault exercises, and restore drills on
            t3.micro instances fit free-tier and low-cost practice. The paid cliff is running warm-standby or
            multi-site 24/7 — do those as documented designs with costed estimates, not as always-on lab fleets.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Runbooks and game days: humans are part of the system</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A runbook turns a 2am page from panic into procedure: <strong>symptom, blast radius, first three
          commands, rollback step, escalation path</strong>. Game days rehearse it in daylight so the first run
          is never the real outage.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="runbook-checkout-5xx.md"
            code={`# Runbook: checkout 5xx spike
Symptom: alarm prod-5xx-rate-high (Lesson 2) or Grafana checkout-5xx-rate-high (Lesson 4).
Blast radius: /checkout/confirm error rate; check canary vs stable split first.

First 3 commands (paste-ready):
  1. aws cloudwatch describe-alarms --alarm-names prod-5xx-rate-high
  2. Insights query-4 deploy-compare (version vOld vs vNew, last 1h)
  3. kubectl rollout history deploy/checkout (or ECS describe-services for revision)

Decide in 10 min:
  - Error concentrated on new version -> ROLL BACK first, investigate second.
  - All versions + DB timeouts in logs -> fail over / scale RDS, page DBA.
  - Single AZ -> drain AZ, verify ASG replacement.

Escalate: primary on-call 10 min -> service owner 20 min -> incident commander 30 min.
Close-out: error-budget burn note + link to postmortem doc.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Game-day starter set:</strong> kill one AZ on staging, expire a certificate on a test
            domain, fill a disk to 95%, revoke a DB credential — each with the runbook open and a timer running.
          </li>
          <li>
            <strong>Blameless postmortems:</strong> five whys on process, action items with owners and dates,
            budget accounting (how much did this burn?). The output is a runbook update, not a culprit.
          </li>
          <li>
            <strong>DevOps use:</strong> every alarm created in Lessons 2–4 gets a runbook link before it is
            allowed to page. No runbook, no page — ticket only.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A–Z: budget, backup, and a daylight game day</h2>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>A — Choose an SLI/SLO:</strong> checkout success rate, 99.9% over 30 days. Write the budget
            (43 min/month) on paper before touching the console.
          </li>
          <li>
            <strong>B — Build the burn query:</strong> Lesson-2 metric math or Lesson-4 PromQL error rate, with
            a fast-burn and slow-burn threshold each. ✅ <strong>Verify checkpoint:</strong> both queries return
            current burn multiples (near 1x when healthy).
          </li>
          <li>
            <strong>C — Write the runbook</strong> above for your stack (real alarm names, real commands). ✅{" "}
            <strong>Verify checkpoint:</strong> a teammate can follow steps 1–3 without asking you anything.
          </li>
          <li>
            <strong>D — Backup drill:</strong> snapshot a dev RDS (or file set to S3), copy cross-region, record
            RPO = snapshot age. ✅ <strong>Verify checkpoint:</strong> copy exists in the second region.
          </li>
          <li>
            <strong>E — Restore drill:</strong> restore to a new instance/prefix, time it for RTO, then delete.{" "}
            ✅ <strong>Verify checkpoint:</strong> restored data verified + RTO minutes logged.
          </li>
          <li>
            <strong>F — Game day:</strong> in daylight, simulate one failure (AZ drain, bad deploy, full disk)
            with the runbook open. ✅ <strong>Verify checkpoint:</strong> time-to-detect and time-to-mitigate
            recorded.
          </li>
          <li>
            <strong>Z — Postmortem + next step:</strong> one-page blameless note, budget burn logged, one runbook
            improvement committed. Then continue to the Security module — reliable but insecure is still broken.
          </li>
        </ol>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID] Multi-AZ and cross-region are not free</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            Multi-AZ RDS standby, NAT gateways per AZ, cross-region snapshot copy storage, and always-on warm
            standby all bill hourly. Design them for real, drill them small (micro instances, tiny datasets),
            and tear down drill infrastructure the same day.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Budgets gate releases:</strong> CI/CD checks burn rate; red budget pauses promotion without
            a meeting.
          </li>
          <li>
            <strong>HA is tested, not assumed:</strong> scheduled AZ-evacuation and restore drills with recorded
            RTO/RPO, reviewed like any deploy metric.
          </li>
          <li>
            <strong>Runbooks ship with services:</strong> new endpoint without runbook + dashboard + alarm does
            not pass review.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>SLOs on infra instead of users:</strong> 99.99% CPU-idle while checkout fails. Measure the
            user journey.
          </li>
          <li>
            <strong>Too many nines:</strong> 99.99% on a CRUD internal tool burns the team for zero user value.
            Match nines to business cost of downtime.
          </li>
          <li>
            <strong>Untested backups:</strong> snapshots nobody restored are Schrödinger backups. Quarterly
            restore or it does not count.
          </li>
          <li>
            <strong>Runbooks that describe, not command:</strong> investigate the database is useless at 2am;
            paste-ready commands with expected output win.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Compute monthly budgets for 99%, 99.9%, and 99.99% from memory and check against the worked example.</li>
          <li>Write one SLI/SLO/budget triple for a checkout API you imagine running.</li>
          <li>Sketch the multi-AZ architecture from memory with ALB, ASG, and RDS standby labeled.</li>
          <li>Define RTO/RPO targets for backup-restore vs pilot-light for a side project.</li>
          <li>Snapshot, cross-region copy, and restore-drill a dev database; log RTO and RPO.</li>
          <li>Write a one-page runbook for a 5xx spike with three paste-ready commands.</li>
          <li>Run a 30-minute daylight game day (drain, bad deploy, or full disk) and record detect/mitigate times.</li>
          <li>Continue to /security with one sentence on why reliability without security is incomplete.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
