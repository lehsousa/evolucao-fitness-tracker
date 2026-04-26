import fs from 'node:fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {});

const API_KEY = env.VITE_EXERCISEDB_API_KEY;
const API_HOST = env.VITE_EXERCISEDB_API_HOST || 'exercisedb.p.rapidapi.com';

async function test() {
  const url = `https://${API_HOST}/exercises/exercise/0025`;
  console.log("Fetching:", url);
  try {
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    });
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
