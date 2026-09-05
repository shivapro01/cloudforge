import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Practical Projects"
      title="Static Site on S3"
      intro="Project 1: ship a real HTTPS website on S3 + CloudFront with Terraform — private bucket, Origin Access Control, cache invalidation, and a GitHub Actions deploy. The cheapest production-shaped project on AWS, and the template for every IaC habit that follows."
      prev={{ href: "/projects/overview", label: "Start Here" }}
      next={{ href: "/projects/two-tier-app", label: "Two-Tier App with Terraform" }}
      resources={[
        {
          title: "Amazon S3 Documentation",
          url: "https://docs.aws.amazon.com/s3/",
          description:
            "Bucket policies, static website vs REST endpoints, and Origin Access Control patterns used in this build.",
        },
        {
          title: "Terraform AWS Provider — S3 & CloudFront",
          url: "https://registry.terraform.io/providers/hashicorp/aws/latest/docs",
          description:
            "Reference for aws_s3_bucket, aws_cloudfront_origin_access_control, and aws_cloudfront_distribution arguments.",
        },
        {
          title: "GitHub Actions Documentation",
          url: "https://docs.github.com/en/actions",
          description:
            "Syntax for the sync-and-invalidate workflow: aws credentials, s3 sync, and cloudfront invalidation steps.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">1. What you are building</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A static site (plain HTML/CSS) served over HTTPS: visitors hit
          CloudFront, which fetches from a <strong>private</strong> S3 bucket
          through Origin Access Control. Route 53 (optional) points your domain
          at the distribution; Terraform owns everything except the hosted zone.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`                     +-------------- AWS (us-east-1) --------------+
                     |                                             |
  Visitor ---------> |  Route 53 (optional, your domain)           |
  https://site       |        |                                    |
                     |        v                                    |
                     |  CloudFront distribution (HTTPS, ACM cert)  |
                     |        |  Origin Access Control (OAC)        |
                     |        v                                    |
                     |  S3 bucket (PRIVATE, no public access)      |
                     |  index.html + styles.css + error.html       |
                     +---------------------------------------------+
      Terraform state: S3 backend + lockfile (same pattern as the IaC lab)`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE — this project&apos;s allowance
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            S3: 5 GB storage free. CloudFront: 1 TB egress + 10M requests/month
            free for 12 months. A demo site built, verified, and destroyed in a
            day costs effectively $0.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — two charges to know
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Route 53 hosted zone: $0.50/month per zone — reuse one zone or delete
            it after. CloudFront invalidations: first 1,000 paths/month free,
            then per-path charges — invalidate <code>/*</code> once per deploy,
            not per file.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. Step A — Prereqs and site files</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — tools.</strong> Terraform ≥ 1.6, AWS CLI v2, and a
          state bucket (reuse the one from the IaC lab). Confirm access, then
          scaffold the site:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform version && aws sts get-caller-identity --query Account --output text
mkdir -p static-site/{infra,site} && cd static-site
cat > site/index.html <<'HTML'
<!doctype html><html><head><title>DevOps Portfolio</title><link rel="stylesheet" href="styles.css"></head>
<body><h1>Hello from S3 + CloudFront</h1><p>Deployed with Terraform.</p></body></html>
HTML
echo "body { font-family: system-ui; max-width: 640px; margin: 3rem auto; }" > site/styles.css
echo "<h1>Not found — check the URL.</h1>" > site/error.html
ls -la site/`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> <code>site/</code> has three files
          and opens locally in a browser. ACM note: CloudFront requires the
          certificate in <strong>us-east-1</strong> — request or import it there
          before wiring a custom domain; the Terraform below leaves the custom
          alias commented until the cert validates.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">3. Step B — Full Terraform: bucket + OAC + distribution</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — declare everything.</strong> Private bucket with public
          access blocked, OAC so only CloudFront can read, distribution with a
          managed cache policy, and outputs for the deploy step:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="infra/main.tf"
            code={`terraform {
  required_version = ">= 1.6.0"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
  backend "s3" {
    bucket       = "tf-state-lab-123456789012" # YOUR state bucket
    key          = "projects/static-site.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" { region = "us-east-1" } # CloudFront certs MUST live here

variable "project" { default = "static-site" }

resource "aws_s3_bucket" "site" {
  bucket = "var.project-ACCOUNTID" # e.g. static-site-123456789012 (globally unique)
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "var.project-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
  }

  # Custom domain (optional): uncomment AFTER ACM cert in us-east-1 validates
  # aliases = ["www.example.com"]

  restrictions { geo_restriction { restriction_type = "none" } }
  viewer_certificate { cloudfront_default_certificate = true }

  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/error.html"
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontOAC"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "\${aws_s3_bucket.site.arn}/*"
      Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.site.arn } }
    }]
  })
}

output "bucket"       { value = aws_s3_bucket.site.id }
output "distribution" { value = aws_cloudfront_distribution.site.id }
output "site_url"     { value = "https://\${aws_cloudfront_distribution.site.domain_name}" }`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cd infra
terraform init && terraform fmt -recursive && terraform validate
terraform plan -out site.plan   # expect: bucket + OAC + distribution + policy (~5 resources)
terraform apply "site.plan"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Apply complete! Resources: 5 added, 0 changed, 0 destroyed.

Outputs:

bucket = "static-site-123456789012"
distribution = "E1ABCD2EFGH3IJ"
site_url = "https://d111111abcdef8.cloudfront.net"`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> plan shows ~5 resources and apply
          prints the distribution ID — save it; the deploy and teardown steps
          need it.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">4. Step C — Deploy: build, sync, invalidate</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step C — push the files and bust the cache.</strong> Sync the
          site to S3, then invalidate the distribution so edge caches fetch the
          new version. CloudFront propagation takes 5–15 minutes on first
          deploy:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`BUCKET=$(terraform output -raw bucket)
DIST=$(terraform output -raw distribution)
aws s3 sync ../site s3://$BUCKET --delete
aws cloudfront create-invalidation --distribution-id $DIST --paths "/*"
terraform output site_url`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`upload: ../site/error.html to s3://static-site-123456789012/error.html
upload: ../site/index.html to s3://static-site-123456789012/index.html
{
    "Invalidation": { "Status": "InProgress", "Id": "I1234567890ABC" }
}
site_url = "https://d111111abcdef8.cloudfront.net"`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">5. Step D — Verify with curl (and the break-fix drill)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step D — prove it end to end.</strong> HTTPS returns 200, HTTP
          redirects, and direct S3 access is denied (OAC working). Then run the
          drill: upload a broken <code>index.html</code>, observe the cached vs
          fresh behavior, invalidate, and confirm recovery:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`URL=$(terraform output -raw site_url)
curl -s -o /dev/null -w "HTTPS %{http_code}\n" $URL
curl -s -o /dev/null -w "HTTP->HTTPS %{http_code}\n" $(echo $URL | sed 's/https/http/')
curl -s -o /dev/null -w "S3-direct %{http_code}\n" https://$BUCKET.s3.us-east-1.amazonaws.com/index.html
# Drill: break it, then recover
echo "<h1>BROKEN</h1>" > ../site/index.html
aws s3 sync ../site s3://$BUCKET --delete
aws cloudfront create-invalidation --distribution-id $DIST --paths "/*"
curl -s $URL | head -c 120; echo`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`HTTPS 200
HTTP->HTTPS 301
S3-direct 403
<h1>BROKEN</h1>   # drill visible -> restore good index.html, sync + invalidate again`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> 200 on HTTPS, 301 redirect on
          HTTP, 403 on direct S3. A 403 on CloudFront instead means OAC/policy
          mismatch — re-check the bucket policy&apos;s SourceArn.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">6. Step E — CI sketch: Actions sync job</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step E — automate the sync.</strong> Every push to{" "}
          <code>main</code> syncs <code>site/</code> and invalidates. Store{" "}
          <code>AWS_ROLE_TO_ASSUME</code>, bucket, and distribution ID as
          Actions secrets — never hardcode credentials:
        </p>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/deploy.yml"
            code={`name: deploy-site
on:
  push:
    branches: [main]
    paths: ["site/**"]
permissions: { id-token: write, contents: read }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-east-1
      - run: aws s3 sync site s3://\${{ secrets.SITE_BUCKET }} --delete
      - run: aws cloudfront create-invalidation --distribution-id \${{ secrets.DIST_ID }} --paths "/*"`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">7. Step F — Teardown in order (same day)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step F — destroy in this exact order.</strong> Empty the
          bucket first (Terraform cannot delete a non-empty bucket), then
          destroy. If you created a Route 53 zone for a custom domain, delete
          the alias record and zone last:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1) Empty the bucket (required before destroy)
aws s3 rm s3://$BUCKET --recursive
# 2) Destroy infra (distribution + OAC + bucket + policy)
terraform destroy   # type: yes
# 3) Only if you made a custom domain: delete alias + zone
# aws route53 change-resource-record-sets ... (delete alias)
# aws route53 delete-hosted-zone --id Z1234567890ABC
# 4) Prove zero remains
aws s3 ls s3://$BUCKET 2>&1 | head -2
aws cloudfront get-distribution --id $DIST 2>&1 | head -2`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Destroy complete! Resources: 5 destroyed.
An error occurred (NoSuchBucket)...   # bucket gone: correct
An error occurred (NoSuchDistribution)... # distribution gone: correct`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Public bucket instead of OAC:</strong> enabling static
            website hosting + public policy works but exposes the bucket —
            keep it private and let CloudFront be the only reader.
          </li>
          <li>
            <strong>ACM cert in the wrong region:</strong> a cert in eu-west-1
            cannot attach to CloudFront — request it in us-east-1.
          </li>
          <li>
            <strong>Forgetting invalidation:</strong> you deployed but see the
            old page — edge cache. Invalidate <code>/*</code> after every sync.
          </li>
          <li>
            <strong>Destroy fails on non-empty bucket:</strong> always{" "}
            <code>s3 rm --recursive</code> first, or destroy hangs on the
            bucket.
          </li>
          <li>
            <strong>Invalidating per file in a loop:</strong> burns through the
            1,000 free paths — one <code>/*</code> invalidation per deploy.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Draw the Route 53 → CloudFront → OAC → S3 flow from memory and compare it with the ASCII diagram.</li>
          <li>Write infra/main.tf A–Z, plan it, and save the plan showing bucket + OAC + distribution.</li>
          <li>Apply, sync the site, invalidate, and capture the HTTPS 200 + HTTP 301 + S3 403 curl triple.</li>
          <li>Run the break-fix drill: deploy a broken index.html, invalidate, observe, then restore.</li>
          <li>Add the Actions deploy workflow with OIDC role secrets and push a content change through CI.</li>
          <li>Paste the site URL + curl outputs into your README with an architecture diagram.</li>
          <li>Teardown in order (empty bucket → destroy → optional zone delete) and save the Destroy complete output.</li>
          <li>Check Billing shows $0 (or only the $0.50 zone if kept) and note the cost in your README.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
