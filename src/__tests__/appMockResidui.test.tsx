
import React from 'react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import { AppProvider } from '../contexts/AppContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockRestorePendingDraft = vi.fn();
const mockDiscardPendingDraft = vi.fn();
let mockContextState = {
  currentUser: { id: 'user1', role: 'GUEST' },
  currentEntity: { id: 'e1', name: 'Ente 1' },
  currentYear: 2026,
  activeTab: 'dummy_tab',
  entities: [],
  fundData: { annualData: {}, metadata: { snapshotStatus: 'OPEN' } },
  hasPendingDraft: true,
  pendingDraftData: { annualData: {}, metadata: { snapshotStatus: 'OPEN' } },
  pendingDraftMetadata: { updatedAt: 'oggi', entityName: 'Ente 1', entityId: 'e1', year: 2026 },
};

// Mock dependencies
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user1', email: 'test@example.com' }, session: {} }),
  AuthProvider: ({ children }: React.PropsWithChildren) => <div>{children}</div>
}));

vi.mock('../components/layout/Header', () => ({
  Header: () => <div>Header Mock</div>
}));

vi.mock('../components/layout/MainLayout', () => ({
  MainLayout: ({ children }: React.PropsWithChildren) => <div>{children}</div>
}));

vi.mock('../contexts/AppContext', async () => {
  const actual = await vi.importActual<typeof import('../contexts/AppContext')>('../contexts/AppContext');
  return {
    ...actual,
    useAppContext: () => ({
      state: mockContextState,
      dispatch: vi.fn(),
      restorePendingDraft: mockRestorePendingDraft,
      discardPendingDraft: mockDiscardPendingDraft,
      persistence: { blocked: false, busy: false, dirty: false, retained: [] },
      reviewCurrentSnapshot: vi.fn(), acceptReviewedSnapshot: vi.fn(), discardRetainedDrafts: vi.fn(),
    }),
    AppProvider: ({ children }: React.PropsWithChildren) => <>{children}</>
  };
});

describe('Verifica Mock Residui in App.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContextState = {
      currentUser: { id: 'user1', role: 'GUEST' },
      currentEntity: { id: 'e1', name: 'Ente 1' },
      currentYear: 2026,
      activeTab: 'dummy_tab',
      entities: [],
      fundData: { annualData: {}, metadata: { snapshotStatus: 'OPEN' } },
      hasPendingDraft: true,
  pendingDraftData: { annualData: {}, metadata: { snapshotStatus: 'OPEN' } },
      pendingDraftMetadata: { updatedAt: 'oggi', entityName: 'Ente 1', entityId: 'e1', year: 2026 },
    };
  });

  it('non deve renderizzare il pulsante "Salva su DB (Mock)"', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
        </AppProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Bozza locale rilevata/i)).toBeInTheDocument();
    
    const mockButton = screen.queryByText(/Salva su DB \(Mock\)/i);
    expect(mockButton).not.toBeInTheDocument();
  });

  it('in CLOSED mantiene consultabile la bozza, blocca il ripristino e consente lo scarto', () => {
    mockContextState.fundData.metadata.snapshotStatus = 'CLOSED';
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
        </AppProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Bozza locale rilevata/i)).toBeInTheDocument();
    expect(screen.getByText(/non può essere applicata perché l’annualità è chiusa/i)).toBeInTheDocument();

    const restoreButton = screen.getByRole('button', { name: /Consulta la bozza precedente/i });
    expect(restoreButton).toBeEnabled();
    expect(screen.queryByRole('button', { name: /^Ripristina$/i })).not.toBeInTheDocument();
    fireEvent.click(restoreButton);
    expect(mockRestorePendingDraft).toHaveBeenCalledTimes(1); // Consultation command; real provider never reapplies an unversioned draft.

    const discardButton = screen.getByRole('button', { name: /^Scarta$/i });
    expect(discardButton).toBeEnabled();
    fireEvent.click(discardButton);
    expect(mockDiscardPendingDraft).toHaveBeenCalledTimes(1);
  });
});
