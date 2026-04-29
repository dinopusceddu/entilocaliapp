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
    if (!activeTab) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dashboard' });
    } else if (activeTab !== 'dashboard') {
      const currentModule = authorizedModules.find(m => m.id === activeTab);
      const safeModule = getAccessibleModuleOrFallback(currentModule, currentUser, accessOptions);

      if (safeModule.id !== activeTab) {
        console.warn(`Accesso non autorizzato o vincoli mancanti per: ${activeTab}. Redirect a fallback: ${safeModule.id}.`);
        dispatch({ type: 'SET_ACTIVE_TAB', payload: safeModule.id });
      }
    }
  }, [activeTab, authorizedModules, currentUser, accessOptions, dispatch]);

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

  const showSidebar = navigationScope !== NavigationScope.DASHBOARD;

  const activeModule = authorizedModules.find((mod: AppModule) => mod.id === activeTab);
  const ActiveComponent = getAccessibleModuleOrFallback(activeModule, currentUser, accessOptions).component;

  return (
    <MainLayout modules={sidebarModules} showSidebar={showSidebar}>
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
