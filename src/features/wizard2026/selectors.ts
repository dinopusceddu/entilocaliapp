import { Wizard2026Check } from '../../logic/wizard2026';
import { Wizard2026DraftState } from './types';
import { validateMonetaryData } from '../../domain/monetaryBoundary';
import { resolveCcnlRecoveries } from '../../logic/shared/ccnlRecovery';

export function selectCcnlRecoveryChecks(state: Wizard2026DraftState): Wizard2026Check[] {
  if (state.ccnl2026.recoveryInstructions === undefined) return [];
  return resolveCcnlRecoveries({ instructions: state.ccnl2026.recoveryInstructions,
    fondoRisorseDecentrate2024: state.ccnl2026.fondoRisorseDecentrate2024, risorseEQ2024: state.ccnl2026.risorseEQ2024 },
    state.ente.annoRiferimento ?? 2026, state.ccnl2026.monteSalari2021Consolidato2026 ?? state.ccnl2026.monteSalari2021)
    .flatMap(r => r.issues.map(id => ({ id, step: 'Step 4 — Recuperi CCNL',
      severity: r.status === 'INVALID' ? 'error' as const : 'warning' as const,
      message: `${r.instruction.kind} competenza ${r.instruction.competenceYear}: ${id}` })));
}

export function selectWizard2026CurrentStep(state: Wizard2026DraftState): number {
  return state.meta.currentStep;
}

export function selectWizard2026AllChecks(state: Wizard2026DraftState): Wizard2026Check[] {
  return [
    ...[...(state.meta.monetaryIssues ?? []), ...validateMonetaryData(state, 'wizard')].map(issue => ({
      id: issue.code, severity: 'error' as const, step: 'Monetary boundary', message: `${issue.path}: ${issue.message}`,
    })),
    ...state.art23.checks,
    ...state.dl25.checks,
    ...state.ccnl2026.checks,
    ...selectCcnlRecoveryChecks(state),
    ...state.conglobamentoArt60.checks,
    ...state.straordinario.checks,
    ...state.pnrr.checks,
  ];
}

export function selectWizard2026BlockingErrors(state: Wizard2026DraftState): Wizard2026Check[] {
  const all = selectWizard2026AllChecks(state);
  return all.filter((c) => c.severity === 'error');
}

export function selectWizard2026Warnings(state: Wizard2026DraftState): Wizard2026Check[] {
  const all = selectWizard2026AllChecks(state);
  return all.filter((c) => c.severity === 'warning');
}

export function selectWizard2026CanPreview(state: Wizard2026DraftState): boolean {
  return state.meta.isPreviewMode;
}

export function selectWizard2026CanFutureTransfer(state: Wizard2026DraftState): boolean {
  const errors = selectWizard2026BlockingErrors(state);
  return state.meta.canTransferToLegacy && errors.length === 0;
}

export function selectWizard2026Summary(state: Wizard2026DraftState) {
  const all = selectWizard2026AllChecks(state);
  const totaleErrori = all.filter((c) => c.severity === 'error').length;
  const totaleWarning = all.filter((c) => c.severity === 'warning').length;
  const totaleInfo = all.filter((c) => c.severity === 'info').length;

  return {
    totaleErrori,
    totaleWarning,
    totaleInfo,
    readyForPreview: true,
    readyForFutureTransfer: selectWizard2026CanFutureTransfer(state),
  };
}
