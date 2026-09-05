import LessonLayout from "@/components/LessonLayout";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Prerequisites"
      title="Start Here"
      intro="Who this module is for, how long it takes, and how to know you are ready for Linux and AWS."
      prev={{ href: "/prerequisites", label: "Prerequisites" }}
      next={{ href: "/prerequisites/computer-basics", label: "Computer Basics" }}
      resources={[
        {
          title: "CS50x — Introduction to Computer Science",
          url: "https://cs50.harvard.edu/x/",
          description:
            "Free Harvard course. Watch the first weeks for computers, files, and internet fundamentals.",
        },
        {
          title: "freeCodeCamp",
          url: "https://www.freecodecamp.org/",
          description:
            "Free beginner courses and practice. Use for Python and networking basics.",
        },
        {
          title: "DevOps Roadmap",
          url: "https://roadmap.sh/",
          description:
            "Free visual roadmap. Use the DevOps track to see where prerequisites fit.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Who is this for?</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Complete beginner with basic computer usage but no Linux, networking,
          or cloud experience. No prior AWS or DevOps knowledge is assumed.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How to complete it</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Do lessons in order: Computer → Networking → Python</li>
          <li>Budget 1–2 weeks, 1 hour per day</li>
          <li>Do every hands-on task on your own computer</li>
          <li>Bookmark the free resources — you will reuse them later</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Done checklist</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>You can create, copy, move, and zip files from a terminal</li>
          <li>You can explain what an IP address, DNS, and URL do</li>
          <li>You can write a Python script that reads a file and calls an API</li>
          <li>You have a GitHub account (needed from Module 03)</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
