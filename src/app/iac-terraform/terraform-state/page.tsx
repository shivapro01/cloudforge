import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Infrastructure as Code"
      title="State & Remote Backends"
      intro="Terraform state is the JSON memory that maps your .tf files to real AWS objects. This lesson explains desired vs known vs actual, why local state breaks teams, and how to build an S3 remote backend with locking A–Z — plus the state commands, drift handling, and secrets rules that keep teams safe."
      prev={{ href: "/iac-terraform/terraform-resources", label: "Resources, Providers & Data" }}
      next={{ href: "/iac-terraform/terraform-variables", label: "Variables & Outputs" }}
      resources={[
        {
          title: "Terraform State Documentation",
          url: "https://developer.hashicorp.com/terraform",
          description:
            "Official docs on state purpose, remote backends, state locking, and the terraform state subcommands used in this lesson.",
        },
        {
          title: "S3 Backend Documentation",
          url: "https://docs.aws.amazon.com/",
          description:
            "AWS docs for S3 versioning, default encryption, and DynamoDB / S3 native locking that back the remote-state setup here.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm S3, versioning, and locking costs stay free-tier eligible before running the hands-on backend lab.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. What state is: desired vs known vs actual</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Your <code>.tf</code> files declare the <strong>desired</strong> state (what you want).
          The <code>terraform.tfstate</code> file records the <strong>known</strong> state (what
          Terraform last created, with real IDs and attributes). The cloud holds the{" "}
          <strong>actual</strong> state (what really exists right now). Every{" "}
          <code>plan</code> compares all three: desired vs known gives the proposed diff, then a
          refresh against actual catches anything changed outside Terraform.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`DESIRED (.tf files)        KNOWN (terraform.tfstate)      ACTUAL (AWS console)
  bucket = "demo-123"  --->  id = "demo-123"               --->  bucket "demo-123" exists?
  instance = t3.micro  --->  id = i-0abc, ip = 3.4.5.6     --->  i-0abc running? stopped? deleted?

        plan = (desired - known) + refresh(actual)
        apply = make actual == desired, then write new known to state`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          State is also the <strong>mapping table</strong>. AWS knows your bucket only as{" "}
          <code>demo-123</code>; Terraform knows it as <code>aws_s3_bucket.lab</code>. Without
          state, Terraform cannot connect the two — it would try to create a duplicate on every
          run. Delete the state file and a perfectly healthy infrastructure becomes
          &quot;orphaned&quot;: real, billing, but invisible to Terraform.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="terraform.tfstate"
            code={`{
  "version": 4,
  "terraform_version": "1.9.0",
  "resources": [
    {
      "mode": "managed",
      "type": "aws_s3_bucket",
      "name": "lab",
      "provider": "provider[\\"registry.terraform.io/hashicorp/aws\\"]",
      "instances": [
        {
          "attributes": {
            "id": "tf-state-demo-123456",
            "arn": "arn:aws:s3:::tf-state-demo-123456",
            "bucket_domain_name": "tf-state-demo-123456.s3.amazonaws.com",
            "tags": { "Name": "state-demo" }
          }
        }
      ]
    }
  ]
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Note what is inside: real ARNs, IPs, and IDs. That is why state is both powerful (plan
          is fast — no full AWS scan needed) and dangerous (it holds secrets in plaintext, covered
          in section 7).
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Why local state breaks teams</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <code>terraform apply</code> with no backend writes <code>terraform.tfstate</code> to
          your laptop. That works solo for a day and fails for a team on day two: two engineers
          hold two different &quot;known&quot; states, and whoever applies last silently
          overwrites the other&apos;s infrastructure view.
        </p>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            DANGER — overwrites: two applies, one truth lost
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Ana applies at 10:00 (adds bucket A). Ben pulled state at 09:55, applies at 10:05
            (adds bucket B) from his stale copy — his state never saw bucket A, so his next plan
            proposes to recreate it. Shared remote state is the only fix.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            DANGER — no locking: simultaneous applies corrupt state
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Local state has no lock. Two terminals running apply at once interleave writes and the
            JSON file ends up half-written or missing a resource. Remote backends with locking
            (section 4) make the second apply wait or fail cleanly instead.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            DANGER — secrets in state on a laptop
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            DB passwords, access keys, and user_data scripts land in terraform.tfstate in
            plaintext. On a laptop that means backups, Slack file-shares, and dotfile repos all
            carry secrets. Remote state in an encrypted, access-controlled bucket plus gitignore
            (section 7) is the minimum bar.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# The classic team failure — state is local and gitignored per-machine
ls -la
# -rw-r--r--  terraform.tfstate      <- only on YOUR laptop
# Teammate clones the repo: no state file. Their first plan says:
# "Plan: 3 to add" for infrastructure that already exists.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# Teammate with no shared state sees everything as new:
Plan: 3 to add, 0 to change, 0 to destroy.

  # aws_s3_bucket.lab will be created  <- already exists! duplicate + name clash
  + bucket = "tf-state-demo-123456"    <- apply fails: BucketAlreadyOwnedByYou`}
          />
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. S3 backend A–Z: bucket → backend.tf → migrate</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — create the state bucket</strong> with versioning (rollback a bad state)
          and default encryption (SSE-S3 is free). Do it once per account/region in the console
          (S3 → Create bucket → enable Versioning + Default encryption) or with the CLI:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. Create bucket (must be GLOBALLY unique)
aws s3api create-bucket --bucket tf-remote-state-987654321 --region us-east-1

# 2. Enable versioning — every state push keeps a prior version
aws s3api put-bucket-versioning --bucket tf-remote-state-987654321 \\
  --versioning-configuration Status=Enabled

# 3. Enable default encryption (SSE-S3, no KMS cost)
aws s3api put-bucket-encryption --bucket tf-remote-state-987654321 \\
  --server-side-encryption-configuration \\
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# 4. Block all public access (state must never be public)
aws s3api put-public-access-block --bucket tf-remote-state-987654321 \\
  --public-access-block-configuration \\
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
    "Location": "/tf-remote-state-987654321"
}
# (versioning/encryption/public-block commands return empty on success)
# Verify:
# aws s3api get-bucket-versioning --bucket tf-remote-state-987654321
# { "Status": "Enabled" }`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — point Terraform at it</strong> with a <code>backend &quot;s3&quot;</code>{" "}
          block. <code>key</code> is the path inside the bucket (use one key per environment:{" "}
          <code>dev/terraform.tfstate</code>, <code>prod/terraform.tfstate</code>). Keep the
          backend block static — no variables allowed here.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="backend.tf"
            code={`terraform {
  backend "s3" {
    bucket  = "tf-remote-state-987654321"
    key     = "dev/terraform.tfstate" # one key per env: prod/terraform.tfstate
    region  = "us-east-1"
    encrypt = true
    # Modern Terraform (>= 1.9): native S3 locking, no DynamoDB needed
    # use_lockfile = true
    # Older setups: dynamodb_table = "tf-state-locks" (see section 4)
  }
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step C — migrate.</strong> Run <code>terraform init -migrate-state</code>: it
          detects the existing local state, asks to copy it to S3, then deletes the local file.
          From then on every plan/apply reads and writes S3 directly.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform init -migrate-state
# Confirm in S3 console afterwards:
aws s3api list-objects --bucket tf-remote-state-987654321 --prefix dev/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Initializing the backend...
Do you want to copy existing state to the new backend?
  Pre-existing state was found in "/lab/terraform.tfstate".
  Would you like to copy this state to the new backend? Enter "yes" to copy and "no" to start empty.

  Enter a value: yes

Successfully configured the backend "s3"! Terraform will automatically
use this backend unless the backend configuration changes.

# list-objects confirms the migration:
# { "Contents": [{ "Key": "dev/terraform.tfstate", ... }] }`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — this backend costs ~$0
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            S3 state files are kilobytes; versioning a few dozen states plus SSE-S3 encryption and
            DynamoDB on-demand locking all sit inside the free tier. Delete the demo bucket&apos;s
            test keys when done, but keep the bucket for the rest of the course.
          </p>
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Locking explained: one writer at a time</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Locking serializes writes: the first <code>apply</code> takes the lock, the second one
          waits or fails instead of corrupting JSON. Two mechanisms exist.{" "}
          <strong>Native S3 locking</strong> (Terraform 1.9+, <code>use_lockfile = true</code>)
          writes a <code>.tflock</code> sidecar object. <strong>Legacy DynamoDB locking</strong>{" "}
          uses a table with a single partition key <code>LockID</code> (String) — Terraform
          conditionally writes the state key as an item and fails if it already exists.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Legacy DynamoDB lock table (skip if using native S3 use_lockfile)
aws dynamodb create-table --table-name tf-state-locks \\
  --attribute-definitions AttributeName=LockID,AttributeType=S \\
  --key-schema AttributeName=LockID,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST --region us-east-1

# Then add to backend.tf: dynamodb_table = "tf-state-locks"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# First apply holds the lock:
# Acquiring state lock. This may take a few moments...
# aws_instance.web: Creating...

# Second terminal while the first holds it:
Error: Error acquiring the state lock

Error message: ConditionalCheckFailedException: The conditional request failed
Lock Info:
  ID:        8f3a2c1e-...-tf-remote-state-987654321/dev/terraform.tfstate
  Operation: OperationTypeApply
  Who:       ben@laptop

Terraform acquires a state lock to protect the state from being written
by multiple users at the same time. If the lock is stale (crashed apply),
verify no apply is running, then: terraform force-unlock <LOCK-ID>`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          If an apply crashes mid-write, the lock can stick. Verify nobody is applying (check CI
          runs!), inspect with <code>terraform force-unlock</code> only after confirming
          staleness — blind unlocking reintroduces the corruption locking was built to prevent.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. State commands: inspect and surgically repair</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          These commands read or edit the mapping without touching real infrastructure (except{" "}
          <code>mv</code>/<code>rm</code>, which change what the next plan will do). Always{" "}
          <code>pull</code> a backup before surgery.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`terraform state list                 # every tracked address
terraform state show aws_s3_bucket.lab # attributes of one resource
terraform state pull > backup-$(date +%F).tfstate  # backup remote state locally
terraform state mv aws_instance.old aws_instance.new # rename label, no recreate
terraform state rm aws_s3_bucket.orphan              # forget it: next plan wants to recreate`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ terraform state list
aws_s3_bucket.lab
aws_instance.web

$ terraform state show aws_s3_bucket.lab
# aws_s3_bucket.lab:
resource "aws_s3_bucket" "lab" {
    arn  = "arn:aws:s3:::tf-state-demo-123456"
    bucket = "tf-state-demo-123456"
    id     = "tf-state-demo-123456"
}

$ terraform state mv aws_instance.old aws_instance.new
Move "aws_instance.old" to "aws_instance.new"
Successfully moved 1 object(s).

$ terraform state rm aws_s3_bucket.orphan
Removed aws_s3_bucket.orphan
Successfully removed 1 resource instance(s).
# NOTE: rm forgets it — the bucket still exists! Next plan proposes to CREATE it again.
# Use rm when you deleted something in the console and want Terraform to recreate it,
# or before importing an object under a new address.`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>When each:</strong> <code>list/show</code> for daily debugging;{" "}
          <code>pull</code> before any manual fix; <code>mv</code> after renaming a label so
          Terraform follows instead of destroy + create; <code>rm</code> to stop managing
          something without deleting it (then <code>import</code> it elsewhere if needed).
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Drift: when the console and state disagree</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Drift</strong> is any manual change made outside Terraform — a tag edited in the
          console, a bucket versioning toggle, a stopped instance. Refresh (automatic at the start
          of plan/apply) re-reads actual and shows the gap as a diff. Small drift: just apply to
          reconverge. Investigative drift check with no changes:{" "}
          <code>terraform plan -refresh-only</code>.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Someone enables versioning in the console (outside Terraform):
terraform plan
terraform plan -refresh-only -out refresh.plan`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# terraform plan — drift detected, proposes to reconverge:
Note: Objects have changed outside of Terraform

  # aws_s3_bucket_versioning.lab has changed:
  ~ versioning_configuration { ~ status = "Enabled" -> "Suspended" }
    # (Terraform wants Suspended because .tf never declared versioning)

Plan: 0 to add, 1 to change, 0 to destroy.

# refresh-only preview (writes drift INTO state, changes nothing in AWS):
# terraform plan -refresh-only
# Plan: 0 to add, 0 to change, 0 to destroy — state file updated with actual values.`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> nightly <code>plan -refresh-only</code> in CI is a cheap
          drift alarm — if the job goes non-empty, someone clicked in the console and the team
          reviews whether to codify the change or revert it.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Secrets warning: state is plaintext — never commit it</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Anything marked <code>sensitive</code> is hidden on screen but stored{" "}
          <strong>in cleartext</strong> in state — DB passwords, RDS snapshots,{" "}
          <code>user_data</code>, TLS keys. Anyone with bucket read access (or a committed{" "}
          <code>terraform.tfstate</code> in git history) owns those secrets. So: encrypt the
          bucket, restrict IAM to deploy roles only, and never commit state.
        </p>
        <div className="mt-3">
          <CodeBlock
            label=".gitignore"
            code={`# Never commit state, backups, lock leftovers, or var files with secrets
*.tfstate
*.tfstate.*
*.tfvars
!example.tfvars
.terraform/
.terraform.lock.hcl
crash.log
override.tf`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Prove state holds secrets (then rotate anything you just exposed):
terraform state pull | grep -i password
# "password": "Sup3rSecret123"   <- PLAINTEXT in state, even with sensitive = true

# If you ever committed state: rotate the secret FIRST, then purge history
# (BFG / filter-repo), because deleting the file does not delete history.`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — leaked state means leaked credentials
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            A public or committed state file with an RDS password or access key can turn into
            real spend within hours (miners love open buckets). Keep the state bucket private,
            enable MFA-delete on the AWS account, and destroy demo databases the same day.
          </p>
        </div>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Two projects sharing one backend key:</strong> dev and prod both writing{" "}
            <code>terraform.tfstate</code> at the bucket root overwrite each other. One key per
            env (<code>dev/…</code>, <code>prod/…</code>) — always.
          </li>
          <li>
            <strong>Deleting state to &quot;fix&quot; a bad apply:</strong> the resources still
            exist and bill you; the next plan just proposes duplicates. Repair with{" "}
            <code>state rm/mv</code> or restore a versioned copy from S3 instead.
          </li>
          <li>
            <strong>Blind force-unlock:</strong> running <code>terraform force-unlock</code>{" "}
            while a teammate&apos;s apply is mid-write corrupts state for both of you. Confirm the
            holder and process are dead first.
          </li>
          <li>
            <strong>Committing state or tfvars with secrets:</strong> git history never forgets.
            Rotate the secret, purge history, add the section-7 gitignore, and move secrets to
            env vars or SSM (next lessons).
          </li>
          <li>
            <strong>Editing state JSON by hand:</strong> one missing comma or wrong ID bricks
            every future plan. Use <code>state mv/rm/pull</code>; hand-edit only a downloaded
            backup copy, then <code>terraform state push</code> it back deliberately.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Open your local terraform.tfstate and find one resource&apos;s id and arn — map each back to its resource TYPE.NAME block.</li>
          <li>Create the S3 state bucket with versioning + SSE-S3 + public-access-block via the CLI; verify each setting with get-bucket-versioning.</li>
          <li>Add the section-3 backend.tf, run init -migrate-state, and confirm dev/terraform.tfstate appears in S3.</li>
          <li>Enable use_lockfile (or a DynamoDB lock table), start an apply, and trigger the lock error from a second terminal — paste the error.</li>
          <li>Run terraform state list / show / pull; store a dated backup outside the repo.</li>
          <li>Rename a resource label with terraform state mv and show the next plan proposes zero changes.</li>
          <li>Cause drift on purpose (change a tag in the console), run plan and plan -refresh-only, and explain each output.</li>
          <li>Audit your repo: prove no *.tfstate is tracked, install the section-7 gitignore, and list who has read access to the state bucket.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
