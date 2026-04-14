import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Calculator,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  History,
  Bell,
  MessageCircle,
  ThumbsUp,
  BarChart3,
  BookOpen,
  Search,
  List,
  MessageSquare,
  Library
} from 'lucide-react';

import { MainLayout } from './components/layout/MainLayout';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { CompliancePage } from './pages/CompliancePage';
import { DataEntryPage } from './pages/DataEntryPage';
import { FondoAccessorioDipendentePage } from './pages/FondoAccessorioDipendentePage';
import { FondoDirigenzaPage } from './pages/FondoDirigenzaPage';
import { FondoElevateQualificazioniPage } from './pages/FondoElevateQualificazioniPage';
import { FondoSegretarioComunalePage } from './pages/FondoSegretarioComunalePage';
import { FundDetailsPage } from './pages/FundDetailsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { MessagesPage } from './pages/MessagesPage';
import { HomePage as PanoramicaPage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { PersonaleServizioPage } from './pages/PersonaleServizioPage';
import { DistribuzioneRisorsePage } from './pages/DistribuzioneRisorsePage';
import { EntityYearManagementPage } from './pages/EntityYearManagementPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { FeedbackAdminPage } from './pages/FeedbackAdminPage';
import { CompensatoreDelegatoPage } from './pages/CompensatoreDelegatoPage';
import { NormativaHomePage } from './pages/normativa/NormativaHomePage';
import { RaccoltaPage } from './pages/normativa/RaccoltaPage';
import { GuidaPage } from './pages/normativa/GuidaPage';
import { IndiceAnaliticoPage } from './pages/normativa/IndiceAnaliticoPage';
import { PareriAranPage } from './pages/normativa/PareriAranPage';
import { RicercaNormativaPage } from './pages/normativa/RicercaNormativaPage';
import { PageModule, NavigationScope } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Placeholder components for remaining stubs

const allPageModules: PageModule[] = [
  { id: 'dashboard', name: 'Dashboard', component: DashboardPage, scope: NavigationScope.DASHBOARD },

  // App Fondo (Nuovo Ordine Richiesto)
  { id: 'home', name: 'Panoramica', component: PanoramicaPage, scope: NavigationScope.FONDO, icon: BarChart3 },
  { id: 'dataEntry', name: 'Dati necessari ad iniziare la configurazione', component: DataEntryPage, scope: NavigationScope.FONDO, icon: FileText },

  // Fondi Specifici
  { id: 'fondoDipendenti', name: 'Fondo Personale', component: FondoAccessorioDipendentePage, scope: NavigationScope.FONDO, icon: Calculator },
  { id: 'fondoEQ', name: 'Fondo Elevate Qualificazioni (EQ)', component: FondoElevateQualificazioniPage, scope: NavigationScope.FONDO, icon: Calculator },
  { id: 'fondoSegretario', name: 'Fondo Segretario Comunale', component: FondoSegretarioComunalePage, scope: NavigationScope.FONDO, icon: Calculator },
  { id: 'fondoDirigenza', name: 'Fondo Dirigenza', component: FondoDirigenzaPage, scope: NavigationScope.FONDO, icon: Calculator },

  { id: 'personale', name: 'Personale in servizio', component: PersonaleServizioPage, scope: NavigationScope.FONDO, icon: Users },
  { id: 'distribuzioneRisorse', name: 'Distribuzione risorse', component: DistribuzioneRisorsePage, scope: NavigationScope.FONDO, icon: TrendingUp },
  { id: 'fundDetails', name: 'Dettagli fondo calcolato', component: FundDetailsPage, scope: NavigationScope.FONDO, icon: BarChart3 },
  { id: 'compliance', name: 'Conformità', component: CompliancePage, scope: NavigationScope.FONDO, icon: AlertTriangle },
  { id: 'checklist', name: 'Richiedi info', component: ChecklistPage, scope: NavigationScope.FONDO, icon: MessageCircle },
  { id: 'reports', name: 'Stampe e Report', component: ReportsPage, scope: NavigationScope.FONDO, icon: FileText },

  // App Admin
  { id: 'userManagement', name: 'Gestione Utenti', component: UserManagementPage, scope: NavigationScope.ADMIN, icon: Users },
  { id: 'entityYearManagement', name: 'Enti e Anni', component: EntityYearManagementPage, scope: NavigationScope.DASHBOARD, icon: History },
  { id: 'compensatoreDelegato', name: 'Calcolo straordinari e indennità', component: CompensatoreDelegatoPage, scope: NavigationScope.DASHBOARD, icon: Calculator },

  // App Normativa
  { id: 'normativaHome', name: 'Esplora Normativa', component: NormativaHomePage, scope: NavigationScope.NORMATIVA, icon: Library },
  { id: 'raccoltaSistematica', name: 'Raccolta Sistematica', component: RaccoltaPage, scope: NavigationScope.NORMATIVA, icon: BookOpen },
  { id: 'guidaContratto', name: 'Guida al Contratto', component: GuidaPage, scope: NavigationScope.NORMATIVA, icon: FileText },
  { id: 'ricercaNormativa', name: 'Ricerca', component: RicercaNormativaPage, scope: NavigationScope.NORMATIVA, icon: Search },
  { id: 'indiceAnalitico', name: 'Indice Analitico', component: IndiceAnaliticoPage, scope: NavigationScope.NORMATIVA, icon: List },
  { id: 'pareriAran', name: 'Pareri ARAN', component: PareriAranPage, scope: NavigationScope.NORMATIVA, icon: MessageSquare },

  // App Comunicazioni
  { id: 'messages', name: 'Messaggi', component: MessagesPage, scope: NavigationScope.COMUNICAZIONI, icon: MessageCircle },
  { id: 'notifications', name: 'Notifiche', component: NotificationsPage, scope: NavigationScope.COMUNICAZIONI, icon: Bell },
  { id: 'feedback', name: 'Sistema Feedback', component: FeedbackPage, scope: NavigationScope.COMUNICAZIONI, icon: ThumbsUp },
  { id: 'feedbackAdmin', name: 'Analisi Feedback (Admin)', component: FeedbackAdminPage, scope: NavigationScope.COMUNICAZIONI, icon: BarChart3 },
];

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { activeTab, navigationScope, isLoading, fundData } = state;
  const { hasDirigenza } = fundData.annualData;

  const filteredModules = React.useMemo(() => {
    // Se l'ente è dichiarato senza dirigenza, rimuoviamo il modulo dal sistema
    if (hasDirigenza === false) {
      return allPageModules.filter(m => m.id !== 'fondoDirigenza');
    }
    return allPageModules;
  }, [hasDirigenza]);

  React.useEffect(() => {
    if (!activeTab) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dashboard' });
    }
  }, [activeTab, dispatch]);

  const sidebarModules = filteredModules.filter(m => m.scope === navigationScope && m.id !== 'dashboard');
  const showSidebar = navigationScope !== NavigationScope.DASHBOARD;

  const ActiveComponent =
    filteredModules.find((mod) => mod.id === activeTab)?.component || DashboardPage;

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
