import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Dumbbell, ShieldCheck, Sparkles, X } from 'lucide-react';
import { AlternativeExerciseList } from './AlternativeExerciseList.jsx';
import { ExerciseAnimationPlaceholder } from './ExerciseAnimationPlaceholder.jsx';
import { LoadHistoryList } from './LoadHistoryList.jsx';
import { LoadProgressChart } from './LoadProgressChart.jsx';
import { RegisterLoadForm } from './RegisterLoadForm.jsx';
import { getBestLoad, getEstimatedVolume, getLastLoad, getProgressionSuggestion } from '../../utils/workoutUtils.js';

export function ExerciseDetailModal({
  exercise,
  planItem,
  history,
  selectedAlternativeId,
  selectedAlternativeName,
  exerciseDbMapping,
  onClose,
  onSaveLoad,
  onDeleteLoad,
  onSelectAlternative,
  onClearAlternative,
  initialMode = 'details',
}) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(initialMode === 'alternatives');
  const lastLoad = getLastLoad(history);
  const bestLoad = getBestLoad(history);
  const suggestion = getProgressionSuggestion(history, planItem.reps);

  function saveLoad(entry) {
    onSaveLoad(entry);
    setEditingEntry(null);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-3 py-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mx-auto max-w-6xl rounded-lg border border-line bg-panel shadow-glow"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-panel px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-mint">{exercise.muscleGroup}</p>
            <h2 className="mt-1 text-2xl font-black text-white">{exercise.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{exercise.description}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-slate-300 transition hover:text-white">
            <X size={21} />
          </button>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4">
            <ExerciseAnimationPlaceholder exercise={exercise} exerciseDbMapping={exerciseDbMapping} />

            <section className="card bg-panelSoft p-4 shadow-none">
              <div className="grid gap-2 sm:grid-cols-2">
                <Info label="Músculos secundários" value={exercise.secondaryMuscles.join(', ') || '--'} />
                <Info label="Equipamento" value={exercise.equipment} />
                <Info label="Dificuldade" value={exercise.difficulty} />
                <Info label="Padrão" value={exercise.movementPattern} />
                <Info label="Séries e reps" value={`${planItem.sets} x ${planItem.reps}`} />
                <Info label="Descanso" value={`${exercise.restSeconds}s`} />
              </div>
              {selectedAlternativeName && (
                <p className="mt-3 rounded-lg border border-amberFit/30 bg-amberFit/10 px-3 py-2 text-sm font-bold text-amberFit">
                  Substituído hoje por: {selectedAlternativeName}
                </p>
              )}
            </section>

            <ListBlock icon={Dumbbell} title="Instruções passo a passo" items={exercise.instructions} />
            <ListBlock icon={AlertTriangle} title="Erros comuns" items={exercise.commonMistakes} tone="coral" />
            <ListBlock icon={ShieldCheck} title="Dicas de segurança" items={exercise.safetyTips} tone="amber" />

            <button
              type="button"
              onClick={() => setShowAlternatives((value) => !value)}
              className="flex min-h-12 w-full items-center justify-center rounded-lg border border-line bg-ink px-4 font-black text-white transition hover:border-amberFit hover:text-amberFit"
            >
              Aparelho ocupado? Ver substituições
            </button>

            {showAlternatives && (
              <AlternativeExerciseList
                exercise={exercise}
                selectedAlternativeId={selectedAlternativeId}
                onSelect={onSelectAlternative}
                onClear={onClearAlternative}
              />
            )}
          </div>

          <div className="space-y-4">
            <section className="card bg-panelSoft p-4 shadow-none">
              <p className="text-sm font-bold uppercase tracking-wide text-amberFit">Evolução de carga</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat label="Última" value={lastLoad ? `${lastLoad.weight} kg` : '--'} />
                <Stat label="Melhor" value={bestLoad ? `${bestLoad.weight} kg` : '--'} />
                <Stat label="Volume" value={lastLoad ? `${getEstimatedVolume(lastLoad)} kg` : '--'} />
              </div>
              <div className="mt-4 rounded-lg border border-mint/30 bg-mint/10 px-3 py-3">
                <p className="flex items-center gap-2 text-sm font-black text-mint">
                  <Sparkles size={17} />
                  Sugestão simples
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-200">{suggestion}</p>
              </div>
            </section>

            <RegisterLoadForm
              exerciseId={exercise.id}
              editingEntry={editingEntry}
              onSave={saveLoad}
              onCancelEdit={() => setEditingEntry(null)}
            />
            <LoadProgressChart history={history} />
            <LoadHistoryList history={history} onEdit={setEditingEntry} onDelete={onDeleteLoad} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-ink px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-ink px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function ListBlock({ icon: Icon, title, items, tone = 'mint' }) {
  const color = tone === 'coral' ? 'text-coral' : tone === 'amber' ? 'text-amberFit' : 'text-mint';
  const bullet = tone === 'coral' ? 'bg-coral' : tone === 'amber' ? 'bg-amberFit' : 'bg-mint';

  return (
    <section className="card bg-panelSoft p-4 shadow-none">
      <h3 className="flex items-center gap-2 text-lg font-black text-white">
        <Icon className={color} size={20} />
        {title}
      </h3>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex gap-3 rounded-lg bg-ink px-3 py-3">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${bullet}`} />
            <p className="text-sm font-semibold text-slate-300">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
