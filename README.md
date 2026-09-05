# CloudForge — AWS DevOps Academy

<div align="center">

**From zero to AWS DevOps pro — a complete, hands-on learning platform I built for beginners.**

12 modules · 90+ lessons · 4 portfolio projects · Free Tier-safe labs throughout

</div>

---

## What is this?

CloudForge is a learning platform I put together to take a complete beginner all the way to a job-ready AWS DevOps engineer. Instead of scattered tutorials, everything lives in one structured path: Linux, Git, AWS fundamentals, Terraform, CI/CD, containers, automation, monitoring, security — then four portfolio projects and a certification roadmap.

Every lesson follows the same formula I wish I'd had when starting out:

- **Concepts explained simply** — no assumed knowledge, beginners first
- **Commands with real sample outputs** — so you always know what "correct" looks like
- **Architecture diagrams** — ASCII visuals for VPCs, pipelines, state flows, and more
- **A–Z labs with verify checkpoints** — step-by-step, with a way to confirm each step worked
- **Cost callouts on every lab** — green `FREE TIER` boxes and red `PAID` warnings with teardown commands, so you never get a surprise bill
- **Curated free resources** — official docs and trusted free courses only
- **Hands-on tasks** — 6–8 exercises per lesson to lock the skill in

## Curriculum

| # | Module | Lessons | What you will learn |
|---|--------|---------|---------------------|
| 01 | Prerequisites | 4 | Computer, networking, and Python basics |
| 02 | Linux & Shell | 10 | Terminal, files, users, scripting, cron, SSH |
| 03 | Git & GitHub | 9 | Commits, branching, PRs, rebase, workflows |
| 04 | AWS Core Fundamentals | 13 | IAM, VPC, EC2, S3, CloudFront, RDS, Lambda, observability, messaging |
| 05 | Infrastructure as Code | 9 | Terraform end-to-end, CloudFormation, CDK, SSM/Secrets |
| 06 | CI / CD on AWS | 6 | GitHub Actions, CodePipeline, ECR, deployment strategies, full pipeline lab |
| 07 | Containers & Orchestration | 5 | Docker, ECR, ECS + Fargate, EKS + Kubernetes |
| 08 | Configuration & Automation | 5 | Ansible, Systems Manager, Lambda automation, Boto3 |
| 09 | Monitoring & Reliability | 5 | Metrics, logging, Prometheus/Grafana, SRE practices |
| 10 | Security (DevSecOps) | 6 | Hardening, KMS/secrets, WAF, detection, pipeline scanning |
| 11 | Practical Projects | 5 | Static site, two-tier app, ECS pipeline, serverless API |
| 12 | Certifications & Path | 6 | Practitioner → Architect → Developer/SysOps → DevOps Pro + interviews |

## Tech stack

- **Next.js 16** (App Router, static export-friendly pages)
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling, dark-mode aware
- **lucide-react** for icons
- **CSS keyframe animations** — hero entrances, floating blobs, terminal typing effect, tool marquee, scroll reveals via `IntersectionObserver` (with `prefers-reduced-motion` support)
- **Single-source curriculum** — all navigation, sidebars, and cards render from `src/data/curriculum.ts`, so adding a lesson updates the whole site

## Project structure

```
src/
├── app/
│   ├── page.tsx                 # Animated CloudForge landing page
│   ├── layout.tsx               # Root layout + metadata
│   ├── globals.css              # Tailwind + custom keyframes
│   ├── prerequisites/           # Module 01 …
│   ├── linux-shell/             # Module 02 …
│   ├── git-github/              # Module 03 …
│   ├── aws-fundamentals/        # Module 04 …
│   ├── iac-terraform/           # Module 05 …
│   ├── cicd/                    # Module 06 …
│   ├── containers/              # Module 07 …
│   ├── automation/              # Module 08 …
│   ├── monitoring/              # Module 09 …
│   ├── security/                # Module 10 …
│   ├── projects/               # Module 11 …
│   └── certifications/          # Module 12 …
├── components/
│   ├── Navbar.tsx               # Brand + top navigation
│   ├── Sidebar.tsx              # Contextual sidebar (expands active module's lessons)
│   ├── Shell.tsx                # Full-width landing on /, sidebar on lesson pages
│   ├── LessonLayout.tsx         # Shared lesson template (content + free resources + prev/next)
│   ├── CodeBlock.tsx            # Terminal / code display
│   ├── TopicPlaceholder.tsx     # (legacy) placeholder card
│   ├── ModuleCard.tsx           # Module grid card
│   ├── Reveal.tsx               # Scroll-reveal wrapper
│   └── Footer.tsx
└── data/
    └── curriculum.ts            # The 12 modules + lessons (edit here to extend the site)
```

### Key design decisions

- **Contextual sidebar** — the left nav only expands the lessons of the module you are currently in, so it stays focused instead of dumping 90+ links.
- **Shared lesson template** — `LessonLayout` gives every lesson the same shape: breadcrumb, intro, sections, free-resources box, and prev/next navigation chained across the whole path.
- **Full-width landing** — `Shell` hides the docs sidebar on `/` for a marketing-style hero, and shows it everywhere else.

## Getting started

Prerequisites: **Node.js 18+** and npm.

```bash
# install dependencies
npm install

# run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page is at `/`, and every module lives at its slug (e.g. `/linux-shell`, `/aws-fundamentals/vpc`).

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Production build (all 96 routes pre-rendered as static content) |
| `npm start` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Deployment

This is a standard Next.js app, so it deploys anywhere Next.js runs. The easiest path:

1. Push the repo to GitHub
2. Import it into [Vercel](https://vercel.com/new) (or any Node host / Docker + ECS setup from Module 07)
3. `npm run build` runs automatically — no environment variables required

## Roadmap

- [ ] Progress tracking with localStorage (mark lessons complete)
- [ ] Search across all lessons
- [ ] Copy buttons on code blocks
- [ ] Quizzes at the end of each module
- [ ] Light/dark theme toggle (currently follows system preference)

## A note on AWS labs

Labs that touch AWS are written Free Tier-first, and anything billable is flagged with a red **PAID** box plus exact teardown commands. As a rule: create a billing alarm before Module 04, and destroy lab resources the same session.
