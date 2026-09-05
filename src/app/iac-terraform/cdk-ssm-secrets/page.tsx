import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Infrastructure as Code"
      title="CDK, SSM & Secrets"
      intro="CDK lets you define AWS infrastructure in TypeScript or Python instead of YAML; SSM Parameter Store and Secrets Manager solve the problem CDK and Terraform both leave open — where do passwords, API keys, and config actually live? This lesson covers all three, wires them into EC2 user-data the secure way, and finishes with a free-tier-safe lab."
      prev={{ href: "/iac-terraform/cloudformation", label: "CloudFormation Essentials" }}
      next={{ href: "/cicd", label: "CI/CD" }}
      resources={[
        {
          title: "Terraform AWS Provider — SSM & Secrets",
          url: "https://registry.terraform.io/",
          description:
            "Reference for aws_ssm_parameter, data lookups, and the Secrets Manager resources used in the wiring section.",
        },
        {
          title: "AWS Systems Manager & Secrets Documentation",
          url: "https://docs.aws.amazon.com/",
          description:
            "Official docs for Parameter Store tiers, SecureString/KMS, Secrets Manager rotation, and least-privilege IAM.",
        },
        {
          title: "AWS Skill Builder",
          url: "https://skillbuilder.aws/",
          description:
            "Free labs for CDK, Parameter Store, and Secrets Manager — practice rotation and CDK deploys in a sandbox.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. CDK: real code that synthesizes to CloudFormation</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The Cloud Development Kit (CDK) defines infrastructure with <strong>constructs</strong> —
          classes in TypeScript, Python, or Go — that <strong>synthesize</strong> into standard
          CloudFormation templates. You get loops, conditionals, and unit tests; AWS still
          executes plain CFN underneath, so rollbacks and drift detection keep working.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`CDK APP (TypeScript)              SYNTHESIZED CFN               DEPLOYED STACK
  lib/stack.ts                       cdk.out/*.template.json       CloudFormation stack
    new s3.Bucket(...)  --cdk synth-->  AWS::S3::Bucket              S3 bucket live
                            +             + BucketPolicy               (identical to hand-written
  cdk diff  = preview   cdk deploy = create/update stack via CFN       CFN behavior)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="lib/stack.ts"
            code={`import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class LabStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, 'AppBucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // lab only!
      autoDeleteObjects: true,                  // lab only!
    });
  }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`npm install -g aws-cdk
cdk bootstrap   # one-time per account/region
cdk diff
cdk deploy --require-approval never`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Bootstrapping environment aws://123456789012/us-east-1...
CDKToolkit stack created.

Stack LabStack
Resources
[+] AWS::S3::Bucket AppBucket... Versioning Enabled, Encryption AES256

Do you wish to deploy these changes? Deploying stack LabStack...
LabStack: deploying... CREATE_COMPLETE. Bucket appbucket-abc123 created.`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> <code>cdk synth</code> prints a template
          containing <code>AWS::S3::Bucket</code> — proof that CDK is a CFN generator, not
          a parallel universe. <code>cdk destroy</code> removes the lab stack when done.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. When CDK vs Terraform: pick by team and scope</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Both are excellent; the choice is organizational. AWS-only app teams writing
          TypeScript move faster in CDK; platform teams managing multi-cloud or shared
          modules standardize on Terraform. Many companies run both with a clear boundary.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-semibold">Signal</th>
                <th className="py-2 pr-4 font-semibold">Choose Terraform</th>
                <th className="py-2 font-semibold">Choose CDK</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Cloud scope</td>
                <td className="py-2 pr-4">Multi-cloud, Datadog, GitHub, Cloudflare</td>
                <td className="py-2">AWS-only workloads</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Team skill</td>
                <td className="py-2 pr-4">Ops/HCL background, Registry modules</td>
                <td className="py-2">Developers in TS/Python, constructs + tests</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Reuse model</td>
                <td className="py-2 pr-4">Versioned modules across 20 repos</td>
                <td className="py-2">Shared construct libraries via npm/pip</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Escape hatch</td>
                <td className="py-2 pr-4">Providers lag new AWS features</td>
                <td className="py-2">Day-one AWS coverage (generates CFN directly)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> in interviews, answer &quot;both, with a
          boundary&quot; — Terraform owns landing zones and shared VPCs; CDK/SAM owns
          service internals. Secrets flow identically into either tool (next sections).
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. SSM Parameter Store: config and secrets-lite</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Parameter Store is a hierarchical key-value store: <code>String</code> for plain
          config, <code>SecureString</code> (KMS-encrypted) for passwords and tokens. Paths
          like <code>/lab/db/host</code> act as folders; IAM policies grant per-path
          access. Standard parameters are free within generous limits — the lab stays free.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ssm put-parameter --name /lab/app/greeting --value "hello-from-ssm" --type String --overwrite
aws ssm put-parameter --name /lab/db/password --value "s3cr3t-lab-only" --type SecureString --overwrite
aws ssm get-parameter --name /lab/app/greeting --query Parameter.Value
aws ssm get-parameter --name /lab/db/password --with-decryption --query Parameter.Value`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{ "Version": 1, "Tier": "Standard" }
{ "Version": 1, "Tier": "Standard" }
"hello-from-ssm"
"s3cr3t-lab-only"`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Terraform manages parameters like any resource — and reads them back with a data
          source so app config never lives in <code>.tfvars</code>:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="ssm.tf"
            code={`resource "aws_ssm_parameter" "greeting" {
  name  = "/lab/app/greeting"
  type  = "String"
  value = "hello-from-ssm"
  tags  = { ManagedBy = "terraform" }
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/lab/db/password"
  type  = "SecureString" # KMS-encrypted at rest (default aws/ssm key)
  value = var.db_password # sensitive = true variable, never committed
  tags  = { ManagedBy = "terraform" }
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Seeded once via CLI prompt, then stored encrypted in SSM."
}

# Read it elsewhere without exposing the value in plan output:
data "aws_ssm_parameter" "db_password" {
  name            = aws_ssm_parameter.db_password.name
  with_decryption = true
}`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Secrets Manager: rotation and RDS integration</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Secrets Manager is Parameter Store&apos;s paid sibling for credentials that must{" "}
          <strong>rotate</strong>: database passwords, API keys, OAuth secrets. It stores
          JSON secret values, rotates them on schedule via Lambda, and integrates natively
          with RDS (one click: &quot;manage master credentials&quot;). Reads happen at
          runtime with <code>get-secret-value</code> — never baked into images.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws secretsmanager create-secret --name lab/db/creds --secret-string '{"username":"app","password":"s3cr3t-lab-only"}'
aws secretsmanager get-secret-value --secret-id lab/db/creds --query SecretString --output text
aws secretsmanager rotate-secret --secret-id lab/db/creds --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789012:function:SecretsManagerRotation --rotation-rules AutomaticallyAfterDays=30`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "ARN": "arn:aws:secretsmanager:us-east-1:123456789012:secret:lab/db/creds-AbC123",
  "Name": "lab/db/creds"
}
{"username":"app","password":"s3cr3t-lab-only"}
{
  "ARN": "arn:aws:secretsmanager:us-east-1:123456789012:secret:lab/db/creds-AbC123",
  "RotationEnabled": true
}`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — $0.40 per secret per month + API calls
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            One lab secret costs cents if deleted the same day; five forgotten secrets with
            rotation Lambdas billing monthly is the classic surprise. Create exactly one
            secret in the lab, skip rotation (note the command, do not run it without a
            Lambda), and delete it in cleanup.
          </p>
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Wiring it together: EC2 user-data pulls config, never hardcodes secrets</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The golden rule: <strong>no secret ever appears in code, tfvars, or user-data
          text</strong>. The instance assumes an IAM role, and <code>user_data</code>{" "}
          fetches the parameter and secret at boot. Plan output stays clean because only
          ARNs and paths are referenced:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="iam.tf"
            code={`# Least-privilege role: this instance may read ONLY /lab/* params + one secret
resource "aws_iam_role" "web" {
  name = "lab-web-ssm-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "web_ssm" {
  name = "lab-web-ssm-read"
  role = aws_iam_role.web.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter", "ssm:GetParametersByPath"]
        Resource = "arn:aws:ssm:us-east-1:123456789012:parameter/lab/*"
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = "arn:aws:secretsmanager:us-east-1:123456789012:secret:lab/db/creds*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "web" {
  name = "lab-web-profile"
  role = aws_iam_role.web.name
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="compute.tf"
            code={`resource "aws_instance" "web" {
  ami                  = data.aws_ami.al2023.id
  instance_type        = "t3.micro"
  subnet_id            = aws_subnet.public_a.id
  iam_instance_profile = aws_iam_instance_profile.web.name
  # ... security groups, key_name as in the capstone lab ...

  user_data = <<-EOF
    #!/bin/bash
    set -eux
    GREETING=$(aws ssm get-parameter --name /lab/app/greeting --query Parameter.Value --output text --region us-east-1)
    SECRET=$(aws secretsmanager get-secret-value --secret-id lab/db/creds --query SecretString --output text --region us-east-1)
    dnf install -y nginx
    echo "<h1>$GREETING</h1><!-- db user wired, password never on disk in plain code -->" > /usr/share/nginx/html/index.html
    systemctl enable --now nginx
  EOF

  tags = { Name = "lab-web" }
}`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            SECURE PATTERN — paths and ARNs in code, values only at runtime
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            Code contains /lab/app/greeting (a path) and the secret ARN — both harmless in
            git. Actual values exist only in SSM/Secrets Manager and instance memory. Rotate
            the secret and the next boot picks it up with zero code changes.
          </p>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> CI pipelines read SSM parameters for build config
          (registry URLs, feature flags); applications read Secrets Manager at runtime
          (DB passwords, API keys). Same split everywhere: build-time config vs
          runtime secrets.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Lab [FREE TIER]: parameter + secret + rotation-off + full cleanup</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — create both.</strong> One Standard parameter (free) and one
          secret (cents, same-day delete). Rotation stays OFF — there is no Lambda in this
          lab, and enabling it without one breaks the secret:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ssm put-parameter --name /lab/app/greeting --value "hello-from-ssm" --type String --overwrite
aws secretsmanager create-secret --name lab/db/creds --secret-string '{"username":"app","password":"s3cr3t-lab-only"}'
aws ssm get-parameter --name /lab/app/greeting --query Parameter.Value --output text
aws secretsmanager describe-secret --secret-id lab/db/creds --query "{Rotation:RotationEnabled}"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`"hello-from-ssm"
{
  "ARN": "arn:aws:secretsmanager:us-east-1:123456789012:secret:lab/db/creds-AbC123"
}
{ "Rotation": false }`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — cleanup deletes everything.</strong> Secrets delete with a
          recovery window by default — force immediate deletion in labs so the meter stops
          today:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws secretsmanager delete-secret --secret-id lab/db/creds --force-delete-without-recovery
aws ssm delete-parameter --name /lab/app/greeting
aws secretsmanager list-secrets --query "SecretList[?Name=='lab/db/creds']"
aws ssm get-parameter --name /lab/app/greeting || echo "parameter gone"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "ARN": "arn:aws:secretsmanager:us-east-1:123456789012:secret:lab/db/creds-AbC123",
  "DeletionDate": "2024-01-01T10:00:00Z"
}
[]
An error occurred (ParameterNotFound): parameter gone`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> <code>list-secrets</code> returns empty and
          the parameter lookup fails with ParameterNotFound. If you ran the CDK or EC2
          extensions, <code>cdk destroy</code> / <code>terraform destroy</code> those too.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Plaintext secrets in code or tfvars:</strong> a password in{" "}
            <code>terraform.tfvars</code> lands in git history and plan logs forever. Seed
            via CLI prompt into SSM/Secrets Manager; reference only paths and ARNs.
          </li>
          <li>
            <strong>Free-tier parameter limits:</strong> Standard parameters are free to
            10,000 — Advanced parameters (larger values, policies) bill $0.05 each. Stay on
            Standard unless you need Advanced features.
          </li>
          <li>
            <strong>Deleting a secret without recovery in prod:</strong>{" "}
            <code>--force-delete-without-recovery</code> is lab-only. Production deletes
            use the 7–30 day recovery window so a mistaken delete is reversible.
          </li>
          <li>
            <strong>Over-wide IAM on the instance role:</strong>{" "}
            <code>ssm:*</code> or <code>secretsmanager:*</code> lets any compromised
            instance read every secret. Scope to <code>/lab/*</code> paths and named
            secret ARNs as shown above.
          </li>
        </ul>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Write lib/stack.ts, run cdk synth, and find the AWS::S3::Bucket resource in the generated template.</li>
          <li>Run cdk diff + deploy for the S3 stack, then cdk destroy it; record both outputs.</li>
          <li>Fill the CDK-vs-Terraform table for YOUR team (skills, clouds, reuse) and pick a side with reasons.</li>
          <li>Create the String + SecureString parameters via CLI and Terraform; read both back with decryption.</li>
          <li>Create one Secrets Manager secret, fetch it with get-secret-value, and confirm RotationEnabled is false.</li>
          <li>Attach the least-privilege instance profile to an EC2 instance; prove user-data renders the SSM greeting with curl.</li>
          <li>Break it on purpose: revoke the SSM IAM action, reboot, and read the boot log failure — then restore access.</li>
          <li>Delete the secret (force, lab-only), delete the parameter, verify both gone — then continue to CI/CD, where pipelines consume these values.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
