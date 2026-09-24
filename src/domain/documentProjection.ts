import type { CalculationResult } from './calculationResult';
import type { FundLedgerEntry, FundLedgerEntryStatus } from './canonicalFundLedger';
import type { DocumentMetadata } from './types';
import { formatCurrency } from '../utils/formatters';
import FinancialMath from '../utils/financialMath';

export interface ProjectedFundEntry {
  readonly id: string;
  readonly code?: string;
  readonly description: string;
  readonly amount: number;
  readonly signedAmount: number;
  readonly formattedAmount: string;
  readonly operation: 'ADDITION' | 'DEDUCTION';
  readonly isSubtractor: boolean;
  readonly status: FundLedgerEntryStatus;
  readonly normativeRef?: string;
  readonly source: string;
  readonly art23Treatment: 'SUBJECT' | 'EXCLUDED' | 'UNDETERMINED';
}

export interface UnresolvedItem {
  readonly id: string;
  readonly description: string;
  readonly amount: number | null;
  readonly formattedAmount: string;
  readonly status: FundLedgerEntryStatus;
  readonly reason?: string;
}

export interface FundDocumentProjection {
  readonly ente: {
    readonly denominazione: string;
    readonly tipo: string;
    readonly anno: number;
    readonly cf?: string;
  };
  readonly status: 'VALID' | 'UNDETERMINED' | 'INVALID';
  readonly overallStatus: 'VALID' | 'UNDETERMINED' | 'INVALID';
  readonly isDetermined: boolean;
  readonly isDefinitiveDocumentReady: boolean;
  readonly isDraft: boolean;
  readonly exportReadiness: 'DOCUMENT_DRAFT' | 'DOCUMENT_FINAL_READY';
  readonly verifiedStableTotal: number;
  readonly verifiedVariableTotal: number;
  readonly verifiedTotal: number;
  readonly verifiedSubtotal: number;
  readonly stableTotal: number | null;
  readonly variableTotal: number | null;
  readonly total: number | null;
  readonly finalTotal: number | null;
  readonly effectiveTotal: number;
  readonly effectiveStableTotal: number;
  readonly effectiveVariableTotal: number;
  readonly formattedFinalTotal: string;
  readonly formattedVerifiedSubtotal: string;
  readonly formattedEffectiveTotal: string;
  readonly formattedEffectiveStable: string;
  readonly formattedEffectiveVariable: string;
  readonly art23Subject: number | null;
  readonly art23Excluded: number | null;
  readonly verifiedArt23Subject: number;
  readonly verifiedArt23Excluded: number;
  readonly stableEntries: ProjectedFundEntry[];
  readonly variableEntries: ProjectedFundEntry[];
  readonly deductions: ProjectedFundEntry[];
  readonly unresolvedItems: UnresolvedItem[];
  readonly warnings: string[];
  readonly missingPrerequisites: string[];
  readonly hasRevisoriParere: boolean;
  readonly hasDeliberaGC: boolean;
  readonly revisoriVerbale?: string;
  readonly revisoriData?: string;
  readonly revisoriOpinionOutcome: 'FAVORABLE' | 'UNFAVORABLE' | 'OTHER' | 'UNKNOWN';
  readonly revisoriTransmissionStatus: 'DOCUMENTED_SENT' | 'NOT_DOCUMENTED';
  readonly revisoriAttestationText: string;
  readonly deliberaGCNumero?: string;
  readonly deliberaGCData?: string;
  readonly gcAdoptionStatus: 'DOCUMENTED_ADOPTED' | 'NOT_DOCUMENTED';
  readonly gcAttestationText: string;
}

const DESCRIPTIONS: Record<string, string> = {
  CCNL_014_CURRENT: 'Incremento stabile 0,14% Monte Salari 2021 (Art. 58 c. 1 CCNL 2026)',
  CCNL_022_CURRENT: 'Incremento variabile 0,22% Monte Salari 2021 (Art. 58 c. 2 CCNL 2026)',
  OVERTIME_STABLE_TRANSFER: 'Riduzione stabile straordinario trasferita a fondo (Art. 79 c. 1 lett. b/ex 67 c. 2g)',
  RIA: 'Integrazione RIA personale cessato',
  DL25_CURRENT: 'Incremento D.L. 25/2025 (Limite 48%)',
  DL25_CURRENT_LEGACY_ALIAS: 'Incremento D.L. 25/2025 (Limite 48%) [alias]',
  ART60_CONSOLIDATION: 'Decurtazione stabile per conglobamento indennità comparto (Art. 60 c. 2 CCNL 2026)',
  CCNL_014_RECOVERY_LEGACY_2024_2025: 'Arretrati 0,14% 2024-2025 (Art. 58 c. 1 CCNL 2026)',
};

function isPlaceholderOrEmpty(val?: string): boolean {
  if (!val) return true;
  const trimmed = val.trim();
  return trimmed === '' || trimmed.startsWith('{{') || trimmed.startsWith('_____');
}

/**
 * Proietta il CalculationResult in un DTO ottimizzato per documenti ed esportazioni.
 * Non esegue ricalcoli economici: consuma il CanonicalFundLedger come sorgente autoritativa.
 */
export function projectFundDocument(
  result: CalculationResult,
  denominazioneOverride?: string,
  docMeta?: DocumentMetadata
): FundDocumentProjection {
  const cFund = result.canonicalFund;
  const year = result.metadata?.annoRiferimento || new Date().getFullYear();
  const denominazione = (denominazioneOverride && denominazioneOverride !== 'Ente')
    ? denominazioneOverride
    : (result.metadata?.denominazioneEnte || denominazioneOverride || 'Ente');

  const stableEntries: ProjectedFundEntry[] = [];
  const variableEntries: ProjectedFundEntry[] = [];
  const deductions: ProjectedFundEntry[] = [];
  const unresolvedItems: UnresolvedItem[] = [];

  const rawEntries: FundLedgerEntry[] = cFund ? cFund.entries : [];

  for (const entry of rawEntries) {
    if (entry.economicEffect === false) {
      continue;
    }

    const desc = DESCRIPTIONS[entry.id] || (entry.provenance as any)?.legacyField || entry.id;

    if (entry.status !== 'VALID' || entry.amount === null) {
      unresolvedItems.push({
        id: entry.id,
        description: desc,
        amount: entry.amount,
        formattedAmount: entry.amount !== null ? formatCurrency(entry.amount) : 'Da quantificare',
        status: entry.status,
        reason: (entry.provenance as any)?.reason || 'In corso di verifica / privo di istruttoria'
      });
      continue;
    }

    const absAmount = FinancialMath.roundTo2DP(Math.abs(entry.amount));
    const isDeduction = entry.operation === 'DEDUCTION';
    const signed = isDeduction ? -absAmount : absAmount;

    const projected: ProjectedFundEntry = {
      id: entry.id,
      description: desc,
      amount: absAmount,
      signedAmount: signed,
      formattedAmount: formatCurrency(absAmount),
      operation: entry.operation,
      isSubtractor: isDeduction,
      status: entry.status,
      normativeRef: entry.normativeRef,
      source: `CanonicalLedger/${entry.id}`,
      art23Treatment: entry.art23Treatment
    };

    if (isDeduction) {
      deductions.push(projected);
    } else if (entry.component === 'STABLE') {
      stableEntries.push(projected);
    } else {
      variableEntries.push(projected);
    }
  }

  const verifiedStable = cFund ? cFund.verifiedStableTotal : (result.totals?.stabile ?? result.fondi?.dipendente?.summary?.totaleFondo ?? 0);
  const verifiedVariable = cFund ? cFund.verifiedVariableTotal : (result.totals?.variabile ?? 0);
  const verifiedTot = cFund ? cFund.verifiedTotal : (result.totals?.totaleFondo ?? result.fondi?.dipendente?.summary?.totaleFondo ?? 0);

  const stableTotal = cFund ? cFund.stableTotal : (result.totals?.stabile ?? result.fondi?.dipendente?.summary?.totaleFondo ?? 0);
  const variableTotal = cFund ? cFund.variableTotal : (result.totals?.variabile ?? 0);
  const total = cFund ? cFund.total : (result.fondi?.dipendente?.summary?.totaleFondo ?? null);

  const finalTotal = total;
  const verifiedSubtotal = verifiedTot;

  const status = cFund ? cFund.status : (result.canonicalFund ? 'VALID' : 'UNDETERMINED');
  const overallStatus = status;
  const missingPrereqs = cFund ? [...cFund.missingPrerequisites] : [];
  // W3-DOC-001: definitive readiness requires canonical fund, valid status, numeric total AND no missing prerequisites.
  // A numeric total alone (UNDETERMINED status) must NOT unlock the constitutive clause.
  const isDetermined = total !== null && status === 'VALID' && missingPrereqs.length === 0;
  const isDefinitiveDocumentReady = isDetermined;
  const isDraft = !isDefinitiveDocumentReady || !cFund;
  const exportReadiness: 'DOCUMENT_DRAFT' | 'DOCUMENT_FINAL_READY' = (isDefinitiveDocumentReady && !!cFund && status === 'VALID' && total !== null && missingPrereqs.length === 0) ? 'DOCUMENT_FINAL_READY' : 'DOCUMENT_DRAFT';

  const effectiveStable = stableTotal !== null ? stableTotal : verifiedStable;
  const effectiveVariable = variableTotal !== null ? variableTotal : verifiedVariable;
  const effectiveTotal = total !== null ? total : verifiedTot;

  // Revisori attestations
  const hasRevisoriNumero = !isPlaceholderOrEmpty(docMeta?.numVerbaleRevisori);
  const hasRevisoriData = !isPlaceholderOrEmpty(docMeta?.dataVerbaleRevisori);
  const opinionOutcome = docMeta?.opinionOutcome || 'UNKNOWN';
  const transmissionStatus = docMeta?.transmissionStatus || 'NOT_DOCUMENTED';

  const hasRevisoriParere = hasRevisoriNumero && hasRevisoriData && opinionOutcome === 'FAVORABLE';

  let revisoriAttestationText: string;
  if (opinionOutcome === 'FAVORABLE' && hasRevisoriNumero && hasRevisoriData) {
    revisoriAttestationText = `Del parere favorevole espresso dal Collegio dei Revisori dei Conti con verbale n. ${docMeta?.numVerbaleRevisori} del ${docMeta?.dataVerbaleRevisori};`;
  } else if (opinionOutcome === 'UNFAVORABLE' && hasRevisoriNumero && hasRevisoriData) {
    revisoriAttestationText = `Del parere NON favorevole espresso dal Collegio dei Revisori dei Conti con verbale n. ${docMeta?.numVerbaleRevisori} del ${docMeta?.dataVerbaleRevisori};`;
  } else if ((hasRevisoriNumero || hasRevisoriData) && (opinionOutcome === 'UNKNOWN' || opinionOutcome === 'OTHER')) {
    // W3-ATT-001: extremes present but outcome not documented — show the extremes without inferring outcome
    const verbaleRef = (hasRevisoriNumero && hasRevisoriData)
      ? `Verbale n. ${docMeta?.numVerbaleRevisori} del ${docMeta?.dataVerbaleRevisori}`
      : hasRevisoriNumero
        ? `Verbale n. ${docMeta?.numVerbaleRevisori}`
        : `Verbale del ${docMeta?.dataVerbaleRevisori}`;
    revisoriAttestationText = `${verbaleRef}. L'esito del parere dell'Organo di Revisione non risulta documentato nei dati disponibili;`;
  } else if (transmissionStatus === 'DOCUMENTED_SENT') {
    revisoriAttestationText = `Che il presente provvedimento è stato trasmesso al Collegio dei Revisori dei Conti per l'acquisizione del prescritto parere di compatibilità economico-finanziaria ex art. 40-bis D.Lgs. 165/2001;`;
  } else {
    revisoriAttestationText = `Gli estremi e l'esito del parere dell'Organo di Revisione non risultano documentati nei dati disponibili;`;
  }

  // Giunta Comunale attestations
  const hasGCNumero = !isPlaceholderOrEmpty(docMeta?.numDeliberaGc);
  const hasGCData = !isPlaceholderOrEmpty(docMeta?.dataDeliberaGc);
  const gcAdoptionStatus = docMeta?.adoptionStatus || 'NOT_DOCUMENTED';

  const hasDeliberaGC = hasGCNumero && hasGCData && gcAdoptionStatus === 'DOCUMENTED_ADOPTED';

  let gcAttestationText: string;
  if (gcAdoptionStatus === 'DOCUMENTED_ADOPTED' && hasGCNumero && hasGCData) {
    gcAttestationText = `La deliberazione della G.C. n. ${docMeta?.numDeliberaGc} del ${docMeta?.dataDeliberaGc} relativa alla destinazione delle risorse variabili;`;
  } else {
    gcAttestationText = `La deliberazione di indirizzo della Giunta Comunale non risulta documentata nei dati disponibili;`;
  }

  const warnings = cFund ? [...cFund.warnings] : [];
  if (!cFund) {
    warnings.push('[LEGACY PREVIEW] Risultato privo di CanonicalFundLedger. Export ufficiale SICO e certificazione disabilitati.');
  }

  return {
    ente: {
      denominazione,
      tipo: result.inputs?.tipologiaEnte || 'Comune',
      anno: year
    },
    status,
    overallStatus,
    isDetermined,
    isDefinitiveDocumentReady,
    isDraft,
    exportReadiness,
    verifiedStableTotal: verifiedStable,
    verifiedVariableTotal: verifiedVariable,
    verifiedTotal: verifiedTot,
    verifiedSubtotal,
    stableTotal,
    variableTotal,
    total,
    finalTotal,
    effectiveTotal,
    effectiveStableTotal: effectiveStable,
    effectiveVariableTotal: effectiveVariable,
    formattedFinalTotal: finalTotal !== null ? formatCurrency(finalTotal) : 'NON ANCORA DETERMINABILE',
    formattedVerifiedSubtotal: formatCurrency(verifiedSubtotal),
    formattedEffectiveTotal: formatCurrency(effectiveTotal),
    formattedEffectiveStable: formatCurrency(effectiveStable),
    formattedEffectiveVariable: formatCurrency(effectiveVariable),
    art23Subject: cFund ? cFund.art23Subject : (result.compliance?.art23c2?.valoreSoggetto ?? null),
    art23Excluded: cFund ? cFund.art23Excluded : null,
    verifiedArt23Subject: cFund ? cFund.verifiedArt23Subject : (result.compliance?.art23c2?.valoreSoggetto ?? 0),
    verifiedArt23Excluded: cFund ? cFund.verifiedArt23Excluded : 0,
    stableEntries,
    variableEntries,
    deductions,
    unresolvedItems,
    warnings,
    missingPrerequisites: missingPrereqs,
    hasRevisoriParere,
    hasDeliberaGC,
    revisoriVerbale: docMeta?.numVerbaleRevisori,
    revisoriData: docMeta?.dataVerbaleRevisori,
    revisoriOpinionOutcome: opinionOutcome,
    revisoriTransmissionStatus: transmissionStatus,
    revisoriAttestationText,
    deliberaGCNumero: docMeta?.numDeliberaGc,
    deliberaGCData: docMeta?.dataDeliberaGc,
    gcAdoptionStatus,
    gcAttestationText
  };
}
