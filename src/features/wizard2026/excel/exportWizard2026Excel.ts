import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Wizard2026DraftState } from '../types';
import { wizard2026ExcelSchema, ENTITY_TYPE_LABELS } from './wizard2026ExcelSchema';

// Helper per leggere valori annidati dallo stato
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
}

export const exportWizard2026Excel = async (
  state: Wizard2026DraftState | null,
  denominazioneEnte: string = 'Ente',
  annoRiferimento: number = 2026
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FP CGIL Lombardia';
  workbook.lastModifiedBy = 'FP CGIL Lombardia';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Palette CGIL Lombardia
  const RED_MAIN = 'CC4331';
  const RED_DARK = 'A83226';
  const BG_SOFT = 'FFF4F2';
  const GRAY_BORDER = 'E5E7EB';
  // ── STILI GENERALI ─────────────────────────────────────────────────────────
  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF' + RED_MAIN },
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF' + GRAY_BORDER } },
    left: { style: 'thin', color: { argb: 'FF' + GRAY_BORDER } },
    bottom: { style: 'thin', color: { argb: 'FF' + GRAY_BORDER } },
    right: { style: 'thin', color: { argb: 'FF' + GRAY_BORDER } },
  };

  // ── 1. FOGLIO ISTRUZIONI ──────────────────────────────────────────────────
  const wsInstructions = workbook.addWorksheet('Istruzioni');
  wsInstructions.views = [{ showGridLines: true }];
  wsInstructions.getColumn(1).width = 5;
  wsInstructions.getColumn(2).width = 40;
  wsInstructions.getColumn(3).width = 80;

  // Titolo Istruzioni
  wsInstructions.mergeCells('B2:C2');
  const titleCell = wsInstructions.getCell('B2');
  titleCell.value = 'ISTRUTTORIA WIZARD 2026 - COMPILAZIONE OFFLINE';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF' + RED_DARK } };
  wsInstructions.getRow(2).height = 30;

  wsInstructions.getCell('B4').value = 'Cos\'è questo file?';
  wsInstructions.getCell('B4').font = { name: 'Arial', size: 12, bold: true };
  wsInstructions.getCell('C4').value =
    'Questo foglio di calcolo consente di compilare offline i dati contabili e di governance richiesti per l\'istruttoria del Fondo Risorse Decentrate 2026. Una volta compilato nelle parti editabili, puoi ricaricarlo all\'inizio del wizard per popolare automaticamente tutti gli step.';

  wsInstructions.getCell('B6').value = 'Regole di compilazione';
  wsInstructions.getCell('B6').font = { name: 'Arial', size: 12, bold: true };
  wsInstructions.getCell('C6').value =
    '1. Compila SOLO la colonna "VALORE DA COMPILARE" (Colonna C) nei fogli successivi.\n' +
    '2. Rispetta i formati richiesti:\n' +
    '   - Per gli importi, inserisci numeri semplici senza simbolo di valuta (es. 125000.50).\n' +
    '   - Per i booleani, seleziona "Sì" o "No" dal menu a tendina.\n' +
    '   - Per le selezioni multiple, scegli uno dei valori proposti.\n' +
    '3. Non modificare la struttura delle colonne, le etichette o le chiavi nascoste: alterazioni del file comprometteranno il caricamento.';

  // Legenda colori
  wsInstructions.getCell('B9').value = 'LEGENDA COLORI E TIPI DI CELLE';
  wsInstructions.getCell('B9').font = { name: 'Arial', size: 11, bold: true };

  const rowRequired = wsInstructions.addRow(['', 'Input Obbligatorio', 'Celle colorate in arancio tenue. Devono essere necessariamente compilate per validare l\'istruttoria.']);
  rowRequired.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BG_SOFT } };
  rowRequired.getCell(2).font = { bold: true };
  rowRequired.getCell(2).border = borderStyle;
  rowRequired.getCell(3).border = borderStyle;

  const rowOptional = wsInstructions.addRow(['', 'Input Opzionale / Condizionale', 'Celle bianche. Compilare solo se applicabili all\'ente (es. dati dirigenza se presente).']);
  rowOptional.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  rowOptional.getCell(2).font = { bold: true };
  rowOptional.getCell(2).border = borderStyle;
  rowOptional.getCell(3).border = borderStyle;

  const rowCalc = wsInstructions.addRow(['', 'Dato Calcolato o Informativo', 'Celle grigie. Questi valori vengono compilati dal sistema o fungono da sola lettura.']);
  rowCalc.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  rowCalc.getCell(2).font = { bold: true };
  rowCalc.getCell(2).border = borderStyle;
  rowCalc.getCell(3).border = borderStyle;

  // ── 2. FOGLI DI DETTAGLIO STEP ────────────────────────────────────────────
  wizard2026ExcelSchema.forEach(sheetSchema => {
    const ws = workbook.addWorksheet(sheetSchema.sheetName);
    ws.views = [{ showGridLines: true }];

    // Definizione Colonne
    ws.columns = [
      { header: 'PARAMETRO / VOCE', key: 'label', width: 60 },
      { header: 'TIPO CELLA', key: 'cellType', width: 25 },
      { header: 'VALORE DA COMPILARE', key: 'value', width: 35 },
      { header: 'NOTE / SPIEGAZIONI CONTABILI', key: 'note', width: 75 },
      { header: 'CHIAVE TECNICA (NASCOSTA)', key: 'key', width: 25 }, // Colonna E
    ];

    // Formatta la riga di intestazione
    const headerRow = ws.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = borderStyle;
    });

    // Popolamento dei campi dello schema
    sheetSchema.fields.forEach(field => {
      let cellTypeValue = 'Opzionale';
      let cellColor = 'FFFFFFFF'; // Bianco

      if (field.cellType === 'input_required') {
        cellTypeValue = 'Obbligatorio';
        cellColor = 'FF' + BG_SOFT; // Sfondo soft CGIL
      } else if (field.cellType === 'calculated') {
        cellTypeValue = 'Calcolato / Informativo';
        cellColor = 'FFF3F4F6'; // Grigio chiaro
      }

      // Estrai valore dallo stato se presente
      let displayVal: any = '';
      if (state) {
        if (field.key.startsWith('conglobamentoArt60.partTimeNativoFte.')) {
          const area = field.key.split('.').pop();
          const sumPt = (state.conglobamentoArt60.partTimeNativi || [])
            .filter(p => p.area === area)
            .reduce((acc, row) => acc + (row.numeroDipendenti * row.percentualePartTime) / 100, 0);
          displayVal = sumPt > 0 ? sumPt : '';
        } else if (field.key.startsWith('conglobamentoArt60.fullTimeTrasformatoPartTime.')) {
          displayVal = ''; // Lasciamo vuoto
        } else {
          const rawVal = getNestedValue(state, field.key);
          if (rawVal !== undefined && rawVal !== null) {
            if (field.type === 'boolean') {
              displayVal = rawVal ? 'Sì' : 'No';
            } else if (field.type === 'select') {
              if (field.key === 'ente.entityType') {
                displayVal = ENTITY_TYPE_LABELS[rawVal as keyof typeof ENTITY_TYPE_LABELS] || rawVal;
              } else {
                displayVal = rawVal;
              }
            } else {
              displayVal = rawVal;
            }
          }
        }
      }

      const row = ws.addRow({
        label: field.label,
        cellType: cellTypeValue,
        value: displayVal,
        note: field.note,
        key: field.key,
      });

      // Applica bordi e font a tutta la riga
      row.eachCell(cell => {
        cell.font = { name: 'Arial', size: 10 };
        cell.border = borderStyle;
      });

      // Formatta la colonna Valore (colonna C, cioè la cella 3)
      const valCell = row.getCell(3);
      valCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: cellColor },
      };
      
      // Formati numerici per i campi numerici
      if (field.type === 'number') {
        valCell.numFmt = '#,##0.00';
      }

      // Tendine di convalida per booleani o selezioni
      if (field.type === 'boolean') {
        valCell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"Sì,No"'],
          showErrorMessage: true,
          errorTitle: 'Valore non valido',
          error: 'Selezionare Sì o No dall\'elenco.',
        };
      } else if (field.type === 'select' && field.options) {
        // Uniamo le opzioni separate da virgola per Excel
        const escapedOptions = field.options.map(opt => opt.replace(/"/g, '""')).join(',');
        valCell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${escapedOptions}"`],
          showErrorMessage: true,
          errorTitle: 'Valore non valido',
          error: 'Selezionare uno dei valori proposti.',
        };
      }
    });

    // Nascondi la colonna E ("key" - chiave tecnica interna)
    ws.getColumn(5).hidden = true;
  });

  // ── 3. FOGLIO RIEPILOGO CALCOLATO (Solo se esportiamo i dati inseriti) ──
  if (state) {
    const wsSummary = workbook.addWorksheet('Riepilogo Calcolato');
    wsSummary.views = [{ showGridLines: true }];

    wsSummary.columns = [
      { header: 'SEZIONE ISTRUTTORIA', key: 'sezione', width: 35 },
      { header: 'NOME VOCE CALCOLATA', key: 'descrizione', width: 55 },
      { header: 'IMPORTO (€)', key: 'valore', width: 22, style: { numFmt: '#,##0.00' } },
      { header: 'RILEVANZA LIMITE ART. 23', key: 'rilevante23', width: 25 },
      { header: 'DESTINAZIONE FUTURA PREVISTA', key: 'destinazione', width: 45 },
    ];

    const headerRow = wsSummary.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = borderStyle;
    });

    const formatEur = (val?: number | null) => (val === undefined || val === null ? 'n/d' : val);

    // 1. Limite Art 23
    const lim23 = state.art23.result;
    wsSummary.addRow(['1. Limite Art. 23, c. 2', 'Limite storico 2016 certificato', formatEur(state.art23.limite2016CertificatoEnte), 'Riferimento tetto', 'Tetto massimo trattamento accessorio']);
    wsSummary.addRow(['1. Limite Art. 23, c. 2', 'Adeguamento medio pro capite (Art. 33)', formatEur(lim23?.incrementoProCapiteLimite), 'Informativo', 'Delta di adeguamento limite storico']);
    wsSummary.addRow(['1. Limite Art. 23, c. 2', 'Limite complessivo attualizzato', formatEur(lim23?.limiteArt23Attualizzato), 'Riferimento tetto', 'Tetto massimo applicato']);
    wsSummary.addRow(['1. Limite Art. 23, c. 2', 'Margine di capienza Art. 23', formatEur(lim23?.margineArt23), 'Informativo', 'Margine capienza residuo']);

    // 2. D.L. 25/2025
    const dl25 = state.dl25.result;
    wsSummary.addRow(['2. D.L. 25/2025', 'Limite massimo teorico dell\'anno di riferimento (D.L. 25)', formatEur(dl25?.limiteMassimoDL25), 'Escluso (Art. 1, c. 2)', 'Capacità massima incrementale (Fase Costituzione)']);

    // 3. CCNL 2026 (0.14% e 0.22%)
    const ccnl = state.ccnl2026.result;
    wsSummary.addRow(['3. CCNL 23.02.2026', 'Incremento dello 0,14% - parte stabile (Monte Salari 2021 x 0,14% x 1)', formatEur(ccnl?.incrementoStabile014), 'Escluso (Art. 23 c. 2)', 'Fondo risorse decentrate (parte stabile)']);
    wsSummary.addRow(['3. CCNL 23.02.2026', 'Arretrati dello 0,14% calcolati sul Monte Salari 2021', formatEur(ccnl?.arretrati014), 'Escluso (Art. 23 c. 2)', 'Fondo risorse decentrate (parte variabile una tantum)']);
    wsSummary.addRow(['3. CCNL 23.02.2026', 'Limite massimo quota dello 0,22% che l’ente intende applicare nell’anno', formatEur(ccnl?.limiteMassimo022), 'Escluso (Art. 23 c. 2)', 'Limite massimo complessivo FRD + EQ']);
    wsSummary.addRow(['3. CCNL 23.02.2026', 'Quota dello 0,22% destinata al Fondo risorse decentrate', formatEur(ccnl?.quotaFondo), 'Escluso (Art. 23 c. 2)', 'Fondo risorse decentrate (parte stabile o variabile)']);
    wsSummary.addRow(['3. CCNL 23.02.2026', 'Quota dello 0,22% destinata alle Elevate Qualificazioni', formatEur(ccnl?.quotaEQ), 'Escluso (Art. 23 c. 2)', 'Risorse per Elevate Qualificazioni']);

    // 4. Conglobamento Art 60
    const cong = state.conglobamentoArt60.result;
    wsSummary.addRow(['4. Conglobamento Art. 60', 'Riduzione Indennità Comparto calcolata/consolidata', cong?.riduzioneTotale ? -cong.riduzioneTotale : 'n/d', 'Soggetto (Riduce FRD)', 'Fondo risorse decentrate (decurtazione stabile)']);

    // 5. Straordinario
    const stra = state.straordinario.result;
    wsSummary.addRow(['5. Straordinario', 'Fondo straordinario ordinario residuo', formatEur(stra?.fondoStraordinarioOrdinarioResiduo || stra?.straordinarioOrdinarioSoggettoArt23), 'Soggetto (Art. 23)', 'Fondo Straordinario dell\'anno']);
    wsSummary.addRow(['5. Straordinario', 'Riduzione stabile straordinario (Art. 67)', formatEur(state.straordinario.riduzioneStabileStraordinarioArt67), 'Soggetto (Art. 23)', 'Fondo risorse decentrate (spostamento stabile)']);
    wsSummary.addRow(['5. Straordinario', 'Economie da straordinario certificate', formatEur(state.straordinario.economieStraordinarioCertificate), 'Escluso (Art. 23 c. 2)', 'Fondo risorse decentrate (incremento variabile)']);

    // 6. PNRR
    const pnrr = state.pnrr.result;
    if (pnrr?.isApplicabile) {
      wsSummary.addRow(['6. PNRR', 'Limite massimo PNRR Fondo dipendenti (5% base 2016)', formatEur(pnrr.limiteMassimoPnrrFondoDipendenti), 'Escluso (Art. 23 c. 2)', 'Fondo risorse decentrate (parte variabile PNRR)']);
      if (state.ente.hasDirigenza) {
        wsSummary.addRow(['6. PNRR', 'Limite massimo PNRR Fondo dirigenza (5% base 2016)', formatEur(pnrr.limiteMassimoPnrrFondoDirigenza), 'Escluso (Art. 23 c. 2)', 'Fondo dirigenza (parte variabile PNRR)']);
      }
      wsSummary.addRow(['6. PNRR', 'Totale massimo teorico PNRR', formatEur(pnrr.totaleLimiteMassimoPnrr), 'Escluso (Art. 23 c. 2)', 'Totale capacità PNRR accessoria']);
    } else {
      wsSummary.addRow(['6. PNRR', 'Fondi PNRR (non applicabile)', 'Non applicabile', '-', 'L\'ente non è soggetto attuatore o l\'anno non è nel triennio PNRR']);
    }

    // Applica stili a tutte le righe del riepilogo
    wsSummary.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell(cell => {
        cell.font = { name: 'Arial', size: 10 };
        cell.border = borderStyle;
      });
      // Allineamento grigio per la prima colonna (sezione)
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      row.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    });
  }

  // ── 4. DOWNLOAD DEL FILE EXCEL ───────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = state
    ? `Dati_Wizard_FRD2026_${denominazioneEnte.replace(/\s+/g, '_')}_${annoRiferimento}.xlsx`
    : `Template_Wizard_FRD2026_Vuoto.xlsx`;
  saveAs(blob, filename);
};
