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

type RisorsaVariabileKey = {
  [K in keyof DistribuzioneRisorseData]: DistribuzioneRisorseData[K] extends RisorsaVariabileDetail | undefined ? K : never
}[keyof DistribuzioneRisorseData];

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
}> = ({ id, description, value, onChange, riferimentoNormativo, disabled, inputInfo, showABilancio = true, showPercentage = false, budgetBaseForPercentage = 0, disableSavingsAndBudgetFields = false }) => {

  const handleInputChange = (subField: keyof RisorsaVariabileDetail) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onChange(id, subField, val);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
    if (percValue === undefined || isNaN(percValue) || budgetBaseForPercentage <= 0) {
      onChange(id, 'stanziate', undefined);
      return;
    }
    const newStanziate = (percValue / 100) * budgetBaseForPercentage;
    const roundedStanziate = Math.round((newStanziate + Number.EPSILON) * 100) / 100;
    onChange(id, 'stanziate', roundedStanziate);
  };

  const percentage = (value?.stanziate && budgetBaseForPercentage && budgetBaseForPercentage > 0)
    ? (value.stanziate / budgetBaseForPercentage) * 100
    : 0;

  const gridColsClass = showPercentage ? (showABilancio ? 'grid-cols-4' : 'grid-cols-3') : (showABilancio ? 'grid-cols-3' : 'grid-cols-2');
  const descriptionColSpan = showPercentage ? 'md:col-span-4' : 'md:col-span-5';
  const inputsColSpan = showPercentage ? 'md:col-span-8' : 'md:col-span-7';

  return (
    <div className={`py - 4 border - b border - [#f3e7e8] last: border - b - 0 transition - colors hover: bg - [#fcf8f8] ${disabled ? 'opacity-60 bg-gray-50' : ''} `}>
      <div className="grid grid-cols-12 gap-x-4 gap-y-2 items-start">
        <div className={`col - span - 12 ${descriptionColSpan} flex flex - col justify - center h - full`}>
          <p className={`block text - sm text - [#1b0e0e] ${disabled ? 'cursor-not-allowed' : ''} `}>
            {description}
          </p>
          {riferimentoNormativo && <p className="text-xs text-[#5f5252] mt-0.5">{riferimentoNormativo}</p>}
        </div>
        <div className={`col - span - 12 ${inputsColSpan} grid ${gridColsClass} gap - x - 2`}>
          <Input
            label="Stanziate"
            type="number"
            id={`${String(id)} _stanziate`}
            value={value?.stanziate ?? ''}
            onChange={handleInputChange('stanziate')}
            disabled={disabled}
            placeholder="0.00"
            step="0.01"
            containerClassName="mb-0"
            inputClassName="text-right h-10 p-2"
            labelClassName="text-xs"
          />
          {showPercentage && (
            <Input
              label="%"
              type="number"
              id={`${String(id)} _percentage`}
              value={percentage === 0 ? '' : percentage.toFixed(2)}
              onChange={handlePercentageChange}
              disabled={disabled || budgetBaseForPercentage <= 0}
              placeholder="0.00"
              step="0.01"
              min="0"
              containerClassName="mb-0"
              inputClassName="text-right h-10 p-2"
              labelClassName="text-xs"
              inputInfo={disabled || budgetBaseForPercentage <= 0 ? "Budget non definito" : undefined}
            />
          )}
          <Input
            label="Risparmi"
            type="number"
            id={`${String(id)} _risparmi`}
            value={value?.risparmi ?? ''}
            onChange={handleInputChange('risparmi')}
            disabled={disabled || disableSavingsAndBudgetFields}
            placeholder="0.00"
            step="0.01"
            containerClassName="mb-0"
            inputClassName="text-right h-10 p-2"
            labelClassName="text-xs"
          />
          {showABilancio && (
            <Input
              label="A Bilancio"
              type="number"
              id={`${String(id)} _aBilancio`}
              value={value?.aBilancio ?? ''}
              onChange={handleInputChange('aBilancio')}
              disabled={disabled || disableSavingsAndBudgetFields}
              placeholder="0.00"
              step="0.01"
              containerClassName="mb-0"
              inputClassName="text-right h-10 p-2"
              labelClassName="text-xs"
            />
          )}
        </div>
      </div>
      {inputInfo && <div className="text-xs text-[#5f5252] mt-1 pl-2">{inputInfo}</div>}
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
    className={`grid grid-cols-12 gap-x-4 gap-y-2 py-4 border-b border-[#f3e7e8] last:border-b-0 items-start transition-colors hover:bg-[#fcf8f8] ${disabled ? 'opacity-60 bg-gray-50' : ''
      }`}
  >
    <div className="col-span-12 md:col-span-8 flex flex-col justify-center h-full">
      <label
        htmlFor={id as string}
        className={`block text-sm text-[#1b0e0e] ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        {description}
      </label>
      {riferimentoNormativo && <p className="text-xs text-[#5f5252] mt-0.5">{riferimentoNormativo}</p>}
    </div>
    <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-x-2">
      <div className="col-span-1"></div> {/* Spacer for aligning with VariableFundingItem */}
      <div className="col-span-1">
        <Input
          type="number"
          id={id as string}
          value={value ?? ''}
          onChange={(e) => onChange(id, e.target.value === '' ? undefined : parseFloat(e.target.value))}
          label="Valore"
          labelClassName="text-xs"
          step="0.01"
          inputClassName={`text-right w-full h-10 p-2 ${disabled ? 'bg-white' : 'bg-[#fcf8f8]'}`}
          containerClassName="mb-0"
          disabled={disabled}
        />
        {inputInfo && <div className="text-xs text-[#5f5252] mt-1">{inputInfo}</div>}
      </div>
    </div>
  </div>
);

export const DistribuzioneRisorsePage: React.FC = () => {
  const { state, dispatch, saveState } = useAppContext();
  // FIX: Get normativeData from the useNormativeData hook instead of state.
  const { data: normativeData } = useNormativeData();
  const { fundData, calculatedFund } = state;
  const { dettagli: employees } = state.personaleServizio;
  const [isMaggiorazioneUserEdited, setIsMaggiorazioneUserEdited] = useState(false);
  const [isOrganizzativaUserEdited, setIsOrganizzativaUserEdited] = useState(false);
  const [isIndividualeUserEdited, setIsIndividualeUserEdited] = useState(false);


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

  const {
    distribuzioneRisorseData,
    fondoAccessorioDipendenteData,
    annualData,
    fondoElevateQualificazioniData,
  } = fundData;

  const {
    simulatoreRisultati,
    isEnteDissestato,
    isEnteStrutturalmenteDeficitario,
    isEnteRiequilibrioFinanziario,
  } = annualData;

  const isEnteInCondizioniSpeciali = !!isEnteDissestato || !!isEnteStrutturalmenteDeficitario || !!isEnteRiequilibrioFinanziario;
  const incrementoEQconRiduzioneDipendenti = fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti;

  const fadTotals = useMemo(() => calculateFadTotals(
    fondoAccessorioDipendenteData,
    simulatoreRisultati,
    isEnteInCondizioniSpeciali,
    incrementoEQconRiduzioneDipendenti,
    normativeData
  ), [fondoAccessorioDipendenteData, simulatoreRisultati, isEnteInCondizioniSpeciali, incrementoEQconRiduzioneDipendenti, normativeData]);

  const totaleDaDistribuire = fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti;


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

  const importoRimanente = totaleDaDistribuire - totaleAllocato;

  const importoDisponibileContrattazione = useMemo(() => {
    return totaleDaDistribuire - utilizziParteStabile;
  }, [totaleDaDistribuire, utilizziParteStabile]);

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

  useEffect(() => {
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
    distribuzioneRisorseData.criteri_percPerfIndividuale,
    distribuzioneRisorseData.p_performanceIndividuale,
    distribuzioneRisorseData.p_performanceOrganizzativa,
    distribuzioneRisorseData.p_maggiorazionePerformanceIndividuale,
    isIndividualeUserEdited,
    isOrganizzativaUserEdited,
    dispatch
  ]);

  const distribuzioneFieldDefinitions = useMemo(() => getDistribuzioneFieldDefinitions(normativeData), [normativeData]);

  const sections = useMemo(() =>
    distribuzioneFieldDefinitions.reduce((acc, field) => {
      (acc as any)[field.section] = (acc as any)[field.section] || [];
      (acc as any)[field.section].push(field);
      return acc;
    }, {} as Record<string, typeof distribuzioneFieldDefinitions>)
    , [distribuzioneFieldDefinitions]);

  const numeroDipendenti = employees?.length || 0;
  const percDipendentiBonus = distribuzioneRisorseData.criteri_percDipendentiBonus || 0;
  const numDipendentiBonus = Math.ceil(numeroDipendenti * (percDipendentiBonus / 100));

  const maggiorazioneProCapite = useMemo(() => {
    const percInd = distribuzioneRisorseData.criteri_percPerfIndividuale || 0;
    const percMagg = distribuzioneRisorseData.criteri_percMaggiorazionePremio || 0;

    if (numeroDipendenti === 0) return 0;

    const budgetIndividualeTeorico = importoDisponibileContrattazione * (percInd / 100);
    const premioMedioTeorico = budgetIndividualeTeorico / numeroDipendenti;
    return premioMedioTeorico * (percMagg / 100);

  }, [importoDisponibileContrattazione, distribuzioneRisorseData.criteri_percPerfIndividuale, distribuzioneRisorseData.criteri_percMaggiorazionePremio, numeroDipendenti]);

  useEffect(() => {
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
  }, [maggiorazioneProCapite, numDipendentiBonus, isMaggiorazioneUserEdited, dispatch, distribuzioneRisorseData.p_maggiorazionePerformanceIndividuale]);

  const { criteri_isConsuntivoMode } = distribuzioneRisorseData;
  const isPreventivoMode = !criteri_isConsuntivoMode;

  useEffect(() => {
    if (criteri_isConsuntivoMode === false) {
      const allVariableFields = distribuzioneFieldDefinitions
        .filter(def => {
          const val = (distribuzioneRisorseData as any)[def.key];
          return typeof val === 'object' && val !== null;
        })
        .map(def => def.key) as RisorsaVariabileKey[];

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


  return (
    <div className="space-y-8 pb-24">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Distribuzione delle Risorse del Fondo</h2>

      <Card title="Riepilogo Risorse e Allocazione" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#fcf8f8] rounded-lg text-center">
            <h4 className="text-sm font-medium text-[#5f5252]">Totale da Distribuire</h4>
            <p className="text-2xl font-bold text-[#1b0e0e]">{formatCurrency(totaleDaDistribuire)}</p>
            <p className="text-xs text-[#5f5252] mt-1">(Dal Fondo Personale Dipendente)</p>
          </div>
          <div className="p-4 bg-sky-50 rounded-lg text-center border border-sky-200">
            <h4 className="text-sm font-medium text-sky-800">Importo disponibile alla contrattazione</h4>
            <p className="text-2xl font-bold text-sky-700">{formatCurrency(importoDisponibileContrattazione)}</p>
            <p className="text-xs text-sky-600 mt-1">(Totale da Distribuire - Utilizzi Parte Stabile)</p>
          </div>
          <div className="p-4 bg-[#fcf8f8] rounded-lg text-center">
            <h4 className="text-sm font-medium text-[#5f5252]">Totale Allocato</h4>
            <p className={`text - 2xl font - bold ${importoRimanente < 0 ? 'text-[#c02128]' : 'text-green-600'} `}>
              {formatCurrency(totaleAllocato)}
            </p>
            <p className="text-xs text-[#5f5252] mt-1">(Somma di tutti gli utilizzi)</p>
          </div>
          <div className={`p - 4 rounded - lg text - center transition - colors ${importoRimanente < 0 ? 'bg-[#fef2f2]' : 'bg-[#f0fdf4]'} `}>
            <h4 className="text-sm font-medium text-[#5f5252]">Importo Rimanente</h4>
            <p className={`text - 2xl font - bold ${importoRimanente < 0 ? 'text-[#c02128]' : 'text-green-700'} `}>
              {formatCurrency(importoRimanente)}
            </p>
            <p className="text-xs text-[#5f5252] mt-1">(Totale da Distribuire - Totale Allocato)</p>
          </div>
        </div>
        {importoRimanente < -0.005 && (
          <p className="text-center text-sm text-red-600 font-semibold mt-3 p-2 bg-red-50 rounded-md">
            Attenzione: l'importo allocato supera le risorse disponibili.
          </p>
        )}
      </Card>

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
            value={distribuzioneRisorseData.criteri_percMaggiorazionePremio ?? ''}
            onChange={(e) => {
              setIsMaggiorazioneUserEdited(false);
              handleChange('criteri_percMaggiorazionePremio', e.target.value === '' ? undefined : parseFloat(e.target.value));
            }}
            min="0"
            max="100"
            step="1"
            inputInfo="Il valore non può essere inferiore al 30% del valore medio pro capite."
            warning={(distribuzioneRisorseData.criteri_percMaggiorazionePremio ?? 0) < 30 ? "Valore inferiore al minimo contrattuale del 30%." : undefined}
          />
          <Input
            label="% Dipendenti con Bonus Maggiorazione"
            type="number"
            id="criteri_percDipendentiBonus"
            value={distribuzioneRisorseData.criteri_percDipendentiBonus ?? ''}
            onChange={(e) => {
              setIsMaggiorazioneUserEdited(false);
              handleChange('criteri_percDipendentiBonus', e.target.value === '' ? undefined : parseFloat(e.target.value));
            }}
            min="0" max="100" step="1"
            inputInfo={`${numDipendentiBonus} su ${numeroDipendenti} dipendenti`}
          />
          <div className="md:col-span-2 mt-2">
            <DisplayField
              label="Maggiorazione pro-capite premio individuale (calcolato)"
              value={formatCurrency(maggiorazioneProCapite)}
              info="((Disponibile contrattazione * % Perf. Ind.) / N° Dipendenti) * % Maggiorazione"
            />
          </div>
        </div>
      </Card>

      {Object.entries(sections).map(([sectionName, fields]) => (
        <Card key={sectionName} title={sectionName} isCollapsible defaultCollapsed={sectionName.startsWith('Utilizzi Parte Variabile')}>
          {(fields as any[]).map((def: any) => {
            const isAutoCalculated = def.key === 'u_diffProgressioniStoriche' || def.key === 'u_indennitaComparto';
            const value = (distribuzioneRisorseData as any)[def.key];

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
              return (
                <VariableFundingItem
                  key={String(def.key)}
                  id={def.key}
                  description={def.description}
                  value={value as RisorsaVariabileDetail | undefined}
                  onChange={handleVariableChange}
                  riferimentoNormativo={def.riferimento}
                  showPercentage={def.key === 'p_performanceIndividuale' || def.key === 'p_performanceOrganizzativa'}
                  budgetBaseForPercentage={Math.max(0, importoDisponibileContrattazione - otherVariableUtilizations - (distribuzioneRisorseData.p_maggiorazionePerformanceIndividuale?.stanziate || 0))}
                  disableSavingsAndBudgetFields={isPreventivoMode}
                />
              );
            }
            return null;
          })}
        </Card>
      ))}

      <Card title="Utilizzi Risorse Elevate Qualificazioni (EQ): Riparto Posizione e Risultato" className="mb-6 mt-8" isCollapsible={true}>
        <div className="mb-4 text-sm text-gray-600">Inserire come vengono distribuite le risorse delle EQ tra Posizione, Interim e Risultato.</div>

        <h3 className="font-semibold text-gray-800 mb-2 mt-4">Retribuzione di Posizione</h3>
        <SimpleFundingItem<FondoElevateQualificazioniData> id="st_art17c2_retribuzionePosizione" description="Retribuzione di Posizione (Ordinaria, soggetta a limite)" riferimentoNormativo="CCNL 2022-2024" value={fondoElevateQualificazioniData?.st_art17c2_retribuzionePosizione} onChange={(field, val) => handleEqChange(field, val)} />
        <SimpleFundingItem<FondoElevateQualificazioniData> id="u_art17_posizioneOrdinaria_finanziata022MS" description="Quota di Posizione Finanziata con l'inquadramento 0.22% MS 2021 (Esclusa dal Limite)" riferimentoNormativo="CCNL 2022-2024" value={fondoElevateQualificazioniData?.u_art17_posizioneOrdinaria_finanziata022MS} onChange={(field, val) => handleEqChange(field, val)} />
        <SimpleFundingItem<FondoElevateQualificazioniData> id="st_art17c3_retribuzionePosizioneArt16c4" description="Incarichi Specifici" riferimentoNormativo="CCNL 2022-2024" value={fondoElevateQualificazioniData?.st_art17c3_retribuzionePosizioneArt16c4} onChange={(field, val) => handleEqChange(field, val)} />
        <SimpleFundingItem<FondoElevateQualificazioniData> id="st_art23c5_maggiorazioneSedi" description="Maggiorazione Sedi Convenzionate" riferimentoNormativo="CCNL 2022-2024" value={fondoElevateQualificazioniData?.st_art23c5_maggiorazioneSedi} onChange={(field, val) => handleEqChange(field, val)} />

        <h3 className="font-semibold text-gray-800 mb-2 mt-6">Maggiorazioni Interim</h3>
        <SimpleFundingItem<FondoElevateQualificazioniData> id="st_art17c5_interimEQ" description="Interim (soggetta a limite)" riferimentoNormativo="CCNL 2022-2024" value={fondoElevateQualificazioniData?.st_art17c5_interimEQ} onChange={(field, val) => handleEqChange(field, val)} />
        <SimpleFundingItem<FondoElevateQualificazioniData> id="u_art17_interim_finanziato022MS" description="Quota Interim Finanziata con lo 0.22% MS 2021 (esclusa dal limite)" riferimentoNormativo="CCNL 2022-2024" value={fondoElevateQualificazioniData?.u_art17_interim_finanziato022MS} onChange={(field, val) => handleEqChange(field, val)} />

        <h3 className="font-semibold text-gray-800 mb-2 mt-6">Retribuzione di Risultato (Minimo 15%)</h3>
        <SimpleFundingItem<FondoElevateQualificazioniData> id="va_art17c4_retribuzioneRisultato" description="Risultato (soggetta a limite)" riferimentoNormativo="CCNL 2022-2024" value={fondoElevateQualificazioniData?.va_art17c4_retribuzioneRisultato} onChange={(field, val) => handleEqChange(field, val)} />
        <SimpleFundingItem<FondoElevateQualificazioniData> id="u_art17_risultatoOrdinario_finanziato022MS" description="Quota Risultato Finanziata con lo 0.22% MS 2021 (esclusa dal limite)" riferimentoNormativo="CCNL 2022-2024" value={fondoElevateQualificazioniData?.u_art17_risultatoOrdinario_finanziato022MS} onChange={(field, val) => handleEqChange(field, val)} />
      </Card>

      <div className="mt-10 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={saveState}
        >
          Salva Distribuzione
        </Button>
      </div>
    </div>
  );
};