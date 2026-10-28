import type { FondoDirigenzaData } from '../../domain';
import FinancialMath from '../../utils/financialMath';
import type { DirigenzaArt23Resolution, DirigenzaCacheReconciliation } from '../../domain/dirigenzaArt23';
export type { DirigenzaArt23Resolution, DirigenzaCacheReconciliation } from '../../domain/dirigenzaArt23';

// Same classification as the existing FondoDirigenzaPage subject formula.
// Every resource line is optional; none of these lines is a completeness prerequisite.
export const DIRIGENZA_ART23_SUBJECT_FIELDS = [
  'st_art57c2a_CCNL2020_unicoImporto2020',
  'st_art57c2a_CCNL2020_riaPersonaleCessato2020',
  'st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo',
  'st_art57c2e_CCNL2020_risorseAutonomeStabili',
  'va_art57c2d_CCNL2020_sommeOnnicomprensivita',
  'va_art57c2e_CCNL2020_risorseAutonomeVariabili',
  'va_art33c2_DL34_2019_incrementoDeroga',
  'va_compensiExLege_rilevanti',
] as const satisfies readonly (keyof FondoDirigenzaData)[];

export const DIRIGENZA_ART23_EXCLUDED_FIELDS = [
  'st_art56c1_CCNL2020_incremento1_53MonteSalari2015',
  'st_art39c1_CCNL2024_incremento2_01MonteSalari2018',
  'st_art24c1_CCNL2022_2024_incremento3_05MonteSalari2021',
  'va_art57c2b_CCNL2020_risorseLeggeSponsor',
  'va_art57c3_CCNL2020_residuiAnnoPrecedente',
  'va_dl13_2023_art8c3_incrementoPNRR',
  'va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020',
  'va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023',
  'va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione',
  'va_art24c3_CCNL2022_2024_incremento0_22MonteSalari2021',
  'va_compensiExLege_nonRilevanti',
] as const satisfies readonly (keyof FondoDirigenzaData)[];

export type DirigenzaAtomicData = Omit<FondoDirigenzaData, 'lim_totaleParzialeRisorseConfrontoTetto2016'>;

/** Read-only, deterministic derivation. The legacy total is never inspected here. */
export function resolveDirigenzaArt23Subject(
  data: DirigenzaAtomicData | null | undefined,
  hasDirigenza: boolean | null | undefined,
): DirigenzaArt23Resolution {
  if (hasDirigenza === false) return { status: 'VALID', subjectAmount: 0, excludedAmount: 0, issues: [] };
  if (hasDirigenza == null) return {
    status: 'UNDETERMINED', subjectAmount: null, excludedAmount: null, issues: ['DIRIGENZA_APPLICABILITY_MISSING'],
  };
  if (hasDirigenza !== true || (data != null && (typeof data !== 'object' || Array.isArray(data)))) return {
    status: 'INVALID', subjectAmount: null, excludedAmount: null, issues: ['DIRIGENZA_INPUT_INVALID'],
  };
  const allFields = [...DIRIGENZA_ART23_SUBJECT_FIELDS, ...DIRIGENZA_ART23_EXCLUDED_FIELDS];
  // A legacy cache-only/uninitialised payload provides no atomic resource detail at all.
  // Require an atomic detail model, not any particular populated optional line.
  // Declared undefined/null rows are legitimate absent resources, including UI defaults.
  if (!data || !allFields.some(field => Object.prototype.hasOwnProperty.call(data, field))) return {
    status: 'UNDETERMINED', subjectAmount: null, excludedAmount: null, issues: ['DIRIGENZA_RESOURCE_DETAIL_MISSING'],
  };
  const issues: string[] = [];
  for (const field of allFields) {
    const value = data[field];
    if (value == null) continue; // Optional resource absence, not an unresolved prerequisite.
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
      issues.push(`DIRIGENZA_RESOURCE_INVALID:${field}`);
    }
  }
  if (issues.length) return { status: 'INVALID', subjectAmount: null, excludedAmount: null, issues };
  const sum = (fields: readonly (keyof DirigenzaAtomicData)[]) => FinancialMath.roundTo2DP(
    fields.reduce((total, field) => FinancialMath.addExact(total, data[field] ?? 0), 0),
  );
  const subjectAmount = sum(DIRIGENZA_ART23_SUBJECT_FIELDS);
  const excludedAmount = sum(DIRIGENZA_ART23_EXCLUDED_FIELDS);
  if (![subjectAmount, excludedAmount].every(value => Number.isFinite(value) && value <= Number.MAX_SAFE_INTEGER)) return {
    status: 'INVALID', subjectAmount: null, excludedAmount: null, issues: ['DIRIGENZA_RESOURCE_TOTAL_INVALID'],
  };
  return { status: 'VALID', subjectAmount, excludedAmount, issues: [] };
}

/** Comparison AFTER derivation; no issue from the cache can change economics/readiness. */
export function reconcileDirigenzaArt23Cache(
  resolution: DirigenzaArt23Resolution,
  cached: unknown,
): DirigenzaCacheReconciliation {
  const derivedAmount = resolution.subjectAmount;
  if (cached == null) return { status: 'ABSENT', derivedAmount };
  if (typeof cached !== 'number' || !Number.isFinite(cached) || cached < 0) return { status: 'INVALID_CACHE', derivedAmount };
  if (resolution.status !== 'VALID') return { status: 'UNAVAILABLE', cachedAmount: cached, derivedAmount };
  return { status: Math.abs(cached - derivedAmount!) <= 0.01 ? 'RECONCILED' : 'MISMATCH', cachedAmount: cached, derivedAmount };
}
