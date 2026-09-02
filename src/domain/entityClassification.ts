export type EntityClassificationType =
  | 'REGIONE'
  | 'CITTA_METROPOLITANA'
  | 'PROVINCIA'
  | 'COMUNE'
  | 'UNIONE_COMUNI'
  | 'COMUNITA_MONTANA'
  | 'COMUNITA_ISOLANA_O_ARCIPELAGO'
  | 'CAMERA_COMMERCIO'
  | 'ENTE_REGIONALE'
  | 'ENTE_PARCO'
  | 'CONSORZIO'
  | 'ASP'
  | 'AZIENDA_SPECIALE'
  | 'ISTITUZIONE'
  | 'ALTRO_ENTE_STRUMENTALE'
  | 'ALTRO';

export type EntityTerritorialContext =
  | 'ORDINARY_REGIME'
  | 'SICILIAN_AREA_VASTA'
  | 'OTHER_SPECIAL_AUTONOMY'
  | 'UNKNOWN';

export interface EntityClassification {
  entityType?: EntityClassificationType;
  territorialContext?: EntityTerritorialContext;
}

export type Art33ManualDecision =
  | 'APPLY'
  | 'DO_NOT_APPLY';
