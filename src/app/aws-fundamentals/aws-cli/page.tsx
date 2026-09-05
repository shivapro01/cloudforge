import Link from "next/link";
import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="AWS CLI & Console Setup"
      intro="The Console teaches you what exists; the CLI is how you actually operate AWS. Every DevOps workflow — deploy scripts, cron cleanups, CI pipelines, incident triage at 2 AM — runs through these commands. In this lesson you install CLI v2 on your OS, create least-privilege credentials for it, configure named profiles for dev and prod, verify with read-only commands, and learn the Console power moves (including the free CloudShell fallback) for when your laptop is not available."
      prev={{ href: "/aws-fundamentals/overview", label: "Start Here" }}
      next={{ href: "/aws-fundamentals/iam", label: "IAM" }}
      resources={[
        {
          title: "AWS Documentation — CLI and Console guides",
          url: "https://docs.aws.amazon.com/",
          description:
            "The CLI v2 user guide (install, configure, profiles) and Console getting-started docs live here — bookmark both.",
        },
        {
          title: "AWS Skill Builder",
          url: "https://skillbuilder.aws/",
          description:
            "Free digital courses on CLI basics and Console navigation with practice labs for each service.",
        },
        {
          title: "roadmap.sh — DevOps Roadmap",
          url: "https://roadmap.sh/devops",
          description:
            "Shows where CLI fluency and cloud-console skills sit in the full DevOps learning path.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Why the CLI is your primary DevOps interface</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The Console is excellent for discovery and terrible for repetition: clicks cannot be
          versioned, diffed, rerun identically, or executed by a CI runner. The CLI exposes the same
          AWS APIs as terminal commands, which means everything you type can be pasted into a runbook,
          looped in a script, and eventually promoted into IaC. Senior engineers live in the CLI
          because incidents reward speed and precision — one command with an explicit region and
          query beats five minutes of Console clicking while the alarm keeps firing.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Scriptable by construction:</strong> flags like query, filter, and output turn
            API responses into pipe-friendly text, so a describe command becomes the input to the
            next automation step with zero screen-scraping.
          </li>
          <li>
            <strong>The CI connection:</strong> every pipeline step that touches AWS is a CLI
            command (or SDK call) with credentials attached. Learning the CLI locally is literally
            learning the vocabulary your future pipelines speak.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Install AWS CLI v2 on Linux, macOS, and Windows</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Install <strong>v2</strong> (not the legacy v1): it adds SSO support, auto-prompt, and
          the current command set, and it is what every modern guide assumes. Pick exactly one block
          below for your OS, run it, then confirm the version output matches the shape shown — the
          version string is your proof the binary, not a stale install, is on your PATH.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
sudo ./aws/install
aws --version`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`You can now run: /usr/local/bin/aws --version
aws-cli/2.15.30 Python/3.11.8 Linux/6.5.0 exe/x86_64.ubuntu.22
# Linux: "aws-cli/2.x" confirms v2. Any "aws-cli/1.x" means the old
# package manager copy is shadowing it — remove awscli v1 first.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
aws --version`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`installer: Successfully installed AWS CLI v2.
aws-cli/2.15.30 Python/3.11.8 Darwin/23.4.0 exe/x86_64
# macOS: close and reopen the terminal if "command not found" appears —
# the installer extends PATH via /etc/paths.d for new shells only.`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
aws --version`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Successfully installed AWS CLI v2.
aws-cli/2.15.30 Python/3.11.8 Windows/10 exe/AMD64
# Windows: open a NEW Command Prompt or PowerShell after install so the
# updated PATH takes effect, then re-run the version check.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">An IAM user for the CLI: ReadOnly first, keys with care</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The CLI needs programmatic credentials — an <strong>access key ID plus secret access
          key</strong> belonging to an IAM user. Create a dedicated user (for example,
          cli-readonly-you), attach the AWS-managed <strong>ReadOnlyAccess</strong> policy first,
          and only widen permissions deliberately later. Starting read-only means a compromised key
          or a mistyped delete command cannot destroy anything while you are learning, and it
          previews the least-privilege workflow the IAM lesson makes permanent.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws iam create-user --user-name cli-readonly-you
aws iam attach-user-policy --user-name cli-readonly-you --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
aws iam create-access-key --user-name cli-readonly-you --query "AccessKey.{ID:AccessKeyId,Secret:SecretAccessKey}" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`------------------------------------------------
|                   CreateAccessKey            |
+----------------------------------------------+
|  ID                  |  AKIAIOSFODNN7EXAMPLE |
|  Secret              |  wJalrXUtnFEMI/K7MDENG/... (shown ONCE)  |
+----------------------------------------------+
# Copy the secret NOW into a password manager. AWS never shows it again —
# lose it and you must deactivate the key and create a replacement.`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>NEVER commit keys to git.</strong> Scanners harvest leaked AKIA keys within
            minutes and spin up mining fleets on your bill. No keys in code, chat logs, screenshots,
            or shell history files you sync. Rotate immediately (deactivate old, create new, update
            config) if a key ever touches a repo — and rotate every 90 days on principle.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Configure the CLI: what gets written and where</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The configure command is a small wizard that writes two plain-text files:
          <strong> ~/.aws/credentials</strong> (secrets — key pair per profile) and
          <strong> ~/.aws/config</strong> (settings — default region and output format per
          profile). Knowing these paths matters because every future debugging session starts here:
          wrong region, wrong output, or stale key almost always means one of these two files says
          something you forgot.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws configure
cat ~/.aws/credentials
cat ~/.aws/config`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: **************** (typed, hidden)
Default region name [None]: eu-central-1
Default output format [None]: json

[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

[default]
region = eu-central-1
output = json
# Secrets live in credentials, settings in config. Back up neither to git —
# ~/.aws/ belongs in your global gitignore and your dotfiles blacklist.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Set your real home region:</strong> the region you chose in lesson one (nearest
            to you or your users). Every command without an explicit region flag inherits this, so a
            wrong default quietly creates resources on the wrong continent.
          </li>
          <li>
            <strong>Prefer json output:</strong> it pairs with the query flag for precise extraction
            and is what SDKs and scripts parse. Switch to table or text per command when human
            eyes need the summary.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Profiles and environment variables: dev vs prod without tears</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          One key pair for everything is how production accidents happen. <strong>Named
          profiles</strong> keep separate credentials (and regions) for separate accounts or roles:
          a dev profile with broad sandbox rights, a prod profile you touch deliberately. Select a
          profile per command with the profile flag, or per shell session with the
          <strong> AWS_PROFILE</strong> variable — and make your prompt display it, because running
          a dev cleanup against prod is a rite of passage you want to skip.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws configure --profile dev
aws configure --profile prod
export AWS_PROFILE=dev
echo "active profile: $AWS_PROFILE"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`AWS Access Key ID [None]: AKIADEVEXAMPLEKEY1234
Default region name [None]: eu-central-1
AWS Access Key ID [None]: AKIAPRODEXAMPLEKEY5678
Default region name [None]: eu-central-1
active profile: dev
# Two profiles stored as [dev] and [prod] sections in ~/.aws/credentials.
# Every command in this shell now uses dev until you export a new value.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Explicit beats ambient:</strong> in scripts, pass the profile flag on every
            command rather than relying on the environment — future readers (and CI runners) should
            see which account each line targets.
          </li>
          <li>
            <strong>Prod gets friction on purpose:</strong> no default prod profile, short-lived
            credentials or MFA-gated roles (next lesson), and a shell prompt that shows the active
            profile in red. Convenience in prod is a liability.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Verify with three read-only commands</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Verification is a ritual: after any credential change, prove who you are, prove you can
          see the world, and prove storage access — all read-only, all safe. The identity call shows
          your ARN (which you will match against IAM in the next lesson), the regions call proves
          general API reach, and the S3 listing proves a second service authorizes you. If any of
          the three fails, the error text tells you exactly which layer (signature, network, or
          policy) to fix.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws sts get-caller-identity
aws ec2 describe-regions --query "Regions[].RegionName" --output text
aws s3 ls`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
    "UserId": "AIDAJKL1234567890ABCD",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/cli-readonly-you"
}
eu-central-1  eu-west-1  us-east-1  ap-south-1  ...
2026-09-01 12:00:00 my-first-bucket
# Identity resolves to your user, regions list streams back, S3 answers.
# "Unable to locate credentials" = config problem; "AccessDenied" =
# policy problem (IAM lesson); "could not connect" = network/proxy.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Console power tips and the CloudShell fallback</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The Console earns its keep for visual exploration: bookmark your five daily services in
          the nav bar, use the unified search (service names, docs, and Marketplace from one box),
          and lean on Resource Groups with tag filters when resources sprawl. And when your laptop
          is unavailable — borrowed machine, tablet, locked-down network — <strong>CloudShell</strong>
          gives you a pre-authenticated terminal with the CLI installed right inside the Console, no
          keys to paste anywhere.
        </p>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-zinc-700 dark:text-zinc-300">
            <strong>[FREE TIER]</strong> CloudShell is free: a 1 GB persistent home directory per
            region, CLI and common tooling preinstalled, credentials injected from your Console
            session. Ideal fallback for labs and incidents — just remember files persist per region,
            so keep scripts in git, not only in the shell.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws ec2 describe-instances --query "Reservations[].Instances[].[InstanceId,State.Name]" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`----------------------------------
|        DescribeInstances       |
+----------------+---------------+
|  i-0a1b2c3d4e  |  running      |
|  i-0f5e6d7c8b  |  stopped      |
+----------------+---------------+
# Same command works identically in CloudShell — paste it there to prove
# your fallback path works BEFORE the day you actually need it.`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses, CI credentials, and classic mistakes</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          In daily DevOps work the CLI is the glue: morning status scripts that list unhealthy
          instances, deploy scripts that sync a build folder to S3 and invalidate CloudFront, cron
          cleanups that snapshot-then-terminate old volumes, and one-liners piped through query
          filters during incidents. In CI the same commands run — but <strong>never with
          long-lived keys pasted into pipeline secrets</strong>. The professional pattern is
          <strong> OIDC federation</strong>: the pipeline proves its identity to AWS per run and
          receives minutes-lived credentials, so there is nothing to leak, rotate, or steal.
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Mistake — keys in CI secrets forever:</strong> a static key in pipeline
            variables works until it leaks in logs or a forked run exfiltrates it. Prefer the OIDC
            role pattern (full details in the IAM lesson&apos;s roles section).
          </li>
          <li>
            <strong>Mistake — scripting against default credentials:</strong> omitting the profile
            flag in shared scripts means the script does whatever the runner&apos;s ambient identity
            allows. Name the profile or role on every AWS call.
          </li>
          <li>
            <strong>Mistake — parsing human output:</strong> grepping table-formatted text breaks
            the day AWS rewords a column. Query for json in scripts, reserve table and text for
            your own eyes.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The identity behind those keys — users, policies, and roles — is the subject of{" "}
          <Link href="/aws-fundamentals/iam" className="underline underline-offset-4">
            IAM
          </Link>
          , up next.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab and hands-on practice (8 tasks)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab [FREE TIER]:</strong> configure the CLI with your read-only key pair and run
          the three verification commands end to end — identity, regions, S3 listing. Everything
          here is read-only API traffic: zero cost, zero risk, full proof your workstation is wired
          to AWS correctly.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws configure --profile lab
aws sts get-caller-identity --profile lab --query Arn --output text
aws ec2 describe-regions --profile lab --query "length(Regions)" --output text
aws s3 ls --profile lab`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
Default region name [None]: eu-central-1
arn:aws:iam::123456789012:user/cli-readonly-you
20
2026-09-01 12:00:00 my-first-bucket
# All three read-only calls succeed under the lab profile: identity, 20+
# regions visible, S3 reachable. Workstation certified for the module.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Install AWS CLI v2 for your OS and confirm the version string starts with 2.x.</li>
          <li>Create a dedicated IAM user for CLI access and attach ReadOnlyAccess before generating any keys.</li>
          <li>Generate one access key pair, store the secret in a password manager, and confirm it is shown only once.</li>
          <li>Run the configure wizard, then inspect both files it wrote and explain which holds secrets vs settings.</li>
          <li>Create separate dev and prod profiles with different regions and switch between them via the environment variable.</li>
          <li>Run the three verification commands (identity, regions, S3 listing) and diagnose any failure by layer.</li>
          <li>Open CloudShell, rerun one describe command there, and note what differs about authentication.</li>
          <li>Write a three-line script that lists stopped EC2 instances using query and json output, with an explicit profile flag.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
