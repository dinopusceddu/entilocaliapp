import { 
  CalculationResult, 
  FundResult, 
  CalculationMetadata, 
  CalculationInputSnapshot,
  CalculationAlert,
  ComplianceCheck,
  SimulatoreIncrementoRisultati,
  ReductionResult
} from '../../domain';


export interface CalculationResultBuilderInput {
  metadata: CalculationMetadata;
  inputs: CalculationInputSnapshot;
  fondi: {
    dipendente: FundResult;
    eq: FundResult;
    segretario: FundResult;
    dirigenza: FundResult;
  };
  compliance: {
    checks: ComplianceCheck[];
    art23c2: {
      limite: number;
      valoreSoggetto: number;
      delta: number;
      isCompliant: boolean;
    };
  };
  reductions?: ReductionResult;
  totals: {
    stabile: number;
    variabile: number;
    totaleFondo: number;
  };
  simulatore?: SimulatoreIncrementoRisultati;
  alerts: CalculationAlert[];
}

/**
 * Factory for creating a CalculationResult object in a type-safe way.
 * This encapsulates the construction and ensures the output is a valid CalculationResult.
 */
export const buildCalculationResult = (input: CalculationResultBuilderInput): CalculationResult => {
  // We use a simple object literal construction which satisfies the type.
  // This avoids 'as any' and incremental mutation of readonly properties.
  return {
    metadata: { ...input.metadata },
    inputs: { ...input.inputs },
    fondi: {
      dipendente: { ...input.fondi.dipendente },
      eq: { ...input.fondi.eq },
      segretario: { ...input.fondi.segretario },
      dirigenza: { ...input.fondi.dirigenza }
    },
    compliance: {
      checks: [...input.compliance.checks],
      art23c2: { ...input.compliance.art23c2 }
    },
    reductions: input.reductions ? { ...input.reductions } : undefined,
    totals: { ...input.totals },
    simulatore: input.simulatore ? { ...input.simulatore } : undefined,
    alerts: [...input.alerts]
  };
};

/**
 * Creates an empty/initial FundResult structure.
 */
export const createEmptyFundResult = (label: string): FundResult => ({
  label,
  summary: {
    totaleStabile: 0,
    totaleVariabile: 0,
    totaleFondo: 0
  }
});
