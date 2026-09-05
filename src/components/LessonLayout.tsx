import Link from "next/link";

export type Resource = {
  title: string;
  url: string;
  description: string;
};

export default function LessonLayout({
  breadcrumb,
  title,
  intro,
  children,
  resources,
  prev,
  next,
}: {
  breadcrumb: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  resources: Resource[];
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <article>
      <p className="text-sm text-zinc-500">{breadcrumb}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{intro}</p>

      <div className="mt-6 flex flex-col gap-6 text-sm leading-7">{children}</div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Free resources</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {resources.map((r) => (
            <li
              key={r.url}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4"
              >
                {r.title}
              </a>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                {r.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <nav className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <div>
          {prev ? (
            <Link href={prev.href} className="underline underline-offset-4">
              ← {prev.label}
            </Link>
          ) : null}
        </div>
        <div>
          {next ? (
            <Link href={next.href} className="underline underline-offset-4">
              {next.label} →
            </Link>
          ) : null}
        </div>
      </nav>
    </article>
  );
}
