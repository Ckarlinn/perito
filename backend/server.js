import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generarRespuestaGPT } from './openai.js';
import { generarPromptPreguntas } from './prompts.js';

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analizar', async (req, res) => {
  try {
    const { texto } = req.body;
    const prompt = `
Eres un asistente forense legal experto. A partir del siguiente dictamen, extrae:

1. Hechos clave (concretos)
2. Metodología empleada
3. Principales conclusiones
4. Fechas importantes
5. Glosario técnico

Texto del dictamen:
"""${texto}"""
`;

    const respuesta = await generarRespuestaGPT(prompt);
    res.json({ estructura: respuesta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/preguntas', async (req, res) => {
  try {
    const { modo, estructura, tono } = req.body;

    const prompt = generarPromptPreguntas(modo, estructura, tono);

    const respuesta = await generarRespuestaGPT(prompt);
    const preguntas = respuesta.split('\n').filter(p => p.trim() !== '');

    res.json({ preguntas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/evaluar', async (req, res) => {
  try {
    const { respuesta } = req.body;

    const prompt = `
Eres un evaluador legal experto. Califica esta respuesta dada por un perito en juicio:

Respuesta:
“${respuesta}”

Evalúa del 1 al 5 en cada uno de los siguientes criterios, y justifica:

1. Claridad
2. Coherencia técnica
3. Respuesta bajo presión
4. Dominio metodológico
5. Lenguaje profesional

Devuelve una tabla y una recomendación final.
`;

    const resultado = await generarRespuestaGPT(prompt);
    res.json({ resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
