import {
  Art33ApplicabilityStatus,
  Art33ApplicabilityResult,
  resolveArt33Applicability,
} from './art33Applicability';
import type {
  EntityClassificationType,
  EntityTerritorialContext,
  Art33ManualDecision,
} from '../../domain/entityClassification';
import { TipologiaEnte } from '../../domain/enums';
import type { AnnualData } from '../../domain/types';

export type Art33ApplicationAction =
  | 'APPLY'
  | 'SKIP'
  | 'BLOCK';

export interface Art33ApplicationPolicyResult {
  action: Art33ApplicationAction;
  applicability: Art33ApplicabilityResult;
  reason: string;
}

/**
 * Matrice pura per la determinazione dell'azione operativa (APPLY, SKIP, BLOCK).
 *
 * - DIRECTLY_APPLICABLE -> APPLY (indipendentemente da manualDecision)
 * - NOT_DIRECTLY_APPLICABLE -> SKIP (indipendentemente da manualDecision)
 * - NEEDS_MANUAL_REVIEW:
 *   - APPLY -> APPLY
 *   - DO_NOT_APPLY -> SKIP
 *   - undefined -> BLOCK
 */
export function resolveArt33ApplicationAction(
  applicabilityStatus: Art33ApplicabilityStatus,
  manualDecision?: Art33ManualDecision
): Art33ApplicationAction {
  if (applicabilityStatus === 'DIRECTLY_APPLICABLE') {
    return 'APPLY';
  }

  if (applicabilityStatus === 'NOT_DIRECTLY_APPLICABLE') {
    return 'SKIP';
  }

  // NEEDS_MANUAL_REVIEW
  if (manualDecision === 'APPLY') {
    return 'APPLY';
  }
  if (manualDecision === 'DO_NOT_APPLY') {
    return 'SKIP';
  }

  return 'BLOCK';
}

/**
 * Mapping puro di runtime per retrocompatibilità con la vecchia TipologiaEnte.
 * Non modifica né migra i dati persistiti.
 */
export function mapLegacyTipologiaEnteToArt33EntityType(
  tipologiaEnte?: TipologiaEnte | string
): EntityClassificationType | undefined {
  switch (tipologiaEnte) {
    case TipologiaEnte.COMUNE:
    case 'COMUNE':
      return 'COMUNE';
    case TipologiaEnte.PROVINCIA:
    case 'PROVINCIA':
      return 'PROVINCIA';
    case TipologiaEnte.UNIONE_COMUNI:
    case 'UNIONE':
    case 'UNIONE_COMUNI':
      return 'UNIONE_COMUNI';
    case TipologiaEnte.COMUNITA_MONTANA:
    case 'COMUNITA_MONTANA':
      return 'COMUNITA_MONTANA';
    case TipologiaEnte.ALTRO:
    case 'ALTRO':
      return 'ALTRO';
    default:
      return undefined;
  }
}

export interface ResolveArt33ApplicationPolicyParams {
  entityType?: EntityClassificationType;
  territorialContext?: EntityTerritorialContext;
  referenceYear?: number;
  manualDecision?: Art33ManualDecision;
}

/**
 * Risolutore contestuale condiviso dell'applicabilità e della policy operativa.
 */
export function resolveArt33ApplicationPolicy(
  params: ResolveArt33ApplicationPolicyParams
): Art33ApplicationPolicyResult {
  const referenceDate =
    typeof params.referenceYear === 'number' &&
    Number.isInteger(params.referenceYear) &&
    params.referenceYear >= 1000 &&
    params.referenceYear <= 9999
      ? `${params.referenceYear}-12-31`
      : undefined;

  const applicability = resolveArt33Applicability(params.entityType, {
    territorialContext: params.territorialContext,
    referenceDate,
  });

  const action = resolveArt33ApplicationAction(applicability.status, params.manualDecision);

  let reason = applicability.reason;
  if (action === 'APPLY') {
    if (applicability.status === 'NEEDS_MANUAL_REVIEW') {
      reason = "Adeguamento Art. 33 applicato in base all'esito della verifica manuale registrata.";
    } else {
      reason = "Adeguamento Art. 33 applicato in conformità al regime di applicazione diretta.";
    }
  } else if (action === 'SKIP') {
    if (applicability.status === 'NEEDS_MANUAL_REVIEW') {
      reason = "Adeguamento Art. 33 non applicato in base all'esito della verifica manuale registrata.";
    } else {
      reason = "Adeguamento Art. 33 non applicato perché l'ente non rientra nell'ambito di applicazione diretta individuato.";
    }
  } else if (action === 'BLOCK') {
    reason = "L'applicabilità dell'adeguamento Art. 33 richiede una verifica manuale. Completa la classificazione dell'ente e indica se applicare o non applicare l'adeguamento prima di procedere al calcolo.";
  }

  return {
    action,
    applicability,
    reason,
  };
}

export interface Art33AnnualDataPolicyResult extends Art33ApplicationPolicyResult {
  effectiveEntityType?: EntityClassificationType;
  territorialContext?: EntityTerritorialContext;
  classificationSource: 'CANONICAL' | 'LEGACY_FALLBACK' | 'MISSING';
}

/**
 * Helper condiviso per estrarre e risolvere la policy dell'Art. 33 a partire da AnnualData.
 * Garantisce la precedenza della classificazione canonica su quella legacy,
 * e assicura che territorialContext provenga esclusivamente dalla classificazione canonica.
 */
export function resolveArt33AnnualDataPolicy(
  annualData?: Partial<AnnualData>
): Art33AnnualDataPolicyResult {
  let effectiveEntityType: EntityClassificationType | undefined;
  let classificationSource: 'CANONICAL' | 'LEGACY_FALLBACK' | 'MISSING' = 'MISSING';

  if (annualData?.entityClassification?.entityType) {
    effectiveEntityType = annualData.entityClassification.entityType;
    classificationSource = 'CANONICAL';
  } else if (annualData?.tipologiaEnte) {
    const mapped = mapLegacyTipologiaEnteToArt33EntityType(annualData.tipologiaEnte);
    if (mapped) {
      effectiveEntityType = mapped;
      classificationSource = 'LEGACY_FALLBACK';
    }
  }

  const territorialContext = annualData?.entityClassification?.territorialContext;
  const referenceYear = annualData?.annoRiferimento;
  const manualDecision = annualData?.art33ManualDecision;

  const policyResult = resolveArt33ApplicationPolicy({
    entityType: effectiveEntityType,
    territorialContext,
    referenceYear,
    manualDecision,
  });

  return {
    ...policyResult,
    effectiveEntityType,
    territorialContext,
    classificationSource,
  };
}
