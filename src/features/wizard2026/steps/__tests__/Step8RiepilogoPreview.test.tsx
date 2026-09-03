import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Step8RiepilogoPreview } from '../Step8RiepilogoPreview';
import { initialWizard2026DraftState } from '../../initialState';
import { Wizard2026DraftState } from '../../types';

const mockDispatch = vi.fn();
const mockSaveState = vi.fn().mockResolvedValue(undefined);
const mockSetScopeAndTab = vi.fn();

const mockGlobalState = {
  currentUser: { id: 'user_test', email: 'test@example.com' },
  currentEntity: { id: 'entity_test', name: 'Ente Test' },
  currentYear: 2026,
  fundData: {
    historicalData: {},
    annualData: {
      personaleServizioAttuale: [],
      proventiSpecifici: [],
      ccnl2024: {}
    },
    fondoAccessorioDipendenteData: {}
  }
};

vi.mock('../../../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: mockGlobalState,
    dispatch: mockDispatch,
    saveState: mockSaveState,
    setScopeAndTab: mockSetScopeAndTab
  })
}));

describe('Step8RiepilogoPreview Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockDispatch.mockClear();
    mockSaveState.mockClear();
    mockSetScopeAndTab.mockClear();
  });
  it('1. Renders all 8 section titles correctly', () => {
    render(<Step8RiepilogoPreview state={initialWizard2026DraftState} />);

    expect(screen.getByText(/1\. Quadro generale dell'ente/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Limite Art\. 23, comma 2, D\.Lgs\. 75\/2017/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. D\.L\. 25\/2025/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Incrementi CCNL 23\.02\.2026/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Conglobamento indennità di comparto/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Fondo per il lavoro straordinario/i)).toBeInTheDocument();
    expect(screen.getByText(/7\. Incremento PNRR/i)).toBeInTheDocument();
    expect(screen.getByText(/8\. Esiti istruttori finali/i)).toBeInTheDocument();
  });

  it('2. Shows n/d for undefined metrics instead of 0 or € 0,00', () => {
    render(<Step8RiepilogoPreview state={initialWizard2026DraftState} />);

    // Nel nostro stato iniziale la maggior parte dei risultati è undefined.
    // Dobbiamo trovare "n/d" nei riquadri del limite storico, ad esempio.
    const ndElements = screen.getAllByText('n/d');
    expect(ndElements.length).toBeGreaterThan(0);
  });

  it('3. Does not expose internal technical mapping keys', () => {
    const { container } = render(<Step8RiepilogoPreview state={initialWizard2026DraftState} />);

    const technicalKeys = [
      'incrementoStabile014',
      'arretrati014',
      'incremento022Anno',
      'quotaFondo022',
      'quotaEQ022',
      'st_incrementoDL25_2025',
      'quotaTrasferitaAderentiDL25_2025'
    ];

    technicalKeys.forEach(key => {
      expect(container.innerHTML).not.toContain(key);
    });
  });

  it('4. Renders PNRR non-applicable message if not applicable', () => {
    const mockState: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      pnrr: {
        ...initialWizard2026DraftState.pnrr,
        result: {
          isApplicabile: false,
          isValidable: false,
          incrementoMassimoPnrr: 0,
          incrementoApplicato: 0,
          incrementoNonAmmesso: 0
        }
      }
    };

    render(<Step8RiepilogoPreview state={mockState} />);
    expect(screen.getByText(/Non applicabile \(l'ente non è soggetto attuatore PNRR\)/i)).toBeInTheDocument();
  });

  it('5. Renders PNRR limits when applicable and validable', () => {
    const mockState: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        hasDirigenza: true
      },
      pnrr: {
        ...initialWizard2026DraftState.pnrr,
        result: {
          isApplicabile: true,
          isValidable: true,
          limiteMassimoPnrrFondoDipendenti: 15000,
          limiteMassimoPnrrFondoDirigenza: 5000,
          totaleLimiteMassimoPnrr: 20000,
          incrementoMassimoPnrr: 20000,
          incrementoApplicato: 0,
          incrementoNonAmmesso: 0
        }
      }
    };

    render(<Step8RiepilogoPreview state={mockState} />);

    // Usa getAllByText perché gli stessi valori potrebbero comparire anche nella preview del trasferimento (Sezione 9)
    expect(screen.getAllByText(/15\.000,00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/5\.000,00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/20\.000,00/)[0]).toBeInTheDocument();
  });

  it('6. Does not show cumulative total between 0.14% and 0.22% CCNL increments', () => {
    const mockState: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ccnl2026: {
        ...initialWizard2026DraftState.ccnl2026,
        result: {
          isCalcolabile: true,
          isMs2021Consolidato: false,
          isSuperamentoLimite022: false,
          incrementoStabile014: 1400,
          arretrati014: 2800,
          limiteMassimo022: 2200,
          incremento022Anno: 1000,
          incremento022Fondo: 800,
          incremento022EQ: 200,
          incremento014: 1400,
          incremento022Massimo: 2200,
          incremento022Applicato: 1000
        }
      }
    };

    const { container } = render(<Step8RiepilogoPreview state={mockState} />);
    
    // Verifichiamo che i singoli importi siano presenti
    expect(screen.getAllByText(/(?<!\d)1[.]?400,00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/(?<!\d)2[.]?800,00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/(?<!\d)1[.]?000,00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/(?<!\d)800,00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/(?<!\d)200,00/)[0]).toBeInTheDocument();

    // Non ci deve essere la somma 1400 + 2800 + 1000 = 5200 o simili presentati come totale CCNL
    expect(container.innerHTML).not.toContain('€ 5.200,00');
    expect(container.innerHTML).not.toContain('€ 4.200,00');
  });

  it('7. Renders the transfer preview section and enabled button', () => {
    // Con stato trasferibile, il pulsante è abilitato
    const validDraftState: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'COMUNE',
        isPrimaFasciaDl34: true,
        isEquilibrioPluriennaleAsseverato: true,
      },
    };
    render(<Step8RiepilogoPreview state={validDraftState} />);

    const buttons = screen.getAllByRole('button');
    const transferBtn = buttons.find(b => b.textContent?.includes('Trasferisci i dati alla costituzione del fondo e compila'));
    expect(transferBtn).toBeDefined();
    expect(transferBtn).not.toBeDisabled();

    // Verifica la didascalia sotto il pulsante
    expect(screen.getByText(/Facendo clic su questo pulsante, si avvierà la procedura guidata di trasferimento dati, con anteprima dettagliata prima e dopo e salvataggio di uno snapshot di sicurezza per rollback\./i)).toBeInTheDocument();
  });

  it('8. Opens the transfer confirmation modal on button click when valid', async () => {
    const validDraftState: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'COMUNE',
        isPrimaFasciaDl34: true,
        isEquilibrioPluriennaleAsseverato: true,
      },
    };
    render(<Step8RiepilogoPreview state={validDraftState} />);
    
    const buttons = screen.getAllByRole('button');
    const transferBtn = buttons.find(b => b.textContent?.includes('Trasferisci i dati alla costituzione del fondo e compila'));
    expect(transferBtn).toBeDefined();
    
    // Click button to open modal
    fireEvent.click(transferBtn!);
    
    // Check that modal title is present
    expect(screen.getByText(/Conferma trasferimento alla Costituzione Fondo/i)).toBeInTheDocument();
    
    // Check that confirm button in modal is disabled initially (until checkbox checked)
    const modalConfirmBtn = screen.getByRole('button', { name: /Conferma e compila Costituzione Fondo/i });
    expect(modalConfirmBtn).toBeDisabled();
    
    // Click checkbox to consent
    const checkbox = screen.getByLabelText(/Confermo di aver verificato i dati istruttori e di voler trasferire i valori alla Costituzione Fondo\./i);
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox);
    
    // Now confirm button in modal should be enabled
    expect(modalConfirmBtn).not.toBeDisabled();
  });

  it('9. Disables Step 8 button and modal confirmation when blocking errors exist', () => {
    const blockedDraftState: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'COMUNE',
        isPrimaFasciaDl34: false, // Errore bloccante D.L. 25 quando applicato > 0
      },
      dl25: {
        ...initialWizard2026DraftState.dl25,
        incrementoApplicato: 10000,
      },
    };

    render(<Step8RiepilogoPreview state={blockedDraftState} />);

    // Il pulsante dello Step 8 deve risultare disabilitato
    const buttons = screen.getAllByRole('button');
    const transferBtn = buttons.find(b => b.textContent?.includes('Trasferisci i dati alla costituzione del fondo e compila'));
    expect(transferBtn).toBeDefined();
    expect(transferBtn).toBeDisabled();

    // Deve spiegare il motivo del blocco nella pagina
    expect(screen.getByText(/Impossibile trasferire: risolvi gli errori bloccanti prima di procedere/i)).toBeInTheDocument();
  });

  it('10. Allows transfer button when only warnings exist', () => {
    const warningDraftState: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'COMUNE',
        // Nessun errore bloccante, solo eventuali warning generali
      },
      dl25: {
        ...initialWizard2026DraftState.dl25,
        incrementoApplicato: 0, // 0 non blocca per requisiti mancanti
      },
    };

    render(<Step8RiepilogoPreview state={warningDraftState} />);

    // Dimostra la presenza effettiva del badge/stato di warning ("Richiede conferma")
    expect(screen.getByText(/Richiede conferma/i)).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    const transferBtn = buttons.find(b => b.textContent?.includes('Trasferisci i dati alla costituzione del fondo e compila'));
    expect(transferBtn).toBeDefined();
    expect(transferBtn).not.toBeDisabled();
  });

  it('11. Current wizard summary does NOT display legacy Art. 79 estimate or fondo stabile 2018', () => {
    const draftState: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      ente: {
        ...initialWizard2026DraftState.ente,
        entityType: 'COMUNE',
      },
      art23: {
        ...initialWizard2026DraftState.art23,
        result: {
          limite2016Base: 150000,
          fonteLimite2016: 'CERTIFICATO',
          totaleVoci2016Ricostruite: 150000,
          baseAccessorio2018ProCapite: 120000,
          valoreMedioProCapite2018: 12000,
          differenzaPersonale: 2,
          incrementoProCapiteLimite: 24000,
          limiteArt23Attualizzato: 174000,
          dipendentiEquivalenti2018: 10,
          dipendentiEquivalenti2026: 12,
          incrementoStabileAumentoPersonale: 0,
          fondoCertificatoParteStabile2018: 0,
          limiteArt23: 174000,
          limiteRicostruito2016: 150000,
          limiteCertificatoUtilizzato: true,
          risorseSoggetteAttuali: 0,
          risorseEscluseAttuali: 0,
          margineArt23: 0,
          superamentoArt23: 0,
        },
      },
    };

    render(<Step8RiepilogoPreview state={draftState} />);

    expect(screen.queryByText(/Stima istruttoria legacy incremento stabile/i)).toBeNull();
    expect(screen.queryByText(/Fondo certificato parte stabile 2018:/i)).toBeNull();
  });
});
