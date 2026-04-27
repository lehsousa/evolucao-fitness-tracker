import { formatDate } from '../../utils/date.js';

export function WorkoutChangeHistory({ changes }) {
  return (
    <section className="card p-4">
      <h2 className="text-xl font-black text-white">Histórico de alterações</h2>
      <div className="mt-4 grid gap-3">
        {changes.length ? (
          changes.map((change) => (
            <article key={change.id} className="rounded-lg border border-line bg-ink px-3 py-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-black text-white">{labelType(change.type)}</p>
                <p className="text-xs font-bold text-slate-500">{formatDate(change.date.slice(0, 10))}</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">{change.reason}</p>
              {(change.before || change.after) && (
                <p className="mt-2 text-sm font-semibold text-slate-400">
                  {change.before?.name || '--'} {change.after?.name ? `→ ${change.after.name}` : ''}
                </p>
              )}
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-line bg-ink/60 px-3 py-4 text-center text-sm font-semibold text-slate-500">
            Nenhuma alteração aplicada ainda.
          </p>
        )}
      </div>
    </section>
  );
}

function labelType(type) {
  return {
    swap_exercise: 'Troca de exercício',
    adjust_sets: 'Ajuste de séries',
    adjust_reps: 'Ajuste de repetições',
    adjust_rest: 'Ajuste de descanso',
    keep_plan: 'Plano mantido',
    deload_week: 'Semana de recuperação',
    reorder_exercises: 'Reordenação',
  }[type] || type;
}
