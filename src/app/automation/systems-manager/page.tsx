import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Configuration & Automation"
      title="Systems Manager"
      intro="Systems Manager (SSM) is Ansible without SSH: an AWS agent on every EC2 instance phones home to the SSM API, so you run audited fleet commands, open browser shells, store secrets, and patch hundreds of servers from one console — no key pairs, no port 22, no bastion hosts. Here you attach the SSM role, run Run Command, store a SecureString, scan with Patch Manager, open a Session Manager shell, then prove it all in a free-tier lab with full teardown."
      prev={{ href: "/automation/ansible", label: "Ansible" }}
      next={{ href: "/automation/lambda-automation", label: "Lambda Automation" }}
      resources={[
        {
          title: "AWS Systems Manager User Guide",
          url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html",
          description:
            "Official reference for Run Command, Session Manager, Parameter Store, and Patch Manager with CLI examples.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm the t3.micro allowance and that Systems Manager management of EC2 instances carries no extra charge.",
        },
        {
          title: "AWS Skill Builder — Systems Manager learning",
          url: "https://skillbuilder.aws/",
          description:
            "Free digital courses and hands-on practice for Systems Manager and operational automation.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">A. What SSM solves: no SSH keys, every command audited</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Ansible taught you push-over-SSH: the control node must reach every
          target on port 22 with the right key and user. That breaks the moment
          you have <strong>private subnets with no inbound access</strong>,{" "}
          <strong>100+ instances with rotating keys</strong>, or an auditor
          asking <strong>&quot;who ran what, where, with what output?&quot;</strong>{" "}
          Systems Manager flips the direction: the <strong>SSM Agent</strong>{" "}
          (preinstalled on Amazon Linux 2023 and Ubuntu AMIs) opens an{" "}
          <strong>outbound HTTPS connection to the SSM API</strong> and
          long-polls for work. You never SSH in — you tell the API what to run,
          the agent executes it as root, and AWS stores the invocation, output,
          and identity in CloudTrail and S3.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture — agent phones home, you never SSH"
            code={`YOU (console / CLI)          AWS CONTROL PLANE              YOUR FLEET (no port 22)
+------------------+      +------------------------+      +------------------------+
| aws ssm            |      | SSM API                |      | web-1 (private subnet) |
| send-command       +----->| + Run Command queue    +----->| SSM Agent (outbound    |
| start-session      +----->| + Session Manager relay+----->| 443 polls, executes    |
+------------------+      | + Parameter Store (KMS)|      | as root, returns       |
                          | + Patch Manager        |      | output + status)       |
                          +-----------+------------+      +------------------------+
                                      | audit                         | web-2, web-3 ...
                                      v                               v
                          +------------------------+      +------------------------+
                          | CloudTrail (who ran    |      | NO sshd exposure,      |
                          | what) + S3 logs        |      | NO key pairs,          |
                          +------------------------+      | keys never leave IAM   |
                                                          +------------------------+`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>No SSH keys to manage:</strong> access is an IAM permission
            (ssm:SendCommand, ssm:StartSession), not a .pem file. Revoke the
            IAM user and access dies instantly — no re-keying 200 servers.
          </li>
          <li>
            <strong>Every command is audited:</strong> each Run Command gets a
            Command ID with per-instance status, stdout/stderr, timestamps, and
            the caller identity in CloudTrail. Compare with SSH, where history
            lives in per-host bash logs nobody collects.
          </li>
          <li>
            <strong>DevOps uses:</strong> fleet-wide package installs and
            restarts without a bastion; Session Manager as the only human shell
            (recorded to S3); Parameter Store as the config/secret source that
            Terraform (Module 05) and Lambda read at deploy and run time; Patch
            Manager as the scheduled compliance engine.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">B. IAM prerequisite: the SSM role + instance profile</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          SSM works only if the instance <strong>proves who it is</strong> to
          AWS. That proof is an <strong>IAM role</strong> with the AWS-managed
          policy <strong>AmazonSSMManagedInstanceCore</strong>, attached via an{" "}
          <strong>instance profile</strong> (the wrapper that lets EC2 assume a
          role). No role → the instance never appears in Fleet Manager, and
          send-command fails with InvalidInstanceId. Create it once, reuse it
          for every lab instance.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — create the SSM role + instance profile"
            code={`aws iam create-role --role-name ssm-lab-role \\
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam attach-role-policy --role-name ssm-lab-role \\
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

aws iam create-instance-profile --instance-profile-name ssm-lab-profile
aws iam add-role-to-instance-profile --instance-profile-name ssm-lab-profile --role-name ssm-lab-role`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
    "Role": { "RoleName": "ssm-lab-role", "Arn": "arn:aws:iam::123456789012:role/ssm-lab-role" }
}
{
    "InstanceProfile": { "InstanceProfileName": "ssm-lab-profile", "Roles": [] }
}
{
    "InstanceProfile": { "InstanceProfileName": "ssm-lab-profile", "Roles": [{ "RoleName": "ssm-lab-role" }] }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — launch with the profile and verify registration"
            code={`aws ec2 run-instances --image-id resolve:ssm:/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id \\
  --instance-type t3.micro --iam-instance-profile Name=ssm-lab-profile \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ssm-lab},{Key=Env,Value=lab}]' \\
  --query 'Instances[0].InstanceId' --output text

sleep 90
aws ssm describe-instance-information \\
  --query 'InstanceInformationList[*].[InstanceId,PingStatus,PlatformType,AgentVersion]' \\
  --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`i-0a1b2c3d4e5f60718
---------------------------------------------------------
|              DescribeInstanceInformation              |
+----------------------+------------+------------------+
|  i-0a1b2c3d4e5f60718 |  Online    |  Linux           |
+----------------------+------------+------------------+`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Role vs instance profile:</strong> the role holds
            permissions; the profile is the EC2-shaped holder. The console
            hides this (one dropdown), the CLI shows both steps — and the{" "}
            <strong>~10 second propagation delay</strong> after
            add-role-to-instance-profile, so wait before launching.
          </li>
          <li>
            <strong>PingStatus is your health check:</strong> Online means the
            agent is polling. ConnectionLost means the instance lost network;
            missing entirely means no role, wrong region, or an AMI without the
            agent installed.
          </li>
          <li>
            <strong>Verify checkpoint:</strong> your instance ID appears with
            PingStatus Online before continuing — every later section fails
            without it.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">C. Run Command A–Z: send-command to a fleet</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Run Command</strong> executes <strong>SSM Documents</strong>{" "}
          (JSON/YAML runbooks — AWS-RunShellScript, AWS-InstallApplication)
          against targets selected by <strong>instance ID, tag, or resource
          group</strong>. You get a <strong>Command ID</strong>, then poll per-instance{" "}
          <strong>invocations</strong> for status and output. Below: install
          nginx on every instance tagged Env=lab with one call.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — install nginx across the lab fleet"
            code={`aws ssm send-command \\
  --document-name "AWS-RunShellScript" \\
  --targets '[{"Key":"tag:Env","Values":["lab"]}]' \\
  --parameters '{"commands":["sudo apt-get update -y","sudo apt-get install -y nginx","sudo systemctl enable --now nginx","systemctl is-active nginx"]}' \\
  --comment "lab: install nginx via SSM" \\
  --query 'Command.CommandId' --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`a1b2c3d4-5678-90ab-cdef-EXAMPLE11111`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — read per-instance output"
            code={`aws ssm list-command-invocations --command-id a1b2c3d4-5678-90ab-cdef-EXAMPLE11111 \\
  --details --query 'CommandInvocations[*].[InstanceId,Status,StandardOutputContent]' --output text

aws ssm get-command-invocation --command-id a1b2c3d4-5678-90ab-cdef-EXAMPLE11111 \\
  --instance-id i-0a1b2c3d4e5f60718 --query '[Status,StandardOutputContent]' --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`i-0a1b2c3d4e5f60718   Success   active
i-0a1b2c3d4e5f60718   Success   Hit:1 http://archive.ubuntu.com noble InRelease
Setting up nginx (1.24.0-1ubuntu22.04) ...
Synchronizing state of nginx.service ... enabled.
active`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Console view:</strong> Systems Manager → Run Command →
            Command history → your Command ID shows green Success per
            instance, with Standard output and Standard error tabs — the same
            text the CLI returns, clickable for auditors.
          </li>
          <li>
            <strong>Targets are the power move:</strong> tag:Env=lab hits 1 or
            100 instances identically. Prefer tags over instance IDs in every
            runbook so new servers join the fleet automatically.
          </li>
          <li>
            <strong>DevOps uses:</strong> &quot;restart php-fpm everywhere&quot;
            incident command; scheduled State Manager associations that
            re-apply the nginx install hourly (drift repair); CI step that
            triggers send-command to deploy after a green build.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">D. Parameter Store: String vs SecureString + Terraform</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Parameter Store</strong> is SSM&apos;s config drawer:{" "}
          <strong>String</strong> and <strong>StringList</strong> for plaintext
          config (port numbers, feature flags), <strong>SecureString</strong>{" "}
          (KMS-encrypted) for secrets (DB passwords, API tokens). Paths form a
          hierarchy (/myapp/prod/db-password) so IAM can grant per-path access.
          Your app reads them at boot; your Terraform (Module 05) reads them at
          plan time — one source of truth, never hardcoded.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — put a String and a SecureString"
            code={`aws ssm put-parameter --name "/myapp/lab/http-port" \\
  --value "80" --type String --overwrite

aws ssm put-parameter --name "/myapp/lab/db-password" \\
  --value "Sup3rSecret-Lab-Only" --type SecureString --overwrite

aws ssm get-parameter --name "/myapp/lab/http-port" --query 'Parameter.Value' --output text
aws ssm get-parameter --name "/myapp/lab/db-password" --with-decryption --query 'Parameter.Value' --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{"Version": 1, "Tier": "Standard"}
{"Version": 1, "Tier": "Standard"}
80
Sup3rSecret-Lab-Only`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="main.tf — Terraform reads the same parameters (Module 05)"
            code={`data "aws_ssm_parameter" "http_port" {
  name = "/myapp/lab/http-port"
}

data "aws_ssm_parameter" "db_password" {
  name            = "/myapp/lab/db-password"
  with_decryption = true
}

resource "aws_security_group_rule" "http" {
  type              = "ingress"
  from_port       = tonumber(data.aws_ssm_parameter.http_port.value)
  to_port         = tonumber(data.aws_ssm_parameter.http_port.value)
  protocol        = "tcp"
  cidr_blocks     = ["0.0.0.0/0"]
  security_group_id = aws_security_group.web.id
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Without --with-decryption you get ciphertext:</strong> the
            API returns the encrypted blob. Forgetting the flag is the #1
            &quot;my app reads garbage&quot; bug — and the secure default you
            want.
          </li>
          <li>
            <strong>Standard vs Advanced tier:</strong> Standard (free, 4 KB
            limit) fits this course. Advanced (paid, 8 KB, policies) is for
            large configs with expiration — you do not need it here.
          </li>
          <li>
            <strong>Verify checkpoint:</strong> get-parameter with
            --with-decryption returns your secret, and without it returns an
            encrypted blob — proving KMS is actually encrypting.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">E. Patch Manager: baselines + maintenance windows + compliance</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Patch Manager</strong> answers &quot;which servers are missing
          security patches?&quot; A <strong>patch baseline</strong> declares
          which patches auto-approve (e.g. Ubuntu Noble SECURITY, Critical and
          High severity, 7-day delay); a <strong>maintenance window</strong>{" "}
          declares when patching may reboot (e.g. Sundays 02:00–04:00). A{" "}
          <strong>Scan</strong> reports compliance without changing anything —{" "}
          <strong>Patch</strong> installs. Always scan first.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — scan for missing patches (no changes)"
            code={`aws ssm send-command \\
  --document-name "AWS-RunPatchBaseline" \\
  --targets '[{"Key":"tag:Env","Values":["lab"]}]' \\
  --parameters '{"Operation":["Scan"]}' \\
  --query 'Command.CommandId' --output text

sleep 120
aws ssm describe-instance-patches --instance-id i-0a1b2c3d4e5f60718 \\
  --query '[length(InstancesWithPlugins),InstancePatches[?State==\`Missing\`]|[0:3].[Title,Severity,State]]' --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`b2c3d4e5-6789-0abc-def1-EXAMPLE22222
2
USN-6721-1: linux-image hotfix  Critical  Missing
USN-6702-3: openssl update      High      Missing`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Console view:</strong> Systems Manager → Patch Manager →
            Compliance shows per-instance counts (Compliant / Non-compliant /
            Missing patches); Systems Manager → Fleet Manager → instance →
            Patches tab lists every KB with severity and state.
          </li>
          <li>
            <strong>Maintenance window concept:</strong> a named cron schedule
            (cron(0 2 ? * SUN *)) plus registered targets (tag:Env=prod) plus
            tasks (RunPatchBaseline with Operation=Install). Patching outside a
            window is how you reboot prod at noon — windows exist so you
            don&apos;t.
          </li>
          <li>
            <strong>DevOps uses:</strong> weekly scan report to Slack/Email via
            EventBridge; auto-patch dev on Sunday nights, manual approval for
            prod; compliance dashboard as the auditor&apos;s screenshot.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">F. Session Manager: a browser shell with no port 22</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Session Manager</strong> is an interactive shell tunneled
          through the SSM API — the security group needs{" "}
          <strong>no inbound rules at all</strong>, not even port 22. Access is
          IAM (ssm:StartSession), sessions can require a reason, idle timeout,
          and <strong>full keystroke logging to S3/CloudWatch</strong>. For
          debugging, it replaces SSH and bastions entirely.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-zinc-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-zinc-300">
          <p className="font-medium text-emerald-800 dark:text-emerald-300">Close port 22 — this is the point</p>
          <p className="mt-1 text-sm leading-6">
            Lab instances in this lesson run with a security group that allows
            outbound HTTPS only. Session Manager connects through the SSM
            relay, so SSH exposure, key rotation, and bastion cost all drop to
            zero while every session stays auditable.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — open and use a session"
            code={`aws ssm start-session --target i-0a1b2c3d4e5f60718

# inside the session (browser or terminal plugin):
whoami
systemctl is-active nginx
curl -s http://localhost/ | head -5
exit`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Starting session with SessionId: s-0abc1234def567890
$ whoami
root
$ systemctl is-active nginx
active
$ curl -s http://localhost/ | head -5
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
$ exit
Exiting session with sessionId: s-0abc1234def567890.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Needs the plugin locally:</strong> start-session from your
            laptop requires the Session Manager plugin; the console&apos;s
            &quot;Connect → Session Manager&quot; button needs nothing — use
            the browser in the lab if the plugin is missing.
          </li>
          <li>
            <strong>Verify checkpoint:</strong> you land as root/shell without
            any key pair, and nginx answers on localhost — proving the agent
            path works end to end.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">G. Full lab [FREE TIER]: SSM role → 3 commands → 1 secret → patch scan → terminate</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          One t3.micro, about 30 minutes, zero spend if you terminate. You
          launch with the SSM role, run <strong>three Run Commands</strong>,
          store <strong>one SecureString</strong>, run a <strong>patch
          scan</strong>, open a <strong>Session Manager shell</strong>, then
          tear everything down. Set a timer — teardown is step 6, not
          &quot;later&quot;.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-zinc-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-zinc-300">
          <p className="font-medium text-emerald-800 dark:text-emerald-300">Free Tier boundary</p>
          <p className="mt-1 text-sm leading-6">
            t3.micro 750 hrs/month free for 12 months; SSM management,
            Parameter Store Standard, and patch scans carry no extra charge.
            One instance for under an hour ≈ 1 free hour. VPC interface
            endpoints for private subnets are NOT free — run this lab in the
            default public subnet to stay at $0.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — 1. Launch with SSM role [FREE TIER]"
            code={`aws iam get-instance-profile --instance-profile-name ssm-lab-profile  # must exist from section B
aws ec2 run-instances --image-id resolve:ssm:/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id \\
  --instance-type t3.micro --iam-instance-profile Name=ssm-lab-profile \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ssm-lab},{Key=Env,Value=lab}]' \\
  --query 'Instances[0].InstanceId' --output text
aws ssm describe-instance-information --query 'InstanceInformationList[*].PingStatus' --output text  # expect Online`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — 2. Run 3 commands (uptime, nginx install, nginx check)"
            code={`export IID=i-0a1b2c3d4e5f60718  # replace with your ID
aws ssm send-command --document-name "AWS-RunShellScript" --instance-ids "$IID" \\
  --parameters '{"commands":["uptime"]}' --query 'Command.CommandId' --output text
aws ssm send-command --document-name "AWS-RunShellScript" --instance-ids "$IID" \\
  --parameters '{"commands":["sudo apt-get update -y","sudo apt-get install -y nginx","sudo systemctl enable --now nginx"]}' --query 'Command.CommandId' --output text
aws ssm send-command --document-name "AWS-RunShellScript" --instance-ids "$IID" \\
  --parameters '{"commands":["systemctl is-active nginx","curl -s -o /dev/null -w %{http_code} http://localhost/"]}' --query 'Command.CommandId' --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`c3d4e5f6-7890-abcd-ef12-EXAMPLE33333
d4e5f607-890a-bcde-f123-EXAMPLE44444
e5f60718-90ab-cdef-1234-EXAMPLE55555
# get-command-invocation for the third shows:
# Success ... active ... 200`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — 3-4. Store 1 SecureString + patch scan"
            code={`aws ssm put-parameter --name "/myapp/lab/db-password" --value "LabOnly-$(date +%s)" --type SecureString --overwrite
aws ssm get-parameter --name "/myapp/lab/db-password" --with-decryption --query 'Parameter.Value' --output text
aws ssm send-command --document-name "AWS-RunPatchBaseline" --instance-ids "$IID" \\
  --parameters '{"Operation":["Scan"]}' --query 'Command.CommandId' --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — 5-6. Session check + TEARDOWN NOW"
            code={`aws ssm start-session --target "$IID"   # run: systemctl is-active nginx ; exit
aws ssm delete-parameter --name "/myapp/lab/db-password"
aws ssm delete-parameter --name "/myapp/lab/http-port"
aws ec2 terminate-instances --instance-ids "$IID"
aws ec2 wait instance-terminated --instance-ids "$IID"
aws ec2 describe-instances --instance-ids "$IID" --query 'Reservations[0].Instances[0].State.Name' --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`active
terminated`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Verify the bill:</strong> EC2 console shows zero running
            instances; Parameters list no longer shows /myapp/lab/*; Billing
            shows under 1 instance-hour. Keep the ssm-lab-role for the next
            lessons — delete only the instance and parameters.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Missing SSM role: instance boots but never appears in Fleet
            Manager; send-command fails with InvalidInstanceId or
            &quot;instance is not managed&quot; — attach ssm-lab-profile
            (AmazonSSMManagedInstanceCore) and wait ~90 seconds for
            PingStatus Online.
          </li>
          <li>
            Private subnet without endpoints: agent cannot reach SSM/EC2Messages
            APIs so PingStatus stays blank — it needs NAT or VPC interface
            endpoints, and endpoints cost ~$7/month each plus data processing
            (PAID — that is why this lab uses the default public subnet).
          </li>
          <li>
            SecureString without KMS permissions: put-parameter succeeds but
            get with --with-decryption fails with AccessDenied on the KMS key
            — grant kms:Decrypt on the key (default aws/ssm key needs no
            extra setup; customer keys need an explicit grant).
          </li>
          <li>
            Wrong region: CLI in us-east-1, console in eu-west-1 — Fleet
            Manager looks empty. Pin AWS_REGION in every terminal and match
            the console region switcher before debugging further.
          </li>
          <li>
            Session plugin missing: start-session dies with
            &quot;SessionManagerPlugin is not found&quot; — install the plugin
            or use console Connect → Session Manager in the browser instead.
          </li>
          <li>
            Patch Install instead of Scan: Operation=Install reboots and
            changes the box mid-lab — use Scan while learning, schedule
            Install inside a maintenance window only.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Redraw the SSM agent architecture diagram from memory and explain to a peer why outbound-443 polling removes bastions and key pairs.</li>
          <li>Create ssm-lab-role + ssm-lab-profile from section B, launch an instance with it, and prove PingStatus Online with describe-instance-information.</li>
          <li>Run send-command with tag:Env=lab to install nginx, then fetch per-instance output with get-command-invocation and screenshot the console Command history.</li>
          <li>Put /myapp/lab/http-port (String) and /myapp/lab/db-password (SecureString), prove decryption on/off behavior, and reference both from a Terraform data block.</li>
          <li>Run a RunPatchBaseline Scan, list Missing patches with describe-instance-patches, and explain baseline vs maintenance window in two sentences.</li>
          <li>Open a Session Manager shell with zero inbound security-group rules, verify nginx on localhost, and confirm the session appears in the console history.</li>
          <li>Complete lab G end to end (3 commands + 1 secret + patch scan + session + terminate), verifying terminated state and parameter deletion.</li>
          <li>Break one thing on purpose (detach the role OR query the wrong region), record the exact error, fix it, then continue to Lambda Automation.</li>
        </ul>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          Agent-based control done — next, event-driven automation that runs
          with no servers at all via Lambda.
        </p>
      </section>
    </LessonLayout>
  );
}
