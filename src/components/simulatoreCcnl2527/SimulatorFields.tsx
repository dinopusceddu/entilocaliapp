import type { AccessoryHours, SimulatorProfile } from '../../types/ccnl2025_2027SimulatorTypes';
import { HOUR_DEFINITIONS } from '../../logic/ccnl2025_2027Defaults';
export const fieldClass = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100';
export const panelClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-800 dark:border-slate-700';
export function NumberField({ label, value, onChange, min = 0, max, step = '.01', disabled = false }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: string; disabled?: boolean }) {
  return <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{label}<input type="number" min={min} max={max} step={step} value={Number.isFinite(value) ? value : ''} disabled={disabled} onChange={e => onChange(Number(e.target.value))} className={`${fieldClass} font-mono tabular-nums disabled:opacity-50`} /></label>;
}
export function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (v: T) => void }) {
  return <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{label}<select className={fieldClass} value={value} onChange={e => onChange(e.target.value as T)}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
}
export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="flex cursor-pointer items-center gap-2 py-2 text-sm"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="size-4 accent-teal-700" />{label}</label>;
}
export function HoursFields({ value, onChange, profile, group }: { value: AccessoryHours; onChange: (v: AccessoryHours) => void; profile: SimulatorProfile; group?: string }) {
  const groups = [...new Set(HOUR_DEFINITIONS.map(d => d.group))].filter(g => !group || g === group);
  return <div className="space-y-4">{groups.map(g => {
    if (g.startsWith('Supplementare') && profile.workTimeRegime !== 'PART_TIME') return null;
    return <fieldset key={g} className="space-y-2"><legend className="mb-2 text-sm font-bold text-teal-700 dark:text-teal-300">{g}</legend><div className="grid gap-3 sm:grid-cols-2">{HOUR_DEFINITIONS.filter(d => d.group === g).map(d => <NumberField key={d.key} label={`${d.label} · ${d.base} · ore`} value={value[d.key]} onChange={n => onChange({ ...value, [d.key]: n })} max={100000} />)}</div></fieldset>;
  })}</div>;
}
