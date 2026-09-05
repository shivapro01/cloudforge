import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="CI / CD on AWS"
      title="Start Here"
      intro="Manual deploys do not scale: SSH into a server, copy files, restart, hope it works — then repeat at 2am when it breaks. CI/CD replaces that chaos with a pipeline: every commit is built, tested, and deployed the same way, with review gates and one-click rollback. This module takes you from zero to a working GitHub Actions + AWS pipeline with Docker images in ECR."
      prev={{ href: "/cicd", label: "CI / CD on AWS" }}
      next={{ href: "/cicd/github-actions", label: "GitHub Actions Basics" }}
      resources={[
        {
          title: "GitHub Actions documentation",
          url: "https://docs.github.com/en/actions",
          description:
            "Official Actions reference — workflows, events, jobs, and runners. Read the get-started and core-concepts pages.",
        },
        {
          title: "What is CI/CD — freeCodeCamp",
          url: "https://www.freecodecamp.org/news/what-is-ci-cd/",
          description:
            "Beginner-friendly explainer of continuous integration vs continuous delivery with pipeline examples.",
        },
        {
          title: "AWS CodePipeline user guide",
          url: "https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html",
          description:
            "Official AWS guide to CodePipeline stages, actions, and how it compares to GitHub Actions for AWS deploys.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">What CI vs CD vs continuous deployment are</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Continuous Integration (CI)</strong> means every commit is
          automatically built and tested — merge small, catch breakage in
          minutes. <strong>Continuous Delivery (CD)</strong> means every good
          build becomes a <strong>deployable artifact</strong> (Docker image,
          zip, AMI) that can go to production with one approval click.{" "}
          <strong>Continuous Deployment</strong> removes the click: every good
          build goes to production automatically. Same pipeline, different
          release gate.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`commit (git push) ──> BUILD ──> TEST ──> PACKAGE ──> DEPLOY ──> VERIFY
       |                |         |          |             |            |
  dev pushes to    npm / pip   unit +     Docker image   dev → stage   smoke test
  main / PR        install +   lint +     tagged with    → prod        + rollback
                   compile     integ.     git SHA        (promotion)   on failure

  CI  = commit → build → test          (runs on every push / PR)
  CD  = package → stage → approve → prod (artifact promoted, human gate)
  Continuous Deployment = same flow, auto-promote to prod, no manual approve`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>CI answers:</strong> does this commit break the build or
            tests? Runs fast (minutes), blocks bad merges before they spread.
          </li>
          <li>
            <strong>Delivery answers:</strong> is there a tested, versioned
            artifact ready to ship? The <strong>same image tested in
            stage</strong> is what ships to prod — never rebuild between
            environments.
          </li>
          <li>
            <strong>Deployment answers:</strong> do we trust automation enough
            to skip the manual approve? Most teams start with delivery (manual
            approve to prod) and graduate to deployment for low-risk services.
          </li>
          <li>
            <strong>DevOps use:</strong> commit SHA becomes the release ID end
            to end — <strong>GITHUB_SHA → image tag → ECS task revision → CloudWatch
            log filter</strong>. You always know exactly what code is running
            where.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Why pipelines beat manual deploys</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A manual deploy is a snowflake: different person, different laptop,
          different forgotten step. A pipeline is a <strong>repeatable
          machine</strong>: same steps, same order, same logs, every time. That
          repeatability is what lets teams ship daily instead of monthly
          without fear.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Repeatability:</strong> build, test, and deploy run from
            code (<strong>.github/workflows/*.yml</strong>), not memory. New
            hire, on-call at 2am, or robot — identical result.
          </li>
          <li>
            <strong>Review gates:</strong> pull-request checks block merges
            until tests and lint pass; branch protection requires approval;
            prod deploy requires a manual approve or environment rule. Humans
            review, machines enforce.
          </li>
          <li>
            <strong>Rollback:</strong> every deploy is versioned (image tag{" "}
            <strong>v1.2.3 / abc1234</strong>), so rollback is redeploying the
            last good tag — one command, minutes, no rebuilding from a laptop.
          </li>
          <li>
            <strong>Audit trail:</strong> who triggered, what commit, what
            tests passed, where it deployed — all logged. Manual SSH leaves no
            trace; pipelines are your incident timeline for free.
          </li>
          <li>
            <strong>DevOps use:</strong> pipelines gate infra changes too —
            Terraform plan on PR, apply only on merge to main, with{" "}
            <strong>CodePipeline / Actions environments</strong> requiring a
            second approver for prod.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Manual deploy: unrepeatable, untraceable
scp app.zip ec2-user@prod:/srv/app && ssh ec2-user@prod "unzip -o app.zip && sudo systemctl restart app"

# Pipeline deploy: versioned, reviewable, repeatable
git log --oneline -3
git tag v1.2.3 && git push origin v1.2.3   # pipeline builds + tests + deploys tag v1.2.3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`a1b2c3d (tag: v1.2.3) Add health check endpoint
9f8e7d6 Fix login retry bug
7c4d5e6 Bump dependencies
# pipeline: build a1b2c3d -> test PASS -> image :a1b2c3d -> stage OK -> prod approved
# rollback = redeploy previous tag, no rebuild needed`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tool map for this module</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You do not need every tool — you need the right one per job. This
          module uses <strong>GitHub Actions</strong> as the pipeline engine,{" "}
          <strong>ECR</strong> as the artifact store, and{" "}
          <strong>AWS deploy targets</strong> (EC2 / ECS / Lambda) at the end.
          Native <strong>CodePipeline / CodeBuild / CodeDeploy</strong> appear
          so you can read them in AWS jobs.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>GitHub Actions — pipeline engine:</strong> runs workflows
            on push/PR. Use for CI (build/test/lint), building Docker images,
            and deploying to AWS via OIDC. Free minutes for public repos; where
            you will spend 80% of this module.
          </li>
          <li>
            <strong>AWS CodePipeline + CodeBuild + CodeDeploy — AWS-native chain:</strong>{" "}
            Pipeline (orchestrator) → Build (compile/test) → Deploy
            (rolling/blue-green to EC2/ECS/Lambda). Use when the job requires
            all-AWS audit, or the repo lives in CodeCommit. Covered so you can
            compare, not as the main build tool.
          </li>
          <li>
            <strong>Amazon ECR — artifact registry:</strong> stores versioned
            Docker images (<strong>repo:tag</strong>). Use for every
            container deploy — Actions builds and pushes, ECS/EC2 pulls. Never
            deploy an untagged <strong>:latest</strong> to prod.
          </li>
          <li>
            <strong>Deployment strategies — release safety:</strong> rolling,
            blue/green, canary (full lesson later). Use rolling for simple
            apps, blue/green or canary when downtime or bad deploys cost money.
          </li>
          <li>
            <strong>When to pick which:</strong> learning / side project / GitHub
            repo → Actions. Enterprise all-AWS shop → CodePipeline. Containers
            anywhere → ECR in both cases. Interviews ask you to compare all
            three — this module gives you that answer.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`YOUR REPO (GitHub)                AWS
+------------------+     push/PR     +-----------------+     push     +--------+
|  app code +      |  ----------->  | GitHub Actions  |  ---------->  |  ECR   |
|  Dockerfile +    |   workflow      | build/test/push |  image:SHA    | images |
|  ci.yml          |   runs here     +--------+--------+               +---+----+
+------------------+                          | deploy                      | pull
                                              v                             v
                                     +-----------------+           +--------+--------+
                                     | CodePipeline *  |  (alt.)   | ECS / EC2 /     |
                                     | (AWS-native)    |  -------> | Lambda (run it) |
                                     +-----------------+           +-----------------+

* You learn Actions first; CodePipeline lesson maps each box 1:1.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Artifacts and environments: build once, promote everywhere</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Golden rule: <strong>build once, promote the same artifact</strong>.
          The image tested in dev is the image that runs in prod — only config
          (env vars, secrets, URLs) changes per environment. Rebuilding per
          environment is how untested code reaches production.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`BUILD ONCE (CI)                    PROMOTE SAME ARTIFACT (CD)
+-------------------+               +-------+     +-------+     +-------+
| build commit      |               |  DEV  | --> | STAGE | --> | PROD  |
| abc1234           |               | auto  |     | auto  |     |MANUAL |
| image:myapp:      |  ───────────> | deploy|     | deploy|     |APPROVE|
|   abc1234         |  same digest  | smoke |     | e2e   |     | prod  |
+-------------------+  all the way  +---+---+     +---+---+     +---+---+
  version = git SHA + tag v1.2.3        |             |             |
  immutable in ECR                      DEBUG fast    MIRROR prod   ROLLBACK =
                                        fake data     real-ish data redeploy last tag`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Versioning:</strong> tag every image with the Git SHA
            (<strong>myapp:abc1234</strong>) plus a human tag (
            <strong>v1.2.3</strong>). SHA is exact, semver is readable — keep
            both, deploy by SHA.
          </li>
          <li>
            <strong>Dev:</strong> auto-deploy every push, debug fast, fake
            data, no approval. Breakage is cheap here.
          </li>
          <li>
            <strong>Stage:</strong> mirrors prod (same instance type, same env
            shape), runs end-to-end tests. Promote only what passed stage.
          </li>
          <li>
            <strong>Prod:</strong> manual approval + restricted IAM +
            blue/green or canary. Rollback means pointing back at the previous
            immutable tag — never <strong>:latest</strong>.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker images | grep myapp
aws ecr describe-images --repository-name myapp --query 'imageDetails[*].[imageTags]' --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`myapp   abc1234   a1b2c3d4   2 minutes ago   128MB
myapp   v1.2.3    a1b2c3d4   2 minutes ago   128MB
# same digest, two tags -> build once, readable + exact`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">What you will build in this module (5 topics + final lab)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Five lessons in order, ending with a full pipeline lab. Do them in
          sequence — each one assumes the previous. By the end you will have a
          repo that tests itself, builds Docker images, pushes to ECR, and
          deploys to AWS with a safe strategy.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>1. Start Here (this page):</strong> CI vs CD vs continuous
            deployment, artifacts, environments, and the tool map.
          </li>
          <li>
            <strong>2. GitHub Actions Basics:</strong> workflows, events, jobs,
            first <strong>ci.yml</strong>, secrets, caching, and OIDC intro.
          </li>
          <li>
            <strong>3. AWS CodePipeline &amp; Code Services:</strong>{" "}
            CodePipeline + CodeBuild + CodeDeploy, and when to choose them over
            Actions.
          </li>
          <li>
            <strong>4. ECR — Build &amp; Push Images:</strong> Dockerize the
            app, tag by SHA, push to ECR, pull and run anywhere.
          </li>
          <li>
            <strong>5. Deployment Strategies:</strong> rolling vs blue/green vs
            canary — pick safety level per app.
          </li>
          <li>
            <strong>6. Final lab — Full Pipeline:</strong> push to main →
            tests → image → ECR → deploy to AWS with OIDC, approvals, and
            rollback drill.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Prereqs checklist</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You do not need to be an expert, but these three must be ready or
          you will stall in lesson 2. Check each one now.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Git Module 03 (add / commit / push + branches):</strong>{" "}
            you can clone, branch, push, and open a PR without notes. Pipelines
            trigger from Git — shaky Git means shaky everything.
          </li>
          <li>
            <strong>AWS CLI installed + configured:</strong>{" "}
            <strong>aws --version</strong> works and{" "}
            <strong>aws sts get-caller-identity</strong> returns your account.
            Lessons 3–6 call ECR, IAM, and deploy targets constantly.
          </li>
          <li>
            <strong>Docker — installed later is fine:</strong> needed from the
            ECR lesson onward, not today. Install when lesson 4 says so; just
            confirm your machine can run Docker (not a tiny Chromebook without
            Linux support).
          </li>
          <li>
            <strong>Free GitHub account + a practice repo:</strong> public repo
            named <strong>cicd-practice</strong> with a README. Public = free
            Actions minutes without card anxiety.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git --version && aws --version
aws sts get-caller-identity --query '[Account, Arn]' --output table
docker --version || echo "Docker later - OK for this lesson"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`git version 2.43.0
aws-cli/2.15.0 Python/3.11.0
--------------------------------
|  123456789012 | arn:aws:iam::123456789012:user/shiva |
--------------------------------
Docker version 25.0.0 (or "Docker later - OK for this lesson")`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE TIER] This module starter is free</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            GitHub Actions on public repos, CodePipeline free-tier allowance,
            and ECR 500 MB storage are free-tier friendly. Paid usage starts
            only with heavy build minutes, large image storage, or always-on
            deploy targets — the lab calls those out before you click.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Protect main:</strong> require PR + passing CI + one review
            before merge. Nobody pushes to main directly — the pipeline is the
            bouncer.
          </li>
          <li>
            <strong>Tag releases from Git:</strong> <strong>git tag v1.2.3</strong>{" "}
            triggers the release pipeline; the tag + SHA follow the artifact
            into dashboards, alerts, and incident notes.
          </li>
          <li>
            <strong>Separate build from deploy:</strong> CI builds and tests on
            every PR; CD deploys only from main/tags with environment
            approvals. Fast feedback, safe releases.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Deploying from a laptop:</strong> works once, breaks
            silently later. If it is not in the pipeline, it did not happen —
            put every step in <strong>ci.yml</strong>.
          </li>
          <li>
            <strong>Rebuilding per environment:</strong> building a fresh binary
            for prod means prod runs untested code. Build once, promote the
            digest.
          </li>
          <li>
            <strong>Using :latest in prod:</strong> you cannot tell what is
            running or roll back precisely. Pin <strong>:SHA + :v1.2.3</strong>{" "}
            and deploy the SHA.
          </li>
          <li>
            <strong>Skipping the pipeline for hotfixes:</strong> emergency SSH
            edits drift prod away from Git. Hotfix via branch + PR + pipeline
            even in incidents — speed comes from practice, not shortcuts.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (6 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create a public repo named cicd-practice and draw the commit → build → test → deploy diagram from memory.</li>
          <li>Write one sentence each for CI, continuous delivery, and continuous deployment without looking.</li>
          <li>Run git log --oneline -3 plus aws sts get-caller-identity and confirm Git + AWS CLI both work.</li>
          <li>List which tool you would use for: running tests on PRs, storing Docker images, orchestrating all-AWS stages — and why.</li>
          <li>Explain build-once-promote-everywhere to a friend: why the prod image must equal the stage image.</li>
          <li>Plan your week: assign one day each to Actions, CodePipeline, ECR, strategies, and the final lab.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
