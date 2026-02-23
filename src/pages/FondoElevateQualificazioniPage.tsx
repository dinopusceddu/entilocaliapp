// pages/FondoElevateQualificazioniPage.tsx
import React, { useEffect } from 'react';
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
  const { state, dispatch } = useAppContext();
  const { data: normativeData } = useNormativeData();
  const annualData = state.fundData.annualData;
  const data = state.fundData.fondoElevateQualificazioniData || {} as FondoElevateQualificazioniData;

  useEffect(() => {
    // Check MS2021 mount.
  }, [annualData?.ccnl2024?.monteSalari2021]);

  if (!normativeData) return null;

  const { riferimenti_normativi: norme } = normativeData;

  const handleChange = (field: keyof FondoElevateQualificazioniData, value?: number) => {
    dispatch({ type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA', payload: { [field]: value } });
  };

  const ms2021 = annualData?.ccnl2024?.monteSalari2021 || 0;
  const max022MS = (ms2021 * 0.22) / 100;

  // -- TOTALI --
  const sommaRisorseStabiliBase =
    (data.ris_fondoPO2017 || 0) +
    (data.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (data.ris_incrementoLimiteArt23c2_DL34 || 0) -
    (data.fin_art23c2_adeguamentoTetto2016 || 0);

  const sommaVariabiliExtra =
    (data.ris_incremento022MonteSalari2018 || 0) +
    (data.va_incremento022_ms2021_eq || 0);

  const totaleRisorseDisponibili = sommaRisorseStabiliBase + sommaVariabiliExtra;

  const totaleSoggettoAlLimite =
    (data.ris_fondoPO2017 || 0) +
    (data.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (data.ris_incrementoLimiteArt23c2_DL34 || 0);

  const totaleEsclusoLimite = totaleRisorseDisponibili - totaleSoggettoAlLimite + (data.fin_art23c2_adeguamentoTetto2016 || 0);



  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Fondo delle Elevate Qualificazioni (EQ)</h2>

      <Card title="Risorse Finanziamento - Parte Stabile e Base" className="mb-6" isCollapsible={false}>
        <FundingItem<FondoElevateQualificazioniData> id="ris_fondoPO2017" description="Fondo delle Posizioni Organizzative nell'anno 2017 (valore storico di partenza)" riferimentoNormativo="Valore storico Ente / CCNL Precedente" value={data.ris_fondoPO2017} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="ris_incrementoConRiduzioneFondoDipendenti" description="Incremento del Fondo Elevate Qualificazioni con contestuale riduzione del fondo del personale dipendente" riferimentoNormativo={RIF_DELIBERA_ENTE} value={data.ris_incrementoConRiduzioneFondoDipendenti} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="ris_incrementoLimiteArt23c2_DL34" description="Incremento del Fondo Elevate Qualificazioni nel limite dell'art. 23 c. 2 del D.Lgs. n. 75/2017 (compreso art. 33 DL 34/2019)" riferimentoNormativo={`${norme.art23_dlgs75_2017} e ${norme.art33_dl34_2019}`} value={data.ris_incrementoLimiteArt23c2_DL34} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="ris_incremento022MonteSalari2018" description="0,22% del monte salari anno 2018 con decorrenza dal 01.01.2022, quota d'incremento del fondo proporzionale (non rileva ai fini del limite)." riferimentoNormativo={norme.art79_ccnl2022 + " c.3"} value={data.ris_incremento022MonteSalari2018} onChange={handleChange} />
        <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-lg my-2">
          <FundingItem<FondoElevateQualificazioniData> id="va_incremento022_ms2021_eq" description={`Incremento 0,22% Monte Salari 2021 (Art. 58 c.2) - Massimo applicabile calcolato: € ${formatCurrency(max022MS)}`} riferimentoNormativo={RIF_CCNL_2022_2024_INC_022_EQ} value={data.va_incremento022_ms2021_eq} onChange={handleChange} />
        </div>
        <FundingItem<FondoElevateQualificazioniData> id="fin_art23c2_adeguamentoTetto2016" description="Eventuale decurtazione annuale per il rispetto del tetto complessivo del salario accessorio dell'anno 2016." riferimentoNormativo={norme.art23_dlgs75_2017 as string} value={data.fin_art23c2_adeguamentoTetto2016} onChange={handleChange} isSubtractor={true} />
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

      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-[#fcf8f8]/80 backdrop-blur-sm border-t border-t-[#f3e7e8] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-[960px] mx-auto flex justify-between items-center">
          <span className="text-lg font-bold text-[#1b0e0e]">TOTALE RISORSE EQ:</span>
          <span className="text-2xl font-bold text-[#ea2832]">
            {formatCurrency(totaleRisorseDisponibili)}
          </span>
        </div>
      </div>

    </div>
  );
};