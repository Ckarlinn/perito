import request from 'supertest';
import { jest } from '@jest/globals';

// Mock generarRespuestaGPT to avoid calling OpenAI
const mockGenerarRespuestaGPT = jest.fn();

jest.unstable_mockModule('../openai.js', () => ({
  generarRespuestaGPT: mockGenerarRespuestaGPT
}));

const { app } = await import('../server.js');
const { clearDictamenes } = await import('../historial.js');

await clearDictamenes();

beforeEach(async () => {
  mockGenerarRespuestaGPT.mockReset();
  await clearDictamenes();
});

describe('API routes', () => {
  test('/api/analizar returns estructura', async () => {
    mockGenerarRespuestaGPT.mockResolvedValue('estructura de prueba');
    const res = await request(app)
      .post('/api/analizar')
      .send({ texto: 'dictamen' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ estructura: 'estructura de prueba' });
  });

  test('/api/preguntas returns preguntas', async () => {
    mockGenerarRespuestaGPT.mockResolvedValue('pregunta1\npregunta2');
    const estructura = { hechos: '', metodologia: '', conclusiones: '' };
    const res = await request(app)
      .post('/api/preguntas')
      .send({ modo: 'actor', estructura, tono: 'academico' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ preguntas: ['pregunta1', 'pregunta2'] });
  });

  test('/api/evaluar returns resultado', async () => {
    mockGenerarRespuestaGPT.mockResolvedValue('resultado de prueba');
    const res = await request(app)
      .post('/api/evaluar')
      .send({ respuesta: 'ok' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ resultado: 'resultado de prueba' });
  });
});

describe('Dictamenes API', () => {
  test('POST /api/dictamenes adds dictamen', async () => {
    const payload = {
      texto: 'texto',
      estructura: { hechos: [] },
      fecha: '2024-01-01'
    };
    const res = await request(app).post('/api/dictamenes').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
    expect(res.body).toHaveProperty('id');
  });

  test('GET /api/dictamenes lists dictamenes', async () => {
    const payload = {
      texto: 'texto',
      estructura: { hechos: [] },
      fecha: '2024-01-01'
    };
    await request(app).post('/api/dictamenes').send(payload);
    const res = await request(app).get('/api/dictamenes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test('GET /api/dictamenes/:id returns dictamen', async () => {
    const payload = {
      texto: 'texto',
      estructura: { hechos: [] },
      fecha: '2024-01-01'
    };
    const postRes = await request(app).post('/api/dictamenes').send(payload);
    const id = postRes.body.id;
    const res = await request(app).get(`/api/dictamenes/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(payload);
  });

  test('POST /api/dictamenes validates input', async () => {
    const res = await request(app).post('/api/dictamenes').send({ texto: 123 });
    expect(res.status).toBe(400);
  });

  test('GET /api/dictamenes/:id returns 404 when missing', async () => {
    const res = await request(app).get('/api/dictamenes/999');
    expect(res.status).toBe(404);
  });
});
