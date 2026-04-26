import React from 'react';
import { Menu } from 'lucide-react';
import { NavigationItem } from './NavigationItem';

export function MobileBottomNav({ mainTabs, activeTab, setActiveTab, onOpenMore }) {
  const moreTab = { id: 'more', label: 'Mais', icon: Menu };
  const isMoreActive = !mainTabs.some(tab => tab.id === activeTab);

  return (
    <nav 
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {mainTabs.map((tab) => (
          <NavigationItem 
            key={tab.id} 
            tab={tab} 
            active={activeTab === tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            compact 
          />
        ))}
        <NavigationItem 
          tab={moreTab} 
          active={isMoreActive} 
          onClick={onOpenMore} 
          compact 
        />
      </div>
    </nav>
  );
}
