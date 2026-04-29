import { ParereAranStato, AreaQualifica, LivelloPeo } from './enums';

export interface NormativeData {
  valori_pro_capite: {
    art67_ccnl_2018: number;
    art79_ccnl_2022_b: number;
  };
  limiti: {
    incidenza_salario_accessorio: number;
    incremento_virtuosi_dl25_2025: number;
    incremento_pnrr_dl13_2023: number;
  };
  riferimenti_normativi: { [key: string]: string };
  progression_economic_values: { [key in AreaQualifica]?: { [key in LivelloPeo]?: number } };
  indennita_comparto_values: { [key in AreaQualifica]?: number };
}

export type NormativaUnitaTipo = 'comma' | 'lettera' | 'sublettera' | 'punto' | 'appendice';

export interface NormativaUnita {
  tipo: NormativaUnitaTipo;
  label: string;
  testo: string;
  figli?: NormativaUnita[];
}

export interface RinvioInterno {
  label: string;
  targetId: string;
  posizione: number;
  fontePrevista: string;
  ambiguita: boolean;
}

export interface NormativaArticle {
  id: string;
  label: string;
  titolo: string;
  titoloSezione: string;
  capo: string | null;
  fonte: string;
  codice?: string;
  testoIntegrale: string;
  strutturaNormativa: NormativaUnita[];
  rinviiInterni: RinvioInterno[];
  riferimentiEsterni: string[];
  pareriCollegati: string[];
  commi?: { numero: string; testo: string }[];
  rinviiEstratti?: string[];
}

export interface NormativaBlocco {
  tipo: 'testo' | 'lista' | 'intestazione';
  chiaveStandard?: 'cosE' | 'quantoDura' | 'quando' | 'aChi' | 'chiDispone' | 'puoEssereNegato' | 'requisiti' | 'note' | 'pareriAran';
  contenuto: string | string[];
}

export interface NormativaSchedaGuida {
  id: string;
  titolo: string;
  sezione: string;
  riferimentiNormativi: string[];
  blocchi: NormativaBlocco[];
  testoCompleto: string;
  pareriCorrelati: string[];
  articoliCollegati: string[];
  testoIntegrale?: string;
}

export interface NormativaParereAran {
  aranId?: string;
  id: string;
  codiciSecondari?: string[];
  dataPubblicazione: string;
  titolo?: string;
  quesito: string;
  risposta: string;
  urlFonte?: string;
  argomenti: string[];
  hashTagsArgomento: string[];
  riferimentiNormativiEstratti: string[];
  articoliCollegati: string[];
  schedeCollegate: string[];
  data?: string;
  domanda?: string;
  tags?: string[];
}

export interface ParereAranRecord {
  recordId: string;
  aranId: string;
  versionNo: number;
  supersedesRecordId?: string;
  isCurrent: boolean;
  codiciSecondari?: string[];
  dataPubblicazione: string;
  titolo?: string;
  quesito: string;
  risposta: string;
  urlFonte?: string;
  hashContenuto: string;
  argomenti: string[];
  hashTagsArgomento: string[];
  riferimentiNormativiEstratti: string[];
  articoliCollegati: string[];
  schedeCollegate: string[];
  stato: ParereAranStato;
  parseStatus: 'ok' | 'warning' | 'error';
  qaFlags?: string[];
  needsEditorialReview?: boolean;
  noteAdmin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NormativaIndexEntry {
  id: string;
  type: 'articolo' | 'guida' | 'aran';
  title: string;
  subtitle?: string;
  content: string;
  meta?: {
    titoloSezione?: string;
    capo?: string;
    fonte?: string;
    sezione?: string;
    riferimentiNormativi?: string[];
    argomenti?: string[];
    hashTags?: string[];
  };
}

export interface IndiceAnaliticoEntry {
  id: string;
  label: string;
  subLabel?: string;
  pageRefsOriginali: string;
  relatedArticleIds: string[];
  relatedSchedaIds: string[];
  relatedParereIds: string[];
}

export interface NormativaExternalRef {
  id: string;
  pattern: string[];
  label: string;
  url: string;
  target: '_blank' | '_self';
}

export type NormativaAnaliticoEntry = IndiceAnaliticoEntry;
export type NormativaComma = { numero: string; testo: string };
export type NormativaDettaglioBlocco = NormativaBlocco;
