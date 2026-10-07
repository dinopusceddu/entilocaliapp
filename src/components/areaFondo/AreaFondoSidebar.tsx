import React, { useState, useMemo } from 'react';
import { ModalSurface } from '../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { NavigationScope } from '../../types';
import {
  LayoutDashboard,
  ClipboardCheck,
  Landmark,
  ShieldAlert,
  PieChart,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  X
} from 'lucide-react';

interface AreaFondoSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  mobileMenuId?: string;
}

export const AreaFondoSidebar: React.FC<AreaFondoSidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile, mobileMenuId
}) => {
  const { state, setScopeAndTab } = useAppContext();
  const { activeTab, currentEntity, currentYear, currentUser, fundData, complianceChecks } = state;
  const { hasDirigenza } = fundData.annualData;

  // Costituzione accordion state
  const isCostituzioneActive = [
    'fondoDipendenti',
    'fondoEQ',
    'fondoSegretario',
    'fondoDirigenza',
    'personale',
    'fundDetails'
  ].includes(activeTab);

  const [costituzioneExpanded, setCostituzioneExpanded] = useState<boolean>(true);

  // Calcolo stato raccolta dati (es. 6/8)
  const wizardProgress = useMemo(() => {
    if (!currentUser?.id || !currentEntity?.id || !currentYear) return null;
    try {
      const key = `fl_wizard2026_draft_${currentUser.id}_${currentEntity.id}_${currentYear}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const count = parsed?.meta?.completedSteps?.length ?? 0;
        return `${count}/8`;
      }
    } catch {
      // ignore
    }
    return null;
  }, [currentUser?.id, currentEntity?.id, currentYear]);

  // Calcolo verifiche
  const criticalCount = complianceChecks.filter(c => c.gravita === 'error').length;
  const warningCount = complianceChecks.filter(c => c.gravita === 'warning').length;

  const handleNav = (tabId: string) => {
    if (tabId === 'wizard2026Preview') {
      window.history.pushState(null, '', '/configurazione-fondo-preview/raccolta-dati');
      setScopeAndTab(NavigationScope.FONDO, 'wizard2026Preview');
    } else {
      setScopeAndTab(NavigationScope.FONDO, tabId);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const navId = React.useId();
  const navContent = (mode: string) => (
    <div className="flex flex-col h-full">
      {/* Header Drawer Mobile & Tablet */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Sezioni Area Fondo
        </h3>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Chiudi menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="lg:hidden px-4 py-2 text-xs break-words border-b border-slate-200" data-testid="drawer-fund-context">
        {currentEntity?.name} · Fondo {currentYear} · {fundData.metadata?.snapshotStatus === 'CLOSED' ? 'Chiuso — sola lettura' : 'In lavorazione'}
      </p>
      {/* Nav List */}
      <nav aria-label="Sezioni del Fondo corrente" className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        
        {/* 1. Cabina di regia */}
        <button
          onClick={() => handleNav('home')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
            activeTab === 'home'
              ? 'bg-[#cc4331] text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          data-testid="nav-cabina-regia"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span className="flex-1">Cabina di regia</span>
        </button>

        {/* 2. Raccolta dati */}
        <button
          onClick={() => handleNav('wizard2026Preview')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
            activeTab === 'wizard2026Preview'
              ? 'bg-[#cc4331] text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          data-testid="nav-raccolta-dati"
        >
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-4 h-4 shrink-0" />
            <span>Raccolta dati</span>
          </div>
          {wizardProgress && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'wizard2026Preview'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {wizardProgress}
            </span>
          )}
        </button>

        {/* 3. Costituzione (Accordion) */}
        <div>
          <button
            onClick={() => setCostituzioneExpanded(!costituzioneExpanded)}
            aria-expanded={costituzioneExpanded} aria-controls={`${navId}-${mode}-constitution`}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
              isCostituzioneActive && !costituzioneExpanded
                ? 'bg-red-50 dark:bg-red-950/30 text-[#cc4331]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Landmark className="w-4 h-4 shrink-0" />
              <span>Costituzione</span>
            </div>
            {costituzioneExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {costituzioneExpanded && (
            <div id={`${navId}-${mode}-constitution`} className="ml-7 pl-2 border-l border-slate-200 dark:border-slate-700 my-1 space-y-1">
              <button
                onClick={() => handleNav('fondoDipendenti')}
                className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  activeTab === 'fondoDipendenti'
                    ? 'font-bold text-[#cc4331] bg-red-50 dark:bg-red-950/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                data-testid="nav-costituzione-personale"
              >
                Personale
              </button>

              <button
                onClick={() => handleNav('fondoEQ')}
                className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  activeTab === 'fondoEQ'
                    ? 'font-bold text-[#cc4331] bg-red-50 dark:bg-red-950/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                data-testid="nav-costituzione-eq"
              >
                EQ
              </button>

              <button
                onClick={() => handleNav('fondoSegretario')}
                className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  activeTab === 'fondoSegretario'
                    ? 'font-bold text-[#cc4331] bg-red-50 dark:bg-red-950/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                data-testid="nav-costituzione-segretario"
              >
                Segretario
              </button>

              {hasDirigenza && (
                <button
                  onClick={() => handleNav('fondoDirigenza')}
                  className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    activeTab === 'fondoDirigenza'
                      ? 'font-bold text-[#cc4331] bg-red-50 dark:bg-red-950/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  data-testid="nav-costituzione-dirigenza"
                >
                  Dirigenza
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. Verifica */}
        <button
          onClick={() => handleNav('compliance')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
            activeTab === 'compliance'
              ? 'bg-[#cc4331] text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          data-testid="nav-verifica"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Verifica</span>
          </div>
          {criticalCount > 0 ? (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'compliance' ? 'bg-red-900 text-white' : 'bg-red-100 text-red-800'
            }`}>
              {criticalCount} criticità
            </span>
          ) : warningCount > 0 ? (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'compliance' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {warningCount} attenzioni
            </span>
          ) : null}
        </button>

        {/* 5. Distribuzione */}
        <button
          onClick={() => handleNav('distribuzioneRisorse')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
            activeTab === 'distribuzioneRisorse'
              ? 'bg-[#cc4331] text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          data-testid="nav-distribuzione"
        >
          <PieChart className="w-4 h-4 shrink-0" />
          <span>Distribuzione</span>
        </button>

        {/* 6. Documenti */}
        <button
          onClick={() => handleNav('reports')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
            activeTab === 'reports'
              ? 'bg-[#cc4331] text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          data-testid="nav-documenti"
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>Documenti</span>
        </button>

      </nav>

      {/* Footer link: Solo Toolbox (Tutti i Fondi è primario nella ContextBar) */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setScopeAndTab(NavigationScope.DASHBOARD, 'dashboard');
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          data-testid="sidebar-to-toolbox-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Torna alla Toolbox</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar (visibile solo >= 1024px) */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-full">
        {navContent('desktop')}
      </aside>

      {/* Drawer per Mobile e Tablet (< 1024px) */}
      {isOpenMobile && (
        <ModalSurface id={mobileMenuId} name="Sezioni del Fondo corrente" onClose={() => onCloseMobile?.()} className="z-50 lg:hidden">
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
            {navContent('mobile')}
          </aside>
        </div>
        </ModalSurface>
      )}
    </>
  );
};
