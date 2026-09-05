import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="EC2 + EBS"
      intro="EC2 is resizable virtual-server compute; EBS is the persistent disk attached to it. This lesson covers instance families and pricing models, launching securely with key pairs and user-data, EBS volumes and snapshots, the instance lifecycle, and locking down access with instance roles and IMDSv2."
      prev={{ href: "/aws-fundamentals/vpc", label: "VPC" }}
      next={{ href: "/aws-fundamentals/elb-auto-scaling", label: "ELB + Auto Scaling" }}
      resources={[
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Free-tier limits for EC2 (750 micro hours/month) and EBS (30 GB + snapshots) — know exactly what stays free.",
        },
        {
          title: "Amazon EC2 Documentation",
          url: "https://docs.aws.amazon.com/ec2/",
          description:
            "Official guides for instance types, key pairs, user data, EBS volumes, status checks, and IMDSv2.",
        },
        {
          title: "freeCodeCamp",
          url: "https://www.freecodecamp.org/",
          description:
            "Free hands-on AWS/DevOps tutorials to reinforce EC2, SSH, and Linux server basics.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. Instance families and pricing models</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Instance families encode the hardware tradeoff. <strong>T3/T2 micro</strong> are
          burstable general-purpose boxes — the free-tier learning default. <strong>M</strong>{" "}
          is balanced general purpose, <strong>C</strong> is compute-optimized (CI runners,
          APIs), <strong>R/X</strong> are memory-optimized (caches, DBs), <strong>I/D</strong>{" "}
          are storage-optimized, and <strong>G/P</strong> carry GPUs. Pick the family by the
          bottleneck: CPU-bound → C, RAM-bound → R, steady mixed → M.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[600px] text-left text-[13px] leading-6">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2 font-medium">Model</th>
                <th className="px-4 py-2 font-medium">How it bills</th>
                <th className="px-4 py-2 font-medium">Discount vs on-demand</th>
                <th className="px-4 py-2 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">On-demand</td>
                <td className="px-4 py-2">Per second, no commitment</td>
                <td className="px-4 py-2">Baseline</td>
                <td className="px-4 py-2">Learning, spiky/unknown workloads</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Spot</td>
                <td className="px-4 py-2">Spare capacity, can be reclaimed anytime</td>
                <td className="px-4 py-2">Up to ~90% off</td>
                <td className="px-4 py-2">Fault-tolerant batch, CI agents</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Reserved / Savings Plans</td>
                <td className="px-4 py-2">1–3 yr commitment</td>
                <td className="px-4 py-2">Up to ~70% off</td>
                <td className="px-4 py-2">Steady-state prod baselines</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> on-demand for control planes and stateful boxes, Spot
          fleets for CI/build agents and batch workers, Reserved/Savings Plans once prod usage
          is predictable. This cost ladder reappears in the Auto Scaling lesson.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. AMIs: start from Amazon Linux 2023</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          An <strong>AMI</strong> is the launch template: OS + preinstalled software + block-device
          mapping. <strong>Amazon Linux 2023 (AL2023)</strong> is the free-tier-friendly default —
          minimal, AWS-integrated (SSM agent, cloud-init), <code>dnf</code>-based, with quarterly
          releases and 5 years of support. Prefer it over random community AMIs (unknown provenance,
          stale kernels). For reproducibility, bake your own golden AMIs with Packer or EC2 Image
          Builder once manual setup stabilizes — that AMI ID then feeds launch templates and Auto
          Scaling.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Launch walkthrough: key pair → security group → user-data</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Launch order matters: (1) create a <strong>key pair</strong> and lock down the{" "}
          <code>.pem</code> with <code>chmod 400</code> — lose it and you lose SSH access; (2)
          create a <strong>security group</strong> allowing SSH from your IP only plus HTTP from
          anywhere; (3) paste a <strong>user-data</strong> bootstrap script so the box configures
          itself on first boot. User-data runs once as root via cloud-init — treat it as version
          zero of your automation.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. Key pair (save ONCE — AWS never shows it again)
aws ec2 create-key-pair --key-name devops-lab \\
  --query "KeyMaterial" --output text > devops-lab.pem
chmod 400 devops-lab.pem

# 2. Security group: SSH from MY ip only, HTTP open
MYIP=$(curl -s https://checkip.amazonaws.com)
SG=$(aws ec2 create-security-group --group-name lab-web \\
  --description "lab web sg" --vpc-id vpc-abc123 --query "GroupId" --output text)
aws ec2 authorize-security-group-ingress --group-id $SG \\
  --protocol tcp --port 22 --cidr $MYIP/32
aws ec2 authorize-security-group-ingress --group-id $SG \\
  --protocol tcp --port 80 --cidr 0.0.0.0/0
echo "SG=$SG" # save for launch below`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`#!/bin/bash
# user-data: runs once as root on first boot (Amazon Linux 2023)
dnf update -y
dnf install -y nginx
systemctl enable --now nginx
echo "healthy" > /usr/share/nginx/html/health
cat > /usr/share/nginx/html/index.html <<'HTML'
<h1>DevOps lab: hello from $(hostname)</h1>
HTML
systemctl status nginx --no-pager | head -5`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Launch t3.micro with the script above as user-data
aws ec2 run-instances --image-id resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \\
  --instance-type t3.micro --key-name devops-lab \\
  --security-group-ids $SG --user-data file://userdata.sh \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=lab-web}]' \\
  --query "Instances[*].[InstanceId,PublicIpAddress,State.Name]" --output table

# Connect + verify
ssh -i devops-lab.pem ec2-user@<PUBLIC-IP>
curl -s http://<PUBLIC-IP>/ ; echo
curl -s http://<PUBLIC-IP>/health ; echo`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-------------------------------
|         RunInstances        |
+------------+----------+-----+
| i-0abc123  | 3.4.5.6  |pending|
-------------------------------

$ curl -s http://3.4.5.6/
<h1>DevOps lab: hello from ip-172-31-16-5</h1>

$ curl -s http://3.4.5.6/health
healthy`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. EBS: gp3 volumes, snapshots, and the billing traps</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>EBS</strong> is persistent network-attached block storage — the disk survives a
          stop/start but (by default on the root volume) not a terminate. <strong>gp3</strong> is
          the default general-purpose SSD (tune IOPS/throughput independently, cheaper than gp2);{" "}
          <strong>io1/io2</strong> are provisioned-IOPS volumes for latency-critical databases.{" "}
          <strong>Snapshots</strong> are incremental point-in-time backups to S3 — restore a volume,
          copy across Regions, or seed golden AMIs from them.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — 30 GB EBS + snapshots allowance
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            30 GB of gp2/gp3, 2M IOPS, and 1 GB of snapshot storage are free for 12 months. One
            t3.micro with a single 8–30 GB root volume stays inside it.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — storage beyond 30 GB, and volumes that outlive instances
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Extra GB-months, provisioned IOPS, and snapshot storage bill monthly. Worse: with
            delete-on-termination disabled, terminating an instance leaves an orphaned volume
            billing silently. Always check the Volumes console after a terminate.
          </p>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Keep <strong>delete-on-termination enabled</strong> for lab root volumes, snapshot before
          risky changes, and never treat instance-store or un-snapshotted EBS as durable — real
          durability is snapshots + AMIs + data in S3/RDS.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Lifecycle, status checks, stop vs terminate</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Lifecycle: <code>pending → running → (reboot keeps it) → stopping → stopped</code> — or{" "}
          <code>shutting-down → terminated</code>. Two status checks tell you where a failure
          lives: <strong>system check</strong> (AWS hardware/host — try stop/start to migrate
          hosts) vs <strong>instance check</strong> (your OS/app — SSH in, read logs).{" "}
          <strong>Stop</strong> keeps EBS + config and stops compute billing;{" "}
          <strong>reboot</strong> keeps everything including the public IP;{" "}
          <strong>terminate</strong> destroys the instance.
        </p>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            TERMINATE = DATA LOSS (unless snapshotted)
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Termination deletes the instance and — with the default root-volume setting — its
            disk. There is no undo. Stop when idle, snapshot before experiments, terminate only
            when you mean it.
          </p>
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. IMDSv2 and instance roles: never put keys on servers</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Apps on EC2 need AWS credentials — the wrong answer is baking <code>AWS_SECRET_KEY</code>{" "}
          into user-data or env files. The right answer is an <strong>IAM instance role</strong>{" "}
          attached via an instance profile: the box fetches short-lived credentials from the{" "}
          <strong>Instance Metadata Service (IMDS)</strong>. Use <strong>IMDSv2</strong>{" "}
          (session-token, PUT-required) so SSRF bugs cannot trivially steal credentials — enforce
          it with <code>HttpTokens=required</code> at launch.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Safe: fetch short-lived role credentials via IMDSv2 (no stored keys)
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \\
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \\
  http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Launch hardened: IMDSv2 required + instance profile attached
aws ec2 run-instances --image-id ami-xxxxxxxxx --instance-type t3.micro \\
  --metadata-options HttpTokens=required,HttpEndpoint=enabled \\
  --iam-instance-profile Name=lab-ec2-profile \\
  --key-name devops-lab --security-group-ids $SG`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> least-privilege roles per tier (app role reads one S3
          prefix, deploy role pushes to CodeDeploy); rotate nothing because credentials auto-expire.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Lab (free tier): launch, use, stop, destroy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Budget: <strong>t2/t3.micro ≈ 730 hours/month free</strong> (one box running all month)
          + 30 GB EBS. One instance left running 24/7 consumes the whole allowance — so{" "}
          <strong>stop when idle</strong> and terminate + delete the key pair at the end.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Stop when idle (keeps disk, stops compute billing)
aws ec2 stop-instances --instance-ids i-0abc123

# Restart later
aws ec2 start-instances --instance-ids i-0abc123

# Full cleanup at the end of the lab
aws ec2 terminate-instances --instance-ids i-0abc123
aws ec2 wait instance-terminated --instance-ids i-0abc123
aws ec2 delete-key-pair --key-name devops-lab
rm -f devops-lab.pem

# Confirm: no running instances, no stray volumes
aws ec2 describe-instances \\
  --filters Name=instance-state-name,Values=running \\
  --query "Reservations[*].Instances[*].InstanceId" --output table
aws ec2 describe-volumes \\
  --filters Name=status,Values=available \\
  --query "Volumes[*].[VolumeId,Size,State]" --output table`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID warnings — the three classic surprise bills
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            (1) A forgotten running instance burns the 730-hr budget and bills beyond it. (2) An
            idle Elastic IP (allocated but unattached) bills hourly. (3) A NAT Gateway from the
            VPC lesson bills ~$0.045/hr regardless of EC2 state. Check all three in the
            Billing console after cleanup.
          </p>
        </div>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>SSH open to 0.0.0.0/0:</strong> automated scanners will find port 22 within
            minutes. Scope to your IP/32 (section 3) and re-check with{" "}
            <code>checkip.amazonaws.com</code> when your home IP changes.
          </li>
          <li>
            <strong>Lost .pem, no backup access:</strong> AWS cannot recover a lost private key.
            Either bake in SSM Session Manager access or be ready to detach the root volume and
            inject a new key via a rescue instance.
          </li>
          <li>
            <strong>Terminate with data, no snapshot:</strong> the default root volume is deleted
            on terminate. Snapshot first; keep durable data in S3/RDS, not on one disk.
          </li>
          <li>
            <strong>Treating stop as delete:</strong> stopped volumes and snapshots still bill.
            Stop pauses compute only — terminate + delete volumes to reach $0.
          </li>
          <li>
            <strong>Long-lived access keys on the box:</strong> leaked via backups, AMIs, and
            logs. Use instance roles + IMDSv2 (section 6) instead.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Launch a t3.micro AL2023 box with the section-3 user-data; curl its public IP until you see your HTML.</li>
          <li>SSH in with <code>chmod 400</code> key, run <code>systemctl status nginx</code>, and fetch role-free metadata via IMDSv2.</li>
          <li>Create an EBS snapshot of the root volume; verify it appears in the Snapshots console.</li>
          <li>Practice stop → start (note the changed public IP) → reboot (note it stays).</li>
          <li>Attach an IAM role via instance profile; confirm <code>aws sts get-caller-identity</code> works with no stored keys.</li>
          <li>Fail a status check on purpose (stop nginx + break cloud-init) and identify instance-check vs system-check.</li>
          <li>Run the full section-7 cleanup; prove $0 state with describe-instances + describe-volumes.</li>
          <li>Write down your monthly cost if you left the box + 30 GB running past free tier (check the pricing calculator).</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
