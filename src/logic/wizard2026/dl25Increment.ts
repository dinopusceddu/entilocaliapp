import { Wizard2026Check } from './checks';
import { Wizard2026EntityType, Dl25ApplicabilityStatus } from './types';

// MOD-011-quater: aggiunto campo quotaMassimaTrasferibile; quotaTrasferita è @deprecated
export interface Wizard2026Dl25Quote {
  id: string;
  enteAderente: string;
  tipologiaEnteAderente?: string;
  codiceIstatEnteAderente?: string;
  /** @deprecated Usare quotaMassimaTrasferibile */
  quotaTrasferita?: number;
  /** MOD-011-quater: quota massima che l'ente aderente può trasferire */
  quotaMassimaTrasferibile?: number;
  riduzionePermanenteFondoAderente?: boolean; // true/false/undefined
  estremiAttoEnteAderente: string;
  parereRevisoriEnteAderente?: boolean; // true/false/undefined
  parereRevisoriEnteRicevente?: boolean; // true/false/undefined
  hasAutorizzazioneCosfelAderente?: boolean; // true/false/undefined — solo se l'ente aderente è deficitario
  estremiAutorizzazioneCosfelAderente?: string;
  note?: string;
}

export interface Dl25IncrementInput {
  entityType: Wizard2026EntityType;
  stipendiTabellari2023NonDirigenti?: number;
  fondoStabile2025Certificato?: number;
  budgetEq2025?: number;
  /** @deprecated MOD-011-quater: lo Step 3 calcola solo il limite massimo, non l'importo richiesto */
  incrementoApplicato?: number;
  isPrimaFasciaDl34?: boolean;
  isEquilibrioPluriennaleAsseverato?: boolean;
  isDissesto?: boolean;
  isStrutturalmenteDeficitario?: boolean;
  isPianoRiequilibrio?: boolean;
  quotaTrasferitaAderentiDL25_2025?: number;
  attiComuniAderentiPresenti?: boolean;
  riduzionePermanenteFondiComuniCertificata?: boolean;
  certificazioneRevisoriComuni?: boolean;
  hasApprovazioneCosfel?: boolean;
  quoteAderenti?: Wizard2026Dl25Quote[];
  /** @deprecated MOD-011-quater */
  fonteDatoStipendi2023?: string;
  /** @deprecated MOD-011-quater */
  attiAutorizzazioneDl25?: string;
  /** @deprecated MOD-011-quater */
  parereRevisoriDl25?: boolean;
  /** @deprecated MOD-011-quater */
  estremiParereRevisoriDl25?: string;
  documentazioneCosfelDl25?: string;
  /** @deprecated MOD-011-quater */
  estremiAsseverazioneEquilibrioPluriennale?: string;

  // Campi finanziari MOD-011-bis — mantenuti per verifica virtuosità
  popolazioneEnte?: number;
  entrateCorrentiN1?: number;
  entrateCorrentiN2?: number;
  entrateCorrentiN3?: number;
  fcdeStanziato?: number;
  spesaPersonaleUltimoRendiconto?: number;
  /** @deprecated MOD-011-quater: non più usato nel calcolo del limite */
  spesaPersonalePrevistaPostDl25?: number;
  /** @deprecated MOD-011-quater */
  aliquotaOneriRiflessi?: number;
  /** @deprecated MOD-011-quater */
  aliquotaIRAP?: number;
  /** @deprecated MOD-011-quater */
  accettaRiduzioneSostenibilita?: boolean;
  limiteStoricoSpesaPersonale?: number;
  baseCalcoloLimiteStorico?: string;
  spesaPersonalePrevista2026AnteIncremento?: number;
  /** @deprecated MOD-011-quater */
  accettaRiduzioneLimiteStorico?: boolean;

  // MOD-011-ter — mantenuto
  altreRisorse2025DaSottrarre?: number;
}

export interface Dl25IncrementResult {
  applicabilityStatus: Dl25ApplicabilityStatus;
  soglia48?: number;
  risorse2025DaSottrarre?: number;   // fondo + EQ + altre risorse
  /** MOD-011-quater: campo principale — limite massimo teoricamente applicabile */
  limiteMassimoDL25?: number;
  /** @deprecated MOD-011-quater: alias di limiteMassimoDL25 per retrocompatibilità */
  incrementoMassimoTeorico?: number;
  /** @deprecated MOD-011-quater: ora uguale a limiteMassimoDL25; non rappresenta più un importo "scelto" */
  incrementoApplicato?: number;
  quotaTrasferitaAderenti?: number;
  isApplicabileDirettamente: boolean;
  isCalcolabile: boolean;

  // Campi calcolati MOD-011-bis — mantenuti per display informativo
  isPrimaFasciaCalcolato?: boolean;
  rapportoSpesaPersonale?: number;
  mediaEntrateCorrentiTriennio?: number;
  entrateNette?: number;
  spesaMassimaSostenibile?: number;
  margineSpesaPersonale?: number;
  /** @deprecated MOD-011-quater */
  costoTotaleIncremento?: number;
  incrementoMassimoSostenibilePerSpesaPersonale?: number;
  spesaPrevistaDopoIncremento?: number;
  scostamentoLimiteStorico?: number;
  quotaTotaleInserita?: number;
  quotaTotaleValidata?: number;
  quotaNonValidata?: number;
  /** @deprecated MOD-011-quater */
  motivoRiduzione?: string;
  /** @deprecated MOD-011-quater */
  costoLordoIncrementoRichiesto?: number;
  /** @deprecated MOD-011-quater */
  costoLordoIncrementoIscrivibile?: number;
  /** @deprecated MOD-011-quater */
  quotaNonIscrivibile?: number;
}

export function getDl25ApplicabilityStatus(entityType: Wizard2026EntityType): Dl25ApplicabilityStatus {
  switch (entityType) {
    case 'REGIONE':
    case 'CITTA_METROPOLITANA':
    case 'PROVINCIA':
    case 'COMUNE':
      return 'DIRECTLY_APPLICABLE';
    case 'UNIONE_COMUNI':
    case 'COMUNITA_MONTANA':
    case 'COMUNITA_ISOLANA_O_ARCIPELAGO':
      return 'TRANSFER_ONLY';
    case 'CAMERA_COMMERCIO':
    case 'ENTE_REGIONALE':
    case 'ENTE_PARCO':
    case 'CONSORZIO':
    case 'ASP':
    case 'AZIENDA_SPECIALE':
    case 'ISTITUZIONE':
    case 'ALTRO_ENTE_STRUMENTALE':
      return 'NOT_APPLICABLE';
    default:
      return 'NEEDS_MANUAL_REVIEW';
  }
}

export function getSogliaComuneDM17Marzo(popolazione: number): number | undefined {
  if (popolazione < 1000) return 0.295;
  if (popolazione < 2000) return 0.286;
  if (popolazione < 3000) return 0.276;
  if (popolazione < 5000) return 0.272;
  if (popolazione < 10000) return 0.269;
  if (popolazione < 60000) return 0.270;
  if (popolazione < 250000) return 0.276;
  if (popolazione < 1500000) return 0.288;
  return 0.253;
}

/**
 * MOD-011-quater: calcola il LIMITE MASSIMO teoricamente applicabile ai sensi del D.L. 25/2025.
 * Non calcola più l'importo "richiesto" o "applicato" dall'ente (decisione gestionale della Costituzione Fondo).
 * Formula: limiteMassimoDL25 = max(0, stipendi2023 × 48% − (fondo2025 + EQ2025 + altreRisorse))
 */
export function calculateDl25Increment(input: Dl25IncrementInput): Dl25IncrementResult {
  const applicabilityStatus = getDl25ApplicabilityStatus(input.entityType);
  const isApplicabileDirettamente = applicabilityStatus === 'DIRECTLY_APPLICABLE';

  let soglia48: number | undefined = undefined;
  let limiteMassimoDL25: number | undefined = undefined;
  let quotaTrasferitaAderenti: number | undefined = undefined;
  let isCalcolabile = false;

  // Campi finanziari per display informativo (virtuosità)
  let isPrimaFasciaCalcolato: boolean | undefined = undefined;
  let rapportoSpesaPersonale: number | undefined = undefined;
  let mediaEntrateCorrentiTriennio: number | undefined = undefined;
  let entrateNette: number | undefined = undefined;
  let spesaMassimaSostenibile: number | undefined = undefined;
  let margineSpesaPersonale: number | undefined = undefined;
  let incrementoMassimoSostenibilePerSpesaPersonale: number | undefined = undefined;
  let spesaPrevistaDopoIncremento: number | undefined = undefined;
  let scostamentoLimiteStorico: number | undefined = undefined;

  let quotaTotaleInserita = 0;
  let quotaTotaleValidata = 0;
  let quotaNonValidata = 0;

  // 1. Calcolo Virtuosità D.M. 17 marzo 2020 (Comuni) — solo informativo
  const isComune = input.entityType === 'COMUNE';
  const hasPopolazione = input.popolazioneEnte !== undefined;
  const entratePresenti =
    input.entrateCorrentiN1 !== undefined &&
    input.entrateCorrentiN2 !== undefined &&
    input.entrateCorrentiN3 !== undefined;
  const spesaPresente = input.spesaPersonaleUltimoRendiconto !== undefined;

  if (isComune && hasPopolazione && entratePresenti && spesaPresente) {
    mediaEntrateCorrentiTriennio =
      (input.entrateCorrentiN1! + input.entrateCorrentiN2! + input.entrateCorrentiN3!) / 3;
    entrateNette = mediaEntrateCorrentiTriennio - (input.fcdeStanziato ?? 0);
    rapportoSpesaPersonale = input.spesaPersonaleUltimoRendiconto! / entrateNette;

    const soglia = getSogliaComuneDM17Marzo(input.popolazioneEnte!);
    if (soglia !== undefined) {
      spesaMassimaSostenibile = entrateNette * soglia;
      margineSpesaPersonale = Math.max(0, spesaMassimaSostenibile - input.spesaPersonaleUltimoRendiconto!);
      isPrimaFasciaCalcolato = rapportoSpesaPersonale <= soglia;
      // Solo informativo: massimo che entra nel margine sostenibile (nessun coefficiente lordo)
      incrementoMassimoSostenibilePerSpesaPersonale = margineSpesaPersonale;
    }
  }

  // 2. Verifica contestuale del tetto storico — solo informativa
  if (
    input.limiteStoricoSpesaPersonale !== undefined &&
    input.spesaPersonalePrevista2026AnteIncremento !== undefined
  ) {
    spesaPrevistaDopoIncremento = input.spesaPersonalePrevista2026AnteIncremento;
    scostamentoLimiteStorico =
      input.spesaPersonalePrevista2026AnteIncremento - input.limiteStoricoSpesaPersonale;
  }

  // 3. Verifiche di blocco
  const isPrimaFasciaNo =
    input.isPrimaFasciaDl34 === false || isPrimaFasciaCalcolato === false;
  const isDissesto = input.isDissesto === true;
  const isRiequilibrio = input.isPianoRiequilibrio === true;
  const isDeficitarioSenzaCosfel =
    input.isStrutturalmenteDeficitario === true && input.hasApprovazioneCosfel === false;
  const isEquilibrioNegativo = input.isEquilibrioPluriennaleAsseverato === false;

  const isBlocked =
    isDissesto || isRiequilibrio || isDeficitarioSenzaCosfel || isEquilibrioNegativo || isPrimaFasciaNo;

  // ── NOT_APPLICABLE ────────────────────────────────────────────────────────
  if (applicabilityStatus === 'NOT_APPLICABLE') {
    return {
      applicabilityStatus,
      soglia48: 0,
      limiteMassimoDL25: 0,
      incrementoMassimoTeorico: 0,
      incrementoApplicato: 0,
      quotaTrasferitaAderenti: 0,
      isApplicabileDirettamente,
      isCalcolabile: true,
      quotaTotaleInserita: 0,
      quotaTotaleValidata: 0,
      quotaNonValidata: 0,
    };
  }

  // ── BLOCKED ───────────────────────────────────────────────────────────────
  if (isBlocked) {
    return {
      applicabilityStatus,
      soglia48: 0,
      risorse2025DaSottrarre: 0,
      limiteMassimoDL25: 0,
      incrementoMassimoTeorico: 0,
      incrementoApplicato: 0,
      quotaTrasferitaAderenti: 0,
      isApplicabileDirettamente,
      isCalcolabile: true,
      isPrimaFasciaCalcolato,
      rapportoSpesaPersonale,
      mediaEntrateCorrentiTriennio,
      entrateNette,
      spesaMassimaSostenibile,
      margineSpesaPersonale,
      incrementoMassimoSostenibilePerSpesaPersonale,
      spesaPrevistaDopoIncremento,
      scostamentoLimiteStorico,
      quotaTotaleInserita: 0,
      quotaTotaleValidata: 0,
      quotaNonValidata: 0,
      motivoRiduzione: 'Limite massimo pari a zero: blocco normativo attivo.',
    };
  }

  // ── DIRECTLY_APPLICABLE ───────────────────────────────────────────────────
  if (isApplicabileDirettamente) {
    const hasBasicInputsMissing =
      input.stipendiTabellari2023NonDirigenti === undefined ||
      input.fondoStabile2025Certificato === undefined ||
      input.budgetEq2025 === undefined;

    if (hasBasicInputsMissing) {
      // Non calcolabile — NON forzare a zero!
      return {
        applicabilityStatus,
        isApplicabileDirettamente,
        isCalcolabile: false,
        isPrimaFasciaCalcolato,
        rapportoSpesaPersonale,
        mediaEntrateCorrentiTriennio,
        entrateNette,
        spesaMassimaSostenibile,
        margineSpesaPersonale,
        incrementoMassimoSostenibilePerSpesaPersonale,
        spesaPrevistaDopoIncremento,
        scostamentoLimiteStorico,
      };
    }

    const stipendi = input.stipendiTabellari2023NonDirigenti!;
    const fondo2025 = input.fondoStabile2025Certificato!;
    const budgetEq = input.budgetEq2025!;
    const altreRisorse = input.altreRisorse2025DaSottrarre ?? 0;

    soglia48 = stipendi * 0.48;
    const risorseSottratte = fondo2025 + budgetEq + altreRisorse;
    limiteMassimoDL25 = Math.max(0, soglia48 - risorseSottratte);

    return {
      applicabilityStatus,
      soglia48,
      risorse2025DaSottrarre: risorseSottratte,
      limiteMassimoDL25,
      // alias @deprecated per retrocompatibilità test
      incrementoMassimoTeorico: limiteMassimoDL25,
      incrementoApplicato: input.incrementoApplicato ?? 0,
      quotaTrasferitaAderenti: 0,
      isApplicabileDirettamente,
      isCalcolabile: true,
      isPrimaFasciaCalcolato,
      rapportoSpesaPersonale,
      mediaEntrateCorrentiTriennio,
      entrateNette,
      spesaMassimaSostenibile,
      margineSpesaPersonale,
      incrementoMassimoSostenibilePerSpesaPersonale,
      spesaPrevistaDopoIncremento,
      scostamentoLimiteStorico,
      quotaTotaleInserita: 0,
      quotaTotaleValidata: 0,
      quotaNonValidata: 0,
    };
  }

  // ── TRANSFER_ONLY ─────────────────────────────────────────────────────────
  if (applicabilityStatus === 'TRANSFER_ONLY') {
    soglia48 = 0;
    limiteMassimoDL25 = 0;

    if (input.quoteAderenti && input.quoteAderenti.length > 0) {
      for (const q of input.quoteAderenti) {
        // MOD-011-quater: usa quotaMassimaTrasferibile, con fallback su quotaTrasferita (@deprecated)
        const val = (q.quotaMassimaTrasferibile ?? q.quotaTrasferita) || 0;
        quotaTotaleInserita += val;
        const isValid =
          val > 0 &&
          q.riduzionePermanenteFondoAderente === true &&
          q.parereRevisoriEnteAderente === true &&
          q.parereRevisoriEnteRicevente === true;
        if (isValid) {
          quotaTotaleValidata += val;
        }
      }
      quotaNonValidata = quotaTotaleInserita - quotaTotaleValidata;
      isCalcolabile = true;
    } else if (input.quotaTrasferitaAderentiDL25_2025 !== undefined) {
      quotaTotaleInserita = input.quotaTrasferitaAderentiDL25_2025;
      const isValidFlat =
        input.attiComuniAderentiPresenti === true &&
        input.riduzionePermanenteFondiComuniCertificata === true &&
        input.certificazioneRevisoriComuni === true;
      quotaTotaleValidata = isValidFlat ? quotaTotaleInserita : 0;
      quotaNonValidata = quotaTotaleInserita - quotaTotaleValidata;
      isCalcolabile = true;
    } else {
      isCalcolabile = false;
    }

    return {
      applicabilityStatus,
      soglia48,
      limiteMassimoDL25: quotaTotaleValidata,
      incrementoMassimoTeorico: 0,
      incrementoApplicato: 0,
      quotaTrasferitaAderenti: quotaTotaleInserita,
      isApplicabileDirettamente,
      isCalcolabile,
      quotaTotaleInserita,
      quotaTotaleValidata,
      quotaNonValidata,
    };
  }

  // NEEDS_MANUAL_REVIEW o fallback
  return {
    applicabilityStatus,
    soglia48,
    limiteMassimoDL25,
    incrementoMassimoTeorico: limiteMassimoDL25,
    incrementoApplicato: input.incrementoApplicato ?? 0,
    quotaTrasferitaAderenti,
    isApplicabileDirettamente,
    isCalcolabile,
  };
}

/**
 * MOD-011-quater: validazione orientata al limite massimo.
 * Rimossi i check legati all'importo "richiesto" (DL25-MISSING-INCREMENTO-APPLICATO,
 * DL25-EXCEEDS-MAX, DL25-SOSTENIBILITA-EXCEEDED, DL25-HISTORICAL-LIMIT-EXCEEDED).
 */
export function validateDl25Increment(input: Dl25IncrementInput): Wizard2026Check[] {
  const checks: Wizard2026Check[] = [];
  const res = calculateDl25Increment(input);

  const isComune = input.entityType === 'COMUNE';
  const isPrimaFasciaNo =
    input.isPrimaFasciaDl34 === false || res.isPrimaFasciaCalcolato === false;
  const isDissesto = input.isDissesto === true;
  const isRiequilibrio = input.isPianoRiequilibrio === true;
  const isDeficitarioSenzaCosfel =
    input.isStrutturalmenteDeficitario === true && input.hasApprovazioneCosfel === false;
  const isEquilibrioNegativo = input.isEquilibrioPluriennaleAsseverato === false;

  if (res.applicabilityStatus === 'DIRECTLY_APPLICABLE') {
    // 1. Requisiti di blocco
    if (isDissesto || isRiequilibrio) {
      checks.push({
        id: 'DL25-VIRTUSTEP-BLOCKED-DISSESTO',
        severity: 'error',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Requisiti negativi: il limite massimo è pari a zero per enti in dissesto o piano di riequilibrio.',
        field: 'isDissesto',
        norma: 'D.L. 25/2025',
      });
    }

    if (isEquilibrioNegativo) {
      checks.push({
        id: 'DL25-VIRTUSTEP-BLOCKED-EQUILIBRIO',
        severity: 'error',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Requisiti negativi: l\'equilibrio pluriennale di bilancio non risulta asseverato.',
        field: 'isEquilibrioPluriennaleAsseverato',
        norma: 'D.L. 25/2025',
      });
    }

    if (isPrimaFasciaNo) {
      checks.push({
        id: 'DL25-VIRTUSTEP-BLOCKED',
        severity: 'error',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Requisiti di virtuosità negativi: l\'ente non si colloca in prima fascia di virtuosità.',
        field: 'isPrimaFasciaDl34',
        norma: 'D.L. 25/2025',
      });
    }

    if (isDeficitarioSenzaCosfel) {
      checks.push({
        id: 'COSFEL-BLOCKED-DL25',
        severity: 'error',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Ente strutturalmente deficitario: il limite massimo è pari a zero in assenza di approvazione COSFEL.',
        field: 'hasApprovazioneCosfel',
        norma: 'COSFEL / D.L. 25/2025',
      });
    }

    // 2. Warning dati mancanti per validazione
    if (input.isEquilibrioPluriennaleAsseverato === undefined) {
      checks.push({
        id: 'DL25-VIRTUSTEP-MISSING-EQUILIBRIO',
        severity: 'warning',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Dato mancante: asseverazione sull\'equilibrio pluriennale non specificata. Limite non validabile.',
        field: 'isEquilibrioPluriennaleAsseverato',
        norma: 'D.L. 25/2025',
      });
    }

    if (input.isStrutturalmenteDeficitario === true && input.hasApprovazioneCosfel === undefined) {
      checks.push({
        id: 'COSFEL-MISSING-DL25',
        severity: 'warning',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Dato mancante: approvazione COSFEL non specificata. Limite non validabile.',
        field: 'hasApprovazioneCosfel',
        norma: 'COSFEL / D.L. 25/2025',
      });
    }

    // 3. Mismatch prima fascia
    if (
      res.isPrimaFasciaCalcolato !== undefined &&
      input.isPrimaFasciaDl34 !== undefined &&
      res.isPrimaFasciaCalcolato !== input.isPrimaFasciaDl34
    ) {
      checks.push({
        id: 'DL25-VIRTUSTEP-MISMATCH',
        severity: 'warning',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Il valore dichiarato nello Step 1 non coincide con il calcolo automatico. Verificare il prospetto finanziario.',
        field: 'isPrimaFasciaDl34',
        norma: 'D.L. 25/2025',
      });
    }

    // 4. Dati finanziari mancanti (Comuni) — warning informativo
    if (isComune && res.margineSpesaPersonale === undefined) {
      checks.push({
        id: 'DL25-SOSTENIBILITA-MISSING',
        severity: 'warning',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Dati finanziari incompleti: verifica della sostenibilità della spesa di personale non eseguita.',
        field: 'spesaPersonaleUltimoRendiconto',
        norma: 'D.L. 25/2025',
      });
    }

    // 5. Soglia non codificata
    if (!isComune && ['PROVINCIA', 'CITTA_METROPOLITANA', 'REGIONE'].includes(input.entityType)) {
      checks.push({
        id: 'DL25-SOGLIA-NON-CODIFICATA',
        severity: 'warning',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Soglia finanziaria D.L. 34/2019 non codificata per questa tipologia di ente. Verificare manualmente.',
        field: 'entityType',
        norma: 'D.L. 34/2019',
      });
    }

    // 6. Dati contabili base mancanti
    if (input.stipendiTabellari2023NonDirigenti === undefined) {
      checks.push({
        id: 'DL25-MISSING-STIPENDI-2023',
        severity: 'warning',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Spesa stipendi tabellari 2023 non dirigenti mancante. Calcolo limite sospeso.',
        field: 'stipendiTabellari2023NonDirigenti',
        norma: 'D.L. 25/2025',
      });
    }

    if (input.fondoStabile2025Certificato === undefined) {
      checks.push({
        id: 'DL25-MISSING-FONDO-2025',
        severity: 'warning',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Fondo stabile 2025 certificato mancante. Calcolo limite sospeso.',
        field: 'fondoStabile2025Certificato',
        norma: 'D.L. 25/2025',
      });
    }

    if (input.budgetEq2025 === undefined) {
      checks.push({
        id: 'DL25-MISSING-EQ-2025',
        severity: 'warning',
        step: 'Step 3 — D.L. 25/2025',
        message: 'Budget Elevate Qualificazioni 2025 mancante. Calcolo limite sospeso.',
        field: 'budgetEq2025',
        norma: 'D.L. 25/2025',
      });
    }
    if (input.incrementoApplicato !== undefined && input.incrementoApplicato < 0) {
      checks.push({
        id: 'DL25-APPLICATO-NEGATIVO',
        severity: 'error',
        step: 'Step 3 â€” D.L. 25/2025',
        message: 'Importo D.L. 25/2025 da applicare al Fondo non valido: il valore non puo essere negativo.',
        field: 'incrementoApplicato',
        norma: 'D.L. 25/2025',
      });
    }

    if (
      input.incrementoApplicato !== undefined &&
      input.incrementoApplicato > 0 &&
      res.limiteMassimoDL25 !== undefined &&
      input.incrementoApplicato > res.limiteMassimoDL25
    ) {
      checks.push({
        id: 'DL25-APPLICATO-OLTRE-MASSIMO',
        severity: 'error',
        step: 'Step 3 â€” D.L. 25/2025',
        message: 'Importo D.L. 25/2025 da applicare al Fondo superiore al limite massimo teorico calcolato.',
        field: 'incrementoApplicato',
        norma: 'D.L. 25/2025',
      });
    }

  } else if (res.applicabilityStatus === 'TRANSFER_ONLY') {
    if (input.quoteAderenti && input.quoteAderenti.length > 0) {
      const invalidQuotesCount = input.quoteAderenti.filter(
        q =>
          q.riduzionePermanenteFondoAderente !== true ||
          q.parereRevisoriEnteAderente !== true ||
          q.parereRevisoriEnteRicevente !== true
      ).length;

      if (invalidQuotesCount > 0) {
        checks.push({
          id: 'DL25-TRANSFER-INVALID-QUOTES',
          severity: 'warning',
          step: 'Step 3 — D.L. 25/2025',
          message: `${invalidQuotesCount} quote degli enti aderenti non validate: non incluse nel limite massimo trasferibile.`,
          field: 'quotaTrasferitaAderentiDL25_2025',
          norma: 'D.L. 25/2025',
        });
      }
    } else {
      if (input.quotaTrasferitaAderentiDL25_2025 !== undefined && input.quotaTrasferitaAderentiDL25_2025 > 0) {
        if (input.attiComuniAderentiPresenti === false) {
          checks.push({
            id: 'DL25-TRANSFER-NO-ATTI',
            severity: 'error',
            step: 'Step 3 — D.L. 25/2025',
            message: 'Atti formali dei Comuni aderenti non pervenuti.',
            field: 'quotaTrasferitaAderentiDL25_2025',
            norma: 'D.L. 25/2025',
          });
        }
        if (input.riduzionePermanenteFondiComuniCertificata === false) {
          checks.push({
            id: 'DL25-TRANSFER-NO-RIDUZIONE',
            severity: 'error',
            step: 'Step 3 — D.L. 25/2025',
            message: 'Riduzione permanente dei fondi dei Comuni non certificata.',
            field: 'quotaTrasferitaAderentiDL25_2025',
            norma: 'D.L. 25/2025',
          });
        }
        if (input.certificazioneRevisoriComuni === false) {
          checks.push({
            id: 'DL25-TRANSFER-NO-CERTIFICAZIONE',
            severity: 'error',
            step: 'Step 3 — D.L. 25/2025',
            message: 'Asseverazione dei revisori dei Comuni mancante.',
            field: 'quotaTrasferitaAderentiDL25_2025',
            norma: 'D.L. 25/2025',
          });
        }
      } else {
        checks.push({
          id: 'DL25-TRANSFER-EMPTY',
          severity: 'warning',
          step: 'Step 3 — D.L. 25/2025',
          message: 'Nessuna quota massima trasferibile dagli enti aderenti inserita.',
          field: 'quotaTrasferitaAderentiDL25_2025',
          norma: 'D.L. 25/2025',
        });
      }
    }
  } else if (res.applicabilityStatus === 'NOT_APPLICABLE') {
    if (
      (input.quotaTrasferitaAderentiDL25_2025 && input.quotaTrasferitaAderentiDL25_2025 > 0)
    ) {
      checks.push({
        id: 'DL25-NOT-APPLICABLE-HAS-VALUE',
        severity: 'error',
        step: 'Step 3 — D.L. 25/2025',
        message: `L'ente di tipo ${input.entityType} non è ammesso all'applicazione del D.L. 25/2025.`,
        norma: 'D.L. 25/2025',
      });
    }
  }

  return checks;
}
