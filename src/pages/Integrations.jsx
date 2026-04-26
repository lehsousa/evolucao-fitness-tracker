import { Bluetooth, ExternalLink, Link2, Scale, ShieldCheck, Smartphone } from 'lucide-react';

const integrations = [
  {
    title: 'Samsung Health / Galaxy Fit3',
    status: 'Não conectado',
    tone: 'coral',
    icon: Smartphone,
    data: ['passos', 'treinos', 'sono', 'frequência cardíaca', 'calorias estimadas'],
    button: 'Configurar integração',
    description: 'Preparado para receber dados de pulseira e Samsung Health quando a integração estiver disponível.',
  },
  {
    title: 'Balança Fitdays / Multilaser HC059N',
    status: 'Não conectado',
    tone: 'coral',
    icon: Scale,
    data: ['peso', 'IMC', 'gordura corporal', 'massa muscular', 'água corporal', 'gordura visceral', 'metabolismo basal'],
    button: 'Configurar integração',
    description: 'Modelo de dados pronto para medidas de bioimpedância importadas no futuro.',
  },
  {
    title: 'Health Connect',
    status: 'Recomendado',
    tone: 'mint',
    icon: Link2,
    data: ['ponte entre Samsung Health', 'Fitdays', 'Evolução Fitness Leandro'],
    button: 'Ver instruções',
    description: 'Será a ponte entre Samsung Health, Fitdays e nosso app para centralizar dados de saúde no Android.',
  },
];

export function Integrations() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-cyanFit">Integrações</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Pronto para dados automáticos</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Esta versão não conecta ainda com Health Connect, Samsung Health ou Fitdays. A estrutura visual e o modelo de dados já estão preparados para integração futura.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.title} integration={integration} />
        ))}
      </section>

      <section className="card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-cyanFit/15 text-cyanFit">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Modelo de dados preparado</h2>
            <p className="mt-2 text-sm text-slate-400">
              O check-in diário agora aceita métricas manuais ou futuras importações de Samsung Health, Fitdays e Health Connect. A origem dos dados fica salva junto com cada registro.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function IntegrationCard({ integration }) {
  const Icon = integration.icon;
  const statusTone = integration.tone === 'mint' ? 'border-mint/30 bg-mint/10 text-mint' : 'border-coral/30 bg-coral/10 text-coral';

  return (
    <article className="card flex flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-panelSoft text-cyanFit">
          <Icon size={24} />
        </div>
        <span className={`rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusTone}`}>{integration.status}</span>
      </div>

      <h2 className="mt-4 text-xl font-black text-white">{integration.title}</h2>
      <p className="mt-2 text-sm text-slate-400">{integration.description}</p>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Dados previstos</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {integration.data.map((item) => (
            <span key={item} className="rounded-lg bg-ink px-2.5 py-1.5 text-xs font-bold text-slate-300">
              {item}
            </span>
          ))}
        </div>
      </div>

      <button type="button" className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-ink px-4 font-black text-white transition hover:border-cyanFit hover:text-cyanFit">
        {integration.title === 'Health Connect' ? <ExternalLink size={18} /> : <Bluetooth size={18} />}
        {integration.button}
      </button>
    </article>
  );
}
