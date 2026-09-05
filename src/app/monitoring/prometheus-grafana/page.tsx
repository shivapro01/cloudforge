import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Monitoring & Reliability"
      title="Prometheus & Grafana"
      intro="CloudWatch watches AWS well; Prometheus watches everything else — your code, your containers, your Kubernetes cluster — with one open model: services expose metrics, Prometheus scrapes them, PromQL queries them, Grafana draws them. This lesson builds that stack locally with Docker Compose, teaches four PromQL queries that answer real incidents, wires Grafana dashboards and alerts, and maps it all to ECS/EKS plus the managed AWS options."
      prev={{ href: "/monitoring/centralized-logging", label: "Centralized Logging" }}
      next={{ href: "/monitoring/sre-practices", label: "SRE: SLOs, HA & DR" }}
      resources={[
        {
          title: "Prometheus documentation — concepts and querying",
          url: "https://prometheus.io/docs/introduction/overview/",
          description:
            "Official docs for the pull model, metric types, scrape config, and the PromQL language intro used in this lesson.",
        },
        {
          title: "Grafana documentation — getting started",
          url: "https://grafana.com/docs/grafana/latest/getting-started/",
          description:
            "Official Grafana guide to datasources, dashboards, and alert rules — follow along with the local lab.",
        },
        {
          title: "Amazon Managed Service for Prometheus guide",
          url: "https://docs.aws.amazon.com/prometheus/latest/userguide/what-is-Amazon-Managed-Service-Prometheus.html",
          description:
            "How AMP fits EKS and ECS workloads, remote-write setup, and when managed collection beats self-hosting.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">The Prometheus model: expose, scrape, store, query</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Prometheus inverts the CloudWatch push habit: your app <strong>exposes</strong> a{" "}
          <strong>/metrics</strong> text endpoint, Prometheus <strong>pulls (scrapes)</strong> it every N
          seconds per <strong>job</strong>, stores timestamped series, and answers <strong>PromQL</strong>.
          Service discovery (DNS, EC2, Kubernetes) keeps target lists fresh as containers churn.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`YOUR APP                    PROMETHEUS                  GRAFANA
exposes /metrics          scrapes every 15s           queries + draws
+---------------+   GET /metrics   +----------------+   PromQL   +-----------+
| checkout:8080 |  <-------------- | scrape job     |  <-------- | dashboard |
| http_requests |   text format    |   checkout     |            |  panels   |
| _total 412    |                  |   node-exporter|  --------> |  alerts   |
| latency 0.2s  |   targets page   |   alert rules  |   Alertm.  +-----------+
+---------------+   up=1 / down=0  +----------------+
      ^                    ^                              Grafana never scrapes;
  client libs:             service discovery:             Prometheus is its
  Go / Java / Python       ec2_sd, dns_sd, k8s_sd         datasource.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Metric types that matter:</strong> <strong>counter</strong> (only up: requests total),{" "}
            <strong>gauge</strong> (up/down: queue depth, temp), <strong>histogram</strong> (latency buckets →
            p95/p99). Rate math needs counters; snapshots need gauges.
          </li>
          <li>
            <strong>Labels are dimensions:</strong> <strong>http_requests_total {"{method, status, route}"}</strong>{" "}
            works like CloudWatch dimensions — one metric name, sliced any way. Keep label cardinality low (no
            user IDs or request IDs as labels).
          </li>
          <li>
            <strong>DevOps use:</strong> deploy pipelines bump the <strong>version label</strong> on new
            releases, so PromQL compares error rates by version exactly like the Lesson-3 deploy query.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Scrape config: prometheus.yml plus targets check</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          One YAML file defines everything: global intervals, <strong>scrape jobs</strong> (what to pull, how
          often), and static or discovered targets. Start static locally; graduate to{" "}
          <strong>ec2_sd_configs</strong> or Kubernetes discovery on AWS.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="prometheus.yml"
            code={`global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "checkout-app"
    scrape_interval: 10s
    static_configs:
      - targets: ["demo-app:8080"]
        labels:
          service: "checkout"
          env: "lab"

  - job_name: "node"
    static_configs:
      - targets: ["node-exporter:9100"]

# On AWS later: replace static_configs with ec2_sd_configs
# (region + port + relabeling) so new instances join automatically.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker compose up -d && sleep 8
curl -s localhost:9090/-/healthy
curl -s localhost:9090/api/v1/targets | grep -o health.:.[a-z]* | sort | uniq -c`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`healthy (Prometheus ready, config valid)
      3 health":"up
# 3 targets up (prometheus, checkout-app, node). A down target here
# means wrong port, wrong Compose DNS name, or /metrics missing.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">PromQL basics: 4 queries that solve incidents</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          PromQL looks strange for ten minutes, then clicks: <strong>rate()</strong> turns counters into
          per-second flows, <strong>histogram_quantile()</strong> turns buckets into percentiles, division
          turns counts into ratios, and <strong>by (...)</strong> groups like SQL GROUP BY.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="promql-1-error-rate.promql"
            code={`# 5xx error rate over the last 5 minutes
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`0.0086  (0.86% of requests are 5xx over the last 5m)
# Alert when > 0.01 for 10m (page) or > 0.005 for 30m (ticket). Compare with Lesson-2 5xx alarm.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="promql-2-latency-p95.promql"
            code={`# p95 latency per route from histogram buckets
histogram_quantile(0.95,
  sum by (route, le) (rate(http_request_duration_seconds_bucket[5m])
))`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{route="/checkout/confirm"}  2.31
{route="/cart/add"}         0.42
{route="/health"}           0.01
# Same answer as Insights query 2, live from metrics instead of logs.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="promql-3-saturation.promql"
            code={`# Hosts over 85% memory (node-exporter)
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)
/
node_memory_MemTotal_bytes > 0.85`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{instance="node-exporter:9100"}  0.91
# Returns only offenders (empty = healthy). Pair with disk and CPU siblings for full saturation cover.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="promql-4-up-and-traffic.promql"
            code={`# Which targets are down + request rate per service
up{job="checkout-app"} == 0
sum by (service) (rate(http_requests_total[5m]))`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`(first query)  no rows = all up; a row with value 0 names the dead target
{service="checkout"}  159.7  (requests/sec across all instances)
# up==0 is your black-box heartbeat inside Prometheus: silence has a shape.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Grafana: datasource, dashboard import, alert rule</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Grafana never scrapes — it <strong>queries Prometheus</strong> as a datasource and renders panels.
          Import a community dashboard for the instant win, then build one deploy-comparison board by hand so
          you actually learn panel queries.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. Datasource: Grafana UI -> Connections -> Prometheus -> URL http://prometheus:9090 -> Save & Test
curl -s -u admin:admin localhost:3000/api/datasources | python3 -c "import json,sys; print([(d['name'], d['type'], d['url']) for d in json.load(sys.stdin)])"
# 2. Import community Node dashboard (ID 1860): Dashboards -> New -> Import -> paste 1860 -> select Prometheus datasource
# 3. Alert rule: Alerting -> Alert rules -> New -> PromQL expr -> folder + labels + 5m pending`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[(prometheus, prometheus, http://prometheus:9090)]  (datasource healthy: Test OK)
Dashboard 1860 imported: Node Exporter Full (CPU, mem, disk, net panels live)
Alert rule saved: checkout-5xx-rate-high (evaluates promql-1 every 1m, pending 5m, labels severity=page)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="grafana-alert.json"
            code={`{
  "title": "checkout-5xx-rate-high",
  "condition": "error rate > 1% for 10 minutes",
  "expr": "sum(rate(http_requests_total{status=~'5..'}[5m])) / sum(rate(http_requests_total[5m])) > 0.01",
  "for": "10m",
  "labels": { "severity": "page", "service": "checkout" },
  "annotations": {
    "summary": "Checkout 5xx rate above 1%",
    "runbook": "https://wiki.example.com/runbooks/checkout-5xx"
  }
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Panel recipe that teaches PromQL:</strong> one row, three panels — query 1 (error rate),
            query 2 (p95 by route), query 3 (saturation). If you can build that row, you can build any board.
          </li>
          <li>
            <strong>Alert routing:</strong> Grafana Alerting → contact points (Slack, PagerDuty, SNS webhook).
            Severity labels decide page vs ticket, mirroring Lesson-2 composite logic.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">ECS, EKS, and managed options on AWS [PAID notes]</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Local Compose teaches the model; AWS adds discovery and durability. On <strong>ECS</strong>,
          run Prometheus as a sidecar or separate service with <strong>ec2_sd / awscdk discovery</strong> and
          persist with remote-write. On <strong>EKS</strong>, <strong>kube-prometheus-stack</strong> via Helm
          gives exporters plus Grafana in one chart.
        </p>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID] Managed Prometheus (AMP) + Managed Grafana (AMG)</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            AMP bills per ingested sample plus queries — comfortable for class clusters, real money at high
            cardinality (many pods times many labels). AMG bills per active user/editor. Both remove
            storage, HA, and upgrade toil versus self-hosting. Lab rule: self-host locally (free), evaluate AMP
            with remote-write on a small EKS dev cluster only, and delete the workspace when the lesson ends.
          </p>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>ECS path:</strong> Prometheus task + EFS or remote-write to AMP; CloudWatch agent sidecar
            for logs; Grafana on Fargate behind ALB or AMG workspace.
          </li>
          <li>
            <strong>EKS path:</strong> Helm kube-prometheus-stack; ServiceMonitors auto-discover new services;
            remote-write to AMP for retention beyond local disk.
          </li>
          <li>
            <strong>When CloudWatch wins:</strong> pure-AWS small estates with no Kubernetes — CloudWatch plus
            Container Insights is simpler and cheaper than running Prometheus for three services.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A–Z: local stack, free forever [FREE]</h2>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>A — Compose file:</strong> services prometheus (config mount), grafana, node-exporter,
            demo-app (any sample app exposing /metrics, e.g. a TeachALabs counter app).
          </li>
          <li>
            <strong>B — Write prometheus.yml</strong> from this lesson, mount it, compose up. ✅{" "}
            <strong>Verify checkpoint:</strong> healthy endpoint returns OK and targets page shows 3 up.
          </li>
          <li>
            <strong>C — Explore /metrics:</strong> curl the demo-app endpoint, find a counter, a gauge, a
            histogram bucket set. ✅ <strong>Verify checkpoint:</strong> name one of each type.
          </li>
          <li>
            <strong>D — Run PromQL 1–4</strong> in the Prometheus graph UI, one at a time. ✅{" "}
            <strong>Verify checkpoint:</strong> error rate returns a number, p95 returns per-route rows,
            saturation returns empty-or-offenders, up query explains itself.
          </li>
          <li>
            <strong>E — Grafana datasource:</strong> add Prometheus at http://prometheus:9090, Save and Test. ✅{" "}
            <strong>Verify checkpoint:</strong> Test OK plus datasource listed via API.
          </li>
          <li>
            <strong>F — Build the one-row board:</strong> three panels from queries 1–3, 5-min refresh. Import
            dashboard 1860 as bonus. ✅ <strong>Verify checkpoint:</strong> panels render live data, not N/A.
          </li>
          <li>
            <strong>G — Alert rule:</strong> create checkout-5xx-rate-high from the JSON above, force errors to
            trigger it. ✅ <strong>Verify checkpoint:</strong> rule goes Pending → Firing, notification reaches
            your contact point.
          </li>
          <li>
            <strong>Z — Tear down:</strong> compose down -v. ✅ <strong>Verify checkpoint:</strong> docker ps
            shows nothing; total AWS spend $0.00.
          </li>
        </ol>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE TIER] Local lab costs nothing</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            Everything here runs on your machine via Docker — no AWS charges at all. The only paid surface in
            this lesson is AMP/AMG evaluation, which is explicitly optional and labeled above.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Kubernetes-native monitoring:</strong> every new service ships a ServiceMonitor, so
            scraping follows deploys with zero ticket to the platform team.
          </li>
          <li>
            <strong>PromQL in runbooks:</strong> each alert links the exact query plus the next drill-down
            query, so responders investigate instead of improvising.
          </li>
          <li>
            <strong>Grafana as deploy evidence:</strong> canary dashboards screenshot into release notes; error
            budget panels decide whether the next feature ships or reliability work wins the sprint.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>High-cardinality labels:</strong> user ID or request ID as a label explodes storage and bills
            (or OOMs) Prometheus. Labels are for bounded sets: method, status, route, version.
          </li>
          <li>
            <strong>rate() on gauges:</strong> rate assumes counters. On gauges it returns nonsense — use delta,
            avg_over_time, or max_over_time instead.
          </li>
          <li>
            <strong>Grafana scraping confusion:</strong> Grafana queries Prometheus; it never scrapes targets.
            Empty panels with healthy Prometheus means the datasource URL (prometheus:9090 vs localhost) is wrong.
          </li>
          <li>
            <strong>Self-hosting without retention plan:</strong> local disk fills in weeks at 15s intervals.
            Set retention (15d default is fine locally) and remote-write to AMP/S3 for history.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the expose-scrape-store-query model and explain why Prometheus pulls instead of receiving pushes.</li>
          <li>Write prometheus.yml with two jobs, start the stack, and verify all targets are up.</li>
          <li>curl a /metrics endpoint and classify one counter, one gauge, and one histogram.</li>
          <li>Run the error-rate and p95 queries and explain each function in one sentence.</li>
          <li>Write a saturation query for disk space and predict what empty vs one-row output means.</li>
          <li>Add Prometheus as a Grafana datasource and build the three-panel golden-signal row.</li>
          <li>Create the alert rule, trigger it with forced errors, and capture the firing notification.</li>
          <li>Compare self-hosted vs AMP/AMG in five lines: cost, toil, retention, discovery, and when you would pick each.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
