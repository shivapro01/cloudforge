import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Practical Projects"
      title="Serverless API"
      intro="Project 4: a pay-per-request API — API Gateway routes to Lambda functions that read and write DynamoDB. No servers, no scaling config: build it with Terraform (or SAM), seed it, load-test the throttling, read the logs, and delete the whole stack in one command."
      prev={{ href: "/projects/ecs-pipeline", label: "ECS App with Pipeline" }}
      next={{ href: "/certifications", label: "Certifications" }}
      resources={[
        {
          title: "AWS Lambda Documentation",
          url: "https://docs.aws.amazon.com/lambda/",
          description:
            "Handler signatures, concurrency, throttling, and CloudWatch Logs wiring for the Python functions below.",
        },
        {
          title: "Amazon API Gateway Documentation",
          url: "https://docs.aws.amazon.com/apigateway/",
          description:
            "HTTP API routes, stages, and throttle/usage-plan settings exercised in the load step.",
        },
        {
          title: "Amazon DynamoDB Documentation",
          url: "https://docs.aws.amazon.com/dynamodb/",
          description:
            "On-demand vs provisioned capacity, partition keys, and the put/get patterns the handler uses.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">1. What you are building</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A tiny items API: <code>POST /items</code> writes to DynamoDB,{" "}
          <code>GET /items/{"{id}"}</code> reads it back. API Gateway handles
          HTTP + throttling; Lambda runs your Python only when called; DynamoDB
          on-demand scales to zero. Nothing runs (or bills) when idle.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`  Client (curl / frontend)
       |  HTTPS
       v
  API Gateway HTTP API (stage: prod)
   |  routes: POST /items, GET /items/{id}
   |  throttle: 100 rps burst 200 (lab guardrail)
   v
  Lambda (python3.12, 128 MB, 10s timeout)
   |  IAM role: dynamodb:GetItem + PutItem on items table ONLY
   v
  DynamoDB table "items" (on-demand, partition key: id)
       \
        CloudWatch Logs (/aws/lambda/items-api) + X-Ray optional`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE — the generous tier
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            Lambda: 1M requests + 400k GB-seconds/month free. API Gateway HTTP
            API: 1M calls free for 12 months. DynamoDB: 25 GB + 25 WCU/RCU free
            — a lab API costs $0 even with load testing.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — what to avoid in the lab
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Provisioned DynamoDB throughput and provisioned Lambda concurrency
            bill whether traffic exists or not; API Gateway caching adds hourly
            charges. This build uses on-demand DynamoDB, unprovisioned Lambda,
            and no cache.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. Step A — Prereqs and repo layout</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — scaffold the project.</strong> Terraform ≥ 1.6 (or
          SAM CLI as the alternative), AWS CLI v2, Python 3.12, and a state
          bucket. One folder for functions, one for infra:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`mkdir -p serverless-api/{functions,infra} && cd serverless-api
python3 --version && aws sts get-caller-identity --query Account --output text
# SAM alternative (either path works — Terraform shown below):
# sam init --runtime python3.12 --name items-api  # then: sam build && sam deploy --guided`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> Python 3.12 prints and the
          account ID returns. Pick ONE IaC path (Terraform below or SAM) — do
          not mix both in one repo.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">3. Step B — Infra excerpts: table, function, HTTP API</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — declare the three services plus least-privilege
          IAM.</strong> On-demand DynamoDB, a 128 MB Lambda with the handler
          zip, an HTTP API with two routes, and a role that can only Get/Put
          on this one table:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="infra/main.tf"
            code={`terraform {
  required_version = ">= 1.6.0"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
  backend "s3" {
    bucket = "tf-state-lab-123456789012" # YOUR state bucket
    key    = "projects/serverless-api.tfstate"
    region = "us-east-1"
  }
}
provider "aws" { region = "us-east-1" }

resource "aws_dynamodb_table" "items" {
  name         = "items"
  billing_mode = "PAY_PER_REQUEST" # on-demand: scale-to-zero, no provisioned cost
  hash_key     = "id"
  attribute { name = "id" type = "S" }
}

data "archive_file" "api" {
  type        = "zip"
  source_dir  = "\${path.module}/../functions"
  output_path = "\${path.module}/api.zip"
}

resource "aws_iam_role" "lambda" {
  name = "items-api-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy" "lambda" {
  name = "items-api-policy"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"], Resource = "arn:aws:logs:*:*:*" },
      { Effect = "Allow", Action = ["dynamodb:GetItem", "dynamodb:PutItem"], Resource = aws_dynamodb_table.items.arn }
    ]
  })
}

resource "aws_lambda_function" "api" {
  function_name = "items-api"
  role          = aws_iam_role.lambda.arn
  runtime       = "python3.12"
  handler       = "handler.lambda_handler"
  filename      = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  memory_size   = 128
  timeout       = 10
}

resource "aws_apigatewayv2_api" "api" {
  name          = "items-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "prod"
  auto_deploy = true
  default_route_settings { throttling_burst_limit = 200 throttling_rate_limit = 100 }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /items"
  target    = "integrations/\${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "get" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /items/{id}"
  target    = "integrations/\${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "gw" {
  statement_id  = "AllowGW"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "\${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

output "api_url" { value = aws_apigatewayv2_stage.prod.invoke_url }`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">4. Step C — Lambda handler (Python)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step C — one handler, two routes.</strong> API Gateway HTTP
          API v2.0 payload: method and path live under{" "}
          <code>requestContext.http</code>, path params under{" "}
          <code>pathParameters</code>. Structured return codes matter — 201 on
          create, 404 on missing, 400 on bad input:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="functions/handler.py"
            code={`import json
import os
import uuid

import boto3

TABLE = os.environ.get("TABLE_NAME", "items")
ddb = boto3.resource("dynamodb")
table = ddb.Table(TABLE)

def _resp(status, obj):
    return {"statusCode": status, "headers": {"Content-Type": "application/json"},
            "body": json.dumps(obj)}

def lambda_handler(event, context):
    http = event.get("requestContext", {}).get("http", {})
    method, path = http.get("method"), http.get("path", "")
    print(f"{method} {path}", flush=True)  # -> CloudWatch Logs

    if method == "POST" and path == "/items":
        try:
            payload = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return _resp(400, {"error": "body must be JSON"})
        name = payload.get("name", "").strip()
        if not name:
            return _resp(400, {"error": "field 'name' is required"})
        item = {"id": str(uuid.uuid4())[:8], "name": name}
        table.put_item(Item=item)
        return _resp(201, item)

    if method == "GET" and path.startswith("/items/"):
        item_id = (event.get("pathParameters") or {}).get("id", "")
        got = table.get_item(Key={"id": item_id}).get("Item")
        return _resp(200, got) if got else _resp(404, {"error": "not found"})

    return _resp(404, {"error": "route not found"})`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Wire the table name via <code>TABLE_NAME</code> env var on the
          function (Terraform: add an <code>environment</code> block with{" "}
          <code>TABLE_NAME = aws_dynamodb_table.items.name</code>).{" "}
          <strong>Verify checkpoint:</strong>{" "}
          <code>python3 -c &quot;import ast; ast.parse(open(&apos;functions/handler.py&apos;).read())&quot;</code>{" "}
          parses clean before you zip.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">5. Step D — Deploy, seed, curl test</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step D — apply and exercise the API.</strong> Deploy, create
          an item, read it back, and prove the error paths (404 + 400) behave:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cd infra && terraform init && terraform validate
terraform plan -out api.plan   # table + role + lambda + http api + routes + stage
terraform apply "api.plan"
API=$(terraform output -raw api_url) && echo "API=$API"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Seed: create an item (201), read it back (200), prove 404 + 400 paths
curl -s -X POST $API/items -H "Content-Type: application/json" -d '{"name":"demo-widget"}' | tee /tmp/created.json; echo
ID=$(python3 -c "import json; print(json.load(open('/tmp/created.json'))['id'])")
curl -s $API/items/$ID; echo
curl -s -o /dev/null -w "missing-id -> %{http_code}\n" $API/items/nope1234
curl -s -o /dev/null -w "bad-input  -> %{http_code}\n" -X POST $API/items -H "Content-Type: application/json" -d '{}'
aws dynamodb scan --table-name items --query "Count"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{"id": "a1b2c3d4", "name": "demo-widget"}
{"id": "a1b2c3d4", "name": "demo-widget"}
missing-id -> 404
bad-input  -> 400
1`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> 201 then 200 with matching IDs,
          404 on unknown ID, 400 on empty body, and DynamoDB scan count ≥ 1.
          Break-fix drill: revoke the PutItem permission temporarily and watch
          POST return 500 — then restore and confirm recovery.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">6. Step E — Throttling and logs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step E — prove the guardrails.</strong> The stage throttles
          at 100 rps / 200 burst (set in Step B). Fire a short burst, count
          the 429s, then tail the execution logs to see cold starts and
          durations:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Throttle probe: 150 quick GETs — expect mostly 200s, some 429s under the 100rps cap
ID=$(python3 -c "import json; print(json.load(open('/tmp/created.json'))['id'])")
seq 1 150 | xargs -P20 -I{} curl -s -o /dev/null -w "%{http_code}\n" $API/items/$ID | sort | uniq -c
# Logs: recent invocations with duration + billed ms
aws logs tail /aws/lambda/items-api --since 10m --format short | head -20`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`    143 200
      7 429
2026-01-01T10:00:00 INIT_START Runtime Version: python:3.12 ...
2026-01-01T10:00:01 REPORT RequestId: abc... Duration: 42.10 ms Billed Duration: 43 ms Memory Size: 128 MB`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> burst shows a handful of 429s
          (throttle working, not broken) and REPORT lines show sub-100ms
          durations. Production follow-ups for your README: usage plans + API
          keys per client, reserved concurrency on hot functions, and a
          CloudWatch alarm on 5xx + throttle counts.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">7. Step F — Remove the stack (one command)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step F — delete everything.</strong> Terraform destroy (or{" "}
          <code>sam delete</code> on the SAM path) removes the API, functions,
          table, and IAM in dependency order. DynamoDB data goes with the
          table — export anything you want to keep first:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Optional: keep your lab data before deletion
aws dynamodb scan --table-name items --output json > /tmp/items-backup.json && wc -c /tmp/items-backup.json
# Terraform path:
terraform destroy   # type: yes
# SAM path (if you used SAM instead):
# sam delete --no-prompts
# Prove zero remains:
aws apigatewayv2 get-apis --query "Items[?Name=='items-api'].Name"
aws lambda get-function --function-name items-api 2>&1 | head -2
aws dynamodb describe-table --table-name items 2>&1 | head -2`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Destroy complete! Resources: 10+ destroyed.
[]
An error occurred (ResourceNotFoundException)...   # lambda gone: correct
An error occurred (ResourceNotFoundException)...   # table gone: correct`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Payload v1 vs v2 confusion:</strong> REST APIs and HTTP APIs
            shape <code>event</code> differently — this handler targets HTTP API
            v2.0 (<code>requestContext.http</code>); v1 code breaks silently.
          </li>
          <li>
            <strong>Wildcard IAM (&quot;dynamodb:*&quot;):</strong> one compromised
            function owns every table — scope to GetItem + PutItem on this ARN
            only.
          </li>
          <li>
            <strong>No route for the root path:</strong> curling{" "}
            <code>/</code> returns 404 by design here — document the real routes
            in your README.
          </li>
          <li>
            <strong>Provisioned capacity in a lab:</strong> paying for idle RCU/WCU
            or provisioned concurrency defeats serverless — stay on-demand until
            load proves otherwise.
          </li>
          <li>
            <strong>Deleting the table with the only data copy:</strong> scan and
            save a backup JSON before destroy if your README screenshots need it.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Draw the API Gateway → Lambda → DynamoDB flow from memory, including the IAM boundary.</li>
          <li>Write the Terraform (or SAM) excerpts A–Z; plan and note every resource that will be created.</li>
          <li>Write the Lambda handler; syntax-check it locally before the first apply.</li>
          <li>Apply, seed one item, and capture the 201 → 200 → 404 → 400 curl sequence.</li>
          <li>Run the throttle probe (150 requests) and paste the 200/429 histogram + a REPORT log line.</li>
          <li>Break-fix drill: remove PutItem permission, watch POST fail, restore, confirm recovery.</li>
          <li>Remove the stack (destroy / sam delete), prove API + function + table are gone, and save the output.</li>
          <li>Write the README (routes, curl proof, cost, next steps) and continue to Certifications to map these projects to exam domains.</li>
        </ol>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Next: head to <a href="/certifications" className="underline underline-offset-4">Certifications</a> —
          each project above maps directly to Solutions Architect and Developer
          Associate domains, and this serverless build is the closest to live
          exam questions.
        </p>
      </section>
    </LessonLayout>
  );
}
