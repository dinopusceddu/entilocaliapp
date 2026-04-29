import React from 'react';
import { 
  BarChart3, 
  Calculator, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  MessageCircle, 
  Settings, 
  Library, 
  Bell, 
  ThumbsUp, 
  BookOpen, 
  Search, 
  List, 
  MessageSquare,
  LucideIcon
} from 'lucide-react';

import { NavigationScope, User } from '../../types';

// Import componenti
import { DashboardPage } from '../../pages/DashboardPage';
import { HomePage as PanoramicaPage } from '../../pages/HomePage';
import { DataEntryPage } from '../../pages/DataEntryPage';
import { FondoAccessorioDipendentePage } from '../../pages/FondoAccessorioDipendentePage';
import { FondoElevateQualificazioniPage } from '../../pages/FondoElevateQualificazioniPage';
import { FondoSegretarioComunalePage } from '../../pages/FondoSegretarioComunalePage';
import { FondoDirigenzaPage } from '../../pages/FondoDirigenzaPage';
import { PersonaleServizioPage } from '../../pages/PersonaleServizioPage';
import { DistribuzioneRisorsePage } from '../../pages/DistribuzioneRisorsePage';
import { FundDetailsPage } from '../../pages/FundDetailsPage';
import { CompliancePage } from '../../pages/CompliancePage';
import { ChecklistPage } from '../../pages/ChecklistPage';
import { ReportsPage } from '../../pages/ReportsPage';
import { UserManagementPage } from '../../pages/UserManagementPage';
import { EntityYearManagementPage } from '../../pages/EntityYearManagementPage';
import { CompensatoreDelegatoPage } from '../../pages/CompensatoreDelegatoPage';
import { AdminPareriPage } from '../../pages/AdminPareriPage';
import { NormativaHomePage } from '../../pages/normativa/NormativaHomePage';
import { RaccoltaPage } from '../../pages/normativa/RaccoltaPage';
import { GuidaPage } from '../../pages/normativa/GuidaPage';
import { RicercaNormativaPage } from '../../pages/normativa/RicercaNormativaPage';
import { IndiceAnaliticoPage } from '../../pages/normativa/IndiceAnaliticoPage';
import { PareriAranPage } from '../../pages/normativa/PareriAranPage';
import { MessagesPage } from '../../pages/MessagesPage';
import { NotificationsPage } from '../../pages/NotificationsPage';
import { FeedbackPage } from '../../pages/FeedbackPage';
import { FeedbackAdminPage } from '../../pages/FeedbackAdminPage';
import { Tabella15Page } from '../../pages/Tabella15Page';

export interface AppModule {
  id: string;
  name: string;             // Nome breve per Sidebar
  title?: string;           // Titolo completo per Header/Dashboard (ex fullTitle)
  description?: string;      // Descrizione per Dashboard Card
  component: React.FC;
  scope: NavigationScope;
  icon: LucideIcon;
  adminOnly: boolean;
  dashboardColor?: string;   // Tailwind bg color per card (es. 'bg-blue-500')
  textColor?: string;        // Tailwind text color per card (es. 'text-blue-600')
  status?: string;           // Status label (Nuovo, Attivo, etc.)
  requirements?: {           // Requisiti per la visisbilità/accessibilità
    entityNeeded?: boolean;
    dirigenzaOnly?: boolean;
  };
  isDisabled?: boolean;
  disabledReason?: string;
}

const ALL_MODULES: AppModule[] = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    component: DashboardPage, 
    scope: NavigationScope.DASHBOARD, 
    icon: Settings, 
    adminOnly: false 
  },
  
  // App Dashboard / Gestione
  { 
    id: 'entityYearManagement', 
    name: 'Enti e Anni', 
    title: 'Enti e Annualità',
    description: 'Creazione enti, gestione anni e attivazione contesto di lavoro.',
    component: EntityYearManagementPage, 
    scope: NavigationScope.DASHBOARD, 
    icon: Settings, 
    adminOnly: false,
    dashboardColor: 'bg-orange-500',
    textColor: 'text-orange-600',
    status: 'Nuovo'
  },
  { 
    id: 'dataEntry', 
    name: 'Dati Iniziali', 
    title: 'Configurazione Fondo',
    description: 'Gestione risorse, personale e calcolo del fondo decentrato.',
    component: DataEntryPage, 
    scope: NavigationScope.FONDO, 
    icon: FileText, 
    adminOnly: false,
    dashboardColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    status: 'Attivo',
    requirements: { entityNeeded: true }
  },
  { 
    id: 'compensatoreDelegato', 
    name: 'Straordinari', 
    title: 'Calcolo straordinari e indennità',
    description: 'Calcolo di straordinari, supplementari e turni aggiornato al CCNL 23.02.2026.',
    component: CompensatoreDelegatoPage, 
    scope: NavigationScope.DASHBOARD, 
    icon: Calculator, 
    adminOnly: false,
    dashboardColor: 'bg-red-500',
    textColor: 'text-red-600',
    status: 'Nuovo'
  },
  { 
    id: 'normativaHome', 
    name: 'Esplora Normativa', 
    title: 'Normativa e Contratti',
    description: 'Raccolta sistematica CCNL, Guida al Contratto e Pareri ARAN.',
    component: NormativaHomePage, 
    scope: NavigationScope.NORMATIVA, 
    icon: Library, 
    adminOnly: false,
    dashboardColor: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    status: 'Attivo'
  },
  { 
    id: 'messages', 
    name: 'Messaggi', 
    title: 'Comunicazioni',
    description: 'Messaggi interni, notifiche e sistema di feedback.',
    component: MessagesPage, 
    scope: NavigationScope.COMUNICAZIONI, 
    icon: MessageCircle, 
    adminOnly: false,
    dashboardColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    status: 'Attivo'
  },
  { 
    id: 'userManagement', 
    name: 'Utenti', 
    title: 'Gestione Utenti',
    description: 'Amministrazione profili, permessi e accessi di sistema.',
    component: UserManagementPage, 
    scope: NavigationScope.ADMIN, 
    icon: Users, 
    adminOnly: true,
    dashboardColor: 'bg-purple-500',
    textColor: 'text-purple-600',
    status: 'Attivo'
  },

  // App Fondo
  { 
    id: 'home', 
    name: 'Panoramica', 
    title: 'Panoramica Fondo',
    component: PanoramicaPage, 
    scope: NavigationScope.FONDO, 
    icon: BarChart3, 
    adminOnly: false 
  },
  { 
    id: 'fondoDipendenti', 
    name: 'Fondo Personale', 
    component: FondoAccessorioDipendentePage, 
    scope: NavigationScope.FONDO, 
    icon: Calculator, 
    adminOnly: false 
  },
  { 
    id: 'fondoEQ', 
    name: 'Fondo EQ', 
    title: 'Fondo Elevate Qualificazioni (EQ)',
    component: FondoElevateQualificazioniPage, 
    scope: NavigationScope.FONDO, 
    icon: Calculator, 
    adminOnly: false 
  },
  { 
    id: 'fondoSegretario', 
    name: 'Fondo Segretario', 
    title: 'Fondo Segretario Comunale',
    component: FondoSegretarioComunalePage, 
    scope: NavigationScope.FONDO, 
    icon: Calculator, 
    adminOnly: false 
  },
  { 
    id: 'fondoDirigenza', 
    name: 'Fondo Dirigenza', 
    component: FondoDirigenzaPage, 
    scope: NavigationScope.FONDO, 
    icon: Calculator, 
    adminOnly: false,
    requirements: { dirigenzaOnly: true, entityNeeded: true }
  },
  { 
    id: 'personale', 
    name: 'Personale', 
    title: 'Personale in servizio',
    component: PersonaleServizioPage, 
    scope: NavigationScope.FONDO, 
    icon: Users, 
    adminOnly: false 
  },
  { 
    id: 'distribuzioneRisorse', 
    name: 'Distribuzione', 
    title: 'Distribuzione risorse',
    component: DistribuzioneRisorsePage, 
    scope: NavigationScope.FONDO, 
    icon: TrendingUp, 
    adminOnly: false 
  },
  { 
    id: 'fundDetails', 
    name: 'Dettagli', 
    title: 'Dettagli fondo calcolato',
    description: 'Dettaglio del fondo calcolato e riepilogo',
    component: FundDetailsPage, 
    scope: NavigationScope.FONDO, 
    icon: BarChart3, 
    adminOnly: false 
  },
  { 
    id: 'compliance', 
    name: 'Conformità', 
    component: CompliancePage, 
    scope: NavigationScope.FONDO, 
    icon: AlertTriangle, 
    adminOnly: false 
  },
  { 
    id: 'checklist', 
    name: 'Richiedi info', 
    component: ChecklistPage, 
    scope: NavigationScope.FONDO, 
    icon: MessageCircle, 
    adminOnly: false 
  },
  { 
    id: 'reports', 
    name: 'Stampe e Report', 
    component: ReportsPage, 
    scope: NavigationScope.FONDO, 
    icon: FileText, 
    adminOnly: false 
  },
  { 
    id: 'tabella15', 
    name: 'Tabella 15', 
    title: 'Anteprima Tabella 15 (Conto Annuale)',
    component: Tabella15Page, 
    scope: NavigationScope.FONDO, 
    icon: List, 
    adminOnly: false 
  },

  // App Admin
  { 
    id: 'adminPareri', 
    name: 'Admin Pareri', 
    title: 'Admin Pareri ARAN',
    component: AdminPareriPage, 
    scope: NavigationScope.ADMIN, 
    icon: MessageSquare, 
    adminOnly: true 
  },

  // App Normativa
  { 
    id: 'raccoltaSistematica', 
    name: 'Raccolta', 
    title: 'Raccolta Sistematica',
    component: RaccoltaPage, 
    scope: NavigationScope.NORMATIVA, 
    icon: BookOpen, 
    adminOnly: false 
  },
  { 
    id: 'guidaContratto', 
    name: 'Guida Contratto', 
    title: 'Guida al Contratto',
    component: GuidaPage, 
    scope: NavigationScope.NORMATIVA, 
    icon: FileText, 
    adminOnly: false 
  },
  { 
    id: 'ricercaNormativa', 
    name: 'Ricerca', 
    component: RicercaNormativaPage, 
    scope: NavigationScope.NORMATIVA, 
    icon: Search, 
    adminOnly: false 
  },
  { 
    id: 'indiceAnalitico', 
    name: 'Indice', 
    title: 'Indice Analitico',
    component: IndiceAnaliticoPage, 
    scope: NavigationScope.NORMATIVA, 
    icon: List, 
    adminOnly: false 
  },
  { 
    id: 'pareriAran', 
    name: 'Pareri ARAN', 
    component: PareriAranPage, 
    scope: NavigationScope.NORMATIVA, 
    icon: MessageSquare, 
    adminOnly: false 
  },

  // App Comunicazioni
  { 
    id: 'notifications', 
    name: 'Notifiche', 
    component: NotificationsPage, 
    scope: NavigationScope.COMUNICAZIONI, 
    icon: Bell, 
    adminOnly: false 
  },
  { 
    id: 'feedback', 
    name: 'Feedback', 
    title: 'Sistema Feedback',
    component: FeedbackPage, 
    scope: NavigationScope.COMUNICAZIONI, 
    icon: ThumbsUp, 
    adminOnly: false 
  },
  { 
    id: 'feedbackAdmin', 
    name: 'Analisi Feedback', 
    title: 'Analisi Feedback (Admin)',
    component: FeedbackAdminPage, 
    scope: NavigationScope.COMUNICAZIONI, 
    icon: BarChart3, 
    adminOnly: true 
  },
];

export interface AccessInfo {
  isVisible: boolean;
  isAccessible: boolean;
  isDisabled: boolean;
  disabledReason?: string;
}

export interface ContextOptions {
  hasEntity?: boolean;
  hasDirigenza?: boolean;
}

/**
 * Calcola in modo centralizzato i permessi di un modulo in base all'utente e al contesto.
 */
export const getModuleAccessInfo = (module: AppModule, user: User, options?: ContextOptions): AccessInfo => {
  // 1. Regola di base: adminOnly
  const isVisibleByRole = !module.adminOnly || user.role === 'ADMIN';

  // 2. Regola contestuale: dirigenzaOnly
  const isVisibleByContext = !module.requirements?.dirigenzaOnly || options?.hasDirigenza === true;

  // 3. Regola di accessibilità: entityNeeded
  const needsEntity = module.requirements?.entityNeeded === true;
  const entityMissing = needsEntity && !options?.hasEntity;

  const isVisible = isVisibleByRole && isVisibleByContext;
  
  // Accessibilità: visibile e con tutti i vincoli soddisfatti
  const isAccessible = isVisible && !entityMissing;

  // Stato "Disabled": visibile ma non accessibile (es. lucchetto sulla dashboard)
  const isDisabled = isVisible && entityMissing;
  const disabledReason = isDisabled ? 'Seleziona un Ente per accedere a questo modulo.' : undefined;

  return {
    isVisible,
    isAccessible,
    isDisabled,
    disabledReason
  };
};

export const getVisibleModules = (user: User, options?: ContextOptions): AppModule[] => {
  return ALL_MODULES.filter(m => {
    const { isVisible } = getModuleAccessInfo(m, user, options);
    return isVisible;
  });
};

/**
 * Funzione di fallback per il routing.
 * Se il modulo richiesto non è accessibile, restituisce il modulo dashboard.
 */
export const getAccessibleModuleOrFallback = (module: AppModule | undefined, user: User, options?: ContextOptions): AppModule => {
  const dashboard = ALL_MODULES.find(m => m.id === 'dashboard')!;
  if (!module) return dashboard;
  
  const { isAccessible } = getModuleAccessInfo(module, user, options);
  return isAccessible ? module : dashboard;
};

export const getModuleById = (id: string): AppModule | undefined => {
  return ALL_MODULES.find(m => m.id === id);
};
