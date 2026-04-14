import React, { useState, useMemo } from 'react';
import indiceAnaliticoRaw from '../../data/normativa/normativa.indiceAnalitico.json';
import { IndiceAnaliticoEntry, NavigationScope } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { BookOpen, Hash, Search, FileText } from 'lucide-react';

const indiceData = indiceAnaliticoRaw as IndiceAnaliticoEntry[];

interface GroupedIndice {
  [letter: string]: IndiceAnaliticoEntry[];
}

export const IndiceAnaliticoPage: React.FC = () => {
  const { dispatch } = useAppContext();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return indiceData;
    const q = query.toLowerCase();
    return indiceData.filter(e => 
      e.label.toLowerCase().includes(q) ||
      (e.subLabel || '').toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo<GroupedIndice>(() => {
    const res: GroupedIndice = {};
    filtered.forEach(entry => {
      const letter = entry.label.charAt(0).toUpperCase();
      if (!res[letter]) res[letter] = [];
      res[letter].push(entry);
    });
    const sortedRes: GroupedIndice = {};
    Object.keys(res).sort().forEach(l => {
      sortedRes[l] = res[l].sort((a, b) => a.label.localeCompare(b.label));
    });
    return sortedRes;
  }, [filtered]);

  const navigateToArticle = (articleId: string) => {
    dispatch({ type: 'SET_SELECTED_ARTICLE', payload: articleId });
    dispatch({ type: 'SET_NAVIGATION_SCOPE', payload: NavigationScope.NORMATIVA });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'raccoltaSistematica' });
  };

  const navigateToScheda = (schedaId: string) => {
    dispatch({ type: 'SET_SELECTED_SCHEDA', payload: schedaId });
    dispatch({ type: 'SET_NAVIGATION_SCOPE', payload: NavigationScope.NORMATIVA });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'guidaContratto' });
  };

  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const toggleExpand = (entryId: string) => {
    setExpandedEntries(prev => ({ ...prev, [entryId]: !prev[entryId] }));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 text-text-light dark:text-text-dark animate-fade-in px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <Hash className="text-primary w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white">
              Indice Analitico
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {indiceData.length} voci — estratte dalla Raccolta Sistematica CCNL
            </p>
          </div>
        </div>
        
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cerca voce indice..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Index Alphabetical View */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {Object.entries(grouped).map(([letter, entries]) => (
          <div key={letter} className="break-inside-avoid bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-b border-border-light dark:border-border-dark font-black text-2xl text-slate-300 dark:text-slate-600 text-center">
              {letter}
            </div>
            <div className="p-4 space-y-4">
              {entries.map((entry, idx) => {
                const entryKey = `${entry.id}-${idx}`;
                const isExpanded = !!expandedEntries[entryKey];
                const hasArticles = entry.relatedArticleIds.length > 0;
                const hasSchede = entry.relatedSchedaIds.length > 0;

                return (
                  <div key={entryKey} className="group">
                    <div className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1.5 leading-tight">
                      {entry.label}
                      {entry.subLabel && (
                        <span className="ml-1 text-slate-400 font-normal text-xs">— {entry.subLabel}</span>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 ml-1 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                      {/* Mostra i primi 3 articoli */}
                      {hasArticles && (
                        <div className="space-y-1">
                          {(isExpanded ? entry.relatedArticleIds : entry.relatedArticleIds.slice(0, 3)).map(artId => (
                            <button
                              key={artId}
                              onClick={() => navigateToArticle(artId)}
                              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-left"
                            >
                              <BookOpen size={12} className="shrink-0" />
                              <span className="truncate">{artId.replace(/ccnl-\d+-/, '').replace(/-/g, ' ').replace(/^art /, 'Art. ')}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Mostra le prime 2 schede guida */}
                      {hasSchede && (
                        <div className="space-y-1">
                          {(isExpanded ? entry.relatedSchedaIds : entry.relatedSchedaIds.slice(0, 2)).map(schedaId => (
                            <button
                              key={schedaId}
                              onClick={() => navigateToScheda(schedaId)}
                              className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline text-left leading-tight"
                            >
                              <FileText size={12} className="shrink-0 mt-0.5 self-start" />
                              <span className="line-clamp-2">{schedaId.replace(/^scheda-/, 'Scheda ').replace(/-/g, ' ')}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Pulsante di espansione per vedere tutti i collegamenti */}
                      {((entry.relatedArticleIds.length > 3 || entry.relatedSchedaIds.length > 2)) && (
                        <button
                          onClick={() => toggleExpand(entryKey)}
                          className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors flex items-center gap-1 mt-1"
                        >
                          {isExpanded ? (
                            <>Mostra meno</>
                          ) : (
                            <>+{entry.relatedArticleIds.length + entry.relatedSchedaIds.length - (Math.min(3, entry.relatedArticleIds.length) + Math.min(2, entry.relatedSchedaIds.length))} collegamenti</>
                          )}
                        </button>
                      )}

                      {!hasArticles && !hasSchede && (
                        <p className="text-xs text-slate-400 italic">Nessun collegamento trovato</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
