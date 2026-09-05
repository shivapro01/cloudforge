import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Infrastructure as Code"
      title="Variables & Outputs"
      intro="Variables turn one Terraform codebase into dev, staging, and prod. This lesson covers input anatomy with types and validation, per-env tfvars with precedence, sensitive handling, outputs that feed scripts, locals naming, and a full two-environment example."
      prev={{ href: "/iac-terraform/terraform-state", label: "State & Remote Backends" }}
      next={{ href: "/iac-terraform/terraform-modules", label: "Modules & Project Structure" }}
      resources={[
        {
          title: "Terraform Variables & Outputs",
          url: "https://developer.hashicorp.com/terraform",
          description:
            "Official docs for input variable types, validation rules, tfvars files, sensitive values, and output blocks.",
        },
        {
          title: "freeCodeCamp Terraform Tutorials",
          url: "https://www.freecodecamp.org/",
          description:
            "Free hands-on lessons that practice variables, tfvars per environment, and outputs with extra drills.",
        },
        {
          title: "DevOps Roadmap",
          url: "https://roadmap.sh/",
          description:
            "Where Terraform variables, state, and modules sit in the full DevOps learning path — useful for sequencing what to learn next.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. Input anatomy: type, description, default, validation</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          An input variable is a named parameter with a <strong>type constraint</strong>, a{" "}
          <strong>description</strong> (required by every serious team&apos;s lint), an optional{" "}
          <strong>default</strong> (no default = required — Terraform prompts or fails in CI), and
          optional <strong>validation</strong> blocks that reject bad values at plan time instead
          of half-building infrastructure.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="variables.tf"
            code={`variable "project" {
  type        = string
  description = "Short prefix for all resource names, e.g. shop-dev."
}

variable "instance_count" {
  type        = number
  description = "Number of web instances."
  default     = 1
}

variable "enable_logging" {
  type        = bool
  description = "Attach S3 access logging."
  default     = true
}

variable "allowed_ports" {
  type        = list(number)
  description = "Ingress ports to open."
  default     = [80, 443]
}

variable "tags" {
  type        = map(string)
  description = "Extra tags merged onto every resource."
  default     = {}
}

variable "db" {
  type = object({
    engine   = string
    version  = string
    replicas = number
  })
  description = "Strictly shaped DB config — typos fail fast."
  default = {
    engine   = "postgres"
    version  = "15"
    replicas = 1
  }
}

variable "instance_type" {
  type        = string
  description = "EC2 size. Allowlist enforced below."
  default     = "t3.micro"

  validation {
    condition     = contains(["t3.micro", "t3.small"], var.instance_type)
    error_message = "Only t3.micro or t3.small allowed (cost control)."
  }
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Prefer precise types over <code>any</code>: <code>object()</code> and{" "}
          <code>map(string)</code> turn typos into instant plan errors. Validation blocks are your
          cheapest policy engine — allowed instance types, name length, CIDR checks — before any
          dollar is spent.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. tfvars per env: same code, different values</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Keep <code>variables.tf</code> identical everywhere; put per-environment values in{" "}
          <code>dev.tfvars</code> and <code>prod.tfvars</code>, then select with{" "}
          <code>-var-file</code>. Files ending in <code>.auto.tfvars</code> load automatically —
          handy for local defaults you never commit.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="dev.tfvars"
            code={`project       = "shop-dev"
instance_type = "t3.micro"
instance_count = 1
enable_logging = false
allowed_ports  = [80]
tags = {
  Env = "dev"
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="prod.tfvars"
            code={`project       = "shop-prod"
instance_type = "t3.small"
instance_count = 3
enable_logging = true
allowed_ports  = [80, 443]
tags = {
  Env = "prod"
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform plan -var-file="dev.tfvars"
terraform apply -var-file="prod.tfvars"
# One-off override without editing files:
terraform plan -var-file="dev.tfvars" -var="instance_count=2"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`PRECEDENCE (lowest -> highest wins):
  defaults in variables.tf
    < *.auto.tfvars (auto-loaded)
      < terraform.tfvars (auto-loaded)
        < -var-file="dev.tfvars" (explicit)
          < TF_VAR_name env vars
            < -var="name=value" flags

Same main.tf + dev.tfvars  => 1 x t3.micro, no logging
Same main.tf + prod.tfvars => 3 x t3.small, logging on`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> CI jobs pass <code>-var-file</code> per branch —{" "}
          <code>dev.tfvars</code> on feature branches, <code>prod.tfvars</code> only on main with
          manual approval. One reviewed codebase, N environments, zero copy-paste drift.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Sensitive vars: hide, don&apos;t store</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <code>sensitive = true</code> redacts values from CLI output — it does{" "}
          <strong>not</strong> encrypt them in state (see previous lesson). So never put real
          secrets in committed tfvars. Pass them via <code>TF_VAR_</code> environment variables
          or a secrets manager, and keep <code>*.tfvars</code> out of git except checked-in
          examples.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="variables.tf"
            code={`variable "db_password" {
  type        = string
  description = "RDS master password. Never commit a real value."
  sensitive   = true
  # No default on purpose: CI must inject it, local runs prompt once.
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Inject without writing to disk:
export TF_VAR_db_password="Sup3rSecret123"
terraform plan -var-file="dev.tfvars"

# CI equivalent (GitHub Actions / Jenkins secret -> env):
# TF_VAR_db_password: $\{{ secrets.DB_PASSWORD }}
# terraform apply -var-file="prod.tfvars" -auto-approve`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# With sensitive = true, plans redact:
  # aws_db_instance.shop will be created
  + password = (sensitive value)

# WITHOUT sensitive = true, the secret would print here in cleartext.
# Either way it IS stored plaintext in state — restrict bucket access.`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Outputs: the return values that feed everything else</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Outputs</strong> expose IDs, ARNs, and IPs after apply — the handoff to deploy
          scripts, other Terraform stacks (via remote state), and humans checking{" "}
          <code>terraform output</code>. Mark secret outputs <code>sensitive = true</code> so they
          do not echo, and consume machine-readable JSON in scripts.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="outputs.tf"
            code={`output "bucket_name" {
  description = "App bucket created by this stack."
  value       = aws_s3_bucket.app.id
}

output "web_ips" {
  description = "Public IPs for the inventory script."
  value       = aws_instance.web[*].public_ip
}

output "db_endpoint" {
  description = "RDS endpoint for the app config."
  value       = aws_db_instance.shop.endpoint
  sensitive   = true
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform output
terraform output -json web_ips > ips.json
terraform output -raw bucket_name`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ terraform output
bucket_name = "shop-dev-123456"
db_endpoint = <sensitive>
web_ips = [
  "3.4.5.6",
]

$ terraform output -raw bucket_name
shop-dev-123456`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Script pattern: <code>terraform output -json</code> piped into{" "}
          <code>jq</code> builds Ansible inventories, <code>.env</code> files, and smoke-test
          targets without anyone copy-pasting IPs from the console.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Locals vs variables: computed names live in locals</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Variables</strong> are inputs from outside. <strong>Locals</strong> are computed
          inside — derived names, merged tag maps, repeated expressions given one canonical home.
          Convention: <code>local.name_tag</code>, <code>local.common_tags</code>. If three
          resources all build <code>&quot;$&#123;var.project&#125;-web&quot;</code>, that string belongs in
          one local.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`locals {
  name_tag = "$\{var.project}-web"
  common_tags = merge(var.tags, {
    Project   = var.project
    ManagedBy = "terraform"
  })
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.al2023.id
  instance_type = var.instance_type
  tags          = merge(local.common_tags, { Name = local.name_tag })
}

resource "aws_s3_bucket" "app" {
  bucket = "$\{var.project}-123456"
  tags   = local.common_tags
}`}
          />
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Validation + preconditions: fail in seconds, not after billing</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <code>validation</code> guards a single variable; <code>precondition</code> guards a
          resource or output using several values together (e.g. &quot;prod must have at least 2
          instances&quot;). Both run at plan time — free — instead of failing 10 minutes into an
          apply.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = data.aws_ami.al2023.id
  instance_type = var.instance_type

  lifecycle {
    precondition {
      condition     = !(var.instance_count > 1 && var.instance_type == "t3.micro")
      error_message = "Multi-instance stacks need t3.small or larger."
    }
  }
}

check "prod_safety" {
  assert {
    condition     = var.project != "shop-prod" || var.enable_logging
    error_message = "Prod must keep access logging enabled."
  }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ terraform plan -var-file="prod.tfvars"
╷
│ Error: Resource precondition failed
│
│   on main.tf line 8, in resource "aws_instance" "web":
│    8:       condition = !(var.instance_count > 1 && var.instance_type == "t3.micro")
│
│ Multi-instance stacks need t3.small or larger.
╵
# Fix the tfvars, re-plan — zero AWS calls were made.`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — validation is free insurance
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            Every rejected plan here saves a real apply: no t3.small fleet in dev, no unlogged
            prod bucket, no 3-node mistake. Keep dev.tfvars on t3.micro × 1 so all local plans
            stay free-tier safe.
          </p>
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Full example: one stack, two environments</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Three files, two commands, two infrastructures. <code>variables.tf</code> declares the
          contract, <code>outputs.tf</code> exposes results, and the tfvars files pick dev vs
          prod sizing. Note the instance resource never hardcodes a count or type — everything
          flows from variables.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="variables.tf"
            code={`variable "project" {
  type        = string
  description = "Name prefix, e.g. shop-dev."
}

variable "instance_type" {
  type        = string
  description = "EC2 size."
  default     = "t3.micro"
  validation {
    condition     = contains(["t3.micro", "t3.small"], var.instance_type)
    error_message = "Only t3.micro or t3.small allowed."
  }
}

variable "instance_count" {
  type        = number
  description = "Web fleet size."
  default     = 1
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="outputs.tf"
            code={`output "project" {
  value = var.project
}

output "web_ips" {
  description = "Public IPs of the web fleet."
  value       = aws_instance.web[*].public_ip
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform plan -var-file="dev.tfvars"
terraform plan -var-file="prod.tfvars"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# --- dev.tfvars: shop-dev, t3.micro x1 ---
Plan: 1 to add, 0 to change, 0 to destroy.
Outputs:
  project = "shop-dev"
  web_ips = [ (known after apply) ]

# --- prod.tfvars: shop-prod, t3.small x3 ---
Plan: 3 to add, 0 to change, 0 to destroy.
Outputs:
  project = "shop-prod"
  web_ips = [ (known after apply), (known after apply), (known after apply) ]`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — plan prod, apply dev
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Planning both envs is free; applying prod (3 × t3.small) can exceed the free tier if
            left running. Apply dev, verify outputs, then destroy the same session. Only apply
            prod on a team account with budget approval.
          </p>
        </div>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Committing real secrets in tfvars:</strong> a pushed{" "}
            <code>prod.tfvars</code> with a DB password lives in git history forever. Commit only{" "}
            <code>example.tfvars</code> with fakes; inject real values via TF_VAR_ or SSM.
          </li>
          <li>
            <strong>type = any everywhere:</strong> strings where numbers belong surface as
            cryptic provider errors mid-apply. Declare exact types and validation so bad input
            fails at plan.
          </li>
          <li>
            <strong>Outputting secrets unsanitized:</strong> a non-sensitive output of a password
            prints it in CI logs and stores it visibly. Mark secret outputs sensitive and prefer{" "}
            <code>-raw</code> only for non-secret values.
          </li>
          <li>
            <strong>Duplicating expressions instead of locals:</strong> the same{" "}
            <code>merge(var.tags, …)</code> pasted five times drifts on the sixth edit. Compute
            once in locals, reference everywhere.
          </li>
          <li>
            <strong>Surprise precedence:</strong> a forgotten <code>terraform.tfvars</code> silently
            beats <code>variables.tf</code> defaults and confuses <code>-var-file</code> runs.
            List which files exist before debugging &quot;wrong value&quot; plans.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Add a typed object variable with a default and a validation rule; trigger the error message with a bad value.</li>
          <li>Create dev.tfvars and prod.tfvars for the same stack; plan each and diff the two outputs.</li>
          <li>Demonstrate precedence: set the same variable in defaults, terraform.tfvars, -var-file, TF_VAR_, and -var — record which wins.</li>
          <li>Convert a hardcoded DB password to sensitive = true + TF_VAR_ injection; show the redacted plan output.</li>
          <li>Expose three outputs (id, arn/list, sensitive endpoint) and consume one with terraform output -json into a script.</li>
          <li>Refactor three repeated tag/name expressions into locals and re-plan to prove zero changes.</li>
          <li>Add a lifecycle precondition (e.g. prod needs logging) and show it failing before any resource is created.</li>
          <li>Run a full dev apply → output → destroy cycle using only -var-file, leaving git status clean of secrets.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
