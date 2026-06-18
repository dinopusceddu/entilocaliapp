import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step3Dl25 } from '../Step3Dl25';
import { Wizard2026Dl25StepState, Wizard2026EnteStepState } from '../../types';

// ─── Fixture base ──────────────────────────────────────────────────────────

const defaultState: Wizard2026Dl25StepState = {
  stipendiTabellari2023NonDirigenti: 2000000,
  fondoStabile2025Certificato: 800000,
  budgetEq2025: 50000,
  quoteAderenti: [],
  checks: [],
  result: {
    applicabilityStatus: 'DIRECTLY_APPLICABLE',
    soglia48: 960000,
    risorse2025DaSottrarre: 850000,
    incrementoMassimoTeorico: 110000,
    limiteMassimoDL25: 110000,
    quotaTrasferitaAderenti: 0,
    isApplicabileDirettamente: true,
    isCalcolabile: true,
    quotaNonIscrivibile: 0,
  },
};

const defaultEnteState: Wizard2026EnteStepState = {
  entityType: 'COMUNE',
  denominazioneEnte: 'Comune Test',
  annoRiferimento: 2026,
  isPrimaFasciaDl34: true,
  isEquilibrioPluriennaleAsseverato: true,
  isDissesto: false,
  isPianoRiequilibrio: false,
  isStrutturalmenteDeficitario: false,
};

// ─── Test Suite ────────────────────────────────────────────────────────────

describe('Step3Dl25 Component — MOD-011-bis + MOD-011-ter', () => {

  it('1. Renders all standard inputs and sections for DIRECTLY_APPLICABLE', () => {
    const handleChange = vi.fn();
    render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={defaultEnteState}
        onChange={handleChange}
      />
    );

    // Sezione 1 - Applicabilità
    expect(screen.getByText(/Sezione 1 — Inquadramento e Applicabilità/i)).toBeInTheDocument();
    expect(screen.getByText(/applicazione diretta/i)).toBeInTheDocument();

    // Sezione 2 - Requisiti
    expect(screen.getByText(/Sezione 2 — Verifica di Virtuosità/i)).toBeInTheDocument();
    expect(screen.getByText(/Requisiti Formali di Bilancio/i)).toBeInTheDocument();

    // Campi input Sezione 3
    const annoPrecedente = defaultEnteState.annoRiferimento! - 1;
    expect(screen.getByLabelText(/Spesa Stipendi Tabellari 2023 Non Dirigenti/i)).toHaveValue(2000000);
    expect(screen.getByLabelText(new RegExp(`Fondo Stabile ${annoPrecedente} Certificato`, 'i'))).toHaveValue(800000);
    expect(screen.getByLabelText(new RegExp(`Budget Elevate Qualificazioni \\(EQ\\) ${annoPrecedente}`, 'i'))).toHaveValue(50000);
    
    // I campi rimossi non devono esserci
    expect(screen.queryByLabelText(/Fonte del dato contabile/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Estremi atto autorizzativo/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Importo D.L. 25\/2025 da applicare al Fondo/i)).toBeInTheDocument();

    // Sezione 5 - Risultati
    expect(screen.getByText(/Soglia Limite 48%/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Risorse ${annoPrecedente} da Detrarre`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(/Incremento Massimo Teorico/i)).toBeInTheDocument();
    expect(screen.getByText(/Limite Massimo Stabile D.L. 25\/2025/i)).toBeInTheDocument();
    expect(screen.getAllByText(/110\.000,00/)[0]).toBeInTheDocument();
  });

  it('2. Consente di indicare l importo D.L. 25/2025 da applicare al Fondo', () => {
    const handleChange = vi.fn();
    render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={defaultEnteState}
        onChange={handleChange}
      />
    );

    const field = screen.getByLabelText(/Importo D.L. 25\/2025 da applicare al Fondo/i);
    fireEvent.change(field, { target: { value: '10000' } });

    expect(handleChange).toHaveBeenCalledWith({ incrementoApplicato: 10000 });
  });

  it('3. Renders and handles quote table interactions for TRANSFER_ONLY', () => {
    const handleChange = vi.fn();
    const transferState: Wizard2026Dl25StepState = {
      ...defaultState,
      quoteAderenti: [
        {
          id: 'q1',
          enteAderente: 'Comune Aderente 1',
          tipologiaEnteAderente: 'Comune',
          quotaMassimaTrasferibile: 15000,
          riduzionePermanenteFondoAderente: true,
          estremiAttoEnteAderente: 'Det. 100',
          parereRevisoriEnteAderente: true,
          parereRevisoriEnteRicevente: true,
          hasAutorizzazioneCosfelAderente: undefined,
        },
      ],
      result: {
        applicabilityStatus: 'TRANSFER_ONLY',
        quotaTrasferitaAderenti: 15000,
        limiteMassimoDL25: 15000,
        isApplicabileDirettamente: false,
        isCalcolabile: true,
      },
    };

    const transferEnteState: Wizard2026EnteStepState = {
      entityType: 'UNIONE_COMUNI',
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
    };

    render(
      <Step3Dl25
        state={transferState}
        entityType="UNIONE_COMUNI"
        enteState={transferEnteState}
        onChange={handleChange}
      />
    );

    // Sezione D - Quote
    expect(screen.getByText(/Sezione 3 — Tabella di Trasferimento Quote/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome Comune')).toHaveValue('Comune Aderente 1');

    // Aggiungi Ente
    const addBtn = screen.getByTestId('add-quote-btn');
    fireEvent.click(addBtn);
    expect(handleChange).toHaveBeenCalledWith({
      quoteAderenti: expect.arrayContaining([
        expect.objectContaining({
          enteAderente: '',
          quotaMassimaTrasferibile: undefined,
        }),
      ]),
    });

    // Rimuovi Ente
    const deleteBtn = screen.getByTitle('Rimuovi riga');
    fireEvent.click(deleteBtn);
    expect(handleChange).toHaveBeenCalledWith({
      quoteAderenti: [],
    });
  });

  it('4. Displays structural blockage message in Sezione B if blocked', () => {
    const blockedEnteState: Wizard2026EnteStepState = {
      entityType: 'COMUNE',
      isPrimaFasciaDl34: false, // Requisito negativo
      isEquilibrioPluriennaleAsseverato: true,
    };

    render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={blockedEnteState}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('blocco-istruttorio')).toBeInTheDocument();
  });

  // ─── Test MOD-011-ter ──────────────────────────────────────────────────

  it('MOD-011-ter 1. Banner blocco elenca specificamente i requisiti negativi (B1)', () => {
    const multiBlockedState: Wizard2026EnteStepState = {
      entityType: 'COMUNE',
      isPrimaFasciaDl34: false,
      isEquilibrioPluriennaleAsseverato: false,
      isDissesto: false,
      isPianoRiequilibrio: false,
    };

    render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={multiBlockedState}
        onChange={vi.fn()}
      />
    );

    const banner = screen.getByTestId('blocco-istruttorio');
    // Deve elencare entrambi i motivi specifici
    expect(banner).toHaveTextContent(/equilibrio pluriennale di bilancio non asseverato/i);
    expect(banner).toHaveTextContent(/ente non collocato in prima fascia/i);
  });

  it('MOD-011-ter 2. Banner blocco per dissesto elenca il motivo specifico', () => {
    const dissestoState: Wizard2026EnteStepState = {
      entityType: 'COMUNE',
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
      isDissesto: true,
    };

    render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={dissestoState}
        onChange={vi.fn()}
      />
    );

    const banner = screen.getByTestId('blocco-istruttorio');
    expect(banner).toHaveTextContent(/ente in stato di dissesto/i);
  });

  it('MOD-011-ter 3. Warning COSFEL mancante visibile quando deficitario e COSFEL undefined (S5)', () => {
    const deficitarioSenzaCosfelState: Wizard2026EnteStepState = {
      entityType: 'COMUNE',
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
      isDissesto: false,
      isPianoRiequilibrio: false,
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: undefined, // Non specificato
    };

    render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={deficitarioSenzaCosfelState}
        onChange={vi.fn()}
      />
    );

    // Il banner di blocco NON deve comparire (undefined ≠ false)
    expect(screen.queryByTestId('blocco-istruttorio')).not.toBeInTheDocument();
    // Il warning COSFEL mancante deve comparire
    expect(screen.getByTestId('cosfel-missing-warning')).toBeInTheDocument();
    expect(screen.getByText(/strutturalmente deficitario/i)).toBeInTheDocument();
    expect(screen.getByText(/non può essere considerato validabile/i)).toBeInTheDocument();
  });

  it('MOD-011-ter 4. Nessun warning COSFEL se hasApprovazioneCosfel = true', () => {
    const deficitarioCosfelOkState: Wizard2026EnteStepState = {
      entityType: 'COMUNE',
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: true,
    };

    render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={deficitarioCosfelOkState}
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByTestId('cosfel-missing-warning')).not.toBeInTheDocument();
    expect(screen.queryByTestId('blocco-istruttorio')).not.toBeInTheDocument();
  });

  it("MOD-011-ter 5. Campo documentazioneCosfelDl25 visibile se ente deficitario e adeguamento salario (B2)", () => {
    const deficitarioState: Wizard2026EnteStepState = {
      entityType: 'COMUNE',
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: true,
    };

    const { rerender } = render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={deficitarioState}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Estremi autorizzazione COSFEL per l'adeguamento/i)).toBeInTheDocument();

    // Quando non deficitario, il campo non deve comparire
    rerender(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={{ ...deficitarioState, isStrutturalmenteDeficitario: false }}
        onChange={vi.fn()}
      />
    );
    expect(screen.queryByLabelText(/Estremi autorizzazione COSFEL per l'adeguamento/i)).not.toBeInTheDocument();
  });

  it('MOD-011-ter 6. Campo altreRisorse2025DaSottrarre visibile e gestisce onChange (D1)', () => {
    const handleChange = vi.fn();
    render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={defaultEnteState}
        onChange={handleChange}
      />
    );

    const annoPrecedente = defaultEnteState.annoRiferimento! - 1;
    const field = screen.getByLabelText(new RegExp(`Altre risorse ${annoPrecedente} da sottrarre`, 'i'));
    expect(field).toBeInTheDocument();

    fireEvent.change(field, { target: { value: '25000' } });
    expect(handleChange).toHaveBeenCalledWith({ altreRisorse2025DaSottrarre: 25000 });
  });

  it('MOD-011-ter 7. Campo altreRisorse2025 → undefined quando svuotato (non zero di default)', () => {
    const handleChange = vi.fn();
    render(
      <Step3Dl25
        state={{ ...defaultState, altreRisorse2025DaSottrarre: 25000 }}
        entityType="COMUNE"
        enteState={defaultEnteState}
        onChange={handleChange}
      />
    );

    const annoPrecedente = defaultEnteState.annoRiferimento! - 1;
    const field = screen.getByLabelText(new RegExp(`Altre risorse ${annoPrecedente} da sottrarre`, 'i'));
    fireEvent.change(field, { target: { value: '' } });
    expect(handleChange).toHaveBeenCalledWith({ altreRisorse2025DaSottrarre: undefined });
  });

  it('MOD-011-ter 10. Campo baseCalcoloLimiteStorico visibile come select (F1)', () => {
    const handleChange = vi.fn();
    render(
      <Step3Dl25
        state={defaultState}
        entityType="COMUNE"
        enteState={defaultEnteState}
        onChange={handleChange}
      />
    );

    const select = screen.getByLabelText(/Base di calcolo del limite storico/i);
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'media 2011-2013' } });
    expect(handleChange).toHaveBeenCalledWith({ baseCalcoloLimiteStorico: 'media 2011-2013' });
  });

  it('MOD-011-ter 11. Scostamento limite storico visibile quando positivo (F2)', () => {
    const stateConLimite: Wizard2026Dl25StepState = {
      ...defaultState,
      limiteStoricoSpesaPersonale: 1000000,
      spesaPersonalePrevista2026AnteIncremento: 950000,
      result: {
        ...defaultState.result!,
        scostamentoLimiteStorico: -50000, // negativo o positivo, verifichiamo che appaia
      },
    };

    render(
      <Step3Dl25
        state={stateConLimite}
        entityType="COMUNE"
        enteState={defaultEnteState}
        onChange={vi.fn()}
      />
    );

    const scostamento = screen.getByTestId('scostamento-limite-storico');
    expect(scostamento).toBeInTheDocument();
    expect(scostamento).toHaveTextContent(/Scostamento dal limite storico/i);
  });

  it('MOD-011-ter 14. Tabella quote Unioni contiene colonne tipologia ente e COSFEL (H1, H2)', () => {
    const transferState: Wizard2026Dl25StepState = {
      ...defaultState,
      quoteAderenti: [
        {
          id: 'q1',
          enteAderente: 'Comune A',
          tipologiaEnteAderente: 'Comune',
          quotaMassimaTrasferibile: 10000,
          riduzionePermanenteFondoAderente: true,
          estremiAttoEnteAderente: 'Det. 1/2026',
          parereRevisoriEnteAderente: true,
          parereRevisoriEnteRicevente: true,
          hasAutorizzazioneCosfelAderente: undefined,
        },
      ],
      result: {
        applicabilityStatus: 'TRANSFER_ONLY',
        quotaTrasferitaAderenti: 10000,
        limiteMassimoDL25: 10000,
        isApplicabileDirettamente: false,
        isCalcolabile: true,
      },
    };

    render(
      <Step3Dl25
        state={transferState}
        entityType="UNIONE_COMUNI"
        enteState={{ entityType: 'UNIONE_COMUNI' }}
        onChange={vi.fn()}
      />
    );

    // Colonna tipologia ente
    expect(screen.getByText(/Tipologia/i)).toBeInTheDocument();
    const tipologiaInput = screen.getByPlaceholderText('es. Comune');
    expect(tipologiaInput).toHaveValue('Comune');

    // Colonna COSFEL aderente (header)
    expect(screen.getByText(/COSFEL Ader\./i)).toBeInTheDocument();

    // Bottoni COSFEL aderente per la riga q1 (stato undefined → nessuno selezionato)
    const cosfelYes = screen.getByTestId('cosfel-aderente-q1-yes');
    const cosfelNo = screen.getByTestId('cosfel-aderente-q1-no');
    expect(cosfelYes).toBeInTheDocument();
    expect(cosfelNo).toBeInTheDocument();
  });
});
