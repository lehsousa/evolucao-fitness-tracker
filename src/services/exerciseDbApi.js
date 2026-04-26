const API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY;
const API_HOST = import.meta.env.VITE_EXERCISEDB_API_HOST || 'exercisedb.p.rapidapi.com';
const API_BASE_URL = import.meta.env.VITE_EXERCISEDB_API_BASE_URL || `https://${API_HOST}`;

export function hasExerciseDbConfig() {
  return Boolean(API_KEY);
}

export async function searchExercisesByName(name) {
  const query = String(name || '').trim();
  if (!query) return [];

  const data = await requestExerciseDb(`/exercises/name/${encodeURIComponent(query)}`);
  return normalizeExerciseList(data);
}

export async function getExerciseGif(exerciseId) {
  if (!exerciseId) return '';

  const data = await requestExerciseDb(`/exercises/exercise/${encodeURIComponent(exerciseId)}`);
  const exercise = Array.isArray(data) ? data[0] : data;
  return exercise?.gifUrl || exercise?.gifURL || exercise?.gif || '';
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

  return list.map((exercise) => ({
    id: exercise.id || exercise.exerciseId || exercise._id,
    name: exercise.name,
    equipment: exercise.equipment,
    bodyPart: exercise.bodyPart,
    target: exercise.target,
    gifUrl: exercise.gifUrl || exercise.gifURL || exercise.gif || '',
  })).filter((exercise) => exercise.id && exercise.name);
}
