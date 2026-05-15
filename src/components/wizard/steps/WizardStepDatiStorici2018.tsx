import React from 'react';
import { FundData } from '../../../domain/types';
import { Input } from '../../shared/Input';
import { Info, Users, BarChart3 } from 'lucide-react';

interface WizardStepDatiStorici2018Props {
  data: FundData;
  onChange: (updates: Partial<FundData>) => void;
  validationErrors?: Record<string, string>;
}

export const WizardStepDatiStorici2018: React.FC<WizardStepDatiStorici2018Props> = ({ 
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

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="text-amber-600 shrink-0" size={20} />
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1">Perché il 2018?</p>
            <p>
              I dati del 2018 sono fondamentali per calcolare il <strong>valore medio pro-capite</strong> del fondo. 
              Questo valore viene utilizzato per adeguare il limite 2016 in base alle variazioni di personale nell'anno di riferimento (Art. 33, c. 2, D.L. 34/2019).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-gray-900 mb-2 border-b pb-2">
            <BarChart3 className="text-blue-600" size={20} />
            <h3 className="font-bold text-lg">Valori Economici 2018</h3>
          </div>
          
          <Input
            label="Fondo Personale 2018 (non Dir/EQ)"
            type="number"
            name="fondoPersonaleNonDirEQ2018_Art23"
            value={historicalData.fondoPersonaleNonDirEQ2018_Art23 ?? ''}
            onChange={handleHistoricalChange}
            placeholder="0.00"
            step="0.01"
            inputInfo="Base economica 2018 per il calcolo pro-capite."
            error={validationErrors['fundData.historicalData.fondoPersonaleNonDirEQ2018_Art23']}
          />

          <Input
            label="Fondo EQ (o P.O.) 2018"
            type="number"
            name="fondoEQ2018_Art23"
            value={historicalData.fondoEQ2018_Art23 ?? ''}
            onChange={handleHistoricalChange}
            placeholder="0.00"
            step="0.01"
            inputInfo="Risorse 2018 destinate alle EQ/P.O."
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-gray-900 mb-2 border-b pb-2">
            <Users className="text-blue-600" size={20} />
            <h3 className="font-bold text-lg">Consistenza Personale 2018</h3>
          </div>

          <Input
            label="Personale FTE 2018 (Aggregato)"
            type="number"
            name="manualDipendentiEquivalenti2018"
            value={annualData.manualDipendentiEquivalenti2018 ?? ''}
            onChange={handleAnnualChange}
            placeholder="E.g. 125.40"
            step="0.01"
            inputInfo="Inserisci il totale dei dipendenti equivalenti (Full Time Equivalent) nel 2018."
          />

          <Input
            label="Personale in servizio 2018 (Conteggio Teste)"
            type="number"
            name="personaleServizio2018"
            value={historicalData.personaleServizio2018 ?? ''}
            onChange={handleHistoricalChange}
            placeholder="E.g. 130"
            step="1"
            inputInfo="Conteggio totale delle persone fisiche in servizio nel 2018."
          />

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 leading-relaxed italic">
              <strong>Nota bene:</strong> Se utilizzi la modalità analitica per il calcolo del limite (gestione nominativo per nominativo), 
              questi valori aggregati verranno sovrascritti dai dati di dettaglio inseriti nella sezione avanzata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
