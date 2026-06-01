import { Wizard2026Check } from './checks';

export interface Ccnl2026IncrementsInput {
  monteSalari2021?: number;
  /** Per anni > 2026: usare il dato consolidato dall'istruttoria 2026, non ricalcolare */
  monteSalari2021Consolidato2026?: number;
  annoRiferimento?: number;
  isStrutturalmenteDeficitario?: boolean;
  hasApprovazioneCosfel?: boolean;

  /** Inserito dall'utente: quota 0,22% che si intende applicare per l'anno (opzionale) */
  incremento022Anno?: number;
  /** Base di riparto proporzionale: intero Fondo risorse decentrate anno 2024 */
  fondoRisorseDecentrate2024?: number;
  /** Base di riparto proporzionale: intere risorse EQ anno 2024 */
  risorseEQ2024?: number;

  /** @deprecated MOD-012 */
  applicaIncremento022?: boolean;
  /** @deprecated MOD-012 */
  percentualeApplicata022?: number;
}

export interface Ccnl2026IncrementsResult {
  monteSalari2021?: number;

  // 0,14%
  incrementoStabile014?: number;
  arretrati014?: number;

  // 0,22%
  limiteMassimo022?: number;
  incremento022Anno?: number;
  isSuperamentoLimite022: boolean;

  // Riparto proporzionale
  baseRiparto2024?: number;
  quotaFondo?: number;
  quotaEQ?: number;
  incremento022Fondo?: number;
  incremento022EQ?: number;

  isCalcolabile: boolean;
  isMs2021Consolidato: boolean; // true se il dato usato è il consolidato (anno > 2026)

  // Campi legacy per retrocompatibilità
  /** @deprecated MOD-015 */
  incremento014: number;
  /** @deprecated MOD-015 */
  incremento022Massimo: number;
  /** @deprecated MOD-015 */
  incremento022Applicato: number;
  /** @deprecated MOD-012 */
  totalePotenzialeCcnl2026?: number;
}

export function calculateCcnl2026Increments(input: Ccnl2026IncrementsInput): Ccnl2026IncrementsResult {
  const annoRiferimento = input.annoRiferimento ?? 2026;
  const isPost2026 = annoRiferimento > 2026;

  // ─── Determinazione Monte Salari 2021 effettivo ───────────────────────────
  let ms2021: number | undefined;
  let isMs2021Consolidato = false;

  if (isPost2026) {
    if (input.monteSalari2021Consolidato2026 !== undefined && input.monteSalari2021Consolidato2026 !== null) {
      ms2021 = input.monteSalari2021Consolidato2026;
      isMs2021Consolidato = true;
    } else {
      // Non disponibile: stato non calcolabile, NON restituire 0
      return {
        isCalcolabile: false,
        isMs2021Consolidato: false,
        isSuperamentoLimite022: false,
        incremento014: 0,
        incremento022Massimo: 0,
        incremento022Applicato: 0,
      };
    }
  } else {
    ms2021 = input.monteSalari2021;
    isMs2021Consolidato = false;
  }

  if (ms2021 === undefined || ms2021 === null || isNaN(ms2021)) {
    return {
      isCalcolabile: false,
      isMs2021Consolidato: false,
      isSuperamentoLimite022: false,
      incremento014: 0,
      incremento022Massimo: 0,
      incremento022Applicato: 0,
    };
  }

  // ─── Calcolo 0,14% ───────────────────────────────────────────────────────
  const incrementoStabile014 = ms2021 * 0.0014 * 1;
  const arretrati014 = ms2021 * 0.0014 * 2;

  // ─── Calcolo limite massimo 0,22% ─────────────────────────────────────────
  // Regola COSFEL su limite 0,22%:
  // - hasApprovazioneCosfel === true: calcola ordinariamente
  // - hasApprovazioneCosfel === false: limite pari a zero (COSFEL negata)
  // - hasApprovazioneCosfel === undefined: calcola ordinariamente (genera warning separato)
  const moltiplicatore022 = annoRiferimento === 2026 ? 2 : 1;
  let limiteMassimo022 = ms2021 * 0.0022 * moltiplicatore022;
  if (input.isStrutturalmenteDeficitario === true && input.hasApprovazioneCosfel === false) {
    limiteMassimo022 = 0;
  }

  // ─── Incremento 0,22% scelto per l'anno (opzionale) ─────────────────────
  const incremento022Anno = input.incremento022Anno;
  const isSuperamentoLimite022 =
    incremento022Anno !== undefined && incremento022Anno !== null && incremento022Anno > limiteMassimo022;

  // ─── Riparto proporzionale Fondo / EQ ────────────────────────────────────
  let baseRiparto2024: number | undefined;
  let quotaFondo: number | undefined;
  let quotaEQ: number | undefined;
  let incremento022Fondo: number | undefined;
  let incremento022EQ: number | undefined;

  const fondoRisorseDecentrate2024 = input.fondoRisorseDecentrate2024;
  const risorseEQ2024 = input.risorseEQ2024;

  if (fondoRisorseDecentrate2024 !== undefined && risorseEQ2024 !== undefined) {
    baseRiparto2024 = fondoRisorseDecentrate2024 + risorseEQ2024;
    if (baseRiparto2024 > 0) {
      quotaFondo = fondoRisorseDecentrate2024 / baseRiparto2024;
      quotaEQ = risorseEQ2024 / baseRiparto2024;
      // Calcola il riparto solo se incremento022Anno è presente (anche se 0)
      if (incremento022Anno !== undefined && incremento022Anno !== null) {
        incremento022Fondo = incremento022Anno * quotaFondo;
        incremento022EQ = incremento022Anno * quotaEQ;
      }
    }
  }

  return {
    monteSalari2021: ms2021,

    // 0,14%
    incrementoStabile014,
    arretrati014,

    // 0,22%
    limiteMassimo022,
    incremento022Anno,
    isSuperamentoLimite022,

    // Riparto
    baseRiparto2024,
    quotaFondo,
    quotaEQ,
    incremento022Fondo,
    incremento022EQ,

    isCalcolabile: true,
    isMs2021Consolidato,

    // Legacy
    incremento014: incrementoStabile014,
    incremento022Massimo: ms2021 * 0.0022 * moltiplicatore022,
    incremento022Applicato: limiteMassimo022,
  };
}

export function validateCcnl2026Increments(input: Ccnl2026IncrementsInput): Wizard2026Check[] {
  const checks: Wizard2026Check[] = [];
  const annoRiferimento = input.annoRiferimento ?? 2026;
  const isPost2026 = annoRiferimento > 2026;

  // ─── Validazione Monte Salari 2021 ────────────────────────────────────────
  if (isPost2026) {
    if (input.monteSalari2021Consolidato2026 === undefined || input.monteSalari2021Consolidato2026 === null) {
      checks.push({
        id: 'CCNL2026-MS2021-CONSOLIDATO-MANCANTE',
        severity: 'warning',
        step: 'Step 4 — Incrementi CCNL',
        message: `Monte Salari 2021 consolidato 2026 non disponibile. Recuperare il dato dall'istruttoria 2026. Il calcolo degli incrementi CCNL non è eseguibile per l'anno ${annoRiferimento}.`,
        field: 'monteSalari2021Consolidato2026',
        norma: 'Art. 58, CCNL 23.02.2026',
      });
      // Se manca il consolidato, non è possibile procedere con altri controlli
      return checks;
    }
  } else {
    if (input.monteSalari2021 === undefined || input.monteSalari2021 === null) {
      checks.push({
        id: 'CCNL2026-MISSING-MS2021',
        severity: 'warning',
        step: 'Step 4 — Incrementi CCNL',
        message: 'Monte salari 2021 mancante per il calcolo degli incrementi contrattuali.',
        field: 'monteSalari2021',
        norma: 'Art. 58, CCNL 23.02.2026',
      });
    } else if (input.monteSalari2021 < 0) {
      checks.push({
        id: 'CCNL2026-INVALID-MS2021',
        severity: 'error',
        step: 'Step 4 — Incrementi CCNL',
        message: 'Il monte salari 2021 non può essere negativo.',
        field: 'monteSalari2021',
        norma: 'Art. 58, CCNL 23.02.2026',
      });
    }
  }

  // ─── Validazione COSFEL ────────────────────────────────────────────────────
  if (input.isStrutturalmenteDeficitario === true) {
    if (input.hasApprovazioneCosfel === false) {
      checks.push({
        id: 'COSFEL-BLOCKED-CCNL2026-022',
        severity: 'error',
        step: 'Step 4 — Incrementi CCNL',
        message: 'Ente strutturalmente deficitario: gli incrementi discrezionali del fondo (0,22% CCNL 2026) sono preclusi in quanto l\u2019approvazione/autorizzazione COSFEL non \u00e8 stata acquisita.',
        field: 'hasApprovazioneCosfel',
        norma: 'COSFEL / CCNL 2026',
      });
    } else if (input.hasApprovazioneCosfel === undefined) {
      checks.push({
        id: 'COSFEL-MISSING-CCNL2026-022',
        severity: 'warning',
        step: 'Step 4 — Incrementi CCNL',
        message: 'Dato mancante: Approvazione/autorizzazione COSFEL per l\u2019incremento dello 0,22% sul Monte Salari 2021.',
        field: 'hasApprovazioneCosfel',
        norma: 'COSFEL / CCNL 2026',
      });
    }

    checks.push({
      id: 'COSFEL-WARNING-CCNL2026',
      severity: 'warning',
      step: 'Step 4 — Incrementi CCNL',
      message: 'Verificare la compatibilit\u00e0 dell\u2019incremento con il regime autorizzatorio COSFEL prima di inserirlo nella costituzione del fondo.',
      norma: 'COSFEL / CCNL 2026',
    });
  }

  // ─── Validazione incremento 0,22% inserito ────────────────────────────────
  const ms2021Effettivo = isPost2026 ? input.monteSalari2021Consolidato2026 : input.monteSalari2021;

  if (input.incremento022Anno !== undefined && input.incremento022Anno !== null) {
    if (ms2021Effettivo !== undefined) {
      const moltiplicatore022 = annoRiferimento === 2026 ? 2 : 1;
      let limiteMassimo022 = ms2021Effettivo * 0.0022 * moltiplicatore022;
      if (input.isStrutturalmenteDeficitario === true && input.hasApprovazioneCosfel === false) {
        limiteMassimo022 = 0;
      }

      if (input.incremento022Anno > limiteMassimo022) {
        checks.push({
          id: 'CCNL2026-022-SUPERAMENTO',
          severity: 'error',
          step: 'Step 4 — Incrementi CCNL',
          message: `L\u2019incremento 0,22% inserito (${input.incremento022Anno.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}) supera il limite massimo consentito (${limiteMassimo022.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}). Non \u00e8 possibile procedere.`,
          field: 'incremento022Anno',
          norma: 'Art. 58, comma 2, CCNL 23.02.2026',
          currentValue: input.incremento022Anno,
          expectedValue: limiteMassimo022,
        });
      }
    }
  }

  // ─── Validazione base di riparto ─────────────────────────────────────────
  // Solo se l'utente ha inserito almeno uno dei due campi di riparto
  const hasFondo2024 = input.fondoRisorseDecentrate2024 !== undefined && input.fondoRisorseDecentrate2024 !== null;
  const hasEQ2024 = input.risorseEQ2024 !== undefined && input.risorseEQ2024 !== null;

  if (hasFondo2024 && hasEQ2024) {
    const baseRiparto = (input.fondoRisorseDecentrate2024 ?? 0) + (input.risorseEQ2024 ?? 0);
    if (baseRiparto <= 0) {
      checks.push({
        id: 'CCNL2026-RIPARTO-BASE-ZERO',
        severity: 'warning',
        step: 'Step 4 — Incrementi CCNL',
        message: 'Base di riparto 2024 mancante o non valida (Fondo + EQ = 0). Il riparto proporzionale dello 0,22% non pu\u00f2 essere calcolato.',
        field: 'fondoRisorseDecentrate2024',
        norma: 'Art. 58, CCNL 23.02.2026',
        currentValue: baseRiparto,
        expectedValue: 0,
      });
    }
  }

  return checks;
}
