import Link from "next/link";
import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Git & GitHub"
      title="Git Workflows for DevOps"
      intro="Branches and PRs are mechanics — a workflow is the agreement about how a team uses them to ship safely. The workflow decides what main means, when CI runs, how releases are cut, and what deploys to production. Pick the model that fits your team size and delivery speed, then enforce it with branch protection and tags."
      prev={{ href: "/git-github/stash-rebase-gitignore", label: "Stash, Rebase & .gitignore" }}
      next={{ href: "/aws-fundamentals", label: "AWS Fundamentals" }}
      resources={[
        {
          title: "GitHub Docs — GitHub Flow",
          url: "https://docs.github.com/en/get-started/using-github/github-flow",
          description:
            "Official guide to the branch, PR, review, deploy loop that powers CI/CD on GitHub.",
        },
        {
          title: "Atlassian — Comparing Workflows",
          url: "https://www.atlassian.com/git/tutorials/comparing-workflows",
          description:
            "Side-by-side comparison of centralized, feature-branch, Gitflow, and trunk-based models.",
        },
        {
          title: "GitHub Skills — Hello GitHub Actions",
          url: "https://github.com/skills/hello-github-actions",
          description:
            "Hands-on course connecting your workflow to a real CI pipeline triggered by pushes and PRs.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Why workflow matters: CI/CD reads your branches</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A CI/CD pipeline is just automation watching your repo: a PR opens and
          tests run, main advances and staging deploys, a tag appears and
          production releases. Without an agreed workflow those triggers fire on
          chaos — half-done commits deploying, unreviewed pushes shipping,
          nobody knowing which commit is live. The workflow turns Git history
          into a machine-readable release process: every branch has a purpose,
          every merge is a gated event.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`NO WORKFLOW:  everyone pushes main ──> CI red, deploys random, "who shipped this?"
  push ──> build? ──> prod?! ──> revert ??? ──> nobody knows the live commit

WITH WORKFLOW:  feature ──PR+CI──> review ──> merge to main ──> tag v1.4.0 ──> prod
  each arrow is automated, each gate is enforced, live commit = one tag`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline -5
gh run list --limit 5`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`9a1b2c3 (tag: v1.4.0, origin/main, main) feat: add /metrics endpoint (#44)
8f3a2c1 Merge pull request #43 from YOU/feature-a
b7c2e91 Release v1.3
completed  success  ci.yml #88  main: feat: add /metrics endpoint (#44)
completed  success  deploy-prod.yml #21  tag v1.4.0: live in prod`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Branches are signals:</strong> pipelines match on names and
            events — PRs run tests, main runs staging, tags run production.
            Random branching means random deploys.
          </li>
          <li>
            <strong>Tags answer &quot;what is live&quot;:</strong> one glance at
            the newest tag beats archaeology through merge commits during an
            outage.
          </li>
          <li>
            <strong>Workflow scales the team:</strong> two developers survive on
            vibes; twenty need written branch rules plus enforced protection or
            main stays red.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Trunk-based development: tiny branches, feature flags, always green</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Trunk-based development</strong> keeps one long-lived branch
          (the trunk, usually main) and merges short-lived branches — hours, at
          most a day or two old — straight back in. Unfinished work hides behind{" "}
          <strong>feature flags</strong> (runtime toggles) instead of
          long-lived branches, so main stays deployable every commit and merge
          pain disappears because branches never drift apart.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`TRUNK-BASED (branches live < 2 days, flags hide unfinished work):

  main:  A--B--C--D--E--F-->   (every commit green + deployable)
           \\  \\  \\  \\
  f1:       a--M1   f2: b--M2  f3: c--M3 ... (merge daily, delete immediately)

  feature flag:  if (flags.newCheckout) { newFlow() } else { oldFlow() }
  unfinished code SHIPS to prod dark, flips on later — no release branch needed.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch -c feature/metrics
git commit -m "feat: metrics behind NEW_METRICS flag, default off"
git push -u origin feature/metrics`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Switched to a new branch 'feature/metrics'
[feature/metrics 4d5e6f7] feat: metrics behind NEW_METRICS flag, default off
To github.com:YOU/git-practice.git
 * [new branch]      feature/metrics -> feature/metrics`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cat app.py`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`import os
NEW_METRICS = os.getenv("NEW_METRICS", "off") == "on"
if NEW_METRICS:
    register_metrics()  # dark in prod until the flag flips`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Small batches:</strong> sub-day branches mean trivial
            reviews, instant reverts, and conflicts measured in lines, not
            files.
          </li>
          <li>
            <strong>Flags over branches:</strong> an environment variable gates
            unfinished features — code integrates continuously while behavior
            releases independently.
          </li>
          <li>
            <strong>Requires discipline + CI:</strong> trunk only works with
            fast suites and required checks on every PR — red main blocks the
            entire company, so guard it fiercely.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">GitHub Flow: branch, PR, review, deploy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>GitHub Flow</strong> is trunk-based with a deployment tail:
          branch off main, push early, open a PR to trigger CI plus discussion,
          merge when green and approved, then deploy main immediately. Anything
          in main is by definition deployable — releases are not ceremonies,
          they are just deploys of the current tip, optionally pinned with a
          tag.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch -c feature/health-endpoint main
git commit -am "feat: add /health endpoint"
git push -u origin feature/health-endpoint`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Switched to a new branch 'feature/health-endpoint'
[feature/health-endpoint 2e3f4a5] feat: add /health endpoint
To github.com:YOU/git-practice.git
 * [new branch]      feature/health-endpoint -> feature/health-endpoint`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh pr create --base main --head feature/health-endpoint --title "feat: add /health endpoint" --body "Liveness probe for k8s. Tested locally."
gh pr checks 45`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Creating pull request for feature/health-endpoint into main in YOU/git-practice
https://github.com/YOU/git-practice/pull/45
ci / lint (pull_request)  PASS  in 38s
ci / test (pull_request)  PASS  in 1m05s`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh pr merge 45 --squash --delete-branch
git switch main && git pull origin main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`✔ Squashed and merged pull request #45 (feat: add /health endpoint)
✔ Deleted branch feature/health-endpoint (locally and on GitHub)
Updating b7c2e91..d4e5f6a
Fast-forward
 app.py | 6 ++++++`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Deploy from main:</strong> after merge the main pipeline
            builds and ships — no release branch, no waiting for a train.
          </li>
          <li>
            <strong>PR is the gate:</strong> CI plus review happen before merge,
            never after — broken code never touches the deployable line.
          </li>
          <li>
            <strong>Best default for DevOps:</strong> simple enough for a
            three-person startup, and with protection plus flags it scales to
            hundreds of engineers shipping daily.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Git Flow: main, develop, feature, release, hotfix</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Git Flow</strong> adds structure for versioned releases:{" "}
          <strong>main</strong> holds only production code,{" "}
          <strong>develop</strong> integrates the next release,{" "}
          <strong>feature</strong> branches feed develop,{" "}
          <strong>release</strong> branches freeze for QA, and{" "}
          <strong>hotfix</strong> branches patch production directly. Powerful
          for scheduled versions (mobile apps, enterprise suites) — but heavy:
          long-lived branches, constant merging, and delayed integration that
          fights continuous delivery.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`GIT FLOW (two eternal branches + three short-lived kinds):

  main:     v1.2 -------- v1.3 ------>  (prod only, tagged releases)
                 \\            \\
  develop:        D---F1---R---D'--->  (integration for v1.3)
                   \\    \\   release/v1.3 (QA freeze, bugfix only)
  feature/*:        f1    hotfix/prod-bug --+--> merged to BOTH main + develop`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch -c release/v1.3 develop
git switch -c hotfix/prod-bug main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Switched to a new branch 'release/v1.3'
Switched to a new branch 'hotfix/prod-bug'`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>When Git Flow is overkill:</strong> SaaS apps deploying
            daily, small teams, and anything with feature flags pay the merge
            overhead without gaining release safety. If you cut releases more
            often than monthly, prefer GitHub Flow or trunk-based — reserve Git
            Flow for versioned artifacts (app stores, on-prem installers) where
            a QA-frozen release branch genuinely earns its keep.
          </p>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Hotfix merges twice:</strong> into main (ship now) and
            develop (never lose the fix) — forgetting the second merge
            reintroduces the bug next release.
          </li>
          <li>
            <strong>Release freeze:</strong> only bugfixes land on release
            branches while QA certifies — features wait for the next cycle.
          </li>
          <li>
            <strong>Cost:</strong> three branch tiers plus version ceremonies —
            adopt only when scheduled releases demand it.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Release and versioning: tags, semver, and gh releases</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>tag</strong> is an immutable pointer to one commit — the
          thing that actually deployed. <strong>Lightweight</strong> tags are
          bare pointers; <strong>annotated</strong> tags carry a message, date,
          author, and GPG signature, which is what releases deserve.{" "}
          <strong>Semantic versioning</strong> gives the number meaning:{" "}
          <strong>major</strong> for breaking changes, <strong>minor</strong>{" "}
          for features, <strong>patch</strong> for fixes — so tooling and humans
          instantly grasp upgrade risk.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git tag v1.4.0 -a -m "Release v1.4.0: metrics + health endpoints"
git show v1.4.0 --no-patch --format="%T %an %s"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# annotated tag object created on current HEAD
9a1b2c3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9 YOU Release v1.4.0: metrics + health endpoints`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git push origin v1.4.0
gh release create v1.4.0 --title "v1.4.0" --notes "Metrics + health endpoints. Upgrade risk: low (minor)." --latest`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`To github.com:YOU/git-practice.git
 * [new tag]         v1.4.0 -> v1.4.0
https://github.com/YOU/git-practice/releases/tag/v1.4.0`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git tag --list "v*" --sort=-v:refname | head -5
gh release view v1.4.0 --json tagName,isLatest --jq .`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`v1.4.0
v1.3.1
v1.3.0
v1.2.0
{
  "tagName": "v1.4.0",
  "isLatest": true
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Semver:</strong> 1.4.0 → 2.0.0 means breakage, → 1.5.0
            means safe features, → 1.4.1 means safe fixes. Never reset or move
            a published tag — consumers cache them.
          </li>
          <li>
            <strong>Annotated for releases:</strong> message plus tagger plus
            optional signature — lightweight tags are fine for personal
            bookmarks, never for production markers.
          </li>
          <li>
            <strong>Release triggers deploy:</strong> most pipelines watch for
            tag pushes — pushing v1.4.0 is the production button, which is why
            only maintainers push tags.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Protect main: branch protection, CODEOWNERS, signed commits</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Workflows only work when the machine enforces them.{" "}
          <strong>Branch protection</strong> on main requires PRs, approvals,
          and green status checks while blocking direct pushes and force
          pushes. <strong>CODEOWNERS</strong> auto-assigns the right reviewers
          per path, and <strong>signed commits</strong> cryptographically prove
          authorship — so &quot;deployed by main&quot; also means
          &quot;reviewed, tested, and genuinely authored&quot;.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cat .github/CODEOWNERS
gh api repos/YOU/git-practice/branches/main/protection --jq '{checks: .required_status_checks.contexts, approvals: .required_pull_request_reviews.required_approving_review_count}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/.github/workflows/  @YOU/platform-team
/Dockerfile          @YOU/platform-team
/app.py              @YOU/backend-team
{
  "checks": ["ci / test", "ci / lint"],
  "approvals": 1
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git commit -S -m "feat: sign this commit"
git log --show-signature -1 --format="%G? %GS %s"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[main 7a9b0c1] feat: sign this commit
G YOU feat: sign this commit`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git push origin main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`To github.com:YOU/git-practice.git
 ! [remote rejected] main -> main (protected branch hook declined)
remote: error: GH006: Protected branch update failed: pull request required, 1 approving review required.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>GH006 is the guardrail working:</strong> direct pushes die
            with a clear reason — open a PR, get approval, go green, then
            merge.
          </li>
          <li>
            <strong>CODEOWNERS last match wins:</strong> put specific paths
            after general ones, and remember ownership requests review — it
            does not itself block without required-review settings.
          </li>
          <li>
            <strong>Signed commits:</strong> G status means cryptographically
            verified — require it for regulated pipelines so impersonated
            authorship cannot ship.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Monorepo vs polyrepo and the pipeline map</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          One repo for everything (<strong>monorepo</strong>) or one repo per
          service (<strong>polyrepo</strong>)? Monorepos give atomic cross-service
          changes and one workflow to learn, at the cost of scale tooling and
          noisier pipelines. Polyrepos give independent versioning and access
          control, at the cost of coordinating multi-service changes across
          PRs. Either way, map the same pipeline spine underneath: PR runs CI,
          merge builds the artifact, tags release it.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`MONOREPO:  infra/ app/ api/  (one PR can touch all three atomically)
  PR --(path-filtered CI: only changed dirs test)--> merge --> tag v2.1.0 --> deploy all

POLYREPO:  infra-repo, app-repo, api-repo  (independent tags: app v3.2.0, api v1.9.4)
  PR in app-repo --> merge --> app v3.2.0 --> deploy app only (api untouched)

PIPELINE SPINE (both models):
  PR --> CI: build + test + scan --> approve --> merge --> CD: staging --> tag --> prod`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh pr checks 45
gh run list --limit 3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`ci / test (pull_request)  PASS  in 1m05s
ci / scan (pull_request)  PASS  in 58s
completed  success  ci.yml #88  PR #45: feat: add /health endpoint
completed  success  cd-staging.yml #12  main: deploy staging
completed  success  cd-prod.yml #21  tag v1.4.0: deploy prod`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Monorepo CI must filter paths:</strong> test only what
            changed or every docs typo runs the entire fleet&apos;s suite.
          </li>
          <li>
            <strong>Polyrepo needs contracts:</strong> versioned APIs plus
            compatibility tests, since services release on independent clocks.
          </li>
          <li>
            <strong>Same spine:</strong> PR-gated CI, merge-to-staging,
            tag-to-prod — the workflow lessons transfer whichever repo shape
            you choose.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pro checklist, mistakes, and where next</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Tape this to your monitor until it is muscle memory:{" "}
          <strong>small PRs, green main, tagged releases, no secrets in
          history</strong>. And keep going — Git workflows hand off directly to
          cloud delivery: the pipelines you have been gating here will soon run
          against real AWS infrastructure, starting with{" "}
          <Link href="/aws-fundamentals" className="underline underline-offset-4">
            AWS Fundamentals
          </Link>
          , the entry to module 04.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status --short --branch
git log --oneline -3
git tag --list "v*" --sort=-v:refname | head -3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`## main...origin/main (clean)
9a1b2c3 (tag: v1.4.0) feat: add /metrics endpoint (#44)
8f3a2c1 Merge pull request #43 from YOU/feature-a
v1.4.0
v1.3.1
v1.3.0`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Small PRs:</strong> under ~400 lines, one ticket, one
            concern — giant PRs get rubber-stamps, small ones get real review.
          </li>
          <li>
            <strong>Green main always:</strong> never merge red, never push
            direct, revert broken merges within minutes — main is the release
            train.
          </li>
          <li>
            <strong>Tag every release:</strong> annotated semver tags pushed to
            origin — &quot;what is live&quot; must be answerable in one
            command.
          </li>
          <li>
            <strong>Never commit secrets:</strong> gitignore plus pre-commit
            scanning plus rotation on leak — credentials in history are
            compromised, not stored.
          </li>
          <li>
            <strong>Mistake — workflow shopping:</strong> adopting Git Flow
            ceremony for a two-person SaaS slows every deploy. Match the model
            to release cadence, not prestige.
          </li>
          <li>
            <strong>Mistake — unprotected main:</strong> rules in a wiki nobody
            enforces are decoration. Protection, required checks, and owners
            make the workflow real.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Run the full GitHub Flow loop on your repo: branch, commit, push, PR, green checks, squash-merge, pull main.</li>
          <li>Tag that merge as an annotated v0.1.0 release, push the tag, and create a GitHub Release with notes.</li>
          <li>Protect main: require a PR, one approval, and status checks — then watch a direct push fail with GH006.</li>
          <li>Add a CODEOWNERS file with two path-owner mappings and confirm a PR touching both auto-requests both owners.</li>
          <li>Practice trunk-based delivery: merge a sub-day branch that hides unfinished behavior behind an environment flag.</li>
          <li>Sketch your team&apos;s pipeline spine (PR to CI to staging to tag to prod) as an ASCII diagram in a scratch file.</li>
          <li>Sign one commit with GPG/SSH signing, verify the signature in the log, and explain what the G status proves.</li>
          <li>Decide monorepo vs polyrepo for a three-service side project, write down why, and revisit the decision after module 04.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
