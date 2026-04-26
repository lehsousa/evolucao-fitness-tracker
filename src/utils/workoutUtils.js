export function getExerciseHistory(history, exerciseId) {
  return history
    .filter((entry) => entry.exerciseId === exerciseId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getLastLoad(history) {
  return [...history].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function getBestLoad(history) {
  return history.reduce((best, entry) => (Number(entry.weight) > Number(best?.weight || 0) ? entry : best), null);
}

export function getAverageReps(reps) {
  if (typeof reps === 'number') return reps;
  if (!reps) return 0;

  const values = String(reps)
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return Number(reps) || 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getEstimatedVolume(entry) {
  if (!entry) return 0;
  return Math.round((Number(entry.sets) || 0) * getAverageReps(entry.reps) * (Number(entry.weight) || 0));
}

export function repsReachTarget(reps, targetReps) {
  const average = getAverageReps(reps);
  const match = String(targetReps || '').match(/(\d+)(?:-(\d+))?/);
  if (!match) return average > 0;
  const target = Number(match[2] || match[1]);
  return average >= target;
}

export function getProgressionSuggestion(exerciseHistory, targetReps) {
  return analyzeExerciseProgression(exerciseHistory, targetReps).message;
}

export function analyzeExerciseProgression(exerciseHistory, targetReps) {
  const sorted = [...exerciseHistory].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0];
  const previous = sorted[1];

  if (!last) {
    return {
      type: 'technique',
      title: 'Começar com técnica',
      message: 'Sem histórico. Comece com uma carga confortável, priorize técnica e registre o primeiro treino.',
      currentWeight: 0,
      suggestedWeight: 0,
    };
  }

  const lastWeight = Number(last.weight) || 0;
  const nextSmall = Math.round(lastWeight * 1.025 * 2) / 2;
  const nextBig = Math.round(lastWeight * 1.05 * 2) / 2;
  const rpe = Number(last.rpe) || 0;
  const reachedTarget = repsReachTarget(last.reps, targetReps);

  if (previous && getEstimatedVolume(last) < getEstimatedVolume(previous) * 0.9) {
    return {
      type: 'drop',
      title: 'Queda de desempenho',
      message: `Houve queda de desempenho. Mantenha ${lastWeight} kg e busque uma execução mais sólida antes de subir.`,
      currentWeight: lastWeight,
      suggestedWeight: lastWeight,
    };
  }

  if (sorted.length >= 3) {
    const [a, b, c] = sorted;
    const sameOrLower = Number(a.weight) <= Number(b.weight) && Number(b.weight) <= Number(c.weight);
    if (sameOrLower && getEstimatedVolume(a) <= getEstimatedVolume(c) * 1.05) {
      return {
        type: 'stalled',
        title: 'Três sessões sem evolução clara',
        message: 'Você está há 3 sessões sem evolução clara. Revise técnica, descanso ou considere uma alternativa equivalente.',
        currentWeight: lastWeight,
        suggestedWeight: lastWeight,
      };
    }
  }

  if (rpe > 0 && rpe <= 7 && reachedTarget) {
    return {
      type: 'increase',
      title: 'Pode subir carga',
      message: `Última carga: ${lastWeight} kg. Se a execução estiver boa, tente entre ${nextSmall} kg e ${nextBig} kg no próximo treino.`,
      currentWeight: lastWeight,
      suggestedWeight: nextSmall,
    };
  }

  if (rpe >= 9) {
    return {
      type: 'maintain',
      title: 'Esforço alto',
      message: 'RPE alto. Mantenha a carga ou reduza um pouco e priorize execução.',
      currentWeight: lastWeight,
      suggestedWeight: lastWeight,
    };
  }

  if (reachedTarget) {
    return {
      type: 'increase',
      title: 'Meta de repetições atingida',
      message: 'Você chegou na meta de repetições. Considere subir pouco a carga, mantendo técnica limpa.',
      currentWeight: lastWeight,
      suggestedWeight: nextSmall,
    };
  }

  return {
    type: 'maintain',
    title: 'Manter carga',
    message: `Mantenha ${lastWeight} kg até completar a faixa de repetições com boa execução.`,
    currentWeight: lastWeight,
    suggestedWeight: lastWeight,
  };
}
