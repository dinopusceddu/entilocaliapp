import { ComplianceCheck } from './appState';
import { SimulatoreIncrementoRisultati } from './types';

/**
 * Metadata del calcolo.
 */
export interface CalculationMetadata {
  readonly annoRiferimento: number;
  readonly denominazioneEnte?: string;
  readonly timestamp: string;
}

/**
 * Snapshot degli input normalizzati rilevanti per il calcolo.
 */
export interface CalculationInputSnapshot {
  readonly hasDirigenza: boolean;
  readonly isEnteInCondizioniSpeciali: boolean;
  readonly numeroAbitanti?: number;
  readonly tipologiaEnte?: string;
  readonly fteAnnoRiferimento: number;
}

/**
 * Risultato strutturato del calcolo delle decurtazioni.
 */
export interface ReductionResult {
  readonly totalFadReductions: number;
  readonly totalEqReductions: number;
  readonly totalDirigenzaReductions: number;
  readonly details: {
    readonly fad: {
      readonly taglioDL78_2010: number;
      readonly riduzioniPersonaleATA_PO_Esternalizzazioni: number;
      readonly decurtazionePO_AP: number;
      readonly riduzionePerIncrementoEQ: number;
      readonly riduzioneFondoStraordinario: number;
      readonly decurtazioneIndennitaComparto2026: number;
      readonly decurtazioneLimiteArt23: number;
      readonly misureMancatoRispettoVincoli: number;
    };
    readonly eq: {
      readonly adeguamentoTetto2016: number;
    };
    readonly dirigenza: {
      readonly misureMancatoRispettoVincoli: number;
    };
  };
}

/**
 * Singola voce di calcolo con metadati descrittivi.
 */
export interface CalculationSectionItem {
  readonly key: string;
  readonly description: string;
  readonly amount: number;
  readonly riferimentoNormativo?: string;
  readonly isRelevantToArt23Limit: boolean;
  readonly operator: '+' | '-';
  readonly isSubtractor: boolean;
}

/**
 * Sezione raggruppata di voci di calcolo (es. "Risorse Stabili").
 */
export interface CalculationSection {
  readonly id: string;
  readonly title: string;
  readonly items: CalculationSectionItem[];
  readonly total: number;
}

/**
 * Dettaglio del risultato per un singolo sotto-fondo (es. Dipendenti, EQ).
 */
export interface FundResult {
  readonly label: string;
  readonly constitution?: {
    readonly sections: Record<string, CalculationSection>;
  };
  readonly utilization?: {
    readonly sections: Record<string, CalculationSection>;
  };
  readonly summary: {
    readonly totaleStabile: number;
    readonly totaleVariabile: number;
    readonly totaleFondo: number;
  };
}

/**
 * Alert o warning generato durante il calcolo.
 */
export interface CalculationAlert {
  readonly id: string;
  readonly message: string;
  readonly severity: 'info' | 'warning' | 'error';
}

/**
 * DTO Canonico del risultato di calcolo del fondo.
 */
export interface CalculationResult {
  readonly metadata: CalculationMetadata;
  readonly inputs: CalculationInputSnapshot;
  readonly fondi: {
    readonly dipendente: FundResult;
    readonly eq: FundResult;
    readonly segretario: FundResult;
    readonly dirigenza: FundResult;
  };
  readonly compliance: {
    readonly checks: ComplianceCheck[];
    readonly art23c2: {
      readonly limite: number;
      readonly valoreSoggetto: number;
      readonly delta: number;
      readonly isCompliant: boolean;
    };
    readonly art23Compliance?: {
      readonly fondoCostituitoTotale: number;
      readonly risorseEscluseArt23: number;
      readonly risorseRilevantiArt23: number;
      readonly computoFigurativoArt60: number;
      readonly limiteArt23Attualizzato?: number;
      readonly margineResiduo?: number;
      readonly isSforamento: boolean;
      readonly warnings: string[];
      readonly errors: string[];
      readonly valoreArt60VoceFondo?: number;
      readonly valoreArt60Contrattuale?: number;
      readonly valoreArt60Effettivo?: number;
      readonly showWarningDisallineamento?: boolean;
      readonly showWarningStraordinario2016?: boolean;
      readonly art23ComplessivoEnte?: boolean;
      readonly art23Componenti?: {
        readonly comparto: number;
        readonly eq: number;
        readonly segretario: number;
        readonly segretarioQuotaOrdinaria: number;
        readonly segretarioQuotaEsclusaDL19_2026: number;
        readonly segretarioDerogaMode: string;
        readonly dirigenza: number;
        readonly straordinario: number;
        readonly altreVoci: number;
      };
      readonly limiteStorico2016?: number;
      readonly limiteStorico2016Neutralizzato?: number;
      readonly limiteAttualizzato?: number;
      readonly ammontareCorrente?: number;
      readonly margine?: number;
      readonly superamento?: number;
    };
  };
  readonly reductions?: ReductionResult;
  readonly totals: {
    readonly stabile: number;
    readonly variabile: number;
    readonly totaleFondo: number;
  };
  readonly simulatore?: SimulatoreIncrementoRisultati;
  readonly alerts: CalculationAlert[];
}
