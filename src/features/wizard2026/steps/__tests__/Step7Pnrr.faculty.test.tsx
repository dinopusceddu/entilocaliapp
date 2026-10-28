import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Step7Pnrr } from '../Step7Pnrr';
import type { Wizard2026PnrrStepState } from '../../types';
import { calculatePnrrIncrement, validatePnrrIncrement } from '../../../../logic/wizard2026/pnrrIncrement';

afterEach(cleanup);
describe('CALC-05 Wizard faculty interaction', () => {
  const display = (state: Wizard2026PnrrStepState, onChange = vi.fn()) => render(<Step7Pnrr
    state={state} hasDirigenza={false} annoRiferimento={2026} onChange={onChange} onEnteChange={vi.fn()} />);
  it('explicit NO applies zero and hides prerequisites without changing anything on mount', () => {
    const onChange = vi.fn();
    display({ exerciseDecision: 'NOT_EXERCISED', checks: [] }, onChange);
    expect(screen.getByText(/Facoltà non esercitata/)).toBeInTheDocument();
    expect(screen.queryByTestId('componenteStabileFondoDipendenti2016')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(validatePnrrIncrement({ annoRiferimento: 2026, exerciseDecision: 'NOT_EXERCISED' })).toEqual([]);
    fireEvent.click(screen.getByTestId('pnrr-exercise-yes'));
    expect(onChange).toHaveBeenCalledWith({ exerciseDecision: 'EXERCISED' });
  });
  it('NO and UNSET are distinct administrative selections', () => {
    const onChange = vi.fn();
    display({ checks: [] }, onChange);
    fireEvent.click(screen.getByTestId('pnrr-exercise-no'));
    expect(onChange).toHaveBeenLastCalledWith({ exerciseDecision: 'NOT_EXERCISED', incrementoApplicato: 0 });
    fireEvent.click(screen.getByTestId('pnrr-exercise-missing'));
    expect(onChange).toHaveBeenLastCalledWith({ exerciseDecision: 'UNSET' });
  });
  it('maximum 20000 never causes onChange and input accepts partial use and explicit zero', () => {
    const state: Wizard2026PnrrStepState = { exerciseDecision: 'EXERCISED', soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 400000, equilibrioEsercizioPrecedente: true,
      parametriDebitoCommercialeEsercizioPrecedente: true, rendicontoApprovatoTermini: true,
      incidenzaSalarioAccessorioScelta: 'diretto', incidenzaSalarioAccessorioPercentuale: 7, checks: [] };
    state.result = calculatePnrrIncrement({ ...state, annoRiferimento: 2026, hasDirigenza: false });
    const onChange = vi.fn();
    display(state, onChange);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('pnrr-applied')).toHaveValue('');
    fireEvent.change(screen.getByTestId('pnrr-applied'), { target: { value: '7500' } });
    expect(onChange).toHaveBeenLastCalledWith({ incrementoApplicato: 7500 });
    fireEvent.change(screen.getByTestId('pnrr-applied'), { target: { value: '0' } });
    expect(onChange).toHaveBeenLastCalledWith({ incrementoApplicato: 0 });
    fireEvent.change(screen.getByTestId('componenteStabileFondoDipendenti2016'), { target: { value: '0' } });
    expect(onChange).toHaveBeenLastCalledWith({ componenteStabileFondoDipendenti2016: 0 });
    expect(screen.getByText(/Equilibrio di bilancio dell'anno 2025/)).toBeInTheDocument();
    expect(screen.getByText(/ultimo rendiconto approvato/)).toBeInTheDocument();
  });
});
