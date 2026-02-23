// src/pages/HomePage.tsx
import React from 'react';
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

// Fields belonging to the "Dati Costituzione Fondo" page
const DATA_ENTRY_FIELDS = [
  'fundData.annualData.denominazioneEnte',
  'fundData.annualData.tipologiaEnte',
  'fundData.annualData.hasDirigenza',
  'fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016',
  'fundData.annualData.numeroAbitanti', // Conditional
  'fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23', // Conditional
];

// Mapping from field path to user-friendly label
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

  // Filter errors to show only those from the DataEntryPage
  const missingFields = Object.keys(validationErrors)
    .filter(key => DATA_ENTRY_FIELDS.includes(key))
    .map(key => ({
      key,
      label: FIELD_LABELS[key] || key,
      message: validationErrors[key]
    }));

  if (missingFields.length === 0) return null;

  const goToDataEntry = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dataEntry' });
  };

  return (
    <Card title="Completa i dati per iniziare" className="border-l-4 border-amber-400">
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

export const HomePage: React.FC = () => {
  const { state, performFundCalculation } = useAppContext();
  const { calculatedFund, complianceChecks, fundData, isLoading, error } = state;
  const { denominazioneEnte, annoRiferimento } = fundData.annualData;

  const isDataAvailable = !!calculatedFund;
  const pageTitle = `Riepilogo fondo - ${denominazioneEnte || 'Ente non specificato'} per l'anno ${annoRiferimento}`;

  const renderContent = () => {
    if (isLoading) {
      return <HomePageSkeleton />;
    }

    if (!isDataAvailable) {
      return <RequiredFieldsNotice />;
    }

    return (
      <div className="grid grid-cols-1 gap-8">
        <DashboardSummary
          calculatedFund={calculatedFund}
          annoRiferimento={fundData.annualData.annoRiferimento}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FundAllocationChart />
          <ContractedResourcesChart />
        </div>
        <ComplianceStatusWidget complianceChecks={complianceChecks} />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#f3e7e8] pb-4">
        <div>
          <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">{pageTitle}</h2>
          <p className="text-[#5f5252] mt-1">
            Visione d'insieme dei dati calcolati e dello stato di conformità del fondo.
          </p>
        </div>
        <Button onClick={performFundCalculation} isLoading={isLoading} disabled={isLoading} variant="primary" size="md">
          {isLoading ? TEXTS_UI.calculating : "Aggiorna Calcoli"}
        </Button>
      </div>

      {error && isDataAvailable && !isLoading && (
        <Alert type="error" title="Errore durante l'aggiornamento" message={error} />
      )}

      {renderContent()}
    </div>
  );
};
