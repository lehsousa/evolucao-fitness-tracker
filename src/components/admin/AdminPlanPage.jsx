import { RotateCcw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { exerciseLibrary } from '../../data/exercises.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan.js';
import { applyWorkoutSuggestion, markSuggestionApplied, markSuggestionRejected } from '../../utils/applyWorkoutSuggestion.js';
import { WorkoutChangeHistory } from './WorkoutChangeHistory.jsx';
import { WorkoutSuggestionCard } from './WorkoutSuggestionCard.jsx';

export function AdminPlanPage() {
  const { plan, savePlan, restoreDefaultPlan } = useWorkoutPlan();
  const [suggestions, setSuggestions] = useLocalStorage('coachWorkoutSuggestions', []);
  const [changes, setChanges] = useLocalStorage('workoutChangeHistory', []);
  const [editing, setEditing] = useState(null);
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const safeChanges = Array.isArray(changes) ? changes : [];
  const pending = safeSuggestions.filter((item) => item.status === 'pending' || item.status === 'edited');
  const approved = safeSuggestions.filter((item) => item.status === 'applied' || item.status === 'approved');
  const rejected = safeSuggestions.filter((item) => item.status === 'rejected');

  function applySuggestion(suggestion) {
    const confirmed = window.confirm('Aplicar esta mudança ao plano de treino? Você poderá restaurar o plano padrão depois.');
    if (!confirmed) return;

    try {
      const { plan: nextPlan, change } = applyWorkoutSuggestion(suggestion, plan);
      savePlan(nextPlan);
      setChanges((current) => [change, ...(Array.isArray(current) ? current : [])]);
      setSuggestions((current) =>
        (Array.isArray(current) ? current : []).map((item) => (item.id === suggestion.id ? markSuggestionApplied(item) : item)),
      );
    } catch (error) {
      window.alert(error.message || 'Não foi possível aplicar a sugestão.');
    }
  }

  function rejectSuggestion(suggestion) {
    setSuggestions((current) =>
      (Array.isArray(current) ? current : []).map((item) => (item.id === suggestion.id ? markSuggestionRejected(item) : item)),
    );
  }

  function saveEditedSuggestion(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const patch = {
      ...editing,
      status: 'edited',
      suggestedExerciseId: String(form.get('suggestedExerciseId') || editing.suggestedExerciseId || ''),
      suggestedExerciseName: exerciseLibrary.find((item) => item.id === form.get('suggestedExerciseId'))?.name || editing.suggestedExerciseName,
      suggestedSets: toOptionalNumber(form.get('suggestedSets')),
      suggestedReps: String(form.get('suggestedReps') || editing.suggestedReps || ''),
      suggestedRestSeconds: toOptionalNumber(form.get('suggestedRestSeconds')),
      reason: String(form.get('reason') || editing.reason || ''),
    };
    setSuggestions((current) => (Array.isArray(current) ? current : []).map((item) => (item.id === editing.id ? patch : item)));
    setEditing(null);
  }

  function restorePlan() {
    const confirmed = window.confirm('Restaurar o plano padrão? O plano personalizado será removido, mas o histórico será mantido.');
    if (!confirmed) return;
    restoreDefaultPlan();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-mint">Admin do Plano</p>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Aprovações do Coach</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Revise, aprove ou rejeite sugestões. Nada altera o treino sem confirmação.
          </p>
        </div>
        <button type="button" onClick={restorePlan} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amberFit/40 bg-amberFit/10 px-4 font-black text-amberFit transition hover:bg-amberFit/20">
          <RotateCcw size={18} />
          Restaurar plano padrão
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Summary label="Pendentes" value={pending.length} />
        <Summary label="Aplicadas" value={approved.length} />
        <Summary label="Rejeitadas" value={rejected.length} />
      </section>

      <SuggestionSection title="Sugestões pendentes" items={pending} onApply={applySuggestion} onReject={rejectSuggestion} onEdit={setEditing} />
      <SuggestionSection title="Sugestões aplicadas" items={approved} onApply={applySuggestion} onReject={rejectSuggestion} onEdit={setEditing} />
      <SuggestionSection title="Sugestões rejeitadas" items={rejected} onApply={applySuggestion} onReject={rejectSuggestion} onEdit={setEditing} />
      <WorkoutChangeHistory changes={safeChanges} />

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-3 py-4 backdrop-blur-sm">
          <form onSubmit={saveEditedSuggestion} className="mx-auto max-w-lg rounded-lg border border-line bg-panel p-4 shadow-glow">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-cyanFit" size={22} />
              <h2 className="text-xl font-black text-white">Editar sugestão</h2>
            </div>
            {editing.type === 'swap_exercise' && (
              <div className="mt-4">
                <label className="label" htmlFor="suggestedExerciseId">Exercício sugerido</label>
                <select id="suggestedExerciseId" name="suggestedExerciseId" className="field" defaultValue={editing.suggestedExerciseId}>
                  {exerciseLibrary.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Field name="suggestedSets" label="Séries" defaultValue={editing.suggestedSets || ''} />
              <Field name="suggestedReps" label="Reps" defaultValue={editing.suggestedReps || ''} />
              <Field name="suggestedRestSeconds" label="Descanso" defaultValue={editing.suggestedRestSeconds || ''} />
            </div>
            <div className="mt-4">
              <label className="label" htmlFor="reason">Motivo</label>
              <textarea id="reason" name="reason" className="field min-h-24" defaultValue={editing.reason} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="submit" className="min-h-11 rounded-lg bg-mint px-4 font-black text-ink">Salvar edição</button>
              <button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-lg border border-line px-4 font-black text-slate-200">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SuggestionSection({ title, items, onApply, onReject, onEdit }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-black text-white">{title}</h2>
      {items.length ? (
        items.map((suggestion) => (
          <WorkoutSuggestionCard key={suggestion.id} suggestion={suggestion} onApply={onApply} onReject={onReject} onEdit={onEdit} />
        ))
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-panel/70 px-3 py-4 text-center text-sm font-semibold text-slate-500">
          Nenhum item nesta categoria.
        </p>
      )}
    </section>
  );
}

function Summary({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-mint">{value}</p>
    </div>
  );
}

function Field({ name, label, defaultValue }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="field" defaultValue={defaultValue} />
    </div>
  );
}

function toOptionalNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && value !== '' ? number : undefined;
}
