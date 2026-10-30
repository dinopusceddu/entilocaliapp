import type { DocumentOutputOptions } from '../../domain/documentKindReadiness';
import jsPDF from 'jspdf';
import { DocumentViewModel } from '../../presenters/documentPresenter';

const M = 14;      // Margine
const PW = 182;    // Larghezza utile pagina (210 - 2*14)

/**
 * Genera il PDF formale della Determina a partire dal DocumentViewModel.
 */
export const generateDeterminaPDF = (vm: DocumentViewModel, options?: DocumentOutputOptions): void => {
    if (options?.mode === 'DEFINITIVE_EXPORT' && vm.determina?.exportReadiness !== 'DOCUMENT_FINAL_READY') {
        throw new Error('Generazione Determina PDF definitiva bloccata: fondo in istruttoria o non ancora determinato.');
    }
    const d = vm.determina;
    if (!d) {
        alert('Dati della determina non disponibili.');
        return;
    }

    const doc = new jsPDF();
    let y = 20;

    const isDraftOutput = options?.mode === 'DRAFT_PREVIEW' || vm.isDraft || d.exportReadiness !== 'DOCUMENT_FINAL_READY';

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

    if (isDraftOutput) {
        doc.setFontSize(10);
        doc.setTextColor(220, 38, 38);
        doc.text('[SCHEMA DI ATTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]', 105, y, { align: 'center' });
        y += 8;
        if (options?.draftReason) {
            const lines = doc.splitTextToSize(`Motivo: ${options.draftReason}`, PW);
            doc.text(lines, M, y);
            y += lines.length * 5 + 4;
        }
        doc.setTextColor(27, 14, 14);
    }

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

    const vistiParagraphs = [
        `- L'art. 79 del CCNL 16/11/2022 del comparto Funzioni Locali e l'art. 58 del CCNL 23/02/2026, che disciplina la costituzione del fondo per le risorse decentrate;`,
        `- ${d.gcAttestationText}`,
        `- L'art. 23, comma 2, del D. Lgs. n. 75/2017 relativo al limite complessivo delle risorse destinate al trattamento accessorio;`,
        `- L'art. 33, comma 2, del D. L. 34/2019 in merito all'adeguamento del limite per garantire l'invarianza del valore medio pro-capite riferito al 2018;`,
        `- L’art. 14, comma 1-bis, del D. L. n. 25/2025 per l'incremento delle risorse stabili.`
    ];
    printSection('VISTI:', vistiParagraphs);

    const consideratoParagraphs: string[] = [];
    if (d.hasArt60) {
        consideratoParagraphs.push(
            `- Per l'anno ${d.annoRiferimento} deve essere applicato l'art. 60 del CCNL 23/02/2026, che prevede il conglobamento di parte dell'indennità di comparto nello stipendio tabellare con conseguente riduzione stabile del fondo;`,
            `- Tale riduzione non amplia gli spazi di alimentazione del fondo ai fini del rispetto dei limiti di spesa ex D.Lgs. 75/2017 e D.L. 25/2025, continuando ad essere computata figurativamente;`
        );
    }
    consideratoParagraphs.push(
        `- È necessario procedere alla quantificazione complessiva comprensiva delle risorse per l'Elevata Qualificazione ai sensi dell'art. 16 del CCNL 23/02/2026.`
    );
    printSection('CONSIDERATO CHE:', consideratoParagraphs);

    const presoAttoParagraphs = [
        `- ${d.revisoriAttestationText}`,
        (!vm.compliance.art23c2.isCompliant || (isDraftOutput && options?.draftReason))
            ? `- Delle verifiche ancora da completare prima della costituzione definitiva del fondo.`
            : `- Del rispetto degli obiettivi di finanza pubblica e del vincolo di contenimento della spesa di personale.`
    ];
    printSection('PRESO ATTO:', presoAttoParagraphs);

    checkPage(15);
    doc.setFont('helvetica', 'bold');
    doc.text('DETERMINA', 105, y, { align: 'center' });
    y += 10;
    doc.setFont('helvetica', 'normal');

    // W3-MG-001: Respect requested output mode over domain readiness.
    // DRAFT_PREVIEW always produces draft semantics; DEFINITIVE_EXPORT requires DOCUMENT_FINAL_READY.
    const primaFormula = (!isDraftOutput && d.exportReadiness === 'DOCUMENT_FINAL_READY')
        ? `DI COSTITUIRE, per le motivazioni espresse in premessa, il fondo per le risorse decentrate per il personale non dirigente per l’anno ${d.annoRiferimento} nell'importo complessivo di Euro ${d.totaleFondo}.`
        : d.isDetermined && options?.draftReason
        ? `DI DARE ATTO, in sede istruttoria, del subtotale delle risorse verificate per l'anno ${d.annoRiferimento} in Euro ${d.subtotaleVerificato}. La presente bozza non costituisce il fondo: occorre risolvere le criticità segnalate.`
        : `DI DARE ATTO, in sede istruttoria, della quantificazione del subtotale delle risorse verificate per l'anno ${d.annoRiferimento} in Euro ${d.subtotaleVerificato}, dando atto che la quantificazione definitiva del totale complessivo resta non determinabile in attesa del completamento dell'istruttoria delle componenti sospese.`;

    const determinaParagraphs = [
        primaFormula,
        `DI DARE ATTO che il fondo è così alimentato (Rif. Prospetto A allegato):`,
        d.hasArt60
            ? `- Parte Stabile: Euro ${d.importoStabileNetto}, al lordo della quota di Euro ${d.importoStabileLordo} e al netto della riduzione di Euro ${d.riduzioneConglobamento} per conglobamento indennità di comparto ex art. 60 CCNL 23/02/2026;`
            : `- Parte Stabile: Euro ${d.importoStabileLordo};`,
        `- Parte Variabile: Euro ${d.importoVariabileTotale}, comprensiva delle risorse ex art. 79, comma 2, lett. b) e c) del CCNL 16/11/2022;`,
        `- Incrementi di legge: Euro ${d.incrementoDl25} ai sensi dell'art. 14, comma 1-bis, D.L. 25/2025.`,
        (!vm.compliance.art23c2.isCompliant || (isDraftOutput && options?.draftReason))
            ? `DI RICHIAMARE, per il completamento delle verifiche, i seguenti limiti e decurtazioni:`
            : `DI PRECISARE che la costituzione rispetta i seguenti limiti e decurtazioni:`,
        `Verifica Art. 23: ${vm.compliance.art23c2.esitoLabel}. ${vm.compliance.art23c2.guidance ?? ''}`,
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

    const filename = isDraftOutput
        ? `Determina_BOZZA_${d.annoRiferimento}.pdf`
        : `Determina_Costituzione_Fondo_${d.annoRiferimento}.pdf`;
    doc.save(filename);
};
