import { CheckCircle2, Dumbbell, Edit3, HeartPulse, ThumbsUp, XCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { cardioOptions, goals } from '../data/plan.js';
import { getExerciseById } from '../data/exercises.js';
import { useExerciseHistory } from '../hooks/useExerciseHistory.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useWorkoutPlan } from '../hooks/useWorkoutPlan.js';
import { todayKey } from '../utils/date.js';
import { analyzeExerciseProgression } from '../utils/workoutUtils.js';

export function WeeklySuggestions({ workoutDone, cardioDone, onEditPlan }) {
  const { plan } = useWorkoutPlan();
  const { getHistoryByExercise } = useExerciseHistory();
  const [savedSuggestions, setSavedSuggestions] = useLocalStorage('weeklyProgressionSuggestions', {});
  const date = todayKey();
  const dayRecord = savedSuggestions[date] || {};
  const dayDecisions = dayRecord.decisions || dayRecord;

  const exerciseSuggestions = plan.flatMap((workout) =>
    workout.items
      .filter((item) => item.exerciseId)
      .map((item) => {
        const exercise = getExerciseById(item.exerciseId);
        if (!exercise) return null;
        const history = getHistoryByExercise(exercise.id);
        const analysis = analyzeExerciseProgression(history, item.reps);
        return {
          id: `${workout.id}-${exercise.id}`,
          workout,
          item,
          exercise,
          analysis,
          decision: dayDecisions[`${workout.id}-${exercise.id}`],
        };
      })
      .filter(Boolean),
  );
  const suggestionsSnapshot = useMemo(
    () =>
      Object.fromEntries(
        exerciseSuggestions.map((item) => [
          item.id,
          {
            exerciseId: item.exercise.id,
            exerciseName: item.exercise.name,
            workoutId: item.workout.id,
            workoutTitle: item.workout.title,
            type: item.analysis.type,
            title: item.analysis.title,
            message: item.analysis.message,
            currentWeight: item.analysis.currentWeight,
            suggestedWeight: item.analysis.suggestedWeight,
          },
        ]),
      ),
    [exerciseSuggestions],
  );
  const suggestionsSignature = JSON.stringify(suggestionsSnapshot);

  useEffect(() => {
    setSavedSuggestions((current) => {
      const currentDay = current[date] || {};
      if (currentDay.signature === suggestionsSignature) return current;
      return {
        ...current,
        [date]: {
          generatedAt: currentDay.generatedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          signature: suggestionsSignature,
          items: suggestionsSnapshot,
          decisions: currentDay.decisions || {},
        },
      };
    });
  }, [date, setSavedSuggestions, suggestionsSignature, suggestionsSnapshot]);

  const notCompletedWorkouts = plan
    .map((workout) => {
      const exerciseItems = workout.items.filter((item) => item.exerciseId);
      const completed = exerciseItems.filter((item) => workoutDone[`${workout.id}-${item.exerciseId}`] || workoutDone[`${workout.day}-${item.exerciseId}`]).length;
      return { workout, completed, total: exerciseItems.length };
    })
    .filter((item) => item.total > 0 && item.completed < item.total);

  const cardioCount = Object.values(cardioDone || {}).filter(Boolean).length;
  const pendingCardios = Math.max(0, goals.weeklyCardio - cardioCount);

  function setDecision(suggestionId, decision) {
    const selected = exerciseSuggestions.find((item) => item.id === suggestionId);
    setSavedSuggestions((current) => {
      const currentDay = current[date] || {};
      return {
        ...current,
        [date]: {
          ...(currentDay.decisions ? currentDay : {}),
          generatedAt: currentDay.generatedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          signature: currentDay.signature || suggestionsSignature,
          items: {
            ...(currentDay.items || suggestionsSnapshot),
            [suggestionId]: selected
              ? {
                  exerciseId: selected.exercise.id,
                  exerciseName: selected.exercise.name,
                  workoutId: selected.workout.id,
                  workoutTitle: selected.workout.title,
                  type: selected.analysis.type,
                  title: selected.analysis.title,
                  message: selected.analysis.message,
                  currentWeight: selected.analysis.currentWeight,
                  suggestedWeight: selected.analysis.suggestedWeight,
                }
              : currentDay.items?.[suggestionId],
          },
          decisions: {
            ...(currentDay.decisions || currentDay),
            [suggestionId]: decision,
          },
        },
      };
    });
  }

  const grouped = {
    increase: exerciseSuggestions.filter((item) => item.analysis.type === 'increase'),
    maintain: exerciseSuggestions.filter((item) => item.analysis.type === 'maintain' || item.analysis.type === 'technique'),
    drop: exerciseSuggestions.filter((item) => item.analysis.type === 'drop' || item.analysis.type === 'stalled'),
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-amberFit">Sugestões da semana</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Progressão sem piloto automático</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Regras locais analisam histórico, RPE e repetições. Nada é aplicado sem sua aprovação.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Podem subir carga" value={grouped.increase.length} tone="mint" />
        <Summary label="Manter ou técnica" value={grouped.maintain.length} tone="cyan" />
        <Summary label="Atenção/queda" value={grouped.drop.length} tone="coral" />
        <Summary label="Cardios pendentes" value={pendingCardios} tone="amber" />
      </section>

      <SuggestionGroup title="Exercícios que podem subir carga" icon={Dumbbell} items={grouped.increase} onDecision={setDecision} onEditPlan={onEditPlan} />
      <SuggestionGroup title="Exercícios que devem manter carga ou técnica" icon={ThumbsUp} items={grouped.maintain} onDecision={setDecision} onEditPlan={onEditPlan} />
      <SuggestionGroup title="Queda de desempenho ou estagnação" icon={XCircle} items={grouped.drop} onDecision={setDecision} onEditPlan={onEditPlan} />

      <section className="card p-4">
        <h2 className="text-xl font-black text-white">Treinos não concluídos</h2>
        <div className="mt-3 grid gap-2">
          {notCompletedWorkouts.length ? (
            notCompletedWorkouts.map(({ workout, completed, total }) => (
              <div key={workout.id} className="rounded-lg bg-ink px-3 py-3">
                <p className="font-black text-white">{workout.day} — {workout.title}</p>
                <p className="mt-1 text-sm text-slate-400">{completed}/{total} exercícios concluídos</p>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-mint/30 bg-mint/10 px-3 py-3 text-sm font-bold text-mint">Todos os treinos do plano estão marcados como concluídos.</p>
          )}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="flex items-center gap-2 text-xl font-black text-white">
          <HeartPulse className="text-coral" size={22} />
          Cardio
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Semana atual: {cardioCount}/{goals.weeklyCardio} cardios marcados. Opções disponíveis: {cardioOptions.map((item) => item.name).join(', ')}.
        </p>
      </section>
    </div>
  );
}

function SuggestionGroup({ title, icon: Icon, items, onDecision, onEditPlan }) {
  return (
    <section className="card p-4">
      <h2 className="flex items-center gap-2 text-xl font-black text-white">
        <Icon className="text-cyanFit" size={22} />
        {title}
      </h2>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="rounded-lg border border-line bg-ink p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{item.exercise.name}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{item.workout.day} • {item.analysis.title}</p>
                </div>
                {item.decision && <span className="rounded-lg bg-panelSoft px-2 py-1 text-xs font-bold text-mint">{labelDecision(item.decision)}</span>}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-300">{item.analysis.message}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <ActionButton icon={CheckCircle2} label="Aplicar sugestão" onClick={() => onDecision(item.id, 'applied')} />
                <ActionButton icon={XCircle} label="Ignorar" onClick={() => onDecision(item.id, 'ignored')} />
                <ActionButton
                  icon={Edit3}
                  label="Editar manualmente"
                  onClick={() => {
                    onDecision(item.id, 'manual');
                    onEditPlan?.();
                  }}
                />
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-line bg-ink/60 px-3 py-4 text-center text-sm font-semibold text-slate-500">
            Nenhum item nesta categoria hoje.
          </p>
        )}
      </div>
    </section>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-panelSoft px-3 text-sm font-bold text-slate-200 transition hover:text-white">
      <Icon size={16} />
      {label}
    </button>
  );
}

function Summary({ label, value, tone }) {
  const tones = {
    mint: 'text-mint',
    cyan: 'text-cyanFit',
    coral: 'text-coral',
    amber: 'text-amberFit',
  };
  return (
    <div className="card p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function labelDecision(decision) {
  return {
    applied: 'Aplicada',
    ignored: 'Ignorada',
    manual: 'Manual',
  }[decision] || decision;
}
