/**
 * SchedaGuidaViewer.tsx — Visualizzatore scheda guida con blocchi strutturati.
 * 
 * Supporta:
 * - Blocchi standard (Cos'è, Requisiti, Note, ecc.)
 * - Pareri ARAN collegati (molti-a-molti)
 * - Articoli raccolta collegati
 */
import React, { useState } from 'react';
import { NormativaSchedaGuida, NormativaParereAran } from '../../types';
import { FileText, MessageSquare, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface SchedaGuidaViewerProps {
  scheda: NormativaSchedaGuida;
  pareriCollegati?: NormativaParereAran[];
  onArticoloClick?: (articleId: string) => void;
}

const LABELS_BLOCCO: Record<string, string> = {
  cosE: "Cos'è",
  quantoDura: "Quanto dura",
  quando: "Quando",
  aChi: "A chi si applica",
  chiDispone: "Chi lo dispone",
  puoEssereNegato: "Può essere negato",
  requisiti: "Requisiti",
  note: "Note",
  pareriAran: "Pareri ARAN",
};

const COLORI_BLOCCO: Record<string, string> = {
  cosE: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-400',
  quantoDura: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30 text-purple-700 dark:text-purple-400',
  quando: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-400',
  aChi: 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800/30 text-teal-700 dark:text-teal-400',
  chiDispone: 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800/30 text-cyan-700 dark:text-cyan-400',
  puoEssereNegato: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400',
  requisiti: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400',
  note: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400',
  pareriAran: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30 text-orange-700 dark:text-orange-400',
};

const SchedaGuidaViewer: React.FC<SchedaGuidaViewerProps> = ({
  scheda,
  pareriCollegati = [],
  onArticoloClick,
}) => {
  const [showPareri, setShowPareri] = useState(false);
  const [showArticoli, setShowArticoli] = useState(false);
  const [expandedParereId, setExpandedParereId] = useState<string | null>(null);

  // Separa i blocchi per tipo
  const intestazioni: Array<{ label: string; chiave?: string; idx: number }> = [];
  
  scheda.blocchi.forEach((blocco, idx) => {
    if (blocco.tipo === 'intestazione') {
      intestazioni.push({
        label: blocco.chiaveStandard ? LABELS_BLOCCO[blocco.chiaveStandard] || String(blocco.contenuto) : String(blocco.contenuto),
        chiave: blocco.chiaveStandard,
        idx
      });
    }
  });

  // Raggruppa i blocchi in sezioni (da un'intestazione alla successiva)
  const sezioni: Array<{
    intestazione?: { label: string; chiave?: string };
    blocchi: typeof scheda.blocchi;
  }> = [];

  let currentSection: typeof sezioni[0] = { blocchi: [] };
  
  scheda.blocchi.forEach((blocco) => {
    if (blocco.tipo === 'intestazione') {
      if (currentSection.blocchi.length > 0 || currentSection.intestazione) {
        sezioni.push(currentSection);
      }
      currentSection = {
        intestazione: {
          label: blocco.chiaveStandard ? (LABELS_BLOCCO[blocco.chiaveStandard] || String(blocco.contenuto)) : String(blocco.contenuto),
          chiave: blocco.chiaveStandard
        },
        blocchi: []
      };
    } else {
      currentSection.blocchi.push(blocco);
    }
  });
  if (currentSection.blocchi.length > 0 || currentSection.intestazione) {
    sezioni.push(currentSection);
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden">
      {/* Header scheda */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-transparent p-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Guida</span>
          {scheda.sezione && (
            <span className="text-xs text-slate-500 dark:text-slate-400">— {scheda.sezione}</span>
          )}
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{scheda.titolo}</h2>
        {scheda.riferimentiNormativi.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {scheda.riferimentiNormativi.map((ref, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg font-medium">
                {ref}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Corpo scheda - sezioni strutturate */}
      <div className="p-6 space-y-4">
        {sezioni.length > 0 ? (
          sezioni.map((sezione, i) => {
            const colore = sezione.intestazione?.chiave 
              ? COLORI_BLOCCO[sezione.intestazione.chiave] 
              : '';
            return (
              <div key={i} className={`rounded-xl border p-4 ${colore || 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'}`}>
                {sezione.intestazione && (
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5">
                    <FileText size={14} />
                    {sezione.intestazione.label}
                  </h4>
                )}
                {sezione.blocchi.map((blocco, j) => {
                  if (blocco.tipo === 'testo') {
                    return (
                      <p key={j} className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {String(blocco.contenuto)}
                      </p>
                    );
                  }
                  if (blocco.tipo === 'lista') {
                    const items = Array.isArray(blocco.contenuto) ? blocco.contenuto : [blocco.contenuto];
                    return (
                      <ul key={j} className="space-y-1 mt-1">
                        {items.map((item, k) => (
                          <li key={k} className="text-[15px] text-slate-700 dark:text-slate-300 flex gap-2 font-medium">
                            <span className="text-emerald-500 mt-1 shrink-0">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return null;
                })}
              </div>
            );
          })
        ) : (
          /* Fallback: testo completo */
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {scheda.testoCompleto || scheda.testoIntegrale}
          </div>
        )}
      </div>

      {/* Articoli raccolta collegati */}
      {scheda.articoliCollegati?.length > 0 && (
        <div className="px-6 pb-4 border-t border-border-light dark:border-border-dark pt-4">
          <button
            onClick={() => setShowArticoli(!showArticoli)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-primary transition-colors w-full text-left mb-2"
          >
            <BookOpen size={12} />
            Articoli racolta collegati ({scheda.articoliCollegati.length})
            {showArticoli ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showArticoli && (
            <div className="flex flex-wrap gap-2">
              {scheda.articoliCollegati.map(artId => (
                <button
                  key={artId}
                  onClick={() => onArticoloClick && onArticoloClick(artId)}
                  className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                >
                  {artId.replace(/ccnl-\d+-/, '').replace(/-/g, ' ').replace(/^art /, 'Art. ')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pareri ARAN collegati */}
      {pareriCollegati.length > 0 && (
        <div className="px-6 pb-6 border-t border-border-light dark:border-border-dark pt-4">
          <button
            onClick={() => setShowPareri(!showPareri)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-primary transition-colors w-full text-left mb-2"
          >
            <MessageSquare size={12} />
            Pareri ARAN correlati ({pareriCollegati.length})
            {showPareri ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showPareri && (
            <div className="space-y-2">
              {pareriCollegati.map(parere => {
                const isExpanded = expandedParereId === parere.id;

                // Logica di splitting smart
                let dispQuesito = parere.quesito || parere.domanda || '';
                let dispRisposta = parere.risposta || '';
                
                if (!dispRisposta.trim() && dispQuesito.includes('\n')) {
                  const parts = dispQuesito.split(/\n+/);
                  dispQuesito = parts[0];
                  dispRisposta = parts.slice(1).join('\n\n');
                }

                const hasRisposta = dispRisposta.trim().length > 0;

                return (
                  <div
                    key={parere.id}
                    onClick={() => setExpandedParereId(isExpanded ? null : parere.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isExpanded 
                        ? 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700/50' 
                        : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        Parere #{parere.id}
                      </span>
                      <span className="text-xs text-slate-500">{parere.dataPubblicazione || parere.data}</span>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Quesito</h4>
                      <p className={`text-sm text-slate-700 dark:text-slate-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {dispQuesito}
                      </p>
                    </div>

                    {isExpanded && hasRisposta && (
                      <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-800/50">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500 mb-1">Risposta / Orientamento</h4>
                        <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {dispRisposta}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1">
                      {(parere.hashTagsArgomento || parere.tags)?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedaGuidaViewer;
