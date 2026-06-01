// pages/ReportsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Card } from '../components/shared/Card.tsx';
import { Button } from '../components/shared/Button.tsx';
import { 
    generateDeterminazioneTXT, 
    generateFullSummaryPDF, 
    generateFADXLS,
    generateTabella15ExportXLS,
    generateTabella15ExportCSV
} from '../services/reportService.ts';
import { DocumentFactory } from '../services/documents/documentFactory.ts';
import { TEXTS_UI } from '../constants.ts';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.tsx';
import { useNormativeData } from '../hooks/useNormativeData.ts';
import { EmptyState } from '../components/shared/EmptyState.tsx';


export const ReportsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { data: normativeData } = useNormativeData();
  const { calculationResult, fundData, currentUser, isLoading, complianceChecks } = state;

  const [meta, setMeta] = React.useState({
    numeroDetermina: fundData.annualData.documentMetadata?.numeroDetermina || '',
    dataDetermina: fundData.annualData.documentMetadata?.dataDetermina || '',
    numDeliberaGc: fundData.annualData.documentMetadata?.numDeliberaGc || '',
    dataDeliberaGc: fundData.annualData.documentMetadata?.dataDeliberaGc || '',
    numVerbaleRevisori: fundData.annualData.documentMetadata?.numVerbaleRevisori || '',
    dataVerbaleRevisori: fundData.annualData.documentMetadata?.dataVerbaleRevisori || '',
    firmaDigitale: fundData.annualData.documentMetadata?.firmaDigitale || '',
  });

  React.useEffect(() => {
    setMeta({
      numeroDetermina: fundData.annualData.documentMetadata?.numeroDetermina || '',
      dataDetermina: fundData.annualData.documentMetadata?.dataDetermina || '',
      numDeliberaGc: fundData.annualData.documentMetadata?.numDeliberaGc || '',
      dataDeliberaGc: fundData.annualData.documentMetadata?.dataDeliberaGc || '',
      numVerbaleRevisori: fundData.annualData.documentMetadata?.numVerbaleRevisori || '',
      dataVerbaleRevisori: fundData.annualData.documentMetadata?.dataVerbaleRevisori || '',
      firmaDigitale: fundData.annualData.documentMetadata?.firmaDigitale || '',
    });
  }, [fundData.annualData.documentMetadata]);

  const handleSaveMeta = () => {
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

  const handleGenerateDeterminazione = () => {
    if (calculationResult) {
      try {
        generateDeterminazioneTXT(calculationResult, fundData, currentUser);
      } catch (error) {
        console.error("Errore generazione TXT:", error);
        alert("Errore durante la generazione del TXT. Controllare la console per dettagli.");
      }
    } else {
      alert("Dati del fondo non calcolati. Eseguire prima il calcolo.");
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

  const handleGenerateTabella15XLS = async () => {
    if (calculationResult && normativeData) {
      try {
        await generateTabella15ExportXLS(calculationResult, normativeData);
      } catch (error) {
        console.error("Errore generazione XLS Tabella 15:", error);
        alert("Errore durante la generazione del XLS Tabella 15.");
      }
    }
  };

  const handleGenerateTabella15CSV = () => {
    if (calculationResult && normativeData) {
      try {
        generateTabella15ExportCSV(calculationResult, normativeData);
      } catch (error) {
        console.error("Errore generazione CSV Tabella 15:", error);
        alert("Errore durante la generazione del CSV Tabella 15.");
      }
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

  const handleGenerateDeterminaV2 = () => {
    const factory = getDocFactory();
    if (factory) factory.generateDetermina();
  };

  const handleGenerateDeterminaPDF = () => {
    const factory = getDocFactory();
    if (factory) factory.generateDeterminaDocumentPDF();
  };

  const handleGenerateRelazioneTecnica = () => {
    const factory = getDocFactory();
    if (factory) factory.generateRelazioneTecnica();
  };

  const handleGenerateProspetto = () => {
    const factory = getDocFactory();
    if (factory) factory.generateProspettoContrattazione();
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
              Inserisci i dati amministrativi da includere nella Determina di Costituzione. Verranno salvati e ripristinati per questo Ente/Anno.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Numero Determina</label>
                <input 
                  type="text" 
                  value={meta.numeroDetermina} 
                  onChange={(e) => setMeta({...meta, numeroDetermina: e.target.value})} 
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Data Determina</label>
                <input 
                  type="text" 
                  value={meta.dataDetermina} 
                  onChange={(e) => setMeta({...meta, dataDetermina: e.target.value})} 
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Num. Delibera GC</label>
                <input 
                  type="text" 
                  value={meta.numDeliberaGc} 
                  onChange={(e) => setMeta({...meta, numDeliberaGc: e.target.value})} 
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Data Delibera GC</label>
                <input 
                  type="text" 
                  value={meta.dataDeliberaGc} 
                  onChange={(e) => setMeta({...meta, dataDeliberaGc: e.target.value})} 
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Num. Verbale Revisori</label>
                <input 
                  type="text" 
                  value={meta.numVerbaleRevisori} 
                  onChange={(e) => setMeta({...meta, numVerbaleRevisori: e.target.value})} 
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Data Verbale Revisori</label>
                <input 
                  type="text" 
                  value={meta.dataVerbaleRevisori} 
                  onChange={(e) => setMeta({...meta, dataVerbaleRevisori: e.target.value})} 
                  className="w-full text-sm border border-primary/20 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1b0e0e] mb-1">Firma Digitale (Es. Il Responsabile)</label>
                <input 
                  type="text" 
                  value={meta.firmaDigitale} 
                  onChange={(e) => setMeta({...meta, firmaDigitale: e.target.value})} 
                  className="w-full text-sm border border-primary/20 rounded p-1 sm:col-span-2"
                />
              </div>
            </div>
            <Button variant="primary" onClick={handleSaveMeta} size="sm">
              Salva Metadati Determina
            </Button>
          </Card>
        </div>
      )}

      {calculationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card title="Modulistica Amministrativa Certificata" className="border-[#994d51]/20 bg-[#fdfcfc]">
            <p className="text-sm text-[#1b0e0e] mb-4">
              Documenti formali generati tramite <strong>DocumentFactory</strong>. 
              I testi sono pronti per l'adozione e leggono direttamente dal motore canonico.
            </p>
            <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={handleGenerateDeterminaPDF} disabled={!calculationResult || isLoading} size="sm">
                    Genera Determina (PDF)
                </Button>
                <Button variant="secondary" onClick={handleGenerateDeterminaV2} disabled={!calculationResult || isLoading} size="sm">
                    Determina (TXT)
                </Button>
                <Button variant="secondary" onClick={handleGenerateRelazioneTecnica} disabled={!calculationResult || isLoading} size="sm">
                    Relazione Tecnica
                </Button>
                <Button variant="secondary" onClick={handleGenerateProspetto} disabled={!calculationResult || isLoading} size="sm">
                    Prospetto
                </Button>
            </div>
          </Card>
          <Card title="Tabella 15 del Conto Annuale (XLS/CSV)" className="border-primary/20 bg-primary/5">
            <p className="text-sm text-[#1b0e0e] mb-4">
              Esporta il dataset della Tabella 15 (Conto Annuale) mappato istituzionalmente dalle voci del fondo corrente.
            </p>
            <div className="flex gap-2">
                <Button variant="primary" onClick={handleGenerateTabella15XLS} disabled={!calculationResult || isLoading} size="md">
                    Esporta XLS
                </Button>
                <Button variant="secondary" onClick={handleGenerateTabella15CSV} disabled={!calculationResult || isLoading} size="md">
                    Esporta CSV
                </Button>
                <Button variant="secondary" onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'tabella15' })} size="md">
                    Anteprima
                </Button>
            </div>
          </Card>
        </div>
      )}

      {calculationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card title="Bozza Storica Determina (Testuale)">
            <p className="text-sm text-[#1b0e0e] mb-4">
              Genera la vecchia versione della determina.
            </p>
            <Button variant="secondary" onClick={handleGenerateDeterminazione} disabled={!calculationResult || isLoading} size="sm">
              {isLoading ? TEXTS_UI.calculating : "Genera Vecchia Determina (TXT)"}
            </Button>
          </Card>
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
