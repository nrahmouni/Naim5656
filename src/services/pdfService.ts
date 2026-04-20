import { jsPDF } from 'jspdf';

export const pdfService = {
  generateDailyReportPDF(report: any, entries: any[], projectName: string) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 109, 119); // Industrial Teal
    doc.text('OBRASERVICE - REPORTE DIARIO', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(18, 18, 18);
    doc.text(`Proyecto: ${projectName}`, 20, 45);
    doc.text(`Fecha: ${report.date}`, 20, 52);
    doc.text(`Estado: ${report.status}`, 20, 59);
    
    // Table Header
    doc.setFillColor(245, 245, 247);
    doc.rect(20, 70, 170, 10, 'F');
    doc.setFontSize(10);
    doc.text('OPERARIO', 25, 76.5);
    doc.text('H. NORMAL', 100, 76.5);
    doc.text('H. EXTRA', 140, 76.5);
    
    // Table Body
    let y = 87;
    entries.forEach((entry) => {
      doc.text(entry.workerName || 'N/A', 25, y);
      doc.text(entry.hoursNormal.toString(), 100, y);
      doc.text(entry.hoursExtra.toString(), 140, y);
      y += 8;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Este documento tiene validez legal conforme a normativa eIDAS tras firma digital.', 20, 280);
    
    doc.save(`Reporte_Diario_${projectName}_${report.date}.pdf`);
  }
};
