import { Capacitor, registerPlugin } from '@capacitor/core';

const HealthConnect = registerPlugin('HealthConnect');

export function isAndroidNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function isNativeHealthConnectAvailable() {
  if (!isAndroidNative()) {
    return {
      available: false,
      status: 'web_fallback',
      message: 'Health Connect disponível apenas no app Android',
    };
  }

  try {
    return await HealthConnect.isAvailable();
  } catch {
    return {
      available: false,
      status: 'plugin_error',
      message: 'Não foi possível verificar o Health Connect neste aparelho',
    };
  }
}

export async function requestHealthPermissions() {
  if (!isAndroidNative()) return emptyPermissions();

  try {
    return await HealthConnect.requestPermissions();
  } catch {
    return emptyPermissions();
  }
}

export async function checkHealthPermissions() {
  if (!isAndroidNative()) return emptyPermissions();

  try {
    return await HealthConnect.checkPermissions();
  } catch {
    return emptyPermissions();
  }
}

export async function readTodayHealthData() {
  if (!isAndroidNative()) {
    return {
      ok: false,
      message: 'Health Connect disponível apenas no app Android',
      data: null,
    };
  }

  try {
    const data = await HealthConnect.readTodayHealthData();
    const diagnostics = await readDiagnosticsSilently();
    return { ok: true, data: mergeDiagnosticsFallback(data, diagnostics) };
  } catch {
    return {
      ok: false,
      message: 'Não foi possível importar automaticamente. Você pode preencher manualmente os dados do Fitdays ou Samsung Health.',
      data: null,
    };
  }
}

export async function readHealthConnectDiagnostics() {
  if (!isAndroidNative()) {
    return {
      ok: false,
      message: 'Health Connect disponivel apenas no app Android',
      data: null,
    };
  }

  try {
    const data = await HealthConnect.readHealthConnectDiagnostics();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      message: 'Nao foi possivel diagnosticar os dados publicados no Health Connect.',
      data: null,
    };
  }
}

export async function readEnhancedHealthConnectDiagnostics() {
  if (!isAndroidNative()) {
    return {
      ok: false,
      message: 'Health Connect disponivel apenas no app Android',
      data: null,
    };
  }

  try {
    const data = await HealthConnect.readEnhancedDiagnostics();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      message: 'Nao foi possivel executar o diagnostico avancado do Health Connect.',
      data: null,
    };
  }
}

export async function readEnhancedHealthDiagnostics() {
  const result = await readEnhancedHealthConnectDiagnostics();

  if (!result.ok) {
    console.warn(result.message || 'Health Connect only available on Android via Capacitor');
    return {
      success: false,
      diagnostics: [],
      queryPeriod: null,
      timestamp: null,
      error: result.message,
    };
  }

  console.log('Enhanced Health Connect Diagnostics:', result.data);

  return {
    success: true,
    diagnostics: result.data?.diagnostics || [],
    queryPeriod: result.data?.queryPeriod,
    timestamp: result.data?.generatedAt || result.data?.timestamp,
  };
}

async function readDiagnosticsSilently() {
  try {
    return await HealthConnect.readHealthConnectDiagnostics();
  } catch {
    return null;
  }
}

function mergeDiagnosticsFallback(data, diagnostics) {
  if (!data || !diagnostics?.records?.length) return data;

  const merged = { ...data };
  const fieldMap = {
    weight: 'weight',
    bodyFat: 'bodyFat',
    muscleMass: 'muscleMass',
    bodyWaterMass: 'bodyWaterMass',
    boneMass: 'boneMass',
    bmr: 'bmr',
    steps: 'steps',
    sleepHours: 'sleepHours',
    avgHeartRate: 'avgHeartRate',
    activeCalories: 'activeCalories',
    totalCalories: 'totalCalories',
  };

  diagnostics.records.forEach((record) => {
    const field = fieldMap[record.key];
    if (!field || !record.found) return;
    if (merged[field] === null || merged[field] === undefined || merged[field] === '') {
      merged[field] = record.value;
    }
  });

  if (merged.estimatedCalories === null || merged.estimatedCalories === undefined || merged.estimatedCalories === '') {
    merged.estimatedCalories = merged.totalCalories ?? merged.activeCalories ?? data.estimatedCalories;
  }

  const trackedFields = [
    'weight',
    'bodyFat',
    'muscleMass',
    'bodyWaterMass',
    'boneMass',
    'bmr',
    'steps',
    'sleepHours',
    'avgHeartRate',
    'activeCalories',
    'totalCalories',
    'estimatedCalories',
  ];
  merged.importedFields = trackedFields.filter((field) => merged[field] !== null && merged[field] !== undefined && merged[field] !== '');
  merged.missingFields = trackedFields.filter((field) => !merged.importedFields.includes(field));
  merged.diagnosticsFallbackApplied = true;
  return merged;
}

export async function openHealthConnectSettings() {
  if (!isAndroidNative()) {
    return {
      opened: false,
      message: 'Health Connect disponível apenas no app Android',
    };
  }

  try {
    return await HealthConnect.openHealthConnectSettings();
  } catch {
    return {
      opened: false,
      message: 'Não foi possível abrir as configurações do Health Connect',
    };
  }
}

export function hasAnyHealthPermission(permissions) {
  return Object.values(permissions || {}).some(Boolean);
}

export function hasAllHealthPermissions(permissions) {
  const values = Object.values(permissions || {});
  return values.length > 0 && values.every(Boolean);
}

function emptyPermissions() {
  return {
    steps: false,
    weight: false,
    bodyFat: false,
    muscleMass: false,
    bodyWaterMass: false,
    boneMass: false,
    bmr: false,
    heartRate: false,
    sleep: false,
    activeCalories: false,
    totalCalories: false,
  };
}
