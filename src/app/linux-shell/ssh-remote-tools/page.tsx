import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Linux & Shell"
      title="SSH & Remote Tools"
      intro="Your server lives in a data center, not on your desk — SSH is the encrypted tunnel you drive it through. Here you learn key-based login (including AWS .pem files), the first-connection host-key prompt, copying files with scp/sftp, fetching with curl/wget, deploying with rsync, and the ~/.ssh/config aliases that turn long commands into two words."
      prev={{ href: "/linux-shell/cron-logs", label: "Cron, Logs & Troubleshooting" }}
      next={{ href: "/git-github", label: "Git & GitHub" }}
      resources={[
        {
          title: "SSH Academy",
          url: "https://www.ssh.com/academy/ssh",
          description:
            "Free in-depth guide to SSH concepts, key-based auth, ssh-keygen, and ssh-copy-id with examples.",
        },
        {
          title: "Linux Man Pages",
          url: "https://man7.org/linux/man-pages/",
          description:
            "Look up man ssh, man scp, man rsync, and man ssh_config for every flag used in this lesson.",
        },
        {
          title: "WSL setup guide",
          url: "https://learn.microsoft.com/en-us/windows/wsl/",
          description:
            "Official guide to Windows Subsystem for Linux so Windows users get a real ssh, scp, and rsync terminal.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">What SSH is and why port 22</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>SSH (Secure Shell)</strong> opens an encrypted command line
          on a remote machine: everything you type and everything the server
          returns travels scrambled, replacing the ancient plaintext telnet. It
          defaults to <strong>port 22</strong> — the door your EC2 security
          group must open to your IP before ssh can connect. One command both
          proves who you are (key or password) and gives you a shell there.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — the basic shape"
            code={`ssh ubuntu@203.0.113.25
ssh -p 22 ubuntu@203.0.113.25
ssh -v ubuntu@203.0.113.25`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0 x86_64)
Last login: Fri Sep  5 10:58:00 2026 from 49.37.1.10
ubuntu@ip-172-31-4-10:~$`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>ssh user@host:</strong> log in as user on host. ubuntu@ for
            Ubuntu AMIs, ec2-user@ for Amazon Linux — the username must match
            the AMI.
          </li>
          <li>
            <strong>Port 22:</strong> the default SSH door. -p 22 says it
            explicitly (needed only when a server moves SSH elsewhere). If ssh
            hangs, the security group almost certainly blocks 22 — fix it in
            the AWS console, not in ssh flags.
          </li>
          <li>
            <strong>-v (verbose):</strong> prints the handshake step by step —
            your first diagnostic when a connection fails (key offered? key
            rejected? timeout?).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Key-based auth: ssh-keygen, ssh-copy-id, and AWS .pem files</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Passwords are guessable; <strong>keys</strong> are not. You generate a{" "}
          <strong>key pair</strong> — a private key (secret, stays on your
          laptop) and a public key (safe to upload to servers). The server
          trusts anyone holding the matching private key, so login needs no
          password. On AWS the flow is pre-made: you download a{" "}
          <strong>.pem private key</strong> at launch, lock it down with chmod
          400, and pass it with ssh -i.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — general key flow (non-AWS / own servers)"
            code={`ssh-keygen -t ed25519 -C "shiva@laptop"
ls -l ~/.ssh/
ssh-copy-id ubuntu@203.0.113.25
ssh ubuntu@203.0.113.25`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Generating public/private ed25519 key pair.
Your identification has been saved in /home/shiva/.ssh/id_ed25519
Your public key has been saved in /home/shiva/.ssh/id_ed25519.pub
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed
Number of key(s) added: 1
Welcome to Ubuntu 24.04 LTS
ubuntu@ip-172-31-4-10:~$`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — AWS EC2 with a .pem key"
            code={`chmod 400 ~/keys/myapp-key.pem
ssh -i ~/keys/myapp-key.pem ubuntu@203.0.113.25`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0 x86_64)
ubuntu@ip-172-31-4-10:~$`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>ssh-keygen -t ed25519:</strong> creates ~/.ssh/id_ed25519
            (private — never share) + .pub (public — uploaded to servers).
            Accept the default path; a passphrase adds protection if the laptop
            is stolen.
          </li>
          <li>
            <strong>ssh-copy-id user@host:</strong> installs your .pub into the
            server&apos;s ~/.ssh/authorized_keys over one last password login —
            after that, login is key-only.
          </li>
          <li>
            <strong>AWS .pem flow:</strong> the console gives you the private
            half (myapp-key.pem). chmod 400 makes it read-only-for-you (SSH
            refuses keys anyone else can read), and ssh -i points at it. Wrong
            username (ec2-user on Ubuntu) fails even with the right key.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">First connection: the host-key prompt (say yes once, carefully)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The first time you ssh anywhere, the server shows its{" "}
          <strong>fingerprint</strong> and asks if you trust it. This{" "}
          <strong>host-key check</strong> blocks man-in-the-middle attacks: SSH
          remembers the key in ~/.ssh/known_hosts and screams WARNING on later
          visits if it changes. Answer <strong>yes</strong> for servers you
          just launched; investigate (don&apos;t blindly delete) if a known
          server suddenly changes.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`ssh -i ~/keys/myapp-key.pem ubuntu@203.0.113.25`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`The authenticity of host '203.0.113.25 (203.0.113.25)' can't be established.
ED25519 key fingerprint is SHA256:9r8KzX2mQpL4vN7wAbCdEfGhIjKlMnOpQrStUvWx.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '203.0.113.25' (ED25519) to the list of known hosts.
Welcome to Ubuntu 24.04 LTS
ubuntu@ip-172-31-4-10:~$`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Type yes (full word):</strong> y alone aborts. After yes,
            the key lands in ~/.ssh/known_hosts and you are never asked for
            that server again.
          </li>
          <li>
            <strong>Verify on EC2:</strong> compare the fingerprint with the
            console&apos;s &quot;instance system log&quot; on first connect —
            a match proves no interception.
          </li>
          <li>
            <strong>WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED:</strong>{" "}
            means the key differs — rebuilt server (expected, remove the old
            line with ssh-keygen -R host) vs attacker (stop and verify
            out-of-band). Rebuilt EC2 = fine; your bank = alarm.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Copying files: scp and sftp in both directions</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>scp</strong> copies single files/dirs over SSH with cp-like
          syntax — local→remote to deploy, remote→local to fetch logs.{" "}
          <strong>sftp</strong> opens an interactive session (ls, get, put) for
          browsing and multiple transfers. The colon separates host from path;
          -i supplies your .pem; -r copies directories.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — scp both directions"
            code={`scp -i ~/keys/myapp-key.pem app.tar.gz ubuntu@203.0.113.25:/home/ubuntu/
scp -i ~/keys/myapp-key.pem -r ./dist/ ubuntu@203.0.113.25:/var/www/myapp/
scp -i ~/keys/myapp-key.pem ubuntu@203.0.113.25:/var/log/backup.log ./backup-from-server.log`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`app.tar.gz                  100% 4224KB   4.1MB/s   00:01
dist/ -> /var/www/myapp/: 12 files copied
backup.log                  100%   14KB  14.0KB/s   00:00`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — sftp session"
            code={`sftp -i ~/keys/myapp-key.pem ubuntu@203.0.113.25
ls
put app.tar.gz
get /var/log/backup.log
bye`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Connected to 203.0.113.25.
sftp> ls
app.tar.gz  myapp/
sftp> put app.tar.gz
Uploading app.tar.gz to /home/ubuntu/app.tar.gz
sftp> get /var/log/backup.log
Fetching /var/log/backup.log to backup.log
sftp> bye`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Direction rule:</strong> source first, destination last —
            &quot;scp local server:path&quot; uploads; &quot;scp server:path
            local&quot; downloads. The colon marks the remote side.
          </li>
          <li>
            <strong>-r for directories, -i for the key:</strong> forget -r and
            scp says &quot;not a regular file&quot;; forget -i on EC2 and it
            falls back to password (which EC2 disables → Permission denied).
          </li>
          <li>
            <strong>sftp for exploring:</strong> ls/cd work before transferring
            — ideal when you don&apos;t know the exact remote path. get = download,
            put = upload, bye quits.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Fetching over HTTP: curl and wget (+ rsync for deploys)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Not everything moves over SSH. <strong>curl</strong> is the API +
          debugging tool (show headers, POST JSON, check status codes);{" "}
          <strong>wget</strong> is the simple downloader (one file, resume with
          -c). <strong>rsync -avz</strong> is the deploy workhorse: it copies
          only changed files over SSH with compression — re-running a deploy
          takes seconds, not minutes.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — curl"
            code={`curl http://localhost:3000/health
curl -I http://localhost:3000/health
curl -o /tmp/app.tar.gz https://example.com/releases/app.tar.gz
curl -X POST -H "Content-Type: application/json" -d '{"env":"staging"}' http://localhost:3000/deploy`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{"status":"ok","uptime_sec":45210}
HTTP/1.1 200 OK
Content-Type: application/json
  % Total    % Received  % Xferd  Average Speed
100 4224k  100 4224k    0     0  8.1M      0 --:--:-- --:--:-- --:--:--  8.1M
{"deploy":"accepted"}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — wget and rsync"
            code={`wget https://example.com/releases/app.tar.gz
wget -c https://example.com/releases/app.tar.gz
rsync -avz -e "ssh -i ~/keys/myapp-key.pem" ./dist/ ubuntu@203.0.113.25:/var/www/myapp/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`app.tar.gz saved [4224 KB]
sending incremental file list
dist/
dist/index.html
dist/app.js
sent 4,240 bytes  received 120 bytes  8,720 bytes/sec
total size is 4,324,096  speedup is 991.5`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>curl for APIs, wget for files:</strong> curl prints the body
            (add -o file to save, -I for headers-only, -H/-d for API calls);
            wget saves by default and -c resumes interrupted downloads.
          </li>
          <li>
            <strong>rsync -avz:</strong> a=archive (keeps perms/times), v=verbose,
            z=compress. Only diffs cross the wire — the second deploy of the
            same tree is near-instant. Trailing slash on ./dist/ matters: with
            it, contents sync; without it, the folder itself nests one level
            deeper.
          </li>
          <li>
            <strong>-e &quot;ssh -i key&quot;:</strong> teaches rsync which SSH
            key to use — without it, EC2 deploys fail exactly like keyless scp.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses: EC2 deploy (rsync + ssh restart) and ssh config aliases</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The daily DevOps loop: <strong>rsync</strong> the fresh build up,{" "}
          <strong>ssh</strong> in (or inline) to restart the service,{" "}
          <strong>curl</strong> the health endpoint to confirm.{" "}
          <strong>~/.ssh/config</strong> compresses the whole ceremony into
          &quot;ssh myapp&quot; with a Host alias, the right user/key, and a
          keepalive so idle sessions survive flaky networks.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — deploy to EC2"
            code={`rsync -avz -e "ssh -i ~/keys/myapp-key.pem" ./dist/ ubuntu@203.0.113.25:/var/www/myapp/
ssh -i ~/keys/myapp-key.pem ubuntu@203.0.113.25 "sudo systemctl restart myapp && sudo systemctl status myapp --no-pager"
curl http://203.0.113.25:3000/health`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`sent 4,240 bytes  received 120 bytes  8,720 bytes/sec
myapp.service - Active: active (running) since Fri 2026-09-05 11:15:00 UTC
{"status":"ok","uptime_sec":12}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="~/.ssh/config — Host alias + keepalive"
            code={`Host myapp
  HostName 203.0.113.25
  User ubuntu
  IdentityFile ~/keys/myapp-key.pem
  ServerAliveInterval 60
  ServerAliveCountMax 3`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — life with the alias + EC2 metadata"
            code={`ssh myapp
scp backup-from-server.log myapp:/home/ubuntu/
ssh myapp "curl -s http://169.254.169.254/latest/meta-data/instance-id"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Welcome to Ubuntu 24.04 LTS
ubuntu@ip-172-31-4-10:~$
i-0a1b2c3d4e5f60718`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Deploy in three lines:</strong> sync files → restart service
            remotely (quotes run the command there, not here) → curl health.
            uptime_sec: 12 proves the restart just happened.
          </li>
          <li>
            <strong>Host alias:</strong> after the config block, ssh myapp, scp
            file myapp:path, and rsync -e ssh myapp:path all work — no more
            retyping IPs, users, or -i flags.
          </li>
          <li>
            <strong>Keepalive + metadata:</strong> ServerAliveInterval 60 pings
            hourly-idle sessions so NATs don&apos;t silently drop them;
            169.254.169.254 is EC2&apos;s metadata address — instance-id,
            AMI, and IAM role all queryable from inside.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Wrong key permissions: &quot;WARNING: UNPROTECTED PRIVATE KEY
            FILE&quot; means the .pem is readable by others — fix with chmod
            400 ~/keys/myapp-key.pem, never chmod 777.
          </li>
          <li>
            Logging in as root: EC2 disables root SSH; ubuntu@ (Ubuntu) or
            ec2-user@ (Amazon Linux) plus sudo is the path. ssh root@ fails by
            design.
          </li>
          <li>
            Pasting/sharing the private key: the .pem and id_ed25519 are
            secrets — never paste into chat, tickets, or git. Share only .pub
            files; if a private key leaks, delete it from every server and
            rotate.
          </li>
          <li>
            Forgetting -i (EC2) or -r (folders): no -i falls back to password
            auth and dies with Permission denied; no -r on a directory says
            &quot;not a regular file&quot;.
          </li>
          <li>
            rsync trailing-slash surprise: ./dist/ syncs contents into the
            target; ./dist (no slash) creates target/dist/. Pick deliberately —
            check with --dry-run first on important deploys.
          </li>
          <li>
            Blindly deleting known_hosts on WARNING: a changed host key can mean
            attack. For a rebuilt instance use ssh-keygen -R hostname to remove
            just that line after confirming the rebuild.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Run ssh ubuntu@YOUR_EC2_IP (or ssh -v on failure) and explain what port 22 does and what -v reveals about the handshake.</li>
          <li>Generate an ed25519 key with ssh-keygen, list ~/.ssh/, and identify which file is private (secret) vs public (shareable).</li>
          <li>Run ssh-copy-id to your server (or chmod 400 your AWS .pem + ssh -i user@host) and log in without a password.</li>
          <li>Trigger the host-key prompt on a fresh IP, answer yes, then open ~/.ssh/known_hosts and find the added line.</li>
          <li>scp a file up to the server and a log file back down — show both transfer outputs and verify with ls on each side.</li>
          <li>Open an sftp session: ls the remote dir, put one file up, get one file down, then bye — note when sftp beats scp.</li>
          <li>curl a health endpoint (body + -I headers), wget a release tarball (then resume it with -c), and rsync -avz a folder to the server twice to show the speedup.</li>
          <li>Write a ~/.ssh/config Host alias with IdentityFile + keepalive, ssh via the alias, run the 3-line deploy (rsync → ssh restart → curl health), then continue to Git &amp; GitHub.</li>
        </ul>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          You can now reach any server, ship files, and deploy — next, version
          everything with Git &amp; GitHub.
        </p>
      </section>
    </LessonLayout>
  );
}
