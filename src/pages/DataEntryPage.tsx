// pages/DataEntryPage.tsx
import React, { useState } from 'react';
import { Art23EmployeeAndIncrementForm } from '../components/dataInput/Art23EmployeeAndIncrementForm.tsx';
import { AnnualDataForm } from '../components/dataInput/AnnualDataForm.tsx';
import { EntityGeneralInfoForm } from '../components/dataInput/EntityGeneralInfoForm.tsx';
import { HistoricalDataForm } from '../components/dataInput/HistoricalDataForm.tsx';
import { Ccnl2024SettingsForm } from '../components/dataInput/Ccnl2024SettingsForm.tsx';
import { SimulatoreIncrementoForm } from '../components/dataInput/SimulatoreIncrementoForm.tsx';
import { Button } from '../components/shared/Button.tsx';
import { TEXTS_UI, INITIAL_HISTORICAL_DATA } from '../constants.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { TipologiaEnte } from '../enums.ts';
import { Alert } from '../components/shared/Alert.tsx';
import { Ccnl2024Settings } from '../types.ts';
import { VerticalStepper } from '../components/wizard/VerticalStepper.tsx';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const WIZARD_STEPS = [
  { id: 1, title: 'Dati Generali Ente', description: 'Informazioni sull\'ente e tipologia' },
  { id: 2, title: 'Dati Storici', description: 'Fondo 2016 e limiti storici' },
  { id: 3, title: 'CCNL Funzioni Locali 23.02.2026', description: 'Costituzione Fondo 2026 e Arretrati' },
  { id: 4, title: 'Dati Annuali', description: 'Personale e valori anno corrente' },
  { id: 5, title: 'Calcolo', description: 'Revisione e calcolo finale' }
];

export const DataEntryPage: React.FC = () => {
  const { state, dispatch, performFundCalculation } = useAppContext();
  const { isLoading, fundData, error, validationErrors } = state;
  const { tipologiaEnte } = fundData.annualData;
  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = async () => {
    await performFundCalculation();
  };

  const handleCcnlChange = (settings: Ccnl2024Settings) => {
    dispatch({
      type: 'UPDATE_ANNUAL_DATA',
      payload: { ccnl2024: settings }
    });
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const showSimulatoreAndArt23Form = tipologiaEnte === TipologiaEnte.COMUNE || tipologiaEnte === TipologiaEnte.PROVINCIA;

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length));
  };
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <EntityGeneralInfoForm />;
      case 2:
        return <HistoricalDataForm />;
      case 3:
        return (
          <Ccnl2024SettingsForm
            data={fundData.annualData.ccnl2024}
            onChange={handleCcnlChange}
            fondoLavoroStraordinario={fundData.annualData.fondoLavoroStraordinario}
            onFondoLavoroStraordinarioChange={(val) => dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { fondoLavoroStraordinario: val } })}
            incrementoFondoStraordinario={fundData.annualData.incrementoFondoStraordinario}
            onIncrementoFondoStraordinarioChange={(val) => dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { incrementoFondoStraordinario: val } })}
            riduzioneFondoParteStabile={fundData.annualData.riduzioneFondoParteStabile}
            onRiduzioneFondoParteStabileChange={(val) => dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { riduzioneFondoParteStabile: val } })}
            hasDirigenza={fundData.annualData.hasDirigenza}
          />
        );
      case 4:
        return (
          <>
            {showSimulatoreAndArt23Form && <Art23EmployeeAndIncrementForm />}
            <AnnualDataForm />
          </>
        );
      case 5:
        return (
          <>
            {showSimulatoreAndArt23Form && <SimulatoreIncrementoForm />}
            <div className="mt-8 p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pronti per il Calcolo</h3>
              <p className="text-gray-500 mb-6 max-w-lg mx-auto">
                Hai completato l'inserimento di tutti i dati necessari. Premi il pulsante qui sotto per generare il fondo e visualizzare i report.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full sm:w-auto px-8"
              >
                {isLoading ? TEXTS_UI.calculating : "Salva Dati e Calcola Fondo"}
              </Button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto min-h-[calc(100vh-140px)]">
      {/* Sidebar Stepper */}
      <aside className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 px-2">Passaggi</h3>
            <VerticalStepper
              steps={WIZARD_STEPS}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>

          {/* Use Sticky logic for validation summary if needed, but container is sticky */}
          {hasValidationErrors && (
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6 overflow-y-auto max-h-[300px]">
              <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                ⚠️ Attenzione
              </h4>
              <p className="text-xs text-red-700 mb-3">Ci sono dati mancanti che impediscono il calcolo:</p>
              <ul className="space-y-2">
                {Object.entries(validationErrors).map(([key, msg]) => {
                  const fieldName = key.split('.').pop() || key;
                  return (
                    <li key={key} className="text-xs text-red-600 border-l-2 border-red-300 pl-2">
                      <span className="font-semibold block">{fieldName}</span>
                      {msg}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header of Content Area */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{WIZARD_STEPS[currentStep - 1].title}</h2>
          <p className="text-gray-500 mt-1">{WIZARD_STEPS[currentStep - 1].description}</p>
        </div>

        {/* Global Alerts */}
        <div className="space-y-4 mb-6">
          {error && <Alert type="error" title="Errore" message={error} />}

          {(state.fundData.annualData.denominazioneEnte === "Comune di Esempio (Medie Dimensioni)" ||
            state.fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 === INITIAL_HISTORICAL_DATA.fondoSalarioAccessorioPersonaleNonDirEQ2016) && (
              <Alert
                type="warning"
                title="Dati di Esempio Caricati"
                message="Sono caricati dati di esempio. Sostituisci i valori con quelli reali del tuo ente."
              />
            )}
        </div>

        {/* Form Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-2 pb-10">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className={`flex items-center gap-2 ${currentStep === 1 ? 'invisible' : ''}`}
          >
            <ArrowLeft size={16} /> Indietro
          </Button>

          {currentStep < 5 && (
            <Button
              variant="primary"
              onClick={nextStep}
              disabled={isLoading}
              className="flex items-center gap-2 px-6"
            >
              Avanti <ArrowRight size={16} />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};
