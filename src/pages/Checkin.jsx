import { Save, AlertTriangle, Wand2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { todayKey } from '../utils/date.js';
import { AssistedImportModal } from '../components/integrations/AssistedImportModal';
import {
  checkHealthPermissions,
  hasAllHealthPermissions,
  hasAnyHealthPermission,
  isAndroidNative,
  isNativeHealthConnectAvailable,
  readTodayHealthData,
  requestHealthPermissions,
} from '../services/health/healthConnectNativeService.js';
import {
  checkSamsungBodyCompositionPermission,
  checkSamsungHealthAvailability,
  hasSamsungBodyCompositionPermission,
  isSamsungHealthNativeAvailable,
  readLatestSamsungBodyComposition,
  requestSamsungBodyCompositionPermission,
} from '../services/health/samsungHealthDataService.js';

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
  const [importAlertMessage, setImportAlertMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [isImportingHealth, setIsImportingHealth] = useState(false);

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
          source: data.source || 'importacao_assistida'
        }));
        showImportSuccess(`Dados preenchidos via ${sourceLabel(data.source)}. Revise antes de salvar.`);
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

  async function handleImportHealthData() {
    setImportError('');

    if (form.source === 'samsung_health') {
      await importSamsungHealthBodyComposition();
      return;
    }

    if (shouldUseAssistedImport(form.source)) {
      setIsImportModalOpen(true);
      return;
    }

    if (!isAndroidNative()) {
      setIsImportModalOpen(true);
      return;
    }

    setIsImportingHealth(true);
    try {
      const availability = await isNativeHealthConnectAvailable();
      if (!availability.available) {
        setImportError(`${availability.message || 'Health Connect não está disponível neste aparelho.'} Use Samsung Health/Fitdays pela importação assistida.`);
        setIsImportModalOpen(true);
        return;
      }

      let permissions = await checkHealthPermissions();
      if (!hasAllHealthPermissions(permissions)) {
        permissions = await requestHealthPermissions();
      }

      if (!hasAnyHealthPermission(permissions)) {
        setImportError('Permissões do Health Connect pendentes. Você pode preencher manualmente ou tentar novamente depois.');
        return;
      }

      const result = await readTodayHealthData();
      if (!result.ok || !result.data) {
        setImportError(result.message || 'Não foi possível importar automaticamente. Você pode preencher manualmente os dados do Fitdays ou Samsung Health.');
        return;
      }

      applyHealthConnectData(result.data);
      showImportSuccess(buildHealthImportMessage(result.data));
    } finally {
      setIsImportingHealth(false);
    }
  }

  async function importSamsungHealthBodyComposition() {
    if (!isSamsungHealthNativeAvailable()) {
      setImportError('Leitura direta do Samsung Health funciona apenas no app Android. Use a importacao assistida neste ambiente.');
      setIsImportModalOpen(true);
      return;
    }

    setIsImportingHealth(true);
    try {
      const availability = await checkSamsungHealthAvailability();
      if (!availability.available) {
        setImportError(`${availability.message || 'Samsung Health Data SDK indisponivel.'} Se estiver testando localmente, confirme o Developer Mode do Samsung Health.`);
        return;
      }

      let permissions = await checkSamsungBodyCompositionPermission();
      if (!hasSamsungBodyCompositionPermission(permissions)) {
        permissions = await requestSamsungBodyCompositionPermission();
      }

      if (!hasSamsungBodyCompositionPermission(permissions)) {
        setImportError(permissions?.message || 'Permissao de bioimpedancia do Samsung Health pendente.');
        return;
      }

      const result = await readLatestSamsungBodyComposition();
      if (!result.ok || !result.data) {
        setImportError(result.message || 'Samsung Health nao retornou bioimpedancia. Use a importacao assistida se os dados estiverem visiveis no app.');
        return;
      }

      applySamsungHealthData(result.data);
      showImportSuccess(buildSamsungImportMessage(result.data));
    } finally {
      setIsImportingHealth(false);
    }
  }

  function applyHealthConnectData(data) {
    setForm((current) => ({
      ...current,
      date: data.date || current.date,
      weight: valueOrCurrent(data.weight, current.weight),
      bodyFat: valueOrCurrent(data.bodyFat, current.bodyFat),
      muscleMass: valueOrCurrent(data.muscleMass, current.muscleMass),
      bodyWater: valueOrCurrent(data.bodyWater ?? data.bodyWaterMass, current.bodyWater),
      bmr: valueOrCurrent(data.bmr, current.bmr),
      steps: valueOrCurrent(data.steps, current.steps),
      sleepHours: valueOrCurrent(data.sleepHours, current.sleepHours),
      avgHeartRate: valueOrCurrent(data.avgHeartRate, current.avgHeartRate),
      estimatedCalories: valueOrCurrent(data.estimatedCalories ?? data.totalCalories, current.estimatedCalories),
      source: 'health_connect',
    }));
  }

  function applySamsungHealthData(data) {
    setForm((current) => ({
      ...current,
      date: data.date || current.date,
      weight: valueOrCurrent(data.weight, current.weight),
      bodyFat: valueOrCurrent(data.bodyFat, current.bodyFat),
      muscleMass: valueOrCurrent(data.muscleMass, current.muscleMass),
      bodyWater: valueOrCurrent(data.bodyWater, current.bodyWater),
      bmr: valueOrCurrent(data.bmr, current.bmr),
      source: 'samsung_health',
    }));
  }

  function showImportSuccess(message) {
    setImportAlertMessage(message);
    setShowImportAlert(true);
    setImportError('');
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
          onClick={handleImportHealthData}
          disabled={isImportingHealth}
          className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-ink px-4 text-sm font-bold text-white transition hover:border-mint hover:text-mint"
        >
          <Wand2 size={16} />
          {isImportingHealth ? 'Importando...' : importButtonLabel(form.source)}
        </button>
      </div>

      {showImportAlert && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-500">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Dados importados pendentes.</p>
            <p className="mt-1 opacity-90">{importAlertMessage || 'Revise os valores inseridos e preencha sua cintura antes de salvar.'}</p>
          </div>
        </div>
      )}

      {importError && (
        <div className="flex items-start gap-3 rounded-xl border border-coral/30 bg-coral/10 p-4 text-coral">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">Importação automática indisponível.</p>
            <p className="mt-1 opacity-90">{importError}</p>
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
            <Field label="Água corporal (% ou kg)" value={form.bodyWater} onChange={(value) => updateField('bodyWater', value)} step="0.1" />
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
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Health Connect importa atividade. Samsung Health tenta ler bioimpedancia direto pelo SDK nativo. Fitdays continua com importacao assistida.
          </p>
        </section>

        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 font-black text-ink transition hover:bg-green-300">
          <Save size={20} />
          Salvar check-in
        </button>
      </form>

      <AssistedImportModal 
        isOpen={isImportModalOpen}
        source={assistedSourceFor(form.source)}
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

function valueOrCurrent(value, current) {
  return value === null || value === undefined || value === '' ? current : String(value);
}

function shouldUseAssistedImport(source) {
  return source === 'fitdays' || source === 'importacao_assistida';
}

function assistedSourceFor(source) {
  return shouldUseAssistedImport(source) ? source : 'importacao_assistida';
}

function importButtonLabel(source) {
  if (source === 'samsung_health') return 'Importar bioimpedancia Samsung';
  if (source === 'fitdays') return 'Preencher dados do Fitdays';
  if (source === 'importacao_assistida') return 'Abrir importação assistida';
  return 'Importar via Health Connect';
}

function sourceLabel(source) {
  if (source === 'samsung_health') return 'Samsung Health';
  if (source === 'fitdays') return 'Fitdays';
  if (source === 'health_connect') return 'Health Connect';
  if (source === 'manual') return 'Manual';
  return 'importação assistida';
}

function buildHealthImportMessage(data) {
  const imported = readableFieldList(data?.importedFields);
  const missing = readableFieldList(data?.missingFields);
  const parts = [];

  if (imported) parts.push(`Importado: ${imported}.`);
  else parts.push('Nenhum campo com valor foi encontrado no Health Connect.');

  if (missing) parts.push(`Sem dados publicados hoje para: ${missing}.`);
  if (data?.bodyCompositionWindowDays) parts.push(`Composição corporal também foi buscada nos últimos ${data.bodyCompositionWindowDays} dias.`);
  parts.push('Revise antes de salvar.');

  return parts.join(' ');
}

function buildSamsungImportMessage(data) {
  const imported = readableFieldList(data?.importedFields);
  const parts = [];

  if (imported) parts.push(`Importado do Samsung Health: ${imported}.`);
  else parts.push('Samsung Health respondeu, mas nenhum campo de bioimpedancia veio preenchido.');

  if (!data?.bodyFat) parts.push('Gordura corporal pode nao estar liberada pelo Samsung Health Data SDK neste aparelho.');
  if (!data?.muscleMass) parts.push('Massa muscular pode depender do campo publicado pela balanca/Samsung Health.');
  parts.push('Revise antes de salvar.');

  return parts.join(' ');
}

function readableFieldList(fields) {
  if (!Array.isArray(fields) || !fields.length) return '';
  const labels = {
    weight: 'peso',
    bodyFat: 'gordura corporal',
    muscleMass: 'massa magra',
    bodyWaterMass: 'água corporal em kg',
    boneMass: 'massa óssea',
    bmr: 'metabolismo basal',
    steps: 'passos',
    sleepHours: 'sono',
    avgHeartRate: 'frequência cardíaca',
    activeCalories: 'calorias ativas',
    totalCalories: 'calorias totais',
    estimatedCalories: 'calorias estimadas',
    bodyWater: 'agua corporal',
    bmi: 'IMC',
    bodyFatMass: 'massa gorda',
  };
  return fields.map((field) => labels[field] || field).join(', ');
}
