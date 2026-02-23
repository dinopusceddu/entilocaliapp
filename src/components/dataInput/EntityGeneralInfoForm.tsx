// components/dataInput/EntityGeneralInfoForm.tsx
import React from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { AnnualData } from '../../types.ts';
import { TipologiaEnte } from '../../enums.ts';
import { Input } from '../shared/Input.tsx';
import { Select } from '../shared/Select.tsx';
import { Card } from '../shared/Card.tsx';
import { TEXTS_UI, ALL_TIPOLOGIE_ENTE } from '../../constants.ts';
import { Checkbox } from '../shared/Checkbox.tsx';

const booleanOptions = [
  { value: 'true', label: TEXTS_UI.trueText },
  { value: 'false', label: TEXTS_UI.falseText },
];

export const EntityGeneralInfoForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { annualData } = state.fundData;
  const { validationErrors } = state;

  const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | undefined = value;

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
    } else if (['isEnteDissestato',
      'isEnteStrutturalmenteDeficitario',
      'isEnteRiequilibrioFinanziario',
      'hasDirigenza',
      'isDistributionMode'
    ].includes(name)) {
      processedValue = (e.target as HTMLInputElement).type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value === 'true' ? true : (value === 'false' ? false : undefined);
      if (value === "") processedValue = undefined;
    }

    dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { [name]: processedValue } as Partial<AnnualData> });
  };

  const handleTipologiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTipologia = e.target.value as TipologiaEnte;
    const isNumeroAbitantiRequired = newTipologia === TipologiaEnte.COMUNE || newTipologia === TipologiaEnte.PROVINCIA;

    const payload: Partial<AnnualData> = { tipologiaEnte: newTipologia };

    if (!isNumeroAbitantiRequired) {
      payload.numeroAbitanti = undefined;
    }
    if (newTipologia !== TipologiaEnte.ALTRO) {
      payload.altroTipologiaEnte = '';
    }

    dispatch({ type: 'UPDATE_ANNUAL_DATA', payload });
  };


  const isNumeroAbitantiRequired = annualData.tipologiaEnte === TipologiaEnte.COMUNE || annualData.tipologiaEnte === TipologiaEnte.PROVINCIA;
  const numeroAbitantiWarning = isNumeroAbitantiRequired && (!annualData.numeroAbitanti || annualData.numeroAbitanti <= 0)
    ? "Campo obbligatorio per il calcolo corretto del simulatore e dei limiti di spesa. La compilazione non sarà bloccata."
    : undefined;

  return (
    <div className="mb-8 space-y-6">
      {/* Hero Section per Identità Ente */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label htmlFor="denominazioneEnte" className="block text-blue-200 text-sm font-medium mb-1 uppercase tracking-wider">Denominazione Ente</label>
              <Input
                type="text"
                id="denominazioneEnte"
                name="denominazioneEnte"
                value={annualData.denominazioneEnte ?? ''}
                onChange={handleGenericChange}
                placeholder="Es. Comune di..."
                aria-required="true"
                error={validationErrors['fundData.annualData.denominazioneEnte']}
                // Custom styles for hero input
                className="bg-white/10 border-blue-400/30 text-white placeholder-blue-300/50 focus:ring-blue-400 focus:border-blue-400 text-2xl font-bold h-14 rounded-lg px-4 w-full"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <label htmlFor="annoRiferimento" className="block text-blue-200 text-sm font-medium mb-1 uppercase tracking-wider">Anno di Riferimento</label>
            <div className="flex items-center bg-white/10 rounded-lg border border-blue-400/30 p-1">
              <button
                onClick={() => dispatch({ type: 'SET_CURRENT_YEAR', payload: annualData.annoRiferimento - 1 })}
                className="p-3 hover:bg-white/20 rounded-md text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <input
                type="number"
                id="annoRiferimento"
                name="annoRiferimento"
                value={annualData.annoRiferimento}
                onChange={(e) => dispatch({ type: 'SET_CURRENT_YEAR', payload: parseInt(e.target.value) || new Date().getFullYear() })}
                className="bg-transparent border-none text-center text-white text-3xl font-bold w-full focus:ring-0 p-2"
              />
              <button
                onClick={() => dispatch({ type: 'SET_CURRENT_YEAR', payload: annualData.annoRiferimento + 1 })}
                className="p-3 hover:bg-white/20 rounded-md text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dettagli Amministrativi */}
      <Card title="Dettagli Amministrativi" className="border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
          <Select
            label="Tipologia Ente"
            id="tipologiaEnte"
            name="tipologiaEnte"
            options={ALL_TIPOLOGIE_ENTE}
            value={annualData.tipologiaEnte ?? ''}
            onChange={handleTipologiaChange}
            placeholder="Seleziona tipologia..."
            aria-required="true"
            containerClassName="mb-3"
            error={validationErrors['fundData.annualData.tipologiaEnte']}
          />
          {annualData.tipologiaEnte === TipologiaEnte.ALTRO && (
            <Input
              label="Specifica Altra Tipologia Ente"
              type="text"
              id="altroTipologiaEnte"
              name="altroTipologiaEnte"
              value={annualData.altroTipologiaEnte ?? ''}
              onChange={handleGenericChange}
              placeholder="Indicare la tipologia"
              aria-required={annualData.tipologiaEnte === TipologiaEnte.ALTRO}
              containerClassName="mb-3"
              error={validationErrors['fundData.annualData.altroTipologiaEnte']}
            />
          )}
          <Input
            key={isNumeroAbitantiRequired ? 'abitanti-required' : 'abitanti-optional'}
            label="Numero Abitanti al 31.12 Anno Precedente"
            type="number"
            id="numeroAbitanti"
            name="numeroAbitanti"
            value={annualData.numeroAbitanti ?? ''}
            onChange={handleGenericChange}
            placeholder="Es. 15000"
            step="1"
            min="0"
            aria-required={isNumeroAbitantiRequired}
            containerClassName="mb-3"
            warning={numeroAbitantiWarning}
            disabled={!isNumeroAbitantiRequired}
            inputInfo={!isNumeroAbitantiRequired ? "Campo non richiesto per questa tipologia di ente." : "Obbligatorio per Comuni e Province."}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-0">
          <Select
            label="Ente in dissesto finanziario (art. 244 TUEL)?"
            id="isEnteDissestato"
            name="isEnteDissestato"
            options={booleanOptions}
            value={annualData.isEnteDissestato === undefined ? '' : String(annualData.isEnteDissestato)}
            onChange={handleGenericChange}
            placeholder="Seleziona..."
            aria-required="true"
          />
          <Select
            label="Ente strutturalmente deficitario (art. 242 TUEL)?"
            id="isEnteStrutturalmenteDeficitario"
            name="isEnteStrutturalmenteDeficitario"
            options={booleanOptions}
            value={annualData.isEnteStrutturalmenteDeficitario === undefined ? '' : String(annualData.isEnteStrutturalmenteDeficitario)}
            onChange={handleGenericChange}
            placeholder="Seleziona..."
            aria-required="true"
          />
          <Select
            label="Ente in piano di riequilibrio finanziario pluriennale (art. 243-bis TUEL)?"
            id="isEnteRiequilibrioFinanziario"
            name="isEnteRiequilibrioFinanziario"
            options={booleanOptions}
            value={annualData.isEnteRiequilibrioFinanziario === undefined ? '' : String(annualData.isEnteRiequilibrioFinanziario)}
            onChange={handleGenericChange}
            placeholder="Seleziona..."
            aria-required="true"
          />
          <Select
            label="È un ente con personale dirigente?"
            id="hasDirigenza"
            name="hasDirigenza"
            options={booleanOptions}
            value={annualData.hasDirigenza === undefined ? '' : String(annualData.hasDirigenza)}
            onChange={handleGenericChange}
            placeholder="Seleziona..."
            aria-required="true"
            containerClassName="mb-3"
            error={validationErrors['fundData.annualData.hasDirigenza']}
          />
          <Checkbox
            id="isDistributionMode"
            name="isDistributionMode"
            label="Abilita modalità Distribuzione Risorse?"
            checked={!!annualData.isDistributionMode}
            onChange={handleGenericChange}
            containerClassName="mt-4"
          />
        </div>


      </Card>
    </div>
  );
};
