// services/pdfReportService2.ts
// Sezioni 5-8 del PDF "Riepilogo Generale Calcoli e Risultanze"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CalculatedFund, FundData, ComplianceCheck } from '../types.ts';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters.ts';

const M = 14;
const PW = 182;

const C = {
    primary: [153, 77, 81] as [number, number, number],
    primaryLight: [243, 231, 232] as [number, number, number],
    primaryDark: [122, 58, 62] as [number, number, number],
    accent: [209, 192, 193] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    text: [27, 14, 14] as [number, number, number],
    textGray: [107, 114, 128] as [number, number, number],
    green: [22, 163, 74] as [number, number, number],
    yellow: [217, 119, 6] as [number, number, number],
    red: [220, 38, 38] as [number, number, number],
    greenLight: [220, 252, 231] as [number, number, number],
    yellowLight: [254, 243, 199] as [number, number, number],
    redLight: [254, 226, 226] as [number, number, number],
    blue: [30, 58, 138] as [number, number, number],
    blueLight: [224, 231, 255] as [number, number, number],
};

let Y = 0;

function checkPage(doc: jsPDF, need: number): void {
    if (Y + need > 285) { doc.addPage(); Y = M; }
}

function sectionTitle(doc: jsPDF, title: string): void {
    checkPage(doc, 12);
    doc.setFillColor(...C.primary);
    doc.rect(M, Y, PW, 8, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text(title, M + 3, Y + 5.5);
    doc.setTextColor(...C.text); doc.setFont('helvetica', 'normal');
    Y += 11;
}

function subTitle(doc: jsPDF, title: string): void {
    checkPage(doc, 10);
    doc.setFillColor(...C.primaryLight);
    doc.rect(M, Y, PW, 6.5, 'F');
    doc.setTextColor(...C.primaryDark);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(title, M + 2, Y + 4.5);
    doc.setTextColor(...C.text); doc.setFont('helvetica', 'normal');
    Y += 9;
}

function simpleTable(doc: jsPDF, headers: string[], rows: string[][], colWidths?: number[]): void {
    autoTable(doc, {
        startY: Y,
        head: [headers],
        body: rows,
        theme: 'plain',
        headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 8, cellPadding: 2 },
        bodyStyles: { fontSize: 8, cellPadding: 1.8, textColor: C.text },
        alternateRowStyles: { fillColor: [253, 249, 249] },
        columnStyles: colWidths ? Object.fromEntries(colWidths.map((w, i) => [i, { cellWidth: w }])) : {},
        margin: { left: M, right: M },
    });
    Y = (doc as any).lastAutoTable.finalY + 4;
}

// ── SEZIONE 5: EQ / SEGRETARIO / DIRIGENZA ───────────────────────────────────
export function buildAltriCondi(doc: jsPDF, cf: CalculatedFund, fd: FundData): void {
    doc.addPage();
    Y = M;
    const { fondoElevateQualificazioniData: feq, fondoSegretarioComunaleData: fseg,
        fondoDirigenzaData: fdir, annualData } = fd;
    const anno = annualData.annoRiferimento;
    const { dettaglioFondi: df } = cf;

    sectionTitle(doc, `5. DETTAGLIO FONDI EQ, SEGRETARIO E DIRIGENZA — Anno ${anno}`);

    const r = (lbl: string, val?: number) => [lbl, val !== undefined ? formatCurrency(val) : '—'];

    // 5.1 Elevate Qualificazioni
    subTitle(doc, `5.1 — Fondo Elevate Qualificazioni (EQ)  →  Totale: ${formatCurrency(df.eq.totale)}`);
    if (feq) {
        simpleTable(doc, ['Voce', 'Importo (€)'], [
            r('Fondo PO/EQ (ex art. 67 c.3 lett. b CCNL 2018)', feq.ris_fondoPO2017),
            r('Incremento con riduzione Fondo Dipendente', feq.ris_incrementoConRiduzioneFondoDipendenti),
            r('Incremento Limite Art. 23 c.2 DL 34/2019', feq.ris_incrementoLimiteArt23c2_DL34),
            r('Incremento 0,22% MS 2018 (CCNL 2022)', feq.ris_incremento022MonteSalari2018),
            r('Incremento 0,22% MS 2021 (EQ CCNL 2026)', feq.va_incremento022_ms2021_eq),
            r('Adeguamento tetto 2016 (decurtazione)', feq.fin_art23c2_adeguamentoTetto2016),
            r('Retribuzione di Posizione (art. 16 c.2 CCNL 2026)', feq.st_art16c2_retribuzionePosizione),
            r('Retribuzione di Risultato (art. 16 c.3 CCNL 2026)', feq.va_art16c3_retribuzioneRisultato),
            r('Maggiorazione sedi lavoro (art. 18 c.5 CCNL 2026)', feq.va_art18c5_CCNL2026_maggiorazioneSediLavoro),
            r('Maggiorazione interim (art. 16 c.5 CCNL 2026)', feq.va_art16c5_CCNL2026_maggiorazioneInterim),
            r('Armonizzazione DL 25/2025', feq.va_dl25_2025_armonizzazione),
        ], [132, 46]);
    } else {
        doc.setFontSize(8); doc.setTextColor(...C.textGray);
        doc.text('Dati EQ non inseriti.', M + 2, Y); Y += 6; doc.setTextColor(...C.text);
    }

    // 5.2 Segretario Comunale
    checkPage(doc, 80);
    subTitle(doc, `5.2 — Risorse Segretario Comunale  →  Totale: ${formatCurrency(df.segretario.totale)}`);
    if (fseg) {
        const copertura = (fseg.fin_percentualeCoperturaPostoSegretario !== undefined
            ? fseg.fin_percentualeCoperturaPostoSegretario : 100);
        simpleTable(doc, ['Voce', 'Importo (€)'], [
            r('% copertura posto Segretario', copertura !== 100 ? copertura : undefined),
            r('Retribuzione di Posizione (art. 3 c.6 CCNL 2011)', fseg.st_art3c6_CCNL2011_retribuzionePosizione),
            r('Differenziale aumento (art. 58 c.1 CCNL 2024)', fseg.st_art58c1_CCNL2024_differenzialeAumento),
            r('Retribuzione posizione classi (art. 60 c.1 CCNL 2024)', fseg.st_art60c1_CCNL2024_retribuzionePosizioneClassi),
            r('Maggiorazione complessità (art. 60 c.3 CCNL 2024)', fseg.st_art60c3_CCNL2024_maggiorazioneComplessita),
            r('Allineamento Dir/EQ (art. 60 c.5 CCNL 2024)', fseg.st_art60c5_CCNL2024_allineamentoDirigEQ),
            r('Retribuzione aggiuntiva convenzioni (art. 56 c.1g)', fseg.st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni),
            r('Indennità reggenza/supplenza (art. 56 c.1h)', fseg.st_art56c1h_CCNL2024_indennitaReggenzaSupplenza),
            r('Diritti di segreteria (art. 56 c.1f)', fseg.va_art56c1f_CCNL2024_dirittiSegreteria),
            r('Altri compensi di legge (art. 56 c.1i)', fseg.va_art56c1i_CCNL2024_altriCompensiLegge),
            r('Incremento PNRR (DL 13/2023 art. 8 c.3)', fseg.va_art8c3_DL13_2023_incrementoPNRR),
            r('Retribuzione di Risultato 10% (art. 61 c.2)', fseg.va_art61c2_CCNL2024_retribuzioneRisultato10),
            r('Retribuzione di Risultato 15% (art. 61 c.2bis)', fseg.va_art61c2bis_CCNL2024_retribuzioneRisultato15),
            r('Superamento limite Città Metropolitane (art. 61 c.2ter)', fseg.va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane),
            r('Incremento 0,22% MS 2018 (art. 61 c.3)', fseg.va_art61c3_CCNL2024_incremento022MonteSalari2018),
        ], [132, 46]);
    } else {
        doc.setFontSize(8); doc.setTextColor(...C.textGray);
        doc.text('Dati Segretario non inseriti.', M + 2, Y); Y += 6; doc.setTextColor(...C.text);
    }

    // 5.3 Dirigenza
    checkPage(doc, 80);
    if (annualData.hasDirigenza && fdir) {
        subTitle(doc, `5.3 — Fondo Dirigenza  →  Totale: ${formatCurrency(df.dirigenza.totale)}`);
        simpleTable(doc, ['Voce', 'Importo (€)'], [
            r('Unico importo 2020 (art. 57 c.2a CCNL 2020)', fdir.st_art57c2a_CCNL2020_unicoImporto2020),
            r('RIA personale cessato 2020 (art. 57 c.2a)', fdir.st_art57c2a_CCNL2020_riaPersonaleCessato2020),
            r('Incremento 1,53% MS 2015 (art. 56 c.1)', fdir.st_art56c1_CCNL2020_incremento1_53MonteSalari2015),
            r('RIA cessati dall\'anno successivo (art. 57 c.2c)', fdir.st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo),
            r('Risorse autonome stabili (art. 57 c.2e)', fdir.st_art57c2e_CCNL2020_risorseAutonomeStabili),
            r('Incremento 2,01% MS 2018 (art. 39 c.1 CCNL 2024)', fdir.st_art39c1_CCNL2024_incremento2_01MonteSalari2018),
            r('Incremento 3,05% MS 2021 (art. 24 c.1 CCNL 2022-2024)', fdir.st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021),
            r('Risorse legge/sponsor (art. 57 c.2b)', fdir.va_art57c2b_CCNL2020_risorseLeggeSponsor),
            r('Somme onnicomprensività (art. 57 c.2d)', fdir.va_art57c2d_CCNL2020_sommeOnnicomprensivita),
            r('Risorse autonome variabili (art. 57 c.2e)', fdir.va_art57c2e_CCNL2020_risorseAutonomeVariabili),
            r('Residui anno precedente (art. 57 c.3)', fdir.va_art57c3_CCNL2020_residuiAnnoPrecedente),
            r('Incremento PNRR (DL 13/2023)', fdir.va_dl13_2023_art8c3_incrementoPNRR),
            r('Recupero 0,46% MS 2018 (art. 39 c.1 CCNL 2024)', fdir.va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020),
            r('Recupero 2,01% MS 2018 — 2021-2023 (art. 39 c.1)', fdir.va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023),
            r('Incremento 0,22% MS 2018 valorizzazione (art. 39 c.2)', fdir.va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione),
            r('Incremento 0,22% MS 2021 (art. 24 c.3 CCNL 2022-2024)', fdir.va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021),
            r('Adeguamento tetto 2016 (art. 23 c.2 D.Lgs. 75/2017)', fdir.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016),
        ], [132, 46]);
    } else if (!annualData.hasDirigenza) {
        doc.setFontSize(8); doc.setTextColor(...C.textGray);
        doc.text('5.3 — Fondo Dirigenza: non presente (ente senza dirigenza).', M + 2, Y);
        Y += 6; doc.setTextColor(...C.text);
    }
}

// ── SEZIONE 6: SIMULATORE ────────────────────────────────────────────────────
export function buildSimulatore(doc: jsPDF, fd: FundData): void {
    const sr = fd.annualData.simulatoreRisultati;
    if (!sr) return;

    doc.addPage();
    Y = M;
    const anno = fd.annualData.annoRiferimento;
    sectionTitle(doc, `6. SIMULATORE INCREMENTO POTENZIALE — Anno ${anno}`);

    doc.setFontSize(8); doc.setTextColor(...C.textGray);
    doc.text('Il simulatore calcola l\'incremento massimo applicabile al fondo secondo le 5 fasi previste dalla normativa (DL 34/2019, L. 296/06).', M, Y, { maxWidth: PW });
    Y += 8; doc.setTextColor(...C.text);

    const faN = (v?: number) => v !== undefined ? formatCurrency(v) : '—';
    const faPct = (v?: number) => v !== undefined ? `${formatNumber(v, 2)} %` : '—';

    const rows: string[][] = [
        ['FASE 1 — Obiettivo 48% Stipendi Tabellari', '', ''],
        ['Obiettivo 48% su stipendi tabellari 2023', faN(sr.fase1_obiettivo48), ''],
        ['Fondo attuale complessivo (stabile + EQ)', faN(sr.fase1_fondoAttualeComplessivo), ''],
        ['Incremento Potenziale Lordo (Fase 1)', faN(sr.fase1_incrementoPotenzialeLordo), ''],
        ['', '', ''],
        ['FASE 2 — Verifica Limite Spesa Personale (DM 17/03/2020)', '', ''],
        ['Spesa personale attuale prevista', faN(sr.fase2_spesaPersonaleAttualePrevista), ''],
        ['Soglia % DM 17/03/2020 (per fascia abitanti)', faPct(sr.fase2_sogliaPercentualeDM17_03_2020), 'Limite di soglia'],
        ['Limite sostenibile DL 34', faN(sr.fase2_limiteSostenibileDL34), 'Media entrate × soglia %'],
        ['Spazio disponibile DL 34', faN(sr.fase2_spazioDisponibileDL34), ''],
        ['', '', ''],
        ['FASE 3 — Verifica Tetto Storico (L. 296/06)', '', ''],
        ['Margine disponibile L. 296/06', faN(sr.fase3_margineDisponibileL296_06), ''],
        ['', '', ''],
        ['FASE 4 — Spazio Utilizzabile Lordo (minore dei 3 limiti)', '', ''],
        ['Spazio Utilizzabile Lordo', faN(sr.fase4_spazioUtilizzabileLordo), 'MIN(F1, F2, F3)'],
        ['', '', ''],
        ['FASE 5 — Incremento Netto Effettivo del Fondo', '', ''],
        ['Incremento Netto Effettivo del Fondo', faN(sr.fase5_incrementoNettoEffettivoFondo), 'Al netto degli oneri'],
    ];

    autoTable(doc, {
        startY: Y,
        head: [['Fase / Descrizione', 'Importo (€)', 'Note']],
        body: rows,
        theme: 'plain',
        headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 8, cellPadding: 2 },
        bodyStyles: { fontSize: 8, cellPadding: 1.8 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 50, halign: 'right' },
            2: { cellWidth: 30, textColor: C.textGray, fontStyle: 'italic' },
        },
        willDrawCell: (data) => {
            if (data.section === 'body' && data.row.index >= 0) {
                const txt = rows[data.row.index]?.[0] || '';
                if (txt.startsWith('FASE') || txt === '' || txt === 'Incremento Netto Effettivo del Fondo' || txt === 'Spazio Utilizzabile Lordo') {
                    if (txt.startsWith('FASE')) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = C.primaryLight as any;
                    } else if (txt === 'Incremento Netto Effettivo del Fondo' || txt === 'Spazio Utilizzabile Lordo') {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = C.blueLight as any;
                    }
                }
            }
        },
        margin: { left: M, right: M },
    });
    Y = (doc as any).lastAutoTable.finalY + 6;

    // Box risultato finale
    checkPage(doc, 14);
    const finalVal = sr.fase5_incrementoNettoEffettivoFondo || 0;
    doc.setFillColor(...C.blueLight);
    doc.roundedRect(M, Y, PW, 10, 2, 2, 'F');
    doc.setTextColor(...C.blue);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(`INCREMENTO MASSIMO APPLICABILE AL FONDO: ${formatCurrency(finalVal)}`, 105, Y + 6.5, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.text);
    Y += 14;
}

// ── SEZIONE 7: CONTROLLI DI CONFORMITÀ ──────────────────────────────────────
export function buildConformita(doc: jsPDF, checks: ComplianceCheck[], anno: number): void {
    doc.addPage();
    Y = M;
    sectionTitle(doc, `7. CONTROLLI DI CONFORMITÀ — Anno ${anno}`);

    const nOk = checks.filter(c => c.isCompliant).length;
    const nWarn = checks.filter(c => !c.isCompliant && c.gravita === 'warning').length;
    const nErr = checks.filter(c => !c.isCompliant && c.gravita === 'error').length;
    const nInfo = checks.filter(c => !c.isCompliant && c.gravita === 'info').length;

    // Riepilogo semaforo
    const bw = 42, bh = 16, gap = 4;
    [
        { lbl: '✓ CONFORMI', val: nOk, fg: C.green, bg: C.greenLight },
        { lbl: '⚠ INFO', val: nInfo, fg: C.blue, bg: C.blueLight },
        { lbl: '⚠ ATTENZIONE', val: nWarn, fg: C.yellow, bg: C.yellowLight },
        { lbl: '✗ NON CONFORMI', val: nErr, fg: C.red, bg: C.redLight },
    ].forEach((item, i) => {
        const bx = M + i * (bw + gap);
        doc.setFillColor(...item.bg);
        doc.roundedRect(bx, Y, bw, bh, 2, 2, 'F');
        doc.setTextColor(...item.fg);
        doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.text(item.lbl, bx + bw / 2, Y + 5, { align: 'center' });
        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.text(String(item.val), bx + bw / 2, Y + 13, { align: 'center' });
    });
    doc.setTextColor(...C.text); doc.setFont('helvetica', 'normal');
    Y += bh + 6;

    // Tabella dettaglio conformità
    const rows = checks.map(c => {
        const stato = c.isCompliant ? '✓' : (c.gravita === 'error' ? '✗' : '⚠');
        const statoTxt = c.isCompliant ? 'Conforme' : (c.gravita === 'info' ? 'Info' : c.gravita === 'warning' ? 'Attenzione' : 'Non Conforme');
        return [stato + ' ' + statoTxt, c.descrizione, String(c.valoreAttuale || '—'), String(c.limite || '—'), c.messaggio];
    });

    autoTable(doc, {
        startY: Y,
        head: [['Stato', 'Controllo', 'Valore', 'Limite', 'Messaggio']],
        body: rows,
        theme: 'plain',
        headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 7.5, cellPadding: 2 },
        bodyStyles: { fontSize: 7.5, cellPadding: 1.5 },
        columnStyles: {
            0: { cellWidth: 24 },
            1: { cellWidth: 56 },
            2: { cellWidth: 26 },
            3: { cellWidth: 26 },
            4: { cellWidth: 48 },
        },
        willDrawCell: (data) => {
            if (data.section === 'body') {
                const check = checks[data.row.index];
                if (!check) return;
                let bg: [number, number, number] | undefined;
                if (check.isCompliant) bg = C.greenLight;
                else if (check.gravita === 'error') bg = C.redLight;
                else if (check.gravita === 'warning') bg = C.yellowLight;
                else bg = C.blueLight;
                if (bg) data.cell.styles.fillColor = bg as any;

                if (data.column.index === 0) {
                    if (check.isCompliant) data.cell.styles.textColor = C.green as any;
                    else if (check.gravita === 'error') data.cell.styles.textColor = C.red as any;
                    else if (check.gravita === 'warning') data.cell.styles.textColor = C.yellow as any;
                    else data.cell.styles.textColor = C.blue as any;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { left: M, right: M },
    });
    Y = (doc as any).lastAutoTable.finalY + 6;
}

// ── SEZIONE 8: NOTE E FIRMA ──────────────────────────────────────────────────
export function buildNote(doc: jsPDF, fd: FundData, userName: string): void {
    checkPage(doc, 60);
    if (Y > 200) { doc.addPage(); Y = M; }

    const anno = fd.annualData.annoRiferimento;
    sectionTitle(doc, '8. RIFERIMENTI NORMATIVI E NOTE');

    const norms = [
        ['D.Lgs. 30/03/2001, n. 165', 'Norme generali sull\'ordinamento del personale pubblico'],
        ['D.Lgs. 25/05/2017, n. 75 — Art. 23 c.2', 'Limite al trattamento accessorio (tetto anno 2016)'],
        ['CCNL Funzioni Locali 21/05/2018 — Art. 67', 'Costituzione Fondo risorse decentrate (triennio 2016-2018)'],
        ['CCNL Funzioni Locali 16/11/2022 — Art. 79', 'Costituzione Fondo risorse decentrate (triennio 2019-2021)'],
        ['D.L. 14/12/2018, n. 135 — Art. 11 c.1', 'Esclusione dal limite per incrementi CCNL successivi'],
        ['D.L. 30/04/2019, n. 34 — Art. 33 c.2', 'Adeguamento limite per variazione personale (pro-capite 2018)'],
        ['Legge 30/12/2024, n. 207 — Art. 121', 'Incremento 0,22% MS 2022 dal 01/01/2025'],
        ['D.L. n. 25/2025 — Art. 14', 'Incremento facoltativo enti virtuosi (regola 48% stipendi tab.)'],
    ];

    simpleTable(doc, ['Riferimento Normativo', 'Oggetto'], norms, [60, 118]);

    // Proventi specifici se presenti
    const proventi = fd.annualData.proventiSpecifici.filter(p => p.importo && p.importo > 0);
    if (proventi.length > 0) {
        checkPage(doc, 30);
        subTitle(doc, 'Proventi Specifici Inseriti');
        simpleTable(doc, ['Descrizione', 'Rif. Normativo', 'Importo (€)'],
            proventi.map(p => [p.descrizione, p.riferimentoNormativo, formatCurrency(p.importo)]),
            [80, 60, 38]);
    }

    // Firma e data
    checkPage(doc, 28);
    doc.setFillColor(...C.primaryLight);
    doc.rect(M, Y, PW, 24, 'F');
    doc.setTextColor(...C.primaryDark);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(`Report generato automaticamente dal software "Salario Accessorio"`, 105, Y + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Ente: ${fd.annualData.denominazioneEnte || '—'}   |   Anno: ${anno}`, 105, Y + 10, { align: 'center' });
    doc.text(`Generato da: ${userName}   |   Data: ${formatDate(new Date())}`, 105, Y + 15, { align: 'center' });
    doc.setFontSize(7); doc.setTextColor(...C.textGray);
    doc.text('Il presente documento ha carattere esclusivamente ricognitivo e non sostituisce gli atti formali di costituzione del Fondo.', 105, Y + 21, { align: 'center' });
    doc.setTextColor(...C.text);
    Y += 28;
}

// ── STATO Y (condiviso tra i moduli della stessa chiamata) ───────────────────
export function setGlobalY(val: number): void { Y = val; }
export function getGlobalY(): number { return Y; }
