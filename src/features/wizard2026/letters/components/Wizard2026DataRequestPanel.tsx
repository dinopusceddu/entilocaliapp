import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Wizard2026DraftState } from '../../types';
import { buildWizard2026LetterContext } from '../buildWizard2026LetterContext';
import { Wizard2026DataRequestModal } from './Wizard2026DataRequestModal';
import { Wizard2026LetterMode } from '../wizard2026LetterTypes';

interface Wizard2026DataRequestPanelProps {
  state: Wizard2026DraftState;
  stepId: number;
}

export const Wizard2026DataRequestPanel: React.FC<Wizard2026DataRequestPanelProps> = ({
  state,
  stepId
}) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [modalMode, setModalMode] = useState<Wizard2026LetterMode | null>(null);

  // Costruiamo un contesto temporaneo per questo step per ottenere lo stato dei dati
  const context = buildWizard2026LetterContext(state, {
    mode: 'CURRENT_STEP',
    currentStep: stepId
  });

  const fields = context.allFields.filter(f => f.catalogItem.stepId === stepId && f.status !== 'NON_APPLICABILE');

  if (fields.length === 0) {
    return null; // Nessun dato richiesto in questo step (es. Riepilogo)
  }

  const missingCount = fields.filter(f => f.status === 'MANCANTE').length;
  const verifyCount = fields.filter(f => f.status === 'DA_VERIFICARE').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENTE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Presente</span>
          </span>
        );
      case 'DA_VERIFICARE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Verificare</span>
          </span>
        );
      case 'MANCANTE':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Mancante</span>
          </span>
        );
    }
  };

  const renderContent = () => (
    <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4">
      {/* Lista campi */}
      <div className="space-y-2">
        {fields.map(f => (
          <div
            key={f.catalogItem.field}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg gap-2"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {f.catalogItem.label}
              </p>
              <p className="text-xs text-slate-500">
                Norma: {f.catalogItem.norma} | Destinatario: {f.catalogItem.destinatarioSuggerito}
              </p>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge(f.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Pulsanti azioni */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => setModalMode('CURRENT_STEP')}
          className="h-11 min-h-[44px] px-4 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Richiesta Solo Step {stepId}</span>
        </button>
        <button
          type="button"
          onClick={() => setModalMode('MISSING_ONLY')}
          className="h-11 min-h-[44px] px-4 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Richiesta Dati Mancanti</span>
        </button>
        <button
          type="button"
          onClick={() => setModalMode('FULL')}
          className="h-11 min-h-[44px] px-4 rounded-lg bg-[#cc4331] text-white font-medium hover:bg-[#b23526] active:bg-[#9f2f24] transition-colors text-sm flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Richiesta Dati Completa</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop view (visible >= lg, always open/compact box) */}
      <div className="hidden lg:block border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm mt-6">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 border-l-4 border-l-[#cc4331] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#cc4331]" />
            <h4 className="text-sm font-bold text-slate-800">
              Dati da richiedere all'Ente (Step {stepId})
            </h4>
          </div>
          <div className="text-xs font-medium text-slate-500 flex gap-3">
            {missingCount > 0 && <span className="text-red-600">🔴 {missingCount} Mancanti</span>}
            {verifyCount > 0 && <span className="text-amber-600">🟡 {verifyCount} Da verificare</span>}
            {missingCount === 0 && verifyCount === 0 && <span className="text-green-600">🟢 Tutti i dati completi</span>}
          </div>
        </div>
        {renderContent()}
      </div>

      {/* Mobile/Tablet view (visible < lg, closed by default accordion) */}
      <div className="lg:hidden border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm mt-4">
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full px-4 py-3.5 min-h-[44px] bg-slate-50 hover:bg-slate-100 border-l-4 border-l-[#cc4331] transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#cc4331]" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Dati da richiedere all'Ente
              </h4>
              <p className="text-xs text-slate-500">
                {missingCount > 0 ? `${missingCount} dati mancanti da trasmettere` : 'Dati completi per questo step'}
              </p>
            </div>
          </div>
          {isAccordionOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
        {isAccordionOpen && renderContent()}
      </div>

      {/* Modale Lettera */}
      {modalMode && (
        <Wizard2026DataRequestModal
          isOpen={true}
          onClose={() => setModalMode(null)}
          state={state}
          initialMode={modalMode}
        />
      )}
    </>
  );
};
