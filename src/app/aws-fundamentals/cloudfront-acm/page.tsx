import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="CloudFront + ACM"
      intro="Serving a site straight from S3 or an ALB means every user waits on one origin in one region over plain HTTP. CloudFront caches content at 600+ edge locations and ACM gives you free, auto-renewing TLS — together they turn a slow HTTP origin into a fast global HTTPS site with a private S3 backend."
      prev={{ href: "/aws-fundamentals/s3", label: "S3" }}
      next={{ href: "/aws-fundamentals/route53", label: "Route53" }}
      resources={[
        {
          title: "AWS Free Tier — CloudFront",
          url: "https://aws.amazon.com/free/",
          description:
            "Free Tier quotas that cover this lab: 1TB transfer out, 10M requests, and free ACM public certificates.",
        },
        {
          title: "CloudFront + ACM Documentation",
          url: "https://docs.aws.amazon.com/",
          description:
            "Official guides for distributions, OAC origins, cache behaviors, invalidations, and certificate validation.",
        },
        {
          title: "AWS Architecture Center — CDN patterns",
          url: "https://aws.amazon.com/architecture/",
          description:
            "Reference architectures for S3 + CloudFront + OAC edge-cached frontends to copy.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. Why a CDN: origin latency is physics</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A user in Berlin fetching from an <code>us-east-1</code> S3 bucket or ALB pays ~90–120ms
          per round trip before a single byte renders — TLS handshake, HTML, then every asset
          repeats the trip. Multiply by 40 assets and the page feels broken while the origin itself
          absorbs every hit (and every gigabyte of transfer-out billing). A CDN fixes both: cache
          static bytes at the edge near the user, and shield the origin so it serves each object
          once per edge instead of once per visitor.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`WITHOUT CDN (every user hits the origin)
Berlin user ──90ms──▶ S3 / ALB in us-east-1 ──90ms──▶ bytes
  × 40 assets × every visitor = slow + origin pays all transfer

WITH CDN (edge absorbs repeats)
Berlin user ──5ms──▶ CloudFront edge (FRA) ──hit? serve instantly
                                              miss? ──▶ origin once, cache, serve`}
          />
        </div>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. How CloudFront works: edge cache, hit vs miss</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>distribution</strong> (your <code>d111abcdef.cloudfront.net</code> hostname) has{" "}
          <strong>origins</strong> (where content comes from — private S3, ALB, EC2) and{" "}
          <strong>behaviors</strong> (which URL paths use which origin and cache rules). First
          request for <code>/app.js</code> at an edge is a <strong>miss</strong>: the edge fetches
          from the origin, stores a copy for the TTL, and serves it. Every later request inside the
          TTL is a <strong>hit</strong>: served from edge RAM in single-digit milliseconds with zero
          origin load. The <code>Age</code> and <code>X-Cache: Hit from cloudfront</code> headers
          tell you which one you got — learn to read them before debugging &quot;my deploy did not
          show up&quot;.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`                ┌─ edge FRA ─┐   HIT:  Age: 3600, X-Cache: Hit ─▶ 5ms
users (EU) ───┤  /app.js TTL │──▶ serve from edge, origin untouched
                └────────────┘
                     │ MISS (first request / after TTL)
                     ▼
              origin: private S3 via OAC (us-east-1)
              fetch once → cache at every edge that asked → serve

headers to trust:
  X-Cache: Hit from cloudfront   = edge served it (fast)
  X-Cache: Miss from cloudfront  = edge fetched origin (slow once)`}
          />
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. ACM: free public TLS with DNS validation</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>AWS Certificate Manager</strong> issues free public certificates (domain-validated,
          auto-renewing as long as DNS records stay in place) — no certbot cron, no $100/yr
          purchase, no private-key handling. Flow: request <code>app.example.com</code> in ACM →
          AWS gives you a <code>_acme-challenge</code> CNAME → create it in your DNS → ACM flips to{" "}
          <code>Issued</code> in minutes. Attach the cert to CloudFront (or ALB) and HTTP redirects
          to HTTPS everywhere.
        </p>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            REQUIREMENT — CloudFront certs must live in us-east-1.
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            CloudFront is global but reads certificates only from <code>us-east-1</code> (N.
            Virginia). Request or import the ACM cert in <code>us-east-1</code> even if your bucket
            and users are elsewhere — a valid cert in <code>eu-west-1</code> will simply not appear
            in the CloudFront dropdown. ALB certs, by contrast, must live in the ALB&apos;s own
            region.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Request in us-east-1 (MANDATORY region for CloudFront) + fetch DNS record
aws acm request-certificate --region us-east-1 \\
  --domain-name app.example.com --validation-method DNS \\
  --query CertificateArn --output text

aws acm describe-certificate --region us-east-1 \\
  --certificate-arn arn:aws:acm:us-east-1:123:certificate/abc \\
  --query "Certificate.DomainValidationOptions[*].[ResourceRecord.Name,ResourceRecord.Value]" --output table
# Create that CNAME in your DNS, then poll until Status=ISSUED`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. OAC: keep S3 private behind CloudFront</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Origin Access Control (OAC)</strong> lets CloudFront sign requests to S3 with a
          short-lived signature, so the bucket policy allows <em>only</em> the distribution and
          Block Public Access stays fully ON. This replaced the legacy Origin Access Identity — use
          OAC on every new distribution. The bucket never sees the internet; direct S3 URLs return{" "}
          <code>403</code> while CloudFront URLs return <code>200</code>. That is the proof your
          origin is sealed.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontOAC",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::acme-frontend-7f3a/*",
    "Condition": {
      "StringEquals": { "AWS:SourceArn": "arn:aws:cloudfront::123:distribution/E1ABC" }
    }
  }]
}
// Block Public Access: all four ON. No public statement, no website-endpoint origin.`}
          />
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Cache behaviors and invalidations</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Behaviors</strong> route paths: <code>/* → S3-OAC</code> for the SPA,{" "}
          <code>/api/* → ALB origin</code> with caching disabled for dynamic calls. Static assets
          get long TTLs (<code>Cache-Control: max-age=31536000, immutable</code> on hashed
          filenames like <code>app.a1b2.js</code>); <code>index.html</code> gets{" "}
          <code>max-age=0</code> so deploys surface instantly. When you must purge early, an{" "}
          <strong>invalidation</strong> (<code>/index.html</code>, or <code>/*</code> for
          emergencies) drops cached copies at all edges in 1–3 minutes.
        </p>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            [PAID] — invalidations: first 1,000 paths/month free, then $0.005/path.
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Invalidating <code>/*</code> counts every cached object as paths and burns the free
            quota fast. Prefer versioned filenames + short TTL on <code>index.html</code> so normal
            deploys need zero invalidations; reserve explicit invalidations for hotfixes.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Invalidate just index.html after a copy-paste hotfix (not /*)
aws cloudfront create-invalidation --distribution-id E1ABC \\
  --paths "/index.html" \\
  --query "Invalidation.[Id,Status]" --output table`}
          />
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Full lab [FREE TIER]: private S3 + OAC + HTTPS</h2>
        <div className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — 1TB transfer out + 10M requests/month + ACM public certs free.
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            This lab serves kilobytes: upload a 2KB index.html to a private bucket, front it with
            OAC, attach the free ACM cert, and verify cache Hit/Miss with curl. Costs $0 if you
            skip Route53 and use the cloudfront.net domain.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. Private bucket + tiny page (Block Public Access stays ON)
aws s3 mb s3://acme-frontend-7f3a --region us-east-1
echo "<h1>edge lab v1</h1>" > index.html
aws s3 cp index.html s3://acme-frontend-7f3a/index.html \\
  --cache-control "max-age=0" --content-type "text/html"

# 2. Create OAC + distribution (console or CLI), origin = S3 + OAC, ViewerProtocolPolicy=redirect-to-https
aws cloudfront create-origin-access-control --origin-access-control-config \\
  '{"Name":"lab-oac","SigningProtocol":"sigv4","SigningBehavior":"always","OriginAccessControlOriginType":"s3"}'

# 3. Prove edge caching (run twice)
curl -sI https://d111abcdef.cloudfront.net/index.html | grep -i -E "HTTP|X-Cache|Age"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ curl -sI https://d111abcdef.cloudfront.net/index.html | grep -i -E "HTTP|X-Cache|Age"
HTTP/2 200
X-Cache: Miss from cloudfront        # 1st request: edge fetched private S3 via OAC
$ curl -sI https://d111abcdef.cloudfront.net/index.html | grep -i -E "HTTP|X-Cache|Age"
HTTP/2 200
X-Cache: Hit from cloudfront         # 2nd request: served from edge, origin untouched
Age: 42

# Direct S3 stays sealed:
$ curl -sI https://acme-frontend-7f3a.s3.us-east-1.amazonaws.com/index.html
HTTP/1.1 403 Forbidden               # correct: only CloudFront may read`}
          />
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. What it costs + how DevOps deploys frontends</h2>
        <div className="mt-2 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            [PAID] — beyond free tier: transfer, requests, invalidations, Route53 zone.
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Past the 1TB/10M free tier, CloudFront bills per-GB transfer + per-10k requests;
            invalidations past 1,000 paths/month bill per path; and a Route53 hosted zone (next
            lesson, only if you attach a custom domain) is $0.50/month per zone — create it only
            when needed and delete it after the lab.
          </p>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps uses:</strong> the standard frontend pipeline is{" "}
          <code>npm run build → aws s3 sync dist/ s3://bucket --delete → invalidate
          /index.html</code> in CI, with hashed assets cached immutably for a year and only the
          HTML purged. Preview environments get one distribution per PR; production keeps{" "}
          <code>MinimumProtocolVersion TLSv1.2_2021</code> + <code>redirect-to-https</code> + WAF on
          the distribution. Every deploy in this course&apos;s later CI lessons builds on exactly
          this shape.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# CI deploy: sync + invalidate only what changed
aws s3 sync ./dist s3://acme-frontend-7f3a --delete \\
  --cache-control "public,max-age=31536000,immutable" \\
  --exclude "index.html"
aws s3 cp ./dist/index.html s3://acme-frontend-7f3a/index.html \\
  --cache-control "public,max-age=0,must-revalidate" --content-type "text/html"
aws cloudfront create-invalidation --distribution-id E1ABC --paths "/index.html"`}
          />
        </div>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Public S3 + CloudFront double-open:</strong> disabling Block Public Access AND
            adding OAC — the bucket is reachable directly, defeating the seal. Keep the bucket
            private; 403 on direct S3 URLs is the correct signal.
          </li>
          <li>
            <strong>Stale cache after deploy:</strong> long TTL on <code>index.html</code> means
            users see v1 for hours despite a perfect upload. Hashed assets = immutable; HTML ={" "}
            <code>max-age=0</code> or an invalidation.
          </li>
          <li>
            <strong>Wrong cert region:</strong> requesting ACM in <code>eu-west-1</code> then hunting
            for it in the CloudFront console — it will never appear. CloudFront certs must be{" "}
            <code>us-east-1</code>; re-request there.
          </li>
          <li>
            <strong>S3 website endpoint as origin:</strong> using the website endpoint forces HTTP
            origin + public bucket. Use the REST endpoint + OAC so origin traffic is signed and
            private.
          </li>
          <li>
            <strong>Invalidating /* every deploy:</strong> burns the 1,000 free paths and slows
            deploys. Version filenames and invalidate only HTML.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Sketch the section-2 diagram from memory; label origin, edge, Hit vs Miss.</li>
          <li>Build the lab: private bucket + OAC distribution; prove S3-direct 403 + CloudFront 200.</li>
          <li>curl twice; capture the Miss → Hit header flip and explain the Age value.</li>
          <li>Request an ACM cert in us-east-1; describe where the DNS validation CNAME goes.</li>
          <li>Deploy v2 of index.html with max-age=0; confirm instant update with no invalidation.</li>
          <li>Set immutable caching on a hashed asset; invalidate only /index.html and verify.</li>
          <li>Add a /api/* behavior pointing at a dummy origin with caching disabled; explain why.</li>
          <li>Delete the distribution + bucket; confirm zero distributions remain in the console.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
