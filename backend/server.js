import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generarRespuestaGPT } from './openai.js';
import { generarPromptPreguntas } from './prompts.js';
import { agregarDictamen, listarDictamenes, obtenerDictamen } from './historial.js';

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/dictamenes', async (req, res) => {
  try {
    const { texto, estructura, fecha } = req.body;
    if (
      typeof texto !== 'string' ||
      typeof fecha !== 'string' ||
      typeof estructura !== 'object'
    ) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    const dictamen = await agregarDictamen({ texto, estructura, fecha });
    res.status(201).json(dictamen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dictamenes', (req, res) => {
  try {
    const dictamenes = listarDictamenes();
    res.json(dictamenes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dictamenes/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const dictamen = obtenerDictamen(id);
    if (!dictamen) {
      return res.status(404).json({ error: 'Dictamen no encontrado' });
    }
    res.json(dictamen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    if (err.message.includes('OpenAI client not initialized')) {
      return res.status(503).json({ error: 'Servicio no disponible' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/preguntas', (_, res) =>
  res.status(405).json({ error: 'Use POST en lugar de GET' })
);

app.post('/api/preguntas', async (req, res) => {
  try {
    const { modo, estructura, tono } = req.body;

    const prompt = generarPromptPreguntas(modo, estructura, tono);

    const respuesta = await generarRespuestaGPT(prompt);
    const preguntas = respuesta.split('\n').filter(p => p.trim() !== '');

    res.json({ preguntas });
  } catch (err) {
    if (err.message.includes('OpenAI client not initialized')) {
      return res.status(503).json({ error: 'Servicio no disponible' });
    }
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
    if (err.message.includes('OpenAI client not initialized')) {
      return res.status(503).json({ error: 'Servicio no disponible' });
    }
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
