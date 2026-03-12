// src/pages/HomePage.tsx
import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Button } from '../components/shared/Button.tsx';
import { TEXTS_UI } from '../constants.ts';
import { DashboardSummary } from '../components/dashboard/DashboardSummary.tsx';
import { FundAllocationChart } from '../components/dashboard/FundAllocationChart.tsx';
import { ContractedResourcesChart } from '../components/dashboard/ContractedResourcesChart.tsx';
import { ComplianceStatusWidget } from '../components/dashboard/ComplianceStatusWidget.tsx';
import { HomePageSkeleton } from '../components/dashboard/HomePageSkeleton.tsx';
import { Alert } from '../components/shared/Alert.tsx';
import { validateFundData } from '../logic/validation.ts';
import { Card } from '../components/shared/Card.tsx';
import { formatCurrency } from '../utils/formatters.ts';

// Fields belonging to the "Dati Costituzione Fondo" page
const DATA_ENTRY_FIELDS = [
  'fundData.annualData.denominazioneEnte',
  'fundData.annualData.tipologiaEnte',
  'fundData.annualData.hasDirigenza',
  'fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016',
  'fundData.annualData.numeroAbitanti',
  'fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23',
];

const FIELD_LABELS: Record<string, string> = {
  'fundData.annualData.denominazioneEnte': 'Denominazione Ente',
  'fundData.annualData.tipologiaEnte': 'Tipologia Ente',
  'fundData.annualData.hasDirigenza': 'Indicazione presenza Dirigenza',
  'fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016': 'Fondo Salario Accessorio Personale 2016',
  'fundData.annualData.numeroAbitanti': 'Numero Abitanti (per Comuni/Province)',
  'fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23': 'Fondo Personale 2018 (per calcolo Art. 23)',
};

const RequiredFieldsNotice: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const validationErrors = validateFundData(state.fundData);

  const missingFields = Object.keys(validationErrors)
    .filter(key => DATA_ENTRY_FIELDS.includes(key))
    .map(key => ({
      key,
      label: FIELD_LABELS[key] || key,
      message: validationErrors[key]
    }));

  if (missingFields.length === 0) return null;

  const totalFields = DATA_ENTRY_FIELDS.length;
  const compiledFields = totalFields - missingFields.length;
  const progressPct = Math.round((compiledFields / totalFields) * 100);

  const goToDataEntry = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dataEntry' });
  };

  return (
    <Card title="Completa i dati per iniziare" className="border-l-4 border-amber-400">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-[#5f5252] mb-1">
          <span>Completamento dati obbligatori</span>
          <span className="font-semibold">{compiledFields}/{totalFields} ({progressPct}%)</span>
        </div>
        <div className="w-full bg-[#f3e7e8] rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: progressPct === 100 ? '#16a34a' : progressPct >= 50 ? '#f59e0b' : '#c02128'
            }}
          />
        </div>
      </div>
      <p className="text-sm text-[#5f5252] mb-4">
        Per poter effettuare il calcolo del fondo, è necessario compilare i seguenti campi obbligatori nella pagina "Dati Costituzione Fondo":
      </p>
      <ul className="list-disc list-inside space-y-2 text-[#1b0e0e] mb-6">
        {missingFields.map(field => (
          <li key={field.key}>
            <strong>{field.label}:</strong> <span className="text-[#5f5252]">{field.message}</span>
          </li>
        ))}
      </ul>
      <Button onClick={goToDataEntry}>
        Vai alla compilazione dati
      </Button>
    </Card>
  );
};

// --- Sub-fund KPI Card ---
interface SubFundKpiProps {
  label: string;
  stabile?: number;
  variabile?: number;
  totale?: number;
  colorAccent: string;
  icon: string;
  visible?: boolean;
}

const SubFundKpiCard: React.FC<SubFundKpiProps> = ({ label, stabile, variabile, totale, colorAccent, icon, visible = true }) => {
  if (!visible) return null;
  return (
    <div className={`rounded-xl border-l-4 p-4 bg-white shadow-sm hover:shadow-md transition-shadow`} style={{ borderLeftColor: colorAccent }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-semibold text-[#1b0e0e] text-sm leading-tight">{label}</h4>
      </div>
      <p className="text-xl font-bold text-[#1b0e0e] mb-2">{formatCurrency(totale)}</p>
      <div className="flex gap-4 text-xs text-[#5f5252]">
        <span>Stabile: <span className="font-medium text-[#1b0e0e]">{formatCurrency(stabile)}</span></span>
        <span>Variabile: <span className="font-medium text-[#1b0e0e]">{formatCurrency(variabile)}</span></span>
      </div>
    </div>
  );
};

// --- Limit Art.23 Widget ---
const LimiteArt23Widget: React.FC = () => {
  const { state } = useAppContext();
  const { calculatedFund } = state;
  if (!calculatedFund) return null;

  const limite = calculatedFund.limiteArt23C2Modificato ?? 0;
  const risorse = calculatedFund.totaleRisorseSoggetteAlLimiteDaFondiSpecifici ?? 0;
  const superamento = calculatedFund.superamentoLimite2016 ?? 0;
  const isOverLimit = superamento > 0;
  const pct = limite > 0 ? Math.min(100, (risorse / limite) * 100) : 0;

  return (
    <div className={`rounded-xl p-4 border ${isOverLimit ? 'bg-[#fef2f2] border-[#fecaca]' : 'bg-[#f0fdf4] border-[#bbf7d0]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{isOverLimit ? '🔴' : '🟢'}</span>
        <h4 className={`font-semibold text-sm ${isOverLimit ? 'text-[#991b1b]' : 'text-[#166534]'}`}>
          Verifica Limite Art. 23 c.2 D.Lgs. 75/2017
        </h4>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#5f5252]">Risorse soggette vs. Limite 2016</span>
          <span className="font-semibold">{pct.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-[#e5e7eb] rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${isOverLimit ? 'bg-[#c02128]' : 'bg-[#16a34a]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mt-3">
        <div>
          <p className="text-[#5f5252]">Risorse soggette</p>
          <p className="font-bold text-[#1b0e0e]">{formatCurrency(risorse)}</p>
        </div>
        <div>
          <p className="text-[#5f5252]">Limite 2016 (modificato)</p>
          <p className="font-bold text-[#1b0e0e]">{formatCurrency(limite)}</p>
        </div>
      </div>
      {isOverLimit && (
        <div className="mt-3 text-xs font-semibold text-[#991b1b]">
          ⚠ Superamento: {formatCurrency(superamento)}
        </div>
      )}
    </div>
  );
};

export const HomePage: React.FC = () => {
  const { state, performFundCalculation } = useAppContext();
  const { calculatedFund, complianceChecks, fundData, isLoading, error } = state;
  const { denominazioneEnte, annoRiferimento } = fundData.annualData;
  const hasRunAutoCalc = useRef(false);

  const validationErrors = validateFundData(fundData);
  const missingRequiredCount = Object.keys(validationErrors).filter(k => DATA_ENTRY_FIELDS.includes(k)).length;
  const dataReady = missingRequiredCount === 0;

  // Auto-calculate on mount if data is ready and no calculation has been done yet
  useEffect(() => {
    if (!calculatedFund && dataReady && !isLoading && !hasRunAutoCalc.current) {
      hasRunAutoCalc.current = true;
      performFundCalculation();
    }
  }, [calculatedFund, dataReady, isLoading, performFundCalculation]);

  const isDataAvailable = !!calculatedFund;
  const lastCalcTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const complianceErrors = complianceChecks.filter(c => c.gravita === 'error').length;
  const complianceWarnings = complianceChecks.filter(c => c.gravita === 'warning').length;

  let statusBadge = { text: 'Dati non calcolati', color: '#5f5252', bg: '#f3f4f6' };
  if (isLoading) statusBadge = { text: 'Calcolo in corso…', color: '#92400e', bg: '#fef3c7' };
  else if (isDataAvailable && complianceErrors > 0) statusBadge = { text: `${complianceErrors} criticità rilevate`, color: '#991b1b', bg: '#fee2e2' };
  else if (isDataAvailable && complianceWarnings > 0) statusBadge = { text: `${complianceWarnings} avvisi da verificare`, color: '#92400e', bg: '#fef3c7' };
  else if (isDataAvailable) statusBadge = { text: 'Calcolo aggiornato', color: '#166534', bg: '#dcfce7' };

  const hasDirigenza = fundData.annualData.hasDirigenza;

  const renderContent = () => {
    if (isLoading) {
      return <HomePageSkeleton />;
    }

    if (!isDataAvailable) {
      return <RequiredFieldsNotice />;
    }

    return (
      <div className="grid grid-cols-1 gap-8">
        {/* Summary Card */}
        <DashboardSummary
          calculatedFund={calculatedFund}
          annoRiferimento={fundData.annualData.annoRiferimento}
        />

        {/* Sub-fund KPI Grid */}
        {calculatedFund?.dettaglioFondi && (
          <div>
            <h3 className="text-[#1b0e0e] font-semibold text-base mb-4">Dettaglio per Fondo</h3>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasDirigenza ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
              <SubFundKpiCard
                label="Fondo Personale Dipendente"
                icon="👥"
                colorAccent="#c02128"
                stabile={calculatedFund.dettaglioFondi.dipendente.stabile}
                variabile={calculatedFund.dettaglioFondi.dipendente.variabile}
                totale={calculatedFund.dettaglioFondi.dipendente.totale}
              />
              <SubFundKpiCard
                label="Fondo Elevate Qualificazioni (EQ)"
                icon="🎓"
                colorAccent="#7c3aed"
                stabile={calculatedFund.dettaglioFondi.eq.stabile}
                variabile={calculatedFund.dettaglioFondi.eq.variabile}
                totale={calculatedFund.dettaglioFondi.eq.totale}
              />
              <SubFundKpiCard
                label="Segretario Comunale"
                icon="⚖️"
                colorAccent="#0369a1"
                stabile={calculatedFund.dettaglioFondi.segretario.stabile}
                variabile={calculatedFund.dettaglioFondi.segretario.variabile}
                totale={calculatedFund.dettaglioFondi.segretario.totale}
              />
              {hasDirigenza && (
                <SubFundKpiCard
                  label="Fondo Dirigenza"
                  icon="🏛️"
                  colorAccent="#b45309"
                  stabile={calculatedFund.dettaglioFondi.dirigenza.stabile}
                  variabile={calculatedFund.dettaglioFondi.dirigenza.variabile}
                  totale={calculatedFund.dettaglioFondi.dirigenza.totale}
                />
              )}
            </div>
          </div>
        )}

        {/* Charts + Limit Widget row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <FundAllocationChart />
          </div>
          <div className="lg:col-span-1">
            <ContractedResourcesChart />
          </div>
          <div className="lg:col-span-1 flex flex-col justify-center">
            <LimiteArt23Widget />
          </div>
        </div>

        <ComplianceStatusWidget complianceChecks={complianceChecks} />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1b0e0e] to-[#c02128] p-6 text-white shadow-lg">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1">
            <p className="text-sm text-red-200 uppercase tracking-widest font-medium mb-1">
              Panoramica Fondo Salario Accessorio
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              {denominazioneEnte || 'Ente non specificato'}
            </h2>
            <p className="text-red-100 mt-1 text-sm">
              Anno di riferimento: <span className="font-semibold text-white">{annoRiferimento}</span>
              {isDataAvailable && (
                <span className="ml-3 text-red-200">· Ultimo calcolo: {lastCalcTime}</span>
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            {/* Status Badge */}
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ color: statusBadge.color, backgroundColor: statusBadge.bg }}
            >
              {statusBadge.text}
            </span>
            {/* Refresh Button */}
            <Button
              onClick={performFundCalculation}
              isLoading={isLoading}
              disabled={isLoading}
              variant="secondary"
              size="sm"
            >
              {isLoading ? TEXTS_UI.calculating : '↻ Aggiorna Calcoli'}
            </Button>
          </div>
        </div>
        {/* Total Fund highlight */}
        {isDataAvailable && calculatedFund && (
          <div className="mt-5 pt-4 border-t border-red-400/30 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-red-200 uppercase tracking-wide">Totale Fondo {annoRiferimento}</p>
              <p className="text-2xl font-bold">{formatCurrency(calculatedFund.totaleFondo)}</p>
            </div>
            <div>
              <p className="text-xs text-red-200 uppercase tracking-wide">Parte Stabile</p>
              <p className="text-xl font-semibold">{formatCurrency(calculatedFund.totaleParteStabile)}</p>
            </div>
            <div>
              <p className="text-xs text-red-200 uppercase tracking-wide">Parte Variabile</p>
              <p className="text-xl font-semibold">{formatCurrency(calculatedFund.totaleParteVariabile)}</p>
            </div>
          </div>
        )}
      </div>

      {error && isDataAvailable && !isLoading && (
        <Alert type="error" title="Errore durante l'aggiornamento" message={error} />
      )}

      {renderContent()}
    </div>
  );
};
