export type Lesson = {
  slug: string;
  title: string;
};

export type Module = {
  slug: string;
  number: string;
  title: string;
  tagline: string;
  lessons: Lesson[];
};

export const modules: Module[] = [
  {
    slug: "prerequisites",
    number: "01",
    title: "Prerequisites",
    tagline: "Computer, networking, and Python basics for AWS DevOps",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "computer-basics", title: "Computer Basics" },
      { slug: "networking-basics", title: "Networking Basics" },
      { slug: "python-basics", title: "Python Basics" },
    ],
  },
  {
    slug: "linux-shell",
    number: "02",
    title: "Linux & Shell",
    tagline: "Terminal, files, users, and scripting for AWS",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "setup-terminal", title: "Setup: Distros, Terminal, WSL" },
      { slug: "filesystem-navigation", title: "Filesystem & Navigation" },
      { slug: "file-operations", title: "File Operations" },
      { slug: "viewing-editing-search", title: "Viewing, Editing & Searching" },
      { slug: "permissions-users", title: "Permissions & Users" },
      { slug: "packages-services", title: "Packages & Services" },
      { slug: "shell-scripting", title: "Shell Scripting Basics" },
      { slug: "cron-logs", title: "Cron, Logs & Troubleshooting" },
      { slug: "ssh-remote-tools", title: "SSH & Remote Tools" },
    ],
  },
  {
    slug: "git-github",
    number: "03",
    title: "Git & GitHub",
    tagline: "Version control and collaboration for DevOps workflows",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "setup-config", title: "Setup & Config" },
      { slug: "add-commit-push", title: "Add, Commit & Push" },
      { slug: "branching-merging", title: "Branching & Merging" },
      { slug: "remotes-clone-pull", title: "Remotes, Clone & Pull" },
      { slug: "pull-requests", title: "Pull Requests & Reviews" },
      { slug: "undo-fix", title: "Undo & Fix Mistakes" },
      { slug: "stash-rebase-gitignore", title: "Stash, Rebase & .gitignore" },
      { slug: "workflows-devops", title: "Git Workflows for DevOps" },
    ],
  },
  {
    slug: "aws-fundamentals",
    number: "04",
    title: "AWS Core Fundamentals",
    tagline: "Accounts, network, compute, storage, and observability on AWS",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "aws-cli", title: "AWS CLI & Console Setup" },
      { slug: "iam", title: "IAM" },
      { slug: "vpc", title: "VPC" },
      { slug: "ec2", title: "EC2 + EBS" },
      { slug: "elb-auto-scaling", title: "ELB + Auto Scaling" },
      { slug: "s3", title: "S3" },
      { slug: "cloudfront-acm", title: "CloudFront + ACM" },
      { slug: "route53", title: "Route53" },
      { slug: "databases", title: "RDS, DynamoDB & ElastiCache" },
      { slug: "lambda-basics", title: "Lambda + API Gateway Intro" },
      { slug: "cloudwatch-cloudtrail", title: "CloudWatch + CloudTrail" },
      { slug: "sns-sqs", title: "SNS, SQS & EventBridge" },
    ],
  },
  {
    slug: "iac-terraform",
    number: "05",
    title: "Infrastructure as Code",
    tagline: "Manage AWS with code using Terraform, from first resource to modules",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "terraform-setup", title: "Install & First Project" },
      { slug: "terraform-resources", title: "Resources, Providers & Data" },
      { slug: "terraform-state", title: "State & Remote Backends" },
      { slug: "terraform-variables", title: "Variables & Outputs" },
      { slug: "terraform-modules", title: "Modules & Project Structure" },
      { slug: "terraform-aws-lab", title: "AWS Mini-Project" },
      { slug: "cloudformation", title: "CloudFormation Essentials" },
      { slug: "cdk-ssm-secrets", title: "CDK, SSM & Secrets" },
    ],
  },
  {
    slug: "cicd",
    number: "06",
    title: "CI / CD on AWS",
    tagline: "Pipelines that build, test, and deploy every push",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "github-actions", title: "GitHub Actions Basics" },
      { slug: "aws-code-services", title: "CodePipeline + CodeBuild + CodeDeploy" },
      { slug: "ecr-build-push", title: "Build & Push to ECR" },
      { slug: "deployment-strategies", title: "Deployment Strategies" },
      { slug: "pipeline-lab", title: "Full Pipeline Lab" },
    ],
  },
  {
    slug: "containers",
    number: "07",
    title: "Containers & Orchestration",
    tagline: "Docker images to ECS and EKS on AWS",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "docker", title: "Docker" },
      { slug: "ecr", title: "ECR" },
      { slug: "ecs-fargate", title: "ECS + Fargate" },
      { slug: "eks-kubernetes", title: "EKS + Kubernetes" },
    ],
  },
  {
    slug: "automation",
    number: "08",
    title: "Configuration & Automation",
    tagline: "Configure servers and automate AWS with code",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "ansible", title: "Ansible" },
      { slug: "systems-manager", title: "Systems Manager" },
      { slug: "lambda-automation", title: "Lambda Automation" },
      { slug: "boto3", title: "Boto3" },
    ],
  },
  {
    slug: "monitoring",
    number: "09",
    title: "Monitoring & Reliability",
    tagline: "Metrics, logs, and SRE practices for production",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "metrics-dashboards", title: "Metrics, Alarms & Dashboards" },
      { slug: "centralized-logging", title: "Centralized Logging" },
      { slug: "prometheus-grafana", title: "Prometheus & Grafana" },
      { slug: "sre-practices", title: "SRE: SLOs, HA & DR" },
    ],
  },
  {
    slug: "security",
    number: "10",
    title: "Security (DevSecOps)",
    tagline: "Harden AWS and scan everything in the pipeline",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "identity-access", title: "Identity & Access Hardening" },
      { slug: "data-protection", title: "KMS, Secrets & Encryption" },
      { slug: "network-security", title: "WAF, Shield & Network Defense" },
      { slug: "detection-response", title: "GuardDuty, Inspector & Security Hub" },
      { slug: "devsecops-pipeline", title: "Security in the Pipeline" },
    ],
  },
  {
    slug: "projects",
    number: "11",
    title: "Practical Projects",
    tagline: "Four portfolio builds tying every module together",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "static-site", title: "Static Site on S3" },
      { slug: "two-tier-app", title: "Two-Tier App with Terraform" },
      { slug: "ecs-pipeline", title: "ECS App with Pipeline" },
      { slug: "serverless-api", title: "Serverless API" },
    ],
  },
  {
    slug: "certifications",
    number: "12",
    title: "Certifications & Path",
    tagline: "Certs and next steps after the fundamentals",
    lessons: [
      { slug: "overview", title: "Start Here" },
      { slug: "cloud-practitioner", title: "Cloud Practitioner" },
      { slug: "solutions-architect", title: "Solutions Architect Associate" },
      { slug: "developer-sysops", title: "Developer + SysOps Associate" },
      { slug: "devops-professional", title: "DevOps Engineer Professional" },
      { slug: "study-plan", title: "Study Plan & Interviews" },
    ],
  },
];

export function getModule(slug: string) {
  return modules.find((m) => m.slug === slug);
}
