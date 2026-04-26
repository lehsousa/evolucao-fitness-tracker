import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { todayKey } from '../utils/date.js';
import { getExerciseHistory } from '../utils/workoutUtils.js';

export function useExerciseHistory() {
  const [history, setHistory] = useLocalStorage('exerciseLoadHistory', []);
  const [substitutions, setSubstitutions] = useLocalStorage('workoutSubstitutions', {});
  const [exerciseDbMappings, setExerciseDbMappings] = useLocalStorage('exerciseDbMappings', {});
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useLocalStorage('selectedWorkoutDay', 'segunda');
  const safeHistory = Array.isArray(history) ? history : [];
  const safeSubstitutions = isPlainObject(substitutions) ? substitutions : {};
  const safeExerciseDbMappings = isPlainObject(exerciseDbMappings) ? exerciseDbMappings : {};

  useEffect(() => {
    try {
      const legacy = window.localStorage.getItem('efl:exercise-loads');
      if (!legacy || safeHistory.length) return;

      const parsed = JSON.parse(legacy);
      if (!parsed || Array.isArray(parsed)) return;

      const migrated = Object.entries(parsed).flatMap(([exerciseId, entries]) =>
        (entries || []).map((entry) => normalizeLoadEntry({ ...entry, exerciseId })),
      );

      if (migrated.length) setHistory(migrated);
    } catch {
      // Keeps the app usable if old localStorage data is malformed.
    }
  }, [safeHistory.length, setHistory]);

  function addLoad(entry) {
    setHistory((current) => [...(Array.isArray(current) ? current : []), normalizeLoadEntry(entry)]);
  }

  function updateLoad(id, patch) {
    setHistory((current) => (Array.isArray(current) ? current : []).map((entry) => (entry.id === id ? normalizeLoadEntry({ ...entry, ...patch }) : entry)));
  }

  function deleteLoad(id) {
    setHistory((current) => (Array.isArray(current) ? current : []).filter((entry) => entry.id !== id));
  }

  function getHistoryByExercise(exerciseId) {
    return getExerciseHistory(safeHistory, exerciseId);
  }

  function selectSubstitution(exerciseId, alternativeId) {
    const date = todayKey();
    setSubstitutions((current) => ({
      ...(isPlainObject(current) ? current : {}),
      [date]: {
        ...((isPlainObject(current) && isPlainObject(current[date])) ? current[date] : {}),
        [exerciseId]: alternativeId,
      },
    }));
  }

  function clearSubstitution(exerciseId) {
    const date = todayKey();
    setSubstitutions((current) => {
      const safeCurrent = isPlainObject(current) ? current : {};
      const day = { ...(isPlainObject(safeCurrent[date]) ? safeCurrent[date] : {}) };
      delete day[exerciseId];
      return { ...safeCurrent, [date]: day };
    });
  }

  function getTodaySubstitution(exerciseId) {
    return safeSubstitutions[todayKey()]?.[exerciseId];
  }

  function saveExerciseDbMapping(localExerciseId, externalExercise) {
    setExerciseDbMappings((current) => ({
      ...(isPlainObject(current) ? current : {}),
      [localExerciseId]: {
        provider: 'ExerciseDB',
        externalId: externalExercise.externalId,
        name: externalExercise.name,
        gifUrl: externalExercise.gifUrl || '',
        bodyPart: externalExercise.bodyPart || '',
        target: externalExercise.target || '',
        equipment: externalExercise.equipment || '',
        mappedAt: new Date().toISOString().split('T')[0],
      },
    }));
  }

  function removeExerciseDbMapping(localExerciseId) {
    setExerciseDbMappings((current) => {
      const next = { ...(isPlainObject(current) ? current : {}) };
      delete next[localExerciseId];
      return next;
    });
  }

  return {
    history: safeHistory,
    selectedWorkoutDay,
    setSelectedWorkoutDay,
    addLoad,
    updateLoad,
    deleteLoad,
    getHistoryByExercise,
    substitutions: safeSubstitutions,
    selectSubstitution,
    clearSubstitution,
    getTodaySubstitution,
    exerciseDbMappings: safeExerciseDbMappings,
    saveExerciseDbMapping,
    removeExerciseDbMapping,
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeLoadEntry(entry) {
  return {
    id: entry.id || crypto.randomUUID(),
    exerciseId: entry.exerciseId,
    date: entry.date || todayKey(),
    sets: Number(entry.sets) || 0,
    reps: String(entry.reps || ''),
    weight: Number(entry.weight) || 0,
    rpe: entry.rpe === '' || entry.rpe === undefined ? '' : Number(entry.rpe),
    notes: entry.notes || '',
  };
}
