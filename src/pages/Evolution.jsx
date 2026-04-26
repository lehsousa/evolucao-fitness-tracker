import { Trash2 } from 'lucide-react';
import { LineMetricChart, BarMetricChart } from '../components/charts/MetricCharts.jsx';
import { SummaryPanel } from '../components/summary/SummaryPanel.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { formatDate } from '../utils/date.js';

const sourceLabels = {
  manual: 'Manual',
  samsung_health: 'Samsung Health',
  fitdays: 'Fitdays',
  health_connect: 'Health Connect',
};

export function Evolution({ checkins, summary, onDeleteCheckin }) {
  const normalizedCheckins = checkins.map(normalizeCheckin);
  const chartData = [...normalizedCheckins]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      ...item,
      label: formatDate(item.date).slice(0, 5),
    }));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-cyanFit">Evolução</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Histórico corporal</h1>
      </div>

      <SummaryPanel summary={summary} />

      {chartData.length < 1 ? (
        <EmptyState title="Sem histórico ainda" text="Faça seu primeiro check-in para liberar os gráficos." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <LineMetricChart title="Peso" suffix="kg" dataKey="weight" data={chartData} color="#4ade80" />
          <LineMetricChart title="Cintura" suffix="cm" dataKey="waist" data={chartData} color="#22d3ee" />
          <LineMetricChart title="Gordura corporal" suffix="%" dataKey="bodyFat" data={chartData} color="#fb7185" />
          <LineMetricChart title="Massa muscular" suffix="kg" dataKey="muscleMass" data={chartData} color="#a3e635" />
          <BarMetricChart title="Passos" suffix="passos" dataKey="steps" data={chartData} color="#fbbf24" />
          <BarMetricChart title="Sono" suffix="h" dataKey="sleepHours" data={chartData} color="#818cf8" />
        </div>
      )}

      <section className="card overflow-hidden">
        <div className="border-b border-line p-4">
          <h2 className="text-lg font-black text-white sm:text-xl">Check-ins salvos</h2>
        </div>
        {normalizedCheckins.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Nada salvo" text="Os registros aparecerão aqui em ordem recente." />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {[...normalizedCheckins].sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
              <article key={item.date} className="grid gap-3 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-white">{formatDate(item.date)}</p>
                      <span className="rounded-lg bg-cyanFit/10 px-2 py-1 text-xs font-bold text-cyanFit">
                        {sourceLabels[item.source] || 'Manual'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCheckin(item.date)}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-coral/40 bg-coral/10 px-3 text-sm font-bold text-coral transition hover:bg-coral/20"
                  >
                    <Trash2 size={17} />
                    Excluir
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 lg:grid-cols-6">
                  <MiniMetric label="Peso" value={formatMetric(item.weight, 'kg')} />
                  <MiniMetric label="Cintura" value={formatMetric(item.waist, 'cm')} />
                  <MiniMetric label="Gordura" value={formatMetric(item.bodyFat, '%')} />
                  <MiniMetric label="Músculo" value={formatMetric(item.muscleMass, 'kg')} />
                  <MiniMetric label="Visceral" value={formatMetric(item.visceralFat, '')} />
                  <MiniMetric label="Água corporal" value={formatMetric(item.bodyWater, '%')} />
                  <MiniMetric label="Metab. basal" value={formatMetric(item.bmr, 'kcal')} />
                  <MiniMetric label="Passos" value={formatMetric(item.steps, '')} />
                  <MiniMetric label="Sono" value={formatMetric(item.sleepHours, 'h')} />
                  <MiniMetric label="FC média" value={formatMetric(item.avgHeartRate, 'bpm')} />
                  <MiniMetric label="Calorias" value={formatMetric(item.estimatedCalories, 'kcal')} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-lg bg-ink px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function normalizeCheckin(item) {
  return {
    date: item.date,
    weight: toNumber(item.weight),
    waist: toNumber(item.waist),
    bodyFat: toNumber(item.bodyFat),
    muscleMass: toNumber(item.muscleMass),
    visceralFat: toNumber(item.visceralFat),
    bodyWater: toNumber(item.bodyWater),
    bmr: toNumber(item.bmr ?? item.basalMetabolism),
    steps: toNumber(item.steps),
    sleepHours: toNumber(item.sleepHours),
    avgHeartRate: toNumber(item.avgHeartRate ?? item.averageHeartRate),
    estimatedCalories: toNumber(item.estimatedCalories),
    source: item.source || item.dataSource || 'manual',
  };
}

function toNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

function formatMetric(value, suffix) {
  if (!Number.isFinite(value)) return '--';
  return suffix ? `${value} ${suffix}` : value;
}
