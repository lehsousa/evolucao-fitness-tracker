import { useState } from 'react';
import { Bluetooth, ExternalLink, Link2, Scale, ShieldCheck, Smartphone, Wand2 } from 'lucide-react';
import { IntegrationInstructionModal } from '../components/integrations/IntegrationInstructionModal';
import { AssistedImportModal } from '../components/integrations/AssistedImportModal';

export function Integrations({ onNavigate }) {
  const [openModal, setOpenModal] = useState(null);

  const modalsData = {
    samsung: {
      title: 'Samsung Health / Galaxy Fit3',
      status: 'Integração real ainda não ativa',
      explanation: 'O Samsung Health poderá ser integrado futuramente via Health Connect em um app Android.',
      dataList: ['Passos', 'Treinos', 'Sono', 'Frequência cardíaca', 'Calorias estimadas'],
      instructions: [
        'Abra o aplicativo Samsung Health no seu celular.',
        'Confirme que a Galaxy Fit3 está sincronizando os dados.',
        'Verifique se os dados de passos, sono e frequência cardíaca aparecem.',
        'No futuro, você permitirá que o Health Connect compartilhe esses dados com o app Evolução Fitness.'
      ],
      primaryButton: 'Entendi'
    },
    fitdays: {
      title: 'Balança Fitdays',
      status: 'Integração real ainda não ativa',
      explanation: 'A balança envia dados para o app Fitdays; depois esses dados poderão chegar ao nosso app via Health Connect.',
      dataList: ['Peso', 'IMC', 'Gordura corporal', 'Massa muscular', 'Água corporal', 'Gordura visceral', 'Metabolismo basal'],
      instructions: [
        'Abra o aplicativo Fitdays.',
        'Sincronize a balança subindo descalço.',
        'Verifique se o peso e bioimpedância aparecem no Fitdays.',
        'Ative a sincronização com Samsung Health, Google Fit ou Health Connect, se disponível.',
        'Futuramente será importado no app Evolução Fitness de forma automática.'
      ],
      primaryButton: 'Entendi',
      secondaryButton: 'Preencher manualmente no Check-in',
      onSecondaryClick: () => onNavigate && onNavigate('checkin')
    },
    healthconnect: {
      title: 'Health Connect',
      status: 'Preparado, sem integração nativa',
      explanation: 'O Health Connect será a ponte oficial entre Samsung Health, Fitdays e o app Evolução Fitness. Essa integração nativa exigirá um app Android.',
      instructions: [
        'Galaxy Fit3 → Samsung Health → Health Connect → Evolução Fitness',
        'Balança → Fitdays → Health Connect → Evolução Fitness'
      ],
      primaryButton: 'Entendi'
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-cyanFit">Integrações</p>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Pronto para dados automáticos</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Esta versão não conecta ainda com Health Connect, Samsung Health ou Fitdays. A estrutura visual e o modelo de dados já estão preparados para integração futura.
        </p>
      </div>

      {/* Importação Assistida Card */}
      <section className="card p-4 sm:p-5 border border-mint/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-mint/15 text-mint">
              <Wand2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Importação assistida para Check-in</h2>
              <p className="mt-1 text-sm text-slate-400">
                Preencha os dados dos seus apps de saúde manualmente em uma única tela e envie direto para o check-in do dia.
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
        {/* Samsung Health */}
        <article className="card flex flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-panelSoft text-cyanFit">
              <Smartphone size={24} />
            </div>
            <span className="rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wide border-coral/30 bg-coral/10 text-coral">Não conectado</span>
          </div>
          <h2 className="mt-4 text-xl font-black text-white">Samsung Health / Galaxy Fit3</h2>
          <p className="mt-2 text-sm text-slate-400">Preparado para receber dados de pulseira e Samsung Health quando a integração estiver disponível.</p>
          <button 
            onClick={() => setOpenModal('samsung')}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-ink px-4 font-black text-white transition hover:border-cyanFit hover:text-cyanFit"
          >
            <Bluetooth size={18} /> Configurar integração
          </button>
        </article>

        {/* Fitdays */}
        <article className="card flex flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-panelSoft text-cyanFit">
              <Scale size={24} />
            </div>
            <span className="rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wide border-coral/30 bg-coral/10 text-coral">Não conectado</span>
          </div>
          <h2 className="mt-4 text-xl font-black text-white">Balança Fitdays / Multilaser</h2>
          <p className="mt-2 text-sm text-slate-400">Modelo de dados pronto para medidas de bioimpedância importadas no futuro.</p>
          <button 
            onClick={() => setOpenModal('fitdays')}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-ink px-4 font-black text-white transition hover:border-cyanFit hover:text-cyanFit"
          >
            <Bluetooth size={18} /> Configurar integração
          </button>
        </article>

        {/* Health Connect */}
        <article className="card flex flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-panelSoft text-cyanFit">
              <Link2 size={24} />
            </div>
            <span className="rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wide border-mint/30 bg-mint/10 text-mint">Recomendado</span>
          </div>
          <h2 className="mt-4 text-xl font-black text-white">Health Connect</h2>
          <p className="mt-2 text-sm text-slate-400">Será a ponte entre Samsung Health, Fitdays e nosso app para centralizar dados.</p>
          <button 
            onClick={() => setOpenModal('healthconnect')}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-ink px-4 font-black text-white transition hover:border-cyanFit hover:text-cyanFit"
          >
            <ExternalLink size={18} /> Ver instruções
          </button>
        </article>
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

      <IntegrationInstructionModal 
        isOpen={openModal === 'samsung'} 
        onClose={() => setOpenModal(null)} 
        {...modalsData.samsung} 
      />
      <IntegrationInstructionModal 
        isOpen={openModal === 'fitdays'} 
        onClose={() => setOpenModal(null)} 
        {...modalsData.fitdays} 
      />
      <IntegrationInstructionModal 
        isOpen={openModal === 'healthconnect'} 
        onClose={() => setOpenModal(null)} 
        {...modalsData.healthconnect} 
      />
      
      <AssistedImportModal 
        isOpen={openModal === 'assisted'} 
        onClose={() => setOpenModal(null)} 
        onSuccess={() => {
          setOpenModal(null);
          if (onNavigate) onNavigate('checkin');
        }} 
      />
    </div>
  );
}
