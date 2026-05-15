import React from 'react';
import { FundData } from '../../domain/types';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';


interface StatusItemProps {
  label: string;
  status: 'Completo' | 'Da verificare' | 'Incompleto';
}

const StatusItem: React.FC<StatusItemProps> = ({ label, status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'Completo':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'Da verificare':
        return <AlertTriangle size={18} className="text-orange-400" />;
      case 'Incompleto':
        return <XCircle size={18} className="text-red-400" />;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'Completo':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'Da verificare':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Incompleto':
        return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusClass()}`}>
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider">{status}</span>
        {getStatusIcon()}
      </div>
    </div>
  );
};

interface WizardDataStatusPanelProps {
  data: FundData;
}

export const WizardDataStatusPanel: React.FC<WizardDataStatusPanelProps> = ({ data }) => {
  const { annualData, historicalData } = data;

  // Simple logic to determine status
  const getDatiEnteStatus = () => {
    if (annualData.denominazioneEnte && annualData.tipologiaEnte && annualData.hasDirigenza !== undefined) {
      return 'Completo';
    }
    return 'Da verificare';
  };

  const getDatiStorici2016Status = (): 'Completo' | 'Da verificare' | 'Incompleto' => {
    if ((historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || 0) > 0) {
      return 'Completo';
    }
    return 'Incompleto';
  };

  const getDatiPersonale2018Status = (): 'Completo' | 'Da verificare' | 'Incompleto' => {
    if ((historicalData.personaleServizio2018 || 0) > 0) {
      return 'Completo';
    }
    return 'Incompleto';
  };

  const getParametriDL25Status = (): 'Completo' | 'Da verificare' | 'Incompleto' => {
    // Placeholder logic for now
    return 'Da verificare';
  };

  const getParametriCCNL2026Status = (): 'Completo' | 'Da verificare' | 'Incompleto' => {
    if (annualData.ccnl2024?.monteSalari2021 && annualData.ccnl2024.monteSalari2021 > 0) {
      return 'Completo';
    }
    return 'Incompleto';
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6 text-gray-900">
        <Info size={20} className="text-blue-500" />
        <h3 className="text-lg font-bold">Stato dati iniziali</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusItem label="Dati ente" status={getDatiEnteStatus()} />
        <StatusItem label="Dati storici 2016" status={getDatiStorici2016Status()} />
        <StatusItem label="Dati personale 2018" status={getDatiPersonale2018Status()} />
        <StatusItem label="Parametri D.L. 25/2025" status={getParametriDL25Status()} />
        <StatusItem label="Parametri CCNL 23.02.2026" status={getParametriCCNL2026Status()} />
        <StatusItem label="Strumenti di import/export" status="Completo" />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 italic">
        Nota: Lo stato dei dati è indicativo. Alcuni campi potrebbero richiedere integrazioni manuali per un calcolo certificato.
      </div>
    </div>
  );
};
