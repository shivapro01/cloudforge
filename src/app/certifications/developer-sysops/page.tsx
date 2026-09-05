import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Certifications & Path"
      title="Developer + SysOps Associate"
      intro="The Developer Associate (DVA-C02) and SysOps Administrator Associate (SOA-C02) are the two exams that turn architects into operators: CI/CD pipelines, Lambda and event-driven builds, plus deploying, monitoring, and troubleshooting live systems. Study them as a pair — their DevOps overlap is large enough that one preparation earns two certifications."
      prev={{ href: "/certifications/solutions-architect", label: "Solutions Architect Associate" }}
      next={{ href: "/certifications/devops-professional", label: "DevOps Engineer Professional" }}
      resources={[
        {
          title: "AWS Certification — exam guides",
          url: "https://aws.amazon.com/certification/",
          description:
            "Official exam guides for both DVA-C02 and SOA-C02: domains, weights, and sample questions.",
        },
        {
          title: "AWS Skill Builder — Associate prep plans",
          url: "https://skillbuilder.aws/",
          description:
            "Free learning plans and practice questions for the Developer and SysOps learning paths.",
        },
        {
          title: "AWS Documentation — Lambda, Code services, CloudWatch",
          url: "https://docs.aws.amazon.com/",
          description:
            "The three doc sets behind most DevOps-relevant questions: serverless, CI/CD, observability.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Why take these two together</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Developer tests whether you can <em>build and ship</em> on AWS; SysOps tests whether
          you can <em>run and fix</em> on AWS. For a DevOps engineer those are one job, and the
          syllabi agree: both exams lean on Lambda and event patterns, IAM roles for services,
          CloudWatch/CloudTrail observability, and deployment automation. Study the shared core
          once, sit the exams back-to-back within two to three weeks, and the second exam feels
          like a retake with different framing.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Developer Associate: DevOps-relevant domains</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          DVA-C02 centers on development and delivery. The highest-yield areas for your career are
          the CI/CD domain (CodeCommit/CodeBuild/CodeDeploy/CodePipeline wiring), the Lambda
          domain (event sources, concurrency, versions and aliases), and application security
          through IAM roles, Secrets Manager, and encrypted environment variables. Storage and
          database questions mostly test choosing S3, DynamoDB, and caches correctly from code —
          SDK behavior, retries, and idempotency rather than infrastructure setup.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">SysOps Associate: DevOps-relevant domains</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          SOA-C02 centers on operating live systems. Its DevOps gold is deployment and
          provisioning (CloudFormation, CodeDeploy strategies, multi-account patterns),
          monitoring and logging (CloudWatch alarms, dashboards, centralized logging with
          CloudTrail), and reliability plus troubleshooting (Auto Scaling policies, failover,
          root-causing deployment and connectivity failures). Where Developer asks
          &quot;how do you ship it?&quot;, SysOps asks &quot;it broke at 2 AM — what do you check
          first?&quot; — and both answers live in your monitoring and pipeline labs.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Study once, book back-to-back</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The efficiency trick is sequencing shared topics first, exam-specific corners second.
          Spend the first four weeks on the overlap — Lambda, CI/CD services, IAM roles,
          CloudWatch/CloudTrail, deployment strategies — using your real pipeline and serverless
          projects as labs. Then give one week to Developer-only corners (SDKs, DynamoDB patterns,
          API Gateway details) and one week to SysOps-only corners (CloudFormation parameters,
          account/organizations structure, troubleshooting runbooks). Book Developer first, SysOps
          two weeks later, and apply the 50% voucher from each pass to the next booking.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Schedule"
            code={`Weeks 1-2 — Shared core: compute + delivery
  Lambda (triggers, concurrency, aliases) + CodePipeline/CodeBuild/CodeDeploy end-to-end

Weeks 3-4 — Shared core: operate + observe
  CloudWatch alarms/dashboards/logs + CloudTrail + deployment strategies (rolling/blue-green)

Week 5 — Developer corners + DVA exam
  SDK retries/idempotency, DynamoDB keys, API Gateway; timed mocks -> sit DVA-C02

Week 6 — SysOps corners + SOA exam
  CloudFormation, Organizations, troubleshooting drills; timed mocks -> sit SOA-C02`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Verify with the AWS CLI</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Both exams reward CLI-verified knowledge over slide memory. Prove a Lambda deploy, a
          pipeline execution, and an alarm state from the terminal — if you can query the real
          state of all three, the corresponding exam questions turn into recall of things
          you&apos;ve done.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws lambda get-function --function-name orders-api --query "Configuration.[Runtime,Handler,LastUpdateStatus]"
aws codepipeline get-pipeline-state --name ecs-deploy --query "stageStates[].[stageName,latestExecution.status]"
aws cloudwatch describe-alarms --state-value ALARM --query "MetricAlarms[].[AlarmName,MetricName]" --output table`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Classic mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Studying the pair as two separate courses:</strong> doubling the material
            burns you out — the overlap is the syllabus, and the exam-specific corners are each
            about a week.
          </li>
          <li>
            <strong>Knowing pipeline service names but never running one:</strong> CodeDeploy
            strategy and pipeline failure questions punish pure theory — ship the ECS pipeline
            project first, then the questions answer themselves.
          </li>
          <li>
            <strong>Skipping troubleshooting reps:</strong> SysOps scenario questions assume you
            have read real CloudWatch logs and alarm histories — practice root-causing one broken
            deploy per week during study.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tasks (6)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Deploy one Lambda with an alias + version and invoke both versions via the CLI.</li>
          <li>Run a full CodePipeline execution (source → build → deploy) on your own repo.</li>
          <li>Create one CloudWatch alarm with an SNS action and trigger it on purpose.</li>
          <li>Do 30 mixed DVA/SOA questions, tagging misses as shared-core vs exam-specific.</li>
          <li>Sit Developer first; schedule SysOps within two weeks while overlap recall is fresh.</li>
          <li>Write a one-page troubleshooting runbook (alarm → logs → trail → rollback) from your own labs.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
