import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="Cron, Logs & Troubleshooting"
      intro="Scripts are only half the story — someone has to run them on schedule, and someone has to read the logs when things break. Here you learn cron's five-field schedule, the PATH and logging traps that break every beginner's first cron job, where logs live (/var/log and journalctl), and a repeatable troubleshooting method that takes you from 'it's down' to a fix."
      prev={{ href: "/linux-shell/shell-scripting", label: "Shell Scripting" }}
      next={{ href: "/linux-shell/ssh-remote-tools", label: "SSH & Remote Tools" }}
      resources={[
        {
          title: "Linux Man Pages",
          url: "https://man7.org/linux/man-pages/",
          description:
            "Read man 5 crontab for the schedule format, plus man journalctl, man systemctl, and man df.",
        },
        {
          title: "Ubuntu Tutorials",
          url: "https://ubuntu.com/tutorials/",
          description:
            "Free Ubuntu walkthroughs covering scheduled tasks, log files, and basic server troubleshooting.",
        },
        {
          title: "Bash Manual",
          url: "https://www.gnu.org/software/bash/manual/",
          description:
            "Official Bash reference for the redirection (>>, 2>&1) and PATH behavior your cron jobs depend on.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Cron schedule format: the five stars, field by field</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>cron</strong> is Linux&apos;s built-in scheduler — it runs
          commands for you on a timetable. Each line in your personal timetable
          (<strong>crontab</strong>) starts with five time fields then the
          command: <strong>minute hour day-of-month month day-of-week</strong>.
          A <strong>*</strong> means &quot;every&quot; value of that field;
          numbers pin one value; <strong>*/5</strong> means &quot;every 5&quot;
          and <strong>2</strong> as the hour means 2 AM.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — reading the schedule"
            code={`#  min hour dom mon dow   command
#  --- ---- --- --- ---   -------
#   *    *    *   *   *   minute(0-59) hour(0-23) day(1-31) month(1-12) weekday(0-7, 0+7=Sunday)
crontab -l`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output — two real jobs"
            code={`0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>0 2 * * *:</strong> minute 0, hour 2, every day/month/weekday
            = daily at 2:00 AM. The classic nightly-backup slot — users asleep,
            load low.
          </li>
          <li>
            <strong>*/5 * * * *:</strong> every 5 minutes, all day. The standard
            health-check / monitoring heartbeat from the previous lesson.
          </li>
          <li>
            <strong>More patterns:</strong> 30 9 * * 1 = Mondays at 9:30 AM; 0
            0 1 * * = midnight on the 1st of each month; 0 * * * * = top of
            every hour.
          </li>
          <li>
            <strong>crontab -l lists, crontab -e edits:</strong> -l shows your
            jobs; -e opens them in an editor. Never hand-edit cron spool files
            — always go through crontab -e so syntax gets validated.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Installing the two jobs: daily backup at 2 AM, health check every 5 min</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Let&apos;s wire the previous lesson&apos;s scripts into cron. Open
          your crontab, add one line per job, save, and verify with crontab -l.
          Each line is: schedule + absolute script path + log redirection. The
          trailing <strong>&gt;&gt; file 2&gt;&amp;1</strong> appends both
          normal output and errors to the log — without it, failures vanish
          silently.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`crontab -e
crontab -l`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="crontab — paste these two lines in the editor"
            code={`0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`crontab: installing new crontab
0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Daily backup at 2 AM:</strong> 0 2 * * * runs backup.sh once
            a night. Pair it with the script&apos;s own 7-day find cleanup so
            disk never fills.
          </li>
          <li>
            <strong>Health check every 5 min:</strong> */5 * * * * runs
            health-check.sh twelve times an hour. Its exit 1 on failure is what
            future alerting hooks into.
          </li>
          <li>
            <strong>&gt;&gt; appends, 2&gt;&amp;1 merges stderr:</strong> &gt;&gt;
            keeps history (single &gt; would wipe the log each run); 2&gt;&amp;1
            captures errors too. Test the full command by hand first, then paste
            the identical line into cron.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Why cron jobs fail: PATH, absolute paths, and logging gotchas</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The #1 beginner shock: a script that works in your terminal fails in
          cron. Cause: cron runs with a <strong>minimal environment</strong> —
          a tiny PATH, no ~/.bashrc, a different working directory. Fixes are
          mechanical: use <strong>absolute paths</strong> for every file and
          command (or set PATH at the top of the crontab), cd explicitly if the
          script assumes a directory, and <strong>always log output</strong> so
          you can see what happened.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="crontab — safe header + jobs"
            code={`PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
SHELL=/bin/bash

0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — proving the PATH trap"
            code={`echo $PATH
which python3
grep CRON /var/log/syslog | tail -5
tail -5 /var/log/backup.log`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
/usr/bin/python3
Sep  5 02:00:01 ip-172-31-4-10 CRON[2210]: (root) CMD (/usr/local/bin/backup.sh >> /var/log/backup.log 2>&1)
Sep  5 02:00:04 ip-172-31-4-10 CRON[2210]: (root) CMD completed
[2026-09-05 02:00:04] Cleanup done. Current archives:`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Set PATH explicitly:</strong> your shell has /snap/bin,
            conda paths, and aliases — cron has almost nothing. The PATH= line
            at the top of the crontab removes &quot;command not found&quot;
            surprises.
          </li>
          <li>
            <strong>Absolute paths everywhere:</strong> /usr/local/bin/backup.sh
            not ./backup.sh; /var/log/backup.log not backup.log; /usr/bin/python3
            not python3. Cron&apos;s working directory is not your home.
          </li>
          <li>
            <strong>No logging = no evidence:</strong> a bare &quot;0 2 * * *
            /job.sh&quot; line emails output (usually to nowhere) and discards
            the rest. Always append &gt;&gt; log 2&gt;&amp;1, then tail the log
            to confirm the job actually ran.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Where logs live: /var/log layout plus journalctl</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Linux keeps two log worlds. Classic text files under{" "}
          <strong>/var/log</strong> (syslog, auth.log, nginx/ app logs — read
          with cat/less/tail/grep). And the <strong>systemd journal</strong>{" "}
          (service output — read with <strong>journalctl</strong>: -u filters
          one service, -f follows live, --since bounds time, -p err shows only
          errors). Troubleshooting always starts here: find the newest error
          lines first, then work backwards.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — classic log files"
            code={`ls /var/log/
sudo tail -20 /var/log/syslog
sudo grep -i "error\\|fail" /var/log/syslog | tail -10
ls /var/log/nginx/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`auth.log  backup.log  syslog  nginx/  health-check.log
Sep  5 10:55:00 ip-172-31-4-10 systemd[1]: Starting nginx.service...
Sep  5 10:55:00 ip-172-31-4-10 nginx[2310]: bind() to 0.0.0.0:80 failed (Address already in use)
Sep  5 10:55:00 ip-172-31-4-10 systemd[1]: nginx.service: Failed with result 'exit-code'.
drwxr-xr-x 2 www-data www-data 4096 Sep  5 access.log error.log`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — journalctl"
            code={`journalctl -u nginx --no-pager -n 20
journalctl -u nginx -f
journalctl --since "1 hour ago" -p err --no-pager
journalctl -u health-check --since today --no-pager`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Sep 05 10:55:00 ip-172-31-4-10 nginx[2310]: nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
Sep 05 10:55:00 ip-172-31-4-10 systemd[1]: nginx.service: Failed with result 'exit-code'.
Sep 05 10:55:00 ip-172-31-4-10 systemd[1]: Failed to start nginx.service.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>syslog = system diary, auth.log = logins, nginx/*.log =
            web traffic:</strong> 4xx/5xx spikes live in error.log; failed SSH
            attempts live in auth.log. Your cron jobs add backup.log and
            health-check.log beside them.
          </li>
          <li>
            <strong>journalctl -u NAME:</strong> only that service&apos;s logs.
            -n 20 shows the tail; -f follows live (Ctrl+C stops); --since
            &quot;1 hour ago&quot; skips ancient history; -p err filters to
            errors and worse.
          </li>
          <li>
            <strong>Newest first, errors first:</strong> don&apos;t read logs
            top-to-bottom — tail the last 20 lines, grep for error/fail, then
            widen with --since. The bind() failure above names the fix: port 80
            is taken, stop the squatter.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Troubleshooting method: status, logs, config, perms, disk (plus dmesg)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Random guessing wastes hours. Follow the same five steps every time:{" "}
          <strong>1) systemctl status</strong> (is it running?),{" "}
          <strong>2) journalctl</strong> (what is the error?),{" "}
          <strong>3) config test</strong> (nginx -t, syntax?),{" "}
          <strong>4) permissions</strong> (can it read its files?),{" "}
          <strong>5) disk/memory</strong> (df -h, is the disk full?).{" "}
          <strong>dmesg</strong> is the bonus step — kernel messages about
          hardware, out-of-memory kills, and disk errors.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — the 5-step triage"
            code={`sudo systemctl status nginx --no-pager
journalctl -u nginx --no-pager -n 20
sudo nginx -t
ls -l /etc/nginx/nginx.conf
df -h
dmesg | tail -20`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`nginx.service - Active: failed (Result: exit-code)
Sep 05 nginx[2310]: bind() to 0.0.0.0:80 failed (Address already in use)
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
-rw-r--r-- 1 root root 1774 Sep  5 /etc/nginx/nginx.conf
Filesystem      Size  Used Avail Use% Mounted on
/dev/root        29G   12G   18G  40% /
[12345.678] Out of memory: Killed process 2311 (node) score 900`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Step 1–2 status then logs:</strong> status says failed;
            journalctl names the cause (port conflict here). Fix the named cause
            — don&apos;t reinstall the package.
          </li>
          <li>
            <strong>Step 3 config test:</strong> nginx -t / apachectl configtest
            catch typos before restart. &quot;syntax is ok&quot; rules out the
            config file.
          </li>
          <li>
            <strong>Step 4 perms:</strong> ls -l on the config and data files —
            a 600 file owned by the wrong user gives &quot;permission
            denied&quot; that looks like a code bug.
          </li>
          <li>
            <strong>Step 5 disk + dmesg:</strong> df -h over 90% full breaks
            writes, databases, and deploys; dmesg reveals kernel-level kills
            (&quot;Out of memory: Killed process&quot;) no app log will show.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses: nightly backup job and disk-full outage triage</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Two patterns you will reuse weekly. First, the{" "}
          <strong>nightly S3-style backup job</strong>: cron at 2 AM runs your
          backup script, which tars the app and (on AWS) syncs to S3 — same
          shape as the local version, one extra upload line. Second, the{" "}
          <strong>disk-full triage</strong>: deploys fail with &quot;No space
          left&quot;, and the fix is a du/df hunt for the hog, not a bigger
          disk.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="crontab — nightly S3-style backup"
            code={`0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
# inside backup.sh, after tar succeeds (AWS version):
# /usr/local/bin/aws s3 cp "$ARCHIVE" "s3://myapp-backups/$DATE/" >> /var/log/backup.log 2>&1`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — disk-full triage"
            code={`df -h
sudo du -sh /var/log/* | sort -rh | head -10
sudo journalctl --since "30 min ago" -p err --no-pager
sudo find /backups -name "*.tar.gz" -mtime +7 -print`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Filesystem      Size  Used Avail Use% Mounted on
/dev/root        29G   28G  300M  99% /
4.2G    /var/log/nginx/access.log
1.1G    /var/log/syslog
Sep 05 11:20:00 app[3100]: ERROR: write failed: No space left on device
/backups/myapp-2026-08-20.tar.gz`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Nightly job anatomy:</strong> cron schedule + absolute
            script + log redirect; the script itself does tar, S3 upload, and
            7-day cleanup. Verify with tail /var/log/backup.log each morning
            until you trust it.
          </li>
          <li>
            <strong>Disk-full triage order:</strong> df -h confirms 99%; du
            finds the hog (4.2 GB access.log here — needs log rotation, not
            deletion of random files); journalctl shows which app broke first.
          </li>
          <li>
            <strong>Old backups are quota too:</strong> the find -print
            previews what retention would delete — flip to -delete after
            confirming, exactly like backup.sh does.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Unescaped % in cron: % means newline in crontab — date +%F breaks
            unless written as date +\%F. Prefer $(date) inside the script file
            instead of date logic on the cron line.
          </li>
          <li>
            Relative paths: ./backup.sh or backup.log resolve to cron&apos;s
            home, not yours. Always absolute: /usr/local/bin/backup.sh and
            /var/log/backup.log.
          </li>
          <li>
            No logging redirect: without &gt;&gt; log 2&gt;&amp;1, failures are
            invisible. Every cron line ends with a log redirect — no exceptions.
          </li>
          <li>
            Forgetting cron&apos;s minimal PATH: works in terminal, &quot;aws:
            command not found&quot; in cron. Set PATH= at the top of the
            crontab or use full binary paths.
          </li>
          <li>
            Editing the wrong crontab (user vs sudo): sudo crontab -e and
            crontab -e are different timetables with different permissions. Log
            paths must be writable by whichever user owns the job.
          </li>
          <li>
            Reading logs top-to-bottom: always tail newest lines and grep
            error/fail first — the cause is near the end, not the beginning.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Run crontab -l, then decode each field of 0 2 * * * and */5 * * * * in your own words (minute, hour, day, month, weekday).</li>
          <li>Add the daily backup line (0 2 * * *) to crontab -e with &gt;&gt; /var/log/backup.log 2&gt;&amp;1, save, and verify with crontab -l.</li>
          <li>Add the every-5-min health-check line (*/5 * * * *) the same way and explain why &gt;&gt; (append) is correct and &gt; (overwrite) would destroy history.</li>
          <li>Break PATH on purpose: put a bare-toolname command in a cron script, watch it fail in the log, then fix it with a PATH= header or absolute path.</li>
          <li>List /var/log/, tail the last 20 lines of syslog, and grep it for error/fail — write down the newest issue you find.</li>
          <li>Run journalctl -u nginx (or any service) with -n 20, then --since "1 hour ago" -p err, and compare what the error filter hides vs shows.</li>
          <li>Follow a live log with journalctl -f (or tail -f /var/log/syslog) in one terminal while restarting a service in another.</li>
          <li>Run the full 5-step triage (status → journalctl → config test → ls -l perms → df -h + dmesg tail) against nginx and write a one-paragraph diagnosis.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
