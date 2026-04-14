import React, { useState, useMemo } from 'react';
import pareriDataRaw from '../../data/normativa/aran.pareri.json';
import { NormativaParereAran } from '../../types';
import { MessageSquare, Search, Tag as TagIcon, ChevronDown, ChevronUp } from 'lucide-react';

const pareriData = pareriDataRaw as NormativaParereAran[];

const ParereCard: React.FC<{ parere: NormativaParereAran }> = ({ parere }) => {
  const [expanded, setExpanded] = useState(false);

  // Supporto backward compat e logica di splitting smart
  let rawQuesito = parere.quesito || parere.domanda || '';
  let rawRisposta = parere.risposta || '';
  const dataPub = parere.dataPubblicazione || parere.data || '';
  const argomenti = parere.argomenti?.length ? parere.argomenti : (parere.tags || []);

  // Se la risposta è vuota ma il quesito contiene un a capo, separiamo
  if (!rawRisposta.trim() && rawQuesito.includes('\n')) {
    const parts = rawQuesito.split(/\n+/);
    rawQuesito = parts[0];
    rawRisposta = parts.slice(1).join('\n\n');
  }

  const hasRisposta = rawRisposta.trim().length > 0;
  // Se è tutto in un unico blocco senza \n ma è molto lungo
  const isQuestionTooLong = rawQuesito.length > 300;
  const canExpand = hasRisposta || isQuestionTooLong;

  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Parere <span className="text-primary-dark dark:text-primary-light">#{parere.id}</span>
          </span>
          {dataPub && (
            <span className="text-xs text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {dataPub}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {argomenti.slice(0, 4).map((arg, idx) => (
            <span key={idx} className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">
              <TagIcon size={10} /> {arg}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Quesito */}
        <div className="mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Quesito</h4>
          <p className={`font-medium text-slate-700 dark:text-slate-200 leading-relaxed text-sm ${!expanded && 'line-clamp-4'}`}>
            {rawQuesito}
          </p>
        </div>

        {/* Pulsante di espansione */}
        {canExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline mb-3"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded 
              ? (hasRisposta ? 'Nascondi risposta' : 'Mostra meno') 
              : (hasRisposta ? 'Leggi risposta / orientamento ARAN' : 'Leggi tutto')
            }
          </button>
        )}

        {/* Risposta - se disponibile ed espanso */}
        {expanded && hasRisposta && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 mb-2">
              Risposta / Orientamento Applicativo
            </h4>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
              {rawRisposta}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PareriAranPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Raccoglie tutti i tag unici
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    pareriData.forEach(p => {
      (p.argomenti || []).forEach(t => tagSet.add(t));
      (p.tags || []).forEach(t => tagSet.add(t));
    });
    return [...tagSet].sort();
  }, []);

  const filteredPareri = useMemo(() => {
    let result = pareriData;
    if (selectedTag) {
      result = result.filter(p => 
        (p.argomenti || []).includes(selectedTag) ||
        (p.tags || []).includes(selectedTag)
      );
    }
    if (!query.trim()) return result;
    const q = query.toLowerCase();
    return result.filter(p =>
      p.id.toLowerCase().includes(q) ||
      (p.quesito || p.domanda || '').toLowerCase().includes(q) ||
      (p.risposta || '').toLowerCase().includes(q) ||
      (p.argomenti || p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [query, selectedTag]);

  return (
    <div className="max-w-5xl mx-auto py-8 text-text-light dark:text-text-dark animate-fade-in px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
        <div className="flex items-center gap-4">
          <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-xl text-rose-600 dark:text-rose-400">
            <MessageSquare size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Archivio Pareri ARAN</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {pareriData.length} pareri — Comparto Funzioni Locali
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per codice, testo o argomento..."
            className="block w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Tag filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag('')}
          className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
            !selectedTag
              ? 'bg-primary text-white border-primary'
              : 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary'
          }`}
        >
          Tutti
        </button>
        {allTags.slice(0, 30).map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
              selectedTag === tag
                ? 'bg-rose-600 text-white border-rose-600'
                : 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-rose-400 hover:text-rose-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Risultati */}
      <div className="text-xs text-slate-500 mb-3">
        {filteredPareri.length} pareri trovati {selectedTag && `per "${selectedTag}"`} {query && `contengono "${query}"`}
      </div>

      <div className="space-y-4">
        {filteredPareri.map((parere) => (
          <ParereCard key={parere.id} parere={parere} />
        ))}
        {filteredPareri.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nessun parere trovato per "{query || selectedTag}"
          </div>
        )}
      </div>
    </div>
  );
};
