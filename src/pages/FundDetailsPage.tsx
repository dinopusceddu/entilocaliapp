// pages/FundDetailsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Card } from '../components/shared/Card.tsx';
import { FondoAccessorioDipendenteData } from '../types.ts';

import { LoadingSpinner } from '../components/shared/LoadingSpinner.tsx';
import { FundingItem } from '../components/shared/FundingItem.tsx';
import { getFadFieldDefinitions } from './FondoAccessorioDipendentePageHelpers.ts';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { EmptyState } from '../components/shared/EmptyState.tsx';

import { formatCurrency } from '../utils/formatters.ts';

const SummaryRow: React.FC<{ label: string; value?: number; isGrandTotal?: boolean; className?: string }> = ({ label, value, isGrandTotal = false, className = "" }) => (
  <div className={`flex justify-between items-center py-2 px-3 rounded-md ${isGrandTotal ? 'bg-[#d1c0c1]' : 'bg-white border border-[#f3e7e8]'} ${className}`}>
    <span className={`text-sm font-medium ${isGrandTotal ? 'text-[#1b0e0e] font-bold' : 'text-[#1b0e0e]'}`}>{label}</span>
    <span className={`text-lg font-bold ${isGrandTotal ? 'text-[#ea2832]' : 'text-[#ea2832]'}`}>{formatCurrency(value)}</span>
  </div>
);


export const FundDetailsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { data: normativeData } = useNormativeData();
  const { calculatedFund, fundData, isLoading } = state;

  if (isLoading && !calculatedFund) {
    return <LoadingSpinner text="Caricamento dettagli fondo..." />;
  }

  if (!calculatedFund || !normativeData) {
    return (
      <div>
        <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight mb-8">Dettaglio Calcolo Fondo Risorse Decentrate</h2>
        <EmptyState
          title="Dettaglio non disponibile"
          message="Per visualizzare i dettagli, esegui prima il calcolo del fondo dalla pagina 'Dati Costituzione Fondo'."
          actionText="Vai ai Dati"
          onAction={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dataEntry' })}
        />
      </div>
    );
  }

  const { dettaglioFondi } = calculatedFund;
  const fadData = fundData.fondoAccessorioDipendenteData || {} as FondoAccessorioDipendenteData;
  const fadFieldDefinitions = getFadFieldDefinitions(normativeData);

  const sections: Array<{
    title: string;
    sectionKey: (typeof fadFieldDefinitions)[number]['section'];
  }> = [
      { title: "Fonti di Finanziamento Stabili", sectionKey: 'stabili' },
      { title: "Fonti di Finanziamento Variabili Soggette al Limite", sectionKey: 'vs_soggette' },
      { title: "Fonti di Finanziamento Variabili Non Soggette al Limite", sectionKey: 'vn_non_soggette' },
      { title: "Altre Risorse e Decurtazioni Finali", sectionKey: 'fin_decurtazioni' },
      { title: "Calcolo del rispetto dei limiti", sectionKey: 'cl_limiti' },
    ];

  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Dettaglio Calcolo Fondo Risorse Decentrate {fundData.annualData.annoRiferimento}</h2>

      <Card title={`Riepilogo Risorse Disponibili per Fondo (Anno ${fundData.annualData.annoRiferimento})`} className="mb-8 bg-[#fcf8f8]">
        <div className="space-y-3 p-1">
          <SummaryRow label="Totale Risorse - Fondo Personale Dipendente" value={dettaglioFondi.dipendente.totale} />
          <SummaryRow label="Totale Risorse - Fondo Elevate Qualificazioni" value={dettaglioFondi.eq.totale} />
          <SummaryRow label="Totale Risorse - Risorse Segretario Comunale" value={dettaglioFondi.segretario.totale} />
          {fundData.annualData.hasDirigenza && (
            <SummaryRow label="Totale Risorse - Fondo Dirigenza" value={dettaglioFondi.dirigenza.totale} />
          )}
          <div className="pt-3 mt-3 border-t-2 border-[#d1c0c1]">
            <SummaryRow label="TOTALE COMPLESSIVO RISORSE DISPONIBILI (DA TUTTI I FONDI)" value={calculatedFund.totaleFondoRisorseDecentrate} isGrandTotal />
          </div>
        </div>
      </Card>

      <Card title="Verifica Limite Art. 23 D.Lgs. 75/2017 (Fondo 2016)" className="mt-6">
        <div className="space-y-2 text-sm text-[#1b0e0e]">
          <p><strong>Fondo Base Storico (originale 2016):</strong> {formatCurrency(calculatedFund.fondoBase2016)}</p>
          {calculatedFund.incrementoDeterminatoArt23C2 && (
            <p><strong>(+) Adeguamento per Variazione Personale (Art. 23 c.2, base 2018):</strong> {formatCurrency(calculatedFund.incrementoDeterminatoArt23C2.importo)}</p>
          )}
          <p><strong>(=) Limite Effettivo Fondo 2016 (modificato):</strong>
            <strong className="ml-1 text-base">{formatCurrency(calculatedFund.limiteArt23C2Modificato)}</strong>
          </p>
          <hr className="my-3 border-[#f3e7e8]" />
          <p><strong>Somma Risorse Soggette al Limite dai Fondi Specifici:</strong> {formatCurrency(calculatedFund.totaleRisorseSoggetteAlLimiteDaFondiSpecifici)}</p>

          {calculatedFund.superamentoLimite2016 && calculatedFund.superamentoLimite2016 > 0 ? (
            <div className="p-4 mt-4 bg-[#fef2f2] border border-[#fecaca] rounded-lg">
              <div className="flex justify-between items-center text-[#c02128]">
                <strong className="text-base">Superamento Limite 2016:</strong>
                <strong className="text-base">
                  {formatCurrency(calculatedFund.superamentoLimite2016)}
                </strong>
              </div>
              <p className="text-sm text-[#991b1b] mt-2">
                È necessario applicare una riduzione di pari importo su uno o più fondi per rispettare il vincolo (es. tramite i campi "Eventuale decurtazione annuale...").
              </p>
            </div>
          ) : (
            <div className="p-3 mt-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-semibold text-center">
              Nessun superamento del limite 2016 rilevato.
            </div>
          )}

          <p className="text-xs text-[#5f5252] mt-2">
            Nota: L'adeguamento per variazione personale modifica il tetto di spesa. La somma delle risorse soggette al limite viene calcolata prima di applicare le decurtazioni manuali nei singoli fondi.
          </p>
        </div>
      </Card>

      <Card
        title={`Dettaglio Input Fondo Accessorio Personale Dipendente (Anno ${fundData.annualData.annoRiferimento})`}
        className="bg-[#fcf8f8] border-[#e0e0e0]"
        isCollapsible={true}
        defaultCollapsed={true}
      >
        <p className="text-sm text-[#5f5252] mb-4">Questo è un riepilogo dei valori inseriti per il Fondo del Personale Dipendente, non include i totali calcolati.</p>

        {sections.map(section => (
          <div key={section.sectionKey} className="mb-6 last:mb-0">
            <h4 className="text-md font-semibold text-[#5f5252] border-b border-[#d1c0c1] pb-2 mb-2">{section.title}</h4>
            {fadFieldDefinitions.filter(def => def.section === section.sectionKey).map(def => (
              <FundingItem<FondoAccessorioDipendenteData>
                key={String(def.key)}
                id={def.key}
                description={def.description}
                value={(fadData as any)[def.key]}
                onChange={() => { }}
                riferimentoNormativo={def.riferimento}
                isSubtractor={def.isSubtractor}
                disabled={true} // all items are read-only here
              />
            ))}
          </div>
        ))}
      </Card>

    </div>
  );
};
