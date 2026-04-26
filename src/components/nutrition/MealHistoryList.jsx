import { formatDate } from '../../utils/date.js';
import { calculateNutritionSummary } from '../../utils/nutritionUtils.js';

export function MealHistoryList({ days }) {
  return (
    <section className="card p-4">
      <h2 className="text-xl font-black text-white">Histórico alimentar</h2>
      <p className="mt-1 text-sm text-slate-400">Últimos 7 dias registrados.</p>
      <div className="mt-4 grid gap-2">
        {days.length ? (
          days.map((day) => {
            const summary = calculateNutritionSummary(day);
            return (
              <article key={day.date} className="rounded-lg bg-ink px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-white">{formatDate(day.date)}</p>
                  <p className="text-sm font-black text-mint">{summary.adherence}%</p>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold text-slate-400 sm:grid-cols-4">
                  <span>{summary.protein} g proteína</span>
                  <span>{(summary.waterMl / 1000).toFixed(1).replace('.', ',')} L água</span>
                  <span>{summary.mealsDone}/{summary.mealsTotal} refeições</span>
                  <span>{summary.offPlanCount} fora do plano</span>
                </div>
              </article>
            );
          })
        ) : (
          <p className="rounded-lg border border-dashed border-line bg-ink/60 px-3 py-4 text-center text-sm font-semibold text-slate-500">
            Nenhum histórico alimentar ainda.
          </p>
        )}
      </div>
    </section>
  );
}
