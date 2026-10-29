import { useState } from 'react';
import type { ArrearsAccessoryLine, ArrearsResult, HourKey, SimulatorInput } from '../../types/ccnl2025_2027SimulatorTypes';
import { HOUR_DEFINITIONS } from '../../logic/ccnl2025_2027Defaults';
import { sumMoney } from '../../logic/ccnl2025_2027Math';
import { euro } from '../../utils/ccnl2025_2027Formatters';
import { NumberField, panelClass, SelectField } from './SimulatorFields';

function IndemnityYearCell({ line, year, label, hours, onChange, disabled }: {
  line: ArrearsAccessoryLine | undefined; year: number; label: string; hours: number;
  onChange: (hours: number) => void; disabled: boolean;
}) {
  return <td className="space-y-3 p-3 align-top">
    {line ? <>
      <dl className="space-y-1 text-xs">
        <div className="flex justify-between gap-2"><dt>Vecchia tariffa</dt><dd className="font-mono tabular-nums">{euro(line.oldUnitRate, 4)}/h</dd></div>
        <div className="flex justify-between gap-2"><dt>Nuova tariffa</dt><dd className="font-mono tabular-nums">{euro(line.newUnitRate, 4)}/h</dd></div>
      </dl>
      <p className="inline-block rounded-lg bg-emerald-50 px-2 py-1 font-mono text-xs font-bold tabular-nums text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">+Δ {euro(line.deltaUnitRate, 4)}/h</p>
    </> : <p className="text-xs text-slate-500">{disabled ? 'Nessun periodo di arretrato ordinario' : 'Tariffe disponibili dopo la validazione dei dati'}</p>}
    <NumberField label={`Ore ${year} · ${label}`} value={hours} max={100000} disabled={disabled} onChange={onChange} />
    <p className="flex justify-between gap-2 text-xs"><span>Arretrato {year}</span><strong className="font-mono tabular-nums">{line ? euro(line.amount) : '—'}</strong></p>
  </td>;
}

export function ArrearsQuickSummaryStep({ value, result, onChange }: {
  value: SimulatorInput; result: ArrearsResult | null; onChange: (s: SimulatorInput) => void;
}) {
  const a = value.arrears;
  const update = (patch: Partial<typeof a>) => onChange({ ...value, arrears: { ...a, ...patch } });
  const [selectedGroup, setSelectedGroup] = useState('Turni · Art. 25');
  const periods = a.hasCareerChanges ? a.careerTranches : [{
    id: 'unica', dateFrom: '2025-01-01', dateTo: a.serviceStatus === 'TERMINATED' ? a.terminationDate : '2026-12-31',
    profile: value.profile, hours2025: a.hours2025, hours2026: a.hours2026,
  }];
  const groups = ['Turni · Art. 25', 'Straordinario · Art. 32', 'Banca ore · Art. 33', 'Maggiorazioni · Art. 26', 'Supplementare PT · Art. 55']
    .filter(group => !group.startsWith('Supplementare') || periods.some(t => t.profile.workTimeRegime === 'PART_TIME'));
  const activeGroup = groups.includes(selectedGroup) ? selectedGroup : groups[0];
  const tabIndex = groups.indexOf(activeGroup);
  const changeHours = (id: string, year: number, key: HourKey, hours: number) => {
    const hoursKey = year === 2025 ? 'hours2025' : 'hours2026';
    if (a.hasCareerChanges) update({ careerTranches: a.careerTranches.map(t => t.id === id ? { ...t, [hoursKey]: { ...t[hoursKey], [key]: hours } } : t) });
    else update({ [hoursKey]: { ...a[hoursKey], [key]: hours } });
  };

  return <section className={panelClass} aria-labelledby="ccnl-arrears-heading">
    <h2 id="ccnl-arrears-heading" className="mb-5 text-lg font-extrabold">2. Arretrati 2025–2026 (Dal 1° Gennaio 2025)</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField label="Adeguamento stipendiale dell’ente" value={a.payrollAdjustmentMonth2026} onChange={payrollAdjustmentMonth2026 => update({ payrollAdjustmentMonth2026 })} options={[
        { value: '2026-11', label: 'Novembre 2026 · 10 mesi arretrati' }, { value: '2026-12', label: 'Dicembre 2026 · 11 mesi arretrati' },
      ]} />
      <SelectField label="Scorporo IVC sul tabellare" value={a.ivcDeductionMode} onChange={ivcDeductionMode => update({ ivcDeductionMode })} options={[
        { value: 'CONGUAGLIO_ESATTO_CEDOLINO', label: 'Conguaglio esatto cedolino (default)' }, { value: 'STIMA_SINDACALE_SLIDE', label: 'Stima slide · IVC 2026 costante' }, { value: 'LORDO_SENZA_SCORPORO', label: 'Lordo senza scorporo IVC' },
      ]} />
      <div className="sm:col-span-2"><SelectField label="Base ricalcolo indennità orarie 2025–2026" value={a.accessoryDeltaMode} onChange={accessoryDeltaMode => update({ accessoryDeltaMode })} options={[
        { value: 'INCREMENTO_TABELLARE_PIENO', label: 'Incremento tabellare pieno · IVC non inclusa nelle vecchie tariffe' },
        { value: 'AL_NETTO_IVC_GIA_INCLUSA_NELLE_BASI', label: 'Al netto IVC già inclusa nelle tariffe · media ponderata dell’anno' },
      ]} /></div>
    </div>

    <section className="mt-5 space-y-4 rounded-xl border-2 border-teal-200 p-3 dark:border-teal-800" aria-labelledby="ccnl-indemnities-heading">
      <div><h3 id="ccnl-indemnities-heading" className="font-extrabold text-teal-800 dark:text-teal-200">Arretrati dal 1° Gennaio 2025 sulle Indennità che variano al variare del Tabellare</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Confronta le tariffe di ciascuna indennità e inserisci le ore effettive già liquidate con la vecchia tariffa, fino all’adeguamento o alla cessazione. Le ore non subiscono un’ulteriore riduzione per il part-time. Il delta conserva la precisione di calcolo; l’arretrato è arrotondato al centesimo.</p>
      </div>
      <div role="tablist" aria-label="Istituti degli arretrati sulle indennità" className="flex flex-wrap gap-2">{groups.map((group, i) => <button
        key={group} type="button" role="tab" id={`ccnl-arrears-tab-${i}`} aria-controls="ccnl-arrears-indemnities-panel" aria-selected={activeGroup === group}
        onClick={() => setSelectedGroup(group)} className={`rounded-xl px-3 py-2 text-xs font-bold ${activeGroup === group ? 'bg-[#0f766e] text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}
      >{group}</button>)}</div>
      <div role="tabpanel" id="ccnl-arrears-indemnities-panel" aria-labelledby={`ccnl-arrears-tab-${tabIndex}`} className="space-y-4">
        {periods.map((t, i) => {
          const definitions = HOUR_DEFINITIONS.filter(d => d.group === activeGroup && (t.profile.workTimeRegime === 'PART_TIME' || !d.key.startsWith('supplementary')));
          const trancheLabel = a.hasCareerChanges ? `Tranche ${i + 1}` : 'Profilo invariato';
          return <div key={t.id}>
            {a.hasCareerChanges && <p className="mb-2 text-sm font-bold">{trancheLabel} · {t.dateFrom} → {t.dateTo}</p>}
            {definitions.length ? <div className="overflow-x-auto"><table className="w-full min-w-[780px] table-fixed text-left text-xs">
              <caption className="sr-only">Confronto tariffe e ore arretrate · {activeGroup} · {trancheLabel}</caption>
              <thead className="bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-100"><tr>
                <th scope="col" className="w-[24%] p-3">Indennità e base oraria</th>
                <th scope="col" className="w-[29%] p-3">Anno 2025 · dal 01.01.2025</th>
                <th scope="col" className="w-[29%] p-3">Anno 2026 · dal 01.01.2026</th>
                <th scope="col" className="w-[18%] p-3">Totale arretrato voce<br />(2025 + 2026)</th>
              </tr></thead>
              <tbody>{definitions.map(d => {
                const rows = [2025, 2026].map(year => result?.rows.find(r => r.trancheId === t.id && r.year === year));
                const lines = rows.map(row => row?.allIndemnityRates.find(line => line.key === d.key));
                return <tr key={d.key} className="border-b border-slate-200 dark:border-slate-700">
                  <th scope="row" className="p-3 align-top"><span className="block font-semibold">{d.label}</span><span className="mt-2 inline-block rounded bg-slate-100 px-2 py-1 font-mono text-teal-800 dark:bg-slate-900 dark:text-teal-200">{d.base}</span></th>
                  {([2025, 2026] as const).map((year, j) => <IndemnityYearCell key={year} year={year} line={lines[j]}
                    label={`${d.label} · ${trancheLabel}`} hours={t[year === 2025 ? 'hours2025' : 'hours2026'][d.key]}
                    disabled={!!result && (!rows[j] || rows[j]!.ordinaryMonths === 0)} onChange={hours => changeHours(t.id, year, d.key, hours)} />)}
                  <td className="p-3 align-top font-mono font-extrabold tabular-nums text-teal-800 dark:text-teal-200">{result ? euro(sumMoney(lines.map(line => line?.amount ?? 0))) : '—'}</td>
                </tr>;
              })}</tbody>
            </table></div> : <p className="text-xs text-slate-500">Il supplementare non è previsto per il profilo a tempo pieno di questa tranche.</p>}
          </div>;
        })}
      </div>
    </section>

    <div className="my-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
      {a.ivcDeductionMode === 'CONGUAGLIO_ESATTO_CEDOLINO' ? 'Tabellare 2025: IVC aprile–dicembre + quota di 13ª. Tabellare 2026: IVC 1% sui mesi utili.' : a.ivcDeductionMode === 'STIMA_SINDACALE_SLIDE' ? 'Formula analitica §3.3: IVC 2026 applicata alle mensilità 2025 e 2026.' : 'Nessuna IVC anticipata viene scorporata dal tabellare.'}
      {' '}{a.accessoryDeltaMode === 'INCREMENTO_TABELLARE_PIENO' ? 'Indennità orarie: incremento pieno della Tabella A.' : 'Indennità orarie: si sottrae l’IVC ordinaria media ponderata risultante dal metodo di scorporo selezionato; la quota di 13ª è esclusa dalla media.'}
      {' '}{a.serviceStatus === 'ACTIVE' ? 'La 13ª 2026 è esclusa dagli arretrati e pagata sul nuovo tabellare a dicembre.' : 'I ratei di 13ª sono calcolati fino alla cessazione.'}
    </div>
    {result && <>
      <h3 className="mb-2 font-bold">Riepilogo generale arretrati</h3>
      <p className="mb-2 text-xs text-slate-500">Fine arretrati ordinari: {result.cutoffDate}. Importi lordi prima di contributi e imposte.</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs">
        <caption className="sr-only">Riepilogo generale arretrati 2025 e 2026</caption>
        <thead className="bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"><tr>{['Anno', 'Lordo tabellare', 'IVC', 'Tabellare netto IVC', 'Indennità e ferie', 'Totale'].map(h => <th key={h} scope="col" className="p-2">{h}</th>)}</tr></thead>
        <tbody>{[2025, 2026].map(year => {
          const rows = result.rows.filter(r => r.year === year);
          return <tr key={year} className="border-b border-slate-200 dark:border-slate-700"><th scope="row" className="p-2">Anno {year}</th>{[
            sumMoney(rows.flatMap(r => [r.grossOrdinary, r.grossThirteenth])), sumMoney(rows.map(r => r.ivcDeducted)),
            sumMoney(rows.map(r => r.netTabular)), sumMoney(rows.map(r => r.accessoryTotal)), sumMoney(rows.map(r => r.total)),
          ].map((amount, i) => <td key={i} className="p-2 font-mono tabular-nums">{euro(amount)}</td>)}</tr>;
        })}</tbody>
        <tfoot>
          <tr><th scope="row" colSpan={5} className="p-3">Totale Tabellare Netto IVC</th><td className="p-3 font-mono font-bold tabular-nums">{euro(result.tabularTotal)}</td></tr>
          <tr><th scope="row" colSpan={5} className="p-3">Totale Arretrati Indennità legate al Tabellare{result.unusedVacationArrearsDelta > 0 ? ' e differenziale ferie' : ''}</th><td className="p-3 font-mono font-bold tabular-nums">{euro(result.accessoryTotal)}</td></tr>
          <tr className="bg-teal-50 dark:bg-teal-950/30"><th scope="row" colSpan={5} className="p-3">Totale Complessivo Arretrati</th><td className="p-3 font-mono font-extrabold tabular-nums" data-testid="ccnl-arrears-total">{euro(result.total)}</td></tr>
        </tfoot>
      </table></div>
      {a.serviceStatus === 'TERMINATED' && <div className="mt-4 space-y-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
        <p>Arretrato sulle ferie non fruite già liquidate col vecchio tabellare, incluso nei totali: <strong className="font-mono tabular-nums" data-testid="ccnl-vacation-arrears">{euro(result.unusedVacationArrearsDelta)}</strong></p>
        <p className="text-xs">Valore complessivo del compenso ferie al nuovo tabellare, esposto separatamente senza sommarlo di nuovo: <strong className="font-mono tabular-nums">{euro(result.unusedVacationCompensation)}</strong></p>
      </div>}
    </>}
  </section>;
}
