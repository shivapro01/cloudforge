import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="CloudWatch + CloudTrail"
      intro="Metrics tell you something is wrong, logs tell you why, and traces tell you where — CloudWatch owns all three, while CloudTrail records who did what via the API. Together they are your alarms, dashboards, forensics, and audit trail. This lesson builds a real CPU alarm to your email, queries logs with Insights, and shows exactly which parts stay free and which bill by the metric."
      prev={{ href: "/aws-fundamentals/lambda-basics", label: "Lambda + API Gateway Intro" }}
      next={{ href: "/aws-fundamentals/sns-sqs", label: "SNS, SQS & EventBridge" }}
      resources={[
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "CloudWatch's 10 metrics, 5 GB logs, and 3 dashboards free allowance that this lesson's lab fits inside.",
        },
        {
          title: "AWS Documentation",
          url: "https://docs.aws.amazon.com/",
          description:
            "Official reference for metrics, alarms, Logs Insights syntax, and CloudTrail event types.",
        },
        {
          title: "Roadmap.sh",
          url: "https://roadmap.sh/",
          description:
            "Where monitoring and observability sit in the broader DevOps learning path.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. Metrics vs logs vs traces</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Metrics</strong> are numbers over time (CPU 42%, 500 errors/min) — cheap,
          graphable, alarmable. <strong>Logs</strong> are timestamped text events (stack traces,
          request lines) — the detail you grep when a metric fires. <strong>Traces</strong>{" "}
          (X-Ray) stitch one request across services — the map when slowness spans Lambda → API →
          DynamoDB. Rule: dashboards and alarms on metrics, diagnosis in logs, cross-service
          latency in traces. Beginners who alarm on log text instead of metrics pay more and wake
          up later.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every metric lives in a <strong>namespace</strong> (<code>AWS/EC2</code>,{" "}
          <code>AWS/Lambda</code>, your own <code>MyApp/Orders</code>), sliced by{" "}
          <strong>dimensions</strong> (InstanceId, FunctionName, Environment), and summarized by{" "}
          <strong>statistics</strong>: <strong>Average</strong> for typical load,{" "}
          <strong>Maximum</strong> for spikes, <strong>Sum</strong> for totals, and{" "}
          <strong>p99</strong> for tail latency (the 1% of users having the worst time — the
          statistic behind every real SLO).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# p99 Lambda duration over the last hour (the SLO statistic)
aws cloudwatch get-metric-statistics --namespace AWS/Lambda \\
  --metric-name Duration --dimensions Name=FunctionName,Value=hello-fn \\
  --start-time $(date -u -d '1 hour ago' +%FT%TZ) --end-time $(date -u +%FT%TZ) \\
  --period 300 --statistics Average p99 Maximum \\
  --query "Datapoints[*].[Timestamp,Average,Maximum]" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ aws cloudwatch get-metric-statistics --namespace AWS/Lambda ...
------------------------------------------------------------
|                   GetMetricStatistics                    |
+--------------------------+--------------+--------------+
|  2026-09-05T09:30:00Z     |  14.2        |  812.5       |
|  2026-09-05T09:35:00Z     |  13.8        |  790.1       |
+--------------------------+--------------+--------------+
# Average 14 ms looks fine; Maximum ~800 ms = cold starts hiding in the tail`}
          />
        </div>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Alarms: threshold, anomaly, and composite</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>threshold alarm</strong> fires when a statistic crosses a line for N periods
          (CPU &gt; 80% for 3× 5-min — the lab alarm in section 6). An{" "}
          <strong>anomaly detection alarm</strong> learns the band (daily traffic curve) and fires
          on deviation — ideal for spiky workloads where no static line fits. A{" "}
          <strong>composite alarm</strong> combines children (CPU-high AND error-high, or any of
          5 regional alarms) so one page means one real incident instead of five correlated ones.
          Every alarm ends in an <strong>action</strong>: SNS topic → email/Slack/pager, auto-scale
          policy, or EC2 reboot.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`metric stream (CPUUtilization, per 5 min)
   │ evaluate: Average > 80% for 3 consecutive periods?
   ▼
ALARM state ──▶ ACTION: publish to SNS topic lab-alerts
                     ├──▶ email you (lab, section 6)
                     ├──▶ (prod) Slack via chat integration
                     └──▶ (prod) paging + composite: CPU-high AND 5xx-high
OK / INSUFFICIENT_DATA / ALARM — handle all three (see mistakes).`}
          />
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Logs: groups, streams, and Insights queries</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>log group</strong> is the container (<code>/aws/lambda/hello-fn</code>), a{" "}
          <strong>log stream</strong> is one writer&apos;s sequence (one Lambda sandbox, one EC2
          agent). Retention is set per group — and defaults to <em>never expire</em>, the classic
          surprise bill. <strong>CloudWatch Logs Insights</strong> queries groups with a
          pipe-style language: filter, parse, stats, sort. Learn four verbs and you can answer
          &quot;which paths 500 the most?&quot; in seconds.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws logs start-query --log-group-name /aws/lambda/hello-fn \\
  --start-time $(date -d '1 hour ago' +%s) --end-time $(date +%s) \\
  --query-string 'fields @timestamp, @message
    | filter @message like /ERROR/
    | stats count() as errors by bin(5m)
    | sort @timestamp desc
    | limit 20'

aws logs put-retention-policy --log-group-name /aws/lambda/hello-fn --retention-in-days 7`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ aws logs get-query-results --query-id <id>
------------------------------------------------
|                QueryResults                  |
+--------------------------+--------+--------+
|  2026-09-05T09:35:00Z     |  ERROR |  3     |
|  2026-09-05T09:30:00Z     |  ERROR |  11    |
+--------------------------+--------+--------+
# 11 errors in the 09:30 bucket: now grep that window for the stack trace`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Dashboards and Container Insights</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Dashboards</strong> combine metric widgets, alarm statuses, and log-query
          results on one screen — build one per service (request rate, p99 latency, error %, CPU)
          and one per incident while debugging, then keep the good ones. Three dashboards are
          free; beyond that they bill monthly each. <strong>Container Insights</strong> auto-collects
          per-pod/container CPU, memory, and network for ECS/EKS into CloudWatch with no agent
          config — flip it on for clusters, but know it emits many metrics per container, so watch
          custom-metric costs on large fleets.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. CloudTrail: who did what, and where it goes</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every API call (console clicks included) lands in CloudTrail.{" "}
          <strong>Management events</strong> (create-instance, change security group, console
          logins) are on by default with <strong>90-day event history free</strong> in the console
          — enough for most &quot;who opened this port?&quot; forensics.{" "}
          <strong>Data events</strong> (each S3 GetObject, each Lambda invoke) are off by default
          because at volume they flood storage — enable selectively on sensitive prefixes. Trails
          archive to <strong>S3</strong> for long retention, and <strong>Athena</strong> queries
          those S3 logs with SQL when you need &quot;all AssumeRole calls from this IP in
          March&quot;. <strong>CloudTrail Lake</strong> is the paid managed query store — skip it
          in labs.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Who opened port 22 recently? (free 90-day history, no trail needed)
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AuthorizeSecurityGroupIngress \\
  --max-results 5 --query "Events[*].[EventTime,Username,CloudTrailEvent]" --output table

# Durable trail to S3 (one-time setup for audit retention)
aws cloudtrail create-trail --name lab-trail --s3-bucket-name lab-trail-bucket
aws cloudtrail start-logging --name lab-trail`}
          />
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Lab [FREE TIER]: EC2 CPU alarm to your email</h2>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            [FREE TIER] — 10 metrics + 5 GB logs + 3 dashboards + 10 alarms free. This lab uses one alarm.
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            Standard EC2 metrics arrive every 5 minutes free. Create one SNS topic, subscribe your
            email (confirm the subscription!), then attach the topic to a CPU &gt; 80% alarm on
            your lab instance. Trigger it with a load burst, confirm the email, then delete the
            alarm and topic the same session.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. SNS topic + email subscription (confirm the email AWS sends you!)
aws sns create-topic --name lab-alerts --query TopicArn --output text
aws sns subscribe --topic-arn arn:aws:sns:us-east-1:123456789012:lab-alerts \\
  --protocol email --notification-endpoint you@example.com

# 2. CPU alarm on the lab instance → SNS action
aws cloudwatch put-metric-alarm --alarm-name lab-cpu-high \\
  --namespace AWS/EC2 --metric-name CPUUtilization \\
  --dimensions Name=InstanceId,Value=i-0123456789abcdef0 \\
  --statistic Average --period 300 --evaluation-periods 1 \\
  --threshold 80 --comparison-operator GreaterThanThreshold \\
  --alarm-actions arn:aws:sns:us-east-1:123456789012:lab-alerts

# 3. Trigger it, then watch state flip
sudo yum install -y stress && stress --cpu 2 --timeout 400 &
aws cloudwatch describe-alarms --alarm-names lab-cpu-high \\
  --query "MetricAlarms[*].[AlarmName,StateValue,StateReason]" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ aws cloudwatch describe-alarms --alarm-names lab-cpu-high ...
--------------------------------------------------------------------------------
|                               DescribeAlarms                                 |
+----------------+--------+--------------------------------------------------+
| lab-cpu-high   | ALARM  | Threshold Crossed: 1 datapoint [96.4] > 80.0   |
+----------------+--------+--------------------------------------------------+
# Check your inbox: "ALARM: lab-cpu-high" via SNS. Kill stress, state returns to OK.

$ aws cloudwatch delete-alarms --alarm-names lab-cpu-high
$ aws sns delete-topic --topic-arn arn:aws:sns:us-east-1:123456789012:lab-alerts
# Same-session cleanup: alarm + topic deleted = nothing lingering`}
          />
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. [PAID] warnings + how DevOps uses this daily</h2>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            [PAID] — four meters that outgrow Free Tier fast.
          </p>
          <div className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            <p><strong>Custom metrics $0.30/metric/month</strong> — each unique metric+dimension combo counts; high-cardinality labels (per-user, per-request-id) explode the bill.</p>
            <p><strong>Detailed monitoring</strong> (1-min EC2 metrics) costs per metric — standard 5-min is free and enough for labs.</p>
            <p><strong>Logs ingestion + retention</strong> — per-GB ingested plus per-GB-month stored; verbose debug logging at scale dwarfs the alarm bill.</p>
            <p><strong>CloudTrail Lake + data events</strong> — managed querying and per-event S3 data logging bill hard. Labs use the free 90-day history + lookup-events.</p>
          </div>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          In practice: <strong>pipeline failure alarms</strong> (CodeBuild failed-builds &gt; 0,
          deploy error-rate spikes) page to SNS→Slack within minutes, and <strong>SLO
          dashboards</strong> (availability %, p99 latency vs objective, burn rate) sit on a TV
          or homepage so regressions are visible before users report them. Every deploy updates
          the dashboard annotation — correlating releases with metric shifts is half of incident
          response.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Alarm on the wrong statistic:</strong> averaging away spikes (Average hides a
            100% single-core peg) or paging on Maximum noise. CPU fleets → Average; latency SLOs → p99.
          </li>
          <li>
            <strong>Ignoring no-data handling:</strong> a stopped instance flips to
            INSUFFICIENT_DATA silently while you assume OK. Set TreatMissingData explicitly
            (breaching for dead-man&apos;s-switch alarms).
          </li>
          <li>
            <strong>Log groups that never expire:</strong> default infinite retention on chatty
            Lambdas — set 7–30 day retention per group from day one.
          </li>
          <li>
            <strong>Data events on entire buckets:</strong> logging every GetObject on a busy
            bucket — millions of events overnight. Scope to sensitive prefixes only.
          </li>
          <li>
            <strong>Dashboards nobody looks at:</strong> 20 widgets, zero alarms attached. Every
            dashboard panel that matters gets an alarm; the rest is decoration.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Graph EC2 CPU Average vs Maximum for one hour; explain which hides spikes.</li>
          <li>Build the lab CPU alarm + email subscription; trigger it with stress and capture the SNS email.</li>
          <li>Write an Insights query counting ERRORs per 5-min bucket on any log group; save it.</li>
          <li>Set 7-day retention on two log groups; list groups to prove retention is set.</li>
          <li>Build a 4-widget dashboard (CPU, errors, p99 latency, alarm status); delete it after (stay under 3 kept).</li>
          <li>Use lookup-events to find the last security-group change; identify the IAM user behind it.</li>
          <li>Create a composite alarm (CPU-high AND error-high) in the console; describe when it fires.</li>
          <li>Delete the alarm, topic, and dashboard; verify with describe-alarms that nothing remains.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
