import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Practical Projects"
      title="Start Here"
      intro="Portfolio projects are where the roadmap stops being theory: you build a real system end to end, break it on purpose, tear it down to $0, and document it so a hiring manager can reproduce it. Read this page first — it sets the workflow, the skills map, and the cost discipline every project follows."
      prev={{ href: "/projects", label: "Practical Projects" }}
      next={{ href: "/projects/static-site", label: "Static Site on S3" }}
      resources={[
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Check exactly what stays free on every project — S3, EC2 micro, Lambda requests — before you build anything.",
        },
        {
          title: "AWS Documentation",
          url: "https://docs.aws.amazon.com/",
          description:
            "The canonical reference for S3, EC2, ECS, Lambda, and billing alarms used across all four builds.",
        },
        {
          title: "GitHub Docs — Repositories",
          url: "https://docs.github.com/en",
          description:
            "How to structure project repos, write READMEs, and publish a portfolio that reviewers can clone and verify.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">1. How to work these projects</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every project follows the same four-phase loop: <strong>build → break →
          teardown → document</strong>. Build it with infrastructure as code (never
          click-ops), verify it like an operator, deliberately break one thing to
          learn the failure mode, tear everything down the same day, then document
          it so someone else can rebuild from your README alone.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# The loop you repeat for EVERY project in this track
git clone <your-project-repo> && cd <project>/
terraform init && terraform plan -out build.plan   # or: sam build / docker build
terraform apply "build.plan"                        # build
curl -v $(terraform output -raw endpoint)           # verify
# ... break one thing on purpose, observe, fix ...
terraform destroy                                   # teardown — same day, no exceptions
git add README.md && git commit -m "docs: build notes + teardown proof" && git push`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Apply complete! Resources: N added, 0 changed, 0 destroyed.
< HTTP/1.1 200 OK      # verify step passes
Destroy complete! Resources: N destroyed.   # teardown proof for your README`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> before starting Project 1, you can run
          the loop above on paper — clone, plan, apply, curl, destroy, commit. If
          any step is unfamiliar, revisit the Terraform, GitHub, and CLI modules
          first; the projects assume them.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. Skills map — which modules each project uses</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — read the map before you pick a project.</strong> Each
          build reuses skills from earlier modules. If a row lists a module you
          have not finished, do that module first rather than struggling mid-build:
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 font-semibold">Project</th>
                <th className="px-4 py-2 font-semibold">Modules used</th>
                <th className="px-4 py-2 font-semibold">New skill proven</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Static Site on S3</td>
                <td className="px-4 py-2">S3, CloudFront + ACM, Route 53, Terraform, GitHub Actions</td>
                <td className="px-4 py-2">CDN + OAC origin security + cache invalidation</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Two-Tier App</td>
                <td className="px-4 py-2">VPC, EC2 + user-data, ELB + Auto Scaling, RDS, Terraform state</td>
                <td className="px-4 py-2">Multi-AZ networking + stateful data tier</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">ECS App with Pipeline</td>
                <td className="px-4 py-2">Docker, ECR, ECS/Fargate, GitHub Actions, CloudWatch</td>
                <td className="px-4 py-2">Container CI/CD with rolling deploys + rollback</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Serverless API</td>
                <td className="px-4 py-2">Lambda, API Gateway, DynamoDB, IAM, boto3/Python</td>
                <td className="px-4 py-2">Pay-per-request scale-to-zero backend</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — recommended order.</strong> Do them in track order (static
          site → two-tier → ECS pipeline → serverless). Each project assumes the
          previous one&apos;s habits: remote state, tight security groups, outputs
          for every endpoint, and destroy-day discipline.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">3. GitHub portfolio tips — make every repo hirable</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — one repo per project, same skeleton.</strong> Reviewers
          skim; a consistent structure signals professionalism. Every repo gets a
          README, IaC, app code, pipeline, and a docs folder with your architecture
          diagram and teardown proof:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`my-project/
├── README.md            # architecture + build + verify + teardown + cost
├── infra/               # Terraform / SAM / CloudFormation — everything as code
├── app/                 # site files / app code / Lambda handler / Dockerfile
├── .github/workflows/   # CI/CD pipeline (deploy.yml)
└── docs/
    ├── architecture.png # exported diagram (plus ASCII in README)
    └── teardown.png     # "Destroy complete" + $0 bill screenshot`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — copy this README outline into every project.</strong>{" "}
          Fill every section; an empty &quot;Cost&quot; or missing
          &quot;Teardown&quot; section is an instant red flag:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="README.md"
            code={`# <Project name> — AWS DevOps Portfolio

## 1. What it does (2 sentences + live URL or screenshot)
## 2. Architecture (diagram + why each service was chosen)
## 3. Prerequisites (tools, versions, IAM permissions, region)
## 4. Build — step by step (numbered A–Z, copy-pasteable commands)
## 5. Verify (curl outputs, console screenshots, test results)
## 6. Break-fix drill (what you broke, what you observed, how you fixed it)
## 7. Teardown — ordered steps + "Destroy complete" output pasted here
## 8. Cost (free-tier coverage + what would bill if left running)
## 9. What I would do next (monitoring, alerting, multi-env)`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">4. Cost discipline — budgets plus teardown-first</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — set the guardrails once, reuse on every project.</strong>{" "}
          A $5 budget with an email alert plus a same-day destroy rule is cheaper
          than any post-mortem. Do this before Project 1 and never skip it:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# One-time guardrails (us-east-1) — run before Project 1
aws budgets create-budget --account-id $(aws sts get-caller-identity --query Account --output text) \\
  --budget '{"BudgetName":"devops-portfolio-cap","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'
# In Console: Billing -> Bills -> check daily during every project`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE — what stays $0 across these projects
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            S3 5 GB + CloudFront 1 TB egress + 10M requests, EC2/RDS micros,
            Lambda 1M requests, DynamoDB 25 GB, ECR storage + Actions minutes —
            all free when you build, verify, and destroy the same day.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — teardown-first rule
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            ALB (~$0.025/hr), NAT Gateway (~$0.045/hr), Multi-AZ RDS, Fargate
            tasks, Route 53 zones ($0.50/month), and CloudFront invalidations past
            1,000/month all bill by the hour or unit. Destroy the same day you
            apply — the per-project pages list the exact ordered teardown.
          </p>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — shared cleanup commands.</strong> Run these after every
          project&apos;s own teardown to catch orphans Terraform cannot see
          (idle EIPs, old AMIs/snapshots, stale ECR images):
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Shared orphan sweep — after EVERY project's terraform destroy / sam delete
aws ec2 describe-addresses --query "Addresses[?AssociationId==null].PublicIp"
aws ec2 describe-instances --query "Reservations[].Instances[?State.Name!='terminated'].InstanceId"
aws rds describe-db-instances --query "DBInstances[].DBInstanceIdentifier"
aws ecs list-clusters --query "clusterArns" && aws ecr list-images --repository-name my-app --query "imageIds" 2>/dev/null
aws cloudfront list-distributions --query "DistributionList.Items[].Id" 2>/dev/null
# Billing proof for your README:
aws budgets describe-budgets --query "Budgets[].CalculatedSpend.ActualSpend.Amount"`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">5. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Clicking resources in the console:</strong> anything not in IaC
            cannot be rebuilt or reviewed — declare everything, use the console
            only to verify.
          </li>
          <li>
            <strong>Skipping the destroy step:</strong> &quot;I&apos;ll do it
            tomorrow&quot; is how $40 NAT bills happen — teardown is part of the
            build, not optional homework.
          </li>
          <li>
            <strong>README written last from memory:</strong> paste commands and
            outputs as you go; reconstructed docs always miss the one flag that
            mattered.
          </li>
          <li>
            <strong>One giant repo for all projects:</strong> reviewers cannot tell
            what deploys what — one repo per project with its own pipeline.
          </li>
          <li>
            <strong>No break-fix drill:</strong> a project you never broke teaches
            half the lesson — each page includes a deliberate failure to run.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">6. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Create the $5 billing budget + email alert and screenshot the confirmation.</li>
          <li>Create four empty GitHub repos (static-site, two-tier-app, ecs-pipeline, serverless-api) with the skeleton layout above.</li>
          <li>Copy the README outline into each repo and fill in sections 1–3 before writing any infra code.</li>
          <li>Run the shared orphan-sweep commands once on your account and record the clean baseline.</li>
          <li>Write your build → break → teardown → document checklist as a repo template or gist you will reuse.</li>
          <li>Start Project 1 (Static Site on S3) only after tasks 1–5 are committed and pushed.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
