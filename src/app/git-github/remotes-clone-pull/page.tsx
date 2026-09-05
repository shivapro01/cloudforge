import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Git & GitHub"
      title="Remotes, Clone & Pull"
      intro="Your laptop is one copy — remotes are the shared copies on GitHub that teammates, CI, and servers all see. Clone copies a repo down, fetch downloads without touching your files, pull fetches plus merges, and push publishes. Nail origin vs upstream, tracking branches, and the pull-before-push loop and collaboration stops being scary."
      prev={{ href: "/git-github/branching-merging", label: "Branching & Merging" }}
      next={{ href: "/git-github/pull-requests", label: "Pull Requests & Reviews" }}
      resources={[
        {
          title: "Pro Git Book — Working with Remotes",
          url: "https://git-scm.com/book/en/v2",
          description:
            "Deep dive on clone, remote, fetch, pull, and push — the canonical chapter behind this lesson.",
        },
        {
          title: "GitHub Docs — About Remote Repositories",
          url: "https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories",
          description:
            "Official guide to origin, upstream, cloning URLs, and fetching vs pulling on GitHub.",
        },
        {
          title: "Atlassian — Syncing (Fetch, Pull, Push)",
          url: "https://www.atlassian.com/git/tutorials/syncing",
          description:
            "Clear comparison of fetch vs pull with diagrams showing local, remote-tracking, and remote state.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">origin, upstream, and what remote -v shows</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>remote</strong> is just a nickname for a URL —{" "}
          <strong>origin</strong> is your repo&apos;s default remote (usually
          your fork or team repo), <strong>upstream</strong> is the original
          repo you forked from. <strong>git remote -v</strong> lists each
          nickname with its fetch and push URLs — read it before every push so
          secrets never land in the wrong repo.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git remote -v
git remote add upstream https://github.com/ORIGINAL/git-practice.git
git remote -v`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`origin  git@github.com:YOU/git-practice.git (fetch)
origin  git@github.com:YOU/git-practice.git (push)
# --- after adding upstream ---
origin    git@github.com:YOU/git-practice.git (fetch)
origin    git@github.com:YOU/git-practice.git (push)
upstream  https://github.com/ORIGINAL/git-practice.git (fetch)
upstream  https://github.com/ORIGINAL/git-practice.git (push)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git remote show origin
git remote get-url origin
git remote get-url --push upstream`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`* remote origin
  Fetch URL: git@github.com:YOU/git-practice.git
  Push  URL: git@github.com:YOU/git-practice.git
  HEAD branch: main
  Remote branches:
    main                tracked
    feature/login       tracked
git@github.com:YOU/git-practice.git
https://github.com/ORIGINAL/git-practice.git`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>origin:</strong> created automatically by git clone. Your
            pushes and pulls go here by default — verify it points at YOUR fork
            before pushing.
          </li>
          <li>
            <strong>upstream:</strong> never automatic — you add it after
            forking so you can pull the original project&apos;s updates without
            mixing up where you push.
          </li>
          <li>
            <strong>(fetch) vs (push):</strong> normally identical, but teams
            can set a read-only fetch URL and a write push URL — get-url
            exposes exactly where code will land.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">git clone: HTTPS vs SSH and what it sets up</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>git clone</strong> copies the full history, checks out main,
          creates the <strong>origin</strong> remote, and sets up{" "}
          <strong>remote-tracking branches</strong> (origin/main) plus upstream
          tracking for main. <strong>HTTPS</strong> URLs work anywhere with a
          token; <strong>SSH</strong> URLs need a key but never ask for
          passwords — servers and CI bots overwhelmingly use SSH or tokens.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git clone https://github.com/YOU/git-practice.git
cd git-practice
git remote -v
git branch -a`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Cloning into 'git-practice'...
remote: Enumerating objects: 12, done.
remote: Counting objects: 100% (12/12), done.
Receiving objects: 100% (12/12), 4.12 KiB | 4.12 MiB/s, done.
origin  https://github.com/YOU/git-practice.git (fetch)
origin  https://github.com/YOU/git-practice.git (push)
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
  remotes/origin/feature/login`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git clone git@github.com:YOU/git-practice.git deploy-copy
git -C deploy-copy log --oneline -3
git -C deploy-copy status -sb`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Cloning into 'deploy-copy'...
remote: Enumerating objects: 12, done.
Receiving objects: 100% (12/12), done.
8f3a2c1 Merge feature/login: resolve timeout conflict
b7c2e91 Bump app to v2
a1b2c3d Add hello app
## main...origin/main`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>HTTPS:</strong> https://github.com/... — prompts for a
            personal access token (passwords no longer work). Best for quick
            starts and Windows laptops.
          </li>
          <li>
            <strong>SSH:</strong> git@github.com:... — uses your ~/.ssh key,
            no per-push login. Best for daily drivers, EC2, and CI runners.
          </li>
          <li>
            <strong>What clone wires up:</strong> .git with full history,
            origin remote, origin/* tracking branches, and main tracking
            origin/main — git pull and git status just work immediately.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">fetch vs pull: download vs download-plus-merge</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>git fetch</strong> only downloads — it updates origin/main
          but never touches your files, so it is always safe.{" "}
          <strong>git pull</strong> is fetch + merge (or rebase with
          --rebase): it downloads AND integrates into your branch, which can
          create merge commits or conflicts. Pros fetch first, inspect, then
          merge deliberately.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`git fetch:                  git pull (= fetch + merge):

GitHub main:  A--B--C        GitHub main:  A--B--C
                    \\                           \\
local main:    A--B (files    local main:    A--B--M (files CHANGED, merge M)
                 unchanged)      origin/main:  C
origin/main:   B -> C            * pull can conflict; fetch never can`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git fetch origin
git status -sb
git log --oneline main..origin/main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`From github.com:YOU/git-practice
   b7c2e91..9a1c2d3  main       -> origin/main
## main...origin/main [behind 2]
9a1c2d3 ci: add test workflow
7e8f9a0 docs: clarify health endpoint`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git pull --rebase
git log --oneline -3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Successfully rebased and updated refs/heads/main.
9a1c2d3 ci: add test workflow
7e8f9a0 docs: clarify health endpoint
b7c2e91 Bump app to v2`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>fetch output:</strong> &quot;b7c2e91..9a1c2d3 main -&gt;
            origin/main&quot; means the tracking pointer moved — your files
            did not. Zero risk, run it anytime.
          </li>
          <li>
            <strong>[behind 2]:</strong> status tells you GitHub has 2 commits
            you lack. main..origin/main lists exactly which ones before you
            merge.
          </li>
          <li>
            <strong>pull --rebase:</strong> replays your local commits on top
            of the fetched ones — linear history, no merge bubble. Prefer it
            for personal branches; plain pull (merge) is fine for main.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tracking branches: -u and --set-upstream-to</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>tracking (upstream) branch</strong> links local main to
          origin/main so Git knows where to push, pull, and compare. The first
          push uses <strong>-u</strong> to create the link;{" "}
          <strong>--set-upstream-to</strong> repairs or changes it later. Once
          linked, bare <strong>git push</strong>, <strong>git pull</strong>, and
          &quot;ahead/behind&quot; counters in status all work.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git checkout -b feature/metrics
git push -u origin feature/metrics
git status -sb`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Switched to a new branch 'feature/metrics'
To github.com:YOU/git-practice.git
 * [new branch]      feature/metrics -> feature/metrics
Branch 'feature/metrics' set up to track remote branch 'feature/metrics' from 'origin'.
## feature/metrics...origin/feature/metrics`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git branch --set-upstream-to=origin/main main
git branch -vv`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Branch 'main' set up to track remote branch 'main' from 'origin'.
* feature/metrics 1c2d3e4 feat: add /metrics endpoint [origin/feature/metrics]
  main             b7c2e91 Bump app to v2 [origin/main]`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-u (= --set-upstream):</strong> one-time link on first
            push. After that git push with no args pushes to the linked
            branch — drop the -u and it still works.
          </li>
          <li>
            <strong>--set-upstream-to:</strong> fixes &quot;no upstream
            branch&quot; errors or re-points a branch (e.g. fork main tracking
            upstream/main for syncing).
          </li>
          <li>
            <strong>branch -vv:</strong> the [origin/...] suffix proves
            tracking exists. Missing suffix means pushes need explicit origin
            + branch every time.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pushing a feature branch and opening the door to a PR</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Push early and often on feature branches — it backs work up and lets
          CI test it. Push with <strong>-u origin &lt;branch&gt;</strong> once,
          then plain <strong>git push</strong>. GitHub answers with a ready-made{" "}
          <strong>pull-request URL</strong> — the handoff to the review flow
          covered in the next lesson.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git switch feature/metrics
git add app.py
git commit -m "feat: add /metrics endpoint for Prometheus"
git push -u origin feature/metrics`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[feature/metrics 1c2d3e4] feat: add /metrics endpoint for Prometheus
 1 file changed, 8 insertions(+)
Enumerating objects: 5, done.
To github.com:YOU/git-practice.git
 * [new branch]      feature/metrics -> feature/metrics
Branch 'feature/metrics' set up to track remote branch 'feature/metrics' from 'origin'.
remote: Create a pull request for 'feature/metrics' on GitHub by visiting:
remote:      https://github.com/YOU/git-practice/pull/new/feature/metrics`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git push
git status -sb`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Everything up-to-date
## feature/metrics...origin/feature/metrics`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Push to the branch, never main:</strong> feature branches
            get CI checks and review; direct pushes to main skip both and are
            blocked on serious repos.
          </li>
          <li>
            <strong>The PR URL:</strong> GitHub prints it on every first push
            — open it immediately while context is fresh instead of batching
            five commits later.
          </li>
          <li>
            <strong>Everything up-to-date:</strong> local and remote tips match.
            Any &quot;ahead 1&quot; in status means commits exist locally that
            CI and teammates cannot see yet.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Collaborating: pull before push and fixing rejected pushes</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          GitHub rejects your push when someone else pushed first — your branch
          tip is stale. The fix loop: <strong>fetch</strong> their commits,{" "}
          <strong>rebase</strong> yours on top, resolve any conflicts, then{" "}
          <strong>push</strong> again. Never force-push a shared branch to
          &quot;win&quot; — you would erase their work.
        </p>
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
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'github.com:YOU/git-practice.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. You may want to first integrate the remote changes
hint: (e.g., 'git pull ...') before pushing again.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git fetch origin
git rebase origin/main
git push origin main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`From github.com:YOU/git-practice
   b7c2e91..9a1c2d3  main       -> origin/main
Successfully rebased and updated refs/heads/main.
Enumerating objects: 3, done.
To github.com:YOU/git-practice.git
   9a1c2d3..d4e5f6a  main -> main`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git pull --rebase
git push`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Successfully rebased and updated refs/heads/main.
Everything up-to-date`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>&quot;fetch first&quot;:</strong> not an error to fear —
            it means the remote moved. Fetch + rebase + push is the standard
            recovery, spelled out in the hint itself.
          </li>
          <li>
            <strong>pull --rebase shortcut:</strong> same three steps in one
            command. Configure it as default with git config --global
            pull.rebase true to avoid merge bubbles on shared branches.
          </li>
          <li>
            <strong>Daily habit:</strong> pull (or fetch + rebase) before you
            start work and before you push — stale branches cause most
            &quot;surprise&quot; conflicts.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses: clone in CI and pull on deploy targets</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every CI job starts with a <strong>clone</strong> (usually shallow
          and single-branch for speed), checks out the PR SHA, and runs tests.{" "}
          On long-lived servers like EC2, a controlled <strong>git pull</strong>{" "}
          (or fetch + reset to a tag) is the simplest deploy — though
          containers and artifacts replace it at scale because pull deploys are
          hard to roll back atomically.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git clone --depth 1 --branch main https://github.com/YOU/git-practice.git ci-checkout
git -C ci-checkout rev-parse HEAD`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Cloning into 'ci-checkout'...
remote: Enumerating objects: 3, done.
Receiving objects: 100% (3/3), done.
d4e5f6a2b1c8e9f0a3d5c7b9e1f2a4c6d8b0e12f`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`ssh ec2-user@prod-01 "cd /srv/app && git fetch origin && git reset --hard v1.4.2 && systemctl restart app"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`From github.com:YOU/git-practice
 * tag               v1.4.2     -> FETCH_HEAD
HEAD is now at d4e5f6a Release v1.4.2
app restarted (active)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>CI clone flags:</strong> --depth 1 (no history) + --branch
            main (one branch) = seconds instead of minutes on huge repos.
            Actions/checkout does this by default.
          </li>
          <li>
            <strong>Tag deploys:</strong> reset --hard v1.4.2 pins the exact
            artifact QA approved — plain pull on main can drag in untested
            commits mid-deploy.
          </li>
          <li>
            <strong>Why artifacts win later:</strong> Docker images and S3
            bundles version the build output, not just source — pull-deploys
            still need npm install / pip install on the server, which can fail
            at 3am.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Pushing to the wrong remote: origin vs upstream mix-ups publish
            private experiments to the public repo (or company code to a
            personal fork). Run git remote -v before first push in any fresh
            clone.
          </li>
          <li>
            Pulling with a dirty tree: uncommitted edits + incoming merge =
            conflict soup. Commit or git stash first, then pull — a clean tree
            makes every sync reversible.
          </li>
          <li>
            Blind git pull without fetching first: merges unknown commits
            sight-unseen. Fetch, read git log main..origin/main, then merge or
            rebase deliberately.
          </li>
          <li>
            Force-pushing shared main to &quot;fix&quot; a rejection: rewrites
            teammates&apos; history and orphans their work. Fetch + rebase +
            push instead; reserve --force-with-lease for your own PR branch.
          </li>
          <li>
            Cloning with HTTPS then fighting password prompts: GitHub removed
            password auth — use a personal access token, credential helper, or
            switch the URL to SSH.
          </li>
          <li>
            Never setting upstream (-u): every push needs the full origin +
            branch spelling and status shows no ahead/behind. Push once with
            -u and plain git push works forever.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Run git remote -v in your practice repo and explain each line: nickname, URL, and fetch vs push.</li>
          <li>Add an upstream remote pointing at a second repo, list remotes again, then remove it with git remote remove upstream.</li>
          <li>Clone your own repo twice — once over HTTPS, once over SSH — and compare git branch -a in each fresh copy.</li>
          <li>Make a commit on GitHub&apos;s web UI, then run git fetch and read it with git log main..origin/main without merging.</li>
          <li>Merge that fetched commit with git merge origin/main, then repeat the exercise using git pull --rebase on the next web commit.</li>
          <li>Create a feature/sync-test branch, push it with -u, and confirm tracking with git branch -vv and git status -sb.</li>
          <li>Simulate a rejected push: commit on GitHub web + commit locally, push to see the rejection, then fix with fetch + rebase + push.</li>
          <li>Do a shallow CI-style clone with --depth 1 --branch main and time how much faster it is than a full clone.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
