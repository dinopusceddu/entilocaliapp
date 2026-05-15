import React from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { AlertTriangle, ArrowRight, Edit3 } from 'lucide-react';

interface ConfirmGoToFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onGoToWizard: () => void;
}

export const ConfirmGoToFundModal: React.FC<ConfirmGoToFundModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onGoToWizard
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attenzione: Dati Incompleti"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
          <AlertTriangle className="text-orange-500 shrink-0" size={24} />
          <div>
            <p className="text-sm text-orange-800 font-medium">
              Alcuni dati iniziali risultano incompleti.
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Puoi comunque accedere alla costituzione del fondo, ma alcune verifiche o alcuni calcoli potrebbero non essere pienamente attendibili.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onGoToWizard}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Edit3 size={18} />
            Completa i dati iniziali
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2"
          >
            Prosegui comunque
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
