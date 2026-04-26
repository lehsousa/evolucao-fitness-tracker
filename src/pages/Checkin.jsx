import { Save, AlertTriangle, Wand2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { todayKey } from '../utils/date.js';
import { AssistedImportModal } from '../components/integrations/AssistedImportModal';

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
  { value: 'importacao_assistida', label: 'Importação assistida' },
  { value: 'samsung_health', label: 'Samsung Health' },
  { value: 'fitdays', label: 'Fitdays' },
  { value: 'health_connect', label: 'Health Connect' },
];

export function Checkin({ onSave }) {
  const [form, setForm] = useState(initialForm);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showImportAlert, setShowImportAlert] = useState(false);

  useEffect(() => {
    checkPendingImport();
  }, []);

  function checkPendingImport() {
    const pending = window.localStorage.getItem('pendingHealthImport');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        setForm(prev => ({
          ...prev,
          weight: data.weight || prev.weight,
          bodyFat: data.bodyFat || prev.bodyFat,
          muscleMass: data.muscleMass || prev.muscleMass,
          visceralFat: data.visceralFat || prev.visceralFat,
          bodyWater: data.bodyWater || prev.bodyWater,
          bmr: data.bmr || prev.bmr,
          steps: data.steps || prev.steps,
          sleepHours: data.sleepHours || prev.sleepHours,
          avgHeartRate: data.avgHeartRate || prev.avgHeartRate,
          estimatedCalories: data.estimatedCalories || prev.estimatedCalories,
          source: 'importacao_assistida'
        }));
        setShowImportAlert(true);
      } catch (e) {
        console.error('Failed to parse pendingHealthImport', e);
      }
    }
  }

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
    setShowImportAlert(false);
    window.localStorage.removeItem('pendingHealthImport');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-mint">Check-in</p>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Registro diário</h1>
        </div>
        <button 
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-ink px-4 text-sm font-bold text-white transition hover:border-mint hover:text-mint"
        >
          <Wand2 size={16} />
          Importar dados de saúde
        </button>
      </div>

      {showImportAlert && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-500">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Dados importados pendentes.</p>
            <p className="mt-1 opacity-90">Revise os valores inseridos pela importação assistida e preencha sua cintura antes de salvar.</p>
          </div>
        </div>
      )}

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

      <AssistedImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          checkPendingImport();
        }}
      />
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
