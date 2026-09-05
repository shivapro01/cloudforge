import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="Setup: Distros, Terminal, WSL"
      intro="Install a real Linux environment on your computer, understand the difference between a terminal, a shell, and Bash, and run your first commands with confidence."
      prev={{ href: "/linux-shell/overview", label: "Start Here" }}
      next={{ href: "/linux-shell/filesystem-navigation", label: "Filesystem & Navigation" }}
      resources={[
        {
          title: "Install WSL (Microsoft Docs)",
          url: "https://learn.microsoft.com/en-us/windows/wsl/",
          description:
            "Official guide to installing WSL2 and Ubuntu on Windows, including setup and troubleshooting.",
        },
        {
          title: "Ubuntu Tutorials",
          url: "https://ubuntu.com/tutorials/",
          description:
            "Official Ubuntu tracks including command line for beginners and installing Ubuntu in a VM.",
        },
        {
          title: "Linux Journey — Getting Started",
          url: "https://linuxjourney.com/",
          description:
            "Free interactive lessons on the command line, exactly matching the first commands taught here.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">What is a Linux distro?</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Linux is just the kernel (the core that talks to hardware). A{" "}
          <strong>distro</strong> (distribution) is the kernel plus tools,
          package manager, and defaults, bundled so you can actually use it.
          Think: kernel = engine, distro = whole car.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Ubuntu (use this as a beginner):</strong> the most popular
            desktop/server distro, huge community, most tutorials assume it,
            default on WSL. Package manager: apt.
          </li>
          <li>
            <strong>Amazon Linux (you will meet this on AWS):</strong> Amazon's
            own distro, default AMI on EC2. Package manager: dnf (older
            versions: yum). Commands are 95% the same as Ubuntu; mainly the
            install commands differ.
          </li>
          <li>
            <strong>Debian, Fedora, Alpine:</strong> you will encounter these
            as Docker base images later. Same core commands, different package
            managers (apk on Alpine).
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Practical difference you will feel immediately:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — Ubuntu"
            code={`sudo apt update && sudo apt install -y nginx`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — Amazon Linux"
            code={`sudo dnf install -y nginx`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Terminal vs shell vs Bash</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Beginners mix these up. The distinction matters because DevOps docs
          use all three words:
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Terminal:</strong> the window/app you type into (Windows
            Terminal, GNOME Terminal, VS Code terminal). It only displays
            text — it does not understand commands.
          </li>
          <li>
            <strong>Shell:</strong> the program that reads what you type,
            runs it, and prints results. Examples: Bash, Zsh, Fish, sh.
          </li>
          <li>
            <strong>Bash (Bourne Again SHell):</strong> the default shell on
            Ubuntu and Amazon Linux, and what this whole module teaches. When
            someone says open a shell, they mean open a terminal running Bash.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Check which shell you are running:
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`echo $SHELL\necho $0`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/bin/bash
bash`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>$SHELL</strong> is an environment variable holding your login
          shell path. <strong>echo</strong> prints text; prefixing with{" "}
          <strong>$</strong> prints a variable's value instead. If you see
          /bin/bash, you are in the right place.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Setup option A: WSL2 on Windows</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          WSL2 (Windows Subsystem for Linux) runs real Ubuntu inside Windows.
          Recommended for all Windows users — faster and lighter than a VM.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Step 1 — install WSL and Ubuntu (in PowerShell run as
          Administrator):
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`wsl --install`} />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          This enables WSL2 and installs Ubuntu by default. Reboot when asked,
          then open Ubuntu from the Start menu and create your username and
          password.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Step 2 — verify and update (inside the Ubuntu window):
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`wsl --list --verbose
sudo apt update && sudo apt upgrade -y`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`  NAME      STATE           VERSION
* Ubuntu    Running         2

Get:1 http://archive.ubuntu.com/ubuntu jammy InRelease [270 kB]
Fetched 30.1 MB in 12s (2512 kB/s)
All packages are up to date.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>wsl --list --verbose:</strong> VERSION 2 means you are on
            WSL2 (full Linux kernel). If it says 1, run wsl --set-version
            Ubuntu 2.
          </li>
          <li>
            <strong>sudo:</strong> run the next command as administrator
            (root). You will type your Ubuntu password.
          </li>
          <li>
            <strong>apt update:</strong> refresh the list of available
            packages. <strong>apt upgrade:</strong> actually install newer
            versions. Always run update before installing anything.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Setup option B: VM or native Linux / Mac</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Mac (UTM/VirtualBox) or any OS:</strong> download Ubuntu
            24.04 LTS ISO from ubuntu.com, create a new VM with 2 CPUs, 4 GB
            RAM, 25 GB disk, and install. Takes ~20 minutes.
          </li>
          <li>
            <strong>Linux already (Ubuntu/Fedora):</strong> you are done —
            open the Terminal app and skip to first commands.
          </li>
          <li>
            <strong>Mac terminal without a VM:</strong> macOS is Unix-like so
            pwd, ls, cd work, but apt, systemctl, and many Linux paths do
            not exist. For this module, still install an Ubuntu VM or you
            will hit confusing differences.
          </li>
          <li>
            <strong>EC2:</strong> wait until the SSH lesson. Learning locally
            first is free; EC2 costs money if you forget to stop it.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Your first commands</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Type each of these yourself. The <strong>man</strong> command opens
          the built-in manual — it is how professionals look up flags without
          Googling.
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`whoami`} />
        </div>
        <div className="mt-3">
          <CodeBlock label="Output" code={`shiva`} />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>whoami</strong> prints your current username. On EC2 this
          returns ubuntu or ec2-user depending on the AMI — useful to confirm
          which account you logged in as.
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`pwd`} />
        </div>
        <div className="mt-3">
          <CodeBlock label="Output" code={`/home/shiva`} />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>pwd</strong> (print working directory) shows which folder
          you are standing in. You will use it constantly when lost on a
          remote server.
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`echo "Hello, DevOps"`} />
        </div>
        <div className="mt-3">
          <CodeBlock label="Output" code={`Hello, DevOps`} />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>echo</strong> prints text. Quotes keep multi-word text
          together. Later you will use echo to write strings into files and
          debug scripts.
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`man ls`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`LS(1)                     User Commands                    LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

Press q to quit, / to search inside the manual.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Use arrow keys to scroll, press q to quit.</li>
          <li>Type / then a word (e.g. /-l) and Enter to search.</li>
          <li>Every core command has a man page — man cp, man grep, man ssh.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Prompt and PATH basics</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The <strong>prompt</strong> is the text before your cursor, e.g.
          shiva@laptop:~$. It shows user@host:folder. <strong>$</strong> means
          normal user; <strong>#</strong> means root — be extra careful as
          root, there are no safety rails.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>PATH</strong> is the list of folders Linux searches when you
          type a command. That is why ls works from anywhere:
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`echo $PATH\nwhich ls`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
/usr/bin/ls`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>which ls:</strong> shows the full path of the ls program.
            Use which to confirm which version of a tool runs (common DevOps
            issue: wrong python or terraform binary).
          </li>
          <li>
            <strong>DevOps use case:</strong> CI pipelines fail with command
            not found when a tool was installed outside PATH. which and echo
            $PATH are the first debug steps.
          </li>
          <li>
            <strong>DevOps use case:</strong> on EC2 user-data scripts, always
            use full paths (/usr/bin/aws) because PATH in boot scripts is
            minimal and differs from your login shell.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Running apt install without sudo — you will get permission
            denied. System changes always need sudo.
          </li>
          <li>
            Forgetting apt update first — installs fail or pull ancient
            versions because the package list is stale.
          </li>
          <li>
            Using Command Prompt instead of the Ubuntu/WSL window — wsl
            --install runs in PowerShell, but all Linux commands run inside
            Ubuntu.
          </li>
          <li>
            Closing the terminal during apt upgrade — can corrupt packages.
            Let it finish; if interrupted, run sudo dpkg --configure -a.
          </li>
          <li>
            Typing the password and seeing nothing — normal. Linux hides
            password input; type and press Enter.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Open your Ubuntu shell and run whoami, pwd, echo $SHELL.</li>
          <li>Run sudo apt update && sudo apt upgrade -y successfully.</li>
          <li>Open man ls, search for -h with /-h, then quit with q.</li>
          <li>Run echo $PATH and which bash; note the paths.</li>
          <li>Change your prompt awareness: run whoami and hostname, then explain each part of your prompt.</li>
          <li>Install tree with sudo apt install -y tree, then run which tree.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
