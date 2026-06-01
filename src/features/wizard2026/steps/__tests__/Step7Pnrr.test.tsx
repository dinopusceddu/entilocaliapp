import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step7Pnrr } from '../Step7Pnrr';
import { Wizard2026PnrrStepState } from '../../types';

describe('Step7Pnrr Component', () => {
  const baseState: Wizard2026PnrrStepState = {
    soggettoAttuatorePnrr: undefined,
    checks: [],
  };

  it('1. Renders non-validable state when soggettoAttuatorePnrr is undefined or null', () => {
    const handleChange = vi.fn();
    const handleEnteChange = vi.fn();

    render(
      <Step7Pnrr
        state={baseState}
        hasDirigenza={false}
        annoRiferimento={2026}
        onChange={handleChange}
        onEnteChange={handleEnteChange}
      />
    );

    // Deve essere visibile il box di non validabilità
    expect(screen.getByTestId('pnrr-non-validabile-box')).toBeInTheDocument();
    expect(screen.getByText(/Istruttoria Non Validabile/i)).toBeInTheDocument();
    
    // I campi della Sezione 2 non devono essere renderizzati
    expect(screen.queryByLabelText(/Componente Stabile Fondo Dipendenti 2016/i)).not.toBeInTheDocument();
  });

  it('2. Renders non-applicable state when soggettoAttuatorePnrr is false', () => {
    const handleChange = vi.fn();
    const handleEnteChange = vi.fn();
    const state: Wizard2026PnrrStepState = {
      ...baseState,
      soggettoAttuatorePnrr: false,
    };

    render(
      <Step7Pnrr
        state={state}
        hasDirigenza={false}
        annoRiferimento={2026}
        onChange={handleChange}
        onEnteChange={handleEnteChange}
      />
    );

    // Deve essere visibile il box non applicabile
    expect(screen.getByTestId('pnrr-non-applicabile-box')).toBeInTheDocument();
    expect(screen.getByText(/Step Non Applicabile/i)).toBeInTheDocument();

    // I campi della Sezione 2 non devono essere renderizzati
    expect(screen.queryByLabelText(/Componente Stabile Fondo Dipendenti 2016/i)).not.toBeInTheDocument();
  });

  it('3. Renders inputs and results when soggettoAttuatorePnrr is true and fields are complete', () => {
    const handleChange = vi.fn();
    const handleEnteChange = vi.fn();
    const state: Wizard2026PnrrStepState = {
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
      componenteStabileFondoDirigenza2016: 200000,
      equilibrioEsercizioPrecedente: true,
      parametriDebitoCommercialeEsercizioPrecedente: true,
      rendicontoApprovatoTermini: true,
      incidenzaSalarioAccessorioScelta: 'diretto',
      incidenzaSalarioAccessorioPercentuale: 6.5,
      checks: [],
      result: {
        isApplicabile: true,
        isValidable: true,
        limiteMassimoPnrrFondoDipendenti: 50000,
        limiteMassimoPnrrFondoDirigenza: 10000,
        totaleLimiteMassimoPnrr: 60000,
        incidenzaSalarioAccessorioPercentualeCalcolata: 6.5,
        incrementoMassimoPnrr: 60000,
        incrementoApplicato: 0,
        incrementoNonAmmesso: 0,
      }
    };

    render(
      <Step7Pnrr
        state={state}
        hasDirigenza={true}
        annoRiferimento={2026}
        onChange={handleChange}
        onEnteChange={handleEnteChange}
      />
    );

    // Campi input stabili 2016 presenti
    expect(screen.getByLabelText(/Componente Stabile Fondo Dipendenti 2016/i)).toHaveValue(1000000);
    expect(screen.getByLabelText(/Componente Stabile Fondo Dirigenza 2016/i)).toHaveValue(200000);

    // Carte con i risultati presenti
    expect(screen.getByText('Massimo Fondo Dipendenti')).toBeInTheDocument();
    expect(screen.getByText('Massimo Fondo Dirigenza')).toBeInTheDocument();
    expect(screen.getByText('Totale Massimo Teorico PNRR')).toBeInTheDocument();

    expect(screen.getByText('50.000,00 €')).toBeInTheDocument();
    expect(screen.getByText('10.000,00 €')).toBeInTheDocument();
    expect(screen.getByText('60.000,00 €')).toBeInTheDocument();

    // Nota di esclusione presente
    expect(screen.getByText(/Nota di Esclusione dai Limiti di Crescita/i)).toBeInTheDocument();
    expect(screen.getByText(/escluse dal limite finanziario complessivo del trattamento accessorio/i)).toBeInTheDocument();
  });

  it('4. Triggers onChange callbacks correctly upon user interaction', () => {
    const handleChange = vi.fn();
    const handleEnteChange = vi.fn();

    render(
      <Step7Pnrr
        state={baseState}
        hasDirigenza={false}
        annoRiferimento={2026}
        onChange={handleChange}
        onEnteChange={handleEnteChange}
      />
    );

    // Cliccare su Sì per soggetto attuatore
    const yesButton = screen.getByTestId('soggettoPnrr-yes');
    fireEvent.click(yesButton);
    expect(handleChange).toHaveBeenCalledWith({ soggettoAttuatorePnrr: true });
  });

  it('5. Triggers onChange for checklist and input fields', () => {
    const handleChange = vi.fn();
    const handleEnteChange = vi.fn();
    const state: Wizard2026PnrrStepState = {
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
      checks: [],
    };

    render(
      <Step7Pnrr
        state={state}
        hasDirigenza={false}
        annoRiferimento={2026}
        onChange={handleChange}
        onEnteChange={handleEnteChange}
      />
    );

    // Modificare stabile dipendenti
    const inputDip = screen.getByLabelText(/Componente Stabile Fondo Dipendenti 2016/i);
    fireEvent.change(inputDip, { target: { value: '1200000' } });
    expect(handleChange).toHaveBeenCalledWith({ componenteStabileFondoDipendenti2016: 1200000 });

    // Modificare equilibrio esercizio precedente su NO
    const eqNoBtn = screen.getByTestId('equilibrioEsercizioPrecedente-no');
    fireEvent.click(eqNoBtn);
    expect(handleChange).toHaveBeenCalledWith({ equilibrioEsercizioPrecedente: false });
  });
});
