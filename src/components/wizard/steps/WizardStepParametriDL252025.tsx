import React, { useMemo } from 'react';
import { FundData } from '../../../domain/types';
import { Input } from '../../shared/Input';
import { formatCurrency } from '../../../utils/formatters';
import { calculateSimulazione } from '../../../logic/calculation/fundEngine';
import { ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';

interface WizardStepParametriDL252025Props {
  data: FundData;
  onChange: (updates: Partial<FundData>) => void;
}

export const WizardStepParametriDL252025: React.FC<WizardStepParametriDL252025Props> = ({ 
  data, 
  onChange
}) => {
  const { annualData, fondoAccessorioDipendenteData } = data;

  const handleAnnualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseFloat(value);
    
    // Check if it's a simulator input or a direct annualData field
    if (name.startsWith('sim')) {
      onChange({
        annualData: {
          ...annualData,
          simulatoreInput: {
            ...annualData.simulatoreInput,
            [name]: numValue
          }
        }
      });
    } else if (name === 'st_incrementoDL25_2025') {
      onChange({
        fondoAccessorioDipendenteData: {
          ...fondoAccessorioDipendenteData,
          [name]: numValue
        }
      });
    } else {
      onChange({
        annualData: {
          ...annualData,
          [name]: numValue
        }
      });
    }
  };

  const handleCcnlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseFloat(value);
    onChange({
      annualData: {
        ...annualData,
        ccnl2024: {
          ...(annualData.ccnl2024 || {}),
          [name]: numValue
        }
      }
    });
  };

  const simResult = useMemo(() => {
    return calculateSimulazione(annualData.simulatoreInput, annualData.numeroAbitanti, annualData.tipologiaEnte);
  }, [annualData.simulatoreInput, annualData.numeroAbitanti, annualData.tipologiaEnte]);

  const max014 = useMemo(() => {
    if (!annualData.ccnl2024?.monteSalari2021) return 0;
    return (annualData.ccnl2024.monteSalari2021 * 0.14) / 100;
  }, [annualData.ccnl2024?.monteSalari2021]);

  const isCompliant48 = simResult && 
    simResult.fase1_fondoAttualeComplessivo !== undefined && 
    simResult.fase1_obiettivo48 !== undefined &&
    simResult.fase1_fondoAttualeComplessivo <= simResult.fase1_obiettivo48;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <TrendingUp className="text-indigo-600 shrink-0" size={20} />
          <div className="text-sm text-indigo-800">
            <p className="font-bold mb-1">D.L. 25/2025: Incremento 0,14%</p>
            <p>
              Il Decreto Legge 25/2025 consente di incrementare il fondo della parte stabile dello 0,14% del monte salari 2021, 
              a condizione che il rapporto tra risorse stabili e stipendi tabellari 2023 non superi il 48%.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Base di Calcolo (0,14%)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monte Salari 2021"
                type="number"
                name="monteSalari2021"
                value={annualData.ccnl2024?.monteSalari2021 ?? ''}
                onChange={handleCcnlChange}
                placeholder="0.00"
                step="0.01"
                inputInfo="Valore del monte salari 2021 (al netto di oneri e IRAP)."
              />
              <Input
                label="Importo Incremento 0,14% (Stabile)"
                type="number"
                name="st_incrementoDL25_2025"
                value={fondoAccessorioDipendenteData.st_incrementoDL25_2025 ?? ''}
                onChange={handleAnnualChange}
                placeholder="0.00"
                step="0.01"
                inputInfo={`Massimo teorico: ${formatCurrency(max014)}`}
                error={fondoAccessorioDipendenteData.st_incrementoDL25_2025 && fondoAccessorioDipendenteData.st_incrementoDL25_2025 > max014 + 0.01 ? 'Supera lo 0,14%' : undefined}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Simulatori Sostenibilità (Limite 48%)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Stipendi Tabellari 2023"
                type="number"
                name="simStipendiTabellari2023"
                value={annualData.simulatoreInput.simStipendiTabellari2023 ?? ''}
                onChange={handleAnnualChange}
                placeholder="0.00"
                step="0.01"
              />
              <Input
                label="Spesa Personale Consuntivo 2023"
                type="number"
                name="simSpesaPersonaleConsuntivo2023"
                value={annualData.simulatoreInput.simSpesaPersonaleConsuntivo2023 ?? ''}
                onChange={handleAnnualChange}
                placeholder="0.00"
                step="0.01"
              />
              <Input
                label="Fondo Stabile Attuale"
                type="number"
                name="simFondoStabileAnnoApplicazione"
                value={annualData.simulatoreInput.simFondoStabileAnnoApplicazione ?? ''}
                onChange={handleAnnualChange}
                placeholder="0.00"
                step="0.01"
              />
              <Input
                label="Remunerazione Incarichi EQ"
                type="number"
                name="simRisorsePOEQAnnoApplicazione"
                value={annualData.simulatoreInput.simRisorsePOEQAnnoApplicazione ?? ''}
                onChange={handleAnnualChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-xl border-2 shadow-sm ${isCompliant48 ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className={`flex items-center gap-2 mb-4 ${isCompliant48 ? 'text-green-700' : 'text-amber-700'}`}>
              {isCompliant48 ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
              <h3 className="font-bold text-lg">Check Limite 48%</h3>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Obiettivo 48%:</span>
                <span className="font-bold">{formatCurrency(simResult?.fase1_obiettivo48 || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fondo Attuale:</span>
                <span className="font-bold">{formatCurrency(simResult?.fase1_fondoAttualeComplessivo || 0)}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                {isCompliant48 ? (
                  <div className="text-green-800 bg-green-100/50 p-3 rounded text-xs leading-relaxed">
                    <strong>Conforme:</strong> Il rapporto è inferiore al 48%. L'ente può applicare l'incremento dello 0,14%.
                  </div>
                ) : (
                  <div className="text-amber-800 bg-amber-100/50 p-3 rounded text-xs leading-relaxed">
                    <strong>Attenzione:</strong> Il rapporto supera il 48%. Verificare la sostenibilità finanziaria prima di procedere con l'incremento.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Margine DL 34/2019</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Spazio Sostenibile:</span>
                  <span className="font-mono">{formatCurrency(simResult?.fase2_spazioDisponibileDL34 || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Nota Tecnica</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              I dati inseriti in questo step alimentano il simulatore del D.L. 25/2025. 
              L'incremento effettivo nel fondo sarà pari al valore inserito nel campo "Importo Incremento 0,14%".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
