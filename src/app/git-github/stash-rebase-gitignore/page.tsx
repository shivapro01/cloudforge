import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Git & GitHub"
      title="Stash, Rebase & .gitignore"
      intro="Real work gets interrupted: a hotfix lands mid-feature, your branch falls behind main, secrets almost get committed. Stash shelves work in seconds, rebase keeps history linear and reviewable, and .gitignore stops junk from ever entering the repo. Together they are the daily hygiene of a professional DevOps workflow."
      prev={{ href: "/git-github/undo-fix", label: "Undo & Fix Mistakes" }}
      next={{ href: "/git-github/workflows-devops", label: "Git Workflows for DevOps" }}
      resources={[
        {
          title: "Pro Git Book — Stashing, Rebasing & Ignoring",
          url: "https://git-scm.com/book/en/v2",
          description:
            "Official chapters on the stash lifecycle, rebasing vs merging, and ignore-pattern syntax.",
        },
        {
          title: "Atlassian — git stash",
          url: "https://www.atlassian.com/git/tutorials/saving-changes/git-stash",
          description:
            "Practical stash tutorial: push, pop, partial stashes, and recovering dropped entries.",
        },
        {
          title: "Atlassian — git rebase",
          url: "https://www.atlassian.com/git/tutorials/rewriting-history",
          description:
            "Visual guide to standard and interactive rebasing and the golden rule of never rebasing shared history.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Stash lifecycle: shelve it, list it, bring it back</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Stash</strong> takes your uncommitted changes, records them on
          a stack, and restores a clean tree — so you can switch branches for
          an urgent fix without committing half-done work. Each entry keeps
          your message, and you bring it back with <strong>pop</strong> (remove
          from stack) or <strong>apply</strong> (keep a copy). The classic
          trigger: production pages while your feature is mid-edit.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status --short
git stash push -m "WIP: metrics endpoint half-done"
git status --short`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={` M app.py
 M metrics.py
Saved working directory and index state On main: WIP: metrics endpoint half-done
# --- tree is clean, safe to switch branches for the hotfix ---
## main (clean)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git stash list
git stash show -p stash@{0} --stat`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`stash@{0}: On main: WIP: metrics endpoint half-done
 app.py     | 8 ++++++++
 metrics.py | 20 ++++++++++++++++++++
 2 files changed, 28 insertions(+)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git stash push -u -m "WIP: including new untracked helper"
git stash list`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Saved working directory and index state On main: WIP: including new untracked helper
stash@{1}: On main: WIP: metrics endpoint half-done
stash@{0}: On main: WIP: including new untracked helper`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git stash pop
git status --short
git stash drop stash@{0}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`On branch main
Changes not staged for commit:
  modified:   app.py
  modified:   metrics.py
Dropped stash@{0} (abc1234 WIP: including new untracked helper)
# --- pop restores AND removes; drop deletes an entry you no longer need ---`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Untracked needs the flag:</strong> plain stash ignores new
            untracked files — add the untracked flag or your brand-new file
            stays behind and blocks the branch switch anyway.
          </li>
          <li>
            <strong>Pop vs apply:</strong> pop restores and drops in one step
            (daily driver); apply restores but keeps the entry — useful when
            the same WIP must land on two branches.
          </li>
          <li>
            <strong>Name every stash:</strong> the default &quot;WIP on
            main&quot; is useless with five entries — a message turns the stack
            into a readable todo list.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Stash vs temporary commit: pick the right shelf</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Both park unfinished work, but they live in different places. A{" "}
          <strong>stash</strong> is private, stack-ordered, and never part of
          branch history — perfect for interruptions lasting minutes to hours. A{" "}
          <strong>temporary commit</strong> is real history you intend to amend
          or squash later — better for multi-day pauses, sharing WIP with a
          teammate, or surviving a laptop rebuild via push. Rule of thumb: stash
          the interruption, commit the checkpoint.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git stash push -m "interrupt: hotfix call"
git switch hotfix/timeout`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Saved working directory and index state On main: interrupt: hotfix call
Switched to branch 'hotfix/timeout'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git commit -am "WIP: checkpoint metrics work, will squash"
git log --oneline -2`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[feature/metrics 5f6a7b8] WIP: checkpoint metrics work, will squash
5f6a7b8 (HEAD -> feature/metrics) WIP: checkpoint metrics work, will squash
b7c2e91 Bump app to v2`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Stash never pushes:</strong> entries live only in your local
            repo — if the machine dies, the WIP dies with it. Push a WIP commit
            for anything you cannot afford to lose.
          </li>
          <li>
            <strong>WIP commits must be cleaned:</strong> squash or amend them
            before the PR — reviewers should never see &quot;WIP&quot;,
            &quot;fix typo again&quot;, or &quot;tmp&quot; in main&apos;s
            history.
          </li>
          <li>
            <strong>Recovering a dropped stash:</strong> a dropped entry lingers
            as a dangling commit — fsck with lost-found can resurrect it, but
            naming stashes well so you never drop the wrong one is the real
            fix.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Rebase explained: replay your commits onto fresh main</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          While your feature branch sits open, main moves on — security fixes,
          other merges, new APIs. <strong>Rebase</strong> lifts your commits off
          the old base and replays them one by one onto the current tip of
          main, as if you had started the feature today. The result is a{" "}
          <strong>straight-line history</strong> with no merge bubbles, which is
          far easier to review, bisect, and revert.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`BEFORE (feature forked at B, main moved to C):

  main:     A--B--C   (someone else's merged PR)
                 \\
  feature:        D--E   (your work, based on stale B)

AFTER  git switch feature; git rebase main:

  main:     A--B--C
                    \\
  feature:           D'--E'   (same diffs, NEW SHAs, fresh base C)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch feature/metrics
git fetch origin
git rebase origin/main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Current branch feature/metrics is up to date.
First, rewinding head to replay your work on top of it...
Applying: feat: add metrics module
Applying: feat: wire /metrics endpoint`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline --graph -4
git status --short --branch`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`* 9a1b2c3 (HEAD -> feature/metrics) feat: wire /metrics endpoint
* 4d5e6f7 feat: add metrics module
* c0ffee1 (origin/main, main) Bump app to v2
## feature/metrics...origin/feature/metrics [ahead 2, behind 0]`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Fetch first:</strong> rebasing onto a stale local main
            replays onto yesterday&apos;s code — fetch, then rebase onto the
            remote&apos;s tip.
          </li>
          <li>
            <strong>New SHAs:</strong> D became D-prime — same changes, new
            parent, new hash. That rewrite is exactly why rebasing shared
            branches is forbidden (next section).
          </li>
          <li>
            <strong>Conflicts pause the replay:</strong> resolve the file, stage
            it, then continue — or abort to return to the pre-rebase state
            untouched.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Rebase vs merge: the rule that protects teams</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Updating a feature branch offers two doors. <strong>Merging main
          in</strong> preserves exact history (safe everywhere, adds a merge
          bubble). <strong>Rebasing onto main</strong> produces clean linear
          history (rewrites your SHAs). Both are fine on a branch only you use
          — but rebasing a branch others build on silently invalidates every
          clone, and the next pull turns into duplicate commits and phantom
          conflicts for the whole team.
        </p>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>Danger: never rebase shared or public branches.</strong>{" "}
            Never rebase main, develop, release branches, or any feature branch
            a teammate has pulled. Rewriting published SHAs forks every
            downstream clone. Rebase only branches that exist solely in your
            local repo (or your own PR branch before review starts) — and after
            rebasing a pushed PR branch, the only sync path is a careful
            force-push with lease, with your reviewers warned.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch feature/metrics
git merge origin/main -m "Merge main into feature/metrics"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Merge made by the 'ort' strategy.
 app.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
# safe on ANY branch, but history gains a merge bubble`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git rebase --abort
git rebase --continue`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# --abort: cancels the rebase, branch returns to its original commits
# --continue: resumes the replay after you resolved + staged a conflict
# Resolve each stopped commit in order; test at the end, not per commit.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Private branch:</strong> rebase freely for a clean,
            reviewable PR — then merge the PR normally on GitHub.
          </li>
          <li>
            <strong>Shared branch:</strong> merge main in, never rebase — a
            bubble in history is infinitely cheaper than a corrupted team.
          </li>
          <li>
            <strong>Stuck mid-rebase:</strong> abort is always safe before the
            replay completes; skip drops the current commit when it is provably
            already upstream.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Interactive rebase: squash five WIP commits into one</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Real feature work is messy — &quot;WIP&quot;, &quot;fix typo&quot;,
          &quot;actually fix it&quot;. <strong>Interactive rebase</strong> opens
          your recent commits as an editable to-do list: keep the first with{" "}
          <strong>pick</strong>, melt the rest in with <strong>squash</strong>{" "}
          (or fixup to discard their messages), rename with{" "}
          <strong>reword</strong>. You rewrite the last N commits into one
          clean, reviewable commit before opening the PR.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline -5
git rebase -i HEAD~5`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`5f6a7b8 fix typo in metrics label
4e5d6c7 WIP: wire endpoint
3c4b5a6 WIP: metrics module draft
2b3a495 feat: add metrics module
1a2b3c4 Bump app to v2
# --- editor opens with one 'pick' line per commit, oldest first ---`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`EDITOR FLOW (rewrite the to-do list, save, close):

  pick   2b3a495 feat: add metrics module     <- keep, becomes the base
  squash 3c4b5a6 WIP: metrics module draft    <- melt in
  squash 4e5d6c7 WIP: wire endpoint           <- melt in
  squash 5f6a7b8 fix typo in metrics label    <- melt in

  => second editor opens: write ONE message:
     "feat: add /metrics endpoint for Prometheus"
  => result: 5 messy commits become 1 clean commit (new SHA).`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline -2`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`9a1b2c3 (HEAD -> feature/metrics) feat: add /metrics endpoint for Prometheus
1a2b3c4 Bump app to v2`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Squash vs fixup:</strong> squash prompts you to combine
            messages; fixup silently discards the melted commit&apos;s message
            — use fixup for &quot;typo&quot; commits nobody should ever read.
          </li>
          <li>
            <strong>Reword:</strong> renames a single commit&apos;s message
            without touching its diff — the fastest fix for a bad subject line.
          </li>
          <li>
            <strong>Only unpushed history:</strong> interactive rebase rewrites
            SHAs, so it obeys the same golden rule — your private branch only,
            never shared history.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">.gitignore mastery: keep secrets and junk out forever</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Gitignore</strong> is a pattern file that tells Git which
          paths must never be tracked: credentials, dependency folders, build
          output, Terraform state, IDE clutter. Patterns support wildcards,{" "}
          <strong>negation with exclamation</strong> (re-include one file from
          an ignored directory), and <strong>trailing slashes</strong> for
          directories. One catch: ignore rules do not apply to files already
          tracked — those need explicit untracking first.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cat .gitignore`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# secrets — NEVER commit these
.env
*.pem
*.tfvars

# dependencies + build output
node_modules/
dist/
__pycache__/
*.pyc

# terraform + IDE
.terraform/
terraform.tfstate
terraform.tfstate.backup
.idea/
.vscode/

# exception: keep the example, ignore the real thing
# config/*.json
# !config/example.json`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status --short --ignored | head -8
git check-ignore -v .env node_modules/express/package.json`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`!! .env
!! node_modules/
 M app.py
.gitignore:2:.env     .env
.gitignore:9:node_modules/       node_modules/express/package.json`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>Danger: committed secrets stay in history.</strong> Adding{" "}
            .env to gitignore does not remove the copy already pushed — anyone
            cloning still receives it. Untrack it with{" "}
            <strong>remove-from-index with cached</strong>, rotate the leaked
            credential immediately (it is compromised the second it pushes),
            and purge history with an officially supported tool. Prevention
            (ignore + pre-commit scan) beats every cure.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git rm --cached .env
git status --short
git commit -m "chore: stop tracking .env, now ignored"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`rm '.env'
 M app.py
?? .env
[main 6a7b8c9] chore: stop tracking .env, now ignored`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git config --global core.excludesFile ~/.gitignore_global
cat ~/.gitignore_global`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# machine-specific junk, ignored in EVERY repo on this laptop
.DS_Store
Thumbs.db
*.swp
*~
.idea/`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Star, bang, slash:</strong> star matches anything, bang
            re-includes, trailing slash means directories only — three symbols
            cover nearly every real-world ignore file.
          </li>
          <li>
            <strong>Cached removal:</strong> untracks without deleting your
            local file — the secret stays on disk, leaves the repo, and future
            edits stay ignored.
          </li>
          <li>
            <strong>Global ignore:</strong> OS and editor droppings belong in
            the global file, not pasted into every project&apos;s gitignore.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses: clean PR history, sterile build contexts</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Pipelines build whatever the repo contains — every stray artifact,
          key, or 40-commit WIP trail rides along. Teams that squash to one
          commit per PR get bisectable main and one-click reverts; teams that
          ignore build output and credentials get fast checkouts, small Docker
          contexts, and no leaked secrets in image layers. Stash keeps incident
          response instant: shelve the feature, cut the hotfix, pop, continue.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`DIRTY PR:  WIP--typo--oops--fix--wip--fix  => CI runs 6x, reviewer reads noise,
                                                   revert = surgery on 6 commits
CLEAN PR:  feat: add /metrics (1 squashed commit) => CI runs 1x, bisect lands exactly,
                                                   revert = one click

DIRTY REPO:  .env + node_modules/ + dist/ committed => 800MB clone, secrets in layers
STERILE REPO: ignored + multi-stage build          => 40MB clone, nothing to leak`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git stash push -m "pause feature for prod hotfix"
git switch -c hotfix/checkout-timeout main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Saved working directory and index state On feature/metrics: pause feature for prod hotfix
Switched to a new branch 'hotfix/checkout-timeout'`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>One commit per ticket:</strong> squash before review — the
            deploy pipeline, changelog generator, and on-call debugger all
            assume main is a list of complete changes.
          </li>
          <li>
            <strong>Sterile contexts:</strong> Docker COPY ships ignored files
            anyway unless dockerignore mirrors gitignore — keep both files in
            sync or secrets leak into image layers.
          </li>
          <li>
            <strong>Hotfix drill:</strong> stash, branch from main, fix, PR,
            merge, switch back, pop — practice until the whole loop takes under
            five minutes.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Popping a stash onto the wrong branch: the WIP merges into
            unrelated code and the entry is already dropped. List and show
            before every pop; prefer apply when unsure.
          </li>
          <li>
            Forgetting the untracked flag: the tracked edits stash but the new
            file stays, blocking the checkout you stashed to enable. Use the
            untracked flag whenever new files exist.
          </li>
          <li>
            Rebasing main or a teammate&apos;s branch: rewrites public SHAs and
            forks every clone. Rebase private branches only; merge into shared
            ones.
          </li>
          <li>
            Rebasing without fetching: replays onto stale main, so the PR
            conflicts again immediately after opening. Fetch, then rebase onto
            the remote tip.
          </li>
          <li>
            Committing .env then ignoring it: the ignore rule arrives too late —
            history still carries the secret. Untrack with cached removal,
            rotate the credential, and purge history properly.
          </li>
          <li>
            Ignoring without verifying: a misplaced pattern silently excludes
            source files (or fails to exclude keys). Confirm every rule with
            check-ignore verbose output.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Dirty your tree, stash it with a message, verify a clean status, then pop it back and confirm your edits returned.</li>
          <li>Create an untracked file, prove plain stash leaves it behind, then stash with the untracked flag and watch it vanish.</li>
          <li>Run stash list and stash show on a stacked pair of entries, then restore only one with apply and compare against pop.</li>
          <li>Branch a feature, let main advance, then rebase the feature onto main and read the replay output line by line.</li>
          <li>Make five sloppy WIP commits on a test branch and squash them into one conventional-commit message with interactive rebase.</li>
          <li>Write a .gitignore covering .env, node_modules, dist, and terraform.tfstate, then verify each with check-ignore verbose.</li>
          <li>Track a dummy secret file, then untrack it with cached removal while keeping the local copy, and commit the fix.</li>
          <li>Set a global ignore file for OS and editor junk, and run the full hotfix drill: stash, branch from main, fix, pop.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
