import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step2Art23Limite } from '../Step2Art23Limite';
import { Wizard2026Art23StepState } from '../../types';

describe('Step2Art23Limite Component', () => {
  const defaultState: Wizard2026Art23StepState = {
    limite2016CertificatoEnte: 150000,
    fondoPersonaleDipendente2016: 100000,
    fondoEqPo2016: 20000,
    fondoDirigenza2016: 15000,
    risorseSegretario2016: 5000,
    fondoStraordinario2016: 10000,
    altreVoci2016Soggette: 2000,
    fondoDipendenti2018Soggetto: 95000,
    risorsePoEq2018Soggette: 18000,
    personaleServizio31122018: 2.0,
    personalePrevisto2026Piao: 1.5,
    usaCalcoloManualePersonaleArt23: false,
    personale2018Art23: [
      { id: '1', partTimePercentage: 100 },
      { id: '2', partTimePercentage: 100 }
    ],
    personale2026Art23: [
      { id: '3', partTimePercentage: 100, cedoliniEmessi: 12 },
      { id: '4', partTimePercentage: 50, cedoliniEmessi: 12 }
    ],
    checks: [],
    result: {
      dipendentiEquivalenti2018: 2.0,
      dipendentiEquivalenti2026: 1.5,
      totaleVoci2016Ricostruite: 152000,
      limite2016Base: 150000,
      fonteLimite2016: 'CERTIFICATO',
      limiteCertificatoUtilizzato: true,
      baseAccessorio2018ProCapite: 113000,
      valoreMedioProCapite2018: 56500,
      differenzaPersonale: -0.5,
      incrementoProCapiteLimite: 0,
      limiteArt23Attualizzato: 150000,
      limiteArt23: 150000,
      limiteRicostruito2016: 152000,
      risorseSoggetteAttuali: 0,
      risorseEscluseAttuali: 0,
      margineArt23: 0,
      superamentoArt23: 0,
      incrementoStabileAumentoPersonale: 0,
      fondoCertificatoParteStabile2018: 0,
    }
  };

  it('1. Renders all standard inputs and read-only calculated result cards', () => {
    const handleChange = vi.fn();
    render(
      <Step2Art23Limite
        state={defaultState}
        hasDirigenza={true}
        onChange={handleChange}
      />
    );

    // Verifiche input principali
    expect(screen.getByTestId('limite2016CertificatoEnte')).toHaveValue(150000);
    expect(screen.getByTestId('fondoPersonaleDipendente2016')).toHaveValue(100000);
    expect(screen.getByTestId('fondoEqPo2016')).toHaveValue(20000);
    expect(screen.getByTestId('fondoStraordinario2016')).toHaveValue(10000);
    expect(screen.getByTestId('fondoDirigenza2016')).toHaveValue(15000);
    expect(screen.getByTestId('altreVoci2016Soggette')).toHaveValue(2000);
    expect(screen.getByTestId('risorseSegretario2016')).toHaveValue(5000);

    // Dati 2018 e 2026
    expect(screen.getByTestId('fondoDipendenti2018Soggetto')).toHaveValue(95000);
    expect(screen.getByTestId('risorsePoEq2018Soggette')).toHaveValue(18000);
    
    // Totale calcolato dev'essere visualizzato
    expect(screen.getByText('2.0000 FTE')).toBeInTheDocument();
    expect(screen.getByText('1.5000 FTE')).toBeInTheDocument();

    // Risultati elaborazione
    expect(screen.getByText('Limite 2016 Base')).toBeInTheDocument();
    expect(screen.getByText('Base Accessorio 2018')).toBeInTheDocument();
    expect(screen.getByText('Valore Medio 2018')).toBeInTheDocument();
    expect(screen.getByText('Incremento Pro Capite')).toBeInTheDocument();
    expect(screen.getByText('Limite Art. 23, comma 2, attualizzato')).toBeInTheDocument();
  });

  it('2. Hides dirigenza input if hasDirigenza is false', () => {
    const handleChange = vi.fn();
    render(
      <Step2Art23Limite
        state={defaultState}
        hasDirigenza={false}
        onChange={handleChange}
      />
    );

    expect(screen.queryByTestId('fondoDirigenza2016')).toBeNull();
    expect(screen.getByText('Non applicabile (Ente senza dirigenza da Step 1)')).toBeInTheDocument();
  });

  it('3. Triggers onChange when inputs are updated', () => {
    const handleChange = vi.fn();
    render(
      <Step2Art23Limite
        state={defaultState}
        hasDirigenza={true}
        onChange={handleChange}
      />
    );

    const input = screen.getByTestId('limite2016CertificatoEnte');
    fireEvent.change(input, { target: { value: '160000' } });
    expect(handleChange).toHaveBeenCalledWith({ limite2016CertificatoEnte: 160000 });
  });

  it('4. Opens help modal when tooltip button is clicked and closes it', () => {
    const handleChange = vi.fn();
    render(
      <Step2Art23Limite
        state={defaultState}
        hasDirigenza={true}
        onChange={handleChange}
      />
    );

    // Pulsante help del limite certificato
    const helpBtn = screen.getAllByTitle('Cosa includere?')[0];
    fireEvent.click(helpBtn);

    // Modal visibile
    expect(screen.getByText('Limite 2016 Certificato Revisori')).toBeInTheDocument();
    expect(screen.getByText(/Rappresenta l'importo unico complessivo del limite per l'anno 2016/)).toBeInTheDocument();

    // Chiudi modal
    const closeBtn = screen.getByRole('button', { name: 'Chiudi' });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Limite 2016 Certificato Revisori')).toBeNull();
  });

  it('5. Switches to manual mode and updates manual equivalent inputs', () => {
    const handleChange = vi.fn();
    const manualState: Wizard2026Art23StepState = {
      ...defaultState,
      usaCalcoloManualePersonaleArt23: true,
      manualDipendentiEquivalenti2018: 45.5,
      manualDipendentiEquivalenti2026: 48.2
    };

    render(
      <Step2Art23Limite
        state={manualState}
        hasDirigenza={true}
        onChange={handleChange}
      />
    );

    // Deve mostrare i campi manuali
    const input2018 = screen.getByTestId('manualDipendentiEquivalenti2018');
    const input2026 = screen.getByTestId('manualDipendentiEquivalenti2026');
    expect(input2018).toHaveValue(45.5);
    expect(input2026).toHaveValue(48.2);

    fireEvent.change(input2018, { target: { value: '46' } });
    expect(handleChange).toHaveBeenCalledWith({
      manualDipendentiEquivalenti2018: 46,
      personaleServizio31122018: 46
    });

    fireEvent.change(input2026, { target: { value: '49' } });
    expect(handleChange).toHaveBeenCalledWith({
      manualDipendentiEquivalenti2026: 49,
      personalePrevisto2026Piao: 49
    });
  });

  it('6. Adds a employee row in automatic mode', () => {
    const handleChange = vi.fn();
    render(
      <Step2Art23Limite
        state={defaultState}
        hasDirigenza={true}
        onChange={handleChange}
      />
    );

    const addButtons = screen.getAllByRole('button', { name: /Aggiungi dipendente/i });
    
    // Clicca per 2018
    fireEvent.click(addButtons[0]);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        personale2018Art23: expect.any(Array),
        personaleServizio31122018: expect.any(Number)
      })
    );
  });

  it('7. Verifies Step 2 results layout, badges, formulas and lack of blue classes in the final card container', () => {
    render(
      <Step2Art23Limite
        state={defaultState}
        hasDirigenza={true}
        onChange={vi.fn()}
      />
    );

    // 5 card risultato presenti
    expect(screen.getByText('Limite 2016 Base')).toBeInTheDocument();
    expect(screen.getByText('Base Accessorio 2018')).toBeInTheDocument();
    expect(screen.getByText('Valore Medio 2018')).toBeInTheDocument();
    expect(screen.getByText('Incremento Pro Capite')).toBeInTheDocument();
    expect(screen.getByText('Limite Art. 23, comma 2, attualizzato')).toBeInTheDocument();

    // Presenza del badge "Risultato principale dello step"
    expect(screen.getByText('Risultato principale dello step')).toBeInTheDocument();

    // Formula della card finale
    expect(screen.getByText('Formula: Limite 2016 base + incremento pro capite')).toBeInTheDocument();

    // La card finale ha uno stile senza classi blu primarie (es. bg-blue-50 o border-blue-500/20)
    const finalCardText = screen.getByText('Limite Art. 23, comma 2, attualizzato');
    const finalCardContainer = finalCardText.closest('.w-full');
    expect(finalCardContainer).toBeInTheDocument();
    expect(finalCardContainer).not.toHaveClass('bg-blue-50');
    expect(finalCardContainer).not.toHaveClass('border-blue-500/20');
  });

  describe('8. Box Informativo Applicabilità Art. 33 D.L. 34/2019', () => {
    it('COMUNE + 2026 -> DIRECTLY_APPLICABLE (verde/positivo)', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="COMUNE"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      const box = screen.getByTestId('art33-applicability-box');
      expect(box).toBeInTheDocument();
      expect(screen.getByText('Adeguamento Art. 33 direttamente applicabile')).toBeInTheDocument();
      expect(screen.getByText('Applicabile')).toBeInTheDocument();
      expect(screen.getByText(/Base normativa:/i)).toBeInTheDocument();
      expect(screen.getByText(/Decorrenza:/i)).toBeInTheDocument();
    });

    it('PROVINCIA + ORDINARY_REGIME + 2026 -> DIRECTLY_APPLICABLE', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="PROVINCIA"
          territorialContext="ORDINARY_REGIME"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Adeguamento Art. 33 direttamente applicabile')).toBeInTheDocument();
      expect(screen.getByText('Applicabile')).toBeInTheDocument();
    });

    it('PROVINCIA + undefined context -> NEEDS_MANUAL_REVIEW (amber/warning)', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="PROVINCIA"
          territorialContext={undefined}
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Applicabilità Art. 33 da verificare')).toBeInTheDocument();
      expect(screen.getByText('Verifica manuale')).toBeInTheDocument();
    });

    it('PROVINCIA + SICILIAN_AREA_VASTA -> NOT_DIRECTLY_APPLICABLE (neutro)', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="PROVINCIA"
          territorialContext="SICILIAN_AREA_VASTA"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Adeguamento Art. 33 non direttamente applicabile')).toBeInTheDocument();
      expect(screen.getByText('Non applicabile')).toBeInTheDocument();
    });

    it('REGIONE + ORDINARY_REGIME -> DIRECTLY_APPLICABLE', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="REGIONE"
          territorialContext="ORDINARY_REGIME"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Adeguamento Art. 33 direttamente applicabile')).toBeInTheDocument();
      expect(screen.getByText('Applicabile')).toBeInTheDocument();
    });

    it('REGIONE + OTHER_SPECIAL_AUTONOMY -> NOT_DIRECTLY_APPLICABLE', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="REGIONE"
          territorialContext="OTHER_SPECIAL_AUTONOMY"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Adeguamento Art. 33 non direttamente applicabile')).toBeInTheDocument();
      expect(screen.getByText('Non applicabile')).toBeInTheDocument();
    });

    it('UNIONE_COMUNI -> NOT_DIRECTLY_APPLICABLE', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="UNIONE_COMUNI"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Adeguamento Art. 33 non direttamente applicabile')).toBeInTheDocument();
      expect(screen.getByText('Non applicabile')).toBeInTheDocument();
    });

    it('ALTRO -> NEEDS_MANUAL_REVIEW', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="ALTRO"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Applicabilità Art. 33 da verificare')).toBeInTheDocument();
      expect(screen.getByText('Verifica manuale')).toBeInTheDocument();
    });

    it('CASO UNIONE — CARATTERIZZAZIONE IMPORTANTE: resolver UI NOT_DIRECTLY_APPLICABLE ma calcolo INVARIATO (Section 29)', () => {
      const stateWithAdjustment: Wizard2026Art23StepState = {
        ...defaultState,
        result: {
          ...defaultState.result!,
          incrementoProCapiteLimite: 5000,
          limiteArt23Attualizzato: 155000,
          limiteArt23: 155000,
        },
      };

      render(
        <Step2Art23Limite
          state={stateWithAdjustment}
          hasDirigenza={true}
          entityType="UNIONE_COMUNI"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      // UI Resolver mostra NOT_DIRECTLY_APPLICABLE con badge italiano
      expect(screen.getByText('Adeguamento Art. 33 non direttamente applicabile')).toBeInTheDocument();
      expect(screen.getByText('Non applicabile')).toBeInTheDocument();

      // Ma il calcolo del limite attualizzato e dell'incremento pro capite resta intatto ed esposto nella card
      expect(screen.getByText('€ 155.000,00')).toBeInTheDocument();
      expect(screen.getByText(/5\.000,00/)).toBeInTheDocument();
      // CLASSIFICAZIONE: UI/CLASSIFICATION WIRING ONLY — NO FUND CALCULATION CHANGE
    });

    it('Integrazione temporale: COMUNE 2019 NOT_DIRECTLY_APPLICABLE vs COMUNE 2020 DIRECTLY_APPLICABLE (Section 32)', () => {
      const { unmount } = render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="COMUNE"
          annoRiferimento={2019}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Non applicabile')).toBeInTheDocument();
      unmount();

      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={true}
          entityType="COMUNE"
          annoRiferimento={2020}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Applicabile')).toBeInTheDocument();
    });
  });

  describe('9. Decisione Manuale Art. 33 nei casi NEEDS_MANUAL_REVIEW', () => {
    it('A. COMUNE -> decision UI NON visibile', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={false}
          entityType="COMUNE"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.queryByTestId('art33-manual-decision-section')).toBeNull();
    });

    it('B. UNIONE_COMUNI -> decision UI NON visibile', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={false}
          entityType="UNIONE_COMUNI"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.queryByTestId('art33-manual-decision-section')).toBeNull();
    });

    it('C. PROVINCIA + ORDINARY_REGIME -> NON visibile', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={false}
          entityType="PROVINCIA"
          territorialContext="ORDINARY_REGIME"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.queryByTestId('art33-manual-decision-section')).toBeNull();
    });

    it('D. PROVINCIA senza context -> visibile', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={false}
          entityType="PROVINCIA"
          territorialContext={undefined}
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('art33-manual-decision-section')).toBeInTheDocument();
      expect(screen.getByText("Esito della verifica manuale")).toBeInTheDocument();
    });

    it('E. ALTRO -> visibile', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={false}
          entityType="ALTRO"
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('art33-manual-decision-section')).toBeInTheDocument();
    });

    it('F. REGIONE senza context -> visibile', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={false}
          entityType="REGIONE"
          territorialContext={undefined}
          annoRiferimento={2026}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('art33-manual-decision-section')).toBeInTheDocument();
    });

    it('G. selezione APPLY -> callback(APPLY)', () => {
      const handleDecisionChange = vi.fn();
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={false}
          entityType="ALTRO"
          annoRiferimento={2026}
          art33ManualDecision={undefined}
          onArt33ManualDecisionChange={handleDecisionChange}
          onChange={vi.fn()}
        />
      );

      const applyRadio = screen.getByTestId('art33-manual-decision-apply');
      fireEvent.click(applyRadio);

      expect(handleDecisionChange).toHaveBeenCalledWith('APPLY');
    });

    it('H. selezione DO_NOT_APPLY -> callback(DO_NOT_APPLY)', () => {
      const handleDecisionChange = vi.fn();
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={false}
          entityType="ALTRO"
          annoRiferimento={2026}
          art33ManualDecision={undefined}
          onArt33ManualDecisionChange={handleDecisionChange}
          onChange={vi.fn()}
        />
      );

      const doNotApplyRadio = screen.getByTestId('art33-manual-decision-do-not-apply');
      fireEvent.click(doNotApplyRadio);

      expect(handleDecisionChange).toHaveBeenCalledWith('DO_NOT_APPLY');
    });

    it('I. nessuna preselezione -> radio deselezionati se art33ManualDecision è undefined', () => {
      render(
        <Step2Art23Limite
          state={defaultState}
          hasDirigenza={false}
          entityType="ALTRO"
          annoRiferimento={2026}
          art33ManualDecision={undefined}
          onChange={vi.fn()}
        />
      );

      const applyRadio = screen.getByTestId('art33-manual-decision-apply') as HTMLInputElement;
      const doNotApplyRadio = screen.getByTestId('art33-manual-decision-do-not-apply') as HTMLInputElement;

      expect(applyRadio.checked).toBe(false);
      expect(doNotApplyRadio.checked).toBe(false);
    });
  });
});
