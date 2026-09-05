import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Containers & Orchestration"
      title="ECR"
      intro="Amazon Elastic Container Registry (ECR) is your private Docker Hub on AWS — a fully managed registry where CI pushes immutable images and ECS, EKS, and Lambda pull them with IAM authentication. Learn to create repos, push and scan images, lock down access, and prune old tags before storage bills you."
      prev={{ href: "/containers/docker", label: "Docker" }}
      next={{ href: "/containers/ecs-fargate", label: "ECS + Fargate" }}
      resources={[
        {
          title: "Amazon ECR User Guide",
          url: "https://docs.aws.amazon.com/ecr/",
          description:
            "Official ECR docs: repositories, image push/pull, scanning, lifecycle policies, and replication.",
        },
        {
          title: "Docker Docs — Push Images to a Registry",
          url: "https://docs.docker.com/get-started/docker-concepts/building-images/pushing-images/",
          description:
            "How tagging, pushing, and pulling registries work from the Docker CLI side.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm the current ECR free-tier storage allowance (500 MB for 12 months) and what is paid beyond it.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">What ECR is (and why not Docker Hub)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>ECR</strong> stores your container images privately inside your
          AWS account, in your region. Docker Hub stores images too — but public
          by default on the free plan, with pull rate limits and no IAM. ECR is
          private by default, authenticates with IAM (no long-lived registry
          passwords), encrypts at rest, and integrates natively with ECS, EKS,
          Lambda, and CodeBuild. The mental model:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`Developer laptop / CI
        |  docker push (IAM-authenticated, HTTPS)
        v
ECR private repository  (my-app)
  |-- image:1.0  sha256:a1b2...   (immutable artifact CI tested)
  |-- image:1.1  sha256:c3d4...   (new release)
  |-- image:latest -> points at 1.1 (mutable pointer, never trust alone)
        |  docker pull / ECS task pull (execution role)
        v
ECS service / EKS pod / Lambda function  (runs the exact digest)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>IAM authentication:</strong> no{" "}
            <span className="font-mono text-[13px]">docker login -u user -p password</span>{" "}
            secrets. You run{" "}
            <span className="font-mono text-[13px]">aws ecr get-login-password | docker login</span>{" "}
            which mints a 12-hour token scoped by your IAM identity. CI uses an
            IAM role (OIDC), never a stored password.
          </li>
          <li>
            <strong>Scan on push:</strong> ECR can scan every pushed image for
            OS CVEs (basic scanning, Clair-based) or enable enhanced scanning
            via Inspector. Docker Hub scanning is a separate paid feature with
            no IAM tie-in.
          </li>
          <li>
            <strong>Lifecycle policies:</strong> JSON rules that auto-expire old
            untagged or old-numbered images (e.g. keep last 10). Docker Hub has
            no equivalent — stale tags accumulate forever unless you delete
            them by hand.
          </li>
          <li>
            <strong>DevOps use case:</strong> CI builds once, pushes{" "}
            <span className="font-mono text-[13px]">my-app:{"<sha>"}</span> to
            ECR, and every downstream stage (test, staging deploy, prod deploy)
            pulls the same digest. The registry is the single source of truth
            between build and deploy.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The full CI-driven push flow (CodeBuild → ECR with buildspec,
          caching, and tagging strategy) is covered step-by-step in{" "}
          <strong>Module 06 — ecr-build-push</strong>. This lesson covers the
          registry side: repos, manual push/pull, scanning, permissions, and
          cleanup.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A — Repository setup A–Z</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab A — create the repo, enable scanning, add a lifecycle
          policy.</strong> One repo holds all tags of one image (my-app). Set
          the region once so every command targets the same registry:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`export AWS_REGION=us-east-1
aws ecr create-repository \\
  --repository-name my-app \\
  --image-tag-mutability MUTABLE \\
  --image-scanning-configuration scanOnPush=true \\
  --region $AWS_REGION`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "repository": {
    "repositoryArn": "arn:aws:ecr:us-east-1:123456789012:repository/my-app",
    "registryId": "123456789012",
    "repositoryName": "my-app",
    "repositoryUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app",
    "imageTagMutability": "MUTABLE",
    "imageScanningConfiguration": { "scanOnPush": true }
  }
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>repositoryUri:</strong> the full registry address you tag
            against. Note the pattern{" "}
            <span className="font-mono text-[13px]">{"<account>"}.dkr.ecr.{"<region>"}.amazonaws.com/{"<repo>"}</span>.
            Save it — every docker tag/push uses it.
          </li>
          <li>
            <strong>MUTABLE vs IMMUTABLE:</strong> MUTABLE lets{" "}
            <span className="font-mono text-[13px]">:latest</span> be
            overwritten (convenient for dev). IMMUTABLE blocks overwriting an
            existing tag — prod repos should use it so a release tag can never
            be silently replaced.
          </li>
          <li>
            <strong>scanOnPush=true:</strong> every push triggers a basic OS
            vulnerability scan automatically. Verify it stuck:
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr describe-repositories --repository-names my-app --region $AWS_REGION --query 'repositories[0].imageScanningConfiguration'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock label="Output" code={`{ "scanOnPush": true }`} />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Now cap storage. Without a lifecycle policy every CI push accumulates
          forever. This policy keeps the last 10 tagged images and expires
          untagged layers (failed / overwritten pushes) after 7 days:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="lifecycle-policy.json"
            code={`{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep only last 10 tagged images",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["v", "1.", "main-"],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": { "type": "expire" }
    },
    {
      "rulePriority": 2,
      "description": "Expire untagged images after 7 days",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 7
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
            code={`aws ecr put-lifecycle-policy --repository-name my-app --lifecycle-policy-text file://lifecycle-policy.json --region $AWS_REGION
aws ecr get-lifecycle-policy --repository-name my-app --region $AWS_REGION --query 'lifecyclePolicyText' --output text | head -c 200`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "lifecyclePolicyText": "{\\"rules\\": ... }",
  "repositoryName": "my-app",
  "registryId": "123456789012",
  "lastEvaluatedAt": "2026-09-05T10:00:00+00:00"
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> describe-repositories shows
          scanOnPush true, and get-lifecycle-policy returns your two rules.
          Push #11 of a tagged image should expire the oldest — check with{" "}
          <span className="font-mono text-[13px]">aws ecr list-images --repository-name my-app</span>{" "}
          after your next pushes.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Push and pull: the full loop (condensed)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Four commands move a local image into ECR and back: login, build,
          tag, push. Pull verifies the round trip:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin 123456789012.dkr.ecr.$AWS_REGION.amazonaws.com
docker build -t my-app:1.0 .
docker tag my-app:1.0 123456789012.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.0
docker push 123456789012.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.0`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Login Succeeded
[+] Building 18.2s (12/12) FINISHED
 => naming to my-app:1.0
The push refers to repository [123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app]
a1b2c3d4e5f6: Pushed
b7c8d9e0f1a2: Pushed
1.0: digest: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 size: 1572`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>get-login-password | docker login:</strong> the token lasts
            12 hours. On expiry you just re-run it — never store it in a file
            or env var.
          </li>
          <li>
            <strong>tag:</strong> maps your local name to the registry address.
            Tag immutably (1.0, git SHA) AND optionally latest — never latest
            alone.
          </li>
          <li>
            <strong>digest (sha256:...):</strong> the content hash. Tags move;
            digests do not. ECS task definitions and rollbacks should pin the
            digest.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker rmi my-app:1.0
docker pull 123456789012.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.0
aws ecr describe-images --repository-name my-app --region $AWS_REGION --query 'imageDetails[*].[imageTags,imageDigest,imagePushedAt]' --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Untagged: my-app:1.0
1.0: Pulling from my-app
Digest: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Status: Downloaded newer image for 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.0
----------------------------------------------------------
|                     DescribeImages                     |
+----------------+---------------------------------------+---------------------+
|  1.0           |  sha256:e3b0c44...                    |  2026-09-05T10:15   |
+----------------+---------------------------------------+---------------------+`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> describe-images lists tag 1.0
          with a digest matching your push output. If pull fails with no basic
          auth credentials, your 12-hour token expired — re-run the login line.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Image scanning: findings and the fix cycle</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Because scan-on-push is on, every push is scanned. Check the verdict
          before deploying:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr describe-image-scan-findings --repository-name my-app --image-id imageTag=1.0 --region $AWS_REGION --query '{status:imageScanStatus,summary:imageScanFindingsSummary}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "status": { "status": "COMPLETE" },
  "summary": {
    "imageScanFindingsSummary": {
      "imageScanCompletedAt": "2026-09-05T10:16:00+00:00",
      "vulnerabilitySourceUpdatedAt": "2026-09-04T00:00:00+00:00",
      "findingSeverityCounts": { "CRITICAL": 0, "HIGH": 2, "MEDIUM": 5, "LOW": 11 }
    }
  }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr describe-image-scan-findings --repository-name my-app --image-id imageTag=1.0 --region $AWS_REGION --query 'imageScanFindings.findings[?severity==\`HIGH\`].[name,uri,severity]' --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-----------------------------------------------
|           DescribeImageScanFindings         |
+----------------------+----------------+-------+
|  CVE-2024-21626      |  runc           |  HIGH |
|  CVE-2024-XXXX       |  openssl 3.1.2  |  HIGH |
+--------------------------------------------+`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Fix cycle:</strong> bump the base image (e.g.{" "}
            <span className="font-mono text-[13px]">FROM node:20-slim</span> →
            latest patch), rebuild, push as 1.1, re-scan. Gate deploys: block
            ECS updates while CRITICAL findings are open.
          </li>
          <li>
            <strong>DevOps use case:</strong> CI runs describe-image-scan-findings
            after push and fails the pipeline on CRITICAL. Enhanced (Inspector)
            scanning adds continuous re-scans as new CVEs publish — worth it
            for prod, overkill for throwaway dev repos.
          </li>
          <li>
            <strong>Limitation:</strong> basic scanning covers OS packages, not
            application deps (npm/pip). Pair it with{" "}
            <span className="font-mono text-[13px]">npm audit</span> or Snyk in
            CI for language-level CVEs.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> scan status COMPLETE with a
          summary. PENDING means the scan is still running — wait 1–2 minutes
          and re-query.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">IAM policies: least-privilege push and pull</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Split permissions: developers/CI can <strong>push</strong>; ECS
          execution roles and deploy targets can only <strong>pull</strong>.
          Start with the auth token (every Docker client needs it), then scope
          the repo actions:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="ecr-push-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "GetAuthToken",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Sid": "PushToMyApp",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart",
        "ecr:DescribeImages",
        "ecr:DescribeImageScanFindings"
      ],
      "Resource": "arn:aws:ecr:us-east-1:123456789012:repository/my-app"
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="ecr-pull-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "GetAuthToken",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Sid": "PullFromMyApp",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:DescribeImages"
      ],
      "Resource": "arn:aws:ecr:us-east-1:123456789012:repository/my-app"
    }
  ]
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          CI should assume a role via OIDC (no stored AWS keys). The GitHub
          Actions role trusts your repo and carries only the push policy:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws iam create-role --role-name github-ecr-push --assume-role-policy-document file://trust-policy.json
aws iam put-role-policy --role-name github-ecr-push --policy-name EcrPush --policy-document file://ecr-push-policy.json`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="trust-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:my-org/my-app:*"
        }
      }
    }
  ]
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Why GetAuthorizationToken is *:</strong> it is an
            account-level action with no resource scoping — AWS requires the
            wildcard. Scope is enforced by the per-repo statements below it.
          </li>
          <li>
            <strong>DevOps use case:</strong> attach the pull policy to the ECS
            task execution role (it pulls the image) and the push policy to the
            CI role (it publishes). A compromised CI credential can push but
            cannot delete repos; a compromised task role can only pull.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Cross-account pull</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Prod often lives in a separate account (111122223333 pulls from
          tooling account 123456789012). A repository policy grants the pull —
          no image copying needed:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="cross-account-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowProdAccountPull",
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:root" },
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ]
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr set-repository-policy --repository-name my-app --policy-text file://cross-account-policy.json --region $AWS_REGION
# In account 111122223333, the ECS execution role still needs its own pull policy for the remote repo ARN`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "policyText": "{ ... }",
  "repositoryName": "my-app",
  "registryId": "123456789012"
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Both sides must allow it: the repo policy (resource side) plus the
          pulling role's identity policy. Miss either and pulls fail with 403.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Cleanup: delete images and repos</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Practice repos cost nothing to remove — do it when the lab ends. Bulk
          delete is one call:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ecr list-images --repository-name my-app --region $AWS_REGION
aws ecr batch-delete-image --repository-name my-app --image-ids imageTag=1.0 imageTag=latest --region $AWS_REGION
aws ecr delete-repository --repository-name my-app --force --region $AWS_REGION`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{ "imageIds": [{ "imageTag": "1.0" }, { "imageTag": "latest" }] }
{
  "imageIds": [{ "imageTag": "1.0" }, { "imageTag": "latest" }],
  "failures": []
}
{
  "repository": {
    "repositoryName": "my-app",
    "repositoryUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app"
  }
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>--force on delete-repository</strong> deletes the repo even
            with images inside. Without it, a non-empty repo errors out — a
            guardrail against accidents.
          </li>
          <li>
            <strong>DevOps use case:</strong> ephemeral PR repos
            (my-app-pr-123) get created per pull request and deleted on merge
            by CI — lifecycle policies handle tag churn inside long-lived
            repos; delete-repository handles whole-repo churn.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <p className="font-semibold">Cost: FREE for 500 MB (12 months), then pennies</p>
          <p className="mt-1">
            ECR is in the AWS Free Tier: 500 MB of private storage for 12
            months from account creation. Beyond that you pay per GB-month
            stored plus data transfer out. A few tutorial images stay free;
            lifecycle policies are what keep real CI repos cheap.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">Paid beyond free: storage + transfer</p>
          <p className="mt-1">
            Untagged layers, debug tags, and per-commit images pile up fast
            without a lifecycle policy. Cross-region replication and pulls to
            the public internet add transfer charges. Keep one demo repo with a
            tight policy; delete it when done practicing.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Immutable release gates:</strong> promote by digest, not by
            rebuilding — staging tests sha256:e3b0…, prod deploys the same
            bytes. Scan findings travel with the image.
          </li>
          <li>
            <strong>Multi-env promotion:</strong> one tooling-account repo
            serves dev/staging/prod via cross-account pull policies; IAM (not
            copied images) controls who sees what.
          </li>
          <li>
            <strong>Cache for fast CI:</strong> pull the previous tag as a
            BuildKit cache source so only changed layers rebuild — 5-minute
            builds drop to under a minute.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>No lifecycle policy → bill shock:</strong> nightly CI
            without expiry rules turns 500 MB free into tens of GB in weeks.
            Always set count/age expiry on day one.
          </li>
          <li>
            <strong>:latest-only tagging:</strong> latest is a moving pointer —
            you cannot tell what is running or roll back to it. Tag every push
            with the git SHA and a version; treat latest as a convenience alias
            only.
          </li>
          <li>
            <strong>Storing the login token:</strong> pasting
            get-login-password output into env files or CI secrets leaks a live
            credential. Pipe it straight into docker login; in CI use OIDC role
            assumption.
          </li>
          <li>
            <strong>IMMUTABLE repo + CI overwriting tags:</strong> rebuilding
            the same tag (e.g. main) against an IMMUTABLE repo fails every
            push. Use IMMUTABLE with unique tags (SHA/version), MUTABLE only
            where you intentionally float a pointer.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create a my-app repo with scan-on-push enabled and describe it back.</li>
          <li>Attach the two-rule lifecycle policy and verify it with get-lifecycle-policy.</li>
          <li>Log in, build, tag, and push version 1.0; record the digest from push output.</li>
          <li>Delete the local image, pull it from ECR, and confirm digests match.</li>
          <li>Read the scan findings; explain what CRITICAL vs HIGH means for a deploy gate.</li>
          <li>Attach the pull-only policy to a test role and prove push is denied.</li>
          <li>Push 3 more tags and show the lifecycle policy expiring the oldest.</li>
          <li>Batch-delete all images and delete the repo; confirm list-images is empty.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
