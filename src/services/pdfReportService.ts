// services/pdfReportService.ts
// Generazione completa del PDF "Riepilogo Generale Calcoli e Risultanze"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CalculatedFund, FundData, User, ComplianceCheck } from '../types.ts';
import { formatCurrency, formatNumber, formatBoolean, formatDate } from '../utils/formatters.ts';
import { ALL_TIPOLOGIE_ENTE } from '../constants.ts';

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

// ── STATO GLOBALE Y ──────────────────────────────────────────────────────────
let Y = 0;

// ── HELPER: nuova pagina se necessario ──────────────────────────────────────
function checkPage(doc: jsPDF, need: number): void {
    if (Y + need > 285) {
        doc.addPage();
        Y = M;
    }
}

// ── HELPER: footer numerazione pagine ────────────────────────────────────────
function addFooters(doc: jsPDF, ente: string, anno: number): void {
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...C.textGray);
        doc.text(`${ente} — Fondo Risorse Decentrate ${anno}`, M, 295, { baseline: 'bottom' });
        doc.text(`Pagina ${i} di ${totalPages}`, 210 - M, 295, { align: 'right', baseline: 'bottom' });
        doc.setTextColor(...C.text);
        doc.setFont('helvetica', 'normal');
    }
}

// ── HELPER: intestazione sezione ─────────────────────────────────────────────
function sectionTitle(doc: jsPDF, title: string, pageNum?: string): void {
    checkPage(doc, 12);
    doc.setFillColor(...C.primary);
    doc.rect(M, Y, PW, 8, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, M + 3, Y + 5.5);
    if (pageNum) {
        doc.setFontSize(8);
        doc.text(pageNum, M + PW - 3, Y + 5.5, { align: 'right' });
    }
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
    // Sfondo
    doc.setFillColor(230, 220, 221);
    doc.rect(x, y, w, h, 'F');
    // Barra riempita
    doc.setFillColor(...color);
    doc.rect(x, y, w * pct, h, 'F');
    // Bordo
    doc.setDrawColor(...C.accent);
    doc.rect(x, y, w, h, 'S');
    // Etichetta
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text(label, x, y - 1.5);
    // Percentuale
    doc.setTextColor(...color);
    doc.text(`${(pct * 100).toFixed(1)}%`, x + w + 2, y + h - 1);
    doc.setTextColor(...C.text);
    doc.setFont('helvetica', 'normal');
}

// ── HELPER: tabella semplice con colori alternati ────────────────────────────
function simpleTable(doc: jsPDF, headers: string[], rows: string[][], opts?: {
    colWidths?: number[]; headBg?: [number, number, number]; alternateRow?: boolean;
}): void {
    const o = opts || {};
    autoTable(doc, {
        startY: Y,
        head: [headers],
        body: rows,
        theme: 'plain',
        headStyles: {
            fillColor: o.headBg || C.primary,
            textColor: C.white,
            fontStyle: 'bold',
            fontSize: 8,
            cellPadding: 2,
        },
        bodyStyles: { fontSize: 8, cellPadding: 1.8, textColor: C.text },
        alternateRowStyles: o.alternateRow !== false ? { fillColor: [253, 249, 249] } : {},
        columnStyles: o.colWidths
            ? Object.fromEntries(o.colWidths.map((w, i) => [i, { cellWidth: w }]))
            : {},
        didDrawPage: (d) => { if (d.cursor) Y = d.cursor.y + 2; },
        margin: { left: M, right: M },
    });
    Y = (doc as any).lastAutoTable.finalY + 4;
}

// ── SEZIONE 1: COPERTINA ─────────────────────────────────────────────────────
function buildCover(doc: jsPDF, cf: CalculatedFund, fd: FundData, user: User,
    checks: ComplianceCheck[]): void {
    const { annualData } = fd;
    const anno = annualData.annoRiferimento;
    const ente = annualData.denominazioneEnte || 'Ente';
    const tipo = ALL_TIPOLOGIE_ENTE.find(t => t.value === annualData.tipologiaEnte)?.label || '';

    // Intestazione ente
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(ente, 105, 14, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (tipo) doc.text(tipo, 105, 21, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Anno di Riferimento: ${anno}`, 105, 28, { align: 'center' });
    doc.setTextColor(...C.text);

    // Titolo report
    Y = 44;
    doc.setFillColor(...C.primaryLight);
    doc.rect(M, Y, PW, 18, 'F');
    doc.setDrawColor(...C.primary);
    doc.rect(M, Y, PW, 18, 'S');
    doc.setTextColor(...C.primaryDark);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('RIEPILOGO GENERALE CALCOLI E RISULTANZE', 105, Y + 8, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Fondo per le Risorse Decentrate — Comparto Funzioni Locali', 105, Y + 15, { align: 'center' });
    doc.setTextColor(...C.text);
    Y += 24;

    // Info generazione
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...C.textGray);
    doc.text(`Generato da: ${user.name} (${user.role})  |  Data: ${formatDate(new Date())}`, 105, Y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.text);
    Y += 8;

    // KPI boxes — riga 1
    const totale = cf.totaleFondoRisorseDecentrate;
    const stabile = cf.totaleComponenteStabile;
    const variabile = cf.totaleComponenteVariabile;
    const bw = 58, bh = 22, gap = 4;
    const bx1 = M, bx2 = M + bw + gap, bx3 = M + (bw + gap) * 2;

    kpiBox(doc, bx1, Y, bw, bh, 'TOTALE FONDO', formatCurrency(totale), C.primaryDark, C.primaryLight);
    kpiBox(doc, bx2, Y, bw, bh, 'PARTE STABILE', formatCurrency(stabile), C.blue, C.blueLight);
    kpiBox(doc, bx3, Y, bw, bh, 'PARTE VARIABILE', formatCurrency(variabile), [80, 120, 80], [220, 240, 220]);
    Y += bh + 6;

    // KPI boxes — riga 2 (fondi specifici)
    const { dettaglioFondi: df } = cf;
    const bw2 = 42, gap2 = 3;
    const bx = [M, M + bw2 + gap2, M + (bw2 + gap2) * 2, M + (bw2 + gap2) * 3];
    kpiBox(doc, bx[0], Y, bw2, 18, 'Fondo Dipendente', formatCurrency(df.dipendente.totale), C.primaryDark, [253, 244, 244]);
    kpiBox(doc, bx[1], Y, bw2, 18, 'Fondo EQ', formatCurrency(df.eq.totale), C.blue, C.blueLight);
    kpiBox(doc, bx[2], Y, bw2, 18, 'Segretario Com.', formatCurrency(df.segretario.totale), [100, 80, 20], [255, 250, 220]);
    kpiBox(doc, bx[3], Y, bw2, 18, annualData.hasDirigenza ? 'Fondo Dirigenza' : 'Dirigenza (n/a)',
        annualData.hasDirigenza ? formatCurrency(df.dirigenza.totale) : '—', C.textGray, [240, 240, 240]);
    Y += 24;

    // Barra visuale Fondo vs Limite
    const limite = cf.limiteArt23C2Modificato || cf.fondoBase2016;
    const soggette = cf.totaleRisorseSoggetteAlLimiteDaFondiSpecifici;
    progressBar(doc, M, Y, PW - 20, 6, soggette, limite, `Risorse soggette al limite art. 23 c.2: ${formatCurrency(soggette)} / Limite: ${formatCurrency(limite)}`);
    Y += 14;

    // Status conformità
    const nOk = checks.filter(c => c.isCompliant).length;
    const nWarn = checks.filter(c => !c.isCompliant && c.gravita === 'warning').length;
    const nErr = checks.filter(c => !c.isCompliant && c.gravita === 'error').length;
    const statusBg: [number, number, number] = nErr > 0 ? C.redLight : nWarn > 0 ? C.yellowLight : C.greenLight;
    const statusFg: [number, number, number] = nErr > 0 ? C.red : nWarn > 0 ? C.yellow : C.green;
    const statusText = nErr > 0 ? `⚠ ${nErr} CONTROLLO/I NON CONFORME/I` : nWarn > 0 ? `⚠ ${nWarn} ATTENZIONE` : '✓ TUTTI I CONTROLLI CONFORMI';

    doc.setFillColor(...statusBg);
    doc.roundedRect(M, Y, PW, 9, 2, 2, 'F');
    doc.setTextColor(...statusFg);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`STATO CONFORMITÀ: ${statusText}`, M + PW / 2, Y + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.text);
    Y += 13;

    // Riepilogo per fondo
    doc.setFontSize(8);
    doc.setTextColor(...C.textGray);
    doc.text(`Conformi: ${nOk}   In Attenzione: ${nWarn}   Non Conformi: ${nErr}   Totale controlli: ${checks.length}`, 105, Y, { align: 'center' });
    doc.setTextColor(...C.text);
}

// ── SEZIONE 2: DATI ENTE E INPUT ─────────────────────────────────────────────
function buildDatiEnte(doc: jsPDF, cf: CalculatedFund, fd: FundData): void {
    doc.addPage();
    Y = M;
    const { annualData, historicalData } = fd;
    const anno = annualData.annoRiferimento;

    sectionTitle(doc, `2. DATI DELL'ENTE E PARAMETRI DI INPUT — Anno ${anno}`);

    // 2.1 Info Generali
    subTitle(doc, '2.1 — Informazioni Generali Ente');
    const tipo = ALL_TIPOLOGIE_ENTE.find(t => t.value === annualData.tipologiaEnte)?.label || annualData.tipologiaEnte || '—';
    simpleTable(doc, ['Campo', 'Valore'], [
        ['Denominazione Ente', annualData.denominazioneEnte || '—'],
        ['Tipologia Ente', tipo],
        ['Numero Abitanti (31.12 anno prec.)', formatNumber(annualData.numeroAbitanti, 0)],
        ['Ente in Dissesto Finanziario?', formatBoolean(annualData.isEnteDissestato)],
        ['Ente Strutturalmente Deficitario?', formatBoolean(annualData.isEnteStrutturalmenteDeficitario)],
        ['Ente in Riequilibrio Finanziario?', formatBoolean(annualData.isEnteRiequilibrioFinanziario)],
        ['Ente con Personale Dirigente?', formatBoolean(annualData.hasDirigenza)],
        ['Rispetto equilibrio bilancio precedente?', formatBoolean(annualData.rispettoEquilibrioBilancioPrecedente)],
        ['Rispetto debito commerciale precedente?', formatBoolean(annualData.rispettoDebitoCommercialePrecedente)],
        ['Condizioni virtuosità finanziaria soddisfatte?', formatBoolean(annualData.condizioniVirtuositaFinanziariaSoddisfatte)],
        ['Approvazione rendiconto precedente?', formatBoolean(annualData.approvazioneRendicontoPrecedente)],
        ['Incidenza salario accessorio (ultimo rendiconto)', formatNumber(annualData.incidenzaSalarioAccessorioUltimoRendiconto, 2, '—') + ' %'],
    ], { colWidths: [90, 88] });

    // 2.2 Dati Storici
    subTitle(doc, '2.2 — Dati Storici (Basi di Calcolo)');
    const base2016 = (historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
        (historicalData.fondoElevateQualificazioni2016 || 0) +
        (historicalData.fondoDirigenza2016 || 0) +
        (historicalData.risorseSegretarioComunale2016 || 0);
    simpleTable(doc, ['Campo', 'Importo (€)'], [
        ['Fondo Personale Non Dir/EQ 2016', formatCurrency(historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016)],
        ['Fondo Elevate Qualificazioni 2016', formatCurrency(historicalData.fondoElevateQualificazioni2016)],
        ['Fondo Dirigenza 2016', formatCurrency(historicalData.fondoDirigenza2016)],
        ['Risorse Segretario Comunale 2016', formatCurrency(historicalData.risorseSegretarioComunale2016)],
        ['LIMITE COMPLESSIVO ART. 23 C.2 — ANNO 2016', formatCurrency(base2016)],
        ['', ''],
        ['Personale in servizio al 31.12.2018', formatNumber(historicalData.personaleServizio2018, 0)],
        ['Fondo Personale Non Dir/EQ 2018 (base art. 23)', formatCurrency(historicalData.fondoPersonaleNonDirEQ2018_Art23)],
        ['Fondo EQ 2018 (base art. 23)', formatCurrency(historicalData.fondoEQ2018_Art23)],
        ['', ''],
        ['Monte Salari 2021 (CCNL 2026)', formatCurrency(annualData.ccnl2024?.monteSalari2021)],
        ['Spesa Stipendi Tabellari 2023', formatCurrency(historicalData.spesaStipendiTabellari2023)],
    ], { colWidths: [110, 68] });

    // 2.3 Personale in servizio anno corrente
    subTitle(doc, '2.3 — Personale in Servizio (Anno Corrente)');
    const persRows = annualData.personaleServizioAttuale
        .filter(p => p.count !== undefined && p.count !== null)
        .map(p => [p.category, formatNumber(p.count, 0)]);
    if (persRows.length > 0) {
        simpleTable(doc, ['Categoria', 'Unità'], persRows, { colWidths: [130, 48] });
    } else {
        doc.setFontSize(8); doc.setTextColor(...C.textGray);
        doc.text('Dati personale non inseriti.', M + 2, Y); Y += 6;
        doc.setTextColor(...C.text);
    }

    // 2.4 Art. 23 c.2 — Variazione Personale
    checkPage(doc, 40);
    subTitle(doc, '2.4 — Calcolo Art. 23 c.2 — Variazione Personale Equivalente');

    const manDip2018 = annualData.manualDipendentiEquivalenti2018;
    const manDipRif = annualData.manualDipendentiEquivalentiAnnoRif;
    const nDip2018 = annualData.personale2018PerArt23?.length || 0;
    const nDipRif = annualData.personaleAnnoRifPerArt23?.length || 0;

    // Calcolo dipendenti equivalenti
    const dipEq2018 = manDip2018 !== undefined ? manDip2018 :
        (annualData.personale2018PerArt23 || []).reduce((s, e) => s + ((e.partTimePercentage ?? 100) / 100), 0);
    const dipEqRif = manDipRif !== undefined ? manDipRif :
        (annualData.personaleAnnoRifPerArt23 || []).reduce((s, e) => {
            const pt = (e.partTimePercentage ?? 100) / 100;
            const ratio = (e.cedoliniEmessi ?? 12) / 12;
            return s + pt * ratio;
        }, 0);
    const variaz = dipEqRif - dipEq2018;

    simpleTable(doc, ['Elemento', 'Valore'], [
        ['Dipendenti inseriti per calcolo 2018', `${nDip2018} unità`],
        ['Dipendenti equivalenti 31.12.2018', `${dipEq2018.toFixed(4)} (modo: ${manDip2018 !== undefined ? 'manuale' : 'analitico'})`],
        ['Dipendenti inseriti per anno rif.', `${nDipRif} unità`],
        ['Dipendenti equivalenti anno rif.', `${dipEqRif.toFixed(4)} (modo: ${manDipRif !== undefined ? 'manuale' : 'analitico'})`],
        ['Variazione (Δ)', `${variaz >= 0 ? '+' : ''}${variaz.toFixed(4)}`],
        ['Adeguamento automatico Art. 33 DL 34/2019', cf.incrementoDeterminatoArt23C2 ? formatCurrency(cf.incrementoDeterminatoArt23C2.importo) : 'Non applicabile'],
    ], { colWidths: [110, 68] });

    // 2.5 Input Simulatore
    checkPage(doc, 30);
    subTitle(doc, '2.5 — Dati di Input per Simulatore Incremento Potenziale');
    const si = annualData.simulatoreInput || {};
    simpleTable(doc, ['Parametro', 'Valore'], [
        ['Stipendi tabellari personale non dir. al 31.12.2023', formatCurrency(si.simStipendiTabellari2023)],
        ['Fondo stabile anno di applicazione', formatCurrency(si.simFondoStabileAnnoApplicazione)],
        ['Risorse PO/EQ anno di applicazione', formatCurrency(si.simRisorsePOEQAnnoApplicazione)],
        ['Spesa di personale (Consuntivo 2023)', formatCurrency(si.simSpesaPersonaleConsuntivo2023)],
        ['Media entrate correnti 2021-2023', formatCurrency(si.simMediaEntrateCorrenti2021_2023)],
        ['Tetto spesa personale L. 296/06', formatCurrency(si.simTettoSpesaPersonaleL296_06)],
        ['Costo annuo nuove assunzioni PIAO', formatCurrency(si.simCostoAnnuoNuoveAssunzioniPIAO)],
        ['% oneri a carico dell\'Ente su incremento', formatNumber(si.simPercentualeOneriIncremento, 2, '—') + ' %'],
    ], { colWidths: [110, 68] });
}

// ── SEZIONE 3: RISULTATI FONDO ───────────────────────────────────────────────
function buildRisultati(doc: jsPDF, cf: CalculatedFund, fd: FundData): void {
    doc.addPage();
    Y = M;
    const { annualData } = fd;
    const anno = annualData.annoRiferimento;
    const { dettaglioFondi: df } = cf;

    sectionTitle(doc, `3. RISULTATI CALCOLO FONDO RISORSE DECENTRATE — Anno ${anno}`);

    // 3.1 Quadro riepilogativo per fondo
    subTitle(doc, '3.1 — Quadro Riepilogativo per Fondo');
    const summaryRows: string[][] = [
        ['Personale Dipendente (non Dir/EQ)', formatCurrency(df.dipendente.stabile), formatCurrency(df.dipendente.variabile), formatCurrency(df.dipendente.totale)],
        ['Elevate Qualificazioni (EQ)', formatCurrency(df.eq.stabile), formatCurrency(df.eq.variabile), formatCurrency(df.eq.totale)],
        ['Segretario Comunale', formatCurrency(df.segretario.stabile), formatCurrency(df.segretario.variabile), formatCurrency(df.segretario.totale)],
    ];
    if (annualData.hasDirigenza) {
        summaryRows.push(['Dirigenza', formatCurrency(df.dirigenza.stabile), formatCurrency(df.dirigenza.variabile), formatCurrency(df.dirigenza.totale)]);
    }
    autoTable(doc, {
        startY: Y,
        head: [['Fondo', 'Parte Stabile (€)', 'Parte Variabile (€)', 'Totale (€)']],
        body: summaryRows,
        foot: [['TOTALE GENERALE', formatCurrency(cf.totaleComponenteStabile), formatCurrency(cf.totaleComponenteVariabile), formatCurrency(cf.totaleFondoRisorseDecentrate)]],
        theme: 'grid',
        headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9, cellPadding: 2.5 },
        alternateRowStyles: { fillColor: C.primaryLight },
        footStyles: { fillColor: C.primaryDark, textColor: C.white, fontStyle: 'bold', fontSize: 10 },
        columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
        margin: { left: M, right: M },
    });
    Y = (doc as any).lastAutoTable.finalY + 6;

    // Grafico barre per fondo
    checkPage(doc, 30);
    const maxVal = Math.max(df.dipendente.totale, df.eq.totale, df.segretario.totale,
        annualData.hasDirigenza ? df.dirigenza.totale : 0, 1);
    const barData = [
        { label: 'Dipendente', val: df.dipendente.totale },
        { label: 'EQ', val: df.eq.totale },
        { label: 'Segretario', val: df.segretario.totale },
    ];
    if (annualData.hasDirigenza) barData.push({ label: 'Dirigenza', val: df.dirigenza.totale });

    const barW = (PW - 10) / barData.length;
    barData.forEach((b, i) => {
        const bh = 16;
        const pct = maxVal > 0 ? b.val / maxVal : 0;
        const bx = M + i * barW + 2;
        // Sfondo
        doc.setFillColor(235, 225, 225);
        doc.rect(bx, Y, barW - 4, bh, 'F');
        // Barra
        doc.setFillColor(...C.primary);
        doc.rect(bx, Y + bh * (1 - pct), barW - 4, bh * pct, 'F');
        // Etichetta
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.primaryDark);
        doc.text(b.label, bx + (barW - 4) / 2, Y + bh + 3.5, { align: 'center' });
        doc.setFontSize(6);
        doc.setTextColor(...C.textGray);
        doc.text(formatCurrency(b.val), bx + (barW - 4) / 2, Y + bh + 7, { align: 'center' });
    });
    doc.setTextColor(...C.text);
    doc.setFont('helvetica', 'normal');
    Y += 28;

    // 3.2 Verifica Limite Art. 23
    checkPage(doc, 55);
    subTitle(doc, '3.2 — Verifica del Limite Art. 23, Comma 2, D.Lgs. n. 75/2017');
    const limite2016 = cf.fondoBase2016;
    const adeguamento = cf.incrementoDeterminatoArt23C2?.importo || 0;
    const limiteModif = cf.limiteArt23C2Modificato || limite2016;
    const soggette = cf.totaleRisorseSoggetteAlLimiteDaFondiSpecifici;
    const superamento = cf.superamentoLimite2016 || 0;
    const capienza = limiteModif - soggette;
    const isOk = superamento === 0;

    simpleTable(doc, ['Voce', 'Importo (€)', 'Note'], [
        ['Limite anno 2016 (base storica)', formatCurrency(limite2016), 'Art. 23 c.2 D.Lgs. 75/2017'],
        ['Adeguamento per personale (Art. 33 DL 34/2019)', formatCurrency(adeguamento), adeguamento > 0 ? 'Applicato' : 'Non applicabile'],
        ['LIMITE MODIFICATO (base di confronto)', formatCurrency(limiteModif), 'Somma precedenti'],
        ['', '', ''],
        ['Risorse soggette al limite anno corrente', formatCurrency(soggette), 'Totale fondi rilevanti'],
        ['CAPIENZA RESIDUA / SUPERAMENTO', isOk ? formatCurrency(capienza) : `−${formatCurrency(superamento)}`, isOk ? '✓ Nei limiti' : '✗ SUPERAMENTO'],
    ], { colWidths: [82, 52, 44] });

    // Barra grafica limite
    progressBar(doc, M, Y, PW - 24, 8,
        soggette, limiteModif,
        `Risorse soggette: ${formatCurrency(soggette)}   |   Limite modificato: ${formatCurrency(limiteModif)}`);
    Y += 16;

    // Box esito
    const esitoBg: [number, number, number] = isOk ? C.greenLight : C.redLight;
    const esitoFg: [number, number, number] = isOk ? C.green : C.red;
    const esitoTxt = isOk
        ? `✓ CONFORME — Capienza residua: ${formatCurrency(capienza)}`
        : `✗ NON CONFORME — Superamento di: ${formatCurrency(superamento)}`;
    doc.setFillColor(...esitoBg);
    doc.roundedRect(M, Y, PW, 9, 2, 2, 'F');
    doc.setTextColor(...esitoFg);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(esitoTxt, 105, Y + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.text);
    Y += 13;

    // 3.3 Composizione stabile vs variabile
    checkPage(doc, 30);
    subTitle(doc, '3.3 — Composizione Stabile vs Variabile');
    const totale = cf.totaleFondoRisorseDecentrate || 1;
    const pctStab = ((cf.totaleComponenteStabile / totale) * 100).toFixed(1);
    const pctVar = ((cf.totaleComponenteVariabile / totale) * 100).toFixed(1);
    simpleTable(doc, ['Componente', 'Importo (€)', '% sul Totale'], [
        ['PARTE STABILE', formatCurrency(cf.totaleComponenteStabile), `${pctStab}%`],
        ['PARTE VARIABILE', formatCurrency(cf.totaleComponenteVariabile), `${pctVar}%`],
        ['TOTALE GENERALE', formatCurrency(cf.totaleFondoRisorseDecentrate), '100,00%'],
    ], { colWidths: [100, 52, 26] });
}

// ── SEZIONE 4: DETTAGLIO FONDO DIPENDENTE ────────────────────────────────────
function buildFondoDipendente(doc: jsPDF, fd: FundData): void {
    doc.addPage();
    Y = M;
    const { fondoAccessorioDipendenteData: fad, annualData } = fd;
    const anno = annualData.annoRiferimento;
    if (!fad) { Y += 10; doc.setFontSize(9); doc.text('Dati Fondo Dipendente non disponibili.', M, Y); return; }

    sectionTitle(doc, `4. DETTAGLIO FONDO PERSONALE DIPENDENTE — Anno ${anno}`);

    const r = (lbl: string, val?: number) => [lbl, val !== undefined && val !== null ? formatCurrency(val) : '—'];

    // A) Stabili soggette
    subTitle(doc, 'A) Risorse Stabili Soggette al Limite (art. 23 c.2 D.Lgs. 75/2017)');
    simpleTable(doc, ['Voce', 'Importo (€)'], [
        r('Fondo anno 2015 (art. 67, c.1, CCNL 21/05/2018)', fad.st_art79c1_art67c1_unicoImporto2017),
        r('Incr. art. 31 c.3 CCNL 06/09 — €83,20/dip. 31/12/2015', fad.st_art79c1_art67c2a_incr8320),
        r('Differenziali PEO pregresse (art. 67, c.2, lett. b)', fad.st_art79c1_art67c2b_incrStipendialiDiff),
        r('RIA / assegni ad personam (art. 67, c.2, lett. c)', fad.st_art79c1_art4c2_art67c2c_integrazioneRIA),
        r('Risorse art. 2 c.3 D.Lgs. 165/01 (art. 67, c.2, lett. d)', fad.st_art79c1_art67c2d_risorseRiassorbite165),
        r('Personale trasferito (art. 67, c.2, lett. e)', fad.st_art79c1_art15c1l_art67c2e_personaleTrasferito),
        r('Riduzione dirigenti Regioni (art. 67, c.2, lett. f)', fad.st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig),
        r('Riduzione fondo straordinario (art. 67, c.2, lett. g)', fad.st_art79c1_art14c3_art67c2g_riduzioneStraordinario),
        r('Risorse per nuove assunzioni (art. 79, c.1, lett. c)', fad.st_art79c1c_incrementoStabileConsistenzaPers),
        r('Taglio DL 78/2010', fad.st_taglioFondoDL78_2010),
    ], { colWidths: [132, 46] });

    // B) Stabili non soggette
    checkPage(doc, 50);
    subTitle(doc, 'B) Risorse Stabili Non Soggette al Limite');
    simpleTable(doc, ['Voce', 'Importo (€)'], [
        r('€ 84,50 per dip. al 31/12/2018 (art. 79, c.1, lett. b)', fad.st_art79c1b_euro8450),
        r('Differenziali PEO art. 79 c.1 lett. d) CCNL 16/11/2022', fad.st_art79c1d_differenzialiStipendiali2022),
        r('Differenziali B3-B1 e D3-D1 (art. 79, c.1-bis)', fad.st_art79c1bis_diffStipendialiB3D3),
        r('Incremento 0,14% MS 2021 (art. 79, c.3 — dal 01/01/2024)', fad.vn_art79c3_022MonteSalari2018_da2022Proporzionale),
        r('Incremento 0,22% MS 2022 (L. 207/2024 — dal 01/01/2025)', fad.vn_art58c2_incremento_max022_ms2021_anno2025),
        r('Incremento Decreto PA (art. 14 DL 25/2025)', fad.st_incrementoDecretoPA),
    ], { colWidths: [132, 46] });

    // C) Variabili soggette
    checkPage(doc, 50);
    subTitle(doc, 'C) Risorse Variabili Soggette al Limite (art. 23 c.2 D.Lgs. 75/2017)');
    simpleTable(doc, ['Voce', 'Importo (€)'], [
        r('Finanziamento progetti obiettivo (art. 67, c.3, lett. c)', fad.vs_art4c3_art15c1k_art67c3c_recuperoEvasione),
        r('Proventi servizi conto terzi (art. 67, c.3, lett. d)', fad.vs_art4c2_art67c3d_integrazioneRIAMensile),
        r('Personale case da gioco (art. 67, c.3, lett. g)', fad.vs_art67c3g_personaleCaseGioco),
        r('Adeguamento Province / armonizzazione', fad.vs_art67c3k_integrazioneArt62c2e_personaleTrasferito),
        r('Quota max 1,2% monte salari 1997 (art. 79, c.2, lett. b)', fad.vs_art79c2b_max1_2MonteSalari1997),
        r('Economie assenze/aspettative/sanzioni (art. 79, c.2, lett. c)', fad.vs_art79c2c_risorseScelteOrganizzative),
    ], { colWidths: [132, 46] });

    // D) Variabili non soggette
    checkPage(doc, 60);
    subTitle(doc, 'D) Risorse Variabili Non Soggette al Limite');
    simpleTable(doc, ['Voce', 'Importo (€)'], [
        r('Sponsorizzazioni/convenzioni (art. 67, c.3, lett. a)', fad.vn_art15c1d_art67c3a_sponsorConvenzioni),
        r('Rimborso spese notifica messi (art. 67, c.3, lett. f)', fad.vn_art54_art67c3f_rimborsoSpeseNotifica),
        r('Piani razionalizzazione DL 98/11 (art. 67, c.3, lett. b)', fad.vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione),
        r('Incentivi funzioni tecniche/condoni (art. 67, c.3, lett. c)', fad.vn_art15c1k_art67c3c_incentiviTecniciCondoni),
        r('Incentivi spese giudizio/censimenti', fad.vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti),
        r('Risparmi disciplina straordinario (art. 67, c.3, lett. e)', fad.vn_art15c1m_art67c3e_risparmiStraordinario),
        r('Arretrati 2021-2022 €84,50 una tantum (art. 79, c.5)', fad.vn_art79c1b_euro8450_unaTantum2021_2022),
        r('Arretrati 2022 0,22% MS 2018 una tantum (art. 79, c.3)', fad.vn_art79c3_022MonteSalari2018_da2022UnaTantum2022),
        r('Residui risorse stabili anni precedenti (art. 79, c.2, lett. d)', fad.vn_art80c1_sommeNonUtilizzateStabiliPrec),
        r('Incentivi IMU/TARI (L. 145/2018)', fad.vn_l145_art1c1091_incentiviRiscossioneIMUTARI),
        r('Incremento PNRR max 5% fondo stabile 2016', fad.vn_dl13_art8c3_incrementoPNRR_max5stabile2016),
    ], { colWidths: [132, 46] });
}

// ── ESPORTAZIONE PRINCIPALE ──────────────────────────────────────────────────
export { buildCover, buildDatiEnte, buildRisultati, buildFondoDipendente, addFooters };
export type { };
