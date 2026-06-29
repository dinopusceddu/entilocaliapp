import React, { useState } from 'react';
import { Wizard2026DraftState } from '../types';
import { selectWizard2026BlockingErrors, selectWizard2026Warnings } from '../selectors';
import { Wizard2026StepHeader } from '../components';
import { 
  AlertCircle, CheckCircle2, Info, FileText, LayoutGrid, Scale, 
  ShieldAlert, Award, FileSpreadsheet, Activity, Flame, HelpCircle,
  ChevronDown, ChevronUp, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Wizard2026LetterMode } from '../letters/wizard2026LetterTypes';
import { Wizard2026DataRequestModal } from '../letters/components/Wizard2026DataRequestModal';
import { useAppContext } from '../../../contexts/AppContext';
import { 
  buildWizard2026TransferPreview, 
  Wizard2026TransferStatus, 
  Wizard2026TransferCategory 
} from '../transfer/transferPreviewEngine';
import { Wizard2026TransferModal } from '../transfer/Wizard2026TransferModal';
import { applyWizard2026Transfer, createWizard2026TransferSnapshot } from '../transfer/applyWizard2026Transfer';
import { NavigationScope } from '../../../domain';

export interface Step8RiepilogoPreviewProps {
  state: Wizard2026DraftState;
  onSaveLastTransfer?: (wizardState: Wizard2026DraftState, input: any, computed: any, transferPlan: any[]) => void;
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  COMUNE: 'Comune',
  PROVINCIA: 'Provincia',
  CITTA_METROPOLITANA: 'Città Metropolitana',
  UNIONE_COMUNI: 'Unione di Comuni',
  COMUNITA_MONTANA: 'Comunità Montana',
  REGIONE: 'Regione',
  ALTRO: 'Altro Ente Locale',
};

export const Step8RiepilogoPreview: React.FC<Step8RiepilogoPreviewProps> = ({ state, onSaveLastTransfer }) => {
  const { state: globalState, dispatch, saveState, setScopeAndTab } = useAppContext();
  const currentFundData = globalState.fundData;

  const [modalMode, setModalMode] = useState<Wizard2026LetterMode | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const handleConfirmTransfer = async () => {
    if (isTransferring) return;
    if (globalState.fundData?.metadata?.snapshotStatus === 'CLOSED') {
      alert("Impossibile completare il trasferimento: l'annualità è chiusa (CLOSED).");
      return;
    }

    const userId = globalState?.currentUser?.id;
    const entityId = globalState?.currentEntity?.id;
    const year = globalState?.currentYear || 2026;

    if (!userId || !entityId) {
      alert("Contesto utente o ente non rilevato. Impossibile procedere.");
      return;
    }

    const successKey = `wizard2026_transfer_success_${userId}_${entityId}_${year}`;
    const snapshotKey = `wizard2026_transfer_snapshot_${userId}_${entityId}_${year}`;

    setIsTransferring(true);
    setTransferError(null);

    // 1. Prepara il rollback snapshot prima della chiamata remota
    const snapshot = createWizard2026TransferSnapshot(currentFundData);
    sessionStorage.setItem(snapshotKey, JSON.stringify(snapshot));

    try {
      // 2. Calcola il payload aggiornato
      const updatedFundData = applyWizard2026Transfer(state, currentFundData, globalState.localSources);

      // 3. Salva remoto su user_app_state (attende completamento reale)
      await saveState(updatedFundData, undefined, year, globalState.currentEntity);

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
      setIsTransferModalOpen(false);

      // Navigazione finale verso la sezione corretta
      window.history.pushState(null, '', '/');
      setScopeAndTab(NavigationScope.FONDO, 'fondoDipendenti');

    } catch (saveErr: any) {
      console.error("Errore durante il salvataggio dello stato:", saveErr);
      const errMsg = saveErr instanceof Error ? saveErr.message : String(saveErr);
      setTransferError(errMsg || "Errore sconosciuto nel salvataggio remoto.");
    } finally {
      setIsTransferring(false);
    }
  };

  const errors = selectWizard2026BlockingErrors(state);
  const warnings = selectWizard2026Warnings(state);
  const preview = buildWizard2026TransferPreview(state, currentFundData, globalState.localSources);

  const formatEur = (val?: number | null) => {
    if (val === null || val === undefined) return 'n/d';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const formatFte = (val?: number | null) => {
    if (val === null || val === undefined) return 'n/d';
    return new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const formatBoolean = (val?: boolean | null) => {
    if (val === null || val === undefined) return 'n/d';
    return val ? 'Sì' : 'No';
  };

  const getStatusBadge = (status: Wizard2026TransferStatus) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-50 text-green-700 border border-green-200">
            Pronto al trasferimento
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-850 border border-amber-300 font-sans">
            ⚠️ Valore modificato manualmente (non sovrascritto)
          </span>
        );
      case 'REQUIRES_CONFIRMATION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-sans">
            Richiede conferma importo effettivo
          </span>
        );
      case 'CONTROL_ONLY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Solo controllo
          </span>
        );
      case 'NOT_APPLICABLE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            Non applicabile
          </span>
        );
      case 'MISSING_DATA':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-[#cc4331] border border-red-100">
            Dati mancanti nel wizard
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-[#A83226] border border-red-300">
            Bloccato per errori
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryLabel = (cat: Wizard2026TransferCategory) => {
    switch (cat) {
      case 'FONDO_DIPENDENTI_PARTE_STABILE': return 'Fondo dipendenti, parte stabile';
      case 'FONDO_DIPENDENTI_PARTE_VARIABILE': return 'Fondo dipendenti, parte variabile';
      case 'ELEVATE_QUALIFICAZIONI': return 'Risorse Elevate Qualificazioni';
      case 'FONDO_DIRIGENTI': return 'Fondo dirigenti';
      case 'CONFIGURAZIONE_ANNUALE': return 'Configurazione annuale';
      case 'SOLO_CONTROLLO': return 'Controlli e limiti';
      case 'NON_TRASFERIBILE': return 'Non trasferibile';
      default: return cat;
    }
  };

  const getRilevanzaLabel = (ril: string) => {
    switch (ril) {
      case 'DENTRO_LIMITE': return 'Dentro limite Art. 23';
      case 'FUORI_LIMITE': return 'Escluso da limite Art. 23';
      case 'COMPUTO_FIGURATIVO': return 'Computo figurativo';
      case 'SOLO_CONTROLLO': return 'Controllo tetto massimo';
      case 'NON_RILEVANTE': return 'Non rilevante ai fini Art. 23';
      default: return ril;
    }
  };

  const formatPreviewValue = (val: any) => {
    if (val === null || val === undefined) return 'n/d';
    if (typeof val === 'number') return formatEur(val);
    if (typeof val === 'boolean') return val ? 'Sì' : 'No';
    return String(val);
  };

  const formatDifference = (diff?: number) => {
    if (diff === undefined || isNaN(diff)) return null;
    const absDiff = Math.abs(diff);
    if (absDiff < 0.01) return <span className="text-slate-500 font-mono">(=)</span>;
    if (diff > 0) return <span className="text-green-700 font-mono font-semibold">+{formatEur(diff)}</span>;
    return <span className="text-red-650 font-mono font-semibold">-{formatEur(absDiff)}</span>;
  };

  // Sezione 1: Quadro generale dell'ente
  const renderQuadroEnte = () => {
    const { entityType, denominazioneEnte, annoRiferimento, hasDirigenza, isDissesto, isStrutturalmenteDeficitario, isPianoRiequilibrio, hasApprovazioneCosfel } = state.ente;
    
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <LayoutGrid className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">1. Quadro generale dell'ente</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Anno di riferimento:</span>
            <span className="font-bold text-slate-800 text-sm">{annoRiferimento ?? 'n/d'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Denominazione Ente:</span>
            <span className="font-bold text-slate-800 text-sm truncate block" title={denominazioneEnte}>{denominazioneEnte || 'n/d'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tipologia Ente:</span>
            <span className="font-bold text-slate-800 text-sm">{entityType ? (ENTITY_TYPE_LABELS[entityType] || entityType) : 'n/d'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Personale Dirigente:</span>
            <span className="font-bold text-slate-800 text-sm">{hasDirigenza === undefined ? 'n/d' : (hasDirigenza ? 'Presente' : 'Assente')}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Ente in Dissesto:</span>
            <span className="font-bold text-slate-800 text-sm">{formatBoolean(isDissesto)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Deficitarietà Strutturale:</span>
            <span className="font-bold text-slate-800 text-sm">{formatBoolean(isStrutturalmenteDeficitario)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Piano di Riequilibrio:</span>
            <span className="font-bold text-slate-800 text-sm">{formatBoolean(isPianoRiequilibrio)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Stato autorizzazione COSFEL:</span>
            <span className="font-bold text-slate-800 text-sm">
              {isStrutturalmenteDeficitario || isDissesto || isPianoRiequilibrio ? (
                hasApprovazioneCosfel === undefined ? 'n/d (Richiesta verifica)' : (hasApprovazioneCosfel ? 'Acquisita' : 'Non acquisita / Preclusiva')
              ) : (
                'Non richiesta per questo ente'
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Sezione 2: Limite Art. 23, comma 2, D.Lgs. 75/2017
  const renderArt23 = () => {
    const res = state.art23.result;
    const base2016 = state.art23.limite2016CertificatoEnte;
    
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Scale className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">2. Limite Art. 23, comma 2, D.Lgs. 75/2017</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Limite storico 2016 (certificato/asseverato):</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(base2016)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Adeguamento valore medio pro capite:</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(res?.incrementoProCapiteLimite)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Dipendenti equivalenti (FTE 2018 / 2026):</span>
            <span className="font-bold text-slate-800 text-sm">
              {res ? `${formatFte(res.dipendentiEquivalenti2018)} / ${formatFte(res.dipendentiEquivalenti2026)}` : 'n/d'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Valore medio pro-capite 2018:</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(res?.valoreMedioProCapite2018)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Fondo certificato parte stabile 2018:</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(state.art23.fondoCertificatoParteStabile2018)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Incremento stabile aumento personale (Art. 79 c. 1 lett. c):</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(res?.incrementoStabileAumentoPersonale)}</span>
          </div>
          <div className="md:col-span-1">
            <span className="text-slate-500 block">Limite complessivo attualizzato Art. 23:</span>
            <span className="font-bold text-green-700 text-base font-mono">{formatEur(res?.limiteArt23Attualizzato)}</span>
          </div>
        </div>
        <div className="bg-[#FFF4F2] p-3 rounded-lg border border-[#FCE7E2] text-slate-700 text-[11px] leading-relaxed">
          <strong>Nota esplicativa:</strong> Questo valore rappresenta il limite complessivo ordinario del trattamento accessorio, salvo risorse espressamente escluse o derogatorie.
        </div>
      </div>
    );
  };

  // Sezione 3: D.L. 25/2025
  const renderDl25 = () => {
    const res = state.dl25.result;
    
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldAlert className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">3. D.L. 25/2025 (Capacità assunzionale e incremento fondi)</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Soglia massima teorica (4,8% stipendi 2023):</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(res?.soglia48)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Risorse 2025 da sottrarre:</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(res?.risorse2025DaSottrarre)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Eventuale quota trasferita da altri enti:</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(res?.quotaTrasferitaAderenti)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Requisiti di applicabilità e virtuosità:</span>
            <span className={`font-bold text-sm ${res?.isApplicabileDirettamente ? 'text-green-700' : 'text-amber-700'}`}>
              {res ? (res.isApplicabileDirettamente ? 'Soddisfatti (Applicazione diretta)' : 'Da verificare / Limitata') : 'n/d'}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-500 block">Limite massimo teoricamente attivabile:</span>
            <span className="font-bold text-[#cc4331] text-base font-mono">{formatEur(res?.limiteMassimoDL25)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Importo D.L. 25/2025 da applicare al Fondo:</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(state.dl25.incrementoApplicato ?? 0)}</span>
          </div>
        </div>
        <div className="bg-[#FFF4F2] p-3 rounded-lg border border-[#FCE7E2] text-slate-700 text-[11px] leading-relaxed">
          <strong>Nota esplicativa:</strong> Il valore rappresenta la capacità massima teoricamente attivabile. L’importo effettivo da iscrivere sarà scelto nella fase di Costituzione del Fondo.
        </div>
      </div>
    );
  };

  // Sezione 4: Incrementi CCNL 23.02.2026
  const renderCcnl2026 = () => {
    const res = state.ccnl2026.result;
    
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Award className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">4. Incrementi CCNL 23.02.2026</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="text-slate-500 block font-semibold">Incremento 0,14% — parte stabile</span>
            <span className="font-bold text-slate-850 text-sm font-mono block">{formatEur(res?.incrementoStabile014)}</span>
            <span className="text-[10px] text-slate-400 block">Formula: Monte salari 2021 × 0,14% × 1</span>
            <span className="text-[10px] text-slate-600 block">Destinazione: parte stabile del Fondo risorse decentrate.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="text-slate-500 block font-semibold">Arretrati 0,14% — parte variabile una tantum</span>
            <span className="font-bold text-slate-850 text-sm font-mono block">{formatEur(res?.arretrati014)}</span>
            <span className="text-[10px] text-slate-400 block">Formula: Monte salari 2021 × 0,14% × 2</span>
            <span className="text-[10px] text-slate-600 block">Destinazione: parte variabile una tantum del Fondo.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="text-slate-500 block font-semibold">Limite massimo incremento 0,22%</span>
            <span className="font-bold text-slate-850 text-sm font-mono block">{formatEur(res?.limiteMassimo022)}</span>
            <span className="text-[10px] text-slate-400 block">
              Formula: {state.ente.annoRiferimento === 2026 ? 'Monte salari 2021 × 0,22% × 2 (per il 2026)' : 'Monte salari 2021 × 0,22% × 1 (dal 2027)'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="text-slate-500 block font-semibold">Incremento 0,22% scelto per l'anno</span>
            <span className="font-bold text-blue-700 text-sm font-mono block">{formatEur(res?.incremento022Anno)}</span>
            <span className="text-[10px] text-slate-600 block">Quota complessiva richiesta per l'esercizio.</span>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg space-y-1">
            <span className="text-blue-900 block font-semibold">Quota 0,22% destinata al Fondo risorse decentrate</span>
            <span className="font-bold text-blue-900 text-sm font-mono block">{formatEur(res?.incremento022Fondo)}</span>
            <span className="text-[10px] text-blue-700 block">Quota calcolata in base al riparto proporzionale tra FRD 2024 e risorse EQ 2024.</span>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg space-y-1">
            <span className="text-blue-900 block font-semibold">Quota 0,22% destinata alle Elevate Qualificazioni</span>
            <span className="font-bold text-blue-900 text-sm font-mono block">{formatEur(res?.incremento022EQ)}</span>
            <span className="text-[10px] text-blue-700 block font-sans">Quota calcolata in base al riparto proporzionale tra FRD 2024 e risorse EQ 2024.</span>
          </div>
        </div>
      </div>
    );
  };

  // Sezione 5: Conglobamento indennità di comparto — Art. 60
  const renderConglobamento = () => {
    const res = state.conglobamentoArt60.result;
    const mode = state.conglobamentoArt60.mode;
    const isPost2026 = (state.ente.annoRiferimento ?? 2026) > 2026;
    
    let statoDato = '';
    if (mode === 'manual') {
      statoDato = 'Inserito manualmente con motivazione';
    } else if (isPost2026) {
      statoDato = 'Consolidato dall\'anno 2026';
    } else {
      statoDato = 'Calcolato analiticamente sul personale al 1° gennaio 2026';
    }

    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileSpreadsheet className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">5. Conglobamento indennità di comparto — Art. 60</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Riduzione totale Art. 60:</span>
            <span className="font-bold text-red-600 text-sm font-mono">-{formatEur(res?.riduzioneTotale)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Origine/Stato del dato:</span>
            <span className="font-bold text-slate-800 text-sm">{statoDato}</span>
          </div>
          {mode === 'manual' && state.conglobamentoArt60.notaManuale && (
            <div className="md:col-span-2 bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block font-semibold">Motivazione correzione manuale:</span>
              <span className="text-slate-700 italic font-sans">{state.conglobamentoArt60.notaManuale}</span>
            </div>
          )}
        </div>
        <div className="bg-[#FFF4F2] p-3 rounded-lg border border-[#FCE7E2] text-slate-700 text-[11px] leading-relaxed">
          <strong>Spiegazione obbligatoria:</strong> Il valore è determinato con riferimento al personale utile al 1° gennaio 2026. Dal 2027 in poi non viene ricalcolato sul personale corrente, ma viene trascinato come valore consolidato 2026, salvo correzione manuale motivata.
        </div>
      </div>
    );
  };

  // Sezione 6: Fondo per il lavoro straordinario
  const renderStraordinario = () => {
    const res = state.straordinario.result;
    const riduzioneStabile = state.straordinario.riduzioneStabileStraordinarioArt67;
    const economie = state.straordinario.economieStraordinarioCertificate;
    
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Activity className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">6. Fondo per il lavoro straordinario</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Fondo straordinario ordinario residuo (soggetto Art. 23):</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(res?.fondoStraordinarioOrdinarioResiduo)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Riduzione stabile (Art. 67 CCNL 2018 per FRD):</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(riduzioneStabile)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Economie certificate da riversare nel Fondo:</span>
            <span className="font-bold text-green-700 text-sm font-mono">{formatEur(economie)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Risorse escluse o derogatorie Art. 23:</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(res?.totaleStraordinarioEsclusoArt23)}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-500 block">Straordinario finale risultante (soggetto Art. 23):</span>
            <span className="font-bold text-slate-900 text-sm font-mono">{formatEur(res?.straordinarioOrdinarioFinaleSoggettoArt23)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Sezione 7: Incremento PNRR
  const renderPnrr = () => {
    const res = state.pnrr.result;
    
    if (res?.isApplicabile === false) {
      return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Flame className="w-5 h-5 text-slate-400" />
            <h5 className="font-semibold text-slate-400 text-sm uppercase tracking-wider">7. Incremento PNRR (Art. 8, comma 3, D.L. 13/2023)</h5>
          </div>
          <div className="text-slate-400 italic text-sm">Non applicabile (l'ente non è soggetto attuatore PNRR).</div>
        </div>
      );
    }

    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Flame className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">7. Incremento PNRR (Art. 8, comma 3, D.L. 13/2023)</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Limite massimo PNRR Fondo dipendenti:</span>
            <span className="font-bold text-slate-850 text-sm font-mono">
              {res?.isValidable ? formatEur(res.limiteMassimoPnrrFondoDipendenti) : 'n/d'}
            </span>
          </div>
          {state.ente.hasDirigenza && (
            <div>
              <span className="text-slate-500 block">Limite massimo PNRR Fondo dirigenza:</span>
              <span className="font-bold text-slate-850 text-sm font-mono">
                {res?.isValidable ? formatEur(res.limiteMassimoPnrrFondoDirigenza) : 'n/d'}
              </span>
            </div>
          )}
          <div>
            <span className="text-slate-500 block">Totale massimo teorico PNRR (a fini conoscitivi):</span>
            <span className="font-bold text-green-700 text-sm font-mono">
              {res?.isValidable ? formatEur(res.totaleLimiteMassimoPnrr) : 'n/d'}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-500 block">Trattamento ai fini dell'Art. 23:</span>
            <span className="font-bold text-green-700 text-sm">Risorsa variabile espressamente esclusa dal limite Art. 23, comma 2, D.Lgs. 75/2017.</span>
          </div>
        </div>
      </div>
    );
  };

  // Sezione 8: Esiti istruttori finali
  const renderEsitiIstruttori = () => {
    const totalErrors = errors.length;
    const totalWarnings = warnings.length;

    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <HelpCircle className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">8. Esiti istruttori finali</h5>
        </div>
        <div className="space-y-4 text-xs">
          <div className="flex flex-wrap gap-4">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-3">
              {totalErrors > 0 ? (
                <div className="w-2.5 h-2.5 rounded-full bg-red-650 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-650" />
              )}
              <div>
                <span className="text-slate-500 block text-[10px]">Errori bloccanti:</span>
                <span className={`font-bold text-sm ${totalErrors > 0 ? 'text-red-650' : 'text-green-700'}`}>{totalErrors}</span>
              </div>
            </div>
            
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-3">
              {totalWarnings > 0 ? (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-650" />
              )}
              <div>
                <span className="text-slate-500 block text-[10px]">Segnalazioni / Warning:</span>
                <span className={`font-bold text-sm ${totalWarnings > 0 ? 'text-amber-600' : 'text-green-700'}`}>{totalWarnings}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-3">
              <Info className="w-4 h-4 text-blue-500" />
              <div>
                <span className="text-slate-500 block text-[10px]">Stato complessivo:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {totalErrors > 0 ? 'Istruttoria con errori' : totalWarnings > 0 ? 'Istruttoria valida con warning' : 'Istruttoria validata con successo'}
                </span>
              </div>
            </div>
          </div>

          {(totalErrors > 0 || totalWarnings > 0) && (
            <div className="space-y-2 pt-2">
              <span className="font-semibold text-slate-700 block">Dettaglio anomalie e controlli normativi:</span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {errors.map((c, i) => (
                  <div key={`err-${i}`} className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-[#cc4331] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[10px] text-red-900 uppercase tracking-wider">{c.step} {c.norma ? `— ${c.norma}` : ''}</span>
                      <p className="mt-0.5">{c.message}</p>
                    </div>
                  </div>
                ))}
                {warnings.map((c, i) => (
                  <div key={`warn-${i}`} className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex gap-2">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[10px] text-amber-900 uppercase tracking-wider">{c.step} {c.norma ? `— ${c.norma}` : ''}</span>
                      <p className="mt-0.5">{c.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Sezione 9: Anteprima trasferimento alla Costituzione Fondo
  const renderAnteprimaTrasferimento = () => {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <RefreshCw className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
            Anteprima trasferimento alla Costituzione Fondo
          </h5>
        </div>

        {/* Box informativo */}
        <div className="bg-[#FFF4F2] p-4 rounded-lg border border-[#FCE7E2] text-slate-750 text-xs space-y-2 leading-relaxed">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#cc4331] flex-shrink-0 mt-0.5" />
            <div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li><strong>Trasferimento reale:</strong> all'avvio della procedura i dati saranno applicati alla Costituzione dei fondi. Le modifiche sono conservate nella bozza locale e potranno essere salvate definitivamente sul database con l'apposita funzione di salvataggio.</li>
                <li><strong>Tipologia di dati:</strong> alcuni valori sono importi effettivi pronti al trasferimento, altri rappresentano solo tetti massimi (D.L. 25/2025, PNRR) o dati di controllo (tetto Art. 23).</li>
                <li><strong>Gestione sovrascritture:</strong> controlla i dettagli tecnici per verificare se i parametri istruttori annuali sono allineati per evitare ricalcoli legacy.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lista di card responsive */}
        <div className="space-y-4 pt-2">
          {preview.items.map((item) => {
            const isExpanded = !!expandedItems[item.id];
            
            return (
              <div 
                key={item.id}
                className="border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-colors bg-white text-xs"
              >
                {/* Intestazione della card */}
                <div className="p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-850 text-sm">{item.etichetta}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                      Destinazione: {getCategoryLabel(item.categoria)}
                    </span>
                  </div>
                  
                  {/* Valori e Delta */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-white px-3 py-2 rounded-lg border border-slate-150 md:self-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Valore Attuale</span>
                      <span className="font-bold text-slate-700 font-mono">
                        {formatPreviewValue(item.valoreAttuale)}
                      </span>
                    </div>
                    
                    <div className="border-l border-slate-200 h-6 hidden sm:block" />
                    
                    <div>
                      <span className="text-[10px] text-slate-500 block">Proposto</span>
                      <span className="font-bold text-[#cc4331] font-mono">
                        {formatPreviewValue(item.valoreProposto)}
                      </span>
                    </div>

                    {item.valoreAttuale !== null && item.valoreProposto !== null && (
                      <>
                        <div className="border-l border-slate-200 h-6 hidden sm:block" />
                        <div>
                          <span className="text-[10px] text-slate-500 block">Variazione</span>
                          <span className="font-mono">
                            {formatDifference(item.differenza)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Corpo della card */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 font-semibold block mb-0.5">Spiegazione ed effetto:</span>
                      <p className="text-slate-700 leading-relaxed font-sans">{item.spiegazioneUtente}</p>
                      {item.descrizione && (
                        <p className="text-slate-400 text-[10px] mt-1 italic font-sans">{item.descrizione}</p>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block mb-0.5">Limite Art. 23, comma 2:</span>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-slate-200/80 rounded font-bold text-[9px] text-slate-800">
                            {getRilevanzaLabel(item.rilevanzaArt23)}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[10px] font-sans">{item.notaArt23}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dettaglio tecnico collassato */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="self-start text-[10px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Nascondi dettagli tecnici</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Mostra dettagli tecnici</span>
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-155 space-y-2 mt-1 animate-fadeIn text-[10px] text-slate-600 font-mono">
                        {item.campoDestinazione && (
                          <div>
                            <span className="text-slate-500 font-semibold block text-[9px]">Campo di destinazione (Database/Stato):</span>
                            <span className="text-slate-800 break-all">{item.campoDestinazione}</span>
                          </div>
                        )}
                        
                        {item.parametroIstruttorioCollegato && (
                          <div>
                            <span className="text-slate-500 font-semibold block text-[9px]">Parametro istruttorio collegato (legacy):</span>
                            <span className="text-slate-800 break-all">{item.parametroIstruttorioCollegato}</span>
                          </div>
                        )}

                        {item.rischioSovrascrittura && (
                          <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-800 font-sans space-y-1">
                            <div className="flex items-center gap-1 text-[#cc4331] font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Rischio di sovrascrittura legacy rilevato</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-700">
                              {item.spiegazioneRischio || 'Il calcolo legacy effettua ricalcoli automatici. Il trasferimento deve sincronizzare sia il valore contabile sia i parametri collegati.'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans space-y-6">
      <Wizard2026StepHeader
        stepNumber={8}
        title="Riepilogo e trasferimento"
        subtitle="Quadro Sintetico e Verifiche Conclusive"
        description="Questo pannello riepiloga tutti gli esiti contabili dell'istruttoria 2026 per la costituzione del fondo, organizzati in 8 sezioni normative coerenti, privi di codici tecnici interni."
      />

      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-start gap-3 shadow-sm font-sans">
        <Info className="w-5 h-5 text-emerald-650 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed font-medium">
          <strong>Verifica dei dati raccolti prima del trasferimento.</strong> Questa schermata riassume i dati pronti per essere allineati alla Costituzione dei fondi. Per rendere effettivo il trasferimento e aggiornare i prospetti del Fondo, premi il pulsante <strong>"Trasferisci i dati alla costituzione del fondo e compila"</strong> in fondo alla pagina.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* 1. Quadro generale */}
        {renderQuadroEnte()}

        {/* 2. Limite Art 23 */}
        {renderArt23()}

        {/* 3. D.L. 25/2025 */}
        {renderDl25()}

        {/* 4. CCNL 2026 */}
        {renderCcnl2026()}

        {/* 5. Conglobamento Art 60 */}
        {renderConglobamento()}

        {/* 6. Straordinario */}
        {renderStraordinario()}

        {/* 7. PNRR */}
        {renderPnrr()}

        {/* 8. Esiti Istruttori */}
        {renderEsitiIstruttori()}

        {/* 9. Anteprima trasferimento */}
        {renderAnteprimaTrasferimento()}
      </div>

      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <h4 className="font-semibold text-base text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          <span>Lettera Richiesta Dati all’Ente</span>
        </h4>
        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
          Se alcuni dati contabili o gestionali necessari per completare l'istruttoria 2026 non sono ancora disponibili o devono essere certificati con gli uffici finanziari, puoi generare una lettera formale di richiesta dati.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setModalMode('MISSING_ONLY')}
            className="h-10 min-h-[40px] px-5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-xs flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Lettera Solo Dati Mancanti</span>
          </button>
          <button
            type="button"
            onClick={() => setModalMode('FULL')}
            className="h-10 min-h-[40px] px-5 rounded-lg bg-[#cc4331] text-white font-semibold hover:bg-[#A83226] active:bg-[#A83226] transition-colors text-xs flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Lettera Richiesta Dati Completa</span>
          </button>
        </div>
      </section>

      <section className="bg-amber-50 dark:bg-amber-950/10 border border-amber-300 dark:border-amber-900/50 rounded-2xl p-6 text-center space-y-4">
        <div className="flex flex-col items-center gap-2">
          <h4 className="font-semibold text-base text-amber-950 dark:text-amber-300 uppercase tracking-wider font-sans">
            Trasferisci i dati alla costituzione del fondo e compila
          </h4>
          <span className="px-2.5 py-0.5 bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-300 dark:border-amber-800 inline-block font-sans">
            Richiede conferma
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsTransferModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-[#cc4331] hover:bg-[#A83226] active:bg-[#A83226] text-white font-semibold text-xs shadow-sm border border-transparent transition-colors font-sans"
        >
          Trasferisci i dati alla costituzione del fondo e compila
        </button>
        <p className="text-xs text-amber-900 dark:text-amber-400 max-w-2xl mx-auto leading-relaxed font-sans">
          Facendo clic su questo pulsante, si avvierà la procedura guidata di trasferimento dati, con anteprima dettagliata prima e dopo e salvataggio di uno snapshot di sicurezza per rollback.
        </p>
      </section>

      {modalMode && (
        <Wizard2026DataRequestModal
          isOpen={true}
          onClose={() => setModalMode(null)}
          state={state}
          initialMode={modalMode}
        />
      )}

      {isTransferModalOpen && (
        <Wizard2026TransferModal
          isOpen={true}
          onClose={() => setIsTransferModalOpen(false)}
          state={state}
          currentFundData={currentFundData}
          onConfirm={handleConfirmTransfer}
          localSources={globalState.localSources}
          isTransferring={isTransferring}
          transferError={transferError}
        />
      )}
    </div>
  );
};
