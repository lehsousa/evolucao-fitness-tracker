import { CalendarCheck, CheckCircle2, Circle, Footprints, HeartPulse, Ruler, Scale } from 'lucide-react';
import { NotificationSettings } from '../components/notifications/NotificationSettings.jsx';
import { ProgressRing } from '../components/ui/ProgressRing.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { dailyChecklist } from '../data/plan.js';
import { formatDate } from '../utils/date.js';

export function Dashboard({
  latestCheckin,
  weeklyCardios,
  checklistPercent,
  checklistStatus,
  toggleChecklistItem,
  notificationSettings,
  notificationControls,
  requestNotificationPermission,
  toggleNotificationsEnabled,
  toggleReminderEnabled,
  updateReminder,
}) {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Scale} label="Peso atual" value={latestCheckin?.weight ? `${latestCheckin.weight} kg` : '--'} detail="Meta: 92-94 kg" />
        <StatCard icon={Ruler} label="Cintura atual" value={latestCheckin?.waist ? `${latestCheckin.waist} cm` : '--'} detail="Medida em jejum" tone="cyan" />
        <StatCard icon={HeartPulse} label="Cardios na semana" value={weeklyCardios} detail="Sessões marcadas" tone="coral" />
        <StatCard icon={Footprints} label="Passos hoje" value={latestCheckin?.steps ? latestCheckin.steps : '--'} detail={latestCheckin ? formatDate(latestCheckin.date) : 'Sem check-in'} tone="amber" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-mint">Checklist diário</p>
              <h2 className="mt-2 text-2xl font-black text-white">Constância de hoje</h2>
              <p className="mt-2 text-sm text-slate-400">Itens salvos por data no navegador.</p>
            </div>
            <div className="self-center">
              <ProgressRing value={checklistPercent} />
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {dailyChecklist.map((item) => {
              const checked = Boolean(checklistStatus[item]);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleChecklistItem(item)}
                  className={`flex min-h-12 items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
                    checked ? 'border-mint/40 bg-mint/10' : 'border-line bg-ink hover:border-slate-500'
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-200">{item}</span>
                  {checked ? <CheckCircle2 className="text-mint" size={21} /> : <Circle className="text-slate-500" size={21} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarCheck className="text-cyanFit" size={22} />
            <h2 className="text-xl font-black text-white">Alertas visuais</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {notificationSettings.reminders.map((reminder) => (
              <div key={reminder.id} className={`rounded-lg border p-4 ${reminder.enabled === false ? 'border-line bg-ink opacity-60' : 'border-line bg-panelSoft'}`}>
                <p className="text-2xl font-black text-cyanFit">{reminder.time}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{reminder.label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{reminder.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NotificationSettings
        settings={notificationSettings}
        supported={notificationControls.supported}
        permission={notificationControls.permission}
        onToggleEnabled={toggleNotificationsEnabled}
        onRequestPermission={requestNotificationPermission}
        onToggleReminder={toggleReminderEnabled}
        onUpdateReminder={updateReminder}
      />
    </div>
  );
}
