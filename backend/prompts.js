export function generarPromptExtraccion(dictamen) {
  return `
Eres un asistente forense legal experto en análisis de dictámenes. A partir del siguiente texto, extrae:

1. Hechos relevantes
2. Metodología utilizada
3. Conclusiones principales
4. Fechas clave
5. Glosario técnico

Texto:
"""${dictamen}"""
`;
}

export function generarPromptDesdeModo(modo, hechos, metodologia, conclusiones, tono = 'academico') {
  let tonoInstr = '';

  if (tono === 'academico') {
    tonoInstr = `
Utiliza un tono académico, claro y formativo. Las instrucciones deben estar dirigidas a que el perito desarrolle su dictamen con fines de aprendizaje.
No uses lenguaje agresivo ni coloquial.`;
  }

  if (tono === 'litigio') {
    tonoInstr = `
Utiliza un tono litigioso y profesional. Las instrucciones deben simular preguntas de un juicio real, con intención de presionar, evidenciar omisiones o exigir precisión.
Evita rodeos y mantén una actitud firme.`;
  }

  let base = '';
  if (modo === 'actor') {
    base = `
Actúas como abogado de la parte actora. Formula 5 instrucciones dirigidas al perito. Todas deben empezar con “Que el perito…”.

Basado en:
- Hechos: ${hechos}
- Metodología: ${metodologia}
- Conclusiones: ${conclusiones}
${tonoInstr}

Devuelve solo la lista sin encabezados.
`;
  } else if (modo === 'demandado') {
    base = `
Actúas como abogado defensor. Formula 5 instrucciones para poner en duda el dictamen del perito. Comienza cada línea con “Que el perito…”.

Basado en:
- Hechos: ${hechos}
- Metodología: ${metodologia}
- Conclusiones: ${conclusiones}
${tonoInstr}

Solo devuelve la lista.
`;
  } else {
    base = `
Simula una audiencia con 5 instrucciones alternadas. Indica (Actor) o (Demandado) al inicio. Todas deben iniciar con “Que el perito…”.

- Hechos: ${hechos}
- Metodología: ${metodologia}
- Conclusiones: ${conclusiones}
${tonoInstr}

Devuelve solo la lista con formato:
(Actor) Que el perito...
(Demandado) Que el perito...
`;
  }

  return base;
}
