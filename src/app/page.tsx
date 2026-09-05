import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Boxes,
  CheckCircle2,
  Cloud,
  Compass,
  Container,
  FlaskConical,
  GitBranch,
  Network,
  PiggyBank,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
} from "lucide-react";
import { modules, getModule } from "@/data/curriculum";
import Reveal from "@/components/Reveal";

const moduleIcons: Record<string, React.ReactNode> = {
  prerequisites: <Compass className="h-5 w-5" />,
  "linux-shell": <Terminal className="h-5 w-5" />,
  "git-github": <GitBranch className="h-5 w-5" />,
  "aws-fundamentals": <Cloud className="h-5 w-5" />,
  "iac-terraform": <Boxes className="h-5 w-5" />,
  cicd: <Workflow className="h-5 w-5" />,
  containers: <Container className="h-5 w-5" />,
  automation: <Bot className="h-5 w-5" />,
  monitoring: <Activity className="h-5 w-5" />,
  security: <ShieldCheck className="h-5 w-5" />,
  projects: <Rocket className="h-5 w-5" />,
  certifications: <Award className="h-5 w-5" />,
};

const stack = [
  "Linux & Shell",
  "Git & GitHub",
  "AWS",
  "Terraform",
  "Docker",
  "Kubernetes",
  "CI / CD",
  "Python",
  "Monitoring",
  "Security",
];

const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);

const termLines = [
  { prompt: "$", text: "terraform init && terraform apply", cls: "text-zinc-100" },
  { prompt: "", text: "Apply complete! Resources: 12 added.", cls: "text-emerald-400" },
  { prompt: "$", text: "docker build -t forge/app:1.0 .", cls: "text-zinc-100" },
  { prompt: "", text: "naming to registry… push complete.", cls: "text-emerald-400" },
  { prompt: "$", text: "gh workflow run deploy.yml", cls: "text-zinc-100" },
  { prompt: "", text: "Pipeline green — deployed in 2m 41s", cls: "text-amber-300" },
  { prompt: "$", text: "aws sts get-caller-identity", cls: "text-zinc-100" },
];

export default function Home() {
  const projects = getModule("projects")!;
  const projectLessons = projects.lessons.filter((l) => l.slug !== "overview");

  return (
    <div className="-mx-4 -my-6">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="forge-float-slow absolute -top-24 -left-24 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/10" />
          <div className="forge-float absolute top-10 right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-400/10" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-16 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
          <div>
            <p className="forge-anim-rise inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              Beginner to pro · {modules.length} modules · {totalLessons}+ lessons
            </p>
            <h1 className="forge-anim-rise forge-delay-1 mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Forge your
              <br />
              <span className="forge-gradient-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                AWS DevOps
              </span>{" "}
              career.
            </h1>
            <p className="forge-anim-rise forge-delay-2 mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400">
              CloudForge takes you from zero to production-ready: Linux, Git,
              AWS, Terraform, pipelines, containers, and security — with
              hands-on labs, architecture diagrams, and cost-safe Free Tier
              guides.
            </p>
            <div className="forge-anim-rise forge-delay-3 mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/prerequisites"
                className="group inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Start learning free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold transition hover:border-black hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-white dark:hover:bg-zinc-900"
              >
                <Rocket className="h-4 w-4" />
                See the builds
              </Link>
            </div>
            <dl className="forge-anim-rise forge-delay-4 mt-9 grid max-w-lg grid-cols-3 gap-4">
              {[
                [`${totalLessons}+`, "Guided lessons"],
                ["4", "Portfolio projects"],
                ["12", "Skill modules"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-2xl border border-zinc-200 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70"
                >
                  <dt className="text-2xl font-bold">{v}</dt>
                  <dd className="mt-1 text-xs text-zinc-500">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Terminal visual */}
          <div className="forge-anim-rise forge-delay-3 relative">
            <div className="forge-float absolute -top-5 -right-3 z-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-emerald-500">●</span> Pipeline green
            </div>
            <div className="forge-float-slow absolute -bottom-5 -left-3 z-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-amber-500">●</span> Free Tier safe labs
            </div>
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-3 font-mono text-xs text-zinc-500">
                  forge — zsh
                </span>
              </div>
              <div className="space-y-2.5 p-5 font-mono text-[13px] leading-6">
                {termLines.map((l, i) => (
                  <p key={i} className={`forge-term-line ${l.cls}`}>
                    {l.prompt ? (
                      <span className="mr-2 text-orange-400">{l.prompt}</span>
                    ) : (
                      <span className="mr-2 text-zinc-600">→</span>
                    )}
                    {l.text}
                  </p>
                ))}
                <p className="text-zinc-100">
                  <span className="mr-2 text-orange-400">$</span>
                  <span className="forge-caret">▊</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative border-y border-zinc-200 bg-zinc-50/80 py-3 dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="overflow-hidden">
            <div className="forge-marquee-track flex w-max items-center gap-8 pr-8 text-sm font-medium text-zinc-500">
              {[...stack, ...stack].map((s, i) => (
                <span key={i} className="flex items-center gap-8">
                  {s}
                  <span className="text-orange-500">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PATH ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <p className="text-xs font-semibold tracking-widest text-orange-600 uppercase dark:text-orange-400">
            The learning path
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Twelve modules. Zero to hired.
          </h2>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Follow the numbers in order — each module builds on the last and
            ends ready for the next one.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Reveal key={m.slug} delay={Math.min(i * 60, 300)}>
              <Link
                href={`/${m.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:border-orange-500/60 hover:shadow-xl hover:shadow-orange-500/10 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400">
                    {moduleIcons[m.slug]}
                  </span>
                  <span className="font-mono text-xs text-zinc-400">{m.number}</span>
                </div>
                <h3 className="mt-4 font-semibold">{m.title}</h3>
                <p className="mt-1 flex-1 text-sm text-zinc-500">{m.tagline}</p>
                <p className="mt-4 text-xs font-medium text-zinc-500 transition group-hover:text-orange-600">
                  {m.lessons.length} lessons →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- WHY ---------- */}
      <section className="border-y border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-orange-600 uppercase dark:text-orange-400">
              Why CloudForge
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Built for beginners who want to go pro.
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <FlaskConical className="h-5 w-5" />,
                t: "Real A–Z labs",
                d: "Every lesson ends with hands-on tasks and verify checkpoints — not just theory.",
              },
              {
                icon: <PiggyBank className="h-5 w-5" />,
                t: "Cost-safe by design",
                d: "Free Tier labs plus red PAID warnings and teardown commands before any billable step.",
              },
              {
                icon: <Network className="h-5 w-5" />,
                t: "Architectures & diagrams",
                d: "ASCII architectures, pipeline flows, and state diagrams that make AWS click.",
              },
              {
                icon: <BookOpen className="h-5 w-5" />,
                t: "Curated free resources",
                d: "Official docs, Pro Git, Terraform registry — only sources that stay accurate.",
              },
            ].map((f, i) => (
              <Reveal key={f.t} delay={i * 70}>
                <div className="h-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-black">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black">
                    {f.icon}
                  </span>
                  <h3 className="mt-4 font-semibold">{f.t}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PROJECTS ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <p className="text-xs font-semibold tracking-widest text-orange-600 uppercase dark:text-orange-400">
            Prove it
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Four builds for your portfolio.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {projectLessons.map((l, i) => (
            <Reveal key={l.slug} delay={i * 70}>
              <Link
                href={`/projects/${l.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-zinc-200 p-5 transition hover:-translate-y-1 hover:border-orange-500/60 hover:shadow-xl hover:shadow-orange-500/10 dark:border-zinc-800"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="font-semibold">{l.title}</span>
                  <span className="mt-1 block text-sm text-zinc-500">
                    Full Terraform, pipeline, and teardown included.
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-sm leading-7 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              <strong>Finish line:</strong> deploy all four, write a README for
              each, then follow the{" "}
              <Link href="/certifications" className="underline underline-offset-4">
                Certifications path
              </Link>{" "}
              to validate your skills.
            </span>
          </p>
        </Reveal>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-6 py-14 text-center text-white sm:px-12 dark:bg-zinc-900">
            <div className="forge-float-slow pointer-events-none absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-orange-500/25 blur-3xl" />
            <div className="forge-float pointer-events-none absolute -right-10 -bottom-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
              Your first deploy is one lesson away.
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-zinc-400">
              Start with computer basics today. In a few months you will ship
              pipelines, containers, and serverless APIs on AWS.
            </p>
            <Link
              href="/prerequisites"
              className="group relative mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-orange-100"
            >
              Begin Module 01
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
