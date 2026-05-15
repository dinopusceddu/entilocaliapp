import React from 'react';
import { WizardDataStatusPanel } from './WizardDataStatusPanel';
import { useAppContext } from '../../contexts/AppContext';
import { FileText, ArrowRight, ShieldCheck, Settings } from 'lucide-react';


interface ConfigurazioneFondoLandingProps {
  onStartWizard: () => void;
  onGoToTechnicalView: () => void;
}

export const ConfigurazioneFondoLanding: React.FC<ConfigurazioneFondoLandingProps> = ({
  onStartWizard,
  onGoToTechnicalView
}) => {
  const { state } = useAppContext();

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurazione iniziale del fondo</h1>
            <p className="text-gray-500 mt-1 max-w-2xl">
              Da questa sezione puoi inserire o verificare le informazioni di base necessarie alla costituzione del Fondo risorse decentrate. 
              Se i dati iniziali sono già stati caricati o completati, puoi accedere direttamente alla costituzione analitica del fondo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={onStartWizard}
            className="group p-6 bg-white border-2 border-gray-100 hover:border-blue-500 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>
              <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Accedi alle informazioni di base</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Avvia il percorso guidato per inserire, verificare o integrare i dati generali dell'ente, i dati storici e i parametri necessari alla costituzione del fondo.
            </p>
            <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm">
              Inizia Wizard <ArrowRight size={16} />
            </div>
          </div>

          <div 
            onClick={onGoToTechnicalView}
            className="group p-6 bg-white border-2 border-gray-100 hover:border-green-500 rounded-2xl cursor-pointer transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                <ShieldCheck size={24} />
              </div>
              <ArrowRight size={20} className="text-gray-300 group-hover:text-green-500 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Vai alla costituzione del fondo</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Accedi direttamente alla costituzione analitica del fondo se i dati iniziali sono già stati inseriti o se vuoi lavorare sulle voci tecniche.
            </p>
            <div className="mt-6 flex items-center gap-2 text-green-600 font-bold text-sm">
              Vai alla Costituzione <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>

      <WizardDataStatusPanel data={state.fundData} />

      <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
          <Settings size={20} />
        </div>
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">Nota metodologica</p>
          <p>
            Il percorso guidato è progettato per garantire la conformità al CCNL 2026 e ai controlli del D.L. 25/2025. 
            Completare tutti gli step del wizard assicura la massima attendibilità del calcolo finale.
          </p>
        </div>
      </div>
    </div>
  );
};
