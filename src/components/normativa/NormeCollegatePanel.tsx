import React, { useMemo } from 'react';
import { BookOpen, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { NavigationScope } from '../../types';
import raccoltaDataRaw from '../../data/normativa/raccolta.articles.json';
import guidaDataRaw from '../../data/normativa/guida.schede.json';
import { NormativaArticle, NormativaSchedaGuida } from '../../types';

const raccoltaData = raccoltaDataRaw as NormativaArticle[];
const guidaData = guidaDataRaw as NormativaSchedaGuida[];

interface NormeCollegatePanelProps {
  contextId: string;
  className?: string;
}

export const NormeCollegatePanel: React.FC<NormeCollegatePanelProps> = ({ contextId, className = '' }) => {
  const { dispatch } = useAppContext();

  // Find relevant articles
  const collegate = useMemo(() => {
    // Determine target based on contextId
    let keywords: string[] = [];
    if (contextId === 'fondoDipendenti') {
      keywords = ['Fondo risorse decentrate', 'Costituzione', 'Art. 67', 'Art. 79', 'Utilizzo'];
    } else if (contextId === 'distribuzioneRisorse') {
      keywords = ['Utilizzo', 'Art. 68', 'Art. 80', 'Indennità', 'Progressioni', 'Straordinario'];
    } else if (contextId === 'fondoEQ') {
      keywords = ['Elevate Qualificazioni', 'Retribuzione di posizione', 'Incarichi di EQ'];
    } else if (contextId === 'fondoDirigenza') {
      keywords = ['Dirigenza', 'Retribuzione di risultato'];
    } else {
      keywords = []; // fallback
    }

    // Very naive static filter or fallback to specific articles if we know them
    const matchingArts = raccoltaData.filter(a => {
      // Return true if directly linked (if we had moduliAppCollegati on collection) 
      // or simple keyword match in rubrica
      if (contextId === 'fondoDipendenti' && (a.id.includes('67') || a.id.includes('79'))) return true;
      if (contextId === 'distribuzioneRisorse' && (a.id.includes('68') || a.id.includes('80'))) return true;
      return false;
    }).slice(0, 3);

    const matchingSchede = guidaData.filter(s => {
      return keywords.some(k => 
        s.titolo.toLowerCase().includes(k.toLowerCase()) ||
        (s.testoCompleto || s.testoIntegrale || '').toLowerCase().includes(k.toLowerCase())
      );
    }).slice(0, 2);

    return { arts: matchingArts, schede: matchingSchede };
  }, [contextId]);

  if (collegate.arts.length === 0 && collegate.schede.length === 0) {
    return null;
  }

  const navigateToNormativa = (pageId: string) => {
    dispatch({ type: 'SET_NAVIGATION_SCOPE', payload: NavigationScope.NORMATIVA });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: pageId });
  };

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <LibraryIcon />
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Bussola Normativa</h3>
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        Riferimenti contrattuali consigliati per questa sezione.
      </p>

      <div className="space-y-3">
        {collegate.arts.map(a => (
          <div key={a.id} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer overflow-hidden">
            <div className="flex items-start gap-3 relative z-10" onClick={() => navigateToNormativa('raccoltaSistematica')}>
              <div className="mt-0.5 text-blue-500">
                <BookOpen size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {a.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {a.titolo}
                </div>
              </div>
              <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}

        {collegate.schede.map(s => (
          <div key={s.id} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer overflow-hidden">
            <div className="flex items-start gap-3 relative z-10" onClick={() => navigateToNormativa('guidaContratto')}>
              <div className="mt-0.5 text-emerald-500">
                <FileText size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                  Guida: {s.titolo}
                </div>
                {s.sezione && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {s.sezione}
                  </div>
                )}
              </div>
              <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="absolute inset-0 bg-emerald-50/50 dark:bg-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => navigateToNormativa('normativaHome')}
        className="mt-4 flex items-center justify-center gap-2 w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors pt-2 border-t border-slate-200 dark:border-slate-700/50"
      >
        Vai alla Normativa Completa
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

const LibraryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
    <path d="M4 19.5v-15A2.5 2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);
