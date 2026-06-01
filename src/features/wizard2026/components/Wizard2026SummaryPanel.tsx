import React, { useState } from 'react';
import { Wizard2026DraftState } from '../types';
import { selectWizard2026BlockingErrors, selectWizard2026Warnings } from '../selectors';
import { buildWizard2026LegacyMappingPreview } from '../mappingPreview';
import { CheckCircle2, AlertCircle, AlertTriangle, Eye, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export interface Wizard2026SummaryPanelProps {
  state: Wizard2026DraftState;
}

export const Wizard2026SummaryPanel: React.FC<Wizard2026SummaryPanelProps> = ({ state }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const errors = selectWizard2026BlockingErrors(state);
  const warnings = selectWizard2026Warnings(state);
  const preview = buildWizard2026LegacyMappingPreview(state);

  const formatEur = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'n/d';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl shadow-lg border border-slate-800 flex flex-col font-sans overflow-hidden">
      {/* Mobile/Tablet Toggle Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden p-4 bg-slate-950 flex items-center justify-between cursor-pointer border-b border-slate-800 select-none"
      >
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-[#cc4331] flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white">Riepilogo Istruttoria</span>
            <span className="text-[10px] text-slate-400">
              {errors.length} errori • {warnings.length} avvisi
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {errors.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-xs font-bold font-mono">
              {errors.length} ERR
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {/* Main Content (Expanded by default on desktop, conditional on mobile) */}
      <div className={`${isExpanded ? 'flex' : 'hidden lg:flex'} flex-col p-5 gap-6`}>
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-[#cc4331]" />
            <h4 className="font-semibold text-lg text-white">Raccolta dati dell'Ente</h4>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 uppercase tracking-wide">
            Flusso 2026 attivo
          </span>
        </div>

        {/* Errors/Warnings status grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3.5 rounded-lg border ${errors.length > 0 ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-green-500/10 border-green-500/30 text-green-300'}`}>
            <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm mb-1">
              {errors.length > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Errori Bloccanti</span>
            </div>
            <div className="text-2xl font-bold font-mono">{errors.length}</div>
          </div>

          <div className={`p-3.5 rounded-lg border ${warnings.length > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Avvisi / Warning</span>
            </div>
            <div className="text-2xl font-bold font-mono">{warnings.length}</div>
          </div>
        </div>

        {/* Main calculated results */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Importi Istruttori Principali</h5>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between items-center bg-[#cc4331]/10 p-2.5 rounded border border-[#cc4331]/30">
              <span className="text-xs font-sans font-semibold text-[#fce7e2]">Limite Art. 23, comma 2, attualizzato</span>
              <span className="font-bold text-white text-base">{formatEur(state.art23.result?.limiteArt23Attualizzato)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Limite massimo D.L. 25/2025</span>
              <span className="font-bold text-[#cc4331]">{formatEur(state.dl25.result?.limiteMassimoDL25)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">CCNL 0,14% — parte stabile</span>
              <span className="font-bold text-amber-400">{formatEur(state.ccnl2026.result?.incrementoStabile014)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">CCNL 0,14% arretrati — parte variabile</span>
              <span className="font-bold text-amber-400">{formatEur(state.ccnl2026.result?.arretrati014)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Limite massimo CCNL 0,22%</span>
              <span className="font-bold text-amber-400">{formatEur(state.ccnl2026.result?.limiteMassimo022)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Incremento 0,22% → Fondo</span>
              <span className="font-bold text-amber-400">
                {state.ccnl2026.result?.incremento022Fondo !== undefined
                  ? formatEur(state.ccnl2026.result.incremento022Fondo)
                  : <span className="text-slate-500 text-[10px] font-normal font-sans">non ancora inserito</span>}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Incremento 0,22% → EQ</span>
              <span className="font-bold text-amber-400">
                {state.ccnl2026.result?.incremento022EQ !== undefined
                  ? formatEur(state.ccnl2026.result.incremento022EQ)
                  : <span className="text-slate-500 text-[10px] font-normal font-sans">non ancora inserito</span>}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              {(() => {
                const isPost2026 = (state.ente.annoRiferimento ?? 2026) > 2026;
                const riduzioneTotale = state.conglobamentoArt60.result?.riduzioneTotale;
                if (isPost2026) {
                  if (riduzioneTotale === undefined) {
                    return (
                      <>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-sans text-slate-300 font-semibold">Riduzione Art. 60 consolidata dal 2026</span>
                          <span className="text-[10px] text-red-400 font-sans font-semibold">Dato consolidato 2026 mancante</span>
                        </div>
                        <span className="font-bold text-red-400">Mancante</span>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-sans text-slate-300 font-semibold">Riduzione Art. 60 consolidata dal 2026</span>
                          <span className="text-[10px] text-slate-400 font-sans">Valore non ricalcolato sull'anno corrente</span>
                        </div>
                        <span className="font-bold text-red-400">-{formatEur(riduzioneTotale)}</span>
                      </>
                    );
                  }
                } else {
                  return (
                    <>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-sans text-slate-300">Conglobamento Art. 60 (Riduzione)</span>
                        <span className="text-[10px] text-slate-400 font-sans">Valore consolidato dal 2026</span>
                      </div>
                      <span className="font-bold text-red-400">
                        {riduzioneTotale !== undefined ? `-${formatEur(riduzioneTotale)}` : 'n/d'}
                      </span>
                    </>
                  );
                }
              })()}
            </div>

            {/* Righe Straordinario MOD-017 */}
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Residuo straordinario ordinario</span>
              <span className="font-bold text-white">{formatEur(state.straordinario.result?.fondoStraordinarioOrdinarioResiduo)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Riduzione stabile straordinario (Art. 67)</span>
              <span className="font-bold text-amber-400">{formatEur(state.straordinario.result?.incrementoParteStabileDaRiduzioneStraordinario)}</span>
            </div>
            <div className="flex justify-between items-center bg-[#cc4331]/10 p-2.5 rounded border border-[#cc4331]/30">
              <span className="text-xs font-sans font-semibold text-[#fce7e2]">Straordinario ordinario finale soggetto Art. 23</span>
              <span className="font-bold text-white text-base">{formatEur(state.straordinario.result?.straordinarioOrdinarioFinaleSoggettoArt23)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Incremento ordinario straordinario</span>
              <span className="font-bold text-amber-400">{formatEur(state.straordinario.result?.incrementoStraordinarioOrdinarioSoggettoArt23)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Riduzione Fondo per straordinario</span>
              <span className="font-bold text-red-400">
                {state.straordinario.result?.riduzioneFondoDecentratoPerStraordinario !== undefined && state.straordinario.result.riduzioneFondoDecentratoPerStraordinario > 0
                  ? `-${formatEur(state.straordinario.result.riduzioneFondoDecentratoPerStraordinario)}`
                  : formatEur(0)}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Economie straordinario da riversare</span>
              <span className="font-bold text-green-400">{formatEur(state.straordinario.result?.economieStraordinarioAnnoPrecedenteDaRiversare)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
              <span className="text-xs font-sans text-slate-300">Straordinario escluso Art. 23</span>
              <span className="font-bold text-slate-300">{formatEur(state.straordinario.result?.totaleStraordinarioEsclusoArt23)}</span>
            </div>

            {/* Righe PNRR */}
            {state.pnrr.result?.isApplicabile && (
              <>
                <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
                  <span className="text-xs font-sans text-slate-300">Max PNRR Dipendenti (escluso Art. 23)</span>
                  <span className="font-bold text-emerald-400">
                    {state.pnrr.result?.isValidable
                      ? formatEur(state.pnrr.result.limiteMassimoPnrrFondoDipendenti)
                      : 'n/d'}
                  </span>
                </div>
                {state.ente.hasDirigenza && (
                  <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
                    <span className="text-xs font-sans text-slate-300">Max PNRR Dirigenza (escluso Art. 23)</span>
                    <span className="font-bold text-emerald-400">
                      {state.pnrr.result?.isValidable
                        ? formatEur(state.pnrr.result.limiteMassimoPnrrFondoDirigenza)
                        : 'n/d'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center bg-[#cc4331]/10 p-2.5 rounded border border-[#cc4331]/30">
                  <span className="text-xs font-sans font-semibold text-[#fce7e2]">Totale Limite PNRR (escluso Art. 23)</span>
                  <span className="font-bold text-white text-base">
                    {state.pnrr.result?.isValidable
                      ? formatEur(state.pnrr.result.totaleLimiteMassimoPnrr)
                      : 'n/d'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Collapsible Mapping Preview */}
        <div className="pt-2 border-t border-slate-800">
          <details className="group border border-slate-800 rounded bg-slate-900 overflow-hidden">
            <summary className="cursor-pointer font-semibold text-slate-300 hover:text-white transition-colors p-3 flex items-center justify-between text-xs select-none">
              <span className="flex items-center gap-1.5">
                <span>Mapping Preview</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                  {preview.items.filter((i) => i.status === 'READY').length} pronti
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2 max-h-48 overflow-y-auto text-xs">
              {preview.items.map((item, idx) => {
                const statusBg = {
                  READY: 'bg-green-500/20 text-green-300 border-green-500/30',
                  MISSING: 'bg-red-500/20 text-red-300 border-red-500/30',
                  NOT_APPLICABLE: 'bg-slate-800 text-slate-400 border-slate-700',
                  REQUIRES_REVIEW: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                }[item.status];

                const statusLabel = {
                  READY: 'Pronto',
                  MISSING: 'Mancante',
                  NOT_APPLICABLE: 'N/A',
                  REQUIRES_REVIEW: 'Verificare',
                }[item.status];

                return (
                  <div key={idx} className="p-2.5 bg-slate-800/40 rounded border border-slate-800 flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-semibold text-slate-200 truncate">{item.sourceStep}</div>
                      <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1 min-w-0">
                        <span className="truncate">{item.sourceField.split('.').pop()}</span>
                        <ArrowRight className="w-2.5 h-2.5 flex-shrink-0 text-slate-500" />
                        <span className="text-slate-300 truncate">{item.targetLegacyField.split('.').pop()}</span>
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 font-mono text-[10px] uppercase font-semibold rounded border flex-shrink-0 ${statusBg}`}>
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </details>
        </div>

        {/* Inactive transfer footer */}
        <div className="mt-auto pt-4 border-t border-slate-800 text-center space-y-3">
          <div className="inline-block px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30 uppercase tracking-wider">
            Non ancora attivo
          </div>
          <button
            disabled
            className="w-full py-3 px-4 rounded-lg bg-slate-800 text-slate-500 font-semibold text-sm border border-slate-700 cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Trasferisci i dati alla costituzione del fondo e compila</span>
          </button>
          <p className="text-[11px] text-slate-500">
            Non ancora attivo: sarà disponibile dopo il refactoring.
          </p>
        </div>
      </div>
    </div>
  );
};
