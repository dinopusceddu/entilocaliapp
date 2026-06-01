import React from 'react';
import { Wizard2026StraordinarioStepState, RisorsaEsclusaStraordinario } from '../types';
import { Wizard2026StepHeader, Wizard2026FieldHelp, Wizard2026CheckList, Wizard2026ResultCard } from '../components';
import { Plus, Trash2, Info, HelpCircle } from 'lucide-react';

export interface Step6StraordinarioProps {
  state: Wizard2026StraordinarioStepState;
  hasDirigenza: boolean;
  margineArt23: number;
  onChange: (payload: Partial<Wizard2026StraordinarioStepState>) => void;
}

export const Step6Straordinario: React.FC<Step6StraordinarioProps> = ({
  state,
  hasDirigenza,
  onChange,
}) => {
  const parseVal = (val: string) => (val === '' ? undefined : parseFloat(val) || undefined);
  const res = state.result;

  const tipologieOptions = [
    { value: 'elezioniReferendum', label: 'Elezioni e Referendum' },
    { value: 'calamitaEventiStraordinari', label: 'Calamità o eventi straordinari' },
    { value: 'istatCensimenti', label: 'ISTAT / censimenti' },
    { value: 'poliziaLocaleDeroga', label: 'Polizia Locale in deroga' },
    { value: 'altraFattispecieEsclusa', label: 'Altra fattispecie esclusa' }
  ];

  // Gestione risorse escluse
  const handleAddEsclusa = () => {
    const newId = Date.now().toString();
    const updated = [...(state.risorseEscluse || []), {
      id: newId,
      tipologia: 'elezioniReferendum' as const,
      importo: undefined,
      fonteNormativaFinanziaria: '',
      descrizione: '',
      esclusaDaArt23: true
    }];
    onChange({ risorseEscluse: updated });
  };

  const handleRemoveEsclusa = (id: string) => {
    const updated = (state.risorseEscluse || []).filter(r => r.id !== id);
    onChange({ risorseEscluse: updated });
  };

  const handleUpdateEsclusa = (id: string, fields: Partial<RisorsaEsclusaStraordinario>) => {
    const updated = (state.risorseEscluse || []).map(r => r.id === id ? { ...r, ...fields } : r);
    onChange({ risorseEscluse: updated });
  };

  // Calcolo economie dinamiche nel render per feedback immediato
  const stanziamentoPrec = state.stanziamentoStraordinarioOrdinarioAnnoPrecedente;
  const spesaPrec = state.spesaStraordinarioOrdinarioAnnoPrecedente;
  const economieCalcolate = (stanziamentoPrec !== undefined && spesaPrec !== undefined)
    ? stanziamentoPrec - spesaPrec
    : 0;

  const diffCalcolateCertificate = state.economieStraordinarioCertificate !== undefined
    ? economieCalcolate - state.economieStraordinarioCertificate
    : 0;

  return (
    <div className="space-y-8 font-sans">
      <Wizard2026StepHeader
        stepNumber={6}
        title="Fondo per il lavoro straordinario"
        subtitle="Art. 67, CCNL 23.02.2026"
        description="Classificazione delle risorse ordinarie, delle eventuali risorse aggiuntive e delle somme escluse dal limite dell’art. 23, comma 2, D.Lgs. 75/2017."
      />

      {/* SEZIONE 1 — Fondo straordinario ordinario */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-6 bg-[#CC4331] rounded-full inline-block"></span>
          1. Fondo straordinario ordinario
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="fondoStraordinarioOrdinarioAnnoCorrente">
              Fondo straordinario ordinario anno corrente (€) <span className="text-red-500">*</span>
            </label>
            <input
              id="fondoStraordinarioOrdinarioAnnoCorrente"
              type="number"
              value={state.fondoStraordinarioOrdinarioAnnoCorrente ?? ''}
              onChange={(e) => onChange({ fondoStraordinarioOrdinarioAnnoCorrente: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] focus:border-[#CC4331] outline-none"
              placeholder="0,00"
            />
            <Wizard2026FieldHelp label="Anno Corrente" helpText="Stanziamento base dello straordinario ordinario dell'anno di riferimento." />
          </div>
        </div>

        <div className="bg-[#FFF4F2] border border-[#FCE7E2] rounded-xl p-4 flex items-start gap-2.5 text-xs text-[#A83226]">
          <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#CC4331]" />
          <div>
            <span className="font-bold block mb-1">Nota Istruttoria Importante</span>
            Indicare solo il fondo per lavoro straordinario ordinario. Non includere elezioni, referendum, calamità, ISTAT, Polizia Locale in deroga o altre risorse eterofinanziate/escluse dal limite.
          </div>
        </div>
      </div>

      {/* SEZIONE 1-bis — Riduzione stabile straordinario (Art. 67 CCNL 21.5.2018) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-6 bg-[#CC4331] rounded-full inline-block"></span>
          1-bis. Riduzione stabile del fondo straordinario (Art. 67 CCNL 21.5.2018)
        </h3>
        
        <div className="bg-[#FFF4F2] border border-[#FCE7E2] rounded-xl p-4 flex items-start gap-2.5 text-xs text-[#A83226]">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#CC4331]" />
          <div>
            <span className="font-bold block mb-1">Destinazione Risorse</span>
            La riduzione stabile ex Art. 67 riduce lo stanziamento ordinario dello straordinario per alimentare in modo permanente una distinta voce di parte stabile del Fondo risorse decentrate.
          </div>
        </div>

        <div className="max-w-md">
          <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="riduzioneStabileStraordinarioArt67">
            Riduzione stabile straordinario ex Art. 67 (€)
          </label>
          <input
            id="riduzioneStabileStraordinarioArt67"
            type="number"
            value={state.riduzioneStabileStraordinarioArt67 ?? ''}
            onChange={(e) => onChange({ riduzioneStabileStraordinarioArt67: parseVal(e.target.value) })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] focus:border-[#CC4331] outline-none"
            placeholder="0,00"
          />
          <Wizard2026FieldHelp label="Riduzione Art. 67" helpText="Importo della riduzione stabile ex Art. 67 del CCNL 21.5.2018." />
        </div>

        {res && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700">Residuo straordinario ordinario dopo riduzione stabile:</span>
            <span className="font-mono font-bold text-lg text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(res.fondoStraordinarioOrdinarioResiduo)}
            </span>
          </div>
        )}
      </div>

      {/* SEZIONE 2 — Incremento ordinario CCNL 23.02.2026 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-6 bg-[#CC4331] rounded-full inline-block"></span>
          2. Incremento ordinario CCNL 23.02.2026
        </h3>

        <div className="bg-[#FFF4F2] border border-[#FCE7E2] rounded-xl p-4 flex items-start gap-2.5 text-xs text-[#A83226]">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#CC4331]" />
          <div>
            <span className="font-bold block mb-1">
              {hasDirigenza ? 'Regola per Enti con Dirigenza' : 'Regola per Enti senza Dirigenza'}
            </span>
            {hasDirigenza ? (
              <p>Negli enti con dirigenza l’incremento ordinario del fondo straordinario può avvenire solo se esiste capienza nel limite dell’art. 23, comma 2, D.Lgs. 75/2017. Non può essere finanziato riducendo il Fondo risorse decentrate.</p>
            ) : (
              <p>Negli enti senza dirigenza l’incremento ordinario del fondo straordinario può essere finanziato anche mediante riduzione del Fondo risorse decentrate, ma solo previa contrattazione integrativa.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="incrementoStraordinarioOrdinario">
              Incremento straordinario ordinario (€)
            </label>
            <input
              id="incrementoStraordinarioOrdinario"
              type="number"
              value={state.incrementoStraordinarioOrdinario ?? ''}
              onChange={(e) => onChange({ incrementoStraordinarioOrdinario: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] focus:border-[#CC4331] outline-none"
              placeholder="0,00"
            />
            <Wizard2026FieldHelp label="Incremento CCNL" helpText="Aumento proposto ai sensi del CCNL 23.02.2026." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="quotaFinanziataConCapienzaArt23">
              Quota finanziata con capienza Art. 23 (€)
            </label>
            <input
              id="quotaFinanziataConCapienzaArt23"
              type="number"
              value={state.quotaFinanziataConCapienzaArt23 ?? ''}
              onChange={(e) => onChange({ quotaFinanziataConCapienzaArt23: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] focus:border-[#CC4331] outline-none"
              placeholder="0,00"
            />
            <Wizard2026FieldHelp label="Capienza limite" helpText="Quota assorbita all'interno del limite Art. 23." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="quotaFinanziataConRiduzioneFondo">
              Quota finanziata con riduzione Fondo (€)
            </label>
            <input
              id="quotaFinanziataConRiduzioneFondo"
              type="number"
              value={state.quotaFinanziataConRiduzioneFondo ?? ''}
              disabled={hasDirigenza}
              onChange={(e) => onChange({ quotaFinanziataConRiduzioneFondo: parseVal(e.target.value) })}
              className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] focus:border-[#CC4331] outline-none ${hasDirigenza ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-white'}`}
              placeholder="0,00"
            />
            <Wizard2026FieldHelp
              label="Riduzione Fondo"
              helpText={hasDirigenza ? "Non ammesso per enti con dirigenza." : "Riduzione del fondo risorse decentrate a copertura."}
            />
          </div>
        </div>

        {!hasDirigenza && (state.quotaFinanziataConRiduzioneFondo || 0) > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <input
              type="checkbox"
              id="contrattazioneIntegrativaRiduzioneFondo"
              checked={state.contrattazioneIntegrativaRiduzioneFondo || false}
              onChange={(e) => onChange({ contrattazioneIntegrativaRiduzioneFondo: e.target.checked })}
              className="h-4 w-4 text-[#CC4331] focus:ring-[#CC4331] border-slate-300 rounded cursor-pointer"
            />
            <label
              htmlFor="contrattazioneIntegrativaRiduzioneFondo"
              className="text-sm font-semibold text-slate-700 cursor-pointer select-none"
            >
              È stata definita la preventiva contrattazione integrativa per la riduzione del Fondo risorse decentrate?
            </label>
          </div>
        )}
      </div>

      {/* SEZIONE 3 — Risorse escluse o derogatorie */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#CC4331] rounded-full inline-block"></span>
            3. Risorse escluse o derogatorie
          </h3>
          <button
            type="button"
            onClick={handleAddEsclusa}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC4331] hover:bg-[#A83226] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi risorsa esclusa</span>
          </button>
        </div>

        {(state.risorseEscluse || []).length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Nessuna risorsa esclusa o derogatoria inserita.</p>
            <p className="text-xs text-slate-400 mt-1">Utilizzare il pulsante in alto per aggiungere una voce (es. elezioni, calamità, censimenti, ecc.).</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(state.risorseEscluse || []).map((r, idx) => (
              <div key={r.id || idx} className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 relative space-y-3">
                <button
                  type="button"
                  onClick={() => handleRemoveEsclusa(r.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-slate-100"
                  title="Rimuovi risorsa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipologia Risorsa <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={r.tipologia}
                      onChange={(e) => handleUpdateEsclusa(r.id, { tipologia: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#CC4331]"
                    >
                      {tipologieOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Importo (€) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={r.importo ?? ''}
                      onChange={(e) => handleUpdateEsclusa(r.id, { importo: parseVal(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 font-mono outline-none focus:ring-2 focus:ring-[#CC4331]"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fonte Normativa / Finanziaria {r.tipologia !== 'altraFattispecieEsclusa' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={r.fonteNormativaFinanziaria || ''}
                      onChange={(e) => handleUpdateEsclusa(r.id, { fonteNormativaFinanziaria: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#CC4331]"
                      placeholder={r.tipologia === 'poliziaLocaleDeroga' ? "Richiesto: fonte di finanziamento" : "Riferimento di legge o bilancio"}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Descrizione / Motivazione {r.tipologia === 'altraFattispecieEsclusa' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={r.descrizione || ''}
                      onChange={(e) => handleUpdateEsclusa(r.id, { descrizione: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#CC4331]"
                      placeholder="Dettagli e motivazioni della risorsa..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id={`excl-${r.id}`}
                    checked={r.esclusaDaArt23}
                    onChange={(e) => handleUpdateEsclusa(r.id, { esclusaDaArt23: e.target.checked })}
                    className="h-4 w-4 text-[#CC4331] focus:ring-[#CC4331] border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor={`excl-${r.id}`} className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    Escludi dal limite dell'Art. 23, comma 2
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4 — Economie straordinario anno precedente */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-6 bg-[#CC4331] rounded-full inline-block"></span>
          4. Economie da straordinario da riversare nel Fondo
        </h3>

        <div className="bg-[#FFF4F2] border border-[#FCE7E2] rounded-xl p-4 flex items-start gap-2.5 text-xs text-[#A83226]">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#CC4331]" />
          <div>
            <span className="font-bold block mb-1">Destinazione Risparmi</span>
            Le economie rilevano solo se riferite al budget ordinario dello straordinario. Non vanno confuse con risorse eterofinanziate o derogatorie, come elezioni, calamità, ISTAT o Polizia Locale in deroga.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Stanziamento ordinario anno precedente (€)
            </label>
            <input
              type="number"
              value={state.stanziamentoStraordinarioOrdinarioAnnoPrecedente ?? ''}
              onChange={(e) => onChange({ stanziamentoStraordinarioOrdinarioAnnoPrecedente: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] focus:border-[#CC4331] outline-none"
              placeholder="0,00"
            />
            <Wizard2026FieldHelp label="Stanziamento N-1" helpText="Stanziamento per straordinario ordinario nell'anno precedente." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Spesa ordinario anno precedente (€)
            </label>
            <input
              type="number"
              value={state.spesaStraordinarioOrdinarioAnnoPrecedente ?? ''}
              onChange={(e) => onChange({ spesaStraordinarioOrdinarioAnnoPrecedente: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] focus:border-[#CC4331] outline-none"
              placeholder="0,00"
            />
            <Wizard2026FieldHelp label="Spesa N-1" helpText="Consuntivo di spesa dello straordinario ordinario nell'anno precedente." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Economie certificate dai revisori (€)
            </label>
            <input
              type="number"
              value={state.economieStraordinarioCertificate ?? ''}
              onChange={(e) => onChange({ economieStraordinarioCertificate: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] focus:border-[#CC4331] outline-none"
              placeholder="0,00"
            />
            <Wizard2026FieldHelp label="Dato Certificato" helpText="Se inserito, prevale sulle economie calcolate." />
          </div>
        </div>

        {stanziamentoPrec !== undefined && spesaPrec !== undefined && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-semibold">Economie calcolate (Stanziamento - Spesa):</span>
              <span className="font-mono font-bold text-slate-800">
                {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(economieCalcolate)}
              </span>
            </div>
            {state.economieStraordinarioCertificate !== undefined && (
              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-semibold">Differenza (Calcolato - Certificato):</span>
                <span className={`font-mono font-bold ${diffCalcolateCertificate !== 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                  {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(diffCalcolateCertificate)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEZIONE 5 — Risultati per Costituzione Fondo e Art. 23 */}
      {res && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#CC4331] rounded-full inline-block"></span>
            5. Risultati per Costituzione Fondo e Art. 23
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Wizard2026ResultCard
              title="Straordinario ordinario finale soggetto Art. 23"
              amount={res.straordinarioOrdinarioFinaleSoggettoArt23}
              formula="(fondoCorrente - riduzioneStabileArt67) + incrementoAmmesso"
              variant="cgil"
              description="Fondo straordinario ordinario finale soggetto ad Art. 23"
            />

            <Wizard2026ResultCard
              title="Incremento ordinario soggetto Art. 23"
              amount={res.incrementoStraordinarioOrdinarioSoggettoArt23}
              formula="quotaCapienza + quotaRiduzione"
              variant="cgil"
              description="Quota di incremento straordinario ordinario ammessa sotto il limite"
            />

            <Wizard2026ResultCard
              title="Riduzione stabile straordinario (Art. 67)"
              amount={res.incrementoParteStabileDaRiduzioneStraordinario}
              formula="riduzioneStabileStraordinarioArt67"
              variant="cgil"
              description="Riduzione stabile destinata ad alimentare la parte stabile del Fondo risorse decentrate"
            />

            <Wizard2026ResultCard
              title="Riduzione Fondo per straordinario"
              amount={res.riduzioneFondoDecentratoPerStraordinario}
              formula="quotaFinanziataConRiduzioneFondo"
              variant="cgil"
              description="Detrazione permanente da applicare al Fondo per finanziare l'incremento ordinario"
            />

            <Wizard2026ResultCard
              title="Economie da riversare nel Fondo"
              amount={res.economieStraordinarioAnnoPrecedenteDaRiversare}
              formula="Se certificate ? certificate : Max(0, calcolate)"
              variant="cgil"
              description="Economie N-1 da destinare alla parte variabile del Fondo"
            />

            <Wizard2026ResultCard
              title="Straordinario escluso Art. 23"
              amount={res.totaleStraordinarioEsclusoArt23}
              formula="Somma risorse escluse"
              variant="cgil"
              description="Totale straordinario non assoggettato al limite di spesa"
            />
          </div>
        </div>
      )}

      <Wizard2026CheckList checks={state.checks} />
    </div>
  );
};
