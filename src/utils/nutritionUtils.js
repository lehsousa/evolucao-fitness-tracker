import { dailyMealPlan, nutritionTargets } from '../data/nutritionPlan.js';

export const mealStatuses = {
  pending: 'pendente',
  done: 'feito',
  skipped: 'pulei',
  offPlan: 'fora do plano',
  swapped: 'trocado',
};

export function createDefaultNutritionDay(date) {
  return {
    date,
    waterMl: 0,
    meals: dailyMealPlan.reduce((meals, meal) => {
      meals[meal.id] = {
        mealId: meal.id,
        selectedOptionId: meal.options[0]?.id || '',
        status: 'pending',
      };
      return meals;
    }, {}),
  };
}

export function normalizeNutritionDay(day, date) {
  const base = createDefaultNutritionDay(date || day?.date);
  const safeMeals = isPlainObject(day?.meals) ? day.meals : {};

  return {
    ...base,
    ...day,
    date: day?.date || date,
    waterMl: Number(day?.waterMl) || 0,
    meals: dailyMealPlan.reduce((meals, meal) => {
      const saved = safeMeals[meal.id] || {};
      const selectedOptionId = meal.options.some((option) => option.id === saved.selectedOptionId)
        ? saved.selectedOptionId
        : meal.options[0]?.id || '';
      meals[meal.id] = {
        mealId: meal.id,
        selectedOptionId,
        status: Object.keys(mealStatuses).includes(saved.status) ? saved.status : 'pending',
      };
      return meals;
    }, {}),
  };
}

export function getMealOption(meal, optionId) {
  return meal.options.find((option) => option.id === optionId) || meal.options[0];
}

export function calculateNutritionSummary(day) {
  const normalized = normalizeNutritionDay(day, day?.date);
  const mealRows = dailyMealPlan.map((meal) => {
    const log = normalized.meals[meal.id];
    const option = getMealOption(meal, log.selectedOptionId);
    return { meal, log, option };
  });
  const accountableMeals = mealRows.filter(({ meal }) => meal.id !== 'supper');
  const doneMeals = mealRows.filter(({ log }) => log.status === 'done' || log.status === 'swapped');
  const offPlanMeals = mealRows.filter(({ log }) => log.status === 'offPlan');
  const protein = doneMeals.reduce((sum, { option }) => sum + (Number(option?.estimatedProtein) || 0), 0);
  const adherence = accountableMeals.length
    ? Math.round(((accountableMeals.filter(({ log }) => log.status === 'done' || log.status === 'swapped').length - offPlanMeals.length * 0.5) / accountableMeals.length) * 100)
    : 0;

  return {
    protein,
    proteinPercent: clampPercent(Math.round((protein / nutritionTargets.protein) * 100)),
    adherence: clampPercent(adherence),
    mealsDone: doneMeals.length,
    mealsTotal: accountableMeals.length,
    offPlanCount: offPlanMeals.length,
    waterMl: normalized.waterMl,
    waterPercent: clampPercent(Math.round((normalized.waterMl / (nutritionTargets.waterMinLiters * 1000)) * 100)),
  };
}

export function getLastNutritionDays(logs, amount = 7) {
  return Object.values(isPlainObject(logs) ? logs : {})
    .map((day) => normalizeNutritionDay(day, day.date))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, amount);
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
