import type { CanonicalFundResult } from '../../domain';
import { AnnualSnapshotStatus } from '../../domain';
import type { CabinaIssue } from '../cabina/resolveChecklist';

export interface ClosureReadinessReason {
  kind: 'CANONICAL' | 'BLOCKING' | 'MISSING_PREREQUISITE';
  message: string;
  action: { label: string; target: string };
}

export interface ClosureInstructionReadiness {
  status: 'READY' | 'NOT_READY' | 'ALREADY_CLOSED';
  reasons: ClosureReadinessReason[];
  primaryReason: ClosureReadinessReason | null;
}

/** Readiness istruttoria, distinta dall'esecuzione/idempotenza della transazione. */
export function resolveClosureInstructionReadiness({
  snapshotStatus, canonicalFund, issues = [],
}: {
  snapshotStatus?: AnnualSnapshotStatus;
  canonicalFund?: Pick<CanonicalFundResult, 'status' | 'total'> | null;
  issues?: readonly CabinaIssue[];
}): ClosureInstructionReadiness {
  if (snapshotStatus === AnnualSnapshotStatus.CLOSED) {
    return { status: 'ALREADY_CLOSED', reasons: [], primaryReason: null };
  }
  const reasons: ClosureReadinessReason[] = [];
  const missing = issues.find(issue => issue.severity === 'MISSING_PREREQUISITE');
  if (canonicalFund?.status !== 'VALID' || canonicalFund.total == null) {
    reasons.push({
      kind: 'CANONICAL',
      message: !canonicalFund ? 'Il calcolo del Fondo non è disponibile.'
        : canonicalFund.status === 'INVALID' ? 'Il Fondo presenta errori da risolvere prima della chiusura.'
        : 'Il Fondo non è ancora determinato: completare i dati prima della chiusura.',
      action: { label: 'Vai alla Costituzione', target: missing?.target || 'fondoDipendenti' },
    });
  }
  for (const issue of issues) {
    if (issue.severity === 'WARNING') continue;
    const isBlocking = issue.severity === 'BLOCKING';
    reasons.push({
      kind: isBlocking ? 'BLOCKING' : 'MISSING_PREREQUISITE',
      message: issue.userMessage,
      action: {
        label: isBlocking ? 'Apri le verifiche' : 'Vai alla Costituzione',
        target: issue.target || (isBlocking ? 'compliance' : 'fondoDipendenti'),
      },
    });
  }
  return { status: reasons.length ? 'NOT_READY' : 'READY', reasons, primaryReason: reasons[0] ?? null };
}
