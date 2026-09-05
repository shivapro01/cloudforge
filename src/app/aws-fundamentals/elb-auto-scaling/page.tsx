import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="ELB + Auto Scaling"
      intro="One EC2 box is a single point of failure. Elastic Load Balancing spreads traffic across healthy targets in multiple AZs, and Auto Scaling keeps the right number of instances running as demand changes. Together they turn fragile servers into a self-healing, scalable tier."
      prev={{ href: "/aws-fundamentals/ec2", label: "EC2 + EBS" }}
      next={{ href: "/aws-fundamentals/s3", label: "S3" }}
      resources={[
        {
          title: "Elastic Load Balancing Documentation",
          url: "https://docs.aws.amazon.com/elb/",
          description:
            "Official reference for ALB/NLB listeners, target groups, health checks, and scaling behavior.",
        },
        {
          title: "AWS Architecture Center",
          url: "https://aws.amazon.com/architecture/",
          description:
            "Reference multi-AZ load-balanced architectures to copy for production layouts.",
        },
        {
          title: "AWS Skill Builder",
          url: "https://skillbuilder.aws/",
          description:
            "Free official labs and courses covering load balancing and Auto Scaling hands-on.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. Why: a single EC2 box is a SPOF</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          One instance in one AZ has at least four single points of failure: the AZ itself, the
          host hardware, the OS/app process, and deploys (restart = downtime). Traffic has nowhere
          else to go, and a traffic spike just overwhelms the box. The fix is a tier, not a bigger
          box: multiple instances across ≥2 AZs, a load balancer spreading requests only to healthy
          ones, and an Auto Scaling group replacing dead instances and resizing with demand.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`BEFORE (fragile)                        AFTER (resilient)
                                                    ┌─ AZ-a: instance-1 ─┐
users ──▶ EC2 (1 AZ) ──✕ on failure     users ──▶ ALB ──┤                  ├─▶ app tier
         (SPOF: AZ/host/app/deploy)                │     └─ AZ-b: instance-2 ─┘
                                                   ASG watches both, replaces failures,
                                                   scales 1↔2 with demand`}
          />
        </div>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. The resilient shape: ALB + 2 AZs + ASG</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The canonical web tier: an <strong>Application Load Balancer</strong> in public subnets
          across 2 AZs, forwarding to <strong>target instances in private subnets</strong> across
          the same 2 AZs, owned by an <strong>Auto Scaling group (min 1 / desired 2 / max
          4)</strong>. The ALB is the only thing with a public address; instances accept traffic
          only from the ALB security group. If an AZ fails, the surviving AZ still serves — that
          is the entire point of the second AZ.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`internet ──▶ ALB (public-a + public-b)
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
  private-a: app-1         private-b: app-2   (SG allows 80 ONLY from ALB SG)
        │                       │
        └──── ASG min1/des2/max4 ┘  (health: ELB checks /health,
                                     replaces unhealthy, spreads AZ-balanced)

SG chain:  client → ALB SG (80/443 open) → instance SG (80 from ALB-SG only)`}
          />
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. ALB vs NLB vs GWLB: pick the right balancer</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>ALB (Application, Layer 7)</strong> routes HTTP/HTTPS by host, path, header, or
          query — path routing (<code>/api/* → api-TG</code>, <code>/* → web-TG</code>) and
          container/ECS workloads are its home turf. <strong>NLB (Network, Layer 4)</strong>{" "}
          passes raw TCP/UDP with ultra-low latency and static IPs — gaming, IoT, or
          millions-of-connections workloads. <strong>GWLB (Gateway)</strong> chains third-party
          virtual appliances (firewalls, IDS) transparently via GENEVE — you only meet it when a
          security team mandates inline inspection.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[600px] text-left text-[13px] leading-6">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2 font-medium">Balancer</th>
                <th className="px-4 py-2 font-medium">Layer</th>
                <th className="px-4 py-2 font-medium">Routing superpower</th>
                <th className="px-4 py-2 font-medium">Choose when</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">ALB</td>
                <td className="px-4 py-2">L7 HTTP/S</td>
                <td className="px-4 py-2">Host/path/header rules</td>
                <td className="px-4 py-2">Web apps, APIs, microservices (default choice)</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">NLB</td>
                <td className="px-4 py-2">L4 TCP/UDP</td>
                <td className="px-4 py-2">Static IP, extreme throughput</td>
                <td className="px-4 py-2">Non-HTTP, latency-sensitive, fixed IPs</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2">GWLB</td>
                <td className="px-4 py-2">L3 gateway</td>
                <td className="px-4 py-2">Transparent appliance chaining</td>
                <td className="px-4 py-2">Inline 3rd-party firewalls/IDS</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Default to ALB for this course and its labs. Reach for NLB only when ALB cannot do the
          protocol or the static-IP requirement forces it.
        </p>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Target groups and health checks</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The ALB never sends to instances directly — it sends to a <strong>target group</strong>,
          which runs <strong>health checks</strong> (default: HTTP <code>/</code> every 30s, healthy
          after 2–3 successes, unhealthy after 2–3 failures). Only <code>healthy</code> targets get
          traffic; failing ones are quarantined and (with ASG) replaced. Two settings cause most
          beginner pain: the <strong>health-check path must return 200</strong> (point it at a real{" "}
          <code>/health</code> endpoint, not a frontend route that 404s), and the{" "}
          <strong>deregistration delay</strong> (default 300s — how long in-flight requests drain
          before a target is removed; lower it to ~30s for labs).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Target group with a REAL health endpoint + fast draining for labs
aws elbv2 create-target-group --name lab-tg --protocol HTTP --port 80 \\
  --vpc-id vpc-abc123 --target-type instance \\
  --health-check-path /health --health-check-interval-seconds 15 \\
  --healthy-threshold-count 2 --unhealthy-threshold-count 2

aws elbv2 modify-target-group-attributes \\
  --target-group-arn arn:aws:elasticloadbalancing:...:targetgroup/lab-tg/abc \\
  --attributes Key=deregistration_delay.timeout_seconds,Value=30

# Watch health flip as instances boot
aws elbv2 describe-target-health \\
  --target-group-arn arn:aws:elasticloadbalancing:...:targetgroup/lab-tg/abc \\
  --query "TargetHealthDescriptions[*].[Target.Id,TargetHealth.State,TargetHealth.Reason]" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-------------------------------------------
|           DescribeTargetHealth          |
+------------+----------+-----------------+
| i-0aaa111  | healthy  | Elb.InitialHealth |
| i-0bbb222  | initial  | Elb.RegistrationInProgress |
-------------------------------------------
# initial → healthy once /health returns 200 twice in a row`}
          />
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Auto Scaling groups: templates, sizes, policies</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          An <strong>ASG</strong> owns instance count: a <strong>launch template</strong> (AMI +
          type + key + SGs + user-data + IAM profile — everything from the EC2 lesson, versioned)
          plus <strong>min / desired / max</strong> sizes spread across your AZ subnets. Scaling
          policies then move desired count: <strong>target-tracking</strong> (e.g. hold 50% avg CPU
          — the set-and-forget default), <strong>step scaling</strong> (add +1 at 70% CPU, +2 at
          85%), and <strong>scheduled scaling</strong> (2 instances at 08:00, 4 at peak, cron-based
          for predictable traffic).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Launch template = versioned recipe from the EC2 lesson
aws ec2 create-launch-template --launch-template-name lab-web \\
  --launch-template-data '{"ImageId":"ami-xxxxxxxxx","InstanceType":"t3.micro",
    "KeyName":"devops-lab","SecurityGroupIds":["sg-xxxx"],
    "IamInstanceProfile":{"Name":"lab-ec2-profile"},
    "UserData":"'"$(base64 -w0 userdata.sh)"'"}'

# ASG across 2 AZ subnets + ELB health checks + target-tracking on CPU
aws autoscaling create-auto-scaling-group --auto-scaling-group-name lab-asg \\
  --launch-template LaunchTemplateName=lab-web,Version='$Latest' \\
  --min-size 1 --desired-capacity 1 --max-size 2 \\
  --vpc-zone-identifier "subnet-priv-a,subnet-priv-b" \\
  --target-group-arns arn:aws:elasticloadbalancing:...:targetgroup/lab-tg/abc \\
  --health-check-type ELB --health-check-grace-period 120

aws autoscaling put-scaling-policy --auto-scaling-group-name lab-asg \\
  --policy-name cpu50 --policy-type TargetTrackingScaling \\
  --target-tracking-configuration '{"PredefinedMetricSpecification":
    {"PredefinedMetricType":"ASGAverageCPUUtilization"},"TargetValue":50.0}'`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps uses:</strong> rolling deploys (new launch-template version → instance
          refresh replaces boxes gradually) and blue/green (stand up a second ASG + target group,
          flip the ALB listener, keep the old stack for instant rollback) — both build directly on
          this lab.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Full lab: 2-AZ ALB + ASG that heals itself</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Assemble sections 2–5: (1) launch template with nginx + <code>/health</code> user-data
          from the EC2 lesson; (2) target group on <code>/health</code>; (3) ALB with a listener
          forwarding port 80 to the TG; (4) ASG min 1 / desired 1 / max 2 across both private
          subnets. Then prove it: curl the ALB DNS name, terminate one instance, watch the ASG
          replace it.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Wire ALB → listener → TG (fill in your ARNs/subnet IDs)
aws elbv2 create-load-balancer --name lab-alb --scheme internet-facing \\
  --subnets subnet-pub-a subnet-pub-b \\
  --security-groups sg-alb \\
  --query "LoadBalancers[*].[DNSName,State.Code]" --output table

aws elbv2 create-listener --load-balancer-arn <ALB-ARN> \\
  --protocol HTTP --port 80 \\
  --default-actions Type=forward,TargetGroupArn=<TG-ARN>

# Prove traffic flows through the ALB
ALB=$(aws elbv2 describe-load-balancers --names lab-alb \\
  --query "LoadBalancers[0].DNSName" --output text)
for i in 1 2 3; do curl -s http://$ALB/ ; echo; done`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ for i in 1 2 3; do curl -s http://lab-alb-123.us-east-1.elb.amazonaws.com/; echo; done
<h1>DevOps lab: hello from ip-10-0-3-10</h1>
<h1>DevOps lab: hello from ip-10-0-4-11</h1>
<h1>DevOps lab: hello from ip-10-0-3-10</h1>
# Hostnames alternate → ALB is spreading across both AZs`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Self-heal demo: kill one instance, watch the ASG replace it
aws ec2 terminate-instances --instance-ids i-0aaa111
watch -n 10 'aws autoscaling describe-auto-scaling-groups \\
  --auto-scaling-group-names lab-asg \\
  --query "AutoScalingGroups[0].Instances[*].[InstanceId,LifecycleState,HealthStatus]" --output table'
# Terminating → Detaching → new instance Pending → InService (ELB grace ~120s)`}
          />
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Cost and teardown: do this in one session</h2>
        <div className="mt-2 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — ALB ~$0.025/hr + LCU charges, instances hourly. Teardown same session.
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            The ALB bills for every hour it exists plus capacity units, and each ASG instance
            bills like normal EC2. Budget roughly a dollar or two for a focused lab afternoon —
            but only if you delete everything right after. Order matters: ASG → ALB/listener →
            target group → instances → launch template.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Teardown in dependency order (ASG first so it stops replacing boxes)
aws autoscaling update-auto-scaling-group --auto-scaling-group-name lab-asg \\
  --min-size 0 --desired-capacity 0
aws autoscaling delete-auto-scaling-group --auto-scaling-group-name lab-asg --force-delete

aws elbv2 delete-listener --listener-arn <LISTENER-ARN>
aws elbv2 delete-load-balancer --load-balancer-arn <ALB-ARN>
aws elbv2 delete-target-group --target-group-arn <TG-ARN>
aws ec2 delete-launch-template --launch-template-name lab-web

# Confirm zero survivors
aws autoscaling describe-auto-scaling-groups --query "AutoScalingGroups[*].AutoScalingGroupName"
aws elbv2 describe-load-balancers --query "LoadBalancers[*].LoadBalancerName"
aws ec2 describe-instances --filters Name=instance-state-name,Values=running,pending \\
  --query "Reservations[*].Instances[*].InstanceId"`}
          />
        </div>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Health check on / that 404s:</strong> SPA fallbacks, nginx default pages, or
            app routers return non-200 on <code>/</code> — every target reads unhealthy and the ASG
            churns forever. Always create a dedicated <code>/health</code> returning 200.
          </li>
          <li>
            <strong>Instance SG blocking the ALB:</strong> instances must allow port 80 from the{" "}
            <em>ALB security group</em> (source = sg-alb), not from 0.0.0.0/0 or your IP. Wrong
            source = all targets unhealthy despite a working app.
          </li>
          <li>
            <strong>AZ imbalance:</strong> ASG subnets covering one AZ, or ALB in one AZ, silently
            halves resilience. Verify two subnets in two AZs on both the ALB and the ASG.
          </li>
          <li>
            <strong>Grace period too short:</strong> slow-booting apps get killed before user-data
            finishes. Set <code>--health-check-grace-period</code> ≥ your boot time (120s+ for
            labs).
          </li>
          <li>
            <strong>Leaving the lab running:</strong> ALB + instances overnight turns a $1 lab into
            a weekly bill. Teardown same session (section 7).
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Draw the section-2 architecture from memory; label every SG boundary.</li>
          <li>Build the lab through section 6; curl the ALB DNS until responses alternate AZs.</li>
          <li>Break the health check (point it at /nope) and watch targets go unhealthy; fix it.</li>
          <li>Run the kill-1-instance self-heal demo; record time from terminate to InService.</li>
          <li>Load the box (<code>stress --cpu 2 --timeout 300</code>) and watch target-tracking add capacity.</li>
          <li>Add a second listener rule: <code>/api/*</code> → a new target group; verify path routing.</li>
          <li>Practice an instance-refresh rolling deploy with a v2 launch template (changed HTML).</li>
          <li>Run the full section-7 teardown and prove zero ALBs, ASGs, and running instances remain.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
