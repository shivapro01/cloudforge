import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="SNS, SQS & EventBridge"
      intro="Services should talk without waiting on each other — SNS broadcasts events to many subscribers at once, SQS buffers work so nothing is lost when consumers are slow, and EventBridge routes events between services with rules. Master fan-out, queues with dead-letter safety nets, and scheduled rules here, and the next stop — Terraform — will make sense as automation glue."
      prev={{ href: "/aws-fundamentals/cloudwatch-cloudtrail", label: "CloudWatch + CloudTrail" }}
      next={{ href: "/iac-terraform", label: "IaC with Terraform" }}
      resources={[
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "1M SNS publishes + 1M SQS requests free monthly — the envelope this lesson's CLI lab stays inside.",
        },
        {
          title: "AWS Architecture Center",
          url: "https://aws.amazon.com/architecture/",
          description:
            "Reference fan-out, queue-based, and event-driven reference architectures to copy after the lab.",
        },
        {
          title: "freeCodeCamp",
          url: "https://www.freecodecamp.org/",
          description:
            "Free messaging and event-driven backend tutorials that reinforce pub/sub and queue patterns.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. Pub/sub vs queue vs bus: which decoupling do you need?</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>SNS (pub/sub):</strong> one message → many subscribers instantly (email, SMS,
          HTTPS, Lambda, SQS). No storage, no replay — if a subscriber is down, it misses the
          message. <strong>SQS (queue):</strong> one message → one consumer, durably stored until
          deleted, with retries built in. <strong>EventBridge (bus):</strong> many event sources →
          rule-matched targets (Lambda, Step Functions, SQS, SNS) with content filtering. Default
          mapping: notify many → SNS, survive slow consumers → SQS, route between services on
          content → EventBridge.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[600px] text-left text-[13px] leading-6">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2 font-medium">Pattern</th>
                <th className="px-4 py-2 font-medium">Delivery</th>
                <th className="px-4 py-2 font-medium">Retains?</th>
                <th className="px-4 py-2 font-medium">Reach for it when</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">SNS pub/sub</td>
                <td className="px-4 py-2">1 → many, push</td>
                <td className="px-4 py-2">No</td>
                <td className="px-4 py-2">Alerts, fan-out notifications</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">SQS queue</td>
                <td className="px-4 py-2">1 → 1, poll</td>
                <td className="px-4 py-2">Yes, until deleted</td>
                <td className="px-4 py-2">Buffer jobs, survive outages</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">EventBridge bus</td>
                <td className="px-4 py-2">many → matched targets</td>
                <td className="px-4 py-2">Archive/replay supported</td>
                <td className="px-4 py-2">Route + filter service events</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`fan-out: one order event → email + fulfillment + analytics, decoupled
─────────────────────────────────────────────────────────────────
 checkout ──publish──▶ SNS topic "order-created"
                            ├──▶ SQS "send-email"     ──poll──▶ Lambda mailer
                            ├──▶ SQS "fulfill-order"  ──poll──▶ warehouse worker
                            └──▶ Lambda "track-metrics" (direct subscription)

one publish, three independent consumers. Add a 4th queue later: zero checkout changes.`}
          />
        </div>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. SNS: topics, subscriptions, and publish</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>topic</strong> is the named channel (<code>lab-alerts</code>,{" "}
          <code>order-created</code>). <strong>Subscriptions</strong> attach endpoints:{" "}
          <strong>email</strong> (confirm via inbox link — classic lab gotcha),{" "}
          <strong>SMS</strong> (real per-message cost — lab with email only),{" "}
          <strong>HTTPS</strong> (your webhook URL, must answer the confirmation handshake),{" "}
          <strong>Lambda and SQS</strong> (no confirmation needed, IAM-gated).{" "}
          <strong>Publish</strong> is one call fanned to every confirmed subscriber; message
          attributes let downstream filters and SQS subscriptions route selectively.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws sns create-topic --name order-created --query TopicArn --output text

aws sns subscribe --topic-arn arn:aws:sns:us-east-1:123456789012:order-created \\
  --protocol email --notification-endpoint you@example.com
# Confirm via the inbox link or this stays "PendingConfirmation" forever

aws sns publish --topic-arn arn:aws:sns:us-east-1:123456789012:order-created \\
  --subject "Order 1042" --message '{"orderId":1042,"total":89.99}' \\
  --message-attributes '{"region":{"DataType":"String","StringValue":"eu"}}'

aws sns list-subscriptions-by-topic \\
  --topic-arn arn:aws:sns:us-east-1:123456789012:order-created \\
  --query "Subscriptions[*].[Protocol,Endpoint,SubscriptionArn]" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ aws sns publish --topic-arn arn:aws:sns:us-east-1:123456789012:order-created ...
{
  "MessageId": "95df55d4-1234-abcd-5678-9e10f11g1213"
}
# MessageId = accepted for fan-out. Unconfirmed email subscriptions receive NOTHING.

$ aws sns list-subscriptions-by-topic ...
---------------------------------------------------------------
|                   ListSubscriptionsByTopic                  |
+----------+---------------+----------------------------------+
|  email   | you@exam... | arn:aws:sns:...:order-created:...|
+----------+---------------+----------------------------------+`}
          />
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. SQS: standard vs FIFO, visibility, DLQs, polling</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Standard queues</strong> offer unlimited throughput, at-least-once delivery, and
          best-effort ordering — right for email jobs, thumbnails, webhooks.{" "}
          <strong>FIFO queues</strong> (name ends <code>.fifo</code>) guarantee exactly-once
          processing and per-group ordering via message group + dedupe IDs — right for payments
          and inventory, capped at lower throughput and higher cost. When a consumer receives a
          message it becomes <strong>invisible</strong> for the <strong>visibility timeout</strong>:
          finish and delete within it, or the message reappears for retry. Set visibility to ~6×
          the normal processing time.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>dead-letter queue (DLQ)</strong> with a <strong>redrive policy</strong> catches
          poison messages: after N failed receives (maxReceiveCount, e.g. 3), the message moves to
          the DLQ instead of retrying forever. Every production queue gets a DLQ + an alarm on DLQ
          depth. <strong>Long polling</strong> (<code>WaitTimeSeconds=20</code>) holds the receive
          call until a message arrives — fewer empty responses, lower bill, faster reaction than
          hammering short polls.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`visibility + DLQ redrive (the safety net)
─────────────────────────────────────
producer ──send──▶ SQS "jobs" ──receive──▶ worker (invisible 3 min)
                                     │ success → delete ──▶ done
                                     │ crash/timeout → reappears ──▶ retry (up to 3x)
                                     ▼ 3rd failure
                              DLQ "jobs-dlq" ──▶ alarm shouts ──▶ YOU inspect + fix + redrive`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Queue + DLQ + redrive (visibility 6x a ~30s job)
aws sqs create-queue --queue-name jobs-dlq --query QueueUrl --output text
aws sqs create-queue --queue-name jobs --attributes VisibilityTimeout=180,ReceiveMessageWaitTimeSeconds=20

aws sqs set-queue-attributes --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/jobs \\
  --attributes '{"RedrivePolicy":"{\\"deadLetterTargetArn\\":\\"arn:aws:sqs:us-east-1:123456789012:jobs-dlq\\",\\"maxReceiveCount\\":\\"3\\"}"}'`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. EventBridge: buses, rules, and Scheduler cron</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          An <strong>event bus</strong> (default bus works for labs; custom buses isolate
          prod/team traffic) receives JSON events; <strong>rules</strong> match an{" "}
          <strong>event pattern</strong> (source, detail-type, fields) and route to{" "}
          <strong>targets</strong> (Lambda, SQS, SNS, Step Functions). Patterns filter
          server-side — the target only fires on matching events, so one bus serves dozens of
          decoupled consumers. <strong>EventBridge Scheduler</strong> is the cron replacement:
          one-time or recurring schedules invoking Lambda, SQS, or Step Functions without a
          server running cron.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="rule.json"
            code={`{
  "source": ["myapp.orders"],
  "detail-type": ["OrderCreated"],
  "detail": {
    "total": [{ "numeric": [">", 100] }],
    "region": ["eu"]
  }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Rule: big EU orders → fulfillment queue (pattern from rule.json above)
aws events put-rule --name big-eu-orders --event-pattern file://rule.json \\
  --event-bus-name default --query RuleArn --output text

aws events put-targets --rule big-eu-orders \\
  --targets '[{"Id":"1","Arn":"arn:aws:sqs:us-east-1:123456789012:jobs"}]'

# Cron without a server: nightly cleanup Lambda at 02:00 UTC
aws scheduler create-schedule --name nightly-cleanup \\
  --schedule-expression 'cron(0 2 * * ? *)' --flexible-time-window '{"Mode":"OFF"}' \\
  --target '{"Arn":"arn:aws:lambda:us-east-1:123456789012:function:cleanup-fn","RoleArn":"arn:aws:iam::123456789012:role/lab-scheduler-role"}'`}
          />
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Lab [FREE TIER]: topic + queue + publish + receive</h2>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            [FREE TIER] — 1M SNS publishes + 1M SQS requests/month. This lab uses a handful.
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            Subscribe the queue to the topic so publishes land in the queue (true fan-out plumbing),
            then send, receive with long polling, and delete. Use email only for human
            subscriptions — no SMS in labs. Delete topic + queues the same session.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. Topic + queue + wire queue as topic subscriber (fan-out plumbing)
aws sns create-topic --name lab-events --query TopicArn --output text
aws sqs create-queue --queue-name lab-jobs --query QueueUrl --output text

aws sns subscribe --topic-arn arn:aws:sns:us-east-1:123456789012:lab-events \\
  --protocol sqs --notification-endpoint arn:aws:sqs:us-east-1:123456789012:lab-jobs

# 2. Publish → receive (long poll) → delete
aws sns publish --topic-arn arn:aws:sns:us-east-1:123456789012:lab-events \\
  --message '{"job":"thumbnail","id":7}'

aws sqs receive-message --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/lab-jobs \\
  --wait-time-seconds 10 --query "Messages[*].[MessageId,Body]" --output table

aws sqs delete-message --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/lab-jobs \\
  --receipt-handle RECEIPT-HANDLE-FROM-ABOVE

# 3. Same-session teardown
aws sns delete-topic --topic-arn arn:aws:sns:us-east-1:123456789012:lab-events
aws sqs delete-queue --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/lab-jobs`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ aws sns publish --topic-arn ...lab-events ...
{ "MessageId": "a1b2c3d4-5678-90ab-cdef-1234567890ab" }

$ aws sqs receive-message --queue-url .../lab-jobs ...
---------------------------------------------------------------
|                       ReceiveMessage                        |
+--------------------------------------+----------------------+
|  5f4dcc3b-aaae-....                  | {"job":"thumbnail", |
|                                      |  "id":7}             |
+--------------------------------------+----------------------+
# Publish fanned into the queue: SNS → SQS plumbing works. Delete after processing.`}
          />
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. [PAID] warnings</h2>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            [PAID] — three messaging costs that surprise beginners.
          </p>
          <div className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            <p><strong>FIFO throughput</strong> — beyond the base quota, high-throughput FIFO bills per API call; standard queues fit most labs and many prod jobs.</p>
            <p><strong>SMS costs</strong> — every text is per-message priced (varies by country); one load test to phone numbers burns real money. Email for labs.</p>
            <p><strong>Cross-region / cross-account delivery + data transfer</strong> — fanning out across regions adds per-request and transfer charges; keep lab topics, queues, and functions in one region.</p>
          </div>
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. How DevOps actually uses this</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Alarm → SNS → email/Slack:</strong> every CloudWatch alarm from the last lesson
          publishes to an SNS topic wired to email for labs and Slack/pager in prod — the same
          plumbing you built in section 5. <strong>Decouple CI jobs:</strong> the pipeline drops
          build/test/package tasks onto SQS instead of running them inline, so a slow test suite
          retries safely and workers scale independently. <strong>Scheduled Lambda:</strong>{" "}
          EventBridge Scheduler fires nightly cleanup, cert-expiry checks, and report generators
          — cron reliability with retries, DLQs, and CloudWatch history instead of a forgotten
          crontab on one server.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Prod-shaped pattern, lab-safe pieces: alarm → SNS → queue fan-out
aws sns subscribe --topic-arn arn:aws:sns:us-east-1:123456789012:lab-events \\
  --protocol sqs --notification-endpoint arn:aws:sqs:us-east-1:123456789012:lab-jobs

aws events put-rule --name pipeline-failures --event-pattern \\
  '{"source":["aws.codebuild"],"detail-type":["CodeBuild Build State Change"],"detail":{"build-status":["FAILED"]}}'`}
          />
        </div>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>No DLQ:</strong> poison message retries forever, blocking FIFO ordering and
            burning consumer hours. Every queue gets a DLQ + depth alarm from day one.
          </li>
          <li>
            <strong>30s visibility with a 5-min job:</strong> the message reappears mid-processing
            and a second worker duplicates the work. Visibility ≈ 6× normal duration.
          </li>
          <li>
            <strong>Open SNS topics:</strong> publish/subscribe open to the world becomes a spam
            cannon on your bill. Lock topic policies to your accounts and roles.
          </li>
          <li>
            <strong>Forgetting email confirmation:</strong> &quot;SNS is broken&quot; is usually a
            PendingConfirmation subscription. Confirm, then check status before debugging code.
          </li>
          <li>
            <strong>Short-polling in a loop:</strong> thousands of empty receives instead of one
            20s long poll — slower reactions, higher request count. Default to long polling.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Draw the section-1 fan-out for YOUR app: one event, three consumers, SNS→SQS→Lambda mix.</li>
          <li>Run the full section-5 lab: topic + queue + subscribe + publish + long-poll receive + delete.</li>
          <li>Attach a DLQ with maxReceiveCount 3 to a queue; poison it and watch the message land in the DLQ.</li>
          <li>Receive with --wait-time-seconds 20 vs default; compare empty-response counts and explain the cost gap.</li>
          <li>Write an event pattern matching only failed builds; test it against a sample event.</li>
          <li>Create a Scheduler cron invoking a Lambda nightly; confirm one invocation, then delete the schedule.</li>
          <li>Publish with a message attribute and add a filter-policy subscription; prove non-matching messages are skipped.</li>
          <li>Delete all lab topics, queues, rules, and schedules — then continue to IaC with Terraform, where you will recreate this plumbing as code instead of clicks.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
