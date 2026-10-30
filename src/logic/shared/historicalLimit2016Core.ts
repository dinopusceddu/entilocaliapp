import type { Art23DeterminationStatus } from '../../domain/art23Verification';
﻿/**
 * Core puro per la determinazione del limite storico 2016 (Art. 23 c. 2 D.Lgs. 75/2017).
 * Condiviso tra Wizard 2026 e motore Costituzione Fondo.
 */

export type HistoricalLimit2016Source =
  | 'CERTIFICATO'
  | 'RICOSTRUITO';

export interface HistoricalLimit2016Input {
  certificato?: number | null;
  fondoDipendenti?: number;
  fondoEqPo?: number;
  fondoDirigenza?: number;
  risorseSegretario?: number;
  fondoStraordinario?: number;
  altreVociSoggette?: number;
}

export interface HistoricalLimit2016Result {
  status: Art23DeterminationStatus;
  missingPrerequisites: string[];
  limite2016Base: number;
  fonte: HistoricalLimit2016Source;
  totaleRicostruito: number;
  differenzaCertificatoMenoRicostruito?: number;
}

/**
 * Calcola in modo puro e deterministico il limite storico 2016.
 * 
 * Regole:
 * 1. La somma delle componenti presenti resta un subtotale tecnico compatibile con i lettori legacy.
 *    Senza certificato, soltanto una ricostruzione completa qualifica il limite: zero è presente,
 *    l'assenza non lo è. Non si inferisce l'applicabilità storica dalla dirigenza corrente.
 * 2. Il totale ricostruito è la somma aritmetica di tutte le componenti storiche fornite.
 * 3. Il certificato prevale se !== undefined e !== null (anche se pari a 0 o negativo).
 * 4. In assenza di certificato, la fonte è 'RICOSTRUITO' e il limite base è il totale ricostruito.
 */
export function calculateHistoricalLimit2016Core(
  input: HistoricalLimit2016Input
): HistoricalLimit2016Result {
  const fields = ['fondoDipendenti', 'fondoEqPo', 'fondoDirigenza', 'risorseSegretario', 'fondoStraordinario'] as const;
  const invalid = Object.entries(input).filter(([, value]) => value != null &&
    (typeof value !== 'number' || !Number.isFinite(value) || value < 0)).map(([key]) => 'HISTORICAL_2016_INVALID:' + key);
  const missing = fields.filter(key => input[key] == null).map(key => 'HISTORICAL_2016_MISSING:' + key);
  const p = input.fondoDipendenti || 0;
  const eq = input.fondoEqPo || 0;
  const dir = input.fondoDirigenza || 0;
  const seg = input.risorseSegretario || 0;
  const str = input.fondoStraordinario || 0;
  const altre = input.altreVociSoggette || 0;

  const totaleRicostruito = p + eq + dir + seg + str + altre;

  const cert = input.certificato;
  const hasCert = cert !== undefined && cert !== null;

  if (hasCert) {
    return {
      status: !Number.isFinite(cert) || cert < 0 ? 'INVALID' : 'VALID',
      missingPrerequisites: !Number.isFinite(cert) || cert < 0 ? ['HISTORICAL_2016_CERTIFICATE_INVALID'] : [],
      limite2016Base: cert,
      fonte: 'CERTIFICATO',
      totaleRicostruito,
      differenzaCertificatoMenoRicostruito: cert - totaleRicostruito
    };
  }

  return {
    status: invalid.length ? 'INVALID' : missing.length ? 'UNDETERMINED' : 'VALID',
    missingPrerequisites: [...invalid, ...missing],
    limite2016Base: totaleRicostruito,
    fonte: 'RICOSTRUITO',
    totaleRicostruito
  };
}
