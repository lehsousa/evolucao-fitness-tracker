import { CheckCircle2, Eye, PenLine, XCircle } from 'lucide-react';
import { useState } from 'react';

const labels = {
  swap_exercise: 'Trocar exercício',
  adjust_sets: 'Ajustar séries',
  adjust_reps: 'Ajustar repetições',
  adjust_rest: 'Ajustar descanso',
  deload_week: 'Semana de recuperação',
  reorder_exercises: 'Reordenar exercícios',
  keep_plan: 'Manter plano',
};

const priorityClasses = {
  high: 'border-coral/40 bg-coral/10 text-coral',
  medium: 'border-amberFit/40 bg-amberFit/10 text-amberFit',
  low: 'border-mint/40 bg-mint/10 text-mint',
};

export function WorkoutSuggestionCard({ suggestion, onApply, onReject, onEdit }) {
  const [showReason, setShowReason] = useState(false);

  return (
    <article className="card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-panelSoft px-2 py-1 text-xs font-black uppercase tracking-wide text-cyanFit">
              {labels[suggestion.type] || suggestion.type}
            </span>
            <span className={`rounded-lg border px-2 py-1 text-xs font-black uppercase tracking-wide ${priorityClasses[suggestion.priority] || priorityClasses.medium}`}>
              {suggestion.priority}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-black text-white">{buildTitle(suggestion)}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-400">{suggestion.expectedBenefit}</p>
        </div>
        <span className="w-fit rounded-lg bg-ink px-2 py-1 text-xs font-black uppercase tracking-wide text-slate-300">
          {suggestion.status}
        </span>
      </div>

      {showReason && (
        <div className="mt-4 rounded-lg border border-line bg-ink px-3 py-3">
          <p className="text-sm font-bold text-white">Motivo</p>
          <p className="mt-1 text-sm text-slate-300">{suggestion.reason}</p>
          <p className="mt-3 text-sm font-bold text-amberFit">Segurança</p>
          <p className="mt-1 text-sm text-slate-300">{suggestion.safetyNote}</p>
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <button type="button" onClick={() => setShowReason((value) => !value)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-panelSoft px-3 text-sm font-black text-white transition hover:text-cyanFit">
          <Eye size={17} />
          Ver motivo
        </button>
        {(suggestion.status === 'pending' || suggestion.status === 'edited') && (
          <>
            <button type="button" onClick={() => onApply(suggestion)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-mint px-3 text-sm font-black text-ink transition hover:bg-green-300">
              <CheckCircle2 size={17} />
              Aprovar e aplicar
            </button>
            <button type="button" onClick={() => onEdit(suggestion)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-black text-slate-200 transition hover:border-cyanFit hover:text-cyanFit">
              <PenLine size={17} />
              Editar
            </button>
            <button type="button" onClick={() => onReject(suggestion)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-coral/40 bg-coral/10 px-3 text-sm font-black text-coral transition hover:bg-coral/20">
              <XCircle size={17} />
              Rejeitar
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function buildTitle(suggestion) {
  if (suggestion.type === 'swap_exercise') {
    return `${suggestion.currentExerciseName} → ${suggestion.suggestedExerciseName}`;
  }
  if (suggestion.type === 'adjust_sets') return `${suggestion.currentExerciseName}: ${suggestion.suggestedSets} séries`;
  if (suggestion.type === 'adjust_reps') return `${suggestion.currentExerciseName}: ${suggestion.suggestedReps}`;
  if (suggestion.type === 'adjust_rest') return `${suggestion.currentExerciseName}: descanso ${suggestion.suggestedRestSeconds}s`;
  return suggestion.reason;
}
