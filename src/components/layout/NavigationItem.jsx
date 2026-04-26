import React from 'react';

export function NavigationItem({ tab, active, onClick, compact = false }) {
  const Icon = tab.icon;
  
  return (
    <button
      type="button"
      aria-label={tab.label}
      title={tab.label}
      onClick={onClick}
      className={`
        flex shrink-0 items-center transition-colors relative z-10 overflow-hidden select-none
        ${compact 
          ? 'w-[4.5rem] flex-col justify-center gap-1 min-h-[3.5rem] rounded-xl text-[0.65rem]' 
          : 'w-full gap-3 px-4 py-3 rounded-xl text-sm justify-start'
        } 
        ${active 
          ? 'bg-mint text-ink font-bold' 
          : 'text-slate-400 hover:bg-panel hover:text-white font-medium'
        }
      `}
    >
      <Icon size={compact ? 22 : 20} className="shrink-0 relative z-10" />
      <span className="truncate max-w-full relative z-10 leading-none">{tab.label}</span>
    </button>
  );
}
