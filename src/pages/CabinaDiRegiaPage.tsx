import { appPath } from '../utils/appPaths';
import React, { useEffect, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileSpreadsheet,
  Landmark,
  Layers,
  Lock,
  PieChart,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import {
  AnnualSnapshotStatus,
  NavigationScope,
  projectFundDocument,
  type FundData,
} from '../domain';
import {
  resolveCabinaViewModel,
  type CabinaOperationalViewModel,
} from '../logic/cabina/resolveCabinaViewModel';
import type { CabinaIssue } from '../logic/cabina/resolveChecklist';
import type { OperationalStatus } from '../logic/cabina/resolveOperationalStatus';
import {
  getModuleAccessInfo,
  getModuleById,
  type AppModule,
} from '../application/registry/moduleRegistry';
import { formatCurrency } from '../utils/formatters';

type StatusPresentation = {
  label: string;
  phaseNumber: number;
  phaseName: string;
  description: string;
};

const STATUS_PRESENTATION: Record<OperationalStatus, StatusPresentation> = {
  NOT_STARTED: {
    label: 'Da iniziare',
    phaseNumber: 1,
    phaseName: 'Raccolta dati',
    description: 'Avvia la raccolta dei dati necessari alla costituzione del Fondo.',
  },
  TO_COMPLETE: {
    label: 'Da completare',
    phaseNumber: 2,
    phaseName: 'Costituzione',
    description: 'Completa i prerequisiti necessari a determinare il Fondo.',
  },
  BLOCKED: {
    label: 'Bloccato',
    phaseNumber: 3,
    phaseName: 'Verifica',
    description: 'Esamina le criticità bloccanti prima di procedere.',
  },
  CONSTITUTION_VERIFIED: {
    label: 'Costituzione verificata',
    phaseNumber: 4,
    phaseName: 'Distribuzione',
    description: 'Il Fondo è determinato: puoi iniziare la distribuzione.',
  },
  DISTRIBUTION_IN_PROGRESS: {
    label: 'Distribuzione in corso',
    phaseNumber: 4,
    phaseName: 'Distribuzione',
    description: 'Riprendi il lavoro di distribuzione già presente.',
  },
  CLOSED: {
    label: 'Chiuso',
    phaseNumber: 5,
    phaseName: 'Annualità chiusa',
    description: 'Consulta i dati consolidati in modalità di sola lettura.',
  },
};

const CONSTITUTION_LABELS: Record<
  CabinaOperationalViewModel['constitution']['canonicalStatus'],
  string
> = {
  NOT_STARTED: 'Da iniziare',
  UNDETERMINED: 'Da completare',
  INVALID: 'Da verificare',
  VALID: 'Verificata',
};

const ISSUE_SEVERITY_ORDER: CabinaIssue['severity'][] = [
  'BLOCKING',
  'MISSING_PREREQUISITE',
  'WARNING',
];

const ISSUE_PRESENTATION: Record<
  CabinaIssue['severity'],
  { label: string; tone: 'red' | 'orange' | 'amber' }
> = {
  BLOCKING: { label: 'Bloccante', tone: 'red' },
  MISSING_PREREQUISITE: { label: 'Prerequisito mancante', tone: 'orange' },
  WARNING: { label: 'Avvertenza', tone: 'amber' },
};

const CLOSED_CONSULTATIVE_TARGETS = new Set(['fundDetails', 'distribuzioneRisorse']);

function buildIssueRows(issues: readonly CabinaIssue[]) {
  const occurrences = new Map<string, number>();
  return ISSUE_SEVERITY_ORDER.flatMap(severity =>
    issues
      .filter(issue => issue.severity === severity)
      .map(issue => {
        const identity = issue.code
          ? `code:${issue.code}`
          : `content:${issue.severity}\u0000${issue.message}\u0000${issue.userMessage}\u0000${issue.target ?? ''}`;
        const occurrence = occurrences.get(identity) ?? 0;
        occurrences.set(identity, occurrence + 1);
        return { issue, key: `${identity}\u0000${occurrence}` };
      })
  );
}

type TargetAvailability = {
  targetModule?: AppModule;
  canNavigate: boolean;
  reason?: string;
};

export const CabinaDiRegiaPage: React.FC = () => {
  const { state, setScopeAndTab, performLocalCalculation, isYearSwitching } = useAppContext();
  const {
    currentEntity,
    currentYear,
    entities,
    currentUser,
    fundData,
    calculationResult,
    complianceChecks,
    isLoading,
  } = state;
  const [showMobilePipeline, setShowMobilePipeline] = React.useState(false);
  const lastAutoCalculationAttempt = React.useRef<{
    entityId: string;
    year: number;
    fundData: FundData;
  } | null>(null);
  const snapshotStatus = fundData.metadata?.snapshotStatus as AnnualSnapshotStatus | undefined;

  useEffect(() => {
    if (
      calculationResult
      || !currentEntity
      || !currentYear
      || isLoading
      || isYearSwitching
      || snapshotStatus === AnnualSnapshotStatus.CLOSED
    ) {
      return;
    }

    const previousAttempt = lastAutoCalculationAttempt.current;
    if (
      previousAttempt?.entityId === currentEntity.id
      && previousAttempt.year === currentYear
      && previousAttempt.fundData === fundData
    ) {
      return;
    }

    // Il reducer conserva il riferimento fundData per gli aggiornamenti non economici
    // (es. validationErrors) e lo sostituisce per modifiche dati e idratazioni.
    // Registriamo prima dell'invocazione per evitare reingressi, incluso StrictMode.
    lastAutoCalculationAttempt.current = {
      entityId: currentEntity.id,
      year: currentYear,
      fundData,
    };
    void performLocalCalculation();
  }, [
    calculationResult,
    currentEntity?.id,
    currentYear,
    fundData,
    isLoading,
    isYearSwitching,
    performLocalCalculation,
    snapshotStatus,
  ]);

  const wizardProgress = useMemo(() => {
    if (!currentUser?.id || !currentEntity?.id || !currentYear) {
      return { completed: 0, total: 8, hasData: false };
    }
    try {
      const key = `fl_wizard2026_draft_${currentUser.id}_${currentEntity.id}_${currentYear}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          completed: parsed?.meta?.completedSteps?.length ?? 0,
          total: 8,
          hasData: true,
        };
      }
    } catch {
      // Il progresso del wizard è accessorio: un draft non leggibile non altera il read model.
    }
    return { completed: 0, total: 8, hasData: false };
  }, [currentUser?.id, currentEntity?.id, currentYear]);

  const documentProjection = useMemo(
    () =>
      calculationResult && currentEntity
        ? projectFundDocument(
            calculationResult,
            currentEntity.name,
            fundData.annualData.documentMetadata
          )
        : null,
    [calculationResult, currentEntity, fundData.annualData.documentMetadata]
  );

  const viewModel = useMemo(
    () =>
      resolveCabinaViewModel({
        snapshotStatus,
        calculationResult,
        distribuzioneRisorseData: fundData.distribuzioneRisorseData,
        complianceChecks,
        documentProjection,
        wizardProgressAccessory: wizardProgress,
      }),
    [
      snapshotStatus,
      calculationResult,
      fundData.distribuzioneRisorseData,
      complianceChecks,
      documentProjection,
      wizardProgress,
    ]
  );

  const goToTab = (target: string) => {
    if (target === 'wizard2026Preview') {
      window.history.pushState(null, '', appPath('/configurazione-fondo-preview/raccolta-dati'));
    }
    setScopeAndTab(NavigationScope.FONDO, target);
  };

  const goToRegisteredModule = (targetModule: AppModule) => {
    if (targetModule.id === 'wizard2026Preview') {
      window.history.pushState(null, '', appPath('/configurazione-fondo-preview/raccolta-dati'));
    }
    void setScopeAndTab(targetModule.scope, targetModule.id);
  };

  if (isYearSwitching) {
    return (
      <div
        className="max-w-3xl mx-auto py-12 px-4 text-center text-slate-600 dark:text-slate-300"
        data-testid="cabina-year-switching"
      >
        Caricamento dell&apos;annualità in corso…
      </div>
    );
  }

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

  const isClosed = viewModel.status === 'CLOSED';
  const statusPresentation = STATUS_PRESENTATION[viewModel.status];
  const blockingIssues = viewModel.issues.filter(issue => issue.severity === 'BLOCKING');
  const missingPrerequisites = viewModel.issues.filter(
    issue => issue.severity === 'MISSING_PREREQUISITE'
  );
  const warningIssues = viewModel.issues.filter(issue => issue.severity === 'WARNING');
  const issueRows = buildIssueRows(viewModel.issues);
  const resolveTargetAvailability = (target?: string): TargetAvailability => {
    if (!target) {
      return {
        canNavigate: false,
        reason: 'Nessuna sezione specifica indicata.',
      };
    }

    const targetModule = getModuleById(target);
    if (!targetModule) {
      return {
        canNavigate: false,
        reason: 'La sezione indicata non è disponibile.',
      };
    }

    if (targetModule.isDisabled) {
      return {
        targetModule,
        canNavigate: false,
        reason: targetModule.disabledReason ?? 'La sezione è temporaneamente disabilitata.',
      };
    }

    const accessInfo = getModuleAccessInfo(targetModule, currentUser, {
      hasEntity: true,
      hasDirigenza: fundData.annualData.hasDirigenza === true,
    });
    if (!accessInfo.isAccessible || accessInfo.isDisabled) {
      return {
        targetModule,
        canNavigate: false,
        reason:
          accessInfo.disabledReason
          ?? 'La sezione non è accessibile nel contesto corrente.',
      };
    }

    if (isClosed && !CLOSED_CONSULTATIVE_TARGETS.has(targetModule.id)) {
      return {
        targetModule,
        canNavigate: false,
        reason: 'Consultazione non disponibile per questa destinazione nell’annualità chiusa.',
      };
    }

    return { targetModule, canNavigate: true };
  };
  const secondaryActionItems = viewModel.secondaryActions
    .filter(action => (
      action.label !== viewModel.primaryAction?.label
      || action.target !== viewModel.primaryAction?.target
    ))
    .map(action => ({
      action,
      availability: resolveTargetAvailability(action.target),
    }));
  const constitutionLabel = CONSTITUTION_LABELS[viewModel.constitution.canonicalStatus];
  const distributionLabel =
    viewModel.distribution.status === 'IN_PROGRESS' ? 'In lavorazione' : 'Da iniziare';
  const documentLabel =
    viewModel.documents.exportReadiness === 'DOCUMENT_FINAL_READY'
      ? 'Pronti per export finale'
      : 'Bozza';
  const totaleEQ = calculationResult?.fondi?.eq?.summary?.totaleFondo ?? 0;
  const totaleSegretario = calculationResult?.fondi?.segretario?.summary?.totaleFondo ?? 0;
  const totaleDirigenza = calculationResult?.fondi?.dirigenza?.summary?.totaleFondo ?? 0;

  if (viewModel.status === 'NOT_STARTED') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in" data-testid="cabina-not-started">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>{currentEntity.name}</span>
            <span>·</span>
            <span>Esercizio {currentYear}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Fondo {currentYear}
          </h1>
          <p
            className="text-slate-600 dark:text-slate-400 text-sm mt-1"
            data-testid="cabina-operational-status"
          >
            {statusPresentation.label}. Avvia la raccolta guidata per predisporre il Fondo.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border-2 border-[#cc4331] shadow-md">
          <div className="size-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#cc4331] flex items-center justify-center mb-5">
            <ClipboardCheck className="size-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Raccolta guidata dei dati
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Inserisci passo dopo passo le informazioni necessarie alla costituzione del Fondo.
          </p>
          {viewModel.primaryAction && (
            <button
              onClick={() => goToTab(viewModel.primaryAction!.target)}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white font-bold text-sm transition-all shadow-sm"
              data-testid="cabina-primary-cta"
            >
              <span>{viewModel.primaryAction.label}</span>
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const pipelineSteps = [
    {
      number: 1,
      title: 'Raccolta dati',
      subtitle: `${wizardProgress.completed}/${wizardProgress.total} sezioni`,
      label: wizardProgress.hasData ? 'In lavorazione' : 'Non avviata',
      target: 'wizard2026Preview',
      icon: ClipboardCheck,
      mutative: true,
    },
    {
      number: 2,
      title: 'Costituzione',
      subtitle: `Stato canonico: ${viewModel.constitution.canonicalStatus}`,
      label: constitutionLabel,
      target: 'fondoDipendenti',
      icon: Landmark,
      mutative: true,
    },
    {
      number: 3,
      title: 'Verifica',
      subtitle: `${viewModel.issues.length} segnalazioni`,
      label:
        blockingIssues.length > 0
          ? 'Bloccante'
          : warningIssues.length > 0
            ? 'Attenzione'
            : 'Nessuna segnalazione',
      target: 'compliance',
      icon: ShieldAlert,
      mutative: false,
    },
    {
      number: 4,
      title: 'Distribuzione',
      subtitle: viewModel.distribution.hasExistingWork
        ? 'Lavoro esistente rilevato'
        : 'Nessun lavoro rilevato',
      label: distributionLabel,
      target: 'distribuzioneRisorse',
      icon: PieChart,
      mutative: true,
    },
    {
      number: 5,
      title: 'Documenti',
      subtitle: viewModel.documents.exportReadiness,
      label: documentLabel,
      target: 'reports',
      icon: FileSpreadsheet,
      mutative: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8 animate-fade-in" data-testid="cabina-di-regia-page">
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
        <span
          data-testid="cabina-operational-status"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${
            isClosed
              ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              : viewModel.status === 'BLOCKED'
                ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
          }`}
        >
          {isClosed && <Lock className="size-3" />}
          {statusPresentation.label}
        </span>
      </div>

      {isClosed && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <span className="font-bold">Annualità chiusa.</span> I dati consolidati sono disponibili in sola lettura.
          </div>
        </div>
      )}

      <div className="hidden min-[1400px]:flex items-stretch justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-3 gap-2">
        {pipelineSteps.map((step, index) => (
          <React.Fragment key={step.target}>
            <button
              onClick={() => goToTab(step.target)}
              disabled={isClosed && step.mutative}
              className="flex-1 flex flex-col justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left min-w-0 disabled:cursor-not-allowed disabled:opacity-60"
              data-testid={`pipeline-${step.target}`}
            >
              <div className="flex items-center gap-2 min-w-0 mb-1">
                <span className="size-6 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#cc4331] font-extrabold text-xs flex items-center justify-center shrink-0">
                  {step.number}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">{step.title}</p>
                  <p className="text-[10px] text-slate-500 whitespace-nowrap">{step.subtitle}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 self-start bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {step.label}
              </span>
            </button>
            {index < pipelineSteps.length - 1 && (
              <div className="flex items-center text-slate-300 dark:text-slate-600 px-0.5">
                <ChevronRight className="size-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="min-[1400px]:hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#cc4331]">
              FASE ATTUALE: {statusPresentation.phaseNumber} — {statusPresentation.phaseName}
            </p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
              {statusPresentation.description}
            </p>
          </div>
          <button
            onClick={() => setShowMobilePipeline(previous => !previous)}
            className="text-xs font-bold text-[#cc4331] hover:underline shrink-0 flex items-center gap-1"
            data-testid="toggle-mobile-pipeline-btn"
          >
            <span>{showMobilePipeline ? 'Meno' : 'Tutte'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMobilePipeline ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showMobilePipeline && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
            {pipelineSteps.map(step => {
              const StepIcon = step.icon;
              return (
                <button
                  key={step.target}
                  onClick={() => goToTab(step.target)}
                  disabled={isClosed && step.mutative}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-2">
                    <StepIcon className="size-3.5 text-[#cc4331]" /> {step.number}. {step.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600">{step.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {viewModel.primaryAction && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 rounded-3xl p-6 sm:p-8 border border-red-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#cc4331]/10 text-[#cc4331] font-bold text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Prossima attività
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{statusPresentation.phaseName}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">{statusPresentation.description}</p>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => goToTab(viewModel.primaryAction!.target)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#cc4331] hover:bg-[#b53a2a] text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
              data-testid="cabina-primary-cta"
            >
              <span>{viewModel.primaryAction.label}</span>
              <ArrowRight className="size-4" />
            </button>
            {secondaryActionItems.map(({ action, availability }) => (
              <div key={`${action.target}:${action.label}`} className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (availability.targetModule && availability.canNavigate) {
                      goToRegisteredModule(availability.targetModule);
                    }
                  }}
                  disabled={!availability.canNavigate}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[#cc4331]/30 bg-white/80 dark:bg-slate-900/40 text-[#a83226] dark:text-red-300 font-bold text-sm transition-colors hover:bg-white dark:hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="cabina-secondary-cta"
                  title={availability.reason}
                >
                  {action.label}
                </button>
                {!availability.canNavigate && availability.reason && (
                  <span className="max-w-56 text-[10px] text-slate-600 dark:text-slate-400">
                    {availability.reason}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ShieldAlert className="size-5 text-[#cc4331]" />
                <span>Criticità e prerequisiti</span>
              </h3>
            </div>
            {viewModel.issues.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div className="text-xs font-medium">Nessuna criticità o prerequisito segnalato.</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {blockingIssues.length > 0 && (
                    <IssueSummary testId="blocking-issues-count" icon={<AlertCircle className="size-4 text-red-600 shrink-0" />} count={blockingIssues.length} label="criticità bloccanti" badge="Bloccante" tone="red" />
                  )}
                  {missingPrerequisites.length > 0 && (
                    <IssueSummary testId="missing-prerequisites-count" icon={<AlertCircle className="size-4 text-orange-600 shrink-0" />} count={missingPrerequisites.length} label="prerequisiti mancanti" badge="Prerequisito" tone="orange" />
                  )}
                  {warningIssues.length > 0 && (
                    <IssueSummary testId="warning-issues-count" icon={<AlertTriangle className="size-4 text-amber-600 shrink-0" />} count={warningIssues.length} label="attenzioni da controllare" badge="Attenzione" tone="amber" />
                  )}
                </div>
                <ul className="space-y-3" aria-label="Checklist operativa" data-testid="cabina-issues-list">
                  {issueRows.map(({ issue, key }) => {
                    const presentation = ISSUE_PRESENTATION[issue.severity];
                    const availability = resolveTargetAvailability(issue.target);
                    const toneClasses = {
                      red: 'border-red-200 bg-red-50/70 dark:border-red-800/40 dark:bg-red-950/20',
                      orange: 'border-orange-200 bg-orange-50/70 dark:border-orange-800/40 dark:bg-orange-950/20',
                      amber: 'border-amber-200 bg-amber-50/70 dark:border-amber-800/40 dark:bg-amber-950/20',
                    }[presentation.tone];
                    const badgeClasses = {
                      red: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
                      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300',
                      amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
                    }[presentation.tone];

                    return (
                      <li
                        key={key}
                        className={`min-w-0 rounded-2xl border p-4 ${toneClasses}`}
                        data-testid="cabina-issue"
                        data-severity={issue.severity}
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeClasses}`}>
                            {presentation.label}
                          </span>
                        </div>
                        <h4 className="break-words text-sm font-bold leading-snug text-slate-900 dark:text-white">
                          {issue.message}
                        </h4>
                        {issue.userMessage !== issue.message && (
                          <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            {issue.userMessage}
                          </p>
                        )}
                        <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className="break-words text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {availability.targetModule
                              ? `Sezione: ${availability.targetModule.name}`
                              : issue.target
                                ? `Sezione indicata: ${issue.target}`
                                : 'Nessuna sezione specifica'}
                          </span>
                          {availability.targetModule && availability.canNavigate ? (
                            <button
                              type="button"
                              onClick={() => goToRegisteredModule(availability.targetModule!)}
                              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4331] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              {isClosed ? 'Consulta' : 'Apri'} {availability.targetModule.name}
                            </button>
                          ) : (
                            <span className="break-words text-[11px] text-slate-600 dark:text-slate-400">
                              {availability.reason}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Landmark className="size-5 text-[#cc4331]" />
                <span>Situazione fondi</span>
              </h3>
              {!isClosed && (
                <button onClick={() => goToTab('fondoDipendenti')} className="text-xs font-semibold text-[#cc4331] hover:underline">
                  Apri costituzione →
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Fondo dipendenti</p>
                {viewModel.constitution.showDefinitiveTotal && viewModel.constitution.total !== null ? (
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5" data-testid="constitution-definitive-total">
                    {formatCurrency(viewModel.constitution.total)}
                  </p>
                ) : (
                  <div className="mt-0.5">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Totale definitivo non disponibile</p>
                    <p className="text-xs text-slate-500" data-testid="constitution-verified-subtotal">
                      Subtotale verificato: {formatCurrency(viewModel.constitution.verifiedSubtotal)}
                    </p>
                  </div>
                )}
              </div>
              <FundSummary label="EQ" total={totaleEQ} />
              <FundSummary label="Segretario" total={totaleSegretario} />
              <FundSummary label="Dirigenza" total={fundData.annualData.hasDirigenza ? totaleDirigenza : null} />
            </div>
          </div>
          {!isClosed && (
            <button onClick={() => goToTab('fondoDipendenti')} className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
              Gestisci schede di costituzione
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm" data-testid="document-status-card">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-[#cc4331]" />
            <span>Stato documenti</span>
          </h3>
          <button onClick={() => goToTab('reports')} className="text-xs font-semibold text-[#cc4331] hover:underline">
            Apri documenti →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DocumentSummary testId="documents-readiness" label="Proiezione" value={documentLabel} />
          <DocumentSummary testId="documents-revisori" label="Parere revisori" value={viewModel.documents.hasRevisoriParere ? 'Documentato' : 'Non documentato'} />
          <DocumentSummary testId="documents-delibera" label="Delibera di Giunta" value={viewModel.documents.hasDeliberaGC ? 'Documentata' : 'Non documentata'} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
          <Layers className="size-5 text-[#cc4331]" />
          <span>Sintesi canonica del Fondo dipendenti {currentYear}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DocumentSummary testId="constitution-status" label="Stato costituzione" value={constitutionLabel} />
          <DocumentSummary testId="constitution-subtotal" label="Subtotale verificato" value={formatCurrency(viewModel.constitution.verifiedSubtotal)} />
          <DocumentSummary
            testId="constitution-total-summary"
            label="Totale definitivo"
            value={viewModel.constitution.showDefinitiveTotal && viewModel.constitution.total !== null ? formatCurrency(viewModel.constitution.total) : 'Non disponibile'}
            emphasized={viewModel.constitution.showDefinitiveTotal}
          />
        </div>
      </div>
    </div>
  );
};

const FundSummary: React.FC<{ label: string; total: number | null }> = ({ label, total }) => (
  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
    <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
      {total === null ? 'N/A' : formatCurrency(total)}
    </p>
  </div>
);

const DocumentSummary: React.FC<{
  testId: string;
  label: string;
  value: string;
  emphasized?: boolean;
}> = ({ testId, label, value, emphasized = false }) => (
  <div className={`p-4 rounded-2xl border ${emphasized ? 'bg-red-50 border-red-200/60 dark:bg-red-950/20 dark:border-red-900/30' : 'bg-slate-50 border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-700'}`}>
    <p className="text-xs text-slate-500 font-semibold uppercase">{label}</p>
    <p className={`text-base font-bold mt-1 ${emphasized ? 'text-[#cc4331]' : 'text-slate-900 dark:text-white'}`} data-testid={testId}>
      {value}
    </p>
  </div>
);

const IssueSummary: React.FC<{
  testId: string;
  icon: React.ReactNode;
  count: number;
  label: string;
  badge: string;
  tone: 'red' | 'orange' | 'amber';
}> = ({ testId, icon, count, label, badge, tone }) => {
  const toneClasses = {
    red: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800/40 dark:text-red-300',
    orange: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/20 dark:border-orange-800/40 dark:text-orange-300',
    amber: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-300',
  }[tone];
  return (
    <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${toneClasses}`}>
      <div className="flex items-center gap-2.5 text-xs font-semibold">
        {icon}
        <span data-testid={testId}>{count} {label}</span>
      </div>
      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/50 dark:bg-slate-900/30">{badge}</span>
    </div>
  );
};
