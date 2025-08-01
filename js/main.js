import { analizarDictamen } from './parser.js';
import * as pdfjsLib from '../assets/js/pdf.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = '../assets/js/pdf.worker.min.js';

// === Soporte de TXT y PDF (OCR incluido) ===

function esTextoEscaso(txt) {
  // Menos de 50 palabras = probablemente es imagen
  return (txt.trim().split(/\s+/).length < 50);
}

async function obtenerTextoArchivo(file) {
  if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
    const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
    let texto = "";
    let esEscaneado = false;
    let textoPaginas = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let pageText = content.items.map(item => item.str).join(' ');
      textoPaginas.push(pageText);
      texto += pageText + "\n";
      if (esTextoEscaso(pageText)) esEscaneado = true;
    }
    // Si el PDF parece escaneado, hacer OCR con Tesseract
    if (esEscaneado) {
      texto = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        // Muestra mensaje de OCR
        if (document.getElementById('cargando')) {
          document.getElementById('cargando').innerHTML = `
            <div class="spinner mx-auto mb-2"></div>
            <p>Realizando OCR página ${i} de ${pdf.numPages}...</p>`;
        }
        // OCR con Tesseract.js (español)
        const { data: { text: ocrText } } = await Tesseract.recognize(canvas, 'spa');
        texto += ocrText + "\n";
      }
    }
    return texto;
  } else {
    // txt normal
    return await file.text();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // — Elementos del DOM —
  const dictamenInput        = document.getElementById('dictamenInput');
  const modoToggle           = document.getElementById('modoToggle');
  const modoLabel            = modoToggle.parentElement.querySelector('span');
  const modoSimulacionSelect = document.getElementById('modoSimulacion');
  const iniciarBtn           = document.getElementById('iniciarBtn');
  const cargandoEl           = document.getElementById('cargando');
  const chatContainer        = document.getElementById('chatContainer');
  const respuestaPeritoEl    = document.getElementById('respuestaPerito');
  const evaluarBtn           = document.getElementById('evaluarBtn');
  const btnHistorial         = document.getElementById('exportarPdfBtn');
  const btnPreguntas         = document.getElementById('exportarPreguntasBtn');

  // — Estado interno —
  let estructuraDictamen = null;
  let preguntasActuales  = [];
  let preguntaIndex      = 0;
  let modoAcademico      = true;
  const historial        = [];

  // Ocultar botones de exportación al inicio
  btnHistorial.classList.add('hidden');
  btnPreguntas.classList.add('hidden');

  // Inicializar toggle Académico/Litigio
  modoToggle.checked    = false;
  modoLabel.textContent = 'Académico';
  modoToggle.addEventListener('change', () => {
    modoAcademico = !modoToggle.checked; // checked ⇒ Litigio
    modoLabel.textContent = modoToggle.checked ? 'Litigio' : 'Académico';
  });

  /** Renderiza la evaluación como tabla o párrafos */
  function renderEvaluation(resultado) {
    const lines      = resultado.split('\n').filter(l => l.trim());
    const tableLines = lines.filter(l => l.startsWith('|'));
    const extraLines = lines.filter(l => !l.startsWith('|'));
    if (tableLines.length >= 2) {
      const headers  = tableLines[0].split('|').filter(s => s.trim());
      const dataRows = tableLines.slice(2)
        .map(l => l.split('|').filter(s => s.trim()));
      let html = '<table class="evaluation-table"><thead><tr>';
      headers.forEach(h => html += `<th>${h.trim()}</th>`);
      html += '</tr></thead><tbody>';
      dataRows.forEach(cols => {
        html += '<tr>';
        cols.forEach(c => html += `<td>${c.trim()}</td>`);
        html += '</tr>';
      });
      html += '</tbody></table>';
      extraLines.forEach(p => html += `<p>${p.trim()}</p>`);
      return html;
    }
    return `<p>${resultado.replace(/\n/g,'<br>')}</p>`;
  }

  /** Muestra la pregunta o el mensaje de fin */
  function mostrarPregunta() {
    if (preguntaIndex >= preguntasActuales.length) {
      chatContainer.innerHTML += `
        <div class="flex flex-row-reverse items-start mt-4">
          <div class="flex min-h-[85px] rounded-b-xl rounded-tl-xl bg-slate-50 p-4 dark:bg-slate-800 sm:max-w-md md:max-w-2xl">
            <strong>Fin de la simulación.</strong>
          </div>
        </div>`;
      btnHistorial.classList.remove('hidden');
      btnPreguntas.classList.remove('hidden');
      const wrapper = chatContainer.parentElement;
      wrapper.scrollTop = wrapper.scrollHeight;
      return;
    }
    chatContainer.innerHTML += `
      <div class="flex flex-row-reverse items-start mt-4">
        <div class="flex min-h-[85px] rounded-b-xl rounded-tl-xl bg-slate-50 p-4 dark:bg-slate-800 sm:max-w-md md:max-w-2xl">
          <strong>Pregunta:</strong><br>${preguntasActuales[preguntaIndex]}
        </div>
      </div>`;
    respuestaPeritoEl.value = '';
    respuestaPeritoEl.focus();
    const wrapper = chatContainer.parentElement;
    wrapper.scrollTop = wrapper.scrollHeight;
  }

  /** Incrementa el índice y recalcula */
  function avanzarPregunta() {
    preguntaIndex++;
    mostrarPregunta();
  }

  // — Iniciar simulación —
  iniciarBtn.addEventListener('click', async () => {
    chatContainer.innerHTML      = '';
    preguntasActuales            = [];
    preguntaIndex                = 0;
    btnHistorial.classList.add('hidden');
    btnPreguntas.classList.add('hidden');

    if (!dictamenInput.files[0]) {
      return alert('Selecciona un archivo .txt o .pdf');
    }

    cargandoEl.classList.remove('hidden');
    cargandoEl.innerHTML = `
      <div class="spinner mx-auto mb-2"></div>
      <p>Procesando dictamen y generando preguntas...</p>`;

    // === CAMBIO AQUÍ: lee txt o pdf con o sin OCR ===
    const texto = await obtenerTextoArchivo(dictamenInput.files[0]);
    try {
      estructuraDictamen = await analizarDictamen(texto);
    } catch (err) {
      cargandoEl.classList.add('hidden');
      alert(err.message || 'Error al analizar dictamen');
      return;
    }

    const resp = await fetch('http://localhost:4000/api/preguntas', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modo:       modoSimulacionSelect.value,
        estructura: estructuraDictamen,
        tono:       modoAcademico ? 'academico' : 'litigio'
      })
    });
    const { preguntas } = await resp.json();
    preguntasActuales    = preguntas;

    cargandoEl.classList.add('hidden');
    mostrarPregunta();
  });

  // — Enviar respuesta y evaluar —
  evaluarBtn.addEventListener('click', async () => {
    if (preguntaIndex >= preguntasActuales.length) {
      return alert('Inicia primero la simulación.');
    }
    const respuesta = respuestaPeritoEl.value.trim();
    if (!respuesta) {
      return alert('Escribe tu respuesta.');
    }

    cargandoEl.classList.remove('hidden');
    cargandoEl.innerHTML = `
      <div class="spinner mx-auto mb-2"></div>
      <p>🧠 Evaluando respuesta...</p>`;

    const preguntaActual = preguntasActuales[preguntaIndex];
    const res = await fetch('http://localhost:4000/api/evaluar', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ respuesta })
    });
    const { resultado } = await res.json();

    cargandoEl.classList.add('hidden');
    const evalHTML = renderEvaluation(resultado);
    chatContainer.innerHTML += `
      <div class="flex items-start mt-4">
        <div class="flex rounded-b-xl rounded-tr-xl bg-slate-50 p-4 dark:bg-slate-800 sm:max-w-md md:max-w-2xl">
          <strong>Respuesta:</strong><br>${respuesta}
        </div>
      </div>
      <div class="flex items-start mt-4">
        <div class="flex rounded-b-xl rounded-tr-xl bg-slate-50 p-4 dark:bg-slate-800 flex-col sm:max-w-md md:max-w-2xl">
          <strong>Evaluación:</strong><br>${evalHTML}
        </div>
      </div>`;

    historial.push({ pregunta: preguntaActual, respuesta, evaluacion: resultado });
    const wrapper = chatContainer.parentElement;
    wrapper.scrollTop = wrapper.scrollHeight;
    avanzarPregunta();
  });

  // — Exportar historial completo a PDF —
  btnHistorial.addEventListener('click', async () => {
    const filename = (dictamenInput.files[0]?.name || 'dictamen').replace(/\.[^/.]+$/, '');
    const modo     = modoSimulacionSelect.value;
    const tono     = modoAcademico ? 'Académico' : 'Litigio';
    const fecha    = new Date().toLocaleString();
    const { jsPDF } = window.jspdf;
    const pdf       = new jsPDF();
    const lineHeight = 10;
    const pageLimit  = 280;
    let y = 10;
    pdf.text('PeritIA - Simulación Judicial', 10, y); y += 10;
    pdf.text(`Archivo: ${filename}.txt`, 10, y); y += 10;
    pdf.text(`Modo: ${modo}`, 10, y); y += 10;
    pdf.text(`Tono: ${tono}`, 10, y); y += 10;
    pdf.text(`Fecha: ${fecha}`, 10, y); y += 20;

    historial.forEach((item, idx) => {
      const evaluacion = item.evaluacion.replace(/\n/g, ' ');
      let lines = pdf.splitTextToSize(`Pregunta ${idx + 1}: ${item.pregunta}`, 180);
      pdf.text(lines, 10, y);
      y += lines.length * lineHeight;
      if (y > pageLimit) { pdf.addPage(); y = 10; }

      lines = pdf.splitTextToSize(`Respuesta: ${item.respuesta}`, 180);
      pdf.text(lines, 10, y);
      y += lines.length * lineHeight;
      if (y > pageLimit) { pdf.addPage(); y = 10; }

      lines = pdf.splitTextToSize(`Evaluación: ${evaluacion}`, 180);
      pdf.text(lines, 10, y);
      y += lines.length * lineHeight;
      y += lineHeight;
      if (y > pageLimit) { pdf.addPage(); y = 10; }
    });

    pdf.save(`simulacion_${filename}.pdf`);
  });

  // — Exportar sólo preguntas a PDF —
  btnPreguntas.addEventListener('click', async () => {
    if (!preguntasActuales.length) {
      return alert('No hay preguntas para exportar.');
    }
    const fecha = new Date().toLocaleString();
    const { jsPDF } = window.jspdf;
    const pdf       = new jsPDF();
    const lineHeight = 10;
    const pageLimit  = 280;
    let y = 10;
    pdf.text('Preguntas Generadas', 10, y); y += 10;
    pdf.text(`Fecha: ${fecha}`, 10, y); y += 20;
    preguntasActuales.forEach((q, idx) => {
      const lines = pdf.splitTextToSize(`${idx + 1}. ${q}`, 180);
      pdf.text(lines, 10, y);
      y += lines.length * lineHeight;
      if (y > pageLimit) { pdf.addPage(); y = 10; }
    });
    pdf.save(`preguntas_generadas_${fecha.split(',')[0].replace(/\//g,'-')}.pdf`);
  });
});
