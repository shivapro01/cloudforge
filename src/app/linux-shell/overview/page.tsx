import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="Start Here"
      intro="This module teaches you the Linux and shell skills every DevOps and AWS engineer uses daily. Work through the lessons in order, type every command yourself, and finish the hands-on tasks before moving on."
      prev={{ href: "/linux-shell", label: "Linux & Shell" }}
      next={{ href: "/linux-shell/setup-terminal", label: "Setup: Distros, Terminal, WSL" }}
      resources={[
        {
          title: "Linux Journey",
          url: "https://linuxjourney.com/",
          description:
            "Free interactive beginner course covering the command line, files, users, and permissions. Do it alongside this module.",
        },
        {
          title: "Ubuntu Tutorials",
          url: "https://ubuntu.com/tutorials/",
          description:
            "Free official Ubuntu tutorials including a command-line-for-beginners track. Good companion for WSL and VM practice.",
        },
        {
          title: "freeCodeCamp",
          url: "https://www.freecodecamp.org/",
          description:
            "Free Linux and Bash articles and video courses. Search for the Linux command-line beginner track.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Why Linux for DevOps and AWS?</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Almost every server you will touch in DevOps runs Linux. When you
          launch an EC2 instance, deploy a Docker container, debug a CI/CD
          pipeline, or SSH into a production box, you land in a Linux shell.
          There is no graphical desktop — only the terminal. If you cannot
          navigate the filesystem, inspect logs, manage files, set
          permissions, and install packages from the command line, you cannot
          do DevOps work.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            AWS runs on Linux: Amazon Linux and Ubuntu are the default images
            for EC2, ECS, EKS worker nodes, and Lambda execution environments.
          </li>
          <li>
            Containers are Linux: every Docker image is a small Linux
            filesystem, and kubectl exec drops you into a Linux shell.
          </li>
          <li>
            Automation is shell: CI/CD pipelines, cron jobs, user-data
            scripts, and Ansible playbooks all execute shell commands.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Concrete example — a typical on-call task on an EC2 web server looks
          like this:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`ssh -i ~/keys/web.pem ubuntu@54.210.44.10
cd /var/log/nginx
tail -n 50 error.log
sudo systemctl restart nginx
sudo systemctl status nginx`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every command above is taught in this module: SSH and remote tools,
          navigation, viewing logs, and managing services.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">What you will learn</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The module has 9 topics. Do them in order — each one builds on the
          previous:
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Setup: Distros, Terminal, WSL</strong> — install Ubuntu
            (WSL2/VM), learn terminal vs shell vs Bash, run your first
            commands.
          </li>
          <li>
            <strong>Filesystem &amp; Navigation</strong> — the Linux directory
            tree, absolute vs relative paths, pwd, ls, cd, du, df.
          </li>
          <li>
            <strong>File Operations</strong> — create, copy, move, delete,
            link, and archive files with touch, cp, mv, rm, tar.
          </li>
          <li>
            <strong>Viewing, Editing &amp; Searching</strong> — read files with
            cat, less, head, tail; edit with nano/vim; search with grep and
            find.
          </li>
          <li>
            <strong>Permissions &amp; Users</strong> — chmod, chown, sudo,
            users and groups; why permission-denied happens on AWS.
          </li>
          <li>
            <strong>Packages &amp; Services</strong> — apt/dnf, systemctl,
            journalctl; installing nginx and running it as a service.
          </li>
          <li>
            <strong>SSH &amp; Remote Tools</strong> — SSH keys, scp file
            transfer, and connecting to EC2 instances securely.
          </li>
          <li>
            <strong>Cron &amp; Logs</strong> — schedule jobs with cron,
            rotate and read logs, the on-call debugging workflow.
          </li>
          <li>
            <strong>Shell Scripting Basics</strong> — variables, loops,
            conditionals, and writing your first deploy/backup script.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How to practice (pick one)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You need a real Linux shell to type into — reading alone is not
          enough. Pick one option now (full setup instructions are in the next
          lesson):
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>WSL2 on Windows (recommended for Windows users):</strong>{" "}
            installs Ubuntu inside Windows in about 10 minutes, free.
          </li>
          <li>
            <strong>VM with VirtualBox/UTM (Mac/Windows/Linux):</strong>{" "}
            run full Ubuntu in a virtual machine, closest to a real server.
          </li>
          <li>
            <strong>EC2 later (not yet):</strong> from the SSH lesson onward
            you will practice on a real AWS EC2 instance. Do not start with
            EC2 — learn the basics locally first so you do not pay for idle
            servers.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Rule: every lesson ends with hands-on tasks. Do them in your shell
          before clicking Next. If a command fails, read the error message —
          debugging errors is itself a DevOps skill.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How each lesson is structured</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Concepts first:</strong> short beginner explanation with
            no assumed knowledge.
          </li>
          <li>
            <strong>Command + sample output:</strong> every command shows
            exactly what you should see, so you can compare with your screen.
          </li>
          <li>
            <strong>DevOps/AWS use cases:</strong> at least two per lesson
            showing where the skill is used on real infrastructure.
          </li>
          <li>
            <strong>Common mistakes:</strong> the errors beginners hit most,
            so you recognise them fast.
          </li>
          <li>
            <strong>Hands-on practice:</strong> tasks to complete in your own
            terminal before continuing.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Time estimate: 2–3 weeks</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          At 1 hour per day, plan on 2–3 weeks for this module. A realistic
          pace:
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Days 1–2: Setup + Filesystem &amp; Navigation</li>
          <li>Days 3–5: File Operations + Viewing, Editing &amp; Searching</li>
          <li>Days 6–8: Permissions &amp; Users + Packages &amp; Services</li>
          <li>Days 9–12: SSH &amp; Remote Tools + Cron &amp; Logs</li>
          <li>Days 13–15: Shell Scripting + full review of all checklists</li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Do not rush. Linux fluency compounds — the 30 minutes you spend
          today learning ls flags saves hours later when debugging a broken
          deployment at 2am.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Done checklist</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You are finished with this module when you can truthfully check
          every box:
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>You have Ubuntu running locally (WSL2 or VM) and open it daily</li>
          <li>You can navigate anywhere with pwd, ls, and cd without thinking</li>
          <li>You can create, copy, move, delete, and archive files and directories</li>
          <li>You can view logs with tail/cat/less and search them with grep</li>
          <li>You can fix permission-denied with ls -l, chmod, chown, and sudo</li>
          <li>You can install a package and start, stop, and check a service</li>
          <li>You can SSH into a remote server with a key and copy files with scp</li>
          <li>You can schedule a cron job and find why it failed in the logs</li>
          <li>You can write a 20-line Bash script with variables, a loop, and an if-statement</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
