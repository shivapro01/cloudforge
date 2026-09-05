import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Practical Projects"
      title="ECS App with Pipeline"
      intro="Project 3: containerize an app, push it to ECR, run it on ECS Fargate behind an ALB, and deploy every change through GitHub Actions. Includes the task definition, the service, the pipeline YAML, and the scale/rollback/teardown drills operators run weekly."
      prev={{ href: "/projects/two-tier-app", label: "Two-Tier App with Terraform" }}
      next={{ href: "/projects/serverless-api", label: "Serverless API" }}
      resources={[
        {
          title: "Amazon ECS Documentation",
          url: "https://docs.aws.amazon.com/ecs/",
          description:
            "Task definitions, Fargate services, desired-count scaling, and rolling-update rollback behavior.",
        },
        {
          title: "Docker Documentation",
          url: "https://docs.docker.com/",
          description:
            "Dockerfile best practices, multi-stage builds, and image tagging used to keep the ECR image lean.",
        },
        {
          title: "GitHub Actions Documentation",
          url: "https://docs.github.com/en/actions",
          description:
            "OIDC-to-AWS auth, ECR login, and the build-push-deploy job pattern in the pipeline below.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">1. What you are building</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every push to <code>main</code> builds a Docker image, pushes it to
          ECR, and rolls it out to an ECS Fargate service behind an ALB. The
          pipeline is the deploy path — nobody runs <code>docker push</code> or
          edits services by hand after day one.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`  git push main
       |
       v
  GitHub Actions (OIDC -> AWS, no stored keys)
   |  docker build -> docker push
   v
  ECR repository (my-app:sha-abc123)
   |
   v
  ECS Fargate service (desired 2, 2 AZs) ---> CloudWatch Logs
   |  task def revision N+1, rolling update
   v
  ALB (port 80, health check /health) ---> curl http://<alb-dns>/health`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE — what stays $0 here
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            ECR: 500 MB private storage free. GitHub Actions: 2,000 minutes/month
            free on public repos. CloudWatch Logs ingestion has a free tier —
            keep log retention at 7 days.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — meter runs while tasks live
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Fargate bills per vCPU/GB-second while tasks run, and the ALB bills
            ~$0.025/hr + LCUs. Scale to 2 for the lab, verify, then scale to 0
            and destroy the same day.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. Step A — App, Dockerfile, ECR repo</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — minimal app with a health endpoint.</strong> The ALB
          health check needs <code>/health</code>; without it every deploy
          flaps. Build locally once to prove the image works before any AWS:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="app/app.py"
            code={`from http.server import BaseHTTPRequestHandler, HTTPServer

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        body = b'{"status":"ok"}' if self.path == "/health" else b"<h1>ECS pipeline OK</h1>"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a): pass  # keep logs clean; app logs via print() go to CloudWatch

if __name__ == "__main__":
    print("listening on :8080", flush=True)
    HTTPServer(("0.0.0.0", 8080), H).serve_forever()`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="app/Dockerfile"
            code={`FROM python:3.12-slim
WORKDIR /srv
COPY app.py .
EXPOSE 8080
CMD ["python", "app.py"]`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker build -t my-app:test ./app
docker run -p 8080:8080 my-app:test &
sleep 2 && curl -s localhost:8080/health && echo && kill %1
aws ecr create-repository --repository-name my-app --query "repository.repositoryUri" --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{"status":"ok"}
123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app   # save as ECR_URI`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> local <code>/health</code> returns
          JSON and the ECR URI prints. Tag discipline starts now: pipeline tags
          every image <code>:$GITHUB_SHA</code> plus <code>:latest</code>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">3. Step B — Task definition + service (JSON + HCL)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — register the task family.</strong> Fargate, awsvpc
          networking, 0.25 vCPU / 0.5 GB (smallest = cheapest), container port
          8080, logs to CloudWatch. The execution role pulls the image; the
          task role stays empty until the app needs AWS APIs:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="infra/task-def.json"
            code={`{
  "family": "my-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:latest",
      "portMappings": [{ "containerPort": 8080, "protocol": "tcp" }],
      "essential": true,
      "healthCheck": {
        "command": ["CMD-SHELL", "python -c \\"import urllib.request; urllib.request.urlopen('http://localhost:8080/health')\\""],
        "interval": 15, "timeout": 5, "retries": 3, "startPeriod": 20
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/my-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "web"
        }
      }
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="infra/ecs.tf"
            code={`resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/my-app"
  retention_in_days = 7 # keep free-tier friendly
}

resource "aws_ecs_cluster" "app" { name = "my-app-cluster" }

resource "aws_ecs_task_definition" "app" {
  family                   = "my-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = "arn:aws:iam::123456789012:role/ecsTaskExecutionRole" # YOUR account
  container_definitions    = file("\${path.module}/rendered-task-def.json") # pipeline renders image tag in
}

resource "aws_ecs_service" "app" {
  name            = "my-app-svc"
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = aws_subnet.public[*].id  # reuse two-tier VPC pattern: 2 AZs
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true                      # LAB ONLY — private subnets + NAT is the prod shape
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "web"
    container_port   = 8080
  }
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> <code>aws ecs register-task-definition
          --cli-input-json file://infra/task-def.json</code> returns a revision
          number, and <code>terraform validate</code> passes on the service.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">4. Step C — Deploy pipeline (deploy.yml)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step C — the only deploy path.</strong> OIDC assumes an IAM
          role (no long-lived keys), builds with the commit SHA as tag, pushes
          to ECR, renders the tag into the task definition, and forces a new
          rolling deployment that waits for steady state:
        </p>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/deploy.yml"
            code={`name: build-push-deploy
on:
  push: { branches: [main], paths: ["app/**", ".github/workflows/deploy.yml"] }
permissions: { id-token: write, contents: read }
env:
  AWS_REGION: us-east-1
  ECR_REPO: my-app
  ECS_CLUSTER: my-app-cluster
  ECS_SERVICE: my-app-svc
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-east-1
      - uses: aws-actions/amazon-ecr-login@v2
      - name: Build and push (SHA tag + latest)
        run: |
          SHA=\${GITHUB_SHA::12}
          URI=\${{ secrets.ECR_URI }}
          docker build -t $URI:$SHA -t $URI:latest ./app
          docker push $URI:$SHA
          docker push $URI:latest
          echo "IMAGE=$URI:$SHA" >> $GITHUB_ENV
      - name: Render task def + deploy
        run: |
          sed "s|:latest|:\${GITHUB_SHA::12}|" infra/task-def.json > infra/rendered-task-def.json
          REV=$(aws ecs register-task-definition --cli-input-json file://infra/rendered-task-def.json --query "taskDefinition.revision" --output text)
          aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE \\
            --task-definition my-app:$REV --force-new-deployment
          aws ecs wait services-stable --cluster $ECS_CLUSTER --services $ECS_SERVICE`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> the workflow needs three secrets —{" "}
          <code>AWS_ROLE_TO_ASSUME</code>, <code>ECR_URI</code> — plus the OIDC
          trust on the IAM role. Push once and watch Actions go green before
          touching ECS by hand.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">5. Step D — Run outputs: curl, scale, rollback</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step D — operate the service.</strong> Curl the ALB, prove
          desired-count scaling, then practice the rollback every on-call
          engineer must know — redeploy the previous task revision:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`ALB=$(terraform output -raw alb_dns)
curl -s http://$ALB/health; echo
curl -s http://$ALB/ | head -c 80; echo
aws ecs describe-services --cluster my-app-cluster --services my-app-svc \\
  --query "services[0].{running:runningCount,desired:desiredCount}"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{"status":"ok"}
<h1>ECS pipeline OK</h1>
{ "running": 2, "desired": 2 }`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Scale drill: 2 -> 4 -> 2 (watch ALB targets follow)
aws ecs update-service --cluster my-app-cluster --service my-app-svc --desired-count 4
aws ecs wait services-stable --cluster my-app-cluster --services my-app-svc
aws ecs update-service --cluster my-app-cluster --service my-app-svc --desired-count 2
# Rollback drill: list revisions, redeploy the PREVIOUS one
aws ecs list-task-definitions --family-prefix my-app --sort DESC --query "taskDefinitionArns[0:3]"
aws ecs update-service --cluster my-app-cluster --service my-app-svc --task-definition my-app:<PREV_REV> --force-new-deployment
aws ecs wait services-stable --cluster my-app-cluster --services my-app-svc
curl -s http://$ALB/health; echo`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{"status":"ok"}   # still healthy after scale + rollback`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> health stays <code>ok</code>{" "}
          through scale-up, scale-down, and rollback. Check CloudWatch Logs{" "}
          <code>/ecs/my-app</code> — the &quot;listening on :8080&quot; line
          per task proves fresh placements.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">6. Step E — Teardown: service to 0 FIRST</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step E — ordered teardown.</strong> Scale the service to 0
          first so Fargate stops billing immediately, then destroy the stack,
          then delete ECR images (or the repo). ALB + tasks bill until every
          piece is gone:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1) Stop the meter FIRST — Fargate bills while tasks run
aws ecs update-service --cluster my-app-cluster --service my-app-svc --desired-count 0
aws ecs wait services-stable --cluster my-app-cluster --services my-app-svc
# 2) Destroy infra (ALB, service, cluster, log group, VPC pieces)
terraform destroy   # type: yes
# 3) Clean the image registry (images cost storage; keep or delete the repo)
aws ecr batch-delete-image --repository-name my-app --image-ids imageTag=latest 2>/dev/null
# 4) Prove zero remains
aws ecs list-tasks --cluster my-app-cluster --query "taskArns"
aws elbv2 describe-load-balancers --names my-app-alb 2>&1 | head -2
aws ecr list-images --repository-name my-app --query "imageIds" 2>&1 | head -3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Destroy complete! Resources: N destroyed.
{ "taskArns": [] }
An error occurred (LoadBalancerNotFound)...   # ALB gone: correct`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">7. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>No /health endpoint:</strong> ALB marks every task
            unhealthy and the service churns forever — ship the health route
            before the first deploy.
          </li>
          <li>
            <strong>:latest-only tagging:</strong> you cannot tell which commit
            is running — tag every image with the commit SHA and render it into
            the task def.
          </li>
          <li>
            <strong>Long-lived AWS keys in secrets:</strong> they leak and
            rotate painfully — use OIDC role assumption like the pipeline above.
          </li>
          <li>
            <strong>Destroy without scaling to 0:</strong> destroy still works
            but Fargate bills until the last task drains — scale to 0 first.
          </li>
          <li>
            <strong>Infinite log retention:</strong> CloudWatch Logs default to
            never-expire — set 7 days in the lab.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">8. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Draw the GitHub → Actions → ECR → ECS → ALB flow from memory and compare it with the ASCII diagram.</li>
          <li>Build + run the image locally; capture the /health JSON output.</li>
          <li>Register the task definition (JSON) and note the revision number returned.</li>
          <li>Write the service HCL, apply, and capture the ALB DNS + 2/2 running outputs.</li>
          <li>Ship the deploy.yml pipeline and push a visible content change end to end through CI.</li>
          <li>Scale drill: 2 → 4 → 2 with services-stable waits; paste the running/desired outputs.</li>
          <li>Rollback drill: redeploy the previous task revision and prove /health stays ok.</li>
          <li>Teardown in order (service 0 → destroy → ECR cleanup) and record the $0 bill in your README.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
