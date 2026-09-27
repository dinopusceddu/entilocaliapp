import type { CanonicalFundResult, ComplianceCheck } from '../../domain';

export interface CabinaIssue {
  severity: 'BLOCKING' | 'MISSING_PREREQUISITE' | 'WARNING';
  code?: string;
  message: string;
  userMessage: string;
  target?: string;
}

export interface ResolveChecklistInput {
  complianceChecks?: readonly ComplianceCheck[];
  canonicalFund?: Pick<CanonicalFundResult, 'missingPrerequisites' | 'warnings'>;
}

const GENERAL_CONSTITUTION_TARGET = 'fondoDipendenti';

/** Proietta controlli e segnalazioni canoniche senza deduzione testuale o deduplicazione. */
export function resolveChecklist({
  complianceChecks = [],
  canonicalFund,
}: ResolveChecklistInput): CabinaIssue[] {
  const complianceIssues: CabinaIssue[] = complianceChecks.flatMap(check => {
    if (check.gravita !== 'error' && check.gravita !== 'warning') {
      return [];
    }

    return [{
      severity: check.gravita === 'error' ? 'BLOCKING' : 'WARNING',
      code: check.id,
      message: check.descrizione,
      userMessage: check.messaggio,
      ...(check.relatedPage === undefined ? {} : { target: check.relatedPage }),
    }];
  });

  const missingPrerequisiteIssues: CabinaIssue[] = (canonicalFund?.missingPrerequisites ?? []).map(
    prerequisite => ({
      severity: 'MISSING_PREREQUISITE',
      code: prerequisite,
      message: prerequisite,
      userMessage: prerequisite,
      target: GENERAL_CONSTITUTION_TARGET,
    })
  );

  const warningIssues: CabinaIssue[] = (canonicalFund?.warnings ?? []).map(warning => ({
    severity: 'WARNING',
    message: warning,
    userMessage: warning,
  }));

  return [...complianceIssues, ...missingPrerequisiteIssues, ...warningIssues];
}
