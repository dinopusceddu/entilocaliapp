import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  getVisibleModules, 
  AppModule, 
  getAccessibleModuleOrFallback, 
  getModuleAccessInfo 
} from './application/registry/moduleRegistry';
import { NavigationScope } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainLayout } from './components/layout/MainLayout';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { AppProvider, useAppContext } from './contexts/AppContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const FONDO_PREVIEW_BASE = '/configurazione-fondo-preview';

export const isFondoPreviewPath = (pathname: string): boolean =>
  pathname === FONDO_PREVIEW_BASE || pathname.startsWith(`${FONDO_PREVIEW_BASE}/`);

export const hasRecoverableWizardContext = (
  userId?: string,
  storage: Pick<Storage, 'getItem'> = window.localStorage
): boolean => {
  if (!userId) return false;
  try {
    const raw = storage.getItem(`fl_last_context_${userId}`);
    if (!raw) return false;
    const ctx = JSON.parse(raw);
    return !!ctx?.entityId;
  } catch (e) {
    return false;
  }
};

export const shouldDeferWizardAccessFallback = ({
  activeTab,
  pathname,
  hasEntity,
  isLoading = false,
  userId,
  storage = window.localStorage
}: {
  activeTab?: string;
  pathname: string;
  hasEntity: boolean;
  isLoading?: boolean;
  userId?: string;
  storage?: Pick<Storage, 'getItem'>;
}): boolean => {
  return activeTab === 'wizard2026Preview' &&
    isFondoPreviewPath(pathname) &&
    !hasEntity &&
    (isLoading || hasRecoverableWizardContext(userId, storage));
};

export const shouldSyncFondoPreviewRoute = ({
  pathname,
  activeTab,
  navigationScope
}: {
  pathname: string;
  activeTab?: string;
  navigationScope?: NavigationScope;
}): boolean => {
  return isFondoPreviewPath(pathname) &&
    (activeTab !== 'wizard2026Preview' || navigationScope !== NavigationScope.FONDO);
};

export const shouldReplaceWizardRoute = ({
  pathname,
  activeTab
}: {
  pathname: string;
  activeTab?: string;
}): boolean => {
  return activeTab === 'wizard2026Preview' && !isFondoPreviewPath(pathname);
};

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentUser, activeTab, navigationScope, isLoading, fundData, currentEntity } = state;
  const { hasDirigenza } = fundData.annualData;
  const hasEntity = !!currentEntity;

  const accessOptions = React.useMemo(() => ({
    hasEntity,
    hasDirigenza
  }), [hasEntity, hasDirigenza]);

  const authorizedModules = React.useMemo(() => {
    return getVisibleModules(currentUser, accessOptions);
  }, [currentUser, accessOptions]);

  React.useEffect(() => {
    // [MOD-033] Alias /wizard-2026-preview rimosso — non più necessario

    const pathname = window.location.pathname;

    if (shouldSyncFondoPreviewRoute({ pathname, activeTab, navigationScope })) {
      if (navigationScope !== NavigationScope.FONDO) {
        dispatch({ type: 'SET_NAVIGATION_SCOPE', payload: NavigationScope.FONDO });
      }
      if (activeTab !== 'wizard2026Preview') {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'wizard2026Preview' });
      }
      return;
    } else if (!activeTab) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dashboard' });
      return;
    } else if (activeTab !== 'dashboard') {
      const currentModule = authorizedModules.find(m => m.id === activeTab);
      const safeModule = getAccessibleModuleOrFallback(currentModule, currentUser, accessOptions);
      const deferWizardFallback = shouldDeferWizardAccessFallback({
        activeTab,
        pathname,
        hasEntity,
        isLoading,
        userId: currentUser?.id
      });

      if (!deferWizardFallback && safeModule.id !== activeTab) {
        console.warn(`Accesso non autorizzato o vincoli mancanti per: ${activeTab}. Redirect a fallback: ${safeModule.id}.`);
        dispatch({ type: 'SET_ACTIVE_TAB', payload: safeModule.id });
        return;
      }
    }

    if (shouldReplaceWizardRoute({ pathname, activeTab })) {
      window.history.replaceState(null, '', '/configurazione-fondo-preview');
    }
  }, [activeTab, navigationScope, authorizedModules, currentUser, accessOptions, dispatch, hasEntity, isLoading]);

  const sidebarModules = React.useMemo(() => {
    return authorizedModules
      .filter((m: AppModule) => m.scope === navigationScope && m.id !== 'dashboard')
      .map((m: AppModule) => {
        const accessInfo = getModuleAccessInfo(m, currentUser, accessOptions);
        return {
          ...m,
          isDisabled: accessInfo.isDisabled,
          disabledReason: accessInfo.disabledReason
        };
      });
  }, [authorizedModules, navigationScope, currentUser, accessOptions]);

  const showSidebar = navigationScope !== NavigationScope.DASHBOARD && navigationScope !== NavigationScope.WIZARD;


  const activeModule = authorizedModules.find((mod: AppModule) => mod.id === activeTab);
  const ActiveComponent = getAccessibleModuleOrFallback(activeModule, currentUser, accessOptions).component;

  if (activeTab === 'wizard2026Preview') {
    return (
      <ErrorBoundary resetKey={activeTab}>
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <LoadingSpinner text="Caricamento applicazione..." />
          </div>
        ) : (
          <ActiveComponent />
        )}
      </ErrorBoundary>
    );
  }

  const { restorePendingDraft, discardPendingDraft } = useAppContext();

  return (
    <MainLayout modules={sidebarModules} showSidebar={showSidebar}>
      {state.currentUser.role === 'ADMIN' && state.currentEntity && state.currentEntity.user_id !== state.currentUser.id && (
        <div className="bg-amber-500 text-white font-semibold px-4 py-2 text-center text-sm shadow-sm flex items-center justify-center gap-2">
          <span>🌐</span>
          <span>Vista amministratore globale: stai lavorando su un ente creato da un altro utente.</span>
        </div>
      )}
      {state.hasPendingDraft && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md z-50">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="text-lg">⚠️</span>
            <span>
              <strong>Bozza locale rilevata:</strong> Sono presenti modifiche locali salvate nel browser il <strong>{state.pendingDraftMetadata?.updatedAt}</strong> per l'ente <strong>{state.pendingDraftMetadata?.entityName}</strong>. Il salvataggio remoto non è al momento disponibile.
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={restorePendingDraft}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded shadow transition-colors"
            >
              Ripristina Bozza
            </button>
            <button
              onClick={discardPendingDraft}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded shadow transition-colors"
            >
              Scarta
            </button>
          </div>
        </div>
      )}
      <ErrorBoundary resetKey={activeTab}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner text="Caricamento applicazione..." />
          </div>
        ) : (
          <ActiveComponent />
        )}
      </ErrorBoundary>
    </MainLayout>
  );
};

const AuthWrapper: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner text="Caricamento sessione..." />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center">
            <LoadingSpinner text="Caricamento applicazione..." />
          </div>
        }>
          <AuthProvider>
            <AuthWrapper />
          </AuthProvider>
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
