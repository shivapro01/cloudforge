import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="Packages & Services"
      intro="A fresh EC2 instance is nearly empty — you install what you need (nginx, curl, unzip) with a package manager and keep it running with systemd. Master apt/dnf, systemctl, logs, and environment variables here."
      prev={{ href: "/linux-shell/permissions-users", label: "Permissions & Users" }}
      next={{ href: "/linux-shell/shell-scripting", label: "Shell Scripting" }}
      resources={[
        {
          title: "Ubuntu Tutorials",
          url: "https://ubuntu.com/tutorials/",
          description:
            "Free step-by-step Ubuntu tutorials including package management and running services.",
        },
        {
          title: "Bash Manual — Environment",
          url: "https://www.gnu.org/software/bash/manual/",
          description:
            "Official Bash reference for export, environment variables, PATH, and startup files like ~/.bashrc.",
        },
        {
          title: "Linux Man Pages",
          url: "https://man7.org/linux/man-pages/",
          description:
            "Look up man systemctl, man journalctl, and man apt online when flags or unit options confuse you.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Package managers: apt vs dnf/yum</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>package manager</strong> installs, updates, and removes
          software plus its dependencies from trusted repositories.
          Ubuntu/Debian use <strong>apt</strong>; Amazon Linux / RHEL / Fedora
          use <strong>dnf</strong> (modern) or <strong>yum</strong> (older,
          still common on Amazon Linux 2). Golden rule:{" "}
          <strong>update the index before installing</strong>, or you install
          stale versions — or nothing at all.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — Ubuntu/Debian (apt)"
            code={`sudo apt update
sudo apt install -y nginx
sudo apt search redis
sudo apt remove nginx`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Hit:1 http://ap-south-1.ec2.archive.ubuntu.com/ubuntu noble InRelease
Reading package lists... Done
...
The following NEW packages will be installed:
  nginx nginx-common nginx-core
Setting up nginx-core (1.24.0-2ubuntu7) ...
Processing triggers for man-db ...`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>apt update:</strong> refresh the package LIST (what versions
            exist). Installs nothing — but skipping it is the #1 cause of
            &quot;package not found&quot; on fresh EC2.
          </li>
          <li>
            <strong>apt install -y pkg:</strong> install; -y answers yes
            automatically (required in scripts — nothing can type yes for you).
          </li>
          <li>
            <strong>apt search / apt remove:</strong> find packages by keyword;
            remove uninstalls (add --purge to also delete its config files).
          </li>
          <li>
            <strong>dnf/yum equivalents:</strong> sudo dnf check-update →
            update, sudo dnf install -y nginx → install, dnf search redis →
            search, sudo dnf remove nginx → remove. On Amazon Linux 2 the same
            commands work with yum instead of dnf.
          </li>
          <li>
            <strong>Know your distro first:</strong> cat /etc/os-release tells
            you Ubuntu (use apt) vs Amazon Linux (use dnf/yum). Running apt on
            Amazon Linux just says command not found.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Walkthrough: installing nginx, curl, wget, unzip</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Fresh servers miss tools you take for granted: no curl for health
          checks, no unzip for artifacts, no web server at all. Here is the
          standard bootstrap — install nginx plus the downloader trio — with
          what success looks like.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — Ubuntu"
            code={`sudo apt update && sudo apt install -y nginx curl wget unzip
nginx -v
curl -I http://localhost/
which nginx curl unzip`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`nginx version: nginx/1.24.0 (Ubuntu)
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Content-Type: text/html
/usr/sbin/nginx
/usr/bin/curl
/usr/bin/unzip`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>nginx:</strong> the web server / reverse proxy you will
            meet in every DevOps project. nginx -v confirms the install;
            curl -I localhost proves it serves.
          </li>
          <li>
            <strong>curl vs wget:</strong> curl prints/downloads to stdout (curl
            -o file URL saves) and does APIs (-X POST, -H headers); wget
            downloads simply (wget URL). Install both — scripts assume one or
            the other.
          </li>
          <li>
            <strong>unzip:</strong> deployment artifacts often ship as .zip
            (CodeDeploy bundles, GitHub releases). No unzip = failed deploy
            step at 2 AM.
          </li>
          <li>
            <strong>Amazon Linux version:</strong> sudo dnf install -y nginx
            curl wget unzip — same packages, different manager. Output mirrors
            the above with an Amazon Linux build string.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Running services with systemd and systemctl</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Installing nginx puts files on disk but does not start anything.{" "}
          <strong>systemd</strong> is Linux's service manager: it starts
          services now, restarts them on crash, and launches them at boot. You
          drive it with <strong>systemctl</strong>, one service (unit) at a
          time. The critical distinction: <strong>start</strong> = run right
          now, <strong>enable</strong> = also start on every future boot.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
sudo systemctl reload nginx
sudo systemctl stop nginx`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service → /lib/systemd/system/nginx.service.
● nginx.service - A high performance web server and reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-09-05 10:55:00 UTC; 2min ago
       Docs: man:nginx(8)
   Main PID: 2314 (nginx)
      Tasks: 3 (limit: 1130)
     Memory: 7.2M
     CGroup: /system.slice/nginx.service
             ├─2314 "nginx: master process /usr/sbin/nginx"
             └─2315 "nginx: worker process"`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>start / stop / restart:</strong> control the service right
            now. restart = stop + start (drops connections briefly); reload =
            re-read config WITHOUT dropping connections (use after config
            edits).
          </li>
          <li>
            <strong>enable / disable:</strong> persist across reboots. The #1
            production outage after a reboot is a service that was started but
            never enabled — always enable what must survive.
          </li>
          <li>
            <strong>status:</strong> Loaded shows the unit file path and
            enabled/disabled; Active shows running (and since when) or failed
            with the reason.
          </li>
          <li>
            <strong>Service files concept:</strong> /lib/systemd/system/nginx.service
            is a small INI-style file describing what to run (ExecStart),
            which user, and restart policy (Restart=always). Your own app gets
            one too — e.g. /etc/systemd/system/myapp.service — then sudo
            systemctl daemon-reload, enable, and start it like any service.
          </li>
          <li>
            <strong>DevOps use case — EC2 user-data bootstrap:</strong> every
            new instance runs your launch script automatically. The classic
            bootstrap installs and enables nginx so the fleet serves traffic
            from second one:
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — EC2 user-data bootstrap script"
            code={`#!/bin/bash
apt update -y
apt install -y nginx
systemctl enable nginx
systemctl start nginx
echo "Healthy from $(hostname)" > /var/www/html/index.html`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Reading service logs with journalctl</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          When systemctl status says failed, the reason lives in the logs.{" "}
          <strong>journalctl</strong> queries systemd's central log (the
          journal): per-service output, crash traces, and restart history — no
          need to guess which file under /var/log holds it.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`sudo systemctl status nginx
journalctl -u nginx --no-pager -n 20
journalctl -u nginx -f
journalctl --since "1 hour ago" -p err --no-pager`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Sep 05 10:55:00 ip-172-31-4-10 systemd[1]: Starting nginx.service...
Sep 05 10:55:00 ip-172-31-4-10 nginx[2310]: nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
Sep 05 10:55:00 ip-172-31-4-10 systemd[1]: nginx.service: Control process exited, code=exited, status=1/FAILURE
Sep 05 10:55:00 ip-172-31-4-10 systemd[1]: nginx.service: Failed with result 'exit-code'.
Sep 05 10:55:00 ip-172-31-4-10 systemd[1]: Failed to start nginx.service.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-u nginx:</strong> filter to one service's logs. Without -u
            you get the whole system's firehose.
          </li>
          <li>
            <strong>-n 20 / --since:</strong> last 20 lines, or everything in
            the last hour — triage newest-first instead of drowning.
          </li>
          <li>
            <strong>-f:</strong> follow live, like tail -f but for the journal.
            Ctrl+C to stop.
          </li>
          <li>
            <strong>-p err:</strong> only errors and worse. The example above
            instantly reveals the classic failure: port 80 already in use
            (another web server running) — fix by stopping the squatter, not
            reinstalling nginx.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Environment variables and PATH</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          An <strong>environment variable</strong> is a named setting every
          program inherits (HOME, USER, AWS_REGION, DATABASE_URL).{" "}
          <strong>PATH</strong> is the most important one: the colon-separated
          list of directories the shell searches when you type a command.{" "}
          <strong>export</strong> creates variables; <strong>~/.bashrc</strong>{" "}
          makes them permanent; <strong>which</strong> shows where a command
          actually comes from.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`echo $HOME
echo $PATH
which python3
export AWS_REGION=ap-south-1
echo $AWS_REGION`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/home/shiva
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
/usr/bin/python3
ap-south-1`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>$NAME reads, export NAME=value sets:</strong> echo $PATH
            shows the value; export without $ assigns it. Forget export and the
            variable stays local to one line — child processes never see it.
          </li>
          <li>
            <strong>PATH demystified:</strong> typing nginx searches
            /usr/local/sbin, then /usr/local/bin, and so on until found.
            &quot;command not found&quot; means it is installed nowhere on PATH
            (or not installed at all).
          </li>
          <li>
            <strong>which:</strong> prints the exact binary your shell would
            run — use it when two versions exist (system python vs conda
            python) to see which wins.
          </li>
          <li>
            <strong>~/.bashrc for permanence:</strong> exports typed in a
            terminal die with it. Append them to ~/.bashrc (export
            AWS_REGION=ap-south-1), then source ~/.bashrc to reload — now every
            new shell has them. Secrets belong in a manager (AWS Secrets
            Manager / env files with 600 perms), never committed to git.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Installing without apt update on a fresh instance: &quot;Unable to
            locate package nginx&quot; almost always means a stale index — run
            sudo apt update first.
          </li>
          <li>
            Forgetting -y in scripts: apt install nginx hangs forever waiting
            for a &quot;yes&quot; nobody types. Interactive shells can omit -y;
            user-data and CI scripts must include it.
          </li>
          <li>
            Using apt on Amazon Linux (or yum on Ubuntu): check cat
            /etc/os-release first and use the matching manager.
          </li>
          <li>
            start without enable: works until the next reboot, then the service
            is mysteriously down. Production rule: enable everything that must
            survive a restart.
          </li>
          <li>
            Editing a .service file then forgetting daemon-reload: systemd
            keeps the old copy cached — run sudo systemctl daemon-reload before
            restarting.
          </li>
          <li>
            Exporting secrets in a shared shell history or committing .env to
            git: use chmod 600 env files, gitignore them, and prefer AWS
            Secrets Manager / Parameter Store in real projects.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Run cat /etc/os-release to identify your distro and state which package manager it uses.</li>
          <li>Run sudo apt update (or dnf check-update), then install curl, wget, and unzip with -y and verify each with which.</li>
          <li>Install nginx, run nginx -v, then curl -I http://localhost/ and explain each response header line.</li>
          <li>Start nginx, check status, then enable it and confirm status shows enabled.</li>
          <li>Break it on purpose: stop nginx, confirm curl fails, read the failure with journalctl -u nginx -n 20, then start it again.</li>
          <li>Follow a live log: run journalctl -u nginx -f in one terminal while reloading nginx in another.</li>
          <li>Set export DEPLOY_ENV=staging, prove a child process sees it (bash -c 'echo $DEPLOY_ENV'), then make it permanent via ~/.bashrc.</li>
          <li>Write a 5-line user-data-style bootstrap (update, install nginx + curl, enable + start, custom index.html) and review it line by line for -y and enable.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
