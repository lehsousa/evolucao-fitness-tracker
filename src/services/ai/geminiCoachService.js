const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function isGeminiConfigured() {
  return Boolean(API_KEY);
}

export async function generateGeminiCoachReport(summary) {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API Key não está configurada no .env');
  }

  const prompt = `Você é um coach fitness seguro, objetivo e conservador. 
Analise o resumo semanal abaixo e gere uma resposta curta em português brasileiro com: resumo da semana, pontos positivos, pontos de atenção e 3 ações para a próxima semana. 
Não faça diagnóstico médico. Não recomende medicamentos, anabolizantes, termogênicos fortes ou creatina. Não altere o treino automaticamente. Sugestões devem ser aprovadas pelo usuário.

RESUMO DA SEMANA DO USUÁRIO:
${JSON.stringify(summary, null, 2)}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

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
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao se comunicar com o Gemini: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Formato de resposta inesperado do Gemini.');
  }

  return text.trim();
}
