import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step6Straordinario } from '../Step6Straordinario';
import { Wizard2026StraordinarioStepState } from '../../types';

describe('Step6Straordinario Component', () => {
  const defaultState: Wizard2026StraordinarioStepState = {
    fondoStraordinarioOrdinarioAnnoCorrente: 12000,
    riduzioneStabileStraordinarioArt67: 2000,
    incrementoStraordinarioOrdinario: 1500,
    quotaFinanziataConCapienzaArt23: 1000,
    quotaFinanziataConRiduzioneFondo: 500,
    contrattazioneIntegrativaRiduzioneFondo: true,
    stanziamentoStraordinarioOrdinarioAnnoPrecedente: 10000,
    spesaStraordinarioOrdinarioAnnoPrecedente: 9000,
    economieStraordinarioCertificate: undefined,
    risorseEscluse: [
      {
        id: '1',
        tipologia: 'elezioniReferendum',
        importo: 1000,
        fonteNormativaFinanziaria: 'Legge stabilità',
        esclusaDaArt23: true,
      }
    ],
    checks: [],
    result: {
      straordinarioOrdinarioSoggettoArt23: 11500,
      incrementoStraordinarioOrdinarioSoggettoArt23: 1500,
      riduzioneFondoDecentratoPerStraordinario: 500,
      economieStraordinarioAnnoPrecedenteDaRiversare: 1000,
      totaleStraordinarioEsclusoArt23: 1000,
      straordinarioEsclusoArt23Elezioni: 1000,
      straordinarioEsclusoArt23Calamita: 0,
      straordinarioEsclusoArt23Istat: 0,
      straordinarioEsclusoArt23PoliziaLocaleDeroga: 0,
      economieStraordinarioCalcolate: 1000,
      differenzaEconomieCalcolateCertificate: 0,
      isCalcolabile: true,
      fondoStraordinarioOrdinarioResiduo: 10000,
      incrementoParteStabileDaRiduzioneStraordinario: 2000,
      straordinarioOrdinarioFinaleSoggettoArt23: 11500,
      incrementoAmmesso: 1500,
      incrementoNonAmmesso: 0,
      riduzioneFondoDecentratoNecessaria: 500,
      economieDaTrasferireVariabileUnaTantum: 1000,
      totaleRisorseEscluse: 1000,
      fondoStraordinarioOrdinarioAggiornato: 11500,
    }
  };

  it('1. Renders inputs and displays calculated values correctly', () => {
    const handleChange = vi.fn();
    render(
      <Step6Straordinario
        state={defaultState}
        hasDirigenza={false}
        margineArt23={5000}
        onChange={handleChange}
      />
    );

    // Verify main input fields are rendered with correct values
    expect(screen.getByLabelText(/Fondo straordinario ordinario anno corrente/i)).toHaveValue(12000);
    expect(screen.getByLabelText(/Riduzione stabile straordinario ex Art. 67/i)).toHaveValue(2000);
    expect(screen.getByLabelText(/Incremento straordinario ordinario/i)).toHaveValue(1500);
    expect(screen.getByLabelText(/Quota finanziata con capienza Art. 23/i)).toHaveValue(1000);
    
    const quotaRiduzioneInput = screen.getByLabelText(/Quota finanziata con riduzione Fondo/i);
    expect(quotaRiduzioneInput).toHaveValue(500);
    expect(quotaRiduzioneInput).not.toBeDisabled();

    // Check preventive contrattazione integrativa checkbox
    expect(screen.getByLabelText(/preventiva contrattazione integrativa/i)).toBeInTheDocument();

    // Check results cards are present
    expect(screen.getByText('Straordinario ordinario finale soggetto Art. 23')).toBeInTheDocument();
    expect(screen.getByText('Incremento ordinario soggetto Art. 23')).toBeInTheDocument();
    expect(screen.getByText('Riduzione stabile straordinario (Art. 67)')).toBeInTheDocument();
    expect(screen.getByText('Riduzione Fondo per straordinario')).toBeInTheDocument();
    expect(screen.getByText('Economie da riversare nel Fondo')).toBeInTheDocument();
    expect(screen.getByText('Straordinario escluso Art. 23')).toBeInTheDocument();
  });

  it('2. Disables quotaFinanziataConRiduzioneFondo when hasDirigenza is true', () => {
    const handleChange = vi.fn();
    render(
      <Step6Straordinario
        state={defaultState}
        hasDirigenza={true}
        margineArt23={5000}
        onChange={handleChange}
      />
    );

    const quotaRiduzioneInput = screen.getByLabelText(/Quota finanziata con riduzione Fondo/i);
    expect(quotaRiduzioneInput).toBeDisabled();
  });

  it('3. Triggers onChange callback when inputs are modified', () => {
    const handleChange = vi.fn();
    render(
      <Step6Straordinario
        state={defaultState}
        hasDirigenza={false}
        margineArt23={5000}
        onChange={handleChange}
      />
    );

    const fondoCorrenteInput = screen.getByLabelText(/Fondo straordinario ordinario anno corrente/i);
    fireEvent.change(fondoCorrenteInput, { target: { value: '15000' } });
    expect(handleChange).toHaveBeenCalledWith({ fondoStraordinarioOrdinarioAnnoCorrente: 15000 });

    const riduzioneStabileInput = screen.getByLabelText(/Riduzione stabile straordinario ex Art. 67/i);
    fireEvent.change(riduzioneStabileInput, { target: { value: '3000' } });
    expect(handleChange).toHaveBeenCalledWith({ riduzioneStabileStraordinarioArt67: 3000 });
  });

  it('4. Allows adding, updating and removing a resource in resources list', () => {
    const handleChange = vi.fn();
    render(
      <Step6Straordinario
        state={defaultState}
        hasDirigenza={false}
        margineArt23={5000}
        onChange={handleChange}
      />
    );

    // Verify presence of existing resource
    expect(screen.getByDisplayValue('Legge stabilità')).toBeInTheDocument();

    // Click on "Aggiungi risorsa esclusa"
    const addBtn = screen.getByRole('button', { name: /Aggiungi risorsa esclusa/i });
    fireEvent.click(addBtn);

    expect(handleChange).toHaveBeenCalledWith({
      risorseEscluse: expect.arrayContaining([
        expect.objectContaining({
          tipologia: 'elezioniReferendum',
          fonteNormativaFinanziaria: '',
          esclusaDaArt23: true
        })
      ])
    });

    // Click on remove button of the existing resource
    const removeBtn = screen.getByTitle('Rimuovi risorsa');
    fireEvent.click(removeBtn);
    expect(handleChange).toHaveBeenCalledWith({ risorseEscluse: [] });
  });
});
