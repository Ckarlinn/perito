export async function analizarDictamen(texto) {
  const res = await fetch('http://localhost:4000/api/analizar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto })
  });

  const data = await res.json();

  const partes = data.estructura;

  const resultado = {
    hechos: extraer('Hechos', partes),
    metodologia: extraer('Metodología', partes),
    conclusiones: extraer('Conclusiones', partes),
    fechas: extraer('Fechas', partes),
    glosario: extraer('Glosario', partes)
  };

  return resultado;
}

function extraer(titulo, texto) {
  const regex = new RegExp(`${titulo}:?\\s*([\\s\\S]*?)(\\n\\n|$)`, 'i');
  const match = texto.match(regex);
  return match ? match[1].trim() : 'No encontrado';
}
