// pages/DistribuzioneRisorsePage.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Card } from '../components/shared/Card.tsx';
import { DistribuzioneRisorseData, RisorsaVariabileDetail, FondoElevateQualificazioniData } from '../types.ts';
import { Button } from '../components/shared/Button.tsx';
import { Input } from '../components/shared/Input.tsx';
import { Checkbox } from '../components/shared/Checkbox.tsx';
import { calculateFadTotals } from '../logic/fundCalculations.ts';
// FIX: import getDistribuzioneFieldDefinitions function from the correct helper file
import { getDistribuzioneFieldDefinitions } from './FondoAccessorioDipendentePageHelpers.ts';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { formatCurrency } from '../utils/formatters.ts';

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
  inputInfo?: string | React.ReactNode;
  showABilancio?: boolean;
  showPercentage?: boolean;
  budgetBaseForPercentage?: number;
  disableSavingsAndBudgetFields?: boolean;
  otherItemsSum?: number;
  fallbackBase?: number;
}> = ({ id, description, value, onChange, riferimentoNormativo, disabled, inputInfo, showABilancio = true, showPercentage = false, budgetBaseForPercentage = 0, disableSavingsAndBudgetFields = false, otherItemsSum, fallbackBase }) => {

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
          </p>
          {riferimentoNormativo && <p className="text-[11px] text-[#718096] mt-1 pl-2">{riferimentoNormativo}</p>}
        </div>
        <div className={`col-span-12 ${inputsColSpan} grid ${gridColsClass} gap-x-3`}>
          <Input
            label="Stanziate"
            type="number"
            id={`${String(id)}_stanziate`}
            value={value?.stanziate ?? ''}
            onChange={handleInputChange('stanziate')}
            disabled={disabled}
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
              disabled={disabled || budgetBaseForPercentage <= 0}
              placeholder="0.00"
              step="0.01"
              min="0"
              containerClassName="mb-0"
              inputClassName="text-right h-10 p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 border-gray-200"
              labelClassName="text-[11px] text-gray-500 tracking-wide uppercase font-semibold mb-1"
              inputInfo={disabled || budgetBaseForPercentage <= 0 ? "Budget non definito" : undefined}
            />
          )}
          <Input
            label="Risparmi"
            type="number"
            id={`${String(id)}_risparmi`}
            value={value?.risparmi ?? ''}
            onChange={handleInputChange('risparmi')}
            disabled={disabled || disableSavingsAndBudgetFields}
            placeholder="0.00"
            step="0.01"
            containerClassName="mb-0"
            inputClassName="text-right h-10 p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 border-gray-200"
            labelClassName="text-[11px] text-gray-500 tracking-wide uppercase font-semibold mb-1"
          />
          {showABilancio && (
            <Input
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
}: {
  id: keyof T;
  description: string | React.ReactNode;
  value?: number;
  onChange: (field: keyof T, value?: number) => void;
  riferimentoNormativo?: string;
  disabled?: boolean;
  inputInfo?: string | React.ReactNode;
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
  const { fundData, calculatedFund } = state;
  const { dettagli: employees } = state.fundData.personaleServizio;
  const [isMaggiorazioneUserEdited, setIsMaggiorazioneUserEdited] = useState(false);
  const [isOrganizzativaUserEdited, setIsOrganizzativaUserEdited] = useState(false);
  const [isIndividualeUserEdited, setIsIndividualeUserEdited] = useState(false);

  const {
    distribuzioneRisorseData,
    fondoAccessorioDipendenteData,
    annualData,
    fondoElevateQualificazioniData,
  } = fundData || {
    distribuzioneRisorseData: {},
    fondoAccessorioDipendenteData: {},
    annualData: { personaleServizioAttuale: [] },
    fondoElevateQualificazioniData: {}
  };

  const {
    simulatoreRisultati,
    isEnteDissestato,
    isEnteStrutturalmenteDeficitario,
    isEnteRiequilibrioFinanziario,
  } = annualData || {};

  const isEnteInCondizioniSpeciali = !!isEnteDissestato || !!isEnteStrutturalmenteDeficitario || !!isEnteRiequilibrioFinanziario;
  const incrementoEQconRiduzioneDipendenti = fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti;

  const fadTotals = useMemo(() => {
    if (!normativeData || !fondoAccessorioDipendenteData) return { totaleRisorseDisponibiliContrattazione_Dipendenti: 0 } as any;
    return calculateFadTotals(
      fondoAccessorioDipendenteData,
      simulatoreRisultati,
      isEnteInCondizioniSpeciali,
      incrementoEQconRiduzioneDipendenti,
      normativeData
    );
  }, [fondoAccessorioDipendenteData, simulatoreRisultati, isEnteInCondizioniSpeciali, incrementoEQconRiduzioneDipendenti, normativeData]);

  const totaleDaDistribuire = fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti || 0;

  const handleChange = (field: keyof DistribuzioneRisorseData, value?: number | boolean) => {
    dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: { [field]: value } });
  };

  const handleEqChange = (field: keyof FondoElevateQualificazioniData, value?: number) => {
    dispatch({ type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA', payload: { [field]: value } });
  };

  const handleVariableChange = (
    field: keyof DistribuzioneRisorseData,
    subField: keyof RisorsaVariabileDetail,
    value?: number
  ) => {
    if (field === 'p_maggiorazionePerformanceIndividuale' && subField === 'stanziate') {
      setIsMaggiorazioneUserEdited(true);
    }
    if (field === 'p_performanceOrganizzativa' && subField === 'stanziate') {
      setIsOrganizzativaUserEdited(true);
    }
    if (field === 'p_performanceIndividuale' && subField === 'stanziate') {
      setIsIndividualeUserEdited(true);
    }
    const currentItem = (distribuzioneRisorseData as any)[field] as RisorsaVariabileDetail | undefined;
    const newItem = {
      ...(currentItem || {}),
      [subField]: value
    };
    dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: { [field]: newItem } });
  };

  const handlePerfPercChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercStr = e.target.value;
    const newPerc = newPercStr === '' ? undefined : parseFloat(newPercStr);

    // Unlock automatic calculation when user changes the percentage
    setIsIndividualeUserEdited(false);
    setIsOrganizzativaUserEdited(false);

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

  const importoDisponibileContrattazione = useMemo(() => {
    return totaleDaDistribuire - utilizziParteStabile;
  }, [totaleDaDistribuire, utilizziParteStabile]);

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

  const numeroDipendenti = annualData?.ccnl2024?.personaleInServizio01012026 ?? employees?.length ?? 0;
  const isArt48Applicable = numeroDipendenti > 5;

  const percDipendentiBonus = distribuzioneRisorseData?.criteri_percDipendentiBonus || 0;
  const numDipendentiBonus = Math.ceil(numeroDipendenti * (percDipendentiBonus / 100));

  const minMaggiorazione = useMemo(() => {
    if (!isArt48Applicable) return 0;
    if (distribuzioneRisorseData?.art48_applicaObiettiviEnte) return 20;
    if (numeroDipendenti <= 10) return 25;
    return 30;
  }, [isArt48Applicable, distribuzioneRisorseData?.art48_applicaObiettiviEnte, numeroDipendenti]);

  const maggiorazioneProCapite = useMemo(() => {
    const percInd = distribuzioneRisorseData?.criteri_percPerfIndividuale || 0;
    const percMagg = distribuzioneRisorseData?.criteri_percMaggiorazionePremio || 0;

    if (numeroDipendenti === 0 || !isArt48Applicable) return 0;

    const budgetIndividualeTeorico = importoDisponibileContrattazione * (percInd / 100);
    const premioMedioTeorico = budgetIndividualeTeorico / numeroDipendenti;
    return premioMedioTeorico * (percMagg / 100);

  }, [importoDisponibileContrattazione, distribuzioneRisorseData?.criteri_percPerfIndividuale, distribuzioneRisorseData?.criteri_percMaggiorazionePremio, numeroDipendenti, isArt48Applicable]);

  useEffect(() => {
    if (!distribuzioneRisorseData) return;
    const data = distribuzioneRisorseData;
    const budgetDisponibilePerformance = Math.max(0, importoDisponibileContrattazione - otherVariableUtilizations);

    const percIndividuale = data.criteri_percPerfIndividuale ?? 0;
    const percOrganizzativa = 100 - percIndividuale;

    const updates: Partial<DistribuzioneRisorseData> = {};

    const budgetEffettivoPerformance = budgetDisponibilePerformance - (data.p_maggiorazionePerformanceIndividuale?.stanziate || 0);

    if (!isIndividualeUserEdited) {
      const calculatedIndividuale = budgetEffettivoPerformance * (percIndividuale / 100);
      const roundedIndividuale = Math.round((calculatedIndividuale + Number.EPSILON) * 100) / 100;
      const currentIndividuale = data.p_performanceIndividuale?.stanziate;

      if (currentIndividuale !== roundedIndividuale && isFinite(roundedIndividuale)) {
        updates.p_performanceIndividuale = { ...(data.p_performanceIndividuale || {}), stanziate: roundedIndividuale };
      }
    }

    if (!isOrganizzativaUserEdited) {
      const calculatedOrganizzativa = budgetEffettivoPerformance * (percOrganizzativa / 100);
      const roundedOrganizzativa = Math.round((calculatedOrganizzativa + Number.EPSILON) * 100) / 100;
      const currentOrganizzativa = data.p_performanceOrganizzativa?.stanziate;

      if (currentOrganizzativa !== roundedOrganizzativa && isFinite(roundedOrganizzativa)) {
        updates.p_performanceOrganizzativa = { ...(data.p_performanceOrganizzativa || {}), stanziate: roundedOrganizzativa };
      }
    }

    if (Object.keys(updates).length > 0) {
      dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: updates });
    }
  }, [
    importoDisponibileContrattazione,
    otherVariableUtilizations,
    distribuzioneRisorseData?.criteri_percPerfIndividuale,
    distribuzioneRisorseData?.p_performanceIndividuale,
    distribuzioneRisorseData?.p_performanceOrganizzativa,
    distribuzioneRisorseData?.p_maggiorazionePerformanceIndividuale,
    isIndividualeUserEdited,
    isOrganizzativaUserEdited,
    dispatch
  ]);

  useEffect(() => {
    if (!distribuzioneRisorseData) return;
    const calculatedValue = maggiorazioneProCapite * numDipendentiBonus;
    if (isFinite(calculatedValue)) {
      const roundedValue = Math.round((calculatedValue + Number.EPSILON) * 100) / 100;

      if (!isMaggiorazioneUserEdited) {
        const currentValue = distribuzioneRisorseData.p_maggiorazionePerformanceIndividuale?.stanziate;
        if (currentValue !== roundedValue) {
          const currentItem = distribuzioneRisorseData.p_maggiorazionePerformanceIndividuale;
          const newItem = {
            ...(currentItem || {}),
            stanziate: roundedValue
          };
          dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: { p_maggiorazionePerformanceIndividuale: newItem } });
        }
      }
    }
  }, [maggiorazioneProCapite, numDipendentiBonus, isMaggiorazioneUserEdited, dispatch, distribuzioneRisorseData?.p_maggiorazionePerformanceIndividuale]);

  const criteri_isConsuntivoMode = distribuzioneRisorseData?.criteri_isConsuntivoMode;
  const isPreventivoMode = !criteri_isConsuntivoMode;

  useEffect(() => {
    if (!distribuzioneRisorseData) return;
    if (criteri_isConsuntivoMode === false) {
      const allVariableFields = distribuzioneFieldDefinitions
        .filter(def => {
          const val = (distribuzioneRisorseData as any)[def.key];
          return typeof val === 'object' && val !== null;
        })
        .map(def => def.key) as (keyof DistribuzioneRisorseData)[];

      const updates: Partial<DistribuzioneRisorseData> = {};
      let needsUpdate = false;

      allVariableFields.forEach((key: any) => {
        const currentItem = (distribuzioneRisorseData as any)[key];
        if (currentItem && (currentItem.risparmi !== undefined || currentItem.aBilancio !== undefined)) {
          (updates as any)[key] = {
            ...currentItem,
            risparmi: undefined,
            aBilancio: undefined,
          };
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        dispatch({ type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: updates });
      }
    }
  }, [criteri_isConsuntivoMode, dispatch, distribuzioneRisorseData, distribuzioneFieldDefinitions]);


  if (!calculatedFund || !calculatedFund.dettaglioFondi || !normativeData) {
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
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dataEntry' })}
          >
            Vai a Dati Costituzione Fondo
          </Button>
        </Card>
      </div>
    );
  }

  const importoRimanente = Math.round((totaleDaDistribuire - totaleAllocato) * 100) / 100;




  return (
    <div className="space-y-8 pb-24">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Distribuzione delle Risorse del Fondo</h2>

      {/* Sticky KPI Dashboard */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm mb-8">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Totale da Distribuire */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Totale da Distribuire</span>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(totaleDaDistribuire)}</span>
              <span className="text-[10px] text-gray-400 mt-auto pt-2">Dal Fondo Personale</span>
            </div>

            {/* Disponibile Contrattazione */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Disponibile Contrattazione</span>
              <span className="text-2xl font-bold text-blue-900">{formatCurrency(importoDisponibileContrattazione)}</span>
              <span className="text-[10px] text-blue-500 mt-auto pt-2">Totale - Parte Stabile</span>
            </div>

            {/* Totale Allocato */}
            <div className={`rounded-xl p-4 border shadow-sm flex flex-col ${importoRimanente < 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${importoRimanente < 0 ? 'text-red-700' : 'text-gray-500'}`}>Totale Allocato</span>
              <span className={`text-2xl font-bold ${importoRimanente < 0 ? 'text-red-700' : 'text-gray-900'}`}>{formatCurrency(totaleAllocato)}</span>
              <span className={`text-[10px] mt-auto pt-2 ${importoRimanente < 0 ? 'text-red-500' : 'text-gray-400'}`}>Somma degli utilizzi</span>
            </div>

            {/* Rimanenza */}
            <div className={`rounded-xl p-4 border shadow-sm flex flex-col ${importoRimanente < 0 ? 'bg-red-500 text-white border-red-600' : importoRimanente === 0 ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-emerald-50 border-emerald-200'}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${importoRimanente <= 0 ? 'text-white/80' : 'text-emerald-700'}`}>Rimanenza</span>
              <span className={`text-2xl font-bold ${importoRimanente <= 0 ? 'text-white' : 'text-emerald-700'}`}>{formatCurrency(importoRimanente)}</span>
              <span className={`text-[10px] mt-auto pt-2 ${importoRimanente <= 0 ? 'text-white/70' : 'text-emerald-600'}`}>Margine disponibile</span>
            </div>

          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2 overflow-hidden flex">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${importoRimanente < 0 ? 'bg-red-500' : importoRimanente === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, (totaleAllocato / (totaleDaDistribuire || 1)) * 100))}%` }}
            ></div>
            {importoRimanente < 0 && (
              <div
                className="h-2.5 bg-red-300 animate-pulse"
                style={{ width: `${Math.min(100, ((Math.abs(importoRimanente)) / (totaleDaDistribuire || 1)) * 100)}%` }}
              ></div>
            )}
          </div>
          {importoRimanente < -0.005 && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium mt-1 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Attenzione: L'importo allocato supera le risorse disponibili del Fondo!
            </div>
          )}
        </div>
      </div>

      <Card title="Criteri di Distribuzione Performance" isCollapsible defaultCollapsed={false} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Checkbox
            id="isConsuntivoMode"
            label="Modalità consuntivo?"
            checked={distribuzioneRisorseData.criteri_isConsuntivoMode || false}
            onChange={(e) => handleChange('criteri_isConsuntivoMode', e.target.checked)}
            containerClassName="md:col-span-2"
          />
          <Input
            label="% Performance Individuale"
            type="number"
            id="criteri_percPerfIndividuale"
            value={distribuzioneRisorseData.criteri_percPerfIndividuale ?? ''}
            onChange={handlePerfPercChange}
            inputInfo={`% Performance Organizzativa: ${100 - (distribuzioneRisorseData.criteri_percPerfIndividuale || 0)}% `}
            min="0" max="100" step="1"
          />
          <DisplayField
            label="Budget Base Performance (calcolato)"
            value={formatCurrency(Math.max(0, importoDisponibileContrattazione - otherVariableUtilizations))}
            info="Disponibile per Contrattazione - Altri utilizzi variabili"
          />
          <Input
            label="% Maggiorazione Premio"
            type="number"
            id="criteri_percMaggiorazionePremio"
            value={!isArt48Applicable ? 0 : (distribuzioneRisorseData.criteri_percMaggiorazionePremio ?? '')}
            onChange={(e) => {
              setIsMaggiorazioneUserEdited(false);
              handleChange('criteri_percMaggiorazionePremio', e.target.value === '' ? undefined : parseFloat(e.target.value));
            }}
            min="0"
            max="100"
            step="1"
            disabled={!isArt48Applicable}
            inputInfo={!isArt48Applicable ? "Non applicabile per enti con dipendenti ≤ 5" : `Il valore non può essere inferiore al ${minMaggiorazione}% del valore medio pro capite.`}
            warning={isArt48Applicable && (distribuzioneRisorseData.criteri_percMaggiorazionePremio ?? 0) < minMaggiorazione ? `Valore inferiore al minimo contrattuale del ${minMaggiorazione}%.` : undefined}
          />
          <Input
            label="% Dipendenti con Bonus Maggiorazione"
            type="number"
            id="criteri_percDipendentiBonus"
            value={!isArt48Applicable ? 0 : (distribuzioneRisorseData.criteri_percDipendentiBonus ?? '')}
            onChange={(e) => {
              setIsMaggiorazioneUserEdited(false);
              handleChange('criteri_percDipendentiBonus', e.target.value === '' ? undefined : parseFloat(e.target.value));
            }}
            disabled={!isArt48Applicable}
            min="0" max="100" step="1"
            inputInfo={!isArt48Applicable ? "Non applicabile" : `${numDipendentiBonus} su ${numeroDipendenti} dipendenti`}
          />
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <Checkbox
              id="art48_applicaObiettiviEnte"
              label="Obiettivi di ente collegati alla performance (Art. 48 c.4)"
              checked={distribuzioneRisorseData.art48_applicaObiettiviEnte || false}
              onChange={(e) => handleChange('art48_applicaObiettiviEnte', e.target.checked)}
              disabled={!isArt48Applicable}
            />
          </div>
          <div className="md:col-span-2 mt-2">
            <DisplayField
              label="Maggiorazione pro-capite premio individuale (calcolato)"
              value={formatCurrency(maggiorazioneProCapite)}
              info={!isArt48Applicable ? "Non applicabile" : "((Disponibile contrattazione * % Perf. Ind.) / N° Dipendenti) * % Maggiorazione"}
            />
          </div>
        </div>
      </Card>

      {Object.entries(sections).map(([sectionName, fields]) => (
        <Card key={sectionName} title={sectionName} isCollapsible defaultCollapsed={sectionName.startsWith('Utilizzi Parte Variabile')}>
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
                    riferimentoNormativo={def.riferimento}
                    showABilancio={false}
                    disableSavingsAndBudgetFields={isPreventivoMode}
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
                    disabled={isAutoCalculated}
                    inputInfo={isAutoCalculated ? "Valore calcolato automaticamente dalla pagina Personale in Servizio" : undefined}
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
                  disabled={isPerformanceField}
                  budgetBaseForPercentage={budgetBaseForVariabilePercentuale}
                  otherItemsSum={otherItemsSum}
                  fallbackBase={importoDisponibileContrattazione > 0 ? importoDisponibileContrattazione : 1}
                  disableSavingsAndBudgetFields={isPreventivoMode}
                />
              );
            }
            return null;
          })}
        </Card>
      ))}

      <Card title="Utilizzi Risorse Elevate Qualificazioni (EQ): Riparto Posizione e Risultato" className="mb-6 mt-8" isCollapsible={true}>
        <div className="mb-4 text-sm text-gray-600">Inserire come vengono distribuite le risorse delle EQ tra Posizione e Risultato.</div>

        <h3 className="font-semibold text-gray-800 mb-2 mt-4">Retribuzione di Posizione</h3>
        <SimpleFundingItem<FondoElevateQualificazioniData> id="st_art16c2_retribuzionePosizione" description="Retribuzione di Posizione Art. 16 c. 2 CCNL Funzioni Locali 23.02.2026" riferimentoNormativo="CCNL Funzioni Locali 23.02.2026" value={fondoElevateQualificazioniData?.st_art16c2_retribuzionePosizione} onChange={(field, val) => handleEqChange(field, val)} />

        <h3 className="font-semibold text-gray-800 mb-2 mt-6">Retribuzione di Risultato (Minimo 15%)</h3>
        <SimpleFundingItem<FondoElevateQualificazioniData> id="va_art16c3_retribuzioneRisultato" description="Retribuzione di Risultato Art. 16 c. 3" riferimentoNormativo="CCNL Funzioni Locali 23.02.2026" value={fondoElevateQualificazioniData?.va_art16c3_retribuzioneRisultato} onChange={(field, val) => handleEqChange(field, val)} />
      </Card>


      <div className="mt-10 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={async () => {
            await saveState();
            alert('Distribuzione salvata correttamente nel database.');
          }}
        >
          Salva Distribuzione
        </Button>
      </div>
    </div>
  );
};