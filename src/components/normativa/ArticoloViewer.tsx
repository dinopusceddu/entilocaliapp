/**
 * ArticoloViewer.tsx — Visualizzatore articolo con struttura normativa gerarchica.
 * 
 * Supporta:
 * - Commi numerati (1., 2., ...)
 * - Lettere (a), b), ..., e bis), ...)
 * - Sotto-punti annidati
 * - Rinvii interni cliccabili
 * - Riferimenti esterni (link Normattiva in nuova scheda)
 * - Pareri ARAN collegati
 */
import React, { useState } from 'react';
import { NormativaArticle, NormativaUnita, NormativaParereAran, NormativaExternalRef } from '../../types';
import { ExternalLink, ChevronDown, ChevronUp, MessageSquare, Link2 } from 'lucide-react';

interface ArticoloViewerProps {
  article: NormativaArticle;
  pareriCollegati?: NormativaParereAran[];
  riferimentiEsterni?: NormativaExternalRef[];
  onNavigateToArticle?: (articleId: string) => void;
}

// Componente ricorsivo per renderizzare le unità normative
const UnitaNormativa: React.FC<{
  unita: NormativaUnita;
  depth: number;
  onNavigateToArticle?: (id: string) => void;
}> = ({ unita, depth, onNavigateToArticle }) => {
  const [collapsed, setCollapsed] = useState(false);

  const indentClass = depth === 0 ? '' : depth === 1 ? 'ml-4' : 'ml-8';
  
  const tipoStyle: Record<string, string> = {
    comma: 'font-medium text-slate-800 dark:text-slate-100 my-3 text-[15px] leading-relaxed',
    lettera: 'text-slate-700 dark:text-slate-200 my-1.5 text-sm leading-relaxed',
    sublettera: 'text-slate-600 dark:text-slate-300 my-1 text-sm',
    punto: 'text-slate-600 dark:text-slate-300 my-1 text-sm',
    appendice: 'text-slate-500 dark:text-slate-400 my-1 text-sm italic',
  };

  const labelStyle: Record<string, string> = {
    comma: 'font-bold text-primary mr-2 min-w-[2rem] inline-block',
    lettera: 'text-emerald-700 dark:text-emerald-400 font-semibold mr-1.5 min-w-[2.5rem] inline-block',
    sublettera: 'text-slate-500 mr-1 min-w-[2rem] inline-block',
    punto: 'text-slate-500 mr-1 min-w-[1.5rem] inline-block',
    appendice: 'mr-1 text-slate-400',
  };

  const hasFigli = unita.figli && unita.figli.length > 0;

  return (
    <div className={`${indentClass} ${tipoStyle[unita.tipo] || ''}`}>
      <div className="flex items-start gap-1">
        {hasFigli && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-0.5 shrink-0 text-slate-400 hover:text-primary transition-colors"
            title={collapsed ? 'Espandi' : 'Comprimi'}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        )}
        <div className="flex-1">
          {unita.label && (
            <span className={labelStyle[unita.tipo] || ''}>
              {unita.label}
            </span>
          )}
          <span className="leading-relaxed">{unita.testo}</span>
        </div>
      </div>
      
      {!collapsed && hasFigli && (
        <div className="mt-1">
          {unita.figli!.map((figlio, i) => (
            <UnitaNormativa
              key={i}
              unita={figlio}
              depth={depth + 1}
              onNavigateToArticle={onNavigateToArticle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ArticoloViewer: React.FC<ArticoloViewerProps> = ({
  article,
  pareriCollegati = [],
  riferimentiEsterni = [],
  onNavigateToArticle,
}) => {
  const [showPareri, setShowPareri] = useState(false);
  const [expandedParereId, setExpandedParereId] = useState<string | null>(null);

  // Determina la struttura da usare (nuova o backward compat con commi)
  const hasStruttura = article.strutturaNormativa && article.strutturaNormativa.length > 0;
  const hasCommiLegacy = !hasStruttura && article.commi && article.commi.length > 0;

  // Trova i riferimenti esterni applicabili a questo articolo
  const extRefsApplicabili = riferimentiEsterni.filter(r => 
    article.riferimentiEsterni?.includes(r.id)
  );

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden">
      {/* Header articolo */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{article.fonte}</span>
              {article.capo && (
                <span className="text-xs text-slate-500 dark:text-slate-400">— {article.capo}</span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{article.label}</h2>
            {article.titolo && (
              <p className="mt-1 text-lg font-semibold text-slate-700 dark:text-slate-300">{article.titolo}</p>
            )}
            {article.titoloSezione && (
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{article.titoloSezione}</p>
            )}
          </div>
        </div>
      </div>

      {/* Corpo articolo */}
      <div className="p-6">
        {/* Struttura normativa gerarchica (formato nuovo) */}
        {hasStruttura && (
          <div className="space-y-0.5 text-sm leading-relaxed font-serif">
            {article.strutturaNormativa.map((unita, i) => (
              <UnitaNormativa
                key={i}
                unita={unita}
                depth={0}
                onNavigateToArticle={onNavigateToArticle}
              />
            ))}
          </div>
        )}

        {/* Fallback: commi semplici (formato legacy) */}
        {hasCommiLegacy && (
          <div className="space-y-3 text-sm">
            {article.commi!.map((comma, i) => (
              <div key={i} className="flex gap-2">
                <span className="font-bold text-primary shrink-0 min-w-[2rem]">{comma.numero}.</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comma.testo}</p>
              </div>
            ))}
          </div>
        )}

        {/* Fallback: testo integrale */}
        {!hasStruttura && !hasCommiLegacy && article.testoIntegrale && (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {article.testoIntegrale}
          </p>
        )}
      </div>

      {/* Rinvii normativi */}
      {article.rinviiInterni && article.rinviiInterni.length > 0 && (
        <div className="px-6 pb-4 border-t border-border-light dark:border-border-dark pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <Link2 size={12} /> Rinvii normativi interni
          </h4>
          <div className="flex flex-wrap gap-2">
            {[...new Set(article.rinviiInterni.map(r => r.targetId))].map(targetId => {
              const rinvio = article.rinviiInterni.find(r => r.targetId === targetId);
              return (
                <button
                  key={targetId}
                  onClick={() => onNavigateToArticle && onNavigateToArticle(targetId)}
                  className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                  title={`Vai a ${rinvio?.label}`}
                >
                  {rinvio?.label || targetId}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Riferimenti esterni */}
      {extRefsApplicabili.length > 0 && (
        <div className="px-6 pb-4 border-t border-border-light dark:border-border-dark pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <ExternalLink size={12} /> Riferimenti normativi esterni
          </h4>
          <div className="flex flex-wrap gap-2">
            {extRefsApplicabili.map(ref => (
              <a
                key={ref.id}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-colors flex items-center gap-1"
              >
                {ref.label} <ExternalLink size={10} />
              </a>
            ))}
          </div>
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
            Pareri ARAN collegati ({pareriCollegati.length})
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

                    <div className="mt-2">
                      {(parere.hashTagsArgomento || parere.tags)?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="inline-block mt-1 mr-1 text-[10px] px-1.5 py-0.5 bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded">
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

export default ArticoloViewer;
