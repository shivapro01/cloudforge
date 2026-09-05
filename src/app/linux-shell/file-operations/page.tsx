import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="File Operations"
      intro="Create, copy, move, delete, link, and archive files and directories from the command line — the core skills for deploying artifacts, managing configs, and backing up servers."
      prev={{ href: "/linux-shell/filesystem-navigation", label: "Filesystem & Navigation" }}
      next={{ href: "/linux-shell/viewing-editing-search", label: "Viewing, Editing & Searching" }}
      resources={[
        {
          title: "Linux Journey — Manipulating Files",
          url: "https://linuxjourney.com/",
          description:
            "Free interactive lessons on touch, mkdir, cp, mv, rm, and wildcards with practice exercises.",
        },
        {
          title: "GNU Coreutils Manual",
          url: "https://www.gnu.org/software/coreutils/manual/",
          description:
            "Official reference for cp, mv, rm, ln, and tar — definitive flag documentation with examples.",
        },
        {
          title: "Linux Man Pages",
          url: "https://man7.org/linux/man-pages/",
          description:
            "Look up man tar, man cp, and man rm online when you need exact flag behaviour.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Creating files and directories</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>touch</strong> creates an empty file (or updates a file's
          timestamp if it exists). <strong>mkdir</strong> creates directories;
          <strong>-p</strong> creates missing parents and does not error if
          the directory already exists — always use it in scripts.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`mkdir -p ~/deploy/app/config
touch ~/deploy/app/config/app.env
ls -R ~/deploy`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`app.env

/home/shiva/deploy:
app

/home/shiva/deploy/app:
config

/home/shiva/deploy/app/config:
app.env`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>mkdir -p a/b/c:</strong> creates a, a/b, and a/b/c in one
            go. Without -p it fails if a/ does not exist.
          </li>
          <li>
            <strong>ls -R:</strong> recursive list — shows a directory and
            everything under it. Handy to verify a structure you just built.
          </li>
          <li>
            <strong>touch existing file:</strong> does not erase content, only
            bumps the modified time. Safe to run; it never deletes data.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Copying: cp and cp -r</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>cp source destination</strong> copies files. Directories
          need <strong>-r</strong> (recursive). Use <strong>-v</strong>{" "}
          (verbose) to see what was copied — useful in deploy logs.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cp ~/deploy/app/config/app.env ~/deploy/app.env.bak
cp -rv ~/deploy/app ~/deploy/app-copy
ls ~/deploy`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`'/home/shiva/deploy/app' -> '/home/shiva/deploy/app-copy'
'/home/shiva/deploy/app/config/app.env' -> '/home/shiva/deploy/app-copy/config/app.env'
app  app-copy  app.env.bak`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>cp without -r on a directory</strong> fails with cp:
            -r not specified; omitting directory. That error always means add
            -r.
          </li>
          <li>
            <strong>Trailing slash matters little to cp</strong> but matters
            to rsync (taught in the SSH lesson). Keep the habit: no trailing
            slash = copy the folder itself.
          </li>
          <li>
            <strong>DevOps use case — deploy artifact copy:</strong> cp
            build/app.jar /opt/myapp/app.jar then restart the service. Every
            CodeDeploy-style deployment is copy + restart underneath.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Moving and renaming: mv</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>mv</strong> does two jobs: move a file to another directory,
          or rename it in place. Same command — only the destination differs.
          Moves on the same filesystem are instant (only the name changes).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`mv ~/deploy/app.env.bak ~/deploy/app/config/prod.env
mv ~/deploy/app-copy ~/deploy/app-v2
ls -R ~/deploy/app ~/deploy/app-v2`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/home/shiva/deploy/app/config:
app.env  prod.env

/home/shiva/deploy/app-v2:
config

/home/shiva/deploy/app-v2/config:
app.env`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>mv old new in the same folder = rename.</strong> mv across
            folders = move (plus rename if the last part differs).
          </li>
          <li>
            <strong>mv overwrites silently.</strong> Moving onto an existing
            name replaces it with no warning. Use mv -i for an interactive
            prompt before overwriting.
          </li>
          <li>
            <strong>DevOps use case — log rotation by hand:</strong> mv
            app.log app.log.1 then signal the app to reopen logs. Logrotate
            automates exactly this pattern.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Deleting safely: rm (-i, -r and the rm -rf warning)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>rm</strong> deletes files permanently — no trash, no undo.
          Directories need <strong>-r</strong>. Read the warning box below
          before ever typing rm -rf.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`rm -i ~/deploy/app/config/app.env
rm -r ~/deploy/app-v2
ls ~/deploy`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`rm: remove regular file '/home/shiva/deploy/app/config/app.env'? y
app  config`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-i:</strong> interactive — asks before each deletion.
            Beginners should alias rm to rm -i until confident.
          </li>
          <li>
            <strong>-r:</strong> recursive — deletes a directory and
            everything inside. rm alone refuses directories.
          </li>
          <li>
            <strong>-f:</strong> force — never prompt, ignore missing files.
            Combined as -rf it deletes entire trees without asking.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 text-zinc-800 dark:border-red-900 dark:bg-red-950 dark:text-zinc-200">
          <p className="font-semibold text-red-700 dark:text-red-300">
            DANGER: rm -rf deletes without recovery
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              Never run rm -rf / or rm -rf ~ — the first wipes the system,
              the second wipes your home.
            </li>
            <li>
              Never run rm -rf with a variable: rm -rf $DIR/ deletes
              everything if DIR is empty (becomes rm -rf /). Use rm -rf
              ./{"${DIR:?not set}"}/ or check [ -n "$DIR" ] first.
            </li>
            <li>
              On production: always pwd first, ls the target, then delete.
              Prefer mv to /tmp (a manual trash) for anything you are unsure
              about.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Symlinks and wildcards</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>symlink</strong> is a pointer file: /opt/myapp/current -&gt;
          /opt/myapp/v2.3. Deploy tools switch one link to roll out or roll
          back instantly. <strong>Wildcards</strong> let one command match many
          files: * (anything), ? (one char), [abc] (one of these).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`ln -s ~/deploy/app ~/deploy/current
ls -l ~/deploy
rm ~/deploy/current`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`lrwxrwxrwx 1 shiva shiva   23 Sep  5 10:30 current -> /home/shiva/deploy/app
drwxr-xr-x 3 shiva shiva 4096 Sep  5 10:30 app

removed symbolic link '/home/shiva/deploy/current'`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>ln -s target linkname:</strong> the l in lrwx marks a
            link. Deleting the link (rm current) removes only the pointer,
            never the target.
          </li>
          <li>
            <strong>DevOps use case — zero-downtime switch:</strong> deploy v2
            to /opt/myapp/v2, then ln -sfn v2 /opt/myapp/current and restart.
            Rollback = point the link back.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`ls ~/deploy/app/config/\ncp ~/deploy/app/config/*.env ~/deploy/\nls ~/deploy/*.env`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`prod.env  staging.env  app.conf
prod.env  staging.env`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>*.env</strong> matches every .env file. <strong>log.?</strong>{" "}
            matches log.1..log.9. <strong>app.[ch]</strong> matches app.c and
            app.h.
          </li>
          <li>
            Always test a wildcard with ls or echo first (echo *.env) before
            rm with it — echo shows exactly what would be deleted.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Archiving: tar and zip</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>tar</strong> bundles directories into one file;{" "}
          <strong>gzip</strong> compresses it. Together (tar.gz) they are the
          standard for backups and release artifacts. Memorise two commands:
          create (czf) and extract (xzf).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`tar -czf ~/deploy-backup-$(date +%F).tar.gz -C ~/deploy app
ls -lh ~/deploy-backup-*.tar.gz
mkdir -p /tmp/restore && tar -xzf ~/deploy-backup-$(date +%F).tar.gz -C /tmp/restore
ls -R /tmp/restore`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-rw-rw-r-- 1 shiva shiva 1.2K Sep  5 10:35 /home/shiva/deploy-backup-2026-09-05.tar.gz
app/
app/config/
app/config/prod.env
app/
app/config/
app/config/prod.env`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>c</strong>reate, <strong>x</strong>tract, <strong>z</strong>{" "}
            gzip, <strong>f</strong> file. So -czf = create gzip file, -xzf =
            extract gzip file.
          </li>
          <li>
            <strong>-C dir</strong> changes to dir first, so the archive holds
            relative paths (app/...) instead of absolute ones. Always archive
            relative paths.
          </li>
          <li>
            <strong>$(date +%F):</strong> inserts today's date (2026-09-05),
            giving dated backups you can sort and rotate.
          </li>
          <li>
            <strong>zip alternative:</strong> zip -r backup.zip app and unzip
            -l backup.zip to list. Zip is friendlier for sharing with Windows
            users; tar.gz is standard on Linux servers.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — backup before a deploy"
            code={`tar -czf /tmp/app-backup-$(date +%F_%H%M).tar.gz -C /opt/myapp current
cp build/app.jar /opt/myapp/v2/app.jar`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use case — backup then deploy:</strong> snapshot the
          running version with a timestamped tar.gz, then copy the new
          artifact in. If v2 fails, extract the backup and you are back in
          minutes.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            cp/mv with no destination: cp file copies nothing — you always
            need source AND destination.
          </li>
          <li>
            Forgetting -r for directories with cp/rm — the -r not specified
            error (cp) or is a directory refusal (rm).
          </li>
          <li>
            rm with a wildcard typo: rm *. log (stray space) deletes every
            file plus a file named log. Check with echo first.
          </li>
          <li>
            tar -xzf without -C: extracts into the current directory and
            litters it. Always create /tmp/restore and extract with -C.
          </li>
          <li>
            Deleting the symlink target instead of the link: rm -r on a
            symlinked dir can follow the link on some systems. Remove links
            with plain rm linkname, no trailing slash, no -r.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Build mkdir -p {"~/lab/site/{css,js,img}"} then verify with tree or ls -R.</li>
          <li>touch three files (index.html, style.css, app.js) in the right subfolders.</li>
          <li>Copy the whole site to ~/lab/site-backup with cp -r and compare with ls -R.</li>
          <li>Rename app.js to main.js with mv, then move it into js/ if it is not there.</li>
          <li>Create a symlink ~/lab/live pointing at ~/lab/site with ln -s, list it with ls -l, then remove only the link.</li>
          <li>Create extra .bak files, delete them with rm -i and a *.bak wildcard.</li>
          <li>Make a dated backup: tar -czf ~/site-$(date +%F).tar.gz -C ~/lab site, then extract it to /tmp/lab-restore with -C.</li>
          <li>Practice the safety drill: echo rm -rf ~/lab/* first to preview, and explain why rm -rf with an empty variable is dangerous.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
