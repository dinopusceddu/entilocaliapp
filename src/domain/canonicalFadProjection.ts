import type { CalculationSection, CalculationSectionItem } from './calculationResult';
import type { CanonicalFundResult, CanonicalFundStatus } from './canonicalFundLedger';
import { projectFadReport, type FadReportRow } from './documentProjection';
import FinancialMath from '../utils/financialMath';

/** Numeric compatibility totals are verified subtotals, never independent final totals. */
export interface CanonicalFadSection extends CalculationSection {
  readonly items: (CalculationSectionItem & { readonly canonicalEntry: FadReportRow })[];
  readonly status: CanonicalFundStatus;
  readonly authoritativeTotal: number | null;
  readonly unresolvedItems: readonly FadReportRow[];
}

export interface CanonicalFadSectionsProjection {
  readonly canonicalAvailable: boolean;
  readonly status: CanonicalFundStatus;
  readonly sections: Record<string, CanonicalFadSection>;
  readonly stableTotal: number | null;
  readonly variableTotal: number | null;
  readonly total: number | null;
  readonly verifiedTotal: number | null;
  readonly subject: number | null;
  readonly excluded: number | null;
  readonly verifiedSubject: number | null;
  readonly verifiedExcluded: number | null;
  readonly verifiedDeductions: number | null;
}

/** Canonical result -> compatibility view. No raw FundData or field-definition policy. */
export function projectCanonicalFadSections(canonical: CanonicalFundResult | null | undefined): CanonicalFadSectionsProjection {
  const model = projectFadReport(canonical);
  const section = (id: string, title: string, rows: readonly FadReportRow[], verified?: number): CanonicalFadSection => {
    const unresolvedItems = rows.filter(row => row.signedAmount === null);
    const total = verified ?? FinancialMath.sumAll(...rows.map(row => row.signedAmount));
    const items = rows.filter(row => row.signedAmount !== null).map(row => ({
      // Preserve the compatibility key within the structured legacy-ID namespace.
      // The full semantic identity and provenance remain in canonicalEntry.
      key: row.id.startsWith('LEGACY_FAD_RESOURCE:') ? row.id.slice('LEGACY_FAD_RESOURCE:'.length) : row.id,
      description: row.description, amount: row.amount!,
      riferimentoNormativo: row.normativeRef, isRelevantToArt23Limit: row.art23Treatment === 'SUBJECT',
      operator: row.operation === 'DEDUCTION' ? '-' as const : '+' as const, isSubtractor: row.operation === 'DEDUCTION',
      canonicalEntry: row,
    }));
    return { id, title, items, total, status: model.status, unresolvedItems,
      authoritativeTotal: model.canonicalAvailable && model.status === 'VALID' && unresolvedItems.length === 0 ? total : null };
  };
  const variable = model.rows.filter(row => row.component === 'VARIABLE');
  return {
    canonicalAvailable: model.canonicalAvailable, status: model.status,
    sections: {
      stabili: section('stabili', 'Risorse Stabili', model.rows.filter(row => row.component === 'STABLE'), canonical?.verifiedStableTotal),
      vs_soggette: section('vs_soggette', 'Risorse Variabili Soggette', variable.filter(row => row.art23Treatment === 'SUBJECT')),
      vn_non_soggette: section('vn_non_soggette', 'Risorse Variabili Non Soggette', variable.filter(row => row.art23Treatment === 'EXCLUDED')),
      variabili_indeterminate: section('variabili_indeterminate', 'Risorse Variabili con trattamento da determinare', variable.filter(row => row.art23Treatment === 'UNDETERMINED')),
    },
    stableTotal: model.status === 'VALID' ? canonical?.stableTotal ?? null : null,
    variableTotal: model.status === 'VALID' ? canonical?.variableTotal ?? null : null,
    total: model.authoritativeTotal, verifiedTotal: model.verifiedTotal,
    subject: model.status === 'VALID' ? canonical?.art23Subject ?? null : null,
    excluded: model.status === 'VALID' ? canonical?.art23Excluded ?? null : null,
    verifiedSubject: canonical?.verifiedArt23Subject ?? null, verifiedExcluded: canonical?.verifiedArt23Excluded ?? null,
    verifiedDeductions: canonical ? FinancialMath.sumAll(...model.rows.filter(row => row.operation === 'DEDUCTION')
      .map(row => row.signedAmount === null ? null : Math.abs(row.signedAmount))) : null,
  };
}
