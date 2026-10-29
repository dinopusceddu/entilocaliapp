import type { SimulatorInput } from '../../types/ccnl2025_2027SimulatorTypes';
import type { RegimeEpoch } from '../../data/ccnl2025_2027Tables';
import { REGIME_LABELS } from '../../logic/ccnl2025_2027Defaults';
import { SelectField } from './SimulatorFields';
export function RegimeCommutatorBar({ value, onChange, onPreset }: { value: SimulatorInput; onChange: (v: SimulatorInput) => void; onPreset: (index: number) => void }) {
  const changeEpoch = (epoch: RegimeEpoch) => {
    const month = epoch === 'NOV_DEC_2026_REGIME' ? 11 : epoch === 'DAL_GEN_2027_REGIME' ? 1 : 7;
    onChange({ ...value, regimeEpoch: epoch, monthly: { ...value.monthly, month } });
  };
  return <section aria-label="Epoca e vista della simulazione" className="space-y-4 rounded-2xl bg-slate-900 p-4 text-white">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-300">Decorrenza del cedolino</p><div className="flex flex-wrap gap-1" role="group" aria-label="Epoca a regime">{(Object.keys(REGIME_LABELS) as RegimeEpoch[]).map(epoch => <button key={epoch} type="button" aria-pressed={value.regimeEpoch === epoch} onClick={() => changeEpoch(epoch)} className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${value.regimeEpoch === epoch ? 'bg-teal-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>{REGIME_LABELS[epoch]}</button>)}</div></div>
    <div className="min-w-56 rounded-xl bg-white p-2 dark:bg-slate-800"><SelectField label="Vista competenze mensili" value={value.monthly.monthlyViewMode} onChange={monthlyViewMode => onChange({ ...value, monthly: { ...value.monthly, monthlyViewMode } })} options={[{ value: 'COMPLETA_CON_PRESENZA', label: 'Completa con presenza' }, { value: 'SOLO_ORARIE', label: 'Solo competenze orarie' }, { value: 'SOLO_PRESENZA', label: 'Solo indennità a presenza' }]} /></div></div>
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-700 pt-3"><span className="text-xs text-slate-300">Preset rapidi · sostituiscono la bozza:</span>{['Istruttore ex C4 + 2 Diff.', 'Agente Polizia Locale Turnista', 'Istruttore Part-Time 50% con Supplementare'].map((label, i) => <button type="button" className="rounded-full border border-slate-600 px-3 py-1.5 text-xs hover:border-teal-300 hover:text-teal-200" key={label} onClick={() => onPreset(i)}>{label}</button>)}</div>
  </section>;
}
