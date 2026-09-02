import { Wizard2026EntityType } from '../wizard2026/types';

export type Art33ApplicabilityStatus =
  | 'DIRECTLY_APPLICABLE'
  | 'NOT_DIRECTLY_APPLICABLE'
  | 'NEEDS_MANUAL_REVIEW';

export type Art33LegalBasis =
  | 'ART33_COMMA_1'
  | 'ART33_COMMA_1_BIS'
  | 'ART33_COMMA_2';

export type Art33TerritorialContext =
  | 'ORDINARY_REGIME'
  | 'SICILIAN_AREA_VASTA'
  | 'OTHER_SPECIAL_AUTONOMY'
  | 'UNKNOWN';

export interface Art33ApplicabilityOptions {
  referenceDate?: string;
  territorialContext?: Art33TerritorialContext;
}

export interface Art33ApplicabilityResult {
  status: Art33ApplicabilityStatus;
  legalBasis?: Art33LegalBasis;
  effectiveFrom?: string;
  reason: string;
}

/**
 * Valida rigorosamente che una stringa rappresenti una data civile valida in formato ISO YYYY-MM-DD.
 */
function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) {
    return false;
  }

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonths = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day < 1 || day > daysInMonths[month - 1]) {
    return false;
  }

  return true;
}

/**
 * Risolve l'ambito soggettivo e temporale dell'adeguamento del limite del salario
 * accessorio ex art. 33 D.L. 34/2019.
 *
 * NOTE NORMATIVE:
 * - Comuni: art. 33 comma 2, decorrenza 20/04/2020 (D.M. 17 marzo 2020).
 * - Province e Città Metropolitane: art. 33 comma 1-bis, decorrenza 01/01/2022 (D.M. 11 gennaio 2022).
 *   Nota: Il D.M. 11 gennaio 2022 dichiara espressamente non direttamente applicabili le proprie
 *   disposizioni agli enti di area vasta della Regione Siciliana. Le altre autonomie speciali
 *   richiedono verifica specifica dell'ordinamento territoriale applicabile.
 * - Regioni a statuto ordinario: art. 33 comma 1, decorrenza 01/01/2020.
 *   Riservato alle regioni a statuto ordinario; per statuti speciali o contesto sconosciuto
 *   è richiesta verifica manuale / non applicabilità diretta.
 * - Unioni di Comuni: Delibera Corte dei conti Sez. Autonomie n. 4/SEZAUT/2021/QMIG (escluse dall'applicazione diretta).
 * - Comunità Montane/Isolane e altri enti strumentali: non ricompresi nell'ambito soggettivo espresso dei commi 1, 1-bis e 2.
 *
 * @param entityType Tipologia ente da Wizard2026EntityType
 * @param options Opzioni opzionali contenenti data di riferimento ISO (YYYY-MM-DD) e contesto territoriale
 */
export function resolveArt33Applicability(
  entityType: Wizard2026EntityType | undefined,
  options: Art33ApplicabilityOptions = {}
): Art33ApplicabilityResult {
  const { referenceDate, territorialContext } = options;

  if (referenceDate !== undefined && !isValidIsoDate(referenceDate)) {
    return {
      status: 'NEEDS_MANUAL_REVIEW',
      reason: 'Data di riferimento non valida: usare il formato ISO YYYY-MM-DD con una data civile esistente.'
    };
  }

  if (!entityType) {
    return {
      status: 'NEEDS_MANUAL_REVIEW',
      reason: "Tipologia ente non specificata: impossibile determinare automaticamente l'ambito soggettivo ex art. 33 D.L. 34/2019."
    };
  }

  switch (entityType) {
    case 'COMUNE': {
      const effectiveFrom = '2020-04-20';
      if (referenceDate !== undefined && referenceDate < effectiveFrom) {
        return {
          status: 'NOT_DIRECTLY_APPLICABLE',
          legalBasis: 'ART33_COMMA_2',
          effectiveFrom,
          reason: `Ambito soggettivo Comune ex art. 33, comma 2, D.L. 34/2019 non ancora efficace alla data specificata (${referenceDate}); decorrenza dal ${effectiveFrom}.`
        };
      }
      return {
        status: 'DIRECTLY_APPLICABLE',
        legalBasis: 'ART33_COMMA_2',
        effectiveFrom,
        reason: 'Applicazione diretta ex art. 33, comma 2, D.L. 34/2019 e D.M. 17 marzo 2020 per i Comuni.'
      };
    }

    case 'PROVINCIA': {
      const effectiveFrom = '2022-01-01';

      if (territorialContext === 'SICILIAN_AREA_VASTA') {
        return {
          status: 'NOT_DIRECTLY_APPLICABLE',
          legalBasis: 'ART33_COMMA_1_BIS',
          effectiveFrom,
          reason: 'Il D.M. 11 gennaio 2022 dichiara non direttamente applicabili le proprie disposizioni agli enti di area vasta della Regione Siciliana.'
        };
      }

      if (territorialContext === 'OTHER_SPECIAL_AUTONOMY') {
        return {
          status: 'NEEDS_MANUAL_REVIEW',
          legalBasis: 'ART33_COMMA_1_BIS',
          effectiveFrom,
          reason: "Provincia o ente equiparato appartenente ad autonomia speciale: richiede verifica specifica dell'ordinamento territoriale applicabile."
        };
      }

      if (territorialContext === 'ORDINARY_REGIME') {
        if (referenceDate !== undefined && referenceDate < effectiveFrom) {
          return {
            status: 'NOT_DIRECTLY_APPLICABLE',
            legalBasis: 'ART33_COMMA_1_BIS',
            effectiveFrom,
            reason: `Ambito soggettivo Provincia ex art. 33, comma 1-bis, D.L. 34/2019 non ancora efficace alla data specificata (${referenceDate}); decorrenza dal ${effectiveFrom}.`
          };
        }
        return {
          status: 'DIRECTLY_APPLICABLE',
          legalBasis: 'ART33_COMMA_1_BIS',
          effectiveFrom,
          reason: 'Applicazione diretta ex art. 33, comma 1-bis, D.L. 34/2019 e D.M. 11 gennaio 2022 per le Province a statuto ordinario.'
        };
      }

      // UNKNOWN or undefined context
      return {
        status: 'NEEDS_MANUAL_REVIEW',
        legalBasis: 'ART33_COMMA_1_BIS',
        effectiveFrom,
        reason: "Regime territoriale non specificato per la Provincia: necessaria verifica dell'ordinamento ordinario vs speciale."
      };
    }

    case 'CITTA_METROPOLITANA': {
      const effectiveFrom = '2022-01-01';

      if (territorialContext === 'SICILIAN_AREA_VASTA') {
        return {
          status: 'NOT_DIRECTLY_APPLICABLE',
          legalBasis: 'ART33_COMMA_1_BIS',
          effectiveFrom,
          reason: 'Il D.M. 11 gennaio 2022 dichiara non direttamente applicabili le proprie disposizioni agli enti di area vasta della Regione Siciliana.'
        };
      }

      if (territorialContext === 'OTHER_SPECIAL_AUTONOMY') {
        return {
          status: 'NEEDS_MANUAL_REVIEW',
          legalBasis: 'ART33_COMMA_1_BIS',
          effectiveFrom,
          reason: "Città Metropolitana appartenente ad autonomia speciale: richiede verifica specifica dell'ordinamento territoriale applicabile."
        };
      }

      if (territorialContext === 'ORDINARY_REGIME') {
        if (referenceDate !== undefined && referenceDate < effectiveFrom) {
          return {
            status: 'NOT_DIRECTLY_APPLICABLE',
            legalBasis: 'ART33_COMMA_1_BIS',
            effectiveFrom,
            reason: `Ambito soggettivo Città Metropolitana ex art. 33, comma 1-bis, D.L. 34/2019 non ancora efficace alla data specificata (${referenceDate}); decorrenza dal ${effectiveFrom}.`
          };
        }
        return {
          status: 'DIRECTLY_APPLICABLE',
          legalBasis: 'ART33_COMMA_1_BIS',
          effectiveFrom,
          reason: 'Applicazione diretta ex art. 33, comma 1-bis, D.L. 34/2019 e D.M. 11 gennaio 2022 per le Città Metropolitane a statuto ordinario.'
        };
      }

      // UNKNOWN or undefined context
      return {
        status: 'NEEDS_MANUAL_REVIEW',
        legalBasis: 'ART33_COMMA_1_BIS',
        effectiveFrom,
        reason: "Regime territoriale non specificato per la Città Metropolitana: necessaria verifica dell'ordinamento ordinario vs speciale."
      };
    }

    case 'REGIONE': {
      const effectiveFrom = '2020-01-01';

      if (territorialContext === 'ORDINARY_REGIME') {
        if (referenceDate !== undefined && referenceDate < effectiveFrom) {
          return {
            status: 'NOT_DIRECTLY_APPLICABLE',
            legalBasis: 'ART33_COMMA_1',
            effectiveFrom,
            reason: `Ambito soggettivo Regione a statuto ordinario ex art. 33, comma 1, D.L. 34/2019 non ancora efficace alla data specificata (${referenceDate}); decorrenza dal ${effectiveFrom}.`
          };
        }
        return {
          status: 'DIRECTLY_APPLICABLE',
          legalBasis: 'ART33_COMMA_1',
          effectiveFrom,
          reason: 'Applicazione diretta ex art. 33, comma 1, D.L. 34/2019 per le Regioni a statuto ordinario.'
        };
      }

      if (territorialContext === 'OTHER_SPECIAL_AUTONOMY') {
        return {
          status: 'NOT_DIRECTLY_APPLICABLE',
          legalBasis: 'ART33_COMMA_1',
          effectiveFrom,
          reason: "Regione a statuto speciale non compresa nell'ambito soggettivo dell'art. 33, comma 1, D.L. 34/2019 (riservato alle regioni a statuto ordinario)."
        };
      }

      return {
        status: 'NEEDS_MANUAL_REVIEW',
        legalBasis: 'ART33_COMMA_1',
        effectiveFrom,
        reason: 'Art. 33, comma 1, si applica direttamente alle regioni a statuto ordinario; il tipo generico REGIONE o il contesto specificato non consente di confermare il regime statutario ordinario.'
      };
    }

    case 'UNIONE_COMUNI':
      return {
        status: 'NOT_DIRECTLY_APPLICABLE',
        reason: 'Sezione delle Autonomie Corte dei conti n. 4/SEZAUT/2021/QMIG: art. 33, comma 2, D.L. 34/2019 e D.M. 17 marzo 2020 non si applicano direttamente alle Unioni di Comuni.'
      };

    case 'COMUNITA_MONTANA':
    case 'COMUNITA_ISOLANA_O_ARCIPELAGO':
      return {
        status: 'NOT_DIRECTLY_APPLICABLE',
        reason: "Ente non ricompreso nell'ambito soggettivo espresso dei commi 1, 1-bis e 2 dell'art. 33 D.L. 34/2019; resta fermo il limite ex art. 23, comma 2, D.Lgs. 75/2017."
      };

    case 'CAMERA_COMMERCIO':
    case 'ENTE_REGIONALE':
    case 'ENTE_PARCO':
    case 'CONSORZIO':
    case 'ASP':
    case 'AZIENDA_SPECIALE':
    case 'ISTITUZIONE':
    case 'ALTRO_ENTE_STRUMENTALE':
      return {
        status: 'NOT_DIRECTLY_APPLICABLE',
        reason: "Ente non compreso nell'ambito soggettivo diretto dell'art. 33, commi 1, 1-bis e 2; resta fermo il limite ex art. 23, comma 2, salvo specifiche norme derogatorie."
      };

    case 'ALTRO':
      return {
        status: 'NEEDS_MANUAL_REVIEW',
        reason: "Tipologia ente non classificata: richiede verifica manuale del regime normativo applicabile ai sensi dell'art. 33 D.L. 34/2019."
      };

    default: {
      const _exhaustiveCheck: never = entityType;
      return {
        status: 'NEEDS_MANUAL_REVIEW',
        reason: `Tipologia ente non gestita (${_exhaustiveCheck}): verifica manuale richiesta.`
      };
    }
  }
}
