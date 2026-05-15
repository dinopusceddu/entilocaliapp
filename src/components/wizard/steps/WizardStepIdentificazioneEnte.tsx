import React from 'react';
import { FundData } from '../../../domain/types';
import { TipologiaEnte } from '../../../enums';
import { Input } from '../../shared/Input';
import { Select } from '../../shared/Select';
import { Card } from '../../shared/Card';
import { TEXTS_UI, ALL_TIPOLOGIE_ENTE } from '../../../constants';

interface WizardStepIdentificazioneEnteProps {
  data: FundData;
  onChange: (data: Partial<FundData>) => void;
  validationErrors: Record<string, string>;
}

const booleanOptions = [
  { value: 'true', label: TEXTS_UI.trueText },
  { value: 'false', label: TEXTS_UI.falseText },
];

export const WizardStepIdentificazioneEnte: React.FC<WizardStepIdentificazioneEnteProps> = ({ 
  data, 
  onChange,
  validationErrors
}) => {
  const { annualData } = data;

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | undefined = value;

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
    } else if (name === 'hasDirigenza') {
      processedValue = value === 'true' ? true : (value === 'false' ? false : undefined);
    }

    if (name === 'denominazioneEnte') {
        onChange({
            annualData: {
                ...annualData,
                denominazioneEnte: value
            }
        });
        return;
    }

    onChange({
        annualData: {
            ...annualData,
            [name]: processedValue
        }
    });
  };

  const handleTipologiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTipologia = e.target.value as TipologiaEnte;
    const isNumeroAbitantiRequired = newTipologia === TipologiaEnte.COMUNE || newTipologia === TipologiaEnte.PROVINCIA;

    const newAnnualData = { 
        ...annualData,
        tipologiaEnte: newTipologia 
    };

    if (!isNumeroAbitantiRequired) {
      newAnnualData.numeroAbitanti = undefined;
    }
    if (newTipologia !== TipologiaEnte.ALTRO) {
      newAnnualData.altroTipologiaEnte = '';
    }

    onChange({ annualData: newAnnualData });
  };

  const handleYearChange = (newYear: number) => {
    onChange({
        annualData: {
            ...annualData,
            annoRiferimento: newYear
        }
    });
  };

  const isNumeroAbitantiRequired = annualData.tipologiaEnte === TipologiaEnte.COMUNE || annualData.tipologiaEnte === TipologiaEnte.PROVINCIA;
  const numeroAbitantiWarning = isNumeroAbitantiRequired && (!annualData.numeroAbitanti || annualData.numeroAbitanti <= 0)
    ? "Campo obbligatorio per il calcolo corretto. La compilazione non sarà bloccata."
    : undefined;

  return (
    <div className="space-y-6">
      <Card title="Identità dell'Ente">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-2">
            <Input
              label="Denominazione Ente"
              type="text"
              id="denominazioneEnte"
              name="denominazioneEnte"
              value={annualData.denominazioneEnte ?? ''}
              onChange={handleFieldChange}
              placeholder="Es. Comune di..."
              error={validationErrors['fundData.annualData.denominazioneEnte']}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anno di Riferimento</label>
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300 p-1">
              <button
                type="button"
                onClick={() => handleYearChange(annualData.annoRiferimento - 1)}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={annualData.annoRiferimento}
                onChange={(e) => handleYearChange(parseInt(e.target.value) || new Date().getFullYear())}
                className="bg-transparent border-none text-center text-lg font-bold w-full focus:ring-0"
              />
              <button
                type="button"
                onClick={() => handleYearChange(annualData.annoRiferimento + 1)}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Configurazione Istituzionale">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Tipologia Ente"
            id="tipologiaEnte"
            name="tipologiaEnte"
            options={ALL_TIPOLOGIE_ENTE}
            value={annualData.tipologiaEnte ?? ''}
            onChange={handleTipologiaChange}
            placeholder="Seleziona..."
            error={validationErrors['fundData.annualData.tipologiaEnte']}
          />
          
          {annualData.tipologiaEnte === TipologiaEnte.ALTRO && (
            <Input
              label="Specifica Altra Tipologia"
              type="text"
              id="altroTipologiaEnte"
              name="altroTipologiaEnte"
              value={annualData.altroTipologiaEnte ?? ''}
              onChange={handleFieldChange}
              placeholder="Indicare la tipologia"
              error={validationErrors['fundData.annualData.altroTipologiaEnte']}
            />
          )}

          <Input
            label="Numero Abitanti (al 31.12 anno prec.)"
            type="number"
            id="numeroAbitanti"
            name="numeroAbitanti"
            value={annualData.numeroAbitanti ?? ''}
            onChange={handleFieldChange}
            placeholder="Es. 15000"
            disabled={!isNumeroAbitantiRequired}
            warning={numeroAbitantiWarning}
            inputInfo={!isNumeroAbitantiRequired ? "Non richiesto per questa tipologia." : "Obbligatorio per Comuni e Province."}
          />

          <Select
            label="È un ente con personale dirigente?"
            id="hasDirigenza"
            name="hasDirigenza"
            options={booleanOptions}
            value={annualData.hasDirigenza === undefined ? '' : String(annualData.hasDirigenza)}
            onChange={handleFieldChange}
            placeholder="Seleziona..."
            error={validationErrors['fundData.annualData.hasDirigenza']}
          />
        </div>
      </Card>
    </div>
  );
};
