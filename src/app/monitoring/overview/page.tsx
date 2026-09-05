import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Monitoring & Reliability"
      title="Start Here"
      intro="Nobody gets paged because a dashboard looked pretty. You get paged because latency spiked, errors burned your budget, or a disk filled at 3am. This module teaches you to see failure coming: the four golden signals to watch on every service, the difference between white-box and black-box monitoring, and how CloudWatch, logs, Prometheus, and SRE practices fit together into one reliability story."
      prev={{ href: "/monitoring", label: "Monitoring & Reliability" }}
      next={{ href: "/monitoring/metrics-dashboards", label: "Metrics, Alarms & Dashboards" }}
      resources={[
        {
          title: "Amazon CloudWatch user guide",
          url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
          description:
            "Official CloudWatch overview — metrics, alarms, logs, and dashboards and how they connect. Start here before the deep lessons.",
        },
        {
          title: "DevOps roadmap — monitoring section",
          url: "https://roadmap.sh/devops",
          description:
            "Roadmap.sh DevOps track showing where monitoring, logging, and observability sit relative to CI/CD, cloud, and IaC skills.",
        },
        {
          title: "Observability explained — freeCodeCamp",
          url: "https://www.freecodecamp.org/news/what-is-observability/",
          description:
            "Beginner-friendly explainer of metrics vs logs vs traces and why all three matter for reliability.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Why monitoring is a reliability skill, not a dashboard skill</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Beginners collect metrics. Engineers define <strong>what good looks like first</strong>, then
          monitor the gap. Every lesson in this module follows the same loop:{" "}
          <strong>signal → threshold → alert → runbook → fix</strong>. If your alarm does not name who
          responds and what they do first, it is decoration, not monitoring.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`THE RELIABILITY LOOP (every lesson maps to one box)

  DEFINE              COLLECT              DETECT              RESPOND
  what is            metrics + logs       alarms on            runbook +
  "healthy"?    -->  + traces       -->   thresholds     -->   on-call +
                                                        game days
       |                  |                    |                   |
  Lesson 5 (SLOs)   Lessons 2-4          Lesson 2            Lesson 5
  SLI/SLO/budget    CloudWatch / logs /  alarm anatomy       runbooks,
                    Prometheus             + SNS             HA + DR`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DevOps use:</strong> deploy pipelines publish markers (image tag, git SHA) into
            dashboards and log filters, so every spike maps back to <strong>exactly what changed</strong>.
          </li>
          <li>
            <strong>Anti-pattern:</strong> 200 metrics, zero alarms with owners. This module aims for the
            opposite: a handful of golden-signal alarms that page, plus broad logs you search during incidents.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">The four golden signals: latency, traffic, errors, saturation</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          From Google SRE: four signals catch nearly every user-visible outage. Learn them once, apply them
          to every service — EC2, ALB, Lambda, ECS, RDS — for the rest of your career.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`GOLDEN SIGNALS (one row per signal)

  SIGNAL        WHAT IT MEANS                  EXAMPLE METRIC (AWS)
  ----------    ----------------------------    --------------------------------
  Latency       How slow are requests?          ALB TargetResponseTime (p95/p99)
  Traffic       How much demand?                ALB RequestCount, Lambda Invocations
  Errors        How many fail?                  ALB HTTPCode_Target_5XX_Count,
                                                Lambda Errors, API GW 5XXError
  Saturation    How full is it?                 EC2 CPUUtilization, RDS FreeStorageSpace,
                                                Lambda Throttles + ConcurrentExecutions,
                                                ALB RejectedConnectionCount`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Latency — use percentiles, not averages:</strong> average hides the pain of the slowest
            5%. Alert on <strong>p95 / p99</strong> (CloudWatch statistic <strong>p95</strong>). Averages
            look fine while 1 in 20 users time out.
          </li>
          <li>
            <strong>Traffic — context for everything else:</strong> 50 errors/min means nothing without
            traffic. 50 errors out of 100 requests is an outage; out of 1M it is noise. Always pair{" "}
            <strong>errors ÷ traffic = error rate</strong>.
          </li>
          <li>
            <strong>Errors — split 4xx from 5xx:</strong>{" "}
            <strong>5xx = your fault, page someone. 4xx = mostly client fault</strong> (bad input, expired
            token), watch the rate but rarely page. A 4xx spike after a deploy often means a breaking API change.
          </li>
          <li>
            <strong>Saturation — the leading indicator:</strong> latency and errors are lagging (users already
            hurt). Saturation — CPU, memory, disk, connections, throttle counts — moves first. Disk-full and
            connection-exhaustion outages are 100% preventable with one saturation alarm each.
          </li>
          <li>
            <strong>DevOps use:</strong> every deploy dashboard in this module shows all four in one row, so a
            canary comparison is one glance: latency delta, traffic split, error-rate delta, saturation delta.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">White-box vs black-box monitoring</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You need both perspectives: what the system <strong>reports about itself</strong> (white-box) and
          what an <strong>outside user actually experiences</strong> (black-box). One without the other lies to you.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`WHITE-BOX (inside view)                  BLACK-BOX (user view)
  metrics your code/infra emits            probes that act like a user
  +--------------------------------+      +----------------------------------+
  | CPU, memory, queue depth       |      | Route 53 health check:           |
  | app counters: orders_created   |      |   GET /health every 30s          |
  | JVM heap, DB connections       |      | CloudWatch Synthetics canary:    |
  | logs: ERROR with stack trace   |      |   login -> add to cart -> pay    |
  +--------------------------------+      +----------------------------------+
  Sees CAUSE (disk 98% full).             Sees EFFECT (checkout down in eu-west-1).
  Blind spot: all green while             Blind spot: knows it is broken,
  users get 500s from a bad deploy.       not WHY it is broken.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>White-box examples:</strong> CloudWatch custom metrics from your app, Prometheus{" "}
            <strong>/metrics</strong> endpoints, structured JSON logs, RDS Performance Insights counters.
          </li>
          <li>
            <strong>Black-box examples:</strong> Route 53 health checks against <strong>/health</strong>,
            CloudWatch Synthetics canaries replaying a checkout flow, ALB target health, an external ping
            from a second region.
          </li>
          <li>
            <strong>The classic trap:</strong> white-box all green (CPU 20%, no exceptions logged) while
            black-box screams (login returns 200 with an error page your code never counted). Lesson 2 fixes
            this by alarming on <strong>ALB 5xx + canary failures</strong>, not just host metrics.
          </li>
          <li>
            <strong>DevOps use:</strong> deploy pipelines update both: new code version emits new white-box
            counters, and the post-deploy smoke test is a black-box probe that must pass before promotion.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Module 04 recap: what you already know (CloudWatch basics)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          In the AWS fundamentals module you met CloudWatch: namespaces, basic EC2/RDS metrics, a simple
          alarm, and CloudTrail for audit. That was recognition level. This module is <strong>fluency level</strong>:
          custom metrics, alarm anatomy, log queries, Prometheus, and SLOs.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>You already know:</strong> CloudWatch collects metrics per namespace, alarms fire on
            thresholds and notify SNS, CloudTrail records <strong>who did what API call</strong> (audit, not
            performance).
          </li>
          <li>
            <strong>What goes deeper here:</strong> Lesson 2 — dimensions, statistics, custom metrics, anomaly
            and composite alarms, dashboards-as-JSON. Lesson 3 — centralized logs and Insights queries. Lesson
            4 — Prometheus pull model and PromQL. Lesson 5 — SLOs, HA, DR, runbooks.
          </li>
          <li>
            <strong>CloudWatch vs CloudTrail in one line:</strong> CloudWatch answers{" "}
            <strong>how is it behaving</strong> (CPU 90%, p99 2s). CloudTrail answers{" "}
            <strong>who changed it</strong> (user Shiva terminated instance i-123 at 14:02). Incidents need both.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws cloudwatch list-metrics --namespace AWS/EC2 --region us-east-1 --max-items 5
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=TerminateInstances --max-items 2 --region us-east-1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`METRICS (how is it behaving):
  AWS/EC2  CPUUtilization          InstanceId=i-0abc123
  AWS/EC2  NetworkIn               InstanceId=i-0abc123
  AWS/EC2  StatusCheckFailed       InstanceId=i-0abc123

TRAIL (who changed it):
  2026-04-02T14:02:11  shiva  TerminateInstances  i-0abc123  console`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Module path: the 5 lessons in order</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Do these in sequence. Each lesson assumes the previous one — metrics before alarms, logs before
          PromQL comparisons, everything before SLOs.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>1. Start Here (this page):</strong> golden signals, white-box vs black-box, CloudWatch
            recap, and the module path.
          </li>
          <li>
            <strong>2. Metrics, Alarms and Dashboards:</strong> namespaces, dimensions, custom metrics, alarm
            anatomy (threshold, anomaly, composite), SNS, dashboards, Container and Lambda Insights.
          </li>
          <li>
            <strong>3. Centralized Logging:</strong> CloudWatch agent, log groups and retention, Insights query
            language, structured JSON logging, S3 archival, OpenSearch intro.
          </li>
          <li>
            <strong>4. Prometheus and Grafana:</strong> pull model, scrape jobs, PromQL basics, Grafana
            dashboards and alerts, ECS/EKS notes, managed-service comparison.
          </li>
          <li>
            <strong>5. SRE: SLOs, HA and DR:</strong> SLIs, SLOs, error budgets with a worked 99.9% example,
            multi-AZ patterns, RTO/RPO, backup and DR strategies, runbooks and game days.
          </li>
        </ol>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE TIER] This module is mostly free</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            CloudWatch free tier covers 10 custom metrics, 10 alarms, 5 GB log ingestion, and 3 dashboards —
            enough for every lab here. Paid usage only starts with extra custom metrics, detailed monitoring,
            long log retention, or OpenSearch domains. Each lesson labels paid steps before you click.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Golden signals on every deploy dashboard:</strong> latency, traffic, errors, saturation in
            one row per service — canary vs stable side by side.
          </li>
          <li>
            <strong>Black-box gates promotion:</strong> synthetic canary or health-check failure blocks
            auto-promotion even when all host metrics look green.
          </li>
          <li>
            <strong>Alarms carry runbook links:</strong> every page includes the dashboard URL and first three
            commands, so on-call acts in minutes, not after a search.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Monitoring CPU only:</strong> CPU green while users get 500s. Always include latency and
            error-rate signals from the load balancer or gateway.
          </li>
          <li>
            <strong>White-box only:</strong> no external probe means you learn about outages from customers
            instead of alarms.
          </li>
          <li>
            <strong>Alarms with no owner or runbook:</strong> they get muted after two false pages and then
            miss the real outage. Owner plus runbook or delete the alarm.
          </li>
          <li>
            <strong>Confusing CloudTrail with performance monitoring:</strong> CloudTrail is audit (who called
            the API). It will not tell you p99 latency — that is CloudWatch metrics and logs.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (6 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Write the four golden signals from memory with one AWS metric example each.</li>
          <li>Classify three checks as white-box or black-box: CPUUtilization alarm, Route 53 health check on /health, CloudWatch Synthetics login canary.</li>
          <li>Run the Terminal commands above and explain which output is CloudWatch vs CloudTrail.</li>
          <li>Sketch the reliability loop (define, collect, detect, respond) and place one tool in each box.</li>
          <li>Pick a service you run (or imagine an ALB + EC2 app) and name which signal each of these is: p99 latency, RequestCount, 5xx count, disk used percent.</li>
          <li>Plan your week: assign one day each to metrics/alarms, logging, Prometheus/Grafana, and SRE practices.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
