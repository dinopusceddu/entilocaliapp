import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Wizard2026SummaryPanel } from '../Wizard2026SummaryPanel';
import { initialWizard2026DraftState, Wizard2026DraftState } from '../../index';
import { calculateArt23Limit } from '../../../../logic/wizard2026/art23Limit';

describe('Wizard2026SummaryPanel (MOD-005)', () => {
  it.each([undefined, 0, 125000.5])('qualifica il limite storico %s anche nella scheda laterale', limit => {
    const art23 = { ...initialWizard2026DraftState.art23, limite2016CertificatoEnte: limit };
    art23.result = calculateArt23Limit(art23);
    const state = { ...initialWizard2026DraftState, art23 };
    render(<Wizard2026SummaryPanel state={state} />);
    const card = screen.getAllByText('Limite Art. 23, comma 2, attualizzato').find(node => node.tagName === 'SPAN')!.parentElement!;
    if (limit === undefined) {
      expect(within(card).getByText('n/d')).toBeInTheDocument();
      expect(within(card).queryByText(/0,00/)).not.toBeInTheDocument();
      expect(screen.getByText(/Non determinabile: manca la base storica/)).toBeInTheDocument();
    } else {
      expect(card.textContent).toContain(new Intl.NumberFormat('it-IT', {style:'currency', currency:'EUR'}).format(limit));
      expect(within(card).queryByText('n/d')).not.toBeInTheDocument();
    }
  });
  it('1. Mostra i contatori iniziali e il motivo operativo di indisponibilità senza testo di sviluppo', () => {
    const state: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      art23: {
        ...initialWizard2026DraftState.art23,
        limite2016CertificatoEnte: 150000,
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
    expect(screen.getByText('Avvisi')).toBeInTheDocument();
    expect(screen.getByText('Dati da completare')).toBeInTheDocument();
    
    const transferBtn = screen.getByRole('button', { name: 'Trasferisci i dati alla costituzione del fondo e compila' });
    expect(transferBtn).toBeInTheDocument();
    expect(transferBtn).toBeDisabled();
    
    expect(screen.getByText(/Seleziona ente e annualità/)).toBeInTheDocument();
    expect(screen.queryByText(/refactoring/i)).not.toBeInTheDocument();
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

