import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="Lambda + API Gateway Intro"
      intro="Serverless means you ship code and AWS runs it — no servers to patch, scale, or pay for while idle. Lambda executes your function on each event and bills per millisecond, while API Gateway turns those functions into HTTPS endpoints with stages, throttling, and auth. In this lesson you will deploy a hello function, front it with an HTTP API, curl it, and read its logs — all inside Free Tier."
      prev={{ href: "/aws-fundamentals/databases", label: "RDS, DynamoDB & ElastiCache" }}
      next={{ href: "/aws-fundamentals/cloudwatch-cloudtrail", label: "CloudWatch + CloudTrail" }}
      resources={[
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Lambda's 1M requests + 400k GB-seconds and API Gateway free allowances that cover this lesson's lab.",
        },
        {
          title: "AWS Documentation",
          url: "https://docs.aws.amazon.com/",
          description:
            "Official reference for Lambda handlers, memory/timeout limits, and API Gateway integrations.",
        },
        {
          title: "freeCodeCamp",
          url: "https://www.freecodecamp.org/",
          description:
            "Free hands-on tutorials for JavaScript and serverless APIs that reinforce this lesson.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. What serverless actually means</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Serverless does not mean no servers — it means <strong>no server management</strong>.
          You upload code, declare the trigger, and AWS provisions, patches, scales, and
          load-balances the fleet per invocation. Idle costs <strong>zero</strong>: a function
          called twice a day costs fractions of a cent because billing is{" "}
          <strong>pay-per-millisecond of execution</strong> (memory × duration, rounded up to
          1 ms). The trade: hard limits (15-minute max duration, 10 GB memory, 250 MB package),
          cold starts when AWS spins up a fresh sandbox, and statelessness — every invocation
          must assume a blank slate and persist to DynamoDB/S3, never local disk.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`event-driven request path (this lesson's lab)
─────────────────────────────────────────
client ──GET /hello?name=dev──▶ API GATEWAY (HTTP API, stage: prod)
                                    │ Lambda proxy integration
                                    ▼
                              LAMBDA hello-fn (Node.js, 128 MB, 10s timeout)
                                    │ writes/reads
                                    ▼
                              DYNAMODB (optional: visit counter)
                                    │
client ◀──200 {"message":"hello dev"}──┘   logs ──▶ CLOUDWATCH LOGS

nothing runs between requests. Scale 0 → 1000 concurrent = automatic.`}
          />
        </div>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Lambda anatomy: handler, event, context, and knobs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The <strong>handler</strong> is the entrypoint (<code>index.handler</code>) receiving{" "}
          <code>(event, context)</code>: <strong>event</strong> is the trigger payload (HTTP path,
          query strings, S3 key, SQS message), <strong>context</strong> carries runtime info
          (remaining time, request id, log group). Three knobs matter most:{" "}
          <strong>memory</strong> (128 MB–10 GB — more memory also means proportionally more CPU,
          so raising memory often <em>lowers</em> duration cost), <strong>timeout</strong> (max
          15 min — set it just above real need so hung code fails fast), and{" "}
          <strong>environment variables</strong> (table names, stage flags — never secrets; those
          come from Secrets Manager / Parameter Store). The <strong>IAM execution role</strong>{" "}
          is the function&apos;s identity: least-privilege policies for exactly the DynamoDB
          table, S3 prefix, or log group it needs.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="index.mjs"
            code={`// hello-fn: reads ?name=, returns JSON. Runs on nodejs22.x, handler = index.handler
export const handler = async (event, context) => {
  const name = event?.queryStringParameters?.name ?? "world";
  console.log("request", context.awsRequestId, "for", name); // → CloudWatch Logs
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "hello " + name }),
  };
};`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Least-privilege execution role: logs + one DynamoDB table only
aws iam create-role --role-name lab-lambda-role \\
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{
    "Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam attach-role-policy --role-name lab-lambda-role \\
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws lambda create-function --function-name hello-fn --runtime nodejs22.x \\
  --role arn:aws:iam::123456789012:role/lab-lambda-role \\
  --handler index.handler --zip-file fileb://function.zip \\
  --memory-size 128 --timeout 10 \\
  --environment 'Variables={TABLE_NAME=lab-sessions,STAGE=prod}'`}
          />
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. API Gateway: REST vs HTTP API, stages, proxy integration</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>HTTP APIs</strong> are the default for labs and most new services: cheaper,
          faster, JWT-authorizer friendly, and enough for proxying to Lambda.{" "}
          <strong>REST APIs</strong> add request validation, API keys + usage plans, WAF
          integration, and caching — reach for them when you need those enterprise controls.{" "}
          <strong>Stages</strong> (<code>dev</code>, <code>prod</code>) are versioned snapshots of
          the deployment with per-stage throttling and variables, so testing never touches prod
          traffic. The <strong>Lambda proxy integration</strong> forwards the entire HTTP request
          as the event and returns whatever status/headers/body your function produces — one
          integration, full control in code.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`GET https://abc123.execute-api.us-east-1.amazonaws.com/prod/hello?name=dev
  │ stage "prod" pins deployment v3 (dev stage can pin v4 for testing)
  ▼
ROUTE  GET /hello  ──▶ INTEGRATION (Lambda proxy → hello-fn:prod alias)
  │ throttling: 100 rps burst, JWT authorizer optional
  ▼
LAMBDA returns {statusCode, headers, body} ──▶ client gets it verbatim`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Full lab [FREE TIER]: hello function + HTTP API + curl</h2>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            [FREE TIER] — 1M Lambda requests + 400k GB-seconds per month. This lab uses dozens.
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            128 MB × sub-second runs means thousands of test invocations before the meter matters.
            Keep the timeout at 10s, skip provisioned concurrency and VPC attachment entirely, and
            delete the function + API the same session so nothing lingers.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. Deploy function, wire HTTP API, open the route
aws lambda create-function --function-name hello-fn --runtime nodejs22.x \\
  --role arn:aws:iam::123456789012:role/lab-lambda-role \\
  --handler index.handler --zip-file fileb://function.zip \\
  --memory-size 128 --timeout 10

aws apigatewayv2 create-api --name lab-http --protocol-type HTTP \\
  --query "[ApiId,ApiEndpoint]" --output table

aws apigatewayv2 create-integration --api-id APIID --integration-type AWS_PROXY \\
  --integration-uri arn:aws:lambda:us-east-1:123456789012:function:hello-fn

aws apigatewayv2 create-route --api-id APIID --route-key 'GET /hello' \\
  --target integrations/INTEGID
aws apigatewayv2 create-stage --api-id APIID --stage-name prod --auto-deploy

# 2. Call it
curl 'https://APIID.execute-api.us-east-1.amazonaws.com/prod/hello?name=dev'

# 3. Read the logs
aws logs tail /aws/lambda/hello-fn --since 10m --format short`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ curl 'https://APIID.execute-api.us-east-1.amazonaws.com/prod/hello?name=dev'
{"message":"hello dev"}

$ aws logs tail /aws/lambda/hello-fn --since 10m --format short
2026-09-05T10:01:02 START RequestId: a1b2-c3d4 Version: $LATEST
2026-09-05T10:01:02 request a1b2-c3d4 for dev
2026-09-05T10:01:02 END RequestId: a1b2-c3d4
2026-09-05T10:01:02 REPORT RequestId: a1b2-c3d4 Duration: 12.40 ms Billed: 13 ms Memory: 128 MB
# 12 ms billed: this is why idle serverless costs ~nothing`}
          />
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. [PAID] warnings: the four serverless bill traps</h2>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            [PAID] — defaults are free; these four options are not.
          </p>
          <div className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            <p><strong>Provisioned concurrency</strong> keeps sandboxes warm 24/7 — kills cold starts and the free bill alike. Never enable in labs.</p>
            <p><strong>VPC-attached functions needing NAT</strong> — a VPC Lambda reaching the internet requires a NAT Gateway (~$0.045/hr). Keep lab functions outside a VPC.</p>
            <p><strong>API Gateway caching</strong> runs a dedicated cache cluster billed hourly — response caching is a prod feature, not a lab one.</p>
            <p><strong>CloudWatch Logs ingestion + retention</strong> — verbose per-request JSON logging at scale becomes a logs bill bigger than the Lambda bill. Log lean, set retention, delete the log group with the lab.</p>
          </div>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Same-session teardown: API first, then function, then logs
aws apigatewayv2 delete-api --api-id APIID
aws lambda delete-function --function-name hello-fn
aws logs delete-log-group --log-group-name /aws/lambda/hello-fn

aws lambda list-functions --query "Functions[*].FunctionName" --output table
# hello-fn must be ABSENT = meter stopped`}
          />
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. How DevOps actually uses Lambda</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Webhooks:</strong> API Gateway → Lambda validates a GitHub/Docker Hub signature
          and triggers a pipeline — no always-on webhook server. <strong>Cron via
          EventBridge:</strong> a <code>rate(1 hour)</code> rule invokes a cleanup/audit function
          (old snapshots, stale branches, cert expiry checks). <strong>CI deploys with
          versions/aliases:</strong> the pipeline publishes a numbered version per commit and
          moves the <code>prod</code> alias gradually (weighted alias = canary), rolling back by
          flipping the alias — the serverless cousin of blue/green.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# CI-style deploy: publish version, shift prod alias gradually
aws lambda publish-version --function-name hello-fn \\
  --query "[FunctionName,Version]" --output table

aws lambda update-alias --function-name hello-fn --name prod \\
  --function-version 3 --routing-config '{"AdditionalVersionWeights":{"4":0.1}}'
# 10% to v4 → watch errors → 0.5 → 1.0 → rollback = point alias back at v3`}
          />
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>15-minute timeout misuse:</strong> running 14-minute ETL inside Lambda instead
            of Fargate/Batch — timeouts, retries, and double-billing. Lambda is for seconds, not hours.
          </li>
          <li>
            <strong>Fat cold starts:</strong> shipping a 200 MB bundle with unused SDKs and hitting
            5s cold starts on every scale-up. Trim deps, use layers, raise memory for more CPU.
          </li>
          <li>
            <strong>Recursive S3 triggers:</strong> function writes to the same bucket/prefix that
            triggers it — infinite loop invoking itself until the bill stops you. Always write to a
            different prefix or bucket.
          </li>
          <li>
            <strong>Secrets in env vars:</strong> pasting API keys into plain environment variables
            visible in console and CI logs. Use Secrets Manager / Parameter Store (SecureString) with
            least-privilege role access.
          </li>
          <li>
            <strong>No idempotency on retries:</strong> double-charging or double-writing when Lambda
            retries. Guard with DynamoDB conditional writes or dedupe keys.
          </li>
        </ul>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Deploy hello-fn at 128 MB; curl it with two different ?name= values and compare REPORT durations.</li>
          <li>Raise memory to 1024 MB, redeploy, and note the duration change — explain why cost may still drop.</li>
          <li>Add a prod stage variable and read it in the handler to change the greeting per stage.</li>
          <li>Restrict the execution role to one DynamoDB table; prove a write to another table is denied.</li>
          <li>Create an EventBridge rate(5 minutes) rule invoking hello-fn; confirm invocations in logs, then delete it.</li>
          <li>Publish two versions and shift the prod alias 90/10; roll back by flipping the alias.</li>
          <li>Set the log group retention to 7 days and remove one verbose console.log; explain the cost reason.</li>
          <li>Run the section-5 teardown; prove the function, API, and log group are all gone.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
