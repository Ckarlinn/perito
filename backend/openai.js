import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else if (process.env.NODE_ENV !== 'test') {
  console.error('Error: OPENAI_API_KEY is not set in the environment.');
  console.error('Please create a .env file with your API key.');
  process.exit(1);
}

export async function generarRespuestaGPT(prompt) {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Eres un experto en peritaje judicial.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  return chatCompletion.choices[0].message.content;
}
