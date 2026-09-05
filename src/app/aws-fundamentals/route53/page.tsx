import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="Route53"
      intro="CloudFront gave you HTTPS on an ugly cloudfront.net name — Route53 puts your real domain on it. As AWS's authoritative DNS (and registrar), it maps app.example.com to ALBs, CloudFront, and S3 with Alias records, health-checked failover, and traffic-shifting routing policies that power blue/green deploys."
      prev={{ href: "/aws-fundamentals/cloudfront-acm", label: "CloudFront + ACM" }}
      next={{ href: "/aws-fundamentals/databases", label: "Databases" }}
      resources={[
        {
          title: "Route53 Documentation",
          url: "https://docs.aws.amazon.com/route53/",
          description:
            "Official reference for hosted zones, Alias vs CNAME, routing policies, and health checks.",
        },
        {
          title: "AWS Skill Builder — Route53",
          url: "https://skillbuilder.aws/",
          description:
            "Free official labs for DNS records, failover routing, and hosted-zone cleanup.",
        },
        {
          title: "Roadmap.sh — DevOps DNS path",
          url: "https://roadmap.sh/",
          description:
            "Where DNS and Route53 sit in the full DevOps learning path beyond this lesson.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. DNS recap: who answers your domain</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Typing <code>app.example.com</code> triggers a chain: <strong>root servers</strong> (just
          &quot;who owns .com?&quot;) → <strong>TLD servers</strong> (.com: &quot;who owns
          example.com? these nameservers&quot;) → <strong>authoritative servers</strong> (Route53
          hosted zone: &quot;app.example.com is 203.0.113.10&quot;). Your laptop caches the answer
          for the record&apos;s TTL. Route53 is that last, authoritative step — plus registrar,
          health checker, and traffic router in one console.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`you type app.example.com
  │ 1. root "."      → "ask the .com TLD servers"
  ▼
  │ 2. TLD ".com"    → "ask ns-123.awsdns-45.com (Route53)"
  ▼
  │ 3. authoritative (Route53 hosted zone Z123)
  │     app.example.com  A  203.0.113.10   (TTL 300)
  ▼
browser caches 300s → connects to 203.0.113.10`}
          />
        </div>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Record types: A, CNAME, and the AWS Alias</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>A / AAAA</strong> map a name to IPv4/IPv6 addresses. <strong>CNAME</strong> maps a
          name to another name (<code>www → app.example.com</code>) but is <em>forbidden at the
          apex</em> (bare <code>example.com</code>) by DNS spec. <strong>Alias</strong> is
          Route53&apos;s answer: an apex-compatible pointer to AWS resources (ALB, CloudFront, S3
          website, another record) that resolves to IPs at query time, follows target changes for
          free, and costs nothing per query.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[600px] text-left text-[13px] leading-6">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Points to</th>
                <th className="px-4 py-2 font-medium">Apex?</th>
                <th className="px-4 py-2 font-medium">Use when</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">A / AAAA</td>
                <td className="px-4 py-2">IP address</td>
                <td className="px-4 py-2">Yes</td>
                <td className="px-4 py-2">Fixed IPs, NLB with EIPs</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">CNAME</td>
                <td className="px-4 py-2">Another DNS name</td>
                <td className="px-4 py-2">No (spec forbids)</td>
                <td className="px-4 py-2">Subdomains to external hosts</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Alias</td>
                <td className="px-4 py-2">ALB / CloudFront / S3 / record</td>
                <td className="px-4 py-2">Yes</td>
                <td className="px-4 py-2">Any AWS target, apex or www (default)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Default rule: AWS target → Alias, always. CNAME only for non-AWS hostnames on
          non-apex names. ALB IPs rotate constantly, so an A record pinned to today&apos;s ALB IP
          breaks tomorrow — Alias tracks it automatically.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Hosted zones: public vs private</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>hosted zone</strong> is the container for one domain&apos;s records.{" "}
          <strong>Public zones</strong> answer the internet (your registrar points NS records at the
          four <code>ns-*.awsdns-*</code> servers Route53 assigns). <strong>Private zones</strong>{" "}
          attach to VPCs and answer only inside them — <code>db.internal → 10.0.5.20</code>{" "}
          resolvable by EC2 but invisible externally, the standard split-horizon for service
          discovery without exposing internals.
        </p>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            [PAID] — public hosted zone $0.50/month. Delete after the lab.
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            The meter starts at creation and runs until the zone is deleted — even with zero
            records and zero queries. This lesson&apos;s lab creates a temporary zone: follow the
            mandatory cleanup in section 6 the same session or a forgotten zone bills forever.
            Queries themselves are cheap ($0.40/million); the zone rent is the trap.
          </p>
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Alias to ALB, CloudFront, and S3</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The three aliases you will create constantly: <strong>apex → CloudFront</strong> (your
          frontend from the last lesson), <strong>api subdomain → ALB</strong> (dualstack ALB DNS
          with health-checked targets behind it), and <strong>failover pairs</strong> where a health
          check decides which target answers. Creation is one CLI call with{" "}
          <code>AliasTarget</code> — the hosted-zone ID of the <em>target service</em> (CloudFront
          is always <code>Z2FDTNDATAQYW2</code>), not your zone ID. Copy-pasting the wrong zone ID
          is the #1 Alias error.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`example.com              ALIAS ─▶ d111abcdef.cloudfront.net  (Z2FDTNDATAQYW2)
www.example.com          ALIAS ─▶ d111abcdef.cloudfront.net
api.example.com          ALIAS ─▶ lab-alb-123.us-east-1.elb.amazonaws.com
  └── ALB health checks gate the backends (unhealthy TG = 5xx, DNS still answers)

why not CNAME at apex?  DNS forbids CNAME alongside SOA/NS at the root.
Alias resolves to A records at query time → legal at apex, free, auto-follows target.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Alias apex → CloudFront (note: Target HostedZoneId = CloudFront's, not yours)
aws route53 change-resource-record-sets --hosted-zone-id ZYOURZONE \\
  --change-batch '{"Changes":[{"Action":"CREATE","ResourceRecordSet":{
    "Name":"example.com","Type":"A",
    "AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2",
      "DNSName":"d111abcdef.cloudfront.net.","EvaluateTargetHealth":false}}}]}'

# Alias api → ALB (EvaluateTargetHealth=true lets ALB health gate DNS)
aws route53 change-resource-record-sets --hosted-zone-id ZYOURZONE \\
  --change-batch '{"Changes":[{"Action":"CREATE","ResourceRecordSet":{
    "Name":"api.example.com","Type":"A",
    "AliasTarget":{"HostedZoneId":"ZALBZONEID",
      "DNSName":"lab-alb-123.us-east-1.elb.amazonaws.com.","EvaluateTargetHealth":true}}}]}'`}
          />
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Routing policies: from simple to global</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Simple</strong> (one answer — dev and static sites), <strong>failover</strong>{" "}
          (primary + standby gated by health checks — DR without humans),{" "}
          <strong>weighted</strong> (90/10 split — blue/green and canary deploys shift traffic by
          changing weights), <strong>latency-based</strong> (answer with the fastest region for the
          requester), <strong>geolocation</strong> (EU users → EU stack for data residency, with a
          default catch-all). Health checks (HTTP/HTTPS/TCP every 10–30s, 3 failures = unhealthy)
          are what make failover and weighted policies trustworthy — without them DNS keeps sending
          users to dead stacks.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[600px] text-left text-[13px] leading-6">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2 font-medium">Policy</th>
                <th className="px-4 py-2 font-medium">Answers with</th>
                <th className="px-4 py-2 font-medium">DevOps use case</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Simple</td>
                <td className="px-4 py-2">The one record</td>
                <td className="px-4 py-2">Dev envs, single-region MVPs</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Failover</td>
                <td className="px-4 py-2">Primary unless unhealthy</td>
                <td className="px-4 py-2">Hot standby DR across regions</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Weighted</td>
                <td className="px-4 py-2">Proportional split</td>
                <td className="px-4 py-2">Blue/green 90→50→0, canaries</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Latency / Geolocation</td>
                <td className="px-4 py-2">Nearest / pinned region</td>
                <td className="px-4 py-2">Global apps, residency rules</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Full lab: temp zone + records + MANDATORY cleanup</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Use a test-only domain or subdomain you control. Create the zone, add a TXT-verifiable A
          record for a lab subdomain, prove resolution with <code>dig</code>, then{" "}
          <strong>delete records + zone the same session</strong>. If you delegate NS at your
          registrar for a real lab domain, revert it after cleanup.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. Temp zone + test record (replace example.com with YOUR test domain)
aws route53 create-hosted-zone --name lab-test.example.com --caller-reference lab-$(date +%s) \\
  --query "HostedZone.[Id,Name]" --output table

aws route53 change-resource-record-sets --hosted-zone-id ZYOURZONE \\
  --change-batch '{"Changes":[{"Action":"CREATE","ResourceRecordSet":{
    "Name":"app.lab-test.example.com","Type":"A","TTL":60,
    "ResourceRecords":[{"Value":"203.0.113.10"}]}}]}'

# 2. Prove it resolves (query Route53 NS directly to skip propagation wait)
dig @ns-123.awsdns-45.com app.lab-test.example.com +short
nslookup app.lab-test.example.com ns-123.awsdns-45.com`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ dig @ns-123.awsdns-45.com app.lab-test.example.com +short
203.0.113.10
$ nslookup app.lab-test.example.com ns-123.awsdns-45.com
Server:         ns-123.awsdns-45.com
Name:   app.lab-test.example.com
Address: 203.0.113.10
# Authoritative answer straight from your zone: DNS is working`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 3. MANDATORY CLEANUP — records first, zone second (zone delete fails if non-NS/SOA records remain)
aws route53 change-resource-record-sets --hosted-zone-id ZYOURZONE \\
  --change-batch '{"Changes":[{"Action":"DELETE","ResourceRecordSet":{
    "Name":"app.lab-test.example.com","Type":"A","TTL":60,
    "ResourceRecords":[{"Value":"203.0.113.10"}]}}]}'

aws route53 delete-hosted-zone --id ZYOURZONE
aws route53 list-hosted-zones --query "HostedZones[*].Name" --output table
# Your lab-test zone must be GONE from this list = meter stopped`}
          />
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. How DevOps actually uses Route53</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Blue/green weighted shift:</strong> run v1 (weight 90) + v2 (weight 10) Aliases
          for <code>api.example.com</code>; watch error rates, slide to 50/50, then 0/100, then
          delete v1 — zero-downtime deploys with instant DNS rollback. <strong>Failover to
          standby:</strong> primary ALB + health check, secondary region or static S3 failover page;
          Route53 pulls traffic in ~1–2 minutes with no human pager response. Pair both with short
          TTLs during migrations (60s) and long TTLs in steady state (300–3600s) to balance agility
          against query cost.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Weighted blue/green: v2 starts at 10%, shift by changing weights
aws route53 change-resource-record-sets --hosted-zone-id ZYOURZONE --change-batch '{
  "Changes": [
    {"Action":"UPSERT","ResourceRecordSet":{"Name":"api.example.com","Type":"A","SetIdentifier":"v1","Weight":"90",
      "AliasTarget":{"HostedZoneId":"ZALBZONEID","DNSName":"alb-v1.elb.amazonaws.com.","EvaluateTargetHealth":true}}},
    {"Action":"UPSERT","ResourceRecordSet":{"Name":"api.example.com","Type":"A","SetIdentifier":"v2","Weight":"10",
      "AliasTarget":{"HostedZoneId":"ZALBZONEID","DNSName":"alb-v2.elb.amazonaws.com.","EvaluateTargetHealth":true}}}
  ]}'
# observe → 50/50 → 0/100 → delete v1 set. Rollback = flip weights back.`}
          />
        </div>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Apex CNAME:</strong> creating <code>example.com CNAME d111.cloudfront.net</code>{" "}
            — rejected or breaks MX/SOA. Apex → Alias A record, always.
          </li>
          <li>
            <strong>48-hour TTL during migration:</strong> leaving TTL 86400+ then moving stacks —
            users stick to the dead target for days. Drop TTL to 60s 48h <em>before</em> any
            migration, raise after.
          </li>
          <li>
            <strong>Forgetting zone deletion:</strong> the $0.50/month zone from a 20-minute lab
            billing for a year. Cleanup (section 6) is part of the lab, not optional.
          </li>
          <li>
            <strong>Wrong Alias target zone ID:</strong> pasting your hosted-zone ID instead of the
            service&apos;s (CloudFront <code>Z2FDTNDATAQYW2</code>, or the ALB&apos;s regional ID) —
            validation fails. Copy the target&apos;s zone ID from the docs/console.
          </li>
          <li>
            <strong>No health check on failover:</strong> primary/secondary records without checks
            never fail over — DNS keeps answering the dead primary. Every failover record needs a
            check on a real endpoint.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Draw the section-1 chain for your own domain; identify its authoritative NS.</li>
          <li>Create the temp zone + A record; prove it with dig against the assigned Route53 NS.</li>
          <li>Add an Alias for a subdomain to your CloudFront distribution from the last lesson.</li>
          <li>Build a weighted 90/10 pair (two A records, dummy IPs); resolve repeatedly and note the split.</li>
          <li>Create an HTTP health check on a real endpoint; break the endpoint and watch it go unhealthy.</li>
          <li>Practice a TTL drop to 60s, simulate a migration, then raise back to 300s.</li>
          <li>Run the full section-6 cleanup; prove the zone is gone from list-hosted-zones.</li>
          <li>Explain in two sentences when you would pick failover vs weighted for a production deploy.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
