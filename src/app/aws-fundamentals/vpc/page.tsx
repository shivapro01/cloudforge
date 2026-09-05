import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="VPC"
      intro="A VPC (Virtual Private Cloud) is your own isolated network inside AWS. Every EC2 instance, load balancer, and RDS database you ever launch lives inside one. Understand CIDR blocks, subnets, route tables, gateways, and security controls here and every later AWS lesson becomes easy."
      prev={{ href: "/aws-fundamentals/iam", label: "IAM" }}
      next={{ href: "/aws-fundamentals/ec2", label: "EC2 + EBS" }}
      resources={[
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm what VPC networking is always free vs. what (NAT Gateway, idle Elastic IPs) bills hourly.",
        },
        {
          title: "Amazon VPC Documentation",
          url: "https://docs.aws.amazon.com/vpc/",
          description:
            "Official reference for CIDR blocks, subnets, route tables, gateways, security groups, and NACLs.",
        },
        {
          title: "AWS Architecture Center",
          url: "https://aws.amazon.com/architecture/",
          description:
            "Reference VPC architectures showing public/private subnets spread across multiple Availability Zones.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. What a VPC is: your isolated network</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A VPC is a logically isolated virtual network you define inside an AWS Region. You
          choose its IP range (CIDR block), split it into subnets, and control exactly what can
          enter, leave, and talk internally. Nothing is reachable from the internet unless you
          explicitly attach a gateway, add a route, and open a firewall rule — that
          opt-in connectivity is the whole security model.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every AWS account comes with a <strong>default VPC</strong> per Region: a
          /16 network (172.31.0.0/16) with one public subnet per Availability Zone, an
          attached internet gateway, and permissive default security groups. It exists so a
          beginner can launch an EC2 instance in one click. A <strong>custom VPC</strong> is
          one you design yourself — your own CIDR (typically 10.0.0.0/16), public subnets for
          load balancers, private subnets for app servers and databases, and your own route
          tables. Everything production runs in custom VPCs because you control the addressing,
          the AZ spread, DNS settings, and flow logging.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] text-left text-[13px] leading-6">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2 font-medium">Aspect</th>
                <th className="px-4 py-2 font-medium">Default VPC</th>
                <th className="px-4 py-2 font-medium">Custom VPC</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">CIDR</td>
                <td className="px-4 py-2">Fixed 172.31.0.0/16</td>
                <td className="px-4 py-2">You choose, e.g. 10.0.0.0/16</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Subnets</td>
                <td className="px-4 py-2">One public subnet per AZ</td>
                <td className="px-4 py-2">Public + private subnets per AZ, you design</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Internet access</td>
                <td className="px-4 py-2">Pre-wired via IGW</td>
                <td className="px-4 py-2">You attach IGW / NAT and write routes</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Use for</td>
                <td className="px-4 py-2">Learning, quick experiments</td>
                <td className="px-4 py-2">Anything real or long-lived</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> one VPC per environment (dev / staging / prod) with
          non-overlapping CIDRs so VPC peering and VPNs never collide; Terraform or
          CloudFormation owns the VPC so environments are reproducible.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. CIDR blocks and subnets across 2 AZs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The VPC gets a large block like <code>10.0.0.0/16</code> (65,536 addresses). You carve
          it into smaller <strong>subnets</strong>, each pinned to exactly one Availability Zone.
          The standard production shape is: per AZ, one <strong>public</strong> subnet (hosts load
          balancers, NAT gateways — things that need direct internet) and one{" "}
          <strong>private</strong> subnet (hosts app servers and databases — no direct inbound
          from the internet). Two AZs minimum, because a single-AZ deployment dies with that AZ.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`VPC 10.0.0.0/16 (Region)
│
├── AZ-a ── public-a   10.0.1.0/24  → route: 0.0.0.0/0 → IGW
│        └─ private-a  10.0.3.0/24  → route: 0.0.0.0/0 → NAT GW (in public-a)
│
└── AZ-b ── public-b   10.0.2.0/24  → route: 0.0.0.0/0 → IGW
         └─ private-b  10.0.4.0/24  → route: 0.0.0.0/0 → NAT GW (in public-b)

Internet → IGW → public subnets → NAT GW → private subnets (egress only)`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          CIDR math you actually need: a <code>/24</code> holds 256 addresses, minus 5 reserved
          by AWS (network, broadcast, VPC router, DNS, future use) ={" "}
          <strong>251 usable</strong>. Size subnets with growth and ENI overhead in mind — a /24
          per subnet is a sane default for learning; production tiers often use /20–/22.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[520px] text-left text-[13px] leading-6">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2 font-medium">Prefix</th>
                <th className="px-4 py-2 font-medium">Total IPs</th>
                <th className="px-4 py-2 font-medium">Usable in AWS</th>
                <th className="px-4 py-2 font-medium">Typical use</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">/16</td>
                <td className="px-4 py-2">65,536</td>
                <td className="px-4 py-2">65,531</td>
                <td className="px-4 py-2">Whole VPC</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">/20</td>
                <td className="px-4 py-2">4,096</td>
                <td className="px-4 py-2">4,091</td>
                <td className="px-4 py-2">Large tier subnet</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">/24</td>
                <td className="px-4 py-2">256</td>
                <td className="px-4 py-2">251</td>
                <td className="px-4 py-2">Standard subnet (recommended default)</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">/28</td>
                <td className="px-4 py-2">16</td>
                <td className="px-4 py-2">11</td>
                <td className="px-4 py-2">Tiny / special-purpose only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Route tables: IGW for public, NAT Gateway for private</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>route table</strong> decides where a subnet sends traffic. A subnet is
          &quot;public&quot; only because its route table sends <code>0.0.0.0/0</code> to an{" "}
          <strong>internet gateway (IGW)</strong> — a free, highly available VPC component that
          bridges the VPC to the internet. A &quot;private&quot; subnet has no IGW route, so
          inbound internet traffic can never reach it. For outbound-only access (patch
          downloads, API calls, container pulls), its route table points{" "}
          <code>0.0.0.0/0</code> at a <strong>NAT Gateway</strong> sitting in a public subnet.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`Public route table              Private route table (AZ-a)
10.0.0.0/16 → local            10.0.0.0/16 → local
0.0.0.0/0   → igw-xxxx         0.0.0.0/0   → nat-xxxx (in public-a)

Private instance ──▶ NAT GW ──▶ IGW ──▶ internet   (outbound OK)
Internet ──✕ private instance                       (inbound blocked)`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — NAT Gateway costs ~$0.045/hr + data processing per GB
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            A NAT Gateway bills for every hour it exists (roughly $1/day) even with zero
            traffic, plus a per-GB processing fee. For learning, prefer the default VPC or a
            custom VPC <em>without</em> a NAT Gateway. The cheap alternative is a{" "}
            <strong>NAT instance</strong> (a small EC2 box doing NAT) — far less reliable and
            not recommended for production, but fine for a weekend lab. If you create a NAT
            Gateway, delete it in the same session.
          </p>
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Security Groups vs NACLs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Two firewall layers protect traffic, and interviews love this comparison.{" "}
          <strong>Security Groups (SGs)</strong> are <strong>stateful</strong> and attach at the{" "}
          <strong>instance / ENI level</strong>: allow inbound port 443 and the return traffic
          is automatically permitted — you only write allow rules.{" "}
          <strong>Network ACLs (NACLs)</strong> are <strong>stateless</strong> and attach at the{" "}
          <strong>subnet level</strong>: return traffic must be explicitly allowed, and they
          support both allow and deny rules evaluated in number order.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] text-left text-[13px] leading-6">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2 font-medium">Feature</th>
                <th className="px-4 py-2 font-medium">Security Group</th>
                <th className="px-4 py-2 font-medium">NACL</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Scope</td>
                <td className="px-4 py-2">Instance / ENI</td>
                <td className="px-4 py-2">Subnet (all instances in it)</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">State</td>
                <td className="px-4 py-2">Stateful (return auto-allowed)</td>
                <td className="px-4 py-2">Stateless (both directions explicit)</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Rules</td>
                <td className="px-4 py-2">Allow only</td>
                <td className="px-4 py-2">Allow + deny, ordered by number</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">Daily use</td>
                <td className="px-4 py-2">Primary control — use this</td>
                <td className="px-4 py-2">Leave default; backup guardrail</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Example web-server SG: inbound allow <code>80/tcp</code> and <code>443/tcp</code> from{" "}
          <code>0.0.0.0/0</code>, inbound allow <code>22/tcp</code> from{" "}
          <code>&lt;YOUR-IP&gt;/32</code> only, all outbound allowed. Leave the default NACL (allow
          all) alone until you have a reason — most outages blamed on NACLs are actually SG or
          route-table mistakes.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ec2 authorize-security-group-ingress \\
  --group-id sg-0123456789abcdef0 \\
  --protocol tcp --port 443 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \\
  --group-id sg-0123456789abcdef0 \\
  --protocol tcp --port 22 --cidr $(curl -s https://checkip.amazonaws.com)/32`}
          />
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Reachability debugging method</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          When an instance is unreachable, walk this order instead of guessing:{" "}
          <strong>Security Group → NACL → route table → IGW/NAT → instance status</strong>. Each
          layer fails differently, so checking in sequence isolates the fault in minutes.
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Security Group:</strong> is the port open from your source? Connection{" "}
            <em>timeout</em> almost always means SG (or NACL) silently dropping packets.
          </li>
          <li>
            <strong>NACL:</strong> did someone customize it? Verify inbound + outbound (ephemeral
            ports 1024–65535) both allow the flow — stateless means both directions matter.
          </li>
          <li>
            <strong>Route table:</strong> does the subnet have a route to the destination? Public
            subnet needs <code>0.0.0.0/0 → IGW</code>; private needs{" "}
            <code>0.0.0.0/0 → NAT</code> for egress. No route = black hole.
          </li>
          <li>
            <strong>IGW / NAT:</strong> is the gateway attached and (for NAT) in an{" "}
            <em>available</em> state in a public subnet with its own IGW route?
          </li>
          <li>
            <strong>Instance status:</strong> do both EC2 status checks pass, is the OS firewall
            (iptables/ufw) open, and is the service actually listening? Connection{" "}
            <em>refused</em> means you got through the network but nothing listens on that port.
          </li>
        </ol>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Pro tip: enable <strong>VPC Flow Logs</strong> to CloudWatch when stuck — REJECT entries
          tell you exactly which layer dropped the packet.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Lab (free tier): inspect the default VPC</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Read-only inspection costs nothing. Run these against your default Region and map the
          output back to the concepts above: one VPC, one IGW route, one subnet per AZ.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ec2 describe-vpcs \\
  --filters Name=isDefault,Values=true \\
  --query "Vpcs[*].[VpcId,CidrBlock,State]" --output table

aws ec2 describe-subnets \\
  --filters Name=default-for-az,Values=true \\
  --query "Subnets[*].[SubnetId,CidrBlock,AvailabilityZone,MapPublicIpOnLaunch]" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-------------------------------
|          DescribeVpcs         |
+------------+---------+--------+
| vpc-abc123 | 172.31.0.0/16 | available |
-------------------------------

-----------------------------------------------------------------
|                        DescribeSubnets                        |
+------------------+-----------------+----------------+-----------+
| subnet-111 (a)   | 172.31.16.0/20  | us-east-1a     | True      |
| subnet-222 (b)   | 172.31.32.0/20  | us-east-1b     | True      |
| subnet-333 (c)   | 172.31.0.0/20   | us-east-1c     | True      |
-----------------------------------------------------------------
# One public subnet per AZ, public IPs auto-assigned → default = public-only`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Then open the VPC console: pick one default subnet → Route Table tab → confirm{" "}
          <code>0.0.0.0/0 → igw-…</code>. That single route is what makes it &quot;public&quot;.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — this lab costs $0
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            VPCs, subnets, route tables, IGWs, SGs, and NACLs are free. Charges only come from
            NAT Gateways, idle Elastic IPs, and traffic — none of which this lab creates.
          </p>
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Lab (paid warning): custom VPC with NAT Gateway</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Build the 2-AZ shape from section 2 once, then <strong>tear it down in the same
          session</strong>. The wizard path: VPC console → Create VPC → &quot;VPC and
          more&quot; → name it, CIDR <code>10.0.0.0/16</code>, 2 AZs, 2 public + 2 private
          subnets, NAT Gateway in each AZ (or 1 for a cheaper lab), then create. Launch nothing
          into it for this lesson — the EC2 lesson builds on this.
        </p>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — delete the NAT Gateway(s) the same day
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Each NAT Gateway is ~$0.045/hr (~$1/day) plus data fees while it exists. Verify
            deletion in the console (state = deleted), because stopping instances does not stop
            NAT billing.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Find and release the NAT gateway(s) first (this stops the hourly bill)
aws ec2 describe-nat-gateways \\
  --filter Name=state,Values=available \\
  --query "NatGateways[*].[NatGatewayId,VpcId,State]" --output table

aws ec2 delete-nat-gateway --nat-gateway-id nat-xxxxxxxxxxxxxxxxx

# Then delete the custom VPC (console: delete VPC also removes IGW/routes/subnets)
aws ec2 delete-vpc --vpc-id vpc-xxxxxxxxxxxxxxxxx

# Confirm nothing billable remains
aws ec2 describe-nat-gateways \\
  --filter Name=state,Values=available \\
  --query "NatGateways[*].NatGatewayId" --output table
# Expected: empty ([]) — no available NAT gateways`}
          />
        </div>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>SSH open to the world (0.0.0.0/0 on port 22):</strong> bots brute-force it
            within minutes. Scope SSH to your IP/32; use a bastion or SSM Session Manager for
            shared access.
          </li>
          <li>
            <strong>All subnets in one AZ:</strong> one AZ event takes down everything. Spread
            public + private subnets across at least 2 AZs from day one.
          </li>
          <li>
            <strong>Deleting the default VPC &quot;to be clean&quot;:</strong> one-click launches
            and many tutorials depend on it. Leave it; build custom VPCs alongside it.
          </li>
          <li>
            <strong>Custom NACLs that block ephemeral ports:</strong> hardening the subnet NACL
            without allowing return ports 1024–65535 breaks nearly all TCP. Keep default NACLs
            until you can articulate the exact deny you need.
          </li>
          <li>
            <strong>Orphaned NAT Gateways / Elastic IPs:</strong> deleting instances and VPCs but
            forgetting the NAT Gateway or Elastic IP keeps the hourly meter running.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Run the default-VPC inspection CLI from section 6 and sketch its subnets per AZ.</li>
          <li>In the console, trace one default subnet to its route table and identify the IGW route.</li>
          <li>Compute usable IPs for a /23 and a /25 (remember: minus 5 AWS-reserved).</li>
          <li>Design on paper a 10.0.0.0/16 split into 2 public + 2 private /24s across 2 AZs.</li>
          <li>Create the custom VPC from section 7, verify public/private routes, then delete it + NAT GWs same session.</li>
          <li>Add a temporary SG rule for SSH scoped to your IP/32, then remove it.</li>
          <li>Break something on purpose in the lab VPC (remove the IGW route) and walk the section-5 debug order to diagnose it.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
