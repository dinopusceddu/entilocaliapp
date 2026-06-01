import React, { useState, useEffect } from 'react';
import { X, HelpCircle, FileText } from 'lucide-react';
import { Wizard2026DraftState } from '../../types';
import { Wizard2026LetterMode } from '../wizard2026LetterTypes';
import { buildWizard2026LetterContext } from '../buildWizard2026LetterContext';
import { generateWizard2026DataRequestMarkdown } from '../generateWizard2026DataRequestMarkdown';
import { Wizard2026DataRequestPreview } from './Wizard2026DataRequestPreview';
import { Wizard2026DataRequestActions } from './Wizard2026DataRequestActions';

interface Wizard2026DataRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: Wizard2026DraftState;
  initialMode?: Wizard2026LetterMode;
}

export const Wizard2026DataRequestModal: React.FC<Wizard2026DataRequestModalProps> = ({
  isOpen,
  onClose,
  state,
  initialMode = 'FULL'
}) => {
  const [mode, setMode] = useState<Wizard2026LetterMode>(initialMode);
  const [destinatario, setDestinatario] = useState('Ufficio Personale e Ufficio Ragioneria');
  const [firmatario, setFirmatario] = useState('Il Segretario FP CGIL');
  const [organizzazione, setOrganizzazione] = useState('FP CGIL Lombardia');
  const [termineRisposta, setTermineRisposta] = useState('15 giorni');
  const [note, setNote] = useState('');
  const [dataLettera, setDataLettera] = useState(() => {
    return new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  });

  // Blocca lo scroll del body quando la modale è aperta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Costruisce il contesto e genera il markdown in tempo reale
  const context = buildWizard2026LetterContext(state, {
    mode,
    currentStep: state.meta.currentStep,
    destinatario,
    firmatario,
    organizzazione,
    termineRisposta,
    note,
    dataLettera
  });

  const markdown = generateWizard2026DataRequestMarkdown(context);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Intestazione Modale */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#cc4331]" />
            <h3 className="text-lg font-bold text-slate-900">
              Generatore Lettera Richiesta Dati
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenuto principale con scroll */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Colonna parametri di input (5 col su LG) */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 border-b pb-2 uppercase tracking-wide">
              Opzioni Lettera
            </h4>

            {/* Modalità Generazione */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Ambito Richiesta
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('FULL')}
                  className={`h-10 min-h-[40px] px-2 rounded-lg border text-xs font-medium transition-all ${
                    mode === 'FULL'
                      ? 'border-[#cc4331] bg-[#fff5f4] text-[#cc4331] font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Completa
                </button>
                <button
                  type="button"
                  onClick={() => setMode('MISSING_ONLY')}
                  className={`h-10 min-h-[40px] px-2 rounded-lg border text-xs font-medium transition-all ${
                    mode === 'MISSING_ONLY'
                      ? 'border-[#cc4331] bg-[#fff5f4] text-[#cc4331] font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Solo Mancanti
                </button>
                <button
                  type="button"
                  onClick={() => setMode('CURRENT_STEP')}
                  className={`h-10 min-h-[40px] px-2 rounded-lg border text-xs font-medium transition-all ${
                    mode === 'CURRENT_STEP'
                      ? 'border-[#cc4331] bg-[#fff5f4] text-[#cc4331] font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Step Corrente
                </button>
              </div>
            </div>

            {/* Destinatario */}
            <div>
              <label htmlFor="letter-destinatario" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Destinatario
              </label>
              <input
                id="letter-destinatario"
                type="text"
                value={destinatario}
                onChange={e => setDestinatario(e.target.value)}
                placeholder="es. Dirigente Ufficio Personale"
                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331]"
              />
            </div>

            {/* Organizzazione */}
            <div>
              <label htmlFor="letter-organizzazione" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Organizzazione
              </label>
              <input
                id="letter-organizzazione"
                type="text"
                value={organizzazione}
                onChange={e => setOrganizzazione(e.target.value)}
                placeholder="default FP CGIL Lombardia"
                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331]"
              />
            </div>

            {/* Firmatario */}
            <div>
              <label htmlFor="letter-firmatario" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Firmatario
              </label>
              <input
                id="letter-firmatario"
                type="text"
                value={firmatario}
                onChange={e => setFirmatario(e.target.value)}
                placeholder="es. Il Rappresentante Sindacale"
                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331]"
              />
            </div>

            {/* Termine Risposta & Data Lettera */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="letter-termine" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                  Termine Risposta
                </label>
                <input
                  id="letter-termine"
                  type="text"
                  value={termineRisposta}
                  onChange={e => setTermineRisposta(e.target.value)}
                  placeholder="es. 15 giorni"
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331]"
                />
              </div>
              <div>
                <label htmlFor="letter-data" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                  Data Lettera
                </label>
                <input
                  id="letter-data"
                  type="text"
                  value={dataLettera}
                  onChange={e => setDataLettera(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331]"
                />
              </div>
            </div>

            {/* Note Aggiuntive */}
            <div>
              <label htmlFor="letter-note" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Note Aggiuntive (Testo Libero)
              </label>
              <textarea
                id="letter-note"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Aggiungi dettagli o commenti supplementari da visualizzare nella letter..."
                className="w-full h-24 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] resize-none"
              />
            </div>
          </div>

          {/* Colonna anteprima e azioni (7 col su LG) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                Anteprima Lettera
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {context.sections.reduce((acc, curr) => acc + curr.fields.length, 0)} dati richiesti
              </span>
            </div>

            {/* Sezione Anteprima */}
            <Wizard2026DataRequestPreview markdown={markdown} />

            {/* Azioni di Esportazione */}
            <Wizard2026DataRequestActions markdown={markdown} context={context} />
          </div>

        </div>

        {/* Piè di pagina modale */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>I dati inseriti in questa maschera rimangono esclusivamente in memoria.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
