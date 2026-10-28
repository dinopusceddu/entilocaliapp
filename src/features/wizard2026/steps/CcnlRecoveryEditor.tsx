import type { CcnlRecoveryInstruction } from '../../../domain/ccnlRecovery';
import { useId } from 'react';
import { resolveCcnlRecoveries } from '../../../logic/shared/ccnlRecovery';
import { MonetaryInput } from '../../../components/shared/MonetaryInput';
import { formatCurrency } from '../../../utils/formatters';
import type { Wizard2026Ccnl2026StepState } from '../types';

export function CcnlRecoveryEditor({ state, year, onChange, readOnly = false }: {
  state: Wizard2026Ccnl2026StepState; year: number; onChange: (payload: Partial<Wizard2026Ccnl2026StepState>) => void;
  readOnly?: boolean;
}) {
  const instanceId = useId();
  const ms = year > 2026 ? state.monteSalari2021Consolidato2026 : state.monteSalari2021;
  const resolved = resolveCcnlRecoveries({ instructions: state.recoveryInstructions,
    fondoRisorseDecentrate2024: state.fondoRisorseDecentrate2024, risorseEQ2024: state.risorseEQ2024 }, year, ms);
  const update = (i: CcnlRecoveryInstruction, patch: Partial<CcnlRecoveryInstruction>) => {
    if (readOnly) return;
    const existing = state.recoveryInstructions ?? [];
    const matches = (row: CcnlRecoveryInstruction) => row.kind === i.kind && row.competenceYear === i.competenceYear;
    // Replace, never append a second copy on repeated edits/transfer.
    const first = existing.findIndex(matches);
    onChange({ recoveryInstructions: first < 0 ? [...existing, { ...i, ...patch }]
      : existing.filter((row, index) => !matches(row) || index === first).map(row => matches(row) ? { ...i, ...patch } : row) });
  };
  const show = (value: number | null) => value === null ? 'Da istruire' : formatCurrency(value);
  return <section className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4" aria-label="Istruttoria recuperi CCNL">
    <h3 className="font-bold">Recuperi CCNL per annualità di competenza</h3>
    <p>La chiusura amministrativa e la clausola residui del CCDI devono essere attestate separatamente dalla chiusura dello snapshot. Nessuna annualità originaria viene riscritta.</p>
    {year > 2026 && <p>La prima qualificazione dopo il 2026 richiede la regola applicabile. Un residuo già costituito e certificato segue il workflow contabile dei residui, senza un nuovo recupero.</p>}
    {year > 2026 && <button type="button" onClick={() => onChange({ recoveryInstructions: [...(state.recoveryInstructions ?? []),
      { kind: 'CCNL_022', competenceYear: 2025, recognitionYear: year, instructionStatus: 'UNINSTRUCTED' }] })}
      disabled={readOnly || !!state.recoveryInstructions?.some(i => i.kind === 'CCNL_022' && i.competenceYear === 2025)}>Qualifica recupero 0,22% 2025</button>}
    {resolved.map((r, index) => {
      const i = r.instruction;
      const id = `${instanceId}-ccnl-recovery-${i.kind}-${i.competenceYear}-${index}`;
      const money = (field: 'activatedAmount2025' | 'alreadyRecognizedAmount' | 'requestedRecoveryAmount' | 'alreadyRecognizedEqAmount' | 'requestedEqRecoveryAmount', label: string) => <div>
        <label htmlFor={`${id}-${field}`}>{label}</label>
        <MonetaryInput id={`${id}-${field}`} aria-label={`${label}, recupero ${i.kind === 'CCNL_014' ? '0,14%' : '0,22%'}, competenza ${i.competenceYear}`} monetaryPath={`ccnl2026.recoveryInstructions.*.${field}`} value={i[field] ?? ''}
          aria-invalid={r.status === 'INVALID'} aria-describedby={r.status === 'INVALID' ? `${id}-instruction-error` : undefined}
          onChange={e => update(i, { [field]: e.target.value === '' ? undefined : Number(e.target.value) })} />
      </div>;
      return <fieldset key={id} disabled={readOnly} className="border p-4 rounded-lg space-y-3">
        <legend>{i.kind === 'CCNL_014' ? '0,14%' : '0,22%'} — competenza {i.competenceYear}, riconoscimento {year}</legend>
        <label htmlFor={`${id}-decision`}>Decisione</label>
        <select id={`${id}-decision`} value={i.instructionStatus ?? 'UNINSTRUCTED'} onChange={e => update(i, { instructionStatus: e.target.value as CcnlRecoveryInstruction['instructionStatus'] })}>
          <option value="UNINSTRUCTED">Da istruire</option><option value="NOT_TO_RECOVER">Non recuperare / zero esplicito</option>
          <option value="RECOVER_PARTIAL">Recupero parziale</option><option value="RECOVER_FULL">Recupero integrale del residuo</option>
        </select>
        <label htmlFor={`${id}-origin`}>Stato amministrativo annualità originaria</label>
        <select id={`${id}-origin`} value={i.originAdministrativeStatus ?? 'UNKNOWN'} onChange={e => update(i, { originAdministrativeStatus: e.target.value as CcnlRecoveryInstruction['originAdministrativeStatus'] })}>
          <option value="UNKNOWN">Da verificare</option><option value="CLOSED_AND_DEFINED">Chiusa e definita (ARAN)</option><option value="NOT_CLOSED_AND_DEFINED">Non chiusa e definita</option>
        </select>
        <label htmlFor={`${id}-clause`}>Clausola automatica residui alla performance</label>
        <select id={`${id}-clause`} value={i.automaticResidualPerformanceClause ?? 'UNKNOWN'} onChange={e => update(i, { automaticResidualPerformanceClause: e.target.value as CcnlRecoveryInstruction['automaticResidualPerformanceClause'] })}>
          <option value="UNKNOWN">Da verificare</option><option value="ABSENT">Assente — Fondo variabile</option><option value="PRESENT">Presente — arretrati performance secondo CCDI originario</option>
        </select>
        <label htmlFor={`${id}-source`}>Fonte amministrativa / motivazione</label>
        <input id={`${id}-source`} value={i.source ?? ''} onChange={e => update(i, { source: e.target.value })} />
        {i.kind === 'CCNL_022' && <>
          {money('activatedAmount2025', 'Importo totale 0,22% attivato nel 2025 (€), distinto dal massimo')}
          <label><input type="checkbox" checked={i.activationDecisionAttested === true} onChange={e => update(i, { activationDecisionAttested: e.target.checked })} />Decisione 2025 e capacità di bilancio attestate dalla fonte</label>
        </>}
        {money('alreadyRecognizedAmount', 'Già riconosciuto / utilizzato — quota Fondo (€)')}
        {money('requestedRecoveryAmount', 'Da recuperare ora — quota Fondo (€)')}
        {i.kind === 'CCNL_022' && <>
          {money('alreadyRecognizedEqAmount', 'Già riconosciuto / utilizzato — quota EQ (€)')}
          {money('requestedEqRecoveryAmount', 'Da riconoscere ora — quota EQ distinta (€)')}
          <label htmlFor={`${id}-eqsource`}>Fonte di eventuale clausola performance espressamente estesa alla quota EQ</label>
          <input id={`${id}-eqsource`} value={i.eqPerformanceClauseSource ?? ''} onChange={e => update(i, { eqPerformanceClauseSource: e.target.value })} />
        </>}
        <dl><dt>Massimo di competenza</dt><dd>{show(r.theoreticalMaximum)}</dd>
          <dt>Residuo recuperabile Fondo / EQ</dt><dd>{show(r.recoverableResidual)} / {show(r.recoverableEqResidual)}</dd>
          <dt>Residuo dopo riconoscimento Fondo / EQ</dt><dd>{show(r.remainingResidual)} / {show(r.remainingEqResidual)}</dd>
          <dt>Stato e destinazione</dt><dd>{r.status} — {r.decision} — {r.route ?? 'Da istruire'}</dd></dl>
        {r.issues.length > 0 && <p id={`${id}-instruction-error`} role={r.status === 'INVALID' ? 'alert' : 'status'}>{r.issues.join('; ')}</p>}
      </fieldset>;
    })}
  </section>;
}
