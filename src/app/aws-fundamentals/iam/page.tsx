import Link from "next/link";
import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="IAM"
      intro="IAM is the bouncer, the guest list, and the security camera of every AWS account: it decides who (or what) can do which action on which resource, and records the answer. Misconfigured IAM causes both breaches and the dreaded AccessDenied at 2 AM — so this lesson builds the full model: principals (users vs roles vs federated identities), policy JSON anatomy, the least-privilege workflow, roles deep dive with trust policies and CI OIDC, MFA plus password policy plus Access Analyzer, and a free lab where you prove allow and deny with your own hands."
      prev={{ href: "/aws-fundamentals/aws-cli", label: "AWS CLI & Console Setup" }}
      next={{ href: "/aws-fundamentals/vpc", label: "VPC" }}
      resources={[
        {
          title: "AWS Documentation — IAM User Guide",
          url: "https://docs.aws.amazon.com/",
          description:
            "The authoritative reference for policies, roles, trust relationships, and access troubleshooting.",
        },
        {
          title: "AWS Architecture Center — Security guidance",
          url: "https://aws.amazon.com/architecture/",
          description:
            "Reference architectures and the Security Pillar showing how IAM fits into well-architected workloads.",
        },
        {
          title: "freeCodeCamp — Learn to Code for Free",
          url: "https://www.freecodecamp.org/",
          description:
            "Free hands-on AWS and cloud-security tutorials that reinforce IAM concepts with extra practice.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Principals: users, roles, and federated identities</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every AWS request carries a <strong>principal</strong> — the identity making the call.
          <strong> IAM users</strong> are long-lived human (or service) identities with persistent
          credentials: passwords for the Console, access keys for the CLI. <strong>Roles</strong>
          are identities with no permanent credentials at all — they are assumed on demand and hand
          out temporary credentials that expire in minutes to hours. <strong>Federated
          identities</strong> let an external identity provider (corporate SSO, Google, or a CI
          system&apos;s OIDC issuer) vouch for someone, so AWS mints short-lived role credentials
          without ever storing a password or key.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`HUMANS (long-lived)                 MACHINES (temporary, preferred)
alice (IAM user + MFA) --+           EC2 instance --\
bob   (SSO federated)   +--> assume --> ROLE --> temp creds (15 min - 12 h)
CI job (OIDC federated) +            Lambda fn ---/
                                             trust policy decides WHO may assume
                                             permissions policy decides WHAT it can do

RULE OF THUMB: humans get SSO/federation, machines get roles, almost nobody
needs a permanent access key. Keys are the exception you justify, not the default.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Users are for the edges:</strong> break-glass admins, a legacy tool that cannot
            assume roles, your personal CLI identity. Everything else — EC2, Lambda, ECS tasks, CI
            jobs — takes a role.
          </li>
          <li>
            <strong>Roles fail closed on expiry:</strong> leaked temporary credentials die on their
            own within hours. Leaked access keys work until someone notices and rotates them, which
            is why roles are the default answer in every design review.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Policy anatomy: Effect, Action, Resource — plus two real examples</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>policy</strong> is a JSON document that answers one question per statement:
          does this principal get to perform this <strong>Action</strong> on this
          <strong> Resource</strong>, with what <strong>Effect</strong> (Allow or Deny), optionally
          under a <strong>Condition</strong>? Statements combine by strict rules: everything is
          denied by default, an explicit Allow opens a door, and an explicit Deny slams it shut no
          matter how many Allows exist. Read the two policies below slowly — the first grants
          scoped read access, the second shows a guardrail-style deny.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOnlyOneBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::lab-bucket-yourname",
        "arn:aws:s3:::lab-bucket-yourname/*"
      ]
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::lab-bucket-yourname/*",
      "Condition": {
        "StringNotEquals": { "s3:x-amz-server-side-encryption": "aws:kms" }
      }
    }
  ]
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Bucket vs object ARNs differ:</strong> ListBucket targets the bucket ARN itself,
            GetObject targets the objects inside (the trailing /*). Forgetting one half is the most
            common reason a &quot;read-only&quot; policy half-works.
          </li>
          <li>
            <strong>Deny beats Allow, always:</strong> the second policy blocks unencrypted uploads
            even for administrators holding full S3 Allows — that is what makes Deny the guardrail
            primitive for compliance rules.
          </li>
          <li>
            <strong>Managed vs inline vs boundaries:</strong> AWS-managed policies (like
            ReadOnlyAccess) are maintained by AWS and reusable; customer-managed policies are your
            versioned, reusable creations; inline policies are embedded in one identity and die with
            it. <strong>Permissions boundaries</strong> sit above all of them as a maximum-privilege
            ceiling — delegated admins can grant anything up to, but never through, the boundary.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Least privilege workflow: deny by default, allow explicitly</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Least privilege</strong> means every identity can do exactly what its job requires
          and nothing more — and the practical workflow is iterative, not prophetic. Start from zero
          (or ReadOnlyAccess), attempt the task, read the <strong>AccessDenied</strong> error to learn
          precisely which action on which resource was missing, grant exactly that, and repeat. The
          error message is the specification: it names the action, the resource, and whether an
          explicit deny or a missing allow caused the failure, so troubleshooting is reading
          comprehension plus CloudTrail, not guesswork.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws s3 ls s3://other-teams-bucket
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=ListObjects --max-items 1 --query "Events[0].{Time:EventTime,User:Username}" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`An error occurred (AccessDenied) when calling the ListObjectsV2 operation: Access Denied
---------------------------------------
|            LookupEvents             |
+--------------+------------------------+
|  Time        |  2026-09-05T10:15:00Z   |
|  User        |  dev-user               |
+--------------+------------------------+
# The denial names the operation (ListObjectsV2) and CloudTrail names the
# caller (dev-user). Missing allow on that bucket = expected. Explicit
# deny in a policy = investigate before "fixing" — denies are guardrails.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Read the denial literally:</strong> the operation plus resource ARN tells you the
            exact Action and Resource to add. Grant that pair, scoped to that ARN — never answer a
            denial with a wildcard while tired.
          </li>
          <li>
            <strong>Use the Policy Simulator before prod:</strong> IAM&apos;s simulator tests any
            identity against any action/resource pair offline, showing which statement allowed or
            denied it. Ten minutes there saves a deploy-day outage.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Roles deep dive: trust policies, instance profiles, CI OIDC</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A role has <strong>two</strong> policies, and confusing them is the classic IAM bug. The
          <strong> trust policy</strong> answers who may assume the role (which account, service, or
          federated provider, under which conditions). The <strong>permissions policy</strong>
          answers what the role may do once assumed. An EC2 server gets role credentials through an
          <strong> instance profile</strong> (a wrapper that hands the instance temporary keys via
          the metadata service — code and SDKs pick them up automatically). A CI job gets them
          through <strong>OIDC federation</strong>: the pipeline presents a signed token from its
          provider, AWS validates it against the trust policy, and mints credentials valid for that
          run only.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowGitHubOIDCFromMainBranch",
      "Effect": "Allow",
      "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
        "StringLike": { "token.actions.githubusercontent.com:sub": "repo:my-org/my-app:ref:refs/heads/main" }
      }
    }
  ]
}`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>NO long-lived keys for machines.</strong> EC2, Lambda, ECS, and CI runners all
            have native role mechanisms — an access key on a server or in pipeline secrets is a
            design smell, not a requirement. If you find one, the fix is a role with a tight trust
            policy, not a better hiding place for the key.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws iam create-role --role-name ec2-app-role --assume-role-policy-document file://trust-ec2.json --query "Role.{Name:RoleName,Id:RoleId}" --output table
aws iam attach-role-policy --role-name ec2-app-role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`--------------------------------
|          CreateRole          |
+---------------+--------------+
|  Id           |  AROAEXAMPLEID1234 |
|  Name         |  ec2-app-role  |
+------------------------------+
# Role created with an EC2 trust policy, then granted S3 read-only.
# Attach it to instances via an instance profile — no keys generated,
# none needed, none to leak.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">MFA, password policy, and Access Analyzer</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Credentials prove identity, but passwords leak and keys get copied — so three mechanisms
          harden the front door. <strong>MFA</strong> (virtual TOTP, hardware key, or passkey)
          makes a stolen password insufficient; require it for Console users and for role
          assumption on sensitive roles via a <strong>Condition on aws:MultiFactorAuthPresent</strong>.
          A strong <strong>password policy</strong> (14+ characters, rotation on compromise signal,
          no reuse) raises the brute-force floor account-wide. <strong>IAM Access Analyzer</strong>
          then audits from the inside: it flags unused permissions, external access to your
          resources, and can even generate a least-privilege policy from real CloudTrail activity.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws iam get-account-password-policy --query "PasswordPolicy.{MinLength:MinimumPasswordLength,Reuse:PasswordReusePrevention,Expire:MaxPasswordAge}" --output table
aws accessanalyzer list-analyzers --query "analyzers[].{Name:name,Status:status}" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-----------------------------------------
|        GetAccountPasswordPolicy       |
+-----------+----------+--------------+
|  Expire   |  MinLength |  Reuse     |
+-----------+----------+--------------+
|  90       |  14        |  24          |
+-----------+----------+--------------+
-----------------------------------------
|           ListAnalyzers               |
+---------------+-----------------------+
|  Name         |  Status               |
+---------------+-----------------------+
|  org-analyzer |  ACTIVE               |
+---------------+-----------------------+
# 14-char minimum with history enforcement, plus an active analyzer
# watching for unused and externally-shared access. Front door hardened.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab: a dev user with scoped S3 access — prove allow and deny</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab [FREE TIER]:</strong> IAM operations are free API calls, so this entire lab
          costs nothing. You create a user with zero permissions, attach the single-bucket read
          policy from this lesson, configure a profile for the user, then prove both halves of
          authorization: the allowed bucket lists successfully, the foreign bucket is denied. That
          allow-plus-deny pair is the whole IAM model in miniature — if both behave as shown, you
          understand policies.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws iam create-user --user-name dev-user
aws iam put-user-policy --user-name dev-user --policy-name s3-one-bucket-read --policy-document file://policy-one-bucket.json
aws iam create-access-key --user-name dev-user --query "AccessKey.AccessKeyId" --output text
aws configure --profile dev-user`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
    "User": { "UserName": "dev-user", "Arn": "arn:aws:iam::123456789012:user/dev-user" }
}
# Custom inline policy attached. Key ID returned (secret saved once).
# Configure the dev-user profile with that key pair, region eu-central-1.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws s3 ls s3://lab-bucket-yourname --profile dev-user
aws s3 ls s3://other-teams-bucket --profile dev-user`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`2026-09-01 12:00:00    1234 app-config.json
An error occurred (AccessDenied) when calling the ListObjectsV2 operation: Access Denied
# ALLOW on your bucket (object listed), DENY everywhere else. Least
# privilege demonstrated empirically — clean up the key when done.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Cost note and the three mistakes that end careers</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The good news first: IAM itself is free — users, groups, roles, policies, MFA, and Access
          Analyzer findings cost nothing, so there is never a budget excuse for sloppy access
          control. The adjacent costs to know about are audit and governance add-ons, not IAM: deep
          CloudTrail data-event logging, CloudTrail Lake retention, and Organization-level security
          services bill separately if you enable them.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>[FREE TIER]</strong> All IAM entities, policy operations, MFA enrollment, and
            the first trail&apos;s management events are free. Practice roles, boundaries, and
            analyzer findings as much as you want.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>[PAID]</strong> Enabling CloudTrail data events (per-100k-event pricing),
            CloudTrail Lake storage, or organization-wide GuardDuty/Security Hub escalates cost with
            account activity. Keep management-event trails (cheap, essential) separate from
            data-event trails (expensive, opt-in per bucket/table).
          </p>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Mistake — AKIA keys on GitHub:</strong> the number-one cloud breach starter.
            Bots test leaked keys in minutes. Prevention is roles plus pre-commit secret scanning;
            response is deactivate, delete, rotate, then read CloudTrail for what the key touched.
          </li>
          <li>
            <strong>Mistake — AdministratorAccess everywhere:</strong> one policy on every human and
            role &quot;to stop the errors.&quot; It stops the errors and starts the blast radius —
            every compromised credential becomes total account control.
          </li>
          <li>
            <strong>Mistake — root for daily work:</strong> root actions bypass every policy and
            leave the weakest audit trail. Root signs in for billing emergencies and account
            closure; everything else is a named identity with MFA.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Identities secured, the next boundary is the network itself:{" "}
          <Link href="/aws-fundamentals/vpc" className="underline underline-offset-4">
            VPC
          </Link>
          , where these principals meet subnets and security groups.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create a dev-user with zero attached policies and confirm every action is denied by default.</li>
          <li>Write the single-bucket S3 read-only policy from this lesson as JSON and attach it to dev-user.</li>
          <li>Prove least privilege empirically: list the allowed bucket successfully and collect an AccessDenied on a foreign one.</li>
          <li>Create a role with an EC2 trust policy, attach a read-only managed policy, and explain the trust-vs-permissions split aloud.</li>
          <li>Draft an OIDC trust policy for a CI pipeline scoped to one repo and one branch, and state why no stored key is needed.</li>
          <li>Enable MFA on your admin user and set a 14-character-minimum password policy with reuse prevention.</li>
          <li>Run Access Analyzer, read one unused-access finding, and trim the corresponding policy to match real usage.</li>
          <li>Simulate a leaked key end-to-end: deactivate it, delete it, create a replacement, and list what you would check in CloudTrail.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
