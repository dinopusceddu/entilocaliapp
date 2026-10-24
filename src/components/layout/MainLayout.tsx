import React, { useState } from 'react';
import { Header } from './Header.tsx';
import { Sidebar } from './Sidebar.tsx';
import { NavigationScope } from '../../types.ts';
import { AppModule } from '../../application/registry/moduleRegistry';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { AreaFondoContextBar } from '../areaFondo/AreaFondoContextBar';
import { AreaFondoSidebar } from '../areaFondo/AreaFondoSidebar';
import { Save } from 'lucide-react';

interface MainLayoutProps {
  modules: AppModule[];
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ modules, children, showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mobileMenuId = React.useId();
  const { state, saveState, persistence } = useAppContext();
  const { activeTab } = state;
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isClosed = state.fundData?.metadata?.snapshotStatus === 'CLOSED';

  const handleSave = async () => {
    if (isClosed || persistence.blocked || persistence.busy) {
      setSaveMessage({ text: persistence.message || (isClosed ? 'Annualità chiusa: modifiche non consentite.' : 'Attendi il completamento della richiesta.'), type: 'error' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await saveState();
      if (!res?.success) {
        setSaveMessage({
          text: res?.error || 'Errore nel salvataggio della bozza.',
          type: 'error'
        });
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage({ text: res.noWrite ? 'Nessuna modifica da salvare.' : 'Bozza salvata con conferma del server.', type: 'success' });
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      setSaveMessage({ text: error?.message || 'Errore nel salvataggio della bozza.', type: 'error' });
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const activeModule = modules.find(m => m.id === activeTab);
  const pageTitle = activeModule?.title || activeModule?.name || 'Home';
  
  let pageDescription = activeModule?.description || 'Gestione dei dati e delle risorse';
  if (!activeModule?.description) {
    if (state.navigationScope === 'NORMATIVA') {
      pageDescription = 'Consultazione coordinata del CCNL e supporto applicativo';
    } else if (state.navigationScope === 'COMUNICAZIONI') {
      pageDescription = 'Centro messaggi, notifiche e feedback di sistema';
    }
  }

  const isFondoScope = state.navigationScope === NavigationScope.FONDO;
  const isFondiEnti = isFondoScope && activeTab === 'fondiEnti';

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark overflow-x-clip">
      <Header toggleSidebar={toggleSidebar} />

      {/* Area Fondo Context Bar (se siamo in Area Fondo su un fondo attivo) */}
      {isFondoScope && !isFondiEnti && (
        <AreaFondoContextBar onToggleMobileMenu={() => setSidebarOpen(true)} mobileMenuOpen={sidebarOpen} mobileMenuId={mobileMenuId} />
      )}

      {/* Page Title - hidden on dashboard and Cabina di regia / fondiEnti */}
      {activeTab !== 'dashboard' && !(isFondoScope && (activeTab === 'home' || activeTab === 'fondiEnti')) && (
        <div className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark py-2 sm:py-4">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-between items-end">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-text-light dark:text-white tracking-tight">{pageTitle}</h2>
                <p className="hidden sm:block text-sm text-subtext-light dark:text-subtext-dark mt-1">{pageDescription}</p>
              </div>
              <div className="flex items-center gap-4">
                {state.navigationScope !== NavigationScope.NORMATIVA && activeTab !== 'wizard2026Preview' && (
                  <>
                    {saveMessage && (
                      <span className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'} animate-fade-in`}>
                        {saveMessage.text}
                      </span>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={isSaving || isClosed || persistence.blocked || persistence.busy}
                      data-testid="save-draft-btn"
                      title={isClosed ? 'Annualità chiusa (sola lettura)' : undefined}
                      className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2 ${
                        isClosed
                          ? 'bg-slate-400 dark:bg-slate-600 text-white opacity-70 cursor-not-allowed'
                          : isSaving
                            ? 'bg-primary text-white opacity-70 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary-dark text-white'
                      }`}
                    >
                      <Save size={16} />
                      {isClosed ? 'Annualità Chiusa' : (isSaving ? 'Salvataggio...' : 'Salva Bozza')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-w-0 overflow-hidden w-full max-w-[1600px] mx-auto">
        {isFondoScope ? (
          !isFondiEnti && <AreaFondoSidebar isOpenMobile={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} mobileMenuId={mobileMenuId} />
        ) : (
          showSidebar && <Sidebar modules={modules} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        )}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex flex-col flex-1 min-w-0 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
