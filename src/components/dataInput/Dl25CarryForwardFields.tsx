import { MonetaryInput } from '../shared/MonetaryInput';
import type { Dl25AnnualState } from '../../domain/dl25';
import { resolveDl25CarryForward, resolveDl25TotalCeiling } from '../../logic/shared/dl25CarryForward';
import { formatCurrency } from '../../utils/formatters';
const labels: Record<string, string> = {
  PRIOR_DL25_STOCK_MISSING: 'Indicare lo stock DL25 delle annualità precedenti, anche quando è zero.',
  PRIOR_DL25_STOCK_PROVENANCE_MISSING: 'Indicare la fonte dello stock precedente (costituzione, determina o snapshot).',
  LEGACY_CARRY_FORWARD_UNQUALIFIED: 'Qualificare il significato dell’importo legacy prima di calcolare un nuovo incremento.',
  DL25_CURRENT_YEAR_DECISION_MISSING: 'Indicare il nuovo incremento dell’anno; zero è una scelta valida.',
  PRIOR_DL25_STOCK_EXCEEDS_CEILING: 'Incremento DL25 già incorporato superiore al plafond complessivo ricostruito.',
  DL25_CUMULATIVE_BELOW_PRIOR: 'Lo stock cumulativo corrente è inferiore allo stock precedente.',
  DL25_DELTA_EXCEEDS_RESIDUAL: 'Il nuovo incremento supera il margine residuo.',
};
const display = (v?: number) => v === undefined ? 'Da determinare' : formatCurrency(v);
export function Dl25CarryForwardSummary({ facts, referenceYear }: { facts: Dl25AnnualState; referenceYear?: number }) {
  const r = resolveDl25CarryForward({ ...facts, referenceYear, totalCeiling: resolveDl25TotalCeiling(facts) });
  return <div data-testid="dl25-carry-summary" className="space-y-2 text-sm">
    <p>Plafond massimo complessivo D.L. 25/2025: <strong>{display(r.totalCeiling)}</strong></p>
    <p>Incrementi già stabilmente applicati nelle annualità precedenti: <strong>{display(r.priorCumulativeApplied)}</strong></p>
    <p>Margine ancora utilizzabile: <strong>{display(r.remainingCapacity)}</strong></p>
    <p>Nuovo incremento dell’anno: <strong>{display(r.currentYearDelta)}</strong></p>
    <p>Stock cumulativo DL25 risultante: <strong>{display(r.currentCumulativeApplied)}</strong></p>
    <p>Residuo dopo la scelta: <strong>{display(r.remainingAfterApplication)}</strong></p>
    {r.remainingCapacity === 0 && <p>Plafond DL25 già integralmente utilizzato.</p>}
    {r.issues.map(i => <p key={i} role="status">{labels[i] ?? 'Dati DL25 incompleti o incoerenti: verificare anno, base 2025 e importi non negativi.'}</p>)}
    <p className="text-xs text-slate-500">La facoltà resta subordinata alla sostenibilità Art.33 e all’equilibrio pluriennale asseverato. Le rettifiche figurative Art.60 servono alla comparabilità e non costituiscono nuove risorse o nuovo margine DL25.</p>
    {facts.regimeDate && <p>Data business dell’istruttoria: {facts.regimeDate}</p>}
  </div>;
}
export function Dl25CarryForwardFields({ facts, referenceYear, onChange }: {
  facts: Dl25AnnualState; referenceYear?: number; onChange: (v: Partial<Dl25AnnualState>) => void;
}) {
  const parse = (s: string) => s === '' ? undefined : Number(s);
  const resolved = resolveDl25CarryForward({ ...facts, referenceYear, totalCeiling: resolveDl25TotalCeiling(facts) });
  return <div className="space-y-3">
    {referenceYear !== 2025 && <>
      <label className="block">Incremento DL25 stabilmente già incorporato fino al 31/12/{referenceYear === undefined ? 'anno precedente' : referenceYear - 1}
        <MonetaryInput monetaryPath="priorCumulativeApplied" aria-label="Stock DL25 precedente" type="number" min="0" step="0.01" value={facts.priorCumulativeApplied ?? ''} onChange={e => onChange({ priorCumulativeApplied: parse(e.target.value) })} className="block border rounded p-2" />
      </label>
      <label className="block">Fonte dello stock precedente (costituzione, determina, atto o snapshot)
        <input aria-label="Fonte dello stock DL25 precedente" value={facts.priorStockProvenance ?? ''} onChange={e => onChange({ priorStockProvenance: e.target.value })} className="block border rounded p-2 w-full" />
      </label>
    </>}
    {facts.legacyStoredAmount !== undefined && <>
      <p>Importo legacy conservato: {display(facts.legacyStoredAmount)}. La scelta seguente non modifica automaticamente il Fondo.</p>
      {referenceYear === 2025 && <label className="block">Fonte che attesta l’effettiva applicazione DL25 nel Fondo 2025<input aria-label="Fonte applicazione DL25 2025" value={facts.legacyAppliedProvenance ?? ''} onChange={e => onChange({ legacyAppliedProvenance: e.target.value })} className="block border rounded p-2" /></label>}
      <label>Significato dell’importo legacy
        <select aria-label="Significato dell’importo DL25 legacy" value={facts.legacyQualification ?? 'UNKNOWN'} onChange={e => onChange({ legacyQualification: e.target.value as Dl25AnnualState['legacyQualification'] })} className="block border rounded p-2">
          <option value="UNKNOWN">Significato non noto</option><option value="CUMULATIVE_STOCK">Stock cumulativo corrente</option><option value="CURRENT_YEAR_DELTA">Nuovo incremento dell’anno</option>
        </select>
      </label>
    </>}
    <label className="block" htmlFor="incrementoApplicatoDL25">Nuovo incremento che l’ente intende applicare nel {referenceYear ?? 'proprio esercizio'}
      <MonetaryInput monetaryPath="currentYearDelta" id="incrementoApplicatoDL25" data-testid="incrementoApplicatoDL25" aria-label="Nuovo incremento DL25 dell’anno" type="number" min="0" step="0.01" value={facts.currentYearDelta ?? resolved.currentYearDelta ?? ''} onChange={e => onChange({ currentYearDelta: parse(e.target.value) })} className="block border rounded p-2" />
    </label>
    <label className="block">Data business dell’istruttoria DL25
      <input aria-label="Data business DL25" type="date" value={facts.regimeDate ?? ''} onChange={e => onChange({ regimeDate: e.target.value || undefined })} className="block border rounded p-2" />
    </label>
    <Dl25CarryForwardSummary facts={facts} referenceYear={referenceYear} />
  </div>;
}
