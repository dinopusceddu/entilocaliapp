import { 
  CalculationResult, 
  FundResult, 
  CalculationMetadata, 
  CalculationInputSnapshot,
  CalculationAlert
} from '../domain/calculationResult';
import { ComplianceCheck } from '../domain/appState';


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
    art23Compliance?: {
      fondoCostituitoTotale: number;
      risorseEscluseArt23: number;
      risorseRilevantiArt23: number;
      computoFigurativoArt60: number;
      limiteArt23Attualizzato?: number;
      margineResiduo?: number;
      isSforamento: boolean;
      warnings: string[];
      errors: string[];
      valoreArt60VoceFondo?: number;
      valoreArt60Contrattuale?: number;
      valoreArt60Effettivo?: number;
      showWarningDisallineamento?: boolean;
      showWarningStraordinario2016?: boolean;
      art23ComplessivoEnte?: boolean;
      art23Componenti?: {
        comparto: number;
        eq: number;
        segretario: number;
        segretarioQuotaOrdinaria: number;
        segretarioQuotaEsclusaDL19_2026: number;
        segretarioDerogaMode: string;
        dirigenza: number;
        straordinario: number;
        altreVoci: number;
      };
      limiteStorico2016?: number;
      limiteStorico2016Neutralizzato?: number;
      limiteAttualizzato?: number;
      ammontareCorrente?: number;
      margine?: number;
      superamento?: number;
    };
  };
  totals: {
    stabile: number;
    variabile: number;
    totaleFondo: number;
  };
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
      art23c2: { ...input.compliance.art23c2 },
      art23Compliance: input.compliance.art23Compliance ? { ...input.compliance.art23Compliance } : undefined
    },
    totals: { ...input.totals },
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
