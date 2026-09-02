import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportWizard2026Excel } from '../exportWizard2026Excel';
import { importWizard2026Excel } from '../importWizard2026Excel';
import { initialWizard2026DraftState } from '../../initialState';
import { Wizard2026DraftState } from '../../types';
import { wizard2026Reducer } from '../../reducer';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('Wizard 2026 Excel Export/Import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Export Excel', () => {
    it('1. Genera ed esporta il template Excel vuoto', async () => {
      await exportWizard2026Excel(null, 'Ente Test', 2026);
      expect(saveAs).toHaveBeenCalledTimes(1);
      
      const [blob, filename] = (saveAs as any).mock.calls[0];
      expect(filename).toBe('Template_Wizard_FRD2026_Vuoto.xlsx');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('2. Genera ed esporta i dati correnti compilati con foglio riepilogo', async () => {
      const state = {
        ...initialWizard2026DraftState,
        ente: {
          ...initialWizard2026DraftState.ente,
          denominazioneEnte: 'Comune di Prova',
          annoRiferimento: 2026,
        },
        ccnl2026: {
          monteSalari2021: 1000000,
          result: {
            isCalcolabile: true,
            incrementoStabile014: 1400,
            arretrati014: 2800,
            incremento014Fondo: 1400,
            incremento014EQ: 0,
            arretrati014Fondo: 2800,
            arretrati014EQ: 0,
          } as any,
          checks: [],
        },
      };

      await exportWizard2026Excel(state, 'Comune di Prova', 2026);
      expect(saveAs).toHaveBeenCalledTimes(1);
      
      const [blob, filename] = (saveAs as any).mock.calls[0];
      expect(filename).toBe('Dati_Wizard_FRD2026_Comune_di_Prova_2026.xlsx');
      expect(blob).toBeInstanceOf(Blob);
      expect(state.ccnl2026.result.incremento014Fondo).toBe(1400);
      expect(state.ccnl2026.result.incremento014EQ).toBe(0);
    });

    it('3. Esporta PROVINCIA e territorialContext con etichetta leggibile', async () => {
      const state = {
        ...initialWizard2026DraftState,
        ente: {
          ...initialWizard2026DraftState.ente,
          denominazioneEnte: 'Provincia di Test',
          annoRiferimento: 2026,
          entityType: 'PROVINCIA' as const,
          territorialContext: 'ORDINARY_REGIME' as const,
        },
      };

      await exportWizard2026Excel(state, 'Provincia di Test', 2026);
      expect(saveAs).toHaveBeenCalledTimes(1);

      const [blob, filename] = (saveAs as any).mock.calls[0];
      expect(filename).toBe('Dati_Wizard_FRD2026_Provincia_di_Test_2026.xlsx');

      const arrayBuffer = await blob.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = wb.Sheets['Dati Ente'];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const territorialRow = rows.find((r: any[]) => r[4] === 'ente.territorialContext');
      expect(territorialRow).toBeDefined();
      expect(territorialRow?.[2]).toBe('Regime ordinario');
    });

    it('4. Esporta art33ManualDecision con etichetta leggibile', async () => {
      const state: Wizard2026DraftState = {
        ...initialWizard2026DraftState,
        ente: {
          ...initialWizard2026DraftState.ente,
          entityType: 'ALTRO',
          art33ManualDecision: 'APPLY',
        },
      };

      await exportWizard2026Excel(state, 'Altro Ente', 2026);
      expect(saveAs).toHaveBeenCalledTimes(1);

      const [blob] = (saveAs as any).mock.calls[0];
      const arrayBuffer = await blob.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = wb.Sheets['Dati Ente'];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const decisionRow = rows.find((r: any[]) => r[4] === 'ente.art33ManualDecision');
      expect(decisionRow).toBeDefined();
      expect(decisionRow?.[2]).toBe("Applicare l'adeguamento Art. 33");
    });
  });

  describe('Import Excel', () => {
    // Helper per creare un file Excel mockato
    const createMockExcelFile = (sheetsData: Record<string, any[][]>): File => {
      const wb = XLSX.utils.book_new();
      Object.entries(sheetsData).forEach(([sheetName, rows]) => {
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return new File([wbout], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    };

    it('1. Rifiuta file con fogli mancanti', async () => {
      const file = createMockExcelFile({
        'Foglio Casuale': [['A', 'B'], [1, 2]]
      });

      const res = await importWizard2026Excel(file);
      expect(res.success).toBe(false);
      expect(res.errors.length).toBeGreaterThan(0);
      expect(res.errors[0]).toContain('Il file Excel non è valido. Mancano i seguenti fogli necessari');
    });

    it('2. Importa correttamente dati da un file Excel compilato valido', async () => {
      // Popoliamo i fogli richiesti nello schema
      const sheetsData: Record<string, any[][]> = {
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Denominazione', 'Obbligatorio', 'Comune di Test Import', 'Note', 'ente.denominazioneEnte'],
          ['Anno', 'Obbligatorio', 2026, 'Note', 'ente.annoRiferimento'],
          ['Tipologia', 'Obbligatorio', 'Comune', 'Note', 'ente.entityType'],
          ['Dirigenza', 'Obbligatorio', 'No', 'Note', 'ente.hasDirigenza'],
          ['Dissesto', 'Obbligatorio', 'No', 'Note', 'ente.isDissesto'],
          ['Deficitario', 'Obbligatorio', 'No', 'Note', 'ente.isStrutturalmenteDeficitario'],
          ['Piano Riequilibrio', 'Obbligatorio', 'No', 'Note', 'ente.isPianoRiequilibrio'],
          ['Equilibrio asseverato', 'Obbligatorio', 'Sì', 'Note', 'ente.isEquilibrioPluriennaleAsseverato'],
        ],
        'Art. 23 Limite': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Limite 2016', 'Obbligatorio', 120000.50, 'Note', 'art23.limite2016CertificatoEnte'],
          ['Usa manuale dipendenti', 'Obbligatorio', 'No', 'Note', 'art23.usaCalcoloManualePersonaleArt23'],
        ],
        'D.L. 25-2025': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Tabellari 2023', 'Obbligatorio', 500000, 'Note', 'dl25.stipendiTabellari2023NonDirigenti'],
          ['Fondo Stabile 2025', 'Obbligatorio', 40000, 'Note', 'dl25.fondoStabile2025Certificato'],
          ['Budget EQ 2025', 'Obbligatorio', 10000, 'Note', 'dl25.budgetEq2025'],
        ],
        'CCNL 2026': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['MS 2021', 'Obbligatorio', 1000000, 'Note', 'ccnl2026.monteSalari2021'],
          ['FRD 2024', 'Obbligatorio', 45000, 'Note', 'ccnl2026.fondoRisorseDecentrate2024'],
          ['EQ 2024', 'Obbligatorio', 8000, 'Note', 'ccnl2026.risorseEQ2024'],
        ],
        'Conglobamento Art. 60': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Mode', 'Obbligatorio', 'guided', 'Note', 'conglobamentoArt60.mode'],
          ['Intero Istruttori', 'Opzionale', 5, 'Note', 'conglobamentoArt60.personaleInteroArea.ISTRUTTORE'],
          ['Trasformati Istruttori', 'Opzionale', 2, 'Note', 'conglobamentoArt60.fullTimeTrasformatoPartTime.ISTRUTTORE'],
          ['Part-time nativi Istruttori', 'Opzionale', 1.5, 'Note', 'conglobamentoArt60.partTimeNativoFte.ISTRUTTORE'],
        ],
        'Straordinario': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Straordinario Corrente', 'Obbligatorio', 15000, 'Note', 'straordinario.fondoStraordinarioOrdinarioAnnoCorrente'],
        ],
        'PNRR': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Soggetto PNRR', 'Obbligatorio', 'No', 'Note', 'pnrr.soggettoAttuatorePnrr'],
          ['Fondo dipendenti 2016', 'Obbligatorio', 30000, 'Note', 'pnrr.componenteStabileFondoDipendenti2016'],
          ['Equilibrio precedente', 'Obbligatorio', 'Sì', 'Note', 'pnrr.equilibrioEsercizioPrecedente'],
          ['Debito commerciale', 'Obbligatorio', 'Sì', 'Note', 'pnrr.parametriDebitoCommercialeEsercizioPrecedente'],
          ['Scelta incidenza', 'Obbligatorio', 'diretto', 'Note', 'pnrr.incidenzaSalarioAccessorioScelta'],
          ['Approvato in termini', 'Obbligatorio', 'Sì', 'Note', 'pnrr.rendicontoApprovatoTermini'],
        ],
      };

      const file = createMockExcelFile(sheetsData);
      const res = await importWizard2026Excel(file);

      expect(res.success).toBe(true);
      expect(res.errors.length).toBe(0);
      expect(res.importedCount).toBeGreaterThan(0);
      expect(res.resultState.ente?.denominazioneEnte).toBe('Comune di Test Import');
      expect(res.resultState.ente?.annoRiferimento).toBe(2026);
      expect(res.resultState.ente?.entityType).toBe('COMUNE');
      expect(res.resultState.ente?.hasDirigenza).toBe(false);
      expect(res.resultState.art23?.limite2016CertificatoEnte).toBe(120000.50);
      expect(res.resultState.pnrr?.soggettoAttuatorePnrr).toBe(false);
      
      // Verifiche speciali Conglobamento
      expect(res.resultState.conglobamentoArt60?.personaleInteroArea?.ISTRUTTORE).toBe(7); // 5 + 2
      expect(res.resultState.conglobamentoArt60?.partTimeNativi?.length).toBe(1);
      expect(res.resultState.conglobamentoArt60?.partTimeNativi?.[0].numeroDipendenti).toBe(1.5);
      expect(res.resultState.conglobamentoArt60?.partTimeNativi?.[0].percentualePartTime).toBe(100);
      expect(res.resultState.conglobamentoArt60?.partTimeNativi?.[0].area).toBe('ISTRUTTORE');
    });

    it('3. Rileva errori di formato per dati non corretti', async () => {
      const sheetsData: Record<string, any[][]> = {
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Denominazione', 'Obbligatorio', 'Comune di Test Error', 'Note', 'ente.denominazioneEnte'],
          ['Anno', 'Obbligatorio', 'TESTO_NON_VALIDO', 'Note', 'ente.annoRiferimento'],
          ['Tipologia', 'Obbligatorio', 'TipologiaInesistente', 'Note', 'ente.entityType'],
          ['Dirigenza', 'Obbligatorio', 'Forse', 'Note', 'ente.hasDirigenza'],
          ['Dissesto', 'Obbligatorio', 'No', 'Note', 'ente.isDissesto'],
          ['Deficitario', 'Obbligatorio', 'No', 'Note', 'ente.isStrutturalmenteDeficitario'],
          ['Piano Riequilibrio', 'Obbligatorio', 'No', 'Note', 'ente.isPianoRiequilibrio'],
          ['Equilibrio asseverato', 'Obbligatorio', 'Sì', 'Note', 'ente.isEquilibrioPluriennaleAsseverato'],
        ],
        'Art. 23 Limite': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Limite 2016', 'Obbligatorio', 120000.50, 'Note', 'art23.limite2016CertificatoEnte'],
          ['Usa manuale dipendenti', 'Obbligatorio', 'No', 'Note', 'art23.usaCalcoloManualePersonaleArt23'],
        ],
        'D.L. 25-2025': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Tabellari 2023', 'Obbligatorio', 500000, 'Note', 'dl25.stipendiTabellari2023NonDirigenti'],
          ['Fondo Stabile 2025', 'Obbligatorio', 40000, 'Note', 'dl25.fondoStabile2025Certificato'],
          ['Budget EQ 2025', 'Obbligatorio', 10000, 'Note', 'dl25.budgetEq2025'],
        ],
        'CCNL 2026': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['MS 2021', 'Obbligatorio', 1000000, 'Note', 'ccnl2026.monteSalari2021'],
          ['FRD 2024', 'Obbligatorio', 45000, 'Note', 'ccnl2026.fondoRisorseDecentrate2024'],
          ['EQ 2024', 'Obbligatorio', 8000, 'Note', 'ccnl2026.risorseEQ2024'],
        ],
        'Conglobamento Art. 60': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Mode', 'Obbligatorio', 'guided', 'Note', 'conglobamentoArt60.mode'],
        ],
        'Straordinario': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Straordinario Corrente', 'Obbligatorio', 15000, 'Note', 'straordinario.fondoStraordinarioOrdinarioAnnoCorrente'],
        ],
        'PNRR': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Soggetto PNRR', 'Obbligatorio', 'No', 'Note', 'pnrr.soggettoAttuatorePnrr'],
          ['Fondo dipendenti 2016', 'Obbligatorio', 30000, 'Note', 'pnrr.componenteStabileFondoDipendenti2016'],
          ['Equilibrio precedente', 'Obbligatorio', 'Sì', 'Note', 'pnrr.equilibrioEsercizioPrecedente'],
          ['Debito commerciale', 'Obbligatorio', 'Sì', 'Note', 'pnrr.parametriDebitoCommercialeEsercizioPrecedente'],
          ['Scelta incidenza', 'Obbligatorio', 'diretto', 'Note', 'pnrr.incidenzaSalarioAccessorioScelta'],
          ['Approvato in termini', 'Obbligatorio', 'Sì', 'Note', 'pnrr.rendicontoApprovatoTermini'],
        ],
      };

      const file = createMockExcelFile(sheetsData);
      const res = await importWizard2026Excel(file);

      expect(res.success).toBe(false);
      expect(res.errors.length).toBe(3);
      expect(res.errors[0]).toContain('Valore non valido per il campo "Anno di Riferimento Istruttoria"');
      expect(res.errors[1]).toContain('Valore non valido per il campo "Qualificazione Giuridica (Tipologia Ente)"');
      expect(res.errors[2]).toContain('Valore non valido per il campo "Presenza della Dirigenza"');
    });

    it('4. Importa correttamente territorialContext da etichette Excel (ordinario, Sicilia, sconosciuto)', async () => {
      // Caso B: Regime ordinario
      const fileOrd = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Tipologia', 'Obbligatorio', 'Provincia', 'Note', 'ente.entityType'],
          ['Regime territoriale', 'Opzionale', 'Regime ordinario', 'Note', 'ente.territorialContext'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resOrd = await importWizard2026Excel(fileOrd);
      expect(resOrd.resultState.ente?.entityType).toBe('PROVINCIA');
      expect(resOrd.resultState.ente?.territorialContext).toBe('ORDINARY_REGIME');

      // Caso C: Sicilia
      const fileSicilia = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Tipologia', 'Obbligatorio', 'Provincia', 'Note', 'ente.entityType'],
          ['Regime territoriale', 'Opzionale', 'Ente di area vasta della Regione Siciliana', 'Note', 'ente.territorialContext'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resSicilia = await importWizard2026Excel(fileSicilia);
      expect(resSicilia.resultState.ente?.territorialContext).toBe('SICILIAN_AREA_VASTA');

      // Caso D: Valore sconosciuto -> errore di formato
      const fileErr = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Tipologia', 'Obbligatorio', 'Provincia', 'Note', 'ente.entityType'],
          ['Regime territoriale', 'Opzionale', 'Regime Non Esistente', 'Note', 'ente.territorialContext'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resErr = await importWizard2026Excel(fileErr);
      expect(resErr.errors.some(e => e.includes('Regime territoriale ai fini Art. 33'))).toBe(true);
      expect(resErr.resultState.ente?.territorialContext).toBeUndefined();
    });

    it('5. Importa correttamente art33ManualDecision da etichette Excel (APPLY, DO_NOT_APPLY, sconosciuto)', async () => {
      // Caso A: APPLY
      const fileApply = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Tipologia', 'Obbligatorio', 'Altra Tipologia (Verifica Manuale)', 'Note', 'ente.entityType'],
          ['Decisione manuale', 'Opzionale', "Applicare l'adeguamento Art. 33", 'Note', 'ente.art33ManualDecision'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resApply = await importWizard2026Excel(fileApply);
      expect(resApply.resultState.ente?.entityType).toBe('ALTRO');
      expect(resApply.resultState.ente?.art33ManualDecision).toBe('APPLY');

      // Caso B: DO_NOT_APPLY
      const fileDoNotApply = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Tipologia', 'Obbligatorio', 'Altra Tipologia (Verifica Manuale)', 'Note', 'ente.entityType'],
          ['Decisione manuale', 'Opzionale', "Non applicare l'adeguamento Art. 33", 'Note', 'ente.art33ManualDecision'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resDoNotApply = await importWizard2026Excel(fileDoNotApply);
      expect(resDoNotApply.resultState.ente?.art33ManualDecision).toBe('DO_NOT_APPLY');

      // Caso C: Valore sconosciuto -> errore di formato
      const fileErr = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Tipologia', 'Obbligatorio', 'Altra Tipologia (Verifica Manuale)', 'Note', 'ente.entityType'],
          ['Decisione manuale', 'Opzionale', 'Scelta Non Valida', 'Note', 'ente.art33ManualDecision'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resErr = await importWizard2026Excel(fileErr);
      expect(resErr.errors.some(e => e.includes('Decisione manuale applicabilità Art. 33'))).toBe(true);
      expect(resErr.resultState.ente?.art33ManualDecision).toBeUndefined();
    });

    it('6. Post-processing semantico art33ManualDecision: rimuove la decisione se non è richiesta verifica manuale e la preserva se necessaria', async () => {
      // Caso A: COMUNE 2026 (DIRECTLY_APPLICABLE) con APPLY -> rimosso con warning, success=true
      const fileComune = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Anno', 'Obbligatorio', 2026, 'Note', 'ente.annoRiferimento'],
          ['Tipologia', 'Obbligatorio', 'Comune', 'Note', 'ente.entityType'],
          ['Decisione manuale', 'Opzionale', "Applicare l'adeguamento Art. 33", 'Note', 'ente.art33ManualDecision'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resComune = await importWizard2026Excel(fileComune);
      expect(resComune.success).toBe(true);
      expect(resComune.resultState.ente?.entityType).toBe('COMUNE');
      expect(resComune.resultState.ente?.art33ManualDecision).toBeUndefined();
      expect(resComune.warnings.some(w => w.includes("La decisione manuale sull'applicabilità dell'Art. 33 è stata ignorata"))).toBe(true);

      // Caso B: UNIONE_COMUNI (NOT_DIRECTLY_APPLICABLE) con DO_NOT_APPLY -> rimosso con warning
      const fileUnione = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Anno', 'Obbligatorio', 2026, 'Note', 'ente.annoRiferimento'],
          ['Tipologia', 'Obbligatorio', 'Unione di Comuni', 'Note', 'ente.entityType'],
          ['Decisione manuale', 'Opzionale', "Non applicare l'adeguamento Art. 33", 'Note', 'ente.art33ManualDecision'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resUnione = await importWizard2026Excel(fileUnione);
      expect(resUnione.success).toBe(true);
      expect(resUnione.resultState.ente?.entityType).toBe('UNIONE_COMUNI');
      expect(resUnione.resultState.ente?.art33ManualDecision).toBeUndefined();
      expect(resUnione.warnings.some(w => w.includes("La decisione manuale sull'applicabilità dell'Art. 33 è stata ignorata"))).toBe(true);

      // Caso C: ALTRO (NEEDS_MANUAL_REVIEW) con APPLY -> preservato, nessun warning
      const fileAltro = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Anno', 'Obbligatorio', 2026, 'Note', 'ente.annoRiferimento'],
          ['Tipologia', 'Obbligatorio', 'Altra Tipologia (Verifica Manuale)', 'Note', 'ente.entityType'],
          ['Decisione manuale', 'Opzionale', "Applicare l'adeguamento Art. 33", 'Note', 'ente.art33ManualDecision'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resAltro = await importWizard2026Excel(fileAltro);
      expect(resAltro.success).toBe(true);
      expect(resAltro.resultState.ente?.entityType).toBe('ALTRO');
      expect(resAltro.resultState.ente?.art33ManualDecision).toBe('APPLY');
      expect(resAltro.warnings.some(w => w.includes("La decisione manuale"))).toBe(false);

      // Caso D: PROVINCIA senza territorialContext (NEEDS_MANUAL_REVIEW) con APPLY -> preservato
      const fileProvincia = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Anno', 'Obbligatorio', 2026, 'Note', 'ente.annoRiferimento'],
          ['Tipologia', 'Obbligatorio', 'Provincia', 'Note', 'ente.entityType'],
          ['Decisione manuale', 'Opzionale', "Applicare l'adeguamento Art. 33", 'Note', 'ente.art33ManualDecision'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resProvincia = await importWizard2026Excel(fileProvincia);
      expect(resProvincia.success).toBe(true);
      expect(resProvincia.resultState.ente?.entityType).toBe('PROVINCIA');
      expect(resProvincia.resultState.ente?.art33ManualDecision).toBe('APPLY');
      expect(resProvincia.warnings.some(w => w.includes("La decisione manuale"))).toBe(false);

      // Caso E: entityType assente -> rimosso con warning specifico
      const fileNoType = createMockExcelFile({
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Anno', 'Obbligatorio', 2026, 'Note', 'ente.annoRiferimento'],
          ['Decisione manuale', 'Opzionale', "Applicare l'adeguamento Art. 33", 'Note', 'ente.art33ManualDecision'],
        ],
        'Art. 23 Limite': [['Header']],
        'D.L. 25-2025': [['Header']],
        'CCNL 2026': [['Header']],
        'Conglobamento Art. 60': [['Header']],
        'Straordinario': [['Header']],
        'PNRR': [['Header']],
      });

      const resNoType = await importWizard2026Excel(fileNoType);
      expect(resNoType.resultState.ente?.art33ManualDecision).toBeUndefined();
      expect(resNoType.warnings.some(w => w.includes("manca la tipologia dell'ente"))).toBe(true);
    });

    it('Test K — EXCEL LEGACY BOUNDARY: Excel scalar FTE import generates legacy fallback draft with empty analytic arrays (LEGACY COMPATIBILITY BOUNDARY)', async () => {
      const sheetsData: Record<string, any[][]> = {
        'Dati Ente': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Denominazione', 'Obbligatorio', 'Comune di Test Import', 'Note', 'ente.denominazioneEnte'],
          ['Anno', 'Obbligatorio', 2026, 'Note', 'ente.annoRiferimento'],
          ['Tipologia', 'Obbligatorio', 'Comune', 'Note', 'ente.entityType'],
          ['Dirigenza', 'Obbligatorio', 'No', 'Note', 'ente.hasDirigenza'],
          ['Dissesto', 'Obbligatorio', 'No', 'Note', 'ente.isDissesto'],
          ['Deficitario', 'Obbligatorio', 'No', 'Note', 'ente.isStrutturalmenteDeficitario'],
          ['Piano Riequilibrio', 'Obbligatorio', 'No', 'Note', 'ente.isPianoRiequilibrio'],
          ['Equilibrio asseverato', 'Obbligatorio', 'Sì', 'Note', 'ente.isEquilibrioPluriennaleAsseverato'],
        ],
        'Art. 23 Limite': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Limite 2016', 'Obbligatorio', 120000.50, 'Note', 'art23.limite2016CertificatoEnte'],
          ['Usa manuale dipendenti', 'Obbligatorio', 'No', 'Note', 'art23.usaCalcoloManualePersonaleArt23'],
          ['Personale 31/12/2018', 'Opzionale', 1, 'Note', 'art23.personaleServizio31122018'],
          ['Personale 2026 PIAO', 'Opzionale', 2, 'Note', 'art23.personalePrevisto2026Piao'],
        ],
        'D.L. 25-2025': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Tabellari 2023', 'Obbligatorio', 500000, 'Note', 'dl25.stipendiTabellari2023NonDirigenti'],
          ['Fondo Stabile 2025', 'Obbligatorio', 40000, 'Note', 'dl25.fondoStabile2025Certificato'],
          ['Budget EQ 2025', 'Obbligatorio', 10000, 'Note', 'dl25.budgetEq2025'],
        ],
        'CCNL 2026': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['MS 2021', 'Obbligatorio', 1000000, 'Note', 'ccnl2026.monteSalari2021'],
          ['FRD 2024', 'Obbligatorio', 45000, 'Note', 'ccnl2026.fondoRisorseDecentrate2024'],
          ['EQ 2024', 'Obbligatorio', 8000, 'Note', 'ccnl2026.risorseEQ2024'],
        ],
        'Conglobamento Art. 60': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Mode', 'Obbligatorio', 'guided', 'Note', 'conglobamentoArt60.mode'],
        ],
        'Straordinario': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Straordinario Corrente', 'Obbligatorio', 15000, 'Note', 'straordinario.fondoStraordinarioOrdinarioAnnoCorrente'],
        ],
        'PNRR': [
          ['PARAMETRO', 'TIPO CELLA', 'VALORE DA COMPILARE', 'NOTE', 'CHIAVE TECNICA (NASCOSTA)'],
          ['Soggetto PNRR', 'Obbligatorio', 'No', 'Note', 'pnrr.soggettoAttuatorePnrr'],
          ['Fondo dipendenti 2016', 'Obbligatorio', 30000, 'Note', 'pnrr.componenteStabileFondoDipendenti2016'],
          ['Equilibrio precedente', 'Obbligatorio', 'Sì', 'Note', 'pnrr.equilibrioEsercizioPrecedente'],
          ['Debito commerciale', 'Obbligatorio', 'Sì', 'Note', 'pnrr.parametriDebitoCommercialeEsercizioPrecedente'],
          ['Scelta incidenza', 'Obbligatorio', 'diretto', 'Note', 'pnrr.incidenzaSalarioAccessorioScelta'],
          ['Approvato in termini', 'Obbligatorio', 'Sì', 'Note', 'pnrr.rendicontoApprovatoTermini'],
        ],
      };

      const file = createMockExcelFile(sheetsData);
      const res = await importWizard2026Excel(file);

      expect(res.success).toBe(true);
      expect(res.resultState.art23?.usaCalcoloManualePersonaleArt23).toBe(false);
      expect(res.resultState.art23?.personaleServizio31122018).toBe(1);
      expect(res.resultState.art23?.personalePrevisto2026Piao).toBe(2);
      expect(res.resultState.art23?.manualDipendentiEquivalenti2018).toBeUndefined();
      expect(res.resultState.art23?.manualDipendentiEquivalenti2026).toBeUndefined();
      expect(res.resultState.art23?.personale2018Art23).toBeUndefined();
      expect(res.resultState.art23?.personale2026Art23).toBeUndefined();

      // 1. Applicazione al reducer su initial state (array vuoti preservati dal valore iniziale)
      const updatedState = wizard2026Reducer(initialWizard2026DraftState, {
        type: 'IMPORT_EXCEL_DATA',
        payload: res.resultState,
      });

      expect(updatedState.art23.usaCalcoloManualePersonaleArt23).toBe(false);
      expect(updatedState.art23.personaleServizio31122018).toBe(1);
      expect(updatedState.art23.personalePrevisto2026Piao).toBe(2);
      // Gli array vuoti derivano dal valore preesistente in initialWizard2026DraftState e non sono creati dall'import
      expect(updatedState.art23.personale2018Art23).toEqual([]);
      expect(updatedState.art23.personale2026Art23).toEqual([]);
      expect(updatedState.art23.manualDipendentiEquivalenti2018).toBeUndefined();
      expect(updatedState.art23.manualDipendentiEquivalenti2026).toBeUndefined();

      // 2. Applicazione al reducer con array analitici preesistenti
      const existingState = structuredClone(initialWizard2026DraftState);
      existingState.art23.personale2018Art23 = [
        { id: 'existing-2018', partTimePercentage: 50 }
      ];
      existingState.art23.personale2026Art23 = [
        {
          id: 'existing-2026',
          partTimePercentage: 50,
          cedoliniEmessi: 6
        }
      ];

      const mergedState = wizard2026Reducer(existingState, {
        type: 'IMPORT_EXCEL_DATA',
        payload: res.resultState,
      });

      expect(mergedState.art23.usaCalcoloManualePersonaleArt23).toBe(false);
      expect(mergedState.art23.personaleServizio31122018).toBe(1);
      expect(mergedState.art23.personalePrevisto2026Piao).toBe(2);
      // L'import Excel non cancella gli array analitici preesistenti se il payload li omette
      expect(mergedState.art23.personale2018Art23).toHaveLength(1);
      expect(mergedState.art23.personale2018Art23?.[0].id).toBe('existing-2018');
      expect(mergedState.art23.personale2026Art23).toHaveLength(1);
      expect(mergedState.art23.personale2026Art23?.[0].id).toBe('existing-2026');

      // CLASSIFICAZIONE: LEGACY EXCEL MERGE BOUNDARY — SCALAR LEGACY IMPORT DOES NOT CLEAR PREEXISTING ANALYTIC ARRAYS
    });
  });
});
