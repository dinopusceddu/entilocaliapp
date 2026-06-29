import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Wizard2026DraftState } from '../types';
import { FundData } from '../../../domain/types';
import { buildWizard2026TransferPreview } from './transferPreviewEngine';

interface Wizard2026TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: Wizard2026DraftState;
  currentFundData: FundData;
  onConfirm: () => void;
  localSources?: Record<string, string>;
  isTransferring?: boolean;
  transferError?: string | null;
}

export const Wizard2026TransferModal: React.FC<Wizard2026TransferModalProps> = ({
  isOpen,
  onClose,
  state,
  currentFundData,
  onConfirm,
  localSources,
  isTransferring = false,
  transferError = null,
}) => {
  const [confirmed, setConfirmed] = useState(false);

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

  const preview = buildWizard2026TransferPreview(state, currentFundData, localSources);

  const formatEur = (val?: number | null) => {
    if (val === null || val === undefined) return 'n/d';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const formatPreviewValue = (val: any) => {
    if (val === null || val === undefined) return 'n/d';
    if (typeof val === 'number') return formatEur(val);
    if (typeof val === 'boolean') return val ? 'Sì' : 'No';
    return String(val);
  };

  const getRilevanzaBadge = (rilevanza: string) => {
    switch (rilevanza) {
      case 'DENTRO_LIMITE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Dentro limite Art. 23
          </span>
        );
      case 'FUORI_LIMITE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full bg-green-50 text-green-700 border border-green-100">
            Escluso da limite Art. 23
          </span>
        );
      case 'COMPUTO_FIGURATIVO':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
            Computo figurativo
          </span>
        );
      case 'SOLO_CONTROLLO':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Solo controllo tetto
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-50 text-slate-500">
            Non rilevante
          </span>
        );
    }
  };

  // Separa gli elementi in "Da trasferire", "Limiti/Solo controllo" e "Conflitti"
  const transferItems = preview.items.filter(
    (item) => item.status === 'READY'
  );
  
  const controlItems = preview.items.filter(
    (item) => item.status === 'REQUIRES_CONFIRMATION' || item.status === 'CONTROL_ONLY'
  );

  const conflictItems = preview.items.filter(
    (item) => item.status === 'CONFLICT'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-150">
        
        {/* Header della Modale */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#cc4331]" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans uppercase tracking-wide">
              Conferma trasferimento alla Costituzione Fondo
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isTransferring}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo principale */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="p-4 bg-amber-55/40 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Operazione a sicurezza attiva</span>
              Prima di applicare i dati, verrà creato uno **snapshot locale dello stato corrente** del fondo. Potrai annullare il trasferimento in qualsiasi momento tramite il banner di rollback che apparirà nella pagina della Costituzione Fondo.
            </div>
          </div>

          {/* Dati Effettivi Trasferiti */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-650" />
              <span>1. Voci e Importi Effettivi che verranno Trasferiti</span>
            </h4>
            
            <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {transferItems.map((item) => (
                <div key={item.id} className="p-3 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 sm:max-w-[50%]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800">{item.etichetta}</span>
                      {getRilevanzaBadge(item.rilevanzaArt23)}
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">{item.campoDestinazione}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-150 self-start sm:self-auto">
                    <span className="text-slate-400 font-normal">Prima:</span>
                    <span>{formatPreviewValue(item.valoreAttuale)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400 font-normal">Dopo:</span>
                    <span className="text-[#cc4331]">{formatPreviewValue(item.valoreProposto)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Limiti e dati di Controllo (Non Trasferiti come importi effettivi) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <span>2. Limiti di Spesa e Dati di Controllo</span>
            </h4>

            <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {controlItems.map((item) => (
                <div key={item.id} className="p-3 hover:bg-slate-50/50 transition-colors flex flex-col gap-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800">{item.etichetta}</span>
                        {getRilevanzaBadge(item.rilevanzaArt23)}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">{item.campoDestinazione}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-150 self-start sm:self-auto">
                      <span className="text-slate-400 font-normal">Valore:</span>
                      <span>{formatPreviewValue(item.valoreProposto)}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/40 border border-blue-100 text-blue-900 rounded-lg text-[11px] leading-relaxed">
                    <strong>Avviso:</strong> Dato trasferito come limite massimo di controllo. L’importo effettivo dovrà essere inserito nella Costituzione Fondo.
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campi in conflitto (Non modificati dall'apply) */}
          {conflictItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>3. Valori modificati manualmente (NON verranno sovrascritti)</span>
              </h4>
              
              <div className="border border-amber-200 rounded-xl overflow-hidden divide-y divide-amber-100 bg-amber-50/10">
                {conflictItems.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-amber-50/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 sm:max-w-[50%]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800">{item.etichetta}</span>
                        <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-850 border border-amber-200 font-sans">
                          Valore modificato manualmente
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">{item.campoDestinazione}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 font-mono font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-amber-200 self-start sm:self-auto">
                      <span className="text-slate-400 font-normal">Valore attuale:</span>
                      <span className="text-amber-800">{formatPreviewValue(item.valoreAttuale)}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400 font-normal">Wizard proponeva:</span>
                      <span>{formatPreviewValue(item.valoreProposto)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banner Errore di Salvataggio */}
          {transferError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Errore di rete / salvataggio remoto</span>
                Non è stato possibile consolidare il trasferimento sul server: <code className="bg-red-100 px-1 py-0.5 rounded text-red-800 break-all">{transferError}</code>. I dati non sono andati persi, puoi riprovare.
              </div>
            </div>
          )}

          {/* Dichiarazione di consenso checkbox */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                id="checkbox-conferma-trasferimento"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={isTransferring}
                className="mt-0.5 w-4 h-4 text-[#cc4331] border-slate-300 rounded focus:ring-[#cc4331] disabled:opacity-50"
              />
              <span className="text-slate-700 leading-relaxed font-semibold">
                Confermo di aver verificato i dati istruttori e di voler trasferire i valori alla Costituzione Fondo.
              </span>
            </label>
          </div>

        </div>

        {/* Footer della Modale */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isTransferring}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed || isTransferring}
            className={`px-5 py-2.5 rounded-lg text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all ${
              confirmed && !isTransferring
                ? 'bg-[#cc4331] hover:bg-[#A83226] active:bg-[#A83226]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            {isTransferring ? (
              <span>Trasferimento in corso...</span>
            ) : (
              <span>Conferma e compila Costituzione Fondo</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
