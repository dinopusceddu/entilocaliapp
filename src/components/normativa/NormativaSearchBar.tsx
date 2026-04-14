import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

export type NormativaSearchType = 'all' | 'raccolta' | 'guida';

interface NormativaSearchBarProps {
  onSearch: (query: string, type: NormativaSearchType) => void;
  initialQuery?: string;
  initialType?: NormativaSearchType;
}

export const NormativaSearchBar: React.FC<NormativaSearchBarProps> = ({ 
  onSearch, 
  initialQuery = '', 
  initialType = 'all' 
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<NormativaSearchType>(initialType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim(), type);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-text-light dark:text-text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition shadow-sm text-lg"
          placeholder="Cerca articoli, commi, schede, argomenti..."
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onSearch('', type); }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      <div className="flex gap-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter size={16} />
          </div>
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as NormativaSearchType;
              setType(newType);
              if (query.trim()) {
                onSearch(query.trim(), newType);
              }
            }}
            className="block w-full pl-10 pr-8 py-3 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm appearance-none"
          >
            <option value="all">Tutti i documenti</option>
            <option value="raccolta">Solo Raccolta Sistematica</option>
            <option value="guida">Solo Guida al Contratto</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={!query.trim()}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          Cerca
        </button>
      </div>
    </form>
  );
};
