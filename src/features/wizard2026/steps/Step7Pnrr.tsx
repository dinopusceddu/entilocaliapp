import React from 'react';
import { Wizard2026PnrrStepState, Wizard2026EnteStepState } from '../types';
import {
  Wizard2026StepHeader,
  Wizard2026InfoBox,
  Wizard2026FieldHelp,
  Wizard2026CheckList,
  Wizard2026ResultCard,
} from '../components';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export interface Step7PnrrProps {
  state: Wizard2026PnrrStepState;
  hasDirigenza: boolean;
  annoRiferimento: number;
  hasApprovazioneCosfel?: boolean;
  onChange: (payload: Partial<Wizard2026PnrrStepState>) => void;
  onEnteChange: (payload: Partial<Wizard2026EnteStepState>) => void;
}

export const Step7Pnrr: React.FC<Step7PnrrProps> = ({
  state,
  hasDirigenza,
  annoRiferimento,
  hasApprovazioneCosfel,
  onChange,
  onEnteChange,
}) => {
  const parseVal = (val: string) => (val === '' ? undefined : parseFloat(val) || undefined);
  const res = state.result;
  const prevYear = annoRiferimento - 1;

  // Renderizzatore premium per switch a 3 vie (Sì / No / n.d.)
  const renderThreeWayToggle = (
    label: string,
    value: boolean | undefined | null,
    onValueChange: (val: boolean | undefined) => void,
    helpText?: string,
    testIdPrefix?: string
  ) => {
    return (
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800 leading-snug">
            {label}
          </label>
          {helpText && <p className="text-xs text-slate-500 leading-relaxed">{helpText}</p>}
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onValueChange(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
              value === true
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
            data-testid={testIdPrefix ? `${testIdPrefix}-yes` : undefined}
          >
            Sì
          </button>
          <button
            type="button"
            onClick={() => onValueChange(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
              value === false
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
            data-testid={testIdPrefix ? `${testIdPrefix}-no` : undefined}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => onValueChange(undefined)}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
              value === undefined || value === null
                ? 'bg-slate-400 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
            data-testid={testIdPrefix ? `${testIdPrefix}-missing` : undefined}
          >
            n/d
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Wizard2026StepHeader
        stepNumber={7}
        title="Istruttoria Limite PNRR"
        subtitle="Verifica e calcolo del limite massimo teorico (Art. 8, c. 3, D.L. 13/2023)"
        description="Questa scheda istruttoria serve a verificare l'applicabilità e calcolare il limite massimo teorico delle risorse in deroga (pari al 5% della componente stabile 2016). L'effettivo stanziamento e incremento del fondo sarà deciso in fase di Costituzione Fondo."
      />

      <Wizard2026InfoBox
        title="Dettagli Istruttori ed Esclusione dai Limiti"
        description={
          <div className="space-y-1.5 mt-1 text-sm leading-relaxed">
            <p>Le risorse PNRR costituiscono una <strong>risorsa variabile</strong> e sono espressamente <strong>escluse dal limite di crescita dei fondi</strong> di cui all'Art. 23, comma 2, D.Lgs. 75/2017.</p>
            <p>L'accesso al limite massimo è subordinato al rispetto preliminare di requisiti normativi asseverati dall'Organo di Revisione con riferimento all'esercizio precedente.</p>
          </div>
        }
        norma="Art. 8, commi 3 e 4, D.L. 13/2023"
        variant="info"
      />

      {/* SEZIONE 1: Applicabilità Soggettiva */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">1</span>
          Soggettività PNRR e Anno {annoRiferimento}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Anno Istruttoria</span>
              <span className="text-lg font-bold text-slate-800 font-mono mt-1 block">{annoRiferimento}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">La deroga copre gli anni dal 2023 al 2026.</p>
          </div>

          <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-800 block">
                Soggetto attuatore o titolare di interventi/progetti PNRR nell'anno {annoRiferimento}? <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mt-0.5">L'ente deve rivestire il ruolo di soggetto attuatore o titolare di investimenti per applicare la deroga.</p>
            </div>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => onChange({ soggettoAttuatorePnrr: true })}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
                  state.soggettoAttuatorePnrr === true
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                data-testid="soggettoPnrr-yes"
              >
                Sì, soggetto attuatore
              </button>
              <button
                type="button"
                onClick={() => onChange({ soggettoAttuatorePnrr: false })}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
                  state.soggettoAttuatorePnrr === false
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                data-testid="soggettoPnrr-no"
              >
                No, non soggetto
              </button>
              <button
                type="button"
                onClick={() => onChange({ soggettoAttuatorePnrr: undefined })}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
                  state.soggettoAttuatorePnrr === undefined || state.soggettoAttuatorePnrr === null
                    ? 'bg-slate-400 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                data-testid="soggettoPnrr-missing"
              >
                Non espresso
              </button>
            </div>
          </div>
        </div>

        {state.soggettoAttuatorePnrr === false && (
          <div className="bg-slate-100 border border-slate-300 text-slate-700 p-4 rounded-xl flex gap-3 text-sm" data-testid="pnrr-non-applicabile-box">
            <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong>Step Non Applicabile:</strong> L'ente ha dichiarato di non essere soggetto attuatore/titolare di progetti PNRR.
              Pertanto, non è prevista alcuna istruttoria né limite massimo teorico attivabile per il PNRR.
            </div>
          </div>
        )}

        {(state.soggettoAttuatorePnrr === undefined || state.soggettoAttuatorePnrr === null) && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 text-sm" data-testid="pnrr-non-validabile-box">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Istruttoria Non Validabile:</strong> Il valore sul soggetto attuatore PNRR è mancante. Risultato provvisorio: <strong>n/d</strong>.
              Selezionare una delle opzioni sopra per procedere.
            </div>
          </div>
        )}
      </div>

      {state.soggettoAttuatorePnrr === true && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* SEZIONE 2: Basi Stabili 2016 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">2</span>
              Componenti Stabili del Fondo certificati nell'anno 2016
            </h3>
            <p className="text-xs text-slate-500">
              Fornire i valori storici della componente stabile dei fondi certificati per l'anno 2016, che fungono da base imponibile per la deroga del 5%.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="componenteStabileFondoDipendenti2016-input">
                  Componente Stabile Fondo Dipendenti 2016 (€) <span className="text-red-500">*</span>
                </label>
                <input
                  id="componenteStabileFondoDipendenti2016-input"
                  type="number"
                  value={state.componenteStabileFondoDipendenti2016 ?? ''}
                  onChange={(e) => onChange({ componenteStabileFondoDipendenti2016: parseVal(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Inserisci importo"
                  data-testid="componenteStabileFondoDipendenti2016"
                />
                <Wizard2026FieldHelp label="Stabile Dipendenti 2016" helpText="Componente stabile del personale non dirigente." norma="D.L. 13/2023" />
              </div>

              {hasDirigenza ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="componenteStabileFondoDirigenza2016-input">
                    Componente Stabile Fondo Dirigenza 2016 (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="componenteStabileFondoDirigenza2016-input"
                    type="number"
                    value={state.componenteStabileFondoDirigenza2016 ?? ''}
                    onChange={(e) => onChange({ componenteStabileFondoDirigenza2016: parseVal(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Inserisci importo"
                    data-testid="componenteStabileFondoDirigenza2016"
                  />
                  <Wizard2026FieldHelp label="Stabile Dirigenza 2016" helpText="Componente stabile della dirigenza (ente dotato di dirigenti)." norma="D.L. 13/2023" />
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center text-xs text-slate-500">
                  Fondo dirigenza non applicabile (l'ente ha dichiarato di non avere dirigenza nello Step 1).
                </div>
              )}
            </div>
          </div>

          {/* SEZIONE 3: Checklist Requisiti dell'Anno Precedente */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">3</span>
              Requisiti Contabili dell'Esercizio Precedente ({prevYear})
            </h3>
            <p className="text-xs text-slate-500">
              L'Organo di Revisione verifica questi requisiti asseverando l'equilibrio e il rispetto dei tetti di spesa legati all'esercizio {prevYear}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderThreeWayToggle(
                `1. Equilibrio di bilancio dell'anno ${prevYear}`,
                state.equilibrioEsercizioPrecedente,
                (val) => onChange({ equilibrioEsercizioPrecedente: val }),
                "Rispetto dei vincoli di finanza pubblica dell'esercizio precedente.",
                "equilibrioEsercizioPrecedente"
              )}

              {renderThreeWayToggle(
                `2. Rispetto parametri debito commerciale e ritardi pagamenti ${prevYear}`,
                state.parametriDebitoCommercialeEsercizioPrecedente,
                (val) => onChange({ parametriDebitoCommercialeEsercizioPrecedente: val }),
                "Tempi di pagamento e debito commerciale residuo conformi alle norme vigenti.",
                "parametriDebitoCommercialeEsercizioPrecedente"
              )}

              {renderThreeWayToggle(
                `3. Rendiconto dell'anno ${prevYear} approvato nei termini dall'organo consiliare competente`,
                state.rendicontoApprovatoTermini,
                (val) => onChange({ rendicontoApprovatoTermini: val }),
                "Il rendiconto deve essere stato approvato nei termini normativi previsti.",
                "rendicontoApprovatoTermini"
              )}

              {/* Incidenza salario accessorio */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-800 block">
                    4. Incidenza salario accessorio su spesa personale (Max 8%)
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    Verificare che la spesa per salario accessorio/incentivante dell'anno {prevYear} non superi l'8% della spesa del personale.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={state.incidenzaSalarioAccessorioScelta === 'diretto'}
                        onChange={() => onChange({ incidenzaSalarioAccessorioScelta: 'diretto' })}
                        className="text-blue-600 focus:ring-blue-500"
                        data-testid="incidenzaScelta-diretto"
                      />
                      <span>Inserimento diretto %</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={state.incidenzaSalarioAccessorioScelta === 'assistito'}
                        onChange={() => onChange({ incidenzaSalarioAccessorioScelta: 'assistito' })}
                        className="text-blue-600 focus:ring-blue-500"
                        data-testid="incidenzaScelta-assistito"
                      />
                      <span>Calcolo assistito</span>
                    </label>
                  </div>

                  {state.incidenzaSalarioAccessorioScelta === 'diretto' ? (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Incidenza Accessorio / Incentivante (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={state.incidenzaSalarioAccessorioPercentuale ?? ''}
                        onChange={(e) => onChange({ incidenzaSalarioAccessorioPercentuale: parseVal(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Es: 6.50"
                        data-testid="incidenzaSalarioAccessorioPercentuale"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-1 leading-tight">Salario Accessorio/Incentivante (€)</label>
                        <input
                          type="number"
                          value={state.salarioAccessorioIndicatori ?? ''}
                          onChange={(e) => onChange({ salarioAccessorioIndicatori: parseVal(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                          placeholder="Importo accessorio"
                          data-testid="salarioAccessorioIndicatori"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-1 leading-tight">Spesa del Personale Totale (€)</label>
                        <input
                          type="number"
                          value={state.spesaPersonaleIndicatori ?? ''}
                          onChange={(e) => onChange({ spesaPersonaleIndicatori: parseVal(e.target.value) })}
                          className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                          placeholder="Spesa personale"
                          data-testid="spesaPersonaleIndicatori"
                        />
                      </div>
                    </div>
                  )}

                  {res?.incidenzaSalarioAccessorioPercentualeCalcolata !== undefined && (
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                      <span className="text-slate-600 font-medium">Percentuale calcolata:</span>
                      <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                        res.incidenzaSalarioAccessorioPercentualeCalcolata > 8
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {res.incidenzaSalarioAccessorioPercentualeCalcolata.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SEZIONE 4: Attenzione COSFEL */}
          {!!(state.result?.isApplicabile && (state.checks.some(c => c.id.startsWith('COSFEL')) || hasApprovazioneCosfel !== undefined)) && (
            <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">4</span>
                Inquadramento Finanziario Straordinario / COSFEL
              </h3>
              <p className="text-xs text-amber-800/80">
                L'ente si trova in stato di dissesto, piano di riequilibrio o deficitarietà strutturale.
                La normativa richiede controlli e asseverazioni rafforzati. Si noti che la mancanza del parere COSFEL non azzera automaticamente il limite massimo PNRR teorico, ma costituisce un elemento istruttorio e di alert.
              </p>

              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
                <label className="text-sm font-semibold text-slate-800 block mb-2">
                  Stato Autorizzazione/Approvazione COSFEL per incremento fondi
                </label>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg max-w-md">
                  <button
                    type="button"
                    onClick={() => onEnteChange({ hasApprovazioneCosfel: true })}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                      hasApprovazioneCosfel === true
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                    data-testid="pnrr-cosfel-yes"
                  >
                    Acquisita / Sì
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnteChange({ hasApprovazioneCosfel: false })}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                      hasApprovazioneCosfel === false
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                    data-testid="pnrr-cosfel-no"
                  >
                    Non acquisita
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnteChange({ hasApprovazioneCosfel: undefined })}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                      hasApprovazioneCosfel === undefined || hasApprovazioneCosfel === null
                        ? 'bg-slate-400 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                    data-testid="pnrr-cosfel-missing"
                  >
                    n/d
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RISULTATI ISTRUTTORI */}
          {res && res.isValidable && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Risultati Istruttoria Limiti Massimi PNRR</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Wizard2026ResultCard
                  title="Massimo Fondo Dipendenti"
                  amount={res.limiteMassimoPnrrFondoDipendenti}
                  formula="Stabile Dipendenti 2016 × 5%"
                  variant="neutral"
                  description="Limite massimo teorico per il personale non dirigente"
                  data-testid="limiteMassimoPnrrFondoDipendenti-card"
                />

                {hasDirigenza ? (
                  <Wizard2026ResultCard
                    title="Massimo Fondo Dirigenza"
                    amount={res.limiteMassimoPnrrFondoDirigenza}
                    formula="Stabile Dirigenza 2016 × 5%"
                    variant="neutral"
                    description="Limite massimo teorico per il personale dirigente"
                    data-testid="limiteMassimoPnrrFondoDirigenza-card"
                  />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center text-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fondo Dirigenza</span>
                    <span className="text-sm font-bold text-slate-400 mt-2">Non presente</span>
                    <span className="text-[10px] text-slate-400 mt-1">L'ente non ha dirigenza</span>
                  </div>
                )}

                <Wizard2026ResultCard
                  title="Totale Massimo Teorico PNRR"
                  amount={res.totaleLimiteMassimoPnrr}
                  formula="Dipendenti + Dirigenza"
                  variant="success"
                  description="Totale limite conoscitivo teorico in deroga"
                  data-testid="totaleLimiteMassimoPnrr-card"
                />
              </div>

              <div className="bg-slate-100 border border-slate-200 text-slate-700 p-4 rounded-xl text-xs space-y-1">
                <p className="font-semibold">Nota di Esclusione dai Limiti di Crescita:</p>
                <p>
                  Si attesta che la quota PNRR costituisce una <strong>risorsa variabile</strong>, finanziata con i fondi del PNRR o da corrispondere al personale per attività di diretta attuazione. Tali somme sono <strong>escluse dal limite finanziario complessivo del trattamento accessorio</strong> stabilito dall'art. 23, comma 2, D.Lgs. 75/2017.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <Wizard2026CheckList checks={state.checks} />
    </div>
  );
};
