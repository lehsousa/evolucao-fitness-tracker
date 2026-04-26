export function StatCard({ icon: Icon, label, value, detail, tone = 'mint' }) {
  const tones = {
    mint: 'bg-mint/15 text-mint',
    cyan: 'bg-cyanFit/15 text-cyanFit',
    amber: 'bg-amberFit/15 text-amberFit',
    coral: 'bg-coral/15 text-coral',
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-white">{value}</p>
          {detail && <p className="mt-1 text-sm text-slate-400">{detail}</p>}
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}
