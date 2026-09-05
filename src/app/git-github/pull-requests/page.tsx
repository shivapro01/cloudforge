import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Git & GitHub"
      title="Pull Requests & Reviews"
      intro="A pull request is a proposal: merge my branch into yours, with discussion, review, and automated checks attached. It is where code quality, CI pipelines, and team decisions meet. Learn PR anatomy, the push-to-merge flow, review craft, merge strategies, and protected branches here and you understand modern DevOps delivery."
      prev={{ href: "/git-github/remotes-clone-pull", label: "Remotes, Clone & Pull" }}
      next={{ href: "/git-github/undo-fix", label: "Undo & Fix" }}
      resources={[
        {
          title: "GitHub Docs — About Pull Requests",
          url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests",
          description:
            "Official guide to PR anatomy, base vs compare branches, drafts, and review workflows.",
        },
        {
          title: "GitHub Skills — Review Pull Requests",
          url: "https://github.com/skills/review-pull-requests",
          description:
            "Hands-on interactive course: open a PR, suggest changes, approve, and merge on a real repo.",
        },
        {
          title: "freeCodeCamp — Pull Request Guide",
          url: "https://www.freecodecamp.org/news/how-to-make-a-pull-request-on-github/",
          description:
            "Beginner-friendly end-to-end walkthrough from fork to merged PR with screenshots.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">PR anatomy: base, compare, title, checks, reviewers</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every PR says: merge <strong>compare</strong> (your feature branch)
          into <strong>base</strong> (usually main). Around that diff sit the{" "}
          <strong>title + description</strong> (what and why),{" "}
          <strong>checks</strong> (CI results), <strong>reviewers</strong>{" "}
          (humans who must approve), and <strong>comments</strong> (line-level
          discussion). Get the direction backwards — main into feature — and
          you propose to ship the entire codebase into your branch.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`base: main  (target, stable)      compare: feature/metrics (source, your work)

  main:    A--B--------------M   <- merge lands here after approval
               \\              /
  feature:      C--D  + checks ✓ + 2 approvals + comments
                \\____ PR #42 "feat: add /metrics endpoint" ____/
  Files changed | Commits | Checks | Conversation — the 4 PR tabs.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh pr view 42 --json baseRefName,headRefName,title,statusCheckRollup,reviewDecision`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "baseRefName": "main",
  "headRefName": "feature/metrics",
  "title": "feat: add /metrics endpoint for Prometheus",
  "statusCheckRollup": [{"name": "ci / test", "status": "COMPLETED", "conclusion": "SUCCESS"}],
  "reviewDecision": "REVIEW_REQUIRED"
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Base vs compare:</strong> base receives, compare provides.
            Always double-check the arrow on github.com — base ← compare — it
            reads backwards from intuition.
          </li>
          <li>
            <strong>Title:</strong> conventional-commit style
            (&quot;feat: ...&quot;) becomes the squash-merge message and
            changelog entry — write it like a commit subject.
          </li>
          <li>
            <strong>Checks + reviewDecision:</strong> SUCCESS vs FAILURE gates
            merging; REVIEW_REQUIRED means no one approved yet. Both must turn
            green before merge on protected branches.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Full flow: push branch, open PR, review, merge</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The loop never changes: branch, commit, <strong>push -u</strong>,
          open the PR with context, get review + green CI, then merge and clean
          up. The <strong>gh CLI</strong> does every GitHub click from your
          terminal — optional but beloved in DevOps for scripting the whole
          flow.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git checkout -b feature/metrics
git commit -m "feat: add /metrics endpoint for Prometheus"
git push -u origin feature/metrics`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Switched to a new branch 'feature/metrics'
[feature/metrics 1c2d3e4] feat: add /metrics endpoint for Prometheus
To github.com:YOU/git-practice.git
 * [new branch]      feature/metrics -> feature/metrics
Branch 'feature/metrics' set up to track remote branch from 'origin'.
remote: Create a pull request by visiting:
remote:      https://github.com/YOU/git-practice/pull/new/feature/metrics`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh pr create --base main --head feature/metrics --title "feat: add /metrics endpoint" --body "Adds /metrics for Prometheus scraping. Fixes PROJ-123."`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Creating pull request for feature/metrics into main in YOU/git-practice
https://github.com/YOU/git-practice/pull/42`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh pr status
gh pr checks 42
gh pr merge 42 --squash --delete-branch`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Relevant pull requests in YOU/git-practice
Current branch
  #42  feat: add /metrics endpoint [feature/metrics -> main]
  Checks passing - Review required
# --- gh pr checks 42 ---
ci / test (pull_request)  PASS  in 1m12s
# --- merge ---
✔ Squashed and merged pull request #42 (feat: add /metrics endpoint)
✔ Deleted branch feature/metrics (locally and on GitHub)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Body matters:</strong> link the ticket (Fixes PROJ-123),
            describe testing, note risks. Reviewers decide how deep to dig
            from this paragraph.
          </li>
          <li>
            <strong>gh pr create flags:</strong> --base is the target,
            --head is your branch. Omit --body to open an editor; add --draft
            to signal &quot;not ready for review&quot;.
          </li>
          <li>
            <strong>Merge only when green:</strong> checks PASS + approval
            before gh pr merge. --squash condenses the branch to one commit;
            --delete-branch cleans up both copies at once.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Review craft: comment types, requested changes, approve</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Good reviews separate <strong>blocking issues</strong> from{" "}
          <strong>nits and questions</strong>. Comment on a single line for
          precision, use <strong>suggestions</strong> (one-click apply) for
          trivial fixes, <strong>Request changes</strong> only when merging
          would be wrong, and <strong>Approve</strong> explicitly when it is
          right. Authors: push fixes to the same branch — the PR updates
          automatically, no new PR needed.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh pr review 42 --comment -b "Nit: rename scrapeInterval -> scrape_interval for PEP8. Non-blocking."
gh pr review 42 --request-changes -b "Blocking: /metrics is unauthenticated — add the auth middleware before merge."`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# --comment: posts feedback, does not change approval state
# --request-changes: marks PR "Changes requested" — merge blocked until re-review
Review posted successfully.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# author addresses feedback on the SAME branch:
git commit -m "fix: require auth on /metrics endpoint"
git push
gh pr review 42 --approve -b "Auth added, tests pass. LGTM."`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[feature/metrics 2e3f4a5] fix: require auth on /metrics endpoint
To github.com:YOU/git-practice.git
   1c2d3e4..2e3f4a5  feature/metrics -> feature/metrics
Approved pull request #42`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Comment vs Request changes vs Approve:</strong> comment =
            FYI, request-changes = veto until fixed, approve = ship it. Mixing
            a blocking bug into a casual comment lets it sail through.
          </li>
          <li>
            <strong>Suggestions:</strong> on github.com select code → &quot;Add
            a suggestion&quot; — author applies with one click instead of
            hand-copying your snippet.
          </li>
          <li>
            <strong>Re-review:</strong> after pushing fixes, re-request review
            (or ask in comments). Stale approvals on changed code are how bugs
            slip through.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Merge strategies: merge commit vs squash vs rebase</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Three buttons, three histories. <strong>Merge commit</strong> keeps
          every commit plus a merge bubble (full archaeology, noisy log).{" "}
          <strong>Squash</strong> compresses the branch to one commit on main
          (clean log, loses per-commit detail). <strong>Rebase-merge</strong>{" "}
          replays each commit onto main with no merge commit (linear, rewrites
          SHAs). Most DevOps teams squash feature PRs and reserve merge commits
          for release branches.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`Branch:  main A--B      feature C--D--E

MERGE COMMIT:   A--B--------M     (M has 2 parents; C,D,E preserved)
SQUASH:         A--B--SQ          (one commit SQ; branch history discarded)
REBASE-MERGE:   A--B--C'--D'--E'  (same changes, new SHAs, straight line)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh pr merge 42 --merge
gh pr merge 43 --squash
gh pr merge 44 --rebase`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`✔ Merged pull request #42 (Merge pull request #42 from YOU/feature-a)
✔ Squashed and merged pull request #43 (feat: add /metrics endpoint)
✔ Rebased and merged pull request #44 (feat: add /health endpoint)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline --graph -5`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`d4e5f6a (HEAD -> main) feat: add /metrics endpoint (#43)
8f3a2c1 Merge pull request #42 from YOU/feature-a
5d6e7f8 feat: step 2 of feature-a
1c2d3e4 feat: step 1 of feature-a
b7c2e91 Bump app to v2`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Squash (default for features):</strong> one ticket = one
            commit on main — git revert and git bisect become trivial. Use
            unless you need the intermediate steps.
          </li>
          <li>
            <strong>Merge commit (releases):</strong> preserves the true
            topology — auditors and release notes can see the whole branch.
            Noisy for everyday features.
          </li>
          <li>
            <strong>Rebase-merge (advanced):</strong> linear and clean but
            rewrites SHAs — never use on branches others build on, and require
            green CI per replayed commit.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Required checks and branch protection: CI must pass</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Branch protection</strong> makes rules GitHub enforces: PR
          required, N approvals, <strong>status checks must pass</strong>,
          no direct pushes, no stale approvals. Add a{" "}
          <strong>CODEOWNERS</strong> file and GitHub auto-requests the right
          team per path — platform approval for Dockerfile, backend approval
          for app.py. This is the DevOps gate between &quot;works on my
          laptop&quot; and production.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cat .github/CODEOWNERS
gh api repos/YOU/git-practice/branches/main/protection --jq '{required_checks, approvals: .required_pull_request_reviews.required_approving_review_count}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# CODEOWNERS: path pattern + owning team/user
/app.py              @YOU/backend-team
/Dockerfile          @YOU/platform-team
/.github/workflows/  @YOU/platform-team
{
  "required_checks": ["ci / test", "ci / lint"],
  "approvals": 1
}`}
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
error: failed to push some refs
remote: error: GH006: Protected branch update failed: 1 of 2 required status checks are failing, 1 approving review required.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>GH006:</strong> the machine saying no — a check failed or
            approvals are missing. Read which one, fix the code (not the
            rule), push again.
          </li>
          <li>
            <strong>CODEOWNERS syntax:</strong> one pattern per line, last
            match wins. Owning a directory auto-requests that team — no manual
            @-mentioning, no missed reviews.
          </li>
          <li>
            <strong>Protect main today:</strong> Settings → Branches → Require
            a pull request, Require status checks (ci/test), Require 1
            approval. Five minutes that prevents 3am pages.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">After merge: delete the branch, update main, sync your fork</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Merging is not the last step. <strong>Delete the branch</strong>{" "}
          (GitHub offers a button; gh uses --delete-branch),{" "}
          <strong>pull main</strong> locally so your next branch starts fresh,
          and if you forked, <strong>sync the fork</strong> from upstream.
          Skipping this leaves stale branches and a main that is silently
          behind — the next PR then drags ancient conflicts along.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch main
git pull origin main
git branch -d feature/metrics
git branch -a`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Switched to branch 'main'
Updating b7c2e91..d4e5f6a
Fast-forward
 app.py | 8 ++++++++
Deleted branch feature/metrics (was 2e3f4a5).
* main
  remotes/origin/main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git fetch upstream
git switch main
git merge upstream/main
git push origin main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`From github.com:ORIGINAL/git-practice
 * branch            main       -> upstream/main
Already on 'main'
Updating d4e5f6a..e7f8a9b
Fast-forward
To github.com:YOU/git-practice.git
   d4e5f6a..e7f8a9b  main -> main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh repo sync YOU/git-practice --source ORIGINAL/git-practice`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`✔ Synced main from ORIGINAL/git-practice to YOU/git-practice`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Pull before branching:</strong> git switch main + git pull
            guarantees the next feature starts at the true tip — branching off
            stale main reintroduces fixed bugs.
          </li>
          <li>
            <strong>Fork sync:</strong> fetch upstream + merge (or gh repo
            sync) keeps your fork&apos;s main identical to the original.
            Open every PR from an updated fork to avoid &quot;can&apos;t
            automatically merge&quot; on day one.
          </li>
          <li>
            <strong>Prune:</strong> git fetch --prune after merges so deleted
            PR branches vanish from git branch -r instead of haunting
            tab-completion.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses: PRs trigger pipelines and preview deploys</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          In DevOps the PR <em>is</em> the pipeline trigger: opening one runs{" "}
          <strong>lint + unit + security scan</strong>, every push re-runs
          them, green checks + approval unlock merge, and merge to main fires
          the <strong>build → staging → production</strong> chain. Many teams
          also deploy <strong>ephemeral previews</strong> per PR — a live URL
          like pr-42.app.dev — so QA clicks the feature instead of reading a
          diff.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`open PR #42 ──> CI: lint + test + trivy scan ──> ✓ green + 1 approval
     │                                                        │
     ├── preview deploy: https://pr-42.app.dev (ephemeral)    ├── MERGE ──> main pipeline:
     └── every push re-runs all checks                           build image → staging → prod`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`gh pr checks 42
gh run list --branch feature/metrics --limit 3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`ci / lint (pull_request)  PASS  in 42s
ci / test (pull_request)  PASS  in 1m12s
ci / scan (pull_request)  PASS  in 58s
# --- runs ---
completed  success  ci.yml #88  feature/metrics: feat: add /metrics
completed  success  preview.yml #89  deploy preview pr-42`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>PR as quality gate:</strong> no green CI, no merge — flaky
            tests become everyone&apos;s problem immediately instead of a prod
            incident later.
          </li>
          <li>
            <strong>Previews:</strong> Vercel, Netlify, and review-apps post a
            URL on the PR. Designers and PMs approve behavior, not just code.
          </li>
          <li>
            <strong>Merge to main = release train:</strong> tag or deploy from
            main only. The PR pipeline proves the change; the main pipeline
            ships it.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Merging with red CI: &quot;tests are flaky, ship it&quot; ships the
            bug the test caught. Fix the code or quarantine the flake — never
            override a failing required check.
          </li>
          <li>
            Giant 2000-line PRs: unreviewable, untestable, unrevertable.
            Split by commit or stacked PRs — under ~400 lines gets real
            review, over that gets rubber-stamps.
          </li>
          <li>
            Base ←→ compare backwards: proposing main into your feature (or
            prod into dev). Verify the arrow says feature → main before
            requesting review.
          </li>
          <li>
            Empty &quot;fix stuff&quot; descriptions: reviewers guess intent
            and miss the risk. State what, why, ticket link, and how you
            tested — every time.
          </li>
          <li>
            Pushing new commits after approval without re-review: the approved
            code is not the merged code. Re-request review on material changes
            and let CI re-run.
          </li>
          <li>
            Leaving merged branches alive: stale feature/* branches confuse
            the next PR and pollute git branch -r. Delete on merge
            (--delete-branch) and pull main immediately.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Push a feature/pr-practice branch to your own repo and open a real PR from feature → main with a conventional-commit title.</li>
          <li>Write a PR body with what, why, ticket reference, test steps, and risk — then compare review quality vs a one-line PR.</li>
          <li>Run gh pr checks (or read the Checks tab) and explain each check: what it runs and what failure would mean.</li>
          <li>Ask a friend (or yourself on another account) for review: practice one comment, one suggestion, and one request-changes cycle.</li>
          <li>Address review feedback with new commits on the same branch and confirm the PR updates without opening a second PR.</li>
          <li>Merge the PR with --squash --delete-branch, then verify history with git log --oneline --graph -5 after pulling main.</li>
          <li>Protect main on your repo: require a PR, require status checks, block direct pushes — then feel GH006 reject a direct push.</li>
          <li>Add a CODEOWNERS file mapping two paths to two owners, open a PR touching both, and confirm both reviewers are auto-requested.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
