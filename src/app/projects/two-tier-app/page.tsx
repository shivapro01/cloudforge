import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Practical Projects"
      title="Two-Tier App with Terraform"
      intro="Project 2: the classic production shape — an ALB spreading traffic across EC2 web servers in two AZs, backed by RDS. All in Terraform: network, compute with user-data, database, outputs, a migration step, and an ordered destroy that respects snapshots."
      prev={{ href: "/projects/static-site", label: "Static Site on S3" }}
      next={{ href: "/projects/ecs-pipeline", label: "ECS App with Pipeline" }}
      resources={[
        {
          title: "Elastic Load Balancing Documentation",
          url: "https://docs.aws.amazon.com/elasticloadbalancing/",
          description:
            "ALB listeners, target groups, and health-check settings this project wires to the EC2 tier.",
        },
        {
          title: "Terraform AWS Provider — EC2 & RDS",
          url: "https://registry.terraform.io/providers/hashicorp/aws/latest/docs",
          description:
            "Reference for aws_instance, aws_lb, aws_db_instance, subnets, and security groups used below.",
        },
        {
          title: "Amazon RDS Documentation",
          url: "https://docs.aws.amazon.com/rds/",
          description:
            "Instance classes, Multi-AZ trade-offs, snapshots, and safe deletion patterns for the destroy step.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">1. What you are building</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Internet traffic hits an Application Load Balancer, which forwards to
          EC2 instances spread across <strong>two AZs</strong>. The app reads
          and writes an RDS database in private subnets. Public subnets hold
          the ALB + EC2; private subnets hold RDS — least privilege by design.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`                    +----------- AWS (us-east-1) -----------+
                    |                                         |
  Internet -------> |  ALB (public subnets, 2 AZs)            |
                    |    port 80 listener -> target group     |
                    |        /                    \\            |
                    |  EC2 web-A (1a)        EC2 web-B (1b)   |
                    |  user-data: nginx +    user-data: same  |
                    |  app page               app page        |
                    |        \\                    /            |
                    |     Security groups: ALB->EC2 :80 only   |
                    |        |                                |
                    |  RDS MySQL/Postgres (PRIVATE subnets)   |
                    |  SG: EC2 SG only, port 3306/5432        |
                    +-----------------------------------------+
      Terraform state: S3 backend + lockfile | Outputs: ALB DNS, DB endpoint`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE — what stays $0 here
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            EC2 t2/t3.micro (750 hrs/month) and RDS db.t3.micro (750 hrs, 20 GB
            gp2) are free-tier eligible. VPC, subnets, route tables, IGW, and
            security groups are always free. Build, verify, destroy same-day.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — warnings before you apply
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            ALB bills ~$0.025/hr + LCU charges from minute one — no free tier.
            NAT Gateways (~$0.045/hr each) and Multi-AZ RDS (doubles instance
            cost) are the budget killers: this build uses NO NAT and
            single-AZ RDS (<code>multi_az = false</code>).
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. Step A — Prereqs and repo layout</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — set up the workspace.</strong> You need Terraform ≥
          1.6, AWS CLI v2, an EC2 key pair, and your public IP for SSH. One
          directory per layer keeps plans readable:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws sts get-caller-identity --query Account --output text
aws ec2 describe-availability-zones --query "AvailabilityZones[0:2].ZoneName" --region us-east-1
curl -s checkip.amazonaws.com   # save as MY_IP/32 for var.my_ip
mkdir -p two-tier-app/infra && cd two-tier-app/infra
ls`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> account ID prints, two AZ names
          return, and you have your public IP. Do not apply until the billing
          alarm from the Start Here page exists.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">3. Step B — Network HCL: VPC, subnets, ALB plumbing</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — public + private subnets across 2 AZs.</strong> The
          ALB and EC2 live in public subnets; RDS lives in private subnets with
          no internet route. AZs come from a data source — never hardcode:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="infra/network.tf"
            code={`data "aws_availability_zones" "azs" { state = "available" }

resource "aws_vpc" "app" {
  cidr_block           = "10.1.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "two-tier-vpc" }
}

resource "aws_internet_gateway" "app" {
  vpc_id = aws_vpc.app.id
  tags   = { Name = "two-tier-igw" }
}

# 2 public subnets (ALB + EC2) — one per AZ
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.app.id
  cidr_block              = "10.1.\${count.index}.0/24"
  availability_zone       = data.aws_availability_zones.azs.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "two-tier-public-\${count.index}" }
}

# 2 private subnets (RDS) — one per AZ, NO public IPs, NO IGW route
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.app.id
  cidr_block        = "10.1.1\${count.index}.0/24"
  availability_zone = data.aws_availability_zones.azs.names[count.index]
  tags              = { Name = "two-tier-private-\${count.index}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.app.id
  route { cidr_block = "0.0.0.0/0" gateway_id = aws_internet_gateway.app.id }
  tags = { Name = "two-tier-public-rt" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_db_subnet_group" "app" {
  name       = "two-tier-dbsubnet"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "two-tier-dbsubnet" }
}`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">4. Step C — Security groups: three tight tiers</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step C — least privilege between tiers.</strong> ALB accepts
          world HTTP; EC2 accepts HTTP <em>only from the ALB</em> plus SSH from
          your IP; RDS accepts DB traffic <em>only from the EC2 group</em>:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="infra/security.tf"
            code={`variable "my_ip" { description = "Your IP in CIDR form, e.g. 203.0.113.7/32" }

resource "aws_security_group" "alb" {
  name = "two-tier-alb-sg"  vpc_id = aws_vpc.app.id
  ingress { from_port = 80 to_port = 80 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0  to_port = 0  protocol = "-1"  cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "ec2" {
  name = "two-tier-ec2-sg"  vpc_id = aws_vpc.app.id
  ingress { # HTTP ONLY from the ALB
    from_port = 80 to_port = 80 protocol = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  ingress { # SSH ONLY from you
    from_port = 22 to_port = 22 protocol = "tcp" cidr_blocks = [var.my_ip]
  }
  egress { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "db" {
  name = "two-tier-db-sg"  vpc_id = aws_vpc.app.id
  ingress { # MySQL ONLY from the app tier
    from_port = 3306 to_port = 3306 protocol = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }
  egress { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> <code>terraform validate</code>{" "}
          passes and plan shows the three groups with chained references (no
          0.0.0.0/0 on port 22 or 3306 anywhere).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">5. Step D — Compute + DB: user-data, ALB, RDS</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step D — wire compute and data.</strong> Two EC2 instances
          (one per AZ) bootstrapped with nginx via user-data, an ALB with
          target group + health check, and a single-AZ RDS instance with
          deletion safeguards:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="infra/compute.tf"
            code={`data "aws_ami" "al2023" {
  most_recent = true  owners = ["amazon"]
  filter { name = "name" values = ["al2023-ami-*-x86_64"] }
}

variable "key_name" { default = "lab-key" } # YOUR existing key pair

resource "aws_instance" "web" {
  count                  = 2
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public[count.index].id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_name
  user_data = <<-EOF
    #!/bin/bash
    set -eux
    dnf install -y nginx mysql  # mysql client for the migration step
    systemctl enable --now nginx
    echo "<h1>Two-tier OK from $(hostname -f) (AZ \${count.index})</h1>" > /usr/share/nginx/html/index.html
  EOF
  tags = { Name = "two-tier-web-\${count.index}" }
}

resource "aws_lb" "app" {
  name               = "two-tier-alb"
  load_balancer_type = "application"
  subnets            = aws_subnet.public[*].id
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_lb_target_group" "app" {
  name     = "two-tier-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.app.id
  health_check { path = "/" matcher = "200" healthy_threshold = 2 unhealthy_threshold = 3 interval = 15 }
}

resource "aws_lb_target_group_attachment" "app" {
  count            = 2
  target_group_arn = aws_lb_target_group.app.arn
  target_id        = aws_instance.web[count.index].id
  port             = 80
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port = 80  protocol = "HTTP"
  default_action { type = "forward" target_group_arn = aws_lb_target_group.app.arn }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="infra/database.tf"
            code={`variable "db_password" { sensitive = true description = "Master password (min 8 chars). Pass via TF_VAR_db_password." }

resource "aws_db_instance" "app" {
  identifier             = "two-tier-db"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"   # free-tier eligible
  allocated_storage      = 20
  db_name                = "appdb"
  username               = "appuser"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.app.name
  vpc_security_group_ids = [aws_security_group.db.id]
  multi_az               = false           # keep single-AZ: Multi-AZ doubles cost
  publicly_accessible    = false
  skip_final_snapshot    = true            # LAB ONLY — production takes a final snapshot
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="infra/outputs.tf"
            code={`output "alb_dns"     { value = aws_lb.app.dns_name }
output "db_endpoint"  { value = aws_db_instance.app.endpoint }
output "instance_ids" { value = aws_instance.web[*].id }`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">6. Step E — Apply, migration step, verify</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step E — build the stack.</strong> Apply takes 8–12 minutes
          (RDS is slow). Then run the migration step: create a table from one
          EC2 host and prove both web nodes serve through the ALB:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`export TF_VAR_db_password='Sup3rSecretLab!'
terraform init && terraform validate
terraform plan -var="my_ip=203.0.113.7/32" -out app.plan
terraform apply "app.plan"   # 8-12 min: RDS provisioning dominates
ALB=$(terraform output -raw alb_dns)
DB=$(terraform output -raw db_endpoint)
echo "ALB=$ALB  DB=$DB"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Migration step: create schema from web-0 through the private DB endpoint
ssh -i lab-key.pem ec2-user@$(aws ec2 describe-instances --instance-ids $(terraform output -json instance_ids | head -1) --query "Reservations[0].Instances[0].PublicIpAddress" --output text) \\
  "mysql -h $DB -u appuser -p'Sup3rSecretLab!' -e 'CREATE TABLE IF NOT EXISTS appdb.visits(id INT AUTO_INCREMENT PRIMARY KEY, seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP); SHOW TABLES FROM appdb;'"
# Verify: hit the ALB repeatedly — both AZ backends answer over time
for i in 1 2 3 4; do curl -s http://$ALB/; done
aws elbv2 describe-target-health --target-group-arn $(aws elbv2 describe-target-groups --names two-tier-tg --query "TargetGroups[0].TargetGroupArn" --output text) --query "TargetDescriptions[].TargetHealth.State"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Tables_in_appdb: visits
<h1>Two-tier OK from ip-10-1-0-10... (AZ 0)</h1>
<h1>Two-tier OK from ip-10-1-1-20... (AZ 1)</h1>
[ "healthy", "healthy" ]`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> both AZ hostnames appear across
          repeated curls and both targets report <code>healthy</code>. Break-fix
          drill: stop nginx on one instance and watch the ALB mark it{" "}
          <code>unhealthy</code> while the other keeps serving.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">7. Step F — DESTROY in order (snapshots note)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step F — order matters.</strong> Deregister ALB targets
          first so no health-check noise, then one destroy removes the rest.
          Snapshot note: this lab sets <code>skip_final_snapshot = true</code>{" "}
          so destroy completes unattended — production flips it to false and
          pays pennies for the retained snapshot, which you must delete
          separately:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1) Drain ALB targets first (avoids destroy-time health-check errors)
TG=$(aws elbv2 describe-target-groups --names two-tier-tg --query "TargetGroups[0].TargetGroupArn" --output text)
for ID in $(terraform output -json instance_ids | tr -d '[]," ' | tr ',' ' '); do
  aws elbv2 deregister-targets --target-group-arn $TG --targets Id=$ID
done
# 2) Destroy everything
terraform destroy -var="my_ip=203.0.113.7/32"   # type: yes (RDS deletion takes ~5 min)
# 3) Prove zero remains (+ delete any manual snapshots)
aws ec2 describe-instances --filters "Name=tag:Name,Values=two-tier-*" --query "Reservations[].Instances[].State.Name"
aws rds describe-db-instances --query "DBInstances[].DBInstanceIdentifier"
aws rds describe-db-snapshots --query "DBSnapshots[?starts_with(DBSnapshotIdentifier,'two-tier')].DBSnapshotIdentifier"
aws elbv2 describe-load-balancers --names two-tier-alb 2>&1 | head -2`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Destroy complete! Resources: 20+ destroyed.
[ "terminated" ]
{ "DBInstances": [] }
{ "DBSnapshots": [] }
An error occurred (LoadBalancerNotFound)...   # ALB gone: correct`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>EC2 open to the world instead of ALB-only:</strong> bypasses
            the load balancer and the health checks — HTTP ingress must reference
            the ALB security group.
          </li>
          <li>
            <strong>RDS publicly accessible:</strong> the database must sit in
            private subnets with <code>publicly_accessible = false</code>; test
            connectivity from EC2, never from your laptop directly.
          </li>
          <li>
            <strong>Multi-AZ left on in a lab:</strong> doubles RDS cost for
            zero lab benefit — keep <code>multi_az = false</code> and note the
            production trade-off in your README.
          </li>
          <li>
            <strong>Destroy without deregistering:</strong> ALB target errors
            during destroy look scary but are avoided by draining first.
          </li>
          <li>
            <strong>Final snapshot surprise:</strong> with{" "}
            <code>skip_final_snapshot = false</code>, destroy pauses for a
            snapshot name — and the snapshot keeps billing until deleted.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Draw the ALB → 2-AZ EC2 → RDS diagram from memory, marking public vs private subnets.</li>
          <li>Write network.tf + security.tf A–Z with data-driven AZs and chained security groups; validate + plan.</li>
          <li>Write compute.tf with user-data; apply and capture the ALB DNS + DB endpoint outputs.</li>
          <li>Run the migration step (CREATE TABLE + SHOW TABLES) from an EC2 host and paste the output.</li>
          <li>Verify with repeated curls (both AZ hostnames) + target-health showing 2× healthy; screenshot it.</li>
          <li>Break-fix drill: stop nginx on one node, watch ALB mark it unhealthy, restart, watch it recover.</li>
          <li>Teardown in order (deregister → destroy → snapshot check) and save the Destroy complete output.</li>
          <li>Document free vs paid (ALB/NAT/Multi-AZ) costs in your README with the final $0 bill.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
