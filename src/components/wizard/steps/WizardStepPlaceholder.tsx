import React from 'react';
import { Card } from '../../shared/Card';
import { Info } from 'lucide-react';

interface WizardStepPlaceholderProps {
  stepNumber: number;
  title: string;
}

export const WizardStepPlaceholder: React.FC<WizardStepPlaceholderProps> = ({ stepNumber, title }) => {
  return (
    <Card title={title} className="bg-gray-50 border-dashed border-2 border-gray-200">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-blue-100 rounded-full text-blue-600 mb-4">
          <Info size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Step {stepNumber} in fase di configurazione</h3>
        <p className="text-gray-500 max-w-md">
          Questa sezione verrà implementata nelle prossime fasi dello Sprint C.4.
          Tutti i dati relativi a questa sezione sono comunque accessibili e modificabili tramite la <strong>Vista Avanzata</strong>.
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
            I campi tecnici associati a questo step rimangono integri nel modello dati.
        </div>
      </div>
    </Card>
  );
};
