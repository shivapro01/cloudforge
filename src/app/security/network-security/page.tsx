import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Security (DevSecOps)"
      title="WAF, Shield & Network Defense"
      intro="Security groups decide who reaches your host; WAF decides which HTTP requests deserve an answer; Shield absorbs the flood when someone tries to drown you. This lesson layers all four, writes real WAF rules, compares Shield tiers honestly, and keeps your workloads in private subnets behind endpoints."
      prev={{ href: "/security/data-protection", label: "KMS, Secrets & Encryption" }}
      next={{ href: "/security/detection-response", label: "GuardDuty, Inspector & Security Hub" }}
      resources={[
        {
          title: "WAF developer guide — AWS docs",
          url: "https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html",
          description:
            "Rules, rule groups, web ACLs, and rate-based rules — the reference for every CLI example on this page.",
        },
        {
          title: "Shield developer guide — AWS docs",
          url: "https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html",
          description:
            "Standard vs Advanced compared officially — read before anyone suggests enabling Advanced.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Check WAF request pricing and ALB hourly costs — both lab warnings trace back to these numbers.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Layers: SG → NACL → WAF → Shield</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Each layer filters different traffic. Skip one and the layer above
          inherits its noise. Memorize inside-out: instance (SG), subnet
          (NACL), HTTP (WAF), flood (Shield).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`LAYERED DEFENSE (outside-in)
 Internet flood                    HTTP abuse                 Subnet / host
 +-----------+    +-----------+    +-----------+    +------+    +------+
 |  Shield   | -> |    WAF    | -> |    ALB    | -> | NACL | -> |  SG  |
 | L3/L4 DDoS|    | L7: SQLi, |    | routes to |    |subnet|    |host  |
 | absorb +  |    | XSS, rate |    | targets   |    |allow/|    |allow |
 | scrub     |    | limit bots|    | (private) |    |deny  |    |only  |
 +-----------+    +-----------+    +------+----+    +------+    +------+
   always on       you write         public           stateless   stateful
   (Standard=free) rules here       subnets          numbered    least-priv
                                                        rules    ports`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>SG (stateful, instance/ENI):</strong> allow 443 from ALB
            SG only; allow 22 from your IP only; everything else denied.
            Return traffic auto-allowed.
          </li>
          <li>
            <strong>NACL (stateless, subnet):</strong> numbered allow/deny
            rules both directions. Coarse backup — SGs do the real work.
          </li>
          <li>
            <strong>WAF (Layer 7):</strong> inspects HTTP — SQLi, XSS,
            bad bots, rate floods. Attaches to ALB / CloudFront / API Gateway.
          </li>
          <li>
            <strong>Shield:</strong> absorbs L3/L4 DDoS. Standard is automatic
            and free; Advanced is $3,000/mo — know the difference cold.
          </li>
          <li>
            <strong>DevOps use:</strong> Terraform owns all four layers; SG
            changes go through PR + plan, WAF rules ship like app config with
            canary tuning.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">WAF rules: rate-limit + managed rules + web ACL</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Start every web ACL with two things: a <strong>rate-based rule</strong>{" "}
          (one IP hammering you gets blocked) and AWS <strong>managed rule
          groups</strong> (Core rule set for OWASP Top 10, Known Bad Inputs,
          SQLi/XSS). Add custom rules only after you read blocked-request logs.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Create a web ACL + rate rule + managed rules, attach to ALB
aws wafv2 create-web-acl --name shop-acl --scope REGIONAL --default-action '{"Allow":{}}' \
  --rules '[{"Name":"rate-limit","Priority":0,"Action":{"Block":{}},"Statement":{"RateBasedStatement":{"Limit":2000,"AggregateKeyType":"IP"}},"VisibilityConfig":{"SampledRequestsEnabled":true,"CloudWatchMetricsEnabled":true,"MetricName":"rate"}}]' \
  --visibility-config '{"SampledRequestsEnabled":true,"CloudWatchMetricsEnabled":true,"MetricName":"shop-acl"}' \
  --query 'Summary.[Name,Id]' --output table

aws wafv2 update-web-acl --name shop-acl --scope REGIONAL --id <acl-id> --lock-token <token> \
  --rules '[{"Name":"AWSManagedCore","Priority":1,"OverrideAction":{"None":{}},"Statement":{"ManagedRuleGroupStatement":{"VendorName":"AWS","Name":"AWSManagedRulesCommonRuleSet"}},"VisibilityConfig":{"SampledRequestsEnabled":true,"CloudWatchMetricsEnabled":true,"MetricName":"core"}}]'

aws wafv2 associate-web-acl --web-acl-arn arn:aws:wafv2:us-east-1:123456789012:regional/webacl/shop-acl/<id> --resource-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/shop/<id>
aws wafv2 get-sampled-requests --web-acl-arn <acl-arn> --rule-metric-name rate --scope REGIONAL --time-window '{"StartTime":"2026-09-01T00:00:00Z","EndTime":"2026-09-05T00:00:00Z"}' --max-items 5`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`| shop-acl | ab12cd34-... |      # web ACL created, default Allow + visibility on
UpdateWebACL: NextLockToken abc...   # managed core rule set attached at priority 1
AssociateWebACL: OK -> ALB shop      # ALB now filtered before traffic hits targets
SampledRequests: 3 blocked rate-limit from 203.0.113.44 (4,120 req/5min)
                 1 blocked CoreRuleSet: CrossSiteScripting_BODY (payload <script>)
# Tune: confirm blocks are attacks (not your mobile app), then tighten limit 2000 -> 1000.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Count mode first:</strong> ship new managed rules in{" "}
            <strong>Count</strong> for 24h, read sampled requests, then flip to{" "}
            <strong>Block</strong>. Blocking blind breaks legit clients.
          </li>
          <li>
            <strong>DevOps use:</strong> WAF logs → CloudWatch/S3; alarm on
            spike in blocked rate-limit requests; dashboard per rule metric.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="waf-acl.tf"
            code={`resource "aws_wafv2_web_acl" "shop" {
  name  = "shop-acl"
  scope = "REGIONAL"
  default_action { allow {} }
  rule {
    name     = "rate-limit"
    priority = 0
    action { block {} }
    statement { rate_based_statement { limit = 2000 aggregate_key_type = "IP" } }
    visibility_config { sampled_requests_enabled = true cloudwatch_metrics_enabled = true metric_name = "rate" }
  }
  rule {
    name     = "AWSManagedCore"
    priority = 1
    override_action { none {} }
    statement { managed_rule_group_statement { vendor_name = "AWS" name = "AWSManagedRulesCommonRuleSet" } }
    visibility_config { sampled_requests_enabled = true cloudwatch_metrics_enabled = true metric_name = "core" }
  }
  visibility_config { sampled_requests_enabled = true cloudwatch_metrics_enabled = true metric_name = "shop-acl" }
}`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Shield Standard (free) vs Advanced (do not enable)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Shield Standard protects every AWS customer automatically at no
          cost. Advanced adds 24/7 DRT support and cost protection — at a price
          that dwarfs this entire roadmap&apos;s budget.
        </p>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID $3,000/mo] DO NOT enable Shield Advanced</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            Shield Advanced bills ~$3,000 per month per organization plus data
            fees the moment you subscribe — there is no free trial and no
            lab in this module needs it. If a console banner suggests it,
            close it. Standard + WAF rate-limiting covers every exercise here.
          </p>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>Standard (use this):</strong> automatic L3/L4 DDoS mitigation on ALB/CloudFront/Route53 — zero setup, zero bill.</li>
          <li><strong>Advanced (skip):</strong> DRT team, advanced metrics, DDoS cost protection — enterprise contracts only.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Private subnets + VPC endpoints recap</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          App servers and databases live in <strong>private subnets</strong>{" "}
          (no public IPs, route via NAT); only the ALB sits public. VPC
          endpoints let private subnets reach S3/ECR/Secrets Manager without
          crossing the internet.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Harden an SG: app accepts 443 ONLY from the ALB SG
aws ec2 authorize-security-group-ingress --group-id sg-app123 --protocol tcp --port 443 --source-group sg-alb456
aws ec2 describe-security-groups --group-ids sg-app123 --query 'SecurityGroups[*].IpPermissions[*].[FromPort,IpRanges,UserIdGroupPairs]' --output table
# Gateway endpoint so private subnets reach S3 without NAT/internet
aws ec2 create-vpc-endpoint --vpc-id vpc-123 --service-name com.amazonaws.us-east-1.s3 --route-table-ids rtb-private`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`AuthorizeSecurityGroupIngress: OK (443 from sg-alb456 only, no 0.0.0.0/0)
| 443 | [] | sg-alb456 |     # GOOD: only the ALB can reach the app
CreateVpcEndpoint: vpce-0abc (S3, Gateway)  # private subnets -> S3 stays on AWS backbone`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A–Z: defend the shop [FREE short-lived or simulated]</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          WAF itself is cheap per request, but the ALB it attaches to bills
          hourly — keep the ALB alive for under an hour or simulate with
          Terraform plan + console in Count mode. Teardown is part of the lab.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>A. Map:</strong> sketch SG → NACL → WAF → Shield for your VPC from memory.</li>
          <li><strong>B. SG audit:</strong> list all SGs open to 0.0.0.0/0; restrict app SG to ALB SG only.</li>
          <li><strong>C. Private check:</strong> confirm app subnets have no IGW route; note the NAT path.</li>
          <li><strong>D. Endpoint:</strong> create the S3 gateway endpoint for private route tables.</li>
          <li><strong>E. Web ACL:</strong> create shop-acl with rate-limit (2000/IP/5min) in Count mode first.</li>
          <li><strong>F. Managed rules:</strong> add AWSManagedRulesCommonRuleSet in Count; read sampled requests.</li>
          <li><strong>G. Attach (short-lived):</strong> associate to a lab ALB, send test + attack traffic (curl + encoded XSS string).</li>
          <li><strong>H. Tune:</strong> confirm legit traffic counted not blocked; flip rate rule to Block.</li>
          <li><strong>I. Flood drill:</strong> loop curl 500x from one host; verify rate-limit blocks appear in samples.</li>
          <li><strong>J. Alarm:</strong> create a CloudWatch alarm on the WAF BlockedRequests metric.</li>
          <li><strong>K. Teardown:</strong> disassociate ACL, delete ALB + target groups, delete web ACL; verify no load balancers remain.</li>
          <li><strong>Z. Verify checkpoints:</strong> zero 0.0.0.0/0 app rules; WAF logs show blocks; ALB deleted (describe-load-balancers empty); Shield Standard confirmed active by default.</li>
        </ol>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID warning] ALB + WAF request costs — teardown same day</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            ALB bills per hour + LCU, WAF bills per web ACL + per million
            requests. Minutes of lab traffic cost cents; an ALB left running
            for a month does not. Set a phone timer, then run
            delete-load-balancer + delete-web-acl before you close the laptop.
            Never enable Shield Advanced.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>WAF as code, tuned from logs:</strong> rules in Terraform; weekly review of sampled blocks; false positives become allow-listed paths.</li>
          <li><strong>Defense in depth reviews:</strong> every public endpoint answers SG? NACL? WAF? Shield? Logging? before launch.</li>
          <li><strong>Rate limits per route:</strong> login and signup get tight limits (credential stuffing), static assets get loose ones.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>Blocking on day one:</strong> managed rules in Block without Count-mode baselining lock out real users.</li>
          <li><strong>WAF without logging:</strong> blocking blind — enable sampled requests + full logs or you cannot tune.</li>
          <li><strong>Public backends:</strong> app servers with public IPs &quot;behind&quot; WAF — attackers bypass the ALB entirely. Private subnets only.</li>
          <li><strong>Forgetting the ALB:</strong> the #1 surprise bill in this module. Teardown is a lab step, not an afterthought.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the 4-layer diagram with one example rule per layer from memory.</li>
          <li>Audit every SG for 0.0.0.0/0 and rewrite app rules to ALB-SG-only.</li>
          <li>Create a web ACL with rate-limit + Core rule set in Count mode.</li>
          <li>Read 5 sampled requests and classify each as attack vs legit with reasoning.</li>
          <li>Flip one rule to Block and prove a simulated attack is stopped.</li>
          <li>Explain Standard vs Advanced pricing to a teammate in 30 seconds.</li>
          <li>Create the S3 gateway endpoint and prove private-subnet S3 access works.</li>
          <li>Teardown ALB + ACL same day; verify describe-load-balancers returns empty.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
