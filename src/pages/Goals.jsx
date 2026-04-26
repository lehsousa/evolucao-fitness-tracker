import { Droplets, Flag, HeartPulse, Scale, Target, Utensils } from 'lucide-react';
import { goals } from '../data/plan.js';

export function Goals({ latestCheckin, weeklyCardios }) {
  const currentWeight = latestCheckin?.weight || goals.initialWeight;
  const totalToMain = goals.initialWeight - goals.mainWeightGoal;
  const currentLoss = Math.max(0, goals.initialWeight - currentWeight);
  const progress = Math.min(100, Math.round((currentLoss / totalToMain) * 100));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-mint">Metas</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Plano de chegada</h1>
      </div>

      <section className="card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400">Progresso até 92 kg</p>
            <p className="mt-2 text-4xl font-black text-white">{progress}%</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-ink sm:w-72">
            <div className="h-full rounded-full bg-mint" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <GoalCard icon={Scale} label="Peso inicial" value={`${goals.initialWeight} kg`} />
        <GoalCard icon={Target} label="Meta principal" value={`${goals.mainWeightGoal} kg`} tone="mint" />
        <GoalCard icon={Flag} label="Meta intermediária" value={`${goals.intermediateWeightGoal} kg`} tone="cyan" />
        <GoalCard icon={Utensils} label="Proteína diária" value={`${goals.dailyProtein} g`} tone="amber" />
        <GoalCard icon={HeartPulse} label="Cardio semanal" value={`${weeklyCardios}/${goals.weeklyCardio} vezes`} tone="coral" />
        <GoalCard icon={Droplets} label="Água" value={goals.waterRange} tone="cyan" />
      </section>
    </div>
  );
}

function GoalCard({ icon: Icon, label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-panelSoft text-white',
    mint: 'bg-mint/15 text-mint',
    cyan: 'bg-cyanFit/15 text-cyanFit',
    amber: 'bg-amberFit/15 text-amberFit',
    coral: 'bg-coral/15 text-coral',
  };

  return (
    <article className="card p-4">
      <div className={`grid h-11 w-11 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </article>
  );
}
