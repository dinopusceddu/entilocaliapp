// components/dataInput/HistoricalDataForm.tsx
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { HistoricalData } from '../../types';
import { Input } from '../shared/Input';


import { formatCurrency } from '../../utils/formatters.ts';

export const HistoricalDataForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { historicalData } = state.fundData;
  const { validationErrors } = state;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | undefined = value;

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    dispatch({ type: 'UPDATE_HISTORICAL_DATA', payload: { [name]: processedValue } as Partial<HistoricalData> });
  };

  const {
    fondoSalarioAccessorioPersonaleNonDirEQ2016,
    fondoElevateQualificazioni2016,
    fondoDirigenza2016,
    risorseSegretarioComunale2016,
  } = historicalData;

  const limiteComplessivo2016 =
    (fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (fondoElevateQualificazioni2016 || 0) +
    (fondoDirigenza2016 || 0) +
    (risorseSegretarioComunale2016 || 0) +
    (state.fundData.annualData.fondoLavoroStraordinario || 0);

  const formatCurrencyForDisplay = (value?: number) => {
    return formatCurrency(value);
  };

  return (
    <div className="space-y-6">

      {/* Section 1: 2016 Funds (The Limit) */}
      <div className="bg-white rounded-lg">
        <div className="border-b border-gray-100 pb-4 mb-4">
          <h4 className="text-lg font-bold text-gray-900">Fondi Anno 2016 (Limite Storico)</h4>
          <p className="text-sm text-gray-500">Inserire i valori certificati che costituiscono il limite Art. 23 c.2 D.Lgs. 75/2017.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label="Fondo Personale (non Dir/EQ)"
            type="number"
            id="fondoSalarioAccessorioPersonaleNonDirEQ2016"
            name="fondoSalarioAccessorioPersonaleNonDirEQ2016"
            value={historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 ?? ''}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            containerClassName="col-span-1"
            error={validationErrors['fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016']}
          />
          <Input
            label="Fondo EQ (o P.O.)"
            type="number"
            id="fondoElevateQualificazioni2016"
            name="fondoElevateQualificazioni2016"
            value={historicalData.fondoElevateQualificazioni2016 ?? ''}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            containerClassName="col-span-1"
          />
          <Input
            label="Fondo Dirigenza"
            type="number"
            id="fondoDirigenza2016"
            name="fondoDirigenza2016"
            value={historicalData.fondoDirigenza2016 ?? ''}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            containerClassName="col-span-1"
          />
          <Input
            label="Risorse Segretario"
            type="number"
            id="risorseSegretarioComunale2016"
            name="risorseSegretarioComunale2016"
            value={historicalData.risorseSegretarioComunale2016 ?? ''}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            containerClassName="col-span-1"
          />
          <Input
            label="Fondo Straordinario"
            type="number"
            id="fondoLavoroStraordinario"
            name="fondoLavoroStraordinario"
            value={state.fundData.annualData.fondoLavoroStraordinario ?? ''}
            onChange={(e) => dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { fondoLavoroStraordinario: parseFloat(e.target.value) || undefined } })}
            placeholder="0.00"
            step="0.01"
            containerClassName="col-span-1"
          />
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-gray-700 font-medium">Totale Limite 2016 Calcolato:</span>
          <span className="text-2xl font-bold text-blue-600 font-mono">
            {formatCurrencyForDisplay(limiteComplessivo2016)}
          </span>
        </div>
      </div>

      {/* Manual Override - collapsed or clearly separated */}
      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
        <label className="flex items-center gap-2 text-sm font-bold text-yellow-800 uppercase cursor-pointer mb-2">
          Override Manuale (Opzionale)
        </label>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <p className="text-xs text-yellow-700 flex-1">
            Se non hai tutti i dettagli del 2016, puoi forzare il totale qui. Questo valore sovrascriverà la somma automatica.
          </p>
          <div className="w-full md:w-auto">
            <Input
              label=""
              type="number"
              id="manualPersonalFundLimit2016"
              name="manualPersonalFundLimit2016"
              value={historicalData.manualPersonalFundLimit2016 ?? ''}
              onChange={handleChange}
              placeholder="Totale Manuale (Es. 1000000)"
              step="0.01"
              containerClassName="!mb-0 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Section 2: 2018 Data */}
      <div>
        <div className="border-b border-gray-100 pb-4 mb-4">
          <h4 className="text-lg font-bold text-gray-900">Dati Riferimento 2018</h4>
          <p className="text-sm text-gray-500"> Necessari per il calcolo dell'adeguamento del limite (Art. 33, c. 2, D.L. 34/2019 e Art. 23 c. 2 D.Lgs. 75/2017).</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Fondo Personale 2018 (non Dir/EQ)"
            type="number"
            id="fondoPersonaleNonDirEQ2018_Art23"
            name="fondoPersonaleNonDirEQ2018_Art23"
            value={historicalData.fondoPersonaleNonDirEQ2018_Art23 ?? ''}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            containerClassName="col-span-1"
            error={validationErrors['fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23']}
            inputInfo="Base per calcolo valore medio pro-capite."
          />
          <Input
            label="Fondo EQ (o P.O.) 2018"
            type="number"
            id="fondoEQ2018_Art23"
            name="fondoEQ2018_Art23"
            value={historicalData.fondoEQ2018_Art23 ?? ''}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            containerClassName="col-span-1"
          />
        </div>
      </div>

    </div>
  );
};