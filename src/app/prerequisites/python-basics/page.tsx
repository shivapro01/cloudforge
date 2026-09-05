import LessonLayout from "@/components/LessonLayout";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Prerequisites"
      title="Python Basics"
      intro="Just enough Python to automate AWS tasks, read logs, and use boto3 later."
      prev={{
        href: "/prerequisites/networking-basics",
        label: "Networking Basics",
      }}
      next={{ href: "/linux-shell", label: "Linux & Shell" }}
      resources={[
        {
          title: "Python Official Tutorial",
          url: "https://docs.python.org/3/tutorial/",
          description:
            "Free official Python tutorial. Complete chapters 1–7 for DevOps needs.",
        },
        {
          title: "CS50P — Introduction to Programming with Python",
          url: "https://cs50.harvard.edu/python/",
          description:
            "Free Harvard Python course with problem sets and video lectures.",
        },
        {
          title: "Automate the Boring Stuff with Python",
          url: "https://automatetheboringstuff.com/",
          description:
            "Free online book focused on files, automation, and practical scripts.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">1. Language fundamentals</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Variables, data types, if/else, loops, functions</li>
          <li>Lists, dicts, string formatting, f-strings</li>
          <li>Virtual environments and pip installs</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. DevOps use cases</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Read/write files, parse JSON and CSV logs</li>
          <li>Make HTTP requests and handle errors</li>
          <li>Read environment variables for secrets and config</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Script that lists files in a folder and counts lines</li>
          <li>Script that fetches a public JSON API and prints fields</li>
          <li>Script that reads an env var and writes JSON output</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
