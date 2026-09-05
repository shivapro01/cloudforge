import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Infrastructure as Code"
      title="CloudFormation Essentials"
      intro="CloudFormation is AWS's native infrastructure-as-code engine: you declare stacks in YAML/JSON, AWS executes them with rollbacks, change sets, and drift detection built in. This lesson teaches template anatomy, full-stack deploys, parameters, cross-stack references, and how to read CloudFormation fluently in DevOps jobs — even if you deploy with Terraform day to day."
      prev={{ href: "/iac-terraform/terraform-aws-lab", label: "AWS Capstone Lab" }}
      next={{ href: "/iac-terraform/cdk-ssm-secrets", label: "CDK, SSM & Secrets" }}
      resources={[
        {
          title: "AWS CloudFormation Documentation",
          url: "https://docs.aws.amazon.com/",
          description:
            "Official reference for template anatomy, stack operations, change sets, drift detection, and intrinsic functions.",
        },
        {
          title: "AWS Skill Builder",
          url: "https://skillbuilder.aws/",
          description:
            "Free hands-on CloudFormation and SAM labs — deploy the S3-stack pattern from this lesson in a sandbox.",
        },
        {
          title: "DevOps Roadmap",
          url: "https://roadmap.sh/",
          description:
            "See where CloudFormation, SAM, and CDK sit in the AWS/DevOps progression beyond Terraform.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. What CloudFormation is (and how it differs from Terraform)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          CloudFormation (CFN) is <strong>AWS-native IaC</strong>: you submit a template, AWS
          builds a <strong>stack</strong> — a single unit of deployment with create, update,
          rollback, and delete managed server-side. There is no state file to guard; AWS owns
          the state. A <strong>change set</strong> previews an update before it executes, the
          equivalent of <code>terraform plan</code> with an approval gate built in.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`TERRAFORM FLOW:                      CLOUDFORMATION FLOW:
  main.tf  ->  terraform plan  ->        template.yaml  ->  create-change-set  ->
  YOU review  ->  terraform apply  ->      YOU review change set  ->  execute-change-set  ->
  state file in S3 (YOU guard it)         AWS builds stack (AWS guards state)
                                          failure -> AUTOMATIC ROLLBACK to last good state
                                          delete-stack -> removes EVERYTHING in the stack`}
          />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-semibold">Dimension</th>
                <th className="py-2 pr-4 font-semibold">Terraform</th>
                <th className="py-2 font-semibold">CloudFormation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Scope</td>
                <td className="py-2 pr-4">Multi-cloud, provider plugins</td>
                <td className="py-2">AWS only, deepest AWS coverage</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">State</td>
                <td className="py-2 pr-4">S3 backend file you manage + lock</td>
                <td className="py-2">Managed by AWS per stack</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Preview</td>
                <td className="py-2 pr-4">terraform plan</td>
                <td className="py-2">Change sets (review then execute)</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Failure mode</td>
                <td className="py-2 pr-4">Partial apply possible; you fix forward</td>
                <td className="py-2">Automatic rollback to last stable stack</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Language</td>
                <td className="py-2 pr-4">HCL with modules, functions, workspaces</td>
                <td className="py-2">YAML/JSON with Parameters, Mappings, Conditions</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> most AWS shops use both — Terraform for platform
          foundations, CloudFormation (often generated by SAM or CDK) for serverless and
          service teams. Job postings that say &quot;read CFN templates&quot; mean exactly
          this lesson.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. Anatomy of a template: Version, Resources, Parameters, Outputs</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — learn the four blocks.</strong>{" "}
          <code>AWSTemplateFormatVersion</code> pins the language version,{" "}
          <code>Parameters</code> are caller inputs (like Terraform variables),{" "}
          <code>Resources</code> are the only required block (what AWS builds), and{" "}
          <code>Outputs</code> expose values with optional cross-stack <code>Export</code>.
          Intrinsic functions (<code>Ref</code>, <code>Sub</code>, <code>GetAtt</code>) wire
          blocks together:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="template.yaml"
            code={`AWSTemplateFormatVersion: "2010-09-09"
Description: "CFN lab: S3 bucket with locked-down policy."

Parameters:
  BucketName:
    Type: String
    Description: "Globally unique bucket name."
  EnvName:
    Type: String
    Default: dev
    AllowedValues: [dev, prod]

Resources:
  AppBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref BucketName
      VersioningConfiguration:
        Status: Enabled
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      Tags:
        - Key: Env
          Value: !Ref EnvName

  BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref AppBucket
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: DenyUnencryptedUploads
            Effect: Deny
            Principal: "*"
            Action: s3:PutObject
            Resource: !Sub "arn:aws:s3:::$\{BucketName\}/*"
            Condition:
              StringNotEquals:
                s3:x-amz-server-side-encryption: AES256

Outputs:
  BucketArn:
    Description: "ARN for app wiring."
    Value: !GetAtt AppBucket.Arn
    Export:
      Name: !Sub "$\{AWS::StackName\}-BucketArn"`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Three functions carry 90% of templates: <code>Ref</code> returns a parameter or
          resource ID, <code>Sub</code> interpolates strings (note <code>{"${...}"}</code>{" "}
          escaping inside YAML), <code>GetAtt</code> reads a resource attribute like an ARN.
          Master these and any template becomes readable.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. Deploy A–Z: validate, create, describe, delete</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — validate the template.</strong> Catches YAML errors and bad
          property names before AWS builds anything:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws cloudformation validate-template --template-body file://template.yaml`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "Parameters": [
    { "ParameterKey": "BucketName", "NoEcho": false },
    { "ParameterKey": "EnvName", "DefaultValue": "dev", "NoEcho": false }
  ],
  "Description": "CFN lab: S3 bucket with locked-down policy."
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step B — create the stack.</strong> Pass parameters on the CLI; capabilities
          flags are only needed for IAM resources (not this S3 lab):
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws cloudformation create-stack --stack-name cfn-lab-s3 --template-body file://template.yaml --parameters ParameterKey=BucketName,ParameterValue=cfn-lab-bucket-123456 ParameterKey=EnvName,ParameterValue=dev
aws cloudformation wait stack-create-complete --stack-name cfn-lab-s3
aws cloudformation describe-stacks --stack-name cfn-lab-s3 --query "Stacks[0].{Status:StackStatus,Outputs:Outputs}"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "StackId": "arn:aws:cloudformation:us-east-1:123456789012:stack/cfn-lab-s3/abc123"
}
{
  "Status": "CREATE_COMPLETE",
  "Outputs": [
    { "OutputKey": "BucketArn", "OutputValue": "arn:aws:s3:::cfn-lab-bucket-123456" }
  ]
}`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step C — console check, then clean up.</strong> Open CloudFormation →
          Stacks → <code>cfn-lab-s3</code>: Status <code>CREATE_COMPLETE</code>, Resources
          tab lists bucket + policy. Then delete — S3-only stacks delete cleanly (versioned
          buckets must be emptied first):
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws s3 rm s3://cfn-lab-bucket-123456 --recursive
aws cloudformation delete-stack --stack-name cfn-lab-s3
aws cloudformation wait stack-delete-complete --stack-name cfn-lab-s3
aws cloudformation describe-stacks --query "Stacks[?StackName=='cfn-lab-s3'].StackStatus"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`delete: s3://cfn-lab-bucket-123456/terraform.tfstate
[]
# empty list = stack fully gone`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            FREE TIER — this lab is S3-only on purpose
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            S3 requests and a few GB of storage sit inside the free tier. Empty the bucket
            before delete-stack or deletion stalls on a non-empty bucket.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            PAID — EC2-port examples bill
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            Porting this pattern to EC2 instances, NAT gateways, or RDS (common in CFN
            tutorials) starts hourly billing. Keep the CFN lab S3-only; do EC2 work in the
            Terraform capstone where destroy drills are already covered.
          </p>
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. Parameters, Mappings, and Conditions: env-aware templates</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step A — one template, dev and prod shapes.</strong>{" "}
          <code>Parameters</code> take the environment, <code>Mappings</code> look up
          per-env values (like a Terraform map variable), <code>Conditions</code> toggle
          resources. This EC2-size snippet is the pattern every team reuses:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="template.yaml"
            code={`Parameters:
  EnvName:
    Type: String
    Default: dev
    AllowedValues: [dev, prod]

Mappings:
  EnvToInstanceType:
    dev:
      Type: t3.micro
    prod:
      Type: t3.small

Conditions:
  IsProd: !Equals [!Ref EnvName, prod]

Resources:
  WebServer:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !FindInMap [EnvToInstanceType, !Ref EnvName, Type]
      ImageId: ami-0c101f26f147fa7fd  # example only — use SSM lookup below in real stacks
      Tags:
        - Key: Env
          Value: !Ref EnvName

  ProdAlarm:
    Type: AWS::CloudWatch::Alarm
    Condition: IsProd   # only created in prod stacks
    Properties:
      ComparisonOperator: GreaterThanThreshold
      EvaluationPeriods: 1
      MetricName: CPUUtilization
      Namespace: AWS/EC2
      Period: 300
      Statistic: Average
      Threshold: 80
      AlarmActions: [!Ref AlarmTopic]`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Verify checkpoint:</strong> deploy twice with different{" "}
          <code>EnvName</code> values and confirm dev gets <code>t3.micro</code> with no
          alarm while prod gets <code>t3.small</code> plus the alarm. Reading{" "}
          <code>FindInMap</code> + <code>Equals</code> + <code>Condition</code> is the
          interview skill here, not memorization.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Outputs, Exports, and cross-stack references</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Stacks share values through <strong>Exports</strong>: stack A exports a VPC ID,
          stack B imports it with <code>Fn::ImportValue</code>. This is CloudFormation&apos;s
          answer to Terraform&apos;s remote-state data source — with one sharp edge: an
          export cannot be changed or deleted while any stack imports it.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="network-stack.yaml"
            code={`Outputs:
  VpcId:
    Value: !Ref LabVpc
    Export:
      Name: lab-shared-VpcId   # global namespace: keep names stack-scoped`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="app-stack.yaml"
            code={`Resources:
  AppSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !ImportValue lab-shared-VpcId
      CidrBlock: 10.0.5.0/24`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws cloudformation list-exports --query "Exports[?Name=='lab-shared-VpcId']"
aws cloudformation create-change-set --stack-name app --change-set-name add-subnet --template-body file://app-stack.yaml --parameters ParameterKey=EnvName,ParameterValue=dev`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Prefer <strong>nested stacks</strong> (a parent stack composing child templates)
          for tightly coupled layers, and exports only for stable shared foundations (VPC
          IDs, hosted zones) that rarely change.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. Drift detection: when the console and the template disagree</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Anyone with console access can edit a bucket policy by hand.{" "}
          <strong>Drift detection</strong> compares live resources against the template and
          reports what diverged — the CFN equivalent of noticing{" "}
          <code>terraform plan</code> wants changes nobody committed:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`aws cloudformation detect-stack-drift --stack-name cfn-lab-s3
aws cloudformation describe-stack-drift-detection-status --stack-drift-detection-id <id-from-above>
aws cloudformation describe-stack-resource-drifts --stack-name cfn-lab-s3 --query "StackResourceDrifts[?StackResourceDriftStatus!='IN_SYNC']"`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`{
  "StackDriftDetectionId": "abc-drift-123"
}
{
  "DetectionStatus": "DETECTION_COMPLETE",
  "StackDriftStatus": "DRIFTED"
}
[
  {
    "LogicalResourceId": "BucketPolicy",
    "ResourceType": "AWS::S3::BucketPolicy",
    "StackResourceDriftStatus": "MODIFIED",
    "PropertyDifferences": [
      { "PropertyPath": "/PolicyDocument/Statement/0/Effect", "ExpectedValue": "Deny", "ActualValue": "Allow" }
    ]
  }
]`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> run drift detection on schedule for compliance
          stacks; a <code>DRIFTED</code> security-group or policy stack is an incident, not
          trivia. Fix by re-applying the template (console edits get overwritten) and
          removing the human&apos;s write access.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. Reading CloudFormation in DevOps jobs: SAM, CDK, and nested stacks</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You will rarely hand-write large CFN templates — you will <strong>read</strong>{" "}
          what tools generate. SAM (serverless) and CDK (general AWS) both synthesize to
          CloudFormation; <code>cdk synth</code> literally prints the template. Nested
          stacks split thousand-line templates into reviewable children:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`YOU WRITE                    TOOL SYNTHESIZES              AWS EXECUTES
  SAM template.yaml  ----sam build/deploy-->  CFN stack (Lambda + API + IAM)
  CDK app.ts         ----cdk synth --------->  CFN template  ----cdk deploy-->  CFN stack
  parent.yaml        ----AWS::CloudFormation::Stack-->  child network.yaml
                                                        child app.yaml
  YOUR JOB: read the Resources + Outputs of generated templates, review change
  sets, and trace failures in the stack Events tab (first FAILED resource = root cause).`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use:</strong> failed deploys surface as stack events like{" "}
          <code>CREATE_FAILED — BucketAlreadyExists</code>. Read bottom-up: the first
          failure explains everything above it. Rollback behavior means a bad deploy
          self-heals to the last good stack — then you fix the template and redeploy.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>&quot;No rollback on failure&quot; confusion:</strong> disabling rollback
            leaves half-built resources for debugging — great in a lab, dangerous as a
            default. Beginners toggle it off once and forget; prod stacks should roll back
            automatically.
          </li>
          <li>
            <strong>Hardcoded names (bucket, export, stack):</strong> a fixed bucket name
            deploys once and fails everywhere else. Parameterize names and scope exports
            per stack (<code>stackname-BucketArn</code>).
          </li>
          <li>
            <strong>Update-requires-replacement surprise:</strong> some property changes
            (like AZ or bucket name) replace the resource — CFN deletes and recreates it.
            Always review the change set&apos;s <code>Replacement: True</code> flags before
            executing against stateful resources.
          </li>
          <li>
            <strong>Deleting the stack but not the bill:</strong> S3 versioned buckets and
            retained resources (<code>DeletionPolicy: Retain</code>) survive delete-stack.
            Empty buckets first and audit retained resources.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Validate template.yaml, create the S3 stack, and capture describe-stacks showing CREATE_COMPLETE plus the BucketArn output.</li>
          <li>Find the stack in the console; map each template Resource to its row in the Resources tab.</li>
          <li>Add the EnvName parameter + Mappings + IsProd condition; deploy dev and prod stacks and compare instance types.</li>
          <li>Create a change set for a policy edit, review its diff, then execute it — record the before/after.</li>
          <li>Export BucketArn from stack A and ImportValue it in stack B; try deleting stack A and explain the error.</li>
          <li>Edit the bucket policy by hand in the console, run drift detection, and paste the MODIFIED diff.</li>
          <li>Trigger a deliberate failure (duplicate bucket name), read the Events tab bottom-up, and watch automatic rollback.</li>
          <li>Empty the bucket, delete every lab stack, and verify list-exports and the console show zero remains.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
