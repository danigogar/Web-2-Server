import PDFDocument from 'pdfkit';

// Helper que envuelve un PDFDocument basado en eventos en una Promise.
// Esto SÍ es legítimo (no hay async function dentro del ejecutor de Promise),
// y permite separar la generación del PDF (asíncrona por eventos) del
// flujo principal del servicio.
const collectPDFBuffer = (doc) => new Promise((resolve, reject) => {
  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);
});

// Descarga la firma desde Cloudinary y devuelve un Buffer, o null si algo falla.
// Aislamos esta operación async para no mezclarla con el ejecutor de Promise del PDF.
const fetchSignatureBuffer = async (signatureUrl) => {
  try {
    const response = await fetch(signatureUrl);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error cargando imagen de firma:', error);
    return null;
  }
};

export const generateDeliveryNotePDF = async (deliveryNote, client, project, company) => {
  // 1. Obtenemos primero la firma (si aplica) ANTES de crear el documento,
  //    para no necesitar await dentro del bloque de escritura del PDF.
  let signatureBuffer = null;
  if (deliveryNote.signed && deliveryNote.signatureUrl) {
    signatureBuffer = await fetchSignatureBuffer(deliveryNote.signatureUrl);
  }

  // 2. Creamos el PDFDocument y enganchamos el colector ANTES de empezar a escribir.
  const doc = new PDFDocument({ margin: 50 });
  const bufferPromise = collectPDFBuffer(doc);

  // 3. Escribimos el contenido (todo síncrono, sin await).
  // Logo de la empresa
  if (company?.logo) {
    try {
      doc.image(company.logo, 50, 45, { width: 100 });
    } catch (e) { /* logo inválido: continuamos sin él */ }
  }

  // Título
  doc.fontSize(20).text('ALBARÁN', { align: 'center' });
  doc.moveDown();

  // Información de la empresa
  doc.fontSize(10);
  doc.text(`${company?.name || ''}`, 50, 120);
  doc.text(`CIF: ${company?.cif || ''}`);

  // Información del cliente
  doc.text(`Cliente: ${client.name}`, 350, 120);
  doc.text(`CIF: ${client.cif}`);

  doc.moveDown();

  // Información del albarán
  doc.fontSize(12);
  doc.text(`Nº: ${deliveryNote._id.toString().slice(-8)}`, 50, 200);
  doc.text(`Fecha: ${new Date(deliveryNote.workDate).toLocaleDateString()}`, 50, 220);
  doc.text(`Proyecto: ${project.name}`, 50, 240);
  doc.text(`Descripción: ${deliveryNote.description}`, 50, 260);

  doc.moveDown();

  // Detalles según formato
  if (deliveryNote.format === 'material') {
    doc.text('Materiales:', 50, 300);
    doc.text(`- ${deliveryNote.material}`, 70, 320);
    doc.text(`  Cantidad: ${deliveryNote.quantity} ${deliveryNote.unit}`, 70, 340);
  } else {
    doc.text('Horas trabajadas:', 50, 300);
    if (deliveryNote.hours) {
      doc.text(`- Horas: ${deliveryNote.hours}`, 70, 320);
    }
    if (deliveryNote.workers?.length) {
      doc.text('Trabajadores:', 50, 360);
      deliveryNote.workers.forEach((w, i) => {
        doc.text(`  ${w.name}: ${w.hours} horas`, 70, 380 + i * 20);
      });
    }
  }

  // Firma con imagen
  if (deliveryNote.signed && deliveryNote.signatureUrl) {
    doc.moveDown(2);
    doc.text('Firmado:', 50, 500);
    doc.text(`Fecha: ${new Date(deliveryNote.signedAt).toLocaleDateString()}`, 50, 520);

    if (signatureBuffer) {
      doc.image(signatureBuffer, 350, 480, { width: 150, height: 50 });
    } else {
      doc.text('[Firma no disponible]', 350, 500);
    }
  }

  // 4. Cerramos el documento y esperamos a que el colector termine.
  doc.end();
  return bufferPromise;
};