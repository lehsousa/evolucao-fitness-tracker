import { AlertTriangle, BrainCircuit, CheckCircle2, Dumbbell, HeartPulse, Loader2, Moon, Save, Scale, Sparkles, Target, Bot } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useExerciseHistory } from '../hooks/useExerciseHistory.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { weekKey, todayKey } from '../utils/date.js';
import { generateWeeklyCoachReport } from '../utils/coachUtils.js';
import { isGeminiConfigured, generateGeminiCoachReport } from '../services/ai/geminiCoachService.js';

export function CoachAI({ checkins, workoutDoneByDate, cardioDoneByWeek }) {
  const { history } = useExerciseHistory();
  const [savedReports, setSavedReports] = useLocalStorage('coachWeeklyReports', {});
  const [aiReports, setAiReports] = useLocalStorage('coachReports', []);
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');

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
  
  // Find current week AI report
  const currentAiReport = useMemo(() => {
    if (!Array.isArray(aiReports)) return null;
    // We match by the same week key inside summary
    return aiReports.find(r => r.type === 'gemini' && r.summary?.week === summary.week);
  }, [aiReports, summary.week]);

  function saveReport() {
    setSavedReports((current) => ({
      ...(current || {}),
      [summary.week]: {
        savedAt: new Date().toISOString(),
        report,
      },
    }));
  }

  async function handleGenerateAI() {
    setIsGeneratingAI(true);
    setAiError('');

    try {
      const text = await generateGeminiCoachReport(summary);
      
      const newReport = {
        id: crypto.randomUUID(),
        date: todayKey(),
        type: 'gemini',
        summary: summary,
        report: text
      };

      setAiReports(current => {
        const safeArr = Array.isArray(current) ? current : [];
        return [newReport, ...safeArr.filter(r => r.summary?.week !== summary.week)];
      });
      
    } catch (err) {
      console.error(err);
      setAiError(err?.message || 'IA gratuita indisponível. Mantive a análise local.');
    } finally {
      setIsGeneratingAI(false);
    }
  }

  const configured = isGeminiConfigured();
  const currentReportLooksIncomplete = currentAiReport?.report ? looksIncomplete(currentAiReport.report) : false;

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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold uppercase tracking-wide text-cyanFit">Coach IA</p>
                  <span className={`rounded-lg px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-wide ${
                    configured ? 'bg-mint/10 text-mint border border-mint/20' : 'bg-amberFit/10 text-amberFit border border-amberFit/20'
                  }`}>
                    {configured ? 'Gemini configurado' : 'IA não configurada'}
                  </span>
                </div>
                <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Relatório semanal inteligente</h1>
                <p className="mt-2 max-w-3xl text-sm font-medium text-slate-400">
                  Análise baseada nos seus dados. A IA envia apenas um resumo numérico compacto, preservando sua privacidade.
                </p>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col gap-2">
              <button 
                type="button" 
                onClick={handleGenerateAI}
                disabled={!configured || isGeneratingAI}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 font-black text-white transition hover:bg-purple-400 disabled:opacity-50 lg:w-auto"
              >
                {isGeneratingAI ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
                {currentAiReport ? 'Gerar novamente' : 'Gerar análise com IA gratuita'}
              </button>
              
              <button 
                type="button" 
                onClick={saveReport} 
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 font-black text-ink transition hover:bg-green-300 lg:w-auto"
              >
                <Save size={18} />
                Salvar relatório
              </button>
              {savedAt && <p className="text-right text-xs font-bold text-slate-500">Salvo nesta semana.</p>}
            </div>
          </div>
        </div>
      </section>

      {aiError && (
        <div className="rounded-lg border border-coral/30 bg-coral/10 p-4 flex items-center gap-3">
          <AlertTriangle className="text-coral shrink-0" size={24} />
          <div>
            <p className="font-bold text-coral">Ops! Falha na IA.</p>
            <p className="text-sm text-coral/80">{aiError}</p>
          </div>
        </div>
      )}

      {currentAiReport && (
        <section className="card p-4 sm:p-5 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="text-purple-400" size={24} />
            <h2 className="text-xl font-black text-white">Análise do Coach (Gemini)</h2>
          </div>
          {currentReportLooksIncomplete && (
            <div className="mb-4 rounded-lg border border-amberFit/30 bg-amberFit/10 px-3 py-3 text-sm font-semibold text-amberFit">
              Esta análise salva parece ter vindo incompleta. Toque em Gerar novamente para substituir por uma resposta completa.
            </div>
          )}
          <CoachReportText text={currentAiReport.report} />
        </section>
      )}

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

      {!currentAiReport && (
        <>
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
        </>
      )}

      <section className="rounded-lg border border-line bg-panelSoft px-4 py-3">
        <p className="text-sm font-semibold text-slate-300">
          A análise local continua disponível mesmo sem IA. O motor de regras local roda direto no seu navegador.
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

function CoachReportText({ text }) {
  const blocks = String(text || '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-slate-300">
      {blocks.map((block, index) => {
        const clean = block.replace(/\*\*/g, '');
        const isHeading = clean.length < 80 && /^(Resumo|Pontos|3 a|Acoes|Ações)/i.test(clean);

        return isHeading ? (
          <h3 key={`${clean}-${index}`} className="pt-2 text-base font-black text-white">
            {clean}
          </h3>
        ) : (
          <p key={`${clean}-${index}`} className="whitespace-pre-wrap break-words text-sm font-medium leading-7 text-slate-300">
            {clean}
          </p>
        );
      })}
    </div>
  );
}

function looksIncomplete(text) {
  const clean = String(text || '').trim();
  if (!clean) return false;
  if (clean.length < 120) return true;
  return !/[.!?)]$/.test(clean);
}

function formatKg(value) {
  return `${Number(value || 0).toFixed(1)} kg`;
}

function formatDiff(value, unit) {
  if (!Number.isFinite(value)) return '';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} ${unit}`;
}
