import { useEffect, useMemo, useState } from 'react';
import { AppShell } from './components/layout/AppShell.jsx';
import { dailyChecklist, defaultReminders, goals } from './data/plan.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useNotifications } from './hooks/useNotifications.js';
import { Cardio } from './pages/Cardio.jsx';
import { Checkin } from './pages/Checkin.jsx';
import { CoachAI } from './pages/CoachAI.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Evolution } from './pages/Evolution.jsx';
import { Goals } from './pages/Goals.jsx';
import { Integrations } from './pages/Integrations.jsx';
import { NutritionPage } from './pages/NutritionPage.jsx';
import { Photos } from './pages/Photos.jsx';
import { WeeklySuggestions } from './pages/WeeklySuggestions.jsx';
import { WorkoutEditor } from './pages/WorkoutEditor.jsx';
import { Workouts } from './pages/Workouts.jsx';
import { todayKey, weekKey } from './utils/date.js';

const storageKeys = [
  'efl:checkins',
  'efl:workouts',
  'efl:cardios',
  'efl:photos',
  'efl:checklist',
  'efl:notifications',
  'efl:exercise-loads',
  'exerciseLoadHistory',
  'workoutSubstitutions',
  'exerciseDbMappings',
  'selectedWorkoutDay',
  'customWorkoutPlan',
  'weeklyProgressionSuggestions',
  'coachWeeklyReports',
  'nutritionLogs',
];

const defaultNotificationSettings = {
  enabled: false,
  reminders: defaultReminders.map((reminder) => ({ ...reminder, enabled: true })),
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkins, setCheckins] = useLocalStorage('efl:checkins', []);
  const [workoutDoneByDate, setWorkoutDoneByDate] = useLocalStorage('efl:workouts', {});
  const [cardioDoneByWeek, setCardioDoneByWeek] = useLocalStorage('efl:cardios', {});
  const [photos, setPhotos] = useLocalStorage('efl:photos', []);
  const [checklistByDate, setChecklistByDate] = useLocalStorage('efl:checklist', {});
  const [notificationSettings, setNotificationSettings] = useLocalStorage('efl:notifications', defaultNotificationSettings);

  const normalizedNotificationSettings = mergeNotificationSettings(notificationSettings);
  const notificationControls = useNotifications(normalizedNotificationSettings);

  const today = todayKey();
  const currentWeek = weekKey();
  const workoutDone = workoutDoneByDate[today] || {};
  const cardioDone = cardioDoneByWeek[currentWeek] || {};
  const persistedChecklist = checklistByDate[today] || {};

  const normalizedCheckins = useMemo(() => checkins.map(normalizeCheckin), [checkins]);
  const sortedCheckins = useMemo(() => [...normalizedCheckins].sort((a, b) => a.date.localeCompare(b.date)), [normalizedCheckins]);
  const latestCheckin = sortedCheckins.at(-1);
  const firstCheckin = sortedCheckins[0];
  const todayCheckin = normalizedCheckins.find((item) => item.date === today);
  const weeklyCardios = Object.values(cardioDone).filter(Boolean).length;

  const automaticChecklist = {
    'Peso registrado': Boolean(todayCheckin?.weight),
    'Cintura medida': Boolean(todayCheckin?.waist),
    'Treino marcado': Object.values(workoutDone).some(Boolean),
    'Cardio feito': Object.values(cardioDone).some(Boolean),
    'Água registrada': Boolean(todayCheckin?.bodyWater),
  };

  const checklistStatus = dailyChecklist.reduce((status, item) => {
    status[item] = Boolean(persistedChecklist[item] || automaticChecklist[item]);
    return status;
  }, {});

  const checklistPercent = Math.round(
    (dailyChecklist.filter((item) => checklistStatus[item]).length / dailyChecklist.length) * 100,
  );

  const summary = {
    initialWeight: firstCheckin?.weight ?? goals.initialWeight,
    currentWeight: latestCheckin?.weight,
    weightDiff: Number.isFinite(latestCheckin?.weight) ? latestCheckin.weight - (firstCheckin?.weight ?? goals.initialWeight) : undefined,
    initialWaist: firstCheckin?.waist,
    currentWaist: latestCheckin?.waist,
    waistDiff: Number.isFinite(latestCheckin?.waist) && Number.isFinite(firstCheckin?.waist) ? latestCheckin.waist - firstCheckin.waist : undefined,
  };

  useEffect(() => {
    setChecklistByDate((current) => {
      const currentDay = current[today] || {};
      const nextDay = { ...currentDay };
      let changed = false;

      for (const item of dailyChecklist) {
        if (automaticChecklist[item] && !nextDay[item]) {
          nextDay[item] = true;
          changed = true;
        }
      }

      return changed ? { ...current, [today]: nextDay } : current;
    });
  }, [automaticChecklist['Peso registrado'], automaticChecklist['Cintura medida'], automaticChecklist['Treino marcado'], automaticChecklist['Cardio feito'], automaticChecklist['Água registrada'], setChecklistByDate, today]);

  function saveCheckin(checkin) {
    const normalized = normalizeCheckin(checkin);
    setCheckins((current) => {
      const withoutSameDate = current.filter((item) => item.date !== normalized.date);
      return [...withoutSameDate, normalized];
    });
    setActiveTab('evolucao');
  }

  function deleteCheckin(date) {
    const confirmed = window.confirm(`Excluir o check-in de ${date}?`);
    if (!confirmed) return;
    setCheckins((current) => current.filter((item) => item.date !== date));
  }

  function toggleExercise(key) {
    setWorkoutDoneByDate((current) => ({
      ...current,
      [today]: {
        ...(current[today] || {}),
        [key]: !current[today]?.[key],
      },
    }));
  }

  function toggleCardio(name) {
    setCardioDoneByWeek((current) => ({
      ...current,
      [currentWeek]: {
        ...(current[currentWeek] || {}),
        [name]: !current[currentWeek]?.[name],
      },
    }));
  }

  function toggleChecklistItem(item) {
    setChecklistByDate((current) => ({
      ...current,
      [today]: {
        ...(current[today] || {}),
        [item]: !checklistStatus[item],
      },
    }));
  }

  async function requestNotificationPermission() {
    const result = await notificationControls.requestPermission();
    if (result === 'granted') {
      setNotificationSettings((current) => ({ ...mergeNotificationSettings(current), enabled: true }));
    }
  }

  function toggleNotificationsEnabled() {
    setNotificationSettings((current) => {
      const normalized = mergeNotificationSettings(current);
      return { ...normalized, enabled: !normalized.enabled };
    });
  }

  function toggleReminderEnabled(id) {
    setNotificationSettings((current) => {
      const normalized = mergeNotificationSettings(current);
      return {
        ...normalized,
        reminders: normalized.reminders.map((reminder) =>
          reminder.id === id ? { ...reminder, enabled: reminder.enabled === false } : reminder,
        ),
      };
    });
  }

  function updateReminder(id, field, value) {
    setNotificationSettings((current) => {
      const normalized = mergeNotificationSettings(current);
      return {
        ...normalized,
        reminders: normalized.reminders.map((reminder) => (reminder.id === id ? { ...reminder, [field]: value } : reminder)),
      };
    });
  }

  function addPhoto(photo) {
    setPhotos((current) => [...current, photo]);
  }

  function clearData() {
    const confirmed = window.confirm('Tem certeza que deseja limpar todos os check-ins, treinos, cardios, fotos, checklist, cargas e notificações?');
    if (!confirmed) return;

    storageKeys.forEach((key) => window.localStorage.removeItem(key));
    setCheckins([]);
    setWorkoutDoneByDate({});
    setCardioDoneByWeek({});
    setPhotos([]);
    setChecklistByDate({});
    setNotificationSettings(defaultNotificationSettings);
    setActiveTab('dashboard');
  }

  const screens = {
    dashboard: (
      <Dashboard
        latestCheckin={latestCheckin}
        weeklyCardios={weeklyCardios}
        checklistPercent={checklistPercent}
        checklistStatus={checklistStatus}
        toggleChecklistItem={toggleChecklistItem}
        notificationSettings={normalizedNotificationSettings}
        notificationControls={notificationControls}
        requestNotificationPermission={requestNotificationPermission}
        toggleNotificationsEnabled={toggleNotificationsEnabled}
        toggleReminderEnabled={toggleReminderEnabled}
        updateReminder={updateReminder}
      />
    ),
    coach: (
      <CoachAI
        checkins={normalizedCheckins}
        workoutDoneByDate={workoutDoneByDate}
        cardioDoneByWeek={cardioDoneByWeek}
      />
    ),
    treinos: <Workouts workoutDone={workoutDone} toggleExercise={toggleExercise} />,
    'editor-treino': <WorkoutEditor />,
    sugestoes: <WeeklySuggestions workoutDone={workoutDone} cardioDone={cardioDone} onEditPlan={() => setActiveTab('editor-treino')} />,
    nutricao: <NutritionPage latestCheckin={latestCheckin} />,
    cardio: <Cardio cardioDone={cardioDone} toggleCardio={toggleCardio} />,
    checkin: <Checkin onSave={saveCheckin} />,
    evolucao: <Evolution checkins={normalizedCheckins} summary={summary} onDeleteCheckin={deleteCheckin} />,
    metas: <Goals latestCheckin={latestCheckin} weeklyCardios={weeklyCardios} />,
    integracoes: <Integrations onNavigate={setActiveTab} />,
    fotos: <Photos photos={photos} addPhoto={addPhoto} />,
  };

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab} onClearData={clearData}>
      {screens[activeTab]}
    </AppShell>
  );
}

function normalizeCheckin(item) {
  return {
    date: item.date || todayKey(),
    weight: toNumber(item.weight),
    waist: toNumber(item.waist),
    bodyFat: toNumber(item.bodyFat),
    muscleMass: toNumber(item.muscleMass),
    visceralFat: toNumber(item.visceralFat),
    bodyWater: toNumber(item.bodyWater),
    bmr: toNumber(item.bmr ?? item.basalMetabolism),
    steps: toNumber(item.steps),
    sleepHours: toNumber(item.sleepHours),
    avgHeartRate: toNumber(item.avgHeartRate ?? item.averageHeartRate),
    estimatedCalories: toNumber(item.estimatedCalories),
    source: item.source || item.dataSource || 'manual',
  };
}

function toNumber(value) {
  return Number.isFinite(value) ? value : Number(value) || 0;
}

function mergeNotificationSettings(settings) {
  const savedReminders = Array.isArray(settings?.reminders) ? settings.reminders : [];
  const reminders = defaultReminders.map((defaultReminder) => {
    const saved = savedReminders.find((item) => item.id === defaultReminder.id);
    return { ...defaultReminder, enabled: true, ...saved };
  });

  return {
    enabled: Boolean(settings?.enabled),
    reminders,
  };
}
