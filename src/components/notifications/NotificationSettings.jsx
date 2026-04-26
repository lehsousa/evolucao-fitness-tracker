import { Bell, BellOff, Save, SlidersHorizontal } from 'lucide-react';

export function NotificationSettings({
  settings,
  supported,
  permission,
  onToggleEnabled,
  onRequestPermission,
  onToggleReminder,
  onUpdateReminder,
}) {
  const enabled = supported && settings.enabled && permission === 'granted';

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Bell className="text-amberFit" size={22} />
          <h2 className="text-xl font-black text-white">Notificações</h2>
        </div>
        <button
          type="button"
          onClick={enabled ? onToggleEnabled : onRequestPermission}
          disabled={!supported || permission === 'denied'}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition ${
            enabled ? 'bg-coral/15 text-coral hover:bg-coral/25' : 'bg-mint text-ink hover:bg-green-300'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {enabled ? <BellOff size={18} /> : <Bell size={18} />}
          {enabled ? 'Desativar' : 'Ativar notificações'}
        </button>
      </div>

      {!supported && (
        <StatusMessage tone="warning" text="Este navegador não suporta notificações. Os lembretes visuais continuam ativos no app." />
      )}
      {supported && permission === 'denied' && (
        <StatusMessage tone="warning" text="As notificações foram bloqueadas. Libere a permissão nas configurações do navegador para ativar." />
      )}
      {supported && permission === 'default' && (
        <StatusMessage text="Ative para o navegador pedir permissão e enviar lembretes enquanto o app estiver aberto ou instalado em execução." />
      )}
      {enabled && <StatusMessage tone="success" text="Notificações ativas. Os horários abaixo estão salvos no navegador." />}

      <div className="mt-4 grid gap-3">
        {settings.reminders.map((reminder) => (
          <div key={reminder.id} className="grid gap-3 rounded-lg border border-line bg-ink p-3 sm:grid-cols-[auto_1fr_1.4fr_auto] sm:items-center">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <input
                type="checkbox"
                checked={reminder.enabled !== false}
                onChange={() => onToggleReminder(reminder.id)}
                className="h-4 w-4 accent-green-400"
              />
              <span>{reminder.label}</span>
            </label>
            <input
              type="time"
              value={reminder.time}
              onChange={(event) => onUpdateReminder(reminder.id, 'time', event.target.value)}
              className="field"
            />
            <input
              type="text"
              value={reminder.text}
              onChange={(event) => onUpdateReminder(reminder.id, 'text', event.target.value)}
              className="field"
              aria-label={`Texto do lembrete ${reminder.label}`}
            />
            <div className="hidden items-center justify-center text-slate-500 sm:flex">
              <SlidersHorizontal size={18} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Save size={15} />
        Preferências salvas automaticamente no localStorage.
      </div>
    </section>
  );
}

function StatusMessage({ text, tone = 'info' }) {
  const tones = {
    info: 'border-cyanFit/30 bg-cyanFit/10 text-cyanFit',
    success: 'border-mint/30 bg-mint/10 text-mint',
    warning: 'border-amberFit/30 bg-amberFit/10 text-amberFit',
  };

  return <p className={`mb-3 rounded-lg border px-3 py-2 text-sm font-semibold ${tones[tone]}`}>{text}</p>;
}
