import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Infrastructure as Code"
      title="AWS Mini-Project"
      intro="The capstone of the Terraform track: build a real VPC with two public subnets, a locked-down security group, and an EC2 web server running nginx — all from Terraform, A to Z. Then you will break it on purpose, fix it, and destroy every resource so the bill stays at zero."
      prev={{ href: "/iac-terraform/terraform-modules", label: "Modules & Project Structure" }}
      next={{ href: "/iac-terraform/cloudformation", label: "CloudFormation Essentials" }}
      resources={[
        {
          title: "Terraform AWS Provider",
          url: "https://registry.terraform.io/",
          description:
            "Reference for every resource used here — aws_vpc, aws_subnet, aws_security_group, aws_instance, and their arguments.",
        },
        {
          title: "Terraform Documentation",
          url: "https://developer.hashicorp.com/terraform",
          description:
            "Official guide to backends, state locking, plan/apply workflow, and the destroy lifecycle used in this lab.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm EC2 t2/t3.micro hours and EBS limits before you apply — and set a billing alarm first.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. What you are building</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A minimal but real production shape: your own VPC (not the default one), two public
          subnets across two AZs, an internet gateway with a public route table, a security
          group, and one EC2 instance bootstrapped with nginx via <code>user_data</code>.
          Everything is declared in Terraform; the console is only used to <strong>verify</strong>,
          never to click-create.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`                    +---------------- AWS account (us-east-1) ----------------+
                    |                                                     |
  Internet -------> |  Internet Gateway (igw-lab)                         |
                    |        |                                            |
                    |  Route table (public): 0.0.0.0/0 -> IGW              |
                    |     /                          \\                     |
                    |  Subnet A                    Subnet B                |
                    |  10.0.1.0/24                 10.0.2.0/24             |
                    |  us-east-1a                  us-east-1b              |
                    |     |                                               |
                    |  EC2 (t3.micro, nginx via user-data)                |
                    |  SG: SSH from MY-IP only, HTTP 80 open              |
                    |  EIP attached (or public IP) -> curl http://<ip>     |
                    |                                                     |
                    +-- Terraform state: S3 backend + native lockfile ----+
                                     |
                              S3 bucket (tf-state-xxx)
                              key = lab/terraform.tfstate`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> this is the smallest stack that exercises every core
          skill — networking, security, compute, bootstrapping, outputs, and teardown. Nail
          this lab and every later project (ALB + ASG, RDS, CI/CD) is the same pattern at
          larger scale.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Step 0 — Prereqs and cost briefing (read before you apply)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — tools and credentials.</strong> You need Terraform ≥ 1.6, AWS CLI v2,
          an IAM user or role with EC2/VPC/S3 permissions, and a key pair you can SSH with.
          Confirm the CLI works before writing any HCL:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform version
aws sts get-caller-identity
aws ec2 describe-availability-zones --region us-east-1 --query "AvailabilityZones[0:2].ZoneName"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Terraform v1.9.0 on linux_amd64
{
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/lab-user"
}
[ "us-east-1a", "us-east-1b" ]`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — create the key pair now.</strong> Losing SSH access to a running
          instance is the classic lab failure. Create it in the console (EC2 → Key Pairs) or
          the CLI, save the <code>.pem</code>, and lock permissions:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ec2 create-key-pair --key-name lab-key --query KeyMaterial --output text > lab-key.pem
chmod 400 lab-key.pem
ls -l lab-key.pem`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — what this lab costs when done right
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            t2/t3.micro: 750 hours/month free for 12 months. 30 GB EBS (gp2/gp3) free. VPC,
            subnets, route tables, IGW, and security groups are always free. One instance with
            an 8 GB root volume, destroyed the same day, costs effectively $0.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — three charges that ambush beginners
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            1) NAT Gateway ≈ $0.045/hr + per-GB — this lab uses a SINGLE public subnet design
            with NO NAT gateway, do not add one. 2) Idle Elastic IP: free only while attached
            to a running instance; release it after destroy. 3) Leaving the instance running
            for weeks burns free-tier hours — destroy the same day and set a $5 billing alarm
            first.
          </p>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> <code>aws sts get-caller-identity</code> returns
          your account, <code>lab-key.pem</code> exists with 400 permissions, and you have a
          billing alarm. Do not continue until all three are true.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Step 1 — Backend setup (S3 state + lockfile)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — create the state bucket.</strong> Bucket names are globally unique,
          so include your account ID or initials. Versioning on the bucket is your undo button
          for corrupted state:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws s3 mb s3://tf-state-lab-123456789012 --region us-east-1
aws s3api put-bucket-versioning --bucket tf-state-lab-123456789012 --versioning-configuration Status=Enabled`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — wire the backend.</strong> On Terraform ≥ 1.9, native S3 locking
          needs only <code>use_lockfile = true</code> — no DynamoDB table:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="backend.tf"
            code={`terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket       = "tf-state-lab-123456789012" # YOUR bucket name
    key          = "lab/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true # native S3 locking, no DynamoDB needed
  }
}

provider "aws" {
  region = var.region
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="variables.tf"
            code={`variable "region" {
  type        = string
  description = "AWS region for the whole lab."
  default     = "us-east-1"
}

variable "project" {
  type        = string
  description = "Prefix for Name tags."
  default     = "tf-lab"
}

variable "my_ip" {
  type        = string
  description = "Your public IP in CIDR form, e.g. 203.0.113.7/32. SSH is locked to this."
}

variable "key_name" {
  type        = string
  description = "Existing EC2 key pair for SSH."
  default     = "lab-key"
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform init
terraform validate`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Initializing the backend...
Successfully configured the backend "s3"!

Terraform has been successfully initialized!
Success! The configuration is valid.`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> <code>init</code> reports the S3 backend
          configured and <code>validate</code> passes. Check the bucket in the console — a{" "}
          <code>lab/terraform.tfstate</code> key appears after your first apply.
        </p>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Step 2 — Network: VPC, subnets, IGW, route table</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — declare the full network.</strong> Two public subnets (one per AZ)
          for resilience, one IGW, one public route table. Note{" "}
          <code>map_public_ip_on_launch = true</code> — that is what gives instances a public
          IP without any NAT:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="network.tf"
            code={`resource "aws_vpc" "lab" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "var.project-vpc" }
}

resource "aws_internet_gateway" "lab" {
  vpc_id = aws_vpc.lab.id
  tags   = { Name = "lab-igw" }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.lab.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "var.region-a placeholder"
  map_public_ip_on_launch = true
  tags                    = { Name = "lab-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.lab.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "second AZ placeholder"
  map_public_ip_on_launch = true
  tags                    = { Name = "lab-public-b" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.lab.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.lab.id
  }
  tags = { Name = "lab-public-rt" }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Replace the AZ placeholders with data-driven values — hardcoding{" "}
          <code>us-east-1a</code> breaks in accounts where that AZ is constrained. Use the{" "}
          <code>aws_availability_zones</code> data source:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="network.tf"
            code={`data "aws_availability_zones" "available" {
  state = "available"
}

# Then in each subnet:
# availability_zone = data.aws_availability_zones.available.names[0]  # subnet A
# availability_zone = data.aws_availability_zones.available.names[1]  # subnet B`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform fmt -recursive
terraform validate
terraform plan -var="my_ip=203.0.113.7/32" -out network.plan`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Success! The configuration is valid.

Plan: 7 to add, 0 to change, 0 to destroy.

  # aws_vpc.lab will be created
  + cidr_block = "10.0.0.0/16"
  # aws_subnet.public_a will be created
  + cidr_block = "10.0.1.0/24"
  # aws_subnet.public_b will be created
  + cidr_block = "10.0.2.0/24"
  # aws_internet_gateway.lab will be created
  # aws_route_table.public will be created
  + route { + cidr_block = "0.0.0.0/0" }`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> plan shows 7 network resources, zero errors.
          Do not apply yet — security and compute come first so the stack comes up complete.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Step 3 — Security: one tight security group</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — SSH from your IP only, HTTP open.</strong> Port 22 locked to{" "}
          <code>var.my_ip</code> (find yours via <code>curl -s checkip.amazonaws.com</code>);
          port 80 open so anyone can see the nginx page. Egress stays open for package
          installs:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="security.tf"
            code={`resource "aws_security_group" "web" {
  name        = "lab-web-sg"
  description = "SSH from my IP, HTTP open."
  vpc_id      = aws_vpc.lab.id

  ingress {
    description = "SSH from my IP only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip] # e.g. "203.0.113.7/32" — NEVER 0.0.0.0/0
  }

  ingress {
    description = "HTTP for nginx demo"
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

  tags = { Name = "lab-web-sg" }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`curl -s checkip.amazonaws.com
terraform plan -var="my_ip=203.0.113.7/32" | grep -A3 "aws_security_group"`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> the plan shows ingress 22 bound to your
          single IP. If your home IP changes (DHCP), re-run plan/apply with the new value —
          that is exactly what variables are for.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Step 4 — Compute: AMI lookup, instance, user-data</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — never hardcode an AMI ID.</strong> IDs differ per region and rot
          monthly. This data source always resolves the newest Amazon Linux 2023 image:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="compute.tf"
            code={`data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro" # free-tier eligible
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.key_name

  root_block_device {
    volume_size = 8    # stay inside the 30 GB free-tier allowance
    volume_type = "gp3"
  }

  user_data = <<-EOF
    #!/bin/bash
    set -eux
    dnf install -y nginx
    systemctl enable --now nginx
    echo "<h1>Hello from Terraform lab $(hostname -f)</h1>" > /usr/share/nginx/html/index.html
  EOF

  tags = { Name = "lab-web" }
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — expose outputs.</strong> You need the public IP and DNS without
          digging through the console:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="outputs.tf"
            code={`output "web_public_ip" {
  description = "Public IP of the nginx server."
  value       = aws_instance.web.public_ip
}

output "web_public_dns" {
  description = "Public DNS of the nginx server."
  value       = aws_instance.web.public_dns
}

output "vpc_id" {
  description = "Lab VPC id for console verification."
  value       = aws_vpc.lab.id
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> <code>terraform validate</code> passes and a
          full <code>terraform plan -var=&quot;my_ip=...&quot;</code> shows roughly 10–12
          resources to add (network + SG + instance). Read every line with{" "}
          <code>will be created</code> — that is your last chance to catch a wrong CIDR or
          instance type.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Step 5 — Apply and verify end to end</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — apply.</strong> One command builds the whole stack (2–4 minutes,
          mostly the instance booting):
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform apply -var="my_ip=203.0.113.7/32"
# review the plan, type: yes
terraform output`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Apply complete! Resources: 11 added, 0 changed, 0 destroyed.

Outputs:

vpc_id = "vpc-0abc1234def567890"
web_public_dns = "ec2-3-91-44-10.compute-1.amazonaws.com"
web_public_ip = "3.91.44.10"`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — verify like an operator.</strong> Three independent checks: HTTP
          reaches nginx, SSH works with your key, state is remote:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`curl -v http://3.91.44.10/
ssh -i lab-key.pem ec2-user@3.91.44.10 "systemctl is-active nginx"
aws s3 ls s3://tf-state-lab-123456789012/lab/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`< HTTP/1.1 200 OK
<h1>Hello from Terraform lab ip-10-0-1-10.ec2.internal</h1>
active
2024-01-01 10:00:00  terraform.tfstate`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> curl returns your HTML, SSH reports{" "}
          <code>active</code>, and the state file exists in S3. Console cross-check: EC2 →
          Instances shows 1 running, VPC → Your VPCs shows your lab VPC alongside default.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Step 6 — Break-fix drill: change instance type, read the diff</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Deliberate breakage is the fastest teacher. Change one attribute, read what{" "}
          <code>plan</code> says, then decide whether to keep or revert. First the safe
          version — a tag-only change that Terraform applies in place:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="compute.tf"
            code={`# Drill 1 (SAFE): add a tag — expect "1 to change", no replacement
resource "aws_instance" "web" {
  # ... unchanged ...
  tags = {
    Name  = "lab-web"
    Drill = "tag-change"
  }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform plan -var="my_ip=203.0.113.7/32"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`  # aws_instance.web will be updated in-place
  ~ tags = {
      + Drill = "tag-change"
        # (1 unchanged element hidden)
    }

Plan: 0 to add, 1 to change, 0 to destroy.`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Now the destructive version — changing <code>instance_type</code> on a stopped-only
          attribute forces <strong>replacement</strong> (new instance, new IP). Watch for the{" "}
          <code>forces replacement</code> marker:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Drill 2 (REPLACES): edit instance_type t3.micro -> t3.small, then:
terraform plan -var="my_ip=203.0.113.7/32"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`  # aws_instance.web must be replaced
  +/- instance_type = "t3.micro" -> "t3.small" # forces replacement

Plan: 1 to add, 0 to change, 1 to destroy.`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> reading <code>~</code> (update), <code>+/-</code>{" "}
          (replace), and <code>-/+</code> (destroy-first) in plan output is a daily
          production skill. Revert the drill (<code>t3.small → t3.micro</code>) with another
          apply so the lab stays free-tier sized.
        </p>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Step 7 — DESTROY in order and prove zero remains</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — destroy everything Terraform owns.</strong> One command reverses
          the whole lab. If you created the Elastic IP separately, release it first so
          destroy has nothing to orphan:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform destroy -var="my_ip=203.0.113.7/32"
# review the list, type: yes
terraform output
echo "exit code check: state should error with no outputs"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Destroy complete! Resources: 11 destroyed.

Warning: No outputs found. The state file is empty — all resources destroyed.`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — console verify: empty means empty.</strong> Terraform only deletes
          what it created; manually added EIPs or extra volumes survive. Run all three
          checks:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ec2 describe-instances --filters "Name=tag:Name,Values=lab-web" --query "Reservations[].Instances[].State.Name"
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=lab-*" --query "Vpcs[].VpcId"
aws ec2 describe-addresses --query "Addresses[?AssociationId==null].PublicIp"
aws s3 ls s3://tf-state-lab-123456789012/lab/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[ "terminated" ]
[]
[]
terraform.tfstate  (state file remains — bucket itself is NOT lab infra)`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — the destroy-day rule
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Instances, unattached EIPs, and NAT gateways bill by the hour whether you look at
            them or not. Destroy the same day you apply, release any idle Elastic IP, and
            keep the state bucket (empty buckets cost nothing) for the next lab.
          </p>
        </div>
      </section>

      {/* 10 */}
      <section>
        <h2 className="text-lg font-semibold">10. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>NAT Gateway left running:</strong> a single forgotten NAT costs more per
            week than this entire lab should ever cost. You do not need one with public
            subnets — if <code>plan</code> ever shows <code>aws_nat_gateway</code>, stop and
            remove it.
          </li>
          <li>
            <strong>Key pair lost or wrong permissions:</strong> no <code>.pem</code> means no
            SSH, and <code>0644</code> permissions make SSH refuse the key. Create the key
            before applying; <code>chmod 400</code> immediately.
          </li>
          <li>
            <strong>SG wide open (0.0.0.0/0 on port 22):</strong> bots scan fresh instances
            within minutes. SSH stays pinned to your IP; only port 80 is public in this lab.
          </li>
          <li>
            <strong>Hardcoded AMI IDs:</strong> an ID valid in us-east-1 fails in eu-west-1
            and goes stale monthly. Always use the <code>aws_ami</code> data source filter.
          </li>
          <li>
            <strong>Skipping destroy verification:</strong> &quot;destroy complete&quot; plus
            an idle EIP still bills. Run the three CLI checks (instances, VPCs, addresses)
            every time.
          </li>
        </ul>
      </section>

      {/* 11 */}
      <section>
        <h2 className="text-lg font-semibold">11. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Draw the lab architecture from memory (VPC, 2 subnets, IGW, route, SG, EC2) and compare it against the ASCII diagram above.</li>
          <li>Set up the S3 backend with use_lockfile, run init + validate, and prove the state key path in the console.</li>
          <li>Write network.tf A–Z with data-driven AZs; capture a plan showing exactly the VPC + subnets + IGW + route table.</li>
          <li>Lock SSH to your current public IP, apply, then change IPs (phone hotspot) and watch SSH fail — then re-apply with the new IP.</li>
          <li>Apply the full stack, verify with curl + SSH + terraform output, and screenshot all three successes.</li>
          <li>Run the break-fix drill: tag change (in-place) vs instance-type change (replacement); save both plan outputs and explain the symbols.</li>
          <li>Destroy the stack, run the three CLI empty-checks, and release any idle Elastic IP; record the final bill at $0.00.</li>
          <li>Rebuild the whole lab from scratch with a single apply to prove reproducibility — then destroy it again the same day.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
