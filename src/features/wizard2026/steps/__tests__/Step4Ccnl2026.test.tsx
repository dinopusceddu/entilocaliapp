import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step4Ccnl2026 } from '../Step4Ccnl2026';
import { Wizard2026Ccnl2026StepState, Wizard2026EnteStepState } from '../../types';

// Fixtures
const defaultState: Wizard2026Ccnl2026StepState = {
  monteSalari2021: 1000000,
  checks: [],
  result: {
    isCalcolabile: true,
    isMs2021Consolidato: false,
    monteSalari2021: 1000000,
    incrementoStabile014: 1400,
    arretrati014: 2800,
    limiteMassimo022: 4400,
    isSuperamentoLimite022: false,
    incremento014: 1400,
    incremento022Massimo: 4400,
    incremento022Applicato: 4400,
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

describe('Step4Ccnl2026 Component — MOD-013', () => {
  it('1. Renders Sezione 1, 2, 3 and card titles; Totale Potenziale Istruttorio is completely absent', () => {
    render(
      <Step4Ccnl2026
        state={defaultState}
        enteState={defaultEnteState}
        onChange={vi.fn()}
      />
    );

    // Sezione 1
    expect(screen.getByText(/Sezione 1 — Base di calcolo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Monte Salari Anno 2021/i)).toHaveValue(1000000);

    // Sezione 2: due card separate (NON cumulate)
    expect(screen.getByText(/Sezione 2 — Incremento 0,14%/i)).toBeInTheDocument();
    expect(screen.getByText(/Incremento stabile 0,14%.*parte stabile/i)).toBeInTheDocument();
    expect(screen.getByText(/Arretrati 0,14%.*parte variabile/i)).toBeInTheDocument();

    // Sezione 3
    expect(screen.getByText(/Sezione 3 — Incremento eventuale 0,22%/i)).toBeInTheDocument();
    expect(screen.getByText(/Limite massimo incremento 0,22%/i)).toBeInTheDocument();

    // Nessun totale cumulato
    expect(screen.queryByText(/Totale Potenziale Istruttorio/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/somma complessiva teorica/i)).not.toBeInTheDocument();
  });

  it('2. Fires onChange event when Monte Salari 2021 is modified', () => {
    const handleChange = vi.fn();
    render(
      <Step4Ccnl2026
        state={defaultState}
        enteState={defaultEnteState}
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(/Monte Salari Anno 2021/i);
    fireEvent.change(input, { target: { value: '1500000' } });
    expect(handleChange).toHaveBeenCalledWith({ monteSalari2021: 1500000 });
  });

  it('3. Svuotando il monte salari si invia undefined (non zero di default)', () => {
    const handleChange = vi.fn();
    render(
      <Step4Ccnl2026
        state={defaultState}
        enteState={defaultEnteState}
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(/Monte Salari Anno 2021/i);
    fireEvent.change(input, { target: { value: '' } });
    expect(handleChange).toHaveBeenCalledWith({ monteSalari2021: undefined });
  });

  it('4. Checks slider and checkbox are completely absent', () => {
    render(
      <Step4Ccnl2026
        state={defaultState}
        enteState={defaultEnteState}
        onChange={vi.fn()}
      />
    );

    const rangeInputs = screen.queryAllByRole('slider');
    expect(rangeInputs.length).toBe(0);

    const checkboxes = screen.queryAllByRole('checkbox');
    expect(checkboxes.length).toBe(0);
  });

  it('5. Ente strutturalmente deficitario con COSFEL negata (hasApprovazioneCosfel === false): mostra banner blocco ed formula specifica', () => {
    const blockedState: Wizard2026Ccnl2026StepState = {
      ...defaultState,
      result: {
        ...defaultState.result!,
        limiteMassimo022: 0,
        isSuperamentoLimite022: false,
      },
    };

    const blockedEnteState: Wizard2026EnteStepState = {
      ...defaultEnteState,
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: false,
    };

    render(
      <Step4Ccnl2026
        state={blockedState}
        enteState={blockedEnteState}
        onChange={vi.fn()}
      />
    );

    // Banner blocco
    expect(screen.getByTestId('cosfel-blocked-banner')).toBeInTheDocument();
    expect(screen.getByText(/Blocco COSFEL: Incremento 0,22% precluso/i)).toBeInTheDocument();

    // Dicitura nella formula
    expect(screen.getByText(/Forzato a 0 per blocco COSFEL/i)).toBeInTheDocument();
  });

  it('6. Ente strutturalmente deficitario con COSFEL mancante (hasApprovazioneCosfel === undefined): mostra banner warning, NON blocca', () => {
    const warningEnteState: Wizard2026EnteStepState = {
      ...defaultEnteState,
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: undefined,
    };

    render(
      <Step4Ccnl2026
        state={defaultState}
        enteState={warningEnteState}
        onChange={vi.fn()}
      />
    );

    // Banner warning
    expect(screen.getByTestId('cosfel-missing-warning')).toBeInTheDocument();
    expect(screen.getByText(/Warning COSFEL: verifica in corso/i)).toBeInTheDocument();

    // Nessun blocco, formula calcola normalmente
    expect(screen.queryByTestId('cosfel-blocked-banner')).not.toBeInTheDocument();
    // La formula del limite massimo è visibile (non bloccata)
    expect(screen.getByText(/Limite massimo incremento 0,22%/i)).toBeInTheDocument();
  });

  it('7. Ente strutturalmente deficitario con COSFEL approvata (hasApprovazioneCosfel === true): nessun banner blocco/warning', () => {
    const okEnteState: Wizard2026EnteStepState = {
      ...defaultEnteState,
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: true,
    };

    render(
      <Step4Ccnl2026
        state={defaultState}
        enteState={okEnteState}
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByTestId('cosfel-blocked-banner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cosfel-missing-warning')).not.toBeInTheDocument();
  });

  it('8. Displays the Monte Salari help modal when help button is clicked and closes it', () => {
    render(
      <Step4Ccnl2026
        state={defaultState}
        enteState={defaultEnteState}
        onChange={vi.fn()}
      />
    );

    // Help button should be in document
    const helpBtn = screen.getByTestId('monte-salari-help-button');
    expect(helpBtn).toBeInTheDocument();

    // Modal should not be present initially
    expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();

    // Click help button to open modal
    fireEvent.click(helpBtn);
    expect(screen.getByTestId('help-modal')).toBeInTheDocument();
    expect(screen.getByText("Come si calcola il Monte Salari 2021")).toBeInTheDocument();
    expect(screen.getByText(/Il dato si ricava dalle rilevazioni del Conto Annuale MEF/i)).toBeInTheDocument();

    // Click close button on modal
    const closeBtn = screen.getByTestId('close-modal-btn');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
  });
});
