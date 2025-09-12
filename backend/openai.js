import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config({ path: new URL('./.env', import.meta.url).pathname });

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else if (process.env.NODE_ENV !== 'test') {
  console.error('Error: OPENAI_API_KEY is not set in the environment.');
  console.error('Please create a .env file with your API key.');
}

export async function generarRespuestaGPT(prompt) {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Set OPENAI_API_KEY.');
  }
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
