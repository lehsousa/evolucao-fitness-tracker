import { Droplets, Minus, Plus } from 'lucide-react';

export function WaterTracker({ waterMl, summary, targets, onAddWater }) {
  const liters = (waterMl / 1000).toFixed(2).replace('.', ',');

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Água</p>
          <p className="mt-1 text-2xl font-black text-white">{liters} L</p>
          <p className="mt-1 text-sm font-semibold text-slate-400">Meta: {targets.waterMinLiters} a {targets.waterMaxLiters} L</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyanFit text-ink">
          <Droplets size={23} />
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink">
        <div className="h-full rounded-full bg-cyanFit transition-all" style={{ width: `${summary.waterPercent}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <WaterButton icon={Plus} label="+250 ml" onClick={() => onAddWater(250)} />
        <WaterButton icon={Plus} label="+500 ml" onClick={() => onAddWater(500)} />
        <WaterButton icon={Plus} label="+1 L" onClick={() => onAddWater(1000)} />
        <WaterButton icon={Minus} label="-250 ml" onClick={() => onAddWater(-250)} muted />
      </div>
    </section>
  );
}

function WaterButton({ icon: Icon, label, onClick, muted = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-black transition ${
        muted ? 'border border-line text-slate-300 hover:text-white' : 'bg-panelSoft text-white hover:text-cyanFit'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
