import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { NavigationScope } from '../../../types';
import { APP_NAME } from '../../../constants';
import { ArrowLeft } from 'lucide-react';

interface Wizard2026StandaloneLayoutProps {
  children: React.ReactNode;
}

export const Wizard2026StandaloneLayout: React.FC<Wizard2026StandaloneLayoutProps> = ({ children }) => {
  const { setScopeAndTab } = useAppContext();

  const handleReturnToDashboard = () => {
    window.history.pushState(null, '', '/');
    setScopeAndTab(NavigationScope.DASHBOARD, 'dashboard');
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      {/* Header Minimale */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo e Titolo Interattivo */}
            <div 
              onClick={handleReturnToDashboard}
              className="flex items-center gap-4 cursor-pointer hover:opacity-85 transition-opacity"
              data-testid="standalone-logo"
            >
              <img src="/logo.png" alt="FP CGIL Lombardia" className="h-12 w-auto object-contain" />
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              <div className="flex flex-col">
                <h1 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                  {APP_NAME}
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                  FP CGIL Lombardia
                </p>
              </div>
            </div>

            {/* Pulsante Torna alla Dashboard */}
            <button
              onClick={handleReturnToDashboard}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#cc4331] hover:bg-[#cc4331]/5 border border-[#cc4331]/20 rounded-xl transition duration-150"
              data-testid="back-to-dashboard-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna alla dashboard</span>
            </button>
            
          </div>
        </div>
      </header>

      {/* Contenuto Principale Centrato */}
      <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col">
        {children}
      </main>
    </div>
  );
};
