import { Check, Clock3, RefreshCcw, SkipForward, XCircle } from 'lucide-react';
import { getMealOption, mealStatuses } from '../../utils/nutritionUtils.js';

export function MealCard({ meal, log, onStatus, onSwap }) {
  const option = getMealOption(meal, log.selectedOptionId);
  const status = log.status || 'pending';

  return (
    <article className={`card p-4 transition ${status === 'done' || status === 'swapped' ? 'border-mint/40 bg-mint/10' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-cyanFit">
            <Clock3 size={14} />
            {meal.time}
          </p>
          <h3 className="mt-1 text-xl font-black text-white">{meal.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{meal.description}</p>
        </div>
        <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-black ${statusClasses[status] || statusClasses.pending}`}>
          {mealStatuses[status]}
        </span>
      </div>

      <div className="mt-4 rounded-lg bg-ink px-3 py-3">
        <p className="text-lg font-black text-white">{option.title}</p>
        <p className="mt-1 text-sm font-bold text-mint">{option.estimatedProtein} g proteína estimada · meta {meal.proteinTarget} g</p>
        <ul className="mt-3 grid gap-1 text-sm font-semibold text-slate-300">
          {option.items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1">
          {option.tags.map((tag) => (
            <span key={tag} className="rounded-lg bg-panelSoft px-2 py-1 text-xs font-bold text-cyanFit">{tag}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Action icon={Check} label="Feito" onClick={() => onStatus('done')} strong />
        <Action icon={SkipForward} label="Pulei" onClick={() => onStatus('skipped')} />
        <Action icon={XCircle} label="Fora do plano" onClick={() => onStatus('offPlan')} danger />
        <Action icon={RefreshCcw} label="Trocar opção" onClick={onSwap} />
      </div>
    </article>
  );
}

const statusClasses = {
  pending: 'bg-panelSoft text-slate-300',
  done: 'bg-mint text-ink',
  skipped: 'bg-slate-700 text-slate-200',
  offPlan: 'bg-coral/20 text-coral',
  swapped: 'bg-amberFit/20 text-amberFit',
};

function Action({ icon: Icon, label, onClick, strong = false, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-sm font-black transition ${
        strong
          ? 'bg-mint text-ink hover:bg-green-300'
          : danger
            ? 'border border-coral/40 bg-coral/10 text-coral hover:bg-coral/20'
            : 'bg-panelSoft text-slate-200 hover:text-white'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
