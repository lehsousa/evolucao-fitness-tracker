export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export function weekdayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export function weekKey(date = new Date()) {
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((current - yearStart) / 86400000 + 1) / 7);
  return `${current.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
