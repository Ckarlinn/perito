import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'dictamenes.json');

let dictamenes = [];

async function cargar() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    dictamenes = JSON.parse(data);
  } catch (err) {
    dictamenes = [];
  }
}

async function guardar() {
  await fs.writeFile(DATA_FILE, JSON.stringify(dictamenes, null, 2));
}

export function listarDictamenes() {
  return dictamenes;
}

export function obtenerDictamen(id) {
  return dictamenes.find(d => d.id === id);
}

export async function agregarDictamen({ texto, estructura, fecha }) {
  const id = dictamenes.length > 0 ? dictamenes[dictamenes.length - 1].id + 1 : 1;
  const dictamen = { id, texto, estructura, fecha };
  dictamenes.push(dictamen);
  await guardar();
  return dictamen;
}

export async function clearDictamenes() {
  dictamenes = [];
  await guardar();
}

await cargar();

