import React from 'react';
import { useWizard2026Draft } from '../hooks/useWizard2026Draft';
import { Wizard2026Layout } from './Wizard2026Layout';
import { Wizard2026Stepper } from './Wizard2026Stepper';
import { Wizard2026SummaryPanel } from './Wizard2026SummaryPanel';
import { Wizard2026NavigationButtons } from './Wizard2026NavigationButtons';
import { Wizard2026DataRequestPanel } from '../letters';
import {
  Step1EnteCondizioni,
  Step2Art23Limite,
  Step3Dl25,
  Step4Ccnl2026,
  Step5ConglobamentoArt60,
  Step6Straordinario,
  Step7Pnrr,
  Step8RiepilogoPreview,
} from '../steps';

export const Wizard2026PreviewPage: React.FC = () => {
  const {
    state,
    currentStep,
    allChecks,
    blockingErrors,
    goNext,
    goPrevious,
    goToStep,
    resetWizard,
    updateEnte,
    updateArt23,
    updateDl25,
    updateCcnl2026,
    updateConglobamento,
    updateStraordinario,
    updatePnrr,
    importExcelData,
    showRecoveryBanner,
    showLastTransferBanner,
    restoreDraft,
    discardDraft,
    restoreLastTransfer,
    startNewCompilation,
    restoreError,
  } = useWizard2026Draft();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1EnteCondizioni
            state={state.ente}
            onChange={updateEnte}
            fullState={state}
            onImportExcel={importExcelData}
          />
        );
      case 2:
        return (
          <Step2Art23Limite
            state={state.art23}
            hasDirigenza={!!state.ente.hasDirigenza}
            onChange={updateArt23}
          />
        );
      case 3:
        return (
          <Step3Dl25
            state={state.dl25}
            entityType={state.ente.entityType}
            enteState={state.ente}
            onChange={updateDl25}
          />
        );
      case 4:
        return <Step4Ccnl2026 state={state.ccnl2026} enteState={state.ente} onChange={updateCcnl2026} />;
      case 5:
        return (
          <Step5ConglobamentoArt60
            state={state.conglobamentoArt60}
            annoRiferimento={state.ente.annoRiferimento}
            onChange={updateConglobamento}
          />
        );
      case 6:
        return (
          <Step6Straordinario
            state={state.straordinario}
            hasDirigenza={!!state.ente.hasDirigenza}
            margineArt23={state.art23.result?.margineArt23 || 0}
            onChange={updateStraordinario}
          />
        );
      case 7:
        return (
          <Step7Pnrr
            state={state.pnrr}
            hasDirigenza={!!state.ente.hasDirigenza}
            annoRiferimento={state.ente.annoRiferimento ?? 2026}
            hasApprovazioneCosfel={state.ente.hasApprovazioneCosfel}
            onChange={updatePnrr}
            onEnteChange={updateEnte}
          />
        );
      case 8:
        return <Step8RiepilogoPreview state={state} />;
      default:
        return null;
    }
  };

  return (
    <Wizard2026Layout
      stepper={
        <Wizard2026Stepper
          currentStep={currentStep}
          completedSteps={state.meta.completedSteps}
          allChecks={allChecks}
          onStepClick={goToStep}
        />
      }
      summaryPanel={<Wizard2026SummaryPanel state={state} />}
    >
      <div className="flex-1">
        {showRecoveryBanner && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-800 font-medium">
                Dati del Wizard 2026 ripristinati automaticamente dalla bozza locale.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={restoreDraft}
                  className="px-3 py-1.5 bg-[#cc4331] text-white rounded-lg text-xs font-semibold hover:bg-[#b23526] transition-colors"
                >
                  Nascondi avviso
                </button>
                <button
                  onClick={discardDraft}
                  className="px-3 py-1.5 bg-white border border-slate-350 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Scarta bozza
                </button>
              </div>
            </div>
            {restoreError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {restoreError}
              </div>
            )}
          </div>
        )}
        {showLastTransferBanner && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 font-medium">
                Dati del Wizard 2026 ripristinati automaticamente dall'ultimo trasferimento alla Costituzione Fondo.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={restoreLastTransfer}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Nascondi avviso
                </button>
                <button
                  onClick={startNewCompilation}
                  className="px-3 py-1.5 bg-white border border-slate-350 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Nuova compilazione
                </button>
              </div>
            </div>
            {restoreError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {restoreError}
              </div>
            )}
          </div>
        )}
        {renderCurrentStep()}
        <Wizard2026DataRequestPanel state={state} stepId={currentStep} />
      </div>
      <Wizard2026NavigationButtons
        currentStep={currentStep}
        onNext={goNext}
        onPrevious={goPrevious}
        onGoToSummary={() => goToStep(8)}
        onReset={resetWizard}
        hasErrors={blockingErrors.length > 0}
      />
    </Wizard2026Layout>
  );
};
