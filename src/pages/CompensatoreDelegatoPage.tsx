import React, { useState, useCallback } from 'react';
import { CompensatoreInputForm } from '../components/compensatore/CompensatoreInputForm';
import { CompensatoreRiepilogo } from '../components/compensatore/CompensatoreRiepilogo';
import { calcolaCompensatore } from '../logic/compensiCalculations';
import { Button } from '../components/shared/Button';
import {
  InputCompensatore,
  RisultatoCompensatore,
  AreaCCNL,
  FaseContrattuale,
  TipoOrario,
  TipoStraordinario,
  TipoTurno,
  ModalitaRecuperoStraordinario,
} from '../types/compensiTypes';

// ---------------------------------------------------------------
// Valore iniziale del form
// ---------------------------------------------------------------
const INPUT_INIZIALE: InputCompensatore = {
  annoRiferimento: new Date().getFullYear(),
  meseRiferimento: new Date().getMonth() + 1,
  faseContrattuale: FaseContrattuale.REGIME_2026,
  area: AreaCCNL.ISTRUTTORE,
  posizioneEconomica: 'C3',
  tipoOrario: TipoOrario.ORE_36,
  orePerStraordinario: {
    [TipoStraordinario.DIURNO]: undefined,
    [TipoStraordinario.NOTTURNO]: undefined,
    [TipoStraordinario.FESTIVO]: undefined,
    [TipoStraordinario.FESTIVO_NOTTURNO]: undefined,
  },
  modalitaRecuperoStraordinario: ModalitaRecuperoStraordinario.PAGAMENTO,
  orePerTurno: {
    [TipoTurno.DIURNO]: undefined,
    [TipoTurno.NOTTURNO]: undefined,
    [TipoTurno.FESTIVO]: undefined,
    [TipoTurno.FESTIVO_NOTTURNO]: undefined,
    [TipoTurno.FESTIVO_INFRASETTIMANALE]: undefined,
  },
};

// ---------------------------------------------------------------
// Export CSV
// ---------------------------------------------------------------
function scaricaCsv(risultato: RisultatoCompensatore) {
  const header = 'Voce;Rif. Normativo;Ore;Valore Orario (€);Maggiorazione;Totale (€);Imputazione\n';
  const allRighe = [
    ...risultato.righeStrordinario,
    ...risultato.righeSupplementare,
    ...risultato.righeTurni,
  ];
  const rows = allRighe.map(r =>
    `"${r.voce}";"${r.riferimentoNormativo}";${r.ore.toFixed(1)};${r.valoreOrario.toFixed(2)};${(r.maggiorazionePercentuale * 100).toFixed(0)}%;${r.totale.toFixed(2)};"${r.imputazione}"`
  ).join('\n');
  const footer = `\n"TOTALE";"";"";"";"";"${risultato.totaleComplessivo.toFixed(2)}";""\n`;

  const blob = new Blob(['\uFEFF' + header + rows + footer], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `compensi_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------
// Pagina Principale
// ---------------------------------------------------------------
export const CompensatoreDelegatoPage: React.FC = () => {
  const [input, setInput] = useState<InputCompensatore>(INPUT_INIZIALE);
  const [risultato, setRisultato] = useState<RisultatoCompensatore | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  const handleCalcola = useCallback(() => {
    setErrore(null);
    try {
      if (!input.posizioneEconomica) {
        setErrore('Seleziona la posizione economica prima di calcolare.');
        return;
      }
      const res = calcolaCompensatore(input);
      if (res.retribuzioniBase.stipendioTabellare === 0) {
        setErrore('Posizione economica non trovata per l\'area e la fase contrattuale selezionate. Controlla i dati inseriti.');
        return;
      }
      setRisultato(res);
      setTimeout(() => {
        document.getElementById('riepilogo-compensi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e) {
      setErrore('Errore durante il calcolo. Verifica i dati inseriti.');
    }
  }, [input]);

  const handleReset = () => {
    setInput(INPUT_INIZIALE);
    setRisultato(null);
    setErrore(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 space-y-8">

      {/* Header */}
      <div className="border-b border-[#f3e7e8] pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-[#1b0e0e] tracking-tight">
              Calcolatore Compensi Delegato
            </h1>
            <p className="text-[#5f5252] mt-2 max-w-2xl">
              Strumento di calcolo per il personale del comparto Funzioni Locali. Calcola autonomamente straordinario,
              supplementare e indennità di turno secondo il CCNL 2019-2021, aggiornato con le novità economiche del CCNL 23.02.2026.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            🔄 Nuovo calcolo
          </Button>
        </div>

        {/* Riquadro normativo */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { art: 'Artt. 29-33', desc: 'Lavoro Straordinario', dettaglio: 'CCNL 2019-2021' },
            { art: 'Art. 62', desc: 'Lavoro Supplementare', dettaglio: 'CCNL 2019-2021' },
            { art: 'Art. 30', desc: 'Indennità di Turno', dettaglio: 'CCNL 2019-2021' },
          ].map(item => (
            <div key={item.art} className="bg-[#f3e7e8] rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ea2832] text-white flex items-center justify-center text-xs font-bold shrink-0">
                §
              </div>
              <div>
                <p className="text-xs font-bold text-[#ea2832]">{item.art}</p>
                <p className="text-sm font-semibold text-[#1b0e0e]">{item.desc}</p>
                <p className="text-xs text-[#5f5252]">{item.dettaglio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout a due colonne su desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Colonna sin: Input */}
        <div className="lg:col-span-2 space-y-4">
          <CompensatoreInputForm input={input} onChange={setInput} />

          {errore && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              ⚠️ {errore}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleCalcola}
            className="w-full"
          >
            Calcola Compensi ▶
          </Button>
        </div>

        {/* Colonna dx: Riepilogo */}
        <div id="riepilogo-compensi" className="lg:col-span-3">
          {risultato ? (
            <CompensatoreRiepilogo
              risultato={risultato}
              onExportPdf={() => window.print()}
              onExportCsv={() => scaricaCsv(risultato)}
            />
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-[#fcf8f8] rounded-xl border border-dashed border-[#f3e7e8]">
              <div className="text-6xl mb-4">🧮</div>
              <p className="text-xl font-bold text-[#1b0e0e] mb-2">Nessun Calcolo Eseguito</p>
              <p className="text-[#5f5252] max-w-xs">
                Compila i dati nel form a sinistra e premi <strong>"Calcola Compensi"</strong> per ottenere il riepilogo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer normativo */}
      <div className="bg-[#f3e7e8]/50 border border-[#f3e7e8] rounded-lg p-4 text-xs text-[#5f5252]">
        <p className="font-semibold text-[#1b0e0e] mb-1">Nota legale</p>
        <p>
          I calcoli si basano sulle disposizioni del CCNL Funzioni Locali 21.05.2018 (artt. 29-33, 62, 73-74, 84-bis) aggiornate
          con le novità economiche del CCNL 23.02.2026. Le tabelle stipendiali sono indicative e potrebbero non riflettere
          eventuali scatti o accordi integrativi locali. Per la liquidazione ufficiale fare riferimento al servizio paghe dell'ente.
        </p>
      </div>
    </div>
  );
};
