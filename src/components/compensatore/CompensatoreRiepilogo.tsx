import React from 'react';
import { RisultatoCompensatore, ImputazioneVoce, RigaRiepilogo } from '../../types/compensiTypes';
import { PARAMETRI_CCNL } from '../../logic/compensiCalculations';

interface CompensatoreRiepilogoProps {
  risultato: RisultatoCompensatore;
  onExportPdf: () => void;
  onExportCsv: () => void;
}

const euro = (n: number) => `€ ${n.toFixed(2).replace('.', ',')}`;
const perc = (n: number) => `${(n * 100).toFixed(0)}%`;

const BadgeImputazione: React.FC<{ imputazione: ImputazioneVoce }> = ({ imputazione }) => {
  return imputazione === ImputazioneVoce.FONDO_RISORSE_DECENTRATE
    ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        🔵 Fondo Decentrato
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        🟢 Bilancio
      </span>
    );
};

const TabellaVoci: React.FC<{ titolo: string; righe: RigaRiepilogo[] }> = ({ titolo, righe }) => {
  if (righe.length === 0) return null;
  const totale = righe.reduce((acc, r) => acc + r.totale, 0);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-[#1b0e0e] uppercase tracking-wider mb-2 px-1">{titolo}</h3>
      <div className="overflow-x-auto rounded-lg border border-[#f3e7e8]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#f3e7e8] text-[#1b0e0e]">
              <th className="px-4 py-2 text-left font-semibold">Voce</th>
              <th className="px-4 py-2 text-left font-semibold">Rif. normativo</th>
              <th className="px-4 py-2 text-right font-semibold">Ore</th>
              <th className="px-4 py-2 text-right font-semibold">Val. orario</th>
              <th className="px-4 py-2 text-right font-semibold">Magg.</th>
              <th className="px-4 py-2 text-right font-semibold">Totale</th>
              <th className="px-4 py-2 text-center font-semibold">Imputazione</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3e7e8]">
            {righe.map((riga, i) => (
              <tr key={i} className="hover:bg-[#fcf8f8] transition-colors">
                <td className="px-4 py-2.5 font-medium text-[#1b0e0e]">
                  {riga.voce}
                  {riga.note && (
                    <p className="text-xs text-amber-700 mt-0.5">{riga.note}</p>
                  )}
                </td>
                <td className="px-4 py-2.5 text-[#5f5252] text-xs">{riga.riferimentoNormativo}</td>
                <td className="px-4 py-2.5 text-right">{riga.ore.toFixed(1)}</td>
                <td className="px-4 py-2.5 text-right font-mono">{euro(riga.valoreOrario)}</td>
                <td className="px-4 py-2.5 text-right font-mono">{perc(riga.maggiorazionePercentuale)}</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#1b0e0e]">{euro(riga.totale)}</td>
                <td className="px-4 py-2.5 text-center"><BadgeImputazione imputazione={riga.imputazione} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#f3e7e8] font-bold">
              <td className="px-4 py-2.5 text-[#1b0e0e]" colSpan={5}>Subtotale {titolo}</td>
              <td className="px-4 py-2.5 text-right font-mono text-[#ea2832]">{euro(totale)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export const CompensatoreRiepilogo: React.FC<CompensatoreRiepilogoProps> = ({
  risultato,
  onExportPdf,
  onExportCsv,
}) => {
  const { retribuzioniBase: rb } = risultato;

  return (
    <div className="space-y-6">

      {/* Export buttons */}
      <div className="flex gap-2 print:hidden">
        <button
          onClick={onExportPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#ea2832] text-white hover:bg-[#c02128] transition-colors"
        >
          📄 Esporta PDF
        </button>
        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#f3e7e8] text-[#1b0e0e] hover:bg-[#e9dcdf] transition-colors"
        >
          📊 Esporta CSV
        </button>
      </div>

      {/* Base retributiva */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-3">
          Base Retributiva — Art. 73-74 CCNL 2019-2021
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs opacity-60">Stipendio tabellare</p>
            <p className="text-lg font-bold font-mono">{euro(rb.stipendioTabellare)}</p>
          </div>
          {rb.ria > 0 && (
            <div>
              <p className="text-xs opacity-60">RIA</p>
              <p className="text-lg font-bold font-mono">{euro(rb.ria)}</p>
            </div>
          )}
          {rb.assegnoPersonale > 0 && (
            <div>
              <p className="text-xs opacity-60">Assegno Personale</p>
              <p className="text-lg font-bold font-mono">{euro(rb.assegnoPersonale)}</p>
            </div>
          )}
          <div>
            <p className="text-xs opacity-60">Ret. Globale di Fatto</p>
            <p className="text-lg font-bold font-mono">{euro(rb.retribuzioneGlobaleDiFatto)}</p>
          </div>
          <div>
            <p className="text-xs opacity-60">Divisore orario</p>
            <p className="text-lg font-bold font-mono">{rb.divisoreOrario.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xs opacity-60">RBO (Straord.) — Art. 32</p>
            <p className="text-base font-semibold font-mono">{euro(rb.rbo)}/h</p>
          </div>
          <div>
            <p className="text-xs opacity-60">ROG (Suppl.) — Art. 62</p>
            <p className="text-base font-semibold font-mono">{euro(rb.rog)}/h</p>
          </div>
          <div>
            <p className="text-xs opacity-60">RT (Turni) — Art. 30</p>
            <p className="text-base font-semibold font-mono">{euro(rb.rt)}/h</p>
          </div>
        </div>
      </div>

      {/* Parametri applicati (per verifica sindacale) */}
      <details className="group">
        <summary className="cursor-pointer text-xs font-semibold text-[#994d51] hover:text-[#ea2832] select-none">
          ▶ Parametri normativi applicati (per verifica sindacale)
        </summary>
        <div className="mt-2 bg-[#fcf8f8] rounded-lg border border-[#f3e7e8] p-4 text-xs text-[#5f5252] grid grid-cols-2 gap-2">
          <div><strong>Divisore 36h</strong>: {PARAMETRI_CCNL.divisoreOrdinario36h} (Art. 73 c.2)</div>
          <div><strong>Divisore 35h</strong>: {PARAMETRI_CCNL.divisoreOrdinario35h.toFixed(2)} (Art. 73 c.2)</div>
          <div><strong>Straord. diurno</strong>: +{(PARAMETRI_CCNL.straordDiurno * 100).toFixed(0)}% (Art. 32 c.1a)</div>
          <div><strong>Straord. notturno</strong>: +{(PARAMETRI_CCNL.straordNotturno * 100).toFixed(0)}% (Art. 32 c.1b)</div>
          <div><strong>Straord. festivo</strong>: +{(PARAMETRI_CCNL.straordFestivo * 100).toFixed(0)}% (Art. 32 c.1c)</div>
          <div><strong>Straord. fest-nott.</strong>: +{(PARAMETRI_CCNL.straordFestivoNotturno * 100).toFixed(0)}% (Art. 32 c.1d)</div>
          <div><strong>Suppl. entro 25%</strong>: +{(PARAMETRI_CCNL.supplementareEntro25 * 100).toFixed(0)}% (Art. 62 c.2a)</div>
          <div><strong>Suppl. oltre 25%</strong>: +{(PARAMETRI_CCNL.supplementareOltre25 * 100).toFixed(0)}% (Art. 62 c.2b)</div>
          <div><strong>Turno diurno</strong>: +{(PARAMETRI_CCNL.turnoDiurno * 100).toFixed(0)}% (Art. 30 c.1a)</div>
          <div><strong>Turno notturno</strong>: +{(PARAMETRI_CCNL.turnoNotturno * 100).toFixed(0)}% (Art. 30 c.1b)</div>
          <div><strong>Turno festivo</strong>: +{(PARAMETRI_CCNL.turnoFestivo * 100).toFixed(0)}% (Art. 30 c.1c)</div>
          <div><strong>Turno fest-nott.</strong>: +{(PARAMETRI_CCNL.turnoFestivoNotturno * 100).toFixed(0)}% (Art. 30 c.1d)</div>
          <div className="col-span-2"><strong>Festivo infrasettimanale</strong>: +{(PARAMETRI_CCNL.turnoFestivoInfrasettimanale * 100).toFixed(0)}% intera giornata 0:00-23:59 (Art. 30 c.3)</div>
        </div>
      </details>

      {/* Tabelle voci */}
      <TabellaVoci titolo="Straordinario — Art. 32 CCNL 2019-2021" righe={risultato.righeStrordinario} />
      <TabellaVoci titolo="Lavoro Supplementare — Art. 62 CCNL 2019-2021" righe={risultato.righeSupplementare} />
      <TabellaVoci titolo="Indennità di Turno — Art. 30 CCNL 2019-2021" righe={risultato.righeTurni} />

      {/* Banca ore note */}
      {risultato.noteBancaOre && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">ℹ️ Nota — Banca delle Ore (Art. 33)</p>
          <p>{risultato.noteBancaOre}</p>
        </div>
      )}

      {/* Totale complessivo */}
      <div className="border-2 border-[#ea2832] rounded-xl p-5 bg-[#fef2f2]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-[#5f5252] uppercase tracking-wider">Totale Complessivo</p>
            <p className="text-4xl font-bold text-[#ea2832] font-mono mt-1">{euro(risultato.totaleComplessivo)}</p>
          </div>
          <div className="text-sm space-y-1 text-right">
            {risultato.totaleStrordinario > 0 && (
              <p><span className="text-[#5f5252]">Straordinario:</span> <span className="font-mono font-semibold">{euro(risultato.totaleStrordinario)}</span></p>
            )}
            {risultato.totaleSupplementare > 0 && (
              <p><span className="text-[#5f5252]">Supplementare:</span> <span className="font-mono font-semibold">{euro(risultato.totaleSupplementare)}</span></p>
            )}
            {risultato.totaleTurni > 0 && (
              <p><span className="text-[#5f5252]">Turni:</span> <span className="font-mono font-semibold">{euro(risultato.totaleTurni)}</span></p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="text-xs text-[#994d51]">
            🔵 Tutte le voci confluiscono nel <strong>Fondo Risorse Decentrate</strong> — parte variabile.
            Il pagamento viene effettuato tramite liquidazione mensile o bilancio dell'ente.
          </p>
        </div>
      </div>

    </div>
  );
};
