export async function simularLLMRespuesta(prompt) {
  // MOCK: simula respuesta del modelo
  if (prompt.includes("Genera 5 preguntas")) {
    return [
      "¿Puede explicar el alcance técnico de su intervención?",
      "¿Qué metodología empleó exactamente?",
      "¿Podría describir las conclusiones principales?",
      "¿Qué hechos motivaron su análisis?",
      "¿Está usted debidamente certificado?"
    ];
  }

  if (prompt.includes("extrae:")) {
    return {
      hechos: "El perito revisó registros de red de marzo 2023.",
      metodologia: "Análisis forense digital siguiendo cadena de custodia.",
      conclusiones: "La evidencia indica acceso no autorizado desde IP interna.",
      fechas: "06/03/2023 (incidente), 10/03/2023 (dictamen)",
      glosario: ["cadena de custodia", "hash MD5", "registro de eventos"]
    };
  }

  if (prompt.includes("calificar esta respuesta")) {
    return `
| Criterio              | Calificación | Justificación                      |
|-----------------------|--------------|------------------------------------|
| Claridad              | 4            | La respuesta fue clara y directa.  |
| Coherencia técnica    | 3            | Le faltó justificar su técnica.    |
| Respuesta bajo presión| 2            | Dudó al principio.                 |
| Dominio metodológico  | 4            | Conocía su procedimiento.          |
| Lenguaje profesional  | 5            | Fue correcto y profesional.        |
`;
  }

  return "Respuesta genérica del LLM simulada.";
}
