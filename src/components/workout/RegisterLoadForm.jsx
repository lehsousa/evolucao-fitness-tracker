import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { todayKey } from '../../utils/date.js';

const emptyForm = {
  date: todayKey(),
  sets: '',
  reps: '',
  weight: '',
  rpe: '',
  notes: '',
};

export function RegisterLoadForm({ exerciseId, editingEntry, onSave, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(editingEntry || { ...emptyForm, date: todayKey() });
  }, [editingEntry]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave({
      ...form,
      exerciseId,
      sets: Number(form.sets) || 0,
      reps: String(form.reps || ''),
      weight: Number(form.weight) || 0,
      rpe: form.rpe === '' ? '' : Number(form.rpe),
      notes: form.notes.trim(),
    });
    setForm({ ...emptyForm, date: todayKey() });
  }

  return (
    <section className="card bg-panelSoft p-4 shadow-none">
      <h3 className="text-lg font-black text-white">{editingEntry ? 'Editar carga' : 'Registrar carga'}</h3>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Data" type="date" value={form.date} onChange={(value) => updateField('date', value)} />
          <Field label="Séries" value={form.sets} onChange={(value) => updateField('sets', value)} step="1" />
          <TextField label="Repetições" value={form.reps} onChange={(value) => updateField('reps', value)} placeholder="10,10,9,8" />
          <Field label="Carga em kg" value={form.weight} onChange={(value) => updateField('weight', value)} step="0.5" />
          <Field label="RPE opcional" value={form.rpe} onChange={(value) => updateField('rpe', value)} step="1" min="1" max="10" required={false} />
        </div>
        <div>
          <label className="label" htmlFor="load-notes">Observações</label>
          <textarea
            id="load-notes"
            className="field min-h-20 resize-y"
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Boa execução, aumentar pouco na próxima semana..."
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-mint px-4 font-black text-ink transition hover:bg-green-300">
            <Save size={18} />
            {editingEntry ? 'Salvar edição' : 'Salvar carga'}
          </button>
          {editingEntry && (
            <button type="button" onClick={onCancelEdit} className="min-h-11 rounded-lg border border-line px-4 font-bold text-slate-300 transition hover:text-white">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function Field({ label, value, onChange, step, type = 'number', min = '0', max, required = true }) {
  const id = label.toLowerCase().replaceAll(' ', '-');
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="field"
        type={type}
        inputMode={type === 'number' ? 'decimal' : undefined}
        min={type === 'number' ? min : undefined}
        max={max}
        step={step}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  const id = label.toLowerCase().replaceAll(' ', '-');
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} className="field" type="text" value={value} required placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
