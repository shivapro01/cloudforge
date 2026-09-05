import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="Shell Scripting Basics"
      intro="Typing the same five commands every deploy is slow and error-prone. A shell script saves those commands in a file so Linux runs them for you — same order, every time. Here you learn shebangs, variables, if-tests, loops, functions, exit codes, and finish with a real backup script and a health-check script you can run on any server."
      prev={{ href: "/linux-shell/packages-services", label: "Packages & Services" }}
      next={{ href: "/linux-shell/cron-logs", label: "Cron, Logs & Troubleshooting" }}
      resources={[
        {
          title: "Bash Manual",
          url: "https://www.gnu.org/software/bash/manual/",
          description:
            "Official Bash reference — look up variables, test expressions, loops, and functions when you need exact syntax.",
        },
        {
          title: "Linux Journey — Shell Scripting",
          url: "https://linuxjourney.com/",
          description:
            "Free interactive lessons that drill the same shell and scripting basics in your browser.",
        },
        {
          title: "freeCodeCamp Linux & Bash tutorials",
          url: "https://www.freecodecamp.org/",
          description:
            "Free beginner-friendly Bash scripting videos and articles with plenty of runnable examples.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Your first script: shebang, chmod +x, and running it</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>shell script</strong> is just a text file full of commands
          you already know. Three things make it runnable: the{" "}
          <strong>shebang line</strong> (#!/bin/bash on line 1, which tells
          Linux &quot;run this file with bash&quot;), <strong>execute permission</strong>{" "}
          (chmod +x), and a way to launch it (<strong>./script.sh</strong> runs
          the file in front of you; <strong>bash script.sh</strong> asks bash to
          read it). Beginners mix these up: without the shebang Linux guesses
          the interpreter; without +x you get &quot;Permission denied&quot; even
          though the file exists.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="hello.sh"
            code={`#!/bin/bash
echo "Hello from my first script!"
echo "Today is:"
date
echo "Logged in as: $USER"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`chmod +x hello.sh
./hello.sh
bash hello.sh
ls -l hello.sh`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Hello from my first script!
Today is:
Fri Sep  5 11:00:00 UTC 2026
Logged in as: shiva
-rwxr-xr-x 1 shiva shiva 112 Sep  5 11:00 hello.sh`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>#!/bin/bash (shebang):</strong> must be the very first line,
            no blank lines above it. It picks the interpreter — #!/bin/bash for
            bash features, #!/bin/sh for plain POSIX portability.
          </li>
          <li>
            <strong>chmod +x hello.sh:</strong> adds execute permission. Check
            with ls -l — you want to see x in -rwxr-xr-x. No x means
            &quot;Permission denied&quot; with ./ even if the script is perfect.
          </li>
          <li>
            <strong>./hello.sh vs bash hello.sh:</strong> ./ runs the file
            itself (needs shebang + x); bash hello.sh passes the file to bash
            explicitly (works even without +x or shebang — handy while
            drafting). In cron and production, prefer ./ with a correct shebang
            so there is no ambiguity.
          </li>
          <li>
            <strong>$USER:</strong> an environment variable holding your login
            name. echo prints it — a tiny preview of variables, covered fully
            next.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Variables, quotes, and user input ($1, read)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>variable</strong> stores text for reuse: NAME=value to set,{" "}
          $NAME to read. <strong>Double quotes</strong> allow expansion
          (&quot;Hello $NAME&quot;); <strong>single quotes</strong> prevent it
          ('Hello $NAME' prints literally). Scripts also take{" "}
          <strong>arguments</strong> ($1 is the first word after the script
          name, $2 the second, $@ means all of them) and can ask questions
          interactively with <strong>read</strong>.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="variables.sh"
            code={`#!/bin/bash
APP="myapp"
VERSION="1.2.0"
echo "Deploying $APP version $VERSION"
echo "Single quotes keep it literal: '\$APP is $APP'"
echo "Script name: $0"
echo "First argument: $1"
echo "Second argument: $2"
echo "All arguments: $@"
echo "How many arguments: $#"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`chmod +x variables.sh
./variables.sh payments v2
APP="myapp"
echo "double: $APP"
echo 'single: $APP'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Deploying myapp version 1.2.0
Single quotes keep it literal: '$APP is myapp'
Script name: ./variables.sh
First argument: payments
Second argument: v2
All arguments: payments v2
How many arguments: 2
double: myapp
single: $APP`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="greet.sh — read input"
            code={`#!/bin/bash
echo -n "Enter environment (staging/prod): "
read ENV_NAME
echo "Deploying to: $ENV_NAME"
echo -n "Type YES to continue: "
read -r CONFIRM
echo "You typed: $CONFIRM"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Enter environment (staging/prod): staging
Deploying to: staging
Type YES to continue: YES
You typed: YES`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>No spaces around =:</strong> APP=&quot;myapp&quot; works;
            APP = &quot;myapp&quot; fails (shell reads APP as a command). This
            is the #1 beginner syntax error.
          </li>
          <li>
            <strong>Always quote $var as &quot;$var&quot;:</strong> unquoted
            $APP breaks when the value contains spaces or is empty. Use double
            quotes everywhere unless you have a reason not to.
          </li>
          <li>
            <strong>$0, $1, $2, $@, $#:</strong> script name, positional
            arguments, all arguments, and argument count. ./deploy.sh staging
            v2 makes $1=staging and $2=v2.
          </li>
          <li>
            <strong>read:</strong> pauses and stores what the user types. read
            -r reads raw input safely (backslashes kept); echo -n prints the
            prompt without a newline.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Making decisions: if/then with file and string tests</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>if</strong> runs a block only when a test is true. Tests live
          inside <strong>[ ... ]</strong> with spaces around the brackets. File
          tests check existence (-f regular file, -d directory, -e anything, -z
          empty string, -n non-empty); string tests compare text (= vs !=);
          integer tests compare numbers (-eq equal, -ne not equal, -gt greater,
          -lt less). Every branch ends with <strong>fi</strong> (if backwards).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="check.sh"
            code={`#!/bin/bash
FILE="$1"

if [ -z "$FILE" ]; then
  echo "Usage: $0 <filename>"
  exit 1
fi

if [ -f "$FILE" ]; then
  echo "$FILE is a regular file."
elif [ -d "$FILE" ]; then
  echo "$FILE is a directory."
else
  echo "$FILE does not exist."
fi

if [ -n "$FILE" ]; then
  echo "You passed a non-empty name. Good."
fi`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`chmod +x check.sh
./check.sh /etc/nginx/nginx.conf
./check.sh /etc/nginx
./check.sh
./check.sh /tmp/nope.txt`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`check.sh: not found
/etc/nginx/nginx.conf is a regular file.
You passed a non-empty name. Good.
/etc/nginx is a directory.
You passed a non-empty name. Good.
Usage: ./check.sh <filename>
/tmp/nope.txt does not exist.
You passed a non-empty name. Good.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="compare.sh — strings and numbers"
            code={`#!/bin/bash
ENV_NAME="$1"
COUNT="$2"

if [ "$ENV_NAME" = "prod" ]; then
  echo "CAREFUL: production deploy!"
elif [ "$ENV_NAME" = "staging" ]; then
  echo "Staging deploy. Safe to proceed."
else
  echo "Unknown env: $ENV_NAME (expected prod or staging)"
fi

if [ "$COUNT" -gt 3 ]; then
  echo "Rolling restart of $COUNT servers."
elif [ "$COUNT" -eq 0 ]; then
  echo "Nothing to restart."
else
  echo "Restarting a few servers: $COUNT"
fi`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`./compare.sh prod 5
CAREFUL: production deploy!
Rolling restart of 5 servers.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-f / -d / -e:</strong> is it a file, a directory, does it
            exist at all. Guard every script that reads a path — failing on a
            typo beats deleting the wrong thing.
          </li>
          <li>
            <strong>-z / -n:</strong> is the string empty / non-empty. [ -z
            &quot;$FILE&quot; ] catches &quot;user passed nothing&quot; before
            anything else runs.
          </li>
          <li>
            <strong>Strings use = and !=; numbers use -eq -ne -gt -lt:</strong>{" "}
            mixing them up is a classic bug — [ &quot;5&quot; = &quot;5&quot; ]
            compares text, [ &quot;5&quot; -eq 5 ] compares numbers.
          </li>
          <li>
            <strong>Spaces are syntax:</strong> [ -f &quot;$FILE&quot; ] needs a
            space after [ and before ]. [$FILE] is a &quot;command not
            found&quot; error, not a test.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Doing it N times: for and while loops over files</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>for loop</strong> repeats once per item (perfect for
          &quot;every .log file&quot; or &quot;every server&quot;). A{" "}
          <strong>while loop</strong> repeats until a condition flips
          (perfect for retries and reading files line by line). The glob{" "}
          <strong>*.log</strong> expands to every matching filename — the core
          of batch log cleanup, batch compression, and fleet-wide restarts.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="loops.sh"
            code={`#!/bin/bash
echo "--- for loop over files ---"
for f in /var/log/*.log; do
  echo "Found log: $f"
done

echo "--- for loop over servers ---"
for server in web1 web2 web3; do
  echo "Checking $server..."
done

echo "--- C-style counter ---"
for i in 1 2 3 4 5; do
  echo "Attempt $i"
done

echo "--- while retry loop ---"
TRIES=0
while [ "$TRIES" -lt 3 ]; do
  TRIES=$((TRIES + 1))
  echo "Try number $TRIES"
done`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`--- for loop over files ---
Found log: /var/log/auth.log
Found log: /var/log/syslog
Found log: /var/log/nginx.log
--- for loop over servers ---
Checking web1...
Checking web2...
Checking web3...
--- C-style counter ---
Attempt 1
Attempt 2
Attempt 3
Attempt 4
Attempt 5
--- while retry loop ---
Try number 1
Try number 2
Try number 3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="compress-old-logs.sh — a genuinely useful loop"
            code={`#!/bin/bash
LOGDIR="/var/log/myapp"
for f in "$LOGDIR"/*.log; do
  if [ -f "$f" ]; then
    echo "Compressing $f..."
    gzip "$f"
  fi
done
echo "Done."`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>for f in dir/*.log:</strong> the standard
            &quot;process every file&quot; pattern. Always guard with [ -f
            &quot;$f&quot; ] in case nothing matched.
          </li>
          <li>
            <strong>$((...)):</strong> arithmetic — TRIES=$((TRIES + 1)) adds
            one. Without it, TRIES+1 is just text, not math.
          </li>
          <li>
            <strong>while [ cond ]:</strong> runs while true — make sure the
            counter changes inside, or it loops forever (Ctrl+C to escape).
          </li>
          <li>
            <strong>Quote &quot;$f&quot;:</strong> filenames with spaces
            (app server.log) split into two &quot;files&quot; when unquoted.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Functions and exit codes ($? and set -e)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>function</strong> names a reusable block so your script
          reads like steps, not spaghetti. An <strong>exit code</strong> is the
          number every command returns: <strong>0 = success</strong>, anything
          else = failure. <strong>$?</strong> holds the last command's code;{" "}
          <strong>exit N</strong> ends your script with code N;{" "}
          <strong>set -e</strong> makes the script abort on the first failure
          instead of blundering on with broken state.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="functions.sh"
            code={`#!/bin/bash
set -e

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

check_disk() {
  df -h / | tail -1
}

log "Starting checks..."
check_disk
echo "Last command exit code: $?"
log "All done."`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`chmod +x functions.sh
./functions.sh
echo "Script exited with: $?"
ls /does-not-exist
echo "ls exited with: $?"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[2026-09-05 11:00:00] Starting checks...
/dev/root        29G   12G   18G  40% /
Last command exit code: 0
[2026-09-05 11:00:01] All done.
Script exited with: 0
ls: cannot access '/does-not-exist': No such file or directory
ls exited with: 2`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>log() helper:</strong> one timestamped echo used everywhere
            keeps output greppable. Define functions at the top, call them
            below.
          </li>
          <li>
            <strong>$? read immediately:</strong> any command (even echo)
            overwrites it — capture it on the very next line or it is gone.
          </li>
          <li>
            <strong>set -e:</strong> fail fast. Without it a failed backup
            still prints &quot;All done&quot; and cron reports success —
            dangerous. Add set -e (often set -euo pipefail) to every DevOps
            script.
          </li>
          <li>
            <strong>exit 1 on usage errors:</strong> lets callers (and cron)
            detect failure. exit 0 (or falling off the end) means success.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Project: a complete backup script (tar.gz, keep 7 days, log line)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Time to assemble everything: a script that tars a directory with
          today&apos;s date in the filename, deletes archives older than 7
          days, and appends one line to a log. This is the exact shape of
          production backup jobs — only the source path and destination (local
          disk here, S3 later) change. Read it top to bottom: config variables,
          safety checks, the tar step, the cleanup step, the log line.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="backup.sh"
            code={`#!/bin/bash
set -e

SRC="/var/www/myapp"
DEST="/backups"
LOGFILE="/var/log/backup.log"
DAYS_TO_KEEP=7
DATE=$(date +%F)

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOGFILE"
}

if [ ! -d "$SRC" ]; then
  echo "ERROR: source $SRC not found."
  exit 1
fi

mkdir -p "$DEST"

ARCHIVE="$DEST/myapp-$DATE.tar.gz"
log "Backing up $SRC -> $ARCHIVE"
tar -czf "$ARCHIVE" -C / var/www/myapp
log "Backup created: $ARCHIVE"

log "Deleting archives older than $DAYS_TO_KEEP days..."
find "$DEST" -name "myapp-*.tar.gz" -mtime +7 -delete
log "Cleanup done. Current archives:"
ls -lh "$DEST" | tee -a "$LOGFILE"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — sample run"
            code={`chmod +x backup.sh
sudo ./backup.sh
cat /var/log/backup.log
ls -lh /backups/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[2026-09-05 02:00:01] Backing up /var/www/myapp -> /backups/myapp-2026-09-05.tar.gz
[2026-09-05 02:00:04] Backup created: /backups/myapp-2026-09-05.tar.gz
[2026-09-05 02:00:04] Deleting archives older than 7 days...
[2026-09-05 02:00:04] Cleanup done. Current archives:
-rw-r--r-- 1 root root 4.2M Sep  5 02:00 myapp-2026-09-05.tar.gz
-rw-r--r-- 1 root root 4.1M Sep  4 02:00 myapp-2026-09-04.tar.gz`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DATE=$(date +%F):</strong> command substitution — runs date
            and stores the result (2026-09-05). $(...) is the modern form;
            backticks do the same but nest badly.
          </li>
          <li>
            <strong>mkdir -p:</strong> creates DEST if missing, silently ok if
            present. Without -p the script dies on second run.
          </li>
          <li>
            <strong>find ... -mtime +7 -delete:</strong> the retention policy —
            archives older than 7 days vanish so the disk never fills. Test
            with -print first, switch to -delete once sure.
          </li>
          <li>
            <strong>tee -a:</strong> prints to screen AND appends to the log —
            you see progress now and have history later.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps use case: cron-ready health-check script with curl</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Servers need a robot that knocks on the app&apos;s door every few
          minutes and shouts when nobody answers. This script curls your
          app&apos;s /health endpoint, checks the HTTP status code, and exits
          non-zero on failure — which is exactly what cron (next lesson) and
          alerting need to notice. Uses only absolute paths and prints one
          timestamped line per run so logs stay parseable.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="health-check.sh"
            code={`#!/bin/bash
URL="http://localhost:3000/health"
LOGFILE="/var/log/health-check.log"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$STATUS" = "200" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] OK - $URL returned 200" >> "$LOGFILE"
  exit 0
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAIL - $URL returned $STATUS" >> "$LOGFILE"
  exit 1
fi`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`chmod +x health-check.sh
./health-check.sh
echo "exit code: $?"
cat /var/log/health-check.log`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`exit code: 0
[2026-09-05 11:05:00] OK - http://localhost:3000/health returned 200
[2026-09-05 11:10:00] FAIL - http://localhost:3000/health returned 500`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>curl -s -o /dev/null -w code:</strong> silent (-s), throw
            the body away (-o /dev/null), print only the status (-w). The
            script decides on the number, not on page text.
          </li>
          <li>
            <strong>exit 1 on FAIL:</strong> this is the contract cron and
            monitors rely on — non-zero means page someone. exit 0 on OK keeps
            success silent and log-only.
          </li>
          <li>
            <strong>Cron-ready habits:</strong> absolute paths, one log line per
            run, no interactive prompts, no relative files. The next lesson
            wires this exact script into crontab to run every 5 minutes.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Spaces around = in assignments: APP = &quot;myapp&quot; tries to
            run a command called APP. Write APP=&quot;myapp&quot; with no
            spaces.
          </li>
          <li>
            Unquoted $var: [ -f $FILE ] breaks on empty values and paths with
            spaces. Always [ -f &quot;$FILE&quot; ] and tar -czf
            &quot;$ARCHIVE&quot;.
          </li>
          <li>
            Windows line endings (CRLF): scripts edited on Windows fail with
            &quot;$'\r': command not found&quot; or a broken shebang. Save as
            LF (Unix) line endings, or fix with dos2unix script.sh / sed -i
            's/\r$//' script.sh.
          </li>
          <li>
            Missing [ spaces ]: if [$x = 1] is a syntax error — the brackets
            need spaces: if [ &quot;$x&quot; = 1 ].
          </li>
          <li>
            Comparing numbers with = or strings with -eq: use -gt/-lt/-eq for
            numbers, =/!= for text. [ 10 -gt 9 ] is true; [ 10 &gt; 9 ] is a
            redirect that creates a file named 9.
          </li>
          <li>
            Forgetting chmod +x then blaming the code: &quot;Permission
            denied&quot; on ./run.sh is a permission problem — run chmod +x
            run.sh first.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Write hello.sh with a shebang, chmod +x it, run it both as ./hello.sh and bash hello.sh, and explain the difference.</li>
          <li>Write variables.sh that sets APP and VERSION, prints them with double quotes, then shows the literal-vs-expanded difference with single quotes.</li>
          <li>Write a script that takes two arguments ($1 and $2), prints $0, $@, and $#, and test it with three different argument sets.</li>
          <li>Write greet.sh using read to ask for an environment name, then use if/elif with = to print a different message for prod, staging, and anything else.</li>
          <li>Write check.sh using -f, -d, -z, and -n to report whether a passed path is a file, directory, missing, or empty input.</li>
          <li>Write a for loop over /tmp/*.log (create 3 dummy .log files first) that prints each file, then extend it to gzip each one.</li>
          <li>Add a log() function plus set -e to any script above, run a failing command, and show how $? and the exit code change.</li>
          <li>Build the full backup.sh (tar.gz with date, keep-7-days find cleanup, tee log line), run it twice, and show the archive plus log output.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
