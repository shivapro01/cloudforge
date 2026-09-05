import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Security (DevSecOps)"
      title="Start Here"
      intro="Most breaches are not zero-days — they are an open S3 bucket, a leaked access key on GitHub, or a root account with no MFA. Security in DevOps (DevSecOps) means baking guardrails into every step so the fast way is also the safe way. This module hardens identity, encrypts data, defends the network, detects threats, and scans in CI — in that order."
      prev={{ href: "/security", label: "Security (DevSecOps)" }}
      next={{ href: "/security/identity-access", label: "Identity & Access Hardening" }}
      resources={[
        {
          title: "AWS Shared Responsibility Model",
          url: "https://docs.aws.amazon.com/well-architected/latest/security-pillar/security-foundations-shared-responsibility-model.html",
          description:
            "Official diagram of what AWS secures (of the cloud) vs what you secure (in the cloud) — the mental model for this whole module.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm which security services have free tiers or trials (GuardDuty 30-day trial, WAF request pricing) before you enable anything.",
        },
        {
          title: "DevSecOps roadmap — roadmap.sh",
          url: "https://roadmap.sh/devsecops",
          description:
            "Visual DevSecOps roadmap — where IAM, secrets, WAF, monitoring, and pipeline scanning fit in a DevOps career.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Shared responsibility: what AWS owns vs what you own</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          AWS secures <strong>of</strong> the cloud (data centers, hypervisors,
          managed-service patching). You secure <strong>in</strong> the cloud
          (your IAM users, security groups, S3 bucket policies, keys, secrets,
          app code, pipeline). Every breach in this module&apos;s scope is on
          the customer side of the line — which is good news, because every fix
          is in your control.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`SHARED RESPONSIBILITY — where the line sits
+==============================================================+
|  AWS ("OF" the cloud)          |  YOU ("IN" the cloud)       |
+-------------------------------+------------------------------+
|  Physical data centers        |  IAM users / roles / MFA    |
|  Network hardware, hosts      |  Security groups, NACLs     |
|  Hypervisor isolation         |  S3 bucket policies, KMS    |
|  Managed-service patching     |  Secrets, keys, passwords   |
|  (RDS OS, Lambda runtime)     |  App code + dependencies    |
|                               |  Pipeline + deploy approvals|
+==============================================================+
  Examples:  AWS patches the RDS host OS ... YOU enable RDS encryption,
  rotate the DB password, and lock the SG to private subnets.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DevOps use:</strong> every Terraform module you write is a
            customer-side control — <strong>SG ingress, S3 public-access block,
            KMS key, IAM policy</strong>. Infra-as-code is how you prove the
            line is held.
          </li>
          <li>
            <strong>IAM is always yours:</strong> AWS never creates your users,
            roles, or policies. A wildcard <strong>*</strong> policy is your
            bug, not theirs.
          </li>
          <li>
            <strong>Data protection is always yours:</strong> AWS offers KMS,
            TLS, and encrypted EBS/RDS — but you must turn them on and manage
            who can decrypt.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">CIA triad, translated for DevOps</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Confidentiality, Integrity, Availability</strong> sounds
          academic until you map each leg to a pipeline control. If one leg
          breaks, deployments stop or data leaks — both are DevOps failures.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`CIA TRIAD FOR DEVOPS
              CONFIDENTIALITY
             (only the right
              eyes can read)
             / MFA + roles  \\
            / KMS + secrets \\
           / TLS everywhere  \\
          +-------------------+
          | INTEGRITY         |----->  AVAILABILITY
          | (nobody silently  |        (ship + stay up)
          |  changes things)  |        / WAF + Shield  \\
          | - signed commits  |       / multi-AZ +     \\
          | - image digests   |      / backups +       \\
          | - branch protect  |     / rollback plan    \\
          | - tfsec in CI     |    +-------------------+
          +-------------------+`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Confidentiality:</strong> MFA on humans, IAM roles (not
            keys) for machines, KMS encryption at rest, TLS in transit, secrets
            in Secrets Manager — never in Git or env files.
          </li>
          <li>
            <strong>Integrity:</strong> branch protection + PR reviews, signed
            commits, pinned image digests (not <strong>:latest</strong>),
            tfsec/checkov gates so bad Terraform never merges.
          </li>
          <li>
            <strong>Availability:</strong> WAF rate-limits bots, Shield absorbs
            DDoS, multi-AZ + snapshots survive failure, rollback plan ships the
            fix fast.
          </li>
          <li>
            <strong>DevOps use:</strong> map every incident retro to a triad
            leg — leaked key (C), tampered deploy (I), DDoS outage (A) — so the
            fix lands in the right lesson.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Module 01–08 security threads recap</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You have already touched every security control in this module — just
          scattered. This module collects the threads and hardens them properly.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Module 02 Linux/SSH:</strong> key pairs, <strong>chmod
            400</strong>, no password SSH. Thread → Lesson 2 (credential hygiene:
            keys are secrets, rotate them, never commit <strong>*.pem</strong>).
          </li>
          <li>
            <strong>Module 04 AWS fundamentals:</strong> IAM users, root
            lockdown, MFA basics. Thread → Lesson 2 (permission boundaries,
            SCPs, Access Analyzer, OIDC for CI).
          </li>
          <li>
            <strong>Module 05 EC2 networking:</strong> security groups, NACLs,
            public vs private subnets. Thread → Lesson 4 (layered defense
            SG → NACL → WAF → Shield).
          </li>
          <li>
            <strong>Module 06 S3:</strong> Block Public Access, bucket policies,
            SSE-S3 vs SSE-KMS. Thread → Lesson 3 (envelope encryption,
            DSSE, Secrets Manager vs SSM).
          </li>
          <li>
            <strong>Module 07 Terraform:</strong> state files contain secrets;
            plan/apply needs least-privilege CI roles. Thread → Lesson 6
            (tfsec/checkov + OPA gates in the pipeline).
          </li>
          <li>
            <strong>Module 08 CI/CD:</strong> GitHub secrets, OIDC into AWS,
            branch protection. Thread → Lesson 6 (secret scanning, Dependabot,
            signed and scanned images).
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">Danger: the top-3 breach patterns in student accounts</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-red-700 dark:text-red-300">
            <li>Long-lived IAM access keys pasted into GitHub / Discord / .env pushed to a public repo.</li>
            <li>S3 bucket or security group opened to 0.0.0.0/0 &quot;temporarily&quot; and forgotten.</li>
            <li>Root account with no MFA holding the only billing access — one phish from total loss.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Module path: the 6 lessons in order</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Security layers build inside-out: identity first (who can act), then
          data (what they can read), then network (how traffic reaches you),
          then detection (who notices attacks), then pipeline (how safety becomes
          automatic). Do them in order.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>1. Start Here (this page):</strong> shared responsibility, CIA triad, recap, path.</li>
          <li><strong>2. Identity &amp; Access Hardening:</strong> MFA everywhere, root lockdown, boundaries, SCPs, OIDC, key drill.</li>
          <li><strong>3. KMS, Secrets &amp; Encryption:</strong> envelope encryption, SSE variants, Secrets Manager rotation, TLS.</li>
          <li><strong>4. WAF, Shield &amp; Network Defense:</strong> layered defense, WAF rules, Shield Standard vs Advanced, private subnets.</li>
          <li><strong>5. GuardDuty, Inspector &amp; Security Hub:</strong> detect, scan, aggregate, and run the incident runbook.</li>
          <li><strong>6. Security in the Pipeline:</strong> tfsec/checkov, image scans, Dependabot, secret scanning, policy gates.</li>
        </ol>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`LEARNING PATH (inside-out)
 Lesson 2 IDENTITY        Lesson 3 DATA           Lesson 4 NETWORK
 [ who can act ]  -----> [ what they can read ] -> [ how traffic flows ]
        |                        |                        |
        v                        v                        v
 Lesson 5 DETECTION <---- Lesson 6 PIPELINE (automate all of it)
 [ who notices ]          [ shift-left: scan every commit]`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Guardrails over gates:</strong> SCPs + permission
            boundaries + WAF managed rules run by default, so developers move
            fast inside a safe sandbox instead of filing tickets.
          </li>
          <li>
            <strong>Everything in code:</strong> IAM policies, KMS keys, WAF
            rules, and GuardDuty enablement live in Terraform — reviewed,
            versioned, and scanned before apply.
          </li>
          <li>
            <strong>Blast-radius thinking:</strong> every design answer starts
            with &quot;if this leaks/breaks, what is exposed?&quot; — then adds
            encryption, isolation, rotation, and rollback accordingly.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Treating security as the last lesson:</strong> bolting WAF
            and encryption on after the breach. Shift every control left into
            code and CI from day one.
          </li>
          <li>
            <strong>Hardcoding secrets &quot;just for now&quot;:</strong>{" "}
            temporary keys in code become permanent leaks. Use roles, OIDC, and
            secret stores from the first commit.
          </li>
          <li>
            <strong>Wildcard IAM to &quot;save time&quot;:</strong>{" "}
            <strong>Action: * on Resource: *</strong> turns one compromised key
            into a full-account takeover.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (6 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the shared-responsibility line from memory: list 3 AWS-owned and 5 you-owned items.</li>
          <li>Map one past lab each to Confidentiality, Integrity, and Availability.</li>
          <li>Run aws sts get-caller-identity and aws iam get-account-password-policy; note whether MFA and root need attention.</li>
          <li>Find one wildcard (*) IAM policy, one 0.0.0.0/0 SG rule, and one unencrypted bucket in your account — write them down to fix in Lessons 2–4.</li>
          <li>Check the Free Tier page: which security services are free vs trial vs paid before you enable them.</li>
          <li>Schedule the module: one day each for identity, data, network, detection, pipeline, plus a teardown review.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
