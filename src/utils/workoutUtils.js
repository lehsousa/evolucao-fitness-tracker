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
  const sorted = [...exerciseHistory].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0];
  const previous = sorted[1];

  if (!last) {
    return 'Sem histórico. Comece com uma carga confortável, priorize técnica e registre o primeiro treino.';
  }

  const lastWeight = Number(last.weight) || 0;
  const nextSmall = Math.round(lastWeight * 1.025 * 2) / 2;
  const nextBig = Math.round(lastWeight * 1.05 * 2) / 2;
  const rpe = Number(last.rpe) || 0;
  const reachedTarget = repsReachTarget(last.reps, targetReps);

  if (previous && getEstimatedVolume(last) < getEstimatedVolume(previous) * 0.9) {
    return `Houve queda de desempenho. Mantenha ${lastWeight} kg e busque uma execução mais sólida antes de subir.`;
  }

  if (rpe > 0 && rpe <= 7 && reachedTarget) {
    return `Última carga: ${lastWeight} kg. Se a execução estiver boa, tente entre ${nextSmall} kg e ${nextBig} kg no próximo treino.`;
  }

  if (rpe >= 9) {
    return 'RPE alto. Mantenha a carga ou reduza um pouco e priorize execução.';
  }

  if (reachedTarget) {
    return `Você chegou na meta de repetições. Considere subir pouco a carga, mantendo técnica limpa.`;
  }

  return `Mantenha ${lastWeight} kg até completar a faixa de repetições com boa execução.`;
}
