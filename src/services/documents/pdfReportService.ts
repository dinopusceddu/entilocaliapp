import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, User } from '../../domain';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters.ts';

import { createReportViewModel, ReportViewModel } from '../../presenters';
import type { DocumentOutputOptions } from '../../domain/documentKindReadiness';

// ── COSTANTI LAYOUT ──────────────────────────────────────────────────────────
const M = 14;           // Margine
const PW = 182;         // Larghezza utile pagina (210 - 2*14)

// ── COLORI ───────────────────────────────────────────────────────────────────
const C = {
    primary: [153, 77, 81] as [number, number, number],        // #994d51
    primaryLight: [243, 231, 232] as [number, number, number], // #f3e7e8
    primaryDark: [122, 58, 62] as [number, number, number],    // #7a3a3e
    accent: [209, 192, 193] as [number, number, number],       // #d1c0c1
    white: [255, 255, 255] as [number, number, number],
    text: [27, 14, 14] as [number, number, number],            // #1b0e0e
    textGray: [107, 114, 128] as [number, number, number],
    green: [22, 163, 74] as [number, number, number],          // conformità ok
    yellow: [217, 119, 6] as [number, number, number],         // warning
    red: [220, 38, 38] as [number, number, number],            // non conforme
    greenLight: [220, 252, 231] as [number, number, number],
    yellowLight: [254, 243, 199] as [number, number, number],
    redLight: [254, 226, 226] as [number, number, number],
    blue: [30, 58, 138] as [number, number, number],
    blueLight: [224, 231, 255] as [number, number, number],
};

let Y = 0;

// ── HELPER: nuova pagina se necessario ──────────────────────────────────────
function checkPage(doc: jsPDF, need: number): void {
    if (Y + need > 285) {
        doc.addPage();
        Y = M;
    }
}

// ── HELPER: intestazione sezione ─────────────────────────────────────────────
function sectionTitle(doc: jsPDF, title: string): void {
    checkPage(doc, 12);
    doc.setFillColor(...C.primary);
    doc.rect(M, Y, PW, 8, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, M + 3, Y + 5.5);
    doc.setTextColor(...C.text);
    doc.setFont('helvetica', 'normal');
    Y += 11;
}

// ── HELPER: sottotitolo ──────────────────────────────────────────────────────
function subTitle(doc: jsPDF, title: string): void {
    checkPage(doc, 10);
    doc.setFillColor(...C.primaryLight);
    doc.rect(M, Y, PW, 6.5, 'F');
    doc.setTextColor(...C.primaryDark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, M + 2, Y + 4.5);
    doc.setTextColor(...C.text);
    doc.setFont('helvetica', 'normal');
    Y += 9;
}

// ── HELPER: KPI box ──────────────────────────────────────────────────────────
function kpiBox(doc: jsPDF, x: number, y: number, w: number, h: number,
    label: string, value: string, fg: [number, number, number], bg: [number, number, number]): void {
    doc.setFillColor(...bg);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');
    doc.setDrawColor(...fg);
    doc.roundedRect(x, y, w, h, 2, 2, 'S');
    doc.setTextColor(...fg);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + w / 2, y + 4, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + w / 2, y + h - 3, { align: 'center' });
    doc.setTextColor(...C.text);
    doc.setFont('helvetica', 'normal');
}

// ── HELPER: footer ─────────────────────────────────────────────
const addFooters = (doc: jsPDF, ente: string, anno: number) => {
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...C.textGray);
        doc.text(`${ente} — Fondo Risorse Decentrate ${anno}`, M, 295, { baseline: 'bottom' });
        doc.text(`Pagina ${i} di ${totalPages}`, 210 - M, 295, { align: 'right', baseline: 'bottom' });
    }
};

// ── COPERTINA ─────────────────────────────────────────────────────
type SummaryInput = Pick<ReportViewModel, 'fadCanonical' | 'annoRiferimento' | 'denominazioneEnte' | 'altriFondi'> & Partial<Pick<ReportViewModel, 'art23Verification'>>;
const money = (value: number | null) => value === null ? 'NON DETERMINATO' : formatCurrency(value);
const isStaleResult = (vm: SummaryInput) => vm.art23Verification?.status === 'STALE';
const isEconomicDraft = (vm: SummaryInput) => !vm.fadCanonical.canonicalAvailable
    || vm.fadCanonical.status !== 'VALID' || vm.fadCanonical.authoritativeTotal === null;

const buildCover = (doc: jsPDF, vm: SummaryInput, user: User, options?: DocumentOutputOptions) => {
    const fad = vm.fadCanonical;

    // Intestazione
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(vm.denominazioneEnte, 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fondo per le Risorse Decentrate — Anno ${vm.annoRiferimento}`, 105, 25, { align: 'center' });
    
    Y = 50;
    doc.setTextColor(...C.primaryDark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${options?.mode === 'DRAFT_PREVIEW' || isEconomicDraft(vm) || isStaleResult(vm) ? 'BOZZA - ' : ''}RIEPILOGO GENERALE E RISULTANZE`, 105, Y, { align: 'center' });
    Y += 15;

    doc.setFontSize(9);
    doc.text('FONDO PERSONALE DIPENDENTE (FAD)', M, Y);
    Y += 7;

    // KPI row 1
    const bw = 58, bh = 22, gap = 4;
    kpiBox(doc, M, Y, bw, bh, 'TOTALE FONDO DIPENDENTI', money(fad.authoritativeTotal), C.primaryDark, C.primaryLight);
    kpiBox(doc, M + bw + gap, Y, bw, bh, 'STABILE - SUBTOTALE VERIFICATO', money(fad.verifiedStableTotal), C.blue, C.blueLight);
    kpiBox(doc, M + (bw + gap) * 2, Y, bw, bh, 'VARIABILE - SUBTOTALE VERIFICATO', money(fad.verifiedVariableTotal), [80, 120, 80], [220, 240, 220]);
    Y += bh + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotale verificato FAD: ${money(fad.verifiedTotal)}`, M, Y);
    Y += 10;

    // Economic qualification only; no new administrative readiness policy.
    doc.setFillColor(...(isEconomicDraft(vm) ? C.yellowLight : C.primaryLight));
    doc.roundedRect(M, Y, PW, 12, 2, 2, 'F');
    doc.setTextColor(...C.primaryDark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`STATO ECONOMICO FAD: ${fad.status}${isEconomicDraft(vm) ? ' - BOZZA / NON DETERMINATO' : ''}`, 105, Y + 7.5, { align: 'center' });
    Y += 20;

    if (options?.mode === 'DRAFT_PREVIEW' && options.draftReason) {
        doc.setFont('helvetica', 'normal');
        const lines: string[] = doc.splitTextToSize(`BOZZA: ${options.draftReason}`, PW);
        lines.forEach(line => { checkPage(doc, 5); doc.text(line, M, Y); Y += 5; });
        Y += 5;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Fondi esposti separatamente; nessun totale complessivo ente.', M, Y);
    Y += 10;
    doc.text('Verifica limite Art. 23 c. 2: Non rappresentato in questo prospetto', M, Y);
    Y += 5;
    if (vm.art23Verification) {
        doc.text(`Esito verifica Art. 23: ${vm.art23Verification.label}`, M, Y);
        Y += 5;
        if (vm.art23Verification.guidance) {
            doc.text(vm.art23Verification.guidance, M, Y); Y += 5;
        }
        Y += 5;
    }

    doc.setFontSize(8);
    doc.setTextColor(...C.textGray);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generato da: ${user.name} (${user.role}) il ${formatDate(new Date())}`, 105, Y, { align: 'center' });
};

// ── DETTAGLIO COSTITUZIONE/UTILIZZO ─────────────────────────────────
const buildDettaglioDipendenti = (doc: jsPDF, vm: SummaryInput) => {
    doc.addPage();
    Y = M;
    sectionTitle(doc, 'DETTAGLIO FONDO PERSONALE DIPENDENTE');
    
    // Costituzione
    subTitle(doc, 'Quadro A: Costituzione del Fondo (Risorse)');
    const fad = vm.fadCanonical;
    const sections = [
        { component: 'STABLE', title: 'Risorse Stabili', subtotal: fad.verifiedStableTotal },
        { component: 'VARIABLE', title: 'Risorse Variabili', subtotal: fad.verifiedVariableTotal }
    ] as const;
    sections.forEach(section => {
        autoTable(doc, {
            startY: Y,
            head: [[section.title, 'Importo (€)', 'Art. 23']],
            body: fad.rows.filter(row => row.component === section.component).map(row => [
                row.description + (row.signedAmount === null
                    ? ` [${row.status} - DA ISTRUIRE]${row.reason ? ` ${row.reason}` : ''}${row.amount !== null ? `; importo informativo: ${formatCurrency(row.amount)} (escluso dai subtotali)` : ''}`
                    : ''),
                row.signedAmount === null ? 'NON DETERMINATO' : formatNumber(row.signedAmount, 2),
                row.art23Treatment === 'SUBJECT' ? 'Sì' : row.art23Treatment === 'EXCLUDED' ? 'No' : 'Da verificare'
            ]),
            theme: 'striped',
            headStyles: { fillColor: C.primary, textColor: C.white, fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 42, halign: 'right' }, 2: { cellWidth: 20, halign: 'center' } },
            margin: { left: M, right: M, bottom: 20 }
        });
        Y = (doc as any).lastAutoTable.finalY + 2;
        checkPage(doc, 8);
        doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text(`Subtotale verificato ${section.title}: ${money(section.subtotal)}`, M + PW, Y + 4, { align: 'right' });
        Y += 8;
    });

    checkPage(doc, 20);
    doc.text(`Subtotale verificato FAD: ${money(fad.verifiedTotal)}`, M, Y + 4);
    doc.text(`Totale Fondo Dipendenti: ${money(fad.authoritativeTotal)}`, M, Y + 10);
    Y += 18;
    const notes = [
        ...fad.unresolvedItems.filter(row => row.economicEffect === false).map(row => `${row.description} [${row.status}]${row.reason ? ` ${row.reason}` : ''}`),
        ...fad.missingPrerequisites
    ];
    notes.forEach(note => {
        doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        const lines: string[] = doc.splitTextToSize(note, PW);
        lines.forEach(line => { checkPage(doc, 5); doc.text(line, M, Y + 4); Y += 5; });
    });

    checkPage(doc, 20);
    // Utilizzi
    subTitle(doc, 'Quadro B: Utilizzo del Fondo (Destinazioni)');
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('Non rappresentato in questo prospetto', M, Y + 4);
};

// ── ESPORTAZIONE PRINCIPALE ──────────────────────────────────────
export const buildFundSummaryPdf = (
    vm: SummaryInput,
    user: User,
    options?: DocumentOutputOptions
) => {
    if (isStaleResult(vm) && options?.mode === 'DEFINITIVE_EXPORT') throw new Error('Ricalcolare la bozza prima di esportare il PDF definitivo.');
    const doc = new jsPDF();
    
    buildCover(doc, vm, user, options);
    buildDettaglioDipendenti(doc, vm);
    
    // Altri fondi (EQ, Segretario, Dirigenza)
    doc.addPage();
    Y = M;
    sectionTitle(doc, 'QUADRO ALTRI FONDI (EQ, SEGRETARIO, DIRIGENZA)');
    autoTable(doc, {
        startY: Y,
        head: [['Fondo', 'Totale Disponibile (€)']],
        body: [
            [vm.altriFondi.eq.label || 'Elevate Qualificazioni', vm.altriFondi.eq.totale],
            [vm.altriFondi.segretario.label || 'Segretario Comunale', vm.altriFondi.segretario.totale],
            vm.altriFondi.dirigenza.hasDirigenza 
                ? [vm.altriFondi.dirigenza.label, vm.altriFondi.dirigenza.totale]
                : ['Dirigenza', 'N/A']
        ] as any,
        theme: 'grid',
        headStyles: { fillColor: C.primaryDark, textColor: C.white },
        margin: { left: M, right: M }
    });

    addFooters(doc, vm.denominazioneEnte, vm.annoRiferimento);
    const isDraft = options?.mode === 'DRAFT_PREVIEW' || isEconomicDraft(vm) || isStaleResult(vm);
    const filename = `Fondo_${isDraft ? 'BOZZA_' : ''}${vm.annoRiferimento}_${vm.denominazioneEnte.replace(/\s+/g, '_')}.pdf`;
    return { doc, filename, isDraft };
};

export const generateFondoPDF = async (
    result: CalculationResult,
    denominazioneEnte: string,
    user: User,
    options?: DocumentOutputOptions
): Promise<void> => {
    const { doc, filename } = buildFundSummaryPdf(createReportViewModel(result, denominazioneEnte), user, options);
    doc.save(filename);
};
