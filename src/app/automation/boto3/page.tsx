import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Configuration & Automation"
      title="Boto3"
      intro="Boto3 is the AWS SDK for Python: every console click and CLI command you have learned — list a bucket, stop an instance, publish an alert — becomes a Python function call you can loop, filter, retry, and schedule. This capstone turns your Python into nightly operations: authenticate safely, drive S3 and EC2, paginate and retry like production code, handle errors with dry-run discipline, then ship a full cleanup script that finds untagged dev instances and stale snapshots before they become a bill."
      prev={{ href: "/automation/lambda-automation", label: "Lambda Automation" }}
      next={{ href: "/monitoring", label: "Monitoring" }}
      resources={[
        {
          title: "Boto3 Documentation",
          url: "https://boto3.amazonaws.com/v1/documentation/api/latest/index.html",
          description:
            "Official client, resource, paginator, waiter, and retries reference used in every section of this lesson.",
        },
        {
          title: "Python Tutorial",
          url: "https://docs.python.org/3/tutorial/",
          description:
            "Standard-library refresher for this lesson's scripts: argparse, logging, datetime, and exception handling.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm which calls in this lesson are free (describe, list, your own test instance) and which deletions cost you data.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">1. What Boto3 is: the AWS API in Python</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Boto3 is the <strong>AWS SDK for Python</strong> — a thin wrapper
          over the same HTTPS APIs the console and CLI call. If you can do it
          with <strong>aws s3 ls</strong> or a Lambda handler, you can do it
          with <strong>boto3.client(&quot;ec2&quot;).describe_instances()</strong>.
          That is why it is the DevOps glue: inventory scripts, nightly
          cleanup jobs, CI deploy steps, and every Lambda function in the
          previous lesson all import the same library.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram — where Boto3 sits"
            code={`your script (cleanup.py) ──import boto3──> BOTO3 ──signed HTTPS──> AWS APIs
        |                                            |
   argparse + logging                      client (low-level, 1:1 with API)
   --execute flag                          resource (high-level, objects)
        |                                            |
        +── dry-run report ──> stdout ──> cron / Lambda / CI job`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Boto3 ships <strong>two APIs</strong> for the same services. Use{" "}
          <strong>client</strong> for ops automation (explicit, paginated,
          identical to CLI behavior) and <strong>resource</strong> only for
          quick object-style scripts where it exists.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2">Aspect</th>
                <th className="px-4 py-2">client (low-level)</th>
                <th className="px-4 py-2">resource (high-level)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Constructor</td>
                <td className="px-4 py-2 font-mono text-[13px]">boto3.client(&quot;ec2&quot;)</td>
                <td className="px-4 py-2 font-mono text-[13px]">boto3.resource(&quot;ec2&quot;)</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Shape</td>
                <td className="px-4 py-2">Dicts in, dicts out — mirrors the API exactly</td>
                <td className="px-4 py-2">Objects with attributes — Instance.id, Bucket.name</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Coverage</td>
                <td className="px-4 py-2">Every service and operation</td>
                <td className="px-4 py-2">Subset (S3, EC2, IAM, SNS, SQS, DynamoDB…)</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Paginators / waiters</td>
                <td className="px-4 py-2">First-class: get_paginator, get_waiter</td>
                <td className="px-4 py-2">Partial — often drops back to client anyway</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Use it when</td>
                <td className="px-4 py-2">Cleanup jobs, Lambda handlers, anything mutating</td>
                <td className="px-4 py-2">Quick read-only exploration in a REPL</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — install Boto3"
            code={`python3 --version
pip install boto3
python3 -c "import boto3; print(boto3.__version__)"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Python 3.12.3
Collecting boto3
  Downloading boto3-1.34.120-py3-none-any.whl (139 kB)
Successfully installed boto3-1.34.120 botocore-1.34.120 jmespath-1.0.1
1.34.120`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Rule of this lesson:</strong> all automation uses{" "}
            <strong>client</strong> unless stated otherwise — paginators,
            waiters, and error shapes only behave predictably there.
          </li>
          <li>
            <strong>DevOps uses:</strong> nightly resource janitors, inventory
            CSV exporters, CI steps that upload to S3 and invalidate
            CloudFront, Lambda handlers that stop dev instances on schedule.
          </li>
          <li>
            <strong>Verify checkpoint:</strong> import succeeds and prints a
            version — if pip installed to a different Python, use{" "}
            <strong>python3 -m pip install boto3</strong> so installer and
            interpreter match.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. Auth chain: env, profile, role — never keys in code</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Boto3 never asks for keys directly. It walks a{" "}
          <strong>credential chain</strong>: explicit session arguments, then{" "}
          <strong>environment variables</strong>, then the{" "}
          <strong>shared profile</strong> (~/.aws/credentials), then an{" "}
          <strong>IAM role</strong> (EC2 instance profile, Lambda execution
          role, SSO). First hit wins. On your laptop you use a profile; in
          Lambda and EC2 you use a role and pass nothing at all.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram — credential resolution order"
            code={`boto3.Session(...) args ──found?──> USE
        |
        v (no)
AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (+ SESSION_TOKEN) ──found?──> USE
        |
        v (no)
~/.aws/credentials [profile] + ~/.aws/config [region] ──found?──> USE
        |
        v (no)
EC2 instance profile / Lambda execution role (IMDS + STS) ──found?──> USE
        |
        v (no)
NoCredentialsError — every call fails`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="session.py — explicit region, implicit credentials"
            code={`import boto3

# Region is safe to hardcode. Credentials are NEVER hardcoded.
session = boto3.Session(profile_name="dev", region_name="us-east-1")

ec2 = session.client("ec2")
s3 = session.client("s3")
sts = session.client("sts")

identity = sts.get_caller_identity()
print(identity["Arn"])

# In Lambda / EC2 with a role, drop the profile entirely:
# session = boto3.Session(region_name="us-east-1")`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — prove who you are before scripting"
            code={`export AWS_PROFILE=dev
export AWS_REGION=us-east-1
aws sts get-caller-identity
python3 session.py`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
    "UserId": "AIDASAMPLEUSERID",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/dev-admin"
}
arn:aws:iam::123456789012:user/dev-admin`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 text-zinc-700 dark:border-red-800 dark:bg-red-950 dark:text-zinc-300">
          <p className="font-medium text-red-800 dark:text-red-300">NEVER hardcode access keys</p>
          <p className="mt-1 text-sm leading-6">
            No <strong>aws_access_key_id = &quot;AKIA…&quot;</strong> in any
            .py file, ever. Keys in code leak via git, logs, and screenshots,
            and cannot be rotated without a redeploy. Use profiles locally and
            roles on AWS — if a script needs a key, it reads the environment,
            and if it prints credentials, that is a security incident (see
            mistakes).
          </p>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Region discipline:</strong> always set it (env, config, or
            Session) — otherwise the first S3 call fails with NoRegionError
            and you debug auth when the bug is geography.
          </li>
          <li>
            <strong>Verify checkpoint:</strong> CLI and script print the same
            ARN. If they differ, AWS_PROFILE is not reaching the script —
            export it in the same shell.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">3. S3 with Boto3: list, create, upload, download</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          S3 is the friendliest Boto3 service: bucket names are global, calls
          are fast, and every upload/download maps to one method. The script
          below lists buckets, creates one with the region constraint, uploads
          a file, waits until it exists, downloads it back, and proves the
          round trip — the exact pattern CI deploy steps use.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="s3_demo.py — full round trip with waiter"
            code={`import boto3
from botocore.exceptions import ClientError

s3 = boto3.client("s3", region_name="us-east-1")
BUCKET = "devops-roadmap-demo-123456789012"
KEY = "notes/hello.txt"


def main():
    print("buckets:", [b["Name"] for b in s3.list_buckets()["Buckets"]][:5])

    try:
        s3.create_bucket(Bucket=BUCKET)
        print("created:", BUCKET)
    except ClientError as e:
        if e.response["Error"]["Code"] == "BucketAlreadyOwnedByYou":
            print("bucket exists (owned by you):", BUCKET)
        else:
            raise

    s3.upload_file("/tmp/hello.txt", BUCKET, KEY)
    print("uploaded:", KEY)

    s3.get_waiter("object_exists").wait(Bucket=BUCKET, Key=KEY)
    print("waiter: object_exists confirmed")

    s3.download_file(BUCKET, KEY, "/tmp/hello-back.txt")
    print("downloaded to /tmp/hello-back.txt")


if __name__ == "__main__":
    main()`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — run the round trip"
            code={`echo "hello boto3" > /tmp/hello.txt
python3 s3_demo.py
aws s3 ls s3://devops-roadmap-demo-123456789012/notes/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`buckets: ['devops-roadmap-demo-123456789012', 'myapp-logs']
created: devops-roadmap-demo-123456789012
uploaded: notes/hello.txt
waiter: object_exists confirmed
downloaded to /tmp/hello-back.txt
2026-09-05 10:02:11         12 notes/hello.txt`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>upload_file / download_file</strong> handle multipart and
            retries for you — prefer them over put_object for files. Use
            put_object only for small in-memory bodies.
          </li>
          <li>
            <strong>Waiters beat sleep:</strong> object_exists polls with
            backoff until S3 confirms the key — no fixed time.sleep(5) that is
            either too short or wasteful.
          </li>
          <li>
            <strong>BucketAlreadyOwnedByYou</strong> is the expected
            second-run error — catch it explicitly so reruns are idempotent
            instead of crashing.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">4. EC2 with Boto3: describe, start, stop by tag</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          EC2 automation is <strong>filter, act, wait</strong>: describe by
          tag and state, call start or stop on the IDs, then block on a waiter
          until the state actually flips. EC2 is eventually consistent — the
          API returning success means the request was accepted, not that the
          instance stopped. The waiter is what makes the script truthful.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="ec2_ops.py — stop dev instances by tag, then wait"
            code={`import boto3

ec2 = boto3.client("ec2", region_name="us-east-1")


def find_running_dev():
    paginator = ec2.get_paginator("describe_instances")
    ids = []
    for page in paginator.paginate(
        Filters=[
            {"Name": "tag:Env", "Values": ["dev"]},
            {"Name": "instance-state-name", "Values": ["running"]},
        ]
    ):
        for r in page["Reservations"]:
            for i in r["Instances"]:
                ids.append(i["InstanceId"])
    return ids


def main():
    targets = find_running_dev()
    print("running Env=dev:", targets)
    if not targets:
        print("nothing to stop")
        return
    resp = ec2.stop_instances(InstanceIds=targets)
    print("stopping:", [s["InstanceId"] for s in resp["StoppingInstances"]])
    ec2.get_waiter("instance_stopped").wait(InstanceIds=targets)
    print("waiter: instance_stopped confirmed")


if __name__ == "__main__":
    main()`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — tag a test instance, dry-run the filter, run it"
            code={`aws ec2 create-tags --resources i-0a1b2c3d4e5f60718 --tags Key=Env,Value=dev
python3 ec2_ops.py
aws ec2 describe-instances --instance-ids i-0a1b2c3d4e5f60718 \\
  --query 'Reservations[0].Instances[0].State.Name'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`running Env=dev: ['i-0a1b2c3d4e5f60718']
stopping: ['i-0a1b2c3d4e5f60718']
waiter: instance_stopped confirmed
"stopped"`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Start is the mirror:</strong> swap stop_instances for
            start_instances and instance_stopped for instance_running — same
            filter, same waiter discipline.
          </li>
          <li>
            <strong>Only touch your own test instance:</strong> the Env=dev
            filter plus a single known ID is your guardrail. Never broaden to
            all running instances on a shared account.
          </li>
          <li>
            <strong>DevOps uses:</strong> morning &quot;start dev&quot; /
            evening &quot;stop dev&quot; schedules, pre-deploy inventory
            snapshots, and Lambda handlers from the previous lesson that run
            this exact logic on a cron.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">5. Pagination and retries: code that survives scale</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          describe_instances returns at most ~1000 results per call and S3
          list_objects_v2 caps at 1000 keys — scripts that read only the first
          page silently miss resources. <strong>Paginators</strong> walk every
          page for you, and a <strong>standard retry Config</strong> absorbs
          throttling (ThrottlingException, RequestLimitExceeded) with
          exponential backoff instead of crashing at 2 a.m.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="paginate.py — every page, every instance, with retries"
            code={`import boto3
from botocore.config import Config

retry_config = Config(
    region_name="us-east-1",
    retries={"max_attempts": 10, "mode": "standard"},
)
ec2 = boto3.client("ec2", config=retry_config)


def all_instance_ids():
    paginator = ec2.get_paginator("describe_instances")
    ids = []
    for page in paginator.paginate(
        PaginationConfig={"PageSize": 100},
        Filters=[{"Name": "instance-state-name", "Values": ["running", "stopped"]}],
    ):
        for r in page["Reservations"]:
            for i in r["Instances"]:
                tags = {t["Key"]: t["Value"] for t in i.get("Tags", [])}
                ids.append((i["InstanceId"], i["State"]["Name"], tags.get("Env", "-")))
    return ids


if __name__ == "__main__":
    for row in all_instance_ids():
        print(row)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — run the inventory"
            code={`python3 paginate.py`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`('i-0a1b2c3d4e5f60718', 'stopped', 'dev')
('i-0a1b2c3d4e5f60719', 'running', '-')
('i-0a1b2c3d4e5f60720', 'running', 'prod')`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>S3 twin:</strong> s3.get_paginator(&quot;list_objects_v2&quot;)
            with Prefix and PaginationConfig — identical loop shape, Contents
            instead of Reservations.
          </li>
          <li>
            <strong>max_attempts includes the first try:</strong> 10 means 1
            try + 9 retries with jitter. Standard mode is enough for cleanup
            jobs; adaptive mode is for sustained high-throughput ETL.
          </li>
          <li>
            <strong>Verify checkpoint:</strong> count from the script matches{" "}
            <strong>aws ec2 describe-instances --query</strong> totals — if the
            script reports fewer, you skipped pagination somewhere.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">6. Errors and logging: fail loudly, change nothing by accident</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every Boto3 failure raises <strong>botocore.exceptions.ClientError</strong>{" "}
          with <strong>e.response[&quot;Error&quot;][&quot;Code&quot;]</strong>{" "}
          telling you what happened. Production scripts catch expected codes
          (bucket exists, instance already stopped), log structured context
          (what, where, dry_run), and let the unexpected propagate to a
          non-zero exit. Paired with a <strong>--execute flag</strong>, the
          default run changes nothing — it only reports.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="errors.py — ClientError handling plus dry-run pattern"
            code={`import logging
import boto3
from botocore.exceptions import ClientError, NoCredentialsError, NoRegionError

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("ops")

ec2 = boto3.client("ec2", region_name="us-east-1")


def stop_safe(instance_id, execute=False):
    if not execute:
        log.info("DRY-RUN would stop %s", instance_id)
        return "dry-run"
    try:
        ec2.stop_instances(InstanceIds=[instance_id])
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code == "IncorrectInstanceState":
            log.warning("already stopped: %s", instance_id)
            return "already-stopped"
        log.error("stop failed %s: %s", instance_id, code)
        raise
    log.info("stopped %s", instance_id)
    return "stopped"


if __name__ == "__main__":
    try:
        print(stop_safe("i-0a1b2c3d4e5f60718", execute=False))
    except (NoCredentialsError, NoRegionError) as e:
        log.error("auth/region misconfigured: %s", type(e).__name__)
        raise SystemExit(2)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — dry run is safe, live run mutates"
            code={`python3 errors.py
python3 -c "from errors import stop_safe; print(stop_safe('i-0a1b2c3d4e5f60718', execute=True))"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`INFO DRY-RUN would stop i-0a1b2c3d4e5f60718
dry-run
INFO stopped i-0a1b2c3d4e5f60718
stopped`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Catch codes, not messages:</strong> Code strings
            (IncorrectInstanceState, BucketAlreadyOwnedByYou,
            InvalidInstanceID.NotFound) are stable; human messages are not.
          </li>
          <li>
            <strong>logging over print:</strong> INFO/ WARNING/ERROR levels
            flow into CloudWatch Logs with filterable severity when this code
            moves into Lambda — print lines do not.
          </li>
          <li>
            <strong>Dry-run default:</strong> every mutating script in this
            lesson defaults to report-only; --execute is the explicit,
            auditable moment you accept change.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">7. Full A–Z lab: nightly cleanup script with --execute safety</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Everything converges here: one <strong>cleanup.py</strong> that
          finds <strong>untagged dev EC2 instances</strong> (running or
          stopped, missing Owner or Env), finds <strong>EBS snapshots older
          than N days</strong>, prints a report, and deletes{" "}
          <strong>only with --execute</strong>. Default run is read-only.
          Snapshot deletion is extra-guarded: it requires both --execute and{" "}
          <strong>--allow-snapshot-delete</strong>, so a stray flag never
          destroys backups.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-zinc-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-zinc-300">
          <p className="font-medium text-emerald-800 dark:text-emerald-300">FREE TIER — read-only plus your own test instance only</p>
          <p className="mt-1 text-sm leading-6">
            Dry-run, describe_instances, describe_snapshots, and
            stop_instances on <strong>your own t3.micro test instance</strong>{" "}
            cost $0. Tag it Env=dev, run the lab against that single ID, and
            restart it afterwards. Never target instances or snapshots you did
            not create.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 text-zinc-700 dark:border-red-800 dark:bg-red-950 dark:text-zinc-300">
          <p className="font-medium text-red-800 dark:text-red-300">PAID / DESTRUCTIVE — snapshot delete is forever</p>
          <p className="mt-1 text-sm leading-6">
            Deleting a snapshot cannot be undone and old snapshots may be the
            only copy of a volume. The script refuses snapshot deletion unless
            both flags are passed, and you should only test deletion on a
            snapshot <strong>you created from your own test volume</strong>.
            When in doubt, stop at the dry-run report.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="cleanup.py — nightly untagged-dev + stale-snapshot janitor"
            code={`"""Nightly cleanup: untagged dev EC2 + snapshots older than N days.

Default is DRY-RUN (report only). Mutations require --execute.
Snapshot deletion additionally requires --allow-snapshot-delete.
"""
import argparse
import logging
from datetime import datetime, timezone, timedelta

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("cleanup")

retry_config = Config(retries={"max_attempts": 10, "mode": "standard"})


def make_ec2(region):
    return boto3.client("ec2", region_name=region, config=retry_config)


def find_untagged_dev(ec2):
    """Running/stopped instances missing Owner or Env tags."""
    paginator = ec2.get_paginator("describe_instances")
    candidates = []
    for page in paginator.paginate(
        Filters=[{"Name": "instance-state-name", "Values": ["running", "stopped"]}]
    ):
        for r in page["Reservations"]:
            for i in r["Instances"]:
                tags = {t["Key"]: t["Value"] for t in i.get("Tags", [])}
                if "Owner" not in tags or "Env" not in tags:
                    candidates.append(
                        {
                            "InstanceId": i["InstanceId"],
                            "State": i["State"]["Name"],
                            "Env": tags.get("Env", "-"),
                            "Owner": tags.get("Owner", "-"),
                        }
                    )
    return candidates


def find_old_snapshots(ec2, older_than_days):
    """Snapshots owned by you older than N days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
    paginator = ec2.get_paginator("describe_snapshots")
    old = []
    for page in paginator.paginate(OwnerIds=["self"]):
        for s in page["Snapshots"]:
            if s["StartTime"] < cutoff:
                old.append(
                    {
                        "SnapshotId": s["SnapshotId"],
                        "StartTime": s["StartTime"].isoformat(),
                        "VolumeSize": s["VolumeSize"],
                    }
                )
    return old


def main():
    ap = argparse.ArgumentParser(description="Nightly AWS cleanup (dry-run by default)")
    ap.add_argument("--region", default="us-east-1")
    ap.add_argument("--older-than-days", type=int, default=30)
    ap.add_argument("--execute", action="store_true", help="actually stop instances")
    ap.add_argument("--allow-snapshot-delete", action="store_true",
                    help="also delete old snapshots (requires --execute)")
    args = ap.parse_args()

    ec2 = make_ec2(args.region)
    mode = "EXECUTE" if args.execute else "DRY-RUN"
    log.info("%s: region=%s older-than=%sd", mode, args.region, args.older_than_days)

    untagged = find_untagged_dev(ec2)
    log.info("untagged dev candidates: %d", len(untagged))
    for c in untagged:
        log.info("  %(InstanceId)s state=%(State)s Env=%(Env)s Owner=%(Owner)s", c)

    stale = find_old_snapshots(ec2, args.older_than_days)
    log.info("snapshots older than %sd: %d", args.older_than_days, len(stale))
    for s in stale:
        log.info("  %(SnapshotId)s started=%(StartTime)s size=%(VolumeSize)sGiB", s)

    if not args.execute:
        log.info("DRY-RUN complete: no changes made. Re-run with --execute to act.")
        return 0

    for c in untagged:
        if c["State"] == "running":
            try:
                ec2.stop_instances(InstanceIds=[c["InstanceId"]])
                log.info("stopped %s", c["InstanceId"])
            except ClientError as e:
                log.error("stop failed %s: %s", c["InstanceId"],
                          e.response["Error"]["Code"])
        else:
            log.info("already stopped, skipping %s", c["InstanceId"])

    if args.allow_snapshot_delete:
        for s in stale:
            try:
                ec2.delete_snapshot(SnapshotId=s["SnapshotId"])
                log.info("deleted snapshot %s", s["SnapshotId"])
            except ClientError as e:
                log.error("delete failed %s: %s", s["SnapshotId"],
                          e.response["Error"]["Code"])
    else:
        log.info("snapshot deletion skipped (pass --allow-snapshot-delete to enable)")

    log.info("EXECUTE complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — run 1: dry-run (safe, default)"
            code={`python3 cleanup.py --region us-east-1 --older-than-days 30`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`INFO DRY-RUN: region=us-east-1 older-than=30d
INFO untagged dev candidates: 1
INFO   i-0a1b2c3d4e5f60719 state=running Env=- Owner=-
INFO snapshots older than 30d: 2
INFO   snap-0aaa1111 started=2026-07-20T03:11:00+00:00 size=8GiB
INFO   snap-0bbb2222 started=2026-08-01T09:44:00+00:00 size=8GiB
INFO DRY-RUN complete: no changes made. Re-run with --execute to act.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — run 2: execute (stops instances, spares snapshots)"
            code={`python3 cleanup.py --region us-east-1 --older-than-days 30 --execute`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`INFO EXECUTE: region=us-east-1 older-than=30d
INFO untagged dev candidates: 1
INFO   i-0a1b2c3d4e5f60719 state=running Env=- Owner=-
INFO snapshots older than 30d: 2
INFO   snap-0aaa1111 started=2026-07-20T03:11:00+00:00 size=8GiB
INFO   snap-0bbb2222 started=2026-08-01T09:44:00+00:00 size=8GiB
INFO stopped i-0a1b2c3d4e5f60719
INFO snapshot deletion skipped (pass --allow-snapshot-delete to enable)
INFO EXECUTE complete.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — run 3: verify (nothing left to do)"
            code={`python3 cleanup.py --region us-east-1 --older-than-days 30
aws ec2 describe-instances --instance-ids i-0a1b2c3d4e5f60719 --query 'Reservations[0].Instances[0].State.Name'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`INFO DRY-RUN: region=us-east-1 older-than=30d
INFO untagged dev candidates: 1
INFO   i-0a1b2c3d4e5f60719 state=stopped Env=- Owner=-
INFO snapshots older than 30d: 2
INFO   snap-0aaa1111 started=2026-07-20T03:11:00+00:00 size=8GiB
INFO   snap-0bbb2222 started=2026-08-01T09:44:00+00:00 size=8GiB
INFO DRY-RUN complete: no changes made. Re-run with --execute to act.
"stopped"`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>A–Z order:</strong> tag your test instance (remove Owner
            to make it a candidate) → dry-run and read the report → execute →
            verify the state flipped and rerun shows stopped, not running.
          </li>
          <li>
            <strong>Snapshot deletion stays off:</strong> only add{" "}
            <strong>--allow-snapshot-delete</strong> for a snapshot you made
            from your own test volume — then delete the lab snapshot and the
            test instance when done.
          </li>
          <li>
            <strong>Schedule it:</strong> this file runs unchanged from cron
            or the EventBridge + Lambda pattern in the previous lesson — the
            --execute flag is what the schedule sets, never the default.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">8. Boto3 in Lambda: bundling, layers, roles, timeouts</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Lambda runtimes already include Boto3, but the bundled version lags
          — pin your own via a <strong>Lambda layer</strong> or a deployment
          zip for reproducible paginator and retry behavior. The function
          needs no keys (it assumes the <strong>execution role</strong> from
          the previous lesson) and needs a <strong>60s+ timeout</strong>
          because describe + waiter loops outlive the 3-second default.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="handler.py — cleanup.py logic as a Lambda handler"
            code={`import os
import json
import boto3

ec2 = boto3.client("ec2")
DRY_RUN = os.environ.get("DRY_RUN", "true").lower() == "true"


def lambda_handler(event, context):
    paginator = ec2.get_paginator("describe_instances")
    targets = []
    for page in paginator.paginate(
        Filters=[
            {"Name": "tag:Env", "Values": ["dev"]},
            {"Name": "instance-state-name", "Values": ["running"]},
        ]
    ):
        for r in page["Reservations"]:
            for i in r["Instances"]:
                targets.append(i["InstanceId"])
    if DRY_RUN:
        print("DRY_RUN would stop: " + str(targets))
    elif targets:
        ec2.stop_instances(InstanceIds=targets)
        print("stopped: " + str(targets))
    return {"statusCode": 200, "body": json.dumps({"targets": targets, "dry_run": DRY_RUN})}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — pin Boto3 in a layer and set the timeout"
            code={`pip install -t python/lib/python3.12/site-packages boto3
zip -r boto3-layer.zip python
aws lambda publish-layer-version --layer-name boto3-pinned \\
  --zip-file fileb://boto3-layer.zip --compatible-runtimes python3.12
aws lambda update-function-configuration --function-name dev-cleanup \\
  --timeout 60 --memory-size 128 --layers arn:aws:lambda:us-east-1:123456789012:layer:boto3-pinned:1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{ "LayerVersionArn": "arn:aws:lambda:us-east-1:123456789012:layer:boto3-pinned:1" }
{ "FunctionName": "dev-cleanup", "Timeout": 60, "MemorySize": 128 }`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Role, not keys:</strong> the Lambda execution role
            (least-privilege JSON from the previous lesson) is the credential
            chain — no env keys, no bundled credentials file.
          </li>
          <li>
            <strong>Timeout math:</strong> instance_stopped waiters poll for
            minutes — 60s covers a handful of instances; raise toward 5 min
            (or fan out per instance) for fleet-wide janitors.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Hardcoded keys in .py files committed to git — use profiles
            locally and roles on AWS; rotate any key that ever touched code.
          </li>
          <li>
            No pagination: reading only the first describe/list page and
            reporting &quot;all clear&quot; while page two still bills you.
          </li>
          <li>
            Missing waiters: checking state immediately after stop/start and
            logging the stale value instead of waiting for the transition.
          </li>
          <li>
            Printing secrets: logging identity responses, env vars, or full
            error dicts that embed credentials into CloudWatch Logs.
          </li>
          <li>
            Live-by-default scripts: mutating on first run with no --execute
            gate — every janitor must be report-only until explicitly armed.
          </li>
          <li>
            Deleting snapshots from the shared account because the age filter
            matched — scope OwnerIds to self and test deletion only on your
            own test snapshot.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Install Boto3, print its version, and explain client vs resource to a peer using the table from section 1.</li>
          <li>Run session.py and aws sts get-caller-identity side by side and prove both return the same ARN.</li>
          <li>Complete the S3 round trip (list, create, upload, waiter, download) and paste the object_exists confirmation line.</li>
          <li>Tag your own test instance Env=dev, run ec2_ops.py, and verify the stopped state via the CLI query.</li>
          <li>Rewrite one describe call with a paginator plus standard retry Config and show identical totals to the CLI.</li>
          <li>Add ClientError handling and a dry-run branch to any mutating script, then show both outputs.</li>
          <li>Run the full cleanup.py lab three times (dry, execute, verify) and save all three outputs.</li>
          <li>Package cleanup logic as a Lambda handler with a pinned Boto3 layer, 60s timeout, and least-privilege role — then continue to Monitoring.</li>
        </ul>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          Python now drives your cloud — next, Monitoring teaches you to see
          what it did via CloudWatch metrics, logs, and alarms.
        </p>
      </section>
    </LessonLayout>
  );
}
