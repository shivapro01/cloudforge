import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="Filesystem & Navigation"
      intro="Learn how the Linux filesystem is organised, the difference between absolute and relative paths, and the navigation commands (pwd, ls, cd, tree, du, df) you will use on every server and container."
      prev={{ href: "/linux-shell/setup-terminal", label: "Setup: Distros, Terminal, WSL" }}
      next={{ href: "/linux-shell/file-operations", label: "File Operations" }}
      resources={[
        {
          title: "Linux Journey — Files and Directories",
          url: "https://linuxjourney.com/",
          description:
            "Free interactive lessons on the filesystem hierarchy, ls, cd, and paths with in-browser practice.",
        },
        {
          title: "GNU Coreutils Manual",
          url: "https://www.gnu.org/software/coreutils/manual/",
          description:
            "Official reference for ls, cd, du, df, and every file utility — use it to look up flags in depth.",
        },
        {
          title: "Linux Man Pages",
          url: "https://man7.org/linux/man-pages/",
          description:
            "Searchable online man pages. Look up man ls, man du, and man df when you forget a flag.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Linux filesystem hierarchy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Linux has one single tree starting at <strong>/</strong> (root).
          Unlike Windows (C:, D:), everything — disks, USB sticks, config,
          logs — lives somewhere under /. Learn these five directories first;
          they cover 90% of DevOps work:
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>/</strong> — the root of everything. All paths start here.
          </li>
          <li>
            <strong>/home/shiva</strong> — your personal files. On EC2 this is
            /home/ubuntu or /home/ec2-user. Your code and keys live here.
          </li>
          <li>
            <strong>/etc</strong> — system configuration. nginx config lives
            at /etc/nginx/nginx.conf; SSH config at /etc/ssh/sshd_config.
          </li>
          <li>
            <strong>/var/log</strong> — log files. App and system logs
            (nginx, syslog, auth.log) land here. First place to look when
            something breaks.
          </li>
          <li>
            <strong>/tmp</strong> — temporary files, wiped on reboot. Safe for
            downloads and scratch work, never for anything important.
          </li>
          <li>
            <strong>/usr/bin, /bin</strong> — installed programs (ls, python3,
            aws cli). This is where PATH points.
          </li>
          <li>
            <strong>/opt</strong> — optional third-party software (some agents
            and tools install here).
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`ls /`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Absolute vs relative paths</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          An <strong>absolute path</strong> starts with / and works from
          anywhere: /etc/nginx/nginx.conf. A <strong>relative path</strong>{" "}
          starts from where you are now: if you are in /etc, then
          nginx/nginx.conf means the same file.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>.</strong> means current directory. <strong>..</strong>{" "}
            means parent directory. <strong>~</strong> means your home
            (/home/shiva).
          </li>
          <li>
            Scripts, cron jobs, and CI pipelines should use absolute paths —
            their working directory is unpredictable.
          </li>
          <li>
            Interactive typing can use relative paths — they are shorter.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`pwd
cat /etc/hostname
cat relative/path/from/here.txt`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/home/shiva
my-laptop
cat: relative/path/from/here.txt: No such file or directory`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The error above is the most common beginner error: a relative path
          only works from the right directory. When in doubt, use pwd and
          switch to the absolute path.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">pwd, ls and its flags</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>ls</strong> lists directory contents. Three flags carry 90%
          of daily use: -l (long details), -a (show hidden dotfiles), -h
          (human-readable sizes, used with -l).
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`pwd\nls`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/home/shiva
app  deploy.sh  notes.txt`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`ls -la`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`total 28
drwxr-xr-x  4 shiva shiva 4096 Sep  5 10:20 .
drwxr-xr-x  3 root  root  4096 Sep  5 09:00 ..
-rw-rw-r--  1 shiva shiva  220 Sep  5 09:00 .bashrc
-rw-rw-r--  1 shiva shiva  120 Sep  5 09:00 .profile
drwxr-xr-x  2 shiva shiva 4096 Sep  5 10:20 app
-rwxr-xr-x  1 shiva shiva  340 Sep  5 10:15 deploy.sh
-rw-rw-r--  1 shiva shiva   58 Sep  5 10:18 notes.txt`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-l:</strong> long format — permissions, owner, size, date.
            You need this to debug permission-denied errors.
          </li>
          <li>
            <strong>-a:</strong> all, including hidden files starting with a
            dot (.bashrc, .ssh/). Config and keys are hidden by convention.
          </li>
          <li>
            First column (drwxr-xr-x): d means directory, - means file. The
            rwx triplets are read/write/execute for owner, group, others.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`ls -lh /var/log`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`total 2.1M
-rw-r--r-- 1 root     root      12K Sep  5 10:00 syslog
-rw-r----- 1 syslog   adm       88K Sep  5 10:00 auth.log
-rw-r--r-- 1 www-data www-data 1.9M Sep  5 09:55 nginx-access.log`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>-h</strong> turns raw byte counts into 12K / 1.9M so you can
          spot a log file eating the disk at a glance.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">cd: moving around</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>cd</strong> (change directory) moves you. Master its four
          shortcuts and you will navigate 3x faster:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cd /var/log/nginx
pwd
cd ..
pwd
cd ~
pwd
cd -`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/var/log/nginx
/var/log/nginx
/var/log
/home/shiva
/var/log`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>cd ..</strong> — up one level (from nginx/ to log/).
          </li>
          <li>
            <strong>cd ~</strong> or bare <strong>cd</strong> — jump home from
            anywhere.
          </li>
          <li>
            <strong>cd -</strong> — back to the previous directory. Output
            shows where you landed. Perfect for toggling between app code and
            logs.
          </li>
          <li>
            <strong>Tab completion:</strong> type cd /var/l then Tab to
            autocomplete. Use it always — it avoids typos in long paths.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">tree, du, df: seeing size and space</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          On servers you constantly ask: what is in this project? What is
          eating disk? Is the disk full? These three answer that.
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`sudo apt install -y tree\ntree -L 2 ~/app`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Installed tree.
/home/shiva/app
├── Dockerfile
├── docker-compose.yml
├── src
│   └── index.js
└── package.json

2 directories, 3 files`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>tree -L 2</strong> draws the structure 2 levels deep. -L
          limits depth so huge node_modules trees do not flood your screen.
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`du -sh ~/app\ndu -sh ~/app/*`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`48K	/home/shiva/app
4.0K	/home/shiva/app/Dockerfile
4.0K	/home/shiva/app/docker-compose.yml
8.0K	/home/shiva/app/package.json
32K	/home/shiva/app/src`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>du -sh</strong> (disk usage, summary, human-readable) shows
          folder size. Run it to find which directory is filling a small EC2
          volume.
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`df -h`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Filesystem      Size  Used Avail Use% Mounted on
/dev/root        29G  7.2G   22G  25% /
tmpfs           479M     0  479M   0% /dev/shm
/dev/sda15      105M  6.1M   99M   6% /boot/efi`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>df -h</strong> (disk free) shows whole filesystems. If Use%
          hits 100%, apps crash with mysterious write errors — this command
          is the first check in any disk-full incident.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps use cases</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Debugging nginx on EC2:</strong> config at /etc/nginx/,
            logs at /var/log/nginx/. A typical session: cd /etc/nginx, ls -l
            sites-enabled, then cd /var/log/nginx and ls -lh to find the
            biggest error log.
          </li>
          <li>
            <strong>Disk-full 3am page:</strong> df -h shows / at 100%, then
            du -sh /var/log/* finds a 12 GB runaway log, then you rotate or
            truncate it. Navigation plus size commands resolve the most common
            EC2 outage.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — on-call nginx check"
            code={`cd /etc/nginx
ls -l sites-enabled
cd /var/log/nginx
ls -lh
df -h /`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Spaces in names:</strong> cd My Folder fails — the shell
            sees two arguments. Quote it (cd "My Folder") or escape (cd
            My\ Folder). Prefer dashes in names: my-folder.
          </li>
          <li>
            <strong>Case sensitivity:</strong> App, app, and APP are three
            different names on Linux. cd app fails if the folder is App.
          </li>
          <li>
            <strong>Forgetting where you are:</strong> relative paths break
            silently. Run pwd before cat, cp, or rm with a relative path.
          </li>
          <li>
            <strong>ls shows nothing:</strong> the directory is empty, not
            broken. Try ls -la to confirm (hidden files may exist).
          </li>
          <li>
            <strong>Permission denied on /root or other users' homes:</strong>{" "}
            normal — those need sudo. Do not chmod system dirs to work
            around it.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Run pwd, ls /, and ls -la ~ and explain each part of the output.</li>
          <li>Navigate to /etc, list it with ls -l, then return home with cd ~.</li>
          <li>Go to /var/log with an absolute path, then go up one level with cd .. and confirm with pwd.</li>
          <li>Use cd - to toggle between /tmp and your home twice.</li>
          <li>Create ~/practice/nested/deep, cd into it with a relative path, then back home with an absolute path.</li>
          <li>Run tree -L 2 on your home directory (install tree first if missing).</li>
          <li>Run du -sh ~/* and find your three biggest home subdirectories.</li>
          <li>Run df -h and note the Use% of / — write down what you would do first if it said 100%.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
