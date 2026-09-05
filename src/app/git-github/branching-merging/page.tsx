import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Git & GitHub"
      title="Branching & Merging"
      intro="Branches let you work on a feature, fix, or experiment without touching stable code. A branch is just a movable pointer to a commit, merging brings that work back together, and conflicts are just Git asking you to decide. Learn this loop cold and every DevOps workflow — feature branches, release branches, hotfixes — becomes obvious."
      prev={{ href: "/git-github/add-commit-push", label: "Add, Commit & Push" }}
      next={{ href: "/git-github/remotes-clone-pull", label: "Remotes, Clone & Pull" }}
      resources={[
        {
          title: "Pro Git Book — Branching in a Nutshell",
          url: "https://git-scm.com/book/en/v2",
          description:
            "The definitive chapter on what a branch pointer is, how HEAD moves, and how merging works.",
        },
        {
          title: "Git Reference — Branching and Merging",
          url: "https://git-scm.com/doc",
          description:
            "Official git branch, switch, and merge reference with every flag used in this lesson.",
        },
        {
          title: "Atlassian — Using Branches",
          url: "https://www.atlassian.com/git/tutorials/using-branches",
          description:
            "Visual tutorial on creating branches, merge types, and resolving conflicts step by step.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">What a branch really is: a pointer to a commit</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Forget the idea that a branch is a folder copy. A branch is a{" "}
          <strong>40-byte file holding one commit SHA</strong> — a movable
          pointer. Committing on a branch just creates a new commit object and
          slides the pointer forward. <strong>HEAD</strong> is a second pointer
          that says &quot;you are here&quot; — it points at the current branch,
          which points at the current commit. Switching branches only moves
          HEAD and rewrites your working files; no history is duplicated.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`Commits:   A <-- B <-- C  (main)
                         \\
                          D <-- E  (feature/login)

Pointers:  main    -> C
           feature/login -> E
           HEAD    -> feature/login   ("you are on feature/login")

After one more commit F on feature/login:
           feature/login -> F,  main stays at C. Nothing copied.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git branch --show-current
cat .git/HEAD
cat .git/refs/heads/main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`feature/login
ref: refs/heads/feature/login
b7c2e91d4f3a8c1e6d0a9f2c5b81e77aa3d4f10`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Branch = pointer:</strong> creating a branch costs ~41
            bytes and is instant — Git never copies files. That is why
            branch-per-ticket is cheap.
          </li>
          <li>
            <strong>HEAD:</strong> &quot;ref: refs/heads/...&quot; means
            attached (normal). A raw SHA means detached HEAD — you will commit
            into the void unless you create a branch.
          </li>
          <li>
            <strong>.git/refs/heads/main:</strong> literally contains one SHA.
            Merge, rebase, and reset just rewrite these tiny files.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Creating and switching: branch, switch, and checkout -b</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>git branch</strong> creates the pointer but leaves you where
          you are; <strong>git switch</strong> moves HEAD;{" "}
          <strong>git checkout -b</strong> (or switch -c) does both at once.
          Modern Git prefers <strong>switch</strong> for branches and{" "}
          <strong>restore</strong> for files — checkout still works everywhere
          and is what you will see in old docs and scripts.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git branch feature/login
git switch feature/login
git status --short --branch`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# git branch feature/login — no output on success (pointer created, you stay on main)
Switched to branch 'feature/login'
## feature/login...origin/feature/login [ahead 0, behind 0]`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch main
git checkout -b hotfix/timeout
git branch`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Switched to branch 'main'
Switched to a new branch 'hotfix/timeout'
  feature/login
* hotfix/timeout
  main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch -c feature/health-check
git branch -vv`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Switched to a new branch 'feature/health-check'
* feature/health-check b7c2e91 Bump app to v2
  feature/login        5d6e7f8 feat: add login form
  hotfix/timeout       b7c2e91 Bump app to v2
  main                 b7c2e91 Bump app to v2`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>branch vs switch:</strong> branch creates, switch moves.
            Combine new starters into one step with checkout -b or switch -c —
            fewer chances to commit on the wrong branch.
          </li>
          <li>
            <strong>branch -vv:</strong> shows each branch&apos;s tip SHA,
            subject, and upstream tracking. The * marks HEAD&apos;s branch.
          </li>
          <li>
            <strong>Naming:</strong> feature/&lt;ticket&gt;,
            hotfix/&lt;what&gt;, release/v1.2 — slashes group branches and
            pipelines can match feature/* automatically.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Reading divergent history: log --oneline --graph --all</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Once branches diverge, plain <strong>git log</strong> lies by showing
          only your current branch. Add <strong>--all</strong> to see every
          branch, <strong>--graph</strong> to draw the forks,{" "}
          <strong>--oneline --decorate</strong> to label which pointer sits
          where. Read the * and | columns like a subway map: splits are
          branches, joins are merges.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`*  E (feature/login)  "feat: add login form"
| *  C (main)            "Bump app to v2"
|/
*  B                     "Add hello app"
*  A                     "Initial commit"

| = main kept moving, / = fork point at B, * = commits.
Merge will join E and C at a new commit M (or fast-forward if one side is empty).`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline --graph --all --decorate -6`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`* 5d6e7f8 (feature/login) feat: add login form
| * b7c2e91 (HEAD -> main) Bump app to v2
|/
* a1b2c3d Add hello app
* 9f8e7d6 Initial commit: readme and hello app`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline --graph --all --decorate -8
git show-branch --all 2>/dev/null || git branch -vv`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`* 5d6e7f8 (feature/login) feat: add login form
* 3f4a5b6 (hotfix/timeout) fix: raise login timeout to 10s
| * b7c2e91 (HEAD -> main) Bump app to v2
|/
* a1b2c3d Add hello app
* 9f8e7d6 Initial commit: readme and hello app
# --- branch -vv ---
* main             b7c2e91 Bump app to v2
  feature/login    5d6e7f8 feat: add login form
  hotfix/timeout   3f4a5b6 fix: raise login timeout to 10s`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>--decorate:</strong> prints (HEAD -&gt; main),
            (feature/login) labels — without it you cannot tell which commit
            belongs to which branch.
          </li>
          <li>
            <strong>--all:</strong> includes every local branch (and remotes).
            Without it you see only HEAD&apos;s ancestry and miss divergent
            work entirely.
          </li>
          <li>
            <strong>Alias it:</strong> git config --global alias.lg
            &quot;log --oneline --graph --all --decorate -15&quot; — then git
            lg is your daily map.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Merge types: fast-forward vs three-way merge</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          If main has not moved since you branched, Git just slides the pointer
          forward — a <strong>fast-forward</strong>, no new commit, perfectly
          linear history. If both sides moved, Git performs a{" "}
          <strong>three-way merge</strong>: it diffs the merge base against each
          tip and creates a new <strong>merge commit with two parents</strong>.
          Never fear the merge commit — it is the honest record that two lines
          of work joined here.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`FAST-FORWARD (main untouched since branch):
  before:  A--B (main)   B--C--D (feature)   =>  git switch main; git merge feature
  after:   A--B--C--D (main, feature)   — pointer slide, NO new commit

THREE-WAY (both moved, base = B):
  base B ---- C (main)
    \\            \\
     D ---- E (feature)  ==>  M (merge commit, parents C + E)
  Git diffs B->C and B->E, combines, commits M on main.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch main
git merge feature/health-check`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Updating b7c2e91..9a1c2d3
Fast-forward
 app.py | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch main
git merge feature/login -m "Merge feature/login: add login form"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Merge made by the 'ort' strategy.
 app.py      | 12 +++++++++++-
 login.py    | 20 ++++++++++++++++++++
 2 files changed, 31 insertions(+), 1 deletion(-)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline --graph -4`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`*   8f3a2c1 (HEAD -> main) Merge feature/login: add login form
|\\
| * 5d6e7f8 (feature/login) feat: add login form
|/
* b7c2e91 Bump app to v2`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Fast-forward output:</strong> &quot;Updating a..b&quot; plus
            &quot;Fast-forward&quot; — no merge commit line. History stays a
            straight line.
          </li>
          <li>
            <strong>Three-way output:</strong> &quot;Merge made by the
            ort strategy&quot; — ort is Git&apos;s current merge engine. The
            new commit has two parents; verify with git log --merges.
          </li>
          <li>
            <strong>--no-ff:</strong> forces a merge commit even when
            fast-forward is possible — teams use it so every feature shows as
            one merge bubble in history.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Merge conflict walkthrough: markers, resolve, commit</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A conflict means both branches edited the <strong>same lines</strong>{" "}
          — Git refuses to guess and marks the file with{" "}
          <strong>&lt;&lt;&lt;&lt;&lt;&lt;&lt;, =======, &gt;&gt;&gt;&gt;&gt;&gt;&gt;</strong>{" "}
          sections. Your job: open the file, keep the right code (or combine
          both), delete the markers, <strong>git add</strong> the resolved file,
          and <strong>git commit</strong> to finish the merge. Unmerged paths
          are listed by git status until you do.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch main
git merge feature/login`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Auto-merging app.py
CONFLICT (content): Merge conflict in app.py
Automatic merge failed; fix conflicts and then commit the result.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status --short`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`UU app.py
AA login.py`}
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
            code={`<<<<<<< HEAD
TIMEOUT = 5
print('hello v2')
=======
TIMEOUT = 10
print('hello login')
>>>>>>> feature/login`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# edit app.py: keep TIMEOUT=10, keep both prints, delete markers
cat app.py
git add app.py login.py
git status --short
git commit -m "Merge feature/login: resolve timeout conflict"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`TIMEOUT = 10
print('hello v2')
print('hello login')
M  app.py
M  login.py
[main 8f3a2c1] Merge feature/login: resolve timeout conflict`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>UU vs AA:</strong> UU = both modified (content conflict), AA
            = both added (same new file, different content). Both need manual
            resolution then git add.
          </li>
          <li>
            <strong>Markers:</strong> &lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD is your
            branch (main), ======= divides sides, &gt;&gt;&gt;&gt;&gt;&gt;&gt;
            feature/login is incoming. Never commit with markers still in the
            file — grep for &quot;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&quot; first.
          </li>
          <li>
            <strong>Abort hatch:</strong> git merge --abort restores pre-merge
            state if you panic. Only works before you commit the merge.
          </li>
          <li>
            <strong>Verify:</strong> run tests before committing the resolution
            — the merged code never ran on either branch alone.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Branch cleanup: -d vs -D and pruning</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Merged branches are clutter — delete them. Lowercase{" "}
          <strong>git branch -d</strong> is the safe delete: it refuses if the
          branch&apos;s commits are not merged anywhere. Uppercase{" "}
          <strong>-D</strong> force-deletes even unmerged work. Remote-tracking
          leftovers (origin/feature gone from GitHub) are swept with{" "}
          <strong>git fetch --prune</strong>.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git branch -d feature/login
git branch
git branch -d feature/unfinished`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Deleted branch feature/login (was 5d6e7f8).
  hotfix/timeout
* main
error: The branch 'feature/unfinished' is not fully merged.
If you are sure you want to delete it, run 'git branch -D feature/unfinished'.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git branch -D feature/unfinished
git push origin --delete feature/login
git fetch --prune`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Deleted branch feature/unfinished (was 3f4a5b6).
To github.com:YOU/git-practice.git
 - [deleted]         feature/login
Fetching origin
From github.com:YOU/git-practice.git
 - [deleted]         (none)     -> origin/feature/old-thing`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-d (safe):</strong> default after every merged PR. If it
            errors, the work is genuinely unmerged — inspect with git log
            main..feature/unfinished before deciding.
          </li>
          <li>
            <strong>-D (force):</strong> destroys unmerged commits. Only use
            when you confirmed the work is abandoned or pushed elsewhere —
            unrecoverable after garbage collection except via reflog.
          </li>
          <li>
            <strong>push --delete:</strong> removes the branch from GitHub.
            Local and remote branch lists are independent — deleting one side
            never deletes the other.
          </li>
          <li>
            <strong>--prune:</strong> clears stale origin/* pointers. Run git
            fetch --prune (or set fetch.prune=true once) so git branch -r
            stops showing deleted PR branches.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses: feature per ticket and release branches</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          DevOps teams map branches to work: <strong>feature/PROJ-123</strong>{" "}
          per ticket so CI tests each change in isolation,{" "}
          <strong>release/v1.4</strong> frozen for QA while main keeps moving,{" "}
          <strong>hotfix/</strong> cut straight from main for production fires.
          Pull requests + branch protection (next lessons) then guarantee only
          green, reviewed code merges — branches are the unit of safe delivery.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`main:     A--B--------M1--------M2---->  (always deployable)
               \\        \\         \\
feature/123:   C--D      \\         \\     (one ticket, CI per push)
                (PR #41 -- merged M1)
release/v1.4:            R1--R2--tag   (frozen QA, bugfix only)
hotfix/prod:                       H--M2 (main -> prod fast lane)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git checkout -b feature/PROJ-123-health-endpoint
git push -u origin feature/PROJ-123-health-endpoint
git checkout -b release/v1.4`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Switched to a new branch 'feature/PROJ-123-health-endpoint'
To github.com:YOU/git-practice.git
 * [new branch]      feature/PROJ-123-health-endpoint -> feature/PROJ-123-health-endpoint
Branch 'feature/PROJ-123-health-endpoint' set up to track remote branch from 'origin'.
Switched to a new branch 'release/v1.4'`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Feature per ticket:</strong> PROJ-123 maps branch → PR → CI
            run → Jira status. Revert = revert one merge commit, not surgery on
            main.
          </li>
          <li>
            <strong>Release branches:</strong> cut from main, only cherry-pick
            fixes in. Tag release/v1.4 when QA signs off; that tag is what
            deploys to prod.
          </li>
          <li>
            <strong>Hotfix:</strong> branch from the prod tag, fix, merge to
            both main and the release branch so the fix is never lost.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Committing straight to main: bypasses review and CI gates, and one
            bad push blocks the whole team. Always git switch -c feature/... —
            check git branch --show-current before committing.
          </li>
          <li>
            Deleting with -D before merging: unmerged commits vanish from the
            branch list (recoverable only via reflog for ~30 days). Use -d
            first; if it refuses, inspect git log main..branch.
          </li>
          <li>
            Merging without pulling main first: resolves stale conflicts and
            guarantees a second merge later. Run git switch main, git pull,
            then merge the feature.
          </li>
          <li>
            Committing conflict markers: &lt;&lt;&lt;&lt;&lt;&lt;&lt; text
            shipped to prod breaks builds. Grep for markers and run tests
            before finishing any conflicted merge.
          </li>
          <li>
            Never pruning: git branch -r fills with dead origin/* branches from
            old PRs. Use git fetch --prune or git config --global fetch.prune
            true once.
          </li>
          <li>
            Long-lived unmerged branches: weeks-old feature branches diverge so
            far every merge is a conflict marathon. Merge main into the feature
            (or rebase) every day or two.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create feature/greet with git checkout -b, commit one line there, and prove main is unchanged with git log --oneline --graph --all.</li>
          <li>Fast-forward merge feature/greet into main and identify the &quot;Fast-forward&quot; line in the output.</li>
          <li>Create two branches that edit the same line of app.py differently, merge one, then merge the second to force a real conflict.</li>
          <li>Resolve that conflict by hand: remove all markers, verify with grep, git add, and commit the merge.</li>
          <li>Practice git merge --abort on a fresh conflict to restore the pre-merge state, then redo the merge.</li>
          <li>Delete the merged branch with -d, attempt -d on an unmerged branch to see the error, then remove the test branch with -D.</li>
          <li>Push a feature branch with -u origin, delete it from GitHub with push --delete, then clean the stale pointer with fetch --prune.</li>
          <li>Set the global alias lg for log --oneline --graph --all --decorate and use git lg as your default history view for a day.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
