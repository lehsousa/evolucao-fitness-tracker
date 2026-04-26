import { CheckCircle2, Circle, Timer } from 'lucide-react';
import { cardioOptions } from '../data/plan.js';

export function Cardio({ cardioDone, toggleCardio }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-coral">Cardio</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Sessões da semana</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {cardioOptions.map((cardio) => {
          const done = Boolean(cardioDone[cardio.name]);
          return (
            <button
              key={cardio.name}
              type="button"
              onClick={() => toggleCardio(cardio.name)}
              className={`card p-4 text-left transition hover:border-slate-500 sm:p-5 ${done ? 'border-mint/50 bg-mint/10' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-coral/15 text-coral">
                  <Timer size={22} />
                </div>
                {done ? <CheckCircle2 className="text-mint" size={24} /> : <Circle className="text-slate-500" size={24} />}
              </div>
              <h2 className="mt-4 text-xl font-black text-white">{cardio.name}</h2>
              <p className="mt-2 text-sm text-slate-400">{cardio.duration}</p>
              <p className="mt-1 text-sm font-semibold text-cyanFit">{cardio.intensity}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
