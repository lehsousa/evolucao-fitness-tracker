import { AlertTriangle, BrainCircuit, CheckCircle2, Dumbbell, HeartPulse, Moon, Save, Scale, Sparkles, Target } from 'lucide-react';
import { useMemo } from 'react';
import { useExerciseHistory } from '../hooks/useExerciseHistory.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { weekKey } from '../utils/date.js';
import { generateWeeklyCoachReport } from '../utils/coachUtils.js';

export function CoachAI({ checkins, workoutDoneByDate, cardioDoneByWeek }) {
  const { history } = useExerciseHistory();
  const [savedReports, setSavedReports] = useLocalStorage('coachWeeklyReports', {});
  const report = useMemo(
    () =>
      generateWeeklyCoachReport({
        checkins,
        workoutDoneByDate,
        cardioDoneByWeek,
        exerciseHistory: history,
        week: weekKey(),
      }),
    [checkins, workoutDoneByDate, cardioDoneByWeek, history],
  );

  const summary = report.summary;
  const savedAt = savedReports?.[summary.week]?.savedAt;

  function saveReport() {
    setSavedReports((current) => ({
      ...(current || {}),
      [summary.week]: {
        savedAt: new Date().toISOString(),
        report,
      },
    }));
  }

  return (
    <div className="space-y-4">
      <section className="card overflow-hidden p-0">
        <div className="bg-panelSoft p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-cyanFit text-ink">
              <BrainCircuit size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyanFit">Coach IA</p>
              <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Relatório semanal inteligente</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-400">
                Análise local e mockada dos seus dados. Nesta fase não usa API externa, não faz diagnóstico e não muda treino sem sua aprovação.
              </p>
            </div>
            </div>
            <div className="shrink-0">
              <button type="button" onClick={saveReport} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 font-black text-ink transition hover:bg-green-300 lg:w-auto">
                <Save size={18} />
                Salvar relatório
              </button>
              {savedAt && <p className="mt-2 text-xs font-bold text-slate-500">Salvo nesta semana.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Scale} label="Peso inicial" value={formatKg(summary.initialWeight)} />
        <Metric icon={Scale} label="Peso atual" value={summary.currentWeight ? formatKg(summary.currentWeight) : '--'} hint={formatDiff(summary.weightDiff, 'kg')} />
        <Metric icon={Target} label="Cintura" value={summary.currentWaist ? `${summary.currentWaist} cm` : '--'} hint={formatDiff(summary.waistDiff, 'cm')} />
        <Metric icon={Dumbbell} label="Carga" value={summary.loadEvolution} />
        <Metric icon={CheckCircle2} label="Treinos concluídos" value={summary.workoutsCompleted} hint="últimos 7 dias" />
        <Metric icon={HeartPulse} label="Cardios concluídos" value={summary.cardiosCompleted} hint="semana atual" />
        <Metric icon={Target} label="Média de passos" value={summary.averageSteps ? summary.averageSteps.toLocaleString('pt-BR') : '--'} />
        <Metric icon={Moon} label="Média de sono" value={summary.averageSleep ? `${summary.averageSleep}h` : '--'} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Alertas positivos" icon={Sparkles} tone="mint" items={report.positives} />
        <ListCard title="Pontos de atenção" icon={AlertTriangle} tone="amber" items={report.attentionPoints} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Sugestões para próxima semana" icon={Target} tone="cyan" items={report.nextWeekActions} />
        <ListCard title="Treino" icon={Dumbbell} tone="mint" items={report.trainingSuggestions} />
        <ListCard title="Cardio" icon={HeartPulse} tone="coral" items={report.cardioSuggestions} />
        <ListCard title="Lembretes de nutrição" icon={CheckCircle2} tone="amber" items={report.nutritionReminders} />
      </section>

      <section className="rounded-lg border border-line bg-panelSoft px-4 py-3">
        <p className="text-sm font-semibold text-slate-300">
          Modelo atual: <span className="font-black text-white">generateWeeklyCoachReport(data)</span>. A função retorna `summary`, `positives`,
          `attentionPoints`, `nextWeekActions`, `trainingSuggestions`, `cardioSuggestions` e `nutritionReminders`.
        </p>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={18} />
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-3 truncate text-2xl font-black text-white">{value}</p>
      {hint && <p className="mt-1 text-sm font-bold text-mint">{hint}</p>}
    </div>
  );
}

function ListCard({ title, icon: Icon, tone, items }) {
  const colors = {
    mint: 'text-mint bg-mint',
    cyan: 'text-cyanFit bg-cyanFit',
    amber: 'text-amberFit bg-amberFit',
    coral: 'text-coral bg-coral',
  };
  const [textColor, dotColor] = colors[tone].split(' ');

  return (
    <section className="card p-4">
      <h2 className="flex items-center gap-2 text-xl font-black text-white">
        <Icon className={textColor} size={22} />
        {title}
      </h2>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex gap-3 rounded-lg bg-ink px-3 py-3">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
            <p className="text-sm font-semibold text-slate-300">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatKg(value) {
  return `${Number(value || 0).toFixed(1)} kg`;
}

function formatDiff(value, unit) {
  if (!Number.isFinite(value)) return '';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} ${unit}`;
}
