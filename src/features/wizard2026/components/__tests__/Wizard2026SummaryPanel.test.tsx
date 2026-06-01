import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Wizard2026SummaryPanel } from '../Wizard2026SummaryPanel';
import { initialWizard2026DraftState, Wizard2026DraftState } from '../../index';

describe('Wizard2026SummaryPanel (MOD-005)', () => {
  it('1. Mostra i contatori iniziali e il pulsante di trasferimento non attivo con il badge corretto', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      art23: {
        ...initialWizard2026DraftState.art23,
        result: {
          limiteRicostruito2016: 150000,
          risorseSoggetteAttuali: 130000,
          risorseEscluseAttuali: 10000,
          limiteArt23: 150000,
          limiteArt23Attualizzato: 150000,
          margineArt23: 20000,
          superamentoArt23: 0,
          limiteCertificatoUtilizzato: false,
          limite2016Base: 150000,
          fonteLimite2016: 'CERTIFICATO',
          totaleVoci2016Ricostruite: 150000,
          baseAccessorio2018ProCapite: 0,
          valoreMedioProCapite2018: 0,
          differenzaPersonale: 0,
          incrementoProCapiteLimite: 0,
          dipendentiEquivalenti2018: 0,
          dipendentiEquivalenti2026: 0,
          incrementoStabileAumentoPersonale: 0,
          fondoCertificatoParteStabile2018: 0,
        },
      },
    };

    render(<Wizard2026SummaryPanel state={state} />);

    expect(screen.getByText("Raccolta dati dell'Ente")).toBeInTheDocument();
    expect(screen.getByText('Errori Bloccanti')).toBeInTheDocument();
    expect(screen.getByText('Avvisi / Warning')).toBeInTheDocument();
    expect(screen.getByText('Non ancora attivo')).toBeInTheDocument();
    
    const transferBtn = screen.getByRole('button', { name: 'Trasferisci i dati alla costituzione del fondo e compila' });
    expect(transferBtn).toBeInTheDocument();
    expect(transferBtn).toBeDisabled();
    
    expect(screen.getByText('Non ancora attivo: sarà disponibile dopo il refactoring.')).toBeInTheDocument();
    expect(screen.getByText(/150\.000,00/)).toBeInTheDocument();
  });

  it('2. Mostra correttamente le righe relative al Fondo per lo straordinario (MOD-017)', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      straordinario: {
        ...initialWizard2026DraftState.straordinario,
        result: {
          straordinarioOrdinarioSoggettoArt23: 25000,
          incrementoStraordinarioOrdinarioSoggettoArt23: 3500,
          riduzioneFondoDecentratoPerStraordinario: 1000,
          economieStraordinarioAnnoPrecedenteDaRiversare: 1500,
          totaleStraordinarioEsclusoArt23: 4000,
          straordinarioEsclusoArt23Elezioni: 2000,
          straordinarioEsclusoArt23Calamita: 2000,
          straordinarioEsclusoArt23Istat: 0,
          straordinarioEsclusoArt23PoliziaLocaleDeroga: 0,
          economieStraordinarioCalcolate: 1500,
          differenzaEconomieCalcolateCertificate: 0,
          isCalcolabile: true,
          fondoStraordinarioOrdinarioResiduo: 24000,
          incrementoParteStabileDaRiduzioneStraordinario: 1000,
          straordinarioOrdinarioFinaleSoggettoArt23: 25000,
          // Retrocompatibilità
          incrementoAmmesso: 3500,
          incrementoNonAmmesso: 0,
          riduzioneFondoDecentratoNecessaria: 1000,
          economieDaTrasferireVariabileUnaTantum: 1500,
          totaleRisorseEscluse: 4000,
          fondoStraordinarioOrdinarioAggiornato: 28500,
        }
      }
    };

    render(<Wizard2026SummaryPanel state={state} />);

    expect(screen.getByText('Residuo straordinario ordinario')).toBeInTheDocument();
    expect(screen.getByText('Riduzione stabile straordinario (Art. 67)')).toBeInTheDocument();
    expect(screen.getByText('Straordinario ordinario finale soggetto Art. 23')).toBeInTheDocument();
    expect(screen.getByText('Incremento ordinario straordinario')).toBeInTheDocument();
    expect(screen.getByText('Riduzione Fondo per straordinario')).toBeInTheDocument();
    expect(screen.getByText('Economie straordinario da riversare')).toBeInTheDocument();
    expect(screen.getByText('Straordinario escluso Art. 23')).toBeInTheDocument();

    expect(screen.getByText(/^24\.?000,00/)).toBeInTheDocument();
    expect(screen.getByText(/^1\.?000,00/)).toBeInTheDocument();
    expect(screen.getByText(/^25\.?000,00/)).toBeInTheDocument();
    expect(screen.getByText(/^3\.?500,00/)).toBeInTheDocument();
    expect(screen.getByText(/^-1\.?000,00/)).toBeInTheDocument();
    expect(screen.getByText(/^1\.?500,00/)).toBeInTheDocument();
    expect(screen.getByText(/^4\.?000,00/)).toBeInTheDocument();
  });
});

