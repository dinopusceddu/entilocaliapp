import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step1EnteCondizioni } from '../Step1EnteCondizioni';
import { Wizard2026EnteStepState } from '../../types';

vi.mock('../../../../contexts/AppContext', () => ({
  useAppContext: () => ({
    state: {
      currentEntity: { id: 'test-entity', name: 'Ente di Test' },
      currentYear: 2026,
    },
    dispatch: vi.fn(),
  }),
}));

describe('Step1EnteCondizioni — Regime Territoriale Art. 33', () => {
  const defaultState: Wizard2026EnteStepState = {
    denominazioneEnte: 'Ente di Test',
    annoRiferimento: 2026,
    entityType: undefined,
    territorialContext: undefined,
    hasDirigenza: false,
    isDissesto: false,
    isStrutturalmenteDeficitario: false,
    isPianoRiequilibrio: false,
    isPrimaFasciaDl34: false,
    isEquilibrioPluriennaleAsseverato: true,
    hasApprovazioneCosfel: false,
  };

  it('A. COMUNE — territorial context non visibile', () => {
    const handleChange = vi.fn();
    render(
      <Step1EnteCondizioni
        state={{ ...defaultState, entityType: 'COMUNE' }}
        onChange={handleChange}
      />
    );

    expect(screen.queryByTestId('territorialContext')).toBeNull();
    expect(screen.queryByLabelText(/Regime territoriale ai fini dell'art\. 33/i)).toBeNull();
  });

  it('B. PROVINCIA — select visibile con 4 opzioni', () => {
    const handleChange = vi.fn();
    render(
      <Step1EnteCondizioni
        state={{ ...defaultState, entityType: 'PROVINCIA' }}
        onChange={handleChange}
      />
    );

    const select = screen.getByTestId('territorialContext') as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    // Include opzione vuota + 4 opzioni effettive = 5 options
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual([
      '',
      'ORDINARY_REGIME',
      'SICILIAN_AREA_VASTA',
      'OTHER_SPECIAL_AUTONOMY',
      'UNKNOWN',
    ]);
  });

  it('C. CITTA_METROPOLITANA — 4 opzioni', () => {
    const handleChange = vi.fn();
    render(
      <Step1EnteCondizioni
        state={{ ...defaultState, entityType: 'CITTA_METROPOLITANA' }}
        onChange={handleChange}
      />
    );

    const select = screen.getByTestId('territorialContext') as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual([
      '',
      'ORDINARY_REGIME',
      'SICILIAN_AREA_VASTA',
      'OTHER_SPECIAL_AUTONOMY',
      'UNKNOWN',
    ]);
  });

  it('D. REGIONE — 3 opzioni, senza SICILIAN_AREA_VASTA', () => {
    const handleChange = vi.fn();
    render(
      <Step1EnteCondizioni
        state={{ ...defaultState, entityType: 'REGIONE' }}
        onChange={handleChange}
      />
    );

    const select = screen.getByTestId('territorialContext') as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual([
      '',
      'ORDINARY_REGIME',
      'OTHER_SPECIAL_AUTONOMY',
      'UNKNOWN',
    ]);
    expect(options).not.toContain('SICILIAN_AREA_VASTA');
  });

  it('E. cambio PROVINCIA → COMUNE azzera il territorialContext', () => {
    const handleChange = vi.fn();
    render(
      <Step1EnteCondizioni
        state={{
          ...defaultState,
          entityType: 'PROVINCIA',
          territorialContext: 'ORDINARY_REGIME',
        }}
        onChange={handleChange}
      />
    );

    // Seleziona COMUNE
    const entityTypeSelect = screen.getByRole('combobox', { name: /Qualificazione Giuridica/i });
    fireEvent.change(entityTypeSelect, { target: { value: 'COMUNE' } });

    expect(handleChange).toHaveBeenCalledWith({
      entityType: 'COMUNE',
      territorialContext: undefined,
    });
  });

  it('F. cambio PROVINCIA → REGIONE azzera il territorialContext', () => {
    const handleChange = vi.fn();
    render(
      <Step1EnteCondizioni
        state={{
          ...defaultState,
          entityType: 'PROVINCIA',
          territorialContext: 'SICILIAN_AREA_VASTA',
        }}
        onChange={handleChange}
      />
    );

    const entityTypeSelect = screen.getByRole('combobox', { name: /Qualificazione Giuridica/i });
    fireEvent.change(entityTypeSelect, { target: { value: 'REGIONE' } });

    expect(handleChange).toHaveBeenCalledWith({
      entityType: 'REGIONE',
      territorialContext: undefined,
    });
  });
});
