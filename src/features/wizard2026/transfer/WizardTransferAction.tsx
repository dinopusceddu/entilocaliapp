import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { MonetaryDraftIssuesContext } from '../../../components/shared/MonetaryInput';
import { Wizard2026DraftState } from '../types';
import { withDl25FundContext } from '../dl25Contract';
import { validateWizard2026Transferable } from '../validation';
import { buildWizard2026TransferPreview } from './transferPreviewEngine';
import { applyWizard2026Transfer, createWizard2026TransferSnapshot } from './applyWizard2026Transfer';
import { Wizard2026TransferModal } from './Wizard2026TransferModal';
import { NavigationScope } from '../../../domain';
import { projectTransferAction, transferStatusLabel } from './transferAction';

type TransferSnapshot = NonNullable<import('../../../domain/types').FundData['wizard2026TransferSnapshot']>;
type SaveLastTransfer = (state: Wizard2026DraftState, input: TransferSnapshot['input'], computed: TransferSnapshot['computed'], plan: TransferSnapshot['transferPlan']) => void | Promise<void>;
const businessSignature = (state: Wizard2026DraftState) => JSON.stringify([state.ente, state.art23, state.dl25, state.ccnl2026, state.conglobamentoArt60, state.straordinario, state.pnrr]);

function useTransferController(draft: Wizard2026DraftState, onSaveLastTransfer?: SaveLastTransfer) {
  const { state: globalState, dispatch, saveState, setScopeAndTab } = useAppContext();
  const currentFundData = globalState.fundData;
  const state = useMemo(() => withDl25FundContext(draft, currentFundData), [draft, currentFundData]);
  const transferValidation = useMemo(() => validateWizard2026Transferable(state), [state]);
  const preview = useMemo(() => buildWizard2026TransferPreview(state, currentFundData, globalState.localSources), [state, currentFundData, globalState.localSources]);
  const monetaryDraftIssues = useContext(MonetaryDraftIssuesContext);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [completedSignature, setCompletedSignature] = useState<string | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const contextKey = JSON.stringify([globalState.currentUser?.id, globalState.currentEntity?.id, globalState.currentYear, globalState.calculationRuntime?.contextEpoch, globalState.fundData.metadata?.snapshotStatus]);
  const openContext = useRef<string | null>(null);
  const openSignature = useRef<string | null>(null);
  const liveContext = useRef(contextKey);
  liveContext.current = contextKey;
  const signature = businessSignature(state);
  const lastTransferKey = `fl_wizard2026_last_transfer_${globalState.currentUser?.id}_${globalState.currentEntity?.id}_${globalState.currentYear}`;
  let alreadyTransferred = completedSignature === contextKey + signature;
  try {
    const previous = JSON.parse(localStorage.getItem(lastTransferKey) || 'null');
    alreadyTransferred ||= !!currentFundData.wizard2026TransferSnapshot && previous?.wizardState && previous.year === globalState.currentYear && businessSignature(previous.wizardState) === signature;
  } catch { /* An unreadable presentation receipt cannot authorize an operation. */ }
  const action = projectTransferAction({ validation: transferValidation, entityName: globalState.currentEntity?.name,
    year: globalState.currentYear, draftYear: state.ente.annoRiferimento ?? 2026, hasUser: !!globalState.currentUser?.id,
    closed: currentFundData.metadata?.snapshotStatus === 'CLOSED', contextSwitching: globalState.isYearSwitching,
    monetaryDraftInvalid: monetaryDraftIssues.length > 0, transferring: isTransferring, alreadyTransferred });

  const handleConfirmTransfer = async () => {
    if (inFlight.current || !action.enabled) return;
    if (openContext.current !== contextKey || openSignature.current !== signature) { setTransferError('Il contesto è cambiato. Chiudi la conferma e verifica ente e annualità.'); return; }
    const origin = contextKey;
    inFlight.current = true;
    if (globalState.fundData?.metadata?.snapshotStatus === 'CLOSED') {
      inFlight.current = false;
      setTransferError('Annualità chiusa: trasferimento non consentito.');
      return;
    }

    const userId = globalState?.currentUser?.id;
    const entityId = globalState?.currentEntity?.id;
    const year = globalState.currentYear;

    if (!userId || !entityId) {
      inFlight.current = false;
      setTransferError('Contesto utente o ente non rilevato. Impossibile procedere.');
      return;
    }

    const successKey = `wizard2026_transfer_success_${userId}_${entityId}_${year}`;
    const snapshotKey = `wizard2026_transfer_snapshot_${userId}_${entityId}_${year}`;

    setIsTransferring(true);
    setTransferError(null);

    try {
      // 2. Calcola il payload aggiornato
      const updatedFundData = applyWizard2026Transfer(state, currentFundData, globalState.localSources);

      // Validate the transfer before serializing a user-controlled rollback snapshot.
      const snapshot = createWizard2026TransferSnapshot(currentFundData);
      sessionStorage.setItem(snapshotKey, JSON.stringify(snapshot));

      // 3. Salva remoto su user_app_state (attende completamento reale)
      const saved = await saveState(updatedFundData, undefined, year, globalState.currentEntity);
      if (!saved?.success) throw new Error(saved?.error || 'Trasferimento non salvato. Verifica i dati e riprova.');
      if (!mounted.current || liveContext.current !== origin) throw new Error('Il contesto è cambiato. Riapri il Fondo di origine per verificare il trasferimento.');

      // 4. Una volta andato a buon fine saveState, salviamo last_transfer (best-effort)
      const inputSnapshot = updatedFundData.wizard2026TransferSnapshot?.input || {};
      const computedSnapshot = updatedFundData.wizard2026TransferSnapshot?.computed || {};
      const transferPlanSnapshot = updatedFundData.wizard2026TransferSnapshot?.transferPlan || [];

      try {
        if (onSaveLastTransfer) {
          await onSaveLastTransfer(state, inputSnapshot, computedSnapshot, transferPlanSnapshot);
        } else {
          // Fallback legacy se non è passato
          const lastTransferKey = `fl_wizard2026_last_transfer_${userId}_${entityId}_${year}`;
          const lastTransferObj = {
            transferredAt: new Date().toISOString(),
            userId,
            entityId,
            year,
            wizardState: state,
            input: inputSnapshot,
            computed: computedSnapshot,
            transferPlan: transferPlanSnapshot
          };
          localStorage.setItem(lastTransferKey, JSON.stringify(lastTransferObj));
        }
      } catch (lastTransferErr) {
        console.warn("Errore non bloccante durante il salvataggio di last_transfer:", lastTransferErr);
      }

      if (!mounted.current || liveContext.current !== origin) throw new Error('Il contesto è cambiato. Riapri il Fondo di origine per verificare il trasferimento.');
      // 5. Applica gli aggiornamenti locali allo stato React
      dispatch({ type: 'IMPORT_FUND_DATA', payload: updatedFundData });

      // Registrazione sorgente wizard2026 per i campi importati con successo (stato READY)
      const localSourcesUpdates: Record<string, 'manual' | 'wizard2026'> = {};
      preview.items.forEach(item => {
        if (item.status === 'READY' && item.campoDestinazione) {
          localSourcesUpdates[item.campoDestinazione] = 'wizard2026';
        }
      });

      dispatch({
        type: 'UPDATE_LOCAL_SOURCES',
        payload: localSourcesUpdates
      });

      sessionStorage.setItem(successKey, 'true');
      setCompletedSignature(contextKey + signature);
      setIsTransferModalOpen(false);

      // Navigazione finale verso la sezione corretta
      window.history.pushState(null, '', '/');
      setScopeAndTab(NavigationScope.FONDO, 'fondoDipendenti');

    } catch (saveErr: unknown) {
      console.error("Errore durante il salvataggio dello stato:", saveErr);
      const errMsg = saveErr instanceof Error ? saveErr.message : String(saveErr);
      setTransferError(errMsg || "Errore sconosciuto nel salvataggio remoto.");
    } finally {
      inFlight.current = false;
      setIsTransferring(false);
    }
  };

  return { state, currentFundData, preview, transferValidation, action, isTransferModalOpen, isTransferring, transferError,
    open: () => { if (action.enabled) { setTransferError(null); openContext.current = contextKey; openSignature.current = signature; setIsTransferModalOpen(true); } },
    close: () => { if (!inFlight.current) setIsTransferModalOpen(false); }, confirm: handleConfirmTransfer };
}
export type WizardTransferController = ReturnType<typeof useTransferController>;
const TransferContext = createContext<WizardTransferController | null>(null);
export const useWizardTransfer = () => useContext(TransferContext);
export function WizardTransferProvider({ state, onSaveLastTransfer, children }: { state: Wizard2026DraftState; onSaveLastTransfer?: SaveLastTransfer; children: React.ReactNode }) {
  const transfer = useTransferController(state, onSaveLastTransfer);
  return <TransferContext.Provider value={transfer}>{children}
    {transfer.isTransferModalOpen && transfer.action.status !== 'CLOSED' && <Wizard2026TransferModal isOpen onClose={transfer.close}
      state={transfer.state} currentFundData={transfer.currentFundData} onConfirm={transfer.confirm}
      localSources={undefined} preview={transfer.preview} transferAction={transfer.action}
      isTransferring={transfer.isTransferring} transferError={transfer.transferError}
      transferValidation={transfer.transferValidation} isTransferBlocked={!transfer.action.enabled && !transfer.isTransferring} />}
  </TransferContext.Provider>;
}
export function TransferActionPanel({ transfer, entryPoint }: { transfer: WizardTransferController; entryPoint: string }) {
  const id = React.useId();
  const primary = entryPoint === 'step8' || transfer.state.meta.currentStep !== 8;
  return <section data-testid={`transfer-action-${entryPoint}`} data-transfer-status={transfer.action.status} className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 space-y-2">
    <div className="flex flex-wrap justify-between gap-1 text-xs"><span>{transfer.action.entityName} · {transfer.action.year ?? 'Anno da selezionare'}</span><strong>{transferStatusLabel[transfer.action.status]}</strong></div>
    <button type="button" disabled={!transfer.action.enabled} onClick={transfer.open} aria-describedby={id}
      className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold disabled:bg-slate-200 disabled:text-slate-600 ${primary ? 'bg-[#cc4331] border-transparent text-white' : 'bg-white border-slate-300 text-slate-800'}`}>
      {transfer.action.primaryAction}
    </button>
    <p id={id} className="text-xs">{transfer.action.reason}</p>
  </section>;
}
