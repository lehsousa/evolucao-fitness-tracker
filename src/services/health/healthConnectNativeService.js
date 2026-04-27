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
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      message: 'Não foi possível importar automaticamente. Você pode preencher manualmente os dados do Fitdays ou Samsung Health.',
      data: null,
    };
  }
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
    bmr: false,
    heartRate: false,
    sleep: false,
    activeCalories: false,
    totalCalories: false,
  };
}
