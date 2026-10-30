// pages/FondoElevateQualificazioniPage.tsx
import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { FondoElevateQualificazioniData } from '../types.ts';
import { Card } from '../components/shared/Card.tsx';
import { RIF_DELIBERA_ENTE, RIF_CCNL_2022_2024_INC_022_EQ } from '../constants.ts';
import { FundingItem } from '../components/shared/FundingItem.tsx';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { formatCurrency } from '../utils/formatters.ts';

const SectionTotal: React.FC<{ label: string; total?: number, className?: string }> = ({ label, total, className = "" }) => {
  return (
    <div className={`mt-4 pt-4 border-t-2 border-[#d1c0c1] ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-[#1b0e0e]">{label}</span>
        <span className="text-lg font-bold text-[#ea2832]">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};

export const FondoElevateQualificazioniPage: React.FC = () => {
  const { state, dispatch, performLocalCalculation } = useAppContext();
  const isClosed = state.fundData?.metadata?.snapshotStatus === 'CLOSED';
  const { data: normativeData } = useNormativeData();
  const annualData = state.fundData.annualData;
  const data = state.fundData.fondoElevateQualificazioniData || {} as FondoElevateQualificazioniData;

  const localCalculation = useRef(performLocalCalculation);
  useEffect(() => { localCalculation.current = performLocalCalculation; }, [performLocalCalculation]);
  // Only leaving the page refreshes the projection. A changing callback identity
  // during a calculation must not trigger another cleanup/calculation cycle.
  useEffect(() => () => { void localCalculation.current(); }, []);

  if (!normativeData) return null;

  const { riferimenti_normativi: norme } = normativeData;

  const handleChange = (field: keyof FondoElevateQualificazioniData, value?: number) => {
    if (isClosed) return;
    dispatch({ type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA', payload: { [field]: value } });
  };

  const ms2021 = annualData?.ccnl2024?.monteSalari2021 || 0;
  const max022MS = (ms2021 * 0.22) / 100;
  // Preserve the former legacy split as information only, never an adopted amount.
  const settings = annualData.ccnl2024;
  const splitBase = (settings?.fondoPersonale2025 ?? 0) + (settings?.fondoEQ2025 ?? 0);
  const legacyEqProposal = Number(annualData.annoRiferimento) !== 2026 &&
    settings?.monteSalari2021 !== undefined && settings.optionalIncreaseVariableFrom2026Percentage !== undefined &&
    settings.fondoPersonale2025 !== undefined && settings.fondoEQ2025 !== undefined && splitBase > 0
    ? Number((settings.monteSalari2021 * settings.optionalIncreaseVariableFrom2026Percentage / 100 * settings.fondoEQ2025 / splitBase).toFixed(2))
    : undefined;

  // -- TOTALI --
  const sommaRisorseStabiliBase =
    (data.ris_fondoPO2017 || 0) +
    (data.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (data.ris_incrementoLimiteArt23c2_DL34 || 0) -
    (data.fin_art23c2_adeguamentoTetto2016 || 0);

  const sommaVariabiliExtra =
    (data.ris_incremento022MonteSalari2018 || 0) +
    (data.st_incremento014_ms2021_eq || 0) +
    (data.va_incremento022_ms2021_eq || 0) +
    (data.va_arretrati014_eq || 0) +
    (data.va_art18c5_CCNL2026_maggiorazioneSediLavoro || 0) +
    (data.va_art16c5_CCNL2026_maggiorazioneInterim || 0) +
    (data.va_dl25_2025_armonizzazione || 0);

  const totaleRisorseDisponibili = sommaRisorseStabiliBase + sommaVariabiliExtra;

  const totaleSoggettoAlLimite =
    (data.ris_fondoPO2017 || 0) +
    (data.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (data.ris_incrementoLimiteArt23c2_DL34 || 0);

  const totaleEsclusoLimite = totaleRisorseDisponibili - totaleSoggettoAlLimite + (data.fin_art23c2_adeguamentoTetto2016 || 0);



  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Fondo delle Elevate Qualificazioni (EQ)</h2>

      {isClosed && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-3 text-amber-900 text-sm font-medium shadow-sm">
          <span className="text-xl">🔒</span>
          <div>
            <strong>Annualità Chiusa (Sola Lettura):</strong> Questo esercizio è stato definitivamente chiuso. Tutte le modifiche sono disabilitate per garantire l'immutabilità dei dati storici.
          </div>
        </div>
      )}

      <Card title="Risorse Finanziamento - Parte Stabile e Base" className="mb-6" isCollapsible={false}>
        <FundingItem<FondoElevateQualificazioniData> id="ris_fondoPO2017" description="Fondo delle Posizioni Organizzative nell'anno 2017 (valore storico di partenza)" riferimentoNormativo="Valore storico Ente / CCNL Precedente" value={data.ris_fondoPO2017} onChange={handleChange} disabled={isClosed} />
        <FundingItem<FondoElevateQualificazioniData> id="ris_incrementoConRiduzioneFondoDipendenti" description="Incremento del Fondo Elevate Qualificazioni con contestuale riduzione del fondo del personale dipendente" riferimentoNormativo={RIF_DELIBERA_ENTE} value={data.ris_incrementoConRiduzioneFondoDipendenti} onChange={handleChange} disabled={isClosed} />
        <FundingItem<FondoElevateQualificazioniData> id="ris_incrementoLimiteArt23c2_DL34" description="Incremento del Fondo Elevate Qualificazioni nel limite dell'art. 23 c. 2 del D.Lgs. n. 75/2017 (compreso art. 33 DL 34/2019)" riferimentoNormativo={`${norme.art23_dlgs75_2017} e ${norme.art33_dl34_2019}`} value={data.ris_incrementoLimiteArt23c2_DL34} onChange={handleChange} disabled={isClosed} />
        {Number(annualData?.annoRiferimento) !== 2026 && (
          <FundingItem<FondoElevateQualificazioniData> id="ris_incremento022MonteSalari2018" description="0,22% del monte salari anno 2018 con decorrenza dal 01.01.2022, quota d'incremento del fondo proporzionale (non rileva ai fini del limite)." riferimentoNormativo={norme.art79_ccnl2022 + " c.3"} value={data.ris_incremento022MonteSalari2018} onChange={handleChange} disabled={isClosed} />
        )}
        <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-lg my-2">
          <FundingItem<FondoElevateQualificazioniData> id="st_incremento014_ms2021_eq" description={`Quota EQ dello 0,14% importata dal Wizard (Art. 58 c.1 CCNL 23.02.2026)`} riferimentoNormativo="Art. 58 c.1 CCNL 23.02.2026" value={data.st_incremento014_ms2021_eq} onChange={handleChange} disabled={true} inputInfo="Quota EQ dello 0,14% importata dal Wizard." />
          <FundingItem<FondoElevateQualificazioniData> id="va_arretrati014_eq" description={`Arretrati quota EQ dello 0,14% importata dal Wizard`} riferimentoNormativo="Art. 58 c.1 CCNL 23.02.2026" value={data.va_arretrati014_eq} onChange={handleChange} disabled={true} inputInfo="Arretrati quota EQ dello 0,14% importata dal Wizard." />
          <FundingItem<FondoElevateQualificazioniData> id="va_incremento022_ms2021_eq" description={`Incremento 0,22% Monte Salari 2021 (Art. 58 c.2 CCNL 23.02.2026) - Massimo applicabile calcolato: € ${formatCurrency(max022MS)}`} riferimentoNormativo={RIF_CCNL_2022_2024_INC_022_EQ} value={data.va_incremento022_ms2021_eq} onChange={handleChange} disabled={true} inputInfo="Voce alimentata automaticamente dal Wizard Step 4." />
          {legacyEqProposal !== undefined && (
            <p className="mt-2 text-xs text-slate-700" data-testid="eq-legacy-proposal">
              Quota EQ indicativa dai parametri salvati: {formatCurrency(legacyEqProposal)}.
              Verificare il regime applicabile all’annualità. La consultazione non modifica l’importo iscritto.
            </p>
          )}
          {state.localSources?.['fondoElevateQualificazioniData.va_incremento022_ms2021_eq'] &&
           data.va_incremento022_ms2021_eq !== undefined &&
           Math.abs((data.va_incremento022_ms2021_eq || 0) - max022MS) > 0.01 && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
              ⚠️ <strong>Nota:</strong> Il valore presente (€ {formatCurrency(data.va_incremento022_ms2021_eq)}) differisce dal valore teorico contrattuale (€ {formatCurrency(max022MS)}) ed è protetto contro la sovrascrittura automatica (Sorgente: {state.localSources['fondoElevateQualificazioniData.va_incremento022_ms2021_eq']}).
              {!isClosed && (
                <button
                  type="button"
                  className="ml-2 text-blue-600 hover:underline font-semibold"
                  onClick={() => dispatch({
                    type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA',
                    payload: { va_incremento022_ms2021_eq: max022MS }
                  })}
                >
                  Riallinea al valore teorico
                </button>
              )}
            </div>
          )}
        </div>
        {Number(annualData?.annoRiferimento) !== 2026 && (
          <FundingItem<FondoElevateQualificazioniData> id="va_dl25_2025_armonizzazione" description="Armonizzazione del trattamento accessorio del personale dipendente (in deroga al limite dell'art. 23, c. 2)" riferimentoNormativo="Art. 14 c. 1-bis del DL 25/2025" value={data.va_dl25_2025_armonizzazione} onChange={handleChange} disabled={isClosed} />
        )}
        <FundingItem<FondoElevateQualificazioniData> id="va_art18c5_CCNL2026_maggiorazioneSediLavoro" description="Maggiorazione retribuzione per gravosità sedi/convenzioni (in eccedenza al limite)" riferimentoNormativo="Art. 18 c. 5 CCNL 23.02.2026" value={data.va_art18c5_CCNL2026_maggiorazioneSediLavoro} onChange={handleChange} disabled={isClosed} />
        <FundingItem<FondoElevateQualificazioniData> id="va_art16c5_CCNL2026_maggiorazioneInterim" description="Maggiorazione risultato per incarichi ad interim (15% - 25% della posizione)" riferimentoNormativo="Art. 16 c. 5 CCNL 23.02.2026" value={data.va_art16c5_CCNL2026_maggiorazioneInterim} onChange={handleChange} disabled={isClosed} />
        <FundingItem<FondoElevateQualificazioniData> id="fin_art23c2_adeguamentoTetto2016" description="Eventuale decurtazione annuale per il rispetto del tetto complessivo del salario accessorio dell'anno 2016." riferimentoNormativo={norme.art23_dlgs75_2017 as string} value={data.fin_art23c2_adeguamentoTetto2016} onChange={handleChange} isSubtractor={true} disabled={isClosed} />
        <SectionTotal label="Somma Risorse Base" total={sommaRisorseStabiliBase + sommaVariabiliExtra} />
      </Card>



      {/* Cruscotto di Riepilogo (Limit) */}
      <Card title="Cruscotto Limite Art. 23 c. 2 D.Lgs. 75/2017" className="mb-6 bg-slate-50" isCollapsible={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-sm text-slate-500 font-medium text-center uppercase">Totale Risorse (Finanziamento EQ)</span>
            <span className="text-2xl font-bold text-slate-800 mt-2">{formatCurrency(totaleRisorseDisponibili)}</span>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100 flex flex-col items-center justify-center">
            <span className="text-sm text-red-600 font-medium text-center uppercase">Quota Soggetta a Tetto</span>
            <span className="text-2xl font-bold text-red-700 mt-2">{formatCurrency(totaleSoggettoAlLimite)}</span>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100 flex flex-col items-center justify-center">
            <span className="text-sm text-green-600 font-medium text-center uppercase">Quota Esclusa dal Tetto</span>
            <span className="text-2xl font-bold text-green-700 mt-2">{formatCurrency(totaleEsclusoLimite)}</span>
          </div>
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 md:left-16 right-0 p-4 bg-[#fcf8f8]/80 backdrop-blur-sm border-t border-t-[#f3e7e8] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-[960px] mx-auto flex justify-between items-center md:pl-52 xl:pl-24 2xl:pl-0">
          <span className="text-lg font-bold text-[#1b0e0e]">TOTALE RISORSE EQ:</span>
          <span className="text-2xl font-bold text-[#ea2832]">
            {formatCurrency(totaleRisorseDisponibili)}
          </span>
        </div>
      </div>

    </div>
  );
};