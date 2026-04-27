import { ChevronDown, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { readEnhancedHealthDiagnostics } from '../../services/health/healthConnectNativeService';

export default function EnhancedHealthDiagnostics({ buttonClassName = '' }) {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedType, setExpandedType] = useState(null);

  async function runDiagnostics() {
    setLoading(true);
    try {
      const result = await readEnhancedHealthDiagnostics();
      setDiagnostics(result);
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setDiagnostics({
        success: false,
        error: 'Nao foi possivel executar o diagnostico avancado.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button type="button" onClick={runDiagnostics} disabled={loading} className={buttonClassName}>
        <ShieldCheck size={18} /> {loading ? 'Analisando...' : 'Diagnostico avancado 90 dias'}
      </button>

      {diagnostics?.success && (
        <div className="mt-4 rounded-xl border border-cyanFit/20 bg-cyanFit/5 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white">Diagnostico avancado Health Connect</h3>
              <p className="mt-1 text-xs text-slate-400">
                Periodo: {diagnostics.queryPeriod || 'Ultimos 90 dias'} - ate 10 registros recentes por tipo.
              </p>
            </div>
            <span className="rounded-lg bg-ink px-2 py-1 text-xs font-bold text-slate-400">
              {formatTimestamp(diagnostics.timestamp)}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {(diagnostics.diagnostics || []).map((typeData) => (
              <div key={typeData.type} className="overflow-hidden rounded-lg border border-line bg-ink">
                <button
                  type="button"
                  onClick={() => setExpandedType(expandedType === typeData.type ? null : typeData.type)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 px-3 py-3 text-left transition hover:bg-panelSoft"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`h-3 w-3 shrink-0 rounded-full ${typeData.hasData ? 'bg-mint' : 'bg-coral'}`} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-white">{getTypeLabel(typeData.type)}</span>
                      <span className="block text-xs font-semibold text-slate-500">{typeData.totalRecords || 0} registros</span>
                    </span>
                  </span>
                  <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${expandedType === typeData.type ? 'rotate-180' : ''}`} />
                </button>

                {expandedType === typeData.type && typeData.hasData && typeData.records?.length > 0 && (
                  <div className="space-y-2 border-t border-line bg-panelSoft/40 p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Ultimos registros ({typeData.records.length})</p>
                    {typeData.records.map((record, index) => (
                      <div key={`${typeData.type}-${record.timestamp}-${index}`} className="rounded-lg border border-line bg-ink px-3 py-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-black text-white">{record.value ?? '--'} {record.unit || ''}</p>
                          <p className="text-xs font-semibold text-slate-400">{formatTimestamp(record.timestamp)}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Origem: {record.sourceName || record.sourcePackage || 'nao informada'}
                          {record.samples ? ` - ${record.samples} amostras` : ''}
                        </p>
                        {record.sourcePackage && <p className="mt-1 break-all text-xs text-slate-600">{record.sourcePackage}</p>}
                      </div>
                    ))}
                    {typeData.latestSource && (
                      <p className="rounded-lg border border-cyanFit/20 bg-cyanFit/10 px-3 py-2 text-xs font-semibold text-cyanFit">
                        App mais recente: {typeData.latestSource}
                      </p>
                    )}
                  </div>
                )}

                {expandedType === typeData.type && !typeData.hasData && (
                  <div className="border-t border-line bg-coral/10 p-3 text-xs font-semibold text-coral">
                    {typeData.error || 'Nenhum registro encontrado nos ultimos 90 dias.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {diagnostics && !diagnostics.success && (
        <div className="mt-3 rounded-lg border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral">
          Erro: {diagnostics.error || 'Nao foi possivel executar o diagnostico avancado.'}
        </div>
      )}
    </div>
  );
}

function getTypeLabel(type) {
  const labels = {
    weight: 'Peso',
    bodyFat: 'Gordura corporal',
    leanBodyMass: 'Massa magra',
    bodyWaterMass: 'Agua corporal',
    boneMass: 'Massa ossea',
    basalMetabolicRate: 'TMB',
    steps: 'Passos',
    heartRate: 'Frequencia cardiaca',
    sleep: 'Sono',
    activeCalories: 'Calorias ativas',
    totalCalories: 'Calorias totais',
  };
  return labels[type] || type;
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}
