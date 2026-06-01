import { Wizard2026DraftState } from '../types';
import { FundData } from '../../../domain/types';
import { selectWizard2026BlockingErrors, selectWizard2026Warnings } from '../selectors';

export type Wizard2026TransferCategory =
  | 'FONDO_DIPENDENTI_PARTE_STABILE'
  | 'FONDO_DIPENDENTI_PARTE_VARIABILE'
  | 'ELEVATE_QUALIFICAZIONI'
  | 'FONDO_DIRIGENTI'
  | 'CONFIGURAZIONE_ANNUALE'
  | 'SOLO_CONTROLLO'
  | 'NON_TRASFERIBILE';

export type Wizard2026TransferStatus =
  | 'READY'
  | 'REQUIRES_CONFIRMATION'
  | 'CONTROL_ONLY'
  | 'NOT_APPLICABLE'
  | 'MISSING_DATA'
  | 'BLOCKED'
  | 'CONFLICT';

export interface Wizard2026TransferPreviewItem {
  id: string;
  categoria: Wizard2026TransferCategory;
  etichetta: string;
  descrizione: string;
  campoDestinazione?: string;
  valoreAttuale?: number | string | boolean | null;
  valoreProposto?: number | string | boolean | null;
  differenza?: number;
  status: Wizard2026TransferStatus;
  rilevanzaArt23:
    | 'DENTRO_LIMITE'
    | 'FUORI_LIMITE'
    | 'COMPUTO_FIGURATIVO'
    | 'SOLO_CONTROLLO'
    | 'NON_RILEVANTE';
  notaArt23: string;
  spiegazioneUtente: string;
  rischioSovrascrittura?: boolean;
  parametroIstruttorioCollegato?: string;
  spiegazioneRischio?: string;
}

export interface Wizard2026TransferPreview {
  items: Wizard2026TransferPreviewItem[];
  hasBlockingIssues: boolean;
  warningCount: number;
}

const AUTOMATIC_OR_CONFIG_FIELDS = new Set([
  'historicalData.manualPersonalFundLimit2016',
  'historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016',
  'historicalData.fondoElevateQualificazioni2016',
  'historicalData.fondoDirigenza2016',
  'historicalData.risorseSegretarioComunale2016',
  'historicalData.fondoPersonaleNonDirEQ2018_Art23',
  'historicalData.fondoEQ2018_Art23',
  'historicalData.fondoStraordinario2016',
  'annualData.manualDipendentiEquivalenti2018',
  'annualData.manualDipendentiEquivalentiAnnoRif',
]);

/**
 * Helper per impostare un campo nel fondo destinazione con protezione dai conflitti manuali.
 */
function setFieldWithProtection(
  cloned: FundData,
  currentFundData: FundData,
  path: string,
  proposedVal: any,
  localSources?: Record<string, string>,
  bypassConflictProtection = false
) {
  const parts = path.split('.');
  
  // Estrai valore attuale
  let currentVal: any = currentFundData;
  for (const part of parts) {
    currentVal = currentVal?.[part];
  }

  const isPopulated = currentVal !== null && currentVal !== undefined && currentVal !== '' && currentVal !== 0;
  const isDifferent = currentVal !== proposedVal;
  const isManualSource = localSources?.[path] === 'manual';
  const isAlwaysBypass = AUTOMATIC_OR_CONFIG_FIELDS.has(path);

  const isConflict = !bypassConflictProtection && !isAlwaysBypass && isPopulated && isDifferent && isManualSource;

  if (isConflict) {
    // Mantieni il valore attuale ed evita di sovrascrivere
    return;
  }

  // Scrivi il valore proposto
  let target: any = cloned;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!target[part]) {
      target[part] = {};
    }
    target = target[part];
  }
  target[parts[parts.length - 1]] = proposedVal;
}

/**
 * Simula il trasferimento del wizard 2026 alla Costituzione Fondo legacy.
 * Lavora solo su una copia profonda di currentFundData, senza mutare l’oggetto originale.
 */
export function simulateWizard2026Transfer(
  draftState: Wizard2026DraftState,
  currentFundData: FundData,
  localSources?: Record<string, string>,
  bypassConflictProtection = false
): FundData {
  // Clona profondamente per evitare effetti collaterali
  const cloned: FundData = structuredClone(currentFundData);

  // Inizializza i sotto-oggetti se non esistono
  if (!cloned.annualData) {
    cloned.annualData = {} as any;
  }
  if (!cloned.fondoAccessorioDipendenteData) {
    cloned.fondoAccessorioDipendenteData = {} as any;
  }
  if (!cloned.fondoElevateQualificazioniData) {
    cloned.fondoElevateQualificazioniData = {} as any;
  }
  if (!cloned.fondoDirigenzaData) {
    cloned.fondoDirigenzaData = {} as any;
  }
  if (!cloned.historicalData) {
    cloned.historicalData = {} as any;
  }

  // Trasferimento dello straordinario storico 2016 (protetto)
  if (draftState.art23.fondoStraordinario2016 !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'historicalData.fondoStraordinario2016',
      draftState.art23.fondoStraordinario2016,
      localSources,
      bypassConflictProtection
    );
  }

  // --- Step 2: Dati Limite Art. 23 (Trasferimento Completo per Coerenza) ---
  if (draftState.art23.limite2016CertificatoEnte !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'historicalData.manualPersonalFundLimit2016',
      draftState.art23.limite2016CertificatoEnte,
      localSources,
      bypassConflictProtection
    );
  }
  if (draftState.art23.fondoPersonaleDipendente2016 !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016',
      draftState.art23.fondoPersonaleDipendente2016,
      localSources,
      bypassConflictProtection
    );
  }
  if (draftState.art23.fondoEqPo2016 !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'historicalData.fondoElevateQualificazioni2016',
      draftState.art23.fondoEqPo2016,
      localSources,
      bypassConflictProtection
    );
  }
  if (draftState.art23.fondoDirigenza2016 !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'historicalData.fondoDirigenza2016',
      draftState.art23.fondoDirigenza2016,
      localSources,
      bypassConflictProtection
    );
  }
  if (draftState.art23.risorseSegretario2016 !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'historicalData.risorseSegretarioComunale2016',
      draftState.art23.risorseSegretario2016,
      localSources,
      bypassConflictProtection
    );
  }
  if (draftState.art23.fondoDipendenti2018Soggetto !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'historicalData.fondoPersonaleNonDirEQ2018_Art23',
      draftState.art23.fondoDipendenti2018Soggetto,
      localSources,
      bypassConflictProtection
    );
  }
  if (draftState.art23.risorsePoEq2018Soggette !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'historicalData.fondoEQ2018_Art23',
      draftState.art23.risorsePoEq2018Soggette,
      localSources,
      bypassConflictProtection
    );
  }

  // Dipendenti equivalenti, manual mode e personale
  if (draftState.art23.usaCalcoloManualePersonaleArt23 !== undefined) {
    if (!cloned.personaleServizio) {
      cloned.personaleServizio = {} as any;
    }
    cloned.personaleServizio.isManualMode = draftState.art23.usaCalcoloManualePersonaleArt23;
  }
  if (draftState.art23.manualDipendentiEquivalenti2018 !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'annualData.manualDipendentiEquivalenti2018',
      draftState.art23.manualDipendentiEquivalenti2018,
      localSources,
      bypassConflictProtection
    );
  }
  if (draftState.art23.manualDipendentiEquivalenti2026 !== undefined) {
    if (!cloned.personaleServizio) {
      cloned.personaleServizio = {} as any;
    }
    cloned.personaleServizio.manualDipendentiEquivalenti = draftState.art23.manualDipendentiEquivalenti2026;
    setFieldWithProtection(
      cloned,
      currentFundData,
      'annualData.manualDipendentiEquivalentiAnnoRif',
      draftState.art23.manualDipendentiEquivalenti2026,
      localSources,
      bypassConflictProtection
    );
  }
  if (draftState.art23.personale2018Art23 !== undefined) {
    cloned.annualData.personale2018PerArt23 = draftState.art23.personale2018Art23;
  }
  if (draftState.art23.personale2026Art23 !== undefined) {
    cloned.annualData.personaleAnnoRifPerArt23 = draftState.art23.personale2026Art23;
  }
  if (draftState.art23.fondoCertificatoParteStabile2018 !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'annualData.fondoCertificatoParteStabile2018',
      draftState.art23.fondoCertificatoParteStabile2018,
      localSources,
      bypassConflictProtection
    );
  }
  if (draftState.art23.result?.incrementoStabileAumentoPersonale !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers',
      draftState.art23.result.incrementoStabileAumentoPersonale,
      localSources,
      bypassConflictProtection
    );
  }

  // ─── Step 4 — Incrementi CCNL 23.02.2026 ───
  const ms2021 =
    draftState.ccnl2026.result?.monteSalari2021 ??
    draftState.ccnl2026.monteSalari2021Consolidato2026 ??
    draftState.ccnl2026.monteSalari2021 ??
    0;

  const ccnlRes = draftState.ccnl2026.result;
  const isCcnlCalcolabile = ccnlRes?.isCalcolabile ?? false;

  // Sincronizzazione parametri annualData.ccnl2024 per evitare ricalcoli divergenti dei useEffect legacy
  if (!cloned.annualData.ccnl2024) {
    cloned.annualData.ccnl2024 = {};
  }
  cloned.annualData.ccnl2024.monteSalari2021 = ms2021;
  cloned.annualData.ccnl2024.fondoPersonale2025 = draftState.ccnl2026.fondoRisorseDecentrate2024;
  cloned.annualData.ccnl2024.fondoEQ2025 = draftState.ccnl2026.risorseEQ2024;

  if (isCcnlCalcolabile && ccnlRes) {
    // 0.14% Stabile
    setFieldWithProtection(
      cloned,
      currentFundData,
      'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021',
      ccnlRes.incrementoStabile014,
      localSources,
      bypassConflictProtection
    );
    
    // Arretrati 0.14%
    setFieldWithProtection(
      cloned,
      currentFundData,
      'fondoAccessorioDipendenteData.vn_art58_CCNL2026_arretrati2024_2025',
      ccnlRes.arretrati014,
      localSources,
      bypassConflictProtection
    );

    // 0.22% Fondo (quota ripartita)
    if (ccnlRes.incremento022Fondo !== undefined) {
      setFieldWithProtection(
        cloned,
        currentFundData,
        'fondoAccessorioDipendenteData.vn_art58c2_incremento_max022_ms2021',
        ccnlRes.incremento022Fondo,
        localSources,
        bypassConflictProtection
      );
      setFieldWithProtection(
        cloned,
        currentFundData,
        'fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021',
        ccnlRes.incremento022Fondo,
        localSources,
        bypassConflictProtection
      );
      setFieldWithProtection(
        cloned,
        currentFundData,
        'fondoAccessorioDipendenteData.vn_art58c2_incremento_max022_ms2021_anno2025',
        ccnlRes.incremento022Fondo,
        localSources,
        bypassConflictProtection
      );
    }

    // 0.22% EQ (quota ripartita)
    if (ccnlRes.incremento022EQ !== undefined) {
      setFieldWithProtection(
        cloned,
        currentFundData,
        'fondoElevateQualificazioniData.va_incremento022_ms2021_eq',
        ccnlRes.incremento022EQ,
        localSources,
        bypassConflictProtection
      );
    }

    // Allineamento percentuale opzionale in ccnl2024
    if (ms2021 > 0 && draftState.ccnl2026.incremento022Anno !== undefined) {
      cloned.annualData.ccnl2024.optionalIncreaseVariableFrom2026Percentage =
        (draftState.ccnl2026.incremento022Anno / ms2021) * 100;
    }
  }

  // ─── Step 5 — Conglobamento Art. 60 ───
  const art60Res = draftState.conglobamentoArt60.result;
  if (art60Res?.riduzioneTotale !== undefined) {
    setFieldWithProtection(
      cloned,
      currentFundData,
      'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto',
      art60Res.riduzioneTotale,
      localSources,
      bypassConflictProtection
    );

    // Sincronizzazione parametro ivcConglobation per evitare azzeramento da useEffect legacy
    cloned.annualData.ccnl2024.ivcConglobation = {
      mode: 'analytic',
      totalReduction: art60Res.riduzioneTotale,
    };
  }

  // ─── Step 6 — Straordinario ───
  const strRes = draftState.straordinario.result;
  if (strRes) {
    if (strRes.incrementoParteStabileDaRiduzioneStraordinario !== undefined) {
      setFieldWithProtection(
        cloned,
        currentFundData,
        'fondoAccessorioDipendenteData.st_art79c1_art14c3_art67c2g_riduzioneStraordinario',
        strRes.incrementoParteStabileDaRiduzioneStraordinario,
        localSources,
        bypassConflictProtection
      );
    }
    if (strRes.riduzioneFondoDecentratoPerStraordinario !== undefined) {
      setFieldWithProtection(
        cloned,
        currentFundData,
        'fondoAccessorioDipendenteData.st_riduzioneFondoStraordinario',
        strRes.riduzioneFondoDecentratoPerStraordinario,
        localSources,
        bypassConflictProtection
      );
      setFieldWithProtection(
        cloned,
        currentFundData,
        'annualData.incrementoFondoStraordinario',
        strRes.riduzioneFondoDecentratoPerStraordinario,
        localSources,
        bypassConflictProtection
      );
      setFieldWithProtection(
        cloned,
        currentFundData,
        'annualData.riduzioneFondoParteStabile',
        strRes.riduzioneFondoDecentratoPerStraordinario > 0,
        localSources,
        bypassConflictProtection
      );
    }
    if (strRes.economieDaTrasferireVariabileUnaTantum !== undefined) {
      setFieldWithProtection(
        cloned,
        currentFundData,
        'fondoAccessorioDipendenteData.vn_art15c1m_art67c3e_risparmiStraordinario',
        strRes.economieDaTrasferireVariabileUnaTantum,
        localSources,
        bypassConflictProtection
      );
    }
    if (strRes.straordinarioOrdinarioSoggettoArt23 !== undefined) {
      setFieldWithProtection(
        cloned,
        currentFundData,
        'annualData.fondoLavoroStraordinario',
        strRes.straordinarioOrdinarioSoggettoArt23,
        localSources,
        bypassConflictProtection
      );
    }
  }

  // Nota: i limiti massimi D.L. 25/2025, PNRR e il limite Art. 23 non vengono scritti su cloned
  // in quanto rappresentano solo tetti massimi o dati di controllo e non alimentano automaticamente il fondo.

  return cloned;
}

/**
 * Genera la griglia di anteprima dei campi da trasferire, calcolando i delta
 * rispetto allo stato attuale.
 */
export function buildWizard2026TransferPreview(
  draftState: Wizard2026DraftState,
  currentFundData: FundData,
  localSources?: Record<string, string>
): Wizard2026TransferPreview {
  const simulatedFundData = simulateWizard2026Transfer(draftState, currentFundData, localSources, false);
  const rawSimulatedFundData = simulateWizard2026Transfer(draftState, currentFundData, localSources, true);
  const items: Wizard2026TransferPreviewItem[] = [];

  const blockingErrors = selectWizard2026BlockingErrors(draftState);
  const isBlocked = blockingErrors.length > 0;
  const isCcnlCalcolabile = draftState.ccnl2026.result?.isCalcolabile ?? false;

  // Helper per valutare lo status del campo considerando la protezione CONFLICT
  const getFieldStatus = (path: string, defaultStatus: Wizard2026TransferStatus) => {
    if (isBlocked) return 'BLOCKED';
    
    // Estrai valore attuale
    const parts = path.split('.');
    let currentVal: any = currentFundData;
    for (const part of parts) {
      currentVal = currentVal?.[part];
    }
    
    // Estrai valore proposto grezzo (senza protezione per rilevare conflitti rispetto alla proposta reale del wizard)
    let proposedVal: any = rawSimulatedFundData;
    for (const part of parts) {
      proposedVal = proposedVal?.[part];
    }
    
    const isPopulated = currentVal !== null && currentVal !== undefined && currentVal !== '' && currentVal !== 0;
    const isDifferent = currentVal !== proposedVal;
    const isManualSource = localSources?.[path] === 'manual';
    const isAlwaysBypass = AUTOMATIC_OR_CONFIG_FIELDS.has(path);
    
    if (!isAlwaysBypass && isPopulated && isDifferent && isManualSource) {
      return 'CONFLICT';
    }
    return defaultStatus;
  };

  // 1. Straordinario storico 2016
  const valStr2016Attuale = currentFundData.historicalData?.fondoStraordinario2016 ?? 0;
  const valStr2016Proposto = simulatedFundData.historicalData?.fondoStraordinario2016 ?? 0;
  const statusStr2016 = getFieldStatus(
    'historicalData.fondoStraordinario2016',
    draftState.art23.fondoStraordinario2016 === undefined ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'historicalData_fondoStraordinario2016',
    categoria: 'CONFIGURAZIONE_ANNUALE',
    etichetta: 'Fondo straordinario storico anno 2016',
    descrizione: 'Consistenza dello straordinario storico 2016, impiegato per la determinazione del limite Art. 23 complessivo.',
    campoDestinazione: 'historicalData.fondoStraordinario2016',
    valoreAttuale: valStr2016Attuale,
    valoreProposto: valStr2016Proposto,
    differenza: valStr2016Proposto - valStr2016Attuale,
    status: statusStr2016,
    rilevanzaArt23: 'NON_RILEVANTE',
    notaArt23: 'Dato storico di configurazione per il tetto di spesa.',
    spiegazioneUtente: 'Configurazione del parametro dello straordinario storico 2016 nel database locale.',
  });

  // 1b. Fondo certificato di parte stabile 2018
  const valFondoStabile2018Attuale = currentFundData.annualData?.fondoCertificatoParteStabile2018 ?? 0;
  const valFondoStabile2018Proposto = simulatedFundData.annualData?.fondoCertificatoParteStabile2018 ?? 0;
  const statusFondoStabile2018 = getFieldStatus(
    'annualData.fondoCertificatoParteStabile2018',
    draftState.art23.fondoCertificatoParteStabile2018 === undefined ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'annualData_fondoCertificatoParteStabile2018',
    categoria: 'CONFIGURAZIONE_ANNUALE',
    etichetta: 'Fondo certificato di parte stabile 2018',
    descrizione: 'Fondo di parte stabile del 2018, usato per determinare l\'incremento stabile da assunzioni.',
    campoDestinazione: 'annualData.fondoCertificatoParteStabile2018',
    valoreAttuale: valFondoStabile2018Attuale,
    valoreProposto: valFondoStabile2018Proposto,
    differenza: valFondoStabile2018Proposto - valFondoStabile2018Attuale,
    status: statusFondoStabile2018,
    rilevanzaArt23: 'NON_RILEVANTE',
    notaArt23: 'Dato di input per il calcolo dell\'incremento del personale.',
    spiegazioneUtente: 'Alimenta il calcolo dell\'incremento stabile ex Art. 79 comma 1 lett. c).',
  });

  // 1c. Incremento stabile (aumento per incremento del personale) Art. 79 c. 1 lett. c
  const valIncStabilePersAttuale = currentFundData.fondoAccessorioDipendenteData?.st_art79c1c_incrementoStabileConsistenzaPers ?? 0;
  const valIncStabilePersProposto = simulatedFundData.fondoAccessorioDipendenteData?.st_art79c1c_incrementoStabileConsistenzaPers ?? 0;
  const statusIncStabilePers = getFieldStatus(
    'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers',
    draftState.art23.result?.incrementoStabileAumentoPersonale === undefined ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'st_art79c1c_incrementoStabileConsistenzaPers',
    categoria: 'FONDO_DIPENDENTI_PARTE_STABILE',
    etichetta: 'Incremento stabile (aumento per incremento del personale) Art. 79 c. 1 lett. c',
    descrizione: 'Incremento stabile collegato all\'aumento di personale rispetto al 2018.',
    campoDestinazione: 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers',
    valoreAttuale: valIncStabilePersAttuale,
    valoreProposto: valIncStabilePersProposto,
    differenza: valIncStabilePersProposto - valIncStabilePersAttuale,
    status: statusIncStabilePers,
    rilevanzaArt23: 'DENTRO_LIMITE',
    notaArt23: 'Soggetto al limite Art. 23 c. 2.',
    spiegazioneUtente: 'Valore calcolato sulla base del personale previsto nel 2026 (PIAO).',
  });

  // 2. Incremento stabile 0,14% Monte Salari 2021
  const valStabile014Attuale = currentFundData.fondoAccessorioDipendenteData?.st_art58c1_CCNL2026_incremento014_MS2021 ?? 0;
  const valStabile014Proposto = simulatedFundData.fondoAccessorioDipendenteData?.st_art58c1_CCNL2026_incremento014_MS2021 ?? 0;
  const statusStabile014 = getFieldStatus(
    'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021',
    !isCcnlCalcolabile ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'st_art58c1_CCNL2026_incremento014_MS2021',
    categoria: 'FONDO_DIPENDENTI_PARTE_STABILE',
    etichetta: 'Incremento stabile 0,14% Monte Salari 2021',
    descrizione: 'Incremento stabile dello 0,14% calcolato sul Monte Salari 2021.',
    campoDestinazione: 'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021',
    valoreAttuale: valStabile014Attuale,
    valoreProposto: valStabile014Proposto,
    differenza: valStabile014Proposto - valStabile014Attuale,
    status: statusStabile014,
    rilevanzaArt23: 'FUORI_LIMITE',
    notaArt23: 'Escluso dal limite del trattamento accessorio.',
    spiegazioneUtente: 'Risorsa stabile esclusa dal limite ai sensi dell\'art. 58 comma 1 del CCNL 23.02.2026.',
    rischioSovrascrittura: statusStabile014 !== 'CONFLICT',
    parametroIstruttorioCollegato: 'annualData.ccnl2024.monteSalari2021',
    spiegazioneRischio: 'Il campo è calcolato dinamicamente dalla pagina legacy. Se il Monte Salari 2021 non viene aggiornato nei parametri istruttori, il valore verrà ricalcolato all\'apertura della pagina.',
  } as any);

  // 3. Arretrati 0,14% Monte Salari 2021
  const valArretrati014Attuale = currentFundData.fondoAccessorioDipendenteData?.vn_art58_CCNL2026_arretrati2024_2025 ?? 0;
  const valArretrati014Proposto = simulatedFundData.fondoAccessorioDipendenteData?.vn_art58_CCNL2026_arretrati2024_2025 ?? 0;
  const statusArretrati014 = getFieldStatus(
    'fondoAccessorioDipendenteData.vn_art58_CCNL2026_arretrati2024_2025',
    !isCcnlCalcolabile ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'vn_art58_CCNL2026_arretrati2024_2025',
    categoria: 'FONDO_DIPENDENTI_PARTE_VARIABILE',
    etichetta: 'Arretrati 0,14% Monte Salari 2021',
    descrizione: 'Arretrati dello 0,14% Monte Salari 2021 per le annualità 2024 e 2025.',
    campoDestinazione: 'fondoAccessorioDipendenteData.vn_art58_CCNL2026_arretrati2024_2025',
    valoreAttuale: valArretrati014Attuale,
    valoreProposto: valArretrati014Proposto,
    differenza: valArretrati014Proposto - valArretrati014Attuale,
    status: statusArretrati014,
    rilevanzaArt23: 'FUORI_LIMITE',
    notaArt23: 'Escluso dal limite del trattamento accessorio.',
    spiegazioneUtente: 'Risorsa variabile una tantum esclusa dal limite dell\'Art. 23.',
  });

  // 4. Quota 0,22% Fondo
  const val022FondoAttuale = currentFundData.fondoAccessorioDipendenteData?.vn_art58c2_incremento_max022_ms2021 ?? 0;
  const val022FondoProposto = simulatedFundData.fondoAccessorioDipendenteData?.vn_art58c2_incremento_max022_ms2021 ?? 0;
  const hasChosen022 = draftState.ccnl2026.incremento022Anno !== undefined;
  const status022Fondo = getFieldStatus(
    'fondoAccessorioDipendenteData.vn_art58c2_incremento_max022_ms2021',
    !isCcnlCalcolabile ? 'MISSING_DATA' : !hasChosen022 ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'vn_art58c2_incremento_max022_ms2021',
    categoria: 'FONDO_DIPENDENTI_PARTE_VARIABILE',
    etichetta: 'Quota 0,22% destinata al Fondo risorse decentrate',
    descrizione: 'Quota dell\'incremento dello 0,22% del Monte Salari 2021 ripartita al Fondo Dipendenti.',
    campoDestinazione: 'fondoAccessorioDipendenteData.vn_art58c2_incremento_max022_ms2021',
    valoreAttuale: val022FondoAttuale,
    valoreProposto: val022FondoProposto,
    differenza: val022FondoProposto - val022FondoAttuale,
    status: status022Fondo,
    rilevanzaArt23: 'FUORI_LIMITE',
    notaArt23: 'Escluso dal limite del trattamento accessorio.',
    spiegazioneUtente: 'Quota dello 0,22% destinata al fondo del personale, esclusa dal limite dell\'Art. 23 c. 2.',
    rischioSovrascrittura: status022Fondo !== 'CONFLICT',
    parametroIstruttorioCollegato: 'annualData.ccnl2024.optionalIncreaseVariableFrom2026Percentage',
    spiegazioneRischio: 'Il campo viene calcolato dinamicamente. Se il parametro percentuale e i fondi storici di riparto non sono allineati, il valore divergerà all\'apertura della pagina.',
  } as any);

  // 5. Quota 0,22% EQ
  const val022EqAttuale = currentFundData.fondoElevateQualificazioniData?.va_incremento022_ms2021_eq ?? 0;
  const val022EqProposto = simulatedFundData.fondoElevateQualificazioniData?.va_incremento022_ms2021_eq ?? 0;
  const status022Eq = getFieldStatus(
    'fondoElevateQualificazioniData.va_incremento022_ms2021_eq',
    !isCcnlCalcolabile ? 'MISSING_DATA' : !hasChosen022 ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'va_incremento022_ms2021_eq',
    categoria: 'ELEVATE_QUALIFICAZIONI',
    etichetta: 'Quota 0,22% destinata alle Elevate Qualificazioni',
    descrizione: 'Quota dell\'incremento dello 0,22% del Monte Salari 2021 ripartita alle EQ.',
    campoDestinazione: 'fondoElevateQualificazioniData.va_incremento022_ms2021_eq',
    valoreAttuale: val022EqAttuale,
    valoreProposto: val022EqProposto,
    differenza: val022EqProposto - val022EqAttuale,
    status: status022Eq,
    rilevanzaArt23: 'FUORI_LIMITE',
    notaArt23: 'Escluso dal limite del trattamento accessorio.',
    spiegazioneUtente: 'Quota dello 0,22% destinata alle Elevate Qualificazioni, esclusa dal limite dell\'Art. 23 c. 2.',
    rischioSovrascrittura: status022Eq !== 'CONFLICT',
    parametroIstruttorioCollegato: 'annualData.ccnl2024.optionalIncreaseVariableFrom2026Percentage',
    spiegazioneRischio: 'Il campo è ricalcolato nella pagina EQ. Per evitare ricalcoli divergenti è necessario che il parametro percentuale e i dati storici siano allineati.',
  } as any);

  // 6. Riduzione stabile Fondo per conglobamento indennità di comparto
  const valCompartoAttuale = currentFundData.fondoAccessorioDipendenteData?.st_art60c2_CCNL2026_decurtazioneIndennitaComparto ?? 0;
  const valCompartoProposto = simulatedFundData.fondoAccessorioDipendenteData?.st_art60c2_CCNL2026_decurtazioneIndennitaComparto ?? 0;
  const hasArt60 = draftState.conglobamentoArt60.result?.riduzioneTotale !== undefined;
  const statusComparto = getFieldStatus(
    'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto',
    !hasArt60 ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'st_art60c2_CCNL2026_decurtazioneIndennitaComparto',
    categoria: 'FONDO_DIPENDENTI_PARTE_STABILE',
    etichetta: 'Riduzione stabile Fondo per conglobamento indennità di comparto',
    descrizione: 'Taglio stabile del Fondo dovuto al conglobamento di quota parte dell\'indennità di comparto.',
    campoDestinazione: 'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto',
    valoreAttuale: valCompartoAttuale,
    valoreProposto: valCompartoProposto,
    differenza: valCompartoProposto - valCompartoAttuale,
    status: statusComparto,
    rilevanzaArt23: 'COMPUTO_FIGURATIVO',
    notaArt23: 'Rilevanza figurativa.',
    spiegazioneUtente: 'Questa riduzione ha natura figurativa: il taglio stabile non libera spazio finanziario all\'interno del limite Art. 23.',
    rischioSovrascrittura: statusComparto !== 'CONFLICT',
    parametroIstruttorioCollegato: 'annualData.ccnl2024.ivcConglobation.totalReduction',
    spiegazioneRischio: 'Se la riduzione non viene allineata anche nel parametro istruttorio, la pagina legacy ricalcolerà o azzererà il valore contabile.',
  } as any);

  // 7. Riduzione stabile del fondo straordinario destinata alla parte stabile
  const valRiduzioneStrAttuale = currentFundData.fondoAccessorioDipendenteData?.st_art79c1_art14c3_art67c2g_riduzioneStraordinario ?? 0;
  const valRiduzioneStrProposto = simulatedFundData.fondoAccessorioDipendenteData?.st_art79c1_art14c3_art67c2g_riduzioneStraordinario ?? 0;
  const hasStr = draftState.straordinario.result !== undefined;
  const statusRiduzioneStr = getFieldStatus(
    'fondoAccessorioDipendenteData.st_art79c1_art14c3_art67c2g_riduzioneStraordinario',
    !hasStr ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'st_art79c1_art14c3_art67c2g_riduzioneStraordinario',
    categoria: 'FONDO_DIPENDENTI_PARTE_STABILE',
    etichetta: 'Riduzione stabile del fondo straordinario destinata alla parte stabile',
    descrizione: 'Trasferimento stabile di risorse dallo straordinario alla parte stabile del Fondo.',
    campoDestinazione: 'fondoAccessorioDipendenteData.st_art79c1_art14c3_art67c2g_riduzioneStraordinario',
    valoreAttuale: valRiduzioneStrAttuale,
    valoreProposto: valRiduzioneStrProposto,
    differenza: valRiduzioneStrProposto - valRiduzioneStrAttuale,
    status: statusRiduzioneStr,
    rilevanzaArt23: 'DENTRO_LIMITE',
    notaArt23: 'Soggetto al limite del trattamento accessorio.',
    spiegazioneUtente: 'La riduzione dello straordinario incrementa stabilmente il fondo dipendenti ed è soggetta al tetto Art. 23.',
  });

  // 7-bis. Riduzione per incremento fondo del Lavoro Straordinario (da sottrarre)
  const valRiduzioneFondoStrAttuale = currentFundData.fondoAccessorioDipendenteData?.st_riduzioneFondoStraordinario ?? 0;
  const valRiduzioneFondoStrProposto = simulatedFundData.fondoAccessorioDipendenteData?.st_riduzioneFondoStraordinario ?? 0;
  const statusRiduzioneFondoStr = getFieldStatus(
    'fondoAccessorioDipendenteData.st_riduzioneFondoStraordinario',
    !hasStr ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'st_riduzioneFondoStraordinario',
    categoria: 'FONDO_DIPENDENTI_PARTE_STABILE',
    etichetta: 'Riduzione per incremento fondo del Lavoro Straordinario (da sottrarre)',
    descrizione: 'Decremento delle risorse stabili del fondo per finanziare l\'incremento dello straordinario.',
    campoDestinazione: 'fondoAccessorioDipendenteData.st_riduzioneFondoStraordinario',
    valoreAttuale: valRiduzioneFondoStrAttuale,
    valoreProposto: valRiduzioneFondoStrProposto,
    differenza: valRiduzioneFondoStrProposto - valRiduzioneFondoStrAttuale,
    status: statusRiduzioneFondoStr,
    rilevanzaArt23: 'DENTRO_LIMITE',
    notaArt23: 'Riduce la spesa soggetta al limite dell\'Art. 23.',
    spiegazioneUtente: 'La riduzione del fondo decentrato per finanziare lo straordinario.',
  });

  // 8. Economie del fondo straordinario da riversare una tantum
  const valEcoStrAttuale = currentFundData.fondoAccessorioDipendenteData?.vn_art15c1m_art67c3e_risparmiStraordinario ?? 0;
  const valEcoStrProposto = simulatedFundData.fondoAccessorioDipendenteData?.vn_art15c1m_art67c3e_risparmiStraordinario ?? 0;
  const statusEcoStr = getFieldStatus(
    'fondoAccessorioDipendenteData.vn_art15c1m_art67c3e_risparmiStraordinario',
    !hasStr ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'vn_art15c1m_art67c3e_risparmiStraordinario',
    categoria: 'FONDO_DIPENDENTI_PARTE_VARIABILE',
    etichetta: 'Economie del fondo straordinario da riversare una tantum',
    descrizione: 'Risparmi dello straordinario dell\'anno precedente riversati nella parte variabile del fondo.',
    campoDestinazione: 'fondoAccessorioDipendenteData.vn_art15c1m_art67c3e_risparmiStraordinario',
    valoreAttuale: valEcoStrAttuale,
    valoreProposto: valEcoStrProposto,
    differenza: valEcoStrProposto - valEcoStrAttuale,
    status: statusEcoStr,
    rilevanzaArt23: 'FUORI_LIMITE',
    notaArt23: 'Escluso dal limite del trattamento accessorio.',
    spiegazioneUtente: 'Le economie dello straordinario destinate alla parte variabile sono escluse dal tetto dell\'Art. 23.',
  });

  // 9. Fondo lavoro straordinario ordinario dell’anno
  const valStrOrdAttuale = currentFundData.annualData?.fondoLavoroStraordinario ?? 0;
  const valStrOrdProposto = simulatedFundData.annualData?.fondoLavoroStraordinario ?? 0;
  const statusStrOrd = getFieldStatus(
    'annualData.fondoLavoroStraordinario',
    !hasStr ? 'MISSING_DATA' : 'READY'
  );
  items.push({
    id: 'annualData_fondoLavoroStraordinario',
    categoria: 'CONFIGURAZIONE_ANNUALE',
    etichetta: 'Fondo lavoro straordinario ordinario dell’anno',
    descrizione: 'Consistenza delle risorse dello straordinario ordinario per l\'anno corrente.',
    campoDestinazione: 'annualData.fondoLavoroStraordinario',
    valoreAttuale: valStrOrdAttuale,
    valoreProposto: valStrOrdProposto,
    differenza: valStrOrdProposto - valStrOrdAttuale,
    status: statusStrOrd,
    rilevanzaArt23: 'DENTRO_LIMITE',
    notaArt23: 'Soggetto al limite del trattamento accessorio.',
    spiegazioneUtente: 'Lo straordinario ordinario è calcolato nel trattamento accessorio soggetto al tetto complessivo.',
  });

  // 10. D.L. 25/2025 (Solo Limite - REQUIRES_CONFIRMATION)
  const valDl25Attuale = currentFundData.fondoAccessorioDipendenteData?.st_incrementoDL25_2025 ?? 0;
  const dl25Res = draftState.dl25.result;
  const valDl25Proposto = dl25Res?.limiteMassimoDL25 ?? 0;
  const hasDl25 = dl25Res !== undefined;
  const isDl25Applicabile = dl25Res?.applicabilityStatus !== 'NOT_APPLICABLE';
  items.push({
    id: 'st_incrementoDL25_2025',
    categoria: 'SOLO_CONTROLLO',
    etichetta: 'Limite massimo incremento D.L. 25/2025',
    descrizione: 'Limite massimo dell\'incremento stabile previsto dal D.L. 25/2025.',
    campoDestinazione: 'fondoAccessorioDipendenteData.st_incrementoDL25_2025',
    valoreAttuale: valDl25Attuale,
    valoreProposto: valDl25Proposto,
    differenza: valDl25Proposto - valDl25Attuale,
    status: isBlocked ? 'BLOCKED' : !hasDl25 ? 'MISSING_DATA' : !isDl25Applicabile ? 'NOT_APPLICABLE' : 'REQUIRES_CONFIRMATION',
    rilevanzaArt23: 'FUORI_LIMITE',
    notaArt23: 'Escluso dal limite ordinario (opera in deroga al tetto 2016).',
    spiegazioneUtente: 'Il wizard calcola solo il tetto massimo; l’incremento effettivo sarà inserito nella Costituzione Fondo, previa scelta dell’ente e verifica degli atti.',
  });

  // 11. PNRR — Art. 8, comma 3, D.L. 13/2023 (Fondo Dipendenti - CONTROL_ONLY)
  const valPnrrDipAttuale = currentFundData.fondoAccessorioDipendenteData?.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 ?? 0;
  const pnrrRes = draftState.pnrr.result;
  const valPnrrDipProposto = pnrrRes?.limiteMassimoPnrrFondoDipendenti ?? 0;
  const hasPnrr = pnrrRes !== undefined;
  const isPnrrApplicabile = pnrrRes?.isApplicabile ?? false;
  items.push({
    id: 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016',
    categoria: 'SOLO_CONTROLLO',
    etichetta: 'Limite massimo PNRR Fondo dipendenti',
    descrizione: 'Limite massimo per gli incentivi PNRR relativi al personale dipendente.',
    campoDestinazione: 'fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016',
    valoreAttuale: valPnrrDipAttuale,
    valoreProposto: valPnrrDipProposto,
    differenza: valPnrrDipProposto - valPnrrDipAttuale,
    status: isBlocked ? 'BLOCKED' : !hasPnrr ? 'MISSING_DATA' : !isPnrrApplicabile ? 'NOT_APPLICABLE' : 'CONTROL_ONLY',
    rilevanzaArt23: 'NON_RILEVANTE',
    notaArt23: 'Escluso dal limite del trattamento accessorio.',
    spiegazioneUtente: 'Rappresenta il tetto massimo delle risorse escluse dall\'Art. 23. Non alimenta in automatico la costituzione; l\'ente inserirà l\'importo effettivo.',
  });

  // 12. PNRR — Art. 8, comma 3, D.L. 13/2023 (Fondo Dirigenti - CONTROL_ONLY)
  const valPnrrDirAttuale = currentFundData.fondoDirigenzaData?.va_dl13_2023_art8c3_incrementoPNRR ?? 0;
  const valPnrrDirProposto = pnrrRes?.limiteMassimoPnrrFondoDirigenza ?? 0;
  const hasDirigenti = draftState.ente.hasDirigenza === true;
  items.push({
    id: 'va_dl13_2023_art8c3_incrementoPNRR',
    categoria: 'FONDO_DIRIGENTI',
    etichetta: 'Limite massimo PNRR Fondo dirigenti',
    descrizione: 'Limite massimo per gli incentivi PNRR relativi alla dirigenza.',
    campoDestinazione: 'fondoDirigenzaData.va_dl13_2023_art8c3_incrementoPNRR',
    valoreAttuale: valPnrrDirAttuale,
    valoreProposto: valPnrrDirProposto,
    differenza: valPnrrDirProposto - valPnrrDirAttuale,
    status: isBlocked ? 'BLOCKED' : !hasDirigenti ? 'NOT_APPLICABLE' : !hasPnrr ? 'MISSING_DATA' : !isPnrrApplicabile ? 'NOT_APPLICABLE' : 'CONTROL_ONLY',
    rilevanzaArt23: 'NON_RILEVANTE',
    notaArt23: 'Escluso dal limite del trattamento accessorio.',
    spiegazioneUtente: 'Rappresenta il tetto massimo delle risorse escluse dall\'Art. 23 per la dirigenza. Visibile solo se l\'ente ha personale dirigente.',
  });

  // 13. Limite Art. 23, comma 2, attualizzato (CONTROL_ONLY)
  const art23Res = draftState.art23.result;
  const valArt23Proposto = art23Res?.limiteArt23Attualizzato ?? 0;
  const hasArt23 = art23Res !== undefined;
  items.push({
    id: 'limite_art23_attualizzato',
    categoria: 'SOLO_CONTROLLO',
    etichetta: 'Limite Art. 23, comma 2, attualizzato',
    descrizione: 'Limite massimo complessivo delle risorse accessorie dell\'ente.',
    campoDestinazione: 'N/A',
    valoreAttuale: null,
    valoreProposto: valArt23Proposto,
    status: isBlocked ? 'BLOCKED' : !hasArt23 ? 'MISSING_DATA' : 'CONTROL_ONLY',
    rilevanzaArt23: 'SOLO_CONTROLLO',
    notaArt23: 'Tetto complessivo del trattamento accessorio.',
    spiegazioneUtente: 'Dato di controllo generale. Non rappresenta una risorsa finanziabile, ma il limite complessivo di spesa.',
  });

  return {
    items,
    hasBlockingIssues: isBlocked,
    warningCount: selectWizard2026Warnings(draftState).length,
  };
}
