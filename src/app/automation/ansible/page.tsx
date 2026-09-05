import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Configuration & Automation"
      title="Ansible"
      intro="Ansible is SSH at scale: you describe the desired state in YAML, and a control node pushes it to every target over plain SSH — no agents, no daemons, no open ports beyond 22. Here you install it, build an inventory, run ad-hoc commands, write a full nginx playbook with templates and handlers, hide secrets with Vault, organize with roles, then run a free lab against localhost plus one t3.micro EC2."
      prev={{ href: "/automation/overview", label: "Start Here" }}
      next={{ href: "/automation/systems-manager", label: "Systems Manager" }}
      resources={[
        {
          title: "Ansible User Guide",
          url: "https://docs.ansible.com/ansible/latest/user_guide/index.html",
          description:
            "Official playbooks, inventory, variables, roles, and Vault reference with full examples.",
        },
        {
          title: "Ansible for Amazon Web Services Guide",
          url: "https://docs.ansible.com/ansible/latest/collections/amazon/aws/docsite/guide_aws.html",
          description:
            "Official guide to the amazon.aws collection: dynamic inventory, ec2_instance, and AWS modules.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm the t3.micro 750-hour allowance before launching the lab EC2 instance.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">A. How Ansible works: agentless SSH + push model</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The <strong>control node</strong> (your laptop) holds playbooks and
          inventory; <strong>managed nodes</strong> (servers) need only SSH
          and Python — nothing to install, no agent phoning home. Each run,
          Ansible opens SSH to every target, copies small Python{" "}
          <strong>modules</strong> over, executes them, and reports{" "}
          <strong>ok / changed / failed</strong> per task. This is a{" "}
          <strong>push model</strong>: you decide when runs happen (terminal,
          cron, CI/CD). The alternative <strong>pull model</strong>{" "}
          (ansible-pull, Chef-style agents) has each server fetch and apply
          config on its own schedule — better for fleets that outlive any one
          controller, worse for visibility and immediate control.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture — push over SSH, no agents"
            code={`CONTROL NODE (laptop)                MANAGED NODES
+------------------------+          +------------------+
| playbooks/ site.yml    |          | web-1 (EC2)      |
| inventory.ini          |== SSH ==>| sshd + python3   |
| group_vars/ vault.yml  |== SSH ==>| (modules run,    |
+------------------------+          |  then deleted)   |
  ansible-playbook pushes           +------------------+
  modules per task,                         |
  collects ok/changed            +------------------+
                                 | localhost        |
                                 | connection:local |
                                 +------------------+`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Agentless is the superpower:</strong> a fresh Ubuntu EC2
            with port 22 open is manageable in 60 seconds — no bootstrap
            installer, no enrollment, no agent upgrades ever. The price: the
            control node must reach every target over SSH at run time.
          </li>
          <li>
            <strong>Push vs pull:</strong> push (ansible-playbook) = run now,
            see every result, natural for deploys and CI/CD. Pull
            (ansible-pull + git + cron on each host) = survives controller
            outages, natural for thousand-node baselines — but debugging means
            SSHing into hosts to read local logs.
          </li>
          <li>
            <strong>DevOps uses:</strong> push playbooks from CI/CD to deploy
            releases; scheduled pulls or SSM associations to re-converge
            baselines; ad-hoc pushes (&quot;restart php-fpm everywhere&quot;)
            as the incident-response hammer.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">B. Install + inventory A–Z</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Install Ansible with <strong>pip</strong> (never the stale OS
          package), verify with <strong>ansible --version</strong>, then
          describe your fleet in an <strong>inventory</strong> — an INI file
          grouping hosts under names like [web] so playbooks target groups,
          not IPs. Groups carry variables (ansible_user, key file) and nest
          ([prod:children]) as fleets grow.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — install with pip"
            code={`python3 -m venv ~/ansible-venv
source ~/ansible-venv/bin/activate
pip install --upgrade pip
pip install ansible
ansible --version
ansible-community --version 2>/dev/null || ansible --version`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Successfully installed ansible-10.7.0 ansible-core-2.17.9
ansible [core 2.17.9]
  config file = None
  python version = 3.12.3
  jinja version = 3.1.4`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="inventory.ini — groups, vars, localhost"
            code={`[web]
web-1 ansible_host=203.0.113.25 ansible_user=ubuntu

[web:vars]
ansible_ssh_private_key_file=~/keys/myapp-key.pem
ansible_python_interpreter=/usr/bin/python3

[local]
localhost ansible_connection=local

[prod:children]
web`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — verify the inventory graph"
            code={`ansible-inventory -i inventory.ini --graph
ansible-inventory -i inventory.ini --list | head -30
ansible all -i inventory.ini --list-hosts`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`@all:
  |--@prod:
  |  |--@web:
  |  |  |--web-1
  |--@local:
  |  |--localhost
  |--@ungrouped:
hosts (3):
  localhost
  web-1`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>venv first:</strong> a virtualenv pins your Ansible version
            per project and avoids sudo pip fights with system Python. Activate
            it in every new terminal before running playbooks.
          </li>
          <li>
            <strong>ansible_host vs inventory name:</strong> web-1 is the human
            label; ansible_host is where SSH connects. Keep labels stable and
            swap IPs underneath — playbooks never change when servers do.
          </li>
          <li>
            <strong>[group:vars] and [parent:children]:</strong> one place for
            the key file and Python path instead of per-host repeats; prod
            inherits every web host automatically. localhost with
            ansible_connection=local runs without SSH — your free practice
            target.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">C. Ad-hoc commands: ping, shell, copy</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Ad-hoc commands</strong> are one-liners for one job — the
          orchestrated equivalent of SSHing everywhere at once.{" "}
          <strong>ping</strong> (the pong test, not ICMP) proves Ansible can
          reach and Python-execute on targets; <strong>shell/command</strong>{" "}
          runs reads and restarts; <strong>copy/apt/service</strong> make
          small idempotent changes without writing a playbook yet.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — pong, uptime, disk"
            code={`ansible web -i inventory.ini -m ping
ansible web -i inventory.ini -m shell -a "uptime && df -h / | tail -1"
ansible web -i inventory.ini -m shell -a "sudo systemctl is-active nginx"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`web-1 | SUCCESS => {"changed": false, "ping": "pong"}
web-1 | CHANGED => {"cmd": "uptime && df -h / | tail -1", "stdout": "11:40:01 up 2 days, /dev/root 28G 4.2G 24G 15% /"}
web-1 | CHANGED => {"stdout": "active"}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — copy a file and install a package ad-hoc"
            code={`ansible web -i inventory.ini -m copy -a "src=./motd.txt dest=/tmp/motd.txt mode=0644" --become
ansible web -i inventory.ini -m apt -a "name=nginx state=present update_cache=yes" --become
ansible localhost -m ping`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`web-1 | CHANGED => {"dest": "/tmp/motd.txt", "checksum": "a1b2c3d4", "changed": true}
web-1 | SUCCESS => {"cache_updated": true, "changed": false}
localhost | SUCCESS => {"changed": false, "ping": "pong"}`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-m module -a args:</strong> every ad-hoc call is module +
            arguments. ping takes none; shell takes a command string; copy
            takes src/dest/mode; apt takes name/state. Playbooks are these
            same calls, written down in YAML.
          </li>
          <li>
            <strong>--become = sudo:</strong> writing outside /tmp or
            installing packages needs privilege escalation — without it you get
            Permission denied, the most common beginner failure (see
            mistakes).
          </li>
          <li>
            <strong>DevOps uses:</strong> ping as the pre-deploy connectivity
            gate in CI; shell for fleet-wide reads (versions, disk, failed
            units); copy/apt ad-hoc for the 2 a.m. hotfix you will convert
            into a playbook tomorrow.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">D. First playbook: nginx with template + handlers</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>playbook</strong> is YAML that declares plays (which hosts)
          containing tasks (which modules, in order). Below is a complete{" "}
          <strong>site.yml</strong>: install nginx via apt, render a Jinja2{" "}
          <strong>template</strong> with the server name injected, enable and
          start the <strong>service</strong>, and <strong>notify</strong> a{" "}
          <strong>handler</strong> that restarts nginx only when the config
          actually changed. Run it twice and watch the second run go fully
          green — idempotence from the overview, now for real.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="site.yml — full playbook"
            code={`---
- name: Serve our site with nginx
  hosts: web
  become: true

  vars:
    site_name: myapp
    http_port: 80

  tasks:
    - name: Install nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: Deploy nginx vhost from template
      ansible.builtin.template:
        src: templates/vhost.conf.j2
        dest: /etc/nginx/sites-available/myapp.conf
        mode: "0644"
      notify: Restart nginx

    - name: Enable our site
      ansible.builtin.file:
        src: /etc/nginx/sites-available/myapp.conf
        dest: /etc/nginx/sites-enabled/myapp.conf
        state: link
      notify: Restart nginx

    - name: Ensure nginx is running and enabled
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="templates/vhost.conf.j2 — Jinja2 template"
            code={`server {
    listen {{ http_port }};
    server_name {{ site_name }}.example.com;

    root /var/www/{{ site_name }};
    index index.html;

    location /health {
        access_log off;
        return 200 '{"status":"ok"}';
    }
}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — run it"
            code={`ansible-playbook -i inventory.ini site.yml
curl http://203.0.113.25/health`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output — first run"
            code={`PLAY [Serve our site with nginx] *********************
TASK [Install nginx] *******************************
changed: [web-1]
TASK [Deploy nginx vhost from template] ************
changed: [web-1]
TASK [Enable our site] *****************************
changed: [web-1]
TASK [Ensure nginx is running and enabled] *********
ok: [web-1]
RUNNING HANDLER [Restart nginx] ********************
changed: [web-1]

PLAY RECAP *****************************************
web-1 : ok=5 changed=4 unreachable=0 failed=0
{"status":"ok"}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output — second run (idempotent)"
            code={`PLAY [Serve our site with nginx] *********************
TASK [Install nginx] *******************************
ok: [web-1]
TASK [Deploy nginx vhost from template] ************
ok: [web-1]
TASK [Enable our site] *****************************
ok: [web-1]
TASK [Ensure nginx is running and enabled] *********
ok: [web-1]

PLAY RECAP *****************************************
web-1 : ok=4 changed=0 unreachable=0 failed=0`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>become: true:</strong> escalates the whole play to root —
            apt, /etc writes, and service control all need it. Prefer play-level
            become over sprinkling --become on the CLI so reruns behave
            identically.
          </li>
          <li>
            <strong>template vs copy:</strong> copy ships static files; template
            renders Jinja2 (double-curly variables, loops, conditionals) so one
            vhost file serves staging and prod with different vars.
          </li>
          <li>
            <strong>notify/handlers:</strong> handlers queue during the play
            and run once at the end, only if notified by a changed task. No
            change → no restart — that is why the second run has no handler
            block at all.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">E. Variables & Vault: group_vars and never-commit-secrets</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Variables</strong> layer from generic to specific: play vars{" "}
          → <strong>group_vars/all.yml</strong> (every host) →{" "}
          <strong>group_vars/web.yml</strong> (one group) →{" "}
          <strong>host_vars/web-1.yml</strong> (one machine), with the most
          specific winning. Secrets get their own encrypted file via{" "}
          <strong>ansible-vault</strong> — AES-256 ciphertext in git, plaintext
          only in memory at run time with --ask-vault-pass.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="group_vars/all.yml — shared defaults"
            code={`---
ntp_servers:
  - 169.254.169.123
  - time.google.com
admin_email: ops@example.com
http_port: 80`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="group_vars/web.yml — group overrides"
            code={`---
site_name: myapp
http_port: 8080
max_workers: 4`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — encrypt, view, and run with Vault"
            code={`ansible-vault create group_vars/vault.yml
ansible-vault view group_vars/vault.yml
ansible-vault encrypt group_vars/vault.yml
ansible-playbook -i inventory.ini site.yml --ask-vault-pass`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`New Vault password:
Confirm New Vault password:
# vault.yml now holds ciphertext like:
# $ANSIBLE_VAULT;1.1;AES256
# 3966653931613362653533643161...
Decryption successful
PLAY RECAP *****************************************
web-1 : ok=4 changed=0 unreachable=0 failed=0`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 text-zinc-700 dark:border-red-800 dark:bg-red-950 dark:text-zinc-300">
          <p className="font-medium text-red-800 dark:text-red-300">Never commit secrets — vault password in git ends careers</p>
          <p className="mt-1 text-sm leading-6">
            Commit vault.yml (ciphertext) freely; never commit the vault
            password, a --vault-password-file containing it, plaintext secrets,
            or your .pem key. Add *vault_pass*, *.pem, and *.retry to
            .gitignore today. Leaked vault password = every secret it ever
            encrypted is burned: rotate all of them, rewrite git history, and
            enable a new password out-of-band.
          </p>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Precedence in one line:</strong> host_vars beats
            group_vars/web beats group_vars/all beats play vars defaults —
            so http_port: 8080 in web.yml wins over 80 in all.yml for web
            hosts only.
          </li>
          <li>
            <strong>DevOps uses:</strong> all.yml for company-wide NTP/DNS,
            group files per environment (staging vs prod ports and replicas),
            vault.yml per environment for DB passwords and API tokens, host
            files for snowflake overrides you plan to eliminate.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">F. Roles layout: galaxy init and the roles/ tree</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>role</strong> is a playbook split into conventional
          folders — tasks, handlers, templates, files, vars, defaults — so the
          nginx logic becomes reusable (<strong>roles/nginx</strong>) and
          site.yml shrinks to a list of roles per group.{" "}
          <strong>ansible-galaxy init</strong> scaffolds the tree; Galaxy
          (galaxy.ansible.com) hosts thousands of community roles to
          reference before writing your own.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — scaffold a role"
            code={`ansible-galaxy init roles/nginx
ansible-galaxy init roles/common --offline
tree roles/nginx -L 2 2>/dev/null || find roles/nginx -maxdepth 2 | sort`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Diagram — roles/ ASCII tree"
            code={`roles/
  nginx/
    tasks/main.yml        # install, template, service tasks
    handlers/main.yml     # Restart nginx
    templates/vhost.conf.j2
    files/health-check.sh
    vars/main.yml         # high-precedence role vars
    defaults/main.yml     # low-precedence tunables
    meta/main.yml         # description + dependencies
  common/
    tasks/main.yml        # ntp, motd, admin user

site.yml                  # hosts: web / roles: [common, nginx]`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="site.yml — composed from roles"
            code={`---
- name: Baseline all servers
  hosts: all
  become: true
  roles:
    - common

- name: Serve the site
  hosts: web
  become: true
  roles:
    - nginx`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>defaults vs vars:</strong> defaults/main.yml is meant to be
            overridden (ports, counts — group_vars wins over it);
            vars/main.yml wins over almost everything — reserve it for values
            that must not change.
          </li>
          <li>
            <strong>DevOps uses:</strong> one role per concern (common, nginx,
            docker, monitoring) versioned in git, shared across staging and
            prod playbooks, and eventually tested in CI with Molecule before
            promotion.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">G. Full lab [FREE local]: localhost + 1 EC2 t3.micro with teardown</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Two targets, zero spend if you tear down. <strong>localhost</strong>{" "}
          (connection:local, no SSH) proves playbooks work; one{" "}
          <strong>t3.micro Ubuntu 24.04</strong> (Free Tier) proves they work
          over real SSH. Steps A–D run free locally; E–H touch AWS for minutes
          only. Set a phone timer for 60 minutes — when it rings, you are at
          step H terminating.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-zinc-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-zinc-300">
          <p className="font-medium text-emerald-800 dark:text-emerald-300">Free Tier boundary</p>
          <p className="mt-1 text-sm leading-6">
            t3.micro with 8 GB gp3, 750 hours/month free for 12 months. One
            instance for one hour ≈ 1 of those hours. SSM, EBS within 30 GB,
            and data transfer under 1 GB stay free — terminate the instance and
            delete the key pair the same session.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — A. Local-only practice (no AWS)"
            code={`ansible localhost -m ping
ansible-playbook -i inventory.ini site.yml --limit localhost --check
ansible-playbook -i inventory.ini site.yml --limit localhost`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`localhost | SUCCESS => {"changed": false, "ping": "pong"}
PLAY RECAP **** localhost : ok=4 changed=0 unreachable=0 failed=0`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — B. Launch one t3.micro [FREE TIER]"
            code={`aws ec2 run-instances --image-id resolve:ssm:/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id --instance-type t3.micro --key-name myapp-key --security-group-ids sg-0123456789abcdef0 --subnet-id subnet-0123456789abcdef0 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ansible-lab},{Key=Env,Value=lab}]' --query 'Instances[0].InstanceId' --output text
aws ec2 wait instance-running --instance-ids i-0a1b2c3d4e5f60718
aws ec2 describe-instances --instance-ids i-0a1b2c3d4e5f60718 --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`i-0a1b2c3d4e5f60718
203.0.113.25`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — C. Point inventory at it and converge"
            code={`# set web-1 ansible_host=203.0.113.25 in inventory.ini, then:
ansible web -i inventory.ini -m ping
ansible-playbook -i inventory.ini site.yml --limit web
ansible-playbook -i inventory.ini site.yml --limit web  # expect changed=0
curl http://203.0.113.25/health`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`web-1 | SUCCESS => {"ping": "pong"}
PLAY RECAP **** web-1 : ok=5 changed=4 unreachable=0 failed=0
PLAY RECAP **** web-1 : ok=4 changed=0 unreachable=0 failed=0
{"status":"ok"}`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — D. TEARDOWN NOW (do not skip)"
            code={`aws ec2 terminate-instances --instance-ids i-0a1b2c3d4e5f60718
aws ec2 wait instance-terminated --instance-ids i-0a1b2c3d4e5f60718
aws ec2 describe-instances --instance-ids i-0a1b2c3d4e5f60718 --query 'Reservations[0].Instances[0].State.Name' --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`terminated`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>--check is your dry run:</strong> predicts changes without
            applying them — run it before every real converge, especially
            against prod groups.
          </li>
          <li>
            <strong>Docker alternative:</strong> no AWS account? Run two local
            containers with openssh-server on ports 2221/2222 and list them as
            inventory hosts with ansible_port — same SSH mechanics, zero cloud.
          </li>
          <li>
            <strong>Verify the bill:</strong> EC2 console shows zero running
            instances; Billing shows under 1 instance-hour. If the wait command
            timed out, check the console manually — never assume termination.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            sudo missing: &quot;Failed ... Permission denied&quot; or
            &quot;E: Could not open lock file&quot; on apt/copy/service — fix
            with become: true in the play (or --become ad-hoc), not by
            chmodding system paths.
          </li>
          <li>
            Hosts typo / wrong group: play says hosts: webs (plural) or
            --limit web when the group is [web] — Ansible warns
            &quot;Could not match supplied host pattern&quot; and reports
            ok=0. Copy group names from ansible-inventory --graph.
          </li>
          <li>
            Vault password in git: committing *vault_pass.txt or pasting the
            password into a playbook comment — anyone with history has every
            secret. .gitignore it, share passwords via a manager, rotate on
            any leak.
          </li>
          <li>
            SSH as the wrong user: ec2-user@ on Ubuntu (needs ubuntu@) or a
            key another user owns — &quot;Permission denied
            (publickey)&quot;. Match ansible_user to the AMI and confirm the
            .pem with ssh -v.
          </li>
          <li>
            Non-idempotent shell tasks: shell: &quot;echo x &gt;&gt;
            file&quot; changes every run — add creates=/path or use
            lineinfile/blockinfile/template so reruns report ok.
          </li>
          <li>
            Forgetting --ask-vault-pass in CI: playbook with vault vars dies
            on &quot;Attempting to decrypt but no vault secrets found&quot; —
            wire ANSIBLE_VAULT_PASSWORD_FILE to a CI secret, never a
            committed file.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the control-node/managed-node diagram from memory and explain push vs pull to a peer: when does each win?</li>
          <li>Install Ansible in a venv, run ansible --version, and paste your core version — then break and fix the venv by opening a fresh terminal without activating it.</li>
          <li>Write inventory.ini with [web], [web:vars] (key file + python interpreter), [local], and [prod:children], then prove it with ansible-inventory -i inventory.ini --graph.</li>
          <li>Run the three ad-hoc commands (ping, shell uptime/df, copy motd with --become) against localhost and your EC2, saving both outputs.</li>
          <li>Write site.yml + vhost.conf.j2 from section D, run it twice against your target, and show changed=N then changed=0 with the handler firing only once.</li>
          <li>Create group_vars/all.yml + web.yml, encrypt a vault.yml with ansible-vault, reference a vaulted DB password in the template, and run with --ask-vault-pass.</li>
          <li>Run ansible-galaxy init roles/nginx, move your tasks/handlers/templates into the role tree, shrink site.yml to roles: [nginx], and re-converge to changed=0.</li>
          <li>Complete lab G end to end (localhost check, t3.micro launch, converge twice, curl /health, terminate + verify terminated), then continue to Systems Manager.</li>
        </ul>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          SSH fleet control done — next, control fleets with no SSH at all via
          Systems Manager.
        </p>
      </section>
    </LessonLayout>
  );
}
