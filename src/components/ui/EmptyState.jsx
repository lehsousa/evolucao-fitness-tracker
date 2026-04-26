export function EmptyState({ title, text }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-ink/45 p-6 text-center">
      <p className="font-bold text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}
