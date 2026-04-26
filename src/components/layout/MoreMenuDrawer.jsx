import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { NavigationItem } from './NavigationItem';

export function MoreMenuDrawer({ isOpen, onClose, moreTabs, activeTab, setActiveTab, onClearData }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-panel border-t border-line rounded-t-3xl p-5 pb-8 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Mais opções</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-line/50 text-slate-300 hover:text-white hover:bg-line transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moreTabs.map((tab) => (
                <NavigationItem 
                  key={tab.id} 
                  tab={tab} 
                  active={activeTab === tab.id} 
                  onClick={() => {
                    setActiveTab(tab.id);
                    onClose();
                  }} 
                />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => {
                  onClearData();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-coral border border-coral/20 bg-coral/10 hover:bg-coral/20 transition-colors"
              >
                <Trash2 size={20} />
                <span>Limpar Dados</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
