
/**
 * Strutture dati riusabili e atomiche del dominio del fondo.
 */

export interface FundComponent {
  descrizione: string;
  importo: number;
  riferimento: string;
  tipo: 'stabile' | 'variabile';
  esclusoDalLimite2016?: boolean;
}

export interface FundDetailTotals {
  stabile: number;
  variabile: number;
  totale: number;
}

export interface RisorsaVariabileDetail {
  stanziate?: number;
  risparmi?: number;
  aBilancio?: number;
}
