import React from 'react';
import { useWizard2026Draft } from '../hooks/useWizard2026Draft';
import { Wizard2026Layout } from './Wizard2026Layout';
import { Wizard2026Stepper } from './Wizard2026Stepper';
import { Wizard2026SummaryPanel } from './Wizard2026SummaryPanel';
import { Wizard2026NavigationButtons } from './Wizard2026NavigationButtons';
import { Wizard2026SyncStatusBadge } from './Wizard2026SyncStatusBadge';
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
    syncStatus,
    lastRemoteSave,
    isSavingRemote,
    isOffline,
    uploadLocalDraft,
    downloadRemoteDraft,
    resolveSyncConflict,
    userEmail,
    lastHydrationSource,
  } = useWizard2026Draft();

  const [dismissedSync, setDismissedSync] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDismissedSync(null);
  }, [syncStatus]);

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
        <div className="mb-4 flex justify-end">
          <Wizard2026SyncStatusBadge
            status={syncStatus}
            isSaving={isSavingRemote}
            isOffline={isOffline}
            lastSave={lastRemoteSave}
            userEmail={userEmail}
            onSyncNow={() => {
              if (syncStatus === 'conflict') {
                resolveSyncConflict('remote');
              } else if (syncStatus === 'local_newer') {
                uploadLocalDraft();
              } else if (syncStatus === 'remote_newer') {
                downloadRemoteDraft();
              }
            }}
          />
        </div>

        {/* Notifica leggera sync cloud */}
        {syncStatus === 'synced' && lastHydrationSource === 'cloud' && (
          <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-emerald-800 text-xs flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>Bozza cloud caricata e sincronizzata.</span>
          </div>
        )}

        {/* Pannello Gestione Conflitti e Sincronizzazione */}
        {syncStatus !== 'disabled' && syncStatus !== 'synced' && dismissedSync !== syncStatus && (
          <div className="mb-6 rounded-xl border p-5 shadow-sm bg-white">
            {syncStatus === 'local_only' && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Bozza salvata solo locale</h4>
                  <p className="text-xs text-slate-500 mt-1">La bozza del Wizard 2026 è presente solo su questo dispositivo. Salvala nel cloud per renderla disponibile altrove.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={uploadLocalDraft}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Salva bozza nel cloud
                  </button>
                </div>
              </div>
            )}

            {syncStatus === 'local_newer' && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-amber-500 pl-4">
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">Bozza locale più recente</h4>
                  <p className="text-xs text-amber-700 mt-1">Hai apportato modifiche locali che non sono ancora state salvate sul cloud.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={uploadLocalDraft}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Aggiorna bozza cloud
                  </button>
                  <button
                    onClick={() => setDismissedSync('local_newer')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Continua solo localmente
                  </button>
                </div>
              </div>
            )}

            {syncStatus === 'remote_newer' && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-indigo-500 pl-4">
                <div>
                  <h4 className="text-sm font-semibold text-indigo-900">Bozza cloud più recente</h4>
                  <p className="text-xs text-indigo-700 mt-1">È presente una compilazione nel cloud più recente rispetto a quella su questo dispositivo.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={downloadRemoteDraft}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Scarica bozza cloud
                  </button>
                  <button
                    onClick={() => setDismissedSync('remote_newer')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Continua solo localmente
                  </button>
                </div>
              </div>
            )}

            {syncStatus === 'conflict' && (
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="text-sm font-semibold text-red-950">Conflitto di sincronizzazione rilevato</h4>
                <p className="text-xs text-red-800 mt-1">I dati di questo dispositivo e quelli nel cloud differiscono ed entrambi sono stati modificati. Scegli come procedere:</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => {
                      if (window.confirm("Attenzione: questa azione sostituirà completamente la bozza corrente su questo dispositivo con quella salvata nel cloud. Vuoi procedere?")) {
                        resolveSyncConflict('remote');
                      }
                    }}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Sostituisci bozza locale con quella cloud
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Attenzione: questa azione sovrascriverà la bozza salvata nel cloud con i dati correnti di questo dispositivo. Vuoi procedere?")) {
                        resolveSyncConflict('local');
                      }
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Sovrascrivi bozza cloud con quella locale
                  </button>
                  <button
                    onClick={() => setDismissedSync('conflict')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Continua temporaneamente offline
                  </button>
                </div>
              </div>
            )}

            {syncStatus === 'error' && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-red-400 pl-4 bg-red-50/50 p-3 rounded-r-lg">
                <div>
                  <h4 className="text-sm font-semibold text-red-900">Sincronizzazione non disponibile</h4>
                  <p className="text-xs text-red-700 mt-1">Non è stato possibile contattare il server cloud. Le modifiche verranno salvate solo localmente finché la connessione non sarà ripristinata.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Banner recupero bozza locale: non mostrare se il cloud ha già idratato.
            onHydrate() chiama setShowRecoveryBanner(false), ma per sicurezza
            aggiungiamo anche qui la condizione su lastHydrationSource. */}
        {showRecoveryBanner && lastHydrationSource !== 'cloud' && (

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
