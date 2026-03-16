import React from 'react';
import { PageModule, NavigationScope } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { LayoutGrid } from 'lucide-react';

interface SidebarProps {
  modules: PageModule[];
  isOpen: boolean;
  toggleSidebar: () => void;
}

// Mappatura delle icone Material Icons Round per ogni modulo
const MODULE_ICONS: Record<string, string> = {
  home: 'dashboard',
  dataEntry: 'fact_check',
  fondoDipendenti: 'payments',
  fondoEQ: 'star_rate',
  fondoSegretario: 'history_edu',
  fondoDirigenza: 'work',
  personale: 'badge',
  distribuzioneRisorse: 'account_tree',
  fundDetails: 'query_stats',
  compliance: 'verified_user',
  checklist: 'forum',
  reports: 'inventory',
  userManagement: 'admin_panel_settings',
  yearManagement: 'calendar_today',
  messages: 'mail',
  notifications: 'notifications',
  feedback: 'feedback',
  feedbackAdmin: 'analytics',
};

export const Sidebar: React.FC<SidebarProps> = ({ modules, isOpen, toggleSidebar }) => {
  const { state, setScopeAndTab } = useAppContext();
  const { signOut } = useAuth();
  const { annoRiferimento } = state.fundData.annualData;

  const handleNav = (id: string) => {
    // Keep current scope when navigating within sidebar tabs
    setScopeAndTab(state.navigationScope, id);
    if (isOpen && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleBackToDashboard = () => {
    setScopeAndTab(NavigationScope.DASHBOARD, 'dashboard');
    if (isOpen && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col py-6
          transform ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
          md:hidden
          transition-transform duration-300 ease-in-out`}
      >
        <div className="px-4 mb-6">
          <button
            onClick={handleBackToDashboard}
            className="w-full flex items-center p-3 rounded-xl text-sm font-bold bg-slate-50 dark:bg-slate-800 text-primary border border-slate-100 dark:border-slate-700 transition-colors hover:bg-primary hover:text-white"
          >
            <LayoutGrid className="h-5 w-5 mr-3" />
            Torna alla Dashboard
          </button>
        </div>

        {/* Navigazione mobile */}
        <nav className="flex-1 w-full space-y-1 px-2 overflow-y-auto">
          {modules.map((mod) => {
            if ((mod.id === 'userManagement' || mod.id === 'feedbackAdmin') && state.currentUser.role !== 'ADMIN') return null;
            const isActive = state.activeTab === mod.id;
            const icon = MODULE_ICONS[mod.id] || 'circle';
            return (
              <button
                key={mod.id}
                onClick={() => handleNav(mod.id)}
                className={`w-full flex items-center p-3 rounded-xl text-sm font-medium transition-colors text-left
                  ${isActive
                    ? 'bg-red-50 dark:bg-red-900/20 text-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'
                  }`}
              >
                <span className="material-icons text-[20px] shrink-0">{icon}</span>
                <span className="ml-3 truncate">
                  {mod.id === 'personale'
                    ? `Personale in servizio nell'anno ${annoRiferimento}`
                    : mod.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer mobile */}
        <div className="px-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center p-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-icons text-[20px] text-red-500 shrink-0">logout</span>
            <span className="ml-3">Esci</span>
          </button>
        </div>
      </aside>

      {/* Sidebar desktop */}
      <aside
        className="hidden md:flex flex-col w-16 hover:w-64 transition-all duration-300 ease-in-out
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          py-6 z-40 shrink-0 overflow-hidden group h-full sticky top-0"
      >
        <div className="px-2 mb-6 w-full flex justify-center group-hover:justify-start">
          <button
            onClick={handleBackToDashboard}
            title="Torna alla Dashboard"
            className="w-12 h-12 group-hover:w-full flex items-center justify-center group-hover:justify-start group-hover:px-3 rounded-xl text-sm font-bold bg-slate-50 dark:bg-slate-800 text-primary border border-slate-100 dark:border-slate-700 transition-all hover:bg-primary hover:text-white"
          >
            <LayoutGrid className="h-6 w-6 shrink-0" />
            <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
              Dashboard
            </span>
          </button>
        </div>

        {/* Navigazione desktop */}
        <nav className="flex-1 w-full space-y-1 px-2 overflow-y-auto overflow-x-hidden">
          {modules.map((mod) => {
            if ((mod.id === 'userManagement' || mod.id === 'feedbackAdmin') && state.currentUser.role !== 'ADMIN') return null;
            const isActive = state.activeTab === mod.id;
            const icon = MODULE_ICONS[mod.id] || 'circle';
            return (
              <button
                key={mod.id}
                onClick={() => handleNav(mod.id)}
                title={mod.name}
                className={`w-full flex items-center p-3 rounded-xl text-sm font-medium transition-colors text-left
                  ${isActive
                    ? 'bg-red-50 dark:bg-red-900/20 text-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'
                  }`}
              >
                <span className="material-icons text-[20px] shrink-0">{icon}</span>
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                  {mod.id === 'personale'
                    ? `Personale in servizio nell'anno ${annoRiferimento}`
                    : mod.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer desktop */}
        <div className="px-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => signOut()}
            title="Esci"
            className="w-full flex items-center p-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-icons text-[20px] text-red-500 shrink-0">logout</span>
            <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Esci
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
