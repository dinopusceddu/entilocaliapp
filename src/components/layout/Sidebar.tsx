import React from 'react';
import { PageModule } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface SidebarProps {
  modules: PageModule[];
  isOpen: boolean;
  toggleSidebar: () => void;
}

// Mappatura delle icone Material Icons Round per ogni modulo
const MODULE_ICONS: Record<string, string> = {
  benvenuto: 'home',
  dataEntry: 'edit_note',
  fondoAccessorioDipendente: 'account_balance_wallet',
  fondoElevateQualificazioni: 'military_tech',
  fondoSegretarioComunale: 'manage_accounts',
  fondoDirigenza: 'business_center',
  personaleServizio: 'groups',
  distribuzioneRisorse: 'pie_chart',
  fundDetails: 'analytics',
  compliance: 'verified',
  checklist: 'checklist',
  reports: 'summarize',
  userManagement: 'admin_panel_settings',
  yearManagement: 'calendar_today',
  messages: 'mail',
  communicationsAdmin: 'campaign',
};

export const Sidebar: React.FC<SidebarProps> = ({ modules, isOpen, toggleSidebar }) => {
  const { state, dispatch } = useAppContext();
  const { signOut } = useAuth();
  const { annoRiferimento } = state.fundData.annualData;

  const handleNav = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: id });
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

      {/* Sidebar mobile (classica, a larghezza fissa quando aperta) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col py-6
          transform ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
          md:hidden
          transition-transform duration-300 ease-in-out`}
      >
        {/* Header logo mobile rimosso */}

        {/* Navigazione mobile */}
        <nav className="flex-1 w-full space-y-1 px-2 overflow-y-auto">
          {modules.map((mod) => {
            if (mod.id === 'userManagement' && state.currentUser.role !== 'ADMIN') return null;
            if (mod.id === 'communicationsAdmin' && state.currentUser.role !== 'ADMIN') return null;
            let moduleName = mod.name;
            if (mod.id === 'personaleServizio') {
              moduleName = `Personale in servizio nel ${annoRiferimento}`;
            }
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
                <span className="ml-3 truncate">{moduleName}</span>
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

      {/* Sidebar desktop: collassabile con hover-expand */}
      <aside
        className="hidden md:flex flex-col w-16 hover:w-64 transition-all duration-300 ease-in-out
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          py-6 z-40 shrink-0 overflow-hidden group h-full sticky top-0"
      >
        {/* Header logo desktop rimosso */}

        {/* Navigazione desktop */}
        <nav className="flex-1 w-full space-y-1 px-2 overflow-y-auto overflow-x-hidden">
          {modules.map((mod) => {
            if (mod.id === 'userManagement' && state.currentUser.role !== 'ADMIN') return null;
            if (mod.id === 'communicationsAdmin' && state.currentUser.role !== 'ADMIN') return null;
            let moduleName = mod.name;
            if (mod.id === 'personaleServizio') {
              moduleName = `Personale in servizio nel ${annoRiferimento}`;
            }
            const isActive = state.activeTab === mod.id;
            const icon = MODULE_ICONS[mod.id] || 'circle';
            return (
              <button
                key={mod.id}
                onClick={() => handleNav(mod.id)}
                title={moduleName}
                className={`w-full flex items-center p-3 rounded-xl text-sm font-medium transition-colors text-left
                  ${isActive
                    ? 'bg-red-50 dark:bg-red-900/20 text-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary'
                  }`}
              >
                <span className="material-icons text-[20px] shrink-0">{icon}</span>
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                  {moduleName}
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