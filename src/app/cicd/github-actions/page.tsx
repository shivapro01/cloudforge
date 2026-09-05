import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="CI / CD on AWS"
      title="GitHub Actions Basics"
      intro="GitHub Actions is the pipeline engine for this module: every push or pull request can build, test, and package your app automatically. You will learn workflows, events, jobs, and runners — then write your first ci.yml, read its green checks, cache dependencies, handle secrets safely, and meet OIDC, the keyless way Actions talks to AWS."
      prev={{ href: "/cicd/overview", label: "Start Here" }}
      next={{ href: "/cicd/aws-code-services", label: "AWS Code Services" }}
      resources={[
        {
          title: "GitHub Actions quickstart",
          url: "https://docs.github.com/en/actions/get-started/quickstart",
          description:
            "Official 5-minute first-workflow tutorial — create ci.yml, push, and watch it run. Do this alongside the lesson.",
        },
        {
          title: "Understanding GitHub Actions",
          url: "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions",
          description:
            "Core concepts: workflows, events, jobs, steps, and runners with diagrams. The mental model behind every page here.",
        },
        {
          title: "IAM OIDC identity providers",
          url: "https://docs.aws.amazon.com/iam/latest/UserGuide/id_roles_providers_create_oidc.html",
          description:
            "AWS docs for the OIDC trust used in the last section — how GitHub assumes an IAM role with no stored keys.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Concepts: workflows, events, jobs, steps, runners</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Five words unlock all of Actions. A <strong>workflow</strong> is a
          YAML file in <strong>.github/workflows/</strong>. An{" "}
          <strong>event</strong> triggers it (push, PR, schedule, manual). A{" "}
          <strong>job</strong> is a set of steps running on one machine. A{" "}
          <strong>step</strong> is one command or one reusable action. A{" "}
          <strong>runner</strong> is the VM that executes it (
          <strong>ubuntu-latest</strong> unless you self-host).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`EVENT (push to main) ──> WORKFLOW (.github/workflows/ci.yml) ──> RUNNER (ubuntu-latest VM)
                                    |
                    +---------------+---------------+
                    |                               |
               JOB: test                       JOB: lint          (jobs run in parallel
                    |                               |              unless needs: orders them)
          +--------+--------+--------+      +------+------+
          |        |        |        |      |             |
       STEP:    STEP:    STEP:    STEP:   STEP:        STEP:
       checkout setup-   npm      npm     checkout     eslint
       code     node     install  test    code

  Files: repo root
  .github/workflows/ci.yml      <- workflow (trigger + jobs)
  .github/workflows/deploy.yml  <- second workflow (CD, later lesson)
  src/, package.json, tests/    <- your app the workflow builds`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Workflows live in .github/workflows/*.yml:</strong> one
            file per pipeline (ci.yml for tests, deploy.yml for releases).
            Push the file and Actions discovers it — no console clicks.
          </li>
          <li>
            <strong>Jobs are the parallel unit:</strong> <strong>test</strong>{" "}
            and <strong>lint</strong> run side by side; add{" "}
            <strong>needs: [test]</strong> when a <strong>build</strong> job
            must wait. Fail one job and the workflow fails.
          </li>
          <li>
            <strong>Steps are sequential inside a job:</strong> checkout →
            setup → install → test. Each step can be a{" "}
            <strong>run:</strong> shell line or a <strong>uses:</strong>{" "}
            prebuilt action (<strong>actions/checkout@v4</strong>).
          </li>
          <li>
            <strong>DevOps use:</strong> split slow suites into parallel jobs
            (unit / integration / lint) so PR feedback stays under 5 minutes;
            gate merges on all three passing.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">First workflow A–Z: checkout to green check</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Follow these steps exactly. You will create{" "}
          <strong>ci.yml</strong>, push it, watch it run, and learn to read the
          green check (or debug the red X). Total time: about 10 minutes.
        </p>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>A. Create the workflow path:</strong> in your repo root run{" "}
            <strong>mkdir -p .github/workflows</strong>. Actions only reads
            YAML from this folder.
          </li>
          <li>
            <strong>B. Checkout step:</strong> every job starts with{" "}
            <strong>uses: actions/checkout@v4</strong> — it clones your code
            into the runner. Without it the runner is an empty VM.
          </li>
          <li>
            <strong>C. Setup runtime:</strong> add{" "}
            <strong>actions/setup-node@v4 with node-version: 20</strong> so{" "}
            <strong>npm</strong> exists. Pin the major version — floating
            versions break builds silently.
          </li>
          <li>
            <strong>D. Install then test:</strong> <strong>npm ci</strong>{" "}
            (clean install from lockfile) followed by{" "}
            <strong>npm test</strong>. Always <strong>ci</strong> in pipelines,
            never bare <strong>install</strong>.
          </li>
          <li>
            <strong>E. Commit, push, watch:</strong> push to main or open a PR,
            then open the <strong>Actions</strong> tab → click the run → click
            the job → expand each step. Green check = all jobs passed; red X =
            expand the failed step first.
          </li>
          <li>
            <strong>F. Re-run correctly:</strong> transient failure (network
            flake)? Use <strong>Re-run failed jobs</strong>, not re-run all —
            it saves minutes and keeps logs clean.
          </li>
        </ol>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/ci.yml"
            code={`name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`mkdir -p .github/workflows
git add .github/workflows/ci.yml
git commit -m "Add CI workflow"
git push origin main
gh run list --limit 3
gh run watch`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`To github.com:you/cicd-practice.git
   a1b2c3d..e5f6a7b  main -> main

STATUS  TITLE             WORKFLOW  BRANCH  EVENT
success Add CI workflow  CI        main    push
in_progress Fix login    CI        main    push

# gh run watch (live):
✓ Checkout code (4s)  ✓ Setup Node.js (11s)  ✓ Install (18s)  ✓ Run tests (9s)
✓ test passed in 42s — green check on commit + PR`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Reading the UI:</strong> repo → <strong>Actions</strong> tab
            → run name → job → step logs. Green check on the commit means every
            required job passed; yellow dot means still running — wait before
            merging.
          </li>
          <li>
            <strong>Pin versions:</strong> <strong>@v4</strong> not{" "}
            <strong>@latest</strong> — a breaking action release must never
            surprise you at 2am (more in mistakes below).
          </li>
          <li>
            <strong>DevOps use:</strong> require this workflow in branch
            protection (Settings → Branches → Require status checks) so broken
            code physically cannot merge.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Triggers: push, PR, schedule, manual, paths</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The <strong>on:</strong> block decides when (and whether) you pay
          for a run. CI on every push is right for code; docs-only edits,
          nightly builds, and manual deploys each need their own trigger
          pattern.
        </p>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/ci.yml"
            code={`on:
  push:
    branches: [main]
    paths-ignore: ["docs/**", "*.md"]   # skip CI for docs-only edits
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 6 * * 1"                  # 06:00 UTC every Monday: nightly/weekly health
  workflow_dispatch:                     # manual "Run workflow" button in Actions tab
    inputs:
      environment:
        description: "Target environment"
        required: true
        default: "stage"`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>push + pull_request:</strong> the CI pair — push catches
            main breakage, PR catches it before merge. Keep both on{" "}
            <strong>main</strong> from day one.
          </li>
          <li>
            <strong>paths-ignore:</strong> skip runs for{" "}
            <strong>docs/**</strong> and <strong>*.md</strong>. Saves minutes
            and keeps the Actions feed readable.
          </li>
          <li>
            <strong>schedule (cron):</strong> nightly dependency or security
            scans even with no commits. Note: cron is UTC and can lag ~30 min —
            never use it for exact-time deploys.
          </li>
          <li>
            <strong>workflow_dispatch:</strong> manual trigger with inputs —
            the safe way to run one-off deploys or stage promotions with an
            audit trail instead of laptop commands.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Secrets and contexts: pass keys without leaking them</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Secrets (AWS keys, tokens) go in <strong>Settings → Secrets and
          variables → Actions → New repository secret</strong>, never in YAML.
          Workflows read them via the <strong>secrets context</strong> (for
          example, secrets.AWS_KEY) and metadata via the{" "}
          <strong>github context</strong> (for example, github.sha). Actions automatically
          masks secret values in logs — but only if you never print them
          yourself.
        </p>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/ci.yml"
            code={`jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Show build metadata (safe)
        run: |
          echo "SHA: \${{ github.sha }}"
          echo "Branch: \${{ github.ref_name }}"
          echo "Triggered by: \${{ github.event_name }}"

      - name: Use a secret (safe pattern)
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
        run: aws sts get-caller-identity   # key passed via env, never printed`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">Never echo secrets — masked does not mean safe</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            Do NOT echo a secret value, run print env | sort, or enable
            debug logging with secrets in scope. Masking hides
            exact matches but base64, split, or transformed values can leak.
            Prefer OIDC (next section) so there is no long-lived secret at all.
          </p>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>GITHUB_SHA:</strong> exact commit being built — use it as
            the image tag (<strong>myapp colon github.sha</strong>)
            so artifacts trace to code.
          </li>
          <li>
            <strong>Scope secrets tight:</strong> environment secrets (prod)
            over repo secrets where possible; rotate immediately if a value
            ever appears in a log.
          </li>
          <li>
            <strong>DevOps use:</strong> PRs from forks cannot read secrets by
            default — design jobs so fork PRs still run safe tests without
            deploy credentials.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Caching and artifacts: fast builds, kept outputs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Two different tools people confuse. <strong>Cache</strong> speeds up
          future runs by reusing dependencies (<strong>node_modules</strong>).{" "}
          <strong>Artifacts</strong> save outputs (test reports, built zips)
          you download or pass to later jobs. Use cache for speed, artifacts
          for evidence.
        </p>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/ci.yml"
            code={`      - name: Cache node modules
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: npm-\${{ runner.os }}-\${{ hashFiles('package-lock.json') }}
          restore-keys: |
            npm-\${{ runner.os }}-

      - name: Install dependencies
        run: npm ci

      - name: Upload test report
        if: always()   # keep evidence even when tests fail
        uses: actions/upload-artifact@v4
        with:
          name: test-results-\${{ github.sha }}
          path: test-results/
          retention-days: 7`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Cache key = exact hit:</strong>{" "}
            <strong>hashFiles(&apos;package-lock.json&apos;)</strong> means a
            new cache per dependency change; <strong>restore-keys</strong> fall
            back to the closest older cache instead of cold install.
          </li>
          <li>
            <strong>upload-artifact keeps proof:</strong> JUnit XML, coverage
            HTML, or the deploy zip — download from the run page, attach to
            incidents, or feed into a later deploy job with{" "}
            <strong>actions/download-artifact@v4</strong>.
          </li>
          <li>
            <strong>DevOps use:</strong> cache cuts install from ~60s to ~10s
            across PRs; artifacts give auditors the exact test report for the
            SHA that shipped. (Modern setup-node cache: npm above already does
            this — the explicit cache step shows the mechanism.)
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">OIDC to AWS intro: no long-lived keys</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Old way: paste a permanent AWS access key into GitHub Secrets and
          hope it never leaks. Modern way: <strong>OpenID Connect
          (OIDC)</strong> — GitHub mints a short-lived token per run, AWS
          verifies it, and assumes an <strong>IAM role</strong> for ~1 hour.
          Nothing to rotate, nothing to leak. Full role-trust setup happens in
          the pipeline lab; here learn the shape.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`LONG-LIVED KEYS (avoid)              OIDC (use this)
GitHub secret: AKIA... (forever)       GitHub mints token (valid ~5 min, per run)
   | stored months, leaks in logs         |
   v                                      v
AWS user key ──> works until rotated   AWS IAM role trust policy checks:
                                       "token from repo you/cicd-practice, branch main?"
                                          YES -> assume role 1h -> run aws cli
                                          NO  -> deny. No stored key to steal.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label=".github/workflows/ci.yml"
            code={`permissions:
  id-token: write   # REQUIRED: lets GitHub mint the OIDC token
  contents: read    # checkout needs this

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Full lab adds:
      # - uses: aws-actions/configure-aws-credentials@v4
      #   with:
      #     role-to-assume: arn:aws:iam::123456789012:role/GitHubDeploy
      #     aws-region: us-east-1
      # - run: aws sts get-caller-identity   # proves the role, no stored key`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Role trust is the gate:</strong> the IAM role&apos;s trust
            policy names the exact repo/branch (and the{" "}
            <strong>token.actions.githubusercontent.com</strong> provider). Any
            other repo&apos;s token is denied automatically.
          </li>
          <li>
            <strong>Full setup lives in the pipeline lab:</strong> creating the
            OIDC provider, the deploy role, and least-privilege policy. For now
            remember <strong>permissions: id-token: write</strong> — without it
            OIDC silently fails.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE TIER] Actions minutes are free to start</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            Public repos: effectively unlimited Linux minutes on the free plan.
            Private repos get 2,000 Linux minutes/month free — plenty for this
            module&apos;s CI runs (~1 min each). Mac/Windows runners and large
            artifact storage burn minutes faster; stick to ubuntu-latest and
            7-day retention while learning.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Unpinned actions (uses: checkout@latest):</strong>{" "}
            upstream breaking change = your pipeline breaks with no code
            change. Pin <strong>@v4</strong> (or full SHA for prod) and bump
            deliberately with Dependabot.
          </li>
          <li>
            <strong>Printing secrets to logs:</strong> echo, set -x, or debug
            output with secrets in scope leaks credentials into permanent run
            history. Pass via <strong>env:</strong>, never print, prefer OIDC.
          </li>
          <li>
            <strong>No timeout-minutes:</strong> default 6-hour hang on a stuck
            test burns your free minutes and blocks deploys. Set{" "}
            <strong>timeout-minutes: 10</strong> per job from the first commit.
          </li>
          <li>
            <strong>npm install instead of npm ci:</strong> install floats
            versions and ignores the lockfile — CI must reproduce exactly what
            you tested locally. Always <strong>npm ci</strong> in workflows.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Mini lab + hands-on practice (8 tasks)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Mini lab (~15 min):</strong> in <strong>cicd-practice</strong>,
          create the <strong>ci.yml</strong> from section 2, push to main,
          confirm the green check in the Actions tab, then break a test on
          purpose, watch the red X, fix it, and use{" "}
          <strong>Re-run failed jobs</strong> on the fixed run.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the workflow → job → step → runner hierarchy and the .github/workflows file layout from memory.</li>
          <li>Create ci.yml with checkout, setup-node 20, npm ci, and npm test — push and get a green check.</li>
          <li>Add branch protection requiring your CI workflow before PRs can merge.</li>
          <li>Add paths-ignore for docs/** and push a README-only edit to prove CI skips.</li>
          <li>Add a workflow_dispatch input and trigger one manual run from the Actions tab.</li>
          <li>Store a dummy secret, reference it via the secrets context in env, and verify it is masked (never echoed).</li>
          <li>Add npm caching plus upload-artifact for test results with 7-day retention; download the artifact.</li>
          <li>Add permissions id-token: write to ci.yml and explain in one paragraph why OIDC beats long-lived AWS keys.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
