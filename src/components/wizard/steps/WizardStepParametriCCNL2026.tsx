import React, { useMemo } from 'react';
import { FundData } from '../../../domain/types';
import { Input } from '../../shared/Input';
import { formatCurrency } from '../../../utils/formatters';
import { calculateCcnl2024Increases } from '../../../logic/ccnl2024Calculations';
import { Info, Calculator, AlertCircle } from 'lucide-react';

interface WizardStepParametriCCNL2026Props {
  data: FundData;
  onChange: (updates: Partial<FundData>) => void;
}

export const WizardStepParametriCCNL2026: React.FC<WizardStepParametriCCNL2026Props> = ({ 
  data, 
  onChange
}) => {
  const handleCcnlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let val: any = value;
    if (type === 'number') val = value === '' ? undefined : parseFloat(value);
    if (type === 'checkbox') val = checked;

    onChange({
      annualData: {
        ...data.annualData,
        ccnl2024: {
          ...(data.annualData.ccnl2024 || {}),
          [name]: val
        }
      }
    });
  };

  const ccnlResults = useMemo(() => {
    return calculateCcnl2024Increases(data.annualData.ccnl2024 || {});
  }, [data.annualData.ccnl2024]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="text-purple-600 shrink-0" size={20} />
          <div className="text-sm text-purple-800">
            <p className="font-bold mb-1">CCNL 23.02.2026: Incrementi e Conglobamento</p>
            <p>
              Questo step gestisce gli incrementi variabili opzionali (0,22%) e la riduzione stabile del fondo dovuta al conglobamento di una parte dell'indennità di comparto (Art. 60).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Incrementi Opzionali (0,22%)</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Incremento Variabile Permanente (%)"
                type="number"
                name="optionalIncreaseVariableFrom2026Percentage"
                value={data.annualData.ccnl2024?.optionalIncreaseVariableFrom2026Percentage ?? ''}
                onChange={handleCcnlChange}
                placeholder="E.g. 0.22"
                step="0.01"
                inputInfo="Percentuale MS 2021 per incremento variabile strutturale dal 2026."
              />
              <Input
                label="Incremento Variabile Una Tantum (%)"
                type="number"
                name="optionalIncreaseVariable2026OnlyPercentage"
                value={data.annualData.ccnl2024?.optionalIncreaseVariable2026OnlyPercentage ?? ''}
                onChange={handleCcnlChange}
                placeholder="E.g. 0.22"
                step="0.01"
                inputInfo="Percentuale MS 2021 per incremento variabile solo per l'anno 2026."
              />
            </div>
          </section>

        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border-2 border-purple-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 text-purple-700 mb-6">
              <Calculator size={24} />
              <h3 className="font-bold text-lg">Sintesi Impatto CCNL</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest mb-1">Riduzione Stabile Fondo</p>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-red-900 font-medium">Conglobamento (Art. 60):</span>
                  <span className="text-xl font-black text-red-600 font-mono">
                    -{formatCurrency(ccnlResults.riduzioneConglobamento)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-red-700 italic">
                  <AlertCircle size={12} />
                  <span>Calcolato su 12 mensilità senza moltiplicatore 13.</span>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-[10px] text-green-400 uppercase font-bold tracking-widest mb-1">Incrementi Variabili</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-green-900">Permanente (0,22%):</span>
                  <span className="font-bold text-green-700">{formatCurrency(ccnlResults.incrementoVariabileOpzionaleDal2026)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-900">Una Tantum (0,22%):</span>
                  <span className="font-bold text-green-700">{formatCurrency(ccnlResults.incrementoVariabileOpzionaleSolo2026)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 font-medium italic">Nota su Indennità di Comparto</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed bg-gray-50 p-2 rounded">
                  La riduzione sopra indicata è strutturale sulla <strong>costituzione</strong> del fondo. 
                  L'utilizzo dell'indennità per il personale in servizio verrà calcolato automaticamente nella sezione 
                  di distribuzione in base al conteggio aggiornato delle teste.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
