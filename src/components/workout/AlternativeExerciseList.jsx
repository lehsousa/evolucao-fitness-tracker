import { CheckCircle2, Shuffle, X } from 'lucide-react';

export function AlternativeExerciseList({ exercise, selectedAlternativeId, onSelect, onClear }) {
  return (
    <section className="card bg-panelSoft p-4 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-black text-white">
            <Shuffle className="text-cyanFit" size={20} />
            Substituições
          </h3>
          <p className="mt-1 text-sm text-slate-400">Escolha uma alternativa apenas para o treino de hoje.</p>
        </div>
        {selectedAlternativeId && (
          <button type="button" onClick={onClear} className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-slate-400 transition hover:text-white">
            <X size={17} />
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-2">
        {exercise.alternatives.map((alternative) => {
          const selected = selectedAlternativeId === alternative.id;
          return (
            <button
              key={alternative.id}
              type="button"
              onClick={() => onSelect(alternative.id)}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                selected ? 'border-mint/50 bg-mint/10' : 'border-line bg-ink hover:border-cyanFit'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{alternative.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{alternative.reason}</p>
                </div>
                {selected && <CheckCircle2 className="shrink-0 text-mint" size={20} />}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
