import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { NavigationScope } from '../../types';
import { isGlobalAdmin } from '../../application/policies/authorizationPolicy';
import { fetchUserProfilesMap } from '../../services/userProfilesHelper';
import {
  ChevronDown,
  Check,
  Search,
  ArrowLeft,
  Menu,
  Layers,
  Lock
} from 'lucide-react';
import { supabase } from '../../services/supabase';

interface EntityYearItem {
  year: number;
  status: string;
  hasAmounts: boolean;
}

interface AreaFondoContextBarProps {
  onToggleMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
  mobileMenuId?: string;
}

export const AreaFondoContextBar: React.FC<AreaFondoContextBarProps> = ({ onToggleMobileMenu, mobileMenuOpen = false, mobileMenuId }) => {
  const identityId = React.useId();
  const selectorId = React.useId();
  const {
    state,
    setScopeAndTab,
    switchYearAtomic,
  } = useAppContext();

  const { currentEntity, currentYear, entities, currentUser, fundData } = state;
  const isAdmin = isGlobalAdmin(currentUser);

  // Snapshot status: authoritative source of truth
  const isClosed = fundData?.metadata?.snapshotStatus === 'CLOSED';

  // Dropdown state for unified "Cambia Fondo"
  const [showFullName, setShowFullName] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminFilter, setAdminFilter] = useState<'all' | 'mine' | 'others'>('all');
  const [userProfiles, setUserProfiles] = useState<Record<string, { name: string; email: string }>>({});
  const [yearsByEntity, setYearsByEntity] = useState<Record<string, EntityYearItem[]>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch profiles cache for admin
  useEffect(() => {
    if (!isAdmin) return;
    let isCancelled = false;
    fetchUserProfilesMap().then(map => {
      if (!isCancelled) setUserProfiles(map);
    });
    return () => { isCancelled = true; };
  }, [isAdmin]);

  // Load available years per entity for the popover
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
            const totaleFondo = fd.totals?.totaleFondo ?? 0;
            const storico = fd.historicalData?.fondoSalarioAccessorioPersonaleNonDirEQ2016 ?? 0;
            const hasAmounts = totaleFondo > 0 || storico > 0;

            map[entId].push({
              year: row.current_year,
              status: snapshotStatus,
              hasAmounts
            });
          });

          Object.keys(map).forEach(id => {
            map[id].sort((a, b) => b.year - a.year);
          });

          setYearsByEntity(map);
        }
      } catch (err) {
        console.warn('[AreaFondoContextBar] Errore caricamento annualità:', err);
      }
    };

    loadAllYears();
    return () => { isCancelled = true; };
  }, [entities, isAdmin, currentUser?.id]);

  // Filtered entities
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [entities, isAdmin, currentUser.id, adminFilter, searchQuery]);

  const handleSelectFondo = async (entity: any, targetYear?: number) => {
    setIsDropdownOpen(false);
    if (!targetYear) {
      const entYears = yearsByEntity[entity.id];
      if (entYears && entYears.length > 0) {
        targetYear = entYears[0].year;
      } else {
        targetYear = currentYear || 2026;
      }
    }
    await switchYearAtomic(targetYear, entity);
  };

  const handleGoToAllFondi = () => {
    setIsDropdownOpen(false);
    setScopeAndTab(NavigationScope.FONDO, 'fondiEnti');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors shadow-xs">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        
        {/* Sinistra: Ritorno a Tutti i Fondi + Nome Ente e Anno Unificati */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full sm:w-auto sm:flex-1">
          <button
            onClick={handleGoToAllFondi}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
            aria-label="Tutti i Fondi degli enti"
            data-testid="back-to-fondi-enti-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tutti i Fondi</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block shrink-0" />

          {/* Nome Ente · Fondo risorse decentrate [ANNO] + Badge Stato Univoco */}
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <h2 className="text-xs sm:text-sm lg:text-base font-extrabold text-slate-900 dark:text-white leading-tight flex items-center min-w-0">
              {currentEntity ? (
                <>
                  <button type="button" className="truncate min-w-0 text-left underline decoration-dotted underline-offset-4" aria-expanded={showFullName} aria-controls={identityId} onClick={() => setShowFullName(v => !v)} aria-label={`Consulta nome completo: ${currentEntity.name}`}>
                    {currentEntity.name}
                  </button>
                  <span className="text-slate-400 font-normal mx-1 sm:mx-1.5 shrink-0">·</span>
                  <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0">Fondo {currentYear || 2026}</span>
                </>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">Nessun fondo selezionato</span>
              )}
            </h2>

            {currentEntity && (
              <span
                data-testid="contextbar-status-badge"
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                  isClosed
                    ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                }`}
              >
                {isClosed ? '🔒 Chiuso' : '● In lavorazione'}
              </span>
            )}
          </div>
        </div>

        {currentEntity && <div hidden={!showFullName} id={identityId} className="order-last w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm break-words" data-testid="full-entity-name">
          <strong>{currentEntity.name}</strong> · Fondo {currentYear} · {isClosed ? 'Chiuso — sola lettura' : 'In lavorazione'}
          {isAdmin && currentEntity.user_id !== currentUser.id && <p>Ente di altro utente. Proprietario: {userProfiles[currentEntity.user_id]?.name || 'altro utente'}</p>}
        </div>}
        {isAdmin && currentEntity && currentEntity.user_id !== currentUser.id && <span className="text-xs text-slate-600" data-testid="foreign-owner-context">Ente di altro utente</span>}
        {/* Destra: Autosave semantico + Pulsante Cambia Fondo + Menu drawer (mobile e tablet) */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          
          {/* Autosave semantico neutro (o sola lettura se chiuso) */}
          <div className="hidden xl:flex items-center text-xs font-medium">
            {isClosed ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs">
                <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                Annualità chiusa · sola lettura
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs">
                Salvataggio automatico
              </span>
            )}
          </div>

          {/* Dropdown Unificato: [ Cambia Fondo ▾ ] con selezione Tupla (Ente, Anno) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-[#cc4331] text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-xs"
              data-testid="area-fondo-entity-selector"
              aria-expanded={isDropdownOpen}
              aria-controls={isDropdownOpen ? selectorId : undefined}
              onKeyDown={e => { if(e.key === 'Escape') { setIsDropdownOpen(false); e.currentTarget.focus(); } }}
              aria-haspopup="true"
            >
              <Layers className="w-3.5 h-3.5 text-[#cc4331] shrink-0" />
              <span>Cambia Fondo</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div id={selectorId} onKeyDown={e => { if(e.key === 'Escape') { e.stopPropagation(); setIsDropdownOpen(false); dropdownRef.current?.querySelector('button')?.focus(); } }} className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      aria-label="Cerca ente per cambiare Fondo"
                      type="text"
                      placeholder="Cerca ente..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#cc4331] text-slate-900 dark:text-white"
                      autoFocus
                    />
                  </div>

                  {/* Filtri Admin: Tutti | Miei | Altri */}
                  {isAdmin && (
                    <div className="flex gap-1.5 mt-2.5">
                      <button
                        type="button"
                        onClick={() => setAdminFilter('all')}
                        className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg transition-colors ${
                          adminFilter === 'all'
                            ? 'bg-[#cc4331] text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        Tutti ({entities.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminFilter('mine')}
                        className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg transition-colors ${
                          adminFilter === 'mine'
                            ? 'bg-[#cc4331] text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        Miei ({entities.filter(e => e.user_id === currentUser.id).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminFilter('others')}
                        className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg transition-colors ${
                          adminFilter === 'others'
                            ? 'bg-[#cc4331] text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        Altri ({entities.filter(e => e.user_id !== currentUser.id).length})
                      </button>
                    </div>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto px-1 py-1 space-y-1">
                  {filteredEntities.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Nessun ente trovato
                    </div>
                  ) : (
                    filteredEntities.map((entity: any) => {
                      const isSelectedEntity = entity.id === currentEntity?.id;
                      const isMine = entity.user_id === currentUser.id;
                      const owner = isMine ? 'me' : (userProfiles[entity.user_id]?.name || 'altro utente');
                      const years = yearsByEntity[entity.id] || [
                        { year: 2026, status: 'OPEN', hasAmounts: false }
                      ];

                      return (
                        <div
                          key={entity.id}
                          className={`p-2.5 rounded-xl transition-colors ${
                            isSelectedEntity
                              ? 'bg-red-50/60 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectFondo(entity)}
                              className="min-w-0 text-left flex-1"
                              title={`Apri ${entity.name}`}
                            >
                              <p className="truncate font-bold text-slate-900 dark:text-white text-xs hover:text-[#cc4331]">
                                {entity.name}
                              </p>
                              {isAdmin && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {isMine ? (
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">Proprietario: tu</span>
                                  ) : (
                                    <span>Proprietario: {owner}</span>
                                  )}
                                </p>
                              )}
                            </button>
                            {isSelectedEntity && <Check className="w-4 h-4 text-[#cc4331] shrink-0" />}
                          </div>

                          {/* Selettore rapido annualità (Tupla Ente + Anno) */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                            {years.map(y => {
                              const isCurrentFondo = isSelectedEntity && currentYear === y.year;
                              const yearIsClosed = y.status === 'CLOSED';

                              return (
                                <button
                                  key={y.year}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectFondo(entity, y.year);
                                  }}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all ${
                                    isCurrentFondo
                                      ? 'bg-[#cc4331] text-white shadow-xs'
                                      : yearIsClosed
                                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                                      : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                                  }`}
                                  title={`Apri ${entity.name} · Fondo ${y.year}`}
                                  data-testid={`select-fondo-${entity.id}-${y.year}`}
                                >
                                  <span>{y.year}</span>
                                  <span className="text-[9px] opacity-80">
                                    {yearIsClosed ? '🔒' : '●'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Link a Tutti i Fondi degli enti */}
                <div className="px-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-right">
                  <button
                    onClick={handleGoToAllFondi}
                    className="text-[11px] font-semibold text-[#cc4331] hover:underline"
                    data-testid="popover-to-fondi-enti"
                  >
                    Vedi tutti i Fondi degli enti →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pulsante Drawer Mobile & Tablet (visibile per < 1024px): [ ☰ Sezioni ] */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Apri sezioni Area Fondo"
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen ? mobileMenuId : undefined}
            data-testid="area-fondo-mobile-menu-btn"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">Sezioni</span>
          </button>

        </div>
      </div>
    </div>
  );
};
