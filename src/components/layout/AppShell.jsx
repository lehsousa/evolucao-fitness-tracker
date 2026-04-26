import { Activity, BarChart3, Camera, Dumbbell, HeartPulse, Home, ListChecks, PlugZap, Target, Trash2 } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'treinos', label: 'Treinos', icon: Dumbbell },
  { id: 'cardio', label: 'Cardio', icon: HeartPulse },
  { id: 'checkin', label: 'Check-in', icon: ListChecks },
  { id: 'evolucao', label: 'Evolução', icon: BarChart3 },
  { id: 'metas', label: 'Metas', icon: Target },
  { id: 'integracoes', label: 'Integrações', icon: PlugZap },
  { id: 'fotos', label: 'Fotos', icon: Camera },
];

export function AppShell({ activeTab, setActiveTab, onClearData, children }) {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <header className="sticky top-0 z-20 border-b border-line bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-ink sm:h-11 sm:w-11">
              <Activity size={24} strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black leading-tight text-white sm:text-lg">Evolução Fitness Leandro</p>
              <p className="truncate text-xs font-medium text-slate-400">Perda de gordura, força e constância</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <div className="flex rounded-lg border border-line bg-panelSoft p-1">
              {tabs.map((tab) => (
                <NavButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
              ))}
            </div>
            <ClearButton onClick={onClearData} />
          </div>

          <div className="xl:hidden">
            <ClearButton onClick={onClearData} compact />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 lg:py-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 px-2 pb-3 pt-2 backdrop-blur xl:hidden">
        <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">
          {tabs.map((tab) => (
            <NavButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} compact />
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavButton({ tab, active, onClick, compact = false }) {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      aria-label={tab.label}
      title={tab.label}
      onClick={onClick}
      className={`flex min-h-12 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-bold transition ${
        compact ? 'w-[5.2rem] flex-col gap-1 px-1 text-[0.66rem]' : 'gap-2'
      } ${active ? 'bg-mint text-ink' : 'text-slate-300 hover:bg-panel hover:text-white'}`}
    >
      <Icon size={compact ? 18 : 17} />
      <span className="max-w-full truncate">{tab.label}</span>
    </button>
  );
}

function ClearButton({ onClick, compact = false }) {
  return (
    <button
      type="button"
      aria-label="Limpar dados"
      title="Limpar dados"
      onClick={onClick}
      className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border border-coral/40 bg-coral/10 font-bold text-coral transition hover:bg-coral/20 ${
        compact ? 'w-10 px-0' : 'px-3 text-sm'
      }`}
    >
      <Trash2 size={18} />
      {!compact && <span>Limpar</span>}
    </button>
  );
}
