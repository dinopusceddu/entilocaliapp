// components/dataInput/AnnualDataForm.tsx
import React, { useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { AnnualData } from '../../types.ts';
import { Input } from '../shared/Input.tsx';
import { Select } from '../shared/Select.tsx';
import { Card } from '../shared/Card.tsx';


const booleanOptions = [
  { value: 'true', label: 'SI' },
  { value: 'false', label: 'NO' },
];

import { formatCurrency } from '../../utils/formatters.ts';

export const AnnualDataForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { annualData } = state.fundData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | undefined = value;

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
    }
    else if (['rispettoEquilibrioBilancioPrecedente',
      'rispettoDebitoCommercialePrecedente',
      'approvazioneRendicontoPrecedente',
    ].includes(name)) {
      processedValue = value === 'true' ? true : (value === 'false' ? false : undefined);
      if (value === "") processedValue = undefined;
    }

    dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { [name]: processedValue } as Partial<AnnualData> });
  };

  const {
    rispettoEquilibrioBilancioPrecedente,
    rispettoDebitoCommercialePrecedente,
    approvazioneRendicontoPrecedente,
    incidenzaSalarioAccessorioUltimoRendiconto,
    fondoStabile2016PNRR
  } = annualData;

  const isEquilibrioOk = rispettoEquilibrioBilancioPrecedente === true;
  const isDebitoOk = rispettoDebitoCommercialePrecedente === true;
  const isRendicontoOk = approvazioneRendicontoPrecedente === true;
  const isIncidenzaOk = incidenzaSalarioAccessorioUltimoRendiconto !== undefined && incidenzaSalarioAccessorioUltimoRendiconto <= 8;
  const allConditionsMetForPNRR3 = isEquilibrioOk && isDebitoOk && isRendicontoOk && isIncidenzaOk;

  let possibileIncrementoPNRR3 = 0;
  let messaggioIncrementoPNRR3 = "";

  if (allConditionsMetForPNRR3) {
    if (fondoStabile2016PNRR && fondoStabile2016PNRR > 0) {
      possibileIncrementoPNRR3 = fondoStabile2016PNRR * 0.05;
      messaggioIncrementoPNRR3 = "Condizioni rispettate. Calcolato 5% del Fondo Stabile 2016.";
    } else {
      messaggioIncrementoPNRR3 = "Inserisci il Fondo Stabile 2016 per calcolare l'incremento.";
      possibileIncrementoPNRR3 = 0;
    }
  } else {
    // Simplifying message logic for UI
    messaggioIncrementoPNRR3 = "Condizioni di virtuosità non soddisfatte.";
  }

  useEffect(() => {
    dispatch({ type: 'UPDATE_CALCOLATO_INCREMENTO_PNRR3', payload: possibileIncrementoPNRR3 });
  }, [possibileIncrementoPNRR3, dispatch]);


  return (
    <Card title="Incremento PNRR 3 (Art. 8, c.3 D.L. 13/2023)" className="mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Conditions */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Verifica Requisiti Virtuosità</h4>

          <Select
            label="Equilibrio di Bilancio (Anno Prec.)"
            id="rispettoEquilibrioBilancioPrecedente"
            name="rispettoEquilibrioBilancioPrecedente"
            options={booleanOptions}
            value={annualData.rispettoEquilibrioBilancioPrecedente === undefined ? '' : String(annualData.rispettoEquilibrioBilancioPrecedente)}
            onChange={handleChange}
            placeholder="Seleziona..."
            containerClassName="mb-1"
          />

          <Select
            label="Parametri Debito Commerciale (Anno Prec.)"
            id="rispettoDebitoCommercialePrecedente"
            name="rispettoDebitoCommercialePrecedente"
            options={booleanOptions}
            value={annualData.rispettoDebitoCommercialePrecedente === undefined ? '' : String(annualData.rispettoDebitoCommercialePrecedente)}
            onChange={handleChange}
            placeholder="Seleziona..."
            containerClassName="mb-1"
          />

          <Select
            label="Approvazione Rendiconto nei Termini"
            id="approvazioneRendicontoPrecedente"
            name="approvazioneRendicontoPrecedente"
            options={booleanOptions}
            value={annualData.approvazioneRendicontoPrecedente === undefined ? '' : String(annualData.approvazioneRendicontoPrecedente)}
            onChange={handleChange}
            placeholder="Seleziona..."
            containerClassName="mb-1"
          />

          <Input
            label="Incidenza Salario Accessorio (%)"
            type="number"
            id="incidenzaSalarioAccessorioUltimoRendiconto"
            name="incidenzaSalarioAccessorioUltimoRendiconto"
            value={annualData.incidenzaSalarioAccessorioUltimoRendiconto ?? ''}
            onChange={handleChange}
            placeholder="Es. 7.5"
            step="0.01"
            max="100"
            containerClassName="mb-1"
            inputInfo="Deve essere <= 8%"
          />
        </div>

        {/* Right Column: Calculation Result */}
        <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Calcolo Incremento</h4>
            <Input
              label="Fondo Stabile 2016 Base PNRR (€)"
              type="number"
              id="fondoStabile2016PNRR"
              name="fondoStabile2016PNRR"
              value={annualData.fondoStabile2016PNRR ?? ''}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              containerClassName="mb-4 bg-white"
            />
          </div>

          <div className={`mt-4 p-4 rounded border ${allConditionsMetForPNRR3 ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Incremento Variabile PNRR Possibile</label>
            <div className={`text-2xl font-bold ${allConditionsMetForPNRR3 && possibileIncrementoPNRR3 > 0 ? 'text-green-700' : 'text-gray-400'}`}>
              {formatCurrency(possibileIncrementoPNRR3)}
            </div>
            <p className={`text-xs mt-2 ${allConditionsMetForPNRR3 ? 'text-green-800' : 'text-gray-500'}`}>
              {messaggioIncrementoPNRR3}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
