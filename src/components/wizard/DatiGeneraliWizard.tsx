import React, { useState, useEffect } from 'react';
import { WizardStepper, Step } from './WizardStepper';
import { WizardNavigation } from './WizardNavigation';
import { WizardStepIdentificazioneEnte } from './steps/WizardStepIdentificazioneEnte';
import { WizardStepStrumentiRaccolta } from './steps/WizardStepStrumentiRaccolta';
import { WizardStepDatiStorici2016 } from './steps/WizardStepDatiStorici2016';
import { WizardStepDatiStorici2018 } from './steps/WizardStepDatiStorici2018';
import { WizardStepPlaceholder } from './steps/WizardStepPlaceholder';

import { useAppContext } from '../../contexts/AppContext';
import { FundData } from '../../domain/types';
import { Button } from '../shared/Button';
import { GraduationCap, Home, ShieldCheck } from 'lucide-react';



const STEPS: Step[] = [
  { id: 1, title: 'Identificazione Ente' },
  { id: 2, title: 'Strumenti Raccolta' },
  { id: 3, title: 'Storici 2016' },
  { id: 4, title: 'Storici 2018' },
  { id: 5, title: 'D.L. 25/2025' },
  { id: 6, title: 'CCNL 2026' },
  { id: 7, title: 'Personale' },
  { id: 8, title: 'Risorse Iniziali' },
  { id: 9, title: 'Coerenza' },
  { id: 10, title: 'Conferma' },
];

interface DatiGeneraliWizardProps {
    onSwitchToCompleteView: () => void;
    onBackToLanding: () => void;
}

export const DatiGeneraliWizard: React.FC<DatiGeneraliWizardProps> = ({ 
    onSwitchToCompleteView,
    onBackToLanding 
}) => {

  const { state, dispatch, saveState } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local draft state initialized from global fundData
  const [draftData, setDraftData] = useState<FundData>(() => JSON.parse(JSON.stringify(state.fundData)));

  // Sync draft if global state changes externally (e.g. from global ExcelTools if still present)
  // But we use local handlers for Step 2, so this is mainly for safety.
  useEffect(() => {
    // Optional: add logic to sync if global state changes significantly
  }, [state.fundData]);

  const handleDraftChange = (updates: Partial<FundData>) => {
    setDraftData(prev => {
        // Conservative merge to avoid overwriting nested objects unintentionally
        const newState = { ...prev };
        
        if (updates.annualData) {
            newState.annualData = { ...prev.annualData, ...updates.annualData };
        }
        if (updates.historicalData) {
            newState.historicalData = { ...prev.historicalData, ...updates.historicalData };
        }
        // Add other sections as they become managed by the wizard
        
        return newState;
    });
  };

  const handleImportCsv = (mappedData: Partial<FundData>) => {
    handleDraftChange(mappedData);
    alert('Dati CSV importati nel wizard. Verifica i campi negli step successivi.');
  };

  const handleImportExcel = (importedData: FundData) => {
    setDraftData(importedData);
    alert('Backup Excel caricato nel wizard.');
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
        // Conservative dispatch to global state
        // We only commit identifying data in this phase (Step 1 fields)
        dispatch({
            type: 'UPDATE_ANNUAL_DATA',
            payload: {
                denominazioneEnte: draftData.annualData.denominazioneEnte,
                annoRiferimento: draftData.annualData.annoRiferimento,
                tipologiaEnte: draftData.annualData.tipologiaEnte,
                altroTipologiaEnte: draftData.annualData.altroTipologiaEnte,
                numeroAbitanti: draftData.annualData.numeroAbitanti,
                hasDirigenza: draftData.annualData.hasDirigenza,
                fondoLavoroStraordinario: draftData.annualData.fondoLavoroStraordinario,
                manualDipendentiEquivalenti2018: draftData.annualData.manualDipendentiEquivalenti2018
            }
        });

        dispatch({
            type: 'UPDATE_HISTORICAL_DATA',
            payload: draftData.historicalData
        });

        
        // Use a small delay to ensure state update before save
        setTimeout(async () => {
            await saveState();
            setIsSaving(false);
            alert('Dati identificativi salvati con successo!');
        }, 100);
    } catch (error) {
        console.error('Save error:', error);
        setIsSaving(false);
        alert('Errore durante il salvataggio.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WizardStepIdentificazioneEnte 
            data={draftData} 
            onChange={handleDraftChange}
            validationErrors={state.validationErrors}
          />
        );
      case 2:
        return (
          <WizardStepStrumentiRaccolta 
            onImportCsv={handleImportCsv}
            onImportExcel={handleImportExcel}
          />
        );
      case 3:
        return (
          <WizardStepDatiStorici2016 
            data={draftData} 
            onChange={handleDraftChange}
            validationErrors={state.validationErrors}
          />
        );
      case 4:
        return (
          <WizardStepDatiStorici2018 
            data={draftData} 
            onChange={handleDraftChange}
            validationErrors={state.validationErrors}
          />
        );
      default:
        return (
          <WizardStepPlaceholder 
            stepNumber={currentStep} 
            title={STEPS[currentStep - 1].title} 
          />
        );

    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Wizard Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <GraduationCap size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Wizard Dati Generali</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Configurazione Ente</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={onBackToLanding}
                  className="flex items-center gap-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                  <Home size={16} />
                  Schermata Iniziale
              </Button>
              
              <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={onSwitchToCompleteView}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 border-none"
              >
                  <ShieldCheck size={16} />
                  Vai alla Costituzione Fondo
              </Button>
            </div>
          </div>

          
          <div className="mt-8">
            <WizardStepper 
                steps={STEPS} 
                currentStep={currentStep} 
                onStepClick={setCurrentStep} 
            />
          </div>
        </div>
      </div>

      {/* Wizard Body */}
      <main className="flex-1 max-w-[1000px] mx-auto w-full px-4 lg:px-8 py-8">
        <div className="animate-fadeIn">
            {renderStep()}
        </div>

        <WizardNavigation 
            currentStep={currentStep}
            totalSteps={STEPS.length}
            onPrev={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            onNext={() => setCurrentStep(prev => Math.min(prev + 1, STEPS.length))}
            onSaveDraft={handleSaveDraft}
            isSaving={isSaving}
        />
      </main>

      {/* Persistence Note */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 text-center text-xs text-gray-400 z-30">
        Le modifiche nel wizard vengono salvate solo cliccando su "Salva Dati Identificativi" o completando il percorso.
      </footer>
    </div>
  );
};
