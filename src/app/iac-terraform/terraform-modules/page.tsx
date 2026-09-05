import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Infrastructure as Code"
      title="Modules & Project Structure"
      intro="Modules turn copy-pasted Terraform into versioned, reusable packages with clean interfaces. This lesson shows why modules exist, how to consume Registry modules safely, how to write your own A–Z, and how to lay out dev/prod environments that scale."
      prev={{ href: "/iac-terraform/terraform-variables", label: "Variables & Outputs" }}
      next={{ href: "/iac-terraform/terraform-aws-lab", label: "AWS Capstone Lab" }}
      resources={[
        {
          title: "Terraform Modules Documentation",
          url: "https://developer.hashicorp.com/terraform",
          description:
            "Official guide to module source, versioning, inputs/outputs, and project structure patterns.",
        },
        {
          title: "Terraform Registry",
          url: "https://registry.terraform.io/",
          description:
            "Browse the VPC and S3 modules used here — check versions, inputs, outputs, and pinning before reuse.",
        },
        {
          title: "DevOps Roadmap",
          url: "https://roadmap.sh/",
          description:
            "See where reusable modules and environment layout fit in the broader DevOps progression.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. Why modules: from copy-paste to versioned packages</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Without modules every team copies the same 80-line S3 bucket (versioning, encryption,
          logging, tags) and the copies drift within weeks. A <strong>module</strong> is a folder
          of <code>.tf</code> files with a declared <strong>interface</strong> —{" "}
          <code>source + version + inputs → outputs</code> — so consumers pass three variables
          instead of maintaining eighty lines.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`BEFORE (copy-paste):                    AFTER (module):
  envs/dev/main.tf (80 lines S3)          modules/s3-bucket/ (maintained ONCE)
  envs/prod/main.tf (80 lines, drifted!)       inputs: bucket_name, versioning, tags
  envs/staging/main.tf (80 lines, stale)       outputs: bucket_id, bucket_arn
                                          envs/dev/main.tf (8 lines: source+inputs)
  MODULE INTERFACE:                       envs/prod/main.tf (8 lines: same source)
  module "app" {
    source  = "./modules/s3-bucket"  ...or registry / git URL
    version = "1.0.0"                ...pins EXACT code (no surprise upgrades)
    inputs  = { bucket_name, tags }  ...only knobs consumers may turn
    outputs -> bucket_id, arn        ...what callers can wire elsewhere
  }`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> platform teams own hardened modules (encrypted bucket,
          compliant VPC); product teams consume them with pinned versions. Security fixes ship as
          a module minor bump, not a 20-repo copy-paste campaign.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Using public modules: Registry VPC with a pinned version</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The Registry hosts reviewed modules like <code>terraform-aws-modules/vpc/aws</code>.
          Always pin <code>version</code> — an unpinned module upgrades silently on the next{" "}
          <code>init</code> and can rename subnets under a live workload. Read the inputs/outputs
          tab first; required inputs fail fast if omitted.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.8.1" # PINNED: no surprise major upgrades

  name = "mod-demo"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = false # keep the lab free-tier safe (NAT costs $)
  tags = {
    ManagedBy = "terraform"
    Lesson    = "modules"
  }
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnets" {
  value = module.vpc.private_subnets
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform init
terraform plan -out vpc.plan`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Initializing modules...
- vpc in .terraform/modules/vpc (v5.8.1)

Plan: 21 to add, 0 to change, 0 to destroy.

  # module.vpc.aws_vpc.this[0] will be created
  + cidr_block = "10.0.0.0/16"
  # module.vpc.aws_subnet.private[0] will be created
  # module.vpc.aws_subnet.public[0] will be created
  # ... (route tables, IGW — no NAT gateway since disabled)

Outputs:
  vpc_id = (known after apply)
  private_subnets = [ (known after apply), (known after apply) ]`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — VPC lab stays free if NAT stays off
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            VPCs, subnets, route tables, and IGWs cost nothing; a NAT Gateway bills hourly plus
            per-GB. Keep enable_nat_gateway = false and destroy the lab VPC after verifying
            outputs.
          </p>
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Writing a module A–Z: modules/s3-bucket</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — scaffold three files.</strong> <code>variables.tf</code> declares the
          inputs (the only knobs callers get), <code>main.tf</code> builds the resources,{" "}
          <code>outputs.tf</code> exposes what callers may wire elsewhere. Nothing else is
          visible outside — internals stay free to refactor.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="modules/s3-bucket/variables.tf"
            code={`variable "bucket_name" {
  type        = string
  description = "Globally unique bucket name."
}

variable "versioning" {
  type        = string
  description = "Enabled or Suspended."
  default     = "Enabled"
  validation {
    condition     = contains(["Enabled", "Suspended"], var.versioning)
    error_message = "versioning must be Enabled or Suspended."
  }
}

variable "tags" {
  type        = map(string)
  description = "Tags applied to the bucket."
  default     = {}
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="modules/s3-bucket/main.tf"
            code={`resource "aws_s3_bucket" "this" {
  bucket = var.bucket_name
  tags   = var.tags
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id
  versioning_configuration {
    status = var.versioning
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256" # free SSE-S3, no KMS key needed
    }
  }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="modules/s3-bucket/outputs.tf"
            code={`output "bucket_id" {
  description = "Bucket name (id)."
  value       = aws_s3_bucket.this.id
}

output "bucket_arn" {
  description = "Bucket ARN for policies and modules downstream."
  value       = aws_s3_bucket.this.arn
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — call it from root.</strong> The root passes inputs and reads outputs
          via <code>module.NAME.OUTPUT</code>. Two environments, same module, different inputs:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`module "app_bucket" {
  source = "./modules/s3-bucket"

  bucket_name = "mod-lab-app-123456"
  versioning  = "Enabled"
  tags = {
    Name = "mod-lab-app"
    Env  = "dev"
  }
}

output "app_bucket_arn" {
  value = module.app_bucket.bucket_arn
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform init
terraform validate
terraform fmt -recursive
terraform plan`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Initializing modules...
- app_bucket in modules/s3-bucket

Success! The configuration is valid.

Plan: 3 to add, 0 to change, 0 to destroy.

  # module.app_bucket.aws_s3_bucket.this will be created
  + bucket = "mod-lab-app-123456"
  # module.app_bucket.aws_s3_bucket_versioning.this will be created
  + versioning_configuration { + status = "Enabled" }
  # module.app_bucket.aws_s3_bucket_server_side_encryption_configuration.this ...

Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

Outputs:

app_bucket_arn = "arn:aws:s3:::mod-lab-app-123456"`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Project layout: envs + modules + backend.hcl</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Scale with <strong>one root per environment</strong> sharing the same modules. Backend
          config lives in a per-env <code>backend.hcl</code> (backend blocks take no variables,
          so <code>-backend-config</code> injects bucket/key per env). Shared values flow through{" "}
          <code>.tfvars</code> as in the previous lesson.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`aws-devops-roadmap-terraform/
  modules/
    s3-bucket/        main.tf  variables.tf  outputs.tf
    web-stack/        main.tf  variables.tf  outputs.tf   <- composes s3 + ec2
  envs/
    dev/
      main.tf         <- module "app" { source = "../../modules/s3-bucket" ... }
      variables.tf    <- declares project, instance_type, ...
      dev.tfvars      <- project = "shop-dev", instance_type = "t3.micro"
      backend.hcl     <- bucket="tf-state-xxx" key="dev/terraform.tfstate"
      outputs.tf
    prod/
      main.tf         <- SAME modules, different inputs
      prod.tfvars     <- project = "shop-prod", instance_type = "t3.small"
      backend.hcl     <- key="prod/terraform.tfstate"
      outputs.tf
  # init per env:
  # envs/dev$  terraform init -backend-config=backend.hcl
  # envs/dev$  terraform apply -var-file=dev.tfvars`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="backend.hcl"
            code={`# envs/dev/backend.hcl — plain key=value, no variables allowed
bucket  = "tf-remote-state-987654321"
key     = "dev/terraform.tfstate"
region  = "us-east-1"
encrypt = true
# use_lockfile = true   # native S3 locking (TF >= 1.9)`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Rule of thumb: modules contain <strong>no backend blocks and no provider credentials</strong> —
          only the env roots configure state and region. That keeps modules portable across
          accounts and CI roles.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Versioning: git tags, ?ref=, and the Registry</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Local <code>source = &quot;./modules/s3-bucket&quot;</code> always tracks the working
          tree — fine inside one repo. Across repos, pin by <strong>git tag</strong> (
          <code>?ref=v1.0.0</code>) or a <strong>Registry version</strong> so upgrades are
          deliberate PRs, not drive-by breakages.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`# Git-sourced module pinned to a tag — reproducible everywhere
module "app_bucket" {
  source  = "git::https://github.com/acme/tf-modules.git//s3-bucket?ref=v1.2.0"
  bucket_name = "mod-lab-app-123456"
}

# Registry module pinned to an exact version
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.8.1"
  # ... inputs
}

# Inside ONE repo, relative path is enough (versioned by the repo's own tag)
module "web" {
  source = "../../modules/web-stack"
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Release flow for your own module repo:
git tag v1.2.0
git push origin v1.2.0
# Consumers bump ?ref=v1.1.0 -> v1.2.0 in a reviewed PR, then:
terraform init -upgrade  # ONLY upgrades when you ask
terraform plan`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Private Registry modules add search and access control for organizations; the mechanics
          are identical — <code>version</code> pin, changelog review, staged rollout dev →
          prod.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Testing sanity: validate, fmt, and plan in CI</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every module PR should run three gates: <code>terraform validate</code> (syntax and
          references), <code>terraform fmt -check -recursive</code> (canonical style — diffs stay
          reviewable), and <code>terraform plan</code> per environment (proves dev and prod both
          still converge). Heavier suites (Terratest, Checkov) come later; these three catch most
          breakage for free.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform fmt -check -recursive
terraform validate
terraform plan -var-file="dev.tfvars" -out dev.plan
terraform show -json dev.plan | head -c 400`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ terraform fmt -check -recursive
modules/s3-bucket/main.tf   # listed = needs formatting; run fmt -recursive to fix

$ terraform validate
Success! The configuration is valid.

$ terraform plan -var-file="dev.tfvars"
Plan: 3 to add, 0 to change, 0 to destroy.`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — keep CI plans free, applies deliberate
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Plan in CI is free and safe; auto-apply is how surprise bills happen. Gate prod
            applies behind manual approval, and destroy every lab VPC/bucket the same day you
            create it.
          </p>
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Unpinned module = surprise upgrades:</strong> omitting{" "}
            <code>version</code> or <code>?ref=</code> means the next <code>init -upgrade</code>{" "}
            can pull a breaking major. Pin everything; bump in reviewed PRs.
          </li>
          <li>
            <strong>Deep nesting (modules calling modules calling modules):</strong> three levels
            is the practical max. Deeper graphs hide which input controls what and make plans
            unreadable — compose flat, wide modules instead.
          </li>
          <li>
            <strong>Forgetting outputs:</strong> a module that creates a bucket but exposes no{" "}
            <code>bucket_arn</code> forces callers to hardcode or duplicate lookups. Expose every
            attribute a downstream stack plausibly needs.
          </li>
          <li>
            <strong>Backends/providers inside shared modules:</strong> a module with its own{" "}
            <code>backend &quot;s3&quot;</code> cannot be reused across envs. Keep state, region,
            and credentials in env roots only.
          </li>
          <li>
            <strong>Over-general knobs:</strong> fifteen booleans like{" "}
            <code>enable_x</code> recreate the complexity modules were meant to hide. Fix sane
            secure defaults; expose the three inputs teams actually vary.
          </li>
        </ul>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Sketch the before/after diagram for one copy-pasted resource in your repo; label source, version, inputs, outputs.</li>
          <li>Consume the Registry VPC module pinned to an exact version; run init + plan and record the resource count.</li>
          <li>Remove the version pin, run init -upgrade in a scratch copy, and note why that behavior is dangerous in prod.</li>
          <li>Build modules/s3-bucket A–Z (variables/main/outputs), call it from root, and capture the plan + apply outputs.</li>
          <li>Restructure into envs/dev + envs/prod with backend.hcl per env; init each and prove separate state keys.</li>
          <li>Tag your module repo v1.0.0, consume it via ?ref=, then release v1.0.1 and upgrade through a plan-only PR.</li>
          <li>Add validate + fmt -check + plan for both envs to a CI sketch; break formatting on purpose and watch the gate fail.</li>
          <li>Destroy all lab VPCs/buckets and verify zero billable resources remain in the console.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
