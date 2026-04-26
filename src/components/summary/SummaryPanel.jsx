import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

export function SummaryPanel({ summary }) {
  const weightDiff = formatDiff(summary.weightDiff, 'kg');
  const waistDiff = formatDiff(summary.waistDiff, 'cm');

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <SummaryItem label="Peso inicial" value={formatValue(summary.initialWeight, 'kg')} />
      <SummaryItem label="Peso atual" value={formatValue(summary.currentWeight, 'kg')} />
      <SummaryItem label="Diferença de peso" value={weightDiff.text} tone={weightDiff.tone} icon={weightDiff.icon} />
      <SummaryItem label="Cintura inicial" value={formatValue(summary.initialWaist, 'cm')} />
      <SummaryItem label="Cintura atual" value={formatValue(summary.currentWaist, 'cm')} />
      <SummaryItem label="Diferença de cintura" value={waistDiff.text} tone={waistDiff.tone} icon={waistDiff.icon} />
    </section>
  );
}

function SummaryItem({ label, value, tone = 'default', icon: Icon }) {
  const tones = {
    default: 'text-white',
    down: 'text-mint',
    up: 'text-coral',
    flat: 'text-cyanFit',
  };

  return (
    <div className="card p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        {Icon && <Icon className={tones[tone]} size={20} />}
        <p className={`text-2xl font-black ${tones[tone]}`}>{value}</p>
      </div>
    </div>
  );
}

function formatValue(value, suffix) {
  return Number.isFinite(value) ? `${value} ${suffix}` : '--';
}

function formatDiff(value, suffix) {
  if (!Number.isFinite(value)) return { text: '--', tone: 'default' };
  if (value === 0) return { text: `0 ${suffix}`, tone: 'flat', icon: Minus };
  const tone = value < 0 ? 'down' : 'up';
  const icon = value < 0 ? ArrowDown : ArrowUp;
  return { text: `${value > 0 ? '+' : ''}${value.toFixed(1)} ${suffix}`, tone, icon };
}
