import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="CI / CD on AWS"
      title="Build & Push to ECR"
      intro="Elastic Container Registry (ECR) is your private Docker shelf inside AWS: CI builds the image once, tags it with an immutable commit SHA, pushes it, and every later stage — scan, test, deploy to ECS — pulls that exact digest. You will create a repo, write a lean multi-stage Dockerfile, run the full build → tag → push loop, turn on scanning, scope CI push/pull IAM, and clean up untagged images."
      prev={{ href: "/cicd/aws-code-services", label: "AWS Code Services" }}
      next={{ href: "/cicd/deployment-strategies", label: "Deployment Strategies" }}
      resources={[
        {
          title: "ECR getting started",
          url: "https://docs.aws.amazon.com/ecr/latest/userguide/getting-started-cli.html",
          description:
            "Official CLI flow: create repo, authenticate Docker, push and pull — follow it with the commands in this lesson.",
        },
        {
          title: "Dockerfile best practices",
          url: "https://docs.docker.com/build/building/best-practices/",
          description:
            "Multi-stage builds, layer caching, and .dockerignore patterns behind the lean Dockerfile below.",
        },
        {
          title: "AWS Free Tier for ECR",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirms the 500 MB private-repo storage allowance — check what stays free before you push large images.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Why a registry: build once, ship the same digest everywhere</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Without a registry, every environment rebuilds from source and drifts.{" "}
          <strong>Build once</strong> in CI, push the image with an{" "}
          <strong>immutable tag</strong> (the commit SHA), and stage, prod, and
          rollbacks all pull the <strong>same digest</strong>. The tag is a
          human label; the <strong>SHA digest</strong> is the content address —
          pin deploys to the digest and <strong>:latest</strong> can never
          surprise you.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`BUILD ONCE (CI)                          PULL MANY (everywhere)
commit a1b2c3d -> docker build
  -> myapp:a1b2c3d ──push──> ECR repo: myapp ──┬──> scan findings (CVE check)
                                               ├──> stage deploy: myapp@sha256:9f2c...
                                               ├──> prod deploy:  myapp@sha256:9f2c... (SAME digest)
                                               └──> rollback:     re-pull previous digest, no rebuild

Tags vs digests:
  myapp:a1b2c3d          <- immutable: always points at THIS build
  myapp:latest           <- mutable: moves on every push, NEVER deploy prod from it
  myapp@sha256:9f2c...   <- content digest: what ECS actually runs`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Immutable SHA tags:</strong> tag every push{" "}
            <strong>:git-sha</strong> (and optionally <strong>:build-N</strong>).
            Keep <strong>:latest</strong> only as a convenience pointer for
            local pulls — never as the deploy reference.
          </li>
          <li>
            <strong>DevOps use:</strong> promotion = pulling the tested digest
            into the next environment, not rebuilding. The SHA in the deploy
            ticket must match the SHA that passed tests and scans.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">ECR setup A–Z: repo, login, lifecycle policy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Three setup moves: <strong>create the private repo</strong> with scan
          on push and immutable tags, <strong>log Docker in</strong> with a
          short-lived token (never a stored password), and add a{" "}
          <strong>lifecycle policy</strong> so old and untagged images expire
          instead of billing you forever.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>A. Create the repo:</strong> one repo per service (
            <strong>myapp</strong>, not one mega-repo). Enable{" "}
            <strong>scan on push</strong> and <strong>immutable tags</strong>{" "}
            from the start.
          </li>
          <li>
            <strong>B. Log Docker in:</strong> pipe{" "}
            <strong>get-login-password</strong> into{" "}
            <strong>docker login --password-stdin</strong>. The token lasts ~12
            hours — CI re-logs every run.
          </li>
          <li>
            <strong>C. Set the lifecycle policy:</strong> keep the last 10
            tagged images, expire untagged after 7 days. Untagged layers are
            the silent storage bill.
          </li>
        </ol>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr create-repository --repository-name myapp --image-tag-mutability IMMUTABLE --image-scanning-configuration scanOnPush=true --region us-east-1
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "repository": {
    "repositoryName": "myapp",
    "repositoryUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp",
    "imageTagMutability": "IMMUTABLE",
    "imageScanningConfiguration": { "scanOnPush": true }
  }
}
Login Succeeded`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="lifecycle-policy.json"
            code={`{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Expire untagged images after 7 days",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 7
      },
      "action": { "type": "expire" }
    },
    {
      "rulePriority": 2,
      "description": "Keep only last 10 tagged images",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": [""],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": { "type": "expire" }
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr put-lifecycle-policy --repository-name myapp --lifecycle-policy-text file://lifecycle-policy.json`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "repositoryName": "myapp",
  "lifecyclePolicyText": "{ ... 2 rules applied ... }",
  "lastEvaluatedAt": "2026-05-01T10:20:00Z"
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DevOps use:</strong> immutable tags + lifecycle rules mean
            no one can silently overwrite a released image, and CI&apos;s every
           -commit pushes don&apos;t accumulate into a surprise bill.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lean Dockerfile: multi-stage Node build</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Ship only what runs. A <strong>multi-stage</strong> Dockerfile
          compiles in a full <strong>builder</strong> image, then copies just{" "}
          <strong>dist/ + production node_modules</strong> into a slim runtime.
          Pair it with a <strong>.dockerignore</strong> so{" "}
          <strong>node_modules, .git, and local env files</strong> never enter
          the build context (faster builds, no leaked secrets in layers).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Dockerfile"
            code={`# ---- builder: full toolchain, discarded after build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime: only what the server needs ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/index.js"]`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label=".dockerignore"
            code={`node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
dist
coverage
test-results
Dockerfile
.dockerignore
*.md`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Why two stages:</strong> the builder (~400 MB with dev
            deps) never ships — the runtime (~150 MB) holds only prod code.{" "}
            <strong>USER node</strong> avoids running as root inside the
            container.
          </li>
          <li>
            <strong>--omit=dev:</strong> production installs skip test and
            build tooling. Combined with <strong>.dockerignore</strong>, the
            context stays small and secrets in <strong>.env</strong> never
            become a layer.
          </li>
          <li>
            <strong>DevOps use:</strong> order COPY commands from
            least-changing (package.json) to most-changing (source) so Docker
            layer caching reuses install layers on every code edit.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Build, tag, push: the full flow with verify</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Same commands on your laptop and in CI. Build with the{" "}
          <strong>SHA tag</strong>, tag the registry URI, push, then{" "}
          <strong>pull back and inspect</strong> to prove the registry holds
          exactly what you built. The digest in the push output is what ECS
          will pin.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`SHA=$(git rev-parse --short HEAD)
REPO=123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp

docker build -t myapp:$SHA .
docker tag myapp:$SHA $REPO:$SHA
docker push $REPO:$SHA

docker pull $REPO:$SHA
aws ecr describe-images --repository-name myapp --image-ids imageTag=$SHA --query 'imageDetails[0].{tag:imageTags[0],digest:imageDigest,pushed: imagePushedAt}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[+] Building 42.1s (18/18) FINISHED
 => [runtime 6/6] COPY --from=builder /app/dist ./dist
 => naming to myapp:a1b2c3d

The push refers to repository [123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp]
a1b2c3d: digest: sha256:9f2c4a1b size: 1824

a1b2c3d: Pulling from myapp
Digest: sha256:9f2c4a1b -- Status: Image is up to date
{
  "tag": "a1b2c3d",
  "digest": "sha256:9f2c4a1b7d3e8f01c2a5b6d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
  "pushed": "2026-05-01T10:25:00Z"
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Push both tags if you like:</strong>{" "}
            <strong>$REPO:$SHA</strong> (immutable record) plus{" "}
            <strong>$REPO:latest</strong> (convenience). Deploys reference the
            SHA or digest — never latest.
          </li>
          <li>
            <strong>DevOps use:</strong> echo the digest into the pipeline log
            and the deploy ticket — stage and prod promote by pulling that
            digest, so &quot;works on my machine&quot; arguments end.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Scan on push: catch CVEs before deploy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          With <strong>scan on push</strong> enabled, ECR runs{" "}
          <strong>basic scanning</strong> on every pushed image and reports OS
          package CVEs as <strong>CRITICAL / HIGH / MEDIUM / LOW /
          INFORMATIONAL</strong>. Gate promotion on zero CRITICAL findings —
          a vulnerable base image should fail the pipeline, not reach prod.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr describe-image-scan-findings --repository-name myapp --image-id imageTag=a1b2c3d --query '{status:imageScanStatus.status,counts:imageScanFindings.findingSeverityCounts}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "status": "COMPLETE",
  "counts": {
    "CRITICAL": 0,
    "HIGH": 1,
    "MEDIUM": 3,
    "LOW": 5,
    "INFORMATIONAL": 12,
    "UNDEFINED": 0
  }
}
# Drill in with a filtered query for HIGH findings only`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Fix loop:</strong> bump the base image (
            <strong>node:20-alpine</strong> patch), rebuild, re-push — the new
            SHA gets a fresh scan. Record the clean SHA as the promotion
            candidate.
          </li>
          <li>
            <strong>DevOps use:</strong> block ECS deploys when{" "}
            <strong>CRITICAL &gt; 0</strong> (policy check in CodePipeline or
            Actions); file HIGH findings as tech-debt tickets with the image
            tag attached.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">IAM for CI: push/pull policy plus OIDC role</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          CI needs <strong>push</strong> (build jobs) and deploy targets need{" "}
          <strong>pull</strong> (ECS execution role). Grant them separately with
          least privilege: the GitHub OIDC role pushes to{" "}
          <strong>myapp only</strong>, and the ECS execution role pulls — no
          shared keys, no <strong>ecr:*</strong>.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="ecr-ci-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "GetToken",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Sid": "PushOnlyMyRepo",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "arn:aws:ecr:us-east-1:123456789012:repository/myapp"
    },
    {
      "Sid": "PullForVerify",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:DescribeImages"
      ],
      "Resource": "arn:aws:ecr:us-east-1:123456789012:repository/myapp"
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/ecr.yml"
            code={`permissions:
  id-token: write   # mint OIDC token
  contents: read

jobs:
  push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubECRPush
          aws-region: us-east-1
      - run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
          docker build -t myapp:\${{ github.sha }} .
          docker tag myapp:\${{ github.sha }} 123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:\${{ github.sha }}
          docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:\${{ github.sha }}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>ECS pulls separately:</strong> the task execution role needs
            only <strong>BatchGetImage + GetDownloadUrlForLayer</strong> plus{" "}
            <strong>logs:*</strong> — it can never push or overwrite a release.
          </li>
          <li>
            <strong>DevOps use:</strong> one OIDC role per repo/branch
            (trust policy pins <strong>you/myapp → main</strong>); fork PRs get
            no push credentials by design.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Cleanup: prune untagged, delete the repo</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Registries grow silently — every CI push adds layers. List images by
          push date, <strong>batch-delete untagged</strong> leftovers, and only
          then <strong>delete the repo</strong> when a service is retired (ECR
          refuses to delete non-empty repos, which protects you from accidents).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr list-images --repository-name myapp --filter tagStatus=UNTAGGED --query 'imageIds[*].imageDigest'
aws ecr batch-delete-image --repository-name myapp --image-ids imageDigest=sha256:olduntaggeddigest
aws ecr delete-repository --repository-name myapp-old --force`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[
  "sha256:1111aaaa...",
  "sha256:2222bbbb..."
]
{
  "imageIds": [{ "imageDigest": "sha256:olduntaggeddigest" }],
  "failures": []
}
{
  "repository": { "repositoryName": "myapp-old", "status": "deleted" }
}`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE TIER] 500 MB private storage for 12 months</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            New accounts get 500 MB-month of private ECR storage free for the
            first year — enough for several slim Node images with lifecycle
            pruning on. Public ECR pulls stay free within limits.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID] Beyond 500 MB plus transfer</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            Storage past 500 MB (~$0.10/GB-month), cross-region replication,
            and data transfer out to the internet are billed. Keep images slim,
            lifecycle rules aggressive, and pulls inside the same region.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>:latest-only tagging:</strong> pushing only{" "}
            <strong>:latest</strong> makes every deploy ambiguous and rollbacks
            impossible — the tag moved under you. Always push{" "}
            <strong>:git-sha</strong> and pin deploys to the digest.
          </li>
          <li>
            <strong>Secrets baked into layers:</strong> COPY of{" "}
            <strong>.env</strong> or <strong>ENV AWS_SECRET_KEY=...</strong>{" "}
            lives in layer history forever, even if a later layer deletes it.
            Use build secrets / runtime env injection and a strict{" "}
            <strong>.dockerignore</strong>.
          </li>
          <li>
            <strong>Huge build contexts:</strong> sending{" "}
            <strong>node_modules + .git + dist</strong> on every build wastes
            minutes and risks stale files. A tight <strong>.dockerignore</strong>{" "}
            plus multi-stage COPY keeps contexts to kilobytes of source.
          </li>
          <li>
            <strong>No lifecycle policy:</strong> every-commit pushes without
            expiry pile up gigabytes of untagged images. Set the 7-day untagged
            + last-10-tagged rules on repo creation day.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Mini lab + hands-on practice (8 tasks)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Mini lab (~20 min):</strong> create the <strong>myapp</strong>{" "}
          repo with immutable tags + scan on push, build the multi-stage
          Dockerfile, push <strong>:sha</strong>, verify with pull +{" "}
          <strong>describe-images</strong>, then confirm the scan shows zero
          CRITICAL before promoting the digest.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the build-once → SHA tag → scan → stage/prod pull flow and explain why the digest (not :latest) is pinned.</li>
          <li>Create the ECR repo with IMMUTABLE tags and scan on push via CLI; capture the repository URI output.</li>
          <li>Write the multi-stage Dockerfile plus .dockerignore and compare runtime image size against a single-stage build.</li>
          <li>Run the full build → tag :sha → push → pull → describe-images loop and record the digest.</li>
          <li>Read the scan findings output and fix one HIGH finding by bumping the base image and re-pushing.</li>
          <li>Create the least-privilege push policy and wire the OIDC push job; prove a fork PR cannot push.</li>
          <li>Apply the lifecycle policy and batch-delete one untagged image; verify storage drops.</li>
          <li>Retire a practice repo: prove delete fails while non-empty, then clean and delete it.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
