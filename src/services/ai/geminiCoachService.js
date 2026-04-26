const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function isGeminiConfigured() {
  return Boolean(API_KEY);
}

export async function generateGeminiCoachReport(summary) {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API Key nao esta configurada no .env');
  }

  const prompt = `Voce e um coach fitness seguro, objetivo e conservador.
Analise o resumo semanal abaixo e responda em portugues brasileiro.

Responda SOMENTE com JSON valido neste formato:
{
  "summary": "texto com no maximo 280 caracteres",
  "positives": ["ate 3 frases curtas"],
  "attentionPoints": ["ate 3 frases curtas"],
  "nextWeekActions": ["exatamente 3 acoes curtas"],
  "closing": "frase final curta"
}

Regras:
- Nao use markdown.
- Nao faca diagnostico medico.
- Nao recomende medicamentos, anabolizantes, termogenicos fortes ou creatina.
- Nao altere treino automaticamente.
- Sugestoes devem ser aprovadas pelo usuario.
- Seja direto para caber bem no celular.

RESUMO DA SEMANA DO USUARIO:
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
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao se comunicar com o Gemini: ${response.status}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((part) => part.text || '')
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Formato de resposta inesperado do Gemini.');
  }

  const parsedReport = parseCoachJson(text);

  if (parsedReport) {
    return formatCoachReport(parsedReport);
  }

  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new Error('A resposta do Gemini veio incompleta. Tente novamente em alguns segundos.');
  }

  return text;
}

function parseCoachJson(text) {
  try {
    const cleaned = text
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed?.summary || !Array.isArray(parsed?.nextWeekActions)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function formatCoachReport(report) {
  return [
    'Resumo da semana',
    report.summary,
    '',
    'Pontos positivos',
    ...toBulletLines(report.positives),
    '',
    'Pontos de atenção',
    ...toBulletLines(report.attentionPoints),
    '',
    '3 ações para a próxima semana',
    ...toBulletLines(report.nextWeekActions),
    '',
    report.closing || 'Avance com consistência e aprove cada ajuste antes de aplicar.',
  ]
    .filter((line) => line !== undefined && line !== null)
    .join('\n');
}

function toBulletLines(items) {
  return (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .slice(0, 3)
    .map((item) => `• ${item}`);
}
