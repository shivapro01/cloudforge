import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Infrastructure as Code"
      title="Resources, Providers & Data"
      intro="Resources are the nouns (buckets, instances), providers are the plugins that create them, and data sources are read-only lookups into what already exists. This lesson dissects resource anatomy, multi-region providers, AMI/VPC data sources, count vs for_each, and cross-resource references — ending with a security-group-plus-EC2 stack."
      prev={{ href: "/iac-terraform/terraform-setup", label: "Install & First Project" }}
      next={{ href: "/iac-terraform/terraform-state", label: "State Management" }}
      resources={[
        {
          title: "Terraform Resources & Data Sources",
          url: "https://developer.hashicorp.com/terraform",
          description:
            "Official language docs for resource blocks, provider configuration, data sources, and meta-arguments like count and for_each.",
        },
        {
          title: "Terraform AWS Provider Registry",
          url: "https://registry.terraform.io/",
          description:
            "Reference for every hashicorp/aws resource used here — aws_s3_bucket, aws_instance, aws_security_group, and AMI data sources.",
        },
        {
          title: "freeCodeCamp Terraform Course",
          url: "https://www.freecodecamp.org/",
          description:
            "Free full-length Terraform walkthroughs that reinforce resources, providers, and state with extra lab hours.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. Resource anatomy: type.name + arguments + attributes</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every resource block has the same skeleton: <code>resource &quot;TYPE&quot; &quot;NAME&quot;</code>{" "}
          where TYPE is the provider object (<code>aws_s3_bucket</code>) and NAME is your local
          label (<code>lab</code>) used only inside Terraform — it is <em>not</em> the AWS name.
          Inside, <strong>arguments</strong> are inputs you set (bucket name, instance type);{" "}
          <strong>attributes</strong> are outputs AWS returns after creation (bucket ARN, instance
          public IP) that other blocks can reference.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`# TYPE = aws_s3_bucket (what AWS object) · NAME = lab (local label)
resource "aws_s3_bucket" "lab" {
  # ── arguments (you set these) ──
  bucket = "tf-anatomy-demo-123456" # must be globally unique
  tags = {
    Name = "anatomy-demo"
  }
}
# attributes AWS returns: lab.id, lab.arn, lab.bucket_domain_name
# reference elsewhere as: aws_s3_bucket.lab.arn`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`resource "aws_instance" "web" {
  # ── arguments ──
  ami           = "ami-0c614dee691cbbf37" # Amazon Linux 2023, us-east-1 (example)
  instance_type = "t3.micro"

  tags = { Name = "anatomy-web" }
}
# attributes AWS returns: web.id (i-xxx), web.public_ip, web.private_dns
# reference elsewhere as: aws_instance.web.public_ip`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The naming split confuses every beginner: the local label (<code>lab</code>,{" "}
          <code>web</code>) appears in plans and state, while the real AWS identifier (bucket name,{" "}
          <code>i-0abc123</code>) appears in the console. Rename a local label and Terraform plans
          to destroy + recreate — it thinks the old object vanished and a new one appeared.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Providers: the plugin + aliases for multi-region</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>provider</strong> is the binary plugin that translates HCL into AWS API calls.
          The default <code>provider &quot;aws&quot;</code> block sets the region and credentials
          context for every resource without an explicit provider. Pin its version with{" "}
          <code>~&gt; 5.0</code> (patch updates allowed, breaking v6 blocked) so a teammate running{" "}
          <code>init</code> six months later gets compatible behavior.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="versions.tf"
            code={`terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0" # 5.x only: bugfixes in, breaking v6 out
    }
  }
}

provider "aws" {
  region = "us-east-1" # default: every plain resource lands here
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          One project sometimes spans regions — primary app in <code>us-east-1</code>, log-archive
          bucket in <code>us-west-2</code>. Declare a second provider with an <strong>alias</strong>{" "}
          and attach it per-resource; resources without <code>provider = ...</code> keep using the
          default.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

resource "aws_s3_bucket" "app" {
  bucket = "tf-app-east-123456" # → us-east-1 (default provider)
}

resource "aws_s3_bucket" "archive" {
  provider = aws.west # → us-west-2 (aliased provider)
  bucket   = "tf-archive-west-123456"
}`}
          />
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Data sources: read what already exists</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Data sources</strong> (blocks starting with <code>data</code>) are read-only
          lookups evaluated at plan time — they create nothing. Use them instead of hardcoding AMI
          IDs (which rot monthly) or VPC IDs (which differ per account): query &quot;the latest
          Amazon Linux 2023 AMI&quot; or &quot;the default VPC&quot; and reference the result.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`# Latest Amazon Linux 2023 AMI — no hardcoded ami-xxx to rot
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# Default VPC + its subnets — works in any fresh account
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

output "ami_id" {
  value = data.aws_ami.al2023.id
}

output "default_vpc_id" {
  value = data.aws_vpc.default.id
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Preview what a data source returns — no apply needed
terraform console
> data.aws_ami.al2023.id
"ami-0c614dee691cbbf37"
> data.aws_vpc.default.cidr_block
"172.31.0.0/16"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# terraform plan excerpt — data resolved BEFORE resources
data.aws_ami.al2023: Reading...
data.aws_ami.al2023: Read complete after 1s [id=ami-0c614dee691cbbf37]
data.aws_vpc.default: Reading...
data.aws_vpc.default: Read complete after 0s [id=vpc-abc123]

Plan: 1 to add, 0 to change, 0 to destroy.`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Meta-arguments: count vs for_each, depends_on</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>count</strong> clones a resource N times addressed by index (
          <code>bucket[0]</code>, <code>bucket[1]</code>); <strong>for_each</strong> clones once per
          map/set key addressed by name (<code>bucket[&quot;logs&quot;]</code>). Prefer{" "}
          <code>for_each</code> for named things like buckets or environments — removing one key
          deletes one resource, while removing the middle of a <code>count</code> list shifts every
          index and forces recreates. Reserve <code>count</code> for truly identical replicas.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`# for_each: two NAMED buckets — stable addresses, safe to remove one
resource "aws_s3_bucket" "team" {
  for_each = toset(["app-logs", "app-assets"])
  bucket   = "tf-\${each.key}-123456"

  tags = { Name = each.key }
}

output "bucket_names" {
  value = { for k, b in aws_s3_bucket.team : k => b.id }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Plan: 2 to add, 0 to change, 0 to destroy.

  # aws_s3_bucket.team["app-assets"] will be created
  # aws_s3_bucket.team["app-logs"] will be created

Outputs:

bucket_names = {
  "app-assets" = "tf-app-assets-123456"
  "app-logs"   = "tf-app-logs-123456"
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Terraform infers most ordering from references (an instance referencing a security group
          waits for it automatically). Use <strong>depends_on</strong> only when the dependency is
          invisible in code — e.g. a provisioner or an eventual-consistency IAM propagation that no
          attribute reference captures.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`resource "aws_instance" "web" {
  ami           = data.aws_ami.al2023.id
  instance_type = "t3.micro"

  # Explicit order: no attribute reference, but must wait for the policy
  depends_on = [aws_iam_role_policy_attachment.web_logs]
}`}
          />
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Referencing + splat: wire resources together</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          References (<code>aws_vpc.main.id</code>) are how small blocks compose into real
          architecture: a subnet points at its VPC, a route table points at its gateway, an
          instance points at its subnet. The <strong>splat</strong> operator (<code>[*]</code>)
          collects one attribute across every instance of a counted/for_each resource into a list —
          the standard way to output all IPs or IDs at once.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags       = { Name = "ref-demo" }
}

# Reference: subnet consumes the VPC's id attribute
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  tags                    = { Name = "ref-demo-public" }
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "subnet_ids" {
  value = aws_subnet.public[*].id
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> one config, N environments — the same VPC/subnet/EC2 files
          deploy dev, staging, and prod with different <code>.tfvars</code> (covered next lesson).
          References keep the graph consistent per environment; splat outputs feed downstream
          systems like inventory scripts and load-balancer attachments.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Full example: security group + EC2, wired by reference</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          This stack combines everything: a data-source AMI (never hardcoded), a security group
          with least-privilege ingress, and an EC2 instance that references both. Note the instance
          never names a subnet or group ID literally — it points at{" "}
          <code>aws_security_group.web.id</code> and <code>data.aws_ami.al2023.id</code>, so the
          graph is portable across accounts.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="main.tf"
            code={`data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_security_group" "web" {
  name        = "tf-web-sg"
  description = "HTTP in, all out"

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "tf-web-sg" }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.web.id]

  tags = { Name = "tf-ref-web" }
}

output "instance_id" {
  value = aws_instance.web.id
}

output "public_ip" {
  value = aws_instance.web.public_ip
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Plan: 2 to add, 0 to change, 0 to destroy.

  # aws_security_group.web will be created
  + resource "aws_security_group" "web" {
      + id = (known after apply)
      + ingress = [{ cidr_blocks = ["0.0.0.0/0"], from_port = 80, to_port = 80, ... }]
    }

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami           = "ami-0c614dee691cbbf37"
      + instance_type = "t3.micro"
      + tags          = { "Name" = "tf-ref-web" }
    }

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:

instance_id = "i-0abc123def456"
public_ip   = "3.4.5.6"`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — destroy this EC2 example the same day
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            A t3.micro is free-tier eligible (750 hours/month), but only one instance fits — a
            second lab box running alongside burns past the allowance. Run terraform destroy right
            after verifying the public IP, and confirm zero running instances in the console.
          </p>
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Hardcoded AMI/subnet/VPC IDs:</strong> <code>ami-0abc123</code> from a tutorial
            is region-locked and months stale. Query with data sources (section 3) so the config
            works in any account.
          </li>
          <li>
            <strong>count on unordered or shrinking lists:</strong> removing index 0 of a{" "}
            <code>count = 3</code> list renumbers everything and recreates survivors. Use{" "}
            <code>for_each</code> with meaningful keys for anything you will add/remove.
          </li>
          <li>
            <strong>Missing depends_on where no reference exists:</strong> rare but real — IAM
            propagation and provisioner ordering have no attribute link. If applies fail
            intermittently on first run but pass on retry, an explicit{" "}
            <code>depends_on</code> is likely missing.
          </li>
          <li>
            <strong>Renaming local labels casually:</strong> changing <code>web</code> to{" "}
            <code>app</code> in <code>aws_instance.web</code> plans a destroy + create, not a
            rename. Use <code>moved</code> blocks (advanced) or accept the recreation.
          </li>
          <li>
            <strong>Copy-pasting security groups wide open:</strong> tutorial ingress with{" "}
            <code>0.0.0.0/0</code> on port 22 follows you to production. Scope SSH to your IP and
            keep HTTP-only defaults like the section-6 example.
          </li>
        </ul>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Draw a resource block and label its type, local name, one argument, and one attribute — then find each in the S3 example.</li>
          <li>Add an aliased provider for a second region; create one bucket per region and confirm each lands in the right console region.</li>
          <li>Replace a hardcoded AMI ID with the section-3 data source; verify via terraform console that the ID resolves.</li>
          <li>Build the two-bucket for_each example, apply, then remove ONE key and re-apply — confirm only one bucket is destroyed.</li>
          <li>Repeat with count = 3 and remove the middle element; observe the index-shift recreate, then revert to for_each.</li>
          <li>Wire the section-5 VPC → subnet reference from scratch; output the VPC ID and splat the subnet IDs.</li>
          <li>Deploy the full section-6 SG + EC2 stack, curl the public IP, then destroy it the same session and prove zero instances remain.</li>
          <li>Break something on purpose: hardcode a wrong AMI, read the plan/apply error, then fix it with the data source and note the lesson.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
