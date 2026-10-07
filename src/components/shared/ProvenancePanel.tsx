import { useMemo } from 'react';
import type { CalculationResult } from '../../domain/calculationResult';
import type { FundData } from '../../domain/types';
import { projectProvenance, type ProvenanceContext } from '../../domain/provenance';
import { formatCurrency } from '../../utils/formatters';

const labels: Record<string, string> = {
  VALID: 'Determinato', MISSING: 'Dato mancante', UNDETERMINED: 'Non determinabile', INVALID: 'Dato invalido',
  MANUAL: 'Inserito dall’operatore', CALCULATED: 'Calcolato', FACULTATIVE: 'Scelta facoltativa',
  AVAILABLE: 'Riferimento disponibile', NOT_REQUIRED: 'Non richiesto',
  SUBJECT: 'Soggetto al limite', EXCLUDED: 'Escluso dal limite', FIGURATIVE: 'Solo computo del limite',
};
const raw = (value: unknown): string => value === undefined || value === null ? 'Dato mancante'
  : typeof value === 'object' ? JSON.stringify(value) : String(value);

/** Consultation only, including CLOSED. No mutation callback or local calculation. */
export function ProvenancePanel({ result, data, context }: {
  result?: CalculationResult; data: FundData; context: ProvenanceContext;
}) {
  const model = useMemo(() => projectProvenance(result, data, context), [result, data, context]);
  return <section aria-labelledby="provenance-title" className="space-y-4 border rounded-lg p-4 bg-white">
    <h3 id="provenance-title" className="text-lg font-semibold">Origine degli importi e verifiche RSU</h3>
    <p>Competenza del calcolo: {model.year ?? 'Dato mancante'}. Stato: {labels[model.status]}.
      Gli importi non determinabili e i supporti mancanti restano da istruire.</p>
    <details><summary>Proprietà, autore e dati di supporto</summary>
      <dl><dt>Proprietario dell’ente</dt><dd>{model.identity.ownerId ?? 'Dato mancante'}</dd>
        <dt>Autore registrato</dt><dd>{model.identity.actor ? `${model.identity.actor.action === 'CLOSURE' ? 'Chiusura' : 'Trasferimento'}: ${model.identity.actor.reference}` : 'Non disponibile; non dedotto dal proprietario'}</dd>
        <dt>Ruolo dell’utente corrente</dt><dd>{model.identity.currentRole ?? 'Non disponibile'} — dal profilo corrente</dd>
        <dt>Annualità 0,22% considerate</dt><dd>{model.metadata.annualita022Considerate ?? 'Non determinabile'} — dato descrittivo ricavato dall’istruttoria</dd>
        <dt>Margine Art. 23</dt><dd>{model.metadata.art23Margin === null ? 'Non determinabile' : formatCurrency(model.metadata.art23Margin)}</dd></dl>
      {model.metadata.stale.length > 0 && <p>Dati di supporto storici incoerenti ignorati: {model.metadata.stale.length}. Gli importi mostrati derivano dal calcolo corrente.</p>}
    </details>
    <ol className="space-y-3">{model.questions.map(q => <li key={q.number} data-rsu-question={q.number}>
      <h4 className="font-semibold">{q.number}. {q.subject}</h4>
      <p>{labels[q.status]}{q.value !== null ? ` — ${formatCurrency(q.value)}` : ''}</p><p>{q.explanation}</p>
      <details><summary>Riferimenti ai dati</summary><p>{q.references.join('; ')}</p><p>Voce {q.number} dell’audit RSU. Input e riferimenti di supporto, senza attestazione automatica.</p>
        {q.details.map((d, i) => <p key={i}>{d.path}: {raw(d.value)}</p>)}</details>
    </li>)}</ol>
    <details><summary>Origine di ogni voce e input utilizzati</summary>
      {model.rows.length === 0 && <p>Dati del Fondo non disponibili.</p>}
      {model.rows.map(row => <article key={row.entryId} data-provenance-entry={row.entryId} className="border-t py-3">
        <h4 className="font-semibold">{row.description}</h4>
        <p>{labels[row.mode]}; {labels[row.status]}; {labels[row.inclusion]}.
          {row.status === 'VALID' && row.amount !== null ? ` Importo: ${formatCurrency(row.amount)}.` : ' Importo definitivo non disponibile.'}</p>
        <p>Competenza: {row.competenceYear ?? 'Mancante'}; origine: {row.originYear ?? 'Non registrata'}; riconoscimento: {row.recognitionYear ?? 'Mancante'}.</p>
        <p>Regola: {row.calculation ?? 'Da documentare'}. Riferimento: {row.normativeReference ?? 'Mancante'}.</p>
        {row.documentation.map((d, i) => <p key={i}>{d.label}: {labels[d.status]}{d.reference ? ` — ${d.reference}` : ''}.</p>)}
        <details><summary>Dettaglio tecnico dei dati di origine</summary>
          <p>Fonte registrata: {row.source}; riferimento della voce: {row.entryId}.</p>
          {row.input.map((input, i) => <p key={i}>{input.path}: {raw(input.value)}</p>)}
          {row.administrativeChoice !== null && <p>Istruttoria: {raw(row.administrativeChoice)}.</p>}
          {row.lineage !== null && <p>Dati di origine registrati: {raw(row.lineage)}.</p>}
        </details>
      </article>)}
    </details>
    <h4 className="font-semibold">Supporti amministrativi e documenti da richiedere</h4>
    <ul>{model.support.map(d => <li key={d.dataPath}>{d.label}: {labels[d.status]}{d.reference ? ` — ${d.reference}` : ''}.</li>)}</ul>
    <p>Un riferimento registrato o un importo inserito non attesta la verifica del documento.</p>
  </section>;
}
