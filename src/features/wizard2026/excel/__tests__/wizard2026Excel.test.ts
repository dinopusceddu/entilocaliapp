import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportWizard2026Excel } from '../exportWizard2026Excel';
import { importWizard2026Excel } from '../importWizard2026Excel';
import { initialWizard2026DraftState } from '../../initialState';
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
