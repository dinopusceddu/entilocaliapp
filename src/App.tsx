import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { MainLayout } from './components/layout/MainLayout';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ChecklistPage } from './pages/ChecklistPage';
import { CompliancePage } from './pages/CompliancePage';
import { DataEntryPage } from './pages/DataEntryPage';
import { DistribuzioneRisorsePage } from './pages/DistribuzioneRisorsePage';
import { FondoAccessorioDipendentePage } from './pages/FondoAccessorioDipendentePage';
import { FondoDirigenzaPage } from './pages/FondoDirigenzaPage';
import { FondoElevateQualificazioniPage } from './pages/FondoElevateQualificazioniPage';
import { FondoSegretarioComunalePage } from './pages/FondoSegretarioComunalePage';
import { FundDetailsPage } from './pages/FundDetailsPage';
import { HomePage } from './pages/HomePage';
import { PersonaleServizioPage } from './pages/PersonaleServizioPage';
import { ReportsPage } from './pages/ReportsPage';
import { YearManagementPage } from './pages/YearManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { CommunicationsAdminPage } from './pages/CommunicationsAdminPage';
import { MessagesPage } from './pages/MessagesPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { FeedbackAdminPage } from './pages/FeedbackAdminPage';
import { PageModule } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const allPageModules: PageModule[] = [
  { id: 'benvenuto', name: 'Panoramica', component: HomePage },
  { id: 'dataEntry', name: 'Dati Costituzione Fondo', component: DataEntryPage },
  {
    id: 'fondoAccessorioDipendente',
    name: 'Fondo Accessorio Personale',
    component: FondoAccessorioDipendentePage,
  },
  {
    id: 'fondoElevateQualificazioni',
    name: 'Fondo Elevate Qualificazioni',
    component: FondoElevateQualificazioniPage,
  },
  {
    id: 'fondoSegretarioComunale',
    name: 'Risorse Segretario Comunale',
    component: FondoSegretarioComunalePage,
  },
  { id: 'fondoDirigenza', name: 'Fondo Dirigenza', component: FondoDirigenzaPage },
  {
    id: 'personaleServizio',
    name: 'Personale in servizio',
    component: PersonaleServizioPage,
  },
  {
    id: 'distribuzioneRisorse',
    name: 'Distribuzione Risorse',
    component: DistribuzioneRisorsePage,
  },
  {
    id: 'fundDetails',
    name: 'Dettaglio Fondo Calcolato',
    component: FundDetailsPage,
  },
  { id: 'compliance', name: 'Conformità', component: CompliancePage },
  { id: 'checklist', name: 'Chiedi informazioni', component: ChecklistPage },
  { id: 'reports', name: 'Report', component: ReportsPage },
  { id: 'yearManagement', name: 'Gestione Anni', component: YearManagementPage },
  { id: 'userManagement', name: 'Gestione Utenti', component: UserManagementPage },
  { id: 'messages', name: 'Bacheca Messaggi', component: MessagesPage },
  { id: 'communicationsAdmin', name: 'Gestione Comunicazioni', component: CommunicationsAdminPage },
  { id: 'feedback', name: 'Invia Feedback', component: FeedbackPage },
  { id: 'feedbackAdmin', name: 'Gestione Feedback', component: FeedbackAdminPage },
];


const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { activeTab, fundData, isLoading } = state;

  const visibleModules = allPageModules.filter((module) => {
    if (module.id === 'fondoDirigenza' && !fundData.annualData.hasDirigenza) {
      return false;
    }
    if (module.id === 'distribuzioneRisorse' && !fundData.annualData.isDistributionMode) {
      return false;
    }
    return true;
  });

  React.useEffect(() => {
    const activeModuleIsVisible = visibleModules.some(
      (mod) => mod.id === activeTab
    );
    if (!activeModuleIsVisible && activeTab !== 'benvenuto') {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'benvenuto' });
    }
  }, [visibleModules, activeTab, dispatch]);

  const ActiveComponent =
    visibleModules.find((mod) => mod.id === activeTab)?.component || HomePage;

  return (
    <MainLayout modules={visibleModules}>
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
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;