import React, { useState } from 'react';
import { Activity, BarChart3, BrainCircuit, Camera, Dumbbell, FilePenLine, HeartPulse, Home, ListChecks, PlugZap, ShieldCheck, Sparkles, Target, Utensils } from 'lucide-react';

import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { MoreMenuDrawer } from './MoreMenuDrawer';

const tabs = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'coach', label: 'Coach IA', icon: BrainCircuit },
  { id: 'treinos', label: 'Treinos', icon: Dumbbell },
  { id: 'editor-treino', label: 'Editor', icon: FilePenLine },
  { id: 'admin-plano', label: 'Admin Plano', icon: ShieldCheck },
  { id: 'sugestoes', label: 'Sugestões', icon: Sparkles },
  { id: 'nutricao', label: 'Alimentação', icon: Utensils },
  { id: 'cardio', label: 'Cardio', icon: HeartPulse },
  { id: 'checkin', label: 'Check-in', icon: ListChecks },
  { id: 'evolucao', label: 'Evolução', icon: BarChart3 },
  { id: 'metas', label: 'Metas', icon: Target },
  { id: 'integracoes', label: 'Integrações', icon: PlugZap },
  { id: 'fotos', label: 'Fotos', icon: Camera },
];

const mobileMainTabsIds = ['dashboard', 'treinos', 'nutricao', 'checkin'];
const mobileMainTabs = mobileMainTabsIds.map(id => tabs.find(t => t.id === id));
const mobileMoreTabs = tabs.filter(t => !mobileMainTabsIds.includes(t.id));

export function AppShell({ activeTab, setActiveTab, onClearData, children }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-ink text-slate-200">
      {/* Desktop Sidebar (md and up) */}
      <div className="hidden md:flex w-64 flex-col border-r border-line bg-ink/90 fixed inset-y-0 left-0 z-30">
        <DesktopSidebar 
          tabs={tabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onClearData={onClearData} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Mobile Header (only visible on < md) */}
        <header className="md:hidden sticky top-0 z-20 border-b border-line bg-ink/90 backdrop-blur">
          <div className="mx-auto flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-ink">
                <Activity size={24} strokeWidth={2.6} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-black leading-tight text-white">Evolução Fitness</p>
                <p className="truncate text-xs font-medium text-slate-400">Leandro</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 md:py-8 pb-28 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation (< md) */}
        <MobileBottomNav 
          mainTabs={mobileMainTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMore={() => setIsMoreOpen(true)}
        />

        {/* More Menu Drawer */}
        <MoreMenuDrawer 
          isOpen={isMoreOpen}
          onClose={() => setIsMoreOpen(false)}
          moreTabs={mobileMoreTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClearData={onClearData}
        />
      </div>
    </div>
  );
}
