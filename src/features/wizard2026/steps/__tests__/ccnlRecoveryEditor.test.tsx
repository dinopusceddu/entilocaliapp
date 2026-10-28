import { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Step4Ccnl2026 } from '../Step4Ccnl2026';
import type { Wizard2026Ccnl2026StepState } from '../../types';
import { resolvedZeroState, recovery014 } from '../../../../test/fixtures/ccnlRecovery';

afterEach(cleanup);
const base = (): Wizard2026Ccnl2026StepState => ({ monteSalari2021: 1000000, fondoRisorseDecentrate2024: 80000, risorseEQ2024: 20000,
  recoveryInstructions: resolvedZeroState().instructions, checks: [] });
function Harness({ spy, initial = base() }: { spy: ReturnType<typeof vi.fn>; initial?: Wizard2026Ccnl2026StepState }) {
  const [state, setState] = useState(initial);
  return <Step4Ccnl2026 state={state} enteState={{ annoRiferimento: 2026 }} onChange={patch => { spy(patch); setState(old => ({ ...old, ...patch })); }} />;
}
const fundInput = () => screen.getByRole('textbox', { name: 'Da recuperare ora — quota Fondo (€), recupero 0,14%, competenza 2024' });
const errorElement = (input: HTMLElement) => input.getAttribute('aria-describedby')!.split(' ').map(id => document.getElementById(id)).find(el => el?.getAttribute('role') === 'alert')!;

describe('CCNL recovery real Step4 controls', () => {
  it('competence and recognition years, residual and resolved zero are visible with associated labels', () => {
    render(<Harness spy={vi.fn()} />);
    expect(screen.getByText('0,14% — competenza 2024, riconoscimento 2026')).toBeInTheDocument();
    expect(screen.getAllByRole('combobox', { name: 'Stato amministrativo annualità originaria' })).toHaveLength(3);
    expect(screen.getAllByRole('combobox', { name: 'Clausola automatica residui alla performance' })).toHaveLength(3);
    expect(screen.getAllByText(/VALID — RESOLVED_ZERO/)).toHaveLength(3);
  });
  it.each(['-1', 'malformed', '1e308', '123.456'])('invalid %s never commits, exposes aria error, then clears after valid zero', raw => {
    const spy = vi.fn(); render(<Harness spy={spy} />); const input = fundInput();
    fireEvent.change(input, { target: { value: raw } });
    expect(spy).not.toHaveBeenCalled(); expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(errorElement(input)).toHaveAttribute('role', 'alert');
    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveAttribute('aria-invalid', 'false'); expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].recoveryInstructions[0].requestedRecoveryAmount).toBe(0);
  });
  it('partial decision retains origin, source, already recognized and derived residual, no repeated append', () => {
    const initial = base(); initial.recoveryInstructions![0] = recovery014({ instructionStatus: 'RECOVER_PARTIAL', alreadyRecognizedAmount: 200, requestedRecoveryAmount: 1000 });
    const spy = vi.fn(); render(<Harness spy={spy} initial={initial} />);
    fireEvent.change(fundInput(), { target: { value: '1201' } });
    expect(fundInput()).toHaveAttribute('aria-invalid', 'true');
    expect(errorElement(fundInput())).toHaveTextContent('EXCEEDS_RESIDUAL');
    fireEvent.change(fundInput(), { target: { value: '1000' } });
    expect(fundInput()).toHaveAttribute('aria-invalid', 'false');
    expect(spy.mock.calls[spy.mock.calls.length - 1][0].recoveryInstructions).toHaveLength(3);
  });
  it('new missing instructions are not initialized as administrative zero', () => {
    const initial = base(); delete initial.recoveryInstructions;
    const spy = vi.fn(); render(<Harness spy={spy} initial={initial} />);
    expect(screen.getAllByText(/UNDETERMINED — UNINSTRUCTED/)).toHaveLength(3);
    expect(spy).not.toHaveBeenCalled();
  });
  it('CLOSED recovery controls disabled without edit/writeback', () => {
    const spy = vi.fn(); const initial = base();
    render(<Step4Ccnl2026 state={initial} enteState={{ annoRiferimento: 2026 }} onChange={spy} readOnly />);
    expect(fundInput()).toBeDisabled();
    expect(screen.getAllByRole('combobox', { name: 'Decisione' }).every(e => e.closest('fieldset')?.disabled)).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});
