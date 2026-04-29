/**
 * DTO per la Tabella 15 del Conto Annuale.
 * AG-126: Struttura istituzionale per il mapping delle voci del fondo.
 */

export interface Tabella15Entry {
  key: string;            // Chiave tecnica interna (es. st_art79c1...)
  description: string;    // Descrizione voce
  columnCode: string;     // Codice colonna Tabella 15 (es. S600, V210)
  amount: number;         // Valore calcolato
  source: string;         // Tracciabilità: da dove arriva il dato (es. 'Constitution/Stabili')
}

export interface Tabella15Section {
  title: string;
  entries: Tabella15Entry[];
  total: number;
}

export interface Tabella15Result {
  year: number;
  entityName: string;
  sections: {
    stabile: Tabella15Section;
    variabile: Tabella15Section;
  };
  grandTotal: number;
  metadata: {
    generatedAt: string;
    engineVersion: string;
  };
}
