import { Wizard2026Check } from './checks';

export interface Wizard2026Art23PersonaleEntry {
  id: string;
  partTimePercentage?: number;
  cedoliniEmessi?: number;
}

export interface Art23LimitInput {
  limite2016CertificatoEnte?: number;
  fondoPersonaleDipendente2016?: number;
  fondoEqPo2016?: number;
  fondoDirigenza2016?: number;
  risorseSegretario2016?: number;
  fondoStraordinario2016?: number;
  altreVoci2016Soggette?: number;

  fondoDipendenti2018Soggetto?: number;
  risorsePoEq2018Soggette?: number;
  personaleServizio31122018?: number;
  personalePrevisto2026Piao?: number;
  hasDirigenza?: boolean;

  fondoCertificatoParteStabile2018?: number;

  personaleTempoIndeterminato2026?: number;
  personaleTempoDeterminato2026?: number;
  assunzioniPreviste2026?: number;
  cessazioniPreviste2026?: number;

  // MOD-009
  personale2018Art23?: Wizard2026Art23PersonaleEntry[];
  personale2026Art23?: Wizard2026Art23PersonaleEntry[];
  usaCalcoloManualePersonaleArt23?: boolean;
  manualDipendentiEquivalenti2018?: number;
  manualDipendentiEquivalenti2026?: number;

  /** @deprecated Rimosso, mantenuto solo per compatibilità di compilazione */
  risorseSoggetteAttuali?: number;
  /** @deprecated Rimosso, mantenuto solo per compatibilità di compilazione */
  risorseEscluseAttuali?: number;
}

export interface Art23LimitResult {
  limite2016Base: number;
  fonteLimite2016: 'CERTIFICATO' | 'RICOSTRUITO';
  totaleVoci2016Ricostruite: number;
  baseAccessorio2018ProCapite: number;
  valoreMedioProCapite2018: number;
  differenzaPersonale: number;
  incrementoProCapiteLimite: number;
  limiteArt23Attualizzato: number;
  dipendentiEquivalenti2018: number;
  dipendentiEquivalenti2026: number;
  incrementoStabileAumentoPersonale: number;
  fondoCertificatoParteStabile2018: number;

  // Campi retrocompatibili per non rompere il resto del compilatore
  limiteArt23: number;
  limiteRicostruito2016: number;
  limiteCertificatoUtilizzato: boolean;
  risorseSoggetteAttuali: number;
  risorseEscluseAttuali: number;
  margineArt23: number;
  superamentoArt23: number;
}

export function calculateArt23Limit(input: Art23LimitInput): Art23LimitResult {
  const p2016 = input.fondoPersonaleDipendente2016 || 0;
  const eq2016 = input.fondoEqPo2016 || 0;
  const dir2016 = (input.hasDirigenza && input.fondoDirigenza2016) ? input.fondoDirigenza2016 : 0;
  const seg2016 = input.risorseSegretario2016 || 0;
  const str2016 = input.fondoStraordinario2016 || 0;
  const altre2016 = input.altreVoci2016Soggette || 0;

  const totaleVoci2016Ricostruite = p2016 + eq2016 + dir2016 + seg2016 + str2016 + altre2016;

  const cert = input.limite2016CertificatoEnte;
  const hasCert = cert !== undefined && cert !== null;
  const fonteLimite2016 = hasCert ? 'CERTIFICATO' : 'RICOSTRUITO';
  const limite2016Base = hasCert ? cert : totaleVoci2016Ricostruite;

  // Calcoli 2018 / Pro capite
  const f2018 = input.fondoDipendenti2018Soggetto || 0;
  const eq2018 = input.risorsePoEq2018Soggette || 0;
  const baseAccessorio2018ProCapite = f2018 + eq2018;

  // MOD-009: Calcolo personale 2018
  let pers2018 = 0;
  let has2018PersonnelSpec = false;
  if (input.usaCalcoloManualePersonaleArt23) {
    pers2018 = input.manualDipendentiEquivalenti2018 ?? 0;
    has2018PersonnelSpec = input.manualDipendentiEquivalenti2018 !== undefined;
  } else if (input.personale2018Art23 && input.personale2018Art23.length > 0) {
    pers2018 = input.personale2018Art23.reduce((sum, emp) => {
      const pt = emp.partTimePercentage !== undefined ? emp.partTimePercentage : 100;
      return sum + (pt / 100);
    }, 0);
    has2018PersonnelSpec = true;
  } else {
    // fallback retrocompatibile
    pers2018 = input.personaleServizio31122018 ?? 0;
    has2018PersonnelSpec = input.personaleServizio31122018 !== undefined;
  }

  // MOD-009: Calcolo personale 2026
  let pers2026 = 0;
  let has2026PersonnelSpec = false;
  if (input.usaCalcoloManualePersonaleArt23) {
    pers2026 = input.manualDipendentiEquivalenti2026 ?? 0;
    has2026PersonnelSpec = input.manualDipendentiEquivalenti2026 !== undefined;
  } else if (input.personale2026Art23 && input.personale2026Art23.length > 0) {
    pers2026 = input.personale2026Art23.reduce((sum, emp) => {
      const pt = emp.partTimePercentage !== undefined ? emp.partTimePercentage : 100;
      const ced = emp.cedoliniEmessi !== undefined ? emp.cedoliniEmessi : 12;
      return sum + ((pt / 100) * (ced / 12));
    }, 0);
    has2026PersonnelSpec = true;
  } else {
    // fallback retrocompatibile
    pers2026 = input.personalePrevisto2026Piao ?? 0;
    has2026PersonnelSpec = input.personalePrevisto2026Piao !== undefined;
  }

  const valoreMedioProCapite2018 = pers2018 > 0 ? baseAccessorio2018ProCapite / pers2018 : 0;

  // Differenza di personale (invarianza valore medio pro-capite 2018)
  const differenzaPersonale = (has2018PersonnelSpec && has2026PersonnelSpec)
    ? (pers2026 - pers2018)
    : 0;

  // L'incremento si applica solo se la differenza è positiva (nessuna riduzione se <= 2018)
  const incrementoProCapiteLimite = Math.max(0, differenzaPersonale) * valoreMedioProCapite2018;

  const limiteArt23Attualizzato = limite2016Base + incrementoProCapiteLimite;

  // Formula: (Fondo certificato di parte stabile dell'anno 2018 / Personale al 31.12.2018) * (Personale previsto nel 2026 (PIAO) - Personale al 31.12.2018)
  const fondoStabile2018 = input.fondoCertificatoParteStabile2018 || 0;
  const personaleDifferenziale = Math.max(0, pers2026 - pers2018);
  const calcStabileAumento = pers2018 > 0
    ? (fondoStabile2018 / pers2018) * personaleDifferenziale
    : 0;
  const incrementoStabileAumentoPersonale = Math.round((calcStabileAumento + Number.EPSILON) * 100) / 100;

  return {
    limite2016Base,
    fonteLimite2016,
    totaleVoci2016Ricostruite,
    baseAccessorio2018ProCapite,
    valoreMedioProCapite2018,
    differenzaPersonale,
    incrementoProCapiteLimite,
    limiteArt23Attualizzato,
    dipendentiEquivalenti2018: pers2018,
    dipendentiEquivalenti2026: pers2026,
    incrementoStabileAumentoPersonale,
    fondoCertificatoParteStabile2018: fondoStabile2018,

    // Retrocompatibilità
    limiteArt23: limiteArt23Attualizzato,
    limiteRicostruito2016: totaleVoci2016Ricostruite,
    limiteCertificatoUtilizzato: hasCert,
    risorseSoggetteAttuali: 0,
    risorseEscluseAttuali: 0,
    margineArt23: 0,
    superamentoArt23: 0,
  };
}

export function validateArt23Limit(input: Art23LimitInput): Wizard2026Check[] {
  const checks: Wizard2026Check[] = [];
  const res = calculateArt23Limit(input);

  // Controllo importi negativi
  const numericFields: Array<{ name: keyof Art23LimitInput; label: string }> = [
    { name: 'limite2016CertificatoEnte', label: 'Limite 2016 Certificato' },
    { name: 'fondoPersonaleDipendente2016', label: 'Fondo Personale Dipendente 2016' },
    { name: 'fondoEqPo2016', label: 'Risorse destinate a EQ/PO 2016' },
    { name: 'fondoDirigenza2016', label: 'Fondo Salario Accessorio Dirigenza 2016' },
    { name: 'risorseSegretario2016', label: 'Risorse accessorie Segretario 2016' },
    { name: 'fondoStraordinario2016', label: 'Fondo Straordinario 2016' },
    { name: 'altreVoci2016Soggette', label: 'Altre voci accessorie 2016' },
    { name: 'fondoDipendenti2018Soggetto', label: 'Fondo personale dipendente 2018' },
    { name: 'risorsePoEq2018Soggette', label: 'Risorse PO/EQ 2018' }
  ];

  for (const field of numericFields) {
    const val = input[field.name];
    if (typeof val === 'number' && val < 0) {
      checks.push({
        id: `ART23-NEGATIVE-${String(field.name).toUpperCase()}`,
        severity: 'error',
        step: 'Step 2 — Limite art. 23',
        message: `Il valore per "${field.label}" non può essere negativo.`,
        field: field.name as string,
        norma: 'Regole contabili generali',
        currentValue: val
      });
    }
  }

  // Verifica del limite certificato pari a zero
  if (input.limite2016CertificatoEnte === 0) {
    checks.push({
      id: 'ART23-CERT-ZERO',
      severity: 'warning',
      step: 'Step 2 — Limite art. 23',
      message: 'Il limite certificato 2016 inserito è pari a zero. Si tratta di un valore anomalo: verificar se l’importo è corretto o se debba essere inserito il limite asseverato.',
      field: 'limite2016CertificatoEnte',
      norma: 'Art. 23, comma 2, D.Lgs. 75/2017'
    });
  }

  // Verifica se manca del tutto la base 2016
  const haLimiteCertificato = input.limite2016CertificatoEnte !== undefined && input.limite2016CertificatoEnte !== null;
  const haVociRicostruite = input.fondoPersonaleDipendente2016 !== undefined ||
                            input.fondoEqPo2016 !== undefined ||
                            input.fondoStraordinario2016 !== undefined ||
                            input.altreVoci2016Soggette !== undefined;

  if (!haLimiteCertificato && !haVociRicostruite) {
    checks.push({
      id: 'ART23-BASE-2016-MISSING',
      severity: 'warning',
      step: 'Step 2 — Limite art. 23',
      message: 'Né il limite certificato 2016 né le singole voci analitiche 2016 sono stati inseriti. Inserire almeno il limite certificato o ricostruire le singole voci.',
      norma: 'Art. 23, comma 2, D.Lgs. 75/2017'
    });
  }

  // Riconciliazione tra certificato e ricostruito se entrambi presenti e differiscono
  if (haLimiteCertificato && input.limite2016CertificatoEnte! > 0 && res.totaleVoci2016Ricostruite > 0) {
    if (Math.abs(input.limite2016CertificatoEnte! - res.totaleVoci2016Ricostruite) > 0.01) {
      checks.push({
        id: 'ART23-RECONCILIATION-MISMATCH',
        severity: 'warning',
        step: 'Step 2 — Limite art. 23',
        message: `Il limite certificato (€ ${input.limite2016CertificatoEnte!.toFixed(2)}) differisce dalla somma analitica delle voci 2016 (€ ${res.totaleVoci2016Ricostruite.toFixed(2)}). Il wizard utilizzerà il valore certificato di € ${input.limite2016CertificatoEnte!.toFixed(2)}, ma si consiglia di verificare la coerenza con gli atti dell'ente o il parere dei revisori.`,
        field: 'limite2016CertificatoEnte',
        norma: 'Art. 23, comma 2, D.Lgs. 75/2017',
        currentValue: input.limite2016CertificatoEnte!,
        expectedValue: res.totaleVoci2016Ricostruite
      });
    }
  }

  // Fondo dirigenti condizionale
  if (input.hasDirigenza === true) {
    if (input.fondoDirigenza2016 === undefined || input.fondoDirigenza2016 === null) {
      checks.push({
        id: 'ART23-MISSING-DIR-2016',
        severity: 'warning',
        step: 'Step 2 — Limite art. 23',
        message: 'Dato mancante: Fondo dirigenti 2016 per ente con personale dirigente.',
        field: 'fondoDirigenza2016',
        norma: 'Art. 23, comma 2, D.Lgs. 75/2017'
      });
    }
  }

  // Controllo dati per il calcolo pro capite
  const has2018Fondo = input.fondoDipendenti2018Soggetto !== undefined && input.risorsePoEq2018Soggette !== undefined;
  
  let has2018Personnel = false;
  let has2026Personnel = false;

  if (input.usaCalcoloManualePersonaleArt23) {
    // Modalità manuale
    has2018Personnel = input.manualDipendentiEquivalenti2018 !== undefined;
    has2026Personnel = input.manualDipendentiEquivalenti2026 !== undefined;

    if (input.manualDipendentiEquivalenti2018 === undefined) {
      checks.push({
        id: 'ART23-MANUAL-2018-MISSING',
        severity: 'warning',
        step: 'Step 2 — Limite art. 23',
        message: 'Dato mancante: Totale dipendenti equivalenti 2018 (Manuale).',
        field: 'manualDipendentiEquivalenti2018',
        norma: 'Art. 23, comma 2, D.Lgs. 75/2017'
      });
    } else if (input.manualDipendentiEquivalenti2018 <= 0) {
      checks.push({
        id: 'ART23-MANUAL-2018-ZERO',
        severity: 'error',
        step: 'Step 2 — Limite art. 23',
        message: 'Il totale dipendenti equivalenti 2018 (Manuale) deve essere maggiore di zero.',
        field: 'manualDipendentiEquivalenti2018',
        norma: 'Art. 23, comma 2, D.Lgs. 75/2017',
        currentValue: input.manualDipendentiEquivalenti2018
      });
    }

    if (input.manualDipendentiEquivalenti2026 === undefined) {
      checks.push({
        id: 'ART23-MANUAL-2026-MISSING',
        severity: 'warning',
        step: 'Step 2 — Limite art. 23',
        message: 'Dato mancante: Totale dipendenti equivalenti 2026 (Manuale).',
        field: 'manualDipendentiEquivalenti2026',
        norma: 'Art. 23, comma 2, D.Lgs. 75/2017'
      });
    } else if (input.manualDipendentiEquivalenti2026 < 0) {
      checks.push({
        id: 'ART23-MANUAL-2026-NEGATIVE',
        severity: 'error',
        step: 'Step 2 — Limite art. 23',
        message: 'Il totale dipendenti equivalenti 2026 (Manuale) non può essere negativo.',
        field: 'manualDipendentiEquivalenti2026',
        norma: 'Art. 23, comma 2, D.Lgs. 75/2017',
        currentValue: input.manualDipendentiEquivalenti2026
      });
    }
  } else {
    // Modalità automatica o fallback legacy
    if (input.personale2018Art23 !== undefined && input.personale2018Art23.length > 0) {
      has2018Personnel = true;
    } else {
      has2018Personnel = input.personaleServizio31122018 !== undefined;
    }

    if (input.personale2026Art23 !== undefined && input.personale2026Art23.length > 0) {
      has2026Personnel = true;
    } else {
      has2026Personnel = input.personalePrevisto2026Piao !== undefined;
    }

    // Se non abbiamo personale da nessuna delle due sorgenti e non ci sono record nell'elenco dipendenti, segnala warning solo se non c'è neanche il dato legacy
    if (!has2018Personnel) {
      checks.push({
        id: 'ART23-AUTO-2018-MISSING',
        severity: 'warning',
        step: 'Step 2 — Limite art. 23',
        message: 'Dato mancante: nessun dipendente inserito per il calcolo automatico al 31.12.2018.',
        norma: 'Art. 23, comma 2, D.Lgs. 75/2017'
      });
    } else if (input.personale2018Art23) {
      input.personale2018Art23.forEach((emp, index) => {
        const pt = emp.partTimePercentage;
        if (pt !== undefined && (pt <= 0 || pt > 100)) {
          checks.push({
            id: `ART23-AUTO-2018-INVALID-PT-${emp.id}`,
            severity: 'error',
            step: 'Step 2 — Limite art. 23',
            message: `Dipendente 2018 N. ${index + 1}: la percentuale di part-time deve essere maggiore di 0 e minore o uguale a 100.`,
            norma: 'Regole di calcolo FTE'
          });
        }
      });
    }

    if (!has2026Personnel) {
      checks.push({
        id: 'ART23-AUTO-2026-MISSING',
        severity: 'warning',
        step: 'Step 2 — Limite art. 23',
        message: 'Dato mancante: nessun dipendente inserito per il calcolo automatico previsto nel 2026.',
        norma: 'Art. 23, comma 2, D.Lgs. 75/2017'
      });
    } else if (input.personale2026Art23) {
      input.personale2026Art23.forEach((emp, index) => {
        const pt = emp.partTimePercentage;
        if (pt !== undefined && (pt <= 0 || pt > 100)) {
          checks.push({
            id: `ART23-AUTO-2026-INVALID-PT-${emp.id}`,
            severity: 'error',
            step: 'Step 2 — Limite art. 23',
            message: `Dipendente 2026 N. ${index + 1}: la percentuale di part-time deve essere maggiore di 0 e minore o uguale a 100.`,
            norma: 'Regole di calcolo FTE'
          });
        }
        const ced = emp.cedoliniEmessi;
        if (ced !== undefined && (ced < 1 || ced > 12)) {
          checks.push({
            id: `ART23-AUTO-2026-INVALID-CED-${emp.id}`,
            severity: 'error',
            step: 'Step 2 — Limite art. 23',
            message: `Dipendente 2026 N. ${index + 1}: il numero di cedolini/presenze previsto deve essere compreso tra 1 e 12.`,
            norma: 'Regole di calcolo FTE'
          });
        }
      });
    }
  }

  // Se mancano dati generali pro capite
  if (!has2018Fondo || !has2018Personnel || !has2026Personnel) {
    checks.push({
      id: 'ART23-PRO-CAPITE-MISSING-DATA',
      severity: 'warning',
      step: 'Step 2 — Limite art. 23',
      message: 'Dati per il ricalcolo del valore medio pro cap capita 2018 / 2026 incompleti. Il limite finale attualizzato non è completo perché manca l\'elaborazione dell\'incremento pro capite.',
      norma: 'Invarianza valore medio pro-capite'
    });
  }

  // Personale 2018 <= 0
  if (has2018Personnel && res.dipendentiEquivalenti2018 <= 0) {
    checks.push({
      id: 'ART23-PERS-2018-ZERO',
      severity: 'error',
      step: 'Step 2 — Limite art. 23',
      message: 'Il personale in servizio al 31.12.2018 deve essere maggiore di zero per procedere al calcolo del valore medio pro capite.',
      norma: 'Regole matematiche di calcolo',
      currentValue: res.dipendentiEquivalenti2018
    });
  }

  // Nota informativa se variazione dipendenti <= 0
  if (has2018Personnel && has2026Personnel && res.dipendentiEquivalenti2026 < res.dipendentiEquivalenti2018) {
    checks.push({
      id: 'ART23-PERS-VARIATION-NEGATIVE',
      severity: 'info',
      step: 'Step 2 — Limite art. 23',
      message: 'La variazione del personale è negativa o nulla: il wizard non applica riduzioni automatiche del limite.',
      norma: 'Invarianza valore medio pro-capite'
    });
  }

  // Verifica presenza fondo certificato parte stabile 2018
  if (!input.fondoCertificatoParteStabile2018) {
    checks.push({
      id: 'ART23-FONDO-STABILE-2018-MISSING',
      severity: 'warning',
      step: 'Step 2 — Limite art. 23',
      message: 'Fondo certificato di parte stabile 2018 non inserito o pari a zero. Verrà visualizzato a 0 l\'incremento stabile per aumento del personale (Art. 79 c. 1 lett. c).',
      norma: 'Art. 79 c. 1 lett. c) CCNL 16.11.2022'
    });
  }

  return checks;
}
