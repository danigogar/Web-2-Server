import PDFDocument from 'pdfkit';

export const generateDeliveryNotePDF = async (deliveryNote, client, project, company) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (company?.logo) {
      try {
        doc.image(company.logo, 50, 45, { width: 100 });
      } catch (e) { }
    }

    doc.fontSize(20).text('ALBARÁN', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(company?.name || '', 50, 120);
    doc.text(`CIF: ${company?.cif || ''}`);

    doc.text(`Cliente: ${client.name}`, 350, 120);
    doc.text(`CIF: ${client.cif}`);

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Nº: ${deliveryNote._id.toString().slice(-8)}`, 50, 200);
    doc.text(`Fecha: ${new Date(deliveryNote.workDate).toLocaleDateString()}`, 50, 220);
    doc.text(`Proyecto: ${project.name}`, 50, 240);
    doc.text(`Descripción: ${deliveryNote.description}`, 50, 260);

    doc.moveDown();

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

    if (deliveryNote.signed && deliveryNote.signatureUrl) {
      doc.moveDown(2);
      doc.text('Firmado:', 50, 500);
      doc.text(`Fecha: ${new Date(deliveryNote.signedAt).toLocaleDateString()}`, 50, 520);
    }

    doc.end();
  });
};
