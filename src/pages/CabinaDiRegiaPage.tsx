import React, { useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { NavigationScope } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  ClipboardCheck,
  Landmark,
  ShieldAlert,
  PieChart,
  FileSpreadsheet,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  Sparkles,
  Layers,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Lock
} from 'lucide-react';
import {
  resolveRaccoltaState,
  resolveCostituzioneState,
  resolveVerificaState,
  resolveDistribuzioneState,
  resolveDocumentiState,
  resolveNextBestAction,
  resolveClosedViewState,
  resolveFaseAttuale
} from './cabinaDiRegiaState';

export const CabinaDiRegiaPage: React.FC = () => {
  const {
    state,
    setScopeAndTab,
    performLocalCalculation
  } = useAppContext();

  const {
    currentEntity,
    currentYear,
    entities,
    currentUser,
    fundData,
    calculationResult,
    complianceChecks,
    isLoading
  } = state;

  const { hasDirigenza } = fundData.annualData;

  const [showMobilePipeline, setShowMobilePipeline] = React.useState(false);

  // Ricalcolo locale preventivo se non presente
  useEffect(() => {
    if (!calculationResult && currentEntity && currentYear && !isLoading) {
      performLocalCalculation();
    }
  }, [currentEntity?.id, currentYear]);

  // Recupera progresso draft raccolta dati
  const wizardProgress = useMemo(() => {
    if (!currentUser?.id || !currentEntity?.id || !currentYear) return { completed: 0, total: 8, hasData: false };
    try {
      const key = `fl_wizard2026_draft_${currentUser.id}_${currentEntity.id}_${currentYear}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const completed = parsed?.meta?.completedSteps?.length ?? 0;
        return { completed, total: 8, hasData: true };
      }
    } catch {
      // ignore
    }
    return { completed: 0, total: 8, hasData: false };
  }, [currentUser?.id, currentEntity?.id, currentYear]);

  // Stato verifiche
  const criticalErrors = complianceChecks.filter(c => c.gravita === 'error');
  const warnings = complianceChecks.filter(c => c.gravita === 'warning');

  // Totali Fondi calcolati
  const totaleFondo = calculationResult?.totals?.totaleFondo ?? 0;
  const totaleStabile = calculationResult?.totals?.stabile ?? 0;
  const totaleVariabile = calculationResult?.totals?.variabile ?? 0;

  const totalePersonale = calculationResult?.fondi?.dipendente?.summary?.totaleFondo ?? 0;
  const totaleEQ = calculationResult?.fondi?.eq?.summary?.totaleFondo ?? 0;
  const totaleSegretario = calculationResult?.fondi?.segretario?.summary?.totaleFondo ?? 0;
  const totaleDirigenza = calculationResult?.fondi?.dirigenza?.summary?.totaleFondo ?? 0;

  // Stato di lavoro dell'annualità
  const snapshotStatus = fundData?.metadata?.snapshotStatus || 'OPEN';
  const isClosed = snapshotStatus === 'CLOSED';

  // Riconoscimento "Annualità non ancora iniziata" (Section 19)
  const isUnstartedYear = !wizardProgress.hasData && totaleFondo === 0 && (!fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016);

  // Navigazione
  const goToTab = (tabId: string) => {
    if (tabId === 'wizard2026Preview') {
      window.history.pushState(null, '', '/configurazione-fondo-preview/raccolta-dati');
      setScopeAndTab(NavigationScope.FONDO, 'wizard2026Preview');
    } else {
      setScopeAndTab(NavigationScope.FONDO, tabId);
    }
  };

  // -------------------------------------------------------------
  // STATO 1: NESSUN ENTE SELEZIONATO (Section 12)
  // -------------------------------------------------------------
  if (!currentEntity || entities.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in text-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="size-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#cc4331] flex items-center justify-center mx-auto mb-6">
            <Building2 className="size-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            FONDO RISORSE DECENTRATE
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-md mx-auto mb-8">
            Inizia selezionando l&apos;ente e l&apos;annualità su cui vuoi lavorare per aprire la Cabina di regia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setScopeAndTab(NavigationScope.FONDO, 'fondiEnti')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white font-bold text-sm transition-colors shadow-sm"
              data-testid="first-access-select-entity-btn"
            >
              Apri i Fondi degli enti →
            </button>
            <button
              onClick={() => setScopeAndTab(NavigationScope.DASHBOARD, 'dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
            >
              Torna alla Toolbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATO 2: PRIMO AVVIO / ANNUALITÀ NON INIZIATA (Section 19)
  // -------------------------------------------------------------
  if (isUnstartedYear) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
        {/* Header di contesto */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>{currentEntity.name}</span>
            <span>·</span>
            <span>Esercizio {currentYear}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Fondo {currentYear}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Questa annualità non presenta ancora importi costituiti. Scegli come procedere con l&apos;impostazione del Fondo.
          </p>
        </div>

        {/* Scelta iniziale: Raccolta Guidata vs Costituzione diretta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Opzione 1: Raccolta guidata (Consigliato) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border-2 border-[#cc4331] shadow-md flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 px-4 py-1 bg-[#cc4331] text-white text-[10px] font-bold uppercase rounded-bl-xl tracking-wider">
              Consigliato
            </div>

            <div>
              <div className="size-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#cc4331] flex items-center justify-center mb-5">
                <ClipboardCheck className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Raccolta guidata dei dati
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Ti accompagniamo passo dopo passo attraverso le informazioni necessarie: limite Art. 23, DL 25, CCNL 2026, straordinari e PNRR.
              </p>
            </div>

            <button
              onClick={() => goToTab('wizard2026Preview')}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white font-bold text-sm transition-all shadow-sm group-hover:gap-3"
              data-testid="start-guided-collection-btn"
            >
              <span>Inizia raccolta guidata</span>
              <ArrowRight className="size-4" />
            </button>
          </div>

          {/* Opzione 2: Costituzione diretta */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div>
              <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-5">
                <Landmark className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Costituzione diretta
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Sai già quali dati inserire? Accedi direttamente alle schede dei fondi (Personale, EQ, Segretario) per la compilazione manuale.
              </p>
            </div>

            <button
              onClick={() => goToTab('fondoDipendenti')}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors"
              data-testid="direct-to-constitution-btn"
            >
              <span>Vai direttamente alla costituzione</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATO 3: CABINA DI REGIA IN LAVORAZIONE (Section 14 & 15)
  // -------------------------------------------------------------

  // Verifica se sono presenti risorse distribuite/stanziate
  const hasDistribuzione = useMemo(() => {
    if (!fundData?.distribuzioneRisorseData) return false;
    const vals = Object.values(fundData.distribuzioneRisorseData) as any[];
    return vals.some(v => v && typeof v === 'object' && ((v.stanziate ?? 0) > 0 || (v.liquidate ?? 0) > 0));
  }, [fundData?.distribuzioneRisorseData]);

  // Risoluzione stati puri per Cabina di Regia
  const closedViewState = resolveClosedViewState();
  const raccoltaState = resolveRaccoltaState(wizardProgress, totaleFondo, isClosed);
  const costituzioneState = resolveCostituzioneState(totaleFondo, isClosed);
  const verificaState = resolveVerificaState(criticalErrors.length, warnings.length, totaleFondo, isClosed);
  const distribuzioneState = resolveDistribuzioneState(hasDistribuzione, totaleFondo, isClosed);
  const documentiState = resolveDocumentiState(isClosed);

  const nextAction = resolveNextBestAction({
    isClosed,
    wizardCompleted: wizardProgress.completed,
    totaleFondo,
    criticalErrorsCount: criticalErrors.length,
    hasDistribuzione
  });

  const faseAttuale = resolveFaseAttuale({
    isClosed,
    wizardCompleted: wizardProgress.completed,
    totaleFondo,
    criticalErrorsCount: criticalErrors.length,
    hasDistribuzione
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8 animate-fade-in" data-testid="cabina-di-regia-page">
      
      {/* Intestazione Cabina di Regia (Senza link duplicato a Tutti i Fondi) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>{currentEntity.name}</span>
            <span>·</span>
            <span>Esercizio {currentYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cabina di regia
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Stato complessivo e prossime attività · Fondo risorse decentrate {currentYear}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            data-testid="cabina-status-badge"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${
              isClosed
                ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isClosed ? 'bg-slate-500' : 'bg-amber-500'}`} />
            {isClosed ? '🔒 Chiuso' : '● In lavorazione'}
          </span>
        </div>
      </div>

      {/* Banner Annualità Chiusa se snapshotStatus === CLOSED */}
      {isClosed && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <span className="font-bold">{closedViewState.bannerTitle}</span> {closedViewState.bannerText}
          </div>
        </div>
      )}

      {/* PIPELINE DESKTOP: SEQUENZA ORIZZONTALE LEGGERA (>= 1400px) */}
      <div className="hidden min-[1400px]:flex items-stretch justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-3 gap-2">
        {/* Step 1: Raccolta Dati */}
        <button
          onClick={() => goToTab('wizard2026Preview')}
          className="flex-1 flex flex-col justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left group min-w-0"
          title={raccoltaState.tooltip}
          data-testid="pipeline-raccolta"
        >
          <div className="flex items-center gap-2 min-w-0 mb-1">
            <span className="size-6 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#cc4331] font-extrabold text-xs flex items-center justify-center shrink-0">1</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">Raccolta dati</p>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">{raccoltaState.subtitle}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 self-start shrink-0 ${
            isClosed
              ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              : raccoltaState.status === 'completed'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : raccoltaState.status === 'in-progress'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}>
            {raccoltaState.label}
          </span>
        </button>

        <div className="flex items-center text-slate-300 dark:text-slate-600 px-0.5">
          <ChevronRight className="size-4" />
        </div>

        {/* Step 2: Costituzione */}
        <button
          onClick={() => goToTab('fondoDipendenti')}
          className="flex-1 flex flex-col justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left group min-w-0"
          title={costituzioneState.tooltip}
          data-testid="pipeline-costituzione"
        >
          <div className="flex items-center gap-2 min-w-0 mb-1">
            <span className="size-6 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#cc4331] font-extrabold text-xs flex items-center justify-center shrink-0">2</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">Costituzione</p>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">{costituzioneState.subtitle}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 self-start shrink-0 ${
            isClosed
              ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              : costituzioneState.status === 'present'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}>
            {costituzioneState.label}
          </span>
        </button>

        <div className="flex items-center text-slate-300 dark:text-slate-600 px-0.5">
          <ChevronRight className="size-4" />
        </div>

        {/* Step 3: Verifica */}
        <button
          onClick={() => goToTab('compliance')}
          className="flex-1 flex flex-col justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left group min-w-0"
          title={verificaState.tooltip}
          data-testid="pipeline-verifica"
        >
          <div className="flex items-center gap-2 min-w-0 mb-1">
            <span className="size-6 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#cc4331] font-extrabold text-xs flex items-center justify-center shrink-0">3</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">Verifica</p>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">{verificaState.subtitle}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 self-start shrink-0 ${
            isClosed
              ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              : criticalErrors.length > 0
              ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
              : warnings.length > 0
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
              : totaleFondo > 0
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}>
            {verificaState.label}
          </span>
        </button>

        <div className="flex items-center text-slate-300 dark:text-slate-600 px-0.5">
          <ChevronRight className="size-4" />
        </div>

        {/* Step 4: Distribuzione */}
        <button
          onClick={() => goToTab('distribuzioneRisorse')}
          className="flex-1 flex flex-col justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left group min-w-0"
          title={distribuzioneState.tooltip}
          data-testid="pipeline-distribuzione"
        >
          <div className="flex items-center gap-2 min-w-0 mb-1">
            <span className="size-6 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#cc4331] font-extrabold text-xs flex items-center justify-center shrink-0">4</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">Distribuzione</p>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">{distribuzioneState.subtitle}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 self-start shrink-0 ${
            isClosed
              ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              : hasDistribuzione
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              : totaleFondo > 0
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
          }`}>
            {distribuzioneState.label}
          </span>
        </button>

        <div className="flex items-center text-slate-300 dark:text-slate-600 px-0.5">
          <ChevronRight className="size-4" />
        </div>

        {/* Step 5: Documenti */}
        <button
          onClick={() => goToTab('reports')}
          className="flex-1 flex flex-col justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left group min-w-0"
          data-testid="pipeline-documenti"
        >
          <div className="flex items-center gap-2 min-w-0 mb-1">
            <span className="size-6 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#cc4331] font-extrabold text-xs flex items-center justify-center shrink-0">5</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">Documenti</p>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">{documentiState.subtitle}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 self-start shrink-0 ${
            isClosed
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}>
            {documentiState.label}
          </span>
        </button>
      </div>

      {/* PIPELINE COMPATTA (< 1400px: DESKTOP STRETTO, TABLET E MOBILE): BLOCCO SINTETICO CON TOGGLE */}
      <div className="min-[1400px]:hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#cc4331]">
              FASE ATTUALE: {faseAttuale.phaseNumber} — {faseAttuale.phaseName}
            </p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
              {faseAttuale.phaseDesc}
            </p>
          </div>
          <button
            onClick={() => setShowMobilePipeline(!showMobilePipeline)}
            className="text-xs font-bold text-[#cc4331] hover:underline shrink-0 flex items-center gap-1"
            data-testid="toggle-mobile-pipeline-btn"
          >
            <span>{showMobilePipeline ? 'Meno' : 'Tutte'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMobilePipeline ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showMobilePipeline && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5 animate-in fade-in">
            <button onClick={() => goToTab('wizard2026Preview')} className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs font-semibold">
              <span className="flex items-center gap-2"><ClipboardCheck className="size-3.5 text-[#cc4331]" /> 1. Raccolta dati</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600">
                {raccoltaState.label}
              </span>
            </button>
            <button onClick={() => goToTab('fondoDipendenti')} className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs font-semibold">
              <span className="flex items-center gap-2"><Landmark className="size-3.5 text-[#cc4331]" /> 2. Costituzione</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600">
                {costituzioneState.label}
              </span>
            </button>
            <button onClick={() => goToTab('compliance')} className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs font-semibold">
              <span className="flex items-center gap-2"><ShieldAlert className="size-3.5 text-[#cc4331]" /> 3. Verifica</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600">
                {verificaState.label}
              </span>
            </button>
            <button onClick={() => goToTab('distribuzioneRisorse')} className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs font-semibold">
              <span className="flex items-center gap-2"><PieChart className="size-3.5 text-[#cc4331]" /> 4. Distribuzione</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600">
                {distribuzioneState.label}
              </span>
            </button>
            <button onClick={() => goToTab('reports')} className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs font-semibold">
              <span className="flex items-center gap-2"><FileSpreadsheet className="size-3.5 text-[#cc4331]" /> 5. Documenti</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600">
                {documentiState.label}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* PROSSIMA ATTIVITÀ (Single Primary CTA deterministica) */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 rounded-3xl p-6 sm:p-8 border border-red-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#cc4331]/10 text-[#cc4331] font-bold text-[10px] uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Prossima attività
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {nextAction.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {nextAction.description}
          </p>
        </div>

        <button
          onClick={() => goToTab(nextAction.tabId)}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#cc4331] hover:bg-[#b53a2a] text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
          data-testid="cabina-primary-cta"
        >
          <span>{nextAction.ctaText}</span>
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* SEZIONI OPERATIVE: DA VERIFICARE & SITUAZIONE FONDI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DA VERIFICARE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ShieldAlert className="size-5 text-[#cc4331]" />
                <span>Da verificare</span>
              </h3>
              <button
                onClick={() => goToTab('compliance')}
                className="text-xs font-semibold text-[#cc4331] hover:underline"
              >
                Vedi verifiche →
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {criticalErrors.length === 0 && warnings.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  <div className="text-xs font-medium">
                    I controlli automatici previsti risultano superati.
                  </div>
                </div>
              ) : (
                <>
                  {criticalErrors.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 flex items-center justify-between text-red-800 dark:text-red-300">
                      <div className="flex items-center gap-2.5 text-xs font-semibold">
                        <AlertCircle className="size-4 text-red-600 shrink-0" />
                        <span>{criticalErrors.length} criticità bloccante</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-red-200 dark:bg-red-900/60 text-red-800 px-2 py-0.5 rounded-full">
                        Bloccante
                      </span>
                    </div>
                  )}

                  {warnings.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-amber-800 dark:text-amber-300">
                      <div className="flex items-center gap-2.5 text-xs font-semibold">
                        <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                        <span>{warnings.length} attenzioni da controllare</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-amber-200 dark:bg-amber-900/60 text-amber-800 px-2 py-0.5 rounded-full">
                        Attenzione
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => goToTab('compliance')}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            Apri quadro conformità
          </button>
        </div>

        {/* SITUAZIONE FONDI */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Landmark className="size-5 text-[#cc4331]" />
                <span>Situazione fondi</span>
              </h3>
              <button
                onClick={() => goToTab('fondoDipendenti')}
                className="text-xs font-semibold text-[#cc4331] hover:underline"
              >
                Apri costituzione →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Personale</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(totalePersonale)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">EQ</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(totaleEQ)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Segretario</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(totaleSegretario)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Dirigenza</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {hasDirigenza ? formatCurrency(totaleDirigenza) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => goToTab('fondoDipendenti')}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            Gestisci schede di costituzione
          </button>
        </div>

      </div>

      {/* RIEPILOGO GENERALE DEL FONDO (Section 20 Overview) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
          <Layers className="size-5 text-[#cc4331]" />
          <span>Sintesi economica del Fondo {currentYear}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700">
            <p className="text-xs text-slate-500 font-semibold uppercase">Parte Stabile</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totaleStabile)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700">
            <p className="text-xs text-slate-500 font-semibold uppercase">Parte Variabile</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totaleVariabile)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30">
            <p className="text-xs text-red-700 dark:text-red-400 font-semibold uppercase">Totale Fondo Complessivo</p>
            <p className="text-2xl font-bold text-[#cc4331] mt-1">
              {formatCurrency(totaleFondo)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
