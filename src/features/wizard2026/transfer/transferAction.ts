import { Wizard2026TransferValidationResult } from '../validation';

export type TransferActionStatus = 'AVAILABLE' | 'BLOCKED' | 'INVALID' | 'UNDETERMINED' | 'ALREADY_TRANSFERRED' | 'CLOSED' | 'IN_PROGRESS';
export interface TransferAction {
  status: TransferActionStatus;
  enabled: boolean;
  reason: string;
  primaryAction: string;
  confirmationRequired: boolean;
  entityName: string;
  year: number | null;
}

/** Presentation only: consumes the existing validator, never calculates amounts. */
export function projectTransferAction(input: {
  validation: Wizard2026TransferValidationResult;
  entityName?: string;
  year?: number;
  draftYear?: number;
  hasUser: boolean;
  closed: boolean;
  contextSwitching?: boolean;
  monetaryDraftInvalid?: boolean;
  transferring?: boolean;
  alreadyTransferred?: boolean;
}): TransferAction {
  let status: TransferActionStatus = 'AVAILABLE';
  let reason = 'Voci istruite e limiti di controllo saranno acquisiti nella costituzione del Fondo, dopo la tua conferma.';
  if (input.closed) { status = 'CLOSED'; reason = 'Annualità chiusa: il riepilogo è consultabile in sola lettura.'; }
  else if (!input.entityName || !input.year || !input.hasUser || input.contextSwitching) {
    status = 'UNDETERMINED'; reason = 'Seleziona ente e annualità e attendi il caricamento dei dati.';
  } else if (input.draftYear !== input.year) {
    status = 'BLOCKED'; reason = 'L’anno dei dati raccolti non corrisponde al Fondo selezionato. Verifica l’annualità prima di procedere.';
  } else if (input.monetaryDraftInvalid) {
    status = 'INVALID'; reason = 'Correggi gli importi evidenziati prima di trasferire.';
  } else if (!input.validation.isTransferable) {
    status = 'BLOCKED'; reason = 'Impossibile trasferire: risolvi gli errori bloccanti prima di procedere';
  } else if (input.transferring) {
    status = 'IN_PROGRESS'; reason = 'Trasferimento in corso: attendi il completamento.';
  } else if (input.alreadyTransferred) {
    status = 'ALREADY_TRANSFERRED'; reason = 'Questi dati sono già stati acquisiti. Puoi consultarli nella costituzione del Fondo.';
  }
  return { status, enabled: status === 'AVAILABLE', reason,
    primaryAction: 'Trasferisci i dati alla costituzione del fondo e compila',
    confirmationRequired: status === 'AVAILABLE', entityName: input.entityName ?? 'Ente non selezionato', year: input.year ?? null };
}

export const transferStatusLabel: Record<TransferActionStatus, string> = {
  AVAILABLE: 'Richiede conferma', BLOCKED: 'Trasferimento bloccato', INVALID: 'Importi da correggere',
  UNDETERMINED: 'Dati da completare', ALREADY_TRANSFERRED: 'Dati già acquisiti', CLOSED: 'Annualità chiusa', IN_PROGRESS: 'Trasferimento in corso',
};

/** Translate development vocabulary at the display boundary; domain identifiers stay unchanged. */
export function presentTransferText(text?: string): string {
  return (text ?? '').replace(/payload(?: analitico)?/gi, 'dati del personale')
    .replace(/legacy/gi, 'storico').replace(/override/gi, 'valore manuale')
    .replace(/draft/gi, 'bozza').replace(/snapshot/gi, 'copia di sicurezza')
    .replace(/mapping/gi, 'destinazione').replace(/READY/g, 'Pronto');
}
