import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Security (DevSecOps)"
      title="Identity & Access Hardening"
      intro="Identity is the perimeter now — there is no firewall that saves you from a leaked admin key. This lesson locks down root, enforces MFA, applies least privilege with boundaries and SCPs, reads Access Analyzer findings, replaces CI keys with OIDC, and drills the leaked-key response until it is muscle memory."
      prev={{ href: "/security/overview", label: "Start Here" }}
      next={{ href: "/security/data-protection", label: "KMS, Secrets & Encryption" }}
      resources={[
        {
          title: "IAM best practices — AWS docs",
          url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html",
          description:
            "Official checklist: root lockdown, MFA, least privilege, roles over users, and credential rotation cadence.",
        },
        {
          title: "IAM Access Analyzer findings — AWS docs",
          url: "https://docs.aws.amazon.com/access-analyzer/latest/APIReference/API_GetAnalyzedResource.html",
          description:
            "How Access Analyzer flags unused and external access — read one finding end to end before trusting your policies.",
        },
        {
          title: "Security best practices — freeCodeCamp",
          url: "https://www.freecodecamp.org/news/aws-security-best-practices/",
          description:
            "Practical walkthrough of MFA, IAM roles, and key hygiene with screenshots for beginners.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">MFA everywhere + root lockdown</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The root user can do <strong>everything including closing the
          account</strong> — it must have MFA, no access keys, and a strong
          password, then never be used again. Every human IAM user gets MFA
          too. No exceptions, no &quot;later&quot;.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Audit: who lacks MFA, does root have keys (it must NOT)?
aws iam get-account-summary --query 'SummaryMap.[Users,MFADevicesInUse,AccountMFAEnabled]' --output table
aws iam get-credential-report --query 'Content' --output text | base64 -d | cut -d, -f1,4,8,11 | head -10
aws iam list-virtual-mfa-devices
aws iam get-account-password-policy 2>&1 | head -20`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-------------------------------
|  Users  | MFADevices | MFAEnabled |
|  3      | 2          | 1          |
-------------------------------
# ^^ 3 users but only 2 MFA devices -> one human is unprotected. Fix NOW.
user,password_enabled,mfa_active,access_key_1_active
root_account,false,false,false        # GOOD: no password login? (federated) or locked down
alice,true,false,true                 # BAD: password but NO MFA -> enforce
bob,true,true,false                   # GOOD: MFA on, no long-lived key
NoSuchEntity: password policy         # BAD: no password policy set yet`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Root lockdown checklist:</strong> enable MFA on root, delete
            root access keys, set a 20+ char password in a manager, attach no
            policies, and store the MFA device where the team can recover it.
          </li>
          <li>
            <strong>Enforce with policy:</strong> attach an MFA-enforcement
            policy so console and CLI calls fail without an MFA session.
          </li>
          <li>
            <strong>DevOps use:</strong> break-glass root lives in a sealed
            envelope / vault with MFA; daily work uses SSO or IAM users with
            MFA + short sessions. Root login triggers a billing alert.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="mfa-enforce-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyWithoutMFA",
      "Effect": "Deny",
      "NotAction": ["iam:CreateVirtualMFADevice", "iam:EnableMFADevice", "sts:GetSessionToken"],
      "Resource": "*",
      "Condition": { "BoolIfExists": { "aws:MultiFactorAuthPresent": "false" } }
    }
  ]
}`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">IAM deepening: least privilege, boundaries, SCPs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Least privilege means <strong>only the actions on only the resources
          needed, with conditions</strong>. Permission boundaries and Service
          Control Policies (SCPs) are the guardrails that keep even admins and
          member accounts inside the sandbox.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="least-privilege-deploy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DeployOnlyToOneApp",
      "Effect": "Allow",
      "Action": ["ecs:UpdateService", "ecs:DescribeServices", "ecr:BatchGetImage"],
      "Resource": [
        "arn:aws:ecs:us-east-1:123456789012:service/shop/prod-web",
        "arn:aws:ecr:us-east-1:123456789012:repository/shop-web"
      ],
      "Condition": { "StringEquals": { "aws:RequestedRegion": "us-east-1" } }
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="boundary-dev.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BoundaryCapsMax",
      "Effect": "Allow",
      "Action": ["s3:*", "dynamodb:*", "logs:*", "ec2:Describe*"],
      "Resource": "*",
      "Condition": { "StringEquals": { "aws:RequestedRegion": "us-east-1" } }
    },
    { "Sid": "NeverIAM", "Effect": "Deny", "Action": ["iam:*", "organizations:*"], "Resource": "*" }
  ]
}
# Attach as PermissionsBoundary: devs can grant anything BELOW this ceiling,
# but never IAM/Orgs, never outside us-east-1 — even with AdministratorAccess.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="scp-deny-leaving-guardrails.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "DenyRootKeys", "Effect": "Deny", "Action": ["iam:CreateAccessKey"], "Resource": "*",
      "Condition": { "StringLike": { "iam:UserName": "root" } } },
    { "Sid": "RequireIMDSv2", "Effect": "Deny", "Action": ["ec2:RunInstances"], "Resource": "*",
      "Condition": { "StringNotEquals": { "ec2:MetadataHttpTokens": "required" } } },
    { "Sid": "DenyLeavingOrg", "Effect": "Deny", "Action": ["organizations:LeaveOrganization"], "Resource": "*" }
  ]
}
# SCPs attach at the org root / OU in Organizations: they filter EVERY principal
# in member accounts, including admins. Deny-list the dangerous escapes.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Mental model:</strong> identity policy (what you may do) ∩
            boundary (your max) ∩ SCP (org max) = effective permission. The
            tightest deny always wins.
          </li>
          <li>
            <strong>DevOps use:</strong> CI deploy roles get the scoped deploy
            policy; developers get PowerUser + boundary; SCPs block expensive
            or exfiltrating actions org-wide.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Access Analyzer: prove least privilege</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Policies rot — people change teams, roles accumulate actions. Access
          Analyzer watches CloudTrail and flags <strong>unused access and
          external sharing</strong> so you can trim policies with evidence.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws accessanalyzer list-analyzers --query 'analyzers[*].[name,status]' --output table
aws accessanalyzer list-findings --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/account --max-results 5 --query 'findings[*].[resource,action,status]' --output table
aws iam generate-service-last-accessed-details --arn arn:aws:iam::123456789012:role/ci-deploy
aws iam get-service-last-accessed-details --job-id <job-id-from-above>`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-------------------- account-analyzer | ACTIVE
resource                          | action                    | status
s3:::shop-backups                 | s3:GetObject (external)   | ACTIVE -> bucket shared outside org!
role/legacy-admin                 | iam:* unused 180 days     | ACTIVE -> trim to read-only or delete
role/ci-deploy                    | ec2:* unused 90 days      | ACTIVE -> scope to ecs+ecr only
# get-service-last-accessed-details: ci-deploy last used ec2:RunInstances = NEVER -> remove ec2:*`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Fix loop:</strong> finding → check last-accessed → remove
            unused action → re-scan. Repeat monthly; gate widening policies in
            PR review.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">OIDC for CI: kill the long-lived keys</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Storing <strong>AWS_ACCESS_KEY_ID</strong> in GitHub Secrets means a
          leak gives permanent credentials. OIDC federation lets GitHub request
          a <strong>15-minute scoped token</strong> per run — nothing stored,
          nothing to steal.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`KEYS (legacy, leaky)                    OIDC (modern, no secrets)
 GitHub Secrets:                      GitHub Actions (id-token: write)
  AWS_ACCESS_KEY_ID +---------+        1) request JWT for repo+branch  +---------+
  AWS_SECRET..........| EC2?  |  --->  2) STS AssumeRoleWithWebIdentity |   AWS   |
  valid for YEARS     +---------+      3) 15-min creds, scoped to role +---------+
  leaked once = owned              trust policy: only repo:org/shop-web@main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="oidc-trust-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:myorg/shop-web:ref:refs/heads/main" }
    }
  }]
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DevOps use:</strong> one role per repo + branch (main
            deploys, PRs get read-only). Module 08&apos;s pipeline lesson shows
            the workflow YAML — this is the trust side.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Credential hygiene + leaked-key drill</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Rotate on a schedule and rehearse the leak response before it happens.
          Speed matters: automated scanners find GitHub keys in minutes, and
          crypto-miners spin up within the hour.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Rotation: create new -> update consumer -> verify -> delete old
aws iam create-access-key --user-name alice --query 'AccessKey.[AccessKeyId,Status]' --output table
# ... update app / CI to new key, verify app works ...
aws iam update-access-key --user-name alice --access-key-id AKIAOLDKEYEXAMPLE --status Inactive
aws iam delete-access-key --user-name alice --access-key-id AKIAOLDKEYEXAMPLE
aws iam list-access-keys --user-name alice   # expect exactly 1 ACTIVE key

# LEAK DRILL: key posted publicly — assume compromised, act in this order
aws iam update-access-key --user-name alice --access-key-id AKIALEAKEDKEYEXAMPLE --status Inactive
aws cloudtrail lookup-events --lookup-attributes AttributeKey=AccessKeyId,AttributeValue=AKIALEAKEDKEYEXAMPLE --max-results 10
aws iam delete-access-key --user-name alice --access-key-id AKIALEAKEDKEYEXAMPLE`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`AKIA...NEWKEY | Active     # new key works, app healthy
AKIA...OLDKEY | Inactive   # old key disabled, nothing broke -> safe to delete
# leak drill:
AKIALEAKED... | Inactive   # 1. contained in seconds
CloudTrail: ec2:RunInstances denied (scp) | iam:CreateUser denied  # 2. assess blast radius
Deleted AKIALEAKED...      # 3. removed; rotate any data it could read`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">Danger: never do this</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-red-700 dark:text-red-300">
            <li>Commit *.pem, .env, or access keys to Git — even &quot;private&quot; repos leak via forks and clones.</li>
            <li>Email or chat credentials — use Secrets Manager / SSM Parameter Store + rotation instead.</li>
            <li>Share one IAM user across the team — you lose attribution and cannot revoke one person.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A–Z: harden identity [FREE]</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Fully free-tier: IAM, MFA, policies, boundaries, Analyzer, and OIDC
          trust cost nothing. Work A to Z without skipping.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>A. Audit:</strong> credential report + account summary; list users without MFA and keys older than 90 days.</li>
          <li><strong>B. Root:</strong> enable root MFA, delete root keys, verify with list-access-keys (expect none).</li>
          <li><strong>C. Password policy:</strong> set minimum length, symbols, expiry; confirm with get-account-password-policy.</li>
          <li><strong>D. MFA enforce:</strong> attach the DenyWithoutMFA policy; verify an un-MFA&apos;d call is denied.</li>
          <li><strong>E. Least privilege:</strong> write the scoped deploy policy for one ECS service + one ECR repo.</li>
          <li><strong>F. Boundary:</strong> attach the dev boundary to a test user; verify iam:* is denied even with extra allows.</li>
          <li><strong>G. SCP (read-only if no Orgs):</strong> draft the deny-leaving-guardrails SCP JSON; apply if you own the org.</li>
          <li><strong>H. Analyzer:</strong> enable Access Analyzer, list findings, trim one unused action from ci-deploy.</li>
          <li><strong>I. OIDC trust:</strong> create the GitHub OIDC provider + trust policy scoped to one repo/branch.</li>
          <li><strong>J. No-keys check:</strong> grep repos for AKIA and *.pem; move any hit into Secrets Manager.</li>
          <li><strong>K. Rotation:</strong> rotate one key with the create → verify → deactivate → delete cycle.</li>
          <li><strong>L. Leak drill:</strong> time yourself: deactivate → CloudTrail lookup → delete in under 10 minutes.</li>
          <li><strong>Z. Verify checkpoints:</strong> root has MFA + zero keys; all humans have MFA; Analyzer shows zero ACTIVE critical findings; CI uses OIDC with no stored keys.</li>
        </ol>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE] This lab is free</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            IAM users, MFA, policies, boundaries, Access Analyzer, and OIDC federation have no per-use charge. The only cost is your time.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>SSO-first:</strong> humans via Identity Center with short sessions; no static keys except break-glass.</li>
          <li><strong>Roles for everything else:</strong> EC2 instance profiles, Lambda execution roles, OIDC CI roles — keys nowhere.</li>
          <li><strong>Monthly access review:</strong> Analyzer findings + last-accessed report drive the trim-PR every sprint.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>Admin* for convenience:</strong> one compromised token owns the account. Scope deploy roles to named resources.</li>
          <li><strong>MFA on root only:</strong> attackers phish the non-MFA human instead. Every human, every time.</li>
          <li><strong>OIDC trust too wide (repo:*):</strong> any branch or fork can assume the role. Pin sub to repo + ref.</li>
          <li><strong>Deactivating the wrong key in a panic:</strong> always CloudTrail-lookup first, deactivate leaked first, verify app health before deleting.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Export the credential report and flag every row with mfa_active=false or keys older than 90 days.</li>
          <li>Write the root-lockdown checklist from memory and verify each item in your account.</li>
          <li>Draft a least-privilege policy for a deploy role limited to one service and one repo.</li>
          <li>Explain boundaries vs SCPs in two sentences: who each constrains and where each attaches.</li>
          <li>Read one Access Analyzer finding and write the exact policy trim it justifies.</li>
          <li>Diagram the OIDC flow without looking: JWT → trust policy → STS → 15-minute creds.</li>
          <li>Rotate one credential with zero downtime using the create → verify → deactivate → delete order.</li>
          <li>Run the leak drill timed: deactivate, CloudTrail lookup, delete, and note the blast radius.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
