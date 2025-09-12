import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config({ path: new URL('./.env', import.meta.url).pathname });

let client = null;

export function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OpenAI client not initialized: missing OPENAI_API_KEY environment variable'
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function generarRespuestaGPT(prompt) {
  const openai = getClient();
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS) || 15000;
  const openaiPromise = openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Eres un experto en peritaje judicial.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('OpenAI request timed out')), timeoutMs)
  );
  const chatCompletion = await Promise.race([openaiPromise, timeoutPromise]);
  return chatCompletion.choices[0].message.content;
}
