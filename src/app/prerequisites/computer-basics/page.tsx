import LessonLayout from "@/components/LessonLayout";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Prerequisites"
      title="Computer Basics"
      intro="Operating systems, filesystems, users, processes, and software installation — the foundation for Linux and AWS."
      prev={{ href: "/prerequisites/overview", label: "Start Here" }}
      next={{
        href: "/prerequisites/networking-basics",
        label: "Networking Basics",
      }}
      resources={[
        {
          title: "Khan Academy — Computing",
          url: "https://www.khanacademy.org/computing",
          description:
            "Free lessons on computers, the internet, and programming concepts.",
        },
        {
          title: "CS50x — Introduction to Computer Science",
          url: "https://cs50.harvard.edu/x/",
          description:
            "Free Harvard course covering how computers, memory, and files work.",
        },
        {
          title: "MDN Web Docs — Learn",
          url: "https://developer.mozilla.org/en-US/docs/Learn",
          description:
            "Free web fundamentals: how files, browsers, and the web fit together.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">1. Operating systems</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>What a kernel, shell, and user space do</li>
          <li>Windows vs macOS vs Linux for DevOps work</li>
          <li>Why servers almost always run Linux</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. Files and users</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Files, folders, paths, extensions, hidden files</li>
          <li>Read / write / execute permissions, admin vs normal user</li>
          <li>Archiving: zip, tar, extracting downloads</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">3. Processes and software</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Processes, ports, and background services</li>
          <li>Installing software: app stores vs package managers</li>
          <li>Environment variables and PATH basics</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Create a project folder with subfolders and 5 files</li>
          <li>Install VS Code, Git, and Python on your machine</li>
          <li>Open a terminal and list processes and environment variables</li>
          <li>Create a GitHub account — you will need it in Module 03</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
