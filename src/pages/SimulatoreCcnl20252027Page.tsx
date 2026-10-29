import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calculator, RotateCcw } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { NavigationScope } from '../types';
import type { ArrearsResult, MonthlyResult, SimulatorInput, SimulatorProfile } from '../types/ccnl2025_2027SimulatorTypes';
import { SimulatorInputSchema } from '../schemas/ccnl2025_2027SimulatorSchemas';
import { createDefaultSimulatorInput, createPreset, SIMULATOR_STORAGE_KEY } from '../logic/ccnl2025_2027Defaults';
import { calculateArrears } from '../logic/ccnl2025_2027ArrearsEngine';
import { calculateMonthlyPayslip } from '../logic/ccnl2025_2027PayslipEngine';
import { RegimeCommutatorBar } from '../components/simulatoreCcnl2527/RegimeCommutatorBar';
import { ProfileAutoCalculatorStep } from '../components/simulatoreCcnl2527/ProfileAutoCalculatorStep';
import { partTimeMonthlyHours } from '../logic/ccnl2025_2027Math';
import { ArrearsQuickSummaryStep } from '../components/simulatoreCcnl2527/ArrearsQuickSummaryStep';
import { MonthlySimulationStep } from '../components/simulatoreCcnl2527/MonthlySimulationStep';
import { LivePayslipPreviewCard } from '../components/simulatoreCcnl2527/LivePayslipPreviewCard';

function readDraft(): { input: SimulatorInput; notice: string } {
  try {
    const raw = localStorage.getItem(SIMULATOR_STORAGE_KEY);
    if (raw) {
      const parsed = SimulatorInputSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return { input: parsed.data, notice: 'Bozza locale ripristinata.' };
      return { input: createDefaultSimulatorInput(), notice: 'Bozza non compatibile: caricati i valori predefiniti.' };
    }
  } catch { return { input: createDefaultSimulatorInput(), notice: 'Bozza non leggibile: caricati i valori predefiniti.' }; }
  return { input: createDefaultSimulatorInput(), notice: '' };
}
export const SimulatoreCcnl20252027Page: React.FC = () => {
  const { setScopeAndTab } = useAppContext();
  const [initial] = useState(readDraft);
  const [input, setInput] = useState(initial.input);
  const [notice, setNotice] = useState(initial.notice);
  const [storageError, setStorageError] = useState('');
  const [exporting, setExporting] = useState(false);
  const calculated = useMemo<{ arrears: ArrearsResult | null; monthly: MonthlyResult | null; errors: string[] }>(() => {
    const parsed = SimulatorInputSchema.safeParse(input);
    if (!parsed.success) return { arrears: null, monthly: null, errors: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) };
    try { return { arrears: calculateArrears(parsed.data.profile, parsed.data.arrears), monthly: calculateMonthlyPayslip(parsed.data), errors: [] }; }
    catch (error) { return { arrears: null, monthly: null, errors: [error instanceof Error ? error.message : 'Calcolo non disponibile'] }; }
  }, [input]);
  useEffect(() => {
    if (calculated.errors.length) return;
    try { localStorage.setItem(SIMULATOR_STORAGE_KEY, JSON.stringify(input)); setStorageError(''); }
    catch { setStorageError('Salvataggio locale non disponibile: puoi continuare ed esportare il prospetto.'); }
  }, [input, calculated.errors]);
  const changeProfile = (profile: SimulatorProfile) => {
    const changedRatio = profile.workTimeRegime !== input.profile.workTimeRegime || profile.partTimePercentage !== input.profile.partTimePercentage;
    setInput({ ...input, profile, monthly: { ...input.monthly,
      contractualMonthlyHoursPartTime: changedRatio && Number.isFinite(profile.partTimePercentage) ? partTimeMonthlyHours(profile) : input.monthly.contractualMonthlyHoursPartTime,
      overtimeReason: profile.isTitolareEQ && input.monthly.overtimeReason === 'ORDINARIO' ? 'ELETTORALE' : input.monthly.overtimeReason,
    } });
  };
  const doExport = async (kind: 'xlsx' | 'pdf') => {
    if (calculated.errors.length || exporting) return;
    setExporting(true); setNotice('');
    try {
      if (kind === 'xlsx') (await import('../services/ccnl2025_2027ExcelService')).exportCcnl20252027Excel(input);
      else (await import('../services/ccnl2025_2027PdfService')).exportCcnl20252027Pdf(input);
      setNotice(`Prospetto ${kind.toUpperCase()} generato.`);
    } catch (error) { setNotice(`Export non riuscito: ${error instanceof Error ? error.message : 'errore imprevisto'}`); }
    finally { setExporting(false); }
  };
  return <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 text-slate-900 dark:text-slate-100 sm:px-6" data-testid="simulatore-ccnl-25-27-page">
    <header className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setScopeAndTab(NavigationScope.DASHBOARD, 'dashboard')} className="flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300"><ArrowLeft className="size-4" />← Torna alla Toolbox</button><button type="button" onClick={() => { setInput(createDefaultSimulatorInput()); setNotice('Valori predefiniti ripristinati.'); }} className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-teal-700 dark:text-slate-300"><RotateCcw className="size-3.5" />Ripristina valori predefiniti</button></div>
      <div className="flex gap-4"><div className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#0f766e] sm:flex dark:bg-teal-950"><Calculator className="size-7" /></div><div><p className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-300">Modalità Dipendente · Studio Cedolino Individuale CCNL 28.10.2026</p><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Arretrati, costo orario e busta paga</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">CCNL Funzioni Locali 2025–2027 · Inquadramento automatico, quattro basi retributive e competenze del mese.</p></div></div>
    </header>
    <RegimeCommutatorBar value={input} onChange={setInput} onPreset={i => { setInput(createPreset(i)); setNotice('Preset caricato e salvato nella bozza locale.'); }} />
    <div aria-live="polite" className="text-xs text-slate-500 dark:text-slate-400">{storageError || notice || 'Salvataggio automatico della bozza su questo dispositivo.'}</div>
    {calculated.errors.length > 0 && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-bold">Verifica i dati inseriti</p><ul className="mt-2 list-disc space-y-1 pl-5">{calculated.errors.map((error, i) => <li key={`${i}-${error}`}>{error}</li>)}</ul></div>}
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><main className="min-w-0 space-y-5"><ProfileAutoCalculatorStep value={input} onChange={setInput} onProfileChange={changeProfile} /><ArrearsQuickSummaryStep value={input} result={calculated.arrears} onChange={setInput} /><MonthlySimulationStep value={input} result={calculated.monthly} onChange={setInput} /><p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Metodo: Master Blueprint v8.0, formule analitiche §§3.1–3.4. Tabelle e decorrenze del CCNL 28.10.2026. Gli importi indicati sono lordi; la detrazione IVC non costituisce una stima del netto fiscale.</p></main><LivePayslipPreviewCard arrears={calculated.arrears} monthly={calculated.monthly} onExcel={() => { void doExport('xlsx'); }} onPdf={() => { void doExport('pdf'); }} exporting={exporting} /></div>
  </div>;
};
