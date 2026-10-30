import { 
  CalculationResult, 
  FundResult, 
  CalculationMetadata, 
  CalculationInputSnapshot,
  CalculationAlert,
  ComplianceCheck,
  SimulatoreIncrementoRisultati,
  ReductionResult,
  CanonicalFundResult
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
  canonicalFund: CanonicalFundResult;
  compliance: {
    checks: ComplianceCheck[];
    dirigenzaArt23?: CalculationResult['compliance']['dirigenzaArt23'];
    art23c2: CalculationResult['compliance']['art23c2'];
    art23Compliance?: CalculationResult['compliance']['art23Compliance'];
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
    canonicalFund: {
      ...input.canonicalFund,
      entries: [...input.canonicalFund.entries],
      warnings: [...input.canonicalFund.warnings],
      missingPrerequisites: [...input.canonicalFund.missingPrerequisites],
    },
    compliance: {
      checks: [...input.compliance.checks],
      ...(input.compliance.dirigenzaArt23 ? { dirigenzaArt23: input.compliance.dirigenzaArt23 } : {}),
      art23c2: { ...input.compliance.art23c2 },
      art23Compliance: input.compliance.art23Compliance ? { ...input.compliance.art23Compliance } : undefined
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
