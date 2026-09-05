export default function TopicPlaceholder({
  title,
  breadcrumb,
}: {
  title: string;
  breadcrumb?: string;
}) {
  return (
    <div>
      {breadcrumb ? (
        <p className="text-sm text-zinc-500">{breadcrumb}</p>
      ) : null}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
        Content coming soon.
      </div>
    </div>
  );
}
