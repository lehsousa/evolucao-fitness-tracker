import { useLocalStorage } from './useLocalStorage.js';
import { todayKey } from '../utils/date.js';
import { createDefaultNutritionDay, normalizeNutritionDay } from '../utils/nutritionUtils.js';

export function useNutritionLog() {
  const [logs, setLogs] = useLocalStorage('nutritionLogs', {});
  const today = todayKey();
  const safeLogs = logs && typeof logs === 'object' && !Array.isArray(logs) ? logs : {};
  const todayLog = normalizeNutritionDay(safeLogs[today] || createDefaultNutritionDay(today), today);

  function updateToday(updater) {
    setLogs((current) => {
      const safeCurrent = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
      const currentDay = normalizeNutritionDay(safeCurrent[today] || createDefaultNutritionDay(today), today);
      const nextDay = typeof updater === 'function' ? updater(currentDay) : updater;
      return {
        ...safeCurrent,
        [today]: normalizeNutritionDay(nextDay, today),
      };
    });
  }

  function setMealStatus(mealId, status) {
    updateToday((day) => ({
      ...day,
      meals: {
        ...day.meals,
        [mealId]: {
          ...day.meals[mealId],
          status,
        },
      },
    }));
  }

  function selectMealOption(mealId, optionId) {
    updateToday((day) => ({
      ...day,
      meals: {
        ...day.meals,
        [mealId]: {
          ...day.meals[mealId],
          selectedOptionId: optionId,
          status: day.meals[mealId]?.status === 'pending' ? 'swapped' : day.meals[mealId]?.status || 'swapped',
        },
      },
    }));
  }

  function addWater(amountMl) {
    updateToday((day) => ({
      ...day,
      waterMl: Math.max(0, (Number(day.waterMl) || 0) + amountMl),
    }));
  }

  return {
    logs: safeLogs,
    todayLog,
    setMealStatus,
    selectMealOption,
    addWater,
  };
}
