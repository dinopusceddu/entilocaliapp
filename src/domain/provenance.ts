import { presentArt23Verification } from './art23Verification';
import type { CalculationResult } from './calculationResult';
import type { FundLedgerEntry, FundLedgerSource, FundLedgerEntryStatus } from './canonicalFundLedger';
import type { FundData, DocumentMetadata } from './types';
import type { NormativeData } from './index';
import type { UserRole } from './enums';
import { projectFadReport } from './documentProjection';
import { getFadFieldDefinitions } from '../logic/fundFieldDefinitions';
import { considered022Years } from '../logic/shared/ccnlRecovery';
import type { ResolvedCcnlRecovery } from './ccnlRecovery';
import { resolveDistributionFundBudget } from '../logic/distribution/resolveDistributionFundBudget';

export type SupportStatus = 'AVAILABLE' | 'MISSING' | 'NOT_REQUIRED' | 'UNDETERMINED';
export interface DocumentSupport {
  readonly label: string;
  readonly status: SupportStatus;
  readonly reference: string | null;
  readonly dataPath: string;
}
export interface InputReference {
  readonly path: string;
  /** Source display only. Never parsed into an economic contribution. */
  readonly value: unknown;
}
export interface ResourceProvenance {
  readonly entryId: string;
  readonly description: string;
  readonly amount: number | null;
  readonly status: FundLedgerEntryStatus;
  readonly source: FundLedgerSource;
  readonly mode: 'MANUAL' | 'CALCULATED' | 'FACULTATIVE' | 'UNDETERMINED';
  readonly input: readonly InputReference[];
  readonly calculation: string | null;
  readonly competenceYear: number | null;
  readonly originYear: number | null;
  readonly recognitionYear: number | null;
  readonly normativeReference: string | null;
  readonly inclusion: 'SUBJECT' | 'EXCLUDED' | 'UNDETERMINED' | 'FIGURATIVE';
  readonly administrativeChoice: unknown;
  readonly documentation: readonly DocumentSupport[];
  readonly lineage: unknown;
}

/** The numbers refer to the original numbered RSU items, not a replacement questionnaire. */
export const RSU_AUDIT_ITEMS = [
  'Fondo costituito univoco', 'Risorse stabili', 'Risorse variabili',
  'Perimetro soggetto al limite complessivo', 'Risorse escluse dal limite',
  'Limite storico e adeguamento', 'Esito e margine dei controlli',
  'Titoli delle esclusioni e computo figurativo', 'Dati e condizioni ancora mancanti',
  'Origine amministrativa e certificazione dei dati', 'Regole e input del calcolo',
  'Massimi teorici e stanziamenti scelti', 'Competenze ente e contrattazione',
  'Budget e disponibilità negoziale', 'Documenti da richiedere e contestazioni',
] as const;
export interface RsuAnswer {
  readonly number: number;
  readonly subject: string;
  readonly auditReference: string;
  readonly value: number | null;
  readonly status: 'VALID' | 'MISSING' | 'UNDETERMINED' | 'INVALID';
  readonly references: readonly string[];
  readonly details: readonly InputReference[];
  readonly explanation: string;
  readonly support: readonly DocumentSupport[];
}
export interface IdentityExplanation {
  readonly ownerId: string | null;
  readonly actor: { readonly action: 'TRANSFER' | 'CLOSURE'; readonly reference: string } | null;
  readonly currentUserId: string | null;
  readonly currentRole: UserRole | null;
  readonly roleAuthority: 'CURRENT_PROFILE';
  /** Historical compatibility; never a permission. */
  readonly persistedRole: UserRole | null;
}
export interface ProvenanceReadModel {
  readonly authority: 'CANONICAL_PROJECTION';
  readonly status: 'VALID' | 'MISSING' | 'UNDETERMINED' | 'INVALID';
  readonly year: number | null;
  readonly rows: readonly ResourceProvenance[];
  readonly questions: readonly RsuAnswer[];
  readonly support: readonly DocumentSupport[];
  readonly metadata: {
    readonly annualita022Considerate: number | null;
    readonly art23Margin: number | null;
    readonly stale: readonly string[];
  };
  readonly identity: IdentityExplanation;
}
export interface ProvenanceContext {
  readonly entity?: { readonly user_id: string } | null;
  readonly currentUser?: { readonly id: string; readonly role: UserRole } | null;
  readonly persistedRole?: UserRole;
}
const record = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v)
  ? v as Record<string, unknown> : {};
const text = (v: unknown): string | null => typeof v === 'string' && v.trim() ? v.trim() : null;
const at = (data: unknown, path: string): unknown => path.split('.').reduce<unknown>((value, key) => record(value)[key], data);
const finite = (v: unknown): number | null => typeof v === 'number' && Number.isFinite(v) ? v : null;

function documents(meta?: DocumentMetadata): DocumentSupport[] {
  const support = (label: string, path: string, number?: string, date?: string, attested = true): DocumentSupport => ({
    label, dataPath: `annualData.documentMetadata.${path}`,
    status: text(number) && text(date) && attested ? 'AVAILABLE' : 'MISSING',
    reference: text(number) && text(date) ? `${number} — ${date} (riferimento registrato; contenuto non verificato)` : null,
  });
  return [
    support('Atto di costituzione', 'numeroDetermina', meta?.numeroDetermina, meta?.dataDetermina),
    support('Parere dei revisori e trasmissione', 'numVerbaleRevisori', meta?.numVerbaleRevisori,
      meta?.dataVerbaleRevisori, meta?.opinionOutcome !== undefined && meta.opinionOutcome !== 'UNKNOWN' && meta?.transmissionStatus === 'DOCUMENTED_SENT'),
    support('Delibera di indirizzo', 'numDeliberaGc', meta?.numDeliberaGc, meta?.dataDeliberaGc, meta?.adoptionStatus === 'DOCUMENTED_ADOPTED'),
    { label: 'Atti storici 2016/2018, basi salariali, personale e certificazioni degli input',
      status: 'UNDETERMINED', reference: null, dataPath: 'historicalData / annualData' },
    { label: 'CCDI, impieghi ed economie documentati', status: 'UNDETERMINED', reference: null, dataPath: 'distribuzioneRisorseData' },
  ];
}
const RULES: Record<string, { rule: string; input: readonly string[] }> = {
  CCNL_014_CURRENT: { rule: 'MS2021 × 0,14%; importo della voce corrente qualificata', input: ['annualData.ccnl2024.monteSalari2021'] },
  CCNL_022_CURRENT: { rule: 'Quota Fondo dello stanziamento scelto entro il massimo 0,22%; riparto Fondo/EQ', input: ['annualData.ccnl2024.monteSalari2021', 'fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021'] },
  PNRR_APPLIED: { rule: 'Facoltà istruita: requisiti, scelta e cap verificati', input: ['annualData.pnrrExerciseDecision', 'annualData.fondoStabile2016PNRR', 'fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016'] },
  DL25_CURRENT: { rule: 'Stock stabile applicato e riporto qualificato secondo il risultato del calcolo', input: ['annualData.dl25', 'fondoAccessorioDipendenteData.st_incrementoDL25_2025'] },
  ART60_CONSOLIDATION: { rule: 'Decurtazione per conglobamento; computo figurativo del limite distinto', input: ['annualData.ccnl2024'] },
};

/** Explanation only: never calculates amounts, sums raw resources, or persists anything. */
export function projectProvenance(
  result: CalculationResult | null | undefined,
  data?: FundData | null,
  context: ProvenanceContext = {},
): ProvenanceReadModel {
  const canonical = result?.canonicalFund;
  const fad = projectFadReport(canonical);
  const year = result?.metadata.annoRiferimento ?? null;
  const status = canonical?.status ?? 'MISSING';
  const support = documents(data?.annualData?.documentMetadata);
  const definitions = getFadFieldDefinitions({ riferimenti_normativi: {} } as NormativeData);
  const rows = (canonical?.entries ?? []).map((entry: FundLedgerEntry): ResourceProvenance => {
    const p = record(entry.provenance), instruction = record(p.instruction);
    const field = text(p.legacyField) ?? (entry.id.startsWith('LEGACY_FAD_RESOURCE:') ? entry.id.slice(20) : null);
    const definition = definitions.find(d => d.key === field);
    const recovery = entry.source === 'RECOVERY';
    const facultative = ['PNRR_APPLIED', 'CCNL_022_CURRENT', 'DL25_CURRENT'].includes(entry.id) || instruction.kind === 'CCNL_022';
    const sourceRef = text(instruction.source);
    const recoveryName = instruction.kind === 'CCNL_014' || entry.id.startsWith('CCNL_014_RECOVERY_') ? '0,14%'
      : instruction.kind === 'CCNL_022' || entry.id.startsWith('CCNL_022_RECOVERY_') ? '0,22%' : 'contrattuale da qualificare';
    const projectedDescription = fad.rows.find(r => r.id === entry.id)?.description?.replace(/\[alias\]/g, '');
    const qualifiedDescription = projectedDescription !== entry.id && projectedDescription !== field ? projectedDescription : null;
    const rule = recovery ? 'Competenza e scelta istruite; già riconosciuto distinto dal recuperato; residuo derivato' : RULES[entry.id]?.rule;
    const paths = [...(RULES[entry.id]?.input ?? []), ...(field ? [`fondoAccessorioDipendenteData.${field}`] : [])];
    return {
      entryId: entry.id,
      description: recovery ? `Recupero ${recoveryName} — competenza ${entry.competenceYear ?? 'da istruire'}`
        : entry.id === 'PNRR_APPLIED' ? 'Incremento PNRR scelto e istruito'
        : definition?.description ?? qualifiedDescription
        ?? entry.normativeRef ?? 'Voce da qualificare',
      amount: entry.amount, status: entry.status, source: entry.source,
      mode: facultative ? 'FACULTATIVE' : entry.source === 'CALCULATED' ? 'CALCULATED'
        : entry.source === 'MANUAL' ? 'MANUAL' : recovery ? 'CALCULATED' : 'UNDETERMINED',
      input: recovery ? [{ path: `annualData.ccnlRecovery.instructions:${instruction.kind}:${instruction.competenceYear}`, value: instruction }]
        : paths.map(path => ({ path, value: at(data, path) })),
      calculation: rule ?? definition?.riferimento ?? entry.normativeRef ?? null,
      competenceYear: entry.competenceYear, originYear: entry.originYear ?? null,
      recognitionYear: recovery ? finite(p.recognitionYear) : year,
      normativeReference: entry.normativeRef ?? null,
      inclusion: entry.economicEffect === false ? 'FIGURATIVE' : entry.art23Treatment,
      administrativeChoice: recovery ? instruction : facultative ? entry.provenance ?? null : null,
      documentation: [{ label: definition?.fonteDato ?? 'Supporto amministrativo della voce',
        status: entry.economicEffect === false ? 'NOT_REQUIRED' : sourceRef ? 'AVAILABLE' : 'UNDETERMINED', reference: sourceRef,
        dataPath: recovery ? 'annualData.ccnlRecovery.instructions.source' : 'Supporto della voce non censito' }],
      lineage: entry.provenance ?? null,
    };
  });
  // Reuse the existing metadata rule on already resolved ledger instructions; no recovery resolver call.
  const recoveries = (canonical?.entries ?? []).filter(e => e.source === 'RECOVERY' && record(e.provenance).instruction)
    .map(e => e.provenance as ResolvedCcnlRecovery);
  const annualita022 = year === null || !canonical ? null : considered022Years(year, recoveries);
  const transfer = record(data?.wizard2026TransferSnapshot), computed = record(transfer.computed);
  const art23View = presentArt23Verification(result);
  const margin = art23View.ready && canonical?.status === 'VALID' ? finite(result?.compliance.art23Compliance?.margine ?? result?.compliance.art23Compliance?.margineResiduo) : null;
  const stale: string[] = [];
  for (const [key, stored, derived] of [
    ['wizard2026TransferSnapshot.year', transfer.year, year],
    ['wizard2026TransferSnapshot.computed.annualita022Considerate', computed.annualita022Considerate, annualita022],
    ['wizard2026TransferSnapshot.computed.capienza', computed.capienza, margin],
  ] as const) if (stored !== undefined && stored !== derived) stale.push(key);
  const definitive = (value: number | null | undefined) => canonical?.status === 'VALID' ? value ?? null : null;
  const whole = result?.compliance.art23Compliance;
  const budget = resolveDistributionFundBudget(canonical);
  const values = [fad.authoritativeTotal, definitive(canonical?.stableTotal), definitive(canonical?.variableTotal),
    definitive(whole?.ammontareCorrente ?? result?.compliance.art23c2.valoreSoggetto), definitive(canonical?.art23Excluded),
    art23View.ready ? definitive(whole?.limiteAttualizzato ?? result?.compliance.art23c2.limite) : null, margin,
    definitive(canonical?.art23Excluded), null, null, null, null, null, budget.authoritativeFundTotal, null];
  const refs = ['canonicalFund.total', 'canonicalFund.stableTotal', 'canonicalFund.variableTotal',
    'compliance.art23Compliance.art23Componenti', 'canonicalFund.entries.art23Treatment',
    'compliance.art23Compliance / historicalData', 'compliance.checks', 'canonicalFund.entries.economicEffect',
    'canonicalFund.missingPrerequisites / monetaryIssues / compliance.checks', 'canonicalFund.entries.source',
    'canonicalFund.entries.provenance / normativeRef', 'canonicalFund.entries.provenance / annualData.ccnlRecovery',
    'annualData.documentMetadata / distribuzioneRisorseData', 'resolveDistributionFundBudget / distribuzioneRisorseData',
    'annualData.documentMetadata / historicalData'];
  const missing = [...(canonical?.missingPrerequisites ?? []), ...(result?.monetaryIssues ?? []).map(i => `${i.path}: ${i.message}`),
    ...(result?.compliance.checks ?? []).filter(c => !c.isCompliant).map(c => c.messaggio)];
  const explanations = [
    'Importo definitivo solo se la costituzione è determinata; il subtotale verificato non lo sostituisce.',
    'Parte stabile dalla costituzione; dettaglio delle fonti sotto.', 'Parte variabile dalla costituzione; recuperi distinti per competenza.',
    'Perimetro complessivo ente: Comparto, EQ, Segretario, Dirigenza, straordinario e altre voci nel controllo condiviso.',
    'Quota esclusa del Fondo dipendenti come classificata nelle voci; altre componenti dell’ente nel controllo complessivo. Escluso non significa importo nullo.',
    'Limite e adeguamento dal controllo corrente; la certificazione delle basi storiche resta da documentare.',
    !canonical || canonical.status !== 'VALID' || !result?.compliance.checks?.length ? 'Non determinabile: dati o verifiche incompleti.'
      : missing.length ? 'Verifiche da completare: consultare le criticità; nessuna attestazione automatica di conformità.' : 'Esiti dei controlli disponibili; non sostituiscono parere o certificazione.',
    'Titolo normativo per voce e movimenti figurativi distinti dall’importo del Fondo.',
    missing.length ? missing.join('; ') : 'Nessuna mancanza economica segnalata dal calcolo; verificare separatamente i supporti amministrativi.',
    'Fonte registrata per voce; un input dell’operatore non è una certificazione. Il supporto non censito è dichiarato sotto.',
    'Regola descrittiva e input consultabili per voce; gli importi non sono ricalcolati da questa vista.',
    'Scelte facoltative e massimi distinti nelle istruttorie PNRR, DL25 e 0,22%; nessun massimo automaticamente spendibile.',
    'Scelte dell’ente e impieghi della contrattazione da documentare: CCDI, stanziamenti, condizioni finanziarie e vincoli. Supporto non verificato.',
    'Budget del Fondo distinto dalla disponibilità negoziale: impieghi fissi, personale ed economie da verificare nella Distribuzione; nessuna allocazione automatica qui.',
    'Richiedere gli atti e le certificazioni non documentati, le basi storiche e salariali, il personale, i requisiti finanziari, gli stanziamenti e gli impieghi.',
  ];
  const questionDetails: InputReference[][] = [
    [{ path: 'canonicalFund.total', value: canonical?.total }],
    [{ path: 'canonicalFund.stableTotal', value: canonical?.stableTotal }],
    [{ path: 'canonicalFund.variableTotal', value: canonical?.variableTotal }],
    [{ path: 'compliance.art23Compliance.art23Componenti', value: whole?.art23Componenti }],
    [{ path: 'canonicalFund.entries.art23Treatment', value: rows.filter(r => r.inclusion === 'EXCLUDED').map(r => ({ description: r.description, status: r.status, amount: r.amount, reference: r.normativeReference })) }],
    [{ path: 'compliance.art23Compliance', value: whole }, { path: 'historicalData (input)', value: data?.historicalData }],
    [{ path: 'compliance.checks', value: result?.compliance.checks }],
    [{ path: 'canonicalFund.entries.economicEffect', value: rows.filter(r => r.inclusion === 'FIGURATIVE') }],
    [{ path: 'missing prerequisites and input issues', value: missing }],
    [{ path: 'canonicalFund.entries.source', value: rows.map(r => ({ description: r.description, source: r.source, support: r.documentation })) }],
    [{ path: 'canonicalFund.entries.provenance', value: rows.map(r => ({ description: r.description, rule: r.calculation, input: r.input, lineage: r.lineage })) }],
    [{ path: 'qualified administrative choices', value: rows.filter(r => r.mode === 'FACULTATIVE').map(r => ({ description: r.description, status: r.status, instruction: r.administrativeChoice })) }],
    [{ path: 'annualData.documentMetadata (input)', value: data?.annualData?.documentMetadata }, { path: 'distribuzioneRisorseData (input)', value: data?.distribuzioneRisorseData }],
    [{ path: 'shared distribution budget', value: budget }, { path: 'distribuzioneRisorseData (input)', value: data?.distribuzioneRisorseData }],
    [{ path: 'registered administrative support', value: support }],
  ];
  const questions = RSU_AUDIT_ITEMS.map((subject, i): RsuAnswer => ({
    number: i + 1, subject, auditReference: `ASTRA_RSU_AUDIT_REPORT.md#quindici-risposte-rsu-basate-soltanto-sul-browser (voce ${i + 1})`,
    value: values[i], status: status === 'INVALID' ? 'INVALID' : status === 'MISSING' ? 'MISSING'
      : values[i] === null || (i === 6 && (missing.length > 0 || !result?.compliance.checks?.length)) ? 'UNDETERMINED' : status,
    references: [refs[i]], details: questionDetails[i], explanation: explanations[i], support,
  }));
  const transferActor = text(transfer.userId), closureActor = text(data?.metadata?.closedBy);
  return { authority: 'CANONICAL_PROJECTION', status, year, rows, questions, support,
    metadata: { annualita022Considerate: annualita022, art23Margin: margin, stale },
    identity: { ownerId: context.entity?.user_id ?? null, actor: closureActor ? { action: 'CLOSURE', reference: closureActor }
      : transferActor ? { action: 'TRANSFER', reference: transferActor } : null,
      currentUserId: context.currentUser?.id ?? null, currentRole: context.currentUser?.role ?? null,
      roleAuthority: 'CURRENT_PROFILE', persistedRole: context.persistedRole ?? null },
  };
}
