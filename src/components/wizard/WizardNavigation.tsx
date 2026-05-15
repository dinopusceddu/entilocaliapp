import React from 'react';
import { Button } from '../shared/Button';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSaveDraft,
  isSaving
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 py-6 border-t border-gray-100">
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={currentStep === 1 || isSaving}
        className={`flex items-center gap-2 ${currentStep === 1 ? 'invisible' : ''}`}
      >
        <ArrowLeft size={16} /> Indietro
      </Button>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onSaveDraft}
          isLoading={isSaving}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save size={16} /> Salva Dati Identificativi
        </Button>

        {currentStep < totalSteps ? (
          <Button
            variant="primary"
            onClick={onNext}
            disabled={isSaving}
            className="flex items-center gap-2 px-8"
          >
            Avanti <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => alert('Wizard completato! (Placeholder)')}
            disabled={true}
            className="flex items-center gap-2 px-8 opacity-50 cursor-not-allowed"
          >
            Concludi Configurazione
          </Button>
        )}
      </div>
    </div>
  );
};
