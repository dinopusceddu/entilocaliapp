import jsPDF from 'jspdf';
import { LetterRequestDataContext } from '../logic/letters/letterRequestDataTypes';

// ── COSTANTI LAYOUT ──────────────────────────────────────────────────────────
const M = 20;           // Margine
const PW = 170;         // Larghezza utile pagina (210 - 2*20)
const C = {
    primary: [30, 58, 138] as [number, number, number],    // Blue-900
    text: [31, 41, 55] as [number, number, number],       // Gray-800
    textLight: [107, 114, 128] as [number, number, number], // Gray-500
};

/**
 * Genera un PDF professionale per la lettera di richiesta dati.
 */
export const generateRequestDataLetterPdf = async (context: LetterRequestDataContext): Promise<void> => {
    const doc = new jsPDF();
    const { ente, annoRiferimento, dataGenerazione, dataStatus, customOptions } = context;
    
    let y = M;

    // 1. Intestazione Mittente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...C.primary);
    doc.text(customOptions?.organizzazione || 'FP CGIL', M, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.textLight);
    doc.text('Organizzazione Sindacale Comparto Funzioni Locali', M, y);
    
    y = M + 25;

    // 2. Destinatario (allineato a destra)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...C.text);
    const destX = 120;
    doc.text('Spett.le', destX, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(ente.denominazione, destX, y, { maxWidth: 70 });
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Ufficio Personale / Ragioneria', destX, y);
    
    y += 20;

    // 3. Luogo e Data
    doc.text(`Data, ${dataGenerazione}`, M, y);
    y += 15;

    // 4. Oggetto
    doc.setFont('helvetica', 'bold');
    doc.text(`OGGETTO: Richiesta dati necessari alla verifica e costituzione del Fondo risorse decentrate - Anno ${annoRiferimento}`, M, y, { maxWidth: PW });
    const objHeight = doc.getTextDimensions(`OGGETTO: Richiesta dati necessari alla verifica e costituzione del Fondo risorse decentrate - Anno ${annoRiferimento}`, { maxWidth: PW }).h;
    y += objHeight + 10;

    // 5. Testo Introduttivo
    doc.setFont('helvetica', 'normal');
    const intro = `In riferimento alle procedure di costituzione e riparto del Fondo per le risorse decentrate, previste dal CCNL Funzioni Locali vigente e in particolare dalle novità introdotte dal CCNL 23 febbraio 2026, la scrivente ${customOptions?.organizzazione} richiede la trasmissione dei seguenti dati e documenti in formato elaborabile:`;
    const introLines = doc.splitTextToSize(intro, PW);
    doc.text(introLines, M, y);
    y += (introLines.length * 5) + 8;

    // 6. Elenco Dati (Helper per i bullet point)
    const addSection = (title: string, items: { label: string, details: string, isPresent: boolean }[]) => {
        if (y > 250) { doc.addPage(); y = M; }
        doc.setFont('helvetica', 'bold');
        doc.text(title, M, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        
        items.forEach(item => {
            if (y > 270) { doc.addPage(); y = M; }
            const status = item.isPresent ? '[Dato già a sistema]' : '[DA RICHIEDERE]';
            const text = `• ${item.label}: ${status} - ${item.details}`;
            const lines = doc.splitTextToSize(text, PW - 5);
            doc.text(lines, M + 5, y);
            y += (lines.length * 5) + 2;
        });
        y += 4;
    };

    addSection('1. Dati Storici (Art. 23 c.2 D.Lgs. 75/2017)', [
        { label: 'Limite 2016', details: 'Ammontare complessivo risorse certificate 2016.', isPresent: dataStatus.fondo2016 },
        { label: 'Fondo 2018', details: 'Risorse stabili certificate 2018.', isPresent: dataStatus.fondo2018 },
        { label: 'FTE 2018', details: 'Dipendenti equivalenti al 31.12.2018.', isPresent: dataStatus.fte2018 }
    ]);

    addSection('2. Dati Consuntivi 2023 (Limite 48% D.L. 25/2025)', [
        { label: 'Stipendi 2023', details: 'Spesa stipendi tabellari (incl. 13ª).', isPresent: dataStatus.stipendi2023 },
        { label: 'Spesa Totale', details: 'Macroaggregato U.1.01 rendiconto 2023.', isPresent: dataStatus.spesaPersonale2023 },
        { label: 'Entrate Correnti', details: 'Media entrate 2021-2023 (Tit. I, II, III).', isPresent: dataStatus.entrate2021_2023 }
    ]);

    addSection('3. Dati Personale e CCNL 2026', [
        { label: 'Monte Salari 2021', details: 'Base calcolo incrementi Art. 58.', isPresent: dataStatus.monteSalari2021 },
        { label: 'Personale 2026', details: 'Inquadramento al 01.01.2026 per Art. 60.', isPresent: false }
    ]);

    // 7. Chiusura
    y += 10;
    if (y > 260) { doc.addPage(); y = M; }
    const closing = "Si richiede che la suddetta documentazione venga fornita tempestivamente per consentire il corretto avvio della sessione negoziale, come previsto dall'Art. 8 del CCNL 23.02.2026.";
    const closingLines = doc.splitTextToSize(closing, PW);
    doc.text(closingLines, M, y);
    y += (closingLines.length * 5) + 20;

    // 8. Firma
    doc.text('Distinti saluti.', M, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(customOptions?.firmatario || '', M, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(customOptions?.organizzazione || '', M, y);

    // Salva il PDF
    doc.save(`Richiesta_Dati_Fondo_${ente.denominazione.replace(/\s+/g, '_')}_${annoRiferimento}.pdf`);
};
