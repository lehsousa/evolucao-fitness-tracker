import { Capacitor, registerPlugin } from '@capacitor/core';

const SamsungHealthData = registerPlugin('SamsungHealthData');

export function isSamsungHealthNativeAvailable() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function checkSamsungHealthAvailability() {
  if (!isSamsungHealthNativeAvailable()) {
    return {
      available: false,
      status: 'web_fallback',
      message: 'Samsung Health Data SDK disponivel apenas no app Android',
    };
  }

  try {
    return await SamsungHealthData.isAvailable();
  } catch {
    return {
      available: false,
      status: 'plugin_error',
      message: 'Nao foi possivel verificar o Samsung Health Data SDK neste aparelho',
    };
  }
}

export async function checkSamsungBodyCompositionPermission() {
  if (!isSamsungHealthNativeAvailable()) return emptySamsungPermissions();

  try {
    return await SamsungHealthData.checkPermissions();
  } catch {
    return emptySamsungPermissions();
  }
}

export async function requestSamsungBodyCompositionPermission() {
  if (!isSamsungHealthNativeAvailable()) return emptySamsungPermissions();

  try {
    return await SamsungHealthData.requestPermissions();
  } catch {
    return emptySamsungPermissions();
  }
}

export async function readLatestSamsungBodyComposition() {
  if (!isSamsungHealthNativeAvailable()) {
    return {
      ok: false,
      message: 'Samsung Health Data SDK disponivel apenas no app Android',
      data: null,
    };
  }

  try {
    const result = await SamsungHealthData.readLatestBodyComposition();
    if (!result?.ok) {
      return {
        ok: false,
        message: result?.message || 'Nao foi possivel ler bioimpedancia do Samsung Health',
        data: null,
        raw: result,
      };
    }

    return {
      ok: true,
      data: normalizeSamsungBodyComposition(result.latest),
      records: result.records || [],
      totalRecords: result.totalRecords || 0,
      raw: result,
    };
  } catch {
    return {
      ok: false,
      message: 'Nao foi possivel ler bioimpedancia do Samsung Health',
      data: null,
    };
  }
}

export async function readSamsungBodyCompositionHistory(limit = 10) {
  if (!isSamsungHealthNativeAvailable()) {
    return {
      ok: false,
      message: 'Samsung Health Data SDK disponivel apenas no app Android',
      records: [],
    };
  }

  try {
    const result = await SamsungHealthData.readBodyCompositionHistory({ limit });
    return {
      ok: Boolean(result?.ok),
      message: result?.message,
      records: Array.isArray(result?.records) ? result.records.map(normalizeSamsungBodyComposition) : [],
      totalRecords: result?.totalRecords || 0,
      raw: result,
    };
  } catch {
    return {
      ok: false,
      message: 'Nao foi possivel ler historico de bioimpedancia do Samsung Health',
      records: [],
    };
  }
}

export function normalizeSamsungBodyComposition(record) {
  if (!record) return null;

  return {
    ...record,
    date: record.date,
    weight: numberOrNull(record.weight),
    bodyFat: numberOrNull(record.bodyFat),
    muscleMass: firstNumber(record.skeletalMuscleMass, record.fatFreeMass, record.skeletalMuscle, record.muscleMassPercent),
    bodyWater: numberOrNull(record.bodyWater),
    bmr: numberOrNull(record.bmr),
    bmi: numberOrNull(record.bmi),
    bodyFatMass: numberOrNull(record.bodyFatMass),
    fatFreeMass: numberOrNull(record.fatFreeMass),
    source: 'samsung_health',
    importedFields: importedSamsungFields(record),
  };
}

export function hasSamsungBodyCompositionPermission(permissions) {
  return Boolean(permissions?.bodyComposition);
}

function importedSamsungFields(record) {
  const fields = [];
  if (hasValue(record?.weight)) fields.push('weight');
  if (hasValue(record?.bodyFat)) fields.push('bodyFat');
  if (hasValue(record?.skeletalMuscleMass) || hasValue(record?.fatFreeMass) || hasValue(record?.skeletalMuscle) || hasValue(record?.muscleMassPercent)) fields.push('muscleMass');
  if (hasValue(record?.bodyWater)) fields.push('bodyWater');
  if (hasValue(record?.bmr)) fields.push('bmr');
  if (hasValue(record?.bmi)) fields.push('bmi');
  if (hasValue(record?.bodyFatMass)) fields.push('bodyFatMass');
  return fields;
}

function emptySamsungPermissions() {
  return {
    bodyComposition: false,
    status: 'pending',
    message: 'Permissao de bioimpedancia pendente',
  };
}

function firstNumber(...values) {
  for (const value of values) {
    const parsed = numberOrNull(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}
