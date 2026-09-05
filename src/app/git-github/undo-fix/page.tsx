import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Git & GitHub"
      title="Undo & Fix Mistakes"
      intro="Everyone commits the wrong file, writes the wrong message, or pushes a bug to shared history. Git gives you a full ladder of undo tools — from perfectly safe restores to history-rewriting resets. The pro skill is knowing which rung to stand on: fix private mistakes freely, never rewrite what others have already pulled."
      prev={{ href: "/git-github/pull-requests", label: "Pull Requests & Reviews" }}
      next={{ href: "/git-github/stash-rebase-gitignore", label: "Stash, Rebase & .gitignore" }}
      resources={[
        {
          title: "Pro Git Book — Undoing Things",
          url: "https://git-scm.com/book/en/v2",
          description:
            "The official book chapter on restore, amend, revert, reset, and reflog with the full safety reasoning.",
        },
        {
          title: "Git Reference — restore, reset, revert, reflog",
          url: "https://git-scm.com/doc",
          description:
            "Official reference for every undo command and flag used in this lesson.",
        },
        {
          title: "Atlassian — Undoing Changes",
          url: "https://www.atlassian.com/git/tutorials/undoing-changes",
          description:
            "Visual tutorial comparing checkout, revert, reset, and clean with when-to-use-each guidance.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">The safety ladder: restore is safe, reset rewrites, revert repairs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every undo tool moves a different pointer. <strong>Restore</strong>{" "}
          only touches files in your working tree or staging area — history is
          never rewritten, so it is always safe. <strong>Reset</strong> moves
          the branch pointer itself, which deletes commits from your timeline —
          safe on a private branch, dangerous on anything shared.{" "}
          <strong>Revert</strong> does the opposite of reset: it leaves history
          alone and adds a <em>new</em> commit that undoes an old one, so it is
          the only safe fix for published mistakes.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`SAFETY LADDER (top = safe, bottom = destructive):

  working tree ── git restore ──> file back to staged/HEAD version   SAFE, private
  staging area ── git restore --staged ──> unstage, keep edits       SAFE, private
  last commit ── git commit --amend ──> rewrite tip (unpushed only)  SAFE if unpushed
  published commit ── git revert ──> NEW commit undoes it            SAFE, shared OK
  branch pointer ── git reset --soft / --mixed ──> move tip back     REWRITES, private only
  branch pointer ── git reset --hard ──> move tip + DESTROY files    DESTRUCTIVE, private only

  RULE: published (pushed / pulled by others) => revert. Private => reset freely.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status --short
git log --oneline -3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={` M app.py
M  login.py
9f8e7d6 (HEAD -> main) Bump app to v2
a1b2c3d Add hello app
9f8e7d6 Initial commit: readme and hello app`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Read before you undo:</strong> status shows working tree vs
            staging (left column staged, right column unstaged); log shows
            where HEAD sits. Undo the layer you actually broke.
          </li>
          <li>
            <strong>Revert vs reset in one line:</strong> revert adds history,
            reset erases it. Erasing history other people have pulled corrupts
            their clones — that is the entire rule.
          </li>
          <li>
            <strong>Decide first:</strong> is the bad commit pushed or pulled by
            anyone else? Yes → revert. Only on your machine → reset or amend.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Unstage and unedit: restore --staged and restore</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Staged the wrong file? <strong>Restore with the staged flag</strong>{" "}
          copies HEAD back into the index for that path — the file stays edited
          on disk, it just leaves the staging area. Edited a file into a worse
          state? <strong>Plain restore</strong> copies the staged (or HEAD)
          version back into your working tree, discarding those edits. The
          second one destroys work, so Git makes you name the file explicitly.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status --short
git restore --staged login.py
git status --short`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`M  login.py
 M app.py
# --- after restore --staged login.py ---
Unstaged changes after reset:
M       login.py
 M login.py
 M app.py`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git diff --stat
git restore app.py
git status --short`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={` app.py | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
# --- after restore app.py: working-tree edits discarded ---
 M login.py`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>Warning: the old spell is dangerous.</strong> Old docs use{" "}
            <strong>checkout with a file path</strong> to discard edits — it
            works, but the same command also switches branches, so one missing{" "}
            <strong>--</strong> can strand you on the wrong branch with work in
            progress. Prefer <strong>restore</strong> for files and{" "}
            <strong>switch</strong> for branches; treat checkout-with-path as
            legacy syntax you read but never type.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git diff -- app.py
git restore --source=HEAD --staged --worktree app.py`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# git diff -- app.py: inspect before you destroy (no output = no unstaged diff)
# restore --source=HEAD --staged --worktree: unstage AND discard edits in one step
# File now matches HEAD exactly; use only when you are sure the edits are trash.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Unstage keeps edits:</strong> restore with staged only
            empties the index entry — your code stays on disk. Nothing is lost,
            ever.
          </li>
          <li>
            <strong>Restore discards edits:</strong> plain restore overwrites
            the working file with no backup. Diff first, restore second.
          </li>
          <li>
            <strong>Source flag:</strong> restore from a specific commit to
            resurrect one file from history without touching the branch pointer.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Amend the last commit: fix the message or the forgotten file</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          If the mistake is in the tip commit and nobody else has it yet,{" "}
          <strong>amend</strong> folds a fix into that commit instead of adding
          a second one. It works for two cases: the message has a typo, or you
          forgot a file. Under the hood amend creates a <em>replacement</em>{" "}
          commit with a new SHA — which is exactly why it is forbidden after
          pushing to a shared branch.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline -1
git commit --amend -m "feat: add /metrics endpoint for Prometheus"
git log --oneline -1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`1c2d3e4 feat: add /metric endpoint
# (amend rewrites the tip: new SHA, same parent)
7a9b0c1 feat: add /metrics endpoint for Prometheus`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status --short
git add metrics.py
git commit --amend --no-edit
git show --stat HEAD`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`?? metrics.py
# --- after add + amend --no-edit: forgotten file folded in, message kept ---
[main 4d5e6f7] feat: add /metrics endpoint for Prometheus
 Date: Sat Sep 5 2026
 2 files changed, 28 insertions(+)
 app.py     | 8 ++++++++
 metrics.py | 20 ++++++++++++++++++++`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>No-edit keeps the message:</strong> use it when only files
            change; pass a new message when the subject itself was wrong.
          </li>
          <li>
            <strong>New SHA every time:</strong> 1c2d3e4 became 7a9b0c1 — the
            old commit still exists until garbage collection, which is what
            makes reflog rescue possible.
          </li>
          <li>
            <strong>Unpushed only:</strong> if the commit is already on origin
            or in someone else&apos;s clone, do not amend — revert instead, or
            every teammate inherits a divergent fork.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Revert a published commit: safe undo for shared history</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          When the bad commit is already pushed — a broken deploy, a bad
          default, a secret that must die — <strong>revert</strong> computes the
          inverse diff and commits it as a new commit. History stays append-only
          so every clone stays compatible; code review, CI, and deploy
          pipelines treat the fix like any other change. This is the DevOps
          default for production incidents.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline -4
git revert 8f3a2c1 --no-edit`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`8f3a2c1 (HEAD -> main) feat: enable new checkout flow
b7c2e91 Bump app to v2
a1b2c3d Add hello app
9f8e7d6 Initial commit: readme and hello app
[main 3c4d5e6] Revert "feat: enable new checkout flow"
 1 file changed, 12 insertions(+), 31 deletions(-)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline -3
git show --stat HEAD`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`3c4d5e6 (HEAD -> main) Revert "feat: enable new checkout flow"
8f3a2c1 feat: enable new checkout flow
b7c2e91 Bump app to v2
 Date: Sat Sep 5 2026
 1 file changed, 12 insertions(+), 31 deletions(-)`}
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
   8f3a2c1..3c4d5e6  main -> main`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Why safe:</strong> revert is a fast-forwardable new commit —
            teammates pull normally, CI runs, no force push, no rewritten SHAs
            anywhere.
          </li>
          <li>
            <strong>Original stays visible:</strong> auditors see both the bug
            and its reversal with timestamps — exactly what incident reviews
            and compliance want.
          </li>
          <li>
            <strong>Conflicts possible:</strong> if later commits built on the
            reverted code, Git stops for manual resolution like a merge —
            resolve, add, and let the revert command finish the commit.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Reset deep dive: --soft keeps staged, --mixed unstages, --hard destroys</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Reset</strong> moves the branch pointer backward and decides
          how much of the index and working tree follows. <strong>Soft</strong>{" "}
          moves only the pointer — the index and files stay exactly as they
          were, so the undone commits&apos; changes sit staged, ready to
          recommit. <strong>Mixed</strong> (the default) also resets the index,
          so changes survive but unstaged. <strong>Hard</strong> resets all
          three — pointer, index, and working tree — permanently discarding
          uncommitted work in tracked files.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`HEAD is at C.  git reset [--soft|--mixed|--hard] B

              --soft:   branch -> B | index: keeps C's changes STAGED   | files: untouched
              --mixed:  branch -> B | index: reset to B (UNSTAGED)      | files: untouched
              --hard:   branch -> B | index: reset to B                 | files: OVERWRITTEN to B

  A -- B -- C   ==>   A -- B   (+ C's diff lives in index / worktree / nowhere)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline -3
git reset --soft HEAD~1
git status --short`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`c3d4e5f (HEAD -> main) wip: half-done metrics
b7c2e91 Bump app to v2
a1b2c3d Add hello app
# --- soft: pointer back, changes staged ---
M  app.py
M  metrics.py`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git reset --mixed HEAD~1
git status --short`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# --- mixed (default): pointer back, index cleared, files kept ---
 M app.py
 M metrics.py`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>Danger: reset with hard destroys uncommitted work.</strong>{" "}
            Tracked-file edits after a hard reset are unrecoverable except via
            editor backups or reflog luck — and untracked files are not even
            touched, which surprises people both ways. Never run it with
            uncommitted work you care about, never on a shared branch, and run
            status plus stash first when in doubt.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git reset --hard HEAD~1
git log --oneline -2`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`HEAD is now at b7c2e91 Bump app to v2
b7c2e91 (HEAD -> main) Bump app to v2
a1b2c3d Add hello app`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Hard-reset the wrong commit? <strong>Reflog</strong> is Git&apos;s
          flight recorder — every HEAD move for the last ~90 days, including
          resets and amends. Find your lost tip, point the branch back at it,
          and the &quot;destroyed&quot; commits return.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git reflog -5
git reset --hard ORIG_HEAD`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`c3d4e5f HEAD@{0}: reset: moving to HEAD~1
7a9b0c1 HEAD@{1}: commit: feat: add /metrics endpoint for Prometheus
b7c2e91 HEAD@{2}: commit: Bump app to v2
# --- ORIG_HEAD: where HEAD was before the dangerous operation ---
HEAD is now at c3d4e5f wip: half-done metrics`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git reset --hard HEAD@{1}
git log --oneline -2`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`HEAD is now at 7a9b0c1 feat: add /metrics endpoint for Prometheus
7a9b0c1 (HEAD -> main) feat: add /metrics endpoint for Prometheus
b7c2e91 Bump app to v2`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>ORIG_HEAD shortcut:</strong> Git saves the pre-reset tip
            automatically — resetting hard to it is the one-command undo of an
            accidental reset.
          </li>
          <li>
            <strong>HEAD with braces:</strong> HEAD@{1} means one move ago —
            copy the SHA from reflog if you have moved HEAD several times
            since the accident.
          </li>
          <li>
            <strong>Reflog is local and temporary:</strong> it never pushes to
            remotes and entries expire (~90 days). Rescue now, not next
            quarter.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Conflict resolution recap: when undo itself conflicts</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Reverts and cherry-picks can conflict exactly like merges — later
          commits edited the same lines you are trying to un-apply. The drill
          is identical: read status, open the marked file, keep the correct
          code, remove every marker, stage, and let the in-progress command
          finish. Enable <strong>rerere</strong> (reuse recorded resolution)
          once and Git replays your past conflict answers automatically on
          repeated reverts and rebases.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git config --global rerere.enabled true
git revert 8f3a2c1 --no-edit`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Auto-merging app.py
CONFLICT (content): Merge conflict in app.py
error: could not revert 8f3a2c1... feat: enable new checkout flow
hint: After resolving the conflicts, mark them with
hint: "git add/rm", then run "git revert --continue".`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status --short
git add app.py
git revert --continue`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`UU app.py
# --- after editing out the markers and staging ---
[main 3c4d5e6] Revert "feat: enable new checkout flow"
 1 file changed, 12 insertions(+), 31 deletions(-)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git revert --abort
git log --oneline -2`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# --abort: cancels the in-progress revert, restores pre-revert state
3c4d5e6 (HEAD -> main) Revert "feat: enable new checkout flow"
b7c2e91 Bump app to v2`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Rerere:</strong> one global config; Git caches each conflict
            resolution under .git/rr-cache and re-applies it when the same
            conflict recurs during rebases and repeated reverts.
          </li>
          <li>
            <strong>Continue vs abort:</strong> continue finishes after you
            stage the fix; abort surrenders cleanly before committing — use it
            the moment the conflict is bigger than the revert is worth.
          </li>
          <li>
            <strong>Test the resolution:</strong> reverted-plus-later-code never
            ran together before — run the suite before pushing the revert.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses: revert the bad deploy, never reset production</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          In a pipeline, main is a release train — every merge can auto-deploy
          to staging or prod. When a deploy breaks, <strong>revert the merge on
          main and push</strong>: the pipeline sees a normal commit, rebuilds,
          and rolls the environment forward to healthy code. Resetting main
          backward would require force-pushing a protected branch, desync every
          clone, and leave the deploy history lying about what ran.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`BAD deploy on main:   v1.3 -- M(broken) -- R(revert of M) --> deploy v1.3-equivalent
                        |                |              |
                     healthy       auto-deploys     auto-deploys fix (normal push, no force)
                     prod          broken prod      healthy prod + full audit trail

  NEVER:  v1.3 -- M(broken) --X  (reset --hard + force push: every clone diverges,
          protected branches reject it, deploy log disagrees with git history)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline -2
git revert -m 1 8f3a2c1 --no-edit
git push origin main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`8f3a2c1 (HEAD -> main) Merge pull request #44 (broken checkout)
b7c2e91 Release v1.3
[main 9a1b2c3] Revert "Merge pull request #44 (broken checkout)"
To github.com:YOU/git-practice.git
   8f3a2c1..9a1b2c3  main -> main`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Revert with parent 1:</strong> merge commits have two
            parents, so revert needs the mainline flag — parent 1 is almost
            always main. The flag picks which side counts as &quot;the line to
            keep&quot;.
          </li>
          <li>
            <strong>Pipeline-friendly:</strong> the revert is an ordinary push —
            required checks run, reviewers can approve, branch protection stays
            satisfied, deploy logs stay truthful.
          </li>
          <li>
            <strong>Forward fix vs revert:</strong> revert first to stop the
            bleeding (seconds), then re-land a corrected PR at leisure. MTTR
            beats elegance during an outage.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Reset with hard on a shared branch: rewrites commits teammates
            already pulled — their next pull explodes into divergent history.
            Revert published work; reserve reset for private branches.
          </li>
          <li>
            Force-pushing main to &quot;fix&quot; it: same damage at remote
            scale, and branch protection should block it anyway. Push a revert
            commit instead of rewriting the remote.
          </li>
          <li>
            Amending a pushed commit: silently forks everyone&apos;s history —
            they keep the old SHA, you have the new one. One amend per push is
            the discipline; after push, revert.
          </li>
          <li>
            Plain restore without diffing first: discarded working-tree edits
            have no recycle bin. Inspect with diff, stash a backup when unsure,
            then restore.
          </li>
          <li>
            Reverting a merge without the mainline flag: Git aborts with a
            &quot;needs -m&quot; error because it cannot guess which parent to
            keep. Re-read the error — it tells you the exact flag.
          </li>
          <li>
            Panicking past the abort hatch: merge, revert, and cherry-pick all
            support abort before committing. Abort early beats resolving a
            conflict you never needed.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Stage a file by accident, then unstage it with restore --staged and prove with status that your edits survived on disk.</li>
          <li>Trash a scratch edit with plain restore — but diff the file first — and confirm status is clean afterwards.</li>
          <li>Commit with a typo in the message, fix it with amend, and verify the SHA changed with log --oneline.</li>
          <li>Commit a file, forget a second file, fold it in with add plus amend --no-edit, and inspect the result with show --stat.</li>
          <li>Push a bad commit to your own repo, revert it with revert --no-edit, push again, and confirm history shows both commits.</li>
          <li>Reflog rescue drill: create a commit, hard-reset one step back, then resurrect the commit via reflog plus reset --hard to its SHA.</li>
          <li>Compare reset modes on a test repo: soft then check staged changes, mixed then check unstaged changes, and describe the difference in one sentence each.</li>
          <li>Enable rerere globally, force a revert conflict on a practice branch, resolve it once, and observe Git reuse your answer on the retry.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
