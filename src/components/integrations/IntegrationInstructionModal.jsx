import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function IntegrationInstructionModal({ isOpen, onClose, title, status, explanation, dataList, instructions, primaryButton, secondaryButton, onSecondaryClick }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-line">
              <div>
                <h2 className="text-xl font-black text-white">{title}</h2>
                <span className="mt-1 inline-block rounded-lg border border-coral/30 bg-coral/10 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-wide text-coral">
                  {status}
                </span>
              </div>
              <button onClick={onClose} className="shrink-0 rounded-full bg-line/50 p-2 text-slate-300 transition hover:bg-line hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-sm text-slate-300 [scrollbar-width:none]">
              <p>{explanation}</p>
              
              {dataList && (
                <div>
                  <p className="mb-2 font-bold text-slate-400">Dados previstos:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {dataList.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}

              {instructions && (
                <div className="rounded-xl bg-ink p-4 mt-2">
                  <p className="mb-2 font-bold text-slate-400">Instruções:</p>
                  <ol className="list-decimal pl-4 space-y-2">
                    {instructions.map((item, i) => <li key={i}>{item}</li>)}
                  </ol>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-line p-5">
              <button 
                onClick={onClose} 
                className="flex w-full min-h-12 items-center justify-center rounded-xl bg-mint px-4 font-black text-ink transition hover:bg-mint/90"
              >
                {primaryButton || 'Entendi'}
              </button>

              {secondaryButton && onSecondaryClick && (
                <button 
                  onClick={() => {
                    onSecondaryClick();
                    onClose();
                  }}
                  className="flex w-full min-h-12 items-center justify-center rounded-xl border border-line bg-transparent px-4 font-bold text-slate-300 transition hover:bg-panelSoft hover:text-white"
                >
                  {secondaryButton}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
