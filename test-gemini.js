import fs from 'node:fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=');
  const val = rest.join('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {});

const API_KEY = env.VITE_GEMINI_API_KEY;

async function test(model) {
  const prompt = "Teste curto.";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }),
    });

    console.log(`Model: ${model} - Status: ${response.status}`);
    if (!response.ok) {
       const text = await response.text();
       console.log(`Error body:`, text);
    } else {
       const data = await response.json();
       console.log("Response:", JSON.stringify(data, null, 2).substring(0, 200));
    }
  } catch (err) {
    console.error(`Model: ${model} - Error:`, err);
  }
}

async function run() {
  await test('gemini-flash-latest');
  await test('gemini-2.0-flash');
  await test('gemini-2.5-flash');
  await test('gemini-2.5-flash-lite');
}

run();
