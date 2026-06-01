import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Wizard2026DraftState } from '../../types';
import { buildWizard2026LetterContext } from '../buildWizard2026LetterContext';
import { generateWizard2026DataRequestMarkdown } from '../generateWizard2026DataRequestMarkdown';
import { generateWizard2026DataRequestPdf } from '../generateWizard2026DataRequestPdf';
import { Wizard2026DataRequestPanel } from '../components/Wizard2026DataRequestPanel';
import { Wizard2026DataRequestModal } from '../components/Wizard2026DataRequestModal';

// Mock di jsPDF
const mockJsPDFInstance = {
  setFont: vi.fn(),
  setFontSize: vi.fn(),
  setTextColor: vi.fn(),
  setDrawColor: vi.fn(),
  setFillColor: vi.fn(),
  setLineWidth: vi.fn(),
  line: vi.fn(),
  circle: vi.fn(),
  rect: vi.fn(),
  text: vi.fn(),
  addPage: vi.fn(),
  splitTextToSize: vi.fn((txt) => typeof txt === 'string' ? txt.split('\n') : [txt]),
  save: vi.fn(),
  getNumberOfPages: vi.fn().mockReturnValue(1),
  setPage: vi.fn(),
  getTextWidth: vi.fn().mockReturnValue(10),
};

vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => mockJsPDFInstance),
  };
});

const createMockState = (overrides: Partial<Wizard2026DraftState> = {}): Wizard2026DraftState => {
  return {
    meta: {
      currentStep: 1,
      completedSteps: [],
      isPreviewMode: true,
      canTransferToLegacy: false,
    },
    ente: {
      entityType: 'COMUNE',
      denominazioneEnte: 'Comune di Test',
      annoRiferimento: 2026,
      hasDirigenza: false,
      isDissesto: false,
      isStrutturalmenteDeficitario: false,
      isPianoRiequilibrio: false,
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
    },
    art23: {
      fondoPersonaleDipendente2016: 100000,
      fondoEqPo2016: 20000,
      risorseSoggetteAttuali: 110000,
      risorseEscluseAttuali: 5000,
      checks: [],
    },
    dl25: {
      stipendiTabellari2023NonDirigenti: 500000,
      fondoStabile2025Certificato: 110000,
      budgetEq2025: 15000,
      incrementoApplicato: 5000,
      checks: [],
    },
    ccnl2026: {
      monteSalari2021: 1000000,
      applicaIncremento022: true,
      percentualeApplicata022: 0.22,
      checks: [],
    },
    conglobamentoArt60: {
      mode: 'guided',
      personaleInteroArea: {},
      partTimeNativi: [],
      ftePerArea: {
        FUNZIONARIO_EQ: 5,
        ISTRUTTORE: 10,
      },
      checks: [],
    },
    straordinario: {
      fondoStraordinario2016: 15000,
      fondoStraordinarioAnnoCorrente: 12000,
      checks: [],
    },
    pnrr: {
      incrementoApplicato: 0, // Regola 2: lo 0 è PRESENTE
      enteInEquilibrio: true,
      requisitiVerificati: true,
      checks: [],
    },
    riepilogo: {
      totaleErrori: 0,
      totaleWarning: 0,
      totaleInfo: 0,
      readyForPreview: true,
      readyForFutureTransfer: false,
    },
    ...overrides,
  };
};

describe('Modulo Lettera Richiesta Dati 2026', () => {
  describe('buildWizard2026LetterContext', () => {
    it('dovrebbe includere correttamente i dati presenti e identificare zeri e booleani false come PRESENTE', () => {
      const state = createMockState({
        pnrr: {
          soggettoAttuatorePnrr: true,
          componenteStabileFondoDipendenti2016: 0, // zero numerico
          equilibrioEsercizioPrecedente: false, // booleano false
          checks: [],
        },
      });

      const context = buildWizard2026LetterContext(state, { mode: 'FULL' });
      
      const dipField = context.allFields.find(f => f.catalogItem.field === 'pnrr.componenteStabileFondoDipendenti2016');
      expect(dipField).toBeDefined();
      expect(dipField?.status).toBe('PRESENTE');
      expect(dipField?.valueString).toContain('0,00');

      const eqField = context.allFields.find(f => f.catalogItem.field === 'pnrr.equilibrioEsercizioPrecedente');
      expect(eqField).toBeDefined();
      expect(eqField?.status).toBe('PRESENTE');
      expect(eqField?.valueString).toBe('No');
    });

    it('dovrebbe impostare MANCANTE per valori undefined, null o stringa vuota', () => {
      const state = createMockState({
        art23: {
          fondoPersonaleDipendente2016: undefined,
          fondoEqPo2016: 20000,
          risorseSoggetteAttuali: 110000,
          risorseEscluseAttuali: 5000,
          checks: [],
        },
      });

      const context = buildWizard2026LetterContext(state, { mode: 'FULL' });
      const f2016 = context.allFields.find(f => f.catalogItem.field === 'art23.fondoPersonaleDipendente2016');
      expect(f2016?.status).toBe('MANCANTE');
      expect(f2016?.valueString).toBe('Da richiedere');
    });

    it('dovrebbe gestire la non applicabilità del D.L. 25 per tipologie ente escluse (es. CAMERA_COMMERCIO)', () => {
      const state = createMockState();
      state.ente.entityType = 'CAMERA_COMMERCIO';

      const context = buildWizard2026LetterContext(state, { mode: 'FULL' });
      const dl25Field = context.allFields.find(f => f.catalogItem.field === 'dl25.stipendiTabellari2023NonDirigenti');
      expect(dl25Field?.status).toBe('NON_APPLICABILE');
    });

    it('dovrebbe contrassegnare DA_VERIFICARE se ci sono anomalie/checks associati', () => {
      const state = createMockState({
        art23: {
          fondoPersonaleDipendente2016: 100000,
          fondoEqPo2016: 20000,
          risorseSoggetteAttuali: 110000,
          risorseEscluseAttuali: 5000,
          checks: [
            {
              id: 'ERR-LIMIT',
              severity: 'error',
              step: 'Step 2 — Limite Art. 23',
              message: 'Superamento del limite storico',
              field: 'fondoPersonaleDipendente2016',
            }
          ],
        },
      });

      const context = buildWizard2026LetterContext(state, { mode: 'FULL' });
      const f2016 = context.allFields.find(f => f.catalogItem.field === 'art23.fondoPersonaleDipendente2016');
      expect(f2016?.status).toBe('DA_VERIFICARE');
    });
  });

  describe('generateWizard2026DataRequestMarkdown', () => {
    it('dovrebbe produrre testo markdown con oggetto corretto ed intestazioni formali', () => {
      const state = createMockState();
      const context = buildWizard2026LetterContext(state, {
        mode: 'FULL',
        destinatario: 'Ufficio Risorse Umane',
        firmatario: 'Il Segretario CGIL',
      });

      const markdown = generateWizard2026DataRequestMarkdown(context);
      expect(markdown).toContain('Richiesta dati e informazioni per la costituzione del Fondo risorse decentrate');
      expect(markdown).toContain('Ufficio Risorse Umane');
      expect(markdown).toContain('Il Segretario CGIL');
      expect(markdown).toContain('FP CGIL Lombardia');
    });
  });

  describe('Componente Wizard2026DataRequestPanel', () => {
    it('dovrebbe renderizzare l\'accordion sui dispositivi mobile ed esporre i bottoni corretti', () => {
      const state = createMockState();
      render(<Wizard2026DataRequestPanel state={state} stepId={1} />);

      // Su desktop/mobile
      expect(screen.getByText("Dati da richiedere all'Ente (Step 1)")).toBeInTheDocument();
      expect(screen.getByText("Richiesta Solo Step 1")).toBeInTheDocument();
      expect(screen.getByText("Richiesta Dati Mancanti")).toBeInTheDocument();
      expect(screen.getByText("Richiesta Dati Completa")).toBeInTheDocument();
    });
  });

  describe('Componente Wizard2026DataRequestModal', () => {
    it('dovrebbe visualizzare gli input compilabili e attivare l\'anteprima', () => {
      const state = createMockState();
      const onClose = vi.fn();
      render(
        <Wizard2026DataRequestModal
          isOpen={true}
          onClose={onClose}
          state={state}
          initialMode="FULL"
        />
      );

      expect(screen.getByText('Generatore Lettera Richiesta Dati')).toBeInTheDocument();
      expect(screen.getByLabelText('Destinatario')).toBeInTheDocument();
      expect(screen.getByLabelText('Firmatario')).toBeInTheDocument();
      
      const closeBtn = screen.getAllByRole('button', { name: 'Chiudi' })[0];
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it('dovrebbe includere correttamente i campi dello straordinario (Step 6) nel catalogo e nella generazione della lettera', () => {
      const state = createMockState({
        straordinario: {
          riduzioneStabileStraordinarioArt67: 1500,
          fondoStraordinarioOrdinarioAnnoCorrente: 12000,
          incrementoStraordinarioOrdinarioProposto: undefined,
          quotaFinanziataConCapienzaArt23: undefined,
          quotaFinanziataConRiduzioneFondo: undefined,
          contrattazioneIntegrativaRiduzioneFondo: undefined,
          stanziamentoStraordinarioOrdinarioAnnoPrecedente: 10000,
          spesaStraordinarioOrdinarioAnnoPrecedente: 9000,
          economieStraordinarioCertificate: undefined,
          risorseEscluse: [],
          checks: [],
        },
      });

      const context = buildWizard2026LetterContext(state, { mode: 'FULL' });
      
      const fRiduzione = context.allFields.find(f => f.catalogItem.field === 'straordinario.riduzioneStabileStraordinarioArt67');
      expect(fRiduzione).toBeDefined();
      expect(fRiduzione?.status).toBe('PRESENTE');
      expect(fRiduzione?.valueString?.replace(/\./g, '')).toContain('1500,00');

      const fCorrente = context.allFields.find(f => f.catalogItem.field === 'straordinario.fondoStraordinarioOrdinarioAnnoCorrente');
      expect(fCorrente).toBeDefined();
      expect(fCorrente?.status).toBe('PRESENTE');
      expect(fCorrente?.valueString?.replace(/\./g, '')).toContain('12000,00');

      const fIncrProposto = context.allFields.find(f => f.catalogItem.field === 'straordinario.economieStraordinarioCertificate');
      expect(fIncrProposto).toBeDefined();
      expect(fIncrProposto?.status).toBe('MANCANTE');

      const fSpesaPrec = context.allFields.find(f => f.catalogItem.field === 'straordinario.spesaStraordinarioOrdinarioAnnoPrecedente');
      expect(fSpesaPrec).toBeDefined();
      expect(fSpesaPrec?.status).toBe('PRESENTE');
      expect(fSpesaPrec?.valueString?.replace(/\./g, '')).toContain('9000,00');
    });
  });

  describe('generateWizard2026DataRequestPdf', () => {
    it('dovrebbe generare il PDF senza errori e senza chiavi tecniche nel testo disegnato', async () => {
      vi.clearAllMocks();

      const state = createMockState({
        ente: {
          entityType: 'COMUNE',
          denominazioneEnte: 'Comune di Test',
          annoRiferimento: 2026,
          hasDirigenza: false,
          isDissesto: true,
          isStrutturalmenteDeficitario: false,
          isPianoRiequilibrio: false,
          isPrimaFasciaDl34: true,
          isEquilibrioPluriennaleAsseverato: true,
        }
      });

      const context = buildWizard2026LetterContext(state, {
        mode: 'MISSING_ONLY',
        destinatario: 'Dirigente Servizio Risorse Umane',
        firmatario: 'Il Rappresentante RSU',
        organizzazione: 'FP CGIL Lombardia',
      });

      await generateWizard2026DataRequestPdf(context);

      expect(mockJsPDFInstance.text).toHaveBeenCalled();

      const allTextCalls: string[] = [];
      mockJsPDFInstance.text.mock.calls.forEach((call: any) => {
        const textVal = call[0];
        if (typeof textVal === 'string') {
          allTextCalls.push(textVal);
        } else if (Array.isArray(textVal)) {
          allTextCalls.push(...textVal);
        }
      });

      const fullPdfText = allTextCalls.join(' ');

      const technicalKeys = [
        'incrementoStabile014',
        'arretrati014',
        'soggettoAttuatorePnrr',
        'quotaMassimaTrasferibile',
        'valoreConsolidato2026',
        'stipendiTabellari2023NonDirigenti',
        'spesaPersonaleRapportataEntrate',
        'componenteStabileFondoDipendenti2016'
      ];

      technicalKeys.forEach(key => {
        expect(fullPdfText).not.toContain(key);
      });

      expect(fullPdfText).toContain('Richiesta dati e informazioni per la costituzione del Fondo risorse decentrate anno 2026');
      expect(fullPdfText).toContain('Dirigente Servizio Risorse Umane');
      expect(fullPdfText).toContain('Il Rappresentante RSU');
      expect(fullPdfText).toContain('PRESIDI E AUTORIZZAZIONI COSFEL');
      expect(fullPdfText).toContain('Appendice contabile informativa');
    });
  });
});

