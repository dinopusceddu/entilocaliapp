import React, { useMemo } from 'react';
import { FundData } from '../../../domain/types';
import { ALL_EMPLOYEE_CATEGORIES, EmployeeCategory } from '../../../domain/enums';
import { Input } from '../../shared/Input';
import { Users, Table, Info } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface WizardStepPersonaleProps {
  data: FundData;
  onChange: (updates: Partial<FundData>) => void;
}

const TABELLA_C_VALUES = [
  { area: 'Funzionari ed EQ', mensile: 10.62, annuo: 127.44 },
  { area: 'Istruttori', mensile: 9.40, annuo: 112.80 },
  { area: 'Operatori Esperti', mensile: 8.06, annuo: 96.72 },
  { area: 'Operatori', mensile: 6.63, annuo: 79.56 },
];

export const WizardStepPersonale: React.FC<WizardStepPersonaleProps> = ({ 
  data, 
  onChange
}) => {
  const { annualData } = data;

  const handleCategoryCountChange = (category: EmployeeCategory, value: string) => {
    const count = value === '' ? undefined : parseInt(value, 10);
    
    // Find if it exists
    let newArray = [...annualData.personaleServizioAttuale];
    const index = newArray.findIndex(e => e.category === category);
    
    if (index >= 0) {
      newArray[index] = { ...newArray[index], count };
    } else {
      newArray.push({ category, count });
    }

    onChange({
      annualData: {
        ...annualData,
        personaleServizioAttuale: newArray
      }
    });
  };

  const handleCcnlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let val: any = value;
    if (type === 'number') val = value === '' ? undefined : parseFloat(value);
    if (type === 'checkbox') val = checked;

    onChange({
      annualData: {
        ...annualData,
        ccnl2024: {
          ...(annualData.ccnl2024 || {}),
          [name]: val
        }
      }
    });
  };

  const reduction = useMemo(() => {
      const fte = annualData.ccnl2024?.personaleInServizio01012026 || 0;
      const tabC = annualData.ccnl2024?.valoreTabellaCCol3 || 0;
      const partTime = annualData.ccnl2024?.applyPartTimeProportion && annualData.ccnl2024?.averagePartTimePercentage
          ? annualData.ccnl2024.averagePartTimePercentage
          : 1;
      return tabC * 12 * fte * partTime;
  }, [
      annualData.ccnl2024?.personaleInServizio01012026, 
      annualData.ccnl2024?.valoreTabellaCCol3,
      annualData.ccnl2024?.applyPartTimeProportion,
      annualData.ccnl2024?.averagePartTimePercentage
  ]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Users className="text-blue-600 shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Dati del Personale in Servizio</p>
            <p>
              In questa sezione è possibile indicare le informazioni relative al personale in servizio.
              Il personale destinatario dell'indennità di comparto (rilevante per la riduzione Art. 60) esclude la dirigenza e il segretario.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personale Base (Categorie)</h3>
            <div className="grid grid-cols-1 gap-4">
              {ALL_EMPLOYEE_CATEGORIES.map(category => {
                const empData = annualData.personaleServizioAttuale.find(emp => emp.category === category);
                return (
                  <Input
                    key={category}
                    label={category}
                    type="number"
                    name={`emp_${category}`}
                    value={empData?.count ?? ''}
                    onChange={(e) => handleCategoryCountChange(category, e.target.value)}
                    placeholder="E.g. 10"
                    step="1"
                    min="0"
                  />
                );
              })}
            </div>
            <div className="flex gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <Info size={16} className="text-gray-400" />
                <p>Questi dati sono utilizzati per la determinazione della media e del calcolo dell'indennità di comparto in distribuzione.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personale Storico 2018 (Art. 23)</h3>
            <div className="grid grid-cols-1 gap-4">
                <Input
                    label="Personale Equivalente (FTE) 2018"
                    type="number"
                    name="manualDipendentiEquivalenti2018"
                    value={annualData.manualDipendentiEquivalenti2018 ?? ''}
                    onChange={(e) => onChange({ annualData: { ...annualData, manualDipendentiEquivalenti2018: e.target.value === '' ? undefined : parseFloat(e.target.value) } })}
                    placeholder="E.g. 45"
                    step="0.01"
                    inputInfo="Valore utilizzato per la riproporzione del limite 2016."
                />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personale per Conglobamento (Art. 60)</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                  <Table size={18} />
                  <span className="font-bold text-sm uppercase tracking-wider">Tabella C (Valori su 12 Mesi)</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="text-left pb-2 font-medium">Area</th>
                      <th className="text-right pb-2 font-medium">Mensile</th>
                      <th className="text-right pb-2 font-medium">Annuo (x12)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {TABELLA_C_VALUES.map(row => (
                      <tr key={row.area} className="hover:bg-white transition-colors">
                        <td className="py-2 text-gray-700">{row.area}</td>
                        <td className="py-2 text-right text-gray-600">€ {row.mensile.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono text-blue-600 font-bold">€ {row.annuo.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <Input
                  label="FTE Personale Comparto (al 01.01.2026)"
                  type="number"
                  name="personaleInServizio01012026"
                  value={annualData.ccnl2024?.personaleInServizio01012026 ?? ''}
                  onChange={handleCcnlChange}
                  placeholder="E.g. 50"
                  step="0.01"
                  inputInfo="Esclude Dirigenza e Segretario. Da indicare in FTE (Equivalente Tempo Pieno)."
                />
                <Input
                  label="Valore Mensile Tabella C"
                  type="number"
                  name="valoreTabellaCCol3"
                  value={annualData.ccnl2024?.valoreTabellaCCol3 ?? ''}
                  onChange={handleCcnlChange}
                  placeholder="E.g. 9.40"
                  step="0.01"
                  inputInfo="Scegli il valore mensile dalla tabella sovrastante in base all'area prevalente."
                />
            </div>

            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-[10px] text-red-500 uppercase font-bold tracking-widest mb-1">Riduzione Stabile Conglobamento</p>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-red-900 font-medium">Formula: TabC * 12 * FTE</span>
                  <span className="text-xl font-black text-red-600 font-mono">
                    -{formatCurrency(reduction)}
                  </span>
                </div>
            </div>
            <div className="flex gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <Info size={16} className="text-gray-400 shrink-0" />
                <p>La riduzione stabile del fondo per conglobamento non influisce sulla dotazione dell'indennità di comparto ripartita in distribuzione.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
