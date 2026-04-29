import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, User } from '../../domain';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters.ts';

import { createReportViewModel, ReportViewModel } from '../../presenters';

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

// ── HELPER: barra progresso orizzontale ─────────────────────────────────────
function progressBar(doc: jsPDF, x: number, y: number, w: number, h: number,
    value: number, maxValue: number, label: string): void {
    const pct = maxValue > 0 ? Math.min(value / maxValue, 1) : 0;
    const color: [number, number, number] = pct > 1 ? C.red : pct > 0.9 ? C.yellow : C.green;
    doc.setFillColor(230, 220, 221);
    doc.rect(x, y, w, h, 'F');
    doc.setFillColor(...color);
    doc.rect(x, y, w * pct, h, 'F');
    doc.setDrawColor(...C.accent);
    doc.rect(x, y, w, h, 'S');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text(label, x, y - 1.5);
    doc.setTextColor(...color);
    doc.text(`${(pct * 100).toFixed(1)}%`, x + w + 2, y + h - 1);
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
const buildCover = (doc: jsPDF, vm: ReportViewModel, user: User, result: CalculationResult) => {
    const { art23c2 } = result.compliance;

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
    doc.text('RIEPILOGO GENERALE E RISULTANZE', 105, Y, { align: 'center' });
    Y += 15;

    // KPI row 1
    const bw = 58, bh = 22, gap = 4;
    kpiBox(doc, M, Y, bw, bh, 'TOTALE FONDO', formatCurrency(result.totals.totaleFondo), C.primaryDark, C.primaryLight);
    kpiBox(doc, M + bw + gap, Y, bw, bh, 'PARTE STABILE', formatCurrency(result.totals.stabile), C.blue, C.blueLight);
    kpiBox(doc, M + (bw + gap) * 2, Y, bw, bh, 'PARTE VARIABILE', formatCurrency(result.totals.variabile), [80, 120, 80], [220, 240, 220]);
    Y += bh + 10;

    // Art 23 bar
    progressBar(doc, M, Y, PW - 20, 6, art23c2.valoreSoggetto, art23c2.limite, 
        `Risorse soggette al limite art. 23 c.2: ${vm.fondoDipendenti.limiteArt23.valoreSoggetto} / Limite: ${vm.fondoDipendenti.limiteArt23.limite}`);
    Y += 15;

    // Status Compliance
    const isOk = result.compliance.art23c2.isCompliant;
    doc.setFillColor(...(isOk ? C.greenLight : C.redLight));
    doc.roundedRect(M, Y, PW, 12, 2, 2, 'F');
    doc.setTextColor(...(isOk ? C.green : C.red));
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`STATO LIMITE ART. 23 C. 2: ${vm.fondoDipendenti.limiteArt23.esitoLabel}`, 105, Y + 7.5, { align: 'center' });
    Y += 20;

    doc.setFontSize(8);
    doc.setTextColor(...C.textGray);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generato da: ${user.name} (${user.role}) il ${formatDate(new Date())}`, 105, Y, { align: 'center' });
};

// ── DETTAGLIO COSTITUZIONE/UTILIZZO ─────────────────────────────────
const buildDettaglioDipendenti = (doc: jsPDF, vm: ReportViewModel) => {
    doc.addPage();
    Y = M;
    sectionTitle(doc, 'DETTAGLIO FONDO PERSONALE DIPENDENTE');
    
    // Costituzione
    subTitle(doc, 'Quadro A: Costituzione del Fondo (Risorse)');
    vm.fondoDipendenti.costituzione.forEach(sec => {
        autoTable(doc, {
            startY: Y,
            head: [[sec.title, 'Importo (€)', 'Art. 23']],
            body: sec.items.map(i => [i.description, formatNumber(i.amount, 2), i.isRelevantToArt23Limit ? '✓' : '']),
            theme: 'striped',
            headStyles: { fillColor: C.primary, textColor: C.white, fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'right' }, 2: { halign: 'center' } },
            margin: { left: M, right: M }
        });
        Y = (doc as any).lastAutoTable.finalY + 2;
        doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text(`Sub-totale ${sec.title}: ${formatCurrency(sec.total)}`, M + PW, Y + 4, { align: 'right' });
        Y += 8;
    });

    checkPage(doc, 30);
    // Utilizzi
    subTitle(doc, 'Quadro B: Utilizzo del Fondo (Destinazioni)');
    vm.fondoDipendenti.utilizzi.forEach(sec => {
        autoTable(doc, {
            startY: Y,
            head: [[sec.title, 'Importo (€)']],
            body: sec.items.map(i => [i.description, formatNumber(i.amount, 2)]),
            theme: 'striped',
            headStyles: { fillColor: C.blue, textColor: C.white, fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 0: { cellWidth: 152 }, 1: { halign: 'right' } },
            margin: { left: M, right: M }
        });
        Y = (doc as any).lastAutoTable.finalY + 2;
        doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text(`Sub-totale ${sec.title}: ${formatCurrency(sec.total)}`, M + PW, Y + 4, { align: 'right' });
        Y += 8;
    });
};

// ── ESPORTAZIONE PRINCIPALE ──────────────────────────────────────
export const generateFondoPDF = async (
    result: CalculationResult,
    denominazioneEnte: string,
    user: User
): Promise<void> => {
    const vm = createReportViewModel(result, denominazioneEnte);
    const doc = new jsPDF();
    
    buildCover(doc, vm, user, result);
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
    doc.save(`Fondo_${vm.annoRiferimento}_${vm.denominazioneEnte.replace(/\s+/g, '_')}.pdf`);
};
