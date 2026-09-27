// pages/ReportsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Card } from '../components/shared/Card.tsx';
import { Button } from '../components/shared/Button.tsx';
import { 
    generateFullSummaryPDF, 
    generateFADXLS,
    exportDefinitiveTabella15XLS,
    exportDefinitiveTabella15CSV,
    previewDraftTabella15XLS,
    previewDraftTabella15CSV
} from '../services/reportService.ts';
import { DocumentFactory } from '../services/documents/documentFactory.ts';
import { mapToTabella15 } from '../logic/calculation/tabella15Mapper.ts';
import { TEXTS_UI } from '../constants.ts';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.tsx';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { EmptyState } from '../components/shared/EmptyState.tsx';


export const ReportsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { data: normativeData } = useNormativeData();
  const { calculationResult, fundData, currentUser, isLoading, complianceChecks } = state;
  const isClosed = fundData.metadata?.snapshotStatus === 'CLOSED';

  const [meta, setMeta] = React.useState({
    numeroDetermina: fundData.annualData.documentMetadata?.numeroDetermina || '',
    dataDetermina: fundData.annualData.documentMetadata?.dataDetermina || '',
    numDeliberaGc: fundData.annualData.documentMetadata?.numDeliberaGc || '',
    dataDeliberaGc: fundData.annualData.documentMetadata?.dataDeliberaGc || '',
    adoptionStatus: fundData.annualData.documentMetadata?.adoptionStatus || '' as '' | 'DOCUMENTED_ADOPTED' | 'NOT_DOCUMENTED',
    numVerbaleRevisori: fundData.annualData.documentMetadata?.numVerbaleRevisori || '',
    dataVerbaleRevisori: fundData.annualData.documentMetadata?.dataVerbaleRevisori || '',
    opinionOutcome: fundData.annualData.documentMetadata?.opinionOutcome || '' as '' | 'FAVORABLE' | 'UNFAVORABLE' | 'OTHER' | 'UNKNOWN',
    transmissionStatus: fundData.annualData.documentMetadata?.transmissionStatus || '' as '' | 'DOCUMENTED_SENT' | 'NOT_DOCUMENTED',
    firmaDigitale: fundData.annualData.documentMetadata?.firmaDigitale || '',
  });

  React.useEffect(() => {
    setMeta({
      numeroDetermina: fundData.annualData.documentMetadata?.numeroDetermina || '',
      dataDetermina: fundData.annualData.documentMetadata?.dataDetermina || '',
      numDeliberaGc: fundData.annualData.documentMetadata?.numDeliberaGc || '',
      dataDeliberaGc: fundData.annualData.documentMetadata?.dataDeliberaGc || '',
      adoptionStatus: fundData.annualData.documentMetadata?.adoptionStatus || '' as '' | 'DOCUMENTED_ADOPTED' | 'NOT_DOCUMENTED',
      numVerbaleRevisori: fundData.annualData.documentMetadata?.numVerbaleRevisori || '',
      dataVerbaleRevisori: fundData.annualData.documentMetadata?.dataVerbaleRevisori || '',
      opinionOutcome: fundData.annualData.documentMetadata?.opinionOutcome || '' as '' | 'FAVORABLE' | 'UNFAVORABLE' | 'OTHER' | 'UNKNOWN',
      transmissionStatus: fundData.annualData.documentMetadata?.transmissionStatus || '' as '' | 'DOCUMENTED_SENT' | 'NOT_DOCUMENTED',
      firmaDigitale: fundData.annualData.documentMetadata?.firmaDigitale || '',
    });
  }, [fundData.annualData.documentMetadata]);

  const handleSaveMeta = () => {
    if (isClosed) return;
    dispatch({
      type: 'UPDATE_ANNUAL_DATA',
      payload: { documentMetadata: meta }
    });
    alert('Metadati della determina salvati nel contesto Ente/Anno.');
  };

  const handleGenerateFullSummary = () => {
    if (calculationResult && complianceChecks) {
      try {
        generateFullSummaryPDF(calculationResult, fundData.annualData.denominazioneEnte || 'Ente', currentUser);
      } catch (error) {
        console.error("Errore generazione Riepilogo Generale PDF:", error);
        alert("Errore durante la generazione del Riepilogo Generale PDF. Controllare la console per dettagli.");
      }
    } else {
      alert("Dati del fondo o controlli di conformità non calcolati. Eseguire prima il calcolo completo.");
    }
  };



  const handleGenerateFADXLS = async () => {
    if (calculationResult && normativeData) {
      try {
        await generateFADXLS(
          calculationResult,
          fundData.annualData.denominazioneEnte || 'Ente',
          fundData.distribuzioneRisorseData,
          normativeData
        );
      } catch (error) {
        console.error("Errore generazione XLS Fondo Dipendente:", error);
        alert("Errore durante la generazione del XLS del Fondo Dipendente. Controllare la console per dettagli.");
      }
    } else {
      alert("Dati del Fondo non disponibili o calcolo non eseguito.");
    }
  };

  const getDocFactory = () => {
    if (calculationResult && currentUser) {
        return new DocumentFactory(
            calculationResult, 
            fundData.annualData.denominazioneEnte || 'Ente', 
            currentUser,
            fundData.annualData.documentMetadata
        );
    }
    return null;
  };

  const docFactory = React.useMemo(() => {
    if (calculationResult && currentUser) {
      return new DocumentFactory(
        calculationResult,
        fundData.annualData.denominazioneEnte || 'Ente',
        currentUser,
        fundData.annualData.documentMetadata
      );
    }
    return null;
  }, [calculationResult, currentUser, fundData.annualData]);

  const isDefinitiveExportReady = docFactory?.isDefinitiveExportReady() ?? false;

  const tabella15Data = React.useMemo(() => {
    if (calculationResult && normativeData) {
      return mapToTabella15(calculationResult, normativeData);
    }
    return null;
  }, [calculationResult, normativeData]);

  const isTabella15DefinitiveReady = tabella15Data?.isArithmeticExportReady ?? false;

  // Administrative Documents: Definitive guarded handlers
  const handleExportDefinitiveDeterminaPDF = () => {
    const factory = getDocFactory();
    if (!factory) return;
    try {
      factory.exportDefinitiveDeterminaPDF();
    } catch (error: any) {
      console.error("Errore export definitivo Determina PDF:", error);
      alert(error?.message || "Export definitivo Determina PDF bloccato: fondo in istruttoria o prerequisiti mancanti.");
    }
  };

  const handleExportDefinitiveDeterminaTXT = () => {
    const factory = getDocFactory();
    if (!factory) return;
    try {
      factory.exportDefinitiveDetermina();
    } catch (error: any) {
      console.error("Errore export definitivo Determina TXT:", error);
      alert(error?.message || "Export definitivo Determina TXT bloccato: fondo in istruttoria o prerequisiti mancanti.");
    }
  };

  const handleExportDefinitiveRelazioneTecnica = () => {
    const factory = getDocFactory();
    if (!factory) return;
    try {
      factory.exportDefinitiveRelazioneTecnica();
    } catch (error: any) {
      console.error("Errore export definitivo Relazione Tecnica:", error);
      alert(error?.message || "Export definitivo Relazione Tecnica bloccato: fondo in istruttoria o prerequisiti mancanti.");
    }
  };

  const handleExportDefinitiveProspetto = () => {
    const factory = getDocFactory();
    if (!factory) return;
    try {
      factory.exportDefinitiveProspetto();
    } catch (error: any) {
      console.error("Errore export definitivo Prospetto:", error);
      alert(error?.message || "Export definitivo Prospetto bloccato: fondo in istruttoria o prerequisiti mancanti.");
    }
  };

  // Administrative Documents: Explicit draft preview handlers
  const handlePreviewDraftDeterminaPDF = () => {
    const factory = getDocFactory();
    if (factory) {
      factory.previewDraftDeterminaPDF();
    }
  };

  const handlePreviewDraftDeterminaTXT = () => {
    const factory = getDocFactory();
    if (factory) {
      factory.previewDraftDetermina();
    }
  };

  const handlePreviewDraftRelazioneTecnica = () => {
    const factory = getDocFactory();
    if (factory) {
      factory.previewDraftRelazioneTecnica();
    }
  };

  const handlePreviewDraftProspetto = () => {
    const factory = getDocFactory();
    if (factory) {
      factory.previewDraftProspetto();
    }
  };

  // Tabella 15: Definitive guarded handlers
  const handleExportDefinitiveTabella15XLS = async () => {
    if (calculationResult && normativeData) {
      try {
        await exportDefinitiveTabella15XLS(calculationResult, normativeData);
      } catch (error: any) {
        console.error("Errore export definitivo XLS Tabella 15:", error);
        alert(error?.message || "Export definitivo Tabella 15 bloccato: quadratura aritmetica non completata o annualità in istruttoria.");
      }
    }
  };

  const handleExportDefinitiveTabella15CSV = () => {
    if (calculationResult && normativeData) {
      try {
        exportDefinitiveTabella15CSV(calculationResult, normativeData);
      } catch (error: any) {
        console.error("Errore export definitivo CSV Tabella 15:", error);
        alert(error?.message || "Export definitivo Tabella 15 bloccato: quadratura aritmetica non completata o annualità in istruttoria.");
      }
    }
  };

  // Tabella 15: Explicit draft / technical preview handlers
  const handlePreviewDraftTabella15XLS = async () => {
    if (calculationResult && normativeData) {
      try {
        await previewDraftTabella15XLS(calculationResult, normativeData);
      } catch (error) {
        console.error("Errore generazione anteprima XLS Tabella 15:", error);
        alert("Errore durante la generazione dell'anteprima XLS Tabella 15.");
      }
    }
  };

  const handlePreviewDraftTabella15CSV = () => {
    if (calculationResult && normativeData) {
      try {
        previewDraftTabella15CSV(calculationResult, normativeData);
      } catch (error) {
        console.error("Errore generazione anteprima CSV Tabella 15:", error);
        alert("Errore durante la generazione dell'anteprima CSV Tabella 15.");
      }
    }
  };


  if (isLoading && !calculationResult) {
    return <LoadingSpinner text="Attendere il calcolo del fondo..." />;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Generazione Report e Documentazione</h2>

      {!calculationResult && (
        <EmptyState
          title="Nessun report disponibile"
          message="Per generare i report, esegui prima il calcolo del fondo dalla pagina 'Dati Costituzione Fondo'."
          actionText="Vai ai Dati"
          onAction={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'wizard2026Preview' })}
        />
      )}

      {calculationResult && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <Card title="Riepilogo Generale Calcoli e Risultanze" className="bg-[#fffbea] border-[#fde68a]">
            <p className="text-sm text-[#1b0e0e] mb-4">
              Genera un report PDF completo che include tutti i dati di input, i calcoli dettagliati per ciascun fondo,
              i risultati del simulatore di incremento e il riepilogo dei controlli di conformità.
            </p>
            <Button variant="primary" onClick={handleGenerateFullSummary} disabled={!calculationResult || isLoading} size="md">
              {isLoading ? TEXTS_UI.calculating : "Genera Riepilogo Generale (PDF)"}
            </Button>
          </Card>
        </div>
      )}

      {calculationResult && (
        <div className="mt-8">
          <Card title="Metadati Amministrativi Determina" className="border-primary/30">
            <p className="text-sm text-[#1b0e0e] mb-4">
              {isClosed
                ? 'I metadati amministrativi sono consultabili ma non modificabili perché l’annualità è chiusa.'
                : 'Inserisci i dati amministrativi da includere nella Determina di Costituzione. Verranno salvati e ripristinati per questo Ente/Anno.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Numero Determina</label>
                <input 
                  type="text" 
                  value={meta.numeroDetermina} 
                  onChange={(e) => setMeta({...meta, numeroDetermina: e.target.value})} 
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Data Determina</label>
                <input 
                  type="text" 
                  value={meta.dataDetermina} 
                  onChange={(e) => setMeta({...meta, dataDetermina: e.target.value})} 
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Num. Delibera GC</label>
                <input 
                  type="text" 
                  value={meta.numDeliberaGc} 
                  onChange={(e) => setMeta({...meta, numDeliberaGc: e.target.value})} 
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Data Delibera GC</label>
                <input 
                  type="text" 
                  value={meta.dataDeliberaGc} 
                  onChange={(e) => setMeta({...meta, dataDeliberaGc: e.target.value})} 
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Num. Verbale Revisori</label>
                <input 
                  type="text" 
                  value={meta.numVerbaleRevisori} 
                  onChange={(e) => setMeta({...meta, numVerbaleRevisori: e.target.value})} 
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Data Verbale Revisori</label>
                <input 
                  type="text" 
                  value={meta.dataVerbaleRevisori} 
                  onChange={(e) => setMeta({...meta, dataVerbaleRevisori: e.target.value})} 
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Firma Digitale (Es. Il Responsabile)</label>
                <input 
                  type="text" 
                  value={meta.firmaDigitale} 
                  onChange={(e) => setMeta({...meta, firmaDigitale: e.target.value})} 
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1 sm:col-span-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Esito Parere Revisori (opinionOutcome)</label>
                <select
                  value={meta.opinionOutcome}
                  onChange={(e) => setMeta({...meta, opinionOutcome: e.target.value as typeof meta.opinionOutcome})}
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1"
                >
                  <option value="">-- non impostato --</option>
                  <option value="UNKNOWN">Non documentato (UNKNOWN)</option>
                  <option value="FAVORABLE">Parere favorevole (FAVORABLE)</option>
                  <option value="UNFAVORABLE">Parere non favorevole (UNFAVORABLE)</option>
                  <option value="OTHER">Altro (OTHER)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Stato trasmissione ai Revisori (transmissionStatus)</label>
                <select
                  value={meta.transmissionStatus}
                  onChange={(e) => setMeta({...meta, transmissionStatus: e.target.value as typeof meta.transmissionStatus})}
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1"
                >
                  <option value="">-- non impostato --</option>
                  <option value="NOT_DOCUMENTED">Non documentata (NOT_DOCUMENTED)</option>
                  <option value="DOCUMENTED_SENT">Trasmissione documentata (DOCUMENTED_SENT)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Adozione delibera GC (adoptionStatus)</label>
                <select
                  value={meta.adoptionStatus}
                  onChange={(e) => setMeta({...meta, adoptionStatus: e.target.value as typeof meta.adoptionStatus})}
                  disabled={isClosed}
                  className="w-full text-sm border border-primary/20 rounded p-1"
                >
                  <option value="">-- non impostato --</option>
                  <option value="NOT_DOCUMENTED">Non documentata (NOT_DOCUMENTED)</option>
                  <option value="DOCUMENTED_ADOPTED">Delibera adottata e documentata (DOCUMENTED_ADOPTED)</option>
                </select>
              </div>
            </div>
            <Button variant="primary" onClick={handleSaveMeta} disabled={isClosed} size="sm">
              {isClosed ? 'Annualità Chiusa' : 'Salva Metadati Determina'}
            </Button>
          </Card>
        </div>
      )}

      {calculationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card title="Modulistica Amministrativa" className="border-[#994d51]/20 bg-[#fdfcfc]">
            <p className="text-sm text-[#1b0e0e] mb-4">
              Documenti formali generati tramite <strong>DocumentFactory</strong>.
              {!isDefinitiveExportReady ? (
                <span className="block mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Stato Documento: BOZZA IN ISTRUTTORIA.</strong> Export definitivo disabilitato. I documenti generati contengono la dicitura di bozza e la formula istruttoria (non definitiva).
                  {!calculationResult.canonicalFund && " (CanonicalFundLedger non disponibile)."}
                  {calculationResult.canonicalFund && calculationResult.canonicalFund.status !== 'VALID' && " (Fondo in corso di istruttoria o prerequisiti mancanti)."}
                </span>
              ) : (
                <span className="block mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  <strong>Stato Documento: DEFINITIVO.</strong> Il fondo è validato e non presenta prerequisiti mancanti.
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {isDefinitiveExportReady ? (
                <>
                  <Button variant="primary" onClick={handleExportDefinitiveDeterminaPDF} disabled={!calculationResult || isLoading} size="sm">
                    Genera Determina Definitiva (PDF)
                  </Button>
                  <Button variant="secondary" onClick={handleExportDefinitiveDeterminaTXT} disabled={!calculationResult || isLoading} size="sm">
                    Determina Definitiva (TXT)
                  </Button>
                  <Button variant="secondary" onClick={handleExportDefinitiveRelazioneTecnica} disabled={!calculationResult || isLoading} size="sm">
                    Relazione Tecnica Definitiva
                  </Button>
                  <Button variant="secondary" onClick={handleExportDefinitiveProspetto} disabled={!calculationResult || isLoading} size="sm">
                    Prospetto Definitivo
                  </Button>
                  <Button variant="ghost" onClick={handlePreviewDraftDeterminaPDF} disabled={!calculationResult || isLoading} size="sm">
                    Scarica Bozza (PDF)
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" onClick={handlePreviewDraftDeterminaPDF} disabled={!calculationResult || isLoading} size="sm">
                    Scarica Bozza Determina (PDF)
                  </Button>
                  <Button variant="secondary" onClick={handlePreviewDraftDeterminaTXT} disabled={!calculationResult || isLoading} size="sm">
                    Bozza Determina (TXT)
                  </Button>
                  <Button variant="secondary" onClick={handlePreviewDraftRelazioneTecnica} disabled={!calculationResult || isLoading} size="sm">
                    Bozza Relazione Tecnica
                  </Button>
                  <Button variant="secondary" onClick={handlePreviewDraftProspetto} disabled={!calculationResult || isLoading} size="sm">
                    Bozza Prospetto
                  </Button>
                  <Button variant="ghost" onClick={handleExportDefinitiveDeterminaPDF} disabled={true} size="sm" title="Disponibile solo con fondo validato e completo">
                    Determina Definitiva (Bloccata)
                  </Button>
                </>
              )}
            </div>
          </Card>
          <Card title="Tabella 15 del Conto Annuale (Riconciliazione Tecnica)" className="border-primary/20 bg-primary/5">
            <p className="text-sm text-[#1b0e0e] mb-4">
              Esporta il dataset della Tabella 15 (Conto Annuale) mappato dalle voci del fondo corrente.
              <strong className="text-orange-600 block mt-2">Stato Schema: RGS_SCHEMA_UNVERIFIED</strong>
              <span className="text-xs text-gray-600 block mt-1">
                Schema RGS/SICO annuale non verificato — file non validato per trasmissione ministeriale. Utilizzabile esclusivamente per riconciliazione interna.
              </span>
              {isTabella15DefinitiveReady ? (
                <span className="block mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  <strong>Quadratura Aritmetica: COMPLETATA.</strong> Tutte le voci sono riconciliate con il fondo canonico.
                </span>
              ) : (
                <span className="block mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Quadratura Aritmetica: NON COMPLETATA.</strong> Annualità in istruttoria, voci non classificate o fondo non determinato.
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {isTabella15DefinitiveReady ? (
                <>
                  <Button variant="primary" onClick={handleExportDefinitiveTabella15XLS} disabled={!calculationResult || isLoading} size="md">
                    Scarica Riconciliazione Definitiva (XLS)
                  </Button>
                  <Button variant="secondary" onClick={handleExportDefinitiveTabella15CSV} disabled={!calculationResult || isLoading} size="md">
                    Scarica Riconciliazione Definitiva (CSV)
                  </Button>
                  <Button variant="secondary" onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'tabella15' })} size="md">
                    Anteprima
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" onClick={handlePreviewDraftTabella15XLS} disabled={!calculationResult || isLoading} size="md">
                    Scarica Prospetto Tecnico Provvisorio (XLS)
                  </Button>
                  <Button variant="secondary" onClick={handlePreviewDraftTabella15CSV} disabled={!calculationResult || isLoading} size="md">
                    Scarica Prospetto Tecnico Provvisorio (CSV)
                  </Button>
                  <Button variant="ghost" onClick={handleExportDefinitiveTabella15XLS} disabled={true} size="md" title="Export definitivo bloccato: quadratura aritmetica non completata">
                    Export Definitivo (Bloccato)
                  </Button>
                  <Button variant="secondary" onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'tabella15' })} size="md">
                    Anteprima
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {calculationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card title="Esportazione Dati Fondo (XLS)">
            <p className="text-sm text-[#1b0e0e] mb-4">
              Scarica il dettaglio analitico delle voci del Fondo.
            </p>
            <Button variant="secondary" onClick={handleGenerateFADXLS} disabled={!calculationResult || isLoading} size="sm">
              {isLoading ? TEXTS_UI.calculating : "Genera XLS Fondo"}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
