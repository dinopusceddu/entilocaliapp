import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { MainLayout } from '../../layout/MainLayout';
import { AppModule } from '../../../application/registry/moduleRegistry';

let state: any;
const switchYear = vi.fn();
const navigate = vi.fn();
vi.mock('../../../contexts/AppContext', () => ({ useAppContext: () => ({ state, setScopeAndTab: navigate, switchYearAtomic: switchYear, saveState: vi.fn() }) }));
vi.mock('../../../contexts/AuthContext', () => ({ useAuth: () => ({ signOut: vi.fn() }) }));
vi.mock('../../../services/userProfilesHelper', () => ({ fetchUserProfilesMap: async () => ({ owner: { name: 'Proprietario effettivo' } }) }));
vi.mock('../../../services/supabase', () => {
  const query: any = { then: (resolve: any) => resolve({ data: [], error: null }) };
  for (const key of ['select', 'order', 'eq']) query[key] = () => query;
  return { supabase: { from: () => query } };
});
const longName = 'Unione dei Comuni della Valle e delle Comunità Montane con denominazione amministrativa estesa';
const modules = [{ id: 'wizard2026Preview', title: 'Raccolta dati', name: 'Raccolta dati', description: 'Istruisci il Fondo corrente' }] as AppModule[];
beforeEach(() => {
  vi.clearAllMocks(); state = { currentUser: { id: 'user', role: 'USER', name: 'Mario Rossi' }, currentEntity: { id: 'entity', name: longName, user_id: 'user' }, currentYear: 2026,
    fundData: { metadata: { snapshotStatus: 'OPEN', role: 'ADMIN' }, annualData: { hasDirigenza: false } },
    entities: [{ id: 'entity', name: longName, user_id: 'user' }], complianceChecks: [], navigationScope: 'FONDO', activeTab: 'wizard2026Preview' };
});
afterEach(cleanup);
describe('Fund context on the real layout (DOM responsive contract)', () => {
  it.each([360, 390, 430, 1280])('at %ipx entity/year/state and touch disclosure are present without changing Fund', width => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    const { container } = render(<MainLayout modules={modules}><p>Sezione lunga</p></MainLayout>);
    const name = screen.getByRole('button', { name: `Consulta nome completo: ${longName}` });
    expect(screen.getByTestId('contextbar-status-badge')).toHaveTextContent('In lavorazione');
    expect(screen.getByText('Fondo 2026')).toBeInTheDocument();
    expect(name).toHaveAttribute('aria-expanded', 'false'); fireEvent.click(name);
    expect(screen.getByTestId('full-entity-name')).toHaveTextContent(longName);
    expect(name).toHaveAttribute('aria-expanded', 'true'); expect(switchYear).not.toHaveBeenCalled(); expect(navigate).not.toHaveBeenCalled();
    const bar = name.closest('.sticky'); expect(bar).toHaveClass('top-16');
    expect(container.firstChild).toHaveClass('overflow-x-clip');
    expect(container.querySelector('button button')).toBeNull();
  });
  it('CLOSED metadata keeps state visible and save unavailable', () => {
    state.fundData.metadata.snapshotStatus = 'CLOSED'; state.activeTab = 'reports'; render(<MainLayout modules={modules}><p>Consultazione</p></MainLayout>);
    expect(screen.getByTestId('contextbar-status-badge')).toHaveTextContent('Chiuso');
    expect(screen.getByTestId('save-draft-btn')).toBeDisabled();
  });
  it('Admin on a foreign entity sees owner context, without treating ownership as authorship', async () => {
    state.currentUser.role = 'ADMIN'; state.currentEntity.user_id = 'owner';
    render(<MainLayout modules={modules}><p>Consultazione</p></MainLayout>);
    expect(screen.getByTestId('foreign-owner-context')).toHaveTextContent('Ente di altro utente');
    fireEvent.click(screen.getByRole('button', { name: `Consulta nome completo: ${longName}` }));
    expect(await screen.findByText(/Proprietario: Proprietario effettivo/)).toBeInTheDocument();
    expect(screen.queryByText(/Creato da/)).toBeNull();
  });
  it('navigation drawer keeps context and distinguishes Fund sections from Toolbox', () => {
    render(<MainLayout modules={modules}><p>Consultazione</p></MainLayout>);
    fireEvent.click(screen.getByRole('button', { name: 'Apri sezioni Area Fondo' }));
    const context = screen.getAllByTestId('drawer-fund-context');
    expect(context[context.length - 1]).toHaveTextContent(`${longName} · Fondo 2026 · In lavorazione`);
    const navs = screen.getAllByRole('navigation', { name: 'Sezioni del Fondo corrente' });
    fireEvent.click(within(navs[navs.length - 1]).getByTestId('nav-documenti'));
    expect(navigate).toHaveBeenCalledWith('FONDO', 'reports');
    fireEvent.click(screen.getByRole('button', { name: 'Torna al Toolbox' }));
    expect(navigate).toHaveBeenCalledWith('DASHBOARD', 'dashboard');
  });
});
