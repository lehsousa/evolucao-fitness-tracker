import { Beef } from 'lucide-react';

export function ProteinProgress({ summary, target }) {
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Proteína</p>
          <p className="mt-1 text-2xl font-black text-white">{summary.protein} g / {target} g</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-ink">
          <Beef size={23} />
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink">
        <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${summary.proteinPercent}%` }} />
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-400">{summary.proteinPercent}% da meta diária estimada.</p>
    </section>
  );
}
