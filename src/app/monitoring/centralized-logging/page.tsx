import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Monitoring & Reliability"
      title="Centralized Logging"
      intro="Metrics tell you something is wrong; logs tell you why. This lesson centralizes every log that matters — EC2 app logs via the CloudWatch agent, Lambda stdout, ALB access logs — into searchable log groups, teaches the Insights query language with four working queries, shows why structured JSON logging pays for itself in the first incident, and covers S3 archival plus when OpenSearch is (and is not) worth the money."
      prev={{ href: "/monitoring/metrics-dashboards", label: "Metrics, Alarms & Dashboards" }}
      next={{ href: "/monitoring/prometheus-grafana", label: "Prometheus & Grafana" }}
      resources={[
        {
          title: "CloudWatch Logs and Insights guide",
          url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html",
          description:
            "Official guide to log groups, the unified agent, Insights query syntax, metric filters, and subscription filters.",
        },
        {
          title: "Amazon S3 storage classes and lifecycle",
          url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html",
          description:
            "How to archive old logs cheaply with lifecycle rules from Standard to Glacier for audit retention.",
        },
        {
          title: "Amazon OpenSearch Service developer guide",
          url: "https://docs.aws.amazon.com/opensearch-service/latest/developerguide/what-is.html",
          description:
            "When full-text search and Kibana-style exploration justify a domain, plus sizing and cost notes.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">The pipeline: emit, ship, store, search, archive</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every centralized-logging setup is the same five stages. Learn the shape once, then map each AWS
          source onto it: EC2 files via the <strong>CloudWatch agent</strong>, Lambda via{" "}
          <strong>stdout to its log group</strong>, ALB via <strong>access logs to S3</strong>, everything
          searchable in <strong>Logs Insights</strong> and archivable to <strong>S3/Glacier</strong>.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`EMIT                    SHIP                      STORE + SEARCH          ARCHIVE
app writes            agent / stdout            CloudWatch Logs          S3 + Glacier
+-----------+   +--------------------+   +---------------------+   +------------------+
| EC2 app   |-->| CloudWatch agent   |-->| /prod/checkout/app  |--+ export (years)   |
| /var/log/ |   | tails + ships      |   | retention 30 days   |  +------------------+
| app.log   |   +--------------------+   +---------------------+  | s3://logs-archive|
+-----------+   +--------------------+   +---------------------+  | -> Glacier @90d  |
| Lambda    |-->| stdout auto-captured |-->| /aws/lambda/checkout|  +------------------+
| console.log   +--------------------+   +---------------------+   +------------------+
| ALB       |-->| access logs -> S3    |-->| Athena on S3 OR     |  (ALB logs live in |
+-----------+   +--------------------+   | import to Insights  |   S3 from birth)   |`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Retention is a cost decision:</strong> 30 days in CloudWatch for active debugging, years in
            S3/Glacier for audit. Never pay CloudWatch prices for year-old logs nobody queries.
          </li>
          <li>
            <strong>DevOps use:</strong> log group names encode <strong>environment + service</strong> (
            <strong>/prod/checkout/app</strong>), and deploy pipelines add the image tag as a log field so
            incident queries filter to the exact bad version.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Ship it: CloudWatch agent config + install</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The unified <strong>CloudWatch agent</strong> tails your log files and ships host metrics in one
          config. Write the JSON once, store it in Git, roll it out with user-data or SSM — never hand-configure
          per host.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="amazon-cloudwatch-agent.json"
            code={`{
  "agent": {
    "metrics_collection_interval": 60,
    "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/agent.log"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/app/app.log",
            "log_group_name": "/prod/checkout/app",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 30
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/prod/checkout/nginx",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          }
        ]
      }
    }
  },
  "metrics": {
    "metrics_collected": {
      "mem": { "measurement": ["mem_used_percent"], "metrics_collection_interval": 60 },
      "disk": { "measurement": ["used_percent"], "metrics_collection_interval": 60 }
    }
  }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`sudo yum install -y amazon-cloudwatch-agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file://amazon-cloudwatch-agent.json
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status
aws logs describe-log-groups --log-group-name-prefix /prod/checkout --region us-east-1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Installed: amazon-cloudwatch-agent-1.3003
Fetch-config: OK (config valid, agent started)
Status: running (cwagent pid 1842, 2 log files tailed, 2 metric sets active)

LogGroups:
  /prod/checkout/app       retention 30 days   stored 41 MB
  /prod/checkout/nginx     retention 14 days   stored 12 MB`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>IAM first:</strong> the instance profile needs <strong>CloudWatchAgentServerPolicy</strong>.
            Agent silently ships nothing without it — the number-one setup failure.
          </li>
          <li>
            <strong>Bonus win:</strong> the same agent gives you <strong>mem_used_percent</strong> and{" "}
            <strong>disk used_percent</strong> — the saturation metrics EC2 lacks by default. Your disk-full
            alarm comes from this config.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Search it: CloudWatch Logs Insights (4 queries)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Insights is a purpose-built query language over log groups: <strong>fields, filter, stats, sort,
          limit</strong>. These four queries resolve 80% of incidents — error hunt, latency tail, per-endpoint
          breakdown, deploy comparison.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="query-1-errors.cloudwatch-insights"
            code={`fields @timestamp, level, message, requestId
| filter level = "ERROR"
| sort @timestamp desc
| limit 20`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`@timestamp               level  requestId       message
2026-04-01T10:14:02Z     ERROR  req-9f21        PaymentFailed card_declined amount=49.00
2026-04-01T10:13:47Z     ERROR  req-9f1c        DB connection timeout after 3000ms
2026-04-01T10:13:31Z     ERROR  req-9f0e        PaymentFailed insufficient_funds amount=19.00
# Newest first: cause sits at the top during an active incident.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="query-2-latency-tail.cloudwatch-insights"
            code={`fields @timestamp, path, durationMs
| filter durationMs > 1000
| stats count() as slowHits, avg(durationMs) as avgMs, max(durationMs) as maxMs by path
| sort slowHits desc
| limit 10`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`path              slowHits  avgMs   maxMs
/checkout/confirm  212       2340    9100
/cart/add           31       1420    3800
/health              0       -       -
# One endpoint owns the tail. Look at confirm first, ignore health.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="query-3-errors-by-endpoint.cloudwatch-insights"
            code={`fields @timestamp, path, status
| filter status >= 500
| stats count() as errors by path
| sort errors desc
| limit 10`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`path               errors
/checkout/confirm   187
/payment/webhook     24
/cart/add             3
# 5xx concentrated on confirm: matches the latency tail above. Same deploy suspect.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="query-4-deploy-compare.cloudwatch-insights"
            code={`fields @timestamp, version, level
| filter version in ["v1.4.1", "v1.4.2"]
| stats count() as total, sum(level = "ERROR") as errors by version
| sort version asc`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`version  total   errors  errorRate
v1.4.1   48210   61      0.13%
v1.4.2   47980   412     0.86%
# Same traffic, 7x error rate on v1.4.2. Roll back, then read the diff.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Structured JSON logging: parseable from birth</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Plain-text logs need regex to query. <strong>JSON logs are fields already</strong> — every key becomes
          a filterable, aggregatable column in Insights. Standardize five fields on every line and queries 1–4
          above work without modification.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="logger.js"
            code={`// One helper, imported everywhere. Never console.log raw strings again.
const VERSION = process.env.APP_VERSION || "dev";

function log(level, message, fields = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level, message, version: VERSION,
    requestId: fields.requestId || "-",
    path: fields.path || "-",
    durationMs: fields.durationMs ?? -1,
    ...fields
  }));
}

log("INFO", "order created", { requestId: "req-9f21", path: "/checkout/confirm", durationMs: 184, orderId: "ord-551" });
log("ERROR", "PaymentFailed", { requestId: "req-9f21", path: "/checkout/confirm", reason: "card_declined", amount: 49.00 });`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{"timestamp":"2026-04-01T10:14:02Z","level":"ERROR","message":"PaymentFailed","version":"v1.4.2","requestId":"req-9f21","path":"/checkout/confirm","durationMs":-1,"reason":"card_declined","amount":49}
# Insights auto-extracts: filter version="v1.4.2" | stats count() by reason -- no parsing needed.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Required fields:</strong> timestamp, level, message, requestId (trace across services),
            version (deploy comparison). Add path, durationMs, status for HTTP services.
          </li>
          <li>
            <strong>Metric filters bonus:</strong> turn log patterns into metrics without code changes — e.g.
            filter <strong>PaymentFailed</strong> → custom metric + alarm. Logs become alarm sources for free.
          </li>
          <li>
            <strong>Never log:</strong> passwords, tokens, full card numbers, session cookies. Log the{" "}
            <strong>reason code</strong> (card_declined), not the PAN.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Archive to S3 and the OpenSearch question</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          CloudWatch is for hot debugging (days to weeks). <strong>S3 plus lifecycle rules</strong> is for
          compliance retention (months to years) at a tenth of the price. <strong>OpenSearch</strong> enters
          only when you need full-text search and ad-hoc exploration across huge volumes — and it bills by the
          hour whether you query or not.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws logs create-export-task --task-name checkout-april --log-group-name /prod/checkout/app --from 1743465600000 --to 1746057600000 --destination s3://logs-archive/checkout/ --region us-east-1
aws s3api put-bucket-lifecycle-configuration --bucket logs-archive --lifecycle-configuration '{"Rules":[{"ID":"logs-to-glacier","Status":"Enabled","Filter":{"Prefix":"checkout/"},"Transitions":[{"Days":90,"StorageClass":"GLACIER"}],"Expiration":{"Days":2555}}]}'
aws s3 ls s3://logs-archive/checkout/ --recursive --human-readable | head -5`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`ExportTask: created (taskId exp-8f21, status PENDING -> COMPLETED in ~10 min)
Lifecycle: applied (checkout/* -> GLACIER at 90 days, expire at 7 years)
s3://logs-archive/checkout/2026-04-01/app-0001.gz   84 MB  STANDARD (cooling to GLACIER)`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID] OpenSearch domain — t3.small ~$0.20/hr, tear down same session</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            A demo domain (t3.small, single AZ, 10 GB EBS) runs roughly $0.20/hr plus storage — fine for a
            two-hour exploration lab, expensive forgotten over a weekend. Create it, stream one log group via a
            subscription filter, run your searches, then delete the domain the same session and verify it is
            gone. For this course, Insights plus S3 covers 90% of needs for free-tier money.
          </p>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>When OpenSearch earns its cost:</strong> multi-service full-text search (find this requestId
            everywhere), security analytics, long-lived exploration dashboards. Otherwise Insights wins.
          </li>
          <li>
            <strong>Subscription-filter path:</strong> log group → subscription filter → Lambda or Kinesis
            Firehose → OpenSearch domain. One filter per group you actually explore.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A–Z: agent to Insights to archive</h2>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>A — Launch or reuse an EC2 host</strong> with an instance profile carrying
            CloudWatchAgentServerPolicy. Note the instance ID and region.
          </li>
          <li>
            <strong>B — Install the agent</strong> with the commands above and the JSON config (adjust file
            paths to your app). ✅ <strong>Verify checkpoint:</strong> agent status shows running and
            describe-log-groups lists your groups.
          </li>
          <li>
            <strong>C — Generate traffic:</strong> emit 50+ JSON log lines including 5+ ERROR lines with
            distinct reasons. ✅ <strong>Verify checkpoint:</strong> latest stream tail shows your JSON lines
            within 2 minutes.
          </li>
          <li>
            <strong>D — Run queries 1–3</strong> in Logs Insights against your group. ✅{" "}
            <strong>Verify checkpoint:</strong> error list, slow-endpoint table, and 5xx-by-path table all return
            rows (not empty).
          </li>
          <li>
            <strong>E — Deploy-compare drill:</strong> log half your lines with version v9.9.8 and half with
            v9.9.9 plus extra errors on the new one; run query 4. ✅ <strong>Verify checkpoint:</strong> error
            rate differs by version in the output.
          </li>
          <li>
            <strong>F — Metric filter alarm (optional free):</strong> create a metric filter on ERROR lines and
            attach the Lesson-2 style alarm. ✅ <strong>Verify checkpoint:</strong> filter test returns matches.
          </li>
          <li>
            <strong>Z — Archive and clean:</strong> export one day to S3, apply the lifecycle rule, set group
            retention to 14 days. ✅ <strong>Verify checkpoint:</strong> export task COMPLETED and S3 object
            exists; no OpenSearch domain left running.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Incident queries start from the alarm:</strong> alarm carries log-group link plus the exact
            Insights query with version and time range prefilled.
          </li>
          <li>
            <strong>Metric filters as cheap alarms:</strong> error-string → metric → alarm covers legacy apps you
            cannot re-instrument this quarter.
          </li>
          <li>
            <strong>Log-driven deploy gates:</strong> post-deploy job runs query 4; error-rate delta over threshold
            auto-rolls back the canary.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Unstructured logs:</strong> printf-style strings make every query a regex project. Emit JSON
            from day one.
          </li>
          <li>
            <strong>Missing IAM policy:</strong> agent installed but nothing ships — check the instance profile
            before debugging config syntax.
          </li>
          <li>
            <strong>Infinite retention:</strong> Never Expire on busy groups quietly builds a large bill. Set 14–30
            days and archive to S3.
          </li>
          <li>
            <strong>Logging secrets:</strong> tokens and card data in logs become a breach plus a compliance
            finding. Filter at the logger, not after shipping.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the five-stage pipeline and place the CloudWatch agent, log groups, Insights, and S3 on it.</li>
          <li>Write an agent JSON for two log files with different retentions and validate it with the agent-ctl check.</li>
          <li>Install the agent on a host, verify running status, and list the created log groups.</li>
          <li>Run Insights queries 1–4 against your group and save each result explanation in one sentence.</li>
          <li>Convert one plain-text log line to the structured JSON schema with all five required fields.</li>
          <li>Create a metric filter on ERROR lines and explain what alarm you would attach.</li>
          <li>Export one day of logs to S3, apply a Glacier lifecycle rule, and list the archived object.</li>
          <li>Write the one-paragraph case for and against OpenSearch for a 3-service startup.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
