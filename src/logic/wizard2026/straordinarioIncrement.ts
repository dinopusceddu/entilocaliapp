import { Wizard2026Check } from './checks';

export interface RisorsaEsclusaStraordinario {
  id: string;
  tipologia: 'elezioniReferendum' | 'calamitaEventiStraordinari' | 'istatCensimenti' | 'poliziaLocaleDeroga' | 'altraFattispecieEsclusa';
  importo?: number;
  fonteNormativaFinanziaria?: string;
  descrizione?: string;
  esclusaDaArt23: boolean;
}

export interface StraordinarioIncrementInput {
  hasDirigenza?: boolean;
  margineArt23?: number;
  isStrutturalmenteDeficitario?: boolean;
  hasApprovazioneCosfel?: boolean;

  // Sezione 1
  fondoStraordinarioOrdinario2016?: number;
  fondoStraordinarioOrdinarioAnnoCorrente?: number;
  incrementoStraordinarioOrdinarioProposto?: number;
  fonteDatoStraordinarioOrdinario?: string;

  // Sezione 1-bis
  riduzioneStabileStraordinarioArt67?: number;

  // Sezione 2
  incrementoStraordinarioOrdinario?: number;
  quotaFinanziataConCapienzaArt23?: number;
  quotaFinanziataConRiduzioneFondo?: number;
  contrattazioneIntegrativaRiduzioneFondo?: boolean;

  // Sezione 3
  risorseEscluse?: RisorsaEsclusaStraordinario[];

  // Sezione 4
  stanziamentoStraordinarioOrdinarioAnnoPrecedente?: number;
  spesaStraordinarioOrdinarioAnnoPrecedente?: number;
  economieStraordinarioCertificate?: number;

  // Campi di retrocompatibilità
  fondoStraordinario2016?: number;
  fondoStraordinarioAnnoCorrente?: number;
  incrementoRichiesto?: number;
  riduzioneFondoDecentrato?: number;
  economieStraordinarioAnnoPrecedente?: number;
  straordinarioElettoraleEscluso?: number;
  straordinarioCalamitaEscluso?: number;
  altreRisorseStraordinarioEscluse?: number;
}

export interface StraordinarioIncrementResult {
  // Output richiesti
  straordinarioOrdinarioSoggettoArt23: number;
  incrementoStraordinarioOrdinarioSoggettoArt23: number;
  riduzioneFondoDecentratoPerStraordinario: number;
  economieStraordinarioAnnoPrecedenteDaRiversare: number;
  totaleStraordinarioEsclusoArt23: number;

  // Dettagli esclusi per tipologia
  straordinarioEsclusoArt23Elezioni: number;
  straordinarioEsclusoArt23Calamita: number;
  straordinarioEsclusoArt23Istat: number;
  straordinarioEsclusoArt23PoliziaLocaleDeroga: number;

  // Indicatori di calcolo
  economieStraordinarioCalcolate: number;
  differenzaEconomieCalcolateCertificate: number;
  isCalcolabile: boolean;

  // Nuove voci di calcolo e destinazione MOD-017
  fondoStraordinarioOrdinarioResiduo: number;
  incrementoParteStabileDaRiduzioneStraordinario: number;
  straordinarioOrdinarioFinaleSoggettoArt23: number;

  // Campi retrocompatibilità
  incrementoAmmesso: number;
  incrementoNonAmmesso: number;
  riduzioneFondoDecentratoNecessaria: number;
  economieDaTrasferireVariabileUnaTantum: number;
  totaleRisorseEscluse: number;
  fondoStraordinarioOrdinarioAggiornato: number;
}

export function calculateStraordinarioIncrement(input: StraordinarioIncrementInput): StraordinarioIncrementResult {
  const fondoOrdCorrente = input.fondoStraordinarioOrdinarioAnnoCorrente !== undefined
    ? input.fondoStraordinarioOrdinarioAnnoCorrente
    : (input.fondoStraordinarioAnnoCorrente || 0);

  const riduzioneStabile = input.riduzioneStabileStraordinarioArt67 || 0;
  const fondoStraordinarioOrdinarioResiduo = Math.max(0, fondoOrdCorrente - riduzioneStabile);
  const incrementoParteStabileDaRiduzioneStraordinario = riduzioneStabile;

  const quotaCapienza = input.quotaFinanziataConCapienzaArt23 || 0;
  const quotaRiduzione = input.quotaFinanziataConRiduzioneFondo !== undefined
    ? input.quotaFinanziataConRiduzioneFondo
    : (input.riduzioneFondoDecentrato || 0);
  const incrementoStraordinarioOrdinarioAmmesso = quotaCapienza + quotaRiduzione;

  const straordinarioOrdinarioFinaleSoggettoArt23 = fondoStraordinarioOrdinarioResiduo + incrementoStraordinarioOrdinarioAmmesso;

  // Output mappabile compatibile
  const straordinarioOrdinarioSoggettoArt23 = straordinarioOrdinarioFinaleSoggettoArt23;
  const incrementoStraordinarioOrdinarioSoggettoArt23 = incrementoStraordinarioOrdinarioAmmesso;
  const riduzioneFondoDecentratoPerStraordinario = quotaRiduzione;

  let straordinarioEsclusoArt23Elezioni = 0;
  let straordinarioEsclusoArt23Calamita = 0;
  let straordinarioEsclusoArt23Istat = 0;
  let straordinarioEsclusoArt23PoliziaLocaleDeroga = 0;
  let totaleStraordinarioEsclusoArt23 = 0;

  if (input.risorseEscluse) {
    for (const r of input.risorseEscluse) {
      if (r.esclusaDaArt23) {
        const importo = r.importo || 0;
        totaleStraordinarioEsclusoArt23 += importo;
        if (r.tipologia === 'elezioniReferendum') {
          straordinarioEsclusoArt23Elezioni += importo;
        } else if (r.tipologia === 'calamitaEventiStraordinari') {
          straordinarioEsclusoArt23Calamita += importo;
        } else if (r.tipologia === 'istatCensimenti') {
          straordinarioEsclusoArt23Istat += importo;
        } else if (r.tipologia === 'poliziaLocaleDeroga') {
          straordinarioEsclusoArt23PoliziaLocaleDeroga += importo;
        }
      }
    }
  } else {
    // Retrocompatibilità
    straordinarioEsclusoArt23Elezioni = input.straordinarioElettoraleEscluso || 0;
    straordinarioEsclusoArt23Calamita = input.straordinarioCalamitaEscluso || 0;
    const altreEscluse = input.altreRisorseStraordinarioEscluse || 0;
    totaleStraordinarioEsclusoArt23 = straordinarioEsclusoArt23Elezioni + straordinarioEsclusoArt23Calamita + altreEscluse;
  }

  const stanziamentoPrec = input.stanziamentoStraordinarioOrdinarioAnnoPrecedente || 0;
  const spesaPrec = input.spesaStraordinarioOrdinarioAnnoPrecedente || 0;
  const economieStraordinarioCalcolate = stanziamentoPrec - spesaPrec;

  let economieStraordinarioAnnoPrecedenteDaRiversare = 0;
  if (input.economieStraordinarioCertificate !== undefined) {
    economieStraordinarioAnnoPrecedenteDaRiversare = input.economieStraordinarioCertificate;
  } else if (input.economieStraordinarioAnnoPrecedente !== undefined) {
    // Retrocompatibilità
    economieStraordinarioAnnoPrecedenteDaRiversare = input.economieStraordinarioAnnoPrecedente;
  } else {
    economieStraordinarioAnnoPrecedenteDaRiversare = Math.max(0, economieStraordinarioCalcolate);
  }

  const differenzaEconomieCalcolateCertificate = input.economieStraordinarioCertificate !== undefined
    ? economieStraordinarioCalcolate - input.economieStraordinarioCertificate
    : 0;

  const isCalcolabile = true;

  // Retrocompatibilità fields
  const incrementoAmmesso = incrementoStraordinarioOrdinarioSoggettoArt23;
  const richiestoCcnl = input.incrementoStraordinarioOrdinario || 0;
  const incrementoNonAmmesso = Math.max(0, richiestoCcnl - incrementoAmmesso);
  const riduzioneFondoDecentratoNecessaria = riduzioneFondoDecentratoPerStraordinario;
  const economieDaTrasferireVariabileUnaTantum = economieStraordinarioAnnoPrecedenteDaRiversare;
  const totaleRisorseEscluse = totaleStraordinarioEsclusoArt23;
  const fondoStraordinarioOrdinarioAggiornato = straordinarioOrdinarioFinaleSoggettoArt23;

  return {
    straordinarioOrdinarioSoggettoArt23,
    incrementoStraordinarioOrdinarioSoggettoArt23,
    riduzioneFondoDecentratoPerStraordinario,
    economieStraordinarioAnnoPrecedenteDaRiversare,
    totaleStraordinarioEsclusoArt23,
    straordinarioEsclusoArt23Elezioni,
    straordinarioEsclusoArt23Calamita,
    straordinarioEsclusoArt23Istat,
    straordinarioEsclusoArt23PoliziaLocaleDeroga,
    economieStraordinarioCalcolate,
    differenzaEconomieCalcolateCertificate,
    isCalcolabile,
    fondoStraordinarioOrdinarioResiduo,
    incrementoParteStabileDaRiduzioneStraordinario,
    straordinarioOrdinarioFinaleSoggettoArt23,
    incrementoAmmesso,
    incrementoNonAmmesso,
    riduzioneFondoDecentratoNecessaria,
    economieDaTrasferireVariabileUnaTantum,
    totaleRisorseEscluse,
    fondoStraordinarioOrdinarioAggiornato,
  };
}

export function validateStraordinarioIncrement(input: StraordinarioIncrementInput): Wizard2026Check[] {
  const checks: Wizard2026Check[] = [];

  // Sezione 1-bis (Riduzione Stabile Art 67)
  const fondoOrdCorrente = input.fondoStraordinarioOrdinarioAnnoCorrente !== undefined
    ? input.fondoStraordinarioOrdinarioAnnoCorrente
    : (input.fondoStraordinarioAnnoCorrente || 0);
  const riduzioneStabile = input.riduzioneStabileStraordinarioArt67 || 0;

  if (riduzioneStabile > fondoOrdCorrente) {
    checks.push({
      id: 'STRAORD-RIDUZIONE-STABILE-SUPERA-FONDO',
      severity: 'error',
      step: 'Step 6 — Fondo Lavoro Straordinario',
      message: 'La riduzione stabile del fondo straordinario non può superare lo stanziamento ordinario del fondo straordinario dell’anno corrente.',
      field: 'riduzioneStabileStraordinarioArt67',
      norma: 'Art. 67, CCNL 21.5.2018',
      currentValue: riduzioneStabile,
      expectedValue: fondoOrdCorrente,
    });
  }

  // Sezione 2 rules
  const quotaRiduzione = input.quotaFinanziataConRiduzioneFondo !== undefined
    ? input.quotaFinanziataConRiduzioneFondo
    : (input.riduzioneFondoDecentrato || 0);
  const quotaCapienza = input.quotaFinanziataConCapienzaArt23 || 0;
  const ccnlIncrement = input.incrementoStraordinarioOrdinario !== undefined
    ? input.incrementoStraordinarioOrdinario
    : (input.incrementoRichiesto || 0);

  if (input.hasDirigenza === true) {
    if (quotaRiduzione > 0) {
      checks.push({
        id: 'STRAORD-DIR-RIDUZIONE-VIOLATION',
        severity: 'error',
        step: 'Step 6 — Fondo Lavoro Straordinario',
        message: "Negli enti con dirigenza l'incremento dello straordinario non può essere finanziato riducendo il Fondo risorse decentrate.",
        field: 'quotaFinanziataConRiduzioneFondo',
        norma: 'Art. 67, CCNL 23.02.2026',
        currentValue: quotaRiduzione,
        expectedValue: 0,
      });
    }
  } else if (input.hasDirigenza === false) {
    if (quotaRiduzione > 0 && input.contrattazioneIntegrativaRiduzioneFondo !== true) {
      checks.push({
        id: 'STRAORD-NO-DIR-CONTRATTAZIONE-MISSING',
        severity: 'error',
        step: 'Step 6 — Fondo Lavoro Straordinario',
        message: 'Negli enti senza dirigenza la riduzione del Fondo per finanziare lo straordinario richiede previa contrattazione integrativa.',
        field: 'contrattazioneIntegrativaRiduzioneFondo',
        norma: 'Art. 67, CCNL 23.02.2026',
        currentValue: input.contrattazioneIntegrativaRiduzioneFondo,
        expectedValue: true,
      });
    }
  } else {
    // hasDirigenza is undefined/null
    if (ccnlIncrement > 0 || quotaCapienza > 0 || quotaRiduzione > 0) {
      checks.push({
        id: 'STRAORD-DIRIGENZA-MISSING',
        severity: 'warning',
        step: 'Step 6 — Fondo Lavoro Straordinario',
        message: 'Impossibile verificare l’incremento richiesto: il dato sulla presenza del personale Dirigente nello Step 1 è mancante.',
        field: 'incrementoStraordinarioOrdinario',
        norma: 'Art. 67, CCNL 23.02.2026',
      });
    }
  }

  // Warning if ccnl increment is present but capienza art. 23 not yet verified or insufficient
  if (ccnlIncrement > 0 && quotaCapienza > 0) {
    const margine = input.margineArt23 || 0;
    if (input.margineArt23 === undefined || margine <= 0 || quotaCapienza > margine) {
      checks.push({
        id: 'STRAORD-CCNL-CAPIENZA-NOT-VERIFIED',
        severity: 'warning',
        step: 'Step 6 — Fondo Lavoro Straordinario',
        message: 'Incremento ordinario presente ma capienza art. 23 non ancora verificata o insufficiente.',
        field: 'quotaFinanziataConCapienzaArt23',
        norma: 'Art. 23, D.Lgs. 75/2017',
      });
    }
  }

  // Sezione 3 rules (Esclusi)
  if (input.risorseEscluse) {
    for (const r of input.risorseEscluse) {
      if (r.esclusaDaArt23) {
        if (!r.fonteNormativaFinanziaria || r.fonteNormativaFinanziaria.trim() === '') {
          checks.push({
            id: 'STRAORD-ESCLUSA-FONTE-MISSING',
            severity: 'error',
            step: 'Step 6 — Fondo Lavoro Straordinario',
            message: `La risorsa esclusa di tipo "${r.tipologia}" richiede obbligatoriamente l'indicazione della fonte normativa o finanziaria.`,
            field: 'risorseEscluse',
            norma: 'Art. 23, comma 2, D.Lgs. 75/2017',
          });
        }
        if (r.tipologia === 'altraFattispecieEsclusa' && (!r.descrizione || r.descrizione.trim() === '')) {
          checks.push({
            id: 'STRAORD-ALTRA-MOTIVAZIONE-MISSING',
            severity: 'error',
            step: 'Step 6 — Fondo Lavoro Straordinario',
            message: 'Le risorse classificate come "Altra fattispecie esclusa" richiedono una descrizione/motivazione obbligatoria.',
            field: 'risorseEscluse',
            norma: 'Art. 23, comma 2, D.Lgs. 75/2017',
          });
        }
        if (r.tipologia === 'poliziaLocaleDeroga' && (!r.fonteNormativaFinanziaria || r.fonteNormativaFinanziaria.trim() === '')) {
          // Warning specific for Polizia Locale if empty
          checks.push({
            id: 'STRAORD-POLIZIA-FONTE-WARNING',
            severity: 'warning',
            step: 'Step 6 — Fondo Lavoro Straordinario',
            message: 'Risorsa per Polizia Locale in deroga inserita senza indicare la fonte di finanziamento o la base derogatoria specifica.',
            field: 'risorseEscluse',
            norma: 'Art. 23, comma 2, D.Lgs. 75/2017',
          });
        }
      }
    }
  }

  // Sezione 4 rules (Economie)
  const stanziamentoPrec = input.stanziamentoStraordinarioOrdinarioAnnoPrecedente;
  const spesaPrec = input.spesaStraordinarioOrdinarioAnnoPrecedente;
  if (stanziamentoPrec !== undefined && spesaPrec !== undefined) {
    const economieStraordinarioCalcolate = stanziamentoPrec - spesaPrec;
    if (economieStraordinarioCalcolate < 0) {
      checks.push({
        id: 'STRAORD-ECONOMIE-NEGATIVE',
        severity: 'error',
        step: 'Step 6 — Fondo Lavoro Straordinario',
        message: `Le economie calcolate dello straordinario non possono essere negative (stanziamento: € ${stanziamentoPrec.toFixed(2)}, spesa: € ${spesaPrec.toFixed(2)}).`,
        field: 'spesaStraordinarioOrdinarioAnnoPrecedente',
        norma: 'Art. 67, CCNL 23.02.2026',
        currentValue: economieStraordinarioCalcolate,
        expectedValue: 0,
      });
    }
  } else {
    // economie straordinario non inserite
    checks.push({
      id: 'STRAORD-ECONOMIE-NOT-SET',
      severity: 'warning',
      step: 'Step 6 — Fondo Lavoro Straordinario',
      message: "Dati sulle economie dello straordinario dell'anno precedente non inseriti (stanziamento e/o spesa mancanti).",
      field: 'stanziamentoStraordinarioOrdinarioAnnoPrecedente',
      norma: 'Art. 67, CCNL 23.02.2026',
    });
  }

  // Confusion detection on Section 1
  const keywords = ['elezioni', 'referendum', 'calamit', 'covid', 'istat', 'censiment', 'polizia locale', 'esclus', 'derog'];
  const fonteOrdinario = (input.fonteDatoStraordinarioOrdinario || '').toLowerCase();
  const hasConfusion = keywords.some(k => fonteOrdinario.includes(k));
  if (hasConfusion) {
    checks.push({
      id: 'STRAORD-ORDINARIO-CONFUSION',
      severity: 'warning',
      step: 'Step 6 — Fondo Lavoro Straordinario',
      message: "Attenzione: la fonte o la descrizione dell'ordinario contiene riferimenti a risorse potenzialmente escluse (elezioni, calamità, ISTAT, Polizia Locale). Verificare di aver inserito solo lo straordinario ordinario.",
      field: 'fonteDatoStraordinarioOrdinario',
      norma: 'Art. 23, D.Lgs. 75/2017',
    });
  }

  // COSFEL checks (deficitary/dissesto)
  const richiestoTot = (input.incrementoStraordinarioOrdinarioProposto || 0) +
    (input.incrementoStraordinarioOrdinario !== undefined
      ? input.incrementoStraordinarioOrdinario
      : (input.incrementoRichiesto || 0));
  if (input.isStrutturalmenteDeficitario === true) {
    if (richiestoTot > 0) {
      if (input.hasApprovazioneCosfel === false) {
        checks.push({
          id: 'COSFEL-BLOCKED-STRAORDINARIO',
          severity: 'error',
          step: 'Step 6 — Fondo Lavoro Straordinario',
          message: 'Ente strutturalmente deficitario: gli incrementi discrezionali dello straordinario sono preclusi in quanto l’approvazione/autorizzazione COSFEL non è stata acquisita.',
          field: 'incrementoStraordinarioOrdinario',
          norma: 'COSFEL / Straordinario',
        });
      } else if (input.hasApprovazioneCosfel === undefined) {
        checks.push({
          id: 'COSFEL-MISSING-STRAORDINARIO',
          severity: 'warning',
          step: 'Step 6 — Fondo Lavoro Straordinario',
          message: 'Dato mancante: Approvazione/autorizzazione COSFEL per l’incremento di straordinario richiesto. Verificare lo stato di acquisizione.',
          field: 'incrementoStraordinarioOrdinario',
          norma: 'COSFEL / Straordinario',
        });
      }
    }

    checks.push({
      id: 'COSFEL-WARNING-STRAORDINARIO',
      severity: 'warning',
      step: 'Step 6 — Fondo Lavoro Straordinario',
      message: 'Verificare la compatibilità dell’incremento con il regime autorizzatorio COSFEL prima di inserirlo nella costituzione del fondo.',
      norma: 'COSFEL / Straordinario',
    });
  }

  return checks;
}

