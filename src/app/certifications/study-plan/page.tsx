import Link from "next/link";
import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Certifications & Path"
      title="Study Plan & Interviews"
      intro="Certifications get you shortlisted; interviews get you hired. This page turns everything into a repeatable weekly system, shows what to use free vs paid, covers exam-day tactics, preps you for DevOps interviews (Linux, Git, AWS, scenarios, whiteboards, STAR stories), and lays out your first 90 days on the job."
      prev={{ href: "/certifications/devops-professional", label: "DevOps Engineer Professional" }}
      resources={[
        {
          title: "AWS Skill Builder",
          url: "https://skillbuilder.aws/",
          description:
            "Free courses, labs, and official practice exams — the backbone of every weekly cycle below.",
        },
        {
          title: "roadmap.sh — DevOps Roadmap",
          url: "https://roadmap.sh/devops",
          description:
            "Keeps interview prep honest: check which roadmap areas your answers still cannot cover.",
        },
        {
          title: "freeCodeCamp — DevOps and AWS practice",
          url: "https://www.freecodecamp.org/",
          description:
            "Free hands-on tutorials and projects for Linux, Git, CI/CD, and AWS interview reps.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">The weekly system: learn → lab → flash → mock</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every certification on this track yields to the same four-beat week. Learn a domain
          (Skill Builder + docs), lab it the same day (Console or CLI — never learn without
          touching), flash the misses (a small deck of your own wrong answers, reviewed in ten
          minutes daily), and mock on the weekend (timed, then tag every miss by domain for next
          week&apos;s learn step). The cycle compounds: week three&apos;s mocks test week
          one&apos;s labs, and durable recall replaces cramming.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Schedule"
            code={`Mon-Tue  LEARN  — one domain: Skill Builder lessons + its exam-guide section
Wed-Thu  LAB    — Console/CLI reps for that domain; screenshot + one-line notes each
Daily    FLASH  — 10 min: only cards made from YOUR wrong answers, newest first
Sat      MOCK   — timed mini-mock (20-30 Q); tag every miss by domain
Sun      PLAN   — weakest domain becomes next week's Mon-Tue; rest in the evening`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Free vs paid resources</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          You can reach every exam on free materials plus the exam fee itself — paid content buys
          speed and polish, not access. Spend free effort first; buy only what fixes a measured
          weakness.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 font-semibold">Need</th>
                <th className="p-3 font-semibold">Free (start here)</th>
                <th className="p-3 font-semibold">Paid (buy to fix a gap)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Lessons</td>
                <td className="p-3">Skill Builder free tiers, AWS docs, freeCodeCamp</td>
                <td className="p-3">A single well-reviewed video course per exam [PAID]</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-3">Practice exams</td>
                <td className="p-3">Skill Builder official practice sets</td>
                <td className="p-3">Third-party mock banks if you need 5+ full exams [PAID]</td>
              </tr>
              <tr>
                <td className="p-3">Labs</td>
                <td className="p-3">Free Tier + CloudShell + this platform&apos;s projects</td>
                <td className="p-3">Exam fees themselves ($100/$150/$300) — the only required spend</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Exam-day tactics</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Exams are won the week before and executed in the first ten minutes. Stop new material
          48 hours out and review only your flash deck; sleep normally — an extra hour of rest
          outperforms an extra hour of cramming at every level. In the room, do a first pass
          answering only confident questions and flagging the rest (bank the easy points while
          fresh), then a second pass where you eliminate two options before choosing — most AWS
          stems contain one distractor that violates a core principle (single-AZ, hardcoded
          secrets, manual steps where automation exists). Reserve the last fifteen minutes for
          flagged questions only, and never leave one blank: there is no penalty for guessing.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps interview prep</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Interviews test four layers plus storytelling. <strong>Linux:</strong> permissions,
          processes, systemd, logs, basic networking (expect live terminal tasks).{" "}
          <strong>Git:</strong> branching, rebasing, resolving conflicts, PR workflows.{" "}
          <strong>AWS:</strong> design a small system on the spot (the SAA mini-scenarios are
          your rehearsal). <strong>Scenario questions:</strong> &quot;pipeline is red,&quot;
          &quot;site is slow,&quot; &quot;deploy safely with zero downtime&quot; — answer with
          the same diagnose-before-fixing order from your runbooks. Practice the whiteboard
          weekly: draw your two-tier and pipeline architectures from memory while narrating
          trade-offs. And convert every project into <strong>STAR stories</strong> (Situation,
          Task, Action, Result): what broke, what you owned, what you did, what metric moved.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Your first 90 days on the job</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Days 1–30: learn the system — read runbooks, shadow on-calls, ship one small pipeline
          or automation change with review. Days 31–60: own something — take a rotation slot, fix
          one flaky pipeline or noisy alarm permanently, document what you learned. Days 61–90:
          improve the system — propose one IaC, monitoring, or deployment-safety upgrade backed
          by your project portfolio as proof you have done it before. Keep certifying in the
          background (one exam per quarter is sustainable), but let shipped improvements, not
          badges, define the probation review.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Ready to execute? Head back to the{" "}
          <Link href="/" className="underline underline-offset-4">
            Dashboard
          </Link>{" "}
          and pick up your next module — the plan only works if the labs keep moving.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tasks (6)</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Set up your weekly cycle: block learn days, lab days, 10-minute flash slots, and a Saturday mock.</li>
          <li>Start a wrong-answer flash deck from your next mock — no generic decks, only your misses.</li>
          <li>Whiteboard your two-tier + pipeline architectures from memory, narrating trade-offs aloud.</li>
          <li>Write three STAR stories (one project, one bug hunt, one teamwork moment) in under 200 words each.</li>
          <li>Do one live practice round: terminal task + scenario answer + 5-minute whiteboard, timed.</li>
          <li>Draft your 30/60/90-day plan and return to the Dashboard to schedule this week's labs.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
