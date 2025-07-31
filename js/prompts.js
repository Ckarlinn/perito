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

export function generarPromptPreguntas(modo, estructura) {
  if (modo === 'actor') {
    return `
Actúa como abogado de la parte actora. Genera 5 preguntas para que el perito aclare su dictamen:

- Hechos: ${estructura.hechos}
- Metodología: ${estructura.metodologia}
- Conclusiones: ${estructura.conclusiones}
`;
  }

  if (modo === 'demandado') {
    return `
Actúas como abogado defensor. Haz 5 preguntas para poner en duda el dictamen:

- Hechos: ${estructura.hechos}
- Metodología: ${estructura.metodologia}
- Conclusiones: ${estructura.conclusiones}
`;
  }

  return `
Simula una audiencia. Alterna preguntas entre parte actora y demandada con base en:

- Hechos: ${estructura.hechos}
- Metodología: ${estructura.metodologia}
- Conclusiones: ${estructura.conclusiones}
`;
}
