import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Configuration & Automation"
      title="Lambda Automation"
      intro="Lambda is operations without servers: a Python function that sleeps until an EventBridge schedule, an S3 upload, or an EC2 state change wakes it — then it stops idle instances, resizes an image, or pages you, and vanishes. Module 04 introduced Lambda; here you give it a least-privilege role, build a scheduled dev-instance killer with dry-run safety, wire an S3 log processor, handle failures with DLQs, and observe everything in CloudWatch — all inside the free tier."
      prev={{ href: "/automation/systems-manager", label: "Systems Manager" }}
      next={{ href: "/automation/boto3", label: "Boto3" }}
      resources={[
        {
          title: "AWS Lambda Developer Guide",
          url: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html",
          description:
            "Official guide to handlers, triggers, execution roles, retries, destinations, and observability.",
        },
        {
          title: "AWS Free Tier — Lambda",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm the 1M free requests and 400,000 GB-seconds per month allowance used by this lesson's functions.",
        },
        {
          title: "Python Tutorial",
          url: "https://docs.python.org/3/tutorial/",
          description:
            "Standard-library refresher for the boto3 handler code: functions, dicts, os.environ, and json.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">A. Event-driven ops: schedules and events wake your function</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          SSM automation is <strong>command-driven</strong> (you press the
          button). Lambda automation is <strong>event-driven</strong> (AWS
          presses it for you). An <strong>event source</strong> — an
          EventBridge cron schedule, an S3 ObjectCreated notification, an EC2
          state-change event — invokes your function with a JSON{" "}
          <strong>event payload</strong>, Lambda runs the handler, and the
          function calls back into AWS (stop an instance, write a thumbnail,
          send an SNS alert). No servers, no polling loop, no cron box to
          patch.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram — three triggers, one pattern"
            code={`EventBridge schedule ──cron(0 19 ? * MON-FRI *)──┐
                                                     v
S3 upload (s3:ObjectCreated:*) ──event JSON────────> LAMBDA ──boto3──> FIX / NOTIFY
                                                     ^        |
EC2 state change (running → stopped) ──event───────┘        +--> EC2 StopInstances
                                                             +--> SNS publish
                                                             +--> S3 PutObject (thumbnail)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Module 04 assumed:</strong> you already know handler,
            runtime (Python 3.12), memory/timeout settings, and environment
            variables. This lesson adds the ops layer: schedules, least
            privilege, dry-run safety, DLQs, and alarms.
          </li>
          <li>
            <strong>Sync vs async:</strong> EventBridge and S3 invoke
            asynchronously (fire-and-forget with retries); API Gateway invokes
            synchronously (caller waits). Ops automation is almost always
            async — design for retries and duplicates.
          </li>
          <li>
            <strong>DevOps uses:</strong> nightly &quot;stop dev after
            hours&quot; schedule; S3 log-file processor that parses and alerts;
            EC2-state watcher that tags, snapshots, or notifies on every stop.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">B. Execution role: least privilege in JSON</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every Lambda assumes an <strong>execution role</strong>. The managed
          policy AWSLambdaBasicExecutionRole grants only CloudWatch Logs
          writes — you add <strong>exactly the EC2/SNS/S3 actions the handler
          needs, scoped to tagged resources</strong>. A wide-open ec2:* on *
          turns a schedule bug into a production outage; the policy below can
          only describe everything but stop <strong>Env=dev</strong> instances
          and publish to <strong>one SNS topic</strong>.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="lambda-ops-policy.json — least-privilege policy"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Logs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:123456789012:log-group:/aws/lambda/dev-cleanup:*"
    },
    {
      "Sid": "FindDevInstances",
      "Effect": "Allow",
      "Action": ["ec2:DescribeInstances", "ec2:DescribeInstanceStatus"],
      "Resource": "*"
    },
    {
      "Sid": "StopDevOnly",
      "Effect": "Allow",
      "Action": ["ec2:StopInstances"],
      "Resource": "arn:aws:ec2:*:123456789012:instance/*",
      "Condition": {
        "StringEquals": { "aws:ResourceTag/Env": "dev" }
      }
    },
    {
      "Sid": "NotifyOneTopic",
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "arn:aws:sns:us-east-1:123456789012:ops-alerts"
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — create role and attach policies"
            code={`aws iam create-role --role-name lambda-dev-cleanup \\
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam put-role-policy --role-name lambda-dev-cleanup --policy-name ops-least-privilege --policy-document file://lambda-ops-policy.json
aws iam attach-role-policy --role-name lambda-dev-cleanup \\
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{ "Role": { "RoleName": "lambda-dev-cleanup" } }
# put-role-policy and attach-role-policy return empty on success — verify:
# aws iam list-attached-role-policies --role-name lambda-dev-cleanup`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Describe is broad, mutating is narrow:</strong> Describe*
            cannot filter by tag (hence Resource *), but StopInstances can —
            the Condition on aws:ResourceTag/Env=dev is what protects prod.
          </li>
          <li>
            <strong>Verify checkpoint:</strong> simulate with IAM Access
            Analyzer or a dry-run invoke (section C) before scheduling —
            stopping prod is not the way to test a Condition.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">C. Scheduled cleanup A–Z: stop dev EC2 after hours</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The classic ops Lambda: every weekday at 19:00, find{" "}
          <strong>running</strong> instances tagged <strong>Env=dev</strong>{" "}
          and stop them. The handler below lists by filter, honors a{" "}
          <strong>DRY_RUN flag</strong> (log what it would stop, change
          nothing), stops the rest, and publishes a summary to SNS. Deploy it
          from the console for learning, from the CLI for repeatability — both
          paths shown.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="function.py — scheduled dev-instance cleanup"
            code={`import os
import json
import boto3

ec2 = boto3.client("ec2")
sns = boto3.client("sns")

TOPIC_ARN = os.environ.get("ALERT_TOPIC_ARN", "")
DRY_RUN = os.environ.get("DRY_RUN", "true").lower() == "true"


def find_dev_running():
    paginator = ec2.get_paginator("describe_instances")
    found = []
    for page in paginator.paginate(
        Filters=[
            {"Name": "tag:Env", "Values": ["dev"]},
            {"Name": "instance-state-name", "Values": ["running"]},
        ]
    ):
        for r in page["Reservations"]:
            for i in r["Instances"]:
                found.append(i["InstanceId"])
    return found


def lambda_handler(event, context):
    source = event.get("source", "manual-test")
    targets = find_dev_running()

    if not targets:
        msg = f"[{source}] dev-cleanup: no running Env=dev instances."
        print(msg)
        return {"statusCode": 200, "body": json.dumps({"stopped": [], "dry_run": DRY_RUN})}

    if DRY_RUN:
        msg = f"[{source}] DRY_RUN: would stop {targets}"
        print(msg)
    else:
        resp = ec2.stop_instances(InstanceIds=targets)
        stopped = [s["InstanceId"] for s in resp.get("StoppingInstances", [])]
        msg = f"[{source}] stopped {stopped}"
        print(msg)

    if TOPIC_ARN:
        sns.publish(TopicArn=TOPIC_ARN, Subject="dev-cleanup report", Message=msg)

    return {"statusCode": 200, "body": json.dumps({"stopped": targets, "dry_run": DRY_RUN})}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — deploy via CLI + wire the schedule"
            code={`zip function.zip function.py
aws lambda create-function --function-name dev-cleanup \\
  --runtime python3.12 --handler function.lambda_handler \\
  --role arn:aws:iam::123456789012:role/lambda-dev-cleanup \\
  --zip-file fileb://function.zip --timeout 60 --memory-size 128 \\
  --environment 'Variables={DRY_RUN=true,ALERT_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:ops-alerts}'

aws events put-rule --name dev-cleanup-weeknights \\
  --schedule-expression 'cron(0 19 ? * MON-FRI *)' --state ENABLED
aws lambda add-permission --function-name dev-cleanup --statement-id allow-events \\
  --action 'lambda:InvokeFunction' --principal events.amazonaws.com \\
  --source-arn arn:aws:events:us-east-1:123456789012:rule/dev-cleanup-weeknights
aws events put-targets --rule dev-cleanup-weeknights \\
  --targets '[{"Id":"1","Arn":"arn:aws:lambda:us-east-1:123456789012:function:dev-cleanup"}]'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{ "FunctionArn": "arn:aws:lambda:us-east-1:123456789012:function:dev-cleanup" }
{ "RuleArn": "arn:aws:events:us-east-1:123456789012:rule/dev-cleanup-weeknights" }
{"Statement": "{... allow-events ...}"}
{ "FailedEntryCount": 0, "FailedEntries": [] }`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — test invoke (dry-run first, then live)"
            code={`aws lambda invoke --function-name dev-cleanup \\
  --payload '{"source":"manual-test"}' /tmp/out.json && cat /tmp/out.json

aws lambda update-function-configuration --function-name dev-cleanup \\
  --environment 'Variables={DRY_RUN=false,ALERT_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:ops-alerts}'
aws lambda invoke --function-name dev-cleanup \\
  --payload '{"source":"manual-test-live"}' /tmp/out2.json && cat /tmp/out2.json`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{"StatusCode": 200, "ExecutedVersion": "$LATEST"}
{"statusCode": 200, "body": "{\\"stopped\\": [\\"i-0a1b2c3d4e5f60718\\"], \\"dry_run\\": true}"}
{"StatusCode": 200, "ExecutedVersion": "$LATEST"}
{"statusCode": 200, "body": "{\\"stopped\\": [\\"i-0a1b2c3d4e5f60718\\"], \\"dry_run\\": false}"}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Console path:</strong> Lambda → Create function → Author
            from scratch (Python 3.12) → paste function.py → Configuration →
            Environment variables (DRY_RUN=true) → Add trigger → EventBridge
            (dev-cleanup-weeknights) → Test tab with the same
            manual-test payload.
          </li>
          <li>
            <strong>DRY_RUN discipline:</strong> ship every mutating function
            defaulting to true; flip to false only after the dry-run log names
            exactly the instances you expect. This one flag prevents the
            &quot;stopped prod&quot; postmortem.
          </li>
          <li>
            <strong>Verify checkpoint:</strong> dry-run invoke returns stopped
            IDs with dry_run true and instances still running; live invoke
            actually stops them and SNS receives the report.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">D. S3-triggered example: log processor (and thumbnails)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Same handler shape, different event: an S3{" "}
          <strong>ObjectCreated</strong> notification delivers the bucket and
          key; your code fetches the object, processes it (parse error lines
          from a log, or resize an image with Pillow), and writes the result
          back. The thumbnail variant is identical except for the processing
          step — swap the parse loop for a resize call.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="event.json — S3 ObjectCreated excerpt"
            code={`{
  "Records": [
    {
      "eventSource": "aws:s3",
      "eventName": "ObjectCreated:Put",
      "s3": {
        "bucket": { "name": "myapp-logs" },
        "object": { "key": "app/2026-09-05.log", "size": 18432 }
      }
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="function.py — log-processor sketch (thumbnail = swap the loop)"
            code={`import json
import urllib.parse
import boto3

s3 = boto3.client("s3")
sns = boto3.client("sns")
TOPIC_ARN = "arn:aws:sns:us-east-1:123456789012:ops-alerts"


def lambda_handler(event, context):
    for record in event.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])
        obj = s3.get_object(Bucket=bucket, Key=key)
        body = obj["Body"].read().decode("utf-8", errors="replace")
        errors = [l for l in body.splitlines() if "ERROR" in l][:20]
        print(f"{key}: {len(errors)} error lines")
        # thumbnail variant: download to /tmp, Pillow resize, put_object to dst bucket
        if errors:
            sns.publish(TopicArn=TOPIC_ARN, Subject=f"errors in {key}",
                        Message="\\n".join(errors))
    return {"statusCode": 200, "body": json.dumps({"processed": len(event.get("Records", []))})}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Wire the trigger:</strong> S3 bucket → Properties → Event
            notifications → ObjectCreated (Put) with prefix app/ and suffix
            .log → your function. Never point source and destination at the
            same prefix (see mistakes: recursive triggers).
          </li>
          <li>
            <strong>DevOps uses:</strong> log processors that alert on ERROR
            bursts; thumbnail/resize pipelines (uploads/ → thumbs/); CSV
            validators that quarantine bad files before ETL.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">E. Destinations, DLQ, and retries: failing safely</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Async invokes (EventBridge, S3) <strong>retry twice</strong> with
          delays, then give up. Without configuration the failure vanishes
          into logs. A <strong>dead-letter queue (DLQ)</strong> or{" "}
          <strong>on-failure destination</strong> (SQS queue, SNS topic, another
          Lambda) captures the event for replay, while an{" "}
          <strong>on-success destination</strong> chains the next step. Set
          these on day one for every mutating function.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram — async failure handling"
            code={`EventBridge / S3 ──async invoke──> LAMBDA (dev-cleanup)
                                              |
                                     success  |  failure (retry 1, retry 2)
                                        |     |     |
                                        v     v     v
                              on-success dest  on-failure dest ──> SQS DLQ
                              (next Lambda /     (ops-alerts SNS /
                               EventBridge)       replay queue)
                                        |
                                        v
                              CloudWatch alarm on Errors > 0
                              pages the on-call human`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — set failure destination + reserved retries"
            code={`aws lambda update-function-configuration --function-name dev-cleanup \\
  --dead-letter-config '{"TargetArn":"arn:aws:sqs:us-east-1:123456789012:dev-cleanup-dlq"}'

aws lambda put-function-event-invoke-config --function-name dev-cleanup \\
  --maximum-retry-attempts 2 --maximum-event-age-in-seconds 3600 \\
  --destination-config '{"OnFailure":[{"Destination":"arn:aws:sqs:us-east-1:123456789012:dev-cleanup-dlq"}],"OnSuccess":[{"Destination":"arn:aws:sns:us-east-1:123456789012:ops-alerts"}]}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{ "FunctionArn": "...:dev-cleanup", "DeadLetterConfig": { "TargetArn": "...:dev-cleanup-dlq" } }
{ "MaximumRetryAttempts": 2, "MaximumEventAgeInSeconds": 3600, "DestinationConfig": { "OnFailure": [...], "OnSuccess": [...] } }`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DLQ vs destination:</strong> DLQ is the legacy single
            queue; event-invoke-config destinations add success routing and
            SNS/Lambda/EventBridge targets. Configure destinations and keep
            the DLQ as the backstop.
          </li>
          <li>
            <strong>Make handlers idempotent:</strong> retries deliver twice —
            stop_instances on an already-stopped instance must succeed, SNS
            dedupe or conditional writes must tolerate replays.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">F. Observability: Logs, X-Ray traces, and error alarms</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every print() lands in <strong>CloudWatch Logs</strong> under
          /aws/lambda/&lt;name&gt;; enable <strong>X-Ray active tracing</strong>{" "}
          to see boto3 call latency per downstream service; add a{" "}
          <strong>CloudWatch alarm on Errors</strong> so failures page you
          instead of rotting in logs. Check all three after every test invoke.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — read logs and enable tracing + alarm"
            code={`aws logs tail /aws/lambda/dev-cleanup --since 15m --format short

aws lambda update-function-configuration --function-name dev-cleanup \\
  --tracing-config '{"Mode":"Active"}'

aws cloudwatch put-metric-alarm --alarm-name dev-cleanup-errors \\
  --metric-name Errors --namespace AWS/Lambda --statistic Sum --period 300 \\
  --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold \\
  --evaluation-periods 1 --dimensions Name=FunctionName,Value=dev-cleanup \\
  --alarm-actions arn:aws:sns:us-east-1:123456789012:ops-alerts`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`2026-09-05T19:00:01 [INFO] [manual-test] DRY_RUN: would stop ['i-0a1b2c3d4e5f60718']
2026-09-05T19:00:01 REPORT Duration: 812 ms Billed: 813 ms Memory: 128 MB
# X-Ray console: dev-cleanup trace → 620 ms ec2:DescribeInstances, 140 ms sns:Publish
# Alarm dev-cleanup-errors: OK (0 errors in 5 min)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Structured prints pay off:</strong> log JSON
            (instance, action, dry_run) not prose — CloudWatch Insights
            queries (filter dry_run=false) find live stops in seconds.
          </li>
          <li>
            <strong>Verify checkpoint:</strong> tail shows your dry-run line
            plus REPORT; X-Ray map shows the function → EC2/SNS edges; the
            alarm sits in OK until a real failure flips it.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Cost: free until you buy speed or private networking</h2>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-zinc-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-zinc-300">
          <p className="font-medium text-emerald-800 dark:text-emerald-300">FREE — 1M requests + 400,000 GB-seconds/month</p>
          <p className="mt-1 text-sm leading-6">
            The cleanup schedule (1 invoke/day) and log processor (dozens of
            S3 events) cost $0 forever under the Free Tier — and stay under a
            dollar far beyond it. CloudWatch Logs ingestion for print() lines
            is the only meter that moves, measured in cents.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 text-zinc-700 dark:border-red-800 dark:bg-red-950 dark:text-zinc-300">
          <p className="font-medium text-red-800 dark:text-red-300">PAID — provisioned concurrency + VPC NAT</p>
          <p className="mt-1 text-sm leading-6">
            Provisioned concurrency (keeping functions warm for latency) bills
            per GB-second whether invoked or not — never enable it for ops
            schedules. Attaching Lambda to a VPC without a NAT gateway strands
            it with no internet (boto3 calls time out); a NAT gateway runs
            ~$30+/month — keep ops functions outside a VPC unless a private
            resource truly requires it.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            No timeout tuning: default 3 seconds kills any describe/stop loop
            mid-run — set 60s for cleanup, up to 5 min for processors, and
            watch REPORT Duration vs timeout in logs.
          </li>
          <li>
            Recursive S3 triggers: function writes output to the same
            prefix it watches (uploads/ → uploads/) and invokes itself until
            throttled — always separate source (uploads/) and destination
            (thumbs/, processed/) prefixes.
          </li>
          <li>
            Wide-open role: ec2:* on * turns a tag typo (Env=dev vs
            Env=prod) into stopped production — scope StopInstances with the
            aws:ResourceTag/Env condition from section B and test with
            DRY_RUN=true first.
          </li>
          <li>
            VPC without NAT: attaching the function to private subnets for
            &quot;security&quot; with no NAT gateway breaks EC2/SNS/S3 API
            calls (timeouts, retries, DLQ) — stay out of a VPC, or add NAT /
            VPC endpoints deliberately.
          </li>
          <li>
            Forgetting EventBridge permission: rule exists but invocations
            never arrive with no error — the add-permission statement for
            events.amazonaws.com (section C) is mandatory for cross-service
            invokes.
          </li>
          <li>
            Non-idempotent handler: SNS alert sent before the stop succeeds,
            so a retry pages twice — mutate first, notify from the confirmed
            result, and make replays safe.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Redraw the event-driven diagram from memory with all three triggers and explain sync vs async invokes to a peer.</li>
          <li>Create lambda-dev-cleanup role with the least-privilege JSON from section B and explain each Sid in one sentence.</li>
          <li>Deploy dev-cleanup via the console (paste function.py, DRY_RUN=true), test-invoke with manual payload, and paste the dry-run log line.</li>
          <li>Redeploy via CLI (zip + create/update), wire the weeknight EventBridge cron, and prove the add-permission statement exists.</li>
          <li>Flip DRY_RUN to false against a tagged Env=dev t3.micro, confirm it stops, restart it, and flip back to true — saving both outputs.</li>
          <li>Build the S3 log processor: upload a .log with ERROR lines, confirm SNS receives the excerpt, then describe how you would swap in thumbnail resizing.</li>
          <li>Configure the DLQ + on-failure destination, force a failure (bad topic ARN), and show the event landing in the DLQ with an alarm firing.</li>
          <li>Enable X-Ray tracing, tail CloudWatch Logs, verify the error alarm is OK, delete the test instance, then continue to Boto3.</li>
        </ul>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          Click-ops automation done — next, the same power as Python you can
          run anywhere via Boto3.
        </p>
      </section>
    </LessonLayout>
  );
}
