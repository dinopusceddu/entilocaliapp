import type { FundData, NormativeData } from '../../domain';
import { MonetaryBoundaryError, validateMonetaryData, type MonetaryIssue } from '../../domain/monetaryBoundary';
import { normalizeInput } from './inputNormalizer';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { buildCanonicalFundLedger } from '../../logic/calculation/canonicalFundLedger';
import { buildFadLedgerInputSections } from '../../logic/calculation/fundCalculations';
import { calculateAllReductions } from '../../logic/calculation/reductionCalculations';
import FinancialMath, { checkedMonetaryCalculation } from '../../utils/financialMath';
import { calculateEqSubFund, calculateSegretarioSubFund, calculateDirigenzaSubFund, calculateCcnl2024Components } from '../../logic/calculation/fundCalculations';

/** Reuses the real calculation/ledger; no independently derived economic totals. */
export function validateMonetaryProcessing(data: FundData): readonly MonetaryIssue[] {
  const issues = validateMonetaryData(data);
  if (issues.length) return issues;
  const normalized = normalizeInput(data);
  const normative = { riferimenti_normativi: {} } as NormativeData;
  try { return calculateFundCompletely(normalized, normative).monetaryIssues ?? []; }
  catch (error) {
    if (error instanceof MonetaryBoundaryError) return error.issues;
    // Administrative indeterminacy may prevent a full calculation of an OPEN draft.
    // Its FAD numeric safety still uses the same input adapter and canonical ledger.
    try {
      const checked = checkedMonetaryCalculation(() => {
      const a = normalized.annualData;
      const reductions = calculateAllReductions(normalized);
      const sections = buildFadLedgerInputSections(normalized.fondi.dipendente, a.simulatoreRisultati,
        !!(a.isEnteDissestato || a.isEnteStrutturalmenteDeficitario || a.isEnteRiequilibrioFinanziario),
        normalized.fondi.eq.ris_incrementoConRiduzioneFondoDipendenti, normative, reductions, a.ccnl2024, a.hasDirigenza, a.tipologiaEnte);
      const canonical = buildCanonicalFundLedger({ year: a.annoRiferimento, annualData: a, fadData: normalized.fondi.dipendente,
        sections, wizardTransferSnapshot: normalized.wizardTransferSnapshot });
      const ccnl = calculateCcnl2024Components(a.ccnl2024);
      const eq = calculateEqSubFund(normalized.fondi.eq, ccnl.ccnl2024_eq_stabile, ccnl.ccnl2024_eq_variabile);
      const segretario = calculateSegretarioSubFund(normalized.fondi.segretario);
      const dirigenza = calculateDirigenzaSubFund(normalized.fondi.dirigenza, !!a.hasDirigenza);
      // Representation check over existing read results; no economic DTO is produced.
      FinancialMath.sumAll(canonical.verifiedStableTotal, eq.stabile, segretario.stabile, dirigenza.stabile);
      FinancialMath.sumAll(canonical.verifiedVariableTotal, eq.variabile, segretario.variabile, dirigenza.variabile);
      FinancialMath.sumAll(canonical.verifiedTotal, eq.totale, segretario.totale, dirigenza.totale);
      });
      if (checked.status === 'INVALID') return checked.issues;
      return [];
    } catch (numeric) { if (numeric instanceof MonetaryBoundaryError) return numeric.issues; throw numeric; }
  }
}
