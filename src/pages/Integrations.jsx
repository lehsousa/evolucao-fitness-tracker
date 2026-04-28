import { useEffect, useState } from 'react';
import { Bluetooth, Download, ExternalLink, Link2, Scale, Settings, ShieldCheck, Smartphone, Wand2 } from 'lucide-react';
import { IntegrationInstructionModal } from '../components/integrations/IntegrationInstructionModal';
import { AssistedImportModal } from '../components/integrations/AssistedImportModal';
import EnhancedHealthDiagnostics from '../components/integrations/EnhancedHealthDiagnostics';
import {
  checkHealthPermissions,
  hasAllHealthPermissions,
  hasAnyHealthPermission,
  isNativeHealthConnectAvailable,
  openHealthConnectSettings,
  readHealthConnectDiagnostics,
  readTodayHealthData,
  requestHealthPermissions,
} from '../services/health/healthConnectNativeService.js';
import {
  checkSamsungBodyCompositionPermission,
  checkSamsungHealthAvailability,
  hasSamsungBodyCompositionPermission,
  readLatestSamsungBodyComposition,
  requestSamsungBodyCompositionPermission,
} from '../services/health/samsungHealthDataService.js';

export function Integrations({ onNavigate }) {
  const [openModal, setOpenModal] = useState(null);
  const [healthStatus, setHealthStatus] = useState({ status: 'unknown', message: 'Ainda não verificado' });
  const [healthPermissions, setHealthPermissions] = useState(null);
  const [healthFeedback, setHealthFeedback] = useState('');
  const [healthDiagnostics, setHealthDiagnostics] = useState(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [samsungStatus, setSamsungStatus] = useState({ status: 'unknown', message: 'Ainda nao verificado' });
  const [samsungPermissions, setSamsungPermissions] = useState(null);
  const [samsungFeedback, setSamsungFeedback] = useState('');
  const [samsungBodyComposition, setSamsungBodyComposition] = useState(null);
  const [isSamsungLoading, setIsSamsungLoading] = useState(false);

  useEffect(() => {
    verifyHealthConnect();
  }, []);

  async function verifyHealthConnect() {
    setIsHealthLoading(true);
    setHealthFeedback('');
    try {
      const availability = await isNativeHealthConnectAvailable();
      if (!availability.available) {
        setHealthStatus({ status: availability.status || 'not_available', message: availability.message || 'Health Connect não disponível' });
        setHealthPermissions(null);
        return;
      }

      const permissions = await checkHealthPermissions();
      setHealthPermissions(permissions);
      setHealthStatus({
        status: hasAllHealthPermissions(permissions) ? 'granted' : hasAnyHealthPermission(permissions) ? 'partial' : 'pending',
        message: hasAllHealthPermissions(permissions)
          ? 'Permissões concedidas'
          : hasAnyHealthPermission(permissions)
            ? 'Permissões parcialmente concedidas'
            : 'Permissões pendentes',
      });
    } catch {
      setHealthStatus({ status: 'error', message: 'Erro ao verificar Health Connect' });
    } finally {
      setIsHealthLoading(false);
    }
  }

  async function askHealthPermissions() {
    setIsHealthLoading(true);
    setHealthFeedback('');
    try {
      const permissions = await requestHealthPermissions();
      setHealthPermissions(permissions);
      setHealthStatus({
        status: hasAllHealthPermissions(permissions) ? 'granted' : 'pending',
        message: hasAllHealthPermissions(permissions) ? 'Permissões concedidas' : 'Permissões pendentes',
      });
    } finally {
      setIsHealthLoading(false);
    }
  }

  async function importTodayHealthData() {
    setIsHealthLoading(true);
    setHealthFeedback('');
    try {
      let permissions = healthPermissions || await checkHealthPermissions();
      if (!hasAllHealthPermissions(permissions)) {
        permissions = await requestHealthPermissions();
        setHealthPermissions(permissions);
      }

      if (!hasAnyHealthPermission(permissions)) {
        setHealthFeedback('Permissões do Health Connect pendentes. Você pode preencher manualmente os dados do Fitdays ou Samsung Health.');
        return;
      }

      const result = await readTodayHealthData();
      if (!result.ok || !result.data) {
        setHealthFeedback(result.message || 'Não foi possível importar automaticamente. Você pode preencher manualmente os dados do Fitdays ou Samsung Health.');
        return;
      }

      window.localStorage.setItem('pendingHealthImport', JSON.stringify({
        ...result.data,
        source: 'health_connect',
      }));
      setHealthFeedback(buildHealthFeedback(result.data));
      if (onNavigate) onNavigate('checkin');
    } finally {
      setIsHealthLoading(false);
    }
  }

  async function openSettings() {
    const result = await openHealthConnectSettings();
    if (result?.message) setHealthFeedback(result.message);
  }

  async function runHealthDiagnostics() {
    setIsHealthLoading(true);
    setHealthFeedback('');
    try {
      let permissions = healthPermissions || await checkHealthPermissions();
      if (!hasAnyHealthPermission(permissions)) {
        permissions = await requestHealthPermissions();
        setHealthPermissions(permissions);
      }

      const result = await readHealthConnectDiagnostics();
      if (!result.ok || !result.data) {
        setHealthFeedback(result.message || 'Nao foi possivel diagnosticar os dados publicados no Health Connect.');
        return;
      }

      setHealthDiagnostics(result.data);
      const found = result.data.records?.filter((item) => item.found).length || 0;
      setHealthFeedback(`Diagnostico concluido: ${found} tipos de dados encontrados no Health Connect.`);
    } finally {
      setIsHealthLoading(false);
    }
  }

  async function verifySamsungHealthData() {
    setIsSamsungLoading(true);
    setSamsungFeedback('');
    try {
      const availability = await checkSamsungHealthAvailability();
      setSamsungStatus({
        status: availability.available ? 'granted' : availability.status || 'error',
        message: availability.message || (availability.available ? 'Samsung Health Data SDK disponivel' : 'Samsung Health Data SDK indisponivel'),
      });

      if (availability.available) {
        const permissions = await checkSamsungBodyCompositionPermission();
        setSamsungPermissions(permissions);
      }
    } finally {
      setIsSamsungLoading(false);
    }
  }

  async function askSamsungBodyCompositionPermission() {
    setIsSamsungLoading(true);
    setSamsungFeedback('');
    try {
      const permissions = await requestSamsungBodyCompositionPermission();
      setSamsungPermissions(permissions);
      setSamsungFeedback(permissions?.message || (hasSamsungBodyCompositionPermission(permissions) ? 'Permissao concedida.' : 'Permissao pendente.'));
    } finally {
      setIsSamsungLoading(false);
    }
  }

  async function importSamsungBodyComposition() {
    setIsSamsungLoading(true);
    setSamsungFeedback('');
    try {
      let permissions = samsungPermissions || await checkSamsungBodyCompositionPermission();
      if (!hasSamsungBodyCompositionPermission(permissions)) {
        permissions = await requestSamsungBodyCompositionPermission();
        setSamsungPermissions(permissions);
      }

      if (!hasSamsungBodyCompositionPermission(permissions)) {
        setSamsungFeedback(permissions?.message || 'Permissao de bioimpedancia pendente.');
        return;
      }

      const result = await readLatestSamsungBodyComposition();
      if (!result.ok || !result.data) {
        setSamsungFeedback(result.message || 'Nao foi possivel ler bioimpedancia do Samsung Health.');
        return;
      }

      setSamsungBodyComposition(result.data);
      window.localStorage.setItem('pendingHealthImport', JSON.stringify({
        ...result.data,
        source: 'samsung_health',
      }));
      setSamsungFeedback(`Bioimpedancia Samsung encontrada: ${buildSamsungBodyCompositionSummary(result.data)}. Abra o Check-in para revisar e salvar.`);
      if (onNavigate) onNavigate('checkin');
    } finally {
      setIsSamsungLoading(false);
    }
  }

  const modalsData = {
    samsung: {
      title: 'Samsung Health / Galaxy Fit3',
      status: 'Sincronização via Health Connect',
      explanation: 'A leitura real acontece pelo Health Connect. Sincronize a Galaxy Fit3 com Samsung Health e permita o compartilhamento no Health Connect.',
      dataList: ['Passos', 'Treinos', 'Sono', 'Frequência cardíaca', 'Calorias estimadas'],
      instructions: [
        'Abra o aplicativo Samsung Health no seu celular.',
        'Confirme que a Galaxy Fit3 está sincronizando os dados.',
        'Verifique se passos, sono e frequência cardíaca aparecem no Samsung Health.',
        'Ative o compartilhamento desses dados com Health Connect.',
        'No app Evolução Fitness, use o card Health Connect para solicitar permissões e importar o Check-in.',
      ],
      primaryButton: 'Entendi',
    },
    fitdays: {
      title: 'Balança Fitdays',
      status: 'Sincronização via app da balança',
      explanation: 'A balança precisa sincronizar com Fitdays e depois compartilhar com Samsung Health, Google Fit ou Health Connect quando disponível.',
      dataList: ['Peso', 'IMC', 'Gordura corporal', 'Massa muscular', 'Água corporal', 'Gordura visceral', 'Metabolismo basal'],
      instructions: [
        'Abra o aplicativo Fitdays.',
        'Sincronize a balança subindo descalço.',
        'Verifique se peso e bioimpedância aparecem no Fitdays.',
        'Ative a sincronização com Samsung Health, Google Fit ou Health Connect, se disponível.',
        'Depois, use Health Connect no app Evolução Fitness para importar os dados de hoje.',
      ],
      primaryButton: 'Entendi',
      secondaryButton: 'Preencher manualmente no Check-in',
      onSecondaryClick: () => onNavigate && onNavigate('checkin'),
    },
    healthconnect: {
      title: 'Health Connect',
      status: healthStatus.message,
      explanation: 'O Health Connect é a ponte oficial entre Samsung Health, Fitdays e o app Evolução Fitness no Android.',
      instructions: [
        'Galaxy Fit3 -> Samsung Health -> Health Connect -> Evolução Fitness',
        'Balança -> Fitdays -> Health Connect -> Evolução Fitness',
        'No navegador/PWA, use a importação assistida manual.',
      ],
      primaryButton: 'Entendi',
    },
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-cyanFit">Integrações</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Pronto para dados automáticos</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          No Android, o app pode importar dados autorizados pelo Health Connect. No web/PWA, a importação assistida continua disponível.
        </p>
      </div>

      <section className="card p-4 sm:p-5 border border-mint/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-mint/15 text-mint">
              <Wand2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Importação assistida para Check-in</h2>
              <p className="mt-1 text-sm text-slate-400">
                Preencha dados dos apps de saúde manualmente em uma única tela e envie direto para o check-in do dia.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpenModal('assisted')}
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-mint px-5 font-black text-ink transition hover:bg-mint/90 w-full sm:w-auto"
          >
            <Wand2 size={18} />
            Iniciar importação
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card flex flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-panelSoft text-cyanFit">
              <Smartphone size={24} />
            </div>
            <span className="rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wide border-amberFit/30 bg-amberFit/10 text-amberFit">Via Health Connect</span>
          </div>
          <h2 className="mt-4 text-xl font-black text-white">Samsung Health / Galaxy Fit3</h2>
          <p className="mt-2 text-sm text-slate-400">Sincronize a pulseira com Samsung Health. A leitura no app acontece via Health Connect.</p>
          <button
            onClick={() => setOpenModal('samsung')}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-ink px-4 font-black text-white transition hover:border-cyanFit hover:text-cyanFit"
          >
            <Bluetooth size={18} /> Ver instruções
          </button>
        </article>

        <article className="card flex flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-panelSoft text-cyanFit">
              <Scale size={24} />
            </div>
            <span className="rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wide border-amberFit/30 bg-amberFit/10 text-amberFit">Via Fitdays</span>
          </div>
          <h2 className="mt-4 text-xl font-black text-white">Balança Fitdays / Multilaser</h2>
          <p className="mt-2 text-sm text-slate-400">A balança sincroniza com Fitdays; quando disponível, compartilhe os dados com Health Connect.</p>
          <button
            onClick={() => setOpenModal('fitdays')}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-ink px-4 font-black text-white transition hover:border-cyanFit hover:text-cyanFit"
          >
            <Bluetooth size={18} /> Ver instruções
          </button>
        </article>

        <article className="card flex flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-panelSoft text-cyanFit">
              <Link2 size={24} />
            </div>
            <span className={`rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusClass(healthStatus.status)}`}>
              {healthStatus.message}
            </span>
          </div>
          <h2 className="mt-4 text-xl font-black text-white">Health Connect</h2>
          <p className="mt-2 text-sm text-slate-400">Verifique disponibilidade, conceda permissões e importe dados autorizados para o Check-in.</p>
          <div className="mt-5 grid gap-2">
            <button type="button" onClick={verifyHealthConnect} disabled={isHealthLoading} className={healthButtonClass}>
              <ShieldCheck size={18} /> Verificar disponibilidade
            </button>
            <button type="button" onClick={askHealthPermissions} disabled={isHealthLoading} className={healthButtonClass}>
              <Link2 size={18} /> Solicitar permissões
            </button>
            <button type="button" onClick={importTodayHealthData} disabled={isHealthLoading} className={healthButtonClass}>
              <Download size={18} /> Importar dados de hoje
            </button>
            <button type="button" onClick={openSettings} className={healthButtonClass}>
              <Settings size={18} /> Abrir configurações
            </button>
            <button type="button" onClick={runHealthDiagnostics} disabled={isHealthLoading} className={healthButtonClass}>
              <ShieldCheck size={18} /> Diagnosticar Health Connect
            </button>
            <EnhancedHealthDiagnostics buttonClassName={healthButtonClass} />
          </div>
          {healthFeedback && (
            <p className="mt-3 rounded-lg border border-amberFit/30 bg-amberFit/10 px-3 py-2 text-sm font-semibold text-amberFit">{healthFeedback}</p>
          )}
          {healthDiagnostics && (
            <div className="mt-4 rounded-xl border border-line bg-panelSoft/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white">Diagnostico de dados publicados</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Composicao corporal: ultimos {healthDiagnostics.recentWindowDays || 30} dias. Atividade, sono e batimentos: hoje.
                  </p>
                </div>
                <span className="rounded-lg bg-ink px-2 py-1 text-xs font-bold text-slate-400">
                  {formatDiagnosticDate(healthDiagnostics.generatedAt)}
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                {(healthDiagnostics.records || []).map((item) => (
                  <div key={item.key} className="rounded-lg border border-line bg-ink p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.sourceName ? `Origem: ${item.sourceName}` : 'Origem nao informada'}
                          {item.recordCount ? ` - ${item.recordCount} registro(s)` : ''}
                        </p>
                      </div>
                      <span className={`rounded-lg px-2 py-1 text-xs font-black ${item.found ? 'bg-mint/10 text-mint' : 'bg-coral/10 text-coral'}`}>
                        {item.found ? `${item.value} ${item.unit}` : 'ausente'}
                      </span>
                    </div>
                    {item.lastSeenAt && <p className="mt-2 text-xs text-slate-500">Ultimo registro: {formatDiagnosticDate(item.lastSeenAt)}</p>}
                    {item.sourcePackage && <p className="mt-1 break-all text-xs text-slate-600">{item.sourcePackage}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {healthPermissions && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-400">
              {Object.entries(healthPermissions).map(([key, value]) => (
                <span key={key} className={`rounded-lg bg-ink px-2 py-1 ${value ? 'text-mint' : 'text-slate-500'}`}>
                  {permissionLabel(key)}: {value ? 'ok' : 'pendente'}
                </span>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="card p-4 sm:p-5 border border-cyanFit/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-cyanFit/15 text-cyanFit">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-white">Samsung Health Data SDK</h2>
                <span className={`rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusClass(samsungStatus.status)}`}>
                  {samsungStatus.message}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Leitura nativa opcional para bioimpedancia publicada no Samsung Health. Pode exigir Developer Mode ou liberacao da Samsung para este app.
              </p>
            </div>
          </div>
          {samsungPermissions && (
            <span className={`rounded-lg px-3 py-2 text-xs font-black ${hasSamsungBodyCompositionPermission(samsungPermissions) ? 'bg-mint/10 text-mint' : 'bg-amberFit/10 text-amberFit'}`}>
              bioimpedancia: {hasSamsungBodyCompositionPermission(samsungPermissions) ? 'ok' : 'pendente'}
            </span>
          )}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button type="button" onClick={verifySamsungHealthData} disabled={isSamsungLoading} className={healthButtonClass}>
            <ShieldCheck size={18} /> Verificar Samsung SDK
          </button>
          <button type="button" onClick={askSamsungBodyCompositionPermission} disabled={isSamsungLoading} className={healthButtonClass}>
            <Link2 size={18} /> Permitir bioimpedancia
          </button>
          <button type="button" onClick={importSamsungBodyComposition} disabled={isSamsungLoading} className={healthButtonClass}>
            <Download size={18} /> Importar bioimpedancia
          </button>
        </div>
        {samsungFeedback && (
          <p className="mt-3 rounded-lg border border-amberFit/30 bg-amberFit/10 px-3 py-2 text-sm font-semibold text-amberFit">{samsungFeedback}</p>
        )}
        {samsungBodyComposition && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Peso', samsungBodyComposition.weight, 'kg'],
              ['Gordura', samsungBodyComposition.bodyFat, '%'],
              ['Massa muscular', samsungBodyComposition.muscleMass, 'kg'],
              ['Agua corporal', samsungBodyComposition.bodyWater, 'kg'],
              ['TMB', samsungBodyComposition.bmr, 'kcal'],
              ['IMC', samsungBodyComposition.bmi, ''],
            ].map(([label, value, unit]) => (
              <div key={label} className="rounded-lg border border-line bg-ink p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-black text-white">{value ?? '--'} {unit}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-cyanFit/15 text-cyanFit">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Privacidade e controle</h2>
            <p className="mt-2 text-sm text-slate-400">
              O app solicita apenas permissões necessárias para preencher seu Check-in. Os dados ficam salvos localmente no aparelho, salvo se você exportar ou configurar alguma integração externa.
            </p>
          </div>
        </div>
      </section>

      <IntegrationInstructionModal isOpen={openModal === 'samsung'} onClose={() => setOpenModal(null)} {...modalsData.samsung} />
      <IntegrationInstructionModal isOpen={openModal === 'fitdays'} onClose={() => setOpenModal(null)} {...modalsData.fitdays} />
      <IntegrationInstructionModal isOpen={openModal === 'healthconnect'} onClose={() => setOpenModal(null)} {...modalsData.healthconnect} />

      <AssistedImportModal
        isOpen={openModal === 'assisted'}
        source="importacao_assistida"
        onClose={() => setOpenModal(null)}
        onSuccess={() => {
          setOpenModal(null);
          if (onNavigate) onNavigate('checkin');
        }}
      />
    </div>
  );
}

function statusClass(status) {
  if (status === 'granted') return 'border-mint/30 bg-mint/10 text-mint';
  if (status === 'partial' || status === 'pending' || status === 'unknown') return 'border-amberFit/30 bg-amberFit/10 text-amberFit';
  return 'border-coral/30 bg-coral/10 text-coral';
}

function formatDiagnosticDate(value) {
  if (!value) return '--';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const healthButtonClass = 'flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-ink px-4 text-sm font-black text-white transition hover:border-cyanFit hover:text-cyanFit disabled:opacity-60';

function permissionLabel(key) {
  return {
    steps: 'passos',
    weight: 'peso',
    bodyFat: 'gordura',
    muscleMass: 'massa magra',
    bodyWaterMass: 'água kg',
    boneMass: 'massa óssea',
    bmr: 'bmr',
    heartRate: 'batimentos',
    sleep: 'sono',
    activeCalories: 'cal. ativas',
    totalCalories: 'cal. totais',
  }[key] || key;
}

function buildHealthFeedback(data) {
  const imported = readableFieldList(data?.importedFields);
  const missing = readableFieldList(data?.missingFields);
  if (!imported) return 'Health Connect respondeu, mas não publicou valores para hoje. Confira se Samsung Health/Fitdays estão compartilhando dados.';
  return `Importado: ${imported}. ${missing ? `Sem dados hoje para: ${missing}. ` : ''}${data?.bodyCompositionWindowDays ? `Composição corporal buscada nos últimos ${data.bodyCompositionWindowDays} dias. ` : ''}Abra o Check-in para revisar e salvar.`;
}

function buildSamsungBodyCompositionSummary(data) {
  const items = [];
  if (data?.weight) items.push(`peso ${data.weight} kg`);
  if (data?.bodyFat) items.push(`gordura ${data.bodyFat}%`);
  if (data?.muscleMass) items.push(`massa ${data.muscleMass} kg`);
  if (data?.bodyWater) items.push(`agua ${data.bodyWater} kg`);
  if (data?.bmr) items.push(`TMB ${data.bmr} kcal`);
  return items.length ? items.join(', ') : 'registro encontrado sem campos compativeis';
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
  };
  return fields.map((field) => labels[field] || field).join(', ');
}
