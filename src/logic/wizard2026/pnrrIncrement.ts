import { Wizard2026Check } from './checks';

export interface PnrrIncrementInput {
  annoRiferimento?: number; // Sezione 1
  soggettoAttuatorePnrr?: boolean | null; // Sezione 1

  // Sezione 2 - Base di calcolo 2016
  componenteStabileFondoDipendenti2016?: number;
  componenteStabileFondoDirigenza2016?: number;
  hasDirigenza?: boolean;

  // Sezione 3 - Condizioni contabili riferite all'esercizio precedente
  equilibrioEsercizioPrecedente?: boolean | null;
  parametriDebitoCommercialeEsercizioPrecedente?: boolean | null;
  incidenzaSalarioAccessorioScelta?: 'diretto' | 'assistito';
  incidenzaSalarioAccessorioPercentuale?: number;
  salarioAccessorioIndicatori?: number;
  spesaPersonaleIndicatori?: number;
  rendicontoApprovatoTermini?: boolean | null;

  // Sezione 4 - Criticità finanziarie e COSFEL
  isDissesto?: boolean;
  isStrutturalmenteDeficitario?: boolean;
  isPianoRiequilibrio?: boolean;
  hasApprovazioneCosfel?: boolean;

  // Campi legacy per retrocompatibilità
  componenteStabile2016?: number;
  incrementoApplicato?: number;
  enteInEquilibrio?: boolean;
  requisitiVerificati?: boolean;
}

export interface PnrrIncrementResult {
  isApplicabile: boolean;
  isValidable: boolean;
  
  limiteMassimoPnrrFondoDipendenti?: number;
  limiteMassimoPnrrFondoDirigenza?: number;
  totaleLimiteMassimoPnrr?: number;
  incidenzaSalarioAccessorioPercentualeCalcolata?: number;

  // Campi legacy per retrocompatibilità
  incrementoMassimoPnrr: number;
  incrementoApplicato: number;
  incrementoNonAmmesso: number;
}

export function calculatePnrrIncrement(input: PnrrIncrementInput): PnrrIncrementResult {
  const anno = input.annoRiferimento ?? 2026;
  const inPeriodo = anno >= 2023 && anno <= 2026;
  const isSoggetto = input.soggettoAttuatorePnrr;

  // 1. Verificare l'applicabilità
  const isApplicabile = inPeriodo && isSoggetto !== false;

  if (!isApplicabile) {
    return {
      isApplicabile: false,
      isValidable: false,
      incrementoMassimoPnrr: 0,
      incrementoApplicato: 0,
      incrementoNonAmmesso: 0,
    };
  }

  // 2. Controllo dati mancanti (validabilità)
  const dip2016 = input.componenteStabileFondoDipendenti2016;
  const dir2016 = input.componenteStabileFondoDirigenza2016;
  const hasDir = input.hasDirigenza;
  
  const eqPrec = input.equilibrioEsercizioPrecedente;
  const debPrec = input.parametriDebitoCommercialeEsercizioPrecedente;
  const rendPrec = input.rendicontoApprovatoTermini;
  
  const scelta = input.incidenzaSalarioAccessorioScelta ?? 'diretto';
  const pctDir = input.incidenzaSalarioAccessorioPercentuale;
  const indAcc = input.salarioAccessorioIndicatori;
  const indSpesa = input.spesaPersonaleIndicatori;

  // Verifichiamo se mancano dati obbligatori
  const missingBase = dip2016 === undefined || dip2016 === null;
  const missingDir = hasDir === true && (dir2016 === undefined || dir2016 === null);
  
  const missingChecklist = 
    eqPrec === undefined || eqPrec === null ||
    debPrec === undefined || debPrec === null ||
    rendPrec === undefined || rendPrec === null;

  let missingIncidenza = false;
  let incidenzaPercentuale: number | undefined = undefined;

  if (scelta === 'diretto') {
    if (pctDir === undefined || pctDir === null) {
      missingIncidenza = true;
    } else {
      incidenzaPercentuale = pctDir;
    }
  } else {
    if (indAcc === undefined || indAcc === null || indSpesa === undefined || indSpesa === null || indSpesa === 0) {
      missingIncidenza = true;
    } else {
      incidenzaPercentuale = (indAcc / indSpesa) * 100;
    }
  }

  const hasMissingRequiredFields = missingBase || missingDir || missingChecklist || missingIncidenza || isSoggetto === undefined || isSoggetto === null;

  if (hasMissingRequiredFields) {
    return {
      isApplicabile: true,
      isValidable: false,
      incidenzaSalarioAccessorioPercentualeCalcolata: incidenzaPercentuale,
      incrementoMassimoPnrr: 0,
      incrementoApplicato: 0,
      incrementoNonAmmesso: 0,
    };
  }

  // 3. Verifichiamo se ci sono requisiti contabili negativi
  const haRequisitoNegativo =
    eqPrec === false ||
    debPrec === false ||
    rendPrec === false ||
    (incidenzaPercentuale !== undefined && incidenzaPercentuale > 8);

  if (haRequisitoNegativo) {
    return {
      isApplicabile: true,
      isValidable: true,
      limiteMassimoPnrrFondoDipendenti: 0,
      limiteMassimoPnrrFondoDirigenza: hasDir ? 0 : undefined,
      totaleLimiteMassimoPnrr: 0,
      incidenzaSalarioAccessorioPercentualeCalcolata: incidenzaPercentuale,
      incrementoMassimoPnrr: 0,
      incrementoApplicato: 0,
      incrementoNonAmmesso: 0,
    };
  }

  // 4. Calcolo limiti
  const limiteMassimoPnrrFondoDipendenti = dip2016 * 0.05;
  const limiteMassimoPnrrFondoDirigenza = hasDir ? (dir2016! * 0.05) : undefined;
  const totaleLimiteMassimoPnrr = limiteMassimoPnrrFondoDipendenti + (limiteMassimoPnrrFondoDirigenza || 0);

  return {
    isApplicabile: true,
    isValidable: true,
    limiteMassimoPnrrFondoDipendenti,
    limiteMassimoPnrrFondoDirigenza,
    totaleLimiteMassimoPnrr,
    incidenzaSalarioAccessorioPercentualeCalcolata: incidenzaPercentuale,
    incrementoMassimoPnrr: totaleLimiteMassimoPnrr,
    incrementoApplicato: 0,
    incrementoNonAmmesso: 0,
  };
}

export function validatePnrrIncrement(input: PnrrIncrementInput): Wizard2026Check[] {
  const checks: Wizard2026Check[] = [];
  const res = calculatePnrrIncrement(input);

  const anno = input.annoRiferimento ?? 2026;
  const inPeriodo = anno >= 2023 && anno <= 2026;

  // Se fuori dal periodo temporale
  if (!inPeriodo) {
    return checks;
  }

  // Se non è soggetto attuatore PNRR
  if (input.soggettoAttuatorePnrr === false) {
    return checks;
  }

  // Se il dato di soggetto attuatore è mancante (undefined o null)
  if (input.soggettoAttuatorePnrr === undefined || input.soggettoAttuatorePnrr === null) {
    checks.push({
      id: 'PNRR-MISSING-SOGGETTO-ATTUATORE',
      severity: 'warning',
      step: 'Step 7 — PNRR',
      message: "Indicazione sulla soggettività attuatrice/titolare di progetti PNRR mancante.",
      field: 'soggettoAttuatorePnrr',
      norma: 'Art. 8, comma 3, D.L. 13/2023',
    });
  }

  // Se non validabile a causa di altri campi mancanti
  if (res.isApplicabile && !res.isValidable) {
    if (input.componenteStabileFondoDipendenti2016 === undefined || input.componenteStabileFondoDipendenti2016 === null) {
      checks.push({
        id: 'PNRR-MISSING-STABILE-DIPENDENTI-2016',
        severity: 'warning',
        step: 'Step 7 — PNRR',
        message: 'Componente stabile Fondo dipendenti 2016 mancante per il calcolo del limite 5% PNRR.',
        field: 'componenteStabileFondoDipendenti2016',
        norma: 'Art. 8, comma 3, D.L. 13/2023',
      });
    }

    if (input.hasDirigenza === undefined) {
      checks.push({
        id: 'PNRR-DIRIGENZA-NOT-INDICATED',
        severity: 'warning',
        step: 'Step 7 — PNRR',
        message: 'Presenza dirigenza non ancora indicata nello Step 1.',
        field: 'hasDirigenza',
        norma: 'Art. 8, comma 3, D.L. 13/2023',
      });
    } else if (input.hasDirigenza === true && (input.componenteStabileFondoDirigenza2016 === undefined || input.componenteStabileFondoDirigenza2016 === null)) {
      checks.push({
        id: 'PNRR-MISSING-STABILE-DIRIGENZA-2016',
        severity: 'warning',
        step: 'Step 7 — PNRR',
        message: 'Componente stabile Fondo dirigenza 2016 mancante per l\'ente con dirigenza.',
        field: 'componenteStabileFondoDirigenza2016',
        norma: 'Art. 8, comma 3, D.L. 13/2023',
      });
    }

    // Condizioni contabili mancanti
    const condMancanti = 
      input.equilibrioEsercizioPrecedente === undefined || input.equilibrioEsercizioPrecedente === null ||
      input.parametriDebitoCommercialeEsercizioPrecedente === undefined || input.parametriDebitoCommercialeEsercizioPrecedente === null ||
      input.rendicontoApprovatoTermini === undefined || input.rendicontoApprovatoTermini === null;

    let incMancante = false;
    if (input.incidenzaSalarioAccessorioScelta === 'diretto') {
      incMancante = input.incidenzaSalarioAccessorioPercentuale === undefined || input.incidenzaSalarioAccessorioPercentuale === null;
    } else {
      incMancante = input.salarioAccessorioIndicatori === undefined || input.salarioAccessorioIndicatori === null ||
                    input.spesaPersonaleIndicatori === undefined || input.spesaPersonaleIndicatori === null;
    }

    if (condMancanti || incMancante) {
      checks.push({
        id: 'PNRR-REQUISITI-MANCANTI',
        severity: 'warning',
        step: 'Step 7 — PNRR',
        message: 'Requisiti contabili dell\'esercizio precedente non completamente compilati: l\'istruttoria non è validabile.',
        norma: 'Art. 8, comma 3, D.L. 13/2023',
      });
    }
  }

  // Requisiti contabili negativi (bloccanti)
  if (res.isApplicabile && res.isValidable) {
    if (input.equilibrioEsercizioPrecedente === false) {
      checks.push({
        id: 'PNRR-NO-EQUILIBRIO',
        severity: 'error',
        step: 'Step 7 — PNRR',
        message: "Equilibrio di bilancio dell'esercizio precedente non rispettato: l'incremento PNRR non è attivabile (limite azzerato).",
        field: 'equilibrioEsercizioPrecedente',
        norma: 'Art. 8, comma 3, D.L. 13/2023',
        currentValue: false,
        expectedValue: true,
      });
    }

    if (input.parametriDebitoCommercialeEsercizioPrecedente === false) {
      checks.push({
        id: 'PNRR-NO-DEBITO-COMMERCIALE',
        severity: 'error',
        step: 'Step 7 — PNRR',
        message: "Parametri sul debito commerciale residuo o ritardo pagamenti dell'esercizio precedente non rispettati: l'incremento PNRR non è attivabile (limite azzerato).",
        field: 'parametriDebitoCommercialeEsercizioPrecedente',
        norma: 'Art. 8, comma 3, D.L. 13/2023',
        currentValue: false,
        expectedValue: true,
      });
    }

    if (input.rendicontoApprovatoTermini === false) {
      checks.push({
        id: 'PNRR-RENDICONTO-RITARDO',
        severity: 'error',
        step: 'Step 7 — PNRR',
        message: "Rendiconto dell'anno precedente non approvato nei termini dall'organo consiliare competente: l'incremento PNRR non è attivabile (limite azzerato).",
        field: 'rendicontoApprovatoTermini',
        norma: 'Art. 8, comma 3, D.L. 13/2023',
        currentValue: false,
        expectedValue: true,
      });
    }

    if (res.incidenzaSalarioAccessorioPercentualeCalcolata !== undefined && res.incidenzaSalarioAccessorioPercentualeCalcolata > 8) {
      checks.push({
        id: 'PNRR-INCIDENZA-ECCEDENTE',
        severity: 'error',
        step: 'Step 7 — PNRR',
        message: `L'incidenza del salario accessorio e incentivante sulla spesa di personale (${res.incidenzaSalarioAccessorioPercentualeCalcolata.toFixed(2)}%) supera il limite dell'8%: l'incremento PNRR non è attivabile (limite azzerato).`,
        field: 'incidenzaSalarioAccessorioPercentuale',
        norma: 'Art. 8, comma 3, D.L. 13/2023',
        currentValue: res.incidenzaSalarioAccessorioPercentualeCalcolata,
        expectedValue: 8,
      });
    }
  }

  // COSFEL Warning (non bloccante per il limite)
  const isDistressed = !!(input.isDissesto || input.isStrutturalmenteDeficitario || input.isPianoRiequilibrio);
  if (res.isApplicabile && isDistressed) {
    if (input.hasApprovazioneCosfel === false) {
      checks.push({
        id: 'COSFEL-NOT-APPROVED-PNRR',
        severity: 'warning',
        step: 'Step 7 — PNRR',
        message: 'Ente in criticità finanziaria: l\'approvazione/autorizzazione COSFEL non è stata acquisita. Verificare la compatibilità dell\'incremento con il regime autorizzatorio COSFEL.',
        field: 'hasApprovazioneCosfel',
        norma: 'COSFEL / Art. 8, comma 3, D.L. 13/2023',
      });
    } else if (input.hasApprovazioneCosfel === undefined || input.hasApprovazioneCosfel === null) {
      checks.push({
        id: 'COSFEL-MISSING-PNRR',
        severity: 'warning',
        step: 'Step 7 — PNRR',
        message: 'Dato mancante: Autorizzazione/verifica COSFEL non indicata. Verificare lo stato di acquisizione per gli enti in criticità finanziaria.',
        field: 'hasApprovazioneCosfel',
        norma: 'COSFEL / Art. 8, comma 3, D.L. 13/2023',
      });
    }
  }

  return checks;
}
