import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Git & GitHub"
      title="Start Here"
      intro="Every deploy, every pipeline, every rollback in DevOps starts with Git. If you cannot version your code and configs, you cannot automate safely, review changes, or recover when production breaks. This module takes you from zero — what Git even is — to pushing code, branching, opening pull requests, and using GitHub like a DevOps engineer."
      prev={{ href: "/git-github", label: "Git & GitHub" }}
      next={{ href: "/git-github/setup-config", label: "Setup & Config" }}
      resources={[
        {
          title: "Pro Git Book",
          url: "https://git-scm.com/book/en/v2",
          description:
            "Free complete Git book — chapters 1-3 cover exactly this module: what Git is, setup, and basic branching.",
        },
        {
          title: "GitHub Skills",
          url: "https://github.com/skills",
          description:
            "Free hands-on GitHub courses that walk you through repos, branches, and pull requests inside your own account.",
        },
        {
          title: "Atlassian Git Tutorials",
          url: "https://www.atlassian.com/git/tutorials",
          description:
            "Beginner-friendly visual guides to Git workflow, remotes, and pull requests with clear diagrams.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Why Git is non-negotiable for DevOps</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Git</strong> is version control: it records every change to
          your files so you can see history, undo mistakes, and collaborate
          without overwriting each other. DevOps adds automation on top —{" "}
          <strong>CI/CD pipelines, infrastructure as code, rollbacks</strong> —
          and all of it reads from Git. No Git means no trusted source of
          truth: you cannot tell what version is in production, who changed
          what, or how to roll back a bad deploy.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Pipelines trigger from Git:</strong> you push to{" "}
            <strong>main</strong>, Jenkins / GitHub Actions / GitLab CI sees the
            push and runs tests and deploys. The commit SHA becomes the release
            ID.
          </li>
          <li>
            <strong>Everything is code:</strong> app code, Dockerfiles,
            Kubernetes YAML, Terraform files — all live in Git. A server is
            rebuilt from what is committed, not from manual clicks.
          </li>
          <li>
            <strong>Safe recovery:</strong> bad deploy at 2am?{" "}
            <strong>git log</strong> shows what changed,{" "}
            <strong>git revert</strong> undoes it, and you redeploy the last
            good commit in minutes.
          </li>
          <li>
            <strong>Team review:</strong> pull requests let teammates review,
            test, and approve changes before they reach production — the human
            gate in front of automation.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git --version
git status`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`git version 2.43.0
fatal: not a git repository (or any of the parent directories): .git`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>git --version:</strong> proves Git is installed. If you see
            a version number, you are ready — setup is the next lesson.
          </li>
          <li>
            <strong>fatal: not a git repository:</strong> you ran a Git command
            outside any repo. Totally normal here — it just means this folder
            is not tracked yet. You will fix that with git init in the next
            lessons.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Git vs GitHub vs GitLab: what each one actually does</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Beginners mix these up. <strong>Git</strong> is the tool on your
          laptop that versions files. <strong>GitHub</strong> and{" "}
          <strong>GitLab</strong> are websites (hosting platforms) that store
          those versions online and add collaboration: pull requests, issues,
          CI/CD, access control. You learn Git commands once; they work with
          any host.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Git (local tool):</strong> init, add, commit, branch, merge,
            log. Works offline, no account needed. Installed with apt/dnf, made
            by Linus Torvalds.
          </li>
          <li>
            <strong>GitHub (remote host):</strong> stores repos online, adds
            pull requests, Actions CI/CD, code review, permissions. Free
            accounts hold unlimited public and private repos.
          </li>
          <li>
            <strong>GitLab (remote host + DevOps platform):</strong> same idea
            as GitHub plus built-in CI/CD pipelines, container registry, and
            self-hosting option many enterprises use.
          </li>
          <li>
            <strong>Analogy:</strong> Git is email software on your laptop;
            GitHub/GitLab are Gmail/Outlook servers that deliver and archive
            it. Learn Git once, use either server.
          </li>
          <li>
            <strong>Other hosts you will hear:</strong> Bitbucket, Azure
            Repos, AWS CodeCommit — all speak the same Git protocol; only the
            website buttons differ.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`which git
git --version`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/usr/bin/git
git version 2.43.0`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">The 4 areas: working directory, staging, local repo, remote</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every file lives in one of <strong>4 areas</strong>. The{" "}
          <strong>working directory</strong> is your normal files.{" "}
          <strong>Staging (index)</strong> is a loading dock where you pick
          exactly what goes into the next snapshot. The{" "}
          <strong>local repository (.git)</strong> is the permanent history on
          your laptop. The <strong>remote</strong> is the copy on GitHub that
          the team and pipelines share. Commands move changes one step right.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`+----------------+    git add    +--------------+   git commit   +---------------+    git push    +---------------+
|                |  ----------->  |              |  ------------>  |               |  ----------->  |               |
| WORKING DIR    |                | STAGING      |                | LOCAL REPO    |                | REMOTE        |
| your files     |                | index        |                | .git history  |                | GitHub        |
| edit here      |                | review here  |                | commit here   |                | team + CI     |
|                |  <-----------  |              |                |               |  <-----------  |               |
+----------------+    edit more   +--------------+                +---------------+    git fetch/    +---------------+
                                                                           pull         origin/main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status
git add app.py
git commit -m "Add health endpoint"
git push origin main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`On branch main
Changes not staged for commit:
  modified:   app.py
# (after git add)
Changes to be committed:
  modified:   app.py
# (after git commit)
[main a1b2c3d] Add health endpoint
 1 file changed, 5 insertions(+)
# (after git push)
To github.com:you/myapp.git
   9f8e7d6..a1b2c3d  main -> main`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Working dir → staging (git add):</strong> you choose files.
            Nothing is saved permanently yet — you can still unstage.
          </li>
          <li>
            <strong>Staging → local repo (git commit):</strong> snapshot saved
            with a message and ID. Safe even offline.
          </li>
          <li>
            <strong>Local → remote (git push):</strong> uploads commits to
            GitHub so teammates and CI can see them.
          </li>
          <li>
            <strong>Remote → local (git pull / fetch):</strong> downloads
            teammates&apos; work. Pull = fetch + merge in one step.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How a change flows: edit to production</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The daily loop is always the same five steps:{" "}
          <strong>edit → add → commit → push → pull request</strong>. You edit
          files, stage what you want, commit a snapshot, push to GitHub, then
          open a pull request for review. CI tests run on the PR; after
          approval it merges and deploys. Memorize this flow — every later
          lesson is just zooming into one box.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`edit app.py          git add            git commit              git push              pull request
  (work)     --->   (stage)    --->   (snapshot)    --->   (publish)    --->   (review + merge)
     |                  |                   |                     |                       |
  nano/vim        pick files         message + ID          origin/main            CI tests run
  local only      staging area       local history         GitHub copy            merge -> deploy

  1. EDIT ......... 2. ADD .......... 3. COMMIT ........... 4. PUSH ............ 5. PR + MERGE`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`echo "print('hello')" > app.py
git add app.py
git commit -m "Add hello app"
git push -u origin main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[main 3fa4b1c] Add hello app
 1 file changed, 1 insertion(+)
 create mode 100644 app.py
Branch 'main' set up to track remote branch 'main' from 'origin'.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">What you will learn in this module (8 topics)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          This module has 8 lessons in order. Each one builds on the last —
          do not skip setup and add/commit/push, because branching and pull
          requests assume you can already commit and push cleanly.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>1. Start Here (this page):</strong> mental model — Git vs
            GitHub, the 4 areas, and the edit-to-PR flow.
          </li>
          <li>
            <strong>2. Setup &amp; Config:</strong> install Git, set identity,
            default branch, and authenticate to GitHub.
          </li>
          <li>
            <strong>3. Add, Commit &amp; Push:</strong> the core loop — staging,
            good messages, logs, diffs, and pushing.
          </li>
          <li>
            <strong>4. Branching &amp; Merging:</strong> feature branches,
            merge vs rebase, and resolving conflicts.
          </li>
          <li>
            <strong>5. GitHub &amp; Pull Requests:</strong> forks, clones, PRs,
            reviews, and merging on GitHub.
          </li>
          <li>
            <strong>6. Undo &amp; Fix Mistakes:</strong> restore, reset,
            revert, amend, and stash without losing work.
          </li>
          <li>
            <strong>7. .gitignore &amp; Collaboration:</strong> ignoring secrets
            and logs, working as a team, protected branches.
          </li>
          <li>
            <strong>8. Git for DevOps:</strong> tagging releases, hooks, and
            how pipelines read Git for deploys.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How to practice: local repo + free GitHub account</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You need two things: a <strong>practice folder on your laptop</strong>{" "}
          for local commands, and a <strong>free GitHub account</strong> for
          push, pull requests, and Actions. Create a throwaway repo called{" "}
          <strong>git-practice</strong> — you will break it on purpose and learn
          faster. Plan <strong>1–2 weeks</strong>: 30–45 minutes daily beats one
          long weekend.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`mkdir -p ~/git-practice && cd ~/git-practice
git init
ls -la`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Initialized empty Git repository in /home/shiva/git-practice/.git/
total 8
drwxr-xr-x  3 shiva shiva 4096 Sep  5 10:00 .
drwxr-xr-x 20 shiva shiva 4096 Sep  5 10:00 ..
drwxr-xr-x  7 shiva shiva 4096 Sep  5 10:00 .git`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Days 1–3:</strong> setup, config, add/commit/push until you
            can do it without notes.
          </li>
          <li>
            <strong>Days 4–7:</strong> branching, merging, conflicts, and your
            first pull request.
          </li>
          <li>
            <strong>Week 2:</strong> undo commands, .gitignore, tags, and
            reading pipeline logs triggered by a push.
          </li>
          <li>
            <strong>Golden rule:</strong> type every command yourself. Copying
            without typing builds zero muscle memory.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes and done checklist</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Most beginners fail on mental models, not syntax. Fix these early
          and everything else gets easier. Use the checklist to confirm you
          actually absorbed this page before moving on.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Thinking Git = GitHub:</strong> Git works fully offline.
            GitHub only matters for sharing. Practice git init/commit/log with
            no internet at all.
          </li>
          <li>
            <strong>Thinking commit = save to GitHub:</strong> commit saves
            locally only. Nothing is shared until git push. Check with git
            status and git log after every commit.
          </li>
          <li>
            <strong>Skipping staging:</strong> git add is not bureaucracy — it
            lets you craft small precise commits instead of one giant dump.
          </li>
          <li>
            <strong>Done checklist:</strong> you can explain the 4 areas
            without notes; you can draw the edit → add → commit → push → PR
            flow; you know which of Git/GitHub/GitLab works offline; you have
            a git-practice folder and a GitHub account ready.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status
git log --oneline -5`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`On branch main
nothing to commit, working tree clean
a1b2c3d Add hello app
9f8e7d6 Initial commit`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create a free GitHub account and a public repo named git-practice with a README.</li>
          <li>Run git --version and git status in your home folder and explain each line of output.</li>
          <li>Draw the 4-areas diagram on paper from memory, then compare with this page.</li>
          <li>Write the 5-step flow (edit → add → commit → push → PR) and say what each step shares with the team.</li>
          <li>List one sentence for what Git, GitHub, and GitLab each do without looking.</li>
          <li>Make ~/git-practice, run git init, and confirm the .git folder exists with ls -la.</li>
          <li>Explain to a friend (or rubber duck) why commit alone does not back up your work.</li>
          <li>Plan your 1–2 week schedule: write which module topic you will do on which day.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
