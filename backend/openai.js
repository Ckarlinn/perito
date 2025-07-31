import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generarRespuestaGPT(prompt) {
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
