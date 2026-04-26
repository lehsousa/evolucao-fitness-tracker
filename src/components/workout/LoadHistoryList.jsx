import { Edit3, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/date.js';
import { getEstimatedVolume } from '../../utils/workoutUtils.js';

export function LoadHistoryList({ history, onEdit, onDelete }) {
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="card bg-panelSoft p-4 shadow-none">
      <h3 className="text-lg font-black text-white">Histórico completo</h3>
      <div className="mt-3 grid gap-2">
        {sorted.length ? (
          sorted.map((entry) => (
            <article key={entry.id} className="rounded-lg bg-ink px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{formatDate(entry.date)} • {entry.weight} kg</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {entry.sets} séries x {entry.reps} reps {entry.rpe ? `• RPE ${entry.rpe}` : ''}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-amberFit">Volume estimado: {getEstimatedVolume(entry)} kg</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => onEdit(entry)} className="grid h-9 w-9 place-items-center rounded-lg bg-panelSoft text-slate-300 transition hover:text-white">
                    <Edit3 size={16} />
                  </button>
                  <button type="button" onClick={() => onDelete(entry.id)} className="grid h-9 w-9 place-items-center rounded-lg bg-coral/10 text-coral transition hover:bg-coral/20">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {entry.notes && <p className="mt-2 text-sm text-slate-500">{entry.notes}</p>}
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-line bg-ink/45 px-3 py-4 text-center text-sm font-semibold text-slate-500">
            Registre a primeira carga para acompanhar evolução.
          </p>
        )}
      </div>
    </section>
  );
}
