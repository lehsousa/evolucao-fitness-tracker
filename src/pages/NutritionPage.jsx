import { useMemo, useState } from 'react';
import { MealCard } from '../components/nutrition/MealCard.jsx';
import { MealHistoryList } from '../components/nutrition/MealHistoryList.jsx';
import { MealOptionsModal } from '../components/nutrition/MealOptionsModal.jsx';
import { NutritionChecklist } from '../components/nutrition/NutritionChecklist.jsx';
import { NutritionDashboard } from '../components/nutrition/NutritionDashboard.jsx';
import { ProteinProgress } from '../components/nutrition/ProteinProgress.jsx';
import { ShoppingList } from '../components/nutrition/ShoppingList.jsx';
import { WaterTracker } from '../components/nutrition/WaterTracker.jsx';
import { dailyMealPlan, nutritionTargets } from '../data/nutritionPlan.js';
import { useNutritionLog } from '../hooks/useNutritionLog.js';
import { calculateNutritionSummary, getLastNutritionDays } from '../utils/nutritionUtils.js';

export function NutritionPage({ latestCheckin }) {
  const { logs, todayLog, setMealStatus, selectMealOption, addWater } = useNutritionLog();
  const [selectedMealId, setSelectedMealId] = useState(null);
  const summary = useMemo(() => calculateNutritionSummary(todayLog), [todayLog]);
  const history = useMemo(() => getLastNutritionDays(logs, 7), [logs]);
  const selectedMeal = dailyMealPlan.find((meal) => meal.id === selectedMealId);

  function chooseOption(optionId) {
    if (!selectedMeal) return;
    selectMealOption(selectedMeal.id, optionId);
    setSelectedMealId(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-mint">Plano Alimentar</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Redução de gordura com preservação muscular</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">{nutritionTargets.goal}. Plano inicial sem backend, salvo no navegador.</p>
      </div>

      <NutritionDashboard targets={nutritionTargets} currentWeight={latestCheckin?.weight || 100} />

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <ProteinProgress summary={summary} target={nutritionTargets.protein} />
        <WaterTracker waterMl={todayLog.waterMl} summary={summary} targets={nutritionTargets} onAddWater={addWater} />
      </section>

      <NutritionChecklist summary={summary} />

      <section className="grid gap-4 xl:grid-cols-2">
        {dailyMealPlan.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            log={todayLog.meals[meal.id]}
            onStatus={(status) => setMealStatus(meal.id, status)}
            onSwap={() => setSelectedMealId(meal.id)}
          />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <MealHistoryList days={history} />
        <ShoppingList />
      </section>

      <MealOptionsModal
        meal={selectedMeal}
        selectedOptionId={selectedMeal ? todayLog.meals[selectedMeal.id]?.selectedOptionId : ''}
        onSelect={chooseOption}
        onClose={() => setSelectedMealId(null)}
      />
    </div>
  );
}
