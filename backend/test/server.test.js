import request from 'supertest';
import { jest } from '@jest/globals';

// Mock generarRespuestaGPT to avoid calling OpenAI
const mockGenerarRespuestaGPT = jest.fn();

jest.unstable_mockModule('../openai.js', () => ({
  generarRespuestaGPT: mockGenerarRespuestaGPT
}));

const { app } = await import('../server.js');

beforeEach(() => {
  mockGenerarRespuestaGPT.mockReset();
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
