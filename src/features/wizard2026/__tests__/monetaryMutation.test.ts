import { describe, expect, it } from 'vitest';
import { createEmptyWizard2026DraftState } from '../initialState';
import type { Wizard2026Ccnl2026StepState } from '../types';
import { wizard2026Reducer } from '../reducer';
import { applyWizard2026Transfer, restoreWizard2026TransferSnapshot } from '../transfer/applyWizard2026Transfer';
import { createEmptyFundData } from '../../../domain/emptyFund';
import { validateMonetaryData, MonetaryBoundaryError } from '../../../domain/monetaryBoundary';
import { validateWizard2026Transferable } from '../validation';
describe('DATA-03 Wizard direct mutation/import/restore/transfer', () => {
  it.each([-100, NaN, Infinity, 'malformed', 1e308, true, []])('all mutation entries reject %j and expose a correctable issue', raw => {
    const state = createEmptyWizard2026DraftState();
    const payload = { monteSalari2021: raw } as unknown as Partial<Wizard2026Ccnl2026StepState>;
    for (const action of [{ type: 'UPDATE_CCNL2026_STEP', payload }, { type: 'IMPORT_EXCEL_DATA', payload: { ccnl2026: { ...state.ccnl2026, ...payload } } },
      { type: 'RESTORE_WIZARD_2026', payload: { ...state, ccnl2026: { ...state.ccnl2026, ...payload } } }] as const) {
      const rejected = wizard2026Reducer(state, action);
      expect(rejected.ccnl2026.monteSalari2021).toBeUndefined(); expect(rejected.meta.monetaryIssues?.length).toBeGreaterThan(0);
      const corrected = wizard2026Reducer(rejected, { type: 'UPDATE_CCNL2026_STEP', payload: { monteSalari2021: 100 } });
      expect(corrected.ccnl2026.monteSalari2021).toBe(100); expect(corrected.meta.monetaryIssues).toEqual([]);
    }
    const invalid = { ...state, ccnl2026: { ...state.ccnl2026, ...payload } };
    expect(() => applyWizard2026Transfer(invalid, createEmptyFundData(2026))).toThrow(MonetaryBoundaryError);
  });
  it('restore and any known snapshot aliases cannot bypass money validation', () => {
    const snapshot = createEmptyFundData(2026);
    snapshot.wizard2026TransferSnapshot = { input: { monteSalari2021: '123.456' }, computed: { pnrrImportoApplicato: Infinity } };
    expect(validateMonetaryData(snapshot).map(i => i.path)).toEqual(expect.arrayContaining([
      'wizard2026TransferSnapshot.input.monteSalari2021', 'wizard2026TransferSnapshot.computed.pnrrImportoApplicato',
    ]));
    expect(() => restoreWizard2026TransferSnapshot(snapshot)).toThrow(MonetaryBoundaryError);
  });
  it('withholds an unsafe computed result and keeps its issue through checks/navigation until correction', () => {
    const state = createEmptyWizard2026DraftState();
    const rejected = wizard2026Reducer(state, { type: 'SET_STEP_RESULT', payload: { step: 'ccnl2026', result: { incrementoStabile014: 1e308 } } });
    expect(rejected.ccnl2026.result).toBeUndefined();
    const checked = wizard2026Reducer(rejected, { type: 'SET_STEP_CHECKS', payload: { step: 'ccnl2026', checks: [] } });
    expect(checked.meta.monetaryIssues?.length).toBeGreaterThan(0);
    expect(validateWizard2026Transferable(checked).blockingErrors.some(i => i.id.startsWith('MONEY_'))).toBe(true);
  });
  it('validates all generated computed aliases without rounding calculated Art23 metadata', () => {
    const snapshot = { wizard2026TransferSnapshot: { input: { limiteArt23Comma2Attualizzato: 123.456 }, computed: { quota014Fondo: Infinity } } };
    expect(validateMonetaryData(snapshot)).toMatchObject([{ path: 'wizard2026TransferSnapshot.computed.quota014Fondo', code: 'MONEY_NOT_FINITE' }]);
  });
});
