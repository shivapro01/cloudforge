import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="CI / CD on AWS"
      title="Full Pipeline Lab"
      intro="Time to wire everything together: a push-to-prod pipeline for a Node app that tests, builds a Docker image, pushes to ECR, and deploys to a single EC2 instance via SSM — all from GitHub Actions with OIDC (no stored keys). You will run it green, break it on purpose to prove the gate works, fix it, then tear every resource down. EC2-simple on purpose: no ECS cluster, no ALB, nothing that bills you overnight."
      prev={{ href: "/cicd/deployment-strategies", label: "Deployment Strategies" }}
      next={{ href: "/containers", label: "Containers" }}
      resources={[
        {
          title: "GitHub Actions workflow syntax",
          url: "https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax",
          description:
            "Jobs, steps, permissions, and OIDC claims behind the deploy.yml workflow in this lab.",
        },
        {
          title: "Systems Manager Run Command walkthrough",
          url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/run-command.html",
          description:
            "How send-command runs the deploy script on EC2 over SSM — no SSH keys or open port 22 needed.",
        },
        {
          title: "AWS Free Tier details",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm the t3.micro, ECR 500 MB, and Actions-minutes allowances before you launch — and what tips you into paid.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">What you are building (EC2-simple, free-tier-safe)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          One repo, one workflow, one tiny server. Every push to <strong>main</strong> runs{" "}
          <strong>test → build → push to ECR → SSM deploy to EC2</strong>. The workflow assumes the{" "}
          <strong>IAM OIDC role from the GitHub Actions lesson</strong> — GitHub mints a short-lived token,
          AWS trusts it, no access keys exist anywhere. The EC2 box pulls the tested image digest from ECR
          and restarts the container.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`PUSH-TO-PROD, EC2-SIMPLE (everything in us-east-1)
git push main
  -> GitHub Actions (OIDC -> IAM role GitHubDeploy)
       1. npm ci + npm test            (gate: fail = STOP, nothing deploys)
       2. docker build + push ECR      (tag = commit SHA, immutable)
       3. aws ssm send-command -> EC2 t3.micro (role: EC2SSMDeploy)
            EC2 pulls ECR:$SHA, stops old container, starts new, curls /health
  -> verify: curl http://<EC2-IP>:3000/health  +  CloudWatch Logs /myapp/prod

Why EC2-simple: one micro, one repo, no ALB/ECS/EIP. Teardown = 4 commands.`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">
            [FREE TIER] Actions minutes + ECR 500 MB + t3.micro
          </p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            Public-repo Actions minutes, 500 MB of ECR private storage, and ~750 hrs/month of t3.micro (new
            accounts) cover this whole lab. Keep the instance stopped or terminated when you are done and the
            lab costs nothing.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID] Forgotten EC2, ALB, and EIP</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            A running t3.micro past Free Tier (~$0.01/hr), any ALB you add (~$0.025/hr + LCU), and idle
            Elastic IPs (~$0.005/hr) bill 24/7. This lab deliberately uses none of the extras — and Step 6
            tears down in dependency order so nothing lingers.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Step 0 — Prereqs: repo, CLI, OIDC role, budget</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>A.</strong> A GitHub repo (e.g. <strong>you/shipfast</strong>) with Actions enabled.{" "}
          <strong>B.</strong> AWS CLI v2 configured with an admin profile in <strong>us-east-1</strong>.{" "}
          <strong>C.</strong> The <strong>OIDC provider + deploy role</strong> from the GitHub Actions
          lesson (role name <strong>GitHubDeploy</strong> trusting <strong>you/shipfast → main</strong>).{" "}
          <strong>D.</strong> A zero-spend budget alarm so a forgotten instance pages you instead of billing
          you.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws --version
aws sts get-caller-identity --query '{account:Account,user:Arn}'
aws iam list-open-id-connect-providers --query 'OpenIDConnectProviderList[*].Arn'
aws iam get-role --role-name GitHubDeploy --query 'Role.{name:RoleName,arn:Arn}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`aws-cli/2.15.0 Python/3.11
{
  "account": "123456789012",
  "user": "arn:aws:iam::123456789012:user/shiva-admin"
}
{
  "OpenIDConnectProviderList": [
    { "Arn": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" }
  ]
}
{
  "name": "GitHubDeploy",
  "arn": "arn:aws:iam::123456789012:role/GitHubDeploy"
}
# Verify: OIDC provider + GitHubDeploy role exist BEFORE continuing`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Verify checkpoint:</strong> all four commands succeed. No OIDC role → go back to the
            GitHub Actions lesson first; the workflow below assumes it.
          </li>
          <li>
            <strong>DevOps use:</strong> prereq checks belong in runbooks — never start a lab (or an
            incident deploy) without proving identity, region, and role trust first.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Step 1 — App, Dockerfile, and the full deploy workflow</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A minimal Express app with a <strong>/health endpoint</strong> (the deploy gate) and one real
          test. The Dockerfile is the multi-stage build from the ECR lesson. The workflow file{" "}
          <strong>.github/workflows/deploy.yml</strong> is the whole pipeline: test gates everything —
          build, ECR push, and SSM deploy only run on green.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="package.json"
            code={`{
  "name": "shipfast",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "test": "node --test test/*.test.js"
  },
  "dependencies": { "express": "^4.19.2" },
  "devDependencies": { "typescript": "^5.4.0" }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="src/index.js"
            code={`const express = require("express");
const app = express();
const VERSION = process.env.APP_VERSION || "dev";

app.get("/health", (req, res) => res.json({ ok: true, version: VERSION }));
app.get("/", (req, res) => res.send("shipfast v" + VERSION));

const port = process.env.PORT || 3000;
if (require.main === module) app.listen(port, () => console.log("listening on " + port));
module.exports = app;`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Dockerfile"
            code={`FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build || echo "no build step"

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/src ./src
EXPOSE 3000
USER node
CMD ["node", "src/index.js"]`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/deploy.yml"
            code={`name: deploy
on:
  push:
    branches: [main]

permissions:
  id-token: write   # OIDC: mint short-lived token, no stored keys
  contents: read

env:
  AWS_REGION: us-east-1
  ECR_REPO: shipfast
  EC2_INSTANCE_ID: \${{ secrets.EC2_INSTANCE_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm test

  build-and-push:
    needs: test                 # gate: only runs on green tests
    runs-on: ubuntu-latest
    outputs:
      image: \${{ steps.meta.outputs.image }}
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubDeploy
          aws-region: us-east-1
      - uses: aws-actions/amazon-ecr-login@v2
      - id: meta
        run: |
          SHA=\$(echo "\${{ github.sha }}" | cut -c1-7)
          REG=123456789012.dkr.ecr.us-east-1.amazonaws.com
          echo "image=$REG/shipfast:$SHA" >> "$GITHUB_OUTPUT"
      - run: |
          docker build -t \${{ steps.meta.outputs.image }} .
          docker push \${{ steps.meta.outputs.image }}

  deploy:
    needs: build-and-push       # gate: only runs on pushed image
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubDeploy
          aws-region: us-east-1
      - run: |
          aws ssm send-command \\
            --instance-ids "$EC2_INSTANCE_ID" \\
            --document-name "AWS-RunShellScript" \\
            --parameters commands="[
              \\"aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com\\",
              \\"docker pull \${{ needs.build-and-push.outputs.image }}\\"",
              \\"docker stop shipfast || true; docker rm shipfast || true\\",
              \\"docker run -d --name shipfast -p 3000:3000 -e APP_VERSION=\${{ needs.build-and-push.outputs.image }} \${{ needs.build-and-push.outputs.image }}\\"",
              \\"sleep 5; curl -sf http://localhost:3000/health\\"
            ]" \\
            --query 'Command.CommandId'`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Why this shape:</strong> <strong>needs: test</strong> and <strong>needs:
            build-and-push</strong> are the gates — a red test or failed push cancels everything downstream.
            The image tag is the commit SHA, so the SSM command pulls the exact tested digest.
          </li>
          <li>
            <strong>DevOps use:</strong> the workflow is the deploy runbook in code — every prod change goes
            through the same tested path, auditable in the Actions tab.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Step 2 — OIDC trust and the ECR + EC2 + SSM policy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Extend the <strong>GitHubDeploy</strong> role from the GitHub Actions lesson so this pipeline can
          push to ECR and send SSM commands — scoped to <strong>shipfast only</strong> and your one
          instance. The trust policy still pins <strong>you/shipfast → refs/heads/main</strong>, so fork PRs
          get nothing.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="trust-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:you/shipfast:ref:refs/heads/main" }
    }
  }]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="deploy-permissions.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPushShipfast",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "*",
      "Condition": { "StringEquals": { "aws:RequestedRegion": "us-east-1" } }
    },
    {
      "Sid": "SSMDeployOneBox",
      "Effect": "Allow",
      "Action": ["ssm:SendCommand", "ssm:GetCommandInvocation"],
      "Resource": [
        "arn:aws:ec2:us-east-1:123456789012:instance/*",
        "arn:aws:ssm:us-east-1:123456789012:document/AWS-RunShellScript"
      ]
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws iam put-role-policy --role-name GitHubDeploy --policy-name ShipfastDeploy --policy-document file://deploy-permissions.json
aws iam get-role-policy --role-name GitHubDeploy --policy-name ShipfastDeploy --query 'PolicyDocument.Statement[*].Sid'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`["ECRPushShipfast", "SSMDeployOneBox"]
# Verify: both Sids attached. Fork PRs still assume nothing (trust pins main).`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Step 3 — ECR repo, EC2 micro, and the SSM instance role</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>A.</strong> Create the <strong>shipfast</strong> ECR repo (immutable SHA tags, scan on
          push). <strong>B.</strong> Launch one <strong>t3.micro</strong> Amazon Linux 2023 box with the
          SSM-managed instance role — SSM (not SSH) is how the pipeline reaches it, so <strong>no port 22
          needed</strong>. <strong>C.</strong> Install Docker + CloudWatch agent via user data, then store
          the instance ID as the <strong>EC2_INSTANCE_ID</strong> Actions secret.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr create-repository --repository-name shipfast --image-tag-mutability IMMUTABLE \\
  --image-scanning-configuration scanOnPush=true --region us-east-1 --query 'repository.repositoryUri'

aws iam create-role --role-name EC2SSMDeploy --assume-role-policy-document file://ec2-trust.json
aws iam attach-role-policy --role-name EC2SSMDeploy --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam attach-role-policy --role-name EC2SSMDeploy --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
aws iam create-instance-profile --instance-profile-name EC2SSMDeploy-profile
aws iam add-role-to-instance-profile --instance-profile-name EC2SSMDeploy-profile --role-name EC2SSMDeploy`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ec2 run-instances --image-id resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \\
  --instance-type t3.micro --count 1 --iam-instance-profile Name=EC2SSMDeploy-profile \\
  --security-group-ids sg-0123456789abcdef0 --subnet-id subnet-0123456789abcdef0 \\
  --user-data file://userdata.sh --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=shipfast}]' \\
  --region us-east-1 --query 'Instances[0].{id:InstanceId,ip:PublicIpAddress}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="userdata.sh"
            code={`#!/bin/bash
dnf install -y docker amazon-cloudwatch-agent
systemctl enable --now docker
usermod -aG docker ssm-user
# CloudWatch Logs for the app container
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json <<'JSON'
{ "logs": { "logs_collected": { "files": { "collect_list": [
  { "file_path": "/var/log/shipfast.log", "log_group_name": "/myapp/prod", "log_stream_name": "{instance_id}" }
] } } } }
JSON
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a start -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`"123456789012.dkr.ecr.us-east-1.amazonaws.com/shipfast"
{
  "id": "i-0abc123def4567890",
  "ip": "54.210.11.22"
}
# Verify: aws ssm describe-instance-information --filters Key=InstanceIds,Values=i-0abc123def4567890
# -> PingStatus: Online. Then save EC2_INSTANCE_ID=i-0abc123def4567890 as an Actions secret.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Security group:</strong> inbound <strong>3000 from your IP only</strong> for verify curls
            (+ 443 out). No SSH rule — SSM Session Manager is the shell.
          </li>
          <li>
            <strong>DevOps use:</strong> the instance profile separates concerns — GitHub pushes images, the
            box only <strong>pulls</strong> (ReadOnly) and accepts SSM commands. Neither side holds the
            other&apos;s keys.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Step 4 — First green run: push, watch, verify</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Commit and push to <strong>main</strong>. Watch the three jobs go green in the Actions tab in
          order — test, then build-and-push, then deploy. Then prove it from outside: curl the EC2 health
          endpoint and check the CloudWatch log group.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git add . && git commit -m "feat: shipfast v1 pipeline" && git push origin main
curl -s http://54.210.11.22:3000/health
aws logs tail /myapp/prod --since 10m --region us-east-1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Actions: test ............ PASS (12s)
Actions: build-and-push ... PASS (pushed shipfast:a1b2c3d, digest sha256:9f2c...)
Actions: deploy .......... PASS (SSM command 3f2a1b succeeded, curl exit 0)

{"ok":true,"version":"123456789012.dkr.ecr.us-east-1.amazonaws.com/shipfast:a1b2c3d"}
2026-05-01T11:05:00Z listening on 3000
# Verify: version in /health == SHA tag in the Actions log. They must match.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Verify checkpoint:</strong> health JSON shows <strong>ok: true</strong> and the version
            equals the pushed SHA. Mismatch = the box runs a stale container — re-check the SSM command
            output.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Step 5 — Break it on purpose: red test blocks the deploy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A pipeline you have never seen fail is a pipeline you cannot trust. Break one test, push, and
          confirm <strong>downstream jobs never run</strong> — no image pushed, nothing deployed, prod still
          serving the last green SHA. Then revert and watch green restore itself.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Break: make /health return 500 in src/index.js, then push
git commit -am "break: force failing health test" && git push origin main
# Watch Actions, then prove prod untouched:
curl -s http://54.210.11.22:3000/health`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Actions: test ............ FAIL (health.test.js: expected 200, got 500)
Actions: build-and-push ... SKIPPED (needs: test not met)
Actions: deploy .......... SKIPPED (needs: build-and-push not met)

{"ok":true,"version":"...shipfast:a1b2c3d"}
# Verify: prod still serves the PREVIOUS green SHA. The gate worked.
# Fix: git revert HEAD && git push origin main -> all three jobs green again.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DevOps use:</strong> this is the whole point of gates — a failing test is a blocked
            deploy, not a Slack debate. Demo this break-fix loop in interviews; it proves you test gates,
            not just pipelines.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Step 6 — Teardown in order (do not skip)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Teardown runs in <strong>dependency order</strong>: stop the pipeline first (so nothing redeploys
          mid-cleanup), then terminate the instance, then empty and delete the ECR repo, then remove the
          OIDC policy. Verify each step — an &quot;empty&quot; that is not verified is how bills happen.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. Disable the workflow (repo Settings -> Actions -> Disable) OR push an empty commit guard:
gh workflow disable deploy.yml

# 2. Terminate EC2 (releases the public IP automatically)
aws ec2 terminate-instances --instance-ids i-0abc123def4567890 --region us-east-1
aws ec2 wait instance-terminated --instance-ids i-0abc123def4567890 --region us-east-1

# 3. Empty + delete the ECR repo
aws ecr batch-delete-image --repository-name shipfast --image-ids imageTag=a1b2c3d --region us-east-1
aws ecr delete-repository --repository-name shipfast --force --region us-east-1

# 4. Remove the pipeline policy from the OIDC role
aws iam delete-role-policy --role-name GitHubDeploy --policy-name ShipfastDeploy`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Terminated: i-0abc123def4567890 (state: terminated)
ECR: shipfast deleted (failures: [])
IAM: ShipfastDeploy policy removed from GitHubDeploy
# Verify empty:
aws ec2 describe-instances --filters Name=tag:Name,Values=shipfast Name=instance-state-name,Values=running --query 'Reservations[*].Instances[*].InstanceId'
# -> []   (no running boxes)
aws ecr describe-repositories --repository-names shipfast
# -> RepositoryNotFoundException (repo gone)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Verify checkpoint:</strong> both verify commands show empty/gone. Screenshot them — that
            is your proof of a $0 lab.
          </li>
          <li>
            <strong>DevOps use:</strong> teardown order matters everywhere (pipelines → compute → images →
            IAM). Deleting IAM first orphans running resources nobody can reach.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Troubleshooting</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>OIDC assume-role fails:</strong> trust condition pins <strong>repo:you/shipfast:ref:
            refs/heads/main</strong> — pushes from a fork, a renamed repo, or a feature branch are denied by
            design. Check the exact repo/branch in the error&apos;s subject claim.
          </li>
          <li>
            <strong>SSM command &quot;no instances&quot;:</strong> the box lacks the SSM role or sits in a
            subnet without SSM endpoints/egress. Confirm <strong>PingStatus: Online</strong> in
            describe-instance-information before blaming the workflow.
          </li>
          <li>
            <strong>Docker pull denied on EC2:</strong> the instance profile needs{" "}
            <strong>AmazonEC2ContainerRegistryReadOnly</strong>; the GitHub role handles pushes, the box
            handles pulls — do not mix them up.
          </li>
          <li>
            <strong>Health curl fails post-deploy:</strong> security group blocking 3000, container still
            starting (raise the sleep), or APP_VERSION mismatch — read the SSM command stdout in the
            console, not just the Actions checkmark.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Long-lived keys in secrets:</strong> pasting an access key into Actions instead of using
            OIDC recreates the exact leak vector the GitHub Actions lesson removed. OIDC or nothing.
          </li>
          <li>
            <strong>Deploying :latest:</strong> the SSM command must pull the <strong>SHA-tagged</strong>{" "}
            image from the workflow output — pulling :latest redeploys whatever pushed last, tested or not.
          </li>
          <li>
            <strong>Skipping teardown order:</strong> terminating IAM before EC2, or deleting the repo while
            the workflow still runs, leaves orphaned or failing resources. Disable workflow → terminate →
            delete images → remove policy, verified at each step.
          </li>
          <li>
            <strong>Port 22 open to the world:</strong> this lab needs zero SSH — SSM Session Manager is the
            shell. An open 22 is pure attack surface with no upside here.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Mini lab + hands-on practice (8 tasks)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Mini lab (~60 min):</strong> run Steps 0–6 end to end — green deploy, break-fix proof, full
          teardown with empty verifies. Then carry the pattern into <strong>/containers</strong>, where the
          same test → build → push flow targets ECS instead of one EC2 box.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Prove prereqs: OIDC provider, GitHubDeploy role trust, and CLI identity outputs captured.</li>
          <li>Commit the app + Dockerfile + deploy.yml and explain what each needs: gate blocks the deploy.</li>
          <li>Attach the scoped ECR + SSM policy and show a fork-branch push being denied by the trust condition.</li>
          <li>Launch the ECR repo + t3.micro with SSM role; prove PingStatus Online before the first deploy.</li>
          <li>Run the first green pipeline and verify /health version matches the pushed SHA plus CloudWatch logs.</li>
          <li>Break a test, prove downstream jobs skip and prod still serves the old SHA, then revert to green.</li>
          <li>Tear down in order with both empty-verifies (no running instances, repo gone) and delete the policy.</li>
          <li>Write the containers handoff: which two workflow lines change when the target becomes ECS instead of EC2?</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
