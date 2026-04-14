import React, { useState, useMemo } from 'react';
import { NormativaSearchBar, NormativaSearchType } from '../../components/normativa/NormativaSearchBar';
import searchIndexRaw from '../../data/normativa/normativa.searchIndex.json';
import { NormativaIndexEntry } from '../../types';
import { BookOpen, FileText, MessageSquare, ChevronRight, Search } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const searchIndex = searchIndexRaw as NormativaIndexEntry[];

export const RicercaNormativaPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<NormativaSearchType>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const { dispatch } = useAppContext();

  const handleSearch = (newQuery: string, newType: NormativaSearchType) => {
    setQuery(newQuery);
    setType(newType);
    setHasSearched(true);
  };

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return searchIndex.filter(entry => {
      // Type filter
      if (type !== 'all' && entry.type !== type) return false;
      
      // Match text or title
      const matchText = entry.content.toLowerCase().includes(lowerQuery);
      const matchTitle = entry.title.toLowerCase().includes(lowerQuery);
      
      return matchText || matchTitle;
    });
  }, [query, type]);

  const highlightSnippet = (text: string, q: string) => {
    if (!q) return text;
    // Find snippet index
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(q.toLowerCase());
    
    if (index === -1) return text.substring(0, 150) + '...';
    
    const start = Math.max(0, index - 60);
    const end = Math.min(text.length, index + q.length + 60);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    // Highlight
    const regex = new RegExp(`(${q})`, 'gi');
    const parts = snippet.split(regex);
    
    return (
      <>
        {parts.map((p, i) => 
          p.toLowerCase() === q.toLowerCase() ? <strong key={i} className="bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200">{p}</strong> : p
        )}
      </>
    );
  };

  const navigateToResult = (entry: NormativaIndexEntry) => {
    if (entry.type === 'articolo') {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'raccoltaSistematica' });
    } else if (entry.type === 'aran') {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'pareriAran' });
    } else {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'guidaContratto' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 text-text-light dark:text-text-dark animate-fade-in px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-800 dark:text-slate-100">Ricerca Normativa</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Cerca all'interno di tutto l'archivio testuale, inclusi contratti e guide applicative.
        </p>
      </div>

      <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark mb-8">
        <NormativaSearchBar onSearch={handleSearch} initialQuery={query} initialType={type} />
      </div>

      {hasSearched && (
        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">
            {results.length} {results.length === 1 ? 'risultato trovato' : 'risultati trovati'} per "{query}"
          </div>

          <div className="grid gap-4">
            {results.map((result) => (
              <div 
                key={result.id}
                onClick={() => navigateToResult(result)}
                className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-5 rounded-xl hover:border-primary hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg shrink-0 mt-1 ${
                    result.type === 'articolo' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                    result.type === 'aran' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                  }`}>
                    {result.type === 'articolo' ? <BookOpen size={20} /> :
                     result.type === 'aran' ? <MessageSquare size={20} /> :
                     <FileText size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                        {result.type === 'articolo' ? 'CCNL' : result.type === 'aran' ? 'Parere ARAN' : 'Guida'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                      {result.title}
                    </h3>
                    {result.subtitle && (
                      <p className="text-xs text-slate-400 mb-1">{result.subtitle}</p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3 mt-2 line-clamp-3">
                      {highlightSnippet(result.content, query)}
                    </p>
                  </div>
                  <div className="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="text-primary" />
                  </div>
                </div>
              </div>
            ))}

            {results.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-surface-dark rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Nessun risultato</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Non abbiamo trovato documenti corrispondenti ai criteri di ricerca.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
