import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { NavigationScope } from '../../../types';
import { AlertTriangle, Database, ArrowRight, ClipboardList, Info } from 'lucide-react';

interface FundConfigurationPreviewEntryPageProps {
  onNavigateToWizard: () => void;
}

export const FundConfigurationPreviewEntryPage: React.FC<FundConfigurationPreviewEntryPageProps> = ({
  onNavigateToWizard
}) => {
  const { state, setScopeAndTab } = useAppContext();
  const { fundData } = state;

  const parsedYear = Number(state.currentYear);
  const userId = state.currentUser?.id;
  const entityId = state.currentEntity?.id;

  const dataPresence = React.useMemo(() => {
    const draftKey = userId && entityId ? `fl_wizard2026_draft_${userId}_${entityId}_${parsedYear}` : null;
    const lastTransferKey = userId && entityId ? `fl_wizard2026_last_transfer_${userId}_${entityId}_${parsedYear}` : null;

    // Eseguiamo la migrazione atomica al volo per visualizzare lo stato corretto
    if (draftKey) {
      try {
        const sVal = sessionStorage.getItem(draftKey);
        if (sVal !== null && localStorage.getItem(draftKey) === null) {
          localStorage.setItem(draftKey, sVal);
        }
      } catch (e) {}
    }
    if (lastTransferKey) {
      try {
        const sVal = sessionStorage.getItem(lastTransferKey);
        if (sVal !== null && localStorage.getItem(lastTransferKey) === null) {
          localStorage.setItem(lastTransferKey, sVal);
        }
      } catch (e) {}
    }

    const draftRaw = draftKey ? localStorage.getItem(draftKey) : null;
    const lastTransferRaw = lastTransferKey ? localStorage.getItem(lastTransferKey) : null;

    let draftObj: any = null;
    try {
      if (draftRaw) draftObj = JSON.parse(draftRaw);
    } catch (e) {}

    let lastTransferObj: any = null;
    try {
      if (lastTransferRaw) lastTransferObj = JSON.parse(lastTransferRaw);
    } catch (e) {}

    const isWizardStateNotEmpty = (draft: any): boolean => {
      if (!draft) return false;
      const hasEnteName = !!draft.ente?.denominazioneEnte;
      const hasArt23Limit = draft.art23?.limite2016CertificatoEnte !== undefined || draft.art23?.fondoPersonaleDipendente2016 !== undefined;
      const hasMonteSalari = draft.ccnl2026?.monteSalari2021 !== undefined;
      const hasFte = draft.art23?.manualDipendentiEquivalenti2018 !== undefined || draft.art23?.manualDipendentiEquivalenti2026 !== undefined;
      return hasEnteName || hasArt23Limit || hasMonteSalari || hasFte;
    };

    const compareWizardStates = (stateA: any, stateB: any): boolean => {
      if (!stateA || !stateB) return false;
      const cleanState = (s: any) => {
        return {
          ente: s.ente || {},
          art23: {
            limite2016CertificatoEnte: s.art23?.limite2016CertificatoEnte,
            fondoPersonaleDipendente2016: s.art23?.fondoPersonaleDipendente2016,
            fondoEqPo2016: s.art23?.fondoEqPo2016,
            fondoDirigenza2016: s.art23?.fondoDirigenza2016,
            risorseSegretario2016: s.art23?.risorseSegretario2016,
            fondoStraordinario2016: s.art23?.fondoStraordinario2016,
            altreVoci2016Soggette: s.art23?.altreVoci2016Soggette,
            fondoDipendenti2018Soggetto: s.art23?.fondoDipendenti2018Soggetto,
            risorsePoEq2018Soggette: s.art23?.risorsePoEq2018Soggette,
            fondoCertificatoParteStabile2018: s.art23?.fondoCertificatoParteStabile2018,
            usaCalcoloManualePersonaleArt23: s.art23?.usaCalcoloManualePersonaleArt23,
            manualDipendentiEquivalenti2018: s.art23?.manualDipendentiEquivalenti2018,
            manualDipendentiEquivalenti2026: s.art23?.manualDipendentiEquivalenti2026,
          },
          dl25: {
            limiteSpesaPersonaleRiferimento: s.dl25?.limiteSpesaPersonaleRiferimento,
            spesaPersonaleCorrente2026: s.dl25?.spesaPersonaleCorrente2026,
            spesaEsclusaDL25: s.dl25?.spesaEsclusaDL25,
          },
          ccnl2026: {
            monteSalari2021: s.ccnl2026?.monteSalari2021,
            fondoRisorseDecentrate2024: s.ccnl2026?.fondoRisorseDecentrate2024,
            risorseEQ2024: s.ccnl2026?.risorseEQ2024,
            incremento022Anno: s.ccnl2026?.incremento022Anno,
          },
          conglobamentoArt60: {
            applicaIncrementiEQDifferenziale: s.conglobamentoArt60?.applicaIncrementiEQDifferenziale,
            dipendentiPerCategoria: s.conglobamentoArt60?.dipendentiPerCategoria || {},
          },
          straordinario: {
            economieDaRiversareCertificate: s.straordinario?.economieDaRiversareCertificate,
            straordinarioEsclusoArt23Elezioni: s.straordinario?.straordinarioEsclusoArt23Elezioni,
            straordinarioEsclusoArt23Calamita: s.straordinario?.straordinarioEsclusoArt23Calamita,
            straordinarioEsclusoArt23Istat: s.straordinario?.straordinarioEsclusoArt23Istat,
            straordinarioEsclusoArt23PoliziaLocaleDeroga: s.straordinario?.straordinarioEsclusoArt23PoliziaLocaleDeroga,
          },
          pnrr: {
            pianoFabbisognoCorrenteStabile: s.pnrr?.pianoFabbisognoCorrenteStabile,
            percentualeMassimaPNRR: s.pnrr?.percentualeMassimaPNRR,
          }
        };
      };
      return JSON.stringify(cleanState(stateA)) === JSON.stringify(cleanState(stateB));
    };

    const isDraftPresent = isWizardStateNotEmpty(draftObj);
    const isLastTransferPresent = lastTransferObj && isWizardStateNotEmpty(lastTransferObj.wizardState);

    const hasWizardData = isDraftPresent || isLastTransferPresent || !!fundData?.wizard2026TransferSnapshot;
    const hasTransferSnapshot = !!fundData?.wizard2026TransferSnapshot;
    const isTransferEffettuato = hasTransferSnapshot || !!lastTransferObj;

    const hasModifiedAfterTransfer = isDraftPresent && isTransferEffettuato && (!lastTransferObj || !compareWizardStates(draftObj, lastTransferObj.wizardState));

    const transferTime = fundData?.wizard2026TransferSnapshot?.transferredAt || lastTransferObj?.transferredAt;

    return {
      hasWizardData,
      isTransferEffettuato,
      hasModifiedAfterTransfer,
      transferTime
    };
  }, [userId, entityId, parsedYear, fundData]);

  const handleOpenLegacyFundData = () => {
    window.history.pushState(null, '', '/');
    setScopeAndTab(NavigationScope.FONDO, 'fondoDipendenti');
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch (e) {
      return '';
    }
  };

  // Determinazione dei badge e testi di stato
  let raccoltaDatiLabel = "Raccolta dati: non ancora compilata";
  let raccoltaDatiColor = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350";
  
  if (dataPresence.hasWizardData) {
    if (dataPresence.hasModifiedAfterTransfer) {
      raccoltaDatiLabel = "Raccolta dati: modifiche non ancora trasferite al Fondo";
      raccoltaDatiColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 font-semibold";
    } else {
      raccoltaDatiLabel = "Raccolta dati: dati presenti";
      raccoltaDatiColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 font-semibold";
    }
  }

  let trasferimentoLabel = "Trasferimento al Fondo: non ancora effettuato";
  let trasferimentoColor = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350";

  if (dataPresence.isTransferEffettuato) {
    if (dataPresence.hasModifiedAfterTransfer) {
      trasferimentoLabel = "Trasferimento al Fondo: da aggiornare";
      trasferimentoColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 font-semibold";
    } else {
      const timeStr = formatDateTime(dataPresence.transferTime);
      trasferimentoLabel = `Trasferimento al Fondo: effettuato${timeStr ? ` il ${timeStr}` : ''}`;
      trasferimentoColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 font-semibold";
    }
  }

  let statoComplessivoLabel = "da avviare";
  let statoComplessivoBadge = "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300";

  if (dataPresence.hasWizardData) {
    if (!dataPresence.isTransferEffettuato) {
      statoComplessivoLabel = "non ancora trasferito";
      statoComplessivoBadge = "bg-amber-100 text-amber-850 dark:bg-amber-950/30 dark:text-amber-400";
    } else if (dataPresence.hasModifiedAfterTransfer) {
      statoComplessivoLabel = "da aggiornare";
      statoComplessivoBadge = "bg-amber-100 text-amber-850 dark:bg-amber-950/30 dark:text-amber-400";
    } else {
      statoComplessivoLabel = "allineato";
      statoComplessivoBadge = "bg-emerald-100 text-emerald-850 dark:bg-emerald-950/30 dark:text-emerald-400";
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-6 md:py-12 px-4">
      
      {/* Intestazione principale */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
          Configurazione fondi incentivanti 2026
        </h2>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 font-bold text-xs uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Flusso 2026 attivo
        </div>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Percorso guidato per la raccolta dati, il trasferimento e la verifica della costituzione dei fondi incentivanti.
        </p>
      </div>

      {/* Banner di avvertimento */}
      <div className="w-full mb-8 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 rounded-2xl flex items-start gap-3 text-emerald-800 dark:text-emerald-300">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-650 dark:text-emerald-500" />
        <div className="text-sm font-medium">
          <span className="font-bold">Modulo attivo:</span> questa sezione consente di caricare in sicurezza i dati dal Wizard 2026 alla Costituzione del Fondo accessorio.
        </div>
      </div>

      {/* Riquadro informativo sullo stato dei dati 2026 */}
      <div className="w-full mb-8 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-[#cc4331]" />
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            Stato dei dati 2026
          </h4>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400 w-full sm:w-auto">
              Monitoraggio raccolta:
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${raccoltaDatiColor}`}>
              {raccoltaDatiLabel}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400 w-full sm:w-auto">
              Stato sincronizzazione:
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${trasferimentoColor}`}>
              {trasferimentoLabel}
            </span>
          </div>

          <hr className="border-slate-200 dark:border-slate-800 my-1" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-850 dark:text-slate-350">
              Stato complessivo:
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statoComplessivoBadge}`}>
              {statoComplessivoLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Griglia Scelte */}
      <div className="grid md:grid-cols-2 gap-8 w-full">
        
        {/* Card Sinistra (Primaria): Raccolta dati */}
        <div 
          className="flex flex-col h-full bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-[#cc4331] shadow-md ring-2 ring-[#cc4331]/10 scale-[1.02] transition-all duration-300"
        >
          <div className="self-start mb-4 px-2.5 py-1 rounded bg-[#cc4331] text-white font-bold text-[10px] uppercase tracking-wide">
            Scelta consigliata
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-[#cc4331]/10 text-[#cc4331]">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">
              Raccolta dati
            </h3>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-6 leading-relaxed">
            Compila o aggiorna i dati necessari al calcolo e al trasferimento verso la Costituzione dei fondi.
          </p>

          <button
            onClick={onNavigateToWizard}
            className="w-full py-3 px-4 bg-[#cc4331] text-white hover:bg-[#b23424] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm font-sans"
            data-testid="go-to-wizard-btn"
          >
            <span>Apri raccolta dati</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Destra (Secondaria): Costituzione dei fondi */}
        <div 
          className="flex flex-col h-full bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-[#cc4331]/50 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-slate-105 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">
              Costituzione dei fondi
            </h3>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-4 leading-relaxed">
            Verifica i dati trasferiti, controlla i prospetti e completa le eventuali rettifiche.
          </p>

          {dataPresence.hasWizardData && !dataPresence.isTransferEffettuato && (
            <div className="mb-6 text-xs text-amber-800 dark:text-amber-400 font-medium flex items-start gap-1.5 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl leading-relaxed">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
              <span>Attenzione: i dati della Raccolta dati non risultano ancora trasferiti alla Costituzione dei fondi.</span>
            </div>
          )}
          {dataPresence.hasWizardData && dataPresence.isTransferEffettuato && dataPresence.hasModifiedAfterTransfer && (
            <div className="mb-6 text-xs text-amber-800 dark:text-amber-400 font-medium flex items-start gap-1.5 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl leading-relaxed">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
              <span>Attenzione: sono presenti modifiche nella Raccolta dati non ancora trasferite al Fondo.</span>
            </div>
          )}

          <button
            onClick={handleOpenLegacyFundData}
            className="w-full py-3 px-6 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all font-sans"
            data-testid="go-to-fund-data-btn"
          >
            <span>Vai alla costituzione dei fondi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
