import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Security (DevSecOps)"
      title="GuardDuty, Inspector & Security Hub"
      intro="Prevention eventually misses something — detection catches what slips through. GuardDuty watches for malicious behavior, Inspector scans hosts and images for known holes, and Security Hub aggregates everything against the CIS benchmark. This lesson wires all three and rehearses the incident runbook: isolate, snapshot, rotate."
      prev={{ href: "/security/network-security", label: "WAF, Shield & Network Defense" }}
      next={{ href: "/security/devsecops-pipeline", label: "Security in the Pipeline" }}
      resources={[
        {
          title: "GuardDuty user guide — AWS docs",
          url: "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guard-duty.html",
          description:
            "Finding types, free-trial terms, and how to generate sample findings for practice without real malware.",
        },
        {
          title: "Inspector user guide — AWS docs",
          url: "https://docs.aws.amazon.com/inspector/latest/userguide/inspector_introduction.html",
          description:
            "EC2 and ECR continuous scanning, severity scoring, and how findings flow into Security Hub.",
        },
        {
          title: "Security Hub user guide — AWS docs",
          url: "https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html",
          description:
            "Aggregation, CIS benchmark controls, and the finding workflow from new to resolved.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Service map + findings flow</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Three jobs, three services: GuardDuty asks <strong>&quot;is something
          acting evil?&quot;</strong> (threat detection), Inspector asks{" "}
          <strong>&quot;is something known-vulnerable?&quot;</strong>{" "}
          (CVE scanning), Security Hub asks{" "}
          <strong>&quot;what is our overall posture?&quot;</strong>{" "}
          (aggregation + compliance). Findings flow inward to one queue.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`DETECTION MAP
 CloudTrail + VPC Flow + DNS logs              ECR images + EC2 (SSM agent)
        |                                              |
        v                                              v
 +-------------+  findings   +----------------+  CVEs  +----------------+
 |  GuardDuty  | ----------> | Security Hub   | <------ |   Inspector    |
 | behavior /  |  severity   | aggregate +    |        | scan packages  |
 | threat intel|  High/Med   | CIS benchmark  |        | + code (Lambda)|
 +------+------+             +-------+--------+        +--------+-------+
        |                            |                           |
        v                            v                           v
 EventBridge -> SNS -> you   prioritize -> assign -> remediate -> resolve
 (auto-notify on High)       (runbook: isolate -> snapshot -> rotate)`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DevOps use:</strong> High-severity findings page via
            EventBridge → SNS → PagerDuty/Slack; Medium/Low become sprint
            tickets with the CIS control ID attached.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">GuardDuty: enable + sample findings</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          GuardDuty is one enable call per region — no agents, no rules to
          write. It learns your baseline from logs, then flags crypto-mining,
          Tor, port-probing, and leaked-credential use. Practice on sample
          findings, never real malware.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws guardduty create-detector --enable --finding-publishing-frequency FIFTEEN_MINUTES --query DetectorId --output text
aws guardduty list-detectors --query 'DetectorIds' --output table
# SAMPLE findings for practice (safe, synthetic — generates ~12 finding types)
aws guardduty create-sample-findings --detector-id <detector-id> --finding-types '["UnauthorizedAccess:EC2/SSHBruteForce","CryptoCurrency:EC2/BitcoinTool.B!DNS","Exfiltration:S3/MaliciousIPCaller"]'
aws guardduty list-findings --detector-id <detector-id> --query 'FindingIds' --output table
aws guardduty get-findings --detector-id <detector-id> --finding-ids <id-1> --query 'Findings[*].[Type,Severity,Description]' --output table
# Cleanup: delete samples when done practicing
aws guardduty delete-detector --detector-id <detector-id>   # run AFTER the lab teardown step`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Detector ab12cd34... ENABLED, publish every 15 min
FindingIds: 3 samples created
| UnauthorizedAccess:EC2/SSHBruteForce | 5 (Medium) | brute-force SSH against i-0abc |
| CryptoCurrency:EC2/BitcoinTool.B!DNS | 8 (High)   | EC2 querying known mining pool  |
| Exfiltration:S3/MaliciousIPCaller    | 8 (High)   | S3 API from known-malicious IP  |
# Triage: High first (mining + exfiltration), SSH brute-force -> check SG + fail2ban`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">[FREE 30-day trial, then PAID] Disable GuardDuty after the lab</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            New accounts get a 30-day GuardDuty trial; afterwards it bills per
            GB of logs analyzed plus per finding source. Enable it, practice
            the sample findings, wire the EventBridge → SNS alert, then run
            delete-detector (or suspend) the same day unless your team budget
            owns it.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Inspector: EC2 + ECR scans</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Inspector continuously matches installed packages and image layers
          against CVE databases and scores them. EC2 needs the SSM agent;
          ECR scanning flips on per registry. Fix by patching the base image,
          not by hand-editing running hosts.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws inspector2 enable --account-ids 123456789012 --resource-types EC2 ECR --query 'accounts[*]' --output table
aws inspector2 list-findings --filter-criteria '{"severityCodes":[{"comparison":"EQUALS","value":"HIGH"}]}' --query 'findings[*].[title,severity,resources]' --output table
aws inspector2 list-coverage --resource-type ECR_REPOSITORY --query 'coveredResources[*].[repositoryName,scanStatus]' --output table
# ECR enhanced scanning (per-image CVE report on push)
aws ecr put-registry-scanning-configuration --scan-type ENHANCED --rules '[{"scanFrequency":"SCAN_ON_PUSH","repositoryFilters":[{"filter":"shop-*","filterType":"WILDCARD"}]}]'
aws ecr describe-image-scan-findings --repository-name shop-web --image-id imageTag=abc1234 --query 'imageScanFindings.[imageScanStatus,findingSeverityCounts]' --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Inspector: EC2 + ECR ENABLED for 123456789012
| CVE-2024-1234 openssl 3.0.11 -> 3.0.13 | HIGH | i-0abc (prod-web) |
| CVE-2024-5678 libcurl XSS             | HIGH | shop-web:abc1234 (ECR) |
Coverage: shop-web SCAN_ACTIVE | shop-api SCAN_ACTIVE
ECR scan shop-web:abc1234 -> COMPLETE, HIGH:2 MEDIUM:5 LOW:11
# Fix: bump base image (FROM python:3.11-slim -> latest patch), rebuild, repush, redeploy`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>DevOps use:</strong> block deploys on HIGH CVE counts
            (pipeline gate in Lesson 6); patch Tuesday = rebuild base images,
            rescan, promote.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Security Hub: aggregation + CIS benchmark</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Security Hub deduplicates GuardDuty + Inspector (+ WAF, IAM Access
          Analyzer, Config) findings into one prioritized view and scores you
          against the <strong>CIS AWS Foundations Benchmark</strong> (MFA,
          encryption, logging, networking controls). Work the failed controls
          top-down.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws securityhub enable-security-hub --enable-default-standards --query 'HubArn' --output text
aws securityhub batch-enable-standards --standards-subscription-requests '[{"StandardsArn":"arn:aws:securityhub:us-east-1::standards/cis-aws-foundations-benchmark/v/1.4.0"}]'
aws securityhub get-findings --filters '{"RecordState":[{"Value":"ACTIVE","Comparison":"EQUALS"}],"SeverityLabel":[{"Value":"HIGH","Comparison":"EQUALS"}]}' --query 'Findings[*].[Title,SeverityLabel,WorkflowState]' --output table
aws securityhub describe-standards-controls --standards-subscription-arn <cis-sub-arn> --query 'Controls[?ControlStatus==FAILED].[ControlId,Title]' --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Hub arn:aws:securityhub:us-east-1:123456789012:hub/default ENABLED
CIS v1.4.0 subscribed
| S3 bucket allows public read (Inspector/Hub) | HIGH | NEW -> fix bucket policy |
| IAM user without MFA                         | HIGH | NEW -> enforce MFA (Lesson 2) |
FAILED controls: CIS 1.4 (no MFA on root?) | CIS 2.1.1 (S3 Block Public Access off) | CIS 4.x (CloudTrail gaps)
# Workflow: NEW -> NOTIFIED (ticket) -> SUPPRESSED (false positive w/ note) -> RESOLVED (fix verified)`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Incident runbook: isolate → snapshot → rotate</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          When a High finding fires, do not SSH in and poke around — you
          destroy evidence. Run the same four steps every time, in order, and
          log each command for the retro.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# 1. ISOLATE: quarantine SG (no ingress/egress) + stop without terminate
aws ec2 create-security-group --group-id sg-quarantine --group-name quarantine --description 'no traffic' --vpc-id vpc-123
aws ec2 modify-instance-attribute --instance-id i-0abc --groups sg-quarantine
# 2. SNAPSHOT: preserve EBS + memory context before remediation
aws ec2 create-snapshots --instance-specification InstanceId=i-0abc --description 'forensics-2026-09-05' --query 'Snapshots[*].SnapshotId'
aws logs create-export-task --log-group-name /aws/ec2/i-0abc --from 1725400000000 --to 1725486400000 --destination shop-forensics --destination-prefix i-0abc
# 3. ROTATE: every credential that host could read
aws iam update-access-key --user-name app --access-key-id AKIAEXPOSED --status Inactive
aws secretsmanager rotate-secret --secret-id shop/prod/db
# 4. RECOVER: rebuild from known-good AMI/image, re-scan, close finding
aws securityhub batch-update-findings --finding-identifiers '[{"Id":"<finding-id>","ProductArn":"arn:aws:securityhub:us-east-1::product/aws/securityhub"}]' --workflow '{"Status":"RESOLVED"}' --note '{"Text":"rebuilt from ami-0good, rescanned clean"}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Isolate: i-0abc now in sg-quarantine (0 ingress, 0 egress) — blast radius frozen
Snapshots: snap-0abc (EBS) + logs exported to s3://shop-forensics/i-0abc
Rotate: AKIAEXPOSED Inactive+deleted; shop/prod/db rotated, app re-fetched OK
Recover: instance replaced from ami-0good, Inspector rescan 0 HIGH, finding RESOLVED`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">Danger: what NOT to do in an incident</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-red-700 dark:text-red-300">
            <li>Do not terminate the instance before snapshotting — you delete the evidence.</li>
            <li>Do not reuse passwords/keys that the compromised host could read — rotate all of them.</li>
            <li>Do not mark findings RESOLVED without a clean rescan — hope is not remediation.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lab A–Z: detect + respond [FREE trial, then disable]</h2>
        <ol className="mt-2 list-decimal pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>A. Hub first:</strong> enable Security Hub + CIS standard; note your starting failed-control count.</li>
          <li><strong>B. GuardDuty:</strong> create-detector with 15-min publishing; confirm ACTIVE.</li>
          <li><strong>C. Samples:</strong> create-sample-findings (3 types); list + get one finding end to end.</li>
          <li><strong>D. Alert path:</strong> EventBridge rule on High findings → SNS topic → your email; confirm delivery.</li>
          <li><strong>E. Inspector:</strong> enable EC2 + ECR; set ECR SCAN_ON_PUSH for shop-* repos.</li>
          <li><strong>F. Scan:</strong> push a lab image; read describe-image-scan-findings severity counts.</li>
          <li><strong>G. Aggregate:</strong> confirm GuardDuty + Inspector findings appear in Security Hub as ACTIVE.</li>
          <li><strong>H. CIS fix:</strong> remediate ONE failed CIS control (e.g., S3 Block Public Access) and watch it flip.</li>
          <li><strong>I. Runbook dry-run:</strong> on a disposable t3.micro: quarantine SG → snapshot → rotate a dummy secret.</li>
          <li><strong>J. Resolve:</strong> batch-update-findings to RESOLVED with a note; verify workflow state.</li>
          <li><strong>K. Teardown:</strong> delete-detector (GuardDuty), disable Inspector, terminate lab instance + snapshots.</li>
          <li><strong>Z. Verify checkpoints:</strong> Hub shows the drill findings RESOLVED; GuardDuty detector deleted; no lab instances or snapshots remain; SNS alert received at least once.</li>
        </ol>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">[FREE during trial] Same-day teardown required</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            GuardDuty&apos;s 30-day trial and Inspector&apos;s trial cover this
            lab if you finish and disable the same day. Leave them on past the
            trial and log-volume billing starts silently — the teardown step is
            graded, not optional.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How DevOps teams actually use this</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>Findings as code:</strong> EventBridge rules route severity → channel (High pages, Medium tickets, Low digests).</li>
          <li><strong>CIS as sprint input:</strong> failed controls become tickets with control IDs; posture score trends on the team dashboard.</li>
          <li><strong>Game days:</strong> quarterly sample-finding drills time the isolate → snapshot → rotate runbook.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li><strong>Enabling detectors with no alert path:</strong> findings nobody reads are decoration. SNS first, detector second.</li>
          <li><strong>Suppressing without a note:</strong> future-you cannot tell false positive from laziness. Always document.</li>
          <li><strong>Patching running hosts by hand:</strong> drift returns. Fix the image/Dockerfile/AMI and redeploy.</li>
          <li><strong>Skipping teardown:</strong> trial billing starts quietly. Delete detectors and lab resources same day.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice (8 tasks)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Diagram the GuardDuty → Security Hub ← Inspector flow with one example finding each.</li>
          <li>Enable GuardDuty, generate 3 sample findings, and read one fully (type, severity, resource).</li>
          <li>Wire a High-severity EventBridge → SNS alert and prove delivery.</li>
          <li>Enable Inspector ECR scanning and interpret one image scan severity count.</li>
          <li>Fix one failed CIS control and watch Security Hub flip it.</li>
          <li>Dry-run isolate → snapshot → rotate on a disposable instance, timed.</li>
          <li>Resolve a sample finding with a proper note and clean rescan.</li>
          <li>Teardown detectors + lab resources; verify list-detectors returns empty.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
