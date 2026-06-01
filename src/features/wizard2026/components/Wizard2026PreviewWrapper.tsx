import React from 'react';
import { featureFlags } from '../featureFlag';
import { Wizard2026PreviewPage } from './Wizard2026PreviewPage';
import { FundConfigurationPreviewEntryPage } from '../entry/FundConfigurationPreviewEntryPage';
import { Wizard2026StandaloneLayout } from '../entry/Wizard2026StandaloneLayout';
import { AlertTriangle } from 'lucide-react';

export const Wizard2026PreviewWrapper: React.FC = () => {
  const [pathname, setPathname] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (newPath: string) => {
    window.history.pushState(null, '', newPath);
    setPathname(newPath);
  };

  if (!featureFlags.ENABLE_WIZARD_2026_PREVIEW) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center font-sans">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-bounce" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Accesso Non Consentito</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            Configurazione fondo (preview) non abilitata in questo ambiente.
          </p>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="px-6 py-2.5 bg-[#cc4331] text-white rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  // Se siamo sul percorso del wizard, visualizziamo la pagina del wizard
  const isWizardRoute = 
    pathname === '/configurazione-fondo-preview/raccolta-dati' || 
    pathname === '/wizard-2026-preview';

  return (
    <Wizard2026StandaloneLayout>
      {isWizardRoute ? (
        <Wizard2026PreviewPage />
      ) : (
        <FundConfigurationPreviewEntryPage 
          onNavigateToWizard={() => navigateTo('/configurazione-fondo-preview/raccolta-dati')} 
        />
      )}
    </Wizard2026StandaloneLayout>
  );
};

