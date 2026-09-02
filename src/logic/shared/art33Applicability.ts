import { Wizard2026EntityType } from '../wizard2026/types';

export type Art33ApplicabilityStatus =
  | 'DIRECTLY_APPLICABLE'
  | 'NOT_DIRECTLY_APPLICABLE'
  | 'NEEDS_MANUAL_REVIEW';

export type Art33LegalBasis =
  | 'ART33_COMMA_1'
  | 'ART33_COMMA_1_BIS'
  | 'ART33_COMMA_2';

export interface Art33ApplicabilityResult {
  status: Art33ApplicabilityStatus;
  legalBasis?: Art33LegalBasis;
  effectiveFrom?: string;
  reason: string;
}

/**
 * Risolve l'ambito soggettivo e temporale dell'adeguamento del limite del salario
 * accessorio ex art. 33 D.L. 34/2019.
 *
 * NOTE NORMATIVE:
 * - Comuni: art. 33 comma 2, decorrenza 20/04/2020 (D.M. 17 marzo 2020).
 * - Province e Città Metropolitane: art. 33 comma 1-bis, decorrenza 01/01/2022 (D.M. 11 gennaio 2022).
 *   Nota: Eventuali Province o enti equiparati di Regioni a Statuto Speciale/Province Autonome
 *   e specificità per Città Metropolitane siciliane richiedono verifica dell'ordinamento territoriale.
 * - Regioni a statuto ordinario: art. 33 comma 1, decorrenza 01/01/2020.
 *   Poiché il modello dati attuale non distingue lo statuto ordinario da quello speciale,
 *   la tipologia generica REGIONE richiede verifica manuale.
 * - Unioni di Comuni: Delibera Corte dei conti Sez. Autonomie n. 4/SEZAUT/2021/QMIG (escluse dall'applicazione diretta).
 * - Comunità Montane/Isolane e altri enti strumentali: non ricompresi nell'ambito soggettivo espresso dei commi 1, 1-bis e 2.
 *
 * @param entityType Tipologia ente da Wizard2026EntityType
 * @param referenceDate Data di riferimento ISO (YYYY-MM-DD). Se omessa, valuta solo l'ambito soggettivo.
 */
export function resolveArt33Applicability(
  entityType: Wizard2026EntityType | undefined,
  referenceDate?: string
): Art33ApplicabilityResult {
  if (!entityType) {
    return {
      status: 'NEEDS_MANUAL_REVIEW',
      reason: "Tipologia ente non specificata: impossibile determinare automaticamente l'ambito soggettivo ex art. 33 D.L. 34/2019."
    };
  }

  switch (entityType) {
    case 'COMUNE': {
      const effectiveFrom = '2020-04-20';
      if (referenceDate && referenceDate < effectiveFrom) {
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
      if (referenceDate && referenceDate < effectiveFrom) {
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
        reason: 'Applicazione diretta ex art. 33, comma 1-bis, D.L. 34/2019 e D.M. 11 gennaio 2022 per le Province (salvo specificità di ordinamenti speciali).'
      };
    }

    case 'CITTA_METROPOLITANA': {
      const effectiveFrom = '2022-01-01';
      if (referenceDate && referenceDate < effectiveFrom) {
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
        reason: 'Applicazione diretta ex art. 33, comma 1-bis, D.L. 34/2019 e D.M. 11 gennaio 2022 per le Città Metropolitane.'
      };
    }

    case 'REGIONE':
      return {
        status: 'NEEDS_MANUAL_REVIEW',
        legalBasis: 'ART33_COMMA_1',
        effectiveFrom: '2020-01-01',
        reason: 'Art. 33, comma 1, si applica direttamente alle regioni a statuto ordinario; il tipo generico REGIONE non consente di distinguere il regime statutario.'
      };

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
