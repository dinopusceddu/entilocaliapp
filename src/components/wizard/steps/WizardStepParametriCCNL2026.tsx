import React, { useMemo } from 'react';
import { FundData } from '../../../domain/types';
import { Input } from '../../shared/Input';
import { formatCurrency } from '../../../utils/formatters';
import { calculateCcnl2024Increases } from '../../../logic/ccnl2024Calculations';
import { Info, Calculator, Table, AlertCircle } from 'lucide-react';

interface WizardStepParametriCCNL2026Props {
  data: FundData;
  onChange: (updates: Partial<FundData>) => void;
}

const TABELLA_C_VALUES = [
  { area: 'Funzionari ed EQ', mensile: 10.62, annuo: 127.44 },
  { area: 'Istruttori', mensile: 9.40, annuo: 112.80 },
  { area: 'Operatori Esperti', mensile: 8.06, annuo: 96.72 },
  { area: 'Operatori', mensile: 6.63, annuo: 79.56 },
];

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

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Riduzione Conglobamento (Art. 60)</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                  <Table size={18} />
                  <span className="font-bold text-sm uppercase tracking-wider">Riferimenti Tabella C (12 Mesi)</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="text-left pb-2 font-medium">Area</th>
                      <th className="text-right pb-2 font-medium">Mensile</th>
                      <th className="text-right pb-2 font-medium">Annuo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {TABELLA_C_VALUES.map(row => (
                      <tr key={row.area} className="hover:bg-white transition-colors">
                        <td className="py-2 text-gray-700">{row.area}</td>
                        <td className="py-2 text-right text-gray-600">€ {row.mensile.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono text-indigo-600">€ {row.annuo.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Personale al 01.01.2026 (Area prevalente)"
                  type="number"
                  name="personaleInServizio01012026"
                  value={data.annualData.ccnl2024?.personaleInServizio01012026 ?? ''}
                  onChange={handleCcnlChange}
                  placeholder="E.g. 50"
                  inputInfo="Utilizzato per il calcolo forfettario della riduzione."
                />
                <Input
                  label="Valore Tabella C (Mensile)"
                  type="number"
                  name="valoreTabellaCCol3"
                  value={data.annualData.ccnl2024?.valoreTabellaCCol3 ?? ''}
                  onChange={handleCcnlChange}
                  placeholder="E.g. 9.40"
                  step="0.01"
                  inputInfo="Scegli il valore mensile corrispondente all'area prevalente."
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded">
                <input
                  type="checkbox"
                  id="applyPartTimeProportion"
                  name="applyPartTimeProportion"
                  checked={data.annualData.ccnl2024?.applyPartTimeProportion || false}
                  onChange={handleCcnlChange}
                  className="rounded border-indigo-300 text-indigo-600"
                />
                <label htmlFor="applyPartTimeProportion" className="text-xs font-medium text-indigo-900">
                  Applica proporzione Part-Time al calcolo della riduzione
                </label>
              </div>
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
