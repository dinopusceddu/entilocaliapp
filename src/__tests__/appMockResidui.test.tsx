
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { AppProvider } from '../contexts/AppContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user1', email: 'test@example.com' }, session: {} }),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

vi.mock('../components/layout/Header', () => ({
  Header: () => <div>Header Mock</div>
}));

vi.mock('../components/layout/MainLayout', () => ({
  MainLayout: ({ children }: any) => <div>{children}</div>
}));

vi.mock('../contexts/AppContext', async () => {
  const actual = await vi.importActual<any>('../contexts/AppContext');
  return {
    ...actual,
    useAppContext: () => ({
      state: {
        currentUser: { id: 'user1', role: 'GUEST' },
        activeTab: 'dummy_tab',
        entities: [],
        fundData: { annualData: {} },
        hasPendingDraft: true,
        pendingDraftMetadata: { updatedAt: 'oggi', entityName: 'Ente 1' },
      },
      dispatch: vi.fn(),
      restorePendingDraft: vi.fn(),
      discardPendingDraft: vi.fn(),
    }),
    AppProvider: ({ children }: any) => <>{children}</>
  };
});

describe('Verifica Mock Residui in App.tsx', () => {
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
});
