import { goals } from '../data/plan.js';
import { getExerciseById } from '../data/exercises.js';
import { weekKey } from './date.js';
import { getEstimatedVolume } from './workoutUtils.js';

const PAIN_WORDS = ['dor', 'ombro', 'joelho', 'lombar', 'punho'];

export function analyzeWorkoutForSuggestions(data) {
  const plan = Array.isArray(data?.plan) ? data.plan : [];
  const history = Array.isArray(data?.exerciseLoadHistory) ? data.exerciseLoadHistory : [];
  const substitutions = isPlainObject(data?.workoutSubstitutions) ? data.workoutSubstitutions : {};
  const checkins = Array.isArray(data?.checkins) ? data.checkins : [];
  const workoutDoneByDate = isPlainObject(data?.completedExercises) ? data.completedExercises : {};
  const cardioDoneByWeek = isPlainObject(data?.cardioLogs) ? data.cardioLogs : {};
  const currentWeek = data?.week || weekKey();
  const completedThisWeek = countCompletedWorkoutDays(workoutDoneByDate);
  const cardioCount = Object.values(cardioDoneByWeek[currentWeek] || {}).filter(Boolean).length;
  const sleepAverage = average(checkins.slice(-7).map((item) => Number(item.sleepHours)).filter(Boolean));
  const notesText = checkins.slice(-7).map((item) => item.notes || item.observations || '').join(' ').toLowerCase();
  const hasPainNote = PAIN_WORDS.some((word) => notesText.includes(word));
  const suggestions = [];

  if (completedThisWeek < 3) {
    suggestions.push(makeSuggestion({
      type: 'keep_plan',
      priority: 'high',
      reason: `A semana teve ${completedThisWeek} treino(s) concluído(s). Antes de mudar o plano, a prioridade é consistência.`,
      expectedBenefit: 'Evitar mudanças desnecessárias e proteger a rotina base.',
      safetyNote: 'Mantenha o plano por mais 1 semana e reavalie após treinar com regularidade.',
    }));
    return uniqueSuggestions(suggestions);
  }

  if (hasPainNote) {
    suggestions.push(makeSuggestion({
      type: 'keep_plan',
      priority: 'high',
      reason: 'Há observações recentes com possível dor ou desconforto.',
      expectedBenefit: 'Evitar aumento de carga ou mudanças agressivas enquanto há desconforto.',
      safetyNote: 'Não é diagnóstico. Se a dor persistir, procure um profissional qualificado.',
    }));
  }

  const highRpeExercises = new Set();
  const improvingExercises = new Set();

  for (const workout of plan) {
    for (const item of workout.items || []) {
      if (!item.exerciseId) continue;
      const exercise = getExerciseById(item.exerciseId);
      if (!exercise) continue;
      const exerciseHistory = getHistory(history, item.exerciseId);
      const lastThree = exerciseHistory.slice(0, 3);
      const lastTwo = exerciseHistory.slice(0, 2);
      const officialSwap = getFrequentSubstitution(substitutions, item.exerciseId);

      if (lastThree.length >= 3 && !hasWeightProgress(lastThree)) {
        const alternative = findAlternative(exercise, officialSwap);
        suggestions.push(makeSuggestion({
          type: alternative ? 'swap_exercise' : 'adjust_rest',
          priority: 'medium',
          dayId: workout.id,
          exerciseId: item.exerciseId,
          currentExerciseName: exercise.name,
          suggestedExerciseId: alternative?.id,
          suggestedExerciseName: alternative?.name,
          suggestedRestSeconds: alternative ? undefined : Math.max(Number(item.restSeconds || exercise.restSeconds || 60), 90),
          reason: 'Sem evolução de carga nas últimas 3 sessões registradas.',
          expectedBenefit: alternative
            ? 'Manter estímulo muscular com uma variação equivalente e possivelmente mais estável.'
            : 'Dar mais recuperação entre séries antes de trocar o exercício.',
          safetyNote: 'Aplicar por 2 semanas e reavaliar técnica, RPE e carga.',
        }));
      }

      if (lastTwo.length >= 2 && lastTwo.every((entry) => Number(entry.rpe) >= 9)) {
        highRpeExercises.add(item.exerciseId);
        suggestions.push(makeSuggestion({
          type: 'adjust_rest',
          priority: 'high',
          dayId: workout.id,
          exerciseId: item.exerciseId,
          currentExerciseName: exercise.name,
          suggestedRestSeconds: Math.max(Number(item.restSeconds || exercise.restSeconds || 60), 90),
          reason: 'RPE 9 ou maior em 2 sessões seguidas.',
          expectedBenefit: 'Aumentar recuperação entre séries sem mudar o plano inteiro.',
          safetyNote: 'Não aumentar carga automaticamente. Ajuste apenas após aprovação.',
        }));
      }

      if (officialSwap) {
        const alternative = findAlternative(exercise, officialSwap);
        if (!alternative) continue;
        suggestions.push(makeSuggestion({
          type: 'swap_exercise',
          priority: 'medium',
          dayId: workout.id,
          exerciseId: item.exerciseId,
          currentExerciseName: exercise.name,
          suggestedExerciseId: alternative.id,
          suggestedExerciseName: alternative.name,
          reason: 'Este exercício foi substituído 2 vezes ou mais por aparelho ocupado.',
          expectedBenefit: 'Reduzir atrito no treino e deixar o plano mais realista para a academia.',
          safetyNote: 'A troca oficial só acontece se você aprovar.',
        }));
      }

      if (lastTwo.length >= 2 && (Number(lastTwo[0].weight) > Number(lastTwo[1].weight) || getEstimatedVolume(lastTwo[0]) > getEstimatedVolume(lastTwo[1]))) {
        improvingExercises.add(item.exerciseId);
      }
    }
  }

  if (sleepAverage > 0 && sleepAverage < 6 && highRpeExercises.size) {
    const target = findFirstMainExercise(plan, highRpeExercises);
    if (target) {
      suggestions.push(makeSuggestion({
        type: 'adjust_sets',
        priority: 'high',
        dayId: target.workout.id,
        exerciseId: target.item.exerciseId,
        currentExerciseName: getExerciseById(target.item.exerciseId)?.name,
        suggestedSets: Math.max(1, Number(target.item.sets || 1) - 1),
        reason: `Sono médio recente abaixo de 6h e RPE alto em exercícios do plano.`,
        expectedBenefit: 'Reduzir volume por 1 semana para melhorar recuperação.',
        safetyNote: 'Aplicar como ajuste temporário e reavaliar na próxima semana.',
      }));
    }
  }

  if (cardioCount < goals.weeklyCardio) {
    suggestions.push(makeSuggestion({
      type: 'keep_plan',
      priority: 'medium',
      reason: `Cardio ficou em ${cardioCount}/${goals.weeklyCardio}. Não é necessário mexer na musculação primeiro.`,
      expectedBenefit: 'Priorizar aderência ao cardio sem bagunçar o treino de força.',
      safetyNote: 'Inclua cardio progressivo e confortável, sem compensações agressivas.',
    }));
  }

  if (improvingExercises.size >= 4 && completedThisWeek >= 4) {
    suggestions.push(makeSuggestion({
      type: 'keep_plan',
      priority: 'low',
      reason: 'Cargas ou volume estão subindo e a semana teve boa conclusão de treinos.',
      expectedBenefit: 'Continuar o que está funcionando antes de trocar exercícios.',
      safetyNote: 'Mantenha técnica e RPE sob controle.',
    }));
  }

  if (!suggestions.length) {
    suggestions.push(makeSuggestion({
      type: 'keep_plan',
      priority: 'low',
      reason: 'Não há sinal forte para alterar o plano agora.',
      expectedBenefit: 'Manter consistência e acumular mais dados antes de mudanças.',
      safetyNote: 'Reavalie após novos registros de carga, sono e check-ins.',
    }));
  }

  return uniqueSuggestions(suggestions);
}

export function generateSuggestionId() {
  return crypto.randomUUID();
}

function makeSuggestion(partial) {
  const now = new Date().toISOString();
  return {
    id: generateSuggestionId(),
    createdAt: now,
    status: 'pending',
    type: partial.type,
    priority: partial.priority || 'medium',
    dayId: partial.dayId || '',
    exerciseId: partial.exerciseId || '',
    currentExerciseName: partial.currentExerciseName || '',
    suggestedExerciseId: partial.suggestedExerciseId || '',
    suggestedExerciseName: partial.suggestedExerciseName || '',
    suggestedSets: partial.suggestedSets,
    suggestedReps: partial.suggestedReps,
    suggestedRestSeconds: partial.suggestedRestSeconds,
    reason: partial.reason,
    expectedBenefit: partial.expectedBenefit,
    safetyNote: partial.safetyNote,
    requiresApproval: true,
    appliedAt: null,
    rejectedAt: null,
  };
}

function getHistory(history, exerciseId) {
  return history
    .filter((entry) => entry.exerciseId === exerciseId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function hasWeightProgress(entries) {
  const weights = entries.map((entry) => Number(entry.weight) || 0);
  return weights[0] > weights[1] || weights[1] > weights[2];
}

function getFrequentSubstitution(substitutions, exerciseId) {
  const counts = {};
  Object.values(substitutions).forEach((day) => {
    const alternativeId = day?.[exerciseId];
    if (alternativeId) counts[alternativeId] = (counts[alternativeId] || 0) + 1;
  });
  return Object.entries(counts).find(([, count]) => count >= 2)?.[0] || '';
}

function findAlternative(exercise, preferredId) {
  if (!exercise?.alternatives?.length) return null;
  const available = exercise.alternatives.filter((item) => getExerciseById(item.id));
  if (!available.length) return null;
  return available.find((item) => item.id === preferredId) || available[0];
}

function countCompletedWorkoutDays(workoutDoneByDate) {
  return Object.entries(workoutDoneByDate)
    .filter(([date]) => isWithinLastDays(date, 7))
    .filter(([, day]) => day && Object.values(day).some(Boolean)).length;
}

function isWithinLastDays(dateString, days) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const limit = new Date();
  limit.setDate(limit.getDate() - days);
  return date >= limit;
}

function findFirstMainExercise(plan, exerciseIds) {
  for (const workout of plan) {
    for (const item of workout.items || []) {
      if (exerciseIds.has(item.exerciseId) && Number(item.sets) >= 3) {
        return { workout, item };
      }
    }
  }
  return null;
}

function uniqueSuggestions(suggestions) {
  const seen = new Set();
  return suggestions.filter((suggestion) => {
    const key = `${suggestion.type}-${suggestion.dayId}-${suggestion.exerciseId}-${suggestion.suggestedExerciseId}-${suggestion.suggestedSets}-${suggestion.suggestedRestSeconds}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
