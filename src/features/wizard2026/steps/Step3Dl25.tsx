import React from 'react';
import { Wizard2026Dl25StepState, Wizard2026EntityType, Wizard2026EnteStepState, Wizard2026Dl25Quote } from '../types';
import { getDl25ApplicabilityStatus, getSogliaComuneDM17Marzo } from '../../../logic/wizard2026';
import { Wizard2026StepHeader, Wizard2026FieldHelp, Wizard2026CheckList, Wizard2026ResultCard } from '../components';
import { AlertCircle, Plus, Trash, Check, Info, Percent, FileCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export interface Step3Dl25Props {
  state: Wizard2026Dl25StepState;
  entityType?: Wizard2026EntityType;
  enteState?: Wizard2026EnteStepState;
  onChange: (payload: Partial<Wizard2026Dl25StepState>) => void;
}

const formatEntityTypeLabel = (type?: Wizard2026EntityType): string => {
  if (!type) return 'n/d';
  switch (type) {
    case 'COMUNE': return 'Comune';
    case 'PROVINCIA': return 'Provincia';
    case 'CITTA_METROPOLITANA': return 'Città Metropolitana';
    case 'REGIONE': return 'Regione';
    case 'UNIONE_COMUNI': return 'Unione di Comuni';
    case 'COMUNITA_MONTANA': return 'Comunità Montana';
    case 'COMUNITA_ISOLANA_O_ARCIPELAGO': return 'Comunità Isolana o Arcipelago';
    case 'CAMERA_COMMERCIO': return 'Camera di Commercio';
    case 'ENTE_REGIONALE': return 'Ente Regionale';
    case 'ENTE_PARCO': return 'Ente Parco';
    case 'CONSORZIO': return 'Consorzio';
    case 'ASP': return 'ASP (Azienda Servizi alla Persona)';
    case 'AZIENDA_SPECIALE': return 'Azienda Speciale';
    case 'ISTITUZIONE': return 'Istituzione';
    case 'ALTRO_ENTE_STRUMENTALE': return 'Altro Ente Strumentale';
    case 'ALTRO': return 'Altro Ente (Verifica Manuale)';
    default: return type;
  }
};

const formatCurrency = (val?: number): string => {
  if (val === undefined || val === null || isNaN(val)) return 'Da calcolare';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
};



export const Step3Dl25: React.FC<Step3Dl25Props> = ({ state, entityType, enteState, onChange }) => {
  const parseVal = (val: string) => {
    if (val === '') return undefined;
    const parsed = parseFloat(val);
    return Number.isNaN(parsed) ? undefined : parsed;
  };
  const status = entityType ? getDl25ApplicabilityStatus(entityType) : 'NOT_APPLICABLE';
  const res = state.result;
  const annoIstruttoria = enteState?.annoRiferimento ?? 2026;
  const annoPrecedente = annoIstruttoria - 1;
  const annoPrecedenteShort = annoPrecedente % 100;

  // Requisiti preliminari (letti da enteState — Step 1)
  const isComune = entityType === 'COMUNE';
  const isDissesto = enteState?.isDissesto;
  const isPiano = enteState?.isPianoRiequilibrio;
  const isDeficitario = enteState?.isStrutturalmenteDeficitario;
  const isEquilibrio = enteState?.isEquilibrioPluriennaleAsseverato;
  const isPrimaFascia = enteState?.isPrimaFasciaDl34;
  const hasCosfel = enteState?.hasApprovazioneCosfel;

  // Banner blocco: calcola i singoli motivi
  const motiviBlocko: string[] = [];
  if (isDissesto === true) motiviBlocko.push('ente in stato di dissesto finanziario');
  if (isPiano === true) motiviBlocko.push('ente in piano di riequilibrio finanziario pluriennale');
  if (isEquilibrio === false) motiviBlocko.push('equilibrio pluriennale di bilancio non asseverato');
  if (isPrimaFascia === false) motiviBlocko.push('ente non collocato in prima fascia di virtuosità (D.L. 34/2019)');
  if (res?.isPrimaFasciaCalcolato === false) motiviBlocko.push('calcolo automatico: rapporto spesa/entrate superiore alla soglia — ente non virtuoso');
  if (isDeficitario === true && hasCosfel === false) motiviBlocko.push('ente strutturalmente deficitario: autorizzazione COSFEL non acquisita');

  const isBlocked = motiviBlocko.length > 0;

  // Warning COSFEL mancante (anomalia S5): deficitario ma COSFEL non specificato
  const showCosfelMissingWarning = isDeficitario === true && hasCosfel === undefined && !isBlocked;

  // Tabella quote
  const handleAddQuote = () => {
    const newQuote: Wizard2026Dl25Quote = {
      id: Math.random().toString(36).substring(2, 9),
      enteAderente: '',
      tipologiaEnteAderente: '',
      quotaMassimaTrasferibile: undefined,
      riduzionePermanenteFondoAderente: undefined,
      estremiAttoEnteAderente: '',
      parereRevisoriEnteAderente: undefined,
      parereRevisoriEnteRicevente: undefined,
      hasAutorizzazioneCosfelAderente: undefined,
      estremiAutorizzazioneCosfelAderente: '',
    };
    onChange({
      quoteAderenti: [...(state.quoteAderenti || []), newQuote],
    });
  };

  const handleUpdateQuote = (id: string, updates: Partial<Wizard2026Dl25Quote>) => {
    const list = (state.quoteAderenti || []).map((q) => (q.id === id ? { ...q, ...updates } : q));
    onChange({ quoteAderenti: list });
  };

  const handleRemoveQuote = (id: string) => {
    const list = (state.quoteAderenti || []).filter((q) => q.id !== id);
    onChange({ quoteAderenti: list });
  };

  const renderThreeStateButtons = (
    current: boolean | undefined,
    onSelect: (val: boolean | undefined) => void,
    testId?: string
  ) => {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSelect(current === true ? undefined : true)}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
            current === true
              ? 'bg-[#CC4331] text-white border-[#CC4331]'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
          data-testid={testId ? `${testId}-yes` : undefined}
        >
          Sì
        </button>
        <button
          type="button"
          onClick={() => onSelect(current === false ? undefined : false)}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
            current === false
              ? 'bg-[#CC4331] text-white border-[#CC4331]'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
          data-testid={testId ? `${testId}-no` : undefined}
        >
          No
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Wizard2026StepHeader
        stepNumber={3}
        title="Istruttoria Incremento D.L. 25/2025"
        subtitle="Analisi di applicabilità, virtuosità finanziaria, sostenibilità e tetti storici"
        description="Verifica analitica per la costituzione di risorse stabili decentrate aggiuntive ai sensi dell'articolo unico del D.L. 25/2025, nel limite del 48% della spesa tabellare 2023 depurata delle risorse storiche stabili del fondo."
      />

      {/* Banner blocco istruttorio con elenco specifico dei motivi (MOD-011-ter B1) */}
      {isBlocked && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-[#A83226] rounded-xl flex items-start gap-3 shadow-sm" data-testid="blocco-istruttorio">
          <AlertCircle className="h-5 w-5 text-[#CC4331] shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <strong className="block text-sm font-bold">Blocco Istruttorio: l'incremento non è iscrivibile</strong>
            <p className="text-xs">
              Sono stati rilevati i seguenti requisiti negativi che impediscono l'applicazione dell'incremento D.L. 25/2025:
            </p>
            <ul className="text-xs list-disc list-inside space-y-0.5">
              {motiviBlocko.map((motivo, i) => (
                <li key={i}>{motivo};</li>
              ))}
            </ul>
            <p className="text-xs text-[#A83226] font-medium mt-1">
              Verificare e correggere i requisiti nello Step 1 per procedere all'istruttoria.
            </p>
          </div>
        </div>
      )}

      {/* Warning COSFEL mancante (MOD-011-ter S5) */}
      {showCosfelMissingWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-3" data-testid="cosfel-missing-warning">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-xs font-bold uppercase">Verifica necessaria: Autorizzazione COSFEL</strong>
            <span className="text-xs">
              L'ente risulta strutturalmente deficitario, ma non è stato indicato se l'autorizzazione COSFEL è stata acquisita.
              L'incremento non può essere considerato validabile fino alla verifica di questo dato. Rispondere nello Step 1.
            </span>
          </div>
        </div>
      )}

      {/* SEZIONE 1: Applicabilità ed Inquadramento Ente */}
      <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Info className="h-5 w-5 text-[#CC4331]" />
          Sezione 1 — Inquadramento e Applicabilità dell'Ente
        </h3>
        <div className="text-sm text-slate-600 leading-relaxed space-y-3">
          <p>
            Inquadramento istituzionale dell'ente:{' '}
            <strong className="text-slate-800">{formatEntityTypeLabel(entityType)}</strong>.
          </p>
          {status === 'DIRECTLY_APPLICABLE' && (
            <div className="p-4 bg-[#FFF4F2] text-[#A83226] border border-[#FCE7E2] rounded-xl text-xs sm:text-sm">
              L'ente è soggetto all'<strong>applicazione diretta</strong> dell'incremento. La base di calcolo è determinata sul 48% della spesa per gli stipendi tabellari 2023 del personale non dirigente, depurata dal fondo stabile e dal budget EQ certificati al {annoPrecedente}.
            </div>
          )}
          {status === 'TRANSFER_ONLY' && (
            <div className="p-4 bg-amber-50 text-amber-950 border border-amber-100 rounded-xl text-xs sm:text-sm">
              L'ente è un'<strong>aggregazione associativa (Unione di Comuni / Comunità Montana)</strong>. L'incremento del fondo non avviene su base contabile propria, ma esclusivamente tramite il trasferimento delle quote deliberate e certificate dai singoli Comuni aderenti.
            </div>
          )}
          {status === 'NOT_APPLICABLE' && entityType && (
            <div className="p-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm">
              L'ente selezionato non rientra nei destinatari previsti dal D.L. 25/2025. I campi dello step rimarranno disabilitati.
            </div>
          )}
          {status === 'NEEDS_MANUAL_REVIEW' && (
            <div className="p-4 bg-amber-50 text-amber-950 border border-amber-100 rounded-xl text-xs sm:text-sm">
              La tipologia di ente selezionata richiede una <strong>verifica manuale</strong> per confermare l'ammissibilità all'applicazione delle deroghe del salario accessorio.
            </div>
          )}
        </div>
      </section>

      {/* SEZIONE 2: Verifica di Virtuosità e Capacità Finanziaria */}
      {status === 'DIRECTLY_APPLICABLE' && (
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Percent className="h-5 w-5 text-[#CC4331]" />
            Sezione 2 — Verifica di Virtuosità (D.M. 17 marzo 2020)
          </h3>

          {isComune ? (
            <div className="space-y-6">
              <p className="text-xs text-slate-500">
                Inserire i dati finanziari per il calcolo automatico del posizionamento nelle fasce di virtuosità di cui all'art. 33, c. 1-bis del D.L. 34/2019.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="popolazioneEnte" className="block text-sm font-semibold text-slate-800 mb-1">
                    Popolazione Residente dell'Ente <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="popolazioneEnte"
                    type="number"
                    value={state.popolazioneEnte ?? ''}
                    placeholder="Numero abitanti"
                    onChange={(e) => onChange({ popolazioneEnte: parseVal(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="entrateCorrentiN1" className="block text-sm font-semibold text-slate-800 mb-1">
                    Entrate Correnti Anno N-1 (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="entrateCorrentiN1"
                    type="number"
                    value={state.entrateCorrentiN1 ?? ''}
                    placeholder="Accertamenti Titoli I, II, III"
                    onChange={(e) => onChange({ entrateCorrentiN1: parseVal(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="entrateCorrentiN2" className="block text-sm font-semibold text-slate-800 mb-1">
                    Entrate Correnti Anno N-2 (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="entrateCorrentiN2"
                    type="number"
                    value={state.entrateCorrentiN2 ?? ''}
                    placeholder="Accertamenti Titoli I, II, III"
                    onChange={(e) => onChange({ entrateCorrentiN2: parseVal(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="entrateCorrentiN3" className="block text-sm font-semibold text-slate-800 mb-1">
                    Entrate Correnti Anno N-3 (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="entrateCorrentiN3"
                    type="number"
                    value={state.entrateCorrentiN3 ?? ''}
                    placeholder="Accertamenti Titoli I, II, III"
                    onChange={(e) => onChange({ entrateCorrentiN3: parseVal(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="fcdeStanziato" className="block text-sm font-semibold text-slate-800 mb-1">
                    FCDE (Fondo Crediti Dubbia Esigibilità) (€)
                  </label>
                  <input
                    id="fcdeStanziato"
                    type="number"
                    value={state.fcdeStanziato ?? ''}
                    placeholder="Stanziato a bilancio di previsione"
                    onChange={(e) => onChange({ fcdeStanziato: parseVal(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                  />
                  <Wizard2026FieldHelp
                    label="FCDE"
                    helpText="Inserire il FCDE stanziato nel bilancio di previsione, da sottrarre alla media delle entrate correnti. Se non disponibile, lasciare vuoto: le entrate nette coincideranno con la media delle entrate correnti."
                  />
                </div>

                <div>
                  <label htmlFor="spesaPersonaleUltimoRendiconto" className="block text-sm font-semibold text-slate-800 mb-1">
                    Spesa Personale Ultimo Rendiconto (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="spesaPersonaleUltimoRendiconto"
                    type="number"
                    value={state.spesaPersonaleUltimoRendiconto ?? ''}
                    placeholder="Spesa complessiva certificata"
                    onChange={(e) => onChange({ spesaPersonaleUltimoRendiconto: parseVal(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                  />
                </div>
              </div>

              {/* Box dei Risultati di calcolo Virtuosità */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Prospetto Finanziario del Comune</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Media Entrate Correnti:</span>
                    <strong className="text-slate-800">{formatCurrency(res?.mediaEntrateCorrentiTriennio)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Entrate Correnti Nette:</span>
                    <strong className="text-slate-800">{formatCurrency(res?.entrateNette)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Rapporto Spesa/Entrate:</span>
                    <strong className="text-slate-800">
                      {res?.rapportoSpesaPersonale !== undefined
                        ? `${(res.rapportoSpesaPersonale * 100).toFixed(2)}%`
                        : 'Da calcolare'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Soglia Limite Virtuosità:</span>
                    <strong className="text-slate-800">
                      {state.popolazioneEnte !== undefined
                        ? `${((getSogliaComuneDM17Marzo(state.popolazioneEnte) || 0) * 100).toFixed(2)}%`
                        : 'Manca popolazione'}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Stato Virtuosità Calcolato:</span>
                  {res?.isPrimaFasciaCalcolato === true && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Virtuoso (Prima Fascia)
                    </span>
                  )}
                  {res?.isPrimaFasciaCalcolato === false && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      Non Virtuoso (Escluso)
                    </span>
                  )}
                  {res?.isPrimaFasciaCalcolato === undefined && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      Non calcolabile (Dati incompleti)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 text-amber-950 border border-amber-200 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs uppercase font-bold text-amber-800">Soglia non codificata</strong>
                <span className="text-xs">
                  Per l'ente di tipo <strong>{formatEntityTypeLabel(entityType)}</strong> le soglie tabellari non sono inserite nel sistema.
                  Lo stato dell'ente è qualificato come <strong>da verificare manualmente / soglia non codificata</strong>. Si prega di verificare la conformità normativa e proseguire.
                </span>
              </div>
            </div>
          )}

          {/* Requisiti formali dello Step 1 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Requisiti Formali di Bilancio (dati letti dallo Step 1)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">Equilibrio Pluriennale Asseverato</div>
                <div className="text-xs text-slate-400 mt-1">L'equilibrio pluriennale deve essere attestato dai revisori.</div>
                <div className="text-sm font-bold text-slate-800 mt-2">
                  {isEquilibrio === true && <span className="text-emerald-600">Sì</span>}
                  {isEquilibrio === false && <span className="text-rose-600">No (Bloccante)</span>}
                  {isEquilibrio === undefined && <span className="text-slate-400">Non specificato</span>}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">Prima Fascia Virtuosità (D.L. 34/2019)</div>
                <div className="text-xs text-slate-400 mt-1">Classificazione dichiarata nello Step 1 (per Comuni viene anche calcolata automaticamente).</div>
                <div className="text-sm font-bold text-slate-800 mt-2">
                  {isPrimaFascia === true && <span className="text-emerald-600">Sì</span>}
                  {isPrimaFascia === false && <span className="text-rose-600">No (Bloccante)</span>}
                  {isPrimaFascia === undefined && <span className="text-slate-400">Non specificato</span>}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">Ente in Dissesto</div>
                <div className="text-sm font-bold text-slate-800 mt-2">
                  {isDissesto === true && <span className="text-rose-600">Sì (Bloccante)</span>}
                  {isDissesto === false && <span className="text-emerald-600">No</span>}
                  {isDissesto === undefined && <span className="text-slate-400">Non specificato</span>}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">Piano di Riequilibrio</div>
                <div className="text-sm font-bold text-slate-800 mt-2">
                  {isPiano === true && <span className="text-rose-600">Sì (Bloccante)</span>}
                  {isPiano === false && <span className="text-emerald-600">No</span>}
                  {isPiano === undefined && <span className="text-slate-400">Non specificato</span>}
                </div>
              </div>

              {isDeficitario === true && (
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Approvazione COSFEL</div>
                  <div className="text-xs text-slate-400 mt-1">Autorizzazione COSFEL per l'adeguamento del salario accessorio.</div>
                  <div className="text-sm font-bold text-slate-800 mt-2">
                    {hasCosfel === true && <span className="text-emerald-600">Sì</span>}
                    {hasCosfel === false && <span className="text-rose-600">No (Bloccante)</span>}
                    {hasCosfel === undefined && <span className="text-amber-600 font-semibold">Non specificato ⚠</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SEZIONE 3: Elementi Contabili per il Calcolo del Limite Massimo */}
      {status === 'DIRECTLY_APPLICABLE' && (
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Sezione 3 — Elementi Contabili per il Calcolo del Limite Massimo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="stipendiTabellari2023NonDirigenti" className="block text-sm font-semibold text-slate-800 mb-1">
                Spesa Stipendi Tabellari 2023 Non Dirigenti (€) <span className="text-red-500">*</span>
              </label>
              <input
                id="stipendiTabellari2023NonDirigenti"
                type="number"
                value={state.stipendiTabellari2023NonDirigenti ?? ''}
                onChange={(e) => onChange({ stipendiTabellari2023NonDirigenti: parseVal(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
              />
              <Wizard2026FieldHelp
                label="Stipendi 2023"
                helpText="Spesa complessiva per tabellari delle aree professionali, inclusa tredicesima. Escludere: indennità di comparto, progressioni, ecc. Fonte tipica: Conto Annuale 2023 o rendiconto. Ufficio: Ragioneria."
              />
            </div>

            <div>
              <label htmlFor="fondoStabile2025Certificato" className="block text-sm font-semibold text-slate-800 mb-1">
                Fondo Stabile {annoPrecedente} Certificato (€) <span className="text-red-500">*</span>
              </label>
              <input
                id="fondoStabile2025Certificato"
                type="number"
                value={state.fondoStabile2025Certificato ?? ''}
                onChange={(e) => onChange({ fondoStabile2025Certificato: parseVal(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
              />
              <Wizard2026FieldHelp
                label={`Fondo Stabile ${annoPrecedente}`}
                helpText="Indicare la parte stabile del fondo dell’anno precedente all’anno di istruttoria, come certificata dall’ente."
              />
            </div>

            <div>
              <label htmlFor="budgetEq2025" className="block text-sm font-semibold text-slate-800 mb-1">
                Budget Elevate Qualificazioni (EQ) {annoPrecedente} (€) <span className="text-red-500">*</span>
              </label>
              <input
                id="budgetEq2025"
                type="number"
                value={state.budgetEq2025 ?? ''}
                onChange={(e) => onChange({ budgetEq2025: parseVal(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
              />
              <Wizard2026FieldHelp
                label={`Budget EQ ${annoPrecedente}`}
                helpText="Indicare il budget destinato alle Elevate Qualificazioni dell’anno precedente all’anno di istruttoria."
              />
            </div>

            {/* MOD-011-ter D1: altre risorse 2025 da sottrarre */}
            <div>
              <label htmlFor="altreRisorse2025DaSottrarre" className="block text-sm font-semibold text-slate-800 mb-1">
                Altre risorse {annoPrecedente} da sottrarre (€)
              </label>
              <input
                id="altreRisorse2025DaSottrarre"
                type="number"
                value={state.altreRisorse2025DaSottrarre ?? ''}
                placeholder="Opzionale — lasciare vuoto se non applicabile"
                onChange={(e) => onChange({ altreRisorse2025DaSottrarre: parseVal(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
              />
              <Wizard2026FieldHelp
                label={`Altre risorse ${annoPrecedente}`}
                helpText={`Usare solo se, nella ricostruzione dell'ente, esistono ulteriori componenti ${annoPrecedente} rilevanti da sottrarre alla soglia teorica del 48%. Se non vi sono altre risorse, lasciare vuoto. Ufficio: Ragioneria.`}
              />
            </div>

            {/* MOD-011-ter B2: campo COSFEL visibile se ente deficitario */}
            {isDeficitario === true && (
              <div className="md:col-span-2">
                <label htmlFor="documentazioneCosfelDl25" className="block text-sm font-semibold text-slate-800 mb-1">
                  Estremi autorizzazione COSFEL per l'adeguamento del salario accessorio
                </label>
                <input
                  id="documentazioneCosfelDl25"
                  type="text"
                  placeholder="es. Parere COSFEL n. 3/2026 del 20/02/2026"
                  value={state.documentazioneCosfelDl25 ?? ''}
                  onChange={(e) => onChange({ documentazioneCosfelDl25: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                />
                <Wizard2026FieldHelp
                  label="Autorizzazione COSFEL"
                  helpText="Indicare gli estremi del provvedimento o della comunicazione COSFEL che autorizza l'adeguamento del salario accessorio. Il dato è necessario solo per gli enti soggetti al relativo regime autorizzatorio."
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* SEZIONE 4: Sostenibilità e Rispetto dei Limiti di Spesa */}
      {status === 'DIRECTLY_APPLICABLE' && (
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="h-5 w-5 text-[#CC4331]" />
            Sezione 4 — Sostenibilità e Rispetto dei Limiti di Spesa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="limiteStoricoSpesaPersonale" className="block text-sm font-semibold text-slate-800 mb-1">
                Limite Storico Spesa Personale (€)
              </label>
              <input
                id="limiteStoricoSpesaPersonale"
                type="number"
                value={state.limiteStoricoSpesaPersonale ?? ''}
                placeholder="es. Tetto storico di spesa"
                onChange={(e) => onChange({ limiteStoricoSpesaPersonale: parseVal(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
              />
            </div>

            {/* MOD-011-ter F1: base calcolo limite storico */}
            <div>
              <label htmlFor="baseCalcoloLimiteStorico" className="block text-sm font-semibold text-slate-800 mb-1">
                Base di calcolo del limite storico
              </label>
              <select
                id="baseCalcoloLimiteStorico"
                value={state.baseCalcoloLimiteStorico ?? ''}
                onChange={(e) => onChange({ baseCalcoloLimiteStorico: e.target.value || undefined })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
              >
                <option value="">— Non indicato —</option>
                <option value="media 2011-2013">Media 2011-2013</option>
                <option value="anno 2008">Anno 2008</option>
                <option value="altra base">Altra base normativa</option>
              </select>
              <Wizard2026FieldHelp
                label="Base limite storico"
                helpText="Specificare la base utilizzata dall'ente per determinare il limite storico della spesa di personale, ad esempio media 2011-2013, anno 2008 o altra base applicabile."
              />
            </div>

            <div>
              <label htmlFor="spesaPersonalePrevista2026AnteIncremento" className="block text-sm font-semibold text-slate-800 mb-1">
                Spesa Personale Prevista 2026 Ante-Incremento (€)
              </label>
              <input
                id="spesaPersonalePrevista2026AnteIncremento"
                type="number"
                value={state.spesaPersonalePrevista2026AnteIncremento ?? ''}
                placeholder="Stima spesa 2026 ante D.L. 25/2025"
                onChange={(e) => onChange({ spesaPersonalePrevista2026AnteIncremento: parseVal(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
              />
            </div>
          </div>

          {/* Calcoli ed asseverazioni di spesa */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Verifica del Margine di Sostenibilità Contabile</h4>

            {/* Box Limite Sostenibilità (DM 17.03.2020) */}
            {res?.margineSpesaPersonale !== undefined ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Margine Spesa Personale Disponibile (Soglia Virtuosità):</span>
                  <strong className="text-xs text-slate-800 font-mono">{formatCurrency(res.margineSpesaPersonale)}</strong>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5 font-semibold">
                  <Check className="h-4 w-4" />
                  Margine calcolato in base alle entrate correnti ed alla soglia del D.M. 17 marzo 2020.
                </div>
              </div>
            ) : (
              isComune && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Dati finanziari per la verifica della sostenibilità (DM 17.03.2020) incompleti. Istruttoria non validabile.</span>
                </div>
              )
            )}

            {/* Box Limite Storico */}
            {state.limiteStoricoSpesaPersonale !== undefined && state.spesaPersonalePrevista2026AnteIncremento !== undefined ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Tetto Storico Spesa Personale {state.baseCalcoloLimiteStorico ? `(${state.baseCalcoloLimiteStorico})` : ''}:</span>
                  <strong className="text-xs text-slate-800 font-mono">{formatCurrency(state.limiteStoricoSpesaPersonale)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Spesa Prevista 2026 Ante-Incremento:</span>
                  <strong className="text-xs text-slate-800 font-mono">{formatCurrency(state.spesaPersonalePrevista2026AnteIncremento)}</strong>
                </div>

                {res?.scostamentoLimiteStorico !== undefined && (
                  <div className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold ${
                    res.scostamentoLimiteStorico > 0
                      ? 'bg-rose-50 border border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  }`} data-testid="scostamento-limite-storico">
                    <span>Scostamento dal limite storico (Ante-Incremento):</span>
                    <strong className="font-mono">{formatCurrency(res.scostamentoLimiteStorico)}</strong>
                  </div>
                )}

                {state.spesaPersonalePrevista2026AnteIncremento > state.limiteStoricoSpesaPersonale ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-[#A83226] rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="h-4 w-4" />
                      Attenzione: Superamento del tetto storico di spesa ante-incremento!
                    </div>
                    <p className="mt-1">La spesa prevista per il 2026 (escluso l'incremento D.L. 25/2025) supera già il limite storico dell'ente.</p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5 font-semibold">
                    <Check className="h-4 w-4" />
                    Spesa ante-incremento conforme al tetto storico.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Nessun limite storico di spesa inserito. La sostenibilità rispetto ai vecchi tetti non è verificata.</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SEZIONE D: Modalità trasferimento (Unioni) */}
      {status === 'TRANSFER_ONLY' && (
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sezione 3 — Tabella di Trasferimento Quote Comuni Aderenti
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                L'Unione acquisisce l'incremento unicamente per trasferimento delle quote certificate dai singoli Comuni.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddQuote}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#CC4331] text-white hover:bg-[#A83226] text-xs font-bold transition-all shadow-sm shrink-0"
              data-testid="add-quote-btn"
            >
              <Plus className="h-4 w-4" />
              Aggiungi Ente
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Comune Aderente</th>
                  <th className="px-4 py-3 text-left">Tipologia</th>
                  <th className="px-4 py-3 text-left">Cod. ISTAT</th>
                  <th className="px-4 py-3 text-right">Quota Massima Trasferibile (€)</th>
                  <th className="px-4 py-3 text-center">Riduz. Perm.</th>
                  <th className="px-4 py-3 text-left">Estremi Atto</th>
                  <th className="px-4 py-3 text-center">Parere Ader.</th>
                  <th className="px-4 py-3 text-center">Parere Ricev.</th>
                  <th className="px-4 py-3 text-center">COSFEL Ader.</th>
                  <th className="px-4 py-3 text-left">Note</th>
                  <th className="px-4 py-3 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(!state.quoteAderenti || state.quoteAderenti.length === 0) ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-400 text-xs font-semibold">
                      Nessun ente inserito. Fai click su "Aggiungi Ente" per iniziare.
                    </td>
                  </tr>
                ) : (
                  state.quoteAderenti.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 min-w-[140px]">
                        <input
                          type="text"
                          value={q.enteAderente}
                          placeholder="Nome Comune"
                          onChange={(e) => handleUpdateQuote(q.id, { enteAderente: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#CC4331] outline-none"
                        />
                      </td>
                      {/* MOD-011-ter H1: Tipologia ente aderente */}
                      <td className="px-3 py-2.5 min-w-[110px]">
                        <input
                          type="text"
                          value={q.tipologiaEnteAderente || ''}
                          placeholder="es. Comune"
                          onChange={(e) => handleUpdateQuote(q.id, { tipologiaEnteAderente: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#CC4331] outline-none"
                        />
                      </td>
                      <td className="px-3 py-2.5 w-24">
                        <input
                          type="text"
                          value={q.codiceIstatEnteAderente || ''}
                          placeholder="6 cifre"
                          onChange={(e) => handleUpdateQuote(q.id, { codiceIstatEnteAderente: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-center font-mono focus:ring-1 focus:ring-[#CC4331] outline-none"
                        />
                      </td>
                      <td className="px-3 py-2.5 w-32">
                        <input
                          type="number"
                          value={q.quotaMassimaTrasferibile ?? ''}
                          placeholder="0.00"
                          onChange={(e) => handleUpdateQuote(q.id, { quotaMassimaTrasferibile: parseVal(e.target.value) })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-right font-mono focus:ring-1 focus:ring-[#CC4331] outline-none"
                        />
                      </td>
                      <td className="px-3 py-2.5 w-28 text-center">
                        <div className="flex justify-center">
                          {renderThreeStateButtons(
                            q.riduzionePermanenteFondoAderente,
                            (val) => handleUpdateQuote(q.id, { riduzionePermanenteFondoAderente: val }),
                            `rid-perm-${q.id}`
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 min-w-[120px]">
                        <input
                          type="text"
                          value={q.estremiAttoEnteAderente}
                          placeholder="DGC o Det. n."
                          onChange={(e) => handleUpdateQuote(q.id, { estremiAttoEnteAderente: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#CC4331] outline-none"
                        />
                      </td>
                      <td className="px-3 py-2.5 w-28 text-center">
                        <div className="flex justify-center">
                          {renderThreeStateButtons(
                            q.parereRevisoriEnteAderente,
                            (val) => handleUpdateQuote(q.id, { parereRevisoriEnteAderente: val }),
                            `parere-aderente-${q.id}`
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 w-28 text-center">
                        <div className="flex justify-center">
                          {renderThreeStateButtons(
                            q.parereRevisoriEnteRicevente,
                            (val) => handleUpdateQuote(q.id, { parereRevisoriEnteRicevente: val }),
                            `parere-ricevente-${q.id}`
                          )}
                        </div>
                      </td>
                      {/* MOD-011-ter H2: COSFEL ente aderente */}
                      <td className="px-3 py-2.5 w-28 text-center">
                        <div className="flex justify-center">
                          {renderThreeStateButtons(
                            q.hasAutorizzazioneCosfelAderente,
                            (val) => handleUpdateQuote(q.id, { hasAutorizzazioneCosfelAderente: val }),
                            `cosfel-aderente-${q.id}`
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={q.note || ''}
                          placeholder="Annotazioni"
                          onChange={(e) => handleUpdateQuote(q.id, { note: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#CC4331] outline-none"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center w-12">
                        <button
                          type="button"
                          onClick={() => handleRemoveQuote(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Rimuovi riga"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SEZIONE 5: Report ed Esito Istruttoria */}
      <section className="space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-[#CC4331]" />
          Sezione 5 — Report ed Esito Istruttoria
        </h3>

        {status === 'DIRECTLY_APPLICABLE' && (
          <div className="space-y-6">
            {/* Prima riga: soglie di calcolo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Wizard2026ResultCard
                title="Soglia Limite 48%"
                amount={res?.soglia48}
                formula="Stipendi 2023 × 0.48"
                variant="neutral"
                description="Tetto massimo espansivo normativo"
              />

              <Wizard2026ResultCard
                title={`Risorse ${annoPrecedente} da Detrarre`}
                amount={res?.risorse2025DaSottrarre ?? (
                  state.fondoStabile2025Certificato !== undefined && state.budgetEq2025 !== undefined
                    ? state.fondoStabile2025Certificato + state.budgetEq2025 + (state.altreRisorse2025DaSottrarre ?? 0)
                    : undefined
                )}
                formula={`Fondo${annoPrecedenteShort} + BudgetEQ${annoPrecedenteShort} + Altre`}
                variant="neutral"
                description="Salario accessorio pre-consolidato"
              />

              <Wizard2026ResultCard
                title="Incremento Massimo Teorico"
                amount={res?.incrementoMassimoTeorico}
                formula={`Soglia48 − Risorse${annoPrecedente}`}
                variant="neutral"
                description="Capacità massima teorica netta"
              />
            </div>

            {/* Card Risultato Principale */}
            <div className="p-6 rounded-2xl border bg-[#FFF4F2] border-[#CC4331] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#CC4331] text-white">
                  Risultato principale dello step
                </span>
                <h4 className="text-base font-extrabold text-[#A83226] mt-2">
                  Limite Massimo Stabile D.L. 25/2025
                </h4>
                <p className="text-xs text-slate-500 max-w-xl">
                  L'ammontare massimo teorico dell'incremento stabile applicabile al fondo decentrato dell'ente, depurato dai limiti di spesa e sostenibilità. Rappresenta la capienza massima utilizzabile nella successiva Costituzione del Fondo.
                </p>
                {res?.motivoRiduzione && (
                  <div className="text-xs text-[#A83226] bg-[#FCE7E2] px-3 py-1.5 rounded-md mt-2 font-medium">
                    Nota di calcolo: {res.motivoRiduzione}
                  </div>
                )}
              </div>
              <div className="text-center md:text-right shrink-0">
                <div className="text-3xl font-extrabold text-[#A83226] font-mono">
                  {res?.isCalcolabile && res?.limiteMassimoDL25 !== undefined
                    ? formatCurrency(res.limiteMassimoDL25)
                    : 'Non calcolabile'}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase font-mono">
                  Limite Massimo - Stabile
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
              <div>
                <label htmlFor="incrementoApplicatoDL25" className="block text-sm font-semibold text-slate-800 mb-1">
                  Importo D.L. 25/2025 da applicare al Fondo (€)
                </label>
                <input
                  id="incrementoApplicatoDL25"
                  type="number"
                  min="0"
                  max={res?.limiteMassimoDL25}
                  value={state.incrementoApplicato ?? ''}
                  placeholder="0,00"
                  onChange={(e) => onChange({ incrementoApplicato: parseVal(e.target.value) })}
                  className="w-full sm:max-w-xs px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                  data-testid="incrementoApplicatoDL25"
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Il limite massimo resta un controllo istruttorio. Questo importo, se valorizzato entro il massimo teorico, sarà trasferito nella Costituzione Fondo come stanziamento effettivo; se vuoto o pari a zero, il Fondo resta a zero.
              </p>
              {state.incrementoApplicato !== undefined &&
                res?.limiteMassimoDL25 !== undefined &&
                state.incrementoApplicato > res.limiteMassimoDL25 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-[#A83226] rounded-lg text-xs font-semibold" data-testid="dl25-applicato-over-max">
                    Importo applicato superiore al limite massimo teorico calcolato.
                  </div>
                )}
            </div>
          </div>
        )}

        {status === 'TRANSFER_ONLY' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Wizard2026ResultCard
                title="Somma delle Quote Aderenti"
                amount={res?.quotaTotaleInserita}
                formula="Somma(Quota Trasferita)"
                variant="neutral"
                description="Totale risorse dichiarate dagli enti"
              />

              <Wizard2026ResultCard
                title="Quote Non Validate"
                amount={res?.quotaNonValidata}
                formula="Quote non certificate"
                variant="neutral"
                description="Accantonamenti in attesa di asseverazione"
              />

              <Wizard2026ResultCard
                title="Quote Validate"
                amount={res?.quotaTotaleValidata}
                formula="Quote conformi ed asseverate"
                variant="neutral"
                description="Risorse pronte per l'iscrizione"
              />
            </div>

            {/* Card Risultato Principale */}
            <div className="p-6 rounded-2xl border bg-[#FFF4F2] border-[#CC4331] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#CC4331] text-white">
                  Risultato principale dello step
                </span>
                <h4 className="text-base font-extrabold text-[#A83226] mt-2">
                  Limite Massimo da Risorse Trasferite Iscrivibili
                </h4>
                <p className="text-xs text-slate-500 max-w-xl">
                  Il totale massimo teorico derivante dalle quote validate degli enti aderenti per le quali risulta certificata la riduzione permanente del fondo e asseverati i pareri dei revisori.
                </p>
              </div>
              <div className="text-center md:text-right shrink-0">
                <div className="text-3xl font-extrabold text-[#A83226] font-mono">
                  {res?.isCalcolabile && res?.limiteMassimoDL25 !== undefined
                    ? formatCurrency(res.limiteMassimoDL25)
                    : 'Non calcolabile'}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase font-mono">
                  Limite quote validate
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'NOT_APPLICABLE' && (
          <div className="p-6 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl text-center">
            Nessun report disponibile. L'ente non è soggetto all'applicazione del D.L. 25/2025.
          </div>
        )}
      </section>

      <Wizard2026CheckList checks={state.checks} />
    </div>
  );
};
