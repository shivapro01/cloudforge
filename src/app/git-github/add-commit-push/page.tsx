import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Git & GitHub"
      title="Add, Commit & Push"
      intro="Add, commit, and push is the loop you will run hundreds of times a week. Staging picks what goes in, commits snapshot it with a message your future self can understand, and push publishes it so teammates and pipelines can use it. Master status, add, log, diff, and push here and every advanced topic gets easy."
      prev={{ href: "/git-github/setup-config", label: "Setup & Config" }}
      next={{ href: "/git-github/branching-merging", label: "Branching & Merging" }}
      resources={[
        {
          title: "Pro Git Book — Basics",
          url: "https://git-scm.com/book/en/v2",
          description:
            "Chapters on recording changes, viewing history, and working with remotes — the deep version of this lesson.",
        },
        {
          title: "GitHub Docs — Commits and Pushes",
          url: "https://docs.github.com/en",
          description:
            "Official guides to committing, viewing history, and pushing to remotes from the command line.",
        },
        {
          title: "Atlassian — Saving Changes",
          url: "https://www.atlassian.com/git/tutorials",
          description:
            "Clear git add / commit / push tutorials with diagrams showing staging vs history vs remote.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">The 3 states in depth: modified, staged, committed</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A file is always in one state: <strong>modified</strong> (edited in
          working dir, not staged), <strong>staged</strong> (git added, waiting
          in the index), or <strong>committed</strong> (safely stored in .git
          history). Editing moves committed → modified; git add moves modified
          → staged; git commit moves staged → committed. Only staged content
          goes into the next snapshot — that selectiveness is the whole point
          of staging.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`COMMITTED (.git)         MODIFIED (workdir)         STAGED (index)           COMMITTED (.git)
  snapshot v1   --edit-->   app.py changed    --git add-->   app.py staged   --git commit-->  snapshot v2
  clean tree               * unstaged *                      * to commit *                    clean tree
                           git status = red                  git status = green               git log +1

  checkout ----------> edits file          add ----------> stages file       commit ------> saves snapshot`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`echo "v2" >> app.py
git status --short
git add app.py
git status --short
git commit -m "Bump app to v2"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={` M app.py
M  app.py
[main b7c2e91] Bump app to v2
 1 file changed, 1 insertion(+)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>&quot; M&quot; with space-first:</strong> modified but
            unstaged — commit would ignore it. This is the most common
            beginner surprise.
          </li>
          <li>
            <strong>&quot;M &quot; staged:</strong> M in the first column means
            staged and ready. git commit will include exactly this content.
          </li>
          <li>
            <strong>DevOps lens:</strong> CI builds whatever you committed, not
            what sits unstaged on your laptop. &quot;But it worked locally&quot;
            usually means you forgot to add and commit a file.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Reading git status like a dashboard</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Run <strong>git status</strong> constantly — before adding, before
          committing, before pushing. It tells you the branch, what is staged,
          what is not, and what is <strong>untracked</strong> (brand-new files
          Git has never seen). Untracked files need git add before Git tracks
          them at all.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status
touch notes.txt
echo "change" >> app.py
git status`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`On branch main
nothing to commit, working tree clean
# --- after touch + edit ---
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be included)
        modified:   app.py
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        notes.txt
no changes added to commit (use "git add" to commit)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git add app.py
git status
git status --short`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   app.py
Untracked files:
        notes.txt
M  app.py
?? notes.txt`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Untracked (??):</strong> Git sees the file but tracks
            nothing about it. It will never be committed or pushed until git
            added — and it is also never deleted by Git operations.
          </li>
          <li>
            <strong>Changes to be committed:</strong> staged snapshot preview.
            This exact content — not later edits — is what the next commit
            saves.
          </li>
          <li>
            <strong>--short:</strong> script-friendly two-column form: first
            column = staged, second = unstaged, ?? = untracked. M prefix means
            modified, A means added.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">git add: one file, everything, all changes, interactive</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>git add</strong> copies file content into staging — it does
          not commit anything. Add a single file for precise commits,{" "}
          <strong>git add .</strong> for everything under the current folder,{" "}
          <strong>git add -A</strong> for everything including deletions
          anywhere in the repo, and <strong>git add -p</strong> to stage
          hunk-by-hunk when you want surgical commits.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git add app.py
git add .
git add -A
git add -p app.py`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`# git add app.py — stages only app.py, nothing else
# git add . — stages new + modified + deleted under current dir
# git add -A — stages everything in the whole repo, any folder
# git add -p — interactive prompt per hunk:
diff --git a/app.py b/app.py
@@ -1,2 +1,3 @@
 print('hello')
+print('v2')
Stage this hunk [y,n,q,a,d,s,e,?]? y`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>git add app.py:</strong> precise, safest default. Use when
            files have unrelated changes you want in separate commits.
          </li>
          <li>
            <strong>git add . vs -A:</strong> nearly identical today; . is
            scoped to your current directory, -A covers the whole repo
            including deletions outside it. In the repo root they match.
          </li>
          <li>
            <strong>git add -p:</strong> patch mode — y stages a hunk, n skips,
            s splits it smaller. The pro way to separate a bugfix from a
            feature when both touched one file.
          </li>
          <li>
            <strong>Never blind git add .</strong> with secrets, .env files, or
            giant logs present — check git status first, every time.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Writing great commits: 50-char subjects and conventional commits</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A commit message is a log entry your team and your future self read
          during incidents. Keep the <strong>subject under 50 chars,
          imperative mood</strong> (&quot;Add&quot; not &quot;Added&quot;),
          blank line, then a <strong>body explaining why</strong>. DevOps teams
          use <strong>conventional commits</strong> — feat:, fix:, ci:, docs: —
          so changelogs and pipelines can parse intent automatically.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git commit -m "Fix login timeout"
git commit -m "feat: add /health endpoint for load balancer checks" -m "ALB needs 200 in <2s; previous handler did DNS lookup per request."
git log --oneline -3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[main 1a2b3c4] Fix login timeout
[main 5d6e7f8] feat: add /health endpoint for load balancer checks
5d6e7f8 feat: add /health endpoint for load balancer checks
1a2b3c4 Fix login timeout
9f8e7d6 Initial commit: readme and hello app`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Good:</strong> &quot;feat: add /health endpoint&quot;,
            &quot;fix: retry S3 upload on 503&quot;,
            &quot;ci: run tests on pull request&quot; — type + what + why. Bad:
            &quot;stuff&quot;, &quot;fix&quot;, &quot;final FINAL v2&quot;.
          </li>
          <li>
            <strong>Imperative mood:</strong> &quot;Add&quot;, &quot;Fix&quot;,
            &quot;Bump&quot; — as if ordering the codebase. Matches git&apos;s
            own messages (&quot;Merge branch...&quot;).
          </li>
          <li>
            <strong>Atomic commits:</strong> one logical change per commit. A
            pipeline bisect or revert is painless when commit = one deployable
            idea, painful when commit = &quot;whole Friday&quot;.
          </li>
          <li>
            <strong>Empty -m=&quot;&quot; commits</strong> are rejected by
            serious teams (and blocked by hooks) because git log becomes
            useless during outages.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">git log mastery: oneline, graph, stat, patch</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>git log</strong> is incident archaeology: who changed what,
          when, and why. Raw log is verbose, so pros layer flags:{" "}
          <strong>--oneline</strong> for scan mode, <strong>--graph</strong>{" "}
          for branches, <strong>--stat</strong> for which files, and{" "}
          <strong>-p</strong> for the actual diff. Learn these four and you can
          answer any &quot;when did this break&quot; question.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git log --oneline -5
git log --oneline --graph -6
git log --stat -2
git log -p -1 -- app.py`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`5d6e7f8 feat: add /health endpoint for load balancer checks
b7c2e91 Bump app to v2
a1b2c3d Add hello app
9f8e7d6 Initial commit: readme and hello app
# --- --graph ---
* 5d6e7f8 feat: add /health endpoint
* b7c2e91 Bump app to v2
* a1b2c3d Add hello app
* 9f8e7d6 Initial commit
# --- --stat -2 ---
commit 5d6e7f8 feat: add /health endpoint...
 app.py | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)
# --- -p ---
diff --git a/app.py b/app.py
-print('hello')
+print('hello devops')`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>--oneline -5:</strong> last 5 commits, one line each. Your
            default view — short SHA + subject is enough 90% of the time.
          </li>
          <li>
            <strong>--graph:</strong> draws branch lines (* and |). Essential
            once feature branches exist — shows where branches forked and
            merged.
          </li>
          <li>
            <strong>--stat:</strong> files changed + insert/delete counts.
            Answers &quot;was this a one-line fix or a 40-file refactor&quot;
            before you read code.
          </li>
          <li>
            <strong>-p -- file:</strong> full patch for one file. Pair with -1
            (last commit) or -2 during bisect-style debugging.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Inspect before you commit: diff, staged, and show</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Never commit blind. <strong>git diff</strong> shows unstaged edits,{" "}
          <strong>git diff --staged</strong> shows what the next commit will
          actually contain, and <strong>git show</strong> displays any past
          commit in full. Pros read the staged diff as a final review — it
          catches debug prints, secrets, and accidental files before they are
          permanent.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git diff
git diff --staged
git show HEAD --stat
git show b7c2e91 -- app.py`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`diff --git a/app.py b/app.py
index 3fa4b1c..b7c2e91 100644
--- a/app.py
+++ b/app.py
@@ -1 +1,2 @@
 print('hello')
+print('v2')
# --- --staged: same diff, but content staged for next commit ---
# --- show HEAD --stat ---
commit 5d6e7f8 feat: add /health endpoint...
 app.py | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>git diff (no args):</strong> working dir vs staging =
            &quot;what have I not staged yet&quot;. Empty means everything is
            staged or clean.
          </li>
          <li>
            <strong>git diff --staged:</strong> staging vs HEAD = &quot;what
            will the next commit save&quot;. Read this line by line before
            every commit.
          </li>
          <li>
            <strong>git show &lt;sha&gt;:</strong> full commit: message, author,
            date, and diff. HEAD means latest; add --stat for summary or --
            filename to focus one file.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pushing: -u origin main and DevOps uses</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>git push</strong> uploads local commits to GitHub. The first
          push needs <strong>-u origin main</strong>: -u sets the upstream so
          future pushes need just <strong>git push</strong>, origin is the
          remote name, main is the branch. In DevOps every push can trigger a
          pipeline — so push <strong>small atomic commits</strong>: one
          pipeline-config change per commit, green tests per push, revertable
          in one step.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git remote add origin git@github.com:YOU/git-practice.git
git push -u origin main
git push`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Writing objects: 100% (5/5), 412 bytes | 412.00 KiB/s, done.
Total 5 (delta 0), reused 0 (delta 0)
To github.com:YOU/git-practice.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
# --- later pushes ---
Everything up-to-date`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-u (upstream):</strong> links local main to origin/main.
            After that git push, git pull, and git status know where to go and
            can warn &quot;ahead by 2 commits&quot;.
          </li>
          <li>
            <strong>origin:</strong> default nickname for your GitHub URL. Check
            with git remote -v; teams add upstream for the original repo when
            forking.
          </li>
          <li>
            <strong>DevOps uses:</strong> commit per pipeline change (Dockerfile
            tweak = one commit), push to a feature branch to test CI without
            touching prod, tag the commit that passed staging for release.
          </li>
          <li>
            <strong>Rejected push?</strong> someone else pushed first — git pull
            --rebase, resolve, then push again. Never force-push shared main
            (covered in branching lesson).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            git add . with secrets inside: .env, *.pem, and credentials get
            staged and then live in history forever. Check git status and git
            diff --staged first; .gitignore comes in a later lesson.
          </li>
          <li>
            Empty or junk messages (-m &quot;fix&quot;, -m &quot;asdf&quot;):
            git log becomes unreadable and reverting during incidents is
            guesswork. Write type + what + why, every time.
          </li>
          <li>
            One mega-commit for a whole day: mixes features, fixes, and config
            so nothing can be reverted alone. Commit early and often — green,
            atomic, reviewable chunks.
          </li>
          <li>
            Committing but never pushing: work sits only on your laptop —
            unbacked-up and invisible to CI. Push daily, push feature branches
            early for feedback.
          </li>
          <li>
            Editing after git add without re-adding: the commit saves the old
            staged copy, not your new edits. Re-run git status + git diff
            --staged right before committing.
          </li>
          <li>
            Pushing to the wrong remote/branch: personal fork vs team repo
            confusion. Verify with git remote -v and git status -sb before
            pushing anything sensitive.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create three edits in app.py, stage only one hunk with git add -p, and commit it separately.</li>
          <li>Make an untracked file, observe ?? in git status --short, then add and commit it.</li>
          <li>Write 4 commits — one each with feat:, fix:, docs:, ci: prefixes — and read them with git log --oneline.</li>
          <li>Compare git diff vs git diff --staged on a half-staged file and explain the difference.</li>
          <li>Run git log --oneline --graph --stat -5 and describe every line of output.</li>
          <li>Use git show HEAD to display your last commit fully, then git show HEAD --stat for the summary.</li>
          <li>Connect ~/git-practice to GitHub with git remote add origin and complete git push -u origin main.</li>
          <li>Push one atomic commit (single purpose, 50-char imperative message) and confirm it on github.com.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
