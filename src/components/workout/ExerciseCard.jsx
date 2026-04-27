import { CheckCircle2, Circle, Dumbbell, Eye, Repeat2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getBestLoad, getLastLoad } from '../../utils/workoutUtils.js';

export function ExerciseCard({
  exercise,
  planItem,
  completed,
  history,
  substitution,
  onOpen,
  onToggleComplete,
  onQuickRegister,
  onShowAlternatives,
}) {
  const lastLoad = getLastLoad(history);
  const bestLoad = getBestLoad(history);

  return (
    <motion.article
      layout
      className={`card p-4 transition ${completed ? 'border-mint/45 bg-mint/10' : ''}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-cyanFit">{exercise.muscleGroup}</p>
          <h3 className="mt-1 text-lg font-black text-white">{exercise.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{exercise.equipment}</p>
        </div>
        <button type="button" onClick={onToggleComplete} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-slate-500 transition hover:text-white">
          {completed ? <CheckCircle2 className="text-mint" size={21} /> : <Circle size={21} />}
        </button>
      </div>

      {substitution && (
        <div className="mt-3 rounded-lg border border-amberFit/30 bg-amberFit/10 px-3 py-2 text-xs font-bold text-amberFit">
          Substituído por: {substitution}
        </div>
      )}

      {planItem.adjustedByCoach && (
        <div className="mt-3 rounded-lg border border-cyanFit/30 bg-cyanFit/10 px-3 py-2 text-xs font-bold text-cyanFit" title={planItem.notes || 'Alterado por sugestão do Coach'}>
          Ajustado pelo Coach
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Mini label="Séries" value={planItem.sets} />
        <Mini label="Reps" value={planItem.reps} />
        <Mini label="Descanso" value={`${planItem.restSeconds || exercise.restSeconds}s`} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Mini label="Última carga" value={lastLoad ? `${lastLoad.weight} kg` : '--'} strong />
        <Mini label="Melhor carga" value={bestLoad ? `${bestLoad.weight} kg` : '--'} strong />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={onOpen} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-panelSoft px-3 text-sm font-black text-white transition hover:text-cyanFit">
          <Eye size={17} />
          Detalhes
        </button>
        <button type="button" onClick={onQuickRegister} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-mint px-3 text-sm font-black text-ink transition hover:bg-green-300">
          <Dumbbell size={17} />
          Carga
        </button>
        <button type="button" onClick={onShowAlternatives} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-black text-slate-200 transition hover:border-amberFit hover:text-amberFit">
          <Repeat2 size={17} />
          Ocupado?
        </button>
      </div>
    </motion.article>
  );
}

function Mini({ label, value, strong = false }) {
  return (
    <div className="rounded-lg bg-ink px-2.5 py-2">
      <p className="text-[0.68rem] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 truncate font-black ${strong ? 'text-mint' : 'text-white'}`}>{value}</p>
    </div>
  );
}
