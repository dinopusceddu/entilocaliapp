import { presentArt23Verification } from '../domain/art23Verification';
// pages/FundDetailsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Card } from '../components/shared/Card.tsx';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.tsx';
import { projectCanonicalFadSections } from '../domain/canonicalFadProjection';
import { projectFadReport } from '../domain/documentProjection';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { EmptyState } from '../components/shared/EmptyState.tsx';
import { formatCurrency } from '../utils/formatters.ts';
import FinancialMath from '../utils/financialMath';

const SummaryRow: React.FC<{ label: string; value?: number | null; isGrandTotal?: boolean; className?: string }> = ({ label, value, isGrandTotal = false, className = "" }) => (
  <div className={`flex justify-between items-center py-2 px-3 rounded-md ${isGrandTotal ? 'bg-[#d1c0c1]' : 'bg-white border border-[#f3e7e8]'} ${className}`}>
    <span className={`text-sm font-medium ${isGrandTotal ? 'text-[#1b0e0e] font-bold' : 'text-[#1b0e0e]'}`}>{label}</span>
    <span className={`text-lg font-bold ${isGrandTotal ? 'text-[#ea2832]' : 'text-[#ea2832]'}`}>{value == null ? 'Non determinabile' : formatCurrency(value)}</span>
  </div>
);

export const FundDetailsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { data: normativeData } = useNormativeData();
  const { calculationResult, fundData, isLoading } = state;
  const fad = React.useMemo(() => projectCanonicalFadSections(calculationResult?.canonicalFund), [calculationResult?.canonicalFund]);
  const detail = React.useMemo(() => projectFadReport(calculationResult?.canonicalFund), [calculationResult?.canonicalFund]);

  if (isLoading && !calculationResult) {
    return <LoadingSpinner text="Caricamento dettagli fondo..." />;
  }

  if (!calculationResult || !normativeData) {
    return (
      <div>
        <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight mb-8">Dettaglio Calcolo Fondo Risorse Decentrate</h2>
        <EmptyState
          title="Dettaglio non disponibile"
          message="Per visualizzare i dettagli, esegui prima il calcolo del fondo dalla Configurazione Fondo 2026."
          actionText="Apri Configurazione Fondo 2026"
          onAction={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'wizard2026Preview' })}
        />
      </div>
    );
  }

  const { fondi, compliance, metadata } = calculationResult;
  const art23 = compliance.art23c2;
  const art23View = presentArt23Verification(calculationResult);
  const allFundsVerifiedTotal = fad.verifiedTotal === null ? null : FinancialMath.sumAll(
    fad.verifiedTotal, fondi.eq.summary.totaleFondo, fondi.segretario.summary.totaleFondo,
    fondi.dirigenza.summary.totaleFondo,
  );

  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Dettaglio Calcolo Fondo Risorse Decentrate {metadata.annoRiferimento}</h2>

      <Card title={`Riepilogo Risorse Disponibili per Fondo (Anno ${metadata.annoRiferimento})`} className="mb-8 bg-[#fcf8f8]">
        <div className="space-y-3 p-1">
          <SummaryRow label="Totale Risorse - Fondo Personale Dipendente" value={fad.total} />
          <SummaryRow label="Risorse Stabili - Fondo Personale Dipendente" value={fad.stableTotal} />
          <SummaryRow label="Risorse Variabili - Fondo Personale Dipendente" value={fad.variableTotal} />
          <SummaryRow label="Fondo Dipendenti - Risorse Soggette Art. 23" value={fad.subject} />
          <SummaryRow label="Fondo Dipendenti - Risorse Escluse Art. 23" value={fad.excluded} />
          {fad.status !== 'VALID' && <div role="status" data-testid="fad-unresolved">
            <strong>Risultato canonico {fad.status === 'INVALID' ? 'non valido' : 'non determinabile'}.</strong>
            {fad.verifiedTotal !== null && <>
              <SummaryRow label="Subtotale verificato Fondo Dipendenti" value={fad.verifiedTotal} />
              <SummaryRow label="Subtotale verificato Stabili" value={detail.verifiedStableTotal} />
              <SummaryRow label="Subtotale verificato Variabili" value={detail.verifiedVariableTotal} />
              <SummaryRow label="Subtotale verificato Soggette Art. 23" value={fad.verifiedSubject} />
              <SummaryRow label="Subtotale verificato Escluse Art. 23" value={fad.verifiedExcluded} />
            </>}
            {detail.missingPrerequisites.map(item => <p key={item}>{item}</p>)}
          </div>}
          <SummaryRow label="Totale Risorse - Fondo Elevate Qualificazioni" value={fondi.eq.summary.totaleFondo} />
          <SummaryRow label="Totale Risorse - Risorse Segretario Comunale" value={fondi.segretario.summary.totaleFondo} />
          {fundData.annualData.hasDirigenza && (
            <SummaryRow label="Totale Risorse - Fondo Dirigenza" value={fondi.dirigenza?.summary.totaleFondo} />
          )}
          <div className="pt-3 mt-3 border-t-2 border-[#d1c0c1]">
            <SummaryRow label={fad.status === 'VALID' ? "TOTALE COMPLESSIVO RISORSE DISPONIBILI (DA TUTTI I FONDI)" : "SUBTOTALE VERIFICATO RISORSE (DA TUTTI I FONDI)"} value={allFundsVerifiedTotal} isGrandTotal />
          </div>
        </div>
      </Card>

      <Card title="Verifica Limite Art. 23 D.Lgs. 75/2017 (Fondo 2016)" className="mt-6">
        <div className="space-y-2 text-sm text-[#1b0e0e]">
          <p><strong>Limite Effettivo Fondo 2016 (modificato):</strong>
            <strong className="ml-1 text-base">{art23View.formattedLimit}</strong>
          </p>
          <hr className="my-3 border-[#f3e7e8]" />
          <p><strong>Somma Risorse Soggette al Limite dai Fondi Specifici:</strong> {formatCurrency(art23.valoreSoggetto)}</p>

          {!art23View.ready ? <p role="status" className="p-3 bg-amber-50">Verifica Art. 23: {art23View.label}. Completare i prerequisiti.</p> : !art23View.isCompliant ? (
            <div className="p-4 mt-4 bg-[#fef2f2] border border-[#fecaca] rounded-lg">
              <div className="flex justify-between items-center text-[#c02128]">
                <strong className="text-base">Superamento Limite 2016:</strong>
                <strong className="text-base">
                  {formatCurrency(Math.abs(art23.delta))}
                </strong>
              </div>
              <p className="text-sm text-[#991b1b] mt-2">
                È necessario applicare una riduzione di pari importo su uno o più fondi per rispettare il vincolo (es. tramite i campi "Eventuale decurtazione annuale...").
              </p>
            </div>
          ) : (
            <div className="p-3 mt-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-semibold text-center">
              Nessun superamento del limite 2016 rilevato (Capienza residua: {formatCurrency(art23.delta)}).
            </div>
          )}

          <p className="text-xs text-[#5f5252] mt-2">
            Nota: L'adeguamento per variazione personale modifica il tetto di spesa. La somma delle risorse soggette al limite viene calcolata prima di applicare le decurtazioni manuali nei singoli fondi.
          </p>
        </div>
      </Card>

      <Card
        title={`Dettaglio Costituzione Fondo Accessorio Personale Dipendente (Anno ${metadata.annoRiferimento})`}
        className="bg-[#fcf8f8] border-[#e0e0e0]"
        isCollapsible={true}
        defaultCollapsed={true}
      >
        <p className="text-sm text-[#5f5252] mb-4">Riepilogo analitico delle voci che concorrono alla formazione del fondo dipendenti.</p>

        {Object.entries(fad.sections).map(([key, section]) => (
          <div key={key} className="mb-6 last:mb-0">
            <div className="flex justify-between items-center border-b border-[#d1c0c1] pb-2 mb-2">
                <h4 className="text-md font-semibold text-[#5f5252]">{section.title}</h4>
                <span className="font-bold text-[#ea2832]">{!fad.canonicalAvailable ? 'Non disponibile' : `${fad.status !== 'VALID' ? 'Subtotale verificato: ' : ''}${formatCurrency(section.total)}`}</span>
            </div>
            {detail.rows.filter(row => key === 'stabili' ? row.component === 'STABLE' :
              row.component === 'VARIABLE' && row.art23Treatment === (key === 'vs_soggette' ? 'SUBJECT' : key === 'vn_non_soggette' ? 'EXCLUDED' : 'UNDETERMINED'))
              .map(row => <div key={row.id} data-semantic-id={row.id} className="py-2 border-b text-sm">
                <div className="flex justify-between gap-3"><span>{row.description}</span>
                  <strong>{row.signedAmount === null ? `Non determinabile (${row.status})` : formatCurrency(row.signedAmount)}</strong></div>
                <p className="text-xs text-[#5f5252]">{row.id} · {row.source} · {row.art23Treatment} · {row.normativeRef}
                  {row.originYear != null && ` · Origine ${row.originYear}`} · {row.status}</p>
                {row.reason && <p>{row.reason}</p>}
              </div>)}
          </div>
        ))}
      </Card>
    </div>
  );
};
