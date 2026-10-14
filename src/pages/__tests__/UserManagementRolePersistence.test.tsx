import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UserManagementPage } from '../UserManagementPage';

const mocks = vi.hoisted(() => ({
  mutation: { data: null as any, error: null },
  role: 'ADMIN',
  updatedTables: [] as string[],
}));
vi.mock('../../contexts/AppContext', () => ({ useAppContext: () => ({ state: { currentUser: { id: 'fixture-admin', role: mocks.role } } }) }));
vi.mock('../../components/admin/RagDocumentManager', () => ({ RagDocumentManager: () => null }));
vi.mock('../../services/supabase', () => ({ supabase: {
  from: (table: string) => {
    let mutation = false;
    const result = () => mutation ? mocks.mutation : { data: table === 'profiles' ? [{ id: 'fixture-target', email: 'fixture@example.invalid', role: 'GUEST' }] : [], error: null };
    const chain: any = {
      select: () => chain, order: () => chain, eq: () => chain,
      update: () => { mutation = true; mocks.updatedTables.push(table); return chain; },
      maybeSingle: () => Promise.resolve(result()),
      then: (resolve: any, reject: any) => Promise.resolve(result()).then(resolve, reject),
    };
    return chain;
  },
} }));

describe('POST-ASTRA: role UI must verify the persisted row', () => {
  beforeEach(() => { mocks.role = 'ADMIN'; mocks.mutation = { data: null, error: null }; mocks.updatedTables = []; });

  it('rejects HTTP-success/no-row and never announces success or rewrites snapshot roles', async () => {
    render(<UserManagementPage />);
    fireEvent.click(await screen.findByRole('button', { name: /Promuovi/ }));
    await screen.findByText(/Errore durante l'aggiornamento del ruolo/);
    expect(screen.queryByText(/Ruolo aggiornato a/)).not.toBeInTheDocument();
    expect(mocks.updatedTables).toEqual(['profiles']);
    expect(screen.getByText('GUEST')).toBeInTheDocument();
  });

  it('announces success only for the exact target with the requested role', async () => {
    mocks.mutation = { data: { id: 'fixture-target', role: 'ADMIN' }, error: null };
    render(<UserManagementPage />);
    fireEvent.click(await screen.findByRole('button', { name: /Promuovi/ }));
    await screen.findByText(/Ruolo aggiornato a ADMIN/);
    expect(mocks.updatedTables).toEqual(['profiles']);
  });

  it.each(['USER', 'GUEST'])('denies the administrative UI to canonical %s', async role => {
    mocks.role = role;
    render(<UserManagementPage />);
    await waitFor(() => expect(screen.getByText(/Accesso Negato/)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Promuovi/ })).not.toBeInTheDocument();
  });
});
