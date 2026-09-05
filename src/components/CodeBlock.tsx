export default function CodeBlock({
  code,
  label,
}: {
  code: string;
  label?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      {label ? (
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          {label}
        </div>
      ) : null}
      <pre className="overflow-x-auto bg-zinc-950 p-4 font-mono text-[13px] leading-6 text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
