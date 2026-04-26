import { useEffect, useMemo, useState } from 'react';

export function useNotifications(settings) {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState(() => (supported ? Notification.permission : 'unsupported'));

  const activeReminders = useMemo(() => {
    return settings.reminders.filter((reminder) => reminder.enabled !== false);
  }, [settings.reminders]);

  useEffect(() => {
    if (!supported || !settings.enabled || permission !== 'granted') return undefined;

    const timers = activeReminders.map((reminder) => scheduleReminder(reminder));

    return () => {
      timers.forEach((clear) => clear());
    };
  }, [activeReminders, permission, settings.enabled, supported]);

  async function requestPermission() {
    if (!supported) {
      setPermission('unsupported');
      return 'unsupported';
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }

  return {
    supported,
    permission,
    requestPermission,
  };
}

function scheduleReminder(reminder) {
  let timerId;
  let active = true;

  function queueNext() {
    const delay = millisecondsUntil(reminder.time);
    timerId = window.setTimeout(async () => {
      await showReminder(reminder);
      if (active) queueNext();
    }, delay);
  }

  queueNext();

  return () => {
    active = false;
    window.clearTimeout(timerId);
  };
}

function millisecondsUntil(time) {
  const [hour, minute] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
}

async function showReminder(reminder) {
  const title = `Evolução: ${reminder.label}`;
  const options = {
    body: reminder.text,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `efl-${reminder.id}`,
    renotify: true,
  };

  const registration = await navigator.serviceWorker?.getRegistration?.();
  if (registration?.showNotification) {
    registration.showNotification(title, options);
    return;
  }

  new Notification(title, options);
}
