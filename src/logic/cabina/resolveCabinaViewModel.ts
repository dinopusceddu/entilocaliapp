import type {
  CalculationResult,
  ComplianceCheck,
  DistribuzioneRisorseData,
  FundDocumentProjection,
} from '../../domain';
import { AnnualSnapshotStatus } from '../../domain';
import { resolveChecklist, type CabinaIssue } from './resolveChecklist';
import {
  resolveDistributionStatus,
  type DistributionStatus,
} from './resolveDistributionStatus';
import {
  resolveOperationalStatus,
  type OperationalStatus,
} from './resolveOperationalStatus';

export interface WizardProgressAccessory {
  completed: number;
  total: number;
  hasData: boolean;
}

type DocumentReadModel = Pick<
  FundDocumentProjection,
  'exportReadiness' | 'hasRevisoriParere' | 'hasDeliberaGC'
>;

export interface CabinaOperationalViewModel {
  status: OperationalStatus;
  constitution: {
    canonicalStatus: 'VALID' | 'INVALID' | 'UNDETERMINED' | 'NOT_STARTED';
    total: number | null;
    verifiedSubtotal: number;
    showDefinitiveTotal: boolean;
  };
  distribution: {
    status: DistributionStatus;
    hasExistingWork: boolean;
  };
  documents: DocumentReadModel;
  issues: CabinaIssue[];
  primaryAction: { label: string; target: string } | null;
  secondaryActions: Array<{ label: string; target: string }>;
  wizardProgressAccessory: WizardProgressAccessory | null;
}

export interface ResolveCabinaViewModelInput {
  snapshotStatus?: AnnualSnapshotStatus;
  calculationResult?: Pick<CalculationResult, 'canonicalFund'>;
  distribuzioneRisorseData?: DistribuzioneRisorseData | null;
  complianceChecks?: readonly ComplianceCheck[];
  documentProjection?: DocumentReadModel | null;
  wizardProgressAccessory?: WizardProgressAccessory | null;
}

const PRIMARY_ACTIONS: Record<
  Exclude<OperationalStatus, 'CLOSED'>,
  { label: string; target: string }
> = {
  NOT_STARTED: { label: 'Inizia raccolta dati', target: 'wizard2026Preview' },
  BLOCKED: { label: 'Apri le verifiche', target: 'compliance' },
  TO_COMPLETE: { label: 'Vai alla Costituzione', target: 'fondoDipendenti' },
  CONSTITUTION_VERIFIED: { label: 'Inizia la Distribuzione', target: 'distribuzioneRisorse' },
  DISTRIBUTION_IN_PROGRESS: { label: 'Riprendi la Distribuzione', target: 'distribuzioneRisorse' },
};

const RESUME_DISTRIBUTION_ACTION = {
  label: 'Riprendi la Distribuzione',
  target: 'distribuzioneRisorse',
};

function resolveConstitution(
  calculationResult?: Pick<CalculationResult, 'canonicalFund'>
): CabinaOperationalViewModel['constitution'] {
  if (!calculationResult) {
    return {
      canonicalStatus: 'NOT_STARTED',
      total: null,
      verifiedSubtotal: 0,
      showDefinitiveTotal: false,
    };
  }

  const { canonicalFund } = calculationResult;
  const isValid = canonicalFund.status === 'VALID';
  return {
    canonicalStatus: canonicalFund.status,
    total: isValid ? canonicalFund.total : null,
    verifiedSubtotal: canonicalFund.verifiedTotal,
    showDefinitiveTotal: isValid,
  };
}

export function resolveCabinaViewModel({
  snapshotStatus,
  calculationResult,
  distribuzioneRisorseData,
  complianceChecks = [],
  documentProjection,
  wizardProgressAccessory = null,
}: ResolveCabinaViewModelInput): CabinaOperationalViewModel {
  const distributionStatus = resolveDistributionStatus(distribuzioneRisorseData);
  const status = resolveOperationalStatus({
    snapshotStatus,
    calculationResult,
    distributionStatus,
  });

  return {
    status,
    constitution: resolveConstitution(calculationResult),
    distribution: {
      status: distributionStatus,
      hasExistingWork: distributionStatus === 'IN_PROGRESS',
    },
    documents: documentProjection ?? {
      exportReadiness: 'DOCUMENT_DRAFT',
      hasRevisoriParere: false,
      hasDeliberaGC: false,
    },
    issues: resolveChecklist({
      complianceChecks,
      canonicalFund: calculationResult?.canonicalFund,
    }),
    primaryAction: status === 'CLOSED' ? null : { ...PRIMARY_ACTIONS[status] },
    secondaryActions:
      status === 'TO_COMPLETE' && distributionStatus === 'IN_PROGRESS'
        ? [{ ...RESUME_DISTRIBUTION_ACTION }]
        : [],
    wizardProgressAccessory,
  };
}
