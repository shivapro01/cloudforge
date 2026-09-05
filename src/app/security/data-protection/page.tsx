import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Security (DevSecOps)"
      title="KMS, Secrets & Encryption"
      intro="Encryption is not a checkbox — it is who can decrypt, where keys live, and how secrets rotate without downtime. This lesson traces envelope encryption in KMS, picks the right S3/EBS/RDS encryption mode, stores secrets in the right service, rotates them safely, and closes with TLS everywhere."
      prev={{ href: "/security/identity-access", label: "Identity & Access Hardening" }}
      next={{ href: "/security/network-security", label: "WAF, Shield & Network Defense" }}
      resources={[
        {
          title: "KMS developer guide — AWS docs",
          url: "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html",
          description:
            "Envelope encryption, key types, grants, and rotation — the core model behind every example on this page.",
        },
        {
          title: "Secrets Manager user guide — AWS docs",
          url: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html",
          description:
            "Rotation, pricing per secret, and when to choose Secrets Manager over SSM Parameter Store.",
        },
        {
          title: "S3 default encryption FAQ — AWS docs",
          url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html",
          description:
            "SSE-S3 vs SSE-KMS vs DSSE-S3 compared officially — read this before picking a bucket default.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Envelope encryption: the one diagram to memorize</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          KMS never encrypts your gigabytes directly. It encrypts a small{" "}
          <strong>data key</strong>, and the data key encrypts your data. The
          encrypted data key travels with the object; KMS only decrypts it for
          authorized callers. Compromise the data, keys stay safe; revoke the
          KMS grant, data goes dark instantly.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`ENVELOPE ENCRYPTION (KMS)
 ENCRYPT side                          DECRYPT side
 +----------+   GenerateDataKey   +-----------+   data key encrypts   +--------+
 | YOUR APP | ------------------> | KMS key   | --------------------> |  DATA  |
 |          | <------------------ | (CMK)     |   cipher + EDEK       | object |
 +----------+  plaintext DEK +     +-----------+   stored together     +--------+
                encrypted DEK (EDEK)
                                                     caller needs kms:Decrypt
                                                     on THAT key + S3/EC2 perms
                                                     -> revoke grant = instant lockout`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>AWS-managed vs customer-managed keys:</strong> AWS-managed
            (aws/s3, aws/ebs) are free and automatic; customer-managed (CMK)
            give you rotation control, aliases, cross-account grants, and
            CloudTrail per-key audit — use CMKs for prod data.
          </li>
          <li>
            <strong>DevOps use:</strong> one CMK per environment (
            <strong>alias/shop-prod</strong>), Terraform-managed with{" "}
            <strong>enable_key_rotation = true</strong>; apps reference the
            alias, never the key ID.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="kms-prod-key.tf"
            code={`resource "aws_kms_key" "prod" {
  description             = "shop prod data key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_kms_alias" "prod" {
  name          = "alias/shop-prod"
  target_key_id = aws_kms_key.prod.key_id
}`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">SSE-S3 vs SSE-KMS vs DSSE: S3 + EBS + RDS</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          All three encrypt at rest; they differ in <strong>who holds the key,
          what is audited, and what it costs</strong>. Default to SSE-S3 for
          bulk objects, SSE-KMS (CMK) for sensitive data needing audit and
          per-key control, DSSE only when two encryption layers are mandated.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# S3: set default encryption variants
aws s3api put-bucket-encryption --bucket shop-assets --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-bucket-encryption --bucket shop-pii --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms","KMSMasterKeyID":"alias/shop-prod"}}]}'
aws s3api get-bucket-encryption --bucket shop-pii

# EBS: encryption by default + CMK
aws ec2 enable-ebs-encryption-by-default
aws ec2 modify-ebs-default-kms-key-id --kms-key-id alias/shop-prod
aws ec2 describe-volumes --query 'Volumes[*].[VolumeId,Encrypted,KmsKeyId]' --output table

# RDS: encrypted instance (must be set at creation)
aws rds create-db-instance --db-instance-identifier shop-prod --engine postgres --db-instance-class db.t3.micro --allocated-storage 20 --storage-encrypted --kms-key-id alias/shop-prod --master-username admin --master-user-password 'REPLACE-ME'
aws rds describe-db-instances --db-instance-identifier shop-prod --query 'DBInstances[*].[DBInstanceIdentifier,StorageEncrypted,KmsKeyId]' --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# get-bucket-encryption (shop-pii):
{"SSEAlgorithm": "aws:kms", "KMSMasterKeyID": "alias/shop-prod"}   # sensitive bucket -> CMK, audited
# describe-volumes:
| vol-0abc | True | alias/shop-prod |     # EBS default now encrypted, no unencrypted volumes
# describe-db-instances:
| shop-prod | True | alias/shop-prod |     # RDS encrypted at rest; snapshots inherit it`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>SSE-S3 (AES256):</strong> AWS-managed keys, free, no
            CloudTrail per-object key usage. Use for logs, assets, build
            artifacts.
          </li>
          <li>
            <strong>SSE-KMS:</strong> CMK control + per-request CloudTrail +
            cross-account grants; small per-request KMS charge. Use for PII,
            backups, Terraform state.
          </li>
          <li>
            <strong>DSSE-S3 (dual-layer):</strong> two independent encryption
            layers for compliance regimes that demand it. Higher request cost —
            do not default to it.
          </li>
          <li>
            <strong>EBS/RDS rule:</strong> enable EBS encryption-by-default
            once per region; RDS encryption is create-time only — to encrypt an
            old instance, snapshot → copy with KMS → restore.
          </li>
          <li>
            <strong>DevOps use:</strong> Terraform enforces bucket encryption +
            public-access block on every bucket; state bucket is always SSE-KMS
            with versioning.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Secrets Manager vs SSM Parameter Store</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Both store secrets; only one rotates them for you. Use{" "}
          <strong>Secrets Manager</strong> for credentials that must rotate
          (DB passwords, API keys), <strong>SSM SecureString</strong> for
          rarely-changing config (feature flags, non-rotating tokens).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Secrets Manager: create + rotate (Lambda does the swap)
aws secretsmanager create-secret --name shop/prod/db --secret-string '{"username":"admin","password":"REPLACE-ME"}' --kms-key-id alias/shop-prod
aws secretsmanager rotate-secret --secret-id shop/prod/db --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789012:function:SecretsRotate --rotation-rules '{"AutomaticallyAfterDays": 30}'
aws secretsmanager get-secret-value --secret-id shop/prod/db --query SecretString --output text

# SSM SecureString: cheap static config
aws ssm put-parameter --name /shop/prod/stripe-key --type SecureString --key-id alias/shop-prod --value 'REPLACE-ME' --overwrite
aws ssm get-parameter --name /shop/prod/stripe-key --with-decryption --query Parameter.Value --output text

# Cleanup matters: secrets bill monthly even if unused
aws secretsmanager delete-secret --secret-id shop/prod/old-experiment --force-delete-without-recovery`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{"ARN": "arn:aws:secretsmanager:us-east-1:123456789012:secret:shop/prod/db-Ab12Cd"}
RotationSchedule: 30 days, status OK   # next rotation automatic, app reloads via SDK
/ssm: "sk_live_... (decrypted for authorized role only)"
Deleted shop/prod/old-experiment       # stops the monthly charge immediately`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID] Secrets Manager ≈ $0.40 / secret / month + API calls</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            Each secret bills monthly whether you read it or not, plus rotation
            Lambda invocations. Keep 1–3 secrets per environment, delete
            experiments immediately, and prefer SSM SecureString (free tier) for
            static config. Count your secrets before the lab.
          </p>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Never in code:</strong> apps fetch at runtime via SDK with
            the execution role — no env files with passwords, no secrets in
            Terraform state outputs.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">TLS everywhere: ACM recap</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Data in transit is encrypted with TLS; ACM gives you free public
          certificates with auto-renewal. Terminate TLS at the ALB/CloudFront,
          redirect HTTP → HTTPS, and keep internal hops in private subnets.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws acm request-certificate --domain-name shop.example.com --subject-alternative-names '*.shop.example.com' --validation-method DNS --query CertificateArn --output text
aws acm describe-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/abc --query 'Certificate.[Status,RenewalStatus]' --output table
curl -sSI https://shop.example.com | head -5   # expect 200 + strict-transport-security`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`arn:aws:acm:us-east-1:123456789012:certificate/abc
| ISSUED | AUTO_RENEWED |     # DNS-validated, renews itself
HTTP/2 200 ... strict-transport-security: max-age=31536000  # HTTPS enforced`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A–Z: encrypt + rotate [FREE except secrets count]</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          KMS, S3/EBS encryption, SSM, and ACM are free-tier friendly. Secrets
          Manager is the only meter — use exactly one secret and delete it at
          the end.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>A. Key:</strong> create a CMK + alias/shop-lab with rotation on; describe-key to confirm.</li>
          <li><strong>B. S3 SSE-S3:</strong> make shop-assets-lab, set AES256 default, upload a file, verify encryption header.</li>
          <li><strong>C. S3 SSE-KMS:</strong> make shop-pii-lab with alias/shop-lab default; confirm get-bucket-encryption shows aws:kms.</li>
          <li><strong>D. Deny unencrypted:</strong> attach a bucket policy denying PutObject without SSE-KMS; verify a plain upload fails.</li>
          <li><strong>E. EBS:</strong> enable encryption-by-default; launch a t3.micro volume and confirm Encrypted=True.</li>
          <li><strong>F. RDS (describe-only if costly):</strong> describe one instance&apos;s StorageEncrypted flag; plan the snapshot-copy-restore path for unencrypted ones.</li>
          <li><strong>G. SSM:</strong> store /shop/lab/token as SecureString; read it back with --with-decryption as the right role only.</li>
          <li><strong>H. Secret:</strong> create ONE Secrets Manager secret; enable 30-day rotation schedule (Lambda stub ok).</li>
          <li><strong>I. App read:</strong> fetch the secret via CLI as the app role; confirm no secret appears in shell history files.</li>
          <li><strong>J. TLS:</strong> request/validate an ACM cert (or inspect an existing one); curl -sSI to confirm HSTS.</li>
          <li><strong>K. Cleanup:</strong> delete the ONE secret + lab buckets/volumes; list-secrets must return empty.</li>
          <li><strong>Z. Verify checkpoints:</strong> no unencrypted volumes; PII bucket is SSE-KMS; zero leftover Secrets Manager secrets; TLS returns 200 + HSTS.</li>
        </ol>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE except secrets count] Lab cost guardrail</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            Everything here is free except Secrets Manager billing per secret per
            month. Create exactly one secret, finish the lab the same day, and
            delete it — your bill stays at $0.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>Encrypt by default, audit by exception:</strong> org policy denies unencrypted S3/EBS/RDS; Security Hub flags drift.</li>
          <li><strong>Separate keys per blast radius:</strong> prod vs dev vs backups — revoking one never blacks out the others.</li>
          <li><strong>Rotate without deploys:</strong> apps cache secrets with TTL and re-fetch; rotation never needs a restart window.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>SSE-S3 for PII and calling it done:</strong> no per-key audit, no per-secret revocation. PII needs CMK.</li>
          <li><strong>Secrets in env files / Terraform outputs:</strong> both leak into Git, logs, and state. Fetch at runtime via roles.</li>
          <li><strong>Forgetting experiments:</strong> each leftover secret bills $0.40/mo forever. Delete on teardown day.</li>
          <li><strong>Encrypting RDS after launch by wishing:</strong> create-time only — snapshot, copy with KMS, restore.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw envelope encryption from memory: data key vs KMS key, EDEK placement, revoke path.</li>
          <li>Write the one-line rule for when to use SSE-S3 vs SSE-KMS vs DSSE.</li>
          <li>Set SSE-KMS default on a bucket and prove an unencrypted PutObject is denied.</li>
          <li>Enable EBS encryption-by-default and confirm a new volume is encrypted.</li>
          <li>Document the 3-step path to encrypt an existing unencrypted RDS instance.</li>
          <li>Store one value in SSM SecureString and one in Secrets Manager; justify each placement.</li>
          <li>Rotate a lab secret and confirm the app picks it up without a redeploy.</li>
          <li>Delete all lab secrets and buckets;screenshot list-secrets returning empty as your receipt.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
