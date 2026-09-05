import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="S3"
      intro="S3 is infinite object storage and the backbone of almost every DevOps workflow — deploy artifacts, Terraform state, logs, backups, and static sites all live here. Master buckets, keys, storage classes, versioning, encryption, and locked-down access before you trust it with anything production."
      prev={{ href: "/aws-fundamentals/elb-auto-scaling", label: "ELB + Auto Scaling" }}
      next={{ href: "/aws-fundamentals/cloudfront-acm", label: "CloudFront + ACM" }}
      resources={[
        {
          title: "AWS Free Tier — S3",
          url: "https://aws.amazon.com/free/",
          description:
            "Free Tier limits for S3: 5GB Standard storage, 20,000 GETs, 2,000 PUTs — map every lab command to these quotas.",
        },
        {
          title: "S3 Documentation",
          url: "https://docs.aws.amazon.com/s3/",
          description:
            "Official reference for buckets, keys, versioning, encryption, lifecycle, replication, and presigned URLs.",
        },
        {
          title: "FreeCodeCamp — AWS S3 crash course",
          url: "https://www.freecodecamp.org/",
          description:
            "Free hands-on walkthroughs of buckets, policies, and static website hosting to reinforce this lesson.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. Buckets, objects, keys, and ARNs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          S3 stores <strong>objects</strong> (a file + metadata, up to 5TB each) inside{" "}
          <strong>buckets</strong> (flat containers, not folders). Every object is addressed by its{" "}
          <strong>key</strong> — the full path-like string such as{" "}
          <code>artifacts/app/v1.4.2/build.zip</code>. Slashes are cosmetic: there are no real
          directories, only key prefixes that the console renders as folders. That matters because
          key design is your query strategy — prefix <code>logs/2026/09/05/</code> lets you list
          one day without scanning millions of objects.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Bucket names are <strong>globally unique across all AWS accounts</strong> —{" "}
          <code>app-logs</code> is taken, <code>acme-app-logs-us-east-1-4123</code> is not. Pick{" "}
          <code>company-purpose-region-random</code> (lowercase, hyphens, no underscores) and treat
          the name as permanent: you can delete and recreate, but DNS-style addressing means old
          names linger in caches. Buckets live in <strong>one region</strong> you choose at creation
          (data never leaves unless you replicate it), yet the namespace is global, so creation
          checks every region. The ARN form is{" "}
          <code>arn:aws:s3:::my-bucket/key/path</code> — bucket ARNs end at the name, object ARNs
          append <code>/key</code>, and IAM policies match on exactly that split.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`bucket "acme-artifacts-us-east-1-7f3a"  (region: us-east-1, global-unique name)
│
├── artifacts/app/v1.4.2/build.zip      ← object: key + bytes + metadata
├── artifacts/app/v1.4.3/build.zip
├── terraform/prod/terraform.tfstate    ← key prefix "terraform/prod/" acts as "folder"
└── logs/2026/09/05/alb-access.log

addressing:  https://<bucket>.s3.<region>.amazonaws.com/<key>
ARN bucket:  arn:aws:s3:::acme-artifacts-us-east-1-7f3a
ARN object:  arn:aws:s3:::acme-artifacts-us-east-1-7f3a/artifacts/app/*`}
          />
        </div>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Storage classes: pay for access pattern, not bytes</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>S3 Standard</strong> is the default: millisecond access, 11×9s durability, highest
          price — hot artifacts, active state, current logs. <strong>Standard-IA</strong> (Infrequent
          Access) is ~45% cheaper per GB but charges per-GB retrieval: backups you restore a few
          times a year. <strong>Glacier Instant / Flexible / Deep Archive</strong> trades retrieval
          time (ms → minutes → 12–48h) for pennies-per-GB: compliance archives you legally must keep
          but hope to never read. <strong>Intelligent-Tiering</strong> watches access per object and
          moves it between tiers automatically for a small monitoring fee — the safe default when
          access patterns are unknown or mixed.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`object age ──────────────────────────────────────────▶ time

Standard (days 0–30, hot)
   │  lifecycle rule: transition after 30d
   ▼
Standard-IA (days 30–90, warm, cheaper + retrieval fee)
   │  lifecycle rule: transition after 90d
   ▼
Glacier Flexible (days 90–365, cold, minutes retrieval)
   │  lifecycle rule: transition after 365d
   ▼
Glacier Deep Archive (1yr+, frozen, 12–48h retrieval, cheapest)

Intelligent-Tiering shortcut: one class, S3 auto-moves objects
Frequent ↔ Infrequent ↔ Archive tiers (no lifecycle rules to write)`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Rule of thumb: Standard for anything deployed or read weekly; Intelligent-Tiering for logs
          and user uploads with unpredictable reads; explicit lifecycle to IA → Glacier for ageing
          data; Deep Archive only for retain-7-years compliance. Never put Terraform state in
          Glacier — a 12-hour retrieval turns every <code>terraform plan</code> into an outage.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Versioning, encryption, and Block Public Access</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Versioning</strong> keeps every overwrite as a separate version ID — delete{" "}
          <code>terraform.tfstate</code> by accident and you restore yesterday&apos;s version
          instead of rebuilding infrastructure by hand. Enable it on day one for any stateful
          bucket; it is off by default and cannot retroactively recover pre-enable overwrites. Cost
          is one object per version, so pair it with a lifecycle rule expiring noncurrent versions
          after 30–90 days.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Encryption:</strong> <code>SSE-S3</code> (AES-256, AWS-managed keys, zero setup —
          the default on all new buckets) vs <code>SSE-KMS</code> (your KMS key, per-request KMS
          charges, CloudTrail audit of every decrypt, required for compliance or cross-account
          control). Use SSE-S3 unless audit or key-rotation policy forces KMS. In transit, always
          HTTPS — bucket policies should deny <code>aws:SecureTransport: false</code>.
        </p>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            DANGER — a public bucket is a breach headline, not a hosting shortcut.
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            S3 Block Public Access (account + bucket level, ON by default) overrides any ACL or
            policy that would expose objects. Never turn it off globally — keep all four switches ON
            and open only the narrow path you need (CloudFront OAC for a website, or explicit object
            ACLs). Public leaks get scraped by bots within minutes and billed to you via data
            transfer.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Harden a new bucket: versioning + SSE-S3 + all public access blocked
aws s3api put-bucket-versioning --bucket acme-artifacts-7f3a \\
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption --bucket acme-artifacts-7f3a \\
  --server-side-encryption-configuration \\
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws s3api put-public-access-block --bucket acme-artifacts-7f3a \\
  --public-access-block-configuration \\
  '{"BlockPublicAcls":true,"IgnorePublicAcls":true,"BlockPublicPolicy":true,"RestrictPublicBuckets":true}'`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Two patterns: static website vs private artifacts</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Pattern A — public static website</strong> (docs, marketing pages): enable static
          website hosting, serve via CloudFront + OAC (next lesson), never via direct public bucket
          policy. <strong>Pattern B — private artifacts</strong> (build zips, tfstate, logs, Beyond
          the default): bucket stays fully private; humans and CI get short-lived{" "}
          <strong>presigned URLs</strong> (signed GET/PUT valid for minutes–hours) instead of IAM
          keys or public links. Presigned URLs are the DevOps handshake: CI uploads a build with a
          15-minute PUT URL, a deploy job downloads it with a 5-minute GET URL, nothing is ever
          public.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Private artifact flow: upload, then mint a 5-minute download link
aws s3 cp build.zip s3://acme-artifacts-7f3a/artifacts/app/v1.4.3/build.zip \\
  --storage-class STANDARD

aws s3 presign s3://acme-artifacts-7f3a/artifacts/app/v1.4.3/build.zip --expires-in 300
# share the URL, not the bucket: it dies after 5 minutes`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`upload: ./build.zip to s3://acme-artifacts-7f3a/artifacts/app/v1.4.3/build.zip
https://acme-artifacts-7f3a.s3.amazonaws.com/artifacts/app/v1.4.3/build.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA...%2F20260905%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Expires=300&X-Amz-Signature=9f2c...
# curl that URL within 300s → 200 + bytes; after expiry → 403 SignatureDoesNotMatch`}
          />
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Lifecycle, replication, and CORS</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lifecycle rules</strong> automate the storage-class diagram in section 2: transition
          current versions Standard → Standard-IA at 30d → Glacier at 90d, expire noncurrent
          versions at 60d, and abort incomplete multipart uploads after 7 days (failed 5GB uploads
          otherwise bill forever as phantom parts). One JSON rule replaces a quarterly manual
          cleanup ticket. <strong>Replication</strong> (CRR across regions for disaster recovery,
          SRR same-region for log aggregation) copies new objects to a second bucket — requires
          versioning on both sides and an IAM replication role; use it for tfstate DR, not for
          everyday artifacts.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>CORS</strong> matters the moment JavaScript in a browser touches S3 directly
          (frontend uploading to a bucket, or fetching fonts/JSON cross-origin). Without a CORS
          rule allowing your domain + methods, the browser blocks the request even though{" "}
          <code>curl</code> succeeds — the classic &quot;works in terminal, fails in app&quot;
          confusion. Scope <code>AllowedOrigins</code> to your exact domains, never{" "}
          <code>*</code> with credentials.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Lifecycle: IA at 30d, Glacier at 90d, kill old versions + orphaned uploads
aws s3api put-bucket-lifecycle-configuration --bucket acme-artifacts-7f3a \\
  --lifecycle-configuration '{"Rules":[{"ID":"age-out","Status":"Enabled",
    "Filter":{"Prefix":"logs/"},
    "Transitions":[{"Days":30,"StorageClass":"STANDARD_IA"},{"Days":90,"StorageClass":"GLACIER"}],
    "NoncurrentVersionExpiration":{"NoncurrentDays":60},
    "AbortIncompleteMultipartUpload":{"DaysAfterInitiation":7}}]}'

# CORS: only your frontend may PUT/GET via browser JS
aws s3api put-bucket-cors --bucket acme-artifacts-7f3a --cors-configuration \\
  '{"CORSRules":[{"AllowedOrigins":["https://app.example.com"],
    "AllowedMethods":["GET","PUT"],"AllowedHeaders":["*"],"MaxAgeSeconds":3000}]}'`}
          />
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Full lab [FREE TIER]: versioned bucket via CLI</h2>
        <div className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — 5GB Standard storage + 20,000 GETs + 2,000 PUTs for 12 months.
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            This lab uses ~3 tiny objects and a dozen requests — far under every quota. Stay in one
            region, keep objects under 1MB, and delete the bucket at the end to stay at $0.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. Make a global-unique bucket + enable versioning
aws s3 mb s3://acme-lab-s3-$USER-7f3a --region us-east-1
aws s3api put-bucket-versioning --bucket acme-lab-s3-$USER-7f3a \\
  --versioning-configuration Status=Enabled

# 2. Upload two versions of the same key
echo "v1" > app.conf
aws s3 cp app.conf s3://acme-lab-s3-$USER-7f3a/config/app.conf
echo "v2" > app.conf
aws s3 cp app.conf s3://acme-lab-s3-$USER-7f3a/config/app.conf

# 3. List objects + versions
aws s3 ls s3://acme-lab-s3-$USER-7f3a/config/ --recursive
aws s3api list-object-versions --bucket acme-lab-s3-$USER-7f3a --prefix config/ \\
  --query "Versions[*].[Key,VersionId,IsLatest]" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`make_bucket: acme-lab-s3-shiva-7f3a
upload: ./app.conf to s3://acme-lab-s3-shiva-7f3a/config/app.conf
upload: ./app.conf to s3://acme-lab-s3-shiva-7f3a/config/app.conf
2026-09-05 10:01:12         3 config/app.conf
-------------------------------------------
|           ListObjectVersions            |
+--------------+------------------+----------+
| config/app.conf |  abc111VersionID | True     |
| config/app.conf |  xyz000VersionID | False    |
-------------------------------------------
# Two versions, one key: IsLatest=True is v2, False is recoverable v1`}
          />
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. What it costs + how DevOps actually uses S3</h2>
        <div className="mt-2 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            [PAID] — requests beyond free tier, data transfer OUT, and Glacier retrievals.
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Storage is cheap; movement is not. PUT/GET/LIST beyond 2,000/20,000 per month bill per
            thousand, data transfer OUT to the internet (~$0.09/GB after the 100GB free tier) dwarfs
            storage on popular downloads, and Glacier/Deep Archive charge per-GB retrieval plus
            per-request fees. Never lifecycle Terraform state or active artifacts into Glacier, and
            serve repeated downloads through CloudFront instead of raw S3 URLs.
          </p>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps uses:</strong> (1) <strong>CI artifacts</strong> — every green build pushes{" "}
          <code>artifacts/app/&lt;sha&gt;/build.zip</code> with a presigned URL the deploy stage
          consumes; immutable keys make rollbacks trivial. (2) <strong>Terraform state</strong> —
          one private versioned SSE-S3/KMS bucket + DynamoDB lock table per environment; versioning
          is your undo button for corrupt state. (3) <strong>Logs & backups</strong> — ALB access
          logs, CloudTrail trails, and nightly DB dumps land via lifecycle into IA → Glacier while
          Intelligent-Tiering covers unpredictable reads.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Public bucket for convenience:</strong> disabling Block Public Access instead of
            using OAC or presigned URLs — bots scrape it within minutes. Keep it private, open only
            the CloudFront path.
          </li>
          <li>
            <strong>Flat key design:</strong> dumping everything as <code>build-1.zip</code>,{" "}
            <code>build-2.zip</code> at bucket root — listing 100k objects to find one build is slow
            and expensive. Use <code>service/env/version/artifact</code> prefixes from day one.
          </li>
          <li>
            <strong>No versioning on Terraform state:</strong> one bad <code>apply</code> overwrites
            the only state copy and recovery means hand-importing every resource. Enable versioning
            + MFA-delete on state buckets before the first apply.
          </li>
          <li>
            <strong>Glacier for hot data:</strong> lifecycling active artifacts to Glacier to
            &quot;save money&quot; — then paying retrieval fees and waiting hours on every deploy.
            Glacier is for compliance archives, never the deploy path.
          </li>
          <li>
            <strong>Ignoring incomplete multipart uploads:</strong> aborted 5GB uploads leave billable
            parts invisible in the console. Always set AbortIncompleteMultipartUpload at 7 days.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Create a global-unique bucket in your lab region; confirm Block Public Access is fully ON.</li>
          <li>Enable versioning + SSE-S3; upload the same key twice and list both versions.</li>
          <li>Delete the key (adds a delete marker), then restore it by deleting the marker — record the commands.</li>
          <li>Generate a 5-minute presigned GET URL; verify 200 before expiry and 403 after.</li>
          <li>Add the section-5 lifecycle rule; explain in one sentence what each transition saves.</li>
          <li>Upload with <code>--storage-class INTELLIGENT_TIERING</code>; check the class with head-object.</li>
          <li>Simulate Terraform state: store a JSON file, corrupt it, recover the prior version.</li>
          <li>Empty and delete the lab bucket; verify <code>aws s3 ls</code> no longer lists it.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
