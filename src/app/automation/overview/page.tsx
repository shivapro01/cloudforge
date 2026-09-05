import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Configuration & Automation"
      title="Start Here"
      intro="Clicking through the console to configure ten servers is fun exactly once. This module teaches you to declare the desired state once and let tools enforce it everywhere: Ansible for SSH-based config management, Systems Manager for agent-based fleet control, Lambda for event-driven reactions, and Boto3 when you need a script instead of a server. Start here to learn which tool fits which job — and why idempotence is the idea holding all of them together."
      prev={{ href: "/automation", label: "Automation" }}
      next={{ href: "/automation/ansible", label: "Ansible" }}
      resources={[
        {
          title: "Ansible Getting Started",
          url: "https://docs.ansible.com/ansible/latest/getting_started/index.html",
          description:
            "Official Ansible intro: control node, inventory, ad-hoc commands, and your first playbook.",
        },
        {
          title: "AWS Systems Manager User Guide",
          url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html",
          description:
            "Official guide to SSM Agent, Run Command, State Manager, and Parameter Store for fleet automation.",
        },
        {
          title: "DevOps Roadmap — roadmap.sh",
          url: "https://roadmap.sh/devops",
          description:
            "Where configuration management, IaC, and CI/CD sit in the full DevOps skill map.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">A. Config management vs orchestration vs event automation</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Three different problems get lumped under &quot;automation&quot;.{" "}
          <strong>Configuration management</strong> answers &quot;is nginx
          installed, configured, and running on every web server right
          now?&quot; — it converges long-lived machines toward a declared
          state, repeatedly. <strong>Orchestration</strong> answers
          &quot;run this command on 200 machines at once and tell me who
          failed&quot; — one-shot, fleet-wide execution from a central API.
          <strong>Event automation</strong> answers &quot;when X happens, do
          Y without a human&quot; — a trigger fires code (a schedule, an S3
          upload, a CloudWatch alarm). Ansible lives mostly in box one, SSM
          Run Command / State Manager in box two, Lambda + EventBridge in box
          three, and Boto3 scripts glue any of them together.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-[13px] leading-6 text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 font-semibold">Tool</th>
                <th className="px-4 py-2 font-semibold">Model</th>
                <th className="px-4 py-2 font-semibold">Needs agent?</th>
                <th className="px-4 py-2 font-semibold">Best for</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Ansible</td>
                <td className="px-4 py-2">Push over SSH, YAML playbooks</td>
                <td className="px-4 py-2">No — SSH + Python only</td>
                <td className="px-4 py-2">Config management, app deploys, local + cloud VMs</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">SSM (Run Command / State Manager)</td>
                <td className="px-4 py-2">AWS API → SSM Agent, documents</td>
                <td className="px-4 py-2">Yes — SSM Agent + IAM role</td>
                <td className="px-4 py-2">Fleet patching, compliance, no-SSH access</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Lambda + EventBridge</td>
                <td className="px-4 py-2">Event triggers code, serverless</td>
                <td className="px-4 py-2">No — AWS runs it</td>
                <td className="px-4 py-2">Scheduled jobs, S3/alarm reactions, auto-remediation</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Boto3 (Python SDK)</td>
                <td className="px-4 py-2">Script calls AWS APIs directly</td>
                <td className="px-4 py-2">No — runs wherever Python runs</td>
                <td className="px-4 py-2">Custom tooling, bulk ops, one-off migrations</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Diagram — which automation path?"
            code={`Event happens? (schedule / S3 upload / alarm)
  YES ──> Lambda + EventBridge ──> runs code ──> done, scales to zero
  NO, need steady state on servers?
    Fleet is AWS + SSM Agent? ──YES──> SSM State Manager / Run Command
    Mixed / local / plain SSH? ──YES──> Ansible playbook over SSH
  Need custom logic / bulk AWS API calls?
    ──> Boto3 Python script (cron, Lambda, or laptop)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Ansible vs SSM:</strong> Ansible reaches anything with SSH
            (laptop, on-prem, any cloud) and needs no agent; SSM reaches any
            EC2 with the agent + IAM instance role even with port 22 closed,
            and every execution is logged in the AWS console.
          </li>
          <li>
            <strong>Lambda vs Boto3:</strong> Lambda is where event-driven code
            runs (no server to manage); Boto3 is the library that code — or
            your laptop script — uses to talk to AWS. A Lambda function often
            contains Boto3 calls.
          </li>
          <li>
            <strong>Orchestration vs config management:</strong> &quot;restart
            nginx on all web servers now&quot; is orchestration (Run Command,
            ansible ad-hoc); &quot;nginx must always be installed with this
            config&quot; is config management (playbook, State Manager
            association). You need both verbs.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">B. Idempotence explained: run twice, same state</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Idempotence</strong> means running an automation N times
          produces the same end state as running it once — the second run
          detects &quot;already correct&quot; and changes nothing. Shell
          scripts with <strong>apt install</strong> are accidentally idempotent
          (apt skips installed packages); scripts with <strong>echo line
          &gt;&gt; file</strong> are not (every run appends a duplicate).
          Ansible modules (apt, copy, service, template) are idempotent by
          design: they check current state first, report{" "}
          <strong>changed</strong> or <strong>ok</strong> per task, and only
          fire handlers when something actually changed.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — first run changes things"
            code={`ansible-playbook -i inventory.ini site.yml

PLAY [web] *****************************************
TASK [Install nginx] *******************************
changed: [web-1]
TASK [Start nginx] *********************************
changed: [web-1]

PLAY RECAP *****************************************
web-1 : ok=2 changed=2 unreachable=0 failed=0`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output — second run changes nothing"
            code={`ansible-playbook -i inventory.ini site.yml

PLAY [web] *****************************************
TASK [Install nginx] *******************************
ok: [web-1]
TASK [Start nginx] *********************************
ok: [web-1]

PLAY RECAP *****************************************
web-1 : ok=2 changed=0 unreachable=0 failed=0`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>changed=2 → changed=0:</strong> the proof of idempotence.
            First run installs and starts; second run verifies both and exits
            green. A non-idempotent script would reinstall, duplicate config
            lines, or restart the service every time.
          </li>
          <li>
            <strong>Handlers only fire on change:</strong> &quot;restart
            nginx&quot; runs only when the config template task reports
            changed — so steady-state runs never bounce a healthy service.
          </li>
          <li>
            <strong>Why it matters in DevOps:</strong> CI/CD reruns pipelines,
            autoscaling launches fresh hosts, and cron re-applies baselines.
            If re-running your automation is unsafe, none of those can be
            trusted — idempotence is what makes &quot;run on schedule&quot;
            safe.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">C. When to use each tool: golden images vs config vs events vs scripts</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The four tools overlap — the decision is about lifecycle.{" "}
          <strong>Golden images</strong> (Packer/AMI + Terraform, from the IaC
          module) bake the OS + dependencies once and launch identical hosts
          fast. <strong>Config management</strong> (Ansible/SSM) keeps running
          hosts converged as configs drift and packages need patching.{" "}
          <strong>Event automation</strong> (Lambda) reacts in seconds to
          things that happen. <strong>Scripts</strong> (Boto3) do whatever is
          too custom or too one-off for the other three.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram — golden image vs live config"
            code={`Golden image path (fast boot, slow change):
  Packer/Ansible builds AMI ──> Terraform launches 50x ──> hosts identical at birth
  Config drifts over weeks ──> patch / re-converge ──┐
                                                     v
Live config path (flexible, always enforced):
  Ansible playbook / SSM association ──> runs hourly ──> drift corrected automatically
Event path (reactive):
  CloudWatch alarm / S3 event ──> EventBridge ──> Lambda ──> fix + notify in seconds`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DevOps scenario — nightly patching:</strong> SSM State
            Manager association runs AWS-RunPatchBaseline weekly across all
            tagged EC2, no SSH, results in the console. Ansible equivalent:
            playbook with the apt module on a cron — better for mixed fleets
            outside AWS.
          </li>
          <li>
            <strong>DevOps scenario — deploy v2.4 to 30 web servers:</strong>{" "}
            Ansible playbook (template the config, rolling serial: 5,
            handlers restart) — push model, works over existing SSH.
          </li>
          <li>
            <strong>DevOps scenario — stop dev instances at 19:00:</strong>{" "}
            EventBridge schedule → Lambda with Boto3 ec2.stop_instances on
            tag Env=dev — pennies per month, zero servers to manage. A cron
            + Boto3 script on a laptop does the same job but only while the
            laptop is awake.
          </li>
          <li>
            <strong>DevOps scenario — migrate 400 S3 objects + tag them:</strong>{" "}
            Boto3 script with pagination and retries — too custom for a
            playbook, too long for a console click session. Lambda if it must
            run on every future upload; script if it runs once.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-zinc-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-zinc-300">
          <p className="font-medium text-emerald-800 dark:text-emerald-300">Cost — this whole module is Free Tier safe</p>
          <p className="mt-1 text-sm leading-6">
            Ansible on localhost, one t3.micro EC2, SSM (no extra charge for
            EC2 management), Lambda free tier (1M requests/month), and Boto3
            API calls cost nothing by themselves. The only billable item is
            the EC2 instance hours — stop or terminate it after each lab.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 text-zinc-700 dark:border-red-800 dark:bg-red-950 dark:text-zinc-300">
          <p className="font-medium text-red-800 dark:text-red-300">Do not leave the lab instance running</p>
          <p className="mt-1 text-sm leading-6">
            A forgotten t3.micro running 24/7 burns ~750 hours a month — your
            entire Free Tier allowance on one idle box. Every lab in this
            module ends with an explicit teardown step; run it before closing
            the laptop.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">D. Module path: 4 topics ending in Boto3 scripting</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Work the module in order — each lesson hands a skill to the next.
          Ansible teaches declarative state and YAML; Systems Manager teaches
          the AWS-native fleet view (documents, parameters, patching);
          Lambda automation teaches triggers and schedules; Boto3 closes the
          loop by scripting everything the consoles and CLIs can do.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram — module roadmap"
            code={`[1] Ansible ──SSH, YAML, idempotent playbooks──> [2] Systems Manager
        ──Run Command, State Manager, Parameter Store──> [3] Lambda automation
        ──schedules, S3 events, auto-remediation──> [4] Boto3 scripting
        ──Python + AWS APIs: the glue for all of the above`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Lesson 1 — Ansible (this module&apos;s workhorse):</strong>{" "}
            inventory, ad-hoc commands, playbooks, variables, vault, roles,
            and a full localhost + EC2 lab.
          </li>
          <li>
            <strong>Lesson 2 — Systems Manager:</strong> Run Command for
            no-SSH execution, State Manager associations for continuous
            compliance, Parameter Store for secrets that Ansible vault must
            never duplicate in git.
          </li>
          <li>
            <strong>Lesson 3 — Lambda automation:</strong> EventBridge
            schedules, S3-triggered functions, alarm-driven remediation —
            automation with nobody logged in anywhere.
          </li>
          <li>
            <strong>Lesson 4 — Boto3 scripting:</strong> the final skill —
            Python scripts that list, tag, start, stop, and snapshot AWS
            resources with pagination, retries, and dry-run safety.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">E. Prereqs: SSH, IAM, and Python</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Three earlier modules do the heavy lifting — confirm each before
          starting Ansible. Without SSH keys you cannot reach targets;
          without IAM you cannot authorize SSM or Boto3; without Python
          basics the playbooks (YAML) are readable but the Boto3 finale is
          not.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>SSH (Linux Module 02 — SSH &amp; Remote Tools):</strong>{" "}
            key-based login, chmod 400 on .pem files, the first-connection
            host-key prompt, scp/sftp. Ansible is SSH with YAML on top — every
            connection failure here is an SSH failure first.
          </li>
          <li>
            <strong>IAM (AWS Fundamentals — IAM):</strong> users, roles,
            instance profiles, and least-privilege policies. SSM Agent
            authenticates with an instance role (AmazonSSMManagedInstanceCore);
            Boto3 authenticates with access keys or roles — same permission
            model, different caller.
          </li>
          <li>
            <strong>Python (Prerequisites — Python Basics):</strong> pip,
            virtualenvs, variables, loops, functions. Enough to read Boto3
            scripts and Jinja2 templates (the double-curly-brace syntax in
            Ansible configs).
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal — 60-second readiness check"
            code={`ssh -i ~/keys/myapp-key.pem ubuntu@YOUR_EC2_IP "echo SSH_OK"
python3 --version && pip3 --version
aws sts get-caller-identity --query Arn --output text`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`SSH_OK
Python 3.12.3
pip 24.0 from /usr/lib/python3/dist-packages/pip
arn:aws:iam::123456789012:user/shiva`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Automating before you can do it manually: if you cannot install
            nginx by hand over SSH, a playbook just fails faster on more
            machines. Manual once, then automate.
          </li>
          <li>
            Reaching for Lambda when a schedule + playbook fits: not every
            job needs events. Nightly config convergence is a cron +
            ansible-playbook, not a serverless rewrite.
          </li>
          <li>
            Storing secrets in playbooks or scripts: passwords and keys belong
            in Ansible Vault or SSM Parameter Store (SecureString) — never
            plaintext YAML, never committed to git.
          </li>
          <li>
            Skipping idempotence testing: always run every playbook and script
            twice and demand changed=0 (or &quot;no changes&quot;) the second
            time before calling it done.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (6 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Draw the decision table from memory: for &quot;patch 50 EC2 on Sundays&quot;, &quot;deploy app to 5 VMs&quot;, &quot;resize images on upload&quot;, and &quot;tag 400 buckets once&quot;, assign Ansible / SSM / Lambda / Boto3 and justify each.</li>
          <li>Run any shell command twice (e.g. mkdir -p /tmp/idem-test and grep -q line file || echo line &gt;&gt; file) and classify each as idempotent or not with evidence.</li>
          <li>Run the readiness check above (SSH echo, python3/pip3 versions, sts get-caller-identity) and fix any failure before continuing.</li>
          <li>Write one paragraph: golden image vs live config — when would you rebuild the AMI versus re-run the playbook for a security patch?</li>
          <li>Pick two DevOps scenarios from section C and map each to its trigger, tool, and rollback plan (what undoes it if it goes wrong?).</li>
          <li>Launch nothing yet — list the teardown commands (aws ec2 terminate-instances, rm keys) you will run after every lab, then continue to Ansible.</li>
        </ul>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          Mental model set — next, make Ansible configure real machines over
          SSH.
        </p>
      </section>
    </LessonLayout>
  );
}
