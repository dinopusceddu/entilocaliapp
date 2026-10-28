import type { CanonicalFundResult } from './canonicalFundLedger';
import type { CabinaIssue } from '../logic/cabina/resolveChecklist';

export const DOCUMENT_KINDS = ['DETERMINA', 'RELAZIONE', 'PROSPETTO', 'SUMMARY_PDF', 'FAD_XLS'] as const;
export type DocumentKind = typeof DOCUMENT_KINDS[number];
export type DocumentOutputMode = 'DRAFT_PREVIEW' | 'DEFINITIVE_EXPORT';
export interface DocumentOutputOptions {
  mode?: DocumentOutputMode;
  draftReason?: string;
}

/** Lifecycle policies approved for this slice: no administrative field is mandatory.
 * Determina may retain act/signatory placeholders; the other kinds do not consume them.
 * Optional Revisori/Giunta facts are represented by the existing semantic projection.
 * Tabella15 deliberately has a separate gate and is not a DocumentKind here.
 */
export const DOCUMENT_KIND_POLICIES = {
  DETERMINA: { classification: 'ADMINISTRATIVE_DOCUMENT', compilableFields: ['numeroDetermina', 'dataDetermina', 'firmaDigitale'] },
  RELAZIONE: { classification: 'ADMINISTRATIVE_DOCUMENT', compilableFields: [] },
  PROSPETTO: { classification: 'ADMINISTRATIVE_DOCUMENT', compilableFields: [] },
  SUMMARY_PDF: { classification: 'FINANCIAL_REPORT', compilableFields: [] },
  FAD_XLS: { classification: 'FINANCIAL_REPORT', compilableFields: [] },
} as const;

export interface DocumentKindReadiness {
  readonly documentKind: DocumentKind;
  readonly status: 'FINAL_READY' | 'DRAFT_ONLY' | 'UNAVAILABLE';
  readonly mode: DocumentOutputMode;
  readonly reasons: readonly string[];
  readonly primaryReason: string | null;
  readonly missingFields: readonly string[];
  readonly blockingIssues: readonly CabinaIssue[];
  readonly correctiveTarget?: string;
}

/** Pure readiness projection. CLOSED is read-only, not an administrative attestation.
 * Human-approved policy: every normalized BLOCKING applies to all five kinds;
 * warnings and optional/compilable metadata alone do not prevent final output.
 */
export function resolveDocumentKindReadiness(input: {
  documentKind: DocumentKind;
  canonicalFund?: Pick<CanonicalFundResult, 'status' | 'total' | 'missingPrerequisites'> | null;
  issues?: readonly CabinaIssue[];
  previewAvailable?: boolean;
}): DocumentKindReadiness {
  const { documentKind, canonicalFund, issues = [], previewAvailable = true } = input;
  const blockingIssues = issues.filter(issue => issue.severity === 'BLOCKING');
  const prerequisites = issues.filter(issue => issue.severity === 'MISSING_PREREQUISITE');
  const reasons: string[] = [];
  if (!previewAvailable) reasons.push('Eseguire il calcolo del fondo per generare il documento.');
  if (!canonicalFund) reasons.push('Il risultato canonico del fondo non è disponibile.');
  else if (canonicalFund.status !== 'VALID' || canonicalFund.total === null) {
    reasons.push('Il fondo non è ancora validato o il totale non è determinato.');
  }
  reasons.push(...(canonicalFund?.missingPrerequisites ?? []));
  reasons.push(...prerequisites.map(issue => issue.userMessage));
  reasons.push(...blockingIssues.map(issue => issue.userMessage));
  const status = !previewAvailable ? 'UNAVAILABLE' : reasons.length ? 'DRAFT_ONLY' : 'FINAL_READY';
  return {
    documentKind, status,
    mode: status === 'FINAL_READY' ? 'DEFINITIVE_EXPORT' : 'DRAFT_PREVIEW',
    reasons, primaryReason: reasons[0] ?? null,
    missingFields: [], blockingIssues,
    correctiveTarget: prerequisites[0]?.target ?? blockingIssues[0]?.target
      ?? (reasons.length ? 'fondoDipendenti' : undefined),
  };
}

export function assertDocumentFinalReady(readiness: DocumentKindReadiness): void {
  if (readiness.status !== 'FINAL_READY') {
    throw new Error(`Export definitivo bloccato: ${readiness.primaryReason ?? 'documento non pronto.'}`);
  }
}
