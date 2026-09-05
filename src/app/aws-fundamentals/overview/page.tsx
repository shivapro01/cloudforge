import Link from "next/link";
import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="Start Here"
      intro="AWS is the cloud most DevOps jobs run on — but lesson one is not EC2 or S3. It is the account itself: how the global infrastructure is organized, how to lock down your root user, how the Free Tier actually works, and how to set cost guardrails before you launch a single resource. Engineers who skip this page are the ones with a $400 NAT Gateway surprise in month two. Work through every section here once, and the other twelve lessons get dramatically cheaper and safer."
      prev={{ href: "/aws-fundamentals", label: "AWS Fundamentals" }}
      next={{ href: "/aws-fundamentals/aws-cli", label: "AWS CLI & Console Setup" }}
      resources={[
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "The official catalog of what is free, for how long, and under which limits — check it before launching anything.",
        },
        {
          title: "AWS Documentation",
          url: "https://docs.aws.amazon.com/",
          description:
            "Start with the billing and account guides: root-user best practices, budgets, and Cost Explorer walkthroughs.",
        },
        {
          title: "roadmap.sh — AWS Roadmap",
          url: "https://roadmap.sh/aws",
          description:
            "A visual map of AWS services in learning order — useful for seeing where this module sits in the bigger picture.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">What AWS actually is: rented data centers with an API</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Strip away the marketing and <strong>AWS is roughly 200+ managed services</strong> running
          in Amazon&apos;s data centers, all controllable through one API surface. Compute (EC2,
          Lambda), storage (S3, EBS), networking (VPC, Route 53, CloudFront), databases (RDS,
          DynamoDB), and the glue DevOps lives in — IAM, CloudWatch, CloudTrail, SNS, SQS. You never
          rack servers, patch hypervisors, or negotiate bandwidth contracts; you call APIs and pay
          per second, per gigabyte, or per request.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>On-demand and metered:</strong> resources exist when your API call says so and
            billing starts the same second. That is the superpower — and exactly why guardrails come
            before workloads in this module.
          </li>
          <li>
            <strong>Managed vs unmanaged:</strong> EC2 gives you a virtual machine you patch
            yourself; RDS gives you a database where AWS handles patching, backups, and failover.
            DevOps judgment is largely knowing which side of that line each workload belongs on.
          </li>
          <li>
            <strong>Everything is an API call:</strong> the Console button, the CLI command, and the
            Terraform resource all hit the same endpoint. Learn that mental model now and the
            Console-vs-CLI-vs-IaC section below will click instantly.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Regions, Availability Zones, and edge locations</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          AWS infrastructure is a hierarchy. A <strong>Region</strong> is a geographic area (such as
          Frankfurt, <strong>eu-central-1</strong>, or Mumbai, <strong>ap-south-1</strong>) containing
          three or more isolated data-center clusters called <strong>Availability Zones (AZs)</strong>.
          Each AZ has independent power, cooling, and networking, linked to the others by fast,
          low-latency fiber. <strong>Edge locations</strong> are a third layer — hundreds of
          small points of presence that cache content (CloudFront) and terminate traffic close to
          users, but run no customer workloads.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`REGION eu-central-1 (Frankfurt)              REGION ap-south-1 (Mumbai)
+-------------------------------------+   +-------------------------------------+
|  AZ-a (eu-central-1a)  AZ-b (1b)     |   |  AZ-a (ap-south-1a)  AZ-b (1b)      |
|  [data centers]        [data centers]|   |  [data centers]        [data centers]|
|  AZ-c (eu-central-1c)               |   |  AZ-c (ap-south-1c)               |
|  independent power/cooling/net each |   |  independent power/cooling/net each |
|  low-latency links between AZs      |   +-------------------------------------+
+-------------------------------------+          ^               ^
         ^                                       cross-region replication / Route 53 failover
   MULTI-AZ (inside ONE region): ALB spans AZs, RDS standby in another AZ
   survives a data-center fire, but NOT a region-wide event

   MULTI-REGION (across regions): full copy in Frankfurt + Mumbai, DNS failover
   survives region outage, costs 2x + replication + data transfer

EDGE LOCATIONS (600+ PoPs worldwide): CloudFront cache + TLS termination near users
   user --> nearest edge (cached?) --> else origin region`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Default to one region, multiple AZs:</strong> deploy app servers and databases
            across at least two AZs in your nearest region. That survives the common failure (one
            data center) without paying for the rare one (a whole region).
          </li>
          <li>
            <strong>Go multi-region only for a reason:</strong> disaster recovery, data residency
            law, or latency on another continent. It doubles infrastructure cost and adds
            replication lag and failover complexity — a business decision, not a default.
          </li>
          <li>
            <strong>Pick regions deliberately:</strong> not every service exists in every region, and
            prices differ per region. New regions also have fewer AZs. Check service availability
            and your users&apos; latency before committing state (databases, buckets) somewhere.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Account setup: lock the root before anything else</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A fresh AWS account&apos;s <strong>root user</strong> (the email-address login) can do
          literally everything, including deleting the account and spending unlimited money — and it
          cannot be restricted by IAM policies. Professional setup therefore takes about fifteen
          minutes and follows a fixed order: secure the root with MFA, create a named admin user for
          daily work, and put a billing alarm in place so accidents page you instead of invoicing
          you. Do these in the Console; automation comes later once you understand what it protects.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>1. Enable MFA on root:</strong> Security Credentials in the top-right menu, add a
            virtual MFA device (any TOTP authenticator app), and store the recovery codes offline.
            Never generate access keys for root — root should only ever sign in through the Console,
            rarely.
          </li>
          <li>
            <strong>2. Create an admin IAM user for daily work:</strong> in IAM, create a user for
            yourself, attach the <strong>AdministratorAccess</strong> managed policy for now (you
            will carve this down to least privilege in the IAM lesson), enable Console access plus
            MFA, and sign out of root. From here on, root stays in a drawer.
          </li>
          <li>
            <strong>3. Turn on a billing alarm immediately:</strong> billing metrics live only in
            <strong>us-east-1</strong>, so create a CloudWatch alarm on EstimatedCharges there, and a
            Budgets alert as the belt-and-suspenders copy. Verify the budget exists with the command
            below — every command in this course ships with its expected output so you can confirm
            each step worked.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws budgets describe-budgets --account-id 123456789012 --query "Budgets[].{Name:BudgetName,Limit:BudgetLimit.Amount,Unit:BudgetLimit.Unit}" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`---------------------------------------------------
|                  DescribeBudgets                |
+---------------+-----------+-----------+
|  Limit        |  Name     |  Unit       |
+---------------+-----------+-----------+
|  5.0          |  monthly-cap |  USD     |
+---------------+-----------+-----------+
# One $5 monthly budget exists. If it is missing, stop and create it
# in the Console under Billing > Budgets before launching anything.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Free Tier decoded: always-free vs 12-month vs trials</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The Free Tier is three different programs wearing one name, and confusing them is how
          beginners get billed. <strong>Always Free</strong> offers never expire (within their
          monthly caps). <strong>12-Month Free</strong> starts the day you create the account — not
          the day you first use the service — and converts to paid rates silently at month thirteen.
          <strong>Short trials</strong> are one-shot sandboxes (days to months) for pricier services.
          Exceeding any cap bills at standard rates with no warning popup.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>[FREE TIER]</strong> Always-free workhorses for this course: Lambda (1M requests
            + 400,000 GB-seconds/month), DynamoDB (25 GB + read/write capacity), SQS/SNS (1M
            requests/notifications), CloudWatch (10 metrics + 10 alarms), CodeBuild/CodePipeline
            starter minutes. Build freely inside the caps.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>[FREE TIER]</strong> 12-month essentials (clock starts at signup): EC2 750
            hours/month of t2.micro or t3.micro (one instance running full-time, or two instances
            half-time each), S3 5 GB + 20,000 GETs, RDS 750 hours of db.t2/t3.micro + 20 GB storage,
            100 GB outbound data transfer. Track the signup anniversary — month thirteen is the
            classic surprise bill.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>[PAID]</strong> Free-Tier-adjacent traps: NAT Gateways (~$0.045/hour + per-GB
            processing, 24/7 even idle), Elastic IPs unattached to instances, EBS snapshots and
            volumes left behind after instance termination, CloudWatch detailed monitoring and Logs
            ingestion, and data transfer beyond the 100 GB free allowance. When in doubt, check the
            Free Tier page before launching.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How billing surprises happen — and the guardrails that stop them</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Almost every horror-story bill follows one of three scripts: something hourly left running
          (forgotten EC2, RDS, or NAT Gateway), something metered left growing (snapshots, logs,
          uncompressed CloudTrail data events), or something multiplying (Auto Scaling doing its job
          during a traffic spike or a misconfigured retry loop). None of these are bugs — they are
          the meter doing exactly what you asked. The defense is three layers: a <strong>Budget
          </strong> that alerts (and can act), <strong>Cost Explorer</strong> for daily inspection,
          and the habit of tagging resources so you know which experiment spent what.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ce get-cost-and-usage --time-period Start=2026-08-01,End=2026-09-01 --granularity MONTHLY --metrics BlendedCost --group-by Type=DIMENSION,Key=SERVICE --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`---------------------------------------------------------------
|                      GetCostAndUsage                    |
+---------------------------------------------------------+
|  BlendedCost: $0.42   Group: EC2-Other                  |
|  BlendedCost: $0.00   Group: AWS Budgets                |
|  BlendedCost: $0.00   Group: Simple Storage Service     |
+---------------------------------------------------------+
# Read this weekly. Any SERVICE line you do not recognize is an
# investigation, not a rounding error.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Budget at $5 with 80% and 100% alerts:</strong> Billing, Budgets, cost budget,
            monthly, fixed $5, email alerts at 80% (warning) and 100% (action). A $5 cap teaches the
            full workflow with pocket-change exposure.
          </li>
          <li>
            <strong>Open Cost Explorer weekly:</strong> group by service, then by usage type. The
            service tells you what spent; the usage type (hours vs data transfer vs requests) tells
            you why, which is what lets you fix it.
          </li>
          <li>
            <strong>Terminate the whole experiment:</strong> when a lab is done, delete the stack,
            then check EC2, EBS volumes, snapshots, Elastic IPs, and load balancers individually —
            several survive their parent instance and bill quietly for months.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Console vs CLI vs IaC: three doors into the same API</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every AWS action is an API call, and you get three ways to make it. The
          <strong> Console</strong> is the visual dashboard — fastest for learning, exploring, and
          one-off inspection, worst for repeatability. The <strong>CLI</strong> wraps the same APIs
          for your terminal — scriptable, fast, and the daily driver you will install in the next
          lesson. <strong>Infrastructure as Code</strong> (CloudFormation, CDK, Terraform) declares
          desired state in versioned files — reviewable, repeatable, and the only acceptable way to
          run production. Same API underneath; the difference is who can reproduce what you did.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`YOU --> [ Console ] --\
YOU --> [ CLI / SDK ] ----> AWS API endpoints (per region) --> real resources
YOU --> [ Terraform / CloudFormation / CDK ] --/

  Console click == CLI command == Terraform resource: same API, same bill.
  Click-ops is undocumented. CLI history is a story. IaC in git is a contract.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Learn in the Console, work in the CLI:</strong> click through a service once to
            build intuition, then redo it in the CLI so the steps become commands you can save,
            share, and rerun identically.
          </li>
          <li>
            <strong>Ship with IaC from Module 05 onward:</strong> anything that must survive you
            (VPCs, databases, production services) belongs in versioned code with review — if it
            only exists as clicks, it does not really exist.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Module roadmap, DevOps uses, and classic mistakes</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          This module walks the stack bottom-up in thirteen lessons — overview (you are here), CLI
          setup, IAM, VPC, EC2, load balancing and auto scaling, S3, CloudFront with ACM, Route 53,
          databases, Lambda basics, CloudWatch with CloudTrail, and SNS with SQS — each one the
          foundation the next assumes. DevOps engineers touch this layer daily: provisioning preview
          environments, reading CloudWatch alarms at 2 AM, tracing a deploy through CloudTrail,
          wiring SNS notifications into Slack, and cutting AMI-based EC2 fleets behind an auto
          scaling group.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Mistake — root for daily work:</strong> every command as root means no audit
            trail of who did what and no policy can ever constrain you. Create the admin user in
            this lesson&apos;s lab and shelve root today.
          </li>
          <li>
            <strong>Mistake — region sprawl:</strong> launching one bucket here and one instance
            there across four regions, then paying cross-region transfer and losing track of
            strays. Pick one home region and justify every exception.
          </li>
          <li>
            <strong>Mistake — learning on paid defaults:</strong> accepting wizard defaults (NAT
            Gateway, multi-AZ RDS, provisioned IOPS) in a sandbox. Wizards optimize for production
            reliability; your lab optimizes for learning per dollar — read each default&apos;s price
            before accepting it.
          </li>
          <li>
            <strong>Mistake — no billing alarm:</strong> treating cost review as something to do
            &quot;later.&quot; Later is when the invoice arrives. The $5 budget from this lesson
            takes five minutes and has saved thousands of careers.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Continue the path in{" "}
          <Link href="/aws-fundamentals/aws-cli" className="underline underline-offset-4">
            AWS CLI and Console Setup
          </Link>
          , where you install the tool you will use in every lesson after it.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Done checklist and hands-on practice (6 tasks)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You are done with this lesson when the account is locked down, the Free Tier boundaries
          are written down somewhere you will actually check, and a $5 budget is watching your back.
          Confirm the headline facts with the Free Tier page and your Billing dashboard, then close
          the loop with these six tasks.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws iam get-user --user-name admin-yourname --query "User.{Name:UserName,Created:CreateDate}" --output table
aws budgets describe-budgets --account-id 123456789012 --query "Budgets[].BudgetName" --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-------------------------------
|           GetUser           |
+-------------+---------------+
|  Created    |  Name         |
+-------------+---------------+
|  2026-09-01 |  admin-yourname |
+-----------------------------+
monthly-cap
# Admin user exists, $5 budget exists: this lesson is complete.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create your AWS account on the Free Tier plan and confirm the account ID and home region in the Billing dashboard.</li>
          <li>Enable virtual MFA on the root user, store recovery codes offline, and verify no root access keys exist.</li>
          <li>Create a named IAM admin user with Console access plus MFA, sign out of root, and do all remaining tasks as the admin.</li>
          <li>Create a $5 monthly cost budget with email alerts at 80% and 100% of the threshold.</li>
          <li>Open the Free Tier page and write down which three services you will use first, with each one&apos;s monthly cap and expiry type.</li>
          <li>Sketch the region-to-AZ-to-edge hierarchy for your home region from memory, then check it against this lesson&apos;s diagram.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
