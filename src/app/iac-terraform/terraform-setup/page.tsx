import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Infrastructure as Code"
      title="Install & First Project"
      intro="You install Terraform once, then run the full init → plan → apply → destroy loop against a real S3 bucket. Follow every A–Z step in order — by the end you have a versioned Terraform project, a bucket created purely from code, and a proven cleanup routine."
      prev={{ href: "/iac-terraform/overview", label: "Start Here" }}
      next={{ href: "/iac-terraform/terraform-resources", label: "Resources, Providers & Data" }}
      resources={[
        {
          title: "Install Terraform",
          url: "https://developer.hashicorp.com/terraform",
          description:
            "Official install guides per OS plus the CLI reference for init, plan, apply, and destroy used in this lab.",
        },
        {
          title: "Terraform AWS Provider",
          url: "https://registry.terraform.io/",
          description:
            "Registry docs for the hashicorp/aws provider and the aws_s3_bucket resource — arguments, attributes, and examples.",
        },
        {
          title: "AWS CLI Configuration",
          url: "https://docs.aws.amazon.com/cli/",
          description:
            "How AWS CLI credentials, profiles, and regions resolve — the auth layer Terraform reuses in Step 3.",
        },
      ]}
    >
      {/* STEP 0 */}
      <section>
        <h2 className="text-lg font-semibold">Step 0. Prerequisites: CLI, region, budget alarm</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab rule:</strong> never run <code>terraform apply</code> without these three.
          Terraform inherits AWS authentication from the same credential chain as the CLI, applies
          to whatever default region is configured, and creates billable objects — so verify all
          three before installing anything.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# A. CLI authenticated (must print your account ID)
aws sts get-caller-identity

# B. Single region for the whole module (pick one, stay on it)
aws configure get region
# expect: us-east-1  (or your choice — just be consistent)

# C. Budget alarm exists (must list at least one budget)
aws budgets describe-budgets \\
  --account-id $(aws sts get-caller-identity --query Account --output text) \\
  --query "Budgets[*].[BudgetName,BudgetLimit.Amount]" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
    "UserId": "AIDAXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/lab-admin"
}
us-east-1
--------------------------------
|       DescribeBudgets        |
+---------------+--------------+
|  lab-5-dollar |  5           |
+---------------+--------------+`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          If any check fails, stop and fix it in Module 04 first: configure{" "}
          <code>aws configure</code>, set one region, and create the $5 billing alarm. Terraform
          will happily create resources in the wrong region on an unalarmed account — that is how
          surprise bills happen.
        </p>
      </section>

      {/* STEP 1 */}
      <section>
        <h2 className="text-lg font-semibold">Step 1. Install Terraform</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Install the official HashiCorp binary for your OS. Prefer the package manager path so
          upgrades are one command; the manual path works identically on any Linux distro.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Linux — HashiCorp apt repo (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg | \\
  gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \\
  https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \\
  sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install -y terraform

# Linux — manual fallback (any distro, no root repo needed)
curl -sSLO https://releases.hashicorp.com/terraform/1.9.8/terraform_1.9.8_linux_amd64.zip
unzip terraform_1.9.8_linux_amd64.zip
sudo mv terraform /usr/local/bin/
rm terraform_1.9.8_linux_amd64.zip`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# macOS (Homebrew)
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Windows (Chocolatey, run as Administrator)
choco install terraform -y

# Verify on ANY OS — pin this output in your notes
terraform version`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Terraform v1.9.8
on linux_amd64

Your version of Terraform is out of date... (message varies — v1.9+ is fine for this module)`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> pin the same Terraform version in CI (<code>terraform_version</code>{" "}
          in the pipeline) as on laptops — version drift between local 1.9 and CI 1.5 is a classic
          source of &quot;works on my machine&quot; plan diffs. This module assumes v1.5+.
        </p>
      </section>

      {/* STEP 2 */}
      <section>
        <h2 className="text-lg font-semibold">Step 2. Project layout + versions.tf</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every Terraform project is a directory of <code>.tf</code> files. Create a dedicated
          folder per project (never drop <code>.tf</code> files in your home directory), then add{" "}
          <code>versions.tf</code> first: it pins the Terraform engine version and declares exactly
          which provider (AWS, and which major version) this project needs.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`mkdir -p ~/terraform-labs/first-project
cd ~/terraform-labs/first-project
pwd   # confirm: .../terraform-labs/first-project (NOT ~ or /tmp)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="versions.tf"
            code={`terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Two details matter: <code>source = &quot;hashicorp/aws&quot;</code> tells{" "}
          <code>terraform init</code> where to download the plugin from (the Registry), and{" "}
          <code>~&gt; 5.0</code> means &quot;any 5.x, but not 6.0&quot; — patch updates flow in,
          breaking majors do not. The <code>random</code> provider generates the unique bucket
          suffix in Step 4 (S3 names are globally unique).
        </p>
      </section>

      {/* STEP 3 */}
      <section>
        <h2 className="text-lg font-semibold">Step 3. AWS authentication: env vars vs profile</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Terraform does <strong>not</strong> store AWS keys — it reuses the standard credential
          chain. Two sane options: <strong>environment variables</strong> (best for CI and short
          labs) or a <strong>named profile</strong> (best for daily laptop use with multiple
          accounts). Pick one per shell; never hardcode keys in <code>.tf</code> files.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Option A — env vars (short-lived lab shell; never commit these)
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...

# Option B — named profile (persistent laptop setup)
aws configure --profile lab-admin   # prompts for keys + region + json
export AWS_PROFILE=lab-admin
export AWS_REGION=us-east-1

# Either way, prove auth works before touching Terraform
aws sts get-caller-identity --query Arn --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`# Minimal AWS provider — region only, credentials come from env/profile
provider "aws" {
  region = "us-east-1"
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Keep the provider block minimal: region lives in code (so the project is explicit), keys
          stay <em>outside</em> code (so they never reach Git). If{" "}
          <code>aws sts get-caller-identity</code> works, <code>terraform plan</code> will
          authenticate too — same chain.
        </p>
      </section>

      {/* STEP 4 */}
      <section>
        <h2 className="text-lg font-semibold">Step 4. First resource: an S3 bucket with random suffix</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          S3 bucket names are <strong>globally unique</strong> — <code>my-bucket</code> is long
          taken. Append a <code>random_pet</code> suffix so every student gets a unique name from
          identical code, and add a <code>terraform {}</code>-independent <code>output</code> so the
          apply prints the name you will verify in Step 6.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`provider "aws" {
  region = "us-east-1"
}

resource "random_pet" "suffix" {
  length = 2
}

resource "aws_s3_bucket" "lab" {
  bucket = "tf-lab-\${random_pet.suffix.id}"

  tags = {
    Name      = "tf-first-bucket"
    ManagedBy = "terraform"
    Lesson    = "terraform-setup"
  }
}

output "bucket_name" {
  description = "Name of the bucket created by your first apply"
  value       = aws_s3_bucket.lab.id
}`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — this S3 lab costs $0
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            S3 gives 5 GB of standard storage, 20,000 GETs, and 2,000 PUTs free every month for 12
            months. One empty versioned bucket with zero objects consumes none of it — charges only
            appear if you upload gigabytes or enable extra features like replication.
          </p>
        </div>
      </section>

      {/* STEP 5 */}
      <section>
        <h2 className="text-lg font-semibold">Step 5. init → plan → apply (read every output)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Inexperienced users jump straight to apply. Professionals read the <strong>full</strong>{" "}
          output of each command — init proves the provider downloaded, plan proves exactly one
          addition with no surprises, apply proves the API call succeeded and prints outputs.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform init`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Finding hashicorp/random versions matching "~> 3.0"...
- Installing hashicorp/aws v5.69.0...
- Installed hashicorp/aws v5.69.0 (signed by HashiCorp)
- Installing hashicorp/random v3.6.3...
- Installed hashicorp/random v3.6.3 (signed by HashiCorp)
Terraform has been successfully initialized!`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform plan`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_s3_bucket.lab will be created
  + resource "aws_s3_bucket" "lab" {
      + bucket                      = (known after apply)
      + bucket_domain_name          = (known after apply)
      + bucket_regional_domain_name = (known after apply)
      + id                          = (known after apply)
      + tags                        = {
          + "Lesson"    = "terraform-setup"
          + "ManagedBy" = "terraform"
          + "Name"      = "tf-first-bucket"
        }
      + tags_all                    = {
          + "Lesson"    = "terraform-setup"
          + "ManagedBy" = "terraform"
          + "Name"      = "tf-first-bucket"
        }
    }

  # random_pet.suffix will be created
  + resource "random_pet" "suffix" {
      + id     = (known after apply)
      + length = 2
    }

Plan: 2 to add, 0 to change, 0 to destroy.

Outputs:

  + bucket_name = (known after apply)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform apply   # type "yes" ONLY after reading the plan above`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`random_pet.suffix: Creating...
random_pet.suffix: Creation complete after 0s [id=tidy-gibbon]
aws_s3_bucket.lab: Creating...
aws_s3_bucket.lab: Creation complete after 3s [id=tf-lab-tidy-gibbon]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:

bucket_name = "tf-lab-tidy-gibbon"`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> in CI this same plan output becomes a PR comment an approver
          must accept before apply runs — the plan <em>is</em> the change review. Never auto-apply
          without a human-readable plan on shared environments.
        </p>
      </section>

      {/* STEP 6 */}
      <section>
        <h2 className="text-lg font-semibold">Step 6. Verify: console + CLI</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Trust but verify through <strong>two independent lenses</strong>: the AWS console (what a
          teammate would see) and the CLI (what automation sees). Both must show the exact bucket
          name from your apply output.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Lens 1 — CLI: bucket exists and is empty
aws s3 ls | grep tf-lab
aws s3api get-bucket-tagging --bucket $(terraform output -raw bucket_name) \\
  --query "TagSet" --output table

# Lens 2 — state agrees with reality
terraform state list
terraform output bucket_name`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`2026-01-10 12:03:44 tf-lab-tidy-gibbon
----------------------------------
|        GetBucketTagging        |
+----------------+---------------+
|  ManagedBy     |  terraform    |
|  Name          |  tf-first-bucket |
|  Lesson        |  terraform-setup |
----------------------------------
aws_s3_bucket.lab
random_pet.suffix
"tf-lab-tidy-gibbon"`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Console check: S3 → Buckets → search <code>tf-lab-</code> → open it → confirm the region
          is <code>us-east-1</code> and the Tags tab shows <code>ManagedBy=terraform</code>. If CLI
          and console disagree, stop — you are likely looking at the wrong region or profile.
        </p>
      </section>

      {/* STEP 7 */}
      <section>
        <h2 className="text-lg font-semibold">Step 7. Destroy + prove it is gone</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every lab in this module ends the same way: <strong>destroy, then prove $0 state</strong>.
          Destroy reads the state file and deletes exactly what it created — nothing more. The
          verify commands after it are not optional; they catch the classic &quot;I thought it was
          deleted&quot; leftovers.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform destroy   # type "yes" after reading the "- destroy" plan
aws s3 ls | grep tf-lab || echo "OK: no tf-lab buckets remain"
terraform state list || echo "OK: state is empty"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`random_pet.suffix: Destroying... [id=tidy-gibbon]
random_pet.suffix: Destruction complete after 0s
aws_s3_bucket.lab: Destroying... [id=tf-lab-tidy-gibbon]
aws_s3_bucket.lab: Destruction complete after 1s

Destroy complete! Resources: 2 destroyed.

$ aws s3 ls | grep tf-lab || echo "OK: no tf-lab buckets remain"
OK: no tf-lab buckets remain
$ terraform state list || echo "OK: state is empty"
OK: state is empty`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — what happens if you skip destroy
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            An empty S3 bucket costs fractions of a cent, so skipping destroy here is harmless —
            but the habit kills. The next lessons create EC2 instances and NAT gateways that bill
            hourly whether you use them or not. Build the destroy-and-verify reflex on this free
            lab so it is automatic on expensive ones.
          </p>
        </div>
      </section>

      {/* mistakes */}
      <section>
        <h2 className="text-lg font-semibold">Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Apply without reading plan:</strong> the plan is the only pre-flight check.
            Blind <code>yes</code> on a shared project can replace a database. Read every{" "}
            <code>+</code>/<code>~</code>/<code>-</code> line first.
          </li>
          <li>
            <strong>Wrong region or profile:</strong> resources land in <code>us-west-2</code>{" "}
            while you stare at <code>us-east-1</code> console. Always echo{" "}
            <code>AWS_REGION</code>/<code>AWS_PROFILE</code> before init.
          </li>
          <li>
            <strong>Committing .terraform/ and *.tfstate:</strong> provider binaries (hundreds of
            MB) and state files (may contain secrets) must never reach Git. Create{" "}
            <code>.gitignore</code> with <code>.terraform/</code>,{" "}
            <code>*.tfstate*</code>, and <code>*.tfvars</code> on day one.
          </li>
          <li>
            <strong>Hand-editing the bucket then re-applying blindly:</strong> console edits become
            drift Terraform will revert on next apply. Change the <code>.tf</code> file, not the
            console, once a resource is managed.
          </li>
          <li>
            <strong>Reusing one directory for two labs:</strong> state files are per-directory.
            Mixing lessons in one folder merges their state and breaks destroy. One lab, one folder.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Day-one .gitignore for EVERY Terraform project
cat > .gitignore <<'EOF'
.terraform/
*.tfstate
*.tfstate.backup
*.tfvars
.terraform.lock.hcl
EOF
cat .gitignore`}
          />
        </div>
      </section>

      {/* tasks */}
      <section>
        <h2 className="text-lg font-semibold">Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Pass all three Step-0 checks (identity, region, budget) and paste the outputs into your lab notes.</li>
          <li>Install Terraform with the Step-1 method for your OS; record the exact terraform version output.</li>
          <li>Build versions.tf from scratch without copying: required_version, aws source hashicorp/aws, and the ~&gt; 5.0 pin — then explain what ~&gt; means.</li>
          <li>Configure ONE auth path (env vars or profile), prove it with aws sts get-caller-identity, then add the minimal provider block.</li>
          <li>Write main.tf with the random_pet suffix, run init → plan, and explain each &quot;(known after apply)&quot; line before applying.</li>
          <li>Apply, then verify through BOTH lenses: aws s3 ls output plus the console Tags tab — record the bucket name.</li>
          <li>Destroy and prove empty state with both verify commands; confirm no tf-lab bucket remains.</li>
          <li>Create .gitignore from the mistakes section, run git status, and confirm .terraform/ and *.tfstate* are ignored.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
