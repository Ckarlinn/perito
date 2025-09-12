import request from 'supertest';
import { jest } from '@jest/globals';

// Mock generarRespuestaGPT to avoid calling OpenAI
const mockGenerarRespuestaGPT = jest.fn();

jest.unstable_mockModule('../openai.js', () => ({
  generarRespuestaGPT: mockGenerarRespuestaGPT
}));

// Mock historial functions to avoid writing real files
const memoria = [];
const mockAgregarDictamen = jest.fn(async ({ texto, estructura, fecha }) => {
  const id = memoria.length + 1;
  const dictamen = { id, texto, estructura, fecha };
  memoria.push(dictamen);
  return dictamen;
});
const mockListarDictamenes = jest.fn(() => memoria);
const mockObtenerDictamen = jest.fn(id => memoria.find(d => d.id === id));
const mockClearDictamenes = jest.fn(async () => {
  memoria.length = 0;
});

jest.unstable_mockModule('../historial.js', () => ({
  agregarDictamen: mockAgregarDictamen,
  listarDictamenes: mockListarDictamenes,
  obtenerDictamen: mockObtenerDictamen,
  clearDictamenes: mockClearDictamenes,
}));

const { app } = await import('../server.js');
const { clearDictamenes } = await import('../historial.js');

await clearDictamenes();

beforeEach(async () => {
  mockGenerarRespuestaGPT.mockReset();
  await clearDictamenes();
});

describe('API routes', () => {
  test('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

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

  test('GET /api/preguntas returns 405', async () => {
    const res = await request(app).get('/api/preguntas');
    expect(res.status).toBe(405);
    expect(res.body).toEqual({ error: 'Use POST en lugar de GET' });
  });

  test('/api/evaluar returns resultado', async () => {
    mockGenerarRespuestaGPT.mockResolvedValue('resultado de prueba');
    const res = await request(app)
      .post('/api/evaluar')
      .send({ respuesta: 'ok' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ resultado: 'resultado de prueba' });
  });

  test('/api/analizar handles OpenAI errors', async () => {
    mockGenerarRespuestaGPT.mockRejectedValue(new Error('fallo'));
    const res = await request(app)
      .post('/api/analizar')
      .send({ texto: 'dictamen' });

    expect(res.status).toBe(500);
  });

  test('/api/analizar returns 503 when OpenAI is unavailable', async () => {
    mockGenerarRespuestaGPT.mockRejectedValue(
      new Error('OpenAI client not initialized')
    );
    const res = await request(app)
      .post('/api/analizar')
      .send({ texto: 'dictamen' });

    expect(res.status).toBe(503);
  });

  test('/api/preguntas handles OpenAI errors', async () => {
    mockGenerarRespuestaGPT.mockRejectedValue(new Error('fallo'));
    const estructura = { hechos: '', metodologia: '', conclusiones: '' };
    const res = await request(app)
      .post('/api/preguntas')
      .send({ modo: 'actor', estructura, tono: 'academico' });

    expect(res.status).toBe(500);
  });

  test('/api/preguntas returns 503 when OpenAI is unavailable', async () => {
    mockGenerarRespuestaGPT.mockRejectedValue(
      new Error('OpenAI client not initialized')
    );
    const estructura = { hechos: '', metodologia: '', conclusiones: '' };
    const res = await request(app)
      .post('/api/preguntas')
      .send({ modo: 'actor', estructura, tono: 'academico' });

    expect(res.status).toBe(503);
  });

  test('/api/evaluar handles OpenAI errors', async () => {
    mockGenerarRespuestaGPT.mockRejectedValue(new Error('fallo'));
    const res = await request(app)
      .post('/api/evaluar')
      .send({ respuesta: 'ok' });

    expect(res.status).toBe(500);
  });

  test('/api/evaluar returns 503 when OpenAI is unavailable', async () => {
    mockGenerarRespuestaGPT.mockRejectedValue(
      new Error('OpenAI client not initialized')
    );
    const res = await request(app)
      .post('/api/evaluar')
      .send({ respuesta: 'ok' });

    expect(res.status).toBe(503);
  });
});

describe('Dictamenes API', () => {
  test('POST /api/dictamenes stores dictamen and returns ID', async () => {
    const payload = {
      texto: 'texto',
      estructura: { hechos: [] },
      fecha: '2024-01-01'
    };
    const resPost = await request(app).post('/api/dictamenes').send(payload);
    expect(resPost.status).toBe(201);
    expect(resPost.body).toMatchObject(payload);
    const id = resPost.body.id;
    expect(id).toBeDefined();

    const resGet = await request(app).get(`/api/dictamenes/${id}`);
    expect(resGet.status).toBe(200);
    expect(resGet.body).toEqual({ id, ...payload });
  });

  test('GET /api/dictamenes returns list with added dictamen', async () => {
    const payload = {
      texto: 'texto',
      estructura: { hechos: [] },
      fecha: '2024-01-01'
    };
    const { body: postBody } = await request(app).post('/api/dictamenes').send(payload);
    const resList = await request(app).get('/api/dictamenes');
    expect(resList.status).toBe(200);
    expect(resList.body).toEqual([{ id: postBody.id, ...payload }]);
  });

  test('GET /api/dictamenes/:id returns dictamen or 404', async () => {
    const payload = {
      texto: 'texto',
      estructura: { hechos: [] },
      fecha: '2024-01-01'
    };
    const { body: postBody } = await request(app).post('/api/dictamenes').send(payload);
    const resOk = await request(app).get(`/api/dictamenes/${postBody.id}`);
    expect(resOk.status).toBe(200);
    expect(resOk.body).toEqual({ id: postBody.id, ...payload });

    const resNotFound = await request(app).get('/api/dictamenes/999');
    expect(resNotFound.status).toBe(404);
  });

  test('POST /api/dictamenes with invalid data returns 400', async () => {
    const res = await request(app)
      .post('/api/dictamenes')
      .send({ texto: 123 });
    expect(res.status).toBe(400);
  });

  test('GET /api/dictamenes/:id with invalid id returns 400', async () => {
    const res = await request(app).get('/api/dictamenes/abc');
    expect(res.status).toBe(400);
  });
});
