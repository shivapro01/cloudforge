import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="Permissions & Users"
      intro="Every 'Permission denied' and every hacked server traces back to this lesson. Learn to read rwx, set ownership, use sudo safely, and lock down SSH keys — the access-control basics behind all of AWS security."
      prev={{ href: "/linux-shell/viewing-editing-search", label: "Viewing, Editing & Searching" }}
      next={{ href: "/linux-shell/packages-services", label: "Packages & Services" }}
      resources={[
        {
          title: "Linux Journey — Permissions",
          url: "https://linuxjourney.com/",
          description:
            "Free interactive lessons on users, groups, and file permissions with quizzes to test yourself.",
        },
        {
          title: "Linux Man Pages",
          url: "https://man7.org/linux/man-pages/",
          description:
            "Look up man chmod, man chown, and man sudo online for exact flag behaviour and security notes.",
        },
        {
          title: "GNU Coreutils Manual",
          url: "https://www.gnu.org/software/coreutils/manual/",
          description:
            "Official reference for chmod, chown, and umask — definitive documentation with examples.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">The rwx model: user, group, other</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every Linux file has an <strong>owner user</strong>, an{" "}
          <strong>owner group</strong>, and three permission triples: what the{" "}
          <strong>user</strong> (owner) can do, what the <strong>group</strong>{" "}
          can do, and what everyone else (<strong>other</strong>) can do. Each
          triple is <strong>r</strong> (read), <strong>w</strong> (write),{" "}
          <strong>x</strong> (execute) — a dash means denied.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`ls -l ~/deploy.sh /tmp
-rw-r--r-- 1 shiva shiva  42 Sep  5 10:40 /home/shiva/deploy.sh
drwxr-xr-x 2 shiva shiva 4096 Sep  5 10:40 /tmp`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>r (read, 4):</strong> view file contents, or list a
            directory's names.
          </li>
          <li>
            <strong>w (write, 2):</strong> modify a file, or create/delete files
            inside a directory.
          </li>
          <li>
            <strong>x (execute, 1):</strong> run a file as a program, or enter /
            traverse a directory (cd into it).
          </li>
          <li>
            <strong>Directories need x too:</strong> r on a directory lets you
            list names, but without x you cannot cd into it or open anything
            inside. That is why directories are usually 755, not 644.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Reading ls -l, character by character</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Take this real line and decode it left to right:{" "}
          <strong>-rw-r--r-- 1 shiva shiva 42 Sep 5 10:40 deploy.sh</strong>.
          Once you can read this, you can diagnose any permission error in
          seconds.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — annotated breakdown"
            code={`-  rw-  r--  r--   1  shiva  shiva   42  Sep  5 10:40  deploy.sh
^  ^    ^    ^    ^  ^      ^      ^   ^^^^^^^^^^^  ^^^^^^^^^
|  |    |    |    |  |      |      |   date/time    name
|  |    |    |    |  |      |      size in bytes
|  |    |    |    |  |      group owner
|  |    |    |    |  user owner
|  |    |    |    hard-link count
|  |    |    other's permissions (r--)
|  |    group's permissions (r--)
|  user's permissions (rw-)
file type: - file, d directory, l symlink`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Position 1 (file type):</strong> - is a regular file, d a
            directory, l a symlink. So lrwxrwxrwx is a link, drwxr-xr-x a
            directory.
          </li>
          <li>
            <strong>Positions 2-4 (user):</strong> what the owner can do. rw-
            means read + write, no execute.
          </li>
          <li>
            <strong>Positions 5-7 (group) and 8-10 (other):</strong> r-- means
            read-only for group members and everyone else.
          </li>
          <li>
            <strong>Owners:</strong> shiva shiva = owned by user shiva, group
            shiva. Web files are often www-data www-data — if your user differs
            from the file owner, only the group/other triples apply to you.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">chmod numeric: 4-2-1 and the famous triples</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>chmod</strong> changes permissions. In numeric mode each
          permission is a number — r=4, w=2, x=1 — and you add them per triple.
          So r+w (4+2) = 6, r+x (4+1) = 5, r+w+x (4+2+1) = 7. Three digits =
          user, group, other.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`chmod 755 ~/deploy.sh
chmod 644 ~/app.conf
chmod 600 ~/.ssh/id_rsa
ls -l ~/deploy.sh ~/app.conf ~/.ssh/id_rsa`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-rwxr-xr-x 1 shiva shiva 42 Sep  5 10:42 /home/shiva/deploy.sh
-rw-r--r-- 1 shiva shiva 118 Sep  5 10:42 /home/shiva/app.conf
-rw------- 1 shiva shiva 2602 Sep  5 10:42 /home/shiva/.ssh/id_rsa`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>755 (rwxr-xr-x):</strong> owner can do everything, everyone
            else can read + execute. Standard for scripts and directories.
          </li>
          <li>
            <strong>644 (rw-r--r--):</strong> owner can read/write, everyone
            else read-only. Standard for config files and web content.
          </li>
          <li>
            <strong>600 (rw-------):</strong> owner read/write only, nobody
            else anything. Standard for private keys and secrets.
          </li>
          <li>
            <strong>Decoding trick:</strong> 7 = 4+2+1 (rwx), 6 = 4+2 (rw-), 5
            = 4+1 (r-x), 4 = 4 (r--), 0 = ---. So 755 reads as rwxr-xr-x.
          </li>
          <li>
            <strong>DevOps use case — fix a 500 error:</strong> app deployed as
            root leaves files root-owned; nginx running as www-data then gets
            403/500. chmod 644 the files (and check ownership, next section) and
            the site recovers.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 text-zinc-800 dark:border-red-900 dark:bg-red-950 dark:text-zinc-200">
          <p className="font-semibold text-red-700 dark:text-red-300">
            DANGER: never chmod 777 to &quot;fix&quot; a permission error
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              777 (rwxrwxrwx) lets EVERY user on the system read, modify, and
              execute the file. Any compromised process can rewrite it.
            </li>
            <li>
              It never fixes ownership problems — it just hides them while
              opening a security hole. Bots scan for world-writable files.
            </li>
            <li>
              Correct fix: set the right owner with chown (next section) and
              use 644 for files / 755 for directories. If a tutorial says 777,
              it is a bad tutorial.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">chmod symbolic and changing ownership (chown, chgrp)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Symbolic mode</strong> adjusts one piece without touching the
          rest: who (u/g/o/a) + operation (+ add, - remove, = set exact) +
          permission (r/w/x). <strong>chown</strong> changes the owner user,{" "}
          <strong>chgrp</strong> the owner group — and chown user:group does
          both at once. Ownership changes usually need sudo.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`chmod u+x ~/deploy.sh
chmod g-w ~/app.conf
chmod o-rwx ~/.ssh/id_rsa
sudo chown www-data:www-data /var/www/html/index.html
sudo chgrp developers ~/deploy.sh
ls -l ~/deploy.sh /var/www/html/index.html`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-rwxr-xr-- 1 shiva developers 42 Sep  5 10:45 /home/shiva/deploy.sh
-rw-r--r-- 1 www-data www-data 118 Sep  5 10:45 /var/www/html/index.html`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>u+x:</strong> add execute for the user only — the standard
            &quot;make this script runnable&quot; without touching group/other.
          </li>
          <li>
            <strong>g-w:</strong> remove write from group. a-x would remove
            execute from all three.
          </li>
          <li>
            <strong>chown user:group file:</strong> sets both owners in one
            command. Use -R for a whole tree: sudo chown -R www-data:www-data
            /var/www/html.
          </li>
          <li>
            <strong>Fix order matters:</strong> set ownership FIRST (chown),
            then permissions (chmod). Fixing perms on files owned by the wrong
            user is polishing the wrong thing.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">sudo, su, and why you do not live as root</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>root</strong> can do anything — including destroying the
          system with one typo, no warnings asked. <strong>sudo</strong> runs a
          single command with root power (logging it and asking for YOUR
          password), then drops back to normal. <strong>su</strong> switches
          user entirely (su - becomes root until you exit). Professional rule:
          work as a normal user, prefix with sudo only when needed.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`whoami
sudo systemctl restart nginx
sudo -i
whoami
exit
whoami`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`shiva
[sudo] password for shiva:
root
shiva`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>sudo command:</strong> run one command as root. Your
            password (not root's) authorises it, and the action is logged to
            /var/log/auth.log for auditing.
          </li>
          <li>
            <strong>sudo -i:</strong> open a root shell for a batch of admin
            work. Always exit when done — a forgotten root shell plus a stray
            rm -rf is how outages happen.
          </li>
          <li>
            <strong>Why not root always:</strong> as root there are no guard
            rails — rm -rf /tmp/* with a stray space, or a &gt; redirect to the
            wrong file, runs without a single prompt. EC2 and Ubuntu disable
            root login for exactly this reason.
          </li>
          <li>
            <strong>AWS link:</strong> EC2's default ubuntu/ec2-user accounts
            have passwordless sudo scoped by cloud-init — convenient, but every
            sudo command is still logged, so treat it as borrowed power.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">SSH key permissions and umask</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          SSH refuses to work with sloppy key permissions — this protects you,
          because a key readable by others is a compromised key. Private keys
          must be <strong>600</strong> (owner only) and the .ssh directory{" "}
          <strong>700</strong> (owner only, enterable).{" "}
          <strong>umask</strong> controls the default permissions new files get,
          so secrets are born private.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — the classic EC2 .pem error and fix"
            code={`chmod 644 ~/my-key.pem
ssh -i ~/my-key.pem ubuntu@ec2-3-91-45-12.compute-1.amazonaws.com`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/home/shiva/my-key.pem' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "/home/shiva/my-key.pem": bad permissions
ubuntu@ec2-3-91-45-12.compute-1.amazonaws.com: Permission denied (publickey).`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — fix it"
            code={`chmod 400 ~/my-key.pem
chmod 700 ~/.ssh
ls -l ~/my-key.pem
ssh -i ~/my-key.pem ubuntu@ec2-3-91-45-12.compute-1.amazonaws.com`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`-r-------- 1 shiva shiva 1679 Sep  5 10:50 /home/shiva/my-key.pem
Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0 x86_64)
Last login: Fri Sep  5 10:50:12 2026 from 49.37.12.9
ubuntu@ip-172-31-4-10:~$`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>400 vs 600:</strong> AWS docs say 400 (read-only) for .pem
            files; 600 (read-write) also works. Both are &quot;owner
            only&quot; — anything group/other-readable fails.
          </li>
          <li>
            <strong>~/.ssh must be 700</strong> and authorized_keys 600, or the
            server ignores your key and falls back to password (then denies
            you).
          </li>
          <li>
            <strong>umask 022 vs 077:</strong> umask subtracts from defaults
            (666 files, 777 dirs). 022 gives 644 files / 755 dirs (normal); 077
            gives 600 / 700 (private). Set umask 077 before generating keys or
            secrets.
          </li>
          <li>
            <strong>DevOps use case — both classic incidents:</strong> &quot;key
            too open&quot; on every first EC2 connect, and a 500/403 after a
            deploy copied files as the wrong user. Both are fixed in under a
            minute once you can read ls -l.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            chmod 777 as a &quot;fix&quot; — world-writable files are a breach
            waiting to happen. Use chown to the right user plus 644/755.
          </li>
          <li>
            Forgetting directories need x: chmod 644 -R on a website breaks
            every page (403 everywhere) because directories lost traverse. Use
            755 for dirs, 644 for files — or find: find . -type d -exec chmod
            755 {"{}"} \;.
          </li>
          <li>
            Running everything as root so all new files are root-owned, then
            the app user cannot read them. Deploy and run as the app user;
            sudo only for the privileged steps.
          </li>
          <li>
            chmod/chown typos with -R in the wrong directory (sudo chown -R
            user / instead of ./) — always pwd and ls the target first, and
            never combine -R with / or ~.
          </li>
          <li>
            Leaving a .pem at 644 and retrying SSH for an hour: read the
            &quot;too open&quot; warning — chmod 400 the key and chmod 700
            ~/.ssh.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create ~/lab/perms/hello.sh, decode its full ls -l line character by character (type, triples, owners, size).</li>
          <li>Apply chmod 755, 644, and 600 in turn and predict the ls -l string before each ls.</li>
          <li>Starting from 644, use symbolic mode to reach 755 (u+x, go+rx style), then remove group write from a file with g-w.</li>
          <li>Create a directory, set it to 644, and observe that you cannot cd into it — then fix with 755 and explain why.</li>
          <li>Use sudo to create a root-owned file in /tmp, try editing it as yourself, then sudo chown it to yourself.</li>
          <li>Reproduce the SSH error safely: copy any file to fake.pem, chmod 644 it, run ssh-keygen -y -f fake.pem to see the complaint, then chmod 400 it.</li>
          <li>Set ~/.ssh to 700 (create it if needed) and check umask; try umask 077, create a file, and confirm it is born 600.</li>
          <li>Role-play the 500-error drill: sudo chown a lab web file to root, confirm you cannot read it, then fix with chown + chmod 644.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
