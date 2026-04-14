import React, { useState, useMemo, useEffect } from 'react';
import ArticoloViewer from '../../components/normativa/ArticoloViewer';
import { NormativaArticle, NormativaParereAran, NormativaExternalRef } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import raccoltaDataRaw from '../../data/normativa/raccolta.articles.json';
import pareriDataRaw from '../../data/normativa/aran.pareri.json';
import extRefsDataRaw from '../../data/normativa/riferimenti.esterni.json';
import { ChevronRight, ChevronDown, AlignLeft } from 'lucide-react';

const raccoltaData = raccoltaDataRaw as NormativaArticle[];
const pareriData = pareriDataRaw as NormativaParereAran[];
const extRefsData = extRefsDataRaw as NormativaExternalRef[];

interface GroupedNodes {
  [titolo: string]: {
    [capo: string]: NormativaArticle[];
  };
}

export const RaccoltaPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    state.selectedArticleId || (raccoltaData.length > 0 ? raccoltaData[0].id : null)
  );

  const [expandedTitles, setExpandedTitles] = useState<Record<string, boolean>>({});

  // Listen for external selection (from Indice Analitico)
  useEffect(() => {
    if (state.selectedArticleId) {
      setSelectedArticleId(state.selectedArticleId);
      
      // Auto-expand the title section containing this article
      const article = raccoltaData.find(a => a.id === state.selectedArticleId);
      if (article && article.titoloSezione) {
        setExpandedTitles(prev => ({ ...prev, [article.titoloSezione]: true }));
      }
      
      // Clear the global selection after consuming it
      dispatch({ type: 'SET_SELECTED_ARTICLE', payload: undefined });
    }
  }, [state.selectedArticleId, dispatch]);

  // Grouping the flat array into a dynamic tree for the sidebar
  const hierarchy = useMemo<GroupedNodes>(() => {
    const tree: GroupedNodes = {};
    raccoltaData.forEach((art) => {
      const titolo = art.titoloSezione || 'Nessun Titolo';
      const capo = art.capo || 'Senza Capo';
      
      if (!tree[titolo]) tree[titolo] = {};
      if (!tree[titolo][capo]) tree[titolo][capo] = [];
      
      tree[titolo][capo].push(art);
    });
    return tree;
  }, []);

  const selectedArticle = useMemo(() => 
    raccoltaData.find(a => a.id === selectedArticleId), 
  [selectedArticleId]);

  const toggleTitolo = (titolo: string) => {
    setExpandedTitles(prev => ({ ...prev, [titolo]: !prev[titolo] }));
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6 text-text-light dark:text-text-dark">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col shrink-0">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-sm">
          <AlignLeft size={18} /> Indice Raccolta
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-1 custom-scrollbar">
          {Object.entries(hierarchy).map(([titolo, capi]) => {
            const isExpanded = !!expandedTitles[titolo];
            return (
              <div key={titolo} className="select-none">
                <div 
                  className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md cursor-pointer font-semibold text-sm transition-colors text-slate-800 dark:text-slate-200"
                  onClick={() => toggleTitolo(titolo)}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="truncate" title={titolo}>{titolo}</span>
                </div>
                
                {isExpanded && (
                  <div className="ml-4 mt-1 border-l border-slate-200 dark:border-slate-700 space-y-1">
                    {Object.entries(capi).map(([capo, articoli]) => (
                      <div key={capo} className="pl-3 py-1">
                        {capo !== 'Senza Capo' && (
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 truncate" title={capo}>
                            {capo}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          {articoli.map(art => (
                            <div 
                              key={art.id}
                              onClick={() => setSelectedArticleId(art.id)}
                              className={`text-sm px-2 py-1.5 rounded-md cursor-pointer transition-colors truncate ${
                                selectedArticleId === art.id 
                                ? 'bg-primary/10 text-primary-dark dark:text-primary-light font-bold border-l-2 border-primary' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 border-l-2 border-transparent'
                              }`}
                              title={`${art.label} - ${art.titolo}`}
                            >
                              <span className="font-medium">{art.label}</span> <span className="opacity-75">- {art.titolo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
        {selectedArticle ? (
          <ArticoloViewer
            article={selectedArticle}
            pareriCollegati={pareriData.filter(p => 
              selectedArticle.pareriCollegati?.includes(p.id)
            )}
            riferimentiEsterni={extRefsData}
            onNavigateToArticle={(artId) => setSelectedArticleId(artId)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            Seleziona un articolo dall'indice per leggerne il testo.
          </div>
        )}
      </div>
    </div>
  );
};
