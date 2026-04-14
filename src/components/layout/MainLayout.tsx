// components/layout/MainLayout.tsx
import React, { useState } from 'react';
import { Header } from './Header.tsx';
import { Sidebar } from './Sidebar.tsx';
import { PageModule, NavigationScope } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Save } from 'lucide-react';

interface MainLayoutProps {
  modules: PageModule[];
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ modules, children, showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state, saveState } = useAppContext();
  const { activeTab } = state;
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await saveState();
      setSaveMessage({ text: 'Bozza salvata con successo!', type: 'success' });
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveMessage({ text: 'Errore nel salvataggio della bozza.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const activeModule = modules.find(m => m.id === activeTab);
  const pageTitle = activeModule ? activeModule.name : 'Home';
  
  let pageDescription = 'Gestione dei dati e delle risorse';
  if (activeModule?.id === 'fundDetails') {
    pageDescription = 'Dettaglio del fondo calcolato e riepilogo';
  } else if (state.navigationScope === 'NORMATIVA') {
    pageDescription = 'Consultazione coordinata del CCNL e supporto applicativo';
  } else if (state.navigationScope === 'COMUNICAZIONI') {
    pageDescription = 'Centro messaggi, notifiche e feedback di sistema';
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark overflow-x-hidden">
      <Header toggleSidebar={toggleSidebar} />

      {/* Page Title - hidden on dashboard */}
      {activeTab !== 'dashboard' && (
        <div className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark py-4">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-text-light dark:text-white tracking-tight">{pageTitle}</h2>
                <p className="text-sm text-subtext-light dark:text-subtext-dark mt-1">{pageDescription}</p>
              </div>
              <div className="flex items-center gap-4">
                {state.navigationScope !== NavigationScope.NORMATIVA && (
                  <>
                    {saveMessage && (
                      <span className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'} animate-fade-in`}>
                        {saveMessage.text}
                      </span>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <Save size={16} />
                      {isSaving ? 'Salvataggio...' : 'Salva Bozza'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden w-full max-w-[1600px] mx-auto">
        {showSidebar && <Sidebar modules={modules} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col flex-1 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
