import { X, Send } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const initialForm = {
  weight: '', bodyFat: '', muscleMass: '', visceralFat: '',
  bodyWater: '', bmr: '', steps: '', sleepHours: '',
  avgHeartRate: '', estimatedCalories: ''
};

export function AssistedImportModal({ isOpen, onClose, onSuccess, source = 'importacao_assistida' }) {
  const [form, setForm] = useState(initialForm);

  function updateField(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Converter vazios em "" e preenchidos em Number
    const parsed = Object.entries(form).reduce((acc, [key, val]) => {
      acc[key] = val === '' ? '' : Number(val);
      return acc;
    }, {});
    
    // Salva no localStorage com timestamp (para expirar se quiser, mas mantemos simples)
    window.localStorage.setItem('pendingHealthImport', JSON.stringify({
      ...parsed,
      source,
      timestamp: new Date().toISOString()
    }));
    
    setForm(initialForm);
    onSuccess();
  }

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
            className="relative w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line p-4">
              <h2 className="text-xl font-black text-white">{modalTitle(source)}</h2>
              <button onClick={onClose} className="rounded-full bg-line/50 p-2 text-slate-300 transition hover:bg-line hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 [scrollbar-width:none]">
              <p className="mb-5 text-sm text-slate-400">
                Preencha os dados consultados no {sourceLabel(source)} para enviá-los ao Check-in.
              </p>

              <form id="assisted-import-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Peso (kg)" value={form.weight} onChange={v => updateField('weight', v)} step="0.1" />
                  <Field label="Gordura corp. (%)" value={form.bodyFat} onChange={v => updateField('bodyFat', v)} step="0.1" />
                  <Field label="Massa muscular (kg)" value={form.muscleMass} onChange={v => updateField('muscleMass', v)} step="0.1" />
                  <Field label="Gordura visceral" value={form.visceralFat} onChange={v => updateField('visceralFat', v)} step="0.1" />
                  <Field label="Água corporal (%)" value={form.bodyWater} onChange={v => updateField('bodyWater', v)} step="0.1" />
                  <Field label="Metabolismo basal" value={form.bmr} onChange={v => updateField('bmr', v)} step="1" />
                  <Field label="Passos" value={form.steps} onChange={v => updateField('steps', v)} step="1" />
                  <Field label="Sono (horas)" value={form.sleepHours} onChange={v => updateField('sleepHours', v)} step="0.1" />
                  <Field label="Freq. cardíaca" value={form.avgHeartRate} onChange={v => updateField('avgHeartRate', v)} step="1" />
                  <Field label="Calorias est." value={form.estimatedCalories} onChange={v => updateField('estimatedCalories', v)} step="1" />
                </div>
              </form>
            </div>

            <div className="border-t border-line p-4 flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex flex-1 min-h-12 items-center justify-center rounded-xl border border-line font-bold text-slate-300 transition hover:bg-panelSoft"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                form="assisted-import-form"
                className="flex flex-1 min-h-12 items-center justify-center gap-2 rounded-xl bg-mint px-4 font-black text-ink transition hover:bg-mint/90"
              >
                <Send size={18} />
                Enviar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function modalTitle(source) {
  if (source === 'samsung_health') return 'Importar do Samsung Health';
  if (source === 'fitdays') return 'Importar do Fitdays';
  return 'Importação Assistida';
}

function sourceLabel(source) {
  if (source === 'samsung_health') return 'Samsung Health';
  if (source === 'fitdays') return 'Fitdays';
  return 'Samsung Health ou Fitdays';
}

function Field({ label, value, onChange, step }) {
  const id = 'import-' + label.toLowerCase().replaceAll(' ', '-').replace(/[()%]/g, '');
  return (
    <div>
      <label className="mb-1.5 block text-[0.7rem] font-bold uppercase tracking-wide text-slate-400" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm font-bold text-white placeholder-slate-500 transition focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint"
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
