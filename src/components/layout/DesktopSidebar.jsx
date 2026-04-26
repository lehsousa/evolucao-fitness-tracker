import React from 'react';
import { Activity, Trash2 } from 'lucide-react';
import { NavigationItem } from './NavigationItem';

export function DesktopSidebar({ tabs, activeTab, setActiveTab, onClearData }) {
  return (
    <div className="flex h-full w-full flex-col bg-panel border-r border-line p-4 overflow-y-auto">
      {/* Logo Area */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint text-ink">
          <Activity size={24} strokeWidth={2.6} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-black leading-tight text-white">Evolução Fitness</p>
          <p className="truncate text-xs font-medium text-slate-400">Leandro</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1 flex-1">
        {tabs.map((tab) => (
          <NavigationItem 
            key={tab.id} 
            tab={tab} 
            active={activeTab === tab.id} 
            onClick={() => setActiveTab(tab.id)} 
          />
        ))}
      </nav>

      {/* Footer / Clear Data */}
      <div className="mt-8 pt-4 border-t border-line/50">
        <button
          type="button"
          onClick={onClearData}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-coral border border-coral/20 bg-coral/10 hover:bg-coral/20 transition-colors"
        >
          <Trash2 size={20} />
          <span>Limpar Dados</span>
        </button>
      </div>
    </div>
  );
}
