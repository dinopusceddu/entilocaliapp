import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { NavigationScope } from '../types';
import { isGlobalAdmin } from '../application/policies/authorizationPolicy';
import { fetchUserProfilesMap, UserProfileSummary } from '../services/userProfilesHelper';
import { supabase } from '../services/supabase';
import { hasMeaningfulFundAmounts } from '../features/wizard2026/entry/detectFundDataPresence';
import {
  ArrowLeft,
  Search,
  Plus,
  Building2,
  Clock,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  Sliders,
  Table as TableIcon,
  List as ListIcon
} from 'lucide-react';

interface EntityYearItem {
  year: number;
  status: string;
  hasAmounts: boolean;
}

export const FondiEntiPage: React.FC = () => {
  const {
    state,
    setScopeAndTab,
    switchYearAtomic,
    createEntity,
    renameEntity,
    deleteEntity
  } = useAppContext();

  const { entities, currentEntity, currentYear, currentUser } = state;
  const isAdmin = isGlobalAdmin(currentUser);

  // Filtri e ricerca
  const [searchTerm, setSearchTerm] = useState('');
  const [adminFilter, setAdminFilter] = useState<'all' | 'mine' | 'others'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');

  // Mappa profili utente per admin
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfileSummary>>({});

  // Annualità caricate per ente (entity_id -> EntityYearItem[])
  const [yearsByEntity, setYearsByEntity] = useState<Record<string, EntityYearItem[]>>({});

  // Modali
  const [isNewEntityModalOpen, setIsNewEntityModalOpen] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityInitialYear, setNewEntityInitialYear] = useState<number>(new Date().getFullYear());

  const [entityForNewYear, setEntityForNewYear] = useState<any | null>(null);
  const [newYearValue, setNewYearValue] = useState<number>(new Date().getFullYear() + 1);

  const [entityToRename, setEntityToRename] = useState<any | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [entityToDelete, setEntityToDelete] = useState<any | null>(null);

  // Menu secondario aperto (entity_id)
  const [activeMenuEntityId, setActiveMenuEntityId] = useState<string | null>(null);
  const [expandedEntities, setExpandedEntities] = useState<Record<string, boolean>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  // Caricamento profili (se admin)
  useEffect(() => {
    if (isAdmin) {
      fetchUserProfilesMap().then(setUserProfiles);
    }
  }, [isAdmin]);

  // Caricamento annualità per gli enti visibili
  useEffect(() => {
    let isCancelled = false;
    const loadAllYears = async () => {
      try {
        const query = supabase
          .from('user_app_state')
          .select('entity_id, current_year, fund_data');

        const { data, error } = await query;
        if (error) throw error;

        if (!isCancelled && data) {
          const map: Record<string, EntityYearItem[]> = {};
          data.forEach((row: any) => {
            const entId = row.entity_id;
            if (!map[entId]) map[entId] = [];

            const fd = row.fund_data || {};
            const snapshotStatus = fd.metadata?.snapshotStatus || 'OPEN';
            const hasAmounts = hasMeaningfulFundAmounts(fd);

            map[entId].push({
              year: row.current_year,
              status: snapshotStatus,
              hasAmounts
            });
          });

          // Ordina anni decrescenti
          Object.keys(map).forEach(id => {
            map[id].sort((a, b) => b.year - a.year);
          });

          setYearsByEntity(map);
        }
      } catch (err) {
        console.warn('[FondiEntiPage] Errore caricamento annualità:', err);
      }
    };

    loadAllYears();
    return () => { isCancelled = true; };
  }, [entities, isAdmin, currentUser?.id]);

  // Chiusura menu al click esterno
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuEntityId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Progresso bozza locale per l'ultimo lavoro attivo
  const activeContextDraftProgress = useMemo(() => {
    if (!currentUser?.id || !currentEntity?.id || !currentYear) return null;
    try {
      const key = `fl_wizard2026_draft_${currentUser.id}_${currentEntity.id}_${currentYear}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const count = parsed?.meta?.completedSteps?.length ?? 0;
        return `${count}/8`;
      }
    } catch {
      // ignore
    }
    return null;
  }, [currentUser?.id, currentEntity?.id, currentYear]);

  // Filtraggio enti in base a ruolo, adminFilter e ricerca
  const filteredEntities = useMemo(() => {
    let list = entities;

    if (!isAdmin) {
      list = entities.filter(e => e.user_id === currentUser.id);
    } else {
      if (adminFilter === 'mine') {
        list = entities.filter(e => e.user_id === currentUser.id);
      } else if (adminFilter === 'others') {
        list = entities.filter(e => e.user_id !== currentUser.id);
      }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e => {
        const nameMatch = e.name.toLowerCase().includes(q);
        const creator = userProfiles[e.user_id]?.name?.toLowerCase() || '';
        const email = userProfiles[e.user_id]?.email?.toLowerCase() || '';
        return nameMatch || creator.includes(q) || email.includes(q);
      });
    }

    return list;
  }, [entities, isAdmin, currentUser.id, adminFilter, searchTerm, userProfiles]);

  // Conteggi per tab Admin
  const adminCounts = useMemo(() => {
    if (!isAdmin) return { all: 0, mine: 0, others: 0 };
    return {
      all: entities.length,
      mine: entities.filter(e => e.user_id === currentUser.id).length,
      others: entities.filter(e => e.user_id !== currentUser.id).length,
    };
  }, [entities, isAdmin, currentUser.id]);

  // Azione: Apri Fondo specifico (Ente + Anno)
  const handleOpenFondo = async (entity: any, year: number) => {
    await switchYearAtomic(year, entity);
    setScopeAndTab(NavigationScope.FONDO, 'home');
  };

  // Submit Nuovo Ente
  const handleCreateEntitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;

    try {
      const createdName = newEntityName.trim();
      const created = await createEntity(createdName);
      setIsNewEntityModalOpen(false);
      setNewEntityName('');

      const targetEntity = created || state.entities.find(ent => ent.name === createdName);
      if (targetEntity) {
        await switchYearAtomic(newEntityInitialYear, targetEntity);
        setScopeAndTab(NavigationScope.FONDO, 'home');
      }
    } catch (err) {
      console.error('Errore creazione ente:', err);
    }
  };

  // Submit Nuova Annualità per Ente esistente
  const handleCreateYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityForNewYear || isNaN(newYearValue) || newYearValue < 2000 || newYearValue > 2100) return;

    try {
      await switchYearAtomic(newYearValue, entityForNewYear);
      setEntityForNewYear(null);
      setScopeAndTab(NavigationScope.FONDO, 'home');
    } catch (err) {
      console.error('Errore creazione annualità:', err);
    }
  };

  // Submit Rinomina Ente
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityToRename || !renameValue.trim()) return;
    try {
      await renameEntity(entityToRename.id, renameValue.trim());
      setEntityToRename(null);
    } catch (err) {
      console.error('Errore rinomina ente:', err);
    }
  };

  // Submit Elimina Ente
  const handleDeleteConfirm = async () => {
    if (!entityToDelete) return;
    try {
      await deleteEntity(entityToDelete.id, { skipConfirm: true });
      setEntityToDelete(null);
    } catch (err) {
      console.error('Errore eliminazione ente:', err);
    }
  };

  const currentEntityYearInfo = useMemo(() => {
    if (!currentEntity?.id || !currentYear) return null;
    const yearList = yearsByEntity[currentEntity.id];
    const found = yearList?.find(y => y.year === currentYear);
    if (found) return found;
    return {
      year: currentYear,
      status: state.fundData?.metadata?.snapshotStatus || 'OPEN',
      hasAmounts: hasMeaningfulFundAmounts(state.fundData),
    };
  }, [currentEntity?.id, currentYear, yearsByEntity, state.fundData]);

  return (
    <div className="w-full max-w-[1200px] mx-auto py-6 px-4 sm:px-6 space-y-8 animate-fade-in pb-16 min-w-0" data-testid="fondi-enti-page">
      
      {/* Intestazione e Ritorno a Toolbox */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <button
          onClick={() => setScopeAndTab(NavigationScope.DASHBOARD, 'dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          data-testid="btn-back-to-toolbox"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna a Toolbox</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#cc4331] mb-1">
              <span>Strumento</span>
              <span>·</span>
              <span>Costituzione e distribuzione del Fondo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fondi degli enti
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Seleziona un ente e un&apos;annualità per entrare nella Cabina di regia del Fondo.
            </p>
          </div>

          <button
            onClick={() => setIsNewEntityModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all self-start sm:self-auto"
            data-testid="btn-nuovo-ente"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo ente</span>
          </button>
        </div>
      </div>

      {/* Box: RIPRENDI IL FONDO (se presente contesto recente) */}
      {currentEntity && currentYear && (
        <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 border border-red-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Riprendi il Fondo
              </span>
              {currentEntityYearInfo?.status === 'CLOSED' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 shrink-0">
                  CHIUSO
                </span>
              ) : currentEntityYearInfo?.hasAmounts ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                  ● IN LAVORAZIONE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                  ○ SENZA IMPORTI
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white break-words">
              {currentEntity.name} · Fondo {currentYear}
            </h3>
            {activeContextDraftProgress && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Bozza locale su questo dispositivo: {activeContextDraftProgress} passaggi</span>
              </p>
            )}
          </div>

          <button
            onClick={() => handleOpenFondo(currentEntity, currentYear)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all w-full sm:w-auto shrink-0"
            data-testid="btn-continua-ultimo-lavoro"
          >
            <span>Riprendi il Fondo {currentYear}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra di Controllo: Ricerca + Filtri Admin + Switch Vista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        {/* Ricerca */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={isAdmin ? "Cerca ente o creatore..." : "Cerca ente..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#cc4331] text-slate-900 dark:text-white shadow-sm"
            data-testid="search-enti-input"
          />
        </div>

        {/* Controlli Admin e Vista */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setAdminFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  adminFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                data-testid="filter-all"
              >
                Tutti ({adminCounts.all})
              </button>
              <button
                type="button"
                onClick={() => setAdminFilter('mine')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  adminFilter === 'mine'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                data-testid="filter-mine"
              >
                Miei ({adminCounts.mine})
              </button>
              <button
                type="button"
                onClick={() => setAdminFilter('others')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  adminFilter === 'others'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                data-testid="filter-others"
              >
                Altri ({adminCounts.others})
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-[#cc4331] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista a schede"
                data-testid="view-toggle-list"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-slate-700 text-[#cc4331] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista tabella compatta"
                data-testid="view-toggle-compact"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LISTA DEGLI ENTI */}
      {filteredEntities.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Nessun ente trovato
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm ? "Nessun ente corrisponde ai criteri di ricerca." : "Inizia creando il tuo primo ente per gestire il Fondo."}
          </p>
          <button
            onClick={() => setIsNewEntityModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crea nuovo ente</span>
          </button>
        </div>
      ) : viewMode === 'compact' && isAdmin ? (
        /* VISTA COMPATTA TABELLARE (Solo Admin con molti enti) */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm" data-testid="table-compact-view">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ente</th>
                  <th className="py-3 px-4">Creatore</th>
                  <th className="py-3 px-4">Annualità del Fondo</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEntities.map(entity => {
                  const isMine = entity.user_id === currentUser.id;
                  const creatorName = isMine ? 'me' : (userProfiles[entity.user_id]?.name || 'altro utente');
                  const years = yearsByEntity[entity.id] || [{ year: 2026, status: 'OPEN', hasAmounts: false }];

                  return (
                    <tr key={entity.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {entity.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {isMine ? (
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">Creato da: me</span>
                        ) : (
                          <span>Creato da: {creatorName}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {years.map(y => (
                            <button
                              key={y.year}
                              onClick={() => handleOpenFondo(entity, y.year)}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                                y.status === 'CLOSED'
                                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                                  : y.hasAmounts
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                              }`}
                              title={`Apri Fondo ${y.year} per ${entity.name}`}
                            >
                              {y.year} {y.status === 'CLOSED' ? '✓' : ''}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setEntityForNewYear(entity);
                            setNewYearValue(new Date().getFullYear() + 1);
                          }}
                          className="text-[11px] font-semibold text-[#cc4331] hover:underline"
                        >
                          + Annualità
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISTA LISTA STRUTTURATA (Default per Utente e Admin) */
        <div className="space-y-3 sm:space-y-4" data-testid="fondi-enti-list">
          {filteredEntities.map(entity => {
            const isMine = entity.user_id === currentUser.id;
            const creatorName = isMine ? 'me' : (userProfiles[entity.user_id]?.name || 'altro utente');
            const allYears = yearsByEntity[entity.id] || [{ year: 2026, status: 'OPEN', hasAmounts: false }];
            const isExpanded = expandedEntities[entity.id] || false;
            const displayedYears = isExpanded || allYears.length <= 2 ? allYears : allYears.slice(0, 2);

            return (
              <div
                key={entity.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-2.5 sm:space-y-3"
                data-testid={`entity-card-${entity.id}`}
              >
                {/* Riga Intestazione Ente */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-2.5">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="size-8 sm:size-9 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#cc4331] flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {entity.name}
                      </h3>
                      {isAdmin && (
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                          {isMine ? (
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">Creato da: me</span>
                          ) : (
                            <span>Creato da: {creatorName}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Menu Secondario (⋯) */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuEntityId(activeMenuEntityId === entity.id ? null : entity.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Opzioni ente"
                      aria-label="Opzioni ente"
                      data-testid="menu-actions-btn"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuEntityId === entity.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                        data-testid="entity-dropdown-menu"
                      >
                        <button
                          onClick={() => {
                            setActiveMenuEntityId(null);
                            setEntityToRename(entity);
                            setRenameValue(entity.name);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Rinomina ente</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuEntityId(null);
                            setScopeAndTab(NavigationScope.DASHBOARD, 'entityYearManagement');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Gestione avanzata</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuEntityId(null);
                            setEntityToDelete(entity);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Elimina ente</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sotto-righe Annualità (compatte con wrap su mobile) */}
                <div className="space-y-2 pt-0.5">
                  {displayedYears.map(y => {
                    const isClosed = y.status === 'CLOSED';
                    const hasData = y.hasAmounts;

                    return (
                      <div
                        key={y.year}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                            {y.year}
                          </span>

                          {isClosed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                              🔒 CHIUSA
                            </span>
                          ) : hasData ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                              ● IN LAVORAZIONE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              ○ SENZA IMPORTI
                            </span>
                          )}
                        </div>

                        {/* CTA Compatta */}
                        <button
                          onClick={() => handleOpenFondo(entity, y.year)}
                          className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto ${
                            isClosed
                              ? 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                              : hasData
                                ? 'bg-[#cc4331] hover:bg-[#b53a2a] text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                          }`}
                          data-testid={`btn-open-fondo-${entity.id}-${y.year}`}
                        >
                          <span>{isClosed ? 'Consulta' : hasData ? 'Continua' : 'Apri'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Toggle Mostra altre annualità (se > 2) */}
                  {allYears.length > 2 && (
                    <button
                      onClick={() => setExpandedEntities(prev => ({ ...prev, [entity.id]: !isExpanded }))}
                      className="text-[11px] font-semibold text-[#cc4331] hover:underline block pt-0.5"
                    >
                      {isExpanded
                        ? 'Mostra meno annualità ▴'
                        : `Mostra altre ${allYears.length - 2} annualità ▾`}
                    </button>
                  )}

                  {/* Bottone + Nuova Annualità per questo ente */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setEntityForNewYear(entity);
                        setNewYearValue(new Date().getFullYear() + 1);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#cc4331] hover:underline"
                      data-testid="btn-nuova-annualita"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nuova annualità</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: NUOVO ENTE */}
      {isNewEntityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150" data-testid="modal-nuovo-ente">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Nuovo Ente
              </h3>
              <button
                onClick={() => setIsNewEntityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
                data-testid="close-modal-nuovo-ente"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEntitySubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Denominazione dell&apos;Ente
                </label>
                <input
                  type="text"
                  placeholder="Es. Comune di..."
                  value={newEntityName}
                  onChange={e => setNewEntityName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#cc4331] text-slate-900 dark:text-white"
                  autoFocus
                  required
                  data-testid="input-new-entity-name"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Annualità iniziale del Fondo
                </label>
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  value={newEntityInitialYear}
                  onChange={e => setNewEntityInitialYear(parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#cc4331] text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsNewEntityModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white text-xs font-bold shadow-xs transition-all"
                  data-testid="submit-create-entity"
                >
                  Crea e apri Fondo →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUOVA ANNUALITÀ */}
      {entityForNewYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150" data-testid="modal-nuova-annualita">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Nuova annualità
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {entityForNewYear.name}
                </p>
              </div>
              <button
                onClick={() => setEntityForNewYear(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
                data-testid="close-modal-nuova-annualita"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateYearSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Esercizio (Anno)
                </label>
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  value={newYearValue}
                  onChange={e => setNewYearValue(parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#cc4331] text-slate-900 dark:text-white"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEntityForNewYear(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white text-xs font-bold shadow-xs transition-all"
                  data-testid="submit-create-year"
                >
                  Continua →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RINOMINA ENTE */}
      {entityToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Rinomina Ente
            </h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4 text-xs sm:text-sm">
              <input
                type="text"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#cc4331] text-slate-900 dark:text-white"
                autoFocus
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEntityToRename(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#cc4331] text-white text-xs font-bold shadow-xs"
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFERMA ELIMINAZIONE ENTE */}
      {entityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-red-200 dark:border-red-900 space-y-4">
            <div className="size-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Elimina {entityToDelete.name}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Questa operazione eliminerà l&apos;ente e tutte le configurazioni di Fondo ad esso associate.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEntityToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
              >
                Elimina definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
