import { X } from 'lucide-react';

export function MealOptionsModal({ meal, selectedOptionId, onSelect, onClose }) {
  if (!meal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-3 py-4 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl rounded-lg border border-line bg-panel shadow-glow">
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-line bg-panel px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-cyanFit">{meal.time}</p>
            <h2 className="mt-1 text-2xl font-black text-white">Trocar opção</h2>
            <p className="mt-1 text-sm text-slate-400">{meal.name}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-slate-300 transition hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-3 p-4">
          {meal.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`rounded-lg border p-4 text-left transition ${
                option.id === selectedOptionId ? 'border-mint bg-mint/10' : 'border-line bg-ink hover:border-cyanFit'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-white">{option.title}</p>
                  <p className="mt-1 text-sm font-bold text-mint">{option.estimatedProtein} g de proteína estimada</p>
                </div>
                <span className="rounded-lg bg-panelSoft px-2 py-1 text-xs font-bold text-slate-300">
                  {option.id === selectedOptionId ? 'Selecionado' : 'Escolher'}
                </span>
              </div>
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
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
