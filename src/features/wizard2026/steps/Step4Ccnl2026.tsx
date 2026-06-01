import React, { useState } from 'react';
import { Wizard2026Ccnl2026StepState, Wizard2026EnteStepState } from '../types';
import { Wizard2026StepHeader, Wizard2026InfoBox, Wizard2026FieldHelp, Wizard2026CheckList, Wizard2026ResultCard } from '../components';
import { AlertCircle, AlertTriangle, Info, Check, HelpCircle, X, TrendingUp, Split } from 'lucide-react';

export interface Step4Ccnl2026Props {
  state: Wizard2026Ccnl2026StepState;
  enteState?: Wizard2026EnteStepState;
  onChange: (payload: Partial<Wizard2026Ccnl2026StepState>) => void;
}

export const Step4Ccnl2026: React.FC<Step4Ccnl2026Props> = ({ state, enteState, onChange }) => {
  const parseVal = (val: string) => (val === '' ? undefined : parseFloat(val) || undefined);
  const parseValZeroAllowed = (val: string) => (val === '' ? undefined : parseFloat(val) ?? undefined);
  const res = state.result;

  const annoRiferimento = enteState?.annoRiferimento ?? 2026;
  const isPost2026 = annoRiferimento > 2026;
  const isDeficitario = enteState?.isStrutturalmenteDeficitario === true;
  const hasCosfel = enteState?.hasApprovazioneCosfel;

  const isBlocked = isDeficitario && hasCosfel === false;
  const showCosfelMissingWarning = isDeficitario && hasCosfel === undefined;

  const [activeHelpField, setActiveHelpField] = useState<string | null>(null);

  // Determina il Monte Salari 2021 mostrato
  const ms2021Effettivo = isPost2026
    ? state.monteSalari2021Consolidato2026
    : state.monteSalari2021;

  const ms2021Mancante = isPost2026
    ? state.monteSalari2021Consolidato2026 === undefined
    : state.monteSalari2021 === undefined;

  // Riparto
  const fondoRisorseDecentrate2024 = state.fondoRisorseDecentrate2024;
  const risorseEQ2024 = state.risorseEQ2024;
  const baseRiparto2024 =
    fondoRisorseDecentrate2024 !== undefined && risorseEQ2024 !== undefined
      ? fondoRisorseDecentrate2024 + risorseEQ2024
      : undefined;
  const baseRipartoValida = baseRiparto2024 !== undefined && baseRiparto2024 > 0;

  // Superamento limite 022
  const isSuperamento = res?.isSuperamentoLimite022 === true;

  const HELP_CONTENTS: Record<string, { title: string; body: React.ReactNode }> = {
    monteSalari2021: {
      title: 'Come si calcola il Monte Salari 2021',
      body: (
        <div className="space-y-3">
          <p>Il Monte Salari 2021 è la base di calcolo degli incrementi contrattuali dello 0,14% e dello 0,22%.</p>
          <p>Il dato si ricava dalle rilevazioni del Conto Annuale MEF, in particolare dalle Tabelle 12 e 13.</p>
          <p>Devono essere considerate solo le somme riferite al personale non dirigente inquadrato nelle Aree: Operatori, Operatori Esperti, Istruttori, Funzionari ed Elevate Qualificazioni.</p>
          <p>Devono essere esclusi dirigenti e segretario comunale.</p>
          <p>Nel Monte Salari rientrano le competenze fisse e le voci accessorie che remunerano direttamente il lavoro prestato.</p>
          <p>Devono invece essere esclusi assegni per il nucleo familiare, buoni pasto, rimborsi spese, indennità di trasferimento, equo indennizzo, spese per attività ricreative e arretrati riferiti ad anni precedenti.</p>
          <p className="font-semibold text-slate-800">Il valore va indicato al lordo del dipendente, ma al netto degli oneri riflessi a carico dell'ente.</p>
        </div>
      ),
    },
    incremento022Anno: {
      title: "Incremento 0,22% per l'anno",
      body: (
        <div className="space-y-3">
          <p>Indicare l'importo dell'incremento 0,22% che si intende considerare per l'anno di istruttoria.</p>
          <p>L'importo non può superare il limite massimo calcolato dal wizard.</p>
          <p>Il campo è opzionale: se non compilato, viene calcolato solo il limite massimo. Il riparto tra Fondo e EQ sarà disponibile solo dopo l'inserimento.</p>
          <p>La scelta definitiva e il trasferimento alla Costituzione Fondo saranno implementati successivamente.</p>
          <p className="font-semibold text-slate-800">Un valore pari a 0 è ammesso e produce quote di riparto pari a 0.</p>
        </div>
      ),
    },
    fondoRisorseDecentrate2024: {
      title: 'Fondo risorse decentrate 2024',
      body: (
        <div className="space-y-3">
          <p>Indicare l'intero ammontare del Fondo risorse decentrate dell'anno 2024, non solo una singola voce o una quota parziale.</p>
          <p>Questo dato serve come base per il riparto proporzionale dell'incremento 0,22% tra il Fondo e le risorse per le Elevate Qualificazioni.</p>
        </div>
      ),
    },
    risorseEQ2024: {
      title: 'Risorse Elevate Qualificazioni 2024',
      body: (
        <div className="space-y-3">
          <p>Indicare l'intero ammontare delle risorse stanziate nel 2024 per la retribuzione di posizione e di risultato delle Elevate Qualificazioni.</p>
          <p>Assicurarsi di indicare l'intero stanziamento e non solo una quota.</p>
        </div>
      ),
    },
  };

  const activeHelp = activeHelpField ? HELP_CONTENTS[activeHelpField] : null;

  const formatEur = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const formatPct = (val: number | undefined) => {
    if (val === undefined) return '—';
    return `${(val * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      <Wizard2026StepHeader
        stepNumber={4}
        title="Incrementi CCNL 23.02.2026 (0,14% e 0,22%)"
        subtitle="Adeguamenti retributivi accessori contrattuali"
        description={`L'articolo 58 del CCNL 23.02.2026 prevede due distinti accrescimenti del fondo per la contrattazione integrativa calcolati sul Monte Salari dell'anno 2021: un incremento stabile dello 0,14% (con quota arretrati) e un incremento variabile eventuale fino allo 0,22%.${isPost2026 ? ` Anno istruttoria: ${annoRiferimento} — il Monte Salari 2021 viene mutuato dall'istruttoria 2026.` : ''}`}
      />

      <Wizard2026InfoBox
        title="Differenza tra Incremento Stabile (0,14%) e Variabile (0,22%)"
        description={
          <div className="space-y-1 mt-1 text-sm">
            <p><strong>• 0,14% Stabile (parte stabile):</strong> Incremento fisso e ricorrente calcolato come MS2021 × 0,14% × 1. Confluirà nella parte stabile del Fondo.</p>
            <p><strong>• 0,14% Arretrati (parte variabile):</strong> Quota una tantum calcolata come MS2021 × 0,14% × 2. Confluirà nella parte variabile del Fondo.</p>
            <p><strong>• 0,22% Variabile:</strong> Limite massimo attivabile anno per anno. Per il 2026: MS2021 × 0,22% × 2. Dal 2027: MS2021 × 0,22% × 1. Il riparto tra Fondo e EQ avviene in proporzione ai rispettivi valori 2024.</p>
          </div>
        }
        norma="Art. 58, commi 1 e 2, CCNL 23.02.2026"
        variant="cgil"
      />

      {/* Banner blocco COSFEL */}
      {isBlocked && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-[#A83226] rounded-xl flex items-start gap-3 shadow-sm" data-testid="cosfel-blocked-banner">
          <AlertCircle className="h-5 w-5 text-[#CC4331] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-sm font-bold">Blocco COSFEL: Incremento 0,22% precluso</strong>
            <p className="text-xs">
              L'ente risulta in regime di dissesto/deficitarietà strutturale e l'approvazione COSFEL è stata <strong>negata</strong>.
              Il limite massimo della quota dello 0,22% è forzato a zero.
            </p>
          </div>
        </div>
      )}

      {/* Warning COSFEL mancante */}
      {showCosfelMissingWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-3 shadow-sm" data-testid="cosfel-missing-warning">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-sm font-bold">Warning COSFEL: verifica in corso</strong>
            <p className="text-xs">
              L'ente risulta strutturalmente deficitario, ma l'approvazione COSFEL non è ancora stata verificata (dato non inserito nello Step 1).
              L'istruttoria non è validabile fino all'acquisizione della verifica. Il limite massimo dello 0,22% viene temporaneamente calcolato in via teorica ma non è validabile.
            </p>
          </div>
        </div>
      )}

      {/* Warning MS2021 consolidato mancante */}
      {isPost2026 && ms2021Mancante && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-3 shadow-sm" data-testid="ms2021-consolidato-mancante-warning">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-sm font-bold">Monte Salari 2021 consolidato 2026 mancante</strong>
            <p className="text-xs">
              Per l'anno {annoRiferimento}, il Monte Salari 2021 deve essere mutuato dall'istruttoria 2026.
              Il dato non è presente: recuperarlo dall'istruttoria 2026 e inserirlo manualmente.
              Il calcolo degli incrementi non è eseguibile fino alla sua disponibilità.
            </p>
          </div>
        </div>
      )}

      {/* SEZIONE 1 — Base di calcolo */}
      <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Info className="h-5 w-5 text-[#CC4331]" />
          Sezione 1 — Base di calcolo (Monte Salari 2021)
        </h3>

        {isPost2026 ? (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">
                Anno {annoRiferimento} — Dato mutuato dall'istruttoria 2026
              </p>
              <p className="text-sm text-slate-700">
                Il Monte Salari 2021 utilizzato in questa istruttoria è quello consolidato nell'istruttoria 2026.
                Non è richiesto un nuovo inserimento; non è possibile ricalcolare la base.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Monte Salari 2021 consolidato 2026 (€)
              </label>
              <input
                id="monteSalari2021Consolidato2026"
                type="number"
                value={state.monteSalari2021Consolidato2026 ?? ''}
                onChange={(e) => onChange({ monteSalari2021Consolidato2026: parseVal(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono focus:ring-2 focus:ring-[#CC4331] outline-none transition-all duration-200"
                placeholder="Inserire il dato dell'istruttoria 2026"
              />
              <Wizard2026FieldHelp
                label="Monte Salari 2021 consolidato"
                helpText={`Valore del Monte Salari 2021 già determinato nell'istruttoria 2026. Per l'anno ${annoRiferimento} non è previsto un nuovo calcolo della base.`}
                norma="Art. 58, CCNL 23.02.2026"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="monteSalari2021" className="block text-sm font-semibold text-slate-800">
                Monte Salari Anno 2021 (personale non dirigente) (€) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveHelpField('monteSalari2021')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
                title="Come si calcola il Monte Salari 2021"
                data-testid="monte-salari-help-button"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <input
              id="monteSalari2021"
              type="number"
              value={state.monteSalari2021 ?? ''}
              onChange={(e) => onChange({ monteSalari2021: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono focus:ring-2 focus:ring-[#CC4331] outline-none transition-all duration-200"
              placeholder="Inserisci il monte salari 2021"
            />
            <Wizard2026FieldHelp
              label="Monte Salari 2021"
              helpText="Base di calcolo contrattuale asseverata dal conto annuale 2021. Nota: questa base di calcolo è diversa dalla spesa per gli stipendi tabellari 2023 utilizzata nello Step 3."
              norma="Art. 58, CCNL 23.02.2026"
            />
          </div>
        )}
      </section>

      {/* SEZIONE 2 — Incremento 0,14% */}
      {!ms2021Mancante && (
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Check className="h-5 w-5 text-[#CC4331]" />
            Sezione 2 — Incremento 0,14% (parte stabile + arretrati)
          </h3>
          <p className="text-sm text-slate-600">
            L'incremento dello 0,14% genera due valori distinti: la componente stabile (che confluirà nella parte stabile del Fondo)
            e la quota una tantum di arretrati (che confluirà nella parte variabile). Non vengono sommati in un unico totale.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Wizard2026ResultCard
              title="Incremento stabile 0,14% — parte stabile"
              amount={res?.incrementoStabile014}
              formula={`MS2021 × 0,14% × 1 = ${formatEur(ms2021Effettivo)} × 0,14%`}
              variant="cgil"
              description="Importo calcolato sul Monte Salari 2021. Dopo il completamento del refactoring sarà trasferito nella corrispondente voce di parte stabile del Fondo risorse decentrate."
            />
            <Wizard2026ResultCard
              title="Arretrati 0,14% — parte variabile"
              amount={res?.arretrati014}
              formula={`MS2021 × 0,14% × 2 = ${formatEur(ms2021Effettivo)} × 0,28%`}
              variant="cgil"
              description="Importo una tantum calcolato sul Monte Salari 2021, da destinare alla corrispondente voce di parte variabile nella Costituzione Fondo."
            />
          </div>
        </section>
      )}

      {/* SEZIONE 3 — Incremento eventuale 0,22% */}
      {!ms2021Mancante && (
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="h-5 w-5 text-[#CC4331]" />
            Sezione 3 — Incremento eventuale 0,22%
          </h3>

          {/* Limite massimo (read-only) */}
          <div>
            <Wizard2026ResultCard
              title="Limite massimo incremento 0,22%"
              amount={res?.limiteMassimo022}
              formula={
                isBlocked
                  ? 'Forzato a 0 per blocco COSFEL'
                  : annoRiferimento === 2026
                  ? `MS2021 × 0,22% × 2 = ${formatEur(ms2021Effettivo)} × 0,44%`
                  : `MS2021 × 0,22% × 1 = ${formatEur(ms2021Effettivo)} × 0,22%`
              }
              variant={isBlocked ? 'neutral' : 'cgil'}
              description={
                annoRiferimento === 2026
                  ? 'Per il solo anno 2026 il limite massimo è calcolato moltiplicando il Monte Salari 2021 per 0,22% e per 2 (periodo 2024–2025).'
                  : `Dal 2027 il limite massimo è calcolato moltiplicando il Monte Salari 2021 per 0,22% e per 1 (periodo annuale).`
              }
            />
          </div>

          {/* Input incremento 0,22% per l'anno */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="incremento022Anno" className="block text-sm font-semibold text-slate-800">
                Incremento 0,22% per l'anno (€)
                <span className="ml-2 text-xs font-normal text-slate-500">(opzionale)</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveHelpField('incremento022Anno')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
                title="Informazioni sull'incremento 0,22% per l'anno"
                data-testid="incremento022-help-button"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <input
              id="incremento022Anno"
              type="number"
              min={0}
              value={state.incremento022Anno ?? ''}
              onChange={(e) => onChange({ incremento022Anno: parseValZeroAllowed(e.target.value) })}
              className={`w-full px-4 py-2.5 rounded-lg border font-mono focus:ring-2 outline-none transition-all duration-200 ${
                isSuperamento
                  ? 'border-red-400 bg-red-50 focus:ring-red-400 text-red-800'
                  : 'border-slate-300 bg-white text-slate-800 focus:ring-[#CC4331]'
              }`}
              placeholder="Inserisci l'importo 0,22% per l'anno (opzionale)"
            />
            {isSuperamento && (
              <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Superamento del limite massimo: l'importo non può eccedere {formatEur(res?.limiteMassimo022)}.
              </p>
            )}
            {state.incremento022Anno === undefined && (
              <p className="mt-1.5 text-xs text-slate-500">
                Non compilato: il riparto Fondo/EQ non sarà calcolato fino all'inserimento di questo dato.
              </p>
            )}
            <Wizard2026FieldHelp
              label="Incremento 0,22% per l'anno"
              helpText="Indicare l'importo dell'incremento 0,22% che si intende considerare per l'anno di istruttoria. L'importo non può superare il limite massimo calcolato dal wizard. La scelta definitiva e il trasferimento alla Costituzione Fondo saranno implementati successivamente."
              norma="Art. 58, comma 2, CCNL 23.02.2026"
            />
          </div>

          {/* Base di riparto 2024 */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Split className="h-4 w-4 text-[#CC4331]" />
              Base di riparto proporzionale (dati anno 2024)
            </h4>
            <p className="text-xs text-slate-600 mb-4">
              Il riparto dell'incremento 0,22% tra Fondo risorse decentrate ed Elevate Qualificazioni avviene
              in proporzione ai rispettivi valori dell'anno 2024. Inserire i dati completi, non solo singole quote.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="fondoRisorseDecentrate2024" className="block text-sm font-semibold text-slate-800">
                    Intero Fondo risorse decentrate 2024 (€)
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveHelpField('fondoRisorseDecentrate2024')}
                    className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
                    data-testid="fondo2024-help-button"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <input
                  id="fondoRisorseDecentrate2024"
                  type="number"
                  min={0}
                  value={state.fondoRisorseDecentrate2024 ?? ''}
                  onChange={(e) => onChange({ fondoRisorseDecentrate2024: parseVal(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono focus:ring-2 focus:ring-[#CC4331] outline-none transition-all duration-200"
                  placeholder="Intero Fondo decentrate 2024"
                />
                <Wizard2026FieldHelp
                  label="Fondo risorse decentrate 2024"
                  helpText="Indicare l'intero ammontare del Fondo risorse decentrate dell'anno 2024, non solo una singola voce o una quota parziale."
                  norma="Art. 58, CCNL 23.02.2026"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="risorseEQ2024" className="block text-sm font-semibold text-slate-800">
                    Intere risorse EQ 2024 (retrib. posizione e risultato) (€)
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveHelpField('risorseEQ2024')}
                    className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
                    data-testid="eq2024-help-button"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <input
                  id="risorseEQ2024"
                  type="number"
                  min={0}
                  value={state.risorseEQ2024 ?? ''}
                  onChange={(e) => onChange({ risorseEQ2024: parseVal(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono focus:ring-2 focus:ring-[#CC4331] outline-none transition-all duration-200"
                  placeholder="Intere risorse EQ 2024"
                />
                <Wizard2026FieldHelp
                  label="Risorse EQ 2024"
                  helpText="Indicare l'intero ammontare delle risorse stanziate nel 2024 per la retribuzione di posizione e di risultato delle Elevate Qualificazioni."
                  norma="Art. 58, CCNL 23.02.2026"
                />
              </div>
            </div>

            {/* Warning base riparto zero */}
            {fondoRisorseDecentrate2024 !== undefined && risorseEQ2024 !== undefined && !baseRipartoValida && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs">
                  Base di riparto 2024 mancante o non valida (Fondo + EQ = 0). Il riparto proporzionale dello 0,22% non può essere calcolato.
                </p>
              </div>
            )}
          </div>

          {/* Risultati riparto */}
          {res?.isCalcolabile && state.incremento022Anno !== undefined && baseRipartoValida && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">Riparto proporzionale 0,22%</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Quote */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="text-slate-500 mb-1">Quota Fondo</p>
                  <p className="text-lg font-bold text-slate-900">{formatPct(res?.quotaFondo)}</p>
                  <p className="text-slate-400 mt-0.5">{formatEur(fondoRisorseDecentrate2024)} / {formatEur(baseRiparto2024)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="text-slate-500 mb-1">Quota EQ</p>
                  <p className="text-lg font-bold text-slate-900">{formatPct(res?.quotaEQ)}</p>
                  <p className="text-slate-400 mt-0.5">{formatEur(risorseEQ2024)} / {formatEur(baseRiparto2024)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="text-slate-500 mb-1">Base totale 2024</p>
                  <p className="text-lg font-bold text-slate-900">{formatEur(baseRiparto2024)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Wizard2026ResultCard
                  title="Quota 0,22% → Fondo risorse decentrate"
                  amount={res?.incremento022Fondo}
                  formula={`${formatEur(state.incremento022Anno)} × ${formatPct(res?.quotaFondo)}`}
                  variant="cgil"
                  description="Quota dell'incremento 0,22% destinata al Fondo risorse decentrate. Sarà trasferita successivamente nella Costituzione Fondo."
                />
                <Wizard2026ResultCard
                  title="Quota 0,22% → Elevate Qualificazioni"
                  amount={res?.incremento022EQ}
                  formula={`${formatEur(state.incremento022Anno)} × ${formatPct(res?.quotaEQ)}`}
                  variant="cgil"
                  description="Quota dell'incremento 0,22% destinata alle risorse per le Elevate Qualificazioni. Sarà trasferita successivamente."
                />
              </div>
            </div>
          )}

          {/* Placeholder se incremento022Anno non inserito */}
          {res?.isCalcolabile && state.incremento022Anno === undefined && baseRipartoValida && (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-sm text-slate-500">
              Inserire l'importo dell'incremento 0,22% per calcolare il riparto tra Fondo e EQ.
            </div>
          )}
        </section>
      )}

      <Wizard2026CheckList checks={state.checks} />

      {/* Modal di Approfondimento */}
      {activeHelp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="help-modal">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {activeHelp.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveHelpField(null)}
                className="text-slate-400 hover:text-[#cc4331] focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-colors"
                data-testid="close-modal-x"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-sm text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto">
              {activeHelp.body}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveHelpField(null)}
                className="px-4 py-2 bg-[#cc4331] text-white text-sm font-semibold rounded-lg hover:bg-[#a83226] active:bg-[#6b1d14] transition-colors focus:outline-none focus:ring-2 focus:ring-[#cc4331]/40"
                data-testid="close-modal-btn"
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
