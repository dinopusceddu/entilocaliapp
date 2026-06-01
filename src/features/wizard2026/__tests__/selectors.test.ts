import { describe, it, expect } from 'vitest';
import {
  selectWizard2026CurrentStep,
  selectWizard2026AllChecks,
  selectWizard2026BlockingErrors,
  selectWizard2026Warnings,
  selectWizard2026CanPreview,
  selectWizard2026CanFutureTransfer,
  selectWizard2026Summary,
} from '../selectors';
import { initialWizard2026DraftState } from '../initialState';
import { Wizard2026DraftState } from '../types';

describe('Wizard 2026 Selectors', () => {
  const mockState: Wizard2026DraftState = {
    ...initialWizard2026DraftState,
    meta: {
      ...initialWizard2026DraftState.meta,
      currentStep: 4,
      isPreviewMode: true,
      canTransferToLegacy: false,
    },
    art23: {
      ...initialWizard2026DraftState.art23,
      checks: [
        { id: 'ERR1', severity: 'error', step: 'Step 2', message: 'Errore Art23' },
        { id: 'WARN1', severity: 'warning', step: 'Step 2', message: 'Warning Art23' },
      ],
    },
    dl25: {
      ...initialWizard2026DraftState.dl25,
      checks: [
        { id: 'INFO1', severity: 'info', step: 'Step 3', message: 'Info DL25' },
      ],
    },
  };

  it('1. Current step e canPreview', () => {
    expect(selectWizard2026CurrentStep(mockState)).toBe(4);
    expect(selectWizard2026CanPreview(mockState)).toBe(true);
  });

  it('2. Aggregazione checks, conteggio errori e warning', () => {
    const all = selectWizard2026AllChecks(mockState);
    expect(all.length).toBe(3);

    const errors = selectWizard2026BlockingErrors(mockState);
    expect(errors.length).toBe(1);
    expect(errors[0].id).toBe('ERR1');

    const warnings = selectWizard2026Warnings(mockState);
    expect(warnings.length).toBe(1);
    expect(warnings[0].id).toBe('WARN1');
  });

  it('3. canFutureTransfer false di default e con errori', () => {
    expect(selectWizard2026CanFutureTransfer(mockState)).toBe(false);

    const cleanState: Wizard2026DraftState = {
      ...initialWizard2026DraftState,
      meta: {
        ...initialWizard2026DraftState.meta,
        canTransferToLegacy: true,
      },
    };
    expect(selectWizard2026CanFutureTransfer(cleanState)).toBe(true);
  });

  it('4. selectWizard2026Summary fornisce contatori corretti', () => {
    const summary = selectWizard2026Summary(mockState);
    expect(summary.totaleErrori).toBe(1);
    expect(summary.totaleWarning).toBe(1);
    expect(summary.totaleInfo).toBe(1);
    expect(summary.readyForPreview).toBe(true);
    expect(summary.readyForFutureTransfer).toBe(false);
  });
});
