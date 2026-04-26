import { Save } from 'lucide-react';
import { useState } from 'react';
import { todayKey } from '../utils/date.js';

const initialForm = {
  date: todayKey(),
  weight: '',
  waist: '',
  bodyFat: '',
  muscleMass: '',
  visceralFat: '',
  bodyWater: '',
  bmr: '',
  steps: '',
  sleepHours: '',
  avgHeartRate: '',
  estimatedCalories: '',
  source: 'manual',
};

const sourceOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'samsung_health', label: 'Samsung Health' },
  { value: 'fitdays', label: 'Fitdays' },
  { value: 'health_connect', label: 'Health Connect' },
];

export function Checkin({ onSave }) {
  const [form, setForm] = useState(initialForm);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      date: form.date || todayKey(),
      weight: toNumber(form.weight),
      waist: toNumber(form.waist),
      bodyFat: toNumber(form.bodyFat),
      muscleMass: toNumber(form.muscleMass),
      visceralFat: toNumber(form.visceralFat),
      bodyWater: toNumber(form.bodyWater),
      bmr: toNumber(form.bmr),
      steps: toNumber(form.steps),
      sleepHours: toNumber(form.sleepHours),
      avgHeartRate: toNumber(form.avgHeartRate),
      estimatedCalories: toNumber(form.estimatedCalories),
      source: form.source,
    });
    setForm({ ...initialForm, date: todayKey() });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-mint">Check-in</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Registro diário</h1>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-5 p-4 sm:p-5">
        <section>
          <h2 className="mb-3 text-lg font-black text-white">Dados do dia</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DateField label="Data" value={form.date} onChange={(value) => updateField('date', value)} />
            <Field label="Peso (kg)" value={form.weight} onChange={(value) => updateField('weight', value)} step="0.1" />
            <Field label="Cintura (cm)" value={form.waist} onChange={(value) => updateField('waist', value)} step="0.1" />
            <Field label="Passos" value={form.steps} onChange={(value) => updateField('steps', value)} step="1" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-black text-white">Bioimpedância e saúde</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Gordura corporal (%)" value={form.bodyFat} onChange={(value) => updateField('bodyFat', value)} step="0.1" />
            <Field label="Massa muscular (kg)" value={form.muscleMass} onChange={(value) => updateField('muscleMass', value)} step="0.1" />
            <Field label="Gordura visceral" value={form.visceralFat} onChange={(value) => updateField('visceralFat', value)} step="0.1" />
            <Field label="Água corporal (%)" value={form.bodyWater} onChange={(value) => updateField('bodyWater', value)} step="0.1" />
            <Field label="Metabolismo basal" value={form.bmr} onChange={(value) => updateField('bmr', value)} step="1" />
            <Field label="Sono em horas" value={form.sleepHours} onChange={(value) => updateField('sleepHours', value)} step="0.1" />
            <Field label="Frequência cardíaca média" value={form.avgHeartRate} onChange={(value) => updateField('avgHeartRate', value)} step="1" />
            <Field label="Calorias estimadas" value={form.estimatedCalories} onChange={(value) => updateField('estimatedCalories', value)} step="1" />
          </div>
        </section>

        <section>
          <label className="label" htmlFor="source">Origem dos dados</label>
          <select id="source" className="field" value={form.source} onChange={(event) => updateField('source', event.target.value)}>
            {sourceOptions.map((source) => (
              <option key={source.value} value={source.value}>{source.label}</option>
            ))}
          </select>
        </section>

        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 font-black text-ink transition hover:bg-green-300">
          <Save size={20} />
          Salvar check-in
        </button>
      </form>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="label" htmlFor="checkin-date">{label}</label>
      <input id="checkin-date" className="field" type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Field({ label, value, onChange, step }) {
  const id = label.toLowerCase().replaceAll(' ', '-').replace(/[()%]/g, '');
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="field"
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function toNumber(value) {
  return value === '' || value === null || value === undefined ? 0 : Number(value);
}
