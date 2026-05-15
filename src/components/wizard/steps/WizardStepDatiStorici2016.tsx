import React from 'react';
import { FundData } from '../../../domain/types';
import { Input } from '../../shared/Input';
import { formatCurrency } from '../../../utils/formatters';
import { Info, Calculator, AlertCircle } from 'lucide-react';

interface WizardStepDatiStorici2016Props {
  data: FundData;
  onChange: (updates: Partial<FundData>) => void;
  validationErrors?: Record<string, string>;
}

export const WizardStepDatiStorici2016: React.FC<WizardStepDatiStorici2016Props> = ({ 
  data, 
  onChange,
  validationErrors = {}
}) => {
  const { historicalData, annualData } = data;

  const handleHistoricalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseFloat(value);
    onChange({
      historicalData: {
        ...historicalData,
        [name]: numValue
      }
    });
  };

  const handleAnnualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseFloat(value);
    onChange({
      annualData: {
        ...annualData,
        [name]: numValue
      }
    });
  };

  const limiteComplessivo2016 =
    (historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) +
    (historicalData.fondoElevateQualificazioni2016 || 0) +
    (historicalData.fondoDirigenza2016 || 0) +
    (historicalData.risorseSegretarioComunale2016 || 0) +
    (annualData.fondoLavoroStraordinario || 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="text-blue-600 shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Perché il 2016?</p>
            <p>
              L'anno 2016 costituisce la base per il <strong>limite storico invalicabile</strong> del trattamento accessorio (Art. 23, c. 2, D.Lgs. 75/2017). 
              I dati devono essere ricavati dagli atti di costituzione del fondo certificati dai Revisori dei Conti.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Costituenti del Fondo 2016</h3>
          
          <Input
            label="Fondo Personale (non Dir/EQ)"
            type="number"
            name="fondoSalarioAccessorioPersonaleNonDirEQ2016"
            value={historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 ?? ''}
            onChange={handleHistoricalChange}
            placeholder="0.00"
            step="0.01"
            inputInfo="Ammontare complessivo certificato del fondo dipendenti 2016."
            error={validationErrors['fundData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016']}
          />

          <Input
            label="Fondo EQ (o P.O.)"
            type="number"
            name="fondoElevateQualificazioni2016"
            value={historicalData.fondoElevateQualificazioni2016 ?? ''}
            onChange={handleHistoricalChange}
            placeholder="0.00"
            step="0.01"
            inputInfo="Risorse destinate alle Posizioni Organizzative o EQ nel 2016."
          />

          <Input
            label="Fondo Dirigenza"
            type="number"
            name="fondoDirigenza2016"
            value={historicalData.fondoDirigenza2016 ?? ''}
            onChange={handleHistoricalChange}
            placeholder="0.00"
            step="0.01"
            disabled={!annualData.hasDirigenza}
            inputInfo={!annualData.hasDirigenza ? "Disabilitato (Ente senza dirigenza)" : "Risorse certificate fondo dirigenza 2016."}
          />

          <Input
            label="Risorse Segretario"
            type="number"
            name="risorseSegretarioComunale2016"
            value={historicalData.risorseSegretarioComunale2016 ?? ''}
            onChange={handleHistoricalChange}
            placeholder="0.00"
            step="0.01"
          />

          <Input
            label="Fondo Straordinario 2016"
            type="number"
            name="fondoLavoroStraordinario"
            value={annualData.fondoLavoroStraordinario ?? ''}
            onChange={handleAnnualChange}
            placeholder="0.00"
            step="0.01"
            inputInfo="Il fondo straordinario 2016 rileva ai fini del limite storico."
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border-2 border-blue-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <Calculator size={24} />
              <h3 className="font-bold text-lg">Riepilogo Limite</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Fondo Dipendenti:</span>
                <span className="font-medium">{formatCurrency(historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Fondo EQ:</span>
                <span className="font-medium">{formatCurrency(historicalData.fondoElevateQualificazioni2016 || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Fondo Dirigenza:</span>
                <span className="font-medium">{formatCurrency(historicalData.fondoDirigenza2016 || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Straordinario:</span>
                <span className="font-medium">{formatCurrency(annualData.fondoLavoroStraordinario || 0)}</span>
              </div>
              <div className="pt-3 border-t border-blue-100 mt-2">
                <div className="flex justify-between items-end">
                  <span className="text-blue-900 font-bold">Totale Limite 2016:</span>
                  <span className="text-2xl font-black text-blue-700 font-mono">
                    {formatCurrency(limiteComplessivo2016)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Override Manuale</h4>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex gap-2 mb-3">
                  <AlertCircle size={16} className="text-yellow-600 shrink-0" />
                  <p className="text-xs text-yellow-800 italic">
                    Usa questo campo solo se desideri forzare manualmente il totale complessivo, ignorando la somma automatica sopra indicata.
                  </p>
                </div>
                <Input
                  label=""
                  type="number"
                  name="manualPersonalFundLimit2016"
                  value={historicalData.manualPersonalFundLimit2016 ?? ''}
                  onChange={handleHistoricalChange}
                  placeholder="Inserisci totale forzato"
                  step="0.01"
                  className="bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
