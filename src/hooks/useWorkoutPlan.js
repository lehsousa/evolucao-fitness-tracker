import { workoutPlan as defaultWorkoutPlan } from '../data/workoutPlan.js';
import { useLocalStorage } from './useLocalStorage.js';

export function useWorkoutPlan() {
  const [savedPlan, setSavedPlan] = useLocalStorage('customWorkoutPlan', null);
  const normalizedDefaultPlan = normalizePlan(defaultWorkoutPlan);
  const customPlan = normalizePlan(savedPlan);
  const plan = customPlan || normalizedDefaultPlan;

  function savePlan(nextPlan) {
    setSavedPlan(normalizePlan(nextPlan) || normalizedDefaultPlan);
  }

  function restoreDefaultPlan() {
    setSavedPlan(null);
  }

  return {
    plan,
    isCustomPlan: Boolean(customPlan),
    savePlan,
    restoreDefaultPlan,
    defaultWorkoutPlan: normalizedDefaultPlan,
  };
}

function normalizePlan(plan) {
  if (!Array.isArray(plan) || !plan.length) return null;

  return plan.map((workout, index) => ({
    id: workout.id || `treino-${Date.now()}-${index}`,
    day: workout.day || `Dia ${index + 1}`,
    title: workout.title || 'Treino sem nome',
    focus: workout.focus || '',
    notes: workout.notes || '',
    items: Array.isArray(workout.items)
      ? workout.items.map((item, itemIndex) => ({
          exerciseId: item.exerciseId || '',
          customName: item.customName || '',
          type: item.type || (item.exerciseId ? 'exercise' : 'custom'),
          sets: Number(item.sets) || 0,
          reps: String(item.reps || ''),
          restSeconds: Number(item.restSeconds) || 0,
          notes: item.notes || '',
          adjustedByCoach: Boolean(item.adjustedByCoach),
          coachSuggestionId: item.coachSuggestionId || '',
          id: item.id || `${workout.id || index}-item-${itemIndex}`,
        }))
      : [],
  }));
}
