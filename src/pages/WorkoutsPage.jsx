import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ExerciseCard } from '../components/workout/ExerciseCard.jsx';
import { ExerciseDbAdmin } from '../components/workout/ExerciseDbAdmin.jsx';
import { ExerciseDetailModal } from '../components/workout/ExerciseDetailModal.jsx';
import { getExerciseById } from '../data/exercises.js';
import { useExerciseHistory } from '../hooks/useExerciseHistory.js';
import { useWorkoutPlan } from '../hooks/useWorkoutPlan.js';

export function WorkoutsPage({ workoutDone, toggleExercise }) {
  const {
    selectedWorkoutDay,
    setSelectedWorkoutDay,
    addLoad,
    updateLoad,
    deleteLoad,
    getHistoryByExercise,
    selectSubstitution,
    clearSubstitution,
    getTodaySubstitution,
    exerciseDbMappings,
    saveExerciseDbMapping,
    removeExerciseDbMapping,
  } = useExerciseHistory();
  const { plan: workoutPlan } = useWorkoutPlan();

  const [selected, setSelected] = useState(null);
  const [initialMode, setInitialMode] = useState('details');
  const activeWorkout = useMemo(
    () => workoutPlan.find((workout) => workout.id === selectedWorkoutDay) || workoutPlan[0],
    [selectedWorkoutDay],
  );

  function openExercise(planItem, mode = 'details') {
    const exercise = getExerciseById(planItem.exerciseId);
    if (!exercise) return;
    setSelected({ exercise, planItem });
    setInitialMode(mode);
  }

  function saveLoad(entry) {
    if (entry.id) {
      updateLoad(entry.id, entry);
    } else {
      addLoad(entry);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-mint">Treinos</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Plano semanal inteligente</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Selecione o dia, registre cargas, acompanhe evolução e escolha substituições quando a academia estiver cheia.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {workoutPlan.map((workout) => (
          <button
            key={workout.id}
            type="button"
            onClick={() => setSelectedWorkoutDay(workout.id)}
            className={`min-h-11 shrink-0 rounded-lg px-4 text-sm font-black transition ${
              activeWorkout.id === workout.id ? 'bg-mint text-ink' : 'border border-line bg-panel text-slate-300 hover:text-white'
            }`}
          >
            {workout.day}
          </button>
        ))}
      </div>

      <section className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-cyanFit">{activeWorkout.day}</p>
            <h2 className="mt-1 text-xl font-black text-white">{activeWorkout.title}</h2>
            <p className="mt-1 text-sm text-slate-400">{activeWorkout.focus}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-black text-mint">
            <CheckCircle2 size={18} />
            {activeWorkout.items.filter((item) => item.exerciseId && isExerciseCompleted(workoutDone, activeWorkout, item.exerciseId)).length}/
            {activeWorkout.items.filter((item) => item.exerciseId).length}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {activeWorkout.items.map((planItem) => {
          if (planItem.type === 'cardio') {
            return (
              <article key={planItem.customName} className="card p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-coral">Cardio</p>
                <h3 className="mt-1 text-lg font-black text-white">{planItem.customName}</h3>
                <p className="mt-2 text-sm text-slate-400">{planItem.reps}</p>
              </article>
            );
          }

          const exercise = getExerciseById(planItem.exerciseId);
          if (!exercise) return null;

          const substitutionId = getTodaySubstitution(exercise.id);
          const substitution = exercise.alternatives.find((alternative) => alternative.id === substitutionId);
          const completionKey = `${activeWorkout.id}-${exercise.id}`;

          return (
            <ExerciseCard
              key={completionKey}
              exercise={exercise}
              planItem={planItem}
              completed={isExerciseCompleted(workoutDone, activeWorkout, exercise.id)}
              history={getHistoryByExercise(exercise.id)}
              substitution={substitution?.name}
              onOpen={() => openExercise(planItem)}
              onToggleComplete={() => toggleExercise(completionKey)}
              onQuickRegister={() => openExercise(planItem, 'load')}
              onShowAlternatives={() => openExercise(planItem, 'alternatives')}
            />
          );
        })}
      </div>

      <ExerciseDbAdmin
        mappings={exerciseDbMappings}
        onSaveMapping={saveExerciseDbMapping}
        onRemoveMapping={removeExerciseDbMapping}
      />

      <AnimatePresence>
        {selected && (
          <ExerciseDetailModal
            key={selected.exercise.id}
            exercise={selected.exercise}
            planItem={selected.planItem}
            history={getHistoryByExercise(selected.exercise.id)}
            selectedAlternativeId={getTodaySubstitution(selected.exercise.id)}
            selectedAlternativeName={selected.exercise.alternatives.find((item) => item.id === getTodaySubstitution(selected.exercise.id))?.name}
            exerciseDbMapping={exerciseDbMappings[selected.exercise.id]}
            initialMode={initialMode}
            onClose={() => setSelected(null)}
            onSaveLoad={saveLoad}
            onDeleteLoad={deleteLoad}
            onSelectAlternative={(alternativeId) => selectSubstitution(selected.exercise.id, alternativeId)}
            onClearAlternative={() => clearSubstitution(selected.exercise.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function isExerciseCompleted(workoutDone, workout, exerciseId) {
  return Boolean(workoutDone[`${workout.id}-${exerciseId}`] || workoutDone[`${workout.day}-${exerciseId}`]);
}
