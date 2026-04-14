import React, { useState, useMemo, useEffect } from 'react';
import SchedaGuidaViewer from '../../components/normativa/SchedaGuidaViewer';
import { NormativaSchedaGuida, NormativaParereAran } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import guidaDataRaw from '../../data/normativa/guida.schede.json';
import pareriDataRaw from '../../data/normativa/aran.pareri.json';
import { AlignLeft } from 'lucide-react';

const guidaData = guidaDataRaw as NormativaSchedaGuida[];
const pareriData = pareriDataRaw as NormativaParereAran[];

// Organize by sezione
interface GroupedSchede {
  [sezione: string]: NormativaSchedaGuida[];
}

export const GuidaPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [selectedSchedaId, setSelectedSchedaId] = useState<string | null>(
    state.selectedSchedaId || (guidaData.length > 0 ? guidaData[0].id : null)
  );

  // Listen for external selection (from Indice Analitico)
  useEffect(() => {
    if (state.selectedSchedaId) {
      setSelectedSchedaId(state.selectedSchedaId);
      
      // Clear the global selection after consuming it
      dispatch({ type: 'SET_SELECTED_SCHEDA', payload: undefined });
    }
  }, [state.selectedSchedaId, dispatch]);

  const hierarchy = useMemo<GroupedSchede>(() => {
    const tree: GroupedSchede = {};
    guidaData.forEach((scheda) => {
      const sez = scheda.sezione || 'Senza Sezione';
      if (!tree[sez]) tree[sez] = [];
      tree[sez].push(scheda);
    });
    return tree;
  }, []);

  const selectedScheda = useMemo(() => 
    guidaData.find(s => s.id === selectedSchedaId), 
  [selectedSchedaId]);

  const connectedPareri = useMemo(() => {
    if (!selectedScheda) return [];
    const relatedIds = selectedScheda.pareriCorrelati || [];
    return pareriData.filter(p => relatedIds.includes(p.id));
  }, [selectedScheda]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6 text-text-light dark:text-text-dark">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col shrink-0">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-border-light dark:border-border-dark flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-sm">
          <AlignLeft size={18} /> Sezioni Guida
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-4 custom-scrollbar">
          {Object.entries(hierarchy).map(([sezione, schede]) => (
            <div key={sezione} className="select-none">
              {sezione !== 'Senza Sezione' && (
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">
                  {sezione}
                </div>
              )}
              <div className="space-y-1">
                {schede.map(scheda => (
                  <div 
                    key={scheda.id}
                    onClick={() => setSelectedSchedaId(scheda.id)}
                    className={`text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      selectedSchedaId === scheda.id 
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900'
                    }`}
                  >
                    {scheda.titolo}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
        {selectedScheda ? (
          <SchedaGuidaViewer scheda={selectedScheda} pareriCollegati={connectedPareri} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            Seleziona una scheda dalla guida per visualizzarne i dettagli.
          </div>
        )}
      </div>
    </div>
  );
};
