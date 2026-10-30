import type {
  AnnualData,
  CalculationSection,
  CanonicalFundResult,
  FondoAccessorioDipendenteData,
  FundLedgerEntry,
  FundLedgerEntryStatus,
} from '../../domain';
import FinancialMath from '../../utils/financialMath';
import { resolveAnnualPnrrFaculty } from '../shared/pnrrFaculty';
import { getDl25ApplicabilityStatus } from '../wizard2026/dl25Increment';
import { mapLegacyTipologiaEnteToArt33EntityType } from '../shared/art33ApplicationPolicy';
import { resolveAnnualDl25, resolveDL25IncrementValue } from '../shared/dl25CarryForward';
import { resolveCcnlRecoveries } from '../shared/ccnlRecovery';

const SPECIAL_KEYS = new Set([
  'st_art58c1_CCNL2026_incremento014_MS2021',
  'vn_art58_CCNL2026_arretrati2024_2025',
  'vn_art58c2_CCNL2026_incremento022_MS2021',
  'vn_art58c2_incremento_max022_ms2021',
  'vn_art58c2_incremento_max022_ms2021_anno2025',
  'st_art60c2_CCNL2026_decurtazioneIndennitaComparto',
  'st_incrementoDL25_2025',
  'st_incrementoDecretoPA',
  'cl_totaleParzialeRisorsePerConfrontoTetto2016',
  'cl_ammontareSoggettoLimite2016',
  'vn_dl13_art8c3_incrementoPNRR_max5stabile2016',
]);

const SEMANTIC_IDS: Record<string, string> = {
  st_art79c1_art14c3_art67c2g_riduzioneStraordinario: 'OVERTIME_STABLE_TRANSFER',
  st_art79c1_art4c2_art67c2c_integrazioneRIA: 'RIA',
};

const signedAmount = (entry: FundLedgerEntry): number => {
  const amount = entry.amount !== null && entry.amount !== undefined ? round(entry.amount) : 0;
  return entry.operation === 'DEDUCTION' ? -Math.abs(amount) : amount;
};

const round = (value: number): number => FinancialMath.roundTo2DP(value);

export function deriveCanonicalFundResult(
  rawEntries: FundLedgerEntry[],
  warnings: string[] = [],
  missingPrerequisites: string[] = []
): CanonicalFundResult {
  const ids = new Set<string>();
  const entries: FundLedgerEntry[] = rawEntries.map(entry => {
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate canonical fund ledger entry id: ${entry.id}`);
    }
    ids.add(entry.id);
    return entry.amount !== null && typeof entry.amount === 'number'
      ? { ...entry, amount: round(entry.amount) }
      : entry;
  });

  const controlEntries = entries.filter(entry => entry.id !== 'DL25_ART23_EXCLUSION');
  const economicEntries = controlEntries.filter(entry => entry.economicEffect !== false);
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

  const art23Entries = controlEntries.filter(entry => entry.art23Treatment === 'SUBJECT');
  const excludedEntries = controlEntries.filter(entry => entry.art23Treatment === 'EXCLUDED');
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
  const pnrr = resolveAnnualPnrrFaculty({ ...annualData, annoRiferimento: year }, fadData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016);
  if (pnrr.status === 'UNDETERMINED') missingPrerequisites.push(...pnrr.reasons);
  entries.push({
    id: 'PNRR_APPLIED', amount: pnrr.status === 'VALID' ? pnrr.contribution : null,
    component: 'VARIABLE', operation: 'ADDITION', competenceYear: year,
    source: hasTransferredPath(wizardTransferSnapshot, 'fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016') ? 'TRANSFERRED' : 'MANUAL',
    art23Treatment: 'EXCLUDED', status: pnrr.status,
    normativeRef: 'Art. 8, commi 3 e 4, D.L. 13/2023', provenance: pnrr,
  });

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

  // One authority for both aliases. A simulator maximum is never an adopted resource.
  const canonicalPresent = fadData.st_incrementoDL25_2025 != null;
  const aliasPresent = fadData.st_incrementoDecretoPA != null;
  const stored = canonicalPresent || aliasPresent ? resolveDL25IncrementValue(fadData) : null;
  const carry = annualData.dl25 ? resolveAnnualDl25({ annualData: { ...annualData, annoRiferimento: year },
    fondoAccessorioDipendenteData: fadData as FondoAccessorioDipendenteData }) : undefined;
  // An explicitly unexercised zero stock needs no automatically constituted field.
  if (stored !== null || (carry && !(carry.state === 'VALID' && carry.currentCumulativeApplied === 0))) {
    let status: FundLedgerEntryStatus = statusForAmount(stored);
    const issues: string[] = [];
    if (carry) {
      if (carry.state !== 'VALID') { status = carry.state; issues.push(...carry.issues); }
      else if (stored === null) { status = 'MISSING'; issues.push('DL25_CONSTITUTED_AMOUNT_MISSING'); }
      else if (stored !== carry.currentCumulativeApplied) { status = 'INVALID'; issues.push('DL25_STOCK_INCONSISTENT_WITH_DECISION'); }
    } else if (stored !== null && stored > 0) {
      status = 'UNDETERMINED'; issues.push('DL25_LEGACY_STOCK_UNQUALIFIED');
    }
    if (status === 'VALID' && stored !== null && stored > 0) {
      const entityType = annualData.entityClassification?.entityType
        ?? mapLegacyTipologiaEnteToArt33EntityType(annualData.tipologiaEnte);
      const scope = entityType === undefined ? 'NEEDS_MANUAL_REVIEW' : getDl25ApplicabilityStatus(entityType);
      if (scope !== 'DIRECTLY_APPLICABLE') {
        status = scope === 'NOT_APPLICABLE' ? 'INVALID' : 'UNDETERMINED';
        issues.push(scope === 'TRANSFER_ONLY' ? 'DL25_TRANSFER_REQUIRES_LEGAL_REVIEW' : 'DL25_DIRECT_SCOPE_NOT_QUALIFIED');
      }
      const financial = annualData.simulatoreRisultati;
      if (status === 'VALID' && (carry?.currentYearDelta ?? 0) > 0 && financial?.state !== undefined) {
        if (financial.state !== 'VALID') { status = financial.state; issues.push('DL25_FINANCIAL_NOT_QUALIFIED'); }
        else {
          const maximum = financial.fase5_incrementoNettoEffettivoFondo;
          if (maximum === undefined) { status = 'UNDETERMINED'; issues.push('DL25_FINANCIAL_ROOM_MISSING'); }
          else if (!Number.isFinite(maximum) || maximum < 0 || carry!.currentYearDelta! > maximum) {
            status = 'INVALID'; issues.push('DL25_DELTA_EXCEEDS_FINANCIAL_ROOM');
          }
        }
      }
    }
    if (status !== 'VALID') missingPrerequisites.push(...(issues.length ? issues : ['DL25_AMOUNT_INVALID']));
    entries.push({ id: 'DL25_CURRENT', amount: stored !== null && Number.isFinite(stored) ? stored : null,
      component: 'STABLE', operation: 'ADDITION', competenceYear: year,
      source: hasTransferredPath(wizardTransferSnapshot, 'fondoAccessorioDipendenteData.st_incrementoDL25_2025')
        ? 'TRANSFERRED' : canonicalPresent ? 'MANUAL' : 'LEGACY_MIGRATED',
      art23Treatment: 'EXCLUDED', status, normativeRef: 'Art. 14, comma 1-bis, D.L. 25/2025',
      provenance: { semantics: 'CURRENT_CUMULATIVE_STABLE_DL25_STOCK',
        legacyField: canonicalPresent ? 'st_incrementoDL25_2025' : aliasPresent ? 'st_incrementoDecretoPA' : undefined,
        carry, qualificationIssues: issues } });
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
  if (!annualData.ccnlRecovery?.instructions && legacyRecovery014 !== undefined && legacyRecovery014 !== null) {
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

  for (const [index, recovery] of resolveCcnlRecoveries(annualData.ccnlRecovery, year, ms2021).entries()) {
    const i = recovery.instruction;
    const fundRoute = recovery.route === 'FUND_VARIABLE_RESIDUAL';
    entries.push({
      id: recovery.issues.includes('CCNL_RECOVERY_IDENTITY_INVALID') ? `CCNL_RECOVERY_INVALID_IDENTITY_${index}` : `${i.kind}_RECOVERY_${i.competenceYear}`,
      amount: recovery.status === 'VALID' ? (fundRoute ? recovery.recoveryAmount : 0) : null,
      component: 'VARIABLE', operation: 'ADDITION', competenceYear: i.competenceYear,
      originYear: i.competenceYear, source: 'RECOVERY', art23Treatment: 'EXCLUDED', status: recovery.status,
      normativeRef: 'Art. 58 / Art. 59 c. 1 CCNL 23.02.2026; ARAN 37357 e 39114',
      provenance: { ...recovery, recognitionYear: year, reason: recovery.issues.join('; ') || undefined },
    });
    missingPrerequisites.push(...recovery.issues.map(code => `${code}:${i.kind}:${i.competenceYear}`));
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
