import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="CI / CD on AWS"
      title="CodePipeline + CodeBuild + CodeDeploy"
      intro="GitHub Actions builds your code; AWS Code services ship it inside AWS. CodePipeline orchestrates source → build → deploy stages, CodeBuild compiles and tests in a managed container, and CodeDeploy rolls the artifact onto EC2, Lambda, or ECS with hooks and rollbacks. You will map the services, write buildspec.yml and appspec.yml from scratch, wire a full pipeline, scope IAM roles, and debug failed builds like an on-call engineer."
      prev={{ href: "/cicd/github-actions", label: "GitHub Actions Basics" }}
      next={{ href: "/cicd/ecr-build-push", label: "Build & Push to ECR" }}
      resources={[
        {
          title: "CodePipeline concepts",
          url: "https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts.html",
          description:
            "Official pipeline, stage, action, and artifact model — read this alongside the service-map section.",
        },
        {
          title: "CodeBuild buildspec reference",
          url: "https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html",
          description:
            "Every buildspec phase, runtime, and artifacts option used in the CodeBuild section — keep it open while writing YAML.",
        },
        {
          title: "CodeDeploy AppSpec reference",
          url: "https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file.html",
          description:
            "AppSpec structure, hook order, and lifecycle events for the CodeDeploy section — the source of truth for hooks.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Service map: who does what in the release path</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Three services, three jobs. <strong>CodePipeline</strong> is the
          conveyor belt — it watches the <strong>source</strong> (CodeCommit,
          GitHub, S3) and moves versioned <strong>artifacts</strong> between
          stages. <strong>CodeBuild</strong> is the factory — it runs your{" "}
          <strong>buildspec.yml</strong> in a fresh container and emits a build
          artifact (zip, Docker image, test report). <strong>CodeDeploy</strong>{" "}
          is the delivery truck — it takes that artifact and installs it on{" "}
          <strong>EC2 / on-premises, Lambda, or ECS</strong> following your{" "}
          <strong>appspec.yml</strong> hooks, with health checks and automatic
          rollback.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`SOURCE ──artifact v1──> BUILD ──artifact v2──> DEPLOY ──> FLEET
  |                       |                       |                  |
  CodeCommit / GitHub     CodeBuild               CodeDeploy         EC2 / ECS / Lambda
  (commit  a1b2c3d)       (buildspec.yml:         (appspec.yml:      (agent or service
                           install/build/test)     hooks + files)     pulls + installs)

CodePipeline wraps all three:
  Stage: Source  ->  Stage: Build  ->  Stage: Deploy
  Action: GitHub    Action: CodeBuild  Action: CodeDeploy
  Output: source.zip Output: build.zip  (revision a1b2c3d tracked end-to-end)

Artifact bucket (S3): pipeline stores EVERY stage output here.
  s3://codepipeline-us-east-1-123456789012/myapp/SourceArti/abc.zip
  s3://codepipeline-us-east-1-123456789012/myapp/BuildArti/def.zip`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Artifacts are the contract:</strong> each stage consumes the
            previous stage&apos;s zip from S3. If a deploy is wrong, you can
            trace it to the exact build zip and the exact commit SHA.
          </li>
          <li>
            <strong>DevOps use:</strong> CodePipeline shines for
            AWS-native releases (ECS blue/green, Lambda canary, EC2 fleets)
            where deploy targets, rollback, and IAM all live inside AWS.
          </li>
        </ul>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          <strong>When to use Actions vs CodePipeline:</strong>
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-semibold">Signal</th>
                <th className="py-2 pr-4 font-semibold">Use GitHub Actions</th>
                <th className="py-2 font-semibold">Use CodePipeline</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Source of truth</td>
                <td className="py-2 pr-4">Code lives on GitHub, team reviews PRs there</td>
                <td className="py-2">Release must be visible/audited inside AWS console</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Deploy target</td>
                <td className="py-2 pr-4">Anything (push to ECR, call AWS APIs via OIDC)</td>
                <td className="py-2">EC2 fleet, ECS blue/green, Lambda alias shift — native actions</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Approvals</td>
                <td className="py-2 pr-4">Environments + required reviewers in GitHub</td>
                <td className="py-2">Manual approval action between stages in the pipeline</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Common pattern</td>
                <td className="py-2 pr-4">CI in Actions, then trigger CodePipeline for CD</td>
                <td className="py-2">Full AWS-native chain: Source → Build → Deploy in one view</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Hybrid is normal:</strong> run lint/test in Actions (fast PR
            feedback), then let CodePipeline own the blessed path to prod so
            every production deploy has the same artifact trail and approval
            gate.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">CodeBuild: buildspec.yml, compute, and logs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          CodeBuild runs your <strong>buildspec.yml</strong> top to bottom in a
          managed container: <strong>install</strong> (runtimes),{" "}
          <strong>pre_build</strong> (login, install deps), <strong>build</strong>{" "}
          (compile + test), <strong>post_build</strong> (package, tag images).
          The <strong>artifacts:</strong> block decides what CodeBuild zips to
          S3 for the next stage. Pick the smallest <strong>compute</strong> that
          finishes reliably — build minutes and bigger fleets cost more.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="buildspec.yml"
            code={`version: 0.2

env:
  variables:
    NODE_VERSION: "20"
    ARTIFACT_NAME: "myapp"
  # secrets-manager:   # prefer this over plaintext env for real keys
  #   NPM_TOKEN: myapp/npm:token

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - echo "Node $(node --version) on $(uname -m)"

  pre_build:
    commands:
      - echo "Logging in to ECR..."
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - npm ci

  build:
    commands:
      - echo "Build started on $(date)"
      - npm run build
      - npm test -- --ci --reporters=default

  post_build:
    commands:
      - echo "Build completed on $(date)"
      - docker build -t $IMAGE_REPO:$CODEBUILD_RESOLVED_SOURCE_VERSION .
      - docker push $IMAGE_REPO:$CODEBUILD_RESOLVED_SOURCE_VERSION

artifacts:
  files:
    - "**/*"
  base-directory: dist
  name: $ARTIFACT_NAME-$CODEBUILD_RESOLVED_SOURCE_VERSION.zip

reports:
  test-reports:
    files:
      - "test-results/*.xml"
    file-format: JUNITXML

cache:
  paths:
    - "/root/.npm/**/*"`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Phase order is fixed:</strong> install → pre_build → build →
            post_build. A failure in any phase fails the build — put tests in{" "}
            <strong>build</strong> so a red suite blocks the artifact, and image
            pushes in <strong>post_build</strong> so broken images never reach
            the registry.
          </li>
          <li>
            <strong>CODEBUILD_RESOLVED_SOURCE_VERSION:</strong> the exact commit
            SHA being built — use it as the image/artifact tag so every output
            traces to source (same idea as github.sha in Actions).
          </li>
          <li>
            <strong>Compute sizes:</strong> <strong>small</strong> (3 GB RAM, 2
            vCPU) for Node/Python builds; <strong>medium</strong> (7 GB, 4
            vCPU) for Java/Docker builds; <strong>large / 2xlarge</strong> only
            for monorepos or native compiles. Start small; scale up only when
            builds OOM or exceed timeout.
          </li>
          <li>
            <strong>Logs to CloudWatch:</strong> enable{" "}
            <strong>CloudWatch logs</strong> on the project (log group{" "}
            <strong>/aws/codebuild/myapp</strong>) plus S3 log backup. Tail a
            failed build with the group/stream from the console link — never
            guess, always read the failed phase first.
          </li>
          <li>
            <strong>DevOps use:</strong> cache <strong>/root/.npm</strong> or
            Docker layers to cut install time; export JUnit reports so
            CodeBuild shows per-test failures instead of one red blob.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws codebuild start-build --project-name myapp-build
aws codebuild batch-get-builds --ids myapp-build:abc12345 --query 'builds[0].{phase:currentPhase,status:buildStatus}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "build": {
    "id": "myapp-build:abc12345",
    "buildStatus": "IN_PROGRESS",
    "currentPhase": "BUILD"
  }
}
# On success:
# { "phase": "COMPLETED", "status": "SUCCEEDED" }
# Logs: https://console.aws.amazon.com/cloudwatch/.../log-group:/aws/codebuild/myapp`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">CodeDeploy: in-place vs blue/green and appspec.yml</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          CodeDeploy installs a revision on your fleet.{" "}
          <strong>In-place</strong> updates existing EC2 instances (cheap, brief
          downtime risk, needs the <strong>CodeDeploy agent</strong>).{" "}
          <strong>Blue/green</strong> spins a fresh fleet (or ECS task set) and
          shifts traffic only when healthy (zero-downtime, costs double during
          the switch). The <strong>appspec.yml</strong> at the bundle root
          declares <strong>files</strong>, <strong>permissions</strong>, and{" "}
          <strong>hooks</strong> — scripts that run at each lifecycle event.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`IN-PLACE (EC2, agent required)          BLUE/GREEN (EC2 ASG or ECS)
fleet: [A] [B] [C] (live traffic)       BLUE (live):  [A] [B]   GREEN (new): [A'] [B']
  stop app on A -> install -> start       deploy revision to GREEN only
  -> health check -> repeat B, C          test GREEN -> shift traffic (canary/all-at-once)
  rollback = redeploy last good rev       -> terminate BLUE. Rollback = shift traffic back.

Lifecycle order (EC2): ApplicationStop -> DownloadBundle -> BeforeInstall
  -> Install -> AfterInstall -> ApplicationStart -> ValidateService`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="appspec.yml"
            code={`version: 0.0
os: linux
files:
  - source: /
    destination: /var/www/myapp
    overwrite: true
permissions:
  - object: /var/www/myapp
    pattern: "**"
    owner: appuser
    group: appuser
    mode: 755
    type:
      - file
hooks:
  BeforeInstall:
    - location: scripts/cleanup.sh
      timeout: 120
      runas: root
  AfterInstall:
    - location: scripts/install_deps.sh
      timeout: 300
      runas: appuser
  ApplicationStart:
    - location: scripts/start_server.sh
      timeout: 120
      runas: appuser
  ValidateService:
    - location: scripts/health_check.sh
      timeout: 180
      runas: appuser`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>BeforeInstall:</strong> stop the old app, remove stale
            files — the cleanup step that prevents &quot;port already in
            use&quot; failures.
          </li>
          <li>
            <strong>AfterInstall:</strong> install dependencies, set
            permissions, render config — runs after files land but before the
            app starts.
          </li>
          <li>
            <strong>ApplicationStart + ValidateService:</strong> start the
            process, then curl the health endpoint and exit non-zero on failure
            — a failing ValidateService triggers automatic rollback.
          </li>
          <li>
            <strong>DevOps use:</strong> start with in-place + one instance for
            dev; require blue/green with ValidateService for prod so a bad
            revision never takes traffic.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws deploy create-deployment --application-name myapp --deployment-group-name myapp-prod --s3-location bucket=myapp-artifacts,key=build-abc.zip,bundleType=zip
aws deploy get-deployment --deployment-id d-ABC123XYZ --query 'deploymentInfo.{status:status,creator:creator}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "deploymentId": "d-ABC123XYZ"
}
# Lifecycle while running:
# ApplicationStop: Succeeded -> DownloadBundle: Succeeded -> BeforeInstall: Succeeded
# Install: Succeeded -> AfterInstall: Succeeded -> ApplicationStart: Succeeded
# ValidateService: InProgress...
# Final: { "status": "Succeeded", "creator": "codepipeline" }`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">CodePipeline A–Z: source → build → deploy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Build the pipeline end to end. The console path teaches the shape;
          the CLI path gives you a repeatable script. Every stage names its{" "}
          <strong>provider</strong> (GitHub, CodeBuild, CodeDeploy) and passes{" "}
          <strong>input/output artifacts</strong> forward — get those names
          right or stages cannot find each other&apos;s zips.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>A. Create the artifact bucket:</strong> one S3 bucket per
            pipeline (versioned). Never reuse a bucket you might delete — the
            pipeline breaks the moment it is gone.
          </li>
          <li>
            <strong>B. Source stage:</strong> provider <strong>GitHub
            (v2 / CodeStar connection)</strong>, repo <strong>you/myapp</strong>,
            branch <strong>main</strong>, output artifact{" "}
            <strong>SourceArtifact</strong>. Connect via the console OAuth flow
            once; the CLI reuses that connection ARN.
          </li>
          <li>
            <strong>C. Build stage:</strong> provider <strong>CodeBuild</strong>,
            project <strong>myapp-build</strong>, input{" "}
            <strong>SourceArtifact</strong>, output{" "}
            <strong>BuildArtifact</strong>. Uses the buildspec.yml from the
            previous section.
          </li>
          <li>
            <strong>D. Deploy stage:</strong> provider{" "}
            <strong>CodeDeploy</strong>, application <strong>myapp</strong>,
            deployment group <strong>myapp-prod</strong>, input{" "}
            <strong>BuildArtifact</strong>. Add a <strong>Manual approval</strong>{" "}
            action before this stage for prod.
          </li>
          <li>
            <strong>E. Release and watch:</strong> push to main → pipeline
            triggers → each stage turns green. Click a failed action →{" "}
            <strong>View logs</strong> jumps to CodeBuild/CloudWatch.
          </li>
          <li>
            <strong>F. Same flow in CLI:</strong> create the pipeline from a
            JSON skeleton, then start and poll it — the outputs below are what
            success looks like.
          </li>
        </ol>
        <div className="mt-3">
          <CodeBlock
            label="pipeline.json"
            code={`{
  "pipeline": {
    "name": "myapp-pipeline",
    "roleArn": "arn:aws:iam::123456789012:role/AWSCodePipelineServiceRole",
    "artifactStore": { "type": "S3", "location": "myapp-artifacts-123456789012" },
    "stages": [
      {
        "name": "Source",
        "actions": [{
          "name": "Source",
          "actionTypeId": { "category": "Source", "owner": "AWS", "provider": "CodeStarSourceConnection", "version": "1" },
          "outputArtifacts": [{ "name": "SourceArtifact" }],
          "configuration": {
            "ConnectionArn": "arn:aws:codestar-connections:us-east-1:123456789012:connection/abc",
            "FullRepositoryId": "you/myapp",
            "BranchName": "main"
          }
        }]
      },
      {
        "name": "Build",
        "actions": [{
          "name": "Build",
          "actionTypeId": { "category": "Build", "owner": "AWS", "provider": "CodeBuild", "version": "1" },
          "inputArtifacts": [{ "name": "SourceArtifact" }],
          "outputArtifacts": [{ "name": "BuildArtifact" }],
          "configuration": { "ProjectName": "myapp-build" }
        }]
      },
      {
        "name": "Deploy",
        "actions": [{
          "name": "Deploy",
          "actionTypeId": { "category": "Deploy", "owner": "AWS", "provider": "CodeDeploy", "version": "1" },
          "inputArtifacts": [{ "name": "BuildArtifact" }],
          "configuration": { "ApplicationName": "myapp", "DeploymentGroupName": "myapp-prod" }
        }]
      }
    ]
  }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws codepipeline create-pipeline --cli-input-json file://pipeline.json
aws codepipeline start-pipeline-execution --name myapp-pipeline
aws codepipeline get-pipeline-execution --pipeline-name myapp-pipeline --pipeline-execution-id abc123 --query 'pipelineExecution.status'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{ "pipeline": { "name": "myapp-pipeline", "version": 1 } }
{ "pipelineExecutionId": "abc123" }
"InProgress"
# Stage by stage:
# Source: Succeeded (commit a1b2c3d) -> Build: Succeeded (build abc12345) -> Deploy: Succeeded (d-ABC123XYZ)`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE TIER] First pipeline actions are limited-free</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            CodePipeline gives one active pipeline free each month; CodeBuild
            gives 100 build minutes/month; CodeDeploy is free for EC2 and
            on-premises. Stay on small CodeBuild compute and one dev pipeline
            while learning.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[PAID] Beyond the free action and minute limits</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            Extra active pipelines (~$1 each/month), additional CodeBuild
            minutes and larger compute, plus S3 artifact storage and data
            transfer, are billed. Add manual approvals and artifact retention
            cleanup before the team scales pipelines.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">IAM roles: one role per service, least privilege</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Never share one mega-role. The <strong>pipeline role</strong> moves
          artifacts, the <strong>build role</strong> compiles and pushes, the{" "}
          <strong>deploy role / instance profile</strong> installs. Each trusts
          only its service (<strong>codepipeline / codebuild / ec2
          .amazonaws.com</strong>) and grants only the buckets, repos, and log
          groups it needs.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="codepipeline-role-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ArtifactsOnly",
      "Effect": "Allow",
      "Action": ["s3:GetObject*", "s3:PutObject*", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::myapp-artifacts-123456789012",
        "arn:aws:s3:::myapp-artifacts-123456789012/*"
      ]
    },
    {
      "Sid": "StartBuildAndDeploy",
      "Effect": "Allow",
      "Action": ["codebuild:StartBuild", "codebuild:BatchGetBuilds", "codedeploy:CreateDeployment", "codedeploy:GetDeployment"],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/Project": "myapp"
        }
      }
    }
  ]
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="codebuild-role-policy.json"
            code={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Logs",
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:us-east-1:123456789012:log-group:/aws/codebuild/myapp*"
    },
    {
      "Sid": "PushImages",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Sid": "PushToMyRepo",
      "Effect": "Allow",
      "Action": ["ecr:BatchCheckLayerAvailability", "ecr:InitiateLayerUpload", "ecr:UploadLayerPart", "ecr:CompleteLayerUpload", "ecr:PutImage"],
      "Resource": "arn:aws:ecr:us-east-1:123456789012:repository/myapp"
    }
  ]
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Deploy side:</strong> EC2 instances carry an{" "}
            <strong>instance profile</strong> allowing{" "}
            <strong>s3:GetObject</strong> on the artifact bucket only — the
            agent pulls the bundle with no long-lived keys on disk.
          </li>
          <li>
            <strong>DevOps use:</strong> tag roles and resources (
            <strong>Project=myapp</strong>) and gate with conditions, so a dev
            pipeline role can never start prod builds or touch prod buckets.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Troubleshooting: failed build → logs → bucket</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every red pipeline resolves the same way: find which{" "}
          <strong>stage</strong> failed, read its <strong>phase or hook
          log</strong>, then check the <strong>artifact bucket</strong>. Do not
          re-run blindly — the log names the exact fix nine times out of ten.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`RED PIPELINE? Follow the chain:
  1. Pipeline view -> which STAGE is red? (Source / Build / Deploy)
  2a. Build red  -> CodeBuild -> failed PHASE -> CloudWatch log stream
  2b. Deploy red -> CodeDeploy -> failed HOOK (AfterInstall?) -> instance log
  3. Artifacts bucket: does SourceArti.zip / BuildArti.zip exist + non-empty?
  4. Fix code/config -> push commit -> new execution goes green`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws codepipeline get-pipeline-state --name myapp-pipeline --query 'stageStates[*].{stage:stageName,action:actionStates[0].latestExecution.status}'
aws logs tail /aws/codebuild/myapp --since 30m --format short
aws s3 ls s3://myapp-artifacts-123456789012/myapp/BuildArti/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[
  { "stage": "Source", "action": "Succeeded" },
  { "stage": "Build",  "action": "Failed" },
  { "stage": "Deploy", "action": "NotExecuted" }
]
# CloudWatch tail:
# [BUILD] npm test failed: 2 failing (auth.test.js:42) -- fix tests, not infra
# S3 check:
# 2026-05-01 10:14  18432012 BuildArti-abc123.zip   <- present, so Source->Build handoff OK`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Build red, deploy untouched:</strong> read the failed phase
            log first (usually <strong>BUILD: npm test</strong> or{" "}
            <strong>PRE_BUILD: ECR login</strong>). Fix, push, new execution.
          </li>
          <li>
            <strong>Deploy red:</strong> open the deployment&apos;s lifecycle
            events — a red <strong>AfterInstall</strong> means your script
            failed on the instance; SSH/SSM in and run it by hand to reproduce.
          </li>
          <li>
            <strong>DevOps use:</strong> link the CloudWatch log URL and the
            artifact S3 key in the incident ticket — the next engineer debugs
            in minutes, not hours.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Deleting the artifacts bucket:</strong> the pipeline&apos;s
            S3 store is load-bearing — delete it and every stage fails with
            AccessDenied. Protect it with versioning, block public access, and
            a lifecycle rule instead of manual cleanup.
          </li>
          <li>
            <strong>Missing CodeDeploy agent:</strong> custom AMIs without the
            agent show instances &quot;healthy&quot; but deployments hang at{" "}
            <strong>DownloadBundle</strong> forever. Bake the agent into the AMI
            (or user-data install) and check agent status before blaming YAML.
          </li>
          <li>
            <strong>No rollback plan:</strong> shipping without automatic
            rollback (or a ValidateService hook that can fail) turns one bad
            deploy into a full outage. Enable <strong>auto-rollback on
            failure</strong> and test it with a deliberately broken revision.
          </li>
          <li>
            <strong>One god-role for everything:</strong> giving CodeBuild{" "}
            <strong>s3:*</strong> and <strong>ecr:*</strong> means a compromised
            build can overwrite prod artifacts. Scope each role to its bucket,
            repo, and log group from day one.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Mini lab + hands-on practice (8 tasks)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Mini lab (~30 min):</strong> create the{" "}
          <strong>myapp-build</strong> CodeBuild project with the buildspec
          above, wire <strong>Source → Build → Deploy</strong> in CodePipeline
          to one EC2 instance, push a commit, and watch all three stages go
          green — then break a test on purpose and trace the red build through
          CloudWatch.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the Source → Build → Deploy artifact chain and explain which S3 zip each stage consumes.</li>
          <li>Write buildspec.yml with all four phases and a passing npm test; run one manual CodeBuild execution.</li>
          <li>Write appspec.yml with BeforeInstall, AfterInstall, ApplicationStart, and ValidateService hooks and deploy it once.</li>
          <li>Create the three-stage pipeline via console, then export it and recreate it from pipeline.json via CLI.</li>
          <li>Create the three least-privilege IAM roles and attach each to exactly one service.</li>
          <li>Break a unit test, push, and capture the failed-phase CloudWatch log URL as incident evidence.</li>
          <li>Trigger a failed deploy (bad hook script), confirm auto-rollback restores the last good revision.</li>
          <li>Delete nothing: prove the artifacts bucket has versioning on and document what breaks if it is removed.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
