import { describe, it, expect } from 'vitest';
import { calculateStraordinarioIncrement, validateStraordinarioIncrement, StraordinarioIncrementInput } from '../straordinarioIncrement';

describe('Fondo Lavoro Straordinario — Wizard 2026', () => {
  it('1. Ente con dirigenza: errore se incremento finanziato riducendo il Fondo', () => {
    const input: StraordinarioIncrementInput = {
      hasDirigenza: true,
      quotaFinanziataConRiduzioneFondo: 5000,
    };
    const checks = validateStraordinarioIncrement(input);
    const err = checks.find(c => c.id === 'STRAORD-DIR-RIDUZIONE-VIOLATION');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
  });

  it('2. Ente senza dirigenza: riduzione Fondo ammessa solo con contrattazione integrativa', () => {
    const inputNoIntegrativa: StraordinarioIncrementInput = {
      hasDirigenza: false,
      quotaFinanziataConRiduzioneFondo: 5000,
      contrattazioneIntegrativaRiduzioneFondo: false,
    };
    const checksNo = validateStraordinarioIncrement(inputNoIntegrativa);
    expect(checksNo.find(c => c.id === 'STRAORD-NO-DIR-CONTRATTAZIONE-MISSING')).toBeDefined();

    const inputWithIntegrativa: StraordinarioIncrementInput = {
      hasDirigenza: false,
      quotaFinanziataConRiduzioneFondo: 5000,
      contrattazioneIntegrativaRiduzioneFondo: true,
    };
    const checksWith = validateStraordinarioIncrement(inputWithIntegrativa);
    expect(checksWith.find(c => c.id === 'STRAORD-NO-DIR-CONTRATTAZIONE-MISSING')).toBeUndefined();
  });

  it('3. Economie anno precedente calcolate e certificate correttamente', () => {
    // Solo calcolate
    const inputCalc: StraordinarioIncrementInput = {
      stanziamentoStraordinarioOrdinarioAnnoPrecedente: 20000,
      spesaStraordinarioOrdinarioAnnoPrecedente: 15000,
    };
    const resCalc = calculateStraordinarioIncrement(inputCalc);
    expect(resCalc.economieStraordinarioCalcolate).toBe(5000);
    expect(resCalc.economieStraordinarioAnnoPrecedenteDaRiversare).toBe(5000);
    expect(resCalc.differenzaEconomieCalcolateCertificate).toBe(0);

    // Con dato certificato che sovrascrive
    const inputCert: StraordinarioIncrementInput = {
      stanziamentoStraordinarioOrdinarioAnnoPrecedente: 20000,
      spesaStraordinarioOrdinarioAnnoPrecedente: 15000,
      economieStraordinarioCertificate: 4000,
    };
    const resCert = calculateStraordinarioIncrement(inputCert);
    expect(resCert.economieStraordinarioCalcolate).toBe(5000);
    expect(resCert.economieStraordinarioAnnoPrecedenteDaRiversare).toBe(4000);
    expect(resCert.differenzaEconomieCalcolateCertificate).toBe(1000); // 5000 - 4000
  });

  it('4. Economie negative generano errore bloccante', () => {
    const input: StraordinarioIncrementInput = {
      stanziamentoStraordinarioOrdinarioAnnoPrecedente: 10000,
      spesaStraordinarioOrdinarioAnnoPrecedente: 12000,
    };
    const checks = validateStraordinarioIncrement(input);
    const err = checks.find(c => c.id === 'STRAORD-ECONOMIE-NEGATIVE');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
  });

  it('5. Risorse escluse non entrano nel limite art. 23 e sono sommate correttamente', () => {
    const input: StraordinarioIncrementInput = {
      fondoStraordinarioOrdinarioAnnoCorrente: 30000,
      incrementoStraordinarioOrdinarioProposto: 2000,
      quotaFinanziataConCapienzaArt23: 2000,
      risorseEscluse: [
        {
          id: '1',
          tipologia: 'elezioniReferendum',
          importo: 4000,
          fonteNormativaFinanziaria: 'Legge Elezioni',
          esclusaDaArt23: true,
        },
        {
          id: '2',
          tipologia: 'calamitaEventiStraordinari',
          importo: 1500,
          fonteNormativaFinanziaria: 'Dl Calamità',
          esclusaDaArt23: true,
        },
        {
          id: '3',
          tipologia: 'istatCensimenti',
          importo: 800,
          fonteNormativaFinanziaria: 'Censimento Istat',
          esclusaDaArt23: true,
        },
        {
          id: '4',
          tipologia: 'poliziaLocaleDeroga',
          importo: 1200,
          fonteNormativaFinanziaria: 'Deroga PL',
          esclusaDaArt23: true,
        },
      ],
    };

    const res = calculateStraordinarioIncrement(input);
    expect(res.straordinarioOrdinarioSoggettoArt23).toBe(32000);
    expect(res.straordinarioEsclusoArt23Elezioni).toBe(4000);
    expect(res.straordinarioEsclusoArt23Calamita).toBe(1500);
    expect(res.straordinarioEsclusoArt23Istat).toBe(800);
    expect(res.straordinarioEsclusoArt23PoliziaLocaleDeroga).toBe(1200);
    expect(res.totaleStraordinarioEsclusoArt23).toBe(7500);
  });

  it('6. Risorsa esclusa senza fonte normativa/finanziaria genera errore', () => {
    const input: StraordinarioIncrementInput = {
      risorseEscluse: [
        {
          id: '1',
          tipologia: 'elezioniReferendum',
          importo: 4000,
          esclusaDaArt23: true,
        },
      ],
    };
    const checks = validateStraordinarioIncrement(input);
    const err = checks.find(c => c.id === 'STRAORD-ESCLUSA-FONTE-MISSING');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
  });

  it('7. Altra fattispecie esclusa senza motivazione genera errore', () => {
    const input: StraordinarioIncrementInput = {
      risorseEscluse: [
        {
          id: '1',
          tipologia: 'altraFattispecieEsclusa',
          importo: 4000,
          fonteNormativaFinanziaria: 'Norma X',
          esclusaDaArt23: true,
        },
      ],
    };
    const checks = validateStraordinarioIncrement(input);
    const err = checks.find(c => c.id === 'STRAORD-ALTRA-MOTIVAZIONE-MISSING');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
  });

  it('8. Polizia Locale in deroga senza fonte genera warning', () => {
    const input: StraordinarioIncrementInput = {
      risorseEscluse: [
        {
          id: '1',
          tipologia: 'poliziaLocaleDeroga',
          importo: 2000,
          esclusaDaArt23: true,
        },
      ],
    };
    const checks = validateStraordinarioIncrement(input);
    // Nota: in validateStraordinarioIncrement c'è un controllo che fa scattare l'errore per fonte mancante,
    // e per la Polizia locale in deroga fa scattare ANCHE un warning aggiuntivo.
    const warn = checks.find(c => c.id === 'STRAORD-POLIZIA-FONTE-WARNING');
    expect(warn).toBeDefined();
    expect(warn?.severity).toBe('warning');
  });

  it('9. Warning per confusione se descrizione ordinario contiene parole sospette', () => {
    const input: StraordinarioIncrementInput = {
      fonteDatoStraordinarioOrdinario: 'Fondo comprendente straordinario per elezioni politiche',
    };
    const checks = validateStraordinarioIncrement(input);
    const warn = checks.find(c => c.id === 'STRAORD-ORDINARIO-CONFUSION');
    expect(warn).toBeDefined();
    expect(warn?.severity).toBe('warning');
  });

  it('10. Ente strutturalmente deficitario senza approvazione COSFEL genera errore per incrementi', () => {
    const inputNoApprovazione: StraordinarioIncrementInput = {
      isStrutturalmenteDeficitario: true,
      incrementoStraordinarioOrdinario: 5000,
      hasApprovazioneCosfel: false,
    };
    const checks = validateStraordinarioIncrement(inputNoApprovazione);
    expect(checks.find(c => c.id === 'COSFEL-BLOCKED-STRAORDINARIO')).toBeDefined();
  });

  it('11. Calcolo riduzione stabile Art. 67 e straordinario ordinario finale soggetto Art. 23', () => {
    const input: StraordinarioIncrementInput = {
      fondoStraordinarioOrdinarioAnnoCorrente: 12000,
      riduzioneStabileStraordinarioArt67: 2000,
      quotaFinanziataConCapienzaArt23: 1500,
      quotaFinanziataConRiduzioneFondo: 500,
    };
    const res = calculateStraordinarioIncrement(input);
    expect(res.fondoStraordinarioOrdinarioResiduo).toBe(10000);
    expect(res.incrementoParteStabileDaRiduzioneStraordinario).toBe(2000);
    expect(res.incrementoStraordinarioOrdinarioSoggettoArt23).toBe(2000);
    expect(res.straordinarioOrdinarioFinaleSoggettoArt23).toBe(12000);
    expect(res.straordinarioOrdinarioSoggettoArt23).toBe(12000);
  });

  it('12. Riduzione stabile superiore allo stanziamento genera errore bloccante', () => {
    const input: StraordinarioIncrementInput = {
      fondoStraordinarioOrdinarioAnnoCorrente: 10000,
      riduzioneStabileStraordinarioArt67: 11000,
    };
    const checks = validateStraordinarioIncrement(input);
    const err = checks.find(c => c.id === 'STRAORD-RIDUZIONE-STABILE-SUPERA-FONDO');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
  });
});
