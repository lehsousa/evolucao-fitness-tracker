import { CheckCircle2, CircleAlert, Utensils } from 'lucide-react';

export function NutritionChecklist({ summary }) {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2">
        <Utensils className="text-amberFit" size={21} />
        <h2 className="text-xl font-black text-white">Checklist alimentar</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Mini label="Aderência" value={`${summary.adherence}%`} tone="mint" />
        <Mini label="Refeições feitas" value={`${summary.mealsDone}/${summary.mealsTotal}`} tone="cyan" />
        <Mini label="Fora do plano" value={summary.offPlanCount} tone="coral" />
        <Mini label="Proteína estimada" value={`${summary.protein} g`} tone="amber" />
      </div>
      <Progress label="Aderência do dia" value={summary.adherence} color="bg-mint" />
      <Progress label="Proteína" value={summary.proteinPercent} color="bg-amberFit" />
    </section>
  );
}

function Mini({ label, value, tone }) {
  const colors = {
    mint: 'text-mint',
    cyan: 'text-cyanFit',
    coral: 'text-coral',
    amber: 'text-amberFit',
  };
  const Icon = tone === 'coral' ? CircleAlert : CheckCircle2;
  return (
    <div className="rounded-lg bg-ink px-3 py-3">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
        <Icon size={14} />
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black ${colors[tone]}`}>{value}</p>
    </div>
  );
}

function Progress({ label, value, color }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
