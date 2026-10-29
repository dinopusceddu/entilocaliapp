import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { NavigationScope } from '../types';
import { canAccessAdminArea } from '../application/policies/authorizationPolicy';
import { hasMeaningfulFundAmounts } from '../features/wizard2026/entry/detectFundDataPresence';
import {
  Landmark,
  Calculator,
  Library,
  MessageCircle,
  Users,
  ArrowRight,
  Clock
} from 'lucide-react';

export const ToolboxHomePage: React.FC = () => {
  const { state, setScopeAndTab } = useAppContext();
  const { currentUser, currentEntity, currentYear, fundData } = state;

  const isAdmin = canAccessAdminArea(currentUser);

  // Verifica contesto recente
  const hasRecentContext = !!currentEntity && !!currentYear;

  const currentSnapshotStatus = fundData?.metadata?.snapshotStatus || 'OPEN';
  const hasCurrentAmounts = useMemo(() => {
    return hasMeaningfulFundAmounts(fundData);
  }, [fundData]);

  // Calcolo dati ultimo lavoro (es. Raccolta dati: 6/8)
  const wizardProgress = useMemo(() => {
    if (!currentUser?.id || !currentEntity?.id || !currentYear) return null;
    try {
      const key = `fl_wizard2026_draft_${currentUser.id}_${currentEntity.id}_${currentYear}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const completed = parsed?.meta?.completedSteps?.length ?? 0;
        return `${completed}/8`;
      }
    } catch {
      // ignore
    }
    return null;
  }, [currentUser?.id, currentEntity?.id, currentYear]);

  // Gestione navigazione
  const handleOpenFondo = () => {
    setScopeAndTab(NavigationScope.FONDO, 'home');
  };

  const handleOpenFondiEnti = () => {
    setScopeAndTab(NavigationScope.FONDO, 'fondiEnti');
  };

  const handleOpenModule = (scope: NavigationScope, tabId: string) => {
    setScopeAndTab(scope, tabId);
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6 px-4 sm:px-6 space-y-8 animate-fade-in">
      
      {/* Header Toolbox */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#cc4331] mb-1">
              <span>FP CGIL</span>
              <span>·</span>
              <span>Toolbox Funzioni Locali</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Strumenti per delegate, delegati, RSU e strutture territoriali
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Seleziona lo strumento di lavoro per iniziare.
            </p>
          </div>
        </div>
      </div>

      {/* SEZIONE 1: I TUOI STRUMENTI */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          I Tuoi Strumenti
        </h2>

        {/* HERO CARD COMPATTATA (15-25% meno spazio verticale) */}
        <div
          className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-800 border-2 border-[#cc4331]/30 hover:border-[#cc4331] transition-all shadow-sm relative overflow-hidden"
          data-testid="hero-card-fondo"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-[#cc4331] text-[11px] font-bold uppercase tracking-wider">
                <Landmark className="size-3.5" />
                <span>Strumento Principale</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Costituzione e distribuzione del Fondo
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                  Costituisci, verifica e distribuisci il Fondo delle risorse decentrate. Percorso guidato, controlli e documentazione.
                </p>
              </div>

              {/* Box Riprendi il Fondo (se presente contesto recente) */}
              {hasRecentContext && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3" />
                      Riprendi il Fondo
                    </span>
                    {currentSnapshotStatus === 'CLOSED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-[9px] font-bold">
                        CHIUSO
                      </span>
                    ) : hasCurrentAmounts ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[9px] font-bold">
                        ● IN LAVORAZIONE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold">
                        ○ SENZA IMPORTI
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base min-w-0 break-words">
                      {currentEntity.name} · {currentYear}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Bozza locale: {wizardProgress ? `${wizardProgress} passaggi` : 'in corso'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2.5 shrink-0 lg:w-64">
              {hasRecentContext ? (
                <>
                  <button
                    onClick={handleOpenFondo}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white font-bold text-sm transition-all shadow-xs group"
                    data-testid="cta-continue-fondo"
                  >
                    <span>Riprendi il Fondo {currentYear}</span>
                    <ArrowRight className="size-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={handleOpenFondiEnti}
                    className="w-full py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                    data-testid="cta-open-fondo-tool"
                  >
                    Tutti i Fondi
                  </button>
                </>
              ) : (
                <button
                  onClick={handleOpenFondiEnti}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#cc4331] hover:bg-[#b53a2a] text-white font-bold text-sm transition-all shadow-xs"
                  data-testid="cta-open-fondo-tool"
                >
                  <span>Apri tutti i Fondi</span>
                  <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEZIONE 2: CONTRATTAZIONE E SALARIO (Section 4) */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Contrattazione e Salario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => handleOpenModule(NavigationScope.DASHBOARD, 'compensatoreDelegato')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-[#cc4331]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            data-testid="card-straordinari"
          >
            <div>
              <div className="size-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-[#cc4331] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Calculator className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Straordinari
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                Calcoli e verifiche di straordinari, supplementari e turni aggiornati al CCNL 23.02.2026.
              </p>
            </div>

            <div className="flex items-center text-xs font-bold text-[#cc4331] gap-1 group-hover:gap-2 transition-all">
              <span>Apri</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenModule(NavigationScope.DASHBOARD, 'simulatoreCcnl20252027')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-teal-500/50 hover:shadow-md focus-visible:outline-teal-700 transition-all cursor-pointer flex flex-col justify-between group text-left"
            data-testid="card-simulatore-ccnl-25-27"
          >
            <div>
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="size-12 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-[#0f766e] dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calculator className="size-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">CCNL 28.10.2026</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Arretrati, Costo Orario e Cedolino 2025-2027</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">Calcolo individuale degli arretrati 2025-2026, quattro basi orarie e simulazione busta paga a regime. Export Excel e PDF.</p>
            </div>
            <span className="flex items-center text-xs font-bold text-[#0f766e] dark:text-teal-300 gap-1 group-hover:gap-2 transition-all">Apri il calcolatore<ArrowRight className="size-3.5" /></span>
          </button>
        </div>
      </div>

      {/* SEZIONE 3: SUPPORTO E CONSULTAZIONE */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Supporto e Consultazione
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card Normativa e Contratti */}
          <div
            onClick={() => handleOpenModule(NavigationScope.NORMATIVA, 'normativaHome')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            data-testid="card-normativa"
          >
            <div>
              <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Library className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Normativa e Contratti
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                Raccolta sistematica CCNL, Guida al Contratto ed archivio pareri ARAN coordinati.
              </p>
            </div>

            <div className="flex items-center text-xs font-bold text-indigo-600 gap-1 group-hover:gap-2 transition-all">
              <span>Consulta</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>

          {/* Card Comunicazioni */}
          <div
            onClick={() => handleOpenModule(NavigationScope.COMUNICAZIONI, 'messages')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            data-testid="card-comunicazioni"
          >
            <div>
              <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MessageCircle className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Comunicazioni
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                Messaggi interni, notifiche operative e invio segnalazioni di feedback.
              </p>
            </div>

            <div className="flex items-center text-xs font-bold text-emerald-600 gap-1 group-hover:gap-2 transition-all">
              <span>Consulta</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* SEZIONE 4: AMMINISTRAZIONE (Solo Amministratori) */}
      {isAdmin && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Amministrazione
            </h2>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
              Solo Amministratori
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gestione Utenti */}
            <div
              onClick={() => handleOpenModule(NavigationScope.ADMIN, 'userManagement')}
              className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-purple-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              data-testid="card-gestione-utenti"
            >
              <div>
                <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Users className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Gestione Utenti
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                  Amministrazione profili, permessi e accessi di sistema per tutti gli utenti.
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-purple-600 gap-1 group-hover:gap-2 transition-all">
                <span>Gestisci</span>
                <ArrowRight className="size-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
