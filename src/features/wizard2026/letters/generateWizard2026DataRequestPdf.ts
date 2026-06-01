import jsPDF from 'jspdf';
import { Wizard2026LetterContext } from './wizard2026LetterTypes';

const M = 20;           // Margine
const PW = 170;         // Larghezza utile pagina (210 - 2*20)
const C = {
  primary: [204, 67, 49] as [number, number, number],      // FP CGIL Red (#cc4331)
  text: [31, 41, 55] as [number, number, number],         // Gray-800
  textLight: [107, 114, 128] as [number, number, number],  // Gray-500
  bgWarning: [254, 243, 199] as [number, number, number],  // Amber-100 (COSFEL warning background)
  borderWarning: [217, 119, 6] as [number, number, number], // Amber-600
  textWarning: [180, 83, 9] as [number, number, number],   // Amber-800
};

const SECTION_TITLES: Record<number, string> = {
  1: 'A. Dati generali dell’Ente',
  2: 'B. Limite art. 23, comma 2, D.Lgs. 75/2017',
  3: 'C. Limite massimo D.L. 25/2025',
  4: 'D. Incrementi CCNL 2026 (Art. 58)',
  5: 'E. Conglobamento comparto art. 60',
  6: 'F. Fondo lavoro straordinario',
  7: 'G. Incremento PNRR (Art. 8, comma 3, D.L. 13/2023)',
};

export const generateWizard2026DataRequestPdf = async (context: Wizard2026LetterContext): Promise<void> => {
  const doc = new jsPDF();
  const {
    ente,
    annoRiferimento,
    dataGenerazione,
    destinatario,
    firmatario,
    organizzazione,
    termineRisposta,
    note,
    mode,
    sections
  } = context;

  let y = M;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 270) {
      doc.addPage();
      y = M + 5; // Margine superiore su pagine successive (lascia spazio per running header)
      return true;
    }
    return false;
  };

  // 1. Intestazione Mittente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.primary);
  doc.text(organizzazione.toUpperCase(), M, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textLight);
  doc.text('Comparto Funzioni Locali — Rappresentanza Sindacale Unitaria / Delegati Sindacali', M, y);
  y += 4;

  // Riga divisoria intestazione
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.4);
  doc.line(M, y, M + PW, y);
  y += 12;

  // 2. Destinatario (allineato a destra)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.text);
  const destX = 110;
  doc.text('Spett.le', destX, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  const destLines = doc.splitTextToSize(destinatario, 80);
  doc.text(destLines, destX, y);
  y += (destLines.length * 4.5) + 2;

  doc.setFont('helvetica', 'normal');
  const enteLines = doc.splitTextToSize(`Amministrazione di ${ente.denominazione}`, 80);
  doc.text(enteLines, destX, y);
  y += (enteLines.length * 4.5) + 2;

  doc.setFont('helvetica', 'italic');
  doc.text('e componenti della Delegazione Trattante', destX, y);
  y += 15;

  // 3. Luogo e Data
  checkPageBreak(10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.text);
  doc.text(`Data: ${dataGenerazione}`, M, y);
  y += 8;

  // 4. Oggetto
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.text);
  const objText = `OGGETTO: Richiesta dati e informazioni per la costituzione del Fondo risorse decentrate anno ${annoRiferimento}`;
  const objLines = doc.splitTextToSize(objText, PW);
  checkPageBreak(objLines.length * 5 + 5);
  doc.text(objLines, M, y);
  y += (objLines.length * 5) + 8;

  // 5. Testo Introduttivo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.text);
  const introText = `In vista dell'avvio della sessione negoziale decentrata per l'anno ${annoRiferimento}, ai sensi del CCNL del comparto Funzioni Locali e in conformità alle regole vigenti per la corretta determinazione dei limiti di spesa del trattamento accessorio, la scrivente organizzazione sindacale richiede formalmente la trasmissione delle informazioni e dei dati contabili sotto indicati.\n\nLa presente istruttoria è finalizzata ad assicurare il corretto e trasparente calcolo delle risorse stabili e variabili, con particolare riferimento ai requisiti normativi di sostenibilità e ai controlli previsti per la quantificazione delle quote applicabili.`;
  const introLines = doc.splitTextToSize(introText, PW);
  checkPageBreak(introLines.length * 4.5 + 5);
  doc.text(introLines, M, y);
  y += (introLines.length * 4.5) + 8;

  // Alerter COSFEL se applicabile
  if (ente.isDissesto || ente.isStrutturalmenteDeficitario || ente.isPianoRiequilibrio) {
    const critici = [
      ente.isDissesto ? 'Dissesto Finanziario' : '',
      ente.isStrutturalmenteDeficitario ? 'Deficitarietà Strutturale' : '',
      ente.isPianoRiequilibrio ? 'Piano di Riequilibrio Pluriennale' : ''
    ].filter(Boolean).join(', ');

    const warningText = `PRESIDI E AUTORIZZAZIONI COSFEL\nSi segnala che l'Ente dichiara una condizione di criticità finanziaria (${critici}). Si rende pertanto necessario verificare la sussistenza delle prescritte autorizzazioni e dei pareri favorevoli della Commissione per la stabilità finanziaria degli enti locali (COSFEL) in ordine alla spesa di personale e alla costituzione dei fondi per il salario accessorio.`;
    const warningLines = doc.splitTextToSize(warningText, PW - 10);
    const boxHeight = warningLines.length * 4.5 + 8;
    
    checkPageBreak(boxHeight + 5);
    
    // Disegna box warning
    doc.setFillColor(...C.bgWarning);
    doc.rect(M, y, PW, boxHeight, 'F');
    doc.setFillColor(...C.borderWarning);
    doc.rect(M, y, 2.5, boxHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textWarning);
    doc.text(warningLines, M + 6, y + 5.5);
    
    y += boxHeight + 8;
  }

  if (mode === 'MISSING_ONLY') {
    checkPageBreak(12);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.primary);
    doc.text('Nota: La presente richiesta è limitata esclusivamente alle informazioni mancanti ed alle voci da verificare.', M, y);
    y += 8;
  }

  // 6. Sezioni dei dati
  sections.forEach(section => {
    if (section.fields.length === 0) return;

    checkPageBreak(18);
    
    // Titolo sezione
    const title = SECTION_TITLES[section.stepId] || section.stepTitle;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...C.primary);
    doc.text(title, M, y);
    y += 6.5;

    section.fields.forEach(f => {
      const { label, percheServe } = f.catalogItem;
      const status = f.status;
      const valStr = f.valueString;

      let prefix = '';
      let suffix = '';
      let dotColor: [number, number, number] = [0, 0, 0];

      if (status === 'MANCANTE') {
        prefix = '[DA TRASMETTERE] ';
        dotColor = [220, 38, 38]; // Red
      } else if (status === 'DA_VERIFICARE') {
        prefix = '[DA VERIFICARE] ';
        suffix = ` (Valore attuale a sistema: ${valStr})`;
        dotColor = [217, 119, 6]; // Orange/Yellow
      } else if (status === 'PRESENTE') {
        prefix = '[PRESENTE] ';
        suffix = ` (Valore a sistema: ${valStr})`;
        dotColor = [22, 163, 74]; // Green
      }

      const textToPrint = `${prefix}${label} — ${percheServe}${suffix}`;
      const fieldLines = doc.splitTextToSize(textToPrint, PW - 8);

      checkPageBreak(fieldLines.length * 4.5 + 3);

      // Disegna il punto elenco colorato
      doc.setFillColor(...dotColor);
      doc.circle(M + 3, y - 1.2, 1.2, 'F');

      // Stampa il testo
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.text);
      doc.text(fieldLines, M + 7, y);
      
      y += (fieldLines.length * 4.5) + 2.5;
    });

    y += 3;
  });

  // Note libere
  if (note && note.trim() !== '') {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...C.primary);
    doc.text('Note Aggiuntive del Richiedente', M, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    const noteLines = doc.splitTextToSize(note, PW);
    doc.text(noteLines, M, y);
    y += (noteLines.length * 4.5) + 8;
  }

  // 6b. Appendice contabile informativa (solo per MISSING_ONLY)
  if (mode === 'MISSING_ONLY') {
    const nonApplicabili = context.allFields.filter(f => f.status === 'NON_APPLICABILE');
    const presenti = context.allFields.filter(f => f.status === 'PRESENTE');

    if (presenti.length > 0 || nonApplicabili.length > 0) {
      checkPageBreak(25);
      y += 4;
      doc.setDrawColor(209, 213, 219); // Gray-300
      doc.setLineWidth(0.4);
      doc.line(M, y, M + PW, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...C.primary);
      doc.text('Appendice contabile informativa', M, y);
      y += 6.5;

      if (presenti.length > 0) {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...C.text);
        doc.text('Dati già presenti ed inseriti a sistema (non richiesti):', M, y);
        y += 5.5;

        presenti.forEach(f => {
          const textToPrint = `${f.catalogItem.label} (Valore registrato: ${f.valueString})`;
          const fieldLines = doc.splitTextToSize(textToPrint, PW - 8);
          checkPageBreak(fieldLines.length * 4.5 + 2);
          
          doc.setFillColor(22, 163, 74); // Green
          doc.circle(M + 3, y - 1.2, 1.2, 'F');

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...C.text);
          doc.text(fieldLines, M + 7, y);
          y += (fieldLines.length * 4.5) + 2.5;
        });
        y += 3;
      }

      if (nonApplicabili.length > 0) {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...C.text);
        doc.text("Dati non applicabili per le caratteristiche dell'Ente:", M, y);
        y += 5.5;

        nonApplicabili.forEach(f => {
          const textToPrint = `${f.catalogItem.label} (Dato non applicabile)`;
          const fieldLines = doc.splitTextToSize(textToPrint, PW - 8);
          checkPageBreak(fieldLines.length * 4.5 + 2);

          doc.setFillColor(156, 163, 175); // Gray
          doc.circle(M + 3, y - 1.2, 1.2, 'F');

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...C.text);
          doc.text(fieldLines, M + 7, y);
          y += (fieldLines.length * 4.5) + 2.5;
        });
      }
    }
  }

  // 7. Chiusura
  checkPageBreak(25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.text);
  const closingText = `Si richiede la trasmissione dei dati sopra richiamati entro il termine di ${termineRisposta} dal ricevimento della presente, in un formato elettronico elaborabile, al fine di non ritardare la prosecuzione del tavolo negoziale.\n\nCerti di un tempestivo riscontro e della consueta collaborazione, si porgono distinti saluti.`;
  const closingLines = doc.splitTextToSize(closingText, PW);
  checkPageBreak(closingLines.length * 4.5 + 25);
  doc.text(closingLines, M, y);
  y += (closingLines.length * 4.5) + 12;

  // 8. Firma
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(firmatario, M, y);
  y += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textLight);
  doc.text(`Rappresentanza Sindacale / Segreteria Territoriale ${organizzazione}`, M, y);

  // 9. Post-processing: pié di pagina e intestazione dinamici per tutte le pagine
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Piè di pagina
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // Gray-400
    doc.text(`Pagina ${i} di ${totalPages}`, M, 285);
    doc.text(organizzazione, 210 - M - doc.getTextWidth(organizzazione), 285);
    
    // Running header su pagine successive (dalla 2 in poi)
    if (i > 1) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text(`Richiesta Dati Costituzione Fondo ${annoRiferimento} — ${ente.denominazione}`, M, 12);
      
      doc.setDrawColor(229, 231, 235); // Gray-200
      doc.setLineWidth(0.3);
      doc.line(M, 14, 210 - M, 14);
    }
  }

  // Salva il PDF client-side
  const filename = `Richiesta_Dati_Fondo_${ente.denominazione.replace(/\s+/g, '_')}_${annoRiferimento}.pdf`;
  doc.save(filename);
};
