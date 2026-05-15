import React from 'react';
import { FundData } from '../../../domain/types';
import { Input } from '../../shared/Input';
import { Wallet, Info } from 'lucide-react';

interface WizardStepRisorseInizialiProps {
  data: FundData;
  onChange: (updates: Partial<FundData>) => void;
}

export const WizardStepRisorseIniziali: React.FC<WizardStepRisorseInizialiProps> = ({ 
  data, 
  onChange
}) => {
  const { fondoAccessorioDipendenteData, fondoElevateQualificazioniData } = data;

  const handleFondoAccessorioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseFloat(value);
    onChange({
      fondoAccessorioDipendenteData: {
        ...fondoAccessorioDipendenteData,
        [name]: numValue
      }
    });
  };

  const handleFondoEQChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseFloat(value);
    onChange({
      fondoElevateQualificazioniData: {
        ...fondoElevateQualificazioniData,
        [name]: numValue
      }
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Wallet className="text-emerald-600 shrink-0" size={20} />
          <div className="text-sm text-emerald-800">
            <p className="font-bold mb-1">Risorse Economiche di Base</p>
            <p>
              Inserisci i dati economici essenziali per il primo impianto del fondo. 
              Per l'inserimento analitico di tutte le altre voci contrattuali (es. sponsorizzazioni, recupero evasione), 
              utilizza la <strong>Vista Tecnica di Costituzione del Fondo</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Risorse Stabili (Dipendenti)</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Unico Importo Consolidato 2017"
                type="number"
                name="st_art79c1_art67c1_unicoImporto2017"
                value={fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017 ?? ''}
                onChange={handleFondoAccessorioChange}
                placeholder="E.g. 100000"
                step="0.01"
                inputInfo="Fondo risorse decentrate parte stabile consolidato al 2017 (Art. 79, c. 1 / Art. 67, c. 1)."
              />
              <Input
                label="RIA Personale Cessato"
                type="number"
                name="st_art79c1_art4c2_art67c2c_integrazioneRIA"
                value={fondoAccessorioDipendenteData.st_art79c1_art4c2_art67c2c_integrazioneRIA ?? ''}
                onChange={handleFondoAccessorioChange}
                placeholder="E.g. 5000"
                step="0.01"
                inputInfo="Integrazione RIA personale cessato."
              />
              <Input
                label="Differenziali Stipendiali Storici"
                type="number"
                name="st_art79c1d_differenzialiStipendiali2022"
                value={fondoAccessorioDipendenteData.st_art79c1d_differenzialiStipendiali2022 ?? ''}
                onChange={handleFondoAccessorioChange}
                placeholder="E.g. 2000"
                step="0.01"
                inputInfo="Risorse per differenziali stipendiali ex Art. 79, c. 1, lett. d."
              />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Risorse Elevate Qualificazioni</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Fondo Elevate Qualificazioni (Storico 2017)"
                type="number"
                name="ris_fondoPO2017"
                value={fondoElevateQualificazioniData.ris_fondoPO2017 ?? ''}
                onChange={handleFondoEQChange}
                placeholder="E.g. 30000"
                step="0.01"
                inputInfo="Risorse storiche destinate alle Posizioni Organizzative (ora EQ) al 2017."
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Risorse Variabili Principali</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Somme non utilizzate anni precedenti"
                type="number"
                name="vn_art80c1_sommeNonUtilizzateStabiliPrec"
                value={fondoAccessorioDipendenteData.vn_art80c1_sommeNonUtilizzateStabiliPrec ?? ''}
                onChange={handleFondoAccessorioChange}
                placeholder="E.g. 15000"
                step="0.01"
                inputInfo="Risorse stabili non utilizzate nell'anno precedente."
              />
            </div>
            
            <div className="flex gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded mt-4">
                <Info size={16} className="text-gray-400 shrink-0" />
                <p>Tutti gli altri istituti (incentivi, recupero evasione, progettazioni, quote ISTAT, PNRR, ecc.) sono configurabili successivamente in Costituzione del Fondo.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
