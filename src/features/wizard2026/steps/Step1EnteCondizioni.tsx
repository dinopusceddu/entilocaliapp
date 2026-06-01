import React, { useState } from 'react';
import { Wizard2026EnteStepState, Wizard2026EntityType, Wizard2026DraftState } from '../types';
import { Wizard2026StepHeader, Wizard2026InfoBox, Wizard2026FieldHelp, Wizard2026YesNoField } from '../components';
import { useAppContext } from '../../../contexts/AppContext';
import { AlertTriangle, X, HelpCircle, FileSpreadsheet, Download, Upload, CheckCircle } from 'lucide-react';
import { exportWizard2026Excel } from '../excel/exportWizard2026Excel';
import { importWizard2026Excel, ImportValidationResult } from '../excel/importWizard2026Excel';

export interface Step1EnteCondizioniProps {
  state: Wizard2026EnteStepState;
  onChange: (payload: Partial<Wizard2026EnteStepState>) => void;
  fullState?: Wizard2026DraftState;
  onImportExcel?: (data: Partial<Wizard2026DraftState>) => void;
}

const ENTITY_TYPES: { value: Wizard2026EntityType; label: string; group: string }[] = [
  { value: 'COMUNE', label: 'Comune', group: 'Applicazione Diretta D.L. 25' },
  { value: 'PROVINCIA', label: 'Provincia', group: 'Applicazione Diretta D.L. 25' },
  { value: 'CITTA_METROPOLITANA', label: 'Città Metropolitana', group: 'Applicazione Diretta D.L. 25' },
  { value: 'REGIONE', label: 'Regione', group: 'Applicazione Diretta D.L. 25' },
  { value: 'UNIONE_COMUNI', label: 'Unione di Comuni', group: 'Enti di Trasferimento' },
  { value: 'COMUNITA_MONTANA', label: 'Comunità Montana', group: 'Enti di Trasferimento' },
  { value: 'COMUNITA_ISOLANA_O_ARCIPELAGO', label: 'Comunità Isolana o Arcipelago', group: 'Enti di Trasferimento' },
  { value: 'CAMERA_COMMERCIO', label: 'Camera di Commercio', group: 'Altri Enti' },
  { value: 'ENTE_REGIONALE', label: 'Ente Regionale', group: 'Altri Enti' },
  { value: 'ENTE_PARCO', label: 'Ente Parco', group: 'Altri Enti' },
  { value: 'CONSORZIO', label: 'Consorzio', group: 'Altri Enti' },
  { value: 'ASP', label: 'Azienda Servizi alla Persona (ASP)', group: 'Altri Enti' },
  { value: 'AZIENDA_SPECIALE', label: 'Azienda Speciale', group: 'Altri Enti' },
  { value: 'ISTITUZIONE', label: 'Istituzione', group: 'Altri Enti' },
  { value: 'ALTRO_ENTE_STRUMENTALE', label: 'Altro Ente Strumentale', group: 'Altri Enti' },
  { value: 'ALTRO', label: 'Altra Tipologia (Verifica Manuale)', group: 'Altri Enti' },
];

export const Step1EnteCondizioni: React.FC<Step1EnteCondizioniProps> = ({ state, onChange, fullState, onImportExcel }) => {
  const { state: appContextState } = useAppContext();
  const activeEntityName = appContextState?.currentEntity?.name;
  const activeYear = appContextState?.currentYear;
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  // Stati per l'importazione Excel
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportValidationResult | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasEnteOAnnoMancante = !activeEntityName || !activeYear;

  React.useEffect(() => {
    const updates: Partial<Wizard2026EnteStepState> = {};
    if (activeEntityName && state.denominazioneEnte !== activeEntityName) {
      updates.denominazioneEnte = activeEntityName;
    }
    if (activeYear && state.annoRiferimento !== activeYear) {
      updates.annoRiferimento = activeYear;
    }
    if (Object.keys(updates).length > 0) {
      onChange(updates);
    }
  }, [activeEntityName, activeYear, state.denominazioneEnte, state.annoRiferimento, onChange]);

  const tipologiaDescription = (
    <div className="space-y-2 text-sm mt-1 leading-relaxed">
      <p>
        La <strong>Qualificazione Giuridica</strong> stabilisce come viene applicata la normativa sui fondi accessori:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Applicazione Diretta</strong> (Comuni, Province, Città Metropolitane e Regioni): effettuano il calcolo dell'incremento stabile dello stipendio tabellare e la relativa verifica del limite del 48% ai sensi del D.L. 25/2025 nello Step 3.
        </li>
        <li>
          <strong>Gestione della Quota Trasferita</strong> (Unioni di Comuni e Comunità Montane o Isolane): non calcolano incrementi diretti, ma gestiscono il trasferimento delle risorse certificate degli enti aderenti.
        </li>
        <li>
          <strong>Altre Tipologie o Verifica Manuale</strong> (Camere di Commercio, Enti Parco, ASP, Consorzi): per queste amministrazioni l'applicazione automatica del D.L. 25/2025 non è attiva nel wizard e richiede controlli o asseverazioni manuali personalizzate.
        </li>
        <li>
          <strong>Presenza della Dirigenza</strong>: qualora l'ente dichiari la presenza di personale dirigente, le risorse del Fondo Dirigenti 2016 diventano applicabili per la ricostruzione del limite complessivo dell'Art. 23 comma 2 del D.Lgs. 75/2017 e viene predisposta la futura gestione separata per i dirigenti.
        </li>
      </ul>
    </div>
  );

  return (
    <div>
      <Wizard2026StepHeader
        stepNumber={1}
        title="Ente e condizioni preliminari"
        subtitle="Inquadramento Soggettivo e Finanziario"
        description="Questi dati di base servono per comprendere la corretta qualificazione giuridica dell'ente, stabilire l'ammissibilità all'applicazione delle singole deroghe contrattuali e legislative e attivare i dovuti controlli di finanza pubblica."
      />

      <Wizard2026InfoBox
        title="Impatto della Tipologia di Ente sulla Normativa"
        description={tipologiaDescription}
        norma="Art. 1, D.L. 25/2025 e CCNL Comparto Funzioni Locali 2026"
        variant="cgil"
      />

      {hasEnteOAnnoMancante && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-6 flex gap-3 text-sm" data-testid="warning-missing-context">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong>Attenzione:</strong> Nessun ente o annualità attiva rilevata. Selezionare prima l'ente e l'anno dalla dashboard o dalla sezione Enti e Annualità.
          </div>
        </div>
      )}

      {/* Box Compilazione offline dei dati */}
      <div className="bg-[#FFF4F2] border border-[#f3c7bf] p-6 rounded-2xl mb-8 space-y-4">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-6 h-6 text-[#cc4331] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-800 text-base">
              Compilazione offline dei dati
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Puoi scaricare un modello Excel con tutti i dati richiesti, compilarlo offline e ricaricarlo nel wizard. Puoi anche esportare in Excel i dati già inseriti.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={async () => {
              await exportWizard2026Excel(null);
            }}
            className="px-4 py-2.5 rounded-lg bg-[#FCE7E2] hover:bg-[#fbdad3] active:bg-[#fbdad3]/85 text-[#cc4331] font-semibold text-sm transition-colors flex items-center gap-2 border border-[#f3c7bf]/50"
          >
            <Download className="w-4 h-4" />
            <span>Scarica template Excel</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="px-4 py-2.5 rounded-lg bg-[#cc4331] hover:bg-[#b23526] active:bg-[#9f2f24] text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            <span>{isImporting ? 'Caricamento in corso...' : 'Carica Excel compilato'}</span>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setIsImporting(true);
              try {
                const res = await importWizard2026Excel(file);
                setImportResult(res);
                setIsImportModalOpen(true);
                if (res.success && onImportExcel) {
                  onImportExcel(res.resultState);
                }
              } catch (err: any) {
                setImportResult({
                  success: false,
                  importedCount: 0,
                  ignoredCount: 0,
                  errors: [err.message || 'Errore imprevisto durante l\'importazione.'],
                  warnings: [],
                  resultState: {},
                });
                setIsImportModalOpen(true);
              } finally {
                setIsImporting(false);
                e.target.value = '';
              }
            }}
            accept=".xlsx, .xls"
            className="hidden"
            id="import-excel-file-input"
          />

          {fullState && (
            <button
              type="button"
              onClick={async () => {
                await exportWizard2026Excel(fullState, state.denominazioneEnte, state.annoRiferimento);
              }}
              className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Esporta dati inseriti</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Denominazione Ente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={activeEntityName || state.denominazioneEnte || ''}
              readOnly
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 outline-none text-slate-500 cursor-not-allowed font-medium"
            />
            <Wizard2026FieldHelp label="Denominazione" helpText="Dato acquisito dall’Ente attivo selezionato nell’app." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Anno di Riferimento Istruttoria
            </label>
            <input
              type="text"
              value={activeYear || state.annoRiferimento || ''}
              readOnly
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 font-mono text-slate-500 outline-none cursor-not-allowed font-medium"
            />
            <Wizard2026FieldHelp label="Anno" helpText="Dato acquisito dall’Annualità attiva selezionata nell’app." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Qualificazione Giuridica (Tipologia Ente) <span className="text-red-500">*</span>
          </label>
          <select
            value={state.entityType || ''}
            onChange={(e) => onChange({ entityType: (e.target.value as Wizard2026EntityType) || undefined })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 outline-none font-medium"
          >
            <option value="">-- Seleziona la tipologia di ente --</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} ({t.group})
              </option>
            ))}
          </select>
          <Wizard2026FieldHelp label="Tipologia" helpText="Determina il regime di applicabilità del D.L. 25/2025 e le regole contrattuali." norma="D.L. 25/2025" />
        </div>

        <div className="pt-6 border-t border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-4 text-base">Condizioni di Governance e Virtuosità</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <Wizard2026YesNoField
              label="Ente dotato di personale Dirigente"
              value={state.hasDirigenza}
              onChange={(val) => onChange({ hasDirigenza: val })}
              description="Se l’ente ha personale dirigente, il wizard considera anche il Fondo Dirigente nella ricostruzione del limite 2016 e predispone la futura gestione separata nella Costituzione Fondo."
              testId="hasDirigenza"
            />

            <Wizard2026YesNoField
              label="Equilibrio pluriennale asseverato"
              value={state.isEquilibrioPluriennaleAsseverato}
              onChange={(val) => onChange({ isEquilibrioPluriennaleAsseverato: val })}
              description="Requisito necessario per l'aumento PNRR e le deroghe stabili."
              testId="isEquilibrioPluriennaleAsseverato"
            />

            <Wizard2026YesNoField
              label="Ente in 1ª fascia (Art. 33, D.L. 34/2019)"
              value={state.isPrimaFasciaDl34}
              onChange={(val) => onChange({ isPrimaFasciaDl34: val })}
              description="Indica se l’ente si colloca nella fascia più favorevole del rapporto tra spesa di personale ed entrate correnti secondo l’art. 33 del D.L. 34/2019 e i relativi decreti attuativi. Il dato serve per i controlli sugli incrementi e sulla sostenibilità della spesa."
              infoAction={
                <button
                  type="button"
                  onClick={() => setIsInfoModalOpen(true)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 focus:outline-none flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200 transition-colors shrink-0"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Cos'è?</span>
                </button>
              }
              testId="isPrimaFasciaDl34"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-4 text-base">Situazioni Finanziarie di Criticità / Vincolo</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/50 p-5 rounded-xl border border-amber-200">
              <Wizard2026YesNoField
                label="Stato di Dissesto"
                value={state.isDissesto}
                onChange={(val) => onChange({ isDissesto: val })}
                description="Comporta preclusione all'incremento D.L. 25/2025."
                className="bg-white/80 border-amber-200/50"
                testId="isDissesto"
              />

              <Wizard2026YesNoField
                label="Strutturalmente Deficitario"
                value={state.isStrutturalmenteDeficitario}
                onChange={(val) =>
                  onChange({
                    isStrutturalmenteDeficitario: val,
                    hasApprovazioneCosfel: val === true ? state.hasApprovazioneCosfel : undefined,
                  })
                }
                description="Segnala una condizione di criticità finanziaria rilevata attraverso i parametri di deficitarietà. Non coincide con dissesto o pre-dissesto, ma comporta controlli rafforzati."
                className="bg-white/80 border-amber-200/50"
                testId="isStrutturalmenteDeficitario"
              />

              <Wizard2026YesNoField
                label="Piano di Riequilibrio"
                value={state.isPianoRiequilibrio}
                onChange={(val) => onChange({ isPianoRiequilibrio: val })}
                description="Vincola l'espansione dei fondi accessori."
                className="bg-white/80 border-amber-200/50"
                testId="isPianoRiequilibrio"
              />
            </div>

            {/* Box COSFEL condizionale */}
            {state.isStrutturalmenteDeficitario === true && (
              <div className="bg-[#fff7f5] border border-[#f3c7bf] p-5 rounded-xl transition-all duration-200">
                <Wizard2026YesNoField
                  label="Approvazione/autorizzazione COSFEL acquisita per gli incrementi del fondo"
                  value={state.hasApprovazioneCosfel}
                  onChange={(val) => onChange({ hasApprovazioneCosfel: val })}
                  description="Da selezionare solo se l’ente dispone dell’approvazione, autorizzazione o documentazione COSFEL necessaria a sostenere gli incrementi del fondo, ove richiesta."
                  className="border-[#f3c7bf] bg-white/90"
                  testId="hasApprovazioneCosfel"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Esito Importazione */}
      {isImportModalOpen && importResult && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#cc4331]" />
                <span>Esito Importazione File Excel</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm leading-relaxed max-h-[60vh] overflow-y-auto font-sans">
              {importResult.success ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-green-900">Importazione avvenuta con successo!</h5>
                    <p className="mt-1 text-xs text-green-700">
                      I dati validi letti dal file Excel sono stati caricati nello stato del wizard. Naviga tra gli step per verificare i calcoli risultanti.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-red-900">Si sono verificati degli errori!</h5>
                    <p className="mt-1 text-xs text-red-700">
                      Non è stato possibile importare tutti i dati a causa di errori di validazione nel file. I dati senza errori sono stati comunque caricati.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Celle importate con successo:</span>
                  <div className="text-lg font-bold text-slate-800">{importResult.importedCount}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Celle ignorate/vuote:</span>
                  <div className="text-lg font-bold text-slate-800">{importResult.ignoredCount}</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-red-600">
                    Errori riscontrati ({importResult.errors.length})
                  </h5>
                  <ul className="bg-red-50/50 border border-red-150 p-3 rounded-lg text-xs space-y-1.5 text-red-800 max-h-[150px] overflow-y-auto list-disc pl-5">
                    {importResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-amber-600">
                    Attenzioni / Avvisi ({importResult.warnings.length})
                  </h5>
                  <ul className="bg-amber-50/50 border border-amber-150 p-3 rounded-lg text-xs space-y-1.5 text-amber-800 max-h-[150px] overflow-y-auto list-disc pl-5">
                    {importResult.warnings.map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-[#cc4331] hover:bg-[#b23526] text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informativo Prima Fascia */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Cosa significa essere in 1ª fascia
              </h3>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto">
              <p>
                La 1ª fascia individua gli enti strutturalmente virtuosi sotto il profilo della sostenibilità finanziaria del personale, in conformità all'art. 33 del D.L. n. 34/2019 e ai decreti attuativi (es. D.M. 17/03/2020 per i Comuni).
              </p>
              <p>
                Esprime il rapporto percentuale tra la Spesa di Personale e la media delle Entrate Correnti (al netto del FCDE). Trovarsi in prima fascia significa che il valore percentuale dell'ente è inferiore al valore soglia minimo fissato per la propria classe demografica.
              </p>
              <p className="font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                Dove verificare: Il dato è certificato nella tabella di calcolo contenuta nel PIAO (Piano dei Fabbisogni) e asseverato dal Collegio dei Revisori nella relazione al Rendiconto di gestione.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 active:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/40"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


