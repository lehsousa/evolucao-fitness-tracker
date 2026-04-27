import { getExerciseById } from '../data/exercises.js';
import { formatDate } from './date.js';

export function applyWorkoutSuggestion(suggestion, currentPlan) {
  const now = new Date().toISOString();
  const plan = clonePlan(currentPlan);
  let before = null;
  let after = null;

  if (suggestion.type === 'keep_plan' || suggestion.type === 'deload_week' || suggestion.type === 'reorder_exercises') {
    return {
      plan,
      change: buildChange(suggestion, now, before, after),
    };
  }

  const workout = plan.find((item) => item.id === suggestion.dayId);
  if (!workout) throw new Error('Treino da sugestão não encontrado.');
  const target = workout.items.find((item) => item.exerciseId === suggestion.exerciseId);
  if (!target) throw new Error('Exercício da sugestão não encontrado no plano.');

  const currentExercise = getExerciseById(target.exerciseId);
  before = {
    exerciseId: target.exerciseId,
    name: currentExercise?.name || suggestion.currentExerciseName || target.exerciseId,
    sets: target.sets,
    reps: target.reps,
    restSeconds: target.restSeconds,
    notes: target.notes || '',
  };

  if (suggestion.type === 'swap_exercise' && suggestion.suggestedExerciseId) {
    const suggestedExercise = getExerciseById(suggestion.suggestedExerciseId);
    if (!suggestedExercise) throw new Error('Exercício sugerido não existe na biblioteca.');
    target.exerciseId = suggestion.suggestedExerciseId;
    target.sets = suggestion.suggestedSets ?? target.sets ?? suggestedExercise?.defaultSets ?? 3;
    target.reps = suggestion.suggestedReps ?? target.reps ?? suggestedExercise?.defaultReps ?? '8-12';
    target.restSeconds = suggestion.suggestedRestSeconds ?? target.restSeconds ?? suggestedExercise?.restSeconds ?? 60;
  }

  if (suggestion.type === 'adjust_sets') {
    target.sets = Number(suggestion.suggestedSets) || target.sets;
  }

  if (suggestion.type === 'adjust_reps') {
    target.reps = suggestion.suggestedReps || target.reps;
  }

  if (suggestion.type === 'adjust_rest') {
    target.restSeconds = Number(suggestion.suggestedRestSeconds) || target.restSeconds;
  }

  target.adjustedByCoach = true;
  target.coachSuggestionId = suggestion.id;
  target.notes = appendCoachNote(target.notes, now);

  const nextExercise = getExerciseById(target.exerciseId);
  after = {
    exerciseId: target.exerciseId,
    name: nextExercise?.name || suggestion.suggestedExerciseName || target.exerciseId,
    sets: target.sets,
    reps: target.reps,
    restSeconds: target.restSeconds,
    notes: target.notes || '',
  };

  return {
    plan,
    change: buildChange(suggestion, now, before, after),
  };
}

export function markSuggestionApplied(suggestion) {
  const now = new Date().toISOString();
  return {
    ...suggestion,
    status: 'applied',
    appliedAt: now,
    rejectedAt: null,
  };
}

export function markSuggestionRejected(suggestion) {
  return {
    ...suggestion,
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
  };
}

export function approveAndApplySuggestion(suggestionId, suggestions, currentPlan) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const suggestion = safeSuggestions.find((item) => item.id === suggestionId);
  if (!suggestion) throw new Error('Sugestão não encontrada.');
  const result = applyWorkoutSuggestion(suggestion, currentPlan);
  return {
    ...result,
    suggestions: safeSuggestions.map((item) => (item.id === suggestionId ? markSuggestionApplied(item) : item)),
  };
}

export function rejectWorkoutSuggestion(suggestionId, suggestions) {
  return (Array.isArray(suggestions) ? suggestions : []).map((item) =>
    item.id === suggestionId ? markSuggestionRejected(item) : item,
  );
}

export function getActiveWorkoutPlan(savedPlan, defaultPlan) {
  return Array.isArray(savedPlan) && savedPlan.length ? savedPlan : defaultPlan;
}

export function restoreDefaultWorkoutPlan() {
  return null;
}

function buildChange(suggestion, date, before, after) {
  return {
    id: crypto.randomUUID(),
    date,
    source: 'coach',
    suggestionId: suggestion.id,
    type: suggestion.type,
    dayId: suggestion.dayId,
    before,
    after,
    reason: suggestion.reason,
  };
}

function appendCoachNote(notes, date) {
  const marker = `Alterado por sugestão do Coach em ${formatDate(date.slice(0, 10))}.`;
  return notes ? `${notes}\n${marker}` : marker;
}

function clonePlan(plan) {
  return JSON.parse(JSON.stringify(Array.isArray(plan) ? plan : []));
}
