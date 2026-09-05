import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Monitoring & Reliability"
      title="Metrics, Alarms & Dashboards"
      intro="Metrics are the numbers, alarms are the judgment, dashboards are the shared picture. This lesson takes you from CloudWatch basics to fluency: namespaces and dimensions, statistics that do not lie, custom metrics from your own code, alarm anatomy with SNS and no-data handling, dashboards as versioned JSON, and Container and Lambda Insights for the services you will actually run."
      prev={{ href: "/monitoring/overview", label: "Start Here" }}
      next={{ href: "/monitoring/centralized-logging", label: "Centralized Logging" }}
      resources={[
        {
          title: "CloudWatch metrics, alarms, and dashboards guide",
          url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
          description:
            "Official reference for namespaces, dimensions, statistics, alarm states, and dashboard widgets with CLI examples.",
        },
        {
          title: "AWS Free Tier — CloudWatch allowances",
          url: "https://aws.amazon.com/free/",
          description:
            "Check current free-tier numbers for custom metrics, alarms, log ingestion, and dashboards before building the lab.",
        },
        {
          title: "Monitoring and observability — Skill Builder",
          url: "https://skillbuilder.aws/",
          description:
            "Search for the CloudWatch learning plan on Skill Builder for guided labs on metrics, alarms, and dashboards.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Namespaces, dimensions, statistics: the recap that matters</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>namespace</strong> is the bucket (<strong>AWS/EC2</strong>, <strong>AWS/ApplicationELB</strong>,{" "}
          <strong>YourApp/Orders</strong>). A <strong>metric name</strong> is what you measure (
          <strong>CPUUtilization</strong>, <strong>TargetResponseTime</strong>).{" "}
          <strong>Dimensions</strong> are the labels that slice it (<strong>InstanceId</strong>,{" "}
          <strong>LoadBalancer + TargetGroup</strong>). A <strong>statistic</strong> is how you aggregate over
          the period (<strong>Average, Maximum, Sum, p95</strong>). Get dimensions and statistics right and
          every graph you ever read makes sense.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws cloudwatch list-metrics --namespace AWS/ApplicationELB --region us-east-1 --max-items 5
aws cloudwatch get-metric-statistics --namespace AWS/ApplicationELB --metric-name TargetResponseTime --dimensions Name=LoadBalancer,Value=app/demo/ab12 Name=TargetGroup,Value=targetgroup/web/xy34 --statistics p95 Average Maximum --start-time 2026-04-01T10:00:00Z --end-time 2026-04-01T11:00:00Z --period 300 --region us-east-1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`NAMESPACE AWS/ApplicationELB:
  RequestCount               LoadBalancer=app/demo/ab12
  TargetResponseTime         LoadBalancer=app/demo/ab12 TargetGroup=targetgroup/web/xy34
  HTTPCode_Target_5XX_Count  LoadBalancer=app/demo/ab12 TargetGroup=targetgroup/web/xy34

STATISTICS for TargetResponseTime (5-min periods):
  Timestamp             p95     Average   Maximum
  2026-04-01T10:00Z     0.21s   0.09s     1.40s
  2026-04-01T10:05Z     0.24s   0.10s     2.10s
  # Average looks flat. p95 creeps. Maximum spikes. Alert on p95, not Average.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Statistic rule of thumb:</strong> latency → <strong>p95/p99</strong>; error counts →{" "}
            <strong>Sum</strong> (then divide by request Sum for a rate); CPU → <strong>Average</strong> for
            trend plus <strong>Maximum</strong> to catch single hot hosts.
          </li>
          <li>
            <strong>Dimension trap:</strong> the same metric name with different dimensions is a different
            metric stream. Alarm on the <strong>LoadBalancer + TargetGroup</strong> pair, not the bare metric
            name, or you aggregate every app behind the ALB together.
          </li>
          <li>
            <strong>Period vs evaluation:</strong> period is the bucket size (60s, 300s); evaluation is how many
            consecutive bad buckets fire the alarm (3 out of 3). Short period plus 1-out-of-1 is twitchy;
            start with 5-min periods and 2–3 datapoints.
          </li>
          <li>
            <strong>DevOps use:</strong> tag-driven dimensions (<strong>Service, Environment, Version</strong>)
            let one dashboard template serve dev, stage, and prod — and let deploy markers split canary vs
            stable by version dimension.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Custom metrics: emit what AWS cannot know</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          AWS knows CPU and request counts. Only your code knows <strong>orders placed, queue depth, failed
          payments, cache hit rate</strong>. Publish those with <strong>put-metric-data</strong> (or the
          embedded metric format from Lambda) and they become first-class alarm sources.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws cloudwatch put-metric-data --namespace YourApp/Orders --metric-name OrdersPlaced --value 1 --unit Count --dimensions Service=checkout,Environment=prod --region us-east-1
aws cloudwatch put-metric-data --namespace YourApp/Orders --metric-name PaymentFailed --value 1 --unit Count --dimensions Service=checkout,Environment=prod,Reason=card_declined --region us-east-1
aws cloudwatch get-metric-statistics --namespace YourApp/Orders --metric-name OrdersPlaced --dimensions Name=Service,Value=checkout Name=Environment,Value=prod --statistics Sum --start-time 2026-04-01T10:00:00Z --end-time 2026-04-01T11:00:00Z --period 300 --region us-east-1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`PutMetricData: HTTP 200 (no body on success - metric accepted)
PutMetricData: HTTP 200 (metric accepted)

OrdersPlaced Sum per 5 min (Service=checkout, Environment=prod):
  2026-04-01T10:00Z   412
  2026-04-01T10:05Z   388
  2026-04-01T10:10Z   97    <-- deploy went out here; traffic same, orders fell
  # Pair with PaymentFailed Sum to see: orders down AND payment failures up = bug, not low demand.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>High-resolution option:</strong> <strong>--storage-resolution 1</strong> gives 1-second
            granularity for fast-burn alarms; standard is 60s. Costs more — reserve for payment paths.
          </li>
          <li>
            <strong>Prefer dimensions over namespaces per env:</strong> one namespace{" "}
            <strong>YourApp/Orders</strong> with <strong>Environment</strong> dimension beats three namespaces.
            Dashboards template with a variable instead of triplicating widgets.
          </li>
          <li>
            <strong>Lambda shortcut:</strong> log a JSON line in embedded metric format and CloudWatch
            auto-extracts the metric — no SDK call, no extra latency in the handler hot path.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID] Custom metrics and detailed monitoring</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            10 custom metrics are free; beyond that each metric-month is billed, plus per-1k API calls for
            put-metric-data. EC2 detailed monitoring (1-min periods) is also paid — standard 5-min is fine for
            this lab. Delete practice metrics and disable detailed monitoring when done.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Alarm anatomy: threshold, anomaly, composite + SNS + no-data</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every alarm has four decisions: <strong>what signal, what condition, what to do, what missing data
          means</strong>. Skip the last one and your alarm either pages on nothing or sleeps through outages.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws sns create-topic --name ops-alerts --region us-east-1
aws sns subscribe --topic-arn arn:aws:sns:us-east-1:123456789012:ops-alerts --protocol email --notification-endpoint oncall@example.com --region us-east-1
aws cloudwatch put-metric-alarm --alarm-name prod-5xx-rate-high --namespace AWS/ApplicationELB --metric-name HTTPCode_Target_5XX_Count --dimensions Name=LoadBalancer,Value=app/demo/ab12 --statistic Sum --period 300 --evaluation-periods 2 --threshold 50 --comparison-operator GreaterThanThreshold --treat-missing-data notBreaching --alarm-actions arn:aws:sns:us-east-1:123456789012:ops-alerts --ok-actions arn:aws:sns:us-east-1:123456789012:ops-alerts --region us-east-1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`CreateTopic: arn:aws:sns:us-east-1:123456789012:ops-alerts
Subscribe: pending-confirmation (check inbox, click Confirm link)
PutMetricAlarm: HTTP 200 - alarm prod-5xx-rate-high created

Alarm states: OK -> ALARM (2 consecutive 5-min periods over 50 5xx) -> OK (recovery notifies SNS too)
Missing data: notBreaching (no traffic at 4am does NOT page)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Threshold alarms:</strong> static line (5xx Sum over 50, CPU over 80%). Simple, predictable,
            best for saturation and known-bad counts.
          </li>
          <li>
            <strong>Anomaly detection alarms:</strong> CloudWatch learns the band (daily traffic curve) and
            alarms outside it. Best for spiky business metrics like order rate where no static line fits. Costs
            extra per alarm — use on a few money metrics, not everything.
          </li>
          <li>
            <strong>Composite alarms:</strong> combine children with logic, e.g.{" "}
            <strong>ALARM(high-5xx) AND ALARM(p99-high)</strong> pages, while either alone just tickets. Cuts
            pages during single-signal blips.
          </li>
          <li>
            <strong>Treat-missing-data:</strong> <strong>notBreaching</strong> for low-traffic services (silence
            is fine); <strong>breaching</strong> for heartbeats (silence means the emitter died — page);{" "}
            <strong>ignore</strong> while backfilling. Wrong choice here is the number-one cause of 4am pages
            and missed outages alike.
          </li>
          <li>
            <strong>DevOps use:</strong> alarm actions fan out: SNS → PagerDuty/OpsGenie for pages, a second SNS
            → Lambda for auto-remediation (restart task, drain target), OK-actions → chat channel so the team
            sees recovery without asking.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Dashboards: widgets plus versioned JSON</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Click-built dashboards rot: nobody remembers what changed. Treat dashboards as code —{" "}
          <strong>put-dashboard</strong> with a JSON file in Git — so deploy reviews diff the monitoring along
          with the app. One row per golden signal, canary vs stable overlaid.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="dashboard.json"
            code={`{
  "widgets": [
    {
      "type": "metric", "x": 0, "y": 0, "width": 12, "height": 6,
      "properties": {
        "title": "Latency p95 (canary vs stable)",
        "metrics": [
          ["AWS/ApplicationELB", "TargetResponseTime",
           "LoadBalancer", "app/demo/ab12", {"stat": "p95", "label": "stable"}],
          ["AWS/ApplicationELB", "TargetResponseTime",
           "LoadBalancer", "app/demo-canary/cd34", {"stat": "p95", "label": "canary"}]
        ],
        "period": 300, "region": "us-east-1"
      }
    },
    {
      "type": "metric", "x": 12, "y": 0, "width": 12, "height": 6,
      "properties": {
        "title": "5xx Sum + RequestCount",
        "metrics": [
          ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count",
           "LoadBalancer", "app/demo/ab12", {"stat": "Sum"}],
          ["AWS/ApplicationELB", "RequestCount",
           "LoadBalancer", "app/demo/ab12", {"stat": "Sum"}]
        ],
        "period": 300, "region": "us-east-1"
      }
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws cloudwatch put-dashboard --dashboard-name deploy-golden-signals --dashboard-body file://dashboard.json --region us-east-1
aws cloudwatch list-dashboards --region us-east-1 --query 'DashboardEntries[*].DashboardName' --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`PutDashboard: HTTP 200 - dashboard deploy-golden-signals saved
------------------------
|    ListDashboards      |
+------------------------+
|  deploy-golden-signals |
|  lambda-overview       |
|  ecs-services          |
+------------------------+
# 3 dashboards = free-tier limit. Delete practice boards before creating more.`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE TIER] 10 metrics, 10 alarms, 3 dashboards</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            Stay inside 10 custom metrics, 10 alarms, and 3 dashboards and this whole lesson is free. The lab
            below is designed to fit exactly: 2 custom metrics, 3 alarms, 1 dashboard. Exceed any count and
            billing starts silently — check the CloudWatch console billing widget after the lab.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Container Insights and Lambda Insights in one glance</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Raw EC2 metrics stop at the host. <strong>Container Insights</strong> (ECS/EKS) adds per-service,
          per-task CPU, memory, and network without custom code. <strong>Lambda Insights</strong> adds per-function
          memory, duration, and cold-start layers via one Lambda layer. Enable both before you need them —
          during an incident is too late to start collecting.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Container Insights:</strong> one toggle per cluster; metrics land under{" "}
            <strong>ECS/ContainerInsights</strong> (cpu_utilized, memory_utilized per service). Alarm on{" "}
            <strong>service memory over 85%</strong> — OOM kills are the top ECS surprise.
          </li>
          <li>
            <strong>Lambda Insights:</strong> attach the layer plus the managed policy; metrics land under{" "}
            <strong>Lambda/Insights</strong>. Watch <strong>InitDuration</strong> (cold starts) and{" "}
            <strong>memory_utilization</strong> to right-size memory (which also sets CPU).
          </li>
          <li>
            <strong>Cost note:</strong> both emit extra custom-metric charges at scale — free for one lab
            service and a few functions, noticeable across hundreds. Disable on idle dev clusters.
          </li>
          <li>
            <strong>DevOps use:</strong> deploy pipelines snapshot Insights graphs pre/post deploy; a memory
            climb that starts exactly at the new revision is a leak, not load.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A–Z: golden-signal alarm stack [FREE inside limits]</h2>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>A — Pick a target:</strong> an ALB with a target group, or create the free-tier sample app
            from Module 04. Note region and LoadBalancer dimension value.
          </li>
          <li>
            <strong>B — Create the SNS topic</strong> with the commands above; confirm the email subscription.{" "}
            ✅ <strong>Verify checkpoint:</strong> <strong>list-subscriptions</strong> shows PendingConfirmation
            → Confirmed after you click the link.
          </li>
          <li>
            <strong>C — Publish two custom metrics</strong> (OrdersPlaced, PaymentFailed) with Environment=prod
            dimensions. ✅ <strong>Verify checkpoint:</strong> <strong>get-metric-statistics Sum</strong> returns
            your datapoints within 5 minutes.
          </li>
          <li>
            <strong>D — Create three alarms:</strong> 5xx Sum threshold, p95 latency threshold, custom-metric
            anomaly or threshold on PaymentFailed. Set <strong>treat-missing-data notBreaching</strong>. ✅{" "}
            <strong>Verify checkpoint:</strong> <strong>describe-alarms</strong> shows all three in OK.
          </li>
          <li>
            <strong>E — Build the dashboard JSON</strong> above (edit LoadBalancer values), put-dashboard, open
            it in console. ✅ <strong>Verify checkpoint:</strong> widgets render data, canary vs stable lines
            both visible (flat is fine).
          </li>
          <li>
            <strong>F — Test the loop:</strong> force a 5xx spike (bad target or load-test path), watch alarm go
            ALARM → email arrives → fix → OK notification. ✅ <strong>Verify checkpoint:</strong> alarm history
            shows OK → ALARM → OK with timestamps.
          </li>
          <li>
            <strong>Z — Clean up to stay free:</strong> delete alarms, dashboard, and custom metric streams you
            do not need; keep counts under 10/10/3. ✅ <strong>Verify checkpoint:</strong> list-alarms and
            list-dashboards match your kept inventory.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Dashboards as code in the app repo:</strong> dashboard.json reviewed in the same PR as the
            feature, so new endpoints ship with their latency widget and alarm.
          </li>
          <li>
            <strong>Composite alarms gate pages:</strong> single-signal blips ticket; correlated latency plus
            errors page. On-call sleep is a reliability feature.
          </li>
          <li>
            <strong>Custom business metrics in deploy gates:</strong> orders-per-minute drop blocks canary
            promotion even when infra metrics are green.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Averaging latency:</strong> Average hides tail pain. Alarm on p95/p99 for user-facing paths.
          </li>
          <li>
            <strong>Ignoring missing-data semantics:</strong> default ignore can mask a dead emitter; notBreaching
            on a heartbeat means silence never pages. Choose per alarm, deliberately.
          </li>
          <li>
            <strong>Click-only dashboards:</strong> unversioned boards drift and cannot be reviewed. Commit the JSON.
          </li>
          <li>
            <strong>Alarming on counts without traffic context:</strong> 50 errors at 3am traffic vs 50 at peak
            are different universes. Alarm on the rate or pair count with RequestCount.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>List metrics in AWS/ApplicationELB and identify the dimensions on TargetResponseTime.</li>
          <li>Fetch p95 vs Average vs Maximum for one hour and explain which you would alarm on and why.</li>
          <li>Publish a custom metric with two dimensions and retrieve it with get-metric-statistics.</li>
          <li>Create an SNS topic, subscribe, confirm, and send a test notification.</li>
          <li>Create a threshold alarm with treat-missing-data notBreaching and describe its state.</li>
          <li>Explain when you would use an anomaly alarm vs a composite alarm, with one example each.</li>
          <li>Write dashboard.json for your stack, deploy with put-dashboard, and screenshot the latency row.</li>
          <li>Enable Container Insights or Lambda Insights on one service and name the first alarm you would add.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
