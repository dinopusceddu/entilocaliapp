import jsPDF from 'jspdf';
import { DocumentViewModel } from '../../presenters/documentPresenter';

const M = 14;      // Margine
const PW = 182;    // Larghezza utile pagina (210 - 2*14)

/**
 * Genera il PDF formale della Determina a partire dal DocumentViewModel.
 */
export const generateDeterminaPDF = (vm: DocumentViewModel): void => {
    const d = vm.determina;
    if (!d) {
        alert('Dati della determina non disponibili.');
        return;
    }

    const doc = new jsPDF();
    let y = 20;

    const checkPage = (need: number): void => {
        if (y + need > 280) {
            doc.addPage();
            y = M + 10;
        }
    };

    // Intestazione Ente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(27, 14, 14);
    doc.text(vm.ente.denominazione.toUpperCase(), 105, y, { align: 'center' });
    y += 12;

    // Titolo Atto
    doc.setFontSize(12);
    doc.text(`DETERMINAZIONE N. ${d.numeroDetermina} DEL ${d.dataDetermina}`, 105, y, { align: 'center' });
    y += 15;

    // Oggetto
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('OGGETTO:', M, y);
    doc.setFont('helvetica', 'normal');
    const oggettoText = `Costituzione del fondo per le risorse decentrate da destinare al personale non dirigente per l’anno ${d.annoRiferimento}.`;
    const oggettoLines = doc.splitTextToSize(oggettoText, PW - 20);
    doc.text(oggettoLines, M + 20, y);
    y += (oggettoLines.length * 5) + 10;

    checkPage(10);
    doc.setFont('helvetica', 'bold');
    doc.text('IL DIRIGENTE / IL RESPONSABILE', M, y);
    y += 10;

    // Sezioni testo
    const printSection = (title: string, paragraphs: string[]) => {
        checkPage(10);
        doc.setFont('helvetica', 'bold');
        doc.text(title, M, y);
        y += 6;
        doc.setFont('helvetica', 'normal');

        paragraphs.forEach(p => {
            const lines = doc.splitTextToSize(p, PW);
            checkPage(lines.length * 5 + 4);
            doc.text(lines, M, y);
            y += (lines.length * 5) + 3;
        });
        y += 4;
    };

    printSection('VISTI:', [
        `- L'art. 79 del CCNL 16/11/2022 del comparto Funzioni Locali e l'art. 58 del CCNL 23/02/2026, che disciplina la costituzione del fondo per le risorse decentrate;`,
        `- La deliberazione della G.C. n. ${d.numDeliberaGC} del ${d.dataDeliberaGC} relativa alla destinazione delle risorse variabili;`,
        `- L'art. 23, comma 2, del D. Lgs. n. 75/2017 relativo al limite complessivo delle risorse destinate al trattamento accessorio;`,
        `- L'art. 33, comma 2, del D. L. 34/2019 in merito all'adeguamento del limite per garantire l'invarianza del valore medio pro-capite riferito al 2018;`,
        `- L’art. 14, comma 1-bis, del D. L. n. 25/2025 per l'incremento delle risorse stabili.`
    ]);

    printSection('CONSIDERATO CHE:', [
        `- Per l'anno 2026 deve essere applicato l'art. 60 del CCNL 23/02/2026, che prevede il conglobamento di parte dell'indennità di comparto nello stipendio tabellare con conseguente riduzione stabile del fondo;`,
        `- Tale riduzione non amplia gli spazi di alimentazione del fondo ai fini del rispetto dei limiti di spesa ex D.Lgs. 75/2017 e D.L. 25/2025, continuando ad essere computata figurativamente;`,
        `- È necessario procedere alla quantificazione complessiva comprensiva delle risorse per l'Elevata Qualificazione ai sensi dell'art. 16 del CCNL 23/02/2026.`
    ]);

    printSection('PRESO ATTO:', [
        `- Del parere favorevole espresso dal Collegio dei Revisori dei Conti con verbale n. ${d.numVerbaleRevisori} del ${d.dataVerbaleRevisori};`,
        `- Del rispetto degli obiettivi di finanza pubblica e del vincolo di contenimento della spesa di personale.`
    ]);

    checkPage(15);
    doc.setFont('helvetica', 'bold');
    doc.text('DETERMINA', 105, y, { align: 'center' });
    y += 10;
    doc.setFont('helvetica', 'normal');

    const determinaParagraphs = [
        `DI COSTITUIRE, per le motivazioni espresse in premessa, il fondo per le risorse decentrate per il personale non dirigente per l’anno ${d.annoRiferimento} nell'importo complessivo di Euro ${d.totaleFondo}.`,
        `DI DARE ATTO che il fondo è così alimentato (Rif. Prospetto A allegato):`,
        `- Parte Stabile: Euro ${d.importoStabileLordo}, al netto della riduzione di Euro ${d.riduzioneConglobamento} per conglobamento indennità di comparto ex art. 60 CCNL 23/02/2026;`,
        `- Parte Variabile: Euro ${d.importoVariabileTotale}, comprensiva delle risorse ex art. 79, comma 2, lett. b) e c) del CCNL 16/11/2022;`,
        `- Incrementi di legge: Euro ${d.incrementoDl25} ai sensi dell'art. 14, comma 1-bis, D.L. 25/2025.`,
        `DI PRECISARE che la costituzione rispetta i seguenti limiti e decurtazioni:`,
        `- Limite ex art. 23, comma 2, D.Lgs. 75/2017 (anno 2016 o 2015 se applicabile);`,
        `- Decurtazione permanente ex art. 1, comma 456, L. 147/2013: Euro ${d.decurtazioneL147}.`,
        `DI DESTINARE una quota di Euro ${d.importoEq} agli incarichi di Elevata Qualificazione, di cui almeno il 15% riservata all'indennità di risultato.`,
        `DI DARE ATTO che le risorse saranno utilizzate secondo i criteri definiti in sede di contrattazione integrativa ai sensi dell'art. 7, comma 4, lett. a) del CCNL 23/02/2026.`,
        `DI TRASMETTERE il presente provvedimento alle RSU e alla delegazione trattante di parte datoriale per opportuna conoscenza.`
    ];

    determinaParagraphs.forEach(p => {
        const lines = doc.splitTextToSize(p, PW);
        checkPage(lines.length * 5 + 4);
        doc.text(lines, M, y);
        y += (lines.length * 5) + 4;
    });

    y += 10;
    checkPage(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Il Dirigente / Responsabile', 130, y);
    y += 10;
    doc.setFont('helvetica', 'italic');
    doc.text(d.firmaDigitale, 130, y);

    // Footer numerazione
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(`Pagina ${i} di ${totalPages}`, 210 - M, 290, { align: 'right' });
    }

    doc.save(`Determina_Costituzione_Fondo_${d.annoRiferimento}.pdf`);
};
