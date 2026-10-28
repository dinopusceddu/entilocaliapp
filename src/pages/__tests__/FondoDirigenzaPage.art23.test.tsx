import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FondoDirigenzaPage } from '../FondoDirigenzaPage';

const { state, dispatch } = vi.hoisted(() => ({
  state: { fundData: { metadata: { snapshotStatus: 'DRAFT' }, annualData: { hasDirigenza: true }, fondoDirigenzaData: {} as Record<string, unknown> } },
  dispatch: vi.fn(),
}));
vi.mock('../../contexts/AppContext.tsx', () => ({ useAppContext: () => ({ state, dispatch }) }));
vi.mock('../../components/shared/Card.tsx', () => ({ Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../../components/shared/FundingItem.tsx', () => ({ FundingItem: ({ id, value, disabled, onChange }: {
  id: string; value?: number; disabled: boolean; onChange: (id: string, value: number) => void;
}) => <input aria-label={id} value={value ?? ''} disabled={disabled} onChange={e => onChange(id, Number(e.target.value))} /> }));

describe('Dirigenza Art23 display and read-only derivation', () => {
  beforeEach(() => { cleanup(); dispatch.mockReset(); });
  it.each(['DRAFT', 'CLOSED'])('derived display on %s never writes the mismatched cache', status => {
    state.fundData.metadata.snapshotStatus = status;
    state.fundData.fondoDirigenzaData = { st_art57c2a_CCNL2020_unicoImporto2020: 280000, lim_totaleParzialeRisorseConfrontoTetto2016: 999999 };
    const before = JSON.stringify(state);
    const view = render(<FondoDirigenzaPage />);
    const derived = screen.getByLabelText('lim_totaleParzialeRisorseConfrontoTetto2016');
    expect(derived).toHaveValue('280000');
    expect(derived).toBeDisabled();
    expect(screen.getByText(/totale legacy salvato non coincide/i)).toBeInTheDocument();
    view.rerender(<FondoDirigenzaPage />);
    expect(dispatch).not.toHaveBeenCalled();
    expect(JSON.stringify(state)).toBe(before);
    if (status === 'CLOSED') {
      fireEvent.change(screen.getByLabelText('st_art57c2a_CCNL2020_unicoImporto2020'), { target: { value: '2000' } });
      expect(dispatch).not.toHaveBeenCalled();
    }
  });
  it('cache-only legacy detail shows unresolved rather than cached economics', () => {
    state.fundData.metadata.snapshotStatus = 'CLOSED';
    state.fundData.fondoDirigenzaData = { lim_totaleParzialeRisorseConfrontoTetto2016: 2000 };
    render(<FondoDirigenzaPage />);
    expect(screen.getByLabelText('lim_totaleParzialeRisorseConfrontoTetto2016')).toHaveValue('');
    expect(screen.getByText(/Consumo Dirigenza Art. 23 da verificare/i)).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
