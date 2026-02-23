// pages/FondoSegretarioComunalePage.tsx
import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { FondoSegretarioComunaleData } from '../types.ts';
import { Card } from '../components/shared/Card.tsx';
import { TEXTS_UI, RIF_CCNL_SEG_2022_2024_ART36, RIF_CCNL_SEG_2022_2024_ART40C1, RIF_CCNL_SEG_2022_2024_ART40C2, RIF_CCNL_SEG_2022_2024_ART39 } from '../constants.ts';
import { FundingItem } from '../components/shared/FundingItem.tsx';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { formatNumber } from '../utils/formatters.ts';

import { formatCurrency } from '../utils/formatters.ts';

const SectionTotal: React.FC<{ label: string; total?: number, isPercentage?: boolean }> = ({ label, total, isPercentage = false }) => {
  const formatValue = () => {
    if (total === undefined || isNaN(total)) return TEXTS_UI.notApplicable;
    if (isPercentage) return `${formatNumber(total)}%`;
    return formatCurrency(total);
  };
  return (
    <div className="mt-4 pt-4 border-t-2 border-[#d1c0c1]">
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-[#1b0e0e]">{label}</span>
        <span className="text-lg font-bold text-[#ea2832]">
          {formatValue()}
        </span>
      </div>
    </div>
  );
};


export const FondoSegretarioComunalePage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { data: normativeData } = useNormativeData();
  const data = state.fundData.fondoSegretarioComunaleData || {} as FondoSegretarioComunaleData;

  if (!normativeData) return <div className="p-4 text-center">Caricamento dati normativi...</div>;
  const { riferimenti_normativi: norme } = normativeData;

  const handleChange = (field: keyof FondoSegretarioComunaleData, value?: number) => {
    dispatch({ type: 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA', payload: { [field]: value } });
  };

  const sommaRisorseStabili =
    (data.st_art3c6_CCNL2011_retribuzionePosizione || 0) +
    (data.st_art58c1_CCNL2024_differenzialeAumento || 0) +
    (data.st_art60c1_CCNL2024_retribuzionePosizioneClassi || 0) +
    (data.st_art60c3_CCNL2024_maggiorazioneComplessita || 0) +
    (data.st_art60c5_CCNL2024_allineamentoDirigEQ || 0) +
    (data.st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni || 0) +
    (data.st_art56c1h_CCNL2024_indennitaReggenzaSupplenza || 0) +
    (data.st_art36_CCNL2022_2024_incrementoRetribuzionePosizione || 0);

  const sommaRisorseVariabili =
    (data.va_art56c1f_CCNL2024_dirittiSegreteria || 0) +
    (data.va_art56c1i_CCNL2024_altriCompensiLegge || 0) +
    (data.va_art8c3_DL13_2023_incrementoPNRR || 0) +
    (data.va_art61c2_CCNL2024_retribuzioneRisultato10 || 0) +
    (data.va_art61c2bis_CCNL2024_retribuzioneRisultato15 || 0) +
    (data.va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane || 0) +
    (data.va_art61c3_CCNL2024_incremento022MonteSalari2018 || 0) +
    (data.va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021 || 0) +
    (data.va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021 || 0);

  const totaleRisorse = sommaRisorseStabili + sommaRisorseVariabili;
  const percentualeCopertura = data.fin_percentualeCoperturaPostoSegretario === undefined ? 100 : data.fin_percentualeCoperturaPostoSegretario;
  const itemsRilevantiPerLimite: (keyof FondoSegretarioComunaleData)[] = [
    'st_art3c6_CCNL2011_retribuzionePosizione',
    'st_art60c1_CCNL2024_retribuzionePosizioneClassi',
    'st_art60c3_CCNL2024_maggiorazioneComplessita',
    'st_art60c5_CCNL2024_allineamentoDirigEQ',
    'va_art61c2_CCNL2024_retribuzioneRisultato10',
    'va_art61c2bis_CCNL2024_retribuzioneRisultato15',
    'va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane',
  ];
  const sommaBaseRisorseRilevantiLimite = itemsRilevantiPerLimite.reduce((sum, key) => {
    return sum + ((data as any)[key] || 0);
  }, 0);
  const totaleRisorseRilevantiLimiteCalcolato = sommaBaseRisorseRilevantiLimite * (percentualeCopertura / 100);

  useEffect(() => {
    if (data.fin_totaleRisorseRilevantiLimite !== totaleRisorseRilevantiLimiteCalcolato) {
      dispatch({
        type: 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA',
        payload: { fin_totaleRisorseRilevantiLimite: isNaN(totaleRisorseRilevantiLimiteCalcolato) ? 0 : totaleRisorseRilevantiLimiteCalcolato }
      });
    }
  }, [data.fin_totaleRisorseRilevantiLimite, totaleRisorseRilevantiLimiteCalcolato, dispatch]);

  const totaleRisorseEffettivamenteDisponibili = totaleRisorse * (percentualeCopertura / 100);
  const totaleRisorseEscluseDalLimite = totaleRisorseEffettivamenteDisponibili - totaleRisorseRilevantiLimiteCalcolato;
  const infoTotaleRisorseRilevantiLimite = `Calcolato come: (Somma voci rilevanti per Art. 23 c.2) * (% Copertura Segretario). Valore base: ${TEXTS_UI.notApplicable === sommaBaseRisorseRilevantiLimite.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ? 'N/D' : '€ ' + sommaBaseRisorseRilevantiLimite.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;

  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Risorse Segretario Comunale</h2>

      <Card title="RISORSE STABILI" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <FundingItem<FondoSegretarioComunaleData> id="st_art3c6_CCNL2011_retribuzionePosizione" description="A seguito del conglobamento di cui al comma 5, con decorrenza dal 31.12.2009, i valori complessivi annui lordi, per tredici mensilità, della retribuzione di posizione dei segretari comunali e provinciali, di cui all'art. 3 del CCNL del 16 maggio 2001 per il biennio economico 2000-2001, sono così determinati." riferimentoNormativo={norme.ccnl_seg_01032011_art3c6 as string} value={data.st_art3c6_CCNL2011_retribuzionePosizione} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="st_art58c1_CCNL2024_differenzialeAumento" description="Con decorrenza dal 1° gennaio 2021, i valori complessivi annui lordi, per tredici mensilità, della retribuzione di posizione dei segretari comunali e provinciali, di cui all’art. 107, comma 1 del CCNL del 17.12.2020 sono rideterminati come indicato nella seguente tabella (riportare il solo differenziale di aumento rispetto il CCNL precedente che non rileva ai fini del limite)" riferimentoNormativo={norme.ccnl_seg_16072024_art58c1 as string} value={data.st_art58c1_CCNL2024_differenzialeAumento} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="st_art60c1_CCNL2024_retribuzionePosizioneClassi" description="La retribuzione di posizione è erogata, in base alle classi demografiche degli enti, entro i seguenti valori minimi e massimi complessivi annui lordi per tredici mensilità." riferimentoNormativo={norme.ccnl_seg_16072024_art60c1 as string} value={data.st_art60c1_CCNL2024_retribuzionePosizioneClassi} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="st_art60c3_CCNL2024_maggiorazioneComplessita" description="Nei comuni capoluogo, nelle province e nelle città metropolitane la soglia massima della retribuzione di posizione di cui al comma 1 può essere autonomamente rideterminata, per tener conto dell’esercizio delle funzioni in presenza di strutture complesse, in misura non superiore al 15%, ove sussista la relativa capacità di bilancio e nel rispetto dell’art. 23, comma 2 del D. Lgs. n. 75/2017." riferimentoNormativo={norme.ccnl_seg_16072024_art60c3 as string} value={data.st_art60c3_CCNL2024_maggiorazioneComplessita} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="st_art60c5_CCNL2024_allineamentoDirigEQ" description="Gli enti assicurano, altresì, che nel complessivo rispetto dell’art. 23 comma 2 del D. Lgs. 75/2017 la retribuzione di posizione non sia inferiore a quella stabilita nell’Ente per l’incarico dirigenziale più elevato in essere o, in assenza di dirigenti, a quella più elevata, stabilita nell’Ente, per il personale con incarico di elevata qualificazione." riferimentoNormativo={norme.ccnl_seg_16072024_art60c5 as string} value={data.st_art60c5_CCNL2024_allineamentoDirigEQ} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni" description="La struttura della retribuzione dei segretari comunali e provinciali si compone delle seguenti voci: g) retribuzione aggiuntiva per sedi convenzionate, ove spettante (risorse che non rilevano sul limite del salario accessorio)." riferimentoNormativo={norme.ccnl_seg_16072024_art56c1g as string} value={data.st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="st_art56c1h_CCNL2024_indennitaReggenzaSupplenza" description="La struttura della retribuzione dei segretari comunali e provinciali si compone delle seguenti voci: h) indennità di reggenza o supplenza ove spettante, per gli incarichi di cui all’art. 62 (risorse che non rilevano sul limite del salario accessorio)." riferimentoNormativo={norme.ccnl_seg_16072024_art56c1h as string} value={data.st_art56c1h_CCNL2024_indennitaReggenzaSupplenza} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="st_art36_CCNL2022_2024_incrementoRetribuzionePosizione" description="Incremento della retribuzione di posizione in funzione delle classi. La quota incrementale contrattuale NON rileva ai fini del limite ex art. 23 c.2 mentre la parte pregressa vi rientra." riferimentoNormativo={RIF_CCNL_SEG_2022_2024_ART36} value={data.st_art36_CCNL2022_2024_incrementoRetribuzionePosizione} onChange={handleChange} />
        <SectionTotal label="SOMMA RISORSE STABILI" total={sommaRisorseStabili} />
      </Card>

      <Card title="RISORSE VARIABILI" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <FundingItem<FondoSegretarioComunaleData> id="va_art56c1f_CCNL2024_dirittiSegreteria" description="La struttura della retribuzione dei segretari comunali e provinciali si compone delle seguenti voci: f) diritti di segreteria, ove spettanti in base alle vigenti disposizioni di legge in materia (risorse che non rilevano sul limite del salario accessorio)." riferimentoNormativo={norme.ccnl_seg_16072024_art56c1f as string} value={data.va_art56c1f_CCNL2024_dirittiSegreteria} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="va_art56c1i_CCNL2024_altriCompensiLegge" description="La struttura della retribuzione dei segretari comunali e provinciali si compone delle seguenti voci: i) altri compensi previsti da norme di legge (risorse che non rilevano sul limite del salario accessorio)." riferimentoNormativo={norme.ccnl_seg_16072024_art56c1i as string} value={data.va_art56c1i_CCNL2024_altriCompensiLegge} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="va_art8c3_DL13_2023_incrementoPNRR" description="Per i segretari comunali e provinciali, la medesima facoltà di incremento percentuale (in misura non superiore al 5 per cento) del trattamento accessorio oltre il limite di cui all'articolo 23, comma 2, del decreto legislativo 25 maggio 2017, n. 75, è calcolata sui valori della retribuzione di posizione, spettanti in base all'ente di titolarità, come definiti dal comma 1 dell'articolo 107 del contratto collettivo nazionale di lavoro relativo al personale dell'area delle funzioni locali, sottoscritto in data 17 dicembre 2020, nonché sul valore della retribuzione di risultato come risultante dai contratti collettivi vigenti." riferimentoNormativo={norme.art8_dl13_2023 as string} value={data.va_art8c3_DL13_2023_incrementoPNRR} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="va_art61c2_CCNL2024_retribuzioneRisultato10" description="Gli enti destinano a tale compenso (retribuzione di risultato), con risorse a carico dei rispettivi bilanci e nei limiti della propria capacità di spesa un importo non superiore al 10% del monte salari erogato (Ordinariamente RILEVANTE nel limite dell'art. 23 c. 2)." riferimentoNormativo={RIF_CCNL_SEG_2022_2024_ART39} value={data.va_art61c2_CCNL2024_retribuzioneRisultato10} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="va_art61c2bis_CCNL2024_retribuzioneRisultato15" description="Gli enti possono elevare fino al 15% il limite percentuale per retribuzione di risultato in casi di seguito indicati (es. enti con dirigenza). Tali somme sono RILEVANTI per il rispetto dell'art. 23, comma 2." riferimentoNormativo={RIF_CCNL_SEG_2022_2024_ART39} value={data.va_art61c2bis_CCNL2024_retribuzioneRisultato15} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane" description="I limiti stabiliti possono essere superati negli enti metropolitani per allineamento rispetto alle retribuzioni dirigenziali (RILEVANTE per rispetto dell'art. 23, comma 2 del D. Lgs. 75/2017)." riferimentoNormativo={RIF_CCNL_SEG_2022_2024_ART39} value={data.va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="va_art61c3_CCNL2024_incremento022MonteSalari2018" description="Facoltà di ulteriore incremento fino allo 0,22% MS 2018 (NON rileva ex Legge bilancio 2022)." riferimentoNormativo={`${norme.ccnl_seg_16072024_art61c3}`} value={data.va_art61c3_CCNL2024_incremento022MonteSalari2018} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021" description="Incremento annuo di risorse destinate alla retribuzione di risultato pari allo 0,80% del monte salari 2021 dei segretari. Ai sensi della Dichiarazione congiunta n. 2, NON rileva ai fini del limite art. 23 c.2." riferimentoNormativo={RIF_CCNL_SEG_2022_2024_ART40C1} value={data.va_art40c1_CCNL2022_2024_incremento0_80MonteSalari2021} onChange={handleChange} />
        <FundingItem<FondoSegretarioComunaleData> id="va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021" description="Ulteriore incremento per retribuzione di risultato nel limite dello 0,22% del monte salari 2021 riferito ai segretari. Qualificato espressamente come oltre il limite (NON rileva)." riferimentoNormativo={RIF_CCNL_SEG_2022_2024_ART40C2} value={data.va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021} onChange={handleChange} />
        <SectionTotal label="SOMMA RISORSE VARIABILI" total={sommaRisorseVariabili} />
      </Card>

      <Card title="RIEPILOGO E ADEGUAMENTI FINALI" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <FundingItem<FondoSegretarioComunaleData> id="fin_totaleRisorseRilevantiLimite" description="Totale risorse che rilevano ai fini del limite del salario accessorio" riferimentoNormativo="Calcolato automaticamente sulla base delle voci rilevanti e della % di copertura." value={data.fin_totaleRisorseRilevantiLimite} onChange={handleChange} disabled={true} inputInfo={infoTotaleRisorseRilevantiLimite} />
        <SectionTotal label="TOTALE RISORSE (Stabili + Variabili)" total={totaleRisorse} />
        <FundingItem<FondoSegretarioComunaleData> id="fin_percentualeCoperturaPostoSegretario" description="Percentuale di copertura del posto di Segretario a carico dell'Ente nell'anno di riferimento" riferimentoNormativo="Es. 100% se interamente a carico, 50% se condiviso con altro ente, ecc." value={data.fin_percentualeCoperturaPostoSegretario} onChange={handleChange} isPercentage={true} />
        <div className="mt-8 pt-4 border-t-2 border-[#d1c0c1] flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700">Delle quali Escluse dal Limite (Art. 23 c.2):</span>
          <span className="font-bold text-[#ea2832] pr-2">
            {formatCurrency(totaleRisorseEscluseDalLimite)}
          </span>
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-[#fcf8f8]/80 backdrop-blur-sm border-t border-t-[#f3e7e8] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-[960px] mx-auto flex justify-between items-center">
          <span className="text-lg font-bold text-[#1b0e0e]">TOTALE RISORSE DISPONIBILI:</span>
          <span className="text-2xl font-bold text-[#ea2832]">
            {formatCurrency(totaleRisorseEffettivamenteDisponibili)}
          </span>
        </div>
      </div>

    </div>
  );
};