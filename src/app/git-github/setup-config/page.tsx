import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Git & GitHub"
      title="Setup & Config"
      intro="Git with no identity makes mystery commits, Git with no auth cannot push, and the wrong default branch breaks every tutorial you follow. In this lesson you install Git, stamp your name and email on every commit, set main as default, connect to GitHub over HTTPS or SSH, and create your first real repo end to end."
      prev={{ href: "/git-github/overview", label: "Start Here" }}
      next={{ href: "/git-github/add-commit-push", label: "Add, Commit & Push" }}
      resources={[
        {
          title: "Git Documentation",
          url: "https://git-scm.com/doc",
          description:
            "Official Git reference — install downloads plus git config, git init, and every command flag.",
        },
        {
          title: "GitHub Docs",
          url: "https://docs.github.com/en",
          description:
            "Official GitHub guides for account setup, personal access tokens, SSH keys, and first repos.",
        },
        {
          title: "freeCodeCamp Git tutorials",
          url: "https://www.freecodecamp.org/",
          description:
            "Free beginner Git setup walkthroughs with videos and articles you can follow step by step.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Install Git and verify it (apt, dnf)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Most Linux machines already have Git, but DevOps servers and fresh
          VMs often do not. Install from your distro package manager, then
          verify with <strong>git --version</strong>. You want version 2.30+
          so <strong>init.defaultBranch</strong> and modern config work.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`sudo apt update && sudo apt install -y git
git --version
# Fedora / RHEL / Amazon Linux:
sudo dnf install -y git
git --version`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`git version 2.43.0`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>apt (Ubuntu/Debian):</strong> sudo apt update refreshes the
            package list first, then installs. The -y flag answers yes
            automatically — what you want in scripts and cloud-init.
          </li>
          <li>
            <strong>dnf (Fedora/RHEL/Amazon Linux):</strong> same idea,
            different manager. On Amazon Linux 2023 Git is often preinstalled —
            still run git --version to confirm.
          </li>
          <li>
            <strong>Verify, don&apos;t assume:</strong> if git --version prints
            &quot;command not found&quot;, the install failed or your PATH is
            broken. Reinstall before continuing.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tell Git who you are: user.name and user.email</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every commit is stamped with an author name and email. GitHub uses
          the email to link commits to your avatar and profile — wrong email
          means your work shows up as a grey ghost. Set it once with{" "}
          <strong>--global</strong> (applies to all repos for your Linux user),
          and override per-project with <strong>--local</strong> when you use a
          work email in one repo.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git config --global user.name "Shiva Kumar"
git config --global user.email "shiva@example.com"
git config --global --list
# per-repo override inside one project:
git config --local user.email "shiva@company.com"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`user.name=Shiva Kumar
user.email=shiva@example.com
init.defaultbranch=main
core.editor=vim`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>--global vs --local:</strong> --global writes to
            ~/.gitconfig (all repos); --local writes to .git/config (this repo
            only, wins over global). Run git config --list --show-origin to see
            which file each value came from.
          </li>
          <li>
            <strong>Use your GitHub email:</strong> the exact email on your
            GitHub account, or your commits will not link to you. Check with
            git config user.email before your first commit.
          </li>
          <li>
            <strong>Quotes matter:</strong> &quot;Shiva Kumar&quot; needs quotes
            because of the space. The email does not strictly need them but
            quoting is harmless and consistent.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Default branch main, editor, and line endings</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          New repos used to start on <strong>master</strong>; the industry
          standard is now <strong>main</strong>. Set it once globally so every{" "}
          <strong>git init</strong> matches GitHub and your pipelines. While
          here, set your editor and line-ending behavior so commits and merges
          do not fight you later.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git config --global init.defaultBranch main
git config --global core.editor "vim"
git config --global core.autocrlf input
git config --global --list`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`user.name=Shiva Kumar
user.email=shiva@example.com
init.defaultbranch=main
core.editor=vim
core.autocrlf=input`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>init.defaultBranch main:</strong> every future git init
            creates main, not master. GitHub creates main by default — matching
            avoids the &quot;why do I have two branches&quot; confusion on
            first push.
          </li>
          <li>
            <strong>core.editor:</strong> which editor opens for commit
            messages and rebases. Use vim, nano, or &quot;code --wait&quot; for
            VS Code. Beginners: nano is the easiest to exit (Ctrl+X).
          </li>
          <li>
            <strong>core.autocrlf input (Linux):</strong> converts Windows CRLF
            to LF on commit, keeps LF on checkout. Use &quot;true&quot; on
            Windows, &quot;input&quot; on Linux/Mac — prevents whole-file diffs
            caused by invisible line-ending changes.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Auth to GitHub: HTTPS vs SSH</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Pushing needs proof you are you. <strong>HTTPS + Personal Access
          Token (PAT)</strong> is easiest to start: the remote URL starts with
          https:// and Git asks for your token as the password.{" "}
          <strong>SSH keys</strong> are the DevOps standard for daily work and
          servers: no password prompts after setup, and the remote URL starts
          with git@github.com:. Learn both, then live on SSH.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`HTTPS + PAT                          SSH keys
https://github.com/you/app.git       git@github.com:you/app.git
        |                                       |
  username = github login              no password prompt
  password = PASTE TOKEN (not login    after one-time key setup
  password!)                           private key stays on laptop
        |                                       public key on GitHub
  GitHub -> Settings ->                ssh-keygen, copy .pub,
  Developer settings -> PAT            paste into GitHub SSH keys
        |                                       |
  good for: first push,                good for: daily DevOps,
  shared lab machines                  personal laptop, CI servers`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# create a PAT: GitHub -> Settings -> Developer settings -> Personal access tokens -> Generate
git remote -v
# HTTPS remote looks like:
# origin  https://github.com/YOU/git-practice.git (fetch)`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`origin  https://github.com/YOU/git-practice.git (fetch)
origin  https://github.com/YOU/git-practice.git (push)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>PAT is the password:</strong> since 2021 GitHub rejects
            account passwords over HTTPS. Generate a classic token with repo
            scope, paste it when Git asks for password, and store it in a
            password manager — it shows only once.
          </li>
          <li>
            <strong>SSH URL vs HTTPS URL:</strong> git@github.com:YOU/repo.git
            means SSH; https://github.com/YOU/repo.git means HTTPS. Switching
            later is one git remote set-url command.
          </li>
          <li>
            <strong>DevOps pick:</strong> laptops and EC2 deploy keys use SSH;
            automation and scripts often use a PAT or GitHub App token stored
            as a CI secret — never hardcoded in code.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Create an SSH key and test it</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          An SSH keypair is two files: the <strong>private key</strong> stays
          on your machine and never leaves; the <strong>public key (.pub)</strong>{" "}
          you upload to GitHub. Generate with <strong>ssh-keygen</strong>,
          print the public key, add it under GitHub → Settings → SSH keys,
          then prove it works with <strong>ssh -T git@github.com</strong>.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`ssh-keygen -t ed25519 -C "shiva@example.com"
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/shiva/.ssh/id_ed25519):
Enter passphrase (empty for no passphrase):
Your identification has been saved in /home/shiva/.ssh/id_ed25519
Your public key has been saved in /home/shiva/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ7x... shiva@example.com
Hi octocat! You've successfully authenticated, but GitHub does not provide shell access.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>ed25519:</strong> modern, short, secure key type. Older
            guides use -t rsa -b 4096 — still fine, but prefer ed25519 for new
            keys.
          </li>
          <li>
            <strong>-C email:</strong> just a label so you recognize the key on
            GitHub later. It does not affect auth — the key material does.
          </li>
          <li>
            <strong>Passphrase:</strong> a password on the private key. Use one
            on laptops; press Enter empty only on throwaway lab VMs. Servers
            and CI use passphrase-less deploy keys limited to one repo.
          </li>
          <li>
            <strong>Permission denied?</strong> key not added to GitHub yet,
            wrong ssh agent, or testing with sudo. Never share or paste your
            private key — only the .pub file goes to GitHub.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">First repo end to end: init, add, commit, branch -M main</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Time to wire it all together. <strong>git init</strong> creates the
          .git history folder, you create a file, <strong>git add</strong>{" "}
          stages it, <strong>git commit</strong> snapshots it, and{" "}
          <strong>git branch -M main</strong> guarantees the branch is called
          main even on old Git versions. This exact sequence is the skeleton
          of every project you will ever start.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`mkdir -p ~/git-practice && cd ~/git-practice
git init
echo "# git-practice" > README.md
echo "print('hello devops')" > app.py
git add README.md app.py
git commit -m "Initial commit: readme and hello app"
git branch -M main
git log --oneline`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Initialized empty Git repository in /home/shiva/git-practice/.git/
[main (root-commit) 9f8e7d6] Initial commit: readme and hello app
 2 files changed, 2 insertions(+)
 create mode 100644 README.md
 create mode 100644 app.py
9f8e7d6 Initial commit: readme and hello app`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>git init:</strong> creates .git/ — the database. Never edit
            inside .git by hand; run git commands from the project root.
          </li>
          <li>
            <strong>git add files:</strong> moves them to staging. git add . is
            a shortcut for &quot;everything changed&quot; — fine here, risky
            once secrets exist (next lesson).
          </li>
          <li>
            <strong>git branch -M main:</strong> renames the current branch to
            main, forcing (-M) if needed. Harmless if already main — run it
            every time for consistency.
          </li>
          <li>
            <strong>DevOps use:</strong> pipelines run git clone then checkout
            the commit SHA. A clean initial commit with README + .gitignore is
            what every template repo starts from.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Reading git status and git config --list</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>git status</strong> is your dashboard — run it before and
          after every Git command until it is reflex.{" "}
          <strong>git config --list --show-origin</strong> is the same idea for
          settings: it shows every value plus which file set it, so global vs
          local confusion disappears.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`git status
echo "v2" >> app.py
git status
git config --list --show-origin`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`On branch main
nothing to commit, working tree clean
# --- after editing app.py ---
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be included)
        modified:   app.py
no changes added to commit (use "git add" to commit)
file:/home/shiva/.gitconfig        user.name=Shiva Kumar
file:/home/shiva/.gitconfig        user.email=shiva@example.com
file:/home/shiva/.gitconfig        init.defaultbranch=main
file:.git/config                   core.repositoryformatversion=0`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>nothing to commit, working tree clean:</strong> history
            matches your files. Safe to switch branches or pull.
          </li>
          <li>
            <strong>Changes not staged:</strong> you edited but have not git
            added yet. Red in most terminals — commit will ignore these until
            staged.
          </li>
          <li>
            <strong>--show-origin:</strong> reveals file:/home/.../.gitconfig
            (global) vs file:.git/config (local). When a value looks wrong,
            this tells you exactly which file to fix.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Wrong email = grey avatar and lost contributions: commits exist but
            GitHub cannot link them to you. Fix future commits with git config
            user.email, fix history only if you must (covered in undo
            lesson).
          </li>
          <li>
            Pasting your Personal Access Token into code or chat: a token is a
            password. If leaked, revoke it immediately under GitHub Settings →
            Developer settings → Tokens, then generate a new one.
          </li>
          <li>
            git init inside the wrong folder (like ~): now your whole home is
            a repo. Fix with rm -rf &lt;wrong-folder&gt;/.git — deletes history
            only, keeps your files — then init in the right place.
          </li>
          <li>
            Two identities fighting: global personal email plus forgotten local
            work email (or reverse). Run git config --list --show-origin and
            git log --format=&quot;%an %ae&quot; -3 to see who really authored
            recent commits.
          </li>
          <li>
            Skipping branch -M main then pushing master to a main remote:
            creates a second branch and a confusing PR. Standardize on main
            everywhere from day one.
          </li>
          <li>
            sudo git / ssh as root: keys and config live per-user. Running as
            root uses /root/.ssh and /root/.gitconfig, not yours — auth
            mysteriously fails. Run Git as your normal user.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Install Git with apt or dnf, run git --version, and confirm 2.30+.</li>
          <li>Set global user.name and user.email to your GitHub identity, then show them with git config --global --list.</li>
          <li>Set init.defaultBranch to main and core.editor to your choice, then verify with git config --list.</li>
          <li>Generate an ed25519 SSH key, print the .pub file, add it to GitHub, and pass ssh -T git@github.com.</li>
          <li>Generate a classic PAT (repo scope), keep it in a password manager, and explain why it must never go in code.</li>
          <li>Build ~/git-practice from scratch: init, two files, add, commit, branch -M main, log --oneline.</li>
          <li>Set a --local email different from global in git-practice and prove the override with --show-origin.</li>
          <li>Break and fix: edit a file, read both git status outputs, then commit and return to a clean tree.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
