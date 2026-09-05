import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Containers & Orchestration"
      title="ECS + Fargate"
      intro="Amazon ECS runs your ECR images as a managed service fleet — no Kubernetes to learn, no EC2 hosts to patch. Define a task once, let Fargate run it serverlessly behind a load balancer, and scale with one number. This lesson builds a complete ALB-backed service end to end, then tears it down."
      prev={{ href: "/containers/ecr", label: "ECR" }}
      next={{ href: "/containers/eks-kubernetes", label: "EKS + Kubernetes" }}
      resources={[
        {
          title: "Amazon ECS Developer Guide",
          url: "https://docs.aws.amazon.com/ecs/",
          description:
            "Official ECS docs: task definitions, services, Fargate launch type, networking, and load balancer integration.",
        },
        {
          title: "Amazon ECR User Guide",
          url: "https://docs.aws.amazon.com/ecr/",
          description:
            "How ECS pulls private ECR images with the task execution role — required companion to this lesson.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Check what is free (CloudWatch basic logs/metrics) versus paid (Fargate vCPU/GB-hours, ALB hours) before launching.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">ECS anatomy: cluster → service → task → container</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Four nouns describe everything ECS runs. Read the hierarchy top-down:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`Cluster (demo-cluster) — logical grouping, one region
  └── Service (web-svc) — desired state: "keep 2 copies running"
  │     ├── deployment config: minHealthy 100%, max 200%
  │     └── attached to ALB target group (health checks gate traffic)
  ├── Task (run #a1, run #b2) — one running copy of the task definition
  │     ├── ENI in your VPC subnets (awsvpc mode: every task gets its own IP)
  │     └── Container (nginx, port 80) — the actual process from ECR image
  └── Task definition (web:3) — versioned blueprint: image, cpu/mem,
        ports, logging, secrets, IAM roles (this + next section)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Cluster:</strong> just a name and capacity settings. With
            Fargate there are no servers inside it — it is a scheduling
            boundary, not hardware.
          </li>
          <li>
            <strong>Task definition:</strong> the versioned recipe (family web,
            revision 3). Updating the image creates revision 4; the service
            rolls tasks from 3 to 4.
          </li>
          <li>
            <strong>Task:</strong> one live instance of a revision. Two desired
            tasks means two ENIs, two IPs, two CloudWatch log streams.
          </li>
          <li>
            <strong>Service:</strong> the controller that keeps desired count
            alive — replaces crashed tasks, spreads them across AZs, and
            registers each one with the ALB target group.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Who runs the underlying compute? Two launch types:
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 font-semibold">Dimension</th>
                <th className="px-4 py-2 font-semibold">Fargate (use this lesson)</th>
                <th className="px-4 py-2 font-semibold">EC2 launch type</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Servers</td>
                <td className="px-4 py-2">None — AWS provisions capacity per task</td>
                <td className="px-4 py-2">You run and patch EC2 container instances</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Pricing</td>
                <td className="px-4 py-2">Per vCPU / GB-second while tasks run</td>
                <td className="px-4 py-2">Per EC2 instance-hour, tasks share it</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Networking</td>
                <td className="px-4 py-2">awsvpc required — each task gets its own ENI + SG</td>
                <td className="px-4 py-2">bridge/host/awsvpc — tasks can share host ports</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Best for</td>
                <td className="px-4 py-2">Beginners, spiky/bursty workloads, hands-off ops</td>
                <td className="px-4 py-2">Sustained high density, GPUs, daemon constraints</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use case:</strong> Fargate removes the entire
          patch-the-host category of toil. CI promotes a new task-definition
          revision; the service performs a rolling replace — the pattern every
          ECS pipeline automates.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Task definition deep dive</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The task definition is the deployable contract: which image, how much
          CPU/RAM, which IAM role pulls the image and ships logs, which port
          and secrets the container gets. This one runs nginx from your ECR
          repo with CloudWatch logging and an SSM secret:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="task-def.json"
            code={`{
  "family": "web",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/webTaskRole",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.0",
      "essential": true,
      "portMappings": [{ "containerPort": 80, "protocol": "tcp" }],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/web",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "web"
        }
      },
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:ssm:us-east-1:123456789012:parameter/prod/db/password"
        }
      ],
      "environment": [{ "name": "APP_ENV", "value": "production" }]
    }
  ]
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>cpu 256 / memory 512:</strong> smallest Fargate size (0.25
            vCPU, 0.5 GB) — cheapest for labs. Only certain cpu/memory pairs
            are valid (256/512, 512/1024, …); arbitrary combos are rejected.
          </li>
          <li>
            <strong>executionRoleArn:</strong> used BY the ECS agent — pulls the
            ECR image, fetches secrets, writes logs. Needs ecr pull,
            logs:CreateLogStream, and ssm:GetParameters. (Different from task
            role — see mistakes.)
          </li>
          <li>
            <strong>taskRoleArn:</strong> used BY your app code at runtime
            (e.g. boto3 calls to S3). Empty/minimal for a static nginx demo.
          </li>
          <li>
            <strong>portMappings 80:</strong> in awsvpc mode the container port
            is the task ENI port — the ALB target group forwards straight to
            it. No host-port remapping like Docker -p.
          </li>
          <li>
            <strong>secrets vs environment:</strong> DB_PASSWORD resolves at
            launch from SSM (never stored in the revision JSON in plaintext);
            APP_ENV is a safe non-secret literal.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecs register-task-definition --cli-input-json file://task-def.json --region $AWS_REGION
aws ecs describe-task-definition --task-definition web --region $AWS_REGION --query '{family:taskDefinition.family, revision:taskDefinition.revision, image:taskDefinition.containerDefinitions[0].image}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "taskDefinition": {
    "taskDefinitionArn": "arn:aws:ecs:us-east-1:123456789012:task-definition/web:1",
    "family": "web",
    "revision": 1,
    "cpu": "256",
    "memory": "512",
    "networkMode": "awsvpc"
  }
}
{
  "family": "web",
  "revision": 1,
  "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.0"
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> describe-task-definition
          returns family web at revision 1 with your ECR image. Every edit
          re-registers and bumps the revision — services pin{" "}
          <span className="font-mono text-[13px]">web:1</span>,{" "}
          <span className="font-mono text-[13px]">web:2</span>, never floating
          family-only in prod.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Service + ALB: desired count and rolling deploys</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The service keeps N tasks alive and wires them to an Application Load
          Balancer target group. Health checks decide which tasks receive
          traffic; the deployment config decides how aggressive replacements
          are:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecs create-cluster --cluster-name demo-cluster --region $AWS_REGION
aws ecs create-service \\
  --cluster demo-cluster \\
  --service-name web-svc \\
  --task-definition web:1 \\
  --desired-count 1 \\
  --launch-type FARGATE \\
  --network-configuration "awsvpcConfiguration={subnets=[subnet-aaa,subnet-bbb],securityGroups=[sg-ccc],assignPublicIp=ENABLED}" \\
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/web-tg/abc123,containerName=web,containerPort=80" \\
  --deployment-configuration "minimumHealthyPercent=100,maximumPercent=200" \\
  --region $AWS_REGION`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "cluster": { "clusterName": "demo-cluster", "status": "ACTIVE" }
}
{
  "service": {
    "serviceName": "web-svc",
    "taskDefinition": "arn:aws:ecs:us-east-1:123456789012:task-definition/web:1",
    "desiredCount": 1,
    "runningCount": 0,
    "deployments": [
      { "status": "PRIMARY", "taskDefinition": "web:1", "desiredCount": 1, "runningCount": 0 }
    ]
  }
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>desired-count 1:</strong> start with one task for the lab
            (scale to 2 later). The service replaces it automatically if it
            crashes or fails health checks.
          </li>
          <li>
            <strong>Target group health:</strong> the ALB hits{" "}
            <span className="font-mono text-[13px]">GET /</span> on port 80
            (default). Only healthy tasks get traffic; unhealthy ones are
            drained and replaced. Set the health path to a real endpoint that
            returns 200 — a path that 404s keeps every task perpetually
            unhealthy.
          </li>
          <li>
            <strong>minimumHealthyPercent=100, maximumPercent=200:</strong>{" "}
            rolling deploy starts the new task before stopping the old (never
            drop below 1 healthy, burst to 2 during deploys). For zero-downtime
            on a count of 1, this is the correct pair.
          </li>
          <li>
            <strong>DevOps use case:</strong> CodeDeploy blue/green swaps the
            target groups for canary validation; plain rolling (this lesson) is
            the default every CI-to-ECS pipeline starts with.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Logging with awslogs to CloudWatch</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The logConfiguration in the task definition already points stdout to
          CloudWatch. Same three Docker instincts (logs / tail / follow), new
          address:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws logs describe-log-groups --log-group-name-prefix /ecs/web --region $AWS_REGION
aws logs tail /ecs/web --since 10m --region $AWS_REGION`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{ "logGroups": [{ "logGroupName": "/ecs/web", "retentionInDays": 7 }] }
2026-09-05T10:30:01 web/web/a1b2c3d4 Server listening on port 80
2026-09-05T10:30:05 web/web/a1b2c3d4 GET / 200 2ms
2026-09-05T10:30:09 web/web/a1b2c3d4 GET /health 200 1ms`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Stream naming:</strong>{" "}
            <span className="font-mono text-[13px]">prefix/container/task-id</span>{" "}
            (web/web/a1b2c3d4) — one stream per task. Scaling to 2 tasks means
            2 interleaved streams; filter by task ID when debugging one copy.
          </li>
          <li>
            <strong>Retention:</strong> set 7 days for labs (default Never
            Expire bills forever). Prod typically 30 days + export to S3.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Secrets and env: never plaintext</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The task definition above injects DB_PASSWORD from SSM Parameter
          Store at launch. Prefer Secrets Manager for auto-rotated DB
          credentials, SSM SecureString for simple config secrets:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ssm put-parameter --name /prod/db/password --type SecureString --value 'correct-horse-TEMP' --region $AWS_REGION
# reference in task def (already shown above):
# "secrets": [{ "name": "DB_PASSWORD", "valueFrom": "arn:aws:ssm:...:parameter/prod/db/password" }]`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">Never put secrets in environment — use secrets</p>
          <p className="mt-1">
            Plain environment values are visible in the console, in
            describe-task-definition output, and to anyone with read access.
            Use the secrets block (SSM / Secrets Manager ARNs) for passwords,
            keys, and tokens; grant the execution role — not the task role —
            ssm:GetParameters / secretsmanager:GetSecretValue on exactly those
            ARNs.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Full A–Z lab: VPC → ECR → service → scale → update → teardown</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab H — ship it end to end, then delete everything in the
          same session.</strong> Reuse your Module 04 VPC (or the default VPC
          for practice): you need two public subnets in different AZs, an
          internet gateway route, and one security group allowing inbound 80
          from 0.0.0.0/0 for the lab.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 1 — ECR image.</strong> Build and push exactly like the
          ECR lesson (any HTTP image works — nginx makes health checks
          trivial):
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`export AWS_REGION=us-east-1
export ACCT=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCT.dkr.ecr.$AWS_REGION.amazonaws.com
docker tag nginx:1.27 $ACCT.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.0
docker push $ACCT.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.0`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Login Succeeded
1.0: digest: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 size: 1572`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 2 — execution role.</strong> Attach the AWS-managed
          policy (pull + logs) to the standard execution role:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
aws logs create-log-group --log-group-name /ecs/web --region $AWS_REGION
aws logs put-retention-policy --log-group-name /ecs/web --retention-in-days 7 --region $AWS_REGION`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock label="Output" code={`ROLE created, policy attached, log group /ecs/web (7-day retention)`} />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 3 — register task def, create ALB + target group,
          create service.</strong> Health check on / (nginx returns 200
          there):
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecs register-task-definition --cli-input-json file://task-def.json --region $AWS_REGION
aws elbv2 create-target-group --name web-tg --protocol HTTP --port 80 --vpc-id vpc-012345 --target-type ip --health-check-path / --region $AWS_REGION
aws elbv2 create-load-balancer --name web-alb --subnets subnet-aaa subnet-bbb --security-groups sg-ccc --region $AWS_REGION
aws elbv2 create-listener --load-balancer-arn <alb-arn> --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=<tg-arn> --region $AWS_REGION`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`task-definition web:1 registered
targetgroup web-tg created (health-check-path /)
loadbalancer web-alb created, DNS: web-alb-123456.us-east-1.elb.amazonaws.com
listener on :80 forwarding to web-tg`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 4 — verify traffic.</strong> Wait ~2 minutes for the
          task to register healthy, then curl the ALB DNS name:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecs describe-services --cluster demo-cluster --services web-svc --region $AWS_REGION --query 'services[0].{desired:desiredCount, running:runningCount}'
aws elbv2 describe-target-health --target-group-arn <tg-arn> --region $AWS_REGION --query 'TargetHealthDescriptions[*].TargetHealth.State'
curl -s -o /dev/null -w '%{http_code}\n' http://web-alb-123456.us-east-1.elb.amazonaws.com/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{ "desired": 1, "running": 1 }
[ "healthy" ]
200`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> running equals desired, target
          state healthy, curl returns 200. If curl hangs: the task SG or ALB SG
          blocks 80, or the task is in a private subnet with assignPublicIp
          DISABLED and no NAT.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 5 — scale to 2.</strong> One number, rolling capacity:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecs update-service --cluster demo-cluster --service web-svc --desired-count 2 --region $AWS_REGION
aws ecs describe-services --cluster demo-cluster --services web-svc --region $AWS_REGION --query 'services[0].{desired:desiredCount, running:runningCount}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock label="Output" code={`update-service: desiredCount 2\n{ "desired": 2, "running": 2 }`} />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 6 — deploy a new image (new revision).</strong> Push 1.1
          to ECR, register revision 2 pointing at it, update the service —
          ECS drains 1.1 in alongside 1.0 per minHealthy/maxPercent:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker tag nginx:1.27 $ACCT.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.1
docker push $ACCT.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.1
# edit task-def.json image -> :1.1, then:
aws ecs register-task-definition --cli-input-json file://task-def.json --region $AWS_REGION
aws ecs update-service --cluster demo-cluster --service web-svc --task-definition web:2 --region $AWS_REGION
aws ecs describe-services --cluster demo-cluster --services web-svc --region $AWS_REGION --query 'services[0].deployments[*].{task:taskDefinition,status:status}' --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`1.1: digest: sha256:f4c5d6... size: 1572
task-definition web:2 registered
{
  "service": { "serviceName": "web-svc", "taskDefinition": "web:2" }
}
-------------------------------
|      DescribeServices         |
+---------------+---------------+
|  web:2        |  PRIMARY      |
+---------------+---------------+`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 7 — TEARDOWN (in this order, same session).</strong>{" "}
          Services own tasks, clusters own services, the ALB bills hourly —
          delete top-down and wait for drains:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecs update-service --cluster demo-cluster --service web-svc --desired-count 0 --region $AWS_REGION
aws ecs delete-service --cluster demo-cluster --service web-svc --force --region $AWS_REGION
aws ecs delete-cluster --cluster demo-cluster --region $AWS_REGION
aws elbv2 delete-listener --listener-arn <listener-arn> --region $AWS_REGION
aws elbv2 delete-load-balancer --load-balancer-arn <alb-arn> --region $AWS_REGION
aws elbv2 delete-target-group --target-group-arn <tg-arn> --region $AWS_REGION
aws ecr batch-delete-image --repository-name my-app --image-ids imageTag=1.0 imageTag=1.1 --region $AWS_REGION`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`desiredCount 0 (tasks draining)
service web-svc deleted
cluster demo-cluster deleted (INACTIVE)
listener deleted
loadbalancer web-alb deleting (deregistration ~30s)
targetgroup web-tg deleted
{ "imageIds": [{"imageTag": "1.0"}, {"imageTag": "1.1"}], "failures": [] }`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> describe-services errors
          (service gone), describe-clusters shows INACTIVE, describe-load-balancers
          returns empty, and ECR list-images shows no 1.0/1.1. Check the console
          billing view — no running tasks, no ALB.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <p className="font-semibold">Cost: FREE for CloudWatch basics — teardown the rest now</p>
          <p className="mt-1">
            Basic CloudWatch logs ingestion for one lab task and ECS control
            plane stay in free-tier territory. Nothing else here is free while
            it runs, so teardown in the same session.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">PAID while running: Fargate vCPU/GB-hours + ALB hours</p>
          <p className="mt-1">
            Fargate bills per vCPU and GB-second for every running task, and
            the ALB bills per hour plus capacity units — even idle. A 256/512
            task plus ALB left overnight is the classic beginner bill. Scale
            the service to 0 and delete the ALB/target group the moment the
            lab is verified.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>One-pipeline deploys:</strong> CI pushes image → registers
            revision → update-service. Rollback is update-service back to the
            previous revision number — seconds, no rebuild.
          </li>
          <li>
            <strong>Env parity with guardrails:</strong> same task family per
            env (web-staging, web-prod) with different secrets/counts. Staging
            runs count 1 on 256/512; prod runs count 3+ with autoscaling on
            ALB latency.
          </li>
          <li>
            <strong>Observability by default:</strong> awslogs + ALB access
            logs + target health give deploy verification (healthy count, 5xx
            rate) without sidecars — the baseline EKS lessons build on.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Execution role vs task role swap:</strong> image pull,
            secret fetch, and log delivery need the EXECUTION role; app AWS API
            calls need the TASK role. Putting ecr:BatchGetImage on the task
            role (or S3 access on the execution role) fails with cryptic
            CannotPullContainerError / AccessDenied.
          </li>
          <li>
            <strong>awsvpc + no public IP in public subnets:</strong> Fargate
            tasks in public subnets need assignPublicIp=ENABLED to pull ECR
            (no NAT = no route otherwise). In private subnets it must be
            DISABLED with a NAT gateway — mixing them up yields timeout pulls.
          </li>
          <li>
            <strong>Health-check 404:</strong> target group defaults to / but
            apps serve /health. Every task stays unhealthy and the service
            churns forever. Match health-check-path to a real 200 endpoint
            first, tighten later.
          </li>
          <li>
            <strong>Secrets in environment plaintext:</strong> env shows up in
            console and API reads; rotate anything committed there, move it to
            the secrets block, and scope the execution role to those ARNs only.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the cluster → service → task → container chain for your app from memory.</li>
          <li>Register task revision 1 and explain every field to a peer (cpu, roles, logs, secrets).</li>
          <li>Launch the service behind the ALB and curl a 200 through the ALB DNS name.</li>
          <li>Tail /ecs/web logs and map each stream to its task ID.</li>
          <li>Move a fake secret from environment to the secrets block and prove it injects.</li>
          <li>Scale to 2, watch both targets go healthy, then scale back to 1.</li>
          <li>Ship image 1.1 as revision 2 with a rolling update; roll back to revision 1.</li>
          <li>Run the full ordered teardown and verify zero tasks, no ALB, no stray images.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
