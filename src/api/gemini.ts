import { busRoutes } from '../data/busRoutes';
import { BLOCKS } from '../data/blocks';

const GEMINI_API_KEY = 'AIzaSyB6vw0ep-9jXlOmJDblJA45WN6lFJ0z46k';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function askGemini(userQuestion: string): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyB6vw0ep-9jXlOmJDblJA45WN6lFJ0z46k') {
    return 'Gemini API key is not configured. Please add your key in src/api/gemini.ts.';
  }

  const systemPrompt = `
You are a helpful assistant for the SRM KTR Smart Campus mobile app.

You can answer:
- Bus questions using this JSON (routes, stops, times):
${JSON.stringify(busRoutes).slice(0, 8000)}
- Campus map / distance questions using this JSON:
${JSON.stringify(BLOCKS).slice(0, 8000)}

Rules:
- If the user asks about buses, use ONLY the busRoutes data above.
- If the user asks about buildings, locations or distance, use ONLY the BLOCKS data above.
- Be concise (2–4 sentences), no markdown or bullet points.
- If something is not in the data, say you do not have that information instead of guessing.
  `.trim();

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser: ${userQuestion}` }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.warn('Gemini error:', errText);
    throw new Error('Gemini request failed');
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    'Sorry, I could not understand that.';
  return text as string;
}

