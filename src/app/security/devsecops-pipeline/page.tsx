import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Security (DevSecOps)"
      title="Security in the Pipeline"
      intro="The cheapest breach is the one that never merges. Shift-left means every commit is scanned — Terraform for misconfigurations, images for CVEs, code for secrets and vulnerable dependencies — with policy gates that block the merge, not a meeting. This lesson builds that pipeline locally for free, then points you to real projects."
      prev={{ href: "/security/detection-response", label: "GuardDuty, Inspector & Security Hub" }}
      next={{ href: "/projects", label: "Practical Projects" }}
      resources={[
        {
          title: "Checkov docs — bridgecrew",
          url: "https://www.freecodecamp.org/news/terraform-checkov-scanning/",
          description:
            "Beginner walkthrough of running Checkov against Terraform and reading its pass/fail output.",
        },
        {
          title: "Trivy vulnerability scanner — aqua docs",
          url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-cicd-litmus/container-image-scanning.html",
          description:
            "AWS prescriptive guidance on container image scanning in CI — where Trivy fits before ECR push.",
        },
        {
          title: "DevSecOps learning path — roadmap.sh",
          url: "https://roadmap.sh/devsecops",
          description:
            "Where SAST, SCA, image scanning, and policy-as-code sit in the full DevSecOps skill map.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Shift-left: catch it at the cheapest stage</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A misconfigured S3 bucket costs seconds to fix in a PR, hours in
          staging, and a headline in prod. Shift-left pushes each check to the
          earliest stage that can run it: pre-commit → PR → build → push →
          deploy.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`SHIFT-LEFT PIPELINE (cost of fix grows right)
 commit ---> PR ----------------> BUILD --------------> PUSH/DEPLOY
  |          | tfsec/checkov      | npm audit /         | OPA gate:
  | gitleaks | (IaC misconfig)    | Dependabot (deps)   | allow deploy?
  | (secrets)| branch protection  | trivy/scout (image) | signed + scanned
  | blocks   | blocks merge       | blocks push         | only, else BLOCK
  v          v                    v                     v
 $0 fix      $1 fix                $10 fix               $1000+ incident
 -- scan fast, fail the build loudly, show the exact line + fix --`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DevOps use:</strong> every gate is <strong>advisory →
            blocking</strong> over two weeks: warn first (learn the noise),
            then block (enforce the signal). Blocking on day one trains people
            to bypass.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">tfsec / checkov: scan Terraform before apply</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Static analysis for IaC: both tools flag open SGs, unencrypted
          buckets, missing MFA conditions, and wildcard IAM — with the file and
          line. Checkov covers more frameworks; tfsec is faster and simpler.
          Learn one deeply, recognize the other.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Install (pick one; both free, local, no AWS calls)
brew install tfsec            # macOS
pip install checkov           # anywhere with Python
tfsec --version && checkov --version

# Scan the module you already wrote
tfsec ./terraform --format readable
checkov -d ./terraform --framework terraform --compact --output cli`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`tfsec:
  Result #1 HIGH (aws-s3-enable-bucket-encryption): shop-assets has no SSE
    terraform/s3.tf:12-18 -> add server_side_encryption_configuration { rule { apply_server_side_encryption_by_default { sse_algorithm = "aws:kms" } } }
  Result #2 CRITICAL (aws-ec2-no-public-ingress-sgr): sg-app allows 0.0.0.0/0:22
    terraform/sg.tf:4-9 -> restrict cidr_blocks to ["YOUR_IP/32"]
  2 passed, 2 failed — fix, re-scan, then commit.

checkov:
  FAILED CKV_AWS_20 S3 public ACL (s3.tf:12) | FAILED CKV_AWS_260 SG ingress 0.0.0.0/0 (sg.tf:4)
  PASSED CKV_AWS_19 EBS encryption | PASSED CKV_AWS_111 IAM write without constraint... no wait, FAILED
# Fix cycle: edit -> re-scan -> 0 FAILED -> git commit (gate passes in CI too)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/security.yml"
            code={`name: security-gates
on: [push, pull_request]
jobs:
  iac-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/tfsec-action@v1
        with: { working_directory: terraform, soft_fail: false }
      - uses: bridgecrewio/checkov-action@v12
        with: { directory: terraform, framework: terraform, quiet: true }
  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
  image-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t shop-web:$GITHUB_SHA .
      - uses: aquasecurity/trivy-action@master
        with: { image-ref: shop-web:$GITHUB_SHA, severity: HIGH,CRITICAL, exit-code: 1 }`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Docker scout / trivy: scan images before push</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Images ship their OS with them — an old <strong>openssl</strong> in
          the base layer is your CVE now. Scan locally on every build, fail on
          HIGH/CRITICAL, and fix by bumping the base image tag.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker scout quickview shop-web:abc1234
docker scout cves shop-web:abc1234 --only-severity high,critical | head -20
trivy image --severity HIGH,CRITICAL --format table shop-web:abc1234 | head -30
# Fix = bump base, rebuild, rescan
sed -i 's/FROM python:3.11-slim-bullseye/FROM python:3.11-slim-bookworm/' Dockerfile
docker build -t shop-web:abc1235 . && trivy image --severity HIGH,CRITICAL shop-web:abc1235 | tail -5`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`scout quickview: base python:3.11-slim-bullseye, 214 packages, 2H 5M 11L
  HIGH CVE-2024-1234 openssl 3.0.11 (fix: 3.0.13 via bookworm) in 2 layers
trivy: shop-web:abc1234 -> HIGH:2 CRITICAL:0 (exit 1, push BLOCKED)
after bump: shop-web:abc1235 -> HIGH:0 CRITICAL:0 (exit 0, push ALLOWED)
# Rule: never push :latest untested — gate on digest that scanned clean.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Dependabot + secret scanning + branch protection</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Dependencies and credentials are the two quietest breach paths.
          GitHub automates both: Dependabot opens bump PRs, secret scanning
          (plus gitleaks pre-commit) blocks leaked keys, branch protection
          makes the scans mandatory.
        </p>
        <div className="mt-3">
          <CodeBlock
            label=".github/dependabot.yml"
            code={`version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
  - package-ecosystem: docker
    directory: /
    schedule: { interval: weekly }
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Pre-commit secret guard (local, free) — blocks the commit, not the push
pip install pre-commit && pre-commit install
cat .pre-commit-config.yaml
gitleaks detect --source . --verbose | head -20
# Branch protection (one-time, via gh CLI): scans must pass before merge
gh api repos/:owner/:repo/branches/main/protection -f required_status_checks[strict]=true \
  -f required_status_checks[checks][][context]='iac-scan' -f enforce_admins=true -f required_pull_request_reviews[required_approving_review_count]=1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`gitleaks: found 1 leak (.env: AWS_SECRET_ACCESS_KEY) -> COMMIT BLOCKED
# remove .env from git, add to .gitignore, rotate the exposed key (Lesson 2 drill)
Branch protection: main requires PR + 1 review + iac-scan green, admins included.
# Result: vulnerable-dep PR from Dependabot, leaked-key push rejected, unscanned merge impossible.`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">Danger: pushing secrets &quot;just to test CI&quot;</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            Secret scanning alerts on push — after the secret already left your
            laptop and entered Git history. Test scanners with canary values
            (AKIAIOSFODNN7EXAMPLE), never real keys. A real leak means rotate
            immediately per the Lesson 2 drill.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">OPA / policy gates: deploy only what policy allows</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Scanners find problems; policy gates enforce decisions. Open Policy
          Agent (OPA) / Conftest evaluates rules like{" "}
          <strong>&quot;deny unencrypted buckets&quot;</strong> or{" "}
          <strong>&quot;deny images with HIGH CVEs&quot;</strong> against plan
          JSON or image reports — and fails the pipeline with a reason.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="policy/s3.rego"
            code={`package main
deny[msg] {
  input.resource_type == "aws_s3_bucket"
  not input.values.server_side_encryption_configuration
  msg := sprintf("S3 bucket %s must have default encryption", [input.address])
}
deny[msg] {
  input.resource_type == "aws_security_group"
  some r in input.values.ingress
  r.cidr_blocks[_] == "0.0.0.0/0"
  r.from_port == 22
  msg := sprintf("SG %s exposes SSH to the world", [input.address])
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform plan -out=tfplan.binary && terraform show -json tfplan.binary > plan.json
conftest test plan.json --policy policy/ --output stdout | head -20
# CI: non-zero exit blocks apply. Same pattern gates images: conftest test trivy.json --policy policy/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`FAIL plan.json - main - S3 bucket aws_s3_bucket.assets must have default encryption
FAIL plan.json - main - SG aws_security_group.app exposes SSH to the world
2 tests, 0 passed, 2 failed — apply BLOCKED. Fix Terraform, re-plan, re-gate.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A–Z: green pipeline [FREE local]</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Everything runs on your laptop and GitHub free minutes — no AWS
          billing. End with a repo where an insecure commit cannot merge.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>A. Repo:</strong> clone your Terraform + Dockerfile repo; create branch sec/gates.</li>
          <li><strong>B. Break it:</strong> add one open SG (0.0.0.0/0:22) + one unencrypted bucket; commit to the branch.</li>
          <li><strong>C. tfsec:</strong> install + scan; record the 2 failures with file:line.</li>
          <li><strong>D. checkov:</strong> install + scan; compare IDs with tfsec output.</li>
          <li><strong>E. Fix:</strong> restrict SG, add SSE-KMS; re-scan both to 0 failures.</li>
          <li><strong>F. Image:</strong> build the app image; trivy/scout scan; note HIGH count.</li>
          <li><strong>G. Bump:</strong> update base image tag; rebuild; rescan to 0 HIGH/CRITICAL.</li>
          <li><strong>H. Secrets:</strong> install gitleaks + pre-commit; plant a canary key, prove the commit is blocked, remove it.</li>
          <li><strong>I. Dependabot:</strong> add dependabot.yml (npm + docker + actions, weekly).</li>
          <li><strong>J. Workflow:</strong> add security.yml (iac-scan + secrets-scan + image-scan); push and watch it run.</li>
          <li><strong>K. Protect main:</strong> require PR + review + iac-scan check; prove a direct push is rejected.</li>
          <li><strong>Z. Verify checkpoints:</strong> tfsec 0 failed; trivy 0 HIGH/CRITICAL; gitleaks blocks canary; unprotected merge impossible; workflow green on main.</li>
        </ol>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE local] No AWS charges in this lab</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            tfsec, checkov, Trivy, Scout (CLI), gitleaks, pre-commit, Dependabot,
            and GitHub Actions minutes on public repos are all free. You never
            create AWS resources here — scans run against local files.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>Warn then block:</strong> new gates run soft-fail for a sprint to tune noise, then hard-fail. Bypass needs a tracked exception.</li>
          <li><strong>One dashboard:</strong> tfsec + Trivy + Dependabot results aggregate into the PR checks panel — reviewers see security beside tests.</li>
          <li><strong>Golden images:</strong> platform team publishes patched base images weekly; app teams only bump the tag and rescan.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>Scanning only in CI, not pre-commit:</strong> slow feedback — developers wait 10 minutes to learn what gitleaks knew instantly.</li>
          <li><strong>Pinning :latest base images:</strong> unreproducible builds and surprise CVEs. Pin minor tags, bump deliberately.</li>
          <li><strong>soft_fail: true forever:</strong> advisory gates nobody reads. Graduate to blocking with an exception process.</li>
          <li><strong>Skipping the OPA gate:</strong> scanners without enforcement are suggestions. The plan-JSON gate is what stops the apply.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the shift-left chain with one tool per stage from memory.</li>
          <li>Scan your Terraform with tfsec AND checkov; fix every HIGH+ to zero.</li>
          <li>Scan your app image; bump the base tag until HIGH/CRITICAL hits zero.</li>
          <li>Plant a canary secret and prove pre-commit blocks it before CI ever sees it.</li>
          <li>Add Dependabot for 3 ecosystems and merge one bump PR this week.</li>
          <li>Write one OPA rule (deny open SSH) and gate a terraform plan with it.</li>
          <li>Protect main with required checks; demonstrate a blocked direct push.</li>
          <li>Next: take this hardened repo to /projects — deploy it behind WAF with OIDC, encrypted state, and these gates on.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
