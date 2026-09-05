import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="Viewing, Editing & Searching"
      intro="Servers have no Notepad and no Ctrl+F. You read logs with cat and tail, edit configs with nano or vim, and search gigabytes of logs with grep and pipes — these are the daily DevOps survival skills."
      prev={{ href: "/linux-shell/file-operations", label: "File Operations" }}
      next={{ href: "/linux-shell/permissions-users", label: "Permissions & Users" }}
      resources={[
        {
          title: "GNU Coreutils Manual",
          url: "https://www.gnu.org/software/coreutils/manual/",
          description:
            "Official reference for cat, head, tail, sort, uniq, wc, and cut with full flag documentation.",
        },
        {
          title: "Linux Man Pages",
          url: "https://man7.org/linux/man-pages/",
          description:
            "Look up man grep, man tail, and man less online when you forget a flag on a server.",
        },
        {
          title: "Vim Documentation",
          url: "https://www.vim.org/docs.php",
          description:
            "Official vim docs and cheat sheets — start with the survival commands taught in this lesson.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Viewing small files: cat, less, and more</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>cat</strong> prints a whole file to the screen. It is perfect
          for small config files, but it dumps everything at once — never cat a
          500 MB log. <strong>less</strong> opens a scrollable viewer (arrow
          keys / PageUp / PageDown, q to quit, / to search inside).{" "}
          <strong>more</strong> is the older, simpler pager; on modern systems
          just use less.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`cat /etc/nginx/nginx.conf
less /var/log/syslog`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`user www-data;
worker_processes auto;
events { worker_connections 768; }
http {
  include /etc/nginx/mime.types;
  access_log /var/log/nginx/access.log;
}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>cat file:</strong> print entire file. Add -n for line
            numbers (cat -n app.conf) — handy when an error message says line
            42.
          </li>
          <li>
            <strong>less survival keys:</strong> Space = next page, b = back a
            page, /ERROR = search forward, n = next match, q = quit.
          </li>
          <li>
            <strong>Rule of thumb:</strong> under ~50 lines use cat; anything
            longer or unknown size, use less so your terminal does not flood.
          </li>
          <li>
            <strong>DevOps use case:</strong> SSH into a server and cat a
            config (cat /etc/nginx/sites-enabled/default) to verify what is
            actually deployed before changing anything.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">head and tail: peeking at log edges</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Logs grow forever, so you rarely read the whole file.{" "}
          <strong>head</strong> shows the first lines, <strong>tail</strong>{" "}
          shows the last lines. <strong>-n</strong> controls how many lines,
          and <strong>-f</strong> (follow) keeps tail running and prints new
          lines as they arrive — like watching a live feed of your app.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`head -n 5 /var/log/nginx/access.log
tail -n 10 /var/log/nginx/error.log
tail -f /var/log/myapp/app.log`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`192.168.1.10 - - [05/Sep/2026:10:01:02 +0000] "GET /health HTTP/1.1" 200 2
192.168.1.10 - - [05/Sep/2026:10:01:05 +0000] "GET /api/users HTTP/1.1" 200 431
192.168.1.11 - - [05/Sep/2026:10:01:07 +0000] "POST /api/login HTTP/1.1" 200 96
192.168.1.10 - - [05/Sep/2026:10:01:09 +0000] "GET /api/orders HTTP/1.1" 500 58
...
2026/09/05 10:02:11 [error] 1234#0: *56 connect() failed (111: Connection refused) while connecting to upstream, client: 192.168.1.10, server: api.example.com
2026/09/05 10:02:14 [error] 1234#0: *58 upstream timed out (110: Connection timed out) after 30s, client: 192.168.1.11`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>head -n 5:</strong> first 5 lines — check a file's format
            before parsing it.
          </li>
          <li>
            <strong>tail -n 10:</strong> last 10 lines — 90% of debugging is
            just this: the newest errors are at the end.
          </li>
          <li>
            <strong>tail -f:</strong> follow mode — stays open and streams new
            lines live. Press Ctrl+C to stop. Use tail -F (capital) to survive
            log rotation (reopens the file if it gets renamed).
          </li>
          <li>
            <strong>DevOps use case — live debugging:</strong> deploy a new
            version, then tail -f /var/log/myapp/app.log in one terminal while
            you hit the app in another. You see crashes the second they happen.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Editing on a server: nano vs vim survival</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Servers have no graphical editor, so you edit configs in the
          terminal. <strong>nano</strong> is the beginner-friendly choice: all
          commands are shown at the bottom. <strong>vim</strong> is installed
          everywhere and far more powerful, but it has modes that confuse every
          beginner once. Learn nano first, then vim survival — you will meet
          vim whether you like it or not (it is the default editor for crontab,
          git commits, and sudoedit).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — nano"
            code={`nano /etc/nginx/sites-enabled/default
# bottom of screen shows:  ^O Write Out  ^X Exit  ^W Where Is  ^K Cut Text
# Ctrl+O then Enter = save, Ctrl+X = quit`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — vim survival (only 6 commands to memorise)"
            code={`vim /etc/nginx/sites-enabled/default
# vim opens in NORMAL mode. Type:
#   i      enter INSERT mode (type text normally, -- INSERT -- shows below)
#   Esc    back to NORMAL mode
#   :w     save (write), press Enter
#   :q     quit
#   :wq    save and quit, press Enter
#   :q!    quit WITHOUT saving (discard changes)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>nano:</strong> open with nano file, edit immediately,
            Ctrl+O + Enter to save, Ctrl+X to quit. The ^ means Ctrl.
          </li>
          <li>
            <strong>vim's trap:</strong> typing :wq while still in insert mode
            just inserts the text :wq into your file. Always press Esc first,
            then type :wq and Enter.
          </li>
          <li>
            <strong>Stuck in vim right now?</strong> Press Esc, then type :q!
            and Enter. That quits without saving — the universal escape hatch.
          </li>
          <li>
            <strong>DevOps use case:</strong> quick hotfix on a server means
            sudo nano /etc/nginx/sites-enabled/default, change one line, save,
            then systemctl reload nginx. No editor, no deploy pipeline needed.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-zinc-800 dark:border-amber-900 dark:bg-amber-950 dark:text-zinc-200">
          <p className="font-semibold text-amber-700 dark:text-amber-300">
            Always back up before editing
          </p>
          <p className="mt-1">
            Copy the file first (cp app.conf app.conf.bak). One typo in nginx
            or sshd config can take the service down, and a .bak lets you
            restore in one mv command. See the mistakes section below.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Searching with grep</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>grep</strong> (global regular expression print) searches text
          for a pattern and prints matching lines. It is the Ctrl+F of the
          command line, except it works across thousands of files at once.
          Four flags cover most daily work: -i, -r, -n, -v.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`grep ERROR /var/log/myapp/app.log
grep -i "error" /var/log/myapp/app.log
grep -rn "TODO" ~/project/src
grep -v "^#" /etc/nginx/nginx.conf`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`2026-09-05 10:02:11 ERROR Connection refused to db:5432 (retry 1/3)
2026-09-05 10:02:14 ERROR Connection refused to db:5432 (retry 2/3)
2026-09-05 10:02:44 ERROR Out of memory: Java heap space

src/auth.ts:12:  // TODO: rotate JWT secret via Secrets Manager
src/db.ts:31:  // TODO: add connection pool timeout`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>grep PATTERN file:</strong> basic search — case-sensitive by
            default, so ERROR does not match error.
          </li>
          <li>
            <strong>-i:</strong> ignore case. grep -i error catches ERROR,
            Error, and error — what you want in messy logs.
          </li>
          <li>
            <strong>-r:</strong> recursive — search a whole directory tree.
            Without -r, grep on a directory just says is a directory and finds
            nothing (classic beginner mistake).
          </li>
          <li>
            <strong>-n:</strong> show line numbers (file:line: match) so you
            can jump straight to the hit in an editor.
          </li>
          <li>
            <strong>-v:</strong> invert — print lines that do NOT match. grep
            -v &quot;^#&quot; strips comment lines to reveal the real config.
          </li>
          <li>
            <strong>Piping into grep:</strong> any command's output can be
            filtered — ps aux | grep nginx, docker ps | grep api, env | grep
            AWS. If a command prints too much, pipe it to grep.
          </li>
          <li>
            <strong>DevOps use case — find every failure:</strong> grep -i
            &quot;error&quot; /var/log/myapp/app.log, or across all logs with
            grep -ri &quot;error&quot; /var/log/myapp/. Combine with tail:
            tail -f app.log | grep ERROR watches only errors live.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pipes and redirection: connecting commands</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The pipe <strong>|</strong> sends one command's output into the next
          command's input, building pipelines out of small tools. Redirection
          with <strong>&gt;</strong> sends output to a file instead of the
          screen. Together they are the Unix superpower: each tool does one
          thing, and you snap them together.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`tail -n 1000 /var/log/nginx/access.log | grep " 500 " | head -n 5
echo "deploy $(date +%F)" >> ~/deploy.log
ls /nonexistent 2> errors.txt
tail -f /var/log/myapp/app.log | tee live-capture.txt | grep ERROR`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`192.168.1.10 - - [05/Sep/2026:10:01:09 +0000] "GET /api/orders HTTP/1.1" 500 58
192.168.1.10 - - [05/Sep/2026:10:03:22 +0000] "POST /api/pay HTTP/1.1" 500 61`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>| (pipe):</strong> output of the left becomes input of the
            right. Read the example above left to right: take 1000 lines, keep
            only 500-errors, show the first 5.
          </li>
          <li>
            <strong>&gt; file:</strong> overwrite file with output.{" "}
            <strong>&gt;&gt; file:</strong> append to file instead. Appending
            (&gt;&gt;) is safe for logs; single &gt; silently erases what was
            there.
          </li>
          <li>
            <strong>2&gt; file:</strong> redirect errors (stderr) instead of
            normal output. Errors go to a separate stream, so 2&gt; captures
            them while normal output still shows.
          </li>
          <li>
            <strong>tee:</strong> split the stream — write to a file AND keep
            it flowing to the next command (and your screen). Named after a
            T-junction pipe fitting.
          </li>
          <li>
            <strong>DevOps use case — incident triage:</strong> the 500-error
            pipeline above is real incident work: narrow 1M log lines to the 5
            failures that matter, then investigate those requests.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Counting and slicing text: sort, uniq, wc, cut, awk</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Five small tools turn raw logs into answers: <strong>wc</strong>{" "}
          counts, <strong>sort</strong> orders, <strong>uniq</strong> collapses
          repeats, <strong>cut</strong> slices columns, and <strong>awk</strong>{" "}
          handles columnar data like access logs. Here they are on a realistic
          mini log.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — build a sample log"
            code={`cat ~/access-sample.log
wc -l ~/access-sample.log
cut -d'"' -f2 ~/access-sample.log | sort | uniq -c | sort -rn | head -n 3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`192.168.1.10 - - [05/Sep/2026:10:01:02 +0000] "GET /health HTTP/1.1" 200 2
192.168.1.10 - - [05/Sep/2026:10:01:05 +0000] "GET /api/users HTTP/1.1" 200 431
192.168.1.11 - - [05/Sep/2026:10:01:07 +0000] "POST /api/login HTTP/1.1" 200 96
192.168.1.10 - - [05/Sep/2026:10:01:09 +0000] "GET /api/orders HTTP/1.1" 500 58
192.168.1.12 - - [05/Sep/2026:10:01:11 +0000] "GET /api/users HTTP/1.1" 200 428
192.168.1.10 - - [05/Sep/2026:10:01:13 +0000] "GET /api/orders HTTP/1.1" 500 61
6 /home/shiva/access-sample.log
      2 GET /api/users HTTP/1.1
      2 GET /api/orders HTTP/1.1
      1 POST /api/login HTTP/1.1`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>wc -l:</strong> count lines (6 requests logged). wc -w
            counts words, wc -c bytes.
          </li>
          <li>
            <strong>cut -d'&quot;' -f2:</strong> split each line on the &quot;
            character and keep field 2 — the request string. -d sets the
            delimiter, -f picks fields.
          </li>
          <li>
            <strong>sort | uniq -c:</strong> uniq only collapses ADJACENT
            duplicates, so always sort first. -c prefixes each unique line with
            its count — instant frequency table.
          </li>
          <li>
            <strong>sort -rn:</strong> sort numerically (-n) in reverse (-r), so
            the most-hit endpoint lands on top.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — awk for status-code breakdown"
            code={`awk '{print $9}' ~/access-sample.log | sort | uniq -c
awk '$9 == 500' ~/access-sample.log`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`      4 200
      2 500
192.168.1.10 - - [05/Sep/2026:10:01:09 +0000] "GET /api/orders HTTP/1.1" 500 58
192.168.1.10 - - [05/Sep/2026:10:01:13 +0000] "GET /api/orders HTTP/1.1" 500 61`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>awk &apos;{"{print $9}"}&apos;:</strong> print the 9th
            whitespace-separated column — the HTTP status in nginx logs. $1 is
            the IP, $7 the path, $9 the status.
          </li>
          <li>
            <strong>awk &apos;$9 == 500&apos;:</strong> print only lines where
            column 9 equals 500. Awk is a mini filter language: pattern in
            front, action behind.
          </li>
          <li>
            <strong>DevOps use case — traffic report in one line:</strong> the
            status breakdown (4×200, 2×500) plus the top-endpoints pipeline
            above is a complete mini incident report from raw logs, no
            dashboard needed.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Editing a config with no backup: always cp nginx.conf
            nginx.conf.bak first. A broken edit plus no backup means rebuilding
            the config from memory during an outage.
          </li>
          <li>
            grep on a directory without -r: grep ERROR /var/log/myapp/ prints
            grep: /var/log/myapp/: Is a directory and matches nothing. Add -r
            (or -rn) to search inside.
          </li>
          <li>
            catting a huge log and freezing the terminal: check size with ls
            -lh first; use tail, head, or less for anything over a few hundred
            KB.
          </li>
          <li>
            Using &gt; when you meant &gt;&gt;: echo &quot;x&quot; &gt;
            deploy.log erases the whole log; &gt;&gt; appends. Double-check the
            arrows before pressing Enter on a production log.
          </li>
          <li>
            uniq without sort: uniq only removes neighbours, so unsorted input
            keeps duplicates. The pair is always sort | uniq, in that order.
          </li>
          <li>
            Saving a vim edit to the wrong file (:w /etc/...) or quitting with
            unsaved changes lost — use :wq carefully, and :q! only when you
            truly want to discard.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create ~/lab/logs/app.log with 20 lines (mix INFO and ERROR), then view it with cat -n.</li>
          <li>Use head -n 3 and tail -n 5 on the file, then run tail -f in one terminal while appending lines from another.</li>
          <li>Open the file in nano, change one line, save with Ctrl+O and quit with Ctrl+X.</li>
          <li>Open the file in vim: press i, add a line, press Esc, save with :w, quit with :q. Then practise :q! on a throwaway change.</li>
          <li>Run grep ERROR, grep -i error, grep -n ERROR, and grep -v INFO on the log and compare outputs.</li>
          <li>Build a pipeline: cat app.log | grep ERROR | wc -l to count errors, then redirect the error lines to errors.txt with &gt;.</li>
          <li>Run the endpoint frequency pipeline (cut | sort | uniq -c | sort -rn) on the sample log format and find the top path.</li>
          <li>Use awk to print only 500-status lines from a fake access log, then summarise status codes with sort | uniq -c.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
