const API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY;
const API_HOST = import.meta.env.VITE_EXERCISEDB_API_HOST || 'exercisedb.p.rapidapi.com';
const API_BASE_URL = 'https://exercisedb.p.rapidapi.com';

export function isExerciseDbConfigured() {
  return Boolean(API_KEY);
}

export async function searchExercisesByName(name) {
  const query = String(name || '').trim();
  if (!query) return [];

  const data = await requestExerciseDb(`/exercises/name/${encodeURIComponent(query)}`);
  return normalizeExerciseList(data);
}

export function buildExerciseGifUrl(exerciseId, resolution = '180') {
  if (!exerciseId || !API_KEY) return '';
  return `https://${API_HOST}/image?exerciseId=${exerciseId}&resolution=${resolution}&rapidapi-key=${API_KEY}`;
}

export function normalizeExerciseDbExercise(apiExercise) {
  const externalId = apiExercise.id || apiExercise.exerciseId || apiExercise._id;
  return {
    externalId,
    name: apiExercise.name,
    bodyPart: apiExercise.bodyPart,
    target: apiExercise.target,
    equipment: apiExercise.equipment,
    gifUrl: buildExerciseGifUrl(externalId),
    secondaryMuscles: apiExercise.secondaryMuscles || [],
    instructions: apiExercise.instructions || [],
    provider: 'ExerciseDB',
  };
}

async function requestExerciseDb(path) {
  if (!API_KEY) {
    throw new Error('Configure VITE_EXERCISEDB_API_KEY para usar a ExerciseDB.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': API_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB respondeu com status ${response.status}.`);
  }

  return response.json();
}

function normalizeExerciseList(data) {
  const list = Array.isArray(data) ? data : data?.data || data?.results || [];

  return list.map(normalizeExerciseDbExercise).filter((exercise) => exercise.externalId && exercise.name);
}
