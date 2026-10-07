import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Input } from '../Input';
import { MonetaryDraftContext, MonetaryDraftIssuesContext } from '../MonetaryInput';
import { Wizard2026TransferModal } from '../../../features/wizard2026/transfer/Wizard2026TransferModal';
import { createEmptyWizard2026DraftState } from '../../../features/wizard2026/initialState';
import { createEmptyFundData } from '../../../domain/emptyFund';
afterEach(cleanup);
describe('DATA-03 real shared UI field boundary', () => {
  it.each(['-100', 'malformed', 'Infinity', '-Infinity', 'NaN', '1e308', '123.456'])('keeps invalid %s local with visible associated feedback, then clears it on correction', raw => {
    const changed = vi.fn(), draft = vi.fn();
    render(<MonetaryDraftContext.Provider value={draft}><Input type="number" monetaryPath="st_art79c1_art67c1_unicoImporto2017" label="Importo" value={100} onChange={changed} /></MonetaryDraftContext.Provider>);
    const input = screen.getByLabelText('Importo');
    fireEvent.change(input, { target: { value: raw } });
    expect(changed).not.toHaveBeenCalled(); expect(input).toHaveAttribute('aria-invalid', 'true');
    const alert = screen.getByRole('alert'); expect(input.getAttribute('aria-describedby')).toContain(alert.id);
    expect(draft).toHaveBeenLastCalledWith(expect.any(String), expect.objectContaining({ code: expect.stringMatching(/^MONEY_/) }));
    fireEvent.change(input, { target: { value: '100' } });
    expect(changed.mock.calls[0][0].target.value).toBe('100'); expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('zero is committed, blank is missing and neither invokes an economic fallback', () => {
    const changed = vi.fn(); render(<Input type="number" monetaryPath="manualProgressioni" label="Progressioni" value={100} onChange={changed} />);
    const field = screen.getByLabelText('Progressioni');
    fireEvent.change(field, { target: { value: '0' } }); expect(changed.mock.calls[0][0].target.value).toBe('0');
    fireEvent.change(field, { target: { value: '' } }); expect(changed.mock.calls[1][0].target.value).toBe('');
  });
  it('persisted malformed is visible before editing; CLOSED controls stay read-only', () => {
    render(<Input type="number" monetaryPath="manualIndennita" label="Indennità" value="malformed" readOnly />);
    expect(screen.getByLabelText('Indennità')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Indennità')).toHaveAttribute('aria-invalid', 'true'); expect(screen.getByRole('alert')).toBeVisible();
  });
  it('an invalid local money draft blocks the real transfer confirmation even with a prior valid domain result', () => {
    const confirm = vi.fn();
    render(<MonetaryDraftIssuesContext.Provider value={[{ path: 'ccnl2026.monteSalari2021', code: 'MONEY_MALFORMED', message: 'Importo non valido' }]}>
      <Wizard2026TransferModal isOpen onClose={vi.fn()} state={createEmptyWizard2026DraftState()} currentFundData={createEmptyFundData(2026)}
        onConfirm={confirm} isTransferBlocked={false} transferValidation={{ isTransferable: true, blockingErrors: [], warnings: [] }} />
    </MonetaryDraftIssuesContext.Provider>);
    const button = screen.getByRole('button', { name: /Conferma e compila/ });
    expect(button).toBeDisabled(); fireEvent.click(button); expect(confirm).not.toHaveBeenCalled();
  });
});
