import { goals } from '../data/plan.js';
import { weekKey } from './date.js';
import { getEstimatedVolume } from './workoutUtils.js';

export function generateWeeklyCoachReport(data) {
  const checkins = Array.isArray(data?.checkins) ? [...data.checkins].sort((a, b) => a.date.localeCompare(b.date)) : [];
  const exerciseHistory = Array.isArray(data?.exerciseHistory) ? data.exerciseHistory : [];
  const workoutDoneByDate = isPlainObject(data?.workoutDoneByDate) ? data.workoutDoneByDate : {};
  const cardioDoneByWeek = isPlainObject(data?.cardioDoneByWeek) ? data.cardioDoneByWeek : {};
  const week = data?.week || weekKey();
  const weekDates = getLastDays(7);
  const weekCheckins = checkins.filter((item) => weekDates.includes(item.date));
  const firstCheckin = checkins[0];
  const latestCheckin = checkins.at(-1);
  const firstWeekCheckin = weekCheckins[0] || firstCheckin;
  const latestWeekCheckin = weekCheckins.at(-1) || latestCheckin;

  const workoutsCompleted = countCompletedWorkouts(workoutDoneByDate, weekDates);
  const cardiosCompleted = Object.values(cardioDoneByWeek[week] || {}).filter(Boolean).length;
  const averageSteps = average(weekCheckins.map((item) => Number(item.steps)).filter(Boolean));
  const averageSleep = average(weekCheckins.map((item) => Number(item.sleepHours)).filter(Boolean));
  const loadEvolution = getLoadEvolution(exerciseHistory);
  const weightDiff = diff(latestCheckin?.weight, firstCheckin?.weight ?? goals.initialWeight);
  const waistDiff = diff(latestWeekCheckin?.waist, firstWeekCheckin?.waist);

  const positives = [];
  const attentionPoints = [];
  const nextWeekActions = [];
  const trainingSuggestions = [];
  const cardioSuggestions = [];
  const nutritionReminders = [];

  if (workoutsCompleted >= 3) positives.push(`Boa constância nos treinos: ${workoutsCompleted} sessões marcadas nos últimos 7 dias.`);
  if (cardiosCompleted >= goals.weeklyCardio) positives.push(`Meta de cardio batida: ${cardiosCompleted}/${goals.weeklyCardio} na semana.`);
  if (Number.isFinite(waistDiff) && waistDiff < 0) positives.push(`Cintura reduziu ${Math.abs(waistDiff).toFixed(1)} cm no recorte analisado.`);
  if (loadEvolution.improvedExercises > 0) positives.push(`${loadEvolution.improvedExercises} exercício(s) tiveram evolução de carga ou volume.`);
  if (averageSteps >= 7000) positives.push(`Média de passos forte: ${Math.round(averageSteps).toLocaleString('pt-BR')} passos/dia.`);
  if (!positives.length) positives.push('Você já tem a estrutura do acompanhamento pronta. O próximo ganho vem de registrar com mais regularidade.');

  if (workoutsCompleted < 3) attentionPoints.push('Treinos marcados ficaram abaixo de 3 sessões. Vale proteger horários fixos na agenda.');
  if (cardiosCompleted < goals.weeklyCardio) attentionPoints.push(`Cardio ficou em ${cardiosCompleted}/${goals.weeklyCardio}. Suba aos poucos, sem transformar recuperação em castigo.`);
  if (averageSteps > 0 && averageSteps < 6000) attentionPoints.push(`Passos médios em ${Math.round(averageSteps).toLocaleString('pt-BR')}/dia. Um bloco curto de caminhada pode ajudar.`);
  if (averageSleep > 0 && averageSleep < 6.5) attentionPoints.push(`Sono médio de ${averageSleep.toFixed(1)}h. Recuperação pode limitar força, fome e disposição.`);
  if (Number.isFinite(waistDiff) && waistDiff > 0) attentionPoints.push(`Cintura subiu ${waistDiff.toFixed(1)} cm no período. Observe rotina, sono, hidratação e consistência.`);
  if (!weekCheckins.length) attentionPoints.push('Sem check-ins nos últimos 7 dias. O Coach fica mais preciso com peso, cintura, passos e sono registrados.');

  nextWeekActions.push('Escolha os treinos da semana e confirme no app apenas depois de executar.');
  nextWeekActions.push('Mantenha o check-in de manhã com peso, cintura, passos e sono.');
  nextWeekActions.push('Revise as sugestões de carga antes do treino e aplique somente se a execução estiver boa.');
  if (cardiosCompleted < goals.weeklyCardio) nextWeekActions.push(`Planeje ${goals.weeklyCardio - cardiosCompleted} cardio(s) pendente(s) em dias de menor fadiga.`);

  trainingSuggestions.push(loadEvolution.message);
  trainingSuggestions.push('Não altere o plano automaticamente: aprove ou edite cada ajuste no Editor de Treino.');
  if (workoutsCompleted < 3) trainingSuggestions.push('Priorize completar os treinos base antes de adicionar volume extra.');

  cardioSuggestions.push(cardiosCompleted >= goals.weeklyCardio ? 'Mantenha a meta semanal de cardio e preserve intensidade moderada.' : 'Use caminhada, bike ou circuito baixo impacto para completar a meta semanal.');
  cardioSuggestions.push('Se pernas estiverem muito cansadas, prefira cardio leve e controle a duração.');

  nutritionReminders.push(`Proteína diária alvo: cerca de ${goals.dailyProtein} g, distribuída ao longo do dia.`);
  nutritionReminders.push(`Água: mantenha ${goals.waterRange}, ajustando por calor e suor.`);
  nutritionReminders.push('Evite compensações agressivas. Consistência alimentar costuma vencer extremos de curto prazo.');

  return {
    summary: {
      week,
      initialWeight: firstCheckin?.weight ?? goals.initialWeight,
      currentWeight: latestCheckin?.weight ?? 0,
      weightDiff,
      initialWaist: firstWeekCheckin?.waist ?? 0,
      currentWaist: latestWeekCheckin?.waist ?? 0,
      waistDiff,
      workoutsCompleted,
      cardiosCompleted,
      averageSteps: Math.round(averageSteps || 0),
      averageSleep: Number((averageSleep || 0).toFixed(1)),
      loadEvolution: loadEvolution.label,
      checkinsCount: weekCheckins.length,
    },
    positives,
    attentionPoints,
    nextWeekActions,
    trainingSuggestions,
    cardioSuggestions,
    nutritionReminders,
  };
}

function getLoadEvolution(history) {
  const byExercise = history.reduce((groups, entry) => {
    if (!entry.exerciseId) return groups;
    groups[entry.exerciseId] = [...(groups[entry.exerciseId] || []), entry];
    return groups;
  }, {});

  let improvedExercises = 0;
  let stableExercises = 0;

  Object.values(byExercise).forEach((entries) => {
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const last = sorted[0];
    const previous = sorted[1];
    if (!last || !previous) return;
    const weightImproved = Number(last.weight) > Number(previous.weight);
    const volumeImproved = getEstimatedVolume(last) > getEstimatedVolume(previous);
    if (weightImproved || volumeImproved) improvedExercises += 1;
    else stableExercises += 1;
  });

  if (improvedExercises > 0) {
    return {
      improvedExercises,
      stableExercises,
      label: `${improvedExercises} exercício(s) evoluindo`,
      message: `Há ${improvedExercises} exercício(s) com evolução recente. Continue subindo carga só quando técnica e RPE permitirem.`,
    };
  }

  if (stableExercises > 0) {
    return {
      improvedExercises,
      stableExercises,
      label: 'Cargas estáveis',
      message: 'As cargas parecem estáveis. Isso pode ser adequado se a execução estiver melhorando ou se a semana foi pesada.',
    };
  }

  return {
    improvedExercises,
    stableExercises,
    label: 'Sem histórico suficiente',
    message: 'Ainda não há histórico suficiente de cargas. Registre pelo menos duas sessões por exercício para gerar leitura melhor.',
  };
}

function countCompletedWorkouts(workoutDoneByDate, dates) {
  return dates.reduce((total, date) => {
    const day = workoutDoneByDate[date];
    return total + (day && Object.values(day).some(Boolean) ? 1 : 0);
  }, 0);
}

function getLastDays(amount) {
  return Array.from({ length: amount }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (amount - 1 - index));
    return date.toISOString().slice(0, 10);
  });
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function diff(current, initial) {
  const currentNumber = Number(current);
  const initialNumber = Number(initial);
  if (!Number.isFinite(currentNumber) || !Number.isFinite(initialNumber) || initialNumber === 0) return undefined;
  return currentNumber - initialNumber;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
