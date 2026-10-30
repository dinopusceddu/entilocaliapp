import { presentTransferText } from '../transfer/transferAction';
import { presentWizardArt23 } from '../art23Presentation';
import React, { useState } from 'react';
import { Dl25CarryForwardSummary } from '../../../components/dataInput/Dl25CarryForwardFields';
import { wizardDl25Facts, resolveWizardDl25Simulation, resolveWizardDl25Regime, resolveWizardDl25Carry, dl25PresentationResult } from '../dl25Contract';
import { Dl25FinancialSummary } from '../../../components/dataInput/Dl25FinancialSummary';
import { Wizard2026DraftState } from '../types';
import { Wizard2026StepHeader } from '../components';
import { 
  AlertCircle, CheckCircle2, Info, FileText, LayoutGrid, Scale, 
  ShieldAlert, Award, FileSpreadsheet, Activity, Flame, HelpCircle,
  RefreshCw
} from 'lucide-react';
import { Wizard2026LetterMode } from '../letters/wizard2026LetterTypes';
import { Wizard2026DataRequestModal } from '../letters/components/Wizard2026DataRequestModal';
import { 
  Wizard2026TransferStatus, 
  Wizard2026TransferCategory 
} from '../transfer/transferPreviewEngine';
import { WizardTransferProvider, useWizardTransfer, TransferActionPanel } from '../transfer/WizardTransferAction';

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

export const Step8RiepilogoPreview: React.FC<Step8RiepilogoPreviewProps> = (props) => {
  const shared = useWizardTransfer();
  return shared ? <Step8Content /> : <WizardTransferProvider state={props.state} onSaveLastTransfer={props.onSaveLastTransfer}><Step8Content /></WizardTransferProvider>;
};
const Step8Content: React.FC = () => {
  const transfer = useWizardTransfer()!;
  const { state, preview, transferValidation } = transfer;
  const isClosed = transfer.action.status === 'CLOSED';
  const errors = transferValidation.blockingErrors;
  const warnings = transferValidation.warnings;
  const [modalMode, setModalMode] = useState<Wizard2026LetterMode | null>(null);

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
            ⚠️ Valore già presente (non sovrascritto)
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
    const presentation = presentWizardArt23(state.art23, state.ente.hasDirigenza);
    
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
          <div className="md:col-span-1">
            <span className="text-slate-500 block">Limite complessivo attualizzato Art. 23:</span>
            <span className="font-bold text-green-700 text-base font-mono">{formatEur(presentation.adjustedLimit)}</span>
          </div>
        </div>
        <div className="bg-[#FFF4F2] p-3 rounded-lg border border-[#FCE7E2] text-slate-700 text-[11px] leading-relaxed">
          <strong>Nota esplicativa:</strong> {presentation.missingReason ?? 'Questo valore rappresenta il limite complessivo ordinario del trattamento accessorio, salvo risorse espressamente escluse o derogatorie.'}
        </div>
      </div>
    );
  };

  // Sezione 3: D.L. 25/2025
  const renderDl25 = () => {
    const res = state.dl25.result?.applicabilityStatus === 'TRANSFER_ONLY' ? state.dl25.result : dl25PresentationResult(state.dl25);
    
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldAlert className="w-5 h-5 text-[#cc4331]" />
          <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">3. D.L. 25/2025 (Capacità assunzionale e incremento fondi)</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Soglia massima teorica (48% stipendi 2023):</span>
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
              {res ? (res.isApplicabileDirettamente ? 'Perimetro di applicazione diretta' : 'Da verificare / Limitata') : 'n/d'}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-500 block">Plafond complessivo sulla base 2025:</span>
            <span className="font-bold text-[#cc4331] text-base font-mono">{formatEur(res?.limiteMassimoDL25)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Nuovo incremento DL25 deciso nell’anno:</span>
            <span className="font-bold text-slate-850 text-sm font-mono">{formatEur(resolveWizardDl25Carry(state).currentYearDelta)}</span>
          </div>
        </div>
        <div className="bg-[#FFF4F2] p-3 rounded-lg border border-[#FCE7E2] text-slate-700 text-[11px] leading-relaxed">
          <strong>Nota esplicativa:</strong> Il plafond complessivo è teorico; il Fondo riceve lo stock cumulativo risultante dalla scelta annuale, previa verifica della sostenibilità e dell’equilibrio pluriennale.
        </div>
        <Dl25CarryForwardSummary facts={wizardDl25Facts(state.dl25, state.ente.annoRiferimento)} referenceYear={state.ente.annoRiferimento} />
        <Dl25FinancialSummary result={resolveWizardDl25Simulation(state)} regime={resolveWizardDl25Regime(state)} />
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
            <span className="text-slate-500 block font-semibold">Recuperi 0,14% — parte variabile una tantum</span>
            <span className="font-bold text-slate-850 text-sm font-mono block">{formatEur(res?.arretrati014)}</span>
            <span className="text-[10px] text-slate-400 block">Non calcolati automaticamente</span>
            <span className="text-[10px] text-slate-600 block">Richiedono annualità di origine, importo e destinazione istruiti.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="text-slate-500 block font-semibold">Limite massimo incremento 0,22%</span>
            <span className="font-bold text-slate-850 text-sm font-mono block">{formatEur(res?.limiteMassimo022)}</span>
            <span className="text-[10px] text-slate-400 block">Formula annuale dal 2025: Monte salari 2021 × 0,22%</span>
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
                <li><strong>Trasferimento reale:</strong> dopo la conferma i dati saranno acquisiti e salvati nella Costituzione del Fondo selezionato.</li>
                <li><strong>Tipologia di dati:</strong> alcuni valori sono importi effettivi pronti al trasferimento, altri rappresentano solo tetti massimi (D.L. 25/2025, PNRR) o dati di controllo (tetto Art. 23).</li>
                <li><strong>Gestione sovrascritture:</strong> i valori manuali o di origine non ricostruibile sono conservati; verifica le differenze tra importi attuali e proposti prima della conferma.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lista di card responsive */}
        <div className="space-y-4 pt-2">
          {preview.items.map((item) => {
            
            return (
              <div 
                key={item.id}
                className="border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-colors bg-white text-xs"
              >
                {/* Intestazione della card */}
                <div className="p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-850 text-sm">{presentTransferText(item.etichetta)}</span>
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
                      <p className="text-slate-700 leading-relaxed font-sans">{presentTransferText(item.spiegazioneUtente)}</p>
                      {item.descrizione && (
                        <p className="text-slate-400 text-[10px] mt-1 italic font-sans">{presentTransferText(item.descrizione)}</p>
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
                        <p className="text-slate-600 text-[10px] font-sans">{presentTransferText(item.notaArt23)}</p>
                      </div>
                    </div>
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
    <div className="font-sans space-y-4">
      <TransferActionPanel transfer={transfer} entryPoint="step8" />
      <Wizard2026StepHeader
        stepNumber={8}
        title="Riepilogo e trasferimento"
        subtitle="Quadro Sintetico e Verifiche Conclusive"
        description="Questo pannello riepiloga tutti gli esiti contabili dell'istruttoria 2026 per la costituzione del fondo, organizzati in 8 sezioni normative coerenti, privi di codici tecnici interni."
      />

      {isClosed && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 font-medium">
          ⚠️ Annualità Chiusa (Sola Lettura): I trasferimenti dal Wizard alla Costituzione del Fondo sono bloccati.
        </div>
      )}

      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-start gap-3 shadow-sm font-sans">
        <Info className="w-5 h-5 text-emerald-650 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed font-medium">
          <strong>Verifica dei dati raccolti prima del trasferimento.</strong>{' '}
          {isClosed
            ? 'Questa schermata resta disponibile per consultare il riepilogo dell’istruttoria; il trasferimento non è disponibile per un’annualità chiusa.'
            : <>Questa schermata riassume i dati pronti per essere allineati alla Costituzione dei fondi. Per rendere effettivo il trasferimento e aggiornare i prospetti del Fondo, premi il pulsante <strong>"Trasferisci i dati alla costituzione del fondo e compila"</strong> all’inizio della pagina.</>}
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

      {modalMode && (
        <Wizard2026DataRequestModal
          isOpen={true}
          onClose={() => setModalMode(null)}
          state={state}
          initialMode={modalMode}
        />
      )}


    </div>
  );
};
