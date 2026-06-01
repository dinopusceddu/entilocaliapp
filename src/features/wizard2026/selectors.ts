import { Wizard2026Check } from '../../logic/wizard2026';
import { Wizard2026DraftState } from './types';

export function selectWizard2026CurrentStep(state: Wizard2026DraftState): number {
  return state.meta.currentStep;
}

export function selectWizard2026AllChecks(state: Wizard2026DraftState): Wizard2026Check[] {
  return [
    ...state.art23.checks,
    ...state.dl25.checks,
    ...state.ccnl2026.checks,
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
