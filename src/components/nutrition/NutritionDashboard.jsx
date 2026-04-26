import { Flame, Scale, Target, Utensils } from 'lucide-react';

export function NutritionDashboard({ targets, currentWeight }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <GoalCard icon={Target} label="Proteína" value={`${targets.protein} g/dia`} />
      <GoalCard icon={Utensils} label="Água" value={`${targets.waterMinLiters}-${targets.waterMaxLiters} L/dia`} />
      <GoalCard icon={Flame} label="Calorias" value={`${targets.caloriesMin}-${targets.caloriesMax} kcal`} />
      <GoalCard icon={Scale} label="Peso atual" value={`${Number(currentWeight || 100).toFixed(1)} kg`} />
    </section>
  );
}

function GoalCard({ icon: Icon, label, value }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={18} />
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
