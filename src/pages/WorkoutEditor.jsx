import { ArrowDown, ArrowUp, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { exerciseLibrary } from '../data/exercises.js';
import { useWorkoutPlan } from '../hooks/useWorkoutPlan.js';

export function WorkoutEditor() {
  const { plan, savePlan, restoreDefaultPlan, isCustomPlan, defaultWorkoutPlan } = useWorkoutPlan();
  const [draft, setDraft] = useState(() => clonePlan(plan));
  const [savedMessage, setSavedMessage] = useState('');

  const exerciseOptions = useMemo(
    () => [...exerciseLibrary].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  function updateWorkout(workoutId, field, value) {
    setDraft((current) => current.map((workout) => (workout.id === workoutId ? { ...workout, [field]: value } : workout)));
  }

  function addWorkout() {
    setDraft((current) => [
      ...current,
      {
        id: `treino-${Date.now()}`,
        day: `Dia ${current.length + 1}`,
        title: 'Novo treino',
        focus: '',
        notes: '',
        items: [],
      },
    ]);
  }

  function removeWorkout(workoutId) {
    setDraft((current) => current.filter((workout) => workout.id !== workoutId));
  }

  function addExercise(workoutId) {
    setDraft((current) =>
      current.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              items: [
                ...workout.items,
                {
                  id: `${workoutId}-item-${Date.now()}`,
                  type: 'exercise',
                  exerciseId: exerciseOptions[0]?.id || '',
                  sets: 3,
                  reps: '8-12',
                  restSeconds: 60,
                  notes: '',
                },
              ],
            }
          : workout,
      ),
    );
  }

  function updateItem(workoutId, itemId, field, value) {
    setDraft((current) =>
      current.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              items: workout.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
            }
          : workout,
      ),
    );
  }

  function removeItem(workoutId, itemId) {
    setDraft((current) =>
      current.map((workout) =>
        workout.id === workoutId ? { ...workout, items: workout.items.filter((item) => item.id !== itemId) } : workout,
      ),
    );
  }

  function moveItem(workoutId, itemId, direction) {
    setDraft((current) =>
      current.map((workout) => {
        if (workout.id !== workoutId) return workout;
        const index = workout.items.findIndex((item) => item.id === itemId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= workout.items.length) return workout;
        const items = [...workout.items];
        const [item] = items.splice(index, 1);
        items.splice(target, 0, item);
        return { ...workout, items };
      }),
    );
  }

  function save() {
    savePlan(draft);
    setSavedMessage('Plano salvo no navegador.');
    window.setTimeout(() => setSavedMessage(''), 2200);
  }

  function restore() {
    const confirmed = window.confirm('Restaurar o plano padrão? Seu plano personalizado será substituído.');
    if (!confirmed) return;
    restoreDefaultPlan();
    setDraft(clonePlan(defaultWorkoutPlan));
    setSavedMessage('Plano padrão restaurado.');
    window.setTimeout(() => setSavedMessage(''), 2200);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-mint">Editor de Treino</p>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Plano editável</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Crie, organize e salve seu plano sem alterar o código. O plano salvo substitui o padrão apenas no seu navegador.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={addWorkout} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line px-4 font-black text-white transition hover:border-cyanFit hover:text-cyanFit">
            <Plus size={18} />
            Novo dia
          </button>
          <button type="button" onClick={restore} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amberFit/40 bg-amberFit/10 px-4 font-black text-amberFit transition hover:bg-amberFit/20">
            <RotateCcw size={18} />
            Restaurar plano padrão
          </button>
          <button type="button" onClick={save} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-mint px-4 font-black text-ink transition hover:bg-green-300">
            <Save size={18} />
            Salvar tudo
          </button>
        </div>
      </div>

      {savedMessage && <p className="rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-sm font-bold text-mint">{savedMessage}</p>}
      {isCustomPlan && <p className="rounded-lg border border-cyanFit/30 bg-cyanFit/10 px-3 py-2 text-sm font-semibold text-cyanFit">Você está usando um plano personalizado salvo.</p>}

      <div className="grid gap-4">
        {draft.map((workout) => (
          <section key={workout.id} className="card p-4">
            <div className="grid gap-3 lg:grid-cols-[0.7fr_1fr_1fr_auto]">
              <Field label="Dia" value={workout.day} onChange={(value) => updateWorkout(workout.id, 'day', value)} />
              <Field label="Nome do treino" value={workout.title} onChange={(value) => updateWorkout(workout.id, 'title', value)} />
              <Field label="Foco" value={workout.focus} onChange={(value) => updateWorkout(workout.id, 'focus', value)} />
              <button type="button" onClick={() => removeWorkout(workout.id)} className="flex min-h-11 items-center justify-center gap-2 self-end rounded-lg bg-coral/10 px-3 font-bold text-coral transition hover:bg-coral/20">
                <Trash2 size={17} />
                Remover
              </button>
            </div>
            <div className="mt-3">
              <label className="label" htmlFor={`notes-${workout.id}`}>Observações do treino</label>
              <textarea id={`notes-${workout.id}`} className="field min-h-20 resize-y" value={workout.notes || ''} onChange={(event) => updateWorkout(workout.id, 'notes', event.target.value)} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-white">Exercícios</h2>
              <button type="button" onClick={() => addExercise(workout.id)} className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-panelSoft px-3 text-sm font-black text-white transition hover:text-mint">
                <Plus size={17} />
                Adicionar
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              {workout.items.map((item, index) => (
                <article key={item.id} className="rounded-lg border border-line bg-ink p-3">
                  <div className="grid gap-3 lg:grid-cols-[1.5fr_0.5fr_0.7fr_0.7fr_auto]">
                    <div>
                      <label className="label" htmlFor={`exercise-${item.id}`}>Exercício da biblioteca</label>
                      <select id={`exercise-${item.id}`} className="field" value={item.exerciseId} onChange={(event) => updateItem(workout.id, item.id, 'exerciseId', event.target.value)}>
                        {exerciseOptions.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                        ))}
                      </select>
                    </div>
                    <Field label="Séries" type="number" value={item.sets} onChange={(value) => updateItem(workout.id, item.id, 'sets', value)} />
                    <Field label="Repetições" value={item.reps} onChange={(value) => updateItem(workout.id, item.id, 'reps', value)} />
                    <Field label="Descanso (s)" type="number" value={item.restSeconds} onChange={(value) => updateItem(workout.id, item.id, 'restSeconds', value)} />
                    <div className="flex items-end gap-1">
                      <IconButton label="Subir" disabled={index === 0} onClick={() => moveItem(workout.id, item.id, -1)} icon={ArrowUp} />
                      <IconButton label="Descer" disabled={index === workout.items.length - 1} onClick={() => moveItem(workout.id, item.id, 1)} icon={ArrowDown} />
                      <IconButton label="Remover" onClick={() => removeItem(workout.id, item.id)} icon={Trash2} danger />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Field label="Observações" value={item.notes || ''} onChange={(value) => updateItem(workout.id, item.id, 'notes', value)} />
                  </div>
                </article>
              ))}

              {!workout.items.length && (
                <p className="rounded-lg border border-dashed border-line bg-ink/60 px-3 py-4 text-center text-sm font-semibold text-slate-500">
                  Nenhum exercício neste dia ainda.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  const id = label.toLowerCase().replaceAll(' ', '-');
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} className="field" type={type} value={value} min={type === 'number' ? '0' : undefined} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function IconButton({ label, onClick, icon: Icon, disabled = false, danger = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-11 w-11 place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger ? 'bg-coral/10 text-coral hover:bg-coral/20' : 'bg-panelSoft text-slate-300 hover:text-white'
      }`}
    >
      <Icon size={18} />
    </button>
  );
}

function clonePlan(plan) {
  return JSON.parse(JSON.stringify(plan));
}
