import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="CI / CD on AWS"
      title="Deployment Strategies"
      intro="Shipping code is easy — shipping it without downtime, angry users, or a 2 AM rollback is the real skill. This lesson compares the four strategies you will meet in every DevOps interview and on-call rotation: rolling, blue/green, canary, and feature flags. You will see how each maps to AWS services (ASG, CodeDeploy, ALB), what each costs, and how to choose — then simulate a rolling deploy on the ASG you built in Module 04."
      prev={{ href: "/cicd/ecr-build-push", label: "Build & Push to ECR" }}
      next={{ href: "/cicd/pipeline-lab", label: "Full Pipeline Lab" }}
      resources={[
        {
          title: "CodeDeploy deployment configurations",
          url: "https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html",
          description:
            "Rolling, all-at-once, and blue/green options explained — which batch sizes and alarms each configuration uses.",
        },
        {
          title: "Application Load Balancer listener rules and weights",
          url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-update-rules.html",
          description:
            "How weighted target groups route x% of traffic — the mechanism behind canary and blue/green switches.",
        },
        {
          title: "Docker rolling updates concepts",
          url: "https://docs.docker.com/engine/swarm/swarm-tutorial/rolling-update/",
          description:
            "Hands-on rolling-update mental model: batches, parallelism, and rollback on failure.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Why strategy matters: downtime and blast radius</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every deploy answers two questions: <strong>will users notice downtime?</strong> and{" "}
          <strong>if this build is bad, how many users get hurt before we stop it?</strong> A{" "}
          <strong>stop-the-world deploy</strong> (kill everything, start the new version) fails both —
          users see errors during the gap, and 100% of traffic hits the bad build instantly. A{" "}
          <strong>strategy</strong> controls the order instances are replaced, how traffic shifts, and how
          fast you can roll back.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`BLAST RADIUS BY STRATEGY (same bad build v2, 10 instances)
Recreate (stop all, start all):   [XXXXXXXXXX]  100% broken, downtime gap
Rolling (2 at a time):            [vvXXXXXXXX]  ~20% broken at any moment, zero downtime
Blue/Green (flip at end):         [bbbbbbbbbb] > [gggggggggg]  0% broken until flip, then 100% (fast rollback)
Canary (10% -> 50% -> 100%):      [v---------]  10% broken first -> alarm fires -> auto-rollback

v = new/bad version   X/- = old version   b = blue (live)   g = green (new)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Downtime:</strong> strategies that keep old capacity serving (rolling, blue/green,
            canary) give <strong>zero-downtime deploys</strong> — the load balancer always has healthy
            targets. Recreate gives a gap where nothing serves.
          </li>
          <li>
            <strong>Blast radius:</strong> canary limits a bad deploy to <strong>x% of users</strong> for
            minutes, with an automatic alarm-driven rollback. Recreate and full blue/green flips expose{" "}
            <strong>100%</strong> at the switch moment.
          </li>
          <li>
            <strong>DevOps use:</strong> every deploy ticket names the strategy, the batch/percent steps,
            the health check that gates each step, and the rollback command. No strategy = no safe prod
            deploy.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Rolling: replace in batches behind the load balancer</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Rolling</strong> replaces instances a few at a time: take batch 1 out of the target
          group, terminate and relaunch it on the new AMI/launch template, wait for{" "}
          <strong>health checks to pass</strong>, then move to batch 2. Users never see downtime because
          the remaining old instances keep serving, and a bad build only ever poisons one batch before the
          deploy halts.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`ROLLING DEPLOY, 6 instances, batch size 2 (ALB in front)
Step 0  ALB -> [v1][v1][v1][v1][v1][v1]   all healthy, serving
Step 1  ALB -> [v2][v2][v1][v1][v1][v1]   batch 1 draining + relaunching
             wait: ELB health check 2x healthy before continuing
Step 2  ALB -> [v2][v2][v2][v2][v1][v1]   batch 2 done
Step 3  ALB -> [v2][v2][v2][v2][v2][v2]   complete, zero downtime throughout
FAIL CASE: batch 1 health checks fail -> HALT, batches 2-3 stay on v1`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          On AWS the classic rolling path is an <strong>Auto Scaling Group with an instance refresh</strong>,
          or <strong>CodeDeploy in-place</strong>. Start an instance refresh against the new launch
          template version — the ASG replaces instances per your min-healthy percentage and the ALB health
          check gates every step.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws autoscaling start-instance-refresh --auto-scaling-group-name myapp-asg \\
  --preferences '{"MinHealthyPercentage": 75, "InstanceWarmup": 120, "SkipMatching": true}' \\
  --region us-east-1
aws autoscaling describe-instance-refreshes --auto-scaling-group-name myapp-asg --region us-east-1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "InstanceRefreshId": "08b42b9a-8c7d-4f1a-9e2b-abc123",
  "Status": "InProgress",
  "Preferences": { "MinHealthyPercentage": 75, "InstanceWarmup": 120 }
}
{
  "InstanceRefreshes": [{
    "Status": "InProgress",
    "PercentageComplete": 33,
    "InstancesToUpdate": 6,
    "InstancesUpdated": 2
  }]
}
# Verify: 2/6 replaced, rest still serving v1 -> zero downtime`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws deploy create-deployment --application-name myapp --deployment-group-name myapp-asg-dg \\
  --deployment-config-name CodeDeployDefault.OneAtATime \\
  --s3-location bucket=myapp-bundles,key=myapp-v2.zip,bundleType=zip --region us-east-1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "deploymentId": "d-ABC123XYZ",
  "status": "Created"
}
# CodeDeploy replaces ONE instance at a time, runs ValidateService hooks,
# halts the whole deployment on first failed health check.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Pros:</strong> no extra capacity cost (same ASG size), zero downtime, simple to run —
            the default for stateless web fleets.
          </li>
          <li>
            <strong>Cons:</strong> slow on large fleets, <strong>two versions serve simultaneously</strong>{" "}
            mid-deploy (API must stay backward compatible), rollback = another slow rolling deploy in
            reverse.
          </li>
          <li>
            <strong>DevOps use:</strong> set <strong>MinHealthyPercentage 75–90</strong>, require ELB health
            checks (not just EC2 status), and warmup ≥ app boot time so slow starters are not marked
            healthy too early.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Blue/Green: two environments, one instant switch</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Blue (live)</strong> serves 100% of traffic while you build <strong>Green (new)</strong>{" "}
          as a full parallel copy — new ASG, new target group, smoke-tested end to end. When green is
          proven healthy, you <strong>flip the ALB listener</strong> to the green target group in seconds.
          If anything looks wrong, flip back: <strong>instant rollback</strong> because blue is still warm
          and untouched.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`BEFORE SWITCH                    AFTER SWITCH (flip in seconds)
                  +--------+                  +--------+
Internet -> ALB :443 ------+-> [BLUE TG]      Internet -> ALB :443 ------+-> [GREEN TG]
(listener)      | 100%  v1 |  (live, warm)    (listener)      | 100%  v2 |  (live, tested)
                +-> [GREEN TG]  0%  v2         +-> [BLUE TG]   0%  v1 (kept warm 30 min)
                (tested, waiting)                              (instant rollback target)

Rollback = one CLI call re-pointing the listener to BLUE TG, ~5 seconds.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Switch ALB listener from blue TG to green TG
aws elbv2 modify-listener --listener-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/myapp/abc \\
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/myapp-green/xyz \\
  --region us-east-1
# Rollback is the same command with the blue target group ARN`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "Listeners": [{
    "ListenerArn": "arn:...:listener/app/myapp/abc",
    "Port": 443,
    "DefaultActions": [{
      "Type": "forward",
      "TargetGroupArn": "arn:...:targetgroup/myapp-green/xyz"
    }]
  }]
}
# Verify: curl the ALB 5x -> all responses carry X-Version: v2 header`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Pros:</strong> full pre-switch testing on production-identical infra,{" "}
            <strong>instant rollback</strong>, clean story for big rewrites and AMI swaps.
          </li>
          <li>
            <strong>Cons:</strong> you run <strong>double capacity</strong> during the deploy window, plus
            data-layer complexity — two app versions sharing one database must both work against the same
            schema.
          </li>
          <li>
            <strong>DevOps use:</strong> CodeDeploy blue/green automates the clone → test → flip → keep-or-
            terminate flow; keep blue warm ~30 minutes post-switch, then terminate to stop paying double.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID] Blue/Green runs double infra</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            Two ASGs, double EC2 hours, and an ALB running throughout — none of this fits cleanly in Free
            Tier at scale. Time-box the green environment (build → test → flip → terminate blue within the
            hour) and never leave both fleets running overnight.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Canary: shift x% of traffic, let alarms decide</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Canary</strong> sends a small slice of live traffic (5–10%) to the new version and watches{" "}
          <strong>CloudWatch alarms</strong> (5xx rate, p99 latency, failed health checks). If metrics stay
          clean for the bake window, shift more (10 → 50 → 100%); if any alarm fires, traffic snaps back to
          the old version <strong>automatically</strong>. The canary users are the early-warning system — a
          bad build hurts 10 users, not 10,000.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`CANARY WITH ALB WEIGHTED TARGET GROUPS + CLOUDWATCH AUTO-ROLLBACK
ALB listener :443
  |- weight 90 -> [v1 TARGET GROUP] (stable, 9/10 requests)
  +- weight 10 -> [v2 TARGET GROUP] (canary, 1/10 requests)
                        |
        CloudWatch alarms watch v2: HTTPCode_Target_5XX_Count, TargetResponseTime p99
                        |
   bake 15 min clean -> shift to 50/50 -> bake -> shift to 0/100 (done)
   ANY alarm fires   -> weights snap back to 100/0 automatically (rollback)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 10% canary: weighted forward action on the ALB listener
aws elbv2 modify-listener --listener-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/myapp/abc \\
  --default-actions Type=forward,ForwardConfig='{"TargetGroups":[{"TargetGroupArn":"arn:...:targetgroup/myapp-v1/aaa","Weight":90},{"TargetGroupArn":"arn:...:targetgroup/myapp-v2/bbb","Weight":10}]}' \\
  --region us-east-1
# Promote: re-run with weights 0/100. Rollback: re-run with weights 100/0.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "Listeners": [{
    "DefaultActions": [{
      "Type": "forward",
      "ForwardConfig": { "TargetGroups": [
        { "TargetGroupArn": "arn:...:myapp-v1/aaa", "Weight": 90 },
        { "TargetGroupArn": "arn:...:myapp-v2/bbb", "Weight": 10 }
      ]}
    }]
  }]
}
# Verify: CloudWatch TargetResponseTime p99 for v2 TG flat for 15 min -> promote to 50/50`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Pros:</strong> smallest blast radius, data-driven promotion, automatic rollback on
            alarms — the safest way to ship risky changes.
          </li>
          <li>
            <strong>Cons:</strong> most complex to set up (weighted routing + per-version metrics + alarm
            actions), canary needs enough traffic to be statistically meaningful, sticky sessions complicate
            weight math.
          </li>
          <li>
            <strong>DevOps use:</strong> CodeDeploy&apos;s <strong>Canary10Percent15Minutes</strong> config
            plus a CloudWatch alarm wired to auto-rollback is the managed version of this exact flow.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Feature flags vs deployments: decouple release from rollout</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Deployments</strong> put code on servers; <strong>feature flags</strong> decide which
          users execute it. With a flag (LaunchDarkly-style, or AWS AppConfig), you can deploy v2 to 100%
          of instances with the new checkout flow <strong>flagged off</strong>, then enable it for 5% of
          users, watch metrics, and ramp — or kill the flag instantly with <strong>zero redeploy</strong>.
          Flags turn every risky launch into a canary you control from a dashboard.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`WITHOUT FLAGS:  deploy v2 = 100% of users get new checkout NOW (scary)
WITH FLAGS:     deploy v2 (flag OFF) -> 0% see it -> flag ON for 5% -> metrics OK
                -> 50% -> 100% ... bug found? -> flag OFF in seconds, code stays deployed

Deploy (pipeline job)  vs  Release (flag flip by PM/on-call, no pipeline run)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>When flags win:</strong> UI changes, pricing logic, risky refactors — anything you want
            to toggle per user, region, or plan tier without a redeploy.
          </li>
          <li>
            <strong>When deployments win:</strong> infra changes, DB drivers, security patches — code that
            cannot be branched at runtime still needs rolling or blue/green.
          </li>
          <li>
            <strong>DevOps use:</strong> deploy with flags defaulting <strong>off</strong>, gate flag flips
            behind the same CloudWatch alarms as a canary, and clean up dead flags — flag debt rots
            readability fast.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Choosing: risk, cost, complexity, and the AWS mapping</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Pick the cheapest strategy that covers the risk. Routine stateless web deploys get rolling;
          big-bang rewrites get blue/green; high-risk payment paths get canary; user-facing experiments get
          flags on top of any of them.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`STRATEGY      RISK/BLAST RADIUS   COST            COMPLEXITY   AWS MAPPING
Rolling       low (one batch)     $ (same ASG)    low          ASG instance refresh / CodeDeploy in-place
Blue/Green    medium (flip=100%)  $$$ (double)    medium       CodeDeploy blue/green + ALB target swap
Canary        lowest (x% first)   $$ (canary TG)   high         ALB weighted TGs + CloudWatch alarms + auto-rollback
Feature flag  lowest (per user)   $ (config only) medium       AppConfig / LaunchDarkly-style + any deploy above
Recreate      highest (100%+gap)  $ (same boxes)  trivial      never for prod (dev/test only)

Rule of thumb: rolling by default, blue/green for rewrites,
canary for money paths, flags for product experiments.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>No health checks gating the deploy:</strong> EC2 &quot;running&quot; is not
            &quot;serving&quot;. Without ELB <strong>/health</strong> checks per batch, broken instances
            join the target group and the deploy marches on over corpses.
          </li>
          <li>
            <strong>No rollback plan:</strong> &quot;we&apos;ll figure it out&quot; at 2 AM means a 40-minute
            outage. Every deploy needs a one-command rollback (previous launch template version, blue TG
            ARN, or 100/0 weight flip) tested before the deploy starts.
          </li>
          <li>
            <strong>DB migrations coupled to the deploy:</strong> a migration that drops a column breaks the
            old version still serving mid-rolling-deploy. Use <strong>expand-then-contract</strong>: add
            nullable columns first, deploy code that reads both, then remove the old column in a later
            release.
          </li>
          <li>
            <strong>Canary with no traffic or no alarms:</strong> 10% of zero requests proves nothing, and a
            canary nobody watches is just a slow bad deploy. Require minimum request counts and alarm-driven
            auto-rollback.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Mini lab + hands-on practice (8 tasks)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Mini lab (~30 min):</strong> reuse the ASG + ALB from Module 04, cut a v2 launch template
          (new message on the health endpoint), run an <strong>instance refresh</strong>, watch batches
          replace with zero failed requests, then sketch the blue/green and canary equivalents.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the blast-radius diagram for recreate vs rolling vs blue/green vs canary and explain each to a peer.</li>
          <li>Simulate a rolling deploy: create a v2 launch template from your Module 04 ASG and start an instance refresh with MinHealthyPercentage 75.</li>
          <li>Watch describe-instance-refreshes hit 33% → 66% → 100% while curling the ALB with zero failed requests.</li>
          <li>Draft the ALB listener swap commands for a blue/green flip and the one-command rollback; note the double-capacity cost window.</li>
          <li>Draft a 90/10 weighted listener rule for a canary and name the two CloudWatch alarms that would auto-roll it back.</li>
          <li>Write one feature-flag check (newCheckout flag) and describe how it turns a deploy into a per-user canary.</li>
          <li>Fill the choosing table for your own app: which strategy for routine deploys, rewrites, and payment-path changes?</li>
          <li>Break it on purpose: deploy a v2 with a failing /health endpoint and prove the rolling deploy halts at the first batch.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
