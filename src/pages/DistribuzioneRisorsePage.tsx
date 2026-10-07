// pages/DistribuzioneRisorsePage.tsx
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Card } from '../components/shared/Card.tsx';
import { DistribuzioneRisorseData, RisorsaVariabileDetail, FondoElevateQualificazioniData } from '../domain';
import { Button } from '../components/shared/Button.tsx';
import { Input } from '../components/shared/Input.tsx';
import { Checkbox } from '../components/shared/Checkbox.tsx';
import { NormativaPopover } from '../components/shared/NormativaPopover.tsx';
// FIX: import getDistribuzioneFieldDefinitions and getEqFieldDefinitions functions from the correct helper file
import { getDistribuzioneFieldDefinitions, getEqFieldDefinitions } from '../logic/fundFieldDefinitions.ts';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { resolveDistributionFundBudget, resolveDistributionBalances } from '../logic/distribution/resolveDistributionFundBudget';
import { resolveDistributionDraftProposal, resolveDistributionPersonnel } from '../logic/distribution/resolveDistributionDraftProposal';
import { resolveChecklist } from '../logic/cabina/resolveChecklist';

const DisplayField: React.FC<{ label: string; value: string | number; info?: string }> = ({ label, value, info }) => (
  <div className="mb-0">
    <label className="block text-xs font-medium text-[#1b0e0e] pb-2">{label}</label>
    <div className="flex w-full min-w-0 flex-1 items-center rounded-lg text-[#1b0e0e] border border-transparent bg-[#fcf8f8] h-10 p-2 text-sm font-semibold">
      {value}
    </div>
    {info && <p className="mt-1 text-xs text-[#5f5252]">{info}</p>}
  </div>
);

const VariableFundingItem: React.FC<{
  id: keyof DistribuzioneRisorseData;
  description: string | React.ReactNode;
  value?: RisorsaVariabileDetail;
  onChange: (field: keyof DistribuzioneRisorseData, subField: keyof RisorsaVariabileDetail, value?: number) => void;
  riferimentoNormativo?: string;
  disabled?: boolean;
  /** Stanziate e % impostate dalla proposta; Risparmi e A Bilancio restano editabili a consuntivo. */
  disableStanziateOnly?: boolean;
  inputInfo?: string | React.ReactNode;
  showABilancio?: boolean;
  showPercentage?: boolean;
  budgetBaseForPercentage?: number;
  disableSavingsAndBudgetFields?: boolean;
  otherItemsSum?: number;
  fallbackBase?: number;
  titoloGuida?: string;
  descrizioneFunzionale?: string;
  quandoSiUsa?: string;
  fonteDato?: string;
  effettoLimiti?: string;
  erroriFrequenti?: string;
  tipoDato?: 'manuale' | 'automatico' | 'suggerito';
  livelloAttenzione?: 'info' | 'warning' | 'critical';
}> = ({ id, description, value, onChange, riferimentoNormativo, disabled = false, disableStanziateOnly = false, inputInfo, showABilancio = true, showPercentage = false, budgetBaseForPercentage = 0, disableSavingsAndBudgetFields = false, otherItemsSum, fallbackBase, titoloGuida, descrizioneFunzionale, quandoSiUsa, fonteDato, effettoLimiti, erroriFrequenti, tipoDato, livelloAttenzione }) => {

  const handleInputChange = (subField: keyof RisorsaVariabileDetail) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onChange(id, subField, val);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
    if (percValue === undefined || isNaN(percValue)) {
      onChange(id, 'stanziate', undefined);
      return;
    }

    if (otherItemsSum !== undefined && fallbackBase !== undefined) {
      if (otherItemsSum === 0) {
        const derivedStanz = (percValue / 100) * fallbackBase;
        onChange(id, 'stanziate', Math.round((derivedStanz + Number.EPSILON) * 100) / 100);
      } else {
        if (percValue >= 100) {
          onChange(id, 'stanziate', Math.round(otherItemsSum * 9999));
        } else {
          const derivedStanz = (percValue / (100 - percValue)) * otherItemsSum;
          onChange(id, 'stanziate', Math.round((derivedStanz + Number.EPSILON) * 100) / 100);
        }
      }
    } else {
      if (budgetBaseForPercentage <= 0) return;
      const derivedStanz = (percValue / 100) * budgetBaseForPercentage;
      onChange(id, 'stanziate', Math.round((derivedStanz + Number.EPSILON) * 100) / 100);
    }
  };

  const percentage = (value?.stanziate && budgetBaseForPercentage && budgetBaseForPercentage > 0)
    ? (value.stanziate / budgetBaseForPercentage) * 100
    : 0;

  const gridColsClass = showPercentage ? (showABilancio ? 'grid-cols-4' : 'grid-cols-3') : (showABilancio ? 'grid-cols-3' : 'grid-cols-2');
  const descriptionColSpan = showPercentage ? 'md:col-span-4' : 'md:col-span-6';
  const inputsColSpan = showPercentage ? 'md:col-span-8' : 'md:col-span-6';

  return (
    <div className={`py-3 px-4 border-b border-[#f3e7e8] last:border-b-0 transition-all duration-200 hover:bg-blue-50/40 rounded-lg ${disabled ? 'opacity-60 bg-gray-50' : ''}`}>
      <div className="grid grid-cols-12 gap-x-6 gap-y-2 items-center">
        <div className={`col-span-12 ${descriptionColSpan} flex flex-col justify-center h-full`}>
          <p className={`block pl-2 text-sm font-medium text-[#2d3748] ${disabled ? 'cursor-not-allowed text-gray-400' : ''}`}>
            {description}
            <NormativaPopover 
              titoloGuida={titoloGuida}
              descrizioneFunzionale={descrizioneFunzionale}
              quandoSiUsa={quandoSiUsa}
              fonteDato={fonteDato}
              effettoLimiti={effettoLimiti}
              erroriFrequenti={erroriFrequenti}
              tipoDato={tipoDato}
              livelloAttenzione={livelloAttenzione}
            />
          </p>
          {riferimentoNormativo && <p className="text-[11px] text-[#718096] mt-1 pl-2">{riferimentoNormativo}</p>}
          {disableStanziateOnly && !disabled && (
            <p className="text-[10px] text-blue-500 mt-1 pl-2 italic">Stanziate impostate con la proposta di riparto — inserire i Risparmi a consuntivo</p>
          )}
        </div>
        <div className={`col-span-12 ${inputsColSpan} grid ${gridColsClass} gap-x-3`}>
          <Input monetaryPath="stanziate"
            label="Stanziate"
            type="number"
            id={`${String(id)}_stanziate`}
            value={value?.stanziate ?? ''}
            onChange={handleInputChange('stanziate')}
            disabled={disabled || disableStanziateOnly}
            placeholder="0.00"
            step="0.01"
            containerClassName="mb-0"
            inputClassName="text-right h-10 p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 border-gray-200"
            labelClassName="text-[11px] text-gray-500 tracking-wide uppercase font-semibold mb-1"
          />
          {showPercentage && (
            <Input
              label="%"
              type="number"
              id={`${String(id)}_percentage`}
              value={percentage === 0 ? '' : percentage.toFixed(2)}
              onChange={handlePercentageChange}
              disabled={disabled || disableStanziateOnly || budgetBaseForPercentage <= 0}
              placeholder="0.00"
              step="0.01"
              min="0"
              containerClassName="mb-0"
              inputClassName="text-right h-10 p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 border-gray-200"
              labelClassName="text-[11px] text-gray-500 tracking-wide uppercase font-semibold mb-1"
              inputInfo={disableStanziateOnly ? "Impostato applicando la proposta di riparto" : disabled || budgetBaseForPercentage <= 0 ? "Non modificabile" : undefined}
            />
          )}
          <Input monetaryPath="risparmi"
            label="Risparmi"
            type="number"
            id={`${String(id)}_risparmi`}
            value={value?.risparmi ?? ''}
            onChange={handleInputChange('risparmi')}
            disabled={disabled || disableSavingsAndBudgetFields}
            placeholder="0.00"
            step="0.01"
            containerClassName="mb-0"
            inputClassName={`text-right h-10 p-2 text-sm focus:ring-2 focus:ring-emerald-500/20 border-emerald-200 ${disabled || disableSavingsAndBudgetFields ? 'bg-gray-50' : 'bg-emerald-50'}`}
            labelClassName="text-[11px] text-emerald-600 tracking-wide uppercase font-semibold mb-1"
          />
          {showABilancio && (
            <Input monetaryPath="aBilancio"
              label="A Bilancio"
              type="number"
              id={`${String(id)}_aBilancio`}
              value={value?.aBilancio ?? ''}
              onChange={handleInputChange('aBilancio')}
              disabled={disabled || disableSavingsAndBudgetFields}
              placeholder="0.00"
              step="0.01"
              containerClassName="mb-0"
              inputClassName="text-right h-10 p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 border-gray-200 font-medium text-gray-700"
              labelClassName="text-[11px] text-gray-500 tracking-wide uppercase font-semibold mb-1"
            />
          )}
        </div>
      </div>
      {inputInfo && <div className="text-xs text-[#5f5252] mt-1 pl-4">{inputInfo}</div>}
    </div>
  );
};

const SimpleFundingItem = <T extends Record<string, any>>({
  id,
  description,
  value,
  onChange,
  riferimentoNormativo,
  disabled,
  inputInfo,
  titoloGuida,
  descrizioneFunzionale,
  quandoSiUsa,
  fonteDato,
  effettoLimiti,
  erroriFrequenti,
  tipoDato,
  livelloAttenzione,
}: {
  id: keyof T;
  description: string | React.ReactNode;
  value?: number;
  onChange: (field: keyof T, value?: number) => void;
  riferimentoNormativo?: string;
  disabled?: boolean;
  inputInfo?: string | React.ReactNode;
  titoloGuida?: string;
  descrizioneFunzionale?: string;
  quandoSiUsa?: string;
  fonteDato?: string;
  effettoLimiti?: string;
  erroriFrequenti?: string;
  tipoDato?: 'manuale' | 'automatico' | 'suggerito';
  livelloAttenzione?: 'info' | 'warning' | 'critical';
}) => (
  <div
    className={`py-3 px-4 border-b border-[#f3e7e8] last:border-b-0 transition-all duration-200 hover:bg-blue-50/40 rounded-lg ${disabled ? 'opacity-60 bg-gray-50' : ''}`}
  >
    <div className="grid grid-cols-12 gap-x-6 gap-y-2 items-center">
      <div className="col-span-12 md:col-span-6 flex flex-col justify-center h-full">
        <label
          htmlFor={id as string}
          className={`block pl-2 text-sm font-medium text-[#2d3748] ${disabled ? 'cursor-not-allowed text-gray-400' : ''}`}
        >
          {description}
          <NormativaPopover 
            titoloGuida={titoloGuida}
            descrizioneFunzionale={descrizioneFunzionale}
            quandoSiUsa={quandoSiUsa}
            fonteDato={fonteDato}
            effettoLimiti={effettoLimiti}
            erroriFrequenti={erroriFrequenti}
            tipoDato={tipoDato}
            livelloAttenzione={livelloAttenzione}
          />
        </label>
        {riferimentoNormativo && <p className="text-[11px] text-[#718096] mt-1 pl-2">{riferimentoNormativo}</p>}
      </div>
      <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-x-3">
        <div className="col-span-1"></div> {/* Spacer for aligning with VariableFundingItem */}
        <div className="col-span-1">
          <Input
            type="number"
            id={id as string}
            value={value ?? ''}
            onChange={(e) => onChange(id, e.target.value === '' ? undefined : parseFloat(e.target.value))}
            label="Valore"
            labelClassName="text-[11px] text-gray-500 tracking-wide uppercase font-semibold mb-1"
            step="0.01"
            inputClassName={`text-right w-full h-10 p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 border-gray-200 ${disabled ? 'bg-white' : ''}`}
            containerClassName="mb-0"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
    {inputInfo && <div className="text-xs text-[#5f5252] mt-1 pl-4">{inputInfo}</div>}
  </div>
);

export const DistribuzioneRisorsePage: React.FC = () => {
  const { state, dispatch, saveState } = useAppContext();
  // FIX: Get normativeData from the useNormativeData hook instead of state.
  const { data: normativeData } = useNormativeData();
  const { fundData, calculationResult } = state;
  const { dettagli: employees } = state.fundData.personaleServizio;

  const {
    distribuzioneRisorseData,
    annualData,
    fondoElevateQualificazioniData,
  } = fundData || {
    distribuzioneRisorseData: {},
    annualData: { personaleServizioAttuale: [] },
    fondoElevateQualificazioniData: {}
  };



  const isClosed = fundData?.metadata?.snapshotStatus === 'CLOSED';
  const hasBlockingIssues = resolveChecklist({ complianceChecks: state.complianceChecks })
    .some(issue => issue.severity === 'BLOCKING');

  const fundBudget = resolveDistributionFundBudget(calculationResult?.canonicalFund);
  const isDraftBudget = fundBudget.basis.mode !== 'AUTHORITATIVE';
  const budgetQualification = isDraftBudget ? ' (bozza)' : '';
  const budgetMoney = (value: number | null) => value === null ? 'Non determinato' : formatCurrency(value);

  const handleChange = (field: keyof DistribuzioneRisorseData, value?: number | boolean) => {
    if (isClosed) return;
    dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: { [field]: value } });
  };

  const handleEqChange = (field: keyof FondoElevateQualificazioniData, value?: number) => {
    if (isClosed) return;
    dispatch({ type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA', payload: { [field]: value } });
  };

  const handleVariableChange = (
    field: keyof DistribuzioneRisorseData,
    subField: keyof RisorsaVariabileDetail,
    value?: number
  ) => {
    if (isClosed) return;
    const currentItem = (distribuzioneRisorseData as any)[field] as RisorsaVariabileDetail | undefined;
    const newItem = {
      ...(currentItem || {}),
      [subField]: value
    };
    dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: { [field]: newItem } });
  };

  const handlePerfPercChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isClosed) return;
    const newPercStr = e.target.value;
    const newPerc = newPercStr === '' ? undefined : parseFloat(newPercStr);

    dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: { criteri_percPerfIndividuale: newPerc } });
  };

  const utilizziParteStabile = useMemo(() => {
    const data = distribuzioneRisorseData || {};
    return (data.u_diffProgressioniStoriche || 0) +
      (data.u_indennitaComparto || 0) +
      (data.u_incrIndennitaEducatori?.stanziate || 0) +
      (data.u_incrIndennitaScolastico?.stanziate || 0) +
      (data.u_indennitaEx8QF?.stanziate || 0);
  }, [distribuzioneRisorseData]);

  const utilizziParteVariabile = useMemo(() => {
    const data = distribuzioneRisorseData || {};
    return Object.keys(data)
      .filter(key => key.startsWith('p_'))
      .reduce((sum, key) => {
        const value = (data as any)[key] as RisorsaVariabileDetail | undefined;
        return sum + (value?.stanziate || 0);
      }, 0);
  }, [distribuzioneRisorseData]);

  const totaleAllocato = useMemo(() => {
    return utilizziParteStabile + utilizziParteVariabile;
  }, [utilizziParteStabile, utilizziParteVariabile]);

  const balances = resolveDistributionBalances(fundBudget.basis, utilizziParteStabile, totaleAllocato);
  const importoDisponibileContrattazione = balances.availableForNegotiation;

  // La base delle percentuali per la Parte Variabile deve essere la somma degli stanziamenti per garantire che la totalità corrisponda al 100%
  const budgetBaseForVariabilePercentuale = utilizziParteVariabile;

  const otherVariableUtilizations = useMemo(() => {
    const data = distribuzioneRisorseData || {};
    return Object.keys(data)
      .filter(key =>
        key.startsWith('p_') &&
        key !== 'p_performanceOrganizzativa' &&
        key !== 'p_performanceIndividuale' &&
        key !== 'p_maggiorazionePerformanceIndividuale'
      )
      .reduce((sum, key) => {
        const value = (data as any)[key] as RisorsaVariabileDetail | undefined;
        return sum + (value?.stanziate || 0);
      }, 0);
  }, [distribuzioneRisorseData]);

  const distribuzioneFieldDefinitions = useMemo(() => {
    if (!normativeData) return [];
    return getDistribuzioneFieldDefinitions(normativeData);
  }, [normativeData]);

  const sections = useMemo(() =>
    distribuzioneFieldDefinitions.reduce((acc, field) => {
      (acc as any)[field.section] = (acc as any)[field.section] || [];
      (acc as any)[field.section].push(field);
      return acc;
    }, {} as Record<string, typeof distribuzioneFieldDefinitions>)
    , [distribuzioneFieldDefinitions]);

  const personnel = resolveDistributionPersonnel(annualData?.ccnl2024?.personaleInServizio01012026, employees);
  const numeroDipendenti = personnel.count;
  const isArt48Applicable = personnel.art48Applicable;
  const isPersonnelMissing = personnel.status === 'MISSING';

  const percDipendentiBonus = distribuzioneRisorseData?.criteri_percDipendentiBonus || 0;
  const numDipendentiBonus = numeroDipendenti === null ? null : Math.ceil(numeroDipendenti * (percDipendentiBonus / 100));

  const minMaggiorazione = useMemo(() => {
    if (numeroDipendenti === null) return null;
    if (!isArt48Applicable) return 0;
    if (distribuzioneRisorseData?.art48_applicaObiettiviEnte) return 20;
    if (numeroDipendenti <= 10) return 25;
    return 30;
  }, [isArt48Applicable, distribuzioneRisorseData?.art48_applicaObiettiviEnte, numeroDipendenti]);

  const maggiorazioneProCapite = useMemo(() => {
    const percInd = distribuzioneRisorseData?.criteri_percPerfIndividuale || 0;
    const percMagg = distribuzioneRisorseData?.criteri_percMaggiorazionePremio || 0;

    if (importoDisponibileContrattazione === null || numeroDipendenti === null) return null;
    if (numeroDipendenti === 0 || !isArt48Applicable) return 0;

    const budgetIndividualeTeorico = importoDisponibileContrattazione * (percInd / 100);
    const premioMedioTeorico = budgetIndividualeTeorico / numeroDipendenti;
    return premioMedioTeorico * (percMagg / 100);

  }, [importoDisponibileContrattazione, distribuzioneRisorseData?.criteri_percPerfIndividuale, distribuzioneRisorseData?.criteri_percMaggiorazionePremio, numeroDipendenti, isArt48Applicable]);

  const proposal = resolveDistributionDraftProposal({
    basis: fundBudget.basis,
    stableAllocated: utilizziParteStabile,
    otherVariableAllocated: otherVariableUtilizations,
    individualPercentage: distribuzioneRisorseData.criteri_percPerfIndividuale ?? 0,
    allocatedMaggiorazione: distribuzioneRisorseData.p_maggiorazionePerformanceIndividuale?.stanziate ?? 0,
    maggiorazioneProCapite,
    numDipendentiBonus,
  });

  const handleApplyProposal = () => {
    if (isClosed || hasBlockingIssues || proposal.status !== 'AVAILABLE') return;
    const updates: Partial<DistribuzioneRisorseData> = {
      p_performanceIndividuale: { ...distribuzioneRisorseData.p_performanceIndividuale, stanziate: proposal.individuale },
      p_performanceOrganizzativa: { ...distribuzioneRisorseData.p_performanceOrganizzativa, stanziate: proposal.organizzativa },
    };
    if (proposal.maggiorazione !== null) {
      updates.p_maggiorazionePerformanceIndividuale = {
        ...distribuzioneRisorseData.p_maggiorazionePerformanceIndividuale,
        stanziate: proposal.maggiorazione,
      };
    }
    dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: updates });
  };

  const criteri_isConsuntivoMode = !!distribuzioneRisorseData?.criteri_isConsuntivoMode;
  const isPreventivoMode = !criteri_isConsuntivoMode;

  const handleConsuntivoChange = (isConsuntivo: boolean) => {
    if (isClosed) return;
    const updates: Partial<DistribuzioneRisorseData> = { criteri_isConsuntivoMode: isConsuntivo };
    if (!isConsuntivo) {
      for (const def of distribuzioneFieldDefinitions) {
        const item = distribuzioneRisorseData[def.key as keyof DistribuzioneRisorseData];
        if (item && typeof item === 'object' && (item.risparmi !== undefined || item.aBilancio !== undefined)) {
          Object.assign(updates, { [def.key]: { ...item, risparmi: undefined, aBilancio: undefined } });
        }
      }
    }
    dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: updates });
  };

  if (!calculationResult || !normativeData) {
    return (
      <div className="space-y-8">
        <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Distribuzione delle Risorse</h2>
        <Card title="Dati non disponibili">
          <p className="text-lg text-[#5f5252] mb-4">
            Per poter distribuire le risorse, è necessario prima eseguire il calcolo generale del fondo.
          </p>
          <p className="text-sm text-[#5f5252] mb-4">
            Vai alla pagina <strong className="text-[#1b0e0e]">"Dati Costituzione Fondo"</strong> e clicca sul pulsante <strong className="text-[#ea2832]">"Salva Dati e Calcola Fondo"</strong>.
          </p>
          <Button
            variant="primary"
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'wizard2026Preview' })}
          >
            Apri Configurazione Fondo 2026
          </Button>
        </Card>
      </div>
    );
  }

  const importoRimanente = balances.residual;
  const isOverAllocated = importoRimanente !== null && importoRimanente < 0;
  const isFullyAllocated = importoRimanente === 0;




  return (
    <div className="space-y-8 pb-24">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Distribuzione delle Risorse del Fondo</h2>

      {isDraftBudget && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-sm" role="status">
          <strong>Budget del Fondo non determinato ({fundBudget.canonicalStatus}).</strong>{' '}
          {fundBudget.basis.mode === 'VERIFIED_DRAFT'
            ? <>Subtotale verificato: {budgetMoney(fundBudget.verifiedFundSubtotal)}. Base di simulazione BOZZA: disponibilità, residui e performance sono provvisori e non attestano la costituzione del Fondo.</>
            : 'Base canonica assente: disponibilità, residui e performance non determinati.'}
        </div>
      )}

      {isClosed && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 font-medium">
          ⚠️ Annualità Chiusa (Sola Lettura): I dati della distribuzione risorse non possono essere modificati.
        </div>
      )}

      {/* Sticky KPI Dashboard */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm mb-8">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Totale da Distribuire */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Totale da Distribuire</span>
              <span className="text-2xl font-bold text-gray-900">{budgetMoney(fundBudget.authoritativeFundTotal)}</span>
              <span className="text-[10px] text-gray-400 mt-auto pt-2">Totale canonico del Fondo Personale</span>
            </div>

            {/* Disponibile Contrattazione */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Disponibile Contrattazione{budgetQualification}</span>
              <span className="text-2xl font-bold text-blue-900">{budgetMoney(importoDisponibileContrattazione)}</span>
              <span className="text-[10px] text-blue-500 mt-auto pt-2">{isDraftBudget ? 'Base di simulazione - Utilizzi stabili' : 'Totale - Parte Stabile'}</span>
            </div>

            {/* Totale Allocato */}
            <div className={`rounded-xl p-4 border shadow-sm flex flex-col ${isOverAllocated ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isOverAllocated ? 'text-red-700' : 'text-gray-500'}`}>Totale Allocato{budgetQualification}</span>
              <span className={`text-2xl font-bold ${isOverAllocated ? 'text-red-700' : 'text-gray-900'}`}>{formatCurrency(totaleAllocato)}</span>
              <span className={`text-[10px] mt-auto pt-2 ${isOverAllocated ? 'text-red-500' : 'text-gray-400'}`}>Somma degli utilizzi</span>
            </div>

            {/* Rimanenza */}
            <div className={`rounded-xl p-4 border shadow-sm flex flex-col ${isOverAllocated ? 'bg-red-500 text-white border-red-600' : isFullyAllocated ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-emerald-50 border-emerald-200'}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${(isOverAllocated || isFullyAllocated) ? 'text-white/80' : 'text-emerald-700'}`}>Rimanenza{budgetQualification}</span>
              <span className={`text-2xl font-bold ${(isOverAllocated || isFullyAllocated) ? 'text-white' : 'text-emerald-700'}`}>{budgetMoney(importoRimanente)}</span>
              <span className={`text-[10px] mt-auto pt-2 ${(isOverAllocated || isFullyAllocated) ? 'text-white/70' : 'text-emerald-600'}`}>{isDraftBudget ? 'Margine di simulazione' : 'Margine disponibile'}</span>
            </div>

          </div>

          {/* Progress Bar */}
          {fundBudget.basis.amount !== null && <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2 overflow-hidden flex">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${isOverAllocated ? 'bg-red-500' : isFullyAllocated ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, (totaleAllocato / (fundBudget.basis.amount || 1)) * 100))}%` }}
            ></div>
            {isOverAllocated && (
              <div
                className="h-2.5 bg-red-300 animate-pulse"
                style={{ width: `${Math.min(100, ((Math.abs(importoRimanente!)) / (fundBudget.basis.amount || 1)) * 100)}%` }}
              ></div>
            )}
          </div>}
          {importoRimanente !== null && importoRimanente < -0.005 && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium mt-1 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {isDraftBudget ? 'Attenzione: l’importo allocato supera la base di simulazione BOZZA!' : 'Attenzione: L\'importo allocato supera le risorse disponibili del Fondo!'}
            </div>
          )}
        </div>
      </div>

      {isPersonnelMissing && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-sm" data-testid="distribution-personnel-missing">
          Personale in servizio mancante. Inserire il dato per determinare l'applicabilità e la maggiorazione Art.48.
          Le allocazioni già inserite restano invariate.
        </div>
      )}

      {!isClosed && (
        <Card title={proposal.mode === 'VERIFIED_DRAFT' ? 'Proposta di riparto performance — simulazione BOZZA' : 'Proposta di riparto performance'}>
          <div data-testid="distribution-proposal">
            <p className="text-sm text-gray-600 mb-4">
              La proposta non modifica gli stanziamenti. Applicarla sostituisce le quote performance con gli importi suggeriti.
              {proposal.mode === 'VERIFIED_DRAFT' && ' È una simulazione: non attesta la costituzione definitiva del Fondo.'}
            </p>
            {proposal.status === 'AVAILABLE' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <DisplayField label="Proposta performance individuale" value={formatCurrency(proposal.individuale)} />
                  <DisplayField label="Proposta performance organizzativa" value={formatCurrency(proposal.organizzativa)} />
                  <DisplayField label="Proposta maggiorazione" value={budgetMoney(proposal.maggiorazione)}
                    info={proposal.maggiorazione === null ? 'Personale mancante: la quota già inserita viene conservata.' : undefined} />
                </div>
                <Button onClick={handleApplyProposal} disabled={hasBlockingIssues}>Applica la proposta di riparto</Button>
                {hasBlockingIssues && <p className="mt-2 text-sm text-amber-900">Risolvere le criticità bloccanti nelle verifiche prima di applicare la proposta.</p>}
              </>
            ) : <p className="text-sm text-gray-600">Proposta non disponibile: {proposal.reason === 'MISSING_BUDGET' ? 'base canonica assente.' : 'verificare gli importi e i criteri inseriti.'}</p>}
          </div>
        </Card>
      )}

      <Card title="Criteri di Distribuzione Performance" isCollapsible defaultCollapsed={false} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Checkbox
            id="isConsuntivoMode"
            label="Modalità consuntivo?"
            checked={!!distribuzioneRisorseData.criteri_isConsuntivoMode}
            onChange={(e) => {
              handleConsuntivoChange(e.target.checked);
            }}
            disabled={isClosed}
            containerClassName="md:col-span-2"
            data-testid="consuntivo-toggle"
          />
          <Input
            label="% Performance Individuale"
            type="number"
            id="criteri_percPerfIndividuale"
            value={distribuzioneRisorseData.criteri_percPerfIndividuale ?? ''}
            onChange={handlePerfPercChange}
            disabled={isClosed}
            inputInfo={`% Performance Organizzativa: ${100 - (distribuzioneRisorseData.criteri_percPerfIndividuale || 0)}% `}
            min="0" max="100" step="1"
          />
          <DisplayField
            label={`Budget Base Performance (calcolato)${budgetQualification}`}
            value={budgetMoney(importoDisponibileContrattazione === null ? null : Math.max(0, importoDisponibileContrattazione - otherVariableUtilizations))}
            info="Disponibile per Contrattazione - Altri utilizzi variabili"
          />
          <Input
            label="% Maggiorazione Premio"
            type="number"
            id="criteri_percMaggiorazionePremio"
            value={isPersonnelMissing ? (distribuzioneRisorseData.criteri_percMaggiorazionePremio ?? '') : !isArt48Applicable ? 0 : (distribuzioneRisorseData.criteri_percMaggiorazionePremio ?? '')}
            onChange={(e) => {
              handleChange('criteri_percMaggiorazionePremio', e.target.value === '' ? undefined : parseFloat(e.target.value));
            }}
            min="0"
            max="100"
            step="1"
            disabled={isClosed || !isArt48Applicable}
            inputInfo={isPersonnelMissing ? "Personale mancante: applicabilità Art.48 non determinabile" : !isArt48Applicable ? "Non applicabile per enti con dipendenti ≤ 5" : `Il valore non può essere inferiore al ${minMaggiorazione}% del valore medio pro capite.`}
            warning={isArt48Applicable && minMaggiorazione !== null && (distribuzioneRisorseData.criteri_percMaggiorazionePremio ?? 0) < minMaggiorazione ? `Valore inferiore al minimo contrattuale del ${minMaggiorazione}%.` : undefined}
          />
          <Input
            label="% Dipendenti con Bonus Maggiorazione"
            type="number"
            id="criteri_percDipendentiBonus"
            value={isPersonnelMissing ? (distribuzioneRisorseData.criteri_percDipendentiBonus ?? '') : !isArt48Applicable ? 0 : (distribuzioneRisorseData.criteri_percDipendentiBonus ?? '')}
            onChange={(e) => {
              handleChange('criteri_percDipendentiBonus', e.target.value === '' ? undefined : parseFloat(e.target.value));
            }}
            disabled={isClosed || !isArt48Applicable}
            min="0" max="100" step="1"
            inputInfo={isPersonnelMissing ? "Personale mancante: numero beneficiari non determinabile" : !isArt48Applicable ? "Non applicabile" : `${numDipendentiBonus} su ${numeroDipendenti} dipendenti`}
          />
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <Checkbox
              id="art48_applicaObiettiviEnte"
              label="Obiettivi di ente collegati alla performance (Art. 48 c.4)"
              checked={distribuzioneRisorseData.art48_applicaObiettiviEnte || false}
              onChange={(e) => handleChange('art48_applicaObiettiviEnte', e.target.checked)}
              disabled={isClosed || !isArt48Applicable}
            />
          </div>
          <div className="md:col-span-2 mt-2">
            <DisplayField
              label={`Maggiorazione pro-capite premio individuale (calcolato)${budgetQualification}`}
              value={budgetMoney(maggiorazioneProCapite)}
              info={isPersonnelMissing ? "Personale mancante: maggiorazione non determinabile" : !isArt48Applicable ? "Non applicabile" : "((Disponibile contrattazione * % Perf. Ind.) / N° Dipendenti) * % Maggiorazione"}
            />
          </div>
        </div>
      </Card>

      {Object.entries(sections).map(([sectionKey, fields]) => {
        const sectionName = sectionKey === 'stabili' ? 'Utilizzi Parte Stabile' : 
                           sectionKey === 'variabili' ? 'Utilizzi Parte Variabile' : 
                           sectionKey;
        return (
          <Card key={sectionKey} title={sectionName + budgetQualification} isCollapsible defaultCollapsed={sectionKey === 'variabili'}>
          {(fields as any[]).map((def: any) => {
            const value = (distribuzioneRisorseData as any)[def.key];

            const isAutoCalculated = def.key === 'u_diffProgressioniStoriche' || def.key === 'u_indennitaComparto';

            if (def.key.startsWith('u_')) {
              if (['u_incrIndennitaEducatori', 'u_incrIndennitaScolastico', 'u_indennitaEx8QF'].includes(def.key)) {
                return (
                  <VariableFundingItem
                    key={String(def.key)}
                    id={def.key}
                    description={def.description}
                    value={value as RisorsaVariabileDetail | undefined}
                    onChange={handleVariableChange}
                    fallbackBase={importoDisponibileContrattazione === null ? undefined : importoDisponibileContrattazione > 0 ? importoDisponibileContrattazione : 1}
                    disableSavingsAndBudgetFields={isPreventivoMode}
                    disabled={isClosed}
                    titoloGuida={def.titoloGuida}
                    descrizioneFunzionale={def.descrizioneFunzionale}
                    quandoSiUsa={def.quandoSiUsa}
                    fonteDato={def.fonteDato}
                    effettoLimiti={def.effettoLimiti}
                    erroriFrequenti={def.erroriFrequenti}
                    tipoDato={def.tipoDato}
                    livelloAttenzione={def.livelloAttenzione}
                  />
                );
              } else {
                return (
                  <SimpleFundingItem<DistribuzioneRisorseData>
                    key={String(def.key)}
                    id={def.key}
                    description={def.description}
                    value={value as number | undefined}
                    onChange={(field, val) => handleChange(field as keyof DistribuzioneRisorseData, val as number)}
                    riferimentoNormativo={def.riferimento}
                    disabled={isClosed || isAutoCalculated}
                    inputInfo={isAutoCalculated ? "Valore calcolato automaticamente dalla pagina Personale in Servizio" : undefined}
                    titoloGuida={def.titoloGuida}
                    descrizioneFunzionale={def.descrizioneFunzionale}
                    quandoSiUsa={def.quandoSiUsa}
                    fonteDato={def.fonteDato}
                    effettoLimiti={def.effettoLimiti}
                    erroriFrequenti={def.erroriFrequenti}
                    tipoDato={def.tipoDato}
                    livelloAttenzione={def.livelloAttenzione}
                  />
                );
              }
            } else if (def.key.startsWith('p_')) {
              const isPerformanceField = def.key === 'p_performanceIndividuale' || def.key === 'p_performanceOrganizzativa' || def.key === 'p_maggiorazionePerformanceIndividuale';

              const itemStanziate = (value as RisorsaVariabileDetail | undefined)?.stanziate || 0;
              const otherItemsSum = Math.max(0, utilizziParteVariabile - itemStanziate);

              return (
                <VariableFundingItem
                  key={String(def.key)}
                  id={def.key}
                  description={def.description}
                  value={value as RisorsaVariabileDetail | undefined}
                  onChange={handleVariableChange}
                  riferimentoNormativo={def.riferimento}
                  showPercentage={true}
                  disabled={isClosed}
                  disableStanziateOnly={isPerformanceField}
                  budgetBaseForPercentage={fundBudget.basis.amount === null ? undefined : budgetBaseForVariabilePercentuale}
                  otherItemsSum={otherItemsSum}
                  fallbackBase={importoDisponibileContrattazione === null ? undefined : importoDisponibileContrattazione > 0 ? importoDisponibileContrattazione : 1}
                  disableSavingsAndBudgetFields={isPreventivoMode}
                  titoloGuida={def.titoloGuida}
                  descrizioneFunzionale={def.descrizioneFunzionale}
                  quandoSiUsa={def.quandoSiUsa}
                  fonteDato={def.fonteDato}
                  effettoLimiti={def.effettoLimiti}
                  erroriFrequenti={def.erroriFrequenti}
                  tipoDato={isPerformanceField ? 'suggerito' : def.tipoDato}
                  livelloAttenzione={def.livelloAttenzione}
                />
              );
            }
            return null;
          })}
        </Card>
        );
      })}

      {(() => {
        const eqDefinitions = getEqFieldDefinitions();
        const posDef = eqDefinitions.find(d => d.key === 'st_art16c2_retribuzionePosizione');
        const risDef = eqDefinitions.find(d => d.key === 'va_art16c3_retribuzioneRisultato');

        return (
          <Card title="Utilizzi Risorse Elevate Qualificazioni (EQ): Riparto Posizione e Risultato" className="mb-6 mt-8" isCollapsible={true}>
            <div className="mb-4 text-sm text-gray-600">Inserire come vengono distribuite le risorse delle EQ tra Posizione e Risultato.</div>

            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Retribuzione di Posizione</h3>
            <SimpleFundingItem<FondoElevateQualificazioniData> 
              id="st_art16c2_retribuzionePosizione" 
              description={posDef?.description || ''} 
              riferimentoNormativo={posDef?.riferimento} 
              value={fondoElevateQualificazioniData?.st_art16c2_retribuzionePosizione} 
              onChange={(field, val) => handleEqChange(field, val)} 
              disabled={isClosed}
              titoloGuida={posDef?.titoloGuida}
              descrizioneFunzionale={posDef?.descrizioneFunzionale}
              quandoSiUsa={posDef?.quandoSiUsa}
              fonteDato={posDef?.fonteDato}
              effettoLimiti={posDef?.effettoLimiti}
              tipoDato={posDef?.tipoDato}
            />

            <h3 className="font-semibold text-gray-800 mb-2 mt-6">Retribuzione di Risultato (Minimo 15%)</h3>
            <SimpleFundingItem<FondoElevateQualificazioniData> 
              id="va_art16c3_retribuzioneRisultato" 
              description={risDef?.description || ''} 
              riferimentoNormativo={risDef?.riferimento} 
              value={fondoElevateQualificazioniData?.va_art16c3_retribuzioneRisultato} 
              onChange={(field, val) => handleEqChange(field, val)} 
              disabled={isClosed}
              titoloGuida={risDef?.titoloGuida}
              descrizioneFunzionale={risDef?.descrizioneFunzionale}
              quandoSiUsa={risDef?.quandoSiUsa}
              fonteDato={risDef?.fonteDato}
              effettoLimiti={risDef?.effettoLimiti}
              tipoDato={risDef?.tipoDato}
            />
          </Card>
        );
      })()}


      <div className="mt-10 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          disabled={isClosed}
          onClick={async () => {
            if (isClosed) return;
            const res = await saveState();
            if (res && !res.success) {
              alert(res.error || 'Errore durante il salvataggio.');
              return;
            }
            alert('Distribuzione salvata correttamente nel database.');
          }}
        >
          {isClosed ? 'Annualità Chiusa' : 'Salva Distribuzione'}
        </Button>
      </div>
    </div>
  );
};
