import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Infrastructure as Code"
      title="Start Here"
      intro="Clicking through the AWS console does not scale, cannot be reviewed, and cannot be repeated. Infrastructure as Code turns every VPC, bucket, and server into versioned text files you can review, test, and re-apply. This lesson explains what IaC is, how Terraform compares to scripts and other tools, and what you will build across this module."
      prev={{ href: "/iac-terraform", label: "Infrastructure as Code" }}
      next={{ href: "/iac-terraform/terraform-setup", label: "Install & First Project" }}
      resources={[
        {
          title: "Terraform Documentation — What is Infrastructure as Code?",
          url: "https://developer.hashicorp.com/terraform",
          description:
            "HashiCorp's official intro to IaC concepts, the Terraform workflow, and why declarative config beats manual provisioning.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Free-tier limits for S3, EC2, and VPC — everything this module builds stays inside these guardrails if you destroy lab resources.",
        },
        {
          title: "DevOps Roadmap",
          url: "https://roadmap.sh/",
          description:
            "Where IaC and Terraform sit on the full DevOps learning path — use it to orient this module among CI/CD, containers, and cloud.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. What Infrastructure as Code actually is</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Click-ops</strong> means building by hand in the console: click a VPC, click
          subnets, click a bucket, hope you remember every setting next time. It works once, then
          fails the three tests that matter in production: can someone <strong>review</strong> it
          before it goes live, can you <strong>repeat</strong> it exactly in a second account or
          region, and can you <strong>recover</strong> it after someone deletes it at 2 a.m.?
          Console clicks answer no to all three.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Infrastructure as Code (IaC)</strong> answers yes to all three by declaring
          infrastructure in text files stored in Git. A pull request that adds a database becomes
          reviewable like application code: teammates see the instance class, the backup window,
          and the open ports before anything is created. Merging and applying the same file in
          dev, staging, and prod gives you <strong>repeatability</strong> — no snowflake
          environments where staging works and prod mysteriously differs. And recovery becomes{" "}
          <code>terraform apply</code> instead of a weekend of re-clicking from screenshots.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`CLICK-OPS (what you are leaving behind)          IaC (where you are going)
─────────────────────────────────          ─────────────────────────
Console clicks ──► undocumented state       Code in Git ──► reviewed PR ──► applied
  • no history ("who opened port 22?")        • git log answers "who changed what, when"
  • no repeat ("rebuild staging exactly?")    • same files rebuild any environment
  • no rollback ("undo that delete?")         • git revert + apply rolls back`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> every serious team gates infrastructure changes through the
          same pipeline as app code — lint the config, plan it in CI, require approval, then apply.
          That is impossible with clicks and trivial with files, which is why IaC is the gateway
          skill to CI/CD for infrastructure (covered in the automation modules).
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Declarative vs imperative: describe the end, not the steps</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Imperative</strong> automation lists steps: create bucket, enable versioning, set
          encryption, attach policy — run them in order, handle failures yourself, and re-running
          may duplicate or crash. A shell script that calls{" "}
          <code>aws s3api create-bucket</code> twice fails the second time because the bucket
          already exists. You own idempotency, ordering, and drift detection.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Declarative</strong> config (Terraform, CloudFormation) states the desired end
          state — &quot;this bucket exists, versioned, encrypted&quot; — and the tool figures out
          the steps. Run <code>terraform apply</code> ten times and the result is the same one
          bucket: Terraform compares desired state against real state and only changes what
          drifted. Someone enabling public access by hand in the console shows up as drift in the
          next <code>terraform plan</code>, not as a silent mystery.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`IMPERATIVE (scripts)                        DECLARATIVE (Terraform)
─────────────────────                        ────────────────────────
step 1 → step 2 → step 3 → hope             desired state ──► Terraform ──► real state
  rerun = may fail / duplicate                 │ plan shows diff (+ add, ~ change, - destroy)
  drift = invisible                            │ apply converges, rerun = no changes
                                               │ hand-edits surface as drift, not mystery`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Imperative: fails on rerun (bucket already exists)
aws s3api create-bucket --bucket my-lab-123 --region us-east-1
aws s3api put-bucket-versioning --bucket my-lab-123 \\
  --versioning-configuration Status=Enabled
# run line 1 again → An error occurred (BucketAlreadyOwnedByYou)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`# Declarative: rerun is safe — second apply reports "No changes"
resource "aws_s3_bucket" "lab" {
  bucket = "my-lab-123"
}

resource "aws_s3_bucket_versioning" "lab" {
  bucket = aws_s3_bucket.lab.id
  versioning_configuration {
    status = "Enabled"
  }
}`}
          />
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Tool map: Terraform vs CloudFormation vs CDK vs ClickOps</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          AWS beginners meet four ways to create the same bucket. Learn when each wins so you can
          defend the Terraform default used in this module — and recognize when a job or project
          legitimately wants something else.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-[13px] leading-6">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2 font-medium">Tool</th>
                <th className="px-4 py-2 font-medium">Language</th>
                <th className="px-4 py-2 font-medium">Scope</th>
                <th className="px-4 py-2 font-medium">When it wins</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Terraform</td>
                <td className="px-4 py-2">HCL (declarative)</td>
                <td className="px-4 py-2">Multi-cloud + AWS</td>
                <td className="px-4 py-2">Default: portable skills, huge provider ecosystem, best plan output</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">CloudFormation</td>
                <td className="px-4 py-2">YAML/JSON (declarative)</td>
                <td className="px-4 py-2">AWS-only, native</td>
                <td className="px-4 py-2">Locked-down AWS orgs, newest services on day one, no extra binary</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">AWS CDK</td>
                <td className="px-4 py-2">TypeScript/Python (imperative-flavored)</td>
                <td className="px-4 py-2">AWS-only, synthesizes to CloudFormation</td>
                <td className="px-4 py-2">Developers who want loops/conditionals in a real language</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">ClickOps</td>
                <td className="px-4 py-2">Console clicks</td>
                <td className="px-4 py-2">One-off exploration</td>
                <td className="px-4 py-2">First 30 minutes of learning only — never production</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Why this module teaches Terraform:</strong> HCL reads like config rather than
          code, the plan/apply cycle is the clearest mental model for all declarative tools, and
          the skills transfer — CloudFormation stacks, CDK constructs, and even Ansible roles all
          reuse the declare → preview → apply → drift-detect loop you learn here.
        </p>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. How Terraform works: write → init → plan → apply → state</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Five verbs carry the whole module. <strong>Write</strong> HCL files describing resources.{" "}
          <strong>Init</strong> downloads the AWS provider plugin and sets up backends.{" "}
          <strong>Plan</strong> compares your files against real AWS plus the state file and prints
          a diff (<code>+</code> create, <code>~</code> update, <code>-</code> destroy).{" "}
          <strong>Apply</strong> executes the diff after your approval. <strong>State</strong> (a
          JSON snapshot, local or remote) is how Terraform remembers what it created so the next
          plan is incremental instead of starting from zero.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌───────────────┐
│ WRITE  │──▶│  INIT  │──▶│  PLAN  │──▶│ APPLY  │──▶│ STATE (memory)  │
│ *.tf   │   │ plugin │   │ diff   │   │ create │   │ what exists,    │
│ in Git │   │ +setup │   │ review │   │ change │   │ whose (outputs) │
└────────┘   └────────┘   └────────┘   └────────┘   └───────┬─────────┘
                                                           │ feeds next plan
                                                           └────────▶ drift? plan shows it`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cd first-project
terraform init     # one time per project: download hashicorp/aws provider
terraform plan     # preview: "Plan: 1 to add, 0 to change, 0 to destroy"
terraform apply    # approve with "yes": bucket appears in AWS
terraform destroy  # lab cleanup: remove everything this project created`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Memorize this loop now: every later lesson (variables, state, modules, the capstone lab)
          is a refinement of it — better inputs (variables), safer memory (remote state), reusable
          chunks (modules), bigger graphs (full VPC + EC2 stacks).
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. What you will build in this module</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Eight stops, each with its own lesson and lab. By the end you go from zero to a
          remote-state, module-driven AWS stack you could show in an interview:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Start Here</strong> (this lesson) — IaC mental model, tool choice, Terraform loop.
          </li>
          <li>
            <strong>Install &amp; First Project</strong> — install Terraform, create an S3 bucket with
            init → plan → apply → destroy.
          </li>
          <li>
            <strong>Resources, Providers &amp; Data</strong> — resource anatomy, provider pinning,
            data sources, count/for_each.
          </li>
          <li>
            <strong>Variables &amp; Outputs</strong> — parameterize one config across dev/staging/prod.
          </li>
          <li>
            <strong>State Management</strong> — local vs S3 + DynamoDB remote state, locking, drift.
          </li>
          <li>
            <strong>Modules</strong> — package a reusable VPC + EC2 module with versioning.
          </li>
          <li>
            <strong>AWS Capstone Lab</strong> — build and tear down a full VPC + EC2 + S3 stack from
            modules.
          </li>
          <li>
            <strong>CloudFormation &amp; CDK + SSM/Secrets</strong> — read native templates and store
            secrets properly.
          </li>
        </ol>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Setup checklist (do this before lesson 2)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Lesson 2 creates <em>real</em> AWS resources, so arrive prepared. All four items come
          from Module 04 (AWS setup) — revisit it if any step is unfamiliar:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>AWS account + IAM user:</strong> root secured with MFA, daily work as an IAM
            user with admin-for-lab permissions and access keys stored only in{" "}
            <code>~/.aws/credentials</code>.
          </li>
          <li>
            <strong>AWS CLI configured:</strong> <code>aws sts get-caller-identity</code> returns
            your account ID in your chosen region (use one region, e.g.{" "}
            <code>us-east-1</code>, for the whole module).
          </li>
          <li>
            <strong>Free-tier awareness:</strong> S3, micro EC2, and single-AZ VPC pieces used here
            fit the free tier — <em>only</em> if you destroy lab stacks the same day.
          </li>
          <li>
            <strong>Budget alarm at $5:</strong> a Billing alarm that emails you before any
            experiment can surprise you. Non-negotiable before running{" "}
            <code>terraform apply</code>.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — this module is designed to cost $0
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            S3 buckets, versioning, and small VPC/EC2 lab stacks stay free under the 12-month
            allowance as long as every lesson ends with terraform destroy and a console check. The
            setup lesson shows the exact verify-and-destroy commands.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Confirm you are ready for Lesson 2 (all four must succeed)
aws sts get-caller-identity --query Account --output text
aws configure get region
aws budgets describe-budgets --account-id $(aws sts get-caller-identity --query Account --output text) \\
  --query "Budgets[*].BudgetName" --output table
terraform version || echo "→ install Terraform in the next lesson"`}
          />
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Write one paragraph: what breaks in your current workflow if a VPC is deleted and only console clicks document it?</li>
          <li>Run the imperative two-liner from section 2 twice; note the exact rerun error, then explain how the HCL equivalent avoids it.</li>
          <li>Fill the tool-map table from memory for a teammate: which tool would you pick for an AWS-only locked-down bank vs a multi-cloud startup?</li>
          <li>Draw the write → init → plan → apply → state loop on paper and explain what state remembers between runs.</li>
          <li>Run the section-6 readiness commands; fix any failure (region, keys, budget alarm) before continuing.</li>
          <li>Confirm the free-tier limits for S3 and EC2 in the AWS Free Tier page and write down what &quot;destroy the same day&quot; protects you from.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
