import { presentTransferredArt23 } from '../features/wizard2026/art23Presentation';
// pages/FondoAccessorioDipendentePage.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { FondoAccessorioDipendenteData } from '../types.ts';
import { Card } from '../components/shared/Card.tsx';

import { getFadFieldDefinitions } from '../logic/fundFieldDefinitions.ts';
import { projectCanonicalFadSections } from '../domain/canonicalFadProjection';
import { FundingItem } from '../components/shared/FundingItem.tsx';
import { useNormativeData } from '../hooks/useNormativeData.ts';

import { formatCurrency } from '../utils/formatters.ts';
import { resolveAnnualPnrrFaculty } from '../logic/shared/pnrrFaculty';

import { Undo2, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const SectionTotal: React.FC<{ label: string; total?: number | null; status?: string }> = ({ label, total, status }) => {
  return (
    <div className="mt-4 pt-4 border-t-2 border-[#d1c0c1]">
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-[#1b0e0e]">{status && status !== 'VALID' && total != null ? 'Subtotale verificato — ' : ''}{label}</span>
        <span className="text-lg font-bold text-[#ea2832]">
          {total == null ? 'Non disponibile' : formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};

export const FondoAccessorioDipendentePage: React.FC = () => {
  const { state, dispatch, saveState, performLocalCalculation } = useAppContext();
  const art23TransferPresentation = presentTransferredArt23(state.fundData.wizard2026TransferSnapshot);
  const isClosed = state.fundData?.metadata?.snapshotStatus === 'CLOSED';
  const { data: normativeData } = useNormativeData();
  const data = state.fundData.fondoAccessorioDipendenteData || {} as FondoAccessorioDipendenteData;
  const performLocalCalculationRef = useRef(performLocalCalculation);
  const fondoAccessorioDipendenteSignature = useMemo(() => JSON.stringify(data), [data]);
  const annualDataSignature = useMemo(() => JSON.stringify(state.fundData.annualData), [state.fundData.annualData]);
  const historicalDataSignature = useMemo(() => JSON.stringify(state.fundData.historicalData), [state.fundData.historicalData]);

  useEffect(() => {
    performLocalCalculationRef.current = performLocalCalculation;
  }, [performLocalCalculation]);

  // Ricalcolo live prospetto Art. 23 (MOD-031E-FIX1)
  useEffect(() => {
    performLocalCalculationRef.current();
  }, [
    fondoAccessorioDipendenteSignature,
    annualDataSignature,
    historicalDataSignature,
    state.fundData.fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti
  ]);
  
  const [showTransferAlert, setShowTransferAlert] = useState(false);

  const userId = state.currentUser?.id || '';
  const entityId = state.currentEntity?.id || '';
  const year = state.currentYear || 2026;
  const successKey = `wizard2026_transfer_success_${userId}_${entityId}_${year}`;
  const snapshotKey = `wizard2026_transfer_snapshot_${userId}_${entityId}_${year}`;

  useEffect(() => {
    if (userId && entityId && sessionStorage.getItem(successKey) === 'true') {
      setShowTransferAlert(true);
    }
  }, [userId, entityId, successKey]);

  const handleRollback = useCallback(async () => {
    if (isClosed) return;
    if (!userId || !entityId) return;
    const snapshotStr = sessionStorage.getItem(snapshotKey);
    if (!snapshotStr) {
      alert("Nessuno snapshot di backup trovato per il rollback.");
      return;
    }
    try {
      const snapshot = JSON.parse(snapshotStr);
      dispatch({ type: 'IMPORT_FUND_DATA', payload: snapshot });
      
      // Keep recovery data until the versioned save has actually been acknowledged.
      setTimeout(async () => {
        const result = await saveState();
        if (!result.success) { alert(result.error || 'Ripristino conservato nella bozza ma non salvato.'); return; }
        sessionStorage.removeItem(successKey);
        sessionStorage.removeItem(snapshotKey);
        setShowTransferAlert(false);
        alert(result.noWrite ? 'I dati corrispondono già alla versione caricata.' : 'Ripristino salvato con conferma del server.');
      }, 100);
    } catch (err) {
      console.error("Errore durante il rollback dello snapshot:", err);
      alert("Errore durante il ripristino dei dati precedenti.");
    }
  }, [dispatch, isClosed, saveState, userId, entityId, successKey, snapshotKey]);

  const {
    simulatoreRisultati,
    isEnteDissestato,
    isEnteStrutturalmenteDeficitario,
    isEnteRiequilibrioFinanziario,
  } = state.fundData.annualData;



  const isEnteInCondizioniSpeciali = !!isEnteDissestato || !!isEnteStrutturalmenteDeficitario || !!isEnteRiequilibrioFinanziario;
  const enteCondizioniSpecialiInfo = "Disabilitato a causa dello stato dell'ente (dissesto, deficit strutturale o riequilibrio finanziario).";

  const pnrrFaculty = resolveAnnualPnrrFaculty(state.fundData.annualData, data.vn_dl13_art8c3_incrementoPNRR_max5stabile2016);
  const arePNRR3ConditionsMet = pnrrFaculty.exerciseDecision === 'EXERCISED' &&
    pnrrFaculty.period === 'APPLICABLE_PERIOD' && pnrrFaculty.eligibility === 'ELIGIBLE' && pnrrFaculty.maximumAvailable !== undefined;
  const valoreMassimoPNRR3 = pnrrFaculty.maximumAvailable;

  // AG-123: Rimossa auto-popolazione del valore PNRR. 
  // Il valore deve restare manuale o quello caricato dal DB.
  // Il limite massimo viene mostrato come informazione e validato nell'onChange.

  let displayInfoPerPNRR3: React.ReactNode = (
    <div className="flex flex-col gap-1">
      <span className="font-semibold text-primary">Input Manuale Richiesto</span>
      <span>Massimo teorico utilizzabile: {valoreMassimoPNRR3 === undefined ? 'n/d' : formatCurrency(valoreMassimoPNRR3)}</span>
      <span className="text-[10px] opacity-70">Il valore inserito non può superare il limite calcolato in "Dati Fondo".</span>
    </div>
  );

  if (isEnteInCondizioniSpeciali) {
    displayInfoPerPNRR3 = <span className="text-[#994d51]">{enteCondizioniSpecialiInfo}</span>;
  } else if (!arePNRR3ConditionsMet) {
    displayInfoPerPNRR3 = <span className="text-[#994d51]">Condizioni PNRR3 non soddisfatte (verifica i check in "Dati Fondo"). L'incremento non è applicabile.</span>;
  }

  const isYear2026ForDl25 = Number(state.fundData.annualData.annoRiferimento) === 2026;
  const wizardDL25Max = state.fundData.wizard2026TransferSnapshot?.input?.datiDL25?.result?.limiteMassimoDL25;
  const wizardPnrrMax =
    valoreMassimoPNRR3;
  const wizardPnrrApplied =
    pnrrFaculty.amountApplied;
  const maxIncrementoDL25 = (isYear2026ForDl25 && wizardDL25Max !== undefined)
    ? wizardDL25Max
    : (simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo ?? 0);
  const isIncrementoDL25Active = maxIncrementoDL25 > 0;

  const handleChange = useCallback((field: keyof FondoAccessorioDipendenteData, value?: number) => {
    if (isClosed) return;
    let processedValue = value;
    if (field === 'st_incrementoDL25_2025') {
      if (isIncrementoDL25Active) {
        processedValue = (value !== undefined) ? Math.min(Math.max(0, value), maxIncrementoDL25) : undefined;
      } else {
        processedValue = 0;
      }
    }
    dispatch({ type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA', payload: { [field]: processedValue } });
  }, [isClosed, dispatch, isIncrementoDL25Active, arePNRR3ConditionsMet, isEnteInCondizioniSpeciali, valoreMassimoPNRR3, maxIncrementoDL25]);

  // Gli incrementi CCNL sono risorse del ledger. La pagina non li ricalcola e non li persiste.

  const fadFieldDefinitions = useMemo(() => {
    if (!normativeData) return [];
    return getFadFieldDefinitions(normativeData);
  }, [normativeData]);

  const fadProjection = useMemo(() => projectCanonicalFadSections(state.calculationResult?.canonicalFund), [state.calculationResult?.canonicalFund]);


  const incrementoDL25Description = (
    <>
      Incremento D.L. 25/2025 (48%)
      {!isIncrementoDL25Active && (
        <span className="block text-xs text-[#994d51]">
          {isYear2026ForDl25
            ? 'Compilare lo Step 3 (D.L. 25/2025) del Wizard 2026 per attivare.'
            : 'Compilare il Simulatore Incremento nella pagina "Dati Costituzione Fondo" per attivare.'}
        </span>
      )}
    </>
  );

  // `cl_totaleParziale...` resta visualizzabile come cache legacy, ma non viene più scritto né letto come fonte autoritativa.

  if (!normativeData) {
    return <div>Caricamento dati normativi...</div>;
  }

  const pregressaKeys = new Set([
    'st_art79c1_art67c1_unicoImporto2017',
    'st_art79c1_art67c1_alteProfessionalitaNonUtil',
    'st_art79c1_art67c2a_incr8320',
    'st_art79c1b_euro8450',
    'vn_art79c3_022MonteSalari2018_da2022Proporzionale',
    'vn_art79c3_022MonteSalari2018_da2022UnaTantum2022',
    'vn_art79c1b_euro8450_unaTantum2021_2022'
  ]);

  const renderSection = (title: string, section: 'stabili' | 'vs_soggette' | 'vn_non_soggette' | 'fin_decurtazioni' | 'cl_limiti', sectionTotal: number | null, totalLabel: string) => {
    let cardTitle = title.toUpperCase();
    if (section === 'fin_decurtazioni') {
      cardTitle = "RIDUZIONI, DECURTAZIONI E COMPUTI FIGURATIVI (SEZIONE E)";
    }
    return (
      <Card title={cardTitle} className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <p className="text-xs text-[#5f5252] mb-3">Campi di input / fonte. Gli importi riconosciuti nel fondo e i subtotali derivano dal risultato canonico.</p>
        {fadFieldDefinitions.filter(def => {
          if (def.isHidden) return false;
          const isYear2026 = Number(state.fundData.annualData.annoRiferimento) === 2026;
          const hasDirigenza = state.fundData.annualData.hasDirigenza === true;

          if (isYear2026) {
            if (def.key === 'vn_art79c3_022MonteSalari2018_da2022UnaTantum2022' || 
                def.key === 'vn_art79c1b_euro8450_unaTantum2021_2022' ||
                def.key === 'vn_art58c2_incremento_max022_ms2021' || 
                def.key === 'vn_art58c2_incremento_max022_ms2021_anno2025' ||
                def.key === 'st_art79c1_art14c3_art67c2g_riduzioneStraordinario') {
              return false;
            }
          } else {
            if (def.key === 'vn_art58c2_CCNL2026_incremento022_MS2021') {
              return false;
            }
          }

          if (def.key === 'st_art67c1_decurtazionePO_AP_EntiDirigenza' && !hasDirigenza) {
            return false;
          }
          if (def.key === 'st_riduzionePerIncrementoEQ' && hasDirigenza) {
            return false;
          }

          return def.section === section;
        }).map(def => {
          let currentDescription: string | React.ReactNode = def.description;
          let currentDisabled = def.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali;
          let currentInputInfo: string | React.ReactNode | undefined = def.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali ? enteCondizioniSpecialiInfo : undefined;

          // Badging based on applicability for Regioni/Città Metropolitane
          const isRegioneOrCittaMetroField = def.key === 'st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig' || def.key === 'vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale';
          const tipologiaStr = String(state.fundData.annualData.tipologiaEnte || '');
          const isRegioneOrCittaMetroEnte = tipologiaStr === 'REGIONE' || tipologiaStr === 'CITTA_METROPOLITANA' || tipologiaStr === 'Regione' || tipologiaStr === 'Citta Metropolitana';
          
          if (isRegioneOrCittaMetroField && !isRegioneOrCittaMetroEnte) {
            currentDisabled = true;
            currentInputInfo = (
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 rounded-md border border-amber-200">
                Non applicabile alla tipologia di ente selezionata
              </span>
            );
          }

          if (def.key === 'st_incrementoDL25_2025') {
            currentDescription = incrementoDL25Description;
            currentDisabled = !isIncrementoDL25Active;
            currentInputInfo = isIncrementoDL25Active ? (
              <div className="flex flex-col gap-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded self-start">
                  Importato da Wizard 2026
                </span>
                <span>Max: {formatCurrency(maxIncrementoDL25, '0.00')}</span>
              </div>
            ) : "Attivabile tramite Simulatore";
          } else if (def.key === 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016') {
            currentDisabled = (!arePNRR3ConditionsMet || isEnteInCondizioniSpeciali);
            currentInputInfo = (
              <div className="flex flex-col gap-1">
                {arePNRR3ConditionsMet && !isEnteInCondizioniSpeciali && (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded self-start">
                    Importato da Wizard 2026
                  </span>
                )}
                {displayInfoPerPNRR3}
              </div>
            );

          } else if (def.key === 'st_art79c1c_incrementoStabileConsistenzaPers') {
            const fieldPath = 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers';
            const isLegacyWizardSource = state.localSources?.[fieldPath] === 'wizard2026';
            currentInputInfo = (
              <div className="flex flex-col gap-2">
                {isLegacyWizardSource && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed font-sans">
                    <strong>Avviso:</strong> Questo valore risulta trasferito da una precedente versione del Wizard 2026 tramite una metodologia di stima non più utilizzata automaticamente. Verificarne la quantificazione prima di confermare il Fondo.
                  </div>
                )}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed font-sans">
                  Importo stanziato dall'ente per incremento stabile della consistenza di personale ai sensi dell'art. 79, comma 1, lett. c) del CCNL 16.11.2022.
                  <br />
                  La voce non viene determinata automaticamente dall'app. Verificare l'effettivo incremento strutturale di personale, la coerenza con il PIAO/piano dei fabbisogni, la metodologia di quantificazione adottata dall'ente e la capienza del limite complessivo Art. 23/Art. 33.
                </div>
              </div>
            );
            currentDisabled = false;
          } else if (def.key === 'st_riduzionePerIncrementoEQ') {
            currentInputInfo = (
              <div className="flex flex-col gap-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded self-start">
                  Riduzione determinata nel calcolo dal Fondo Elevate Qualificazioni.
                </span>
                <span>I parametri si modificano nel Fondo EQ; l’importo iscritto non viene aggiornato in apertura.</span>
              </div>
            );
            currentDisabled = true;
          } else if (def.key === 'st_art67c1_decurtazionePO_AP_EntiDirigenza') {
            currentInputInfo = (
              <div className="flex flex-col gap-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded self-start">
                  Riduzione determinata nel calcolo dal Fondo Elevate Qualificazioni.
                </span>
                <span>I parametri si modificano nel Fondo EQ; l’importo iscritto non viene aggiornato in apertura.</span>
              </div>
            );
            currentDisabled = true;
          } else if (def.key === 'st_riduzioneFondoStraordinario') {
            currentInputInfo = "Voce alimentata dal Wizard Step 6.";
            currentDisabled = true;
          } else if (def.key === 'vn_art58c2_CCNL2026_incremento022_MS2021' || def.key === 'vn_art58c2_incremento_max022_ms2021_anno2025') {
            currentInputInfo = (
              <div className="flex flex-col gap-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded self-start">
                  Importato da Wizard 2026
                </span>
                <span>Valore calcolato automaticamente da Monte Salari 2021 e % scelta (Step 3).</span>
              </div>
            );
            currentDisabled = true;
          } else if (def.key === 'st_art60c2_CCNL2026_decurtazioneIndennitaComparto') {
            currentInputInfo = (
              <div className="flex flex-col gap-1 text-gray-500 text-xs">
                <span>
                  La decurtazione Art. 60 riduce realmente la parte stabile del Fondo risorse decentrate. Ai fini del limite Art. 23, comma 2, D.Lgs. 75/2017, il valore viene però computato figurativamente per evitare che la riduzione liberi nuovo spazio finanziario.
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 rounded self-start">
                  Campo alimentato dal Wizard Step 5. Il valore è consolidato dal 2026 e resta invariato negli anni successivi, salvo correzione manuale motivata.
                </span>
              </div>
            );
            currentDisabled = true;
          } else if (def.key === 'st_art58c1_CCNL2026_incremento014_MS2021') {
            currentInputInfo = (
              <div className="flex flex-col gap-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded self-start">
                  Importato da Wizard 2026
                </span>
                <span>Quota Fondo dipendenti dello 0,14% calcolata automaticamente su base Monte Salari 2021 (Step 3).</span>
              </div>
            );
            currentDisabled = true;
          } else if (def.key === 'vn_art58_CCNL2026_arretrati2024_2025') {
            currentInputInfo = (
              <div className="flex flex-col gap-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded self-start">
                  Importato da Wizard 2026 (Step 5)
                </span>
                <span>Valore non modificabile, alimentato dal Wizard.</span>
              </div>
            );
            currentDisabled = true;
          }

          // Pregressa/storica badge
          if (pregressaKeys.has(String(def.key)) && !isRegioneOrCittaMetroField) {
            currentInputInfo = (
              <div className="flex flex-col gap-1.5">
                <span className="inline-block px-2 py-0.5 text-[9px] font-semibold text-gray-700 bg-gray-150 rounded self-start uppercase tracking-wider">
                  Pregressa / Storica
                </span>
                {currentInputInfo && <div className="text-gray-500">{currentInputInfo}</div>}
              </div>
            );
          }

          return (
            <FundingItem<FondoAccessorioDipendenteData>
              key={String(def.key)}
              id={def.key}
              description={currentDescription}
              value={(data as any)[def.key]}
              onChange={handleChange}
              riferimentoNormativo={def.riferimento}
              isSubtractor={def.isSubtractor}
              disabled={isClosed || currentDisabled}
              inputInfo={currentInputInfo}
              normativeReferenceShort={def.normativeReferenceShort || (typeof def.riferimento === 'string' ? def.riferimento : undefined)}
              normativeReferenceFull={def.normativeReferenceFull}
              helpText={def.helpText}
              operationalWarning={def.operationalWarning}
              applicability={def.applicability}
              titoloGuida={def.titoloGuida}
              descrizioneFunzionale={def.descrizioneFunzionale}
              quandoSiUsa={def.quandoSiUsa}
              fonteDato={def.fonteDato}
              effettoLimiti={def.effettoLimiti}
              erroriFrequenti={def.erroriFrequenti}
              tipoDato={def.tipoDato}
              livelloAttenzione={def.livelloAttenzione}
            />
          );
        })}

        <SectionTotal label={totalLabel} total={sectionTotal} status={fadProjection.status} />
      </Card>
    );
  };

  const art23Compliance = state.calculationResult?.compliance?.art23Compliance;
  const canonicalFund = state.calculationResult?.canonicalFund;
  const canonicalAmount = (value: number | null | undefined) =>
    value == null || fadProjection.status !== 'VALID' ? 'Non determinabile' : formatCurrency(value);

  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Fondo accessorio personale dipendente</h2>
      {!fadProjection.canonicalAvailable && <p role="status">Risultato canonico non disponibile. Calcolo in attesa; nessun totale economico disponibile.</p>}

      {isClosed && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-3 text-amber-900 text-sm font-medium shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <strong>Annualità Chiusa (Sola Lettura):</strong> Questo esercizio è stato definitivamente chiuso. Tutte le modifiche sono disabilitate per garantire l'immutabilità dei dati storici.
          </div>
        </div>
      )}

      {canonicalFund && canonicalFund.status !== 'VALID' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-900">
          <strong>Risultato canonico {canonicalFund.status === 'INVALID' ? 'non valido' : 'non determinabile'}.</strong>{' '}
          Il subtotale verificato è {formatCurrency(canonicalFund.verifiedTotal)}. Completare l’istruttoria delle risorse indicate prima di usare il totale complessivo.
          {canonicalFund.missingPrerequisites.length > 0 && (
            <ul className="list-disc pl-5 mt-2 text-xs">
              {canonicalFund.missingPrerequisites.map(item => <li key={item}>{item}</li>)}
            </ul>
          )}
        </div>
      )}

      {showTransferAlert && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="text-xs leading-relaxed">
              <strong>Trasferimento completato.</strong> È stato creato uno snapshot di sicurezza dello stato precedente.
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isClosed && (
              <span className="text-xs font-semibold text-amber-800">
                Rollback non disponibile per un’annualità chiusa.
              </span>
            )}
            <button
              type="button"
              onClick={handleRollback}
              disabled={isClosed}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-250 hover:bg-green-100 text-green-800 text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Annulla trasferimento e ripristina dati precedenti</span>
            </button>
          </div>
        </div>
      )}

      {/* SEZIONE A - PROSPETTO ART. 23 - FONDO PERSONALE DIPENDENTE */}
      {canonicalFund && art23Compliance && (
      <div className="p-6 bg-[#FFF4F2] border border-[#CC4331] rounded-2xl shadow-sm mb-8">
        <h3 className="text-lg font-bold text-[#A83226] mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#CC4331]" />
          Prospetto Art. 23 - Limite Unico Complessivo dell'Ente
        </h3>
        <p className="text-xs text-[#A83226]/85 mb-4 leading-relaxed">
          <strong>Verifica Complessiva:</strong> Questo prospetto monitora il limite unico e complessivo dell'Art. 23, comma 2, D.Lgs. 75/2017 a livello di Ente, aggregando i valori del Comparto, Elevate Qualificazioni (EQ), Segretario Comunale e Dirigenza.
        </p>

        {art23Compliance?.art23Componenti && (
          <div className="mb-6 p-4 bg-white/90 border border-red-100 rounded-xl text-xs text-gray-700 shadow-2xs">
            <div className="font-bold flex items-center gap-1.5 mb-3 text-[13px] text-[#A83226]">
              <Info className="w-4.5 h-4.5 text-red-600 flex-shrink-0" />
              <span>Dettaglio Componenti Rilevanti del Consumo Corrente Art. 23</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[11px]">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                <span className="text-gray-500 block font-semibold mb-1">Comparto</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(art23Compliance.art23Componenti.comparto)}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                <span className="text-gray-500 block font-semibold mb-1">EQ</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(art23Compliance.art23Componenti.eq)}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                <span className="text-gray-500 block font-semibold mb-1">Segretario</span>
                <span className="font-mono font-bold text-gray-800" title={`Quota ordinaria: ${formatCurrency(art23Compliance.art23Componenti.segretarioQuotaOrdinaria)}. Esclusa D.L. 19/2026: ${formatCurrency(art23Compliance.art23Componenti.segretarioQuotaEsclusaDL19_2026)}`}>
                  {formatCurrency(art23Compliance.art23Componenti.segretario)}
                </span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                <span className="text-gray-500 block font-semibold mb-1">Dirigenza</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(art23Compliance.art23Componenti.dirigenza)}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                <span className="text-gray-500 block font-semibold mb-1">Straordinario</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(art23Compliance.art23Componenti.straordinario)}</span>
              </div>
            </div>
          </div>
        )}

        {art23Compliance?.showWarningDisallineamento && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-250 text-amber-900 rounded-xl flex items-start gap-2.5 text-xs shadow-2xs">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Attenzione:</strong> il valore della decurtazione Art. 60 inserito nella Costituzione Fondo ({formatCurrency(art23Compliance.valoreArt60VoceFondo ?? 0)}) non coincide con il valore calcolato o consolidato nei parametri CCNL/wizard ({formatCurrency(art23Compliance.valoreArt60Contrattuale ?? 0)}). Ai fini del fondo reale viene utilizzato il valore inserito nella voce contabile; verificare la coerenza della costituzione del fondo.
            </div>
          </div>
        )}

        {art23Compliance?.showWarningStraordinario2016 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-250 text-amber-900 rounded-xl flex items-start gap-2.5 text-xs shadow-2xs">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Attenzione (Dato storico assente):</strong> Il Fondo straordinario storico del 2016 non è stato configurato nei Dati Generali/Storici dell'Ente. Come fallback transitorio di compatibilità viene utilizzato il Fondo straordinario dell'anno corrente. Si raccomanda di inserire lo straordinario 2016 storico per garantire la correttezza del limite.
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 text-[11px]">
              Fondo Costituito Totale
            </span>
            <span className="text-xl font-bold text-gray-800">
              {canonicalAmount(fadProjection.total)}
            </span>
            <span className="block text-[10px] text-gray-400 mt-1">
              Fondo accessorio dipendenti complessivo
            </span>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 text-[11px]">
              Risorse Escluse Art. 23
            </span>
            <span className="text-xl font-bold text-gray-800">
              {formatCurrency(art23Compliance?.risorseEscluseArt23 ?? 0)}
            </span>
            <span className="block text-[10px] text-gray-400 mt-1">
              Risorse stabili/variabili in deroga
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 text-[11px]">
              Risorse Rilevanti Art. 23 (Effettive)
            </span>
            <span className="text-xl font-bold text-[#A83226]">
              {formatCurrency(art23Compliance?.risorseRilevantiArt23 ?? 0)}
            </span>
            <span className="block text-[10px] text-gray-400 mt-1">
              Incidono sul limite storico (incl. computo figurativo Art. 60)
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 text-[11px]">
              Limite Art. 23 Attualizzato
            </span>
            <span className="text-xl font-bold text-gray-800">
              {formatCurrency(art23Compliance?.limiteArt23Attualizzato ?? 0)}
            </span>
            <span className="block text-[10px] text-gray-400 mt-1">
              Tetto massimo consentito all'ente
            </span>
          </div>
        </div>

        {/* Dettaglio Computo Figurativo Raccordo Row */}
        {art23Compliance?.valoreArt60Effettivo !== undefined && art23Compliance.valoreArt60Effettivo > 0 && (
          <div className="mb-6 p-4 bg-white/90 border border-amber-200 rounded-xl text-xs text-gray-700 shadow-2xs">
            <div className="font-bold text-gray-850 flex items-center gap-1.5 mb-3 text-[13px] text-[#A83226]">
              <Info className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
              <span>Dettaglio Decurtazione & Computo Figurativo (Art. 60 CCNL 23.02.2026)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-[11px]">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                <span className="text-gray-500 block font-semibold mb-0.5">Valore in Costituzione Fondo</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(art23Compliance.valoreArt60VoceFondo ?? 0)}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                <span className="text-gray-500 block font-semibold mb-0.5">Parametro Wizard / CCNL</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(art23Compliance.valoreArt60Contrattuale ?? 0)}</span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <span className="text-amber-700 block font-semibold mb-0.5">Valore Effettivo Applicato</span>
                <span className="font-mono font-bold text-amber-900">+{formatCurrency(art23Compliance.valoreArt60Effettivo)}</span>
              </div>
            </div>
            <div className="leading-relaxed text-gray-600 text-[11px]">
              La decurtazione di <strong>{formatCurrency(art23Compliance.valoreArt60Effettivo)}</strong> riduce realmente la parte stabile del fondo (fondo accessorio reale costituito), ma viene reintegrata come <strong>computo figurativo positivo (+{formatCurrency(art23Compliance.valoreArt60Effettivo)})</strong> ai fini del limite dell'Art. 23 per garantire la neutralità finanziaria del tetto storico di spesa.
            </div>
          </div>
        )}

        {/* Compliance Status Banner */}
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          art23Compliance?.isSforamento 
            ? 'bg-red-50 border-red-200 text-red-900' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            {art23Compliance?.isSforamento ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="flex-1 text-sm">
            <div className="font-bold mb-1">
              {art23Compliance?.isSforamento 
                ? 'Superamento Limite Rilevato!' 
                : 'Conforme al Limite Art. 23'}
            </div>
            <div>
              {art23Compliance?.isSforamento
                ? `Le risorse rilevanti superano il limite attualizzato di ${formatCurrency(Math.abs(art23Compliance.margineResiduo ?? 0))}.`
                : `Margine residuo disponibile nel limite: ${formatCurrency(Math.abs(art23Compliance?.margineResiduo ?? 0))}.`}
            </div>
            {art23Compliance?.warnings && art23Compliance.warnings.length > 0 && (
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-amber-800">
                {art23Compliance.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
              </ul>
            )}
            {art23Compliance?.errors && art23Compliance.errors.length > 0 && (
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-red-800">
                {art23Compliance.errors.map((e, idx) => <li key={idx}>{e}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>

      )}
      <Card title="Riepilogo economico canonico Fondo Dipendenti">
        <SectionTotal label="TOTALE RISORSE VARIABILI" total={fadProjection.canonicalAvailable ? canonicalFund?.verifiedVariableTotal : null} status={fadProjection.status} />
        <SectionTotal label="RISORSE FAD SOGGETTE ART. 23" total={fadProjection.verifiedSubject} status={fadProjection.status} />
        <SectionTotal label="RISORSE FAD ESCLUSE ART. 23" total={fadProjection.verifiedExcluded} status={fadProjection.status} />
      </Card>
      {renderSection("Fonti di Finanziamento Stabili", 'stabili', fadProjection.canonicalAvailable ? fadProjection.sections.stabili.total : null, "SOMMA RISORSE STABILI")}
      {renderSection("Fonti di Finanziamento Variabili Soggette al Limite", 'vs_soggette', fadProjection.canonicalAvailable ? fadProjection.sections.vs_soggette.total : null, "SOMMA RISORSE VARIABILI SOGGETTE AL LIMITE")}
      {renderSection("Fonti di Finanziamento Variabili Non Soggette al Limite", 'vn_non_soggette', fadProjection.canonicalAvailable ? fadProjection.sections.vn_non_soggette.total : null, "SOMMA RISORSE VARIABILI NON SOGGETTE AL LIMITE")}
      {renderSection("Altre Risorse e Decurtazioni Finali", 'fin_decurtazioni', fadProjection.verifiedDeductions, "DECURTAZIONI CANONICHE (GIÀ INCLUSE NEI TOTALI)")}

      {/* SEZIONE F - RIEPILOGO DATI WIZARD 2026 */}
      <Card title="RIEPILOGO DATI IMPORTATI DAL WIZARD 2026 (SEZIONE F)" className="mb-6" isCollapsible={true} defaultCollapsed={false}>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4 text-sm text-gray-700">
          {state.fundData.wizard2026TransferSnapshot ? (
            <div className="space-y-4">
              <div className="text-xs text-gray-500 flex justify-between">
                <span>Data/ora trasferimento: <span className="font-semibold text-gray-700">{new Date(state.fundData.wizard2026TransferSnapshot.transferredAt).toLocaleString('it-IT')}</span></span>
                <span>ID Ente: <span className="font-semibold text-gray-700">{state.fundData.wizard2026TransferSnapshot.entityId}</span></span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-2xs">
                  <span className="font-semibold text-gray-800 block mb-1 text-[13px]">Dati Generali Istruttori</span>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Monte Salari 2021: <span className="font-semibold text-gray-900">{formatCurrency(state.fundData.wizard2026TransferSnapshot.input.monteSalari2021)}</span></div>
                    <div>Limite Art. 23 c. 2 attualizzato: <span className="font-semibold text-gray-900">{art23TransferPresentation.adjusted}</span></div>
                    <div>Limite storico 2016 certificato: <span className="font-semibold text-gray-900">{art23TransferPresentation.historical}</span></div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-2xs">
                  <span className="font-semibold text-gray-800 block mb-1 text-[13px]">0,22% MS 2021 (Art. 58 c. 2)</span>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Limite massimo 0,22%: <span className="font-semibold text-gray-900">{formatCurrency(state.fundData.wizard2026TransferSnapshot.computed.limiteMassimo022)}</span></div>
                    <div>Annualità considerate: <span className="font-semibold text-gray-900">{state.fundData.wizard2026TransferSnapshot.computed.annualita022Considerate}</span></div>
                    <div>Importo effettivo: <span className="font-semibold text-gray-900">{formatCurrency(state.fundData.wizard2026TransferSnapshot.input.incrementoEffettivo022 || 0)}</span></div>
                    <div>Quota Fondo: <span className="font-semibold text-emerald-700">{formatCurrency(state.fundData.wizard2026TransferSnapshot.computed.quota022Fondo || 0)}</span></div>
                    <div>Quota EQ: <span className="font-semibold text-blue-700">{formatCurrency(state.fundData.wizard2026TransferSnapshot.computed.quota022EQ || 0)}</span></div>
                    <div>Trattamento Art. 23: <span className="font-semibold text-gray-950">FUORI_LIMITE (Escluso)</span></div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-2xs">
                  <span className="font-semibold text-gray-800 block mb-1 text-[13px]">D.L. 25/2025 & PNRR</span>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Massimo teorico DL25: <span className="font-semibold text-gray-900">{formatCurrency(maxIncrementoDL25)}</span></div>
                    <div>Stanz. DL25 (READY/CONFERMATO): <span className="font-semibold text-gray-900">{formatCurrency(data.st_incrementoDL25_2025 || 0)}</span></div>
                    <div>Massimo teorico PNRR: <span className="font-semibold text-gray-900">{wizardPnrrMax === undefined ? 'n/d' : formatCurrency(wizardPnrrMax)}</span></div>
                    <div>Importo PNRR scelto dall'ente: <span className="font-semibold text-gray-900">{wizardPnrrApplied === undefined ? 'n/d' : formatCurrency(wizardPnrrApplied)}</span></div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-2xs md:col-span-3">
                  <span className="font-semibold text-gray-800 block mb-1 text-[13px]">Art. 79 c. 1 lett. c) CCNL 16.11.2022 (Aumento Personale)</span>
                  <div className="space-y-1 text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <div>Fondo certificato parte stabile 2018: <span className="font-semibold text-gray-900">{formatCurrency(state.fundData.wizard2026TransferSnapshot.input.fondoCertificatoParteStabile2018 || 0)}</span></div>
                    <div>Personale al 31.12.2018: <span className="font-semibold text-gray-900">{(state.fundData.wizard2026TransferSnapshot.computed.dipendentiEquivalenti2018 || 0).toFixed(4)} FTE</span></div>
                    <div>Personale previsto nel 2026 (PIAO): <span className="font-semibold text-gray-900">{(state.fundData.wizard2026TransferSnapshot.computed.dipendentiEquivalenti2026 || 0).toFixed(4)} FTE</span></div>
                    <div>Stima istruttoria legacy — non trasferita: <span className="font-semibold text-emerald-700">{formatCurrency(state.fundData.wizard2026TransferSnapshot.computed.incrementoStabileAumentoPersonale || 0)}</span></div>
                    <div className="sm:col-span-2">Trattamento della stima: <span className="font-semibold text-blue-700">SOLO CONTROLLO</span></div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed">
                    La stima visualizzata appartiene al precedente calcolo Wizard e non modifica la voce effettiva del Fondo. L'eventuale importo effettivamente stanziato dall'ente resta verificato separatamente nell'ambito del limite complessivo Art. 23/Art. 33.
                  </div>
                </div>
              </div>

              {state.fundData.wizard2026TransferSnapshot.transferPlan && state.fundData.wizard2026TransferSnapshot.transferPlan.length > 0 && (
                <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-2xs">
                  <span className="font-semibold text-gray-800 block mb-1 text-[13px]">Stato dei Campi del Piano di Trasferimento</span>
                  <div className="space-y-1 text-xs">
                    {state.fundData.wizard2026TransferSnapshot.transferPlan.map((planItem: any, idx: number) => (
                      <div key={idx} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                        <span className="font-mono text-[10px] text-gray-500">{planItem.destinationPath}</span>
                        <div className="space-x-2">
                          <span className="text-gray-400">({formatCurrency(planItem.proposedValue)})</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            planItem.status === 'READY' ? 'bg-emerald-100 text-emerald-800' :
                            planItem.status === 'CONFLICT' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>{planItem.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-2xs">
                <span className="font-semibold text-gray-800 block mb-1 text-[13px]">D.L. 25/2025 (Limite 48%)</span>
                <div className="space-y-1 text-xs">
                  <div>Massimo teorico calcolato: <span className="font-semibold">{formatCurrency(maxIncrementoDL25)}</span></div>
                  <div>Valore effettivamente stanziato: <span className="font-semibold">{formatCurrency(data.st_incrementoDL25_2025 || 0)}</span></div>
                </div>
              </div>
              
              <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-2xs">
                <span className="font-semibold text-gray-800 block mb-1 text-[13px]">PNRR (Quota 5% Stabile 2016)</span>
                <div className="space-y-1 text-xs">
                  <div>Massimo teorico calcolato: <span className="font-semibold">{valoreMassimoPNRR3 === undefined ? 'n/d' : formatCurrency(valoreMassimoPNRR3)}</span></div>
                  <div>Importo scelto dall'ente: <span className="font-semibold">{pnrrFaculty.amountApplied === undefined ? 'n/d' : formatCurrency(pnrrFaculty.amountApplied)}</span></div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-2xs">
                <span className="font-semibold text-gray-800 block mb-1 text-[13px]">0,22% MS 2021 (Art. 58 c. 2)</span>
                <div className="space-y-1 text-xs">
                  <div>Massimo teorico annuale: <span className="font-semibold">{formatCurrency(Number(state.fundData.annualData.annoRiferimento) >= 2025 ? (state.fundData.annualData.ccnl2024?.monteSalari2021 ?? 0) * 0.0022 : 0)}</span></div>
                  <div>Quota effettivamente destinata: <span className="font-semibold">{formatCurrency(data.vn_art58c2_CCNL2026_incremento022_MS2021 || 0)}</span></div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-150 rounded-lg shadow-2xs">
                <span className="font-semibold text-gray-800 block mb-1 text-[13px]">Conglobamento Comparto (Art. 60)</span>
                <div className="space-y-1 text-xs">
                  <div>Decurtazione permanente applicata: <span className="font-semibold text-[#A83226]">{formatCurrency(data.st_art60c2_CCNL2026_decurtazioneIndennitaComparto || 0)}</span></div>
                  <div>Riaggiunta figurativa Art. 23: <span className="font-semibold text-emerald-700">+{formatCurrency(data.st_art60c2_CCNL2026_decurtazioneIndennitaComparto || 0)}</span></div>
                </div>
              </div>
            </div>
          )}
          <div className="text-[11px] text-gray-400 border-t border-gray-200 pt-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Questi valori provengono dal payload atomico e coerente del Wizard 2026.</span>
          </div>
        </div>
      </Card>

      {(() => {
        const totParzialeDef = fadFieldDefinitions.find(def => def.key === 'cl_totaleParzialeRisorsePerConfrontoTetto2016');
        const art23Def = fadFieldDefinitions.find(def => def.key === 'cl_art23c2_decurtazioneIncrementoAnnualeTetto2016');
        const isYear2026 = Number(state.fundData.annualData.annoRiferimento) === 2026;
        return (
          <Card title="CALCOLO DEL RISPETTO DEI LIMITI DEL SALARIO ACCESSORIO" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
            {!isYear2026 && totParzialeDef && (
              <FundingItem<FondoAccessorioDipendenteData>
                id="cl_totaleParzialeRisorsePerConfrontoTetto2016"
                description={(
                  <span>
                    {totParzialeDef?.description}<br />
                    <span className="text-sm font-normal text-gray-600">
                      (Include il "Nuovo fondo Lavoro Straordinario" da Step 3: {formatCurrency((state.fundData.annualData.fondoLavoroStraordinario || 0) + (state.fundData.annualData.incrementoFondoStraordinario || 0))})
                    </span>
                  </span>
                )}
                value={data.cl_totaleParzialeRisorsePerConfrontoTetto2016}
                onChange={() => { }}
                riferimentoNormativo={totParzialeDef?.riferimento}
                disabled={true}
                inputInfo="Valore calcolato automaticamente"
                titoloGuida={totParzialeDef?.titoloGuida}
                descrizioneFunzionale={totParzialeDef?.descrizioneFunzionale}
                quandoSiUsa={totParzialeDef?.quandoSiUsa}
                fonteDato={totParzialeDef?.fonteDato}
                effettoLimiti={totParzialeDef?.effettoLimiti}
                tipoDato={totParzialeDef?.tipoDato}
              />
            )}
            <FundingItem<FondoAccessorioDipendenteData>
              id="cl_art23c2_decurtazioneIncrementoAnnualeTetto2016"
              description={art23Def?.description || ''}
              value={data.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016}
              onChange={handleChange}
              riferimentoNormativo={art23Def?.riferimento}
              isSubtractor={true}
              disabled={isClosed}
              normativeReferenceShort={art23Def?.normativeReferenceShort}
              normativeReferenceFull={art23Def?.normativeReferenceFull}
              helpText={art23Def?.helpText}
              operationalWarning={art23Def?.operationalWarning}
              applicability={art23Def?.applicability}
              titoloGuida={art23Def?.titoloGuida}
              descrizioneFunzionale={art23Def?.descrizioneFunzionale}
              quandoSiUsa={art23Def?.quandoSiUsa}
              fonteDato={art23Def?.fonteDato}
              effettoLimiti={art23Def?.effettoLimiti}
              tipoDato={art23Def?.tipoDato}
            />
          </Card>
        );
      })()}


      <div className="fixed bottom-0 left-0 md:left-16 right-0 p-4 bg-[#fcf8f8]/80 backdrop-blur-sm border-t border-t-[#f3e7e8] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-[960px] mx-auto flex justify-between items-center md:pl-52 xl:pl-24 2xl:pl-0">
          <span className="text-lg font-bold text-[#1b0e0e]">TOTALE RISORSE DISPONIBILI:</span>
          <span className="text-2xl font-bold text-[#ea2832]">
            {canonicalAmount(fadProjection.total)}
          </span>
        </div>
      </div>

    </div>
  );
};
