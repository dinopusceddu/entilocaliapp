import type {
  AnnualData,
  CalculationSection,
  CanonicalFundResult,
  FondoAccessorioDipendenteData,
  FundLedgerEntry,
  FundLedgerEntryStatus,
} from '../../domain';
import FinancialMath from '../../utils/financialMath';

const SPECIAL_KEYS = new Set([
  'st_art58c1_CCNL2026_incremento014_MS2021',
  'vn_art58_CCNL2026_arretrati2024_2025',
  'vn_art58c2_CCNL2026_incremento022_MS2021',
  'vn_art58c2_incremento_max022_ms2021',
  'vn_art58c2_incremento_max022_ms2021_anno2025',
  'st_art60c2_CCNL2026_decurtazioneIndennitaComparto',
  'cl_totaleParzialeRisorsePerConfrontoTetto2016',
  'cl_ammontareSoggettoLimite2016',
]);

const SEMANTIC_IDS: Record<string, string> = {
  st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 'OVERTIME_STABLE_TRANSFER',
  st_art79c1_art4c2_art67c2c_integrazioneRIA: 'RIA',
  st_incrementoDL25_2025: 'DL25_CURRENT',
  st_incrementoDecretoPA: 'DL25_CURRENT_LEGACY_ALIAS',
};

const signedAmount = (entry: FundLedgerEntry): number => {
  const amount = entry.amount ?? 0;
  return entry.operation === 'DEDUCTION' ? -Math.abs(amount) : amount;
};

const round = (value: number): number => FinancialMath.roundTo2DP(value);

export function deriveCanonicalFundResult(
  entries: FundLedgerEntry[],
  warnings: string[] = [],
  missingPrerequisites: string[] = []
): CanonicalFundResult {
  const ids = new Set<string>();
  for (const entry of entries) {
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate canonical fund ledger entry id: ${entry.id}`);
    }
    ids.add(entry.id);
  }

  const economicEntries = entries.filter(entry => entry.economicEffect !== false);
  const stableEntries = economicEntries.filter(entry => entry.component === 'STABLE');
  const variableEntries = economicEntries.filter(entry => entry.component === 'VARIABLE');

  const determinedSum = (candidates: FundLedgerEntry[]): number => round(candidates
    .filter(entry => entry.status === 'VALID' && entry.amount !== null)
    .reduce((sum, entry) => sum + signedAmount(entry), 0));

  const isDetermined = (candidates: FundLedgerEntry[]): boolean => candidates.every(
    entry => entry.status === 'VALID' && entry.amount !== null
  );

  const verifiedStableTotal = determinedSum(stableEntries);
  const verifiedVariableTotal = determinedSum(variableEntries);
  const stableTotal = isDetermined(stableEntries) ? verifiedStableTotal : null;
  const variableTotal = isDetermined(variableEntries) ? verifiedVariableTotal : null;
  const total = stableTotal === null || variableTotal === null
    ? null
    : round(stableTotal + variableTotal);

  const art23Entries = entries.filter(entry => entry.art23Treatment === 'SUBJECT');
  const excludedEntries = entries.filter(entry => entry.art23Treatment === 'EXCLUDED');
  const verifiedArt23Subject = determinedSum(art23Entries);
  const verifiedArt23Excluded = determinedSum(excludedEntries);
  const art23Subject = isDetermined(art23Entries) ? verifiedArt23Subject : null;
  const art23Excluded = isDetermined(excludedEntries) ? verifiedArt23Excluded : null;

  const hasInvalid = entries.some(entry => entry.status === 'INVALID');
  const hasUndetermined = missingPrerequisites.length > 0 || entries.some(
    entry => entry.status === 'MISSING' || entry.status === 'UNDETERMINED'
  );

  return {
    stableTotal,
    variableTotal,
    total,
    verifiedStableTotal,
    verifiedVariableTotal,
    verifiedTotal: round(verifiedStableTotal + verifiedVariableTotal),
    art23Subject,
    art23Excluded,
    verifiedArt23Subject,
    verifiedArt23Excluded,
    entries,
    status: hasInvalid ? 'INVALID' : hasUndetermined ? 'UNDETERMINED' : 'VALID',
    warnings,
    missingPrerequisites,
  };
}

export interface CanonicalFundLedgerBuildInput {
  readonly year: number;
  readonly annualData: AnnualData;
  readonly fadData: Partial<FondoAccessorioDipendenteData>;
  readonly sections: Record<string, CalculationSection>;
  readonly wizardTransferSnapshot?: unknown;
  readonly overtimeArt23Amount?: number;
  readonly externalMissingPrerequisites?: readonly string[];
}

function statusForAmount(amount: number | null): FundLedgerEntryStatus {
  if (amount === null) return 'MISSING';
  return Number.isFinite(amount) && amount >= 0 ? 'VALID' : 'INVALID';
}

function hasTransferredPath(snapshot: unknown, destinationPath: string): boolean {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const plan = (snapshot as { transferPlan?: unknown }).transferPlan;
  return Array.isArray(plan) && plan.some(item => (
    !!item && typeof item === 'object' &&
    (item as { destinationPath?: unknown }).destinationPath === destinationPath
  ));
}

function resolve022LegacyValue(fadData: Partial<FondoAccessorioDipendenteData>): {
  amount: number;
  source: 'TRANSFERRED' | 'LEGACY_MIGRATED' | 'MANUAL';
  legacyKey?: string;
} {
  if (fadData.vn_art58c2_CCNL2026_incremento022_MS2021 !== undefined && fadData.vn_art58c2_CCNL2026_incremento022_MS2021 !== null) {
    return { amount: fadData.vn_art58c2_CCNL2026_incremento022_MS2021, source: 'MANUAL' };
  }
  if (fadData.vn_art58c2_incremento_max022_ms2021 !== undefined && fadData.vn_art58c2_incremento_max022_ms2021 !== null) {
    return {
      amount: fadData.vn_art58c2_incremento_max022_ms2021,
      source: 'LEGACY_MIGRATED',
      legacyKey: 'vn_art58c2_incremento_max022_ms2021',
    };
  }
  if (fadData.vn_art58c2_incremento_max022_ms2021_anno2025 !== undefined && fadData.vn_art58c2_incremento_max022_ms2021_anno2025 !== null) {
    return {
      amount: fadData.vn_art58c2_incremento_max022_ms2021_anno2025,
      source: 'LEGACY_MIGRATED',
      legacyKey: 'vn_art58c2_incremento_max022_ms2021_anno2025',
    };
  }
  return { amount: 0, source: 'MANUAL' };
}

export function buildCanonicalFundLedger(input: CanonicalFundLedgerBuildInput): CanonicalFundResult {
  const { year, annualData, fadData, sections, wizardTransferSnapshot } = input;
  const entries: FundLedgerEntry[] = [];
  const warnings: string[] = [];
  const missingPrerequisites: string[] = [...(input.externalMissingPrerequisites ?? [])];

  for (const [sectionId, section] of Object.entries(sections)) {
    if (sectionId === 'cl_limiti') continue;
    for (const item of section.items) {
      if (SPECIAL_KEYS.has(item.key)) continue;
      const component = sectionId === 'stabili' ? 'STABLE' : 'VARIABLE';
      const id = SEMANTIC_IDS[item.key] ?? `LEGACY_FAD_RESOURCE:${item.key}`;
      entries.push({
        id,
        amount: item.amount,
        component,
        operation: item.isSubtractor || item.operator === '-' ? 'DEDUCTION' : 'ADDITION',
        competenceYear: year,
        source: SEMANTIC_IDS[item.key] ? 'MANUAL' : 'LEGACY_MIGRATED',
        art23Treatment: item.isRelevantToArt23Limit ? 'SUBJECT' : 'EXCLUDED',
        status: statusForAmount(item.amount),
        normativeRef: item.riferimentoNormativo,
        provenance: { legacyField: item.key },
      });
    }
  }

  // Compatibilità della classificazione DL25 già esposta nel prospetto Art. 23:
  // una sola entry ha effetto economico, questa seconda riga è solo informativa sul limite.
  const dl25Entry = entries.find(entry => entry.id === 'DL25_CURRENT');
  if (dl25Entry) {
    entries.push({
      ...dl25Entry,
      id: 'DL25_ART23_EXCLUSION',
      economicEffect: false,
      art23Treatment: 'EXCLUDED',
      provenance: { canonicalResourceId: 'DL25_CURRENT', effect: 'ART23_CLASSIFICATION_ONLY' },
    });
  }

  const current014Path = 'fondoAccessorioDipendenteData.st_art58c1_CCNL2026_incremento014_MS2021';
  const canonical014 = fadData.st_art58c1_CCNL2026_incremento014_MS2021;
  const ms2021 = annualData.ccnl2024?.monteSalari2021;
  let amount014: number | null = null;
  let status014: FundLedgerEntryStatus = 'MISSING';
  let source014: FundLedgerEntry['source'] = 'CALCULATED';
  if (canonical014 !== undefined && canonical014 !== null) {
    amount014 = canonical014;
    status014 = statusForAmount(canonical014);
    source014 = hasTransferredPath(wizardTransferSnapshot, current014Path) ? 'TRANSFERRED' : 'LEGACY_MIGRATED';
  } else if (year < 2024) {
    amount014 = 0;
    status014 = 'VALID';
  } else if (typeof ms2021 === 'number' && Number.isFinite(ms2021) && ms2021 >= 0) {
    amount014 = round(ms2021 * 0.0014);
    status014 = 'VALID';
  } else if (typeof ms2021 === 'number' && ms2021 < 0) {
    status014 = 'INVALID';
    missingPrerequisites.push('CCNL_014_MS2021_INVALID');
  } else {
    missingPrerequisites.push('CCNL_014_MS2021_MISSING');
  }
  entries.push({
    id: 'CCNL_014_CURRENT',
    amount: amount014,
    component: 'STABLE',
    operation: 'ADDITION',
    competenceYear: year >= 2024 ? year : 2024,
    source: source014,
    art23Treatment: 'EXCLUDED',
    status: status014,
    normativeRef: 'Art. 58 c. 1 CCNL Funzioni Locali 23.02.2026',
    provenance: { legacyField: canonical014 !== undefined ? 'st_art58c1_CCNL2026_incremento014_MS2021' : undefined },
  });

  const legacyRecovery014 = fadData.vn_art58_CCNL2026_arretrati2024_2025;
  if (legacyRecovery014 !== undefined && legacyRecovery014 !== null) {
    const recovery014Path = 'fondoAccessorioDipendenteData.vn_art58_CCNL2026_arretrati2024_2025';
    entries.push({
      id: 'CCNL_014_RECOVERY_LEGACY_2024_2025',
      amount: legacyRecovery014,
      component: 'VARIABLE',
      operation: 'ADDITION',
      competenceYear: year,
      originYear: null,
      source: hasTransferredPath(wizardTransferSnapshot, recovery014Path) ? 'TRANSFERRED' : 'LEGACY_MIGRATED',
      art23Treatment: 'EXCLUDED',
      status: legacyRecovery014 < 0 || !Number.isFinite(legacyRecovery014) ? 'INVALID' : 'UNDETERMINED',
      normativeRef: 'Art. 58 c. 1 / orientamento ARAN 37357',
      provenance: {
        legacyField: 'vn_art58_CCNL2026_arretrati2024_2025',
        reason: 'Aggregato legacy privo di istruttoria distinta per annualità di origine.',
      },
    });
    missingPrerequisites.push('CCNL_014_RECOVERY_ORIGIN_AND_ELIGIBILITY');
  }

  const resolved022 = resolve022LegacyValue(fadData);
  const current022Path = 'fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021';
  const amount022 = year < 2025 ? 0 : resolved022.amount;
  if (year < 2025 && resolved022.amount !== 0) {
    warnings.push('Incremento 0,22% legacy ignorato: la decorrenza normativa inizia nel 2025.');
  }
  if (resolved022.legacyKey) {
    warnings.push(`Alias legacy ${resolved022.legacyKey} adattato read-time a CCNL_022_CURRENT.`);
  }
  entries.push({
    id: 'CCNL_022_CURRENT',
    amount: amount022,
    component: 'VARIABLE',
    operation: 'ADDITION',
    competenceYear: year,
    source: hasTransferredPath(wizardTransferSnapshot, current022Path) ? 'TRANSFERRED' : resolved022.source,
    art23Treatment: 'EXCLUDED',
    status: statusForAmount(amount022),
    normativeRef: 'Art. 58 c. 2 CCNL Funzioni Locali 23.02.2026',
    provenance: { legacyField: resolved022.legacyKey },
  });

  const legacyArt60 = fadData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto;
  const art60Path = 'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto';
  let art60Amount: number | null = null;
  let art60Status: FundLedgerEntryStatus = 'UNDETERMINED';
  let art60Source: FundLedgerEntry['source'] = 'CALCULATED';
  if (year < 2026) {
    art60Amount = 0;
    art60Status = 'VALID';
    if (legacyArt60 !== undefined && legacyArt60 !== null && legacyArt60 !== 0) {
      warnings.push(`Art. 60 legacy (${legacyArt60}) ignorato per il ${year}: decorrenza 01/01/2026.`);
    }
  } else if (legacyArt60 !== undefined && legacyArt60 !== null) {
    art60Amount = Math.abs(legacyArt60);
    art60Status = statusForAmount(legacyArt60);
    art60Source = hasTransferredPath(wizardTransferSnapshot, art60Path) ? 'TRANSFERRED' : 'LEGACY_MIGRATED';
  } else if (year === 2026 && annualData.ccnl2024?.ivcConglobation?.totalReduction !== undefined) {
    art60Amount = Math.abs(annualData.ccnl2024.ivcConglobation.totalReduction);
    art60Status = statusForAmount(art60Amount);
  } else if (year === 2026 && annualData.ccnl2024?.personaleInServizio01012026 !== undefined && annualData.ccnl2024?.valoreTabellaCCol3 !== undefined) {
    art60Amount = round(
      annualData.ccnl2024.personaleInServizio01012026 *
      annualData.ccnl2024.valoreTabellaCCol3 * 12
    );
    art60Status = statusForAmount(art60Amount);
  } else {
    missingPrerequisites.push(year > 2026 ? 'ART60_BASE_2026_UNDETERMINED' : 'ART60_PLATEA_01012026_MISSING');
  }

  entries.push({
    id: 'ART60_CONSOLIDATION',
    amount: art60Amount,
    component: 'STABLE',
    operation: 'DEDUCTION',
    competenceYear: year,
    originYear: year > 2026 ? 2026 : year,
    source: art60Source,
    art23Treatment: 'SUBJECT',
    status: art60Status,
    normativeRef: 'Art. 60 CCNL Funzioni Locali 23.02.2026',
    provenance: { legacyField: legacyArt60 !== undefined ? 'st_art60c2_CCNL2026_decurtazioneIndennitaComparto' : undefined },
  });
  entries.push({
    id: 'ART60_ART23_FIGURATIVE',
    amount: art60Amount,
    component: 'STABLE',
    operation: 'ADDITION',
    competenceYear: year,
    originYear: year > 2026 ? 2026 : year,
    source: art60Source,
    art23Treatment: 'SUBJECT',
    status: art60Status,
    economicEffect: false,
    normativeRef: 'Art. 60 c. 5 CCNL Funzioni Locali 23.02.2026',
    provenance: { effect: 'ART23_LIMIT_ONLY' },
  });

  if (input.overtimeArt23Amount !== undefined) {
    entries.push({
      id: 'OVERTIME_ART23_CURRENT',
      amount: input.overtimeArt23Amount,
      component: 'VARIABLE',
      operation: 'ADDITION',
      competenceYear: year,
      source: 'MANUAL',
      art23Treatment: 'SUBJECT',
      status: statusForAmount(input.overtimeArt23Amount),
      economicEffect: false,
      provenance: { sourceField: 'annualData.fondoLavoroStraordinario' },
    });
  }

  const result = deriveCanonicalFundResult(entries, warnings, missingPrerequisites);
  const cachedTotal = fadData.cl_totaleParzialeRisorsePerConfrontoTetto2016;
  if (cachedTotal !== undefined && result.art23Subject !== null && Math.abs(cachedTotal - result.art23Subject) > 0.01) {
    return deriveCanonicalFundResult(
      entries,
      [...warnings, `Cache Art. 23 (${cachedTotal}) non riconciliata con le entries (${result.art23Subject}); cache ignorata.`],
      missingPrerequisites
    );
  }
  return result;
}
