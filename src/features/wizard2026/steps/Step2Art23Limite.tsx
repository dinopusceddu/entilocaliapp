import React, { useState } from 'react';
import { Wizard2026Art23StepState } from '../types';
import { Wizard2026StepHeader, Wizard2026InfoBox, Wizard2026FieldHelp, Wizard2026ResultCard, Wizard2026CheckList } from '../components';
import { HelpCircle, X, Plus, Trash2 } from 'lucide-react';

export interface Step2Art23LimiteProps {
  state: Wizard2026Art23StepState;
  hasDirigenza: boolean;
  onChange: (payload: Partial<Wizard2026Art23StepState>) => void;
}

interface HelpModalContent {
  title: string;
  body: React.ReactNode;
}

export const Step2Art23Limite: React.FC<Step2Art23LimiteProps> = ({ state, hasDirigenza, onChange }) => {
  const parseVal = (val: string) => (val === '' ? undefined : parseFloat(val) || undefined);
  const res = state.result;

  const [activeHelpField, setActiveHelpField] = useState<string | null>(null);

  const HELP_CONTENTS: Record<string, HelpModalContent> = {
    limite2016CertificatoEnte: {
      title: "Limite 2016 Certificato Revisori",
      body: (
        <div className="space-y-3">
          <p>Rappresenta l'importo unico complessivo del limite per l'anno 2016 come certificato dall'Organo di Revisione ai sensi dell'art. 23, comma 2, del D.Lgs. n. 75/2017.</p>
          <p>Questo valore, se presente negli atti dell'ente o in precedenti relazioni certificate, ha valore prevalente sulla somma analitica dei singoli sottofondi ricostruiti.</p>
          <p className="font-semibold text-slate-800">Si consiglia di confrontare attentamente il valore inserito con la certificazione dei revisori.</p>
        </div>
      )
    },
    fondoPersonaleDipendente2016: {
      title: "Fondo Personale Dipendente 2016",
      body: (
        <div className="space-y-3">
          <p>Include le risorse stabili e variabili destinate al fondo per le aree professionali (ex dipendenti non dirigenti) certificate per l'anno 2016.</p>
          <p>Rientrano normalmente, se soggette al limite, le risorse stabili storiche ed eventuali integrazioni variabili autorizzate, salvo specifiche esclusioni normative o diverse asseverazioni dei revisori.</p>
        </div>
      )
    },
    fondoEqPo2016: {
      title: "Risorse EQ/PO 2016",
      body: (
        <div className="space-y-3">
          <p>Comprende le risorse destinate al finanziamento delle posizioni organizzative (ora Elevate Qualificazioni) erogate nell'anno 2016.</p>
          <p>Rileva ai fini del limite complessivo in quanto parte integrante del trattamento accessorio, da verificare negli atti di spesa dell'ente.</p>
        </div>
      )
    },
    fondoDirigenza2016: {
      title: "Fondo Dirigenza 2016",
      body: (
        <div className="space-y-3">
          <p>Consiste nell'ammontare certificato del fondo per la retribuzione di posizione e di risultato del personale dirigente per l'anno 2016.</p>
          <p>Rileva solo per gli enti dotati di personale con qualifica dirigenziale, salvo specifiche esclusioni contabili da verificare nei pareri dell'organo di controllo.</p>
        </div>
      )
    },
    fondoStraordinario2016: {
      title: "Fondo Lavoro Straordinario 2016",
      body: (
        <div className="space-y-3">
          <p>Rappresenta la spesa complessiva sostenuta o deliberata per il lavoro straordinario nell'anno 2016.</p>
          <p>Questa voce rileva ai fini del limite complessivo ex art. 23, comma 2, e va desunta dal conto annuale o dalle certificazioni dell'epoca.</p>
        </div>
      )
    },
    altreVoci2016Soggette: {
      title: "Altre voci accessorie 2016",
      body: (
        <div className="space-y-3">
          <p>Ricomprende ulteriori risorse accessorie soggette al limite 2016 non classificate nelle voci precedenti, come ad esempio le quote accessorie del segretario comunale o altre indennità asseverate. Possono essere inserite anche ulteriori voci accessorie soggette al limite, se certificate dall'ente o dai revisori come rientranti nel perimetro dell'art. 23, comma 2.</p>
          <p className="font-semibold text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
            <strong>Nota sui proventi del Codice della Strada:</strong> Le risorse collegate all'art. 208 del Codice della strada non devono essere considerate automaticamente escluse dal limite. L'eventuale esclusione richiede una verifica dei presupposti normativi e contabili. In assenza di una chiara esclusione, la quota destinata al trattamento accessorio va trattata come voce rilevante nel limite.
          </p>
        </div>
      )
    },
    fondoDipendenti2018Soggetto: {
      title: "Fondo dipendenti 2018",
      body: (
        <div className="space-y-3">
          <p>Rappresenta l'ammontare delle risorse destinate al fondo delle aree professionali (dipendenti non dirigenti) soggette al limite per l'anno 2018.</p>
          <p>È una base di partenza, insieme alle risorse PO/EQ 2018, per calcolare il valore medio accessorio pro capite dell'ente, utile ai fini dell'adeguamento del limite per variazioni di personale.</p>
        </div>
      )
    },
    risorsePoEq2018Soggette: {
      title: "Risorse PO/EQ 2018",
      body: (
        <div className="space-y-3">
          <p>Comprende gli stanziamenti o la spesa per le posizioni organizzative (EQ) relativi all'anno 2018 soggetti al limite di spesa. Confluisce nella base accessoria 2018 per la determinazione del valore medio pro capite.</p>
        </div>
      )
    },
    personaleServizio31122018: {
      title: "Personale in servizio al 31.12.2018",
      body: (
        <div className="space-y-3">
          <p>Rappresenta il personale in servizio al 31.12.2018 espresso in unità equivalenti (Full-Time Equivalent - FTE) calcolate sommando la percentuale di part-time (es. 1.0 per tempo pieno, 0.5 per part-time 50%).</p>
          <p>Costituisce il denominatore per determinare il valore medio accessorio pro capite del 2018.</p>
        </div>
      )
    },
    personalePrevisto2026Piao: {
      title: "Personale previsto nel 2026 (PIAO)",
      body: (
        <div className="space-y-3">
          <p>Rappresenta la consistenza del personale programmata per l'anno 2026 all'interno del Piano Integrato di Attività e Organizzazione (PIAO), calcolata in unità equivalenti pesate per i mesi di servizio previsti.</p>
          <p>Se questo valore è superiore a quello del 31.12.2018, il limite Art. 23 viene incrementato proporzionalmente per salvaguardare l'invarianza del valore medio pro capite. Se inferiore o pari, non viene applicata alcuna riduzione automatica al limite base.</p>
        </div>
      )
    },
    fondoCertificatoParteStabile2018: {
      title: "Fondo certificato di parte stabile dell'anno 2018",
      body: (
        <div className="space-y-3">
          <p>Rappresenta le sole risorse stabili certificate del fondo risorse decentrate per l'anno 2018.</p>
          <p>Questo valore viene impiegato per determinare la quota di incremento stabile da nuove assunzioni ai sensi dell'art. 79, comma 1, lett. c) del CCNL 16.11.2022.</p>
        </div>
      )
    }
  };

  const activeHelp = activeHelpField ? HELP_CONTENTS[activeHelpField] : null;

  const personale2018 = state.personale2018Art23 || [];
  const personale2026 = state.personale2026Art23 || [];

  return (
    <div className="space-y-8">
      <Wizard2026StepHeader
        stepNumber={2}
        title="Limite globale Art. 23, comma 2"
        subtitle="Determinazione del tetto di spesa accessoria attualizzato"
        description="Lo Step 2 quantifica il limite finanziario per il trattamento accessorio. Il modulo calcola il limite storico del 2016 e applica l'adeguamento pro capite basato sulle consistenze di personale del 2018 e di quelle programmate per il 2026 (PIAO)."
      />

      <Wizard2026InfoBox
        title="Istruttoria e Verifiche di Capienza"
        description="Le verifiche di capienza e i relativi controlli sul fondo costituito per l'anno corrente sono rinviati alla successiva fase di Costituzione Fondo. Questo modulo raccoglie ed elabora esclusivamente la quantificazione storica del limite e la sua eventuale attualizzazione."
        norma="Art. 23, comma 2, D.Lgs. 75/2017 & CCNL 2026"
        variant="cgil"
      />

      {/* Sezione 1: Limite Certificato */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-900 text-base pl-2.5 border-l-4 border-l-[#CC4331]">Limite 2016 Certificato</h4>
          <button
            type="button"
            onClick={() => setActiveHelpField('limite2016CertificatoEnte')}
            className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
            title="Cosa includere?"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Limite 2016 Certificato Revisori (€)
          </label>
          <input
            type="number"
            value={state.limite2016CertificatoEnte ?? ''}
            onChange={(e) => onChange({ limite2016CertificatoEnte: parseVal(e.target.value) })}
            placeholder="Se vuoto, si farà riferimento alla somma ricostruita"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-sm focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
            data-testid="limite2016CertificatoEnte"
          />
          <Wizard2026FieldHelp label="Certificato" helpText="Importo ufficiale asseverato. Se presente, prevale sulla somma delle voci analitiche." />
        </div>
      </div>

      {/* Sezione 2: Ricostruzione Analitica 2016 */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h4 className="font-bold text-slate-900 text-base pl-2.5 border-l-4 border-l-[#CC4331]">Voci che rilevano ai fini del limite complessivo dell’anno 2016</h4>
          <p className="text-slate-500 text-xs mt-0.5">Utilizzate come ricostruzione analitica qualora manchi il dato asseverato complessivo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fondo Dipendenti */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-800">
                Fondo Risorse Decentrate Personale Dipendente 2016 (€)
              </label>
              <button
                type="button"
                onClick={() => setActiveHelpField('fondoPersonaleDipendente2016')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              value={state.fondoPersonaleDipendente2016 ?? ''}
              onChange={(e) => onChange({ fondoPersonaleDipendente2016: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
              data-testid="fondoPersonaleDipendente2016"
            />
          </div>

          {/* EQ/PO */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-800">
                Risorse PO/EQ 2016 soggette al limite (€)
              </label>
              <button
                type="button"
                onClick={() => setActiveHelpField('fondoEqPo2016')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              value={state.fondoEqPo2016 ?? ''}
              onChange={(e) => onChange({ fondoEqPo2016: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
              data-testid="fondoEqPo2016"
            />
          </div>

          {/* Straordinario */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-800">
                Fondo Lavoro Straordinario 2016 soggetto al limite (€)
              </label>
              <button
                type="button"
                onClick={() => setActiveHelpField('fondoStraordinario2016')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              value={state.fondoStraordinario2016 ?? ''}
              onChange={(e) => onChange({ fondoStraordinario2016: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
              data-testid="fondoStraordinario2016"
            />
          </div>

          {/* Dirigenza (Condizionale) */}
          {hasDirigenza ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-800">
                  Fondo Dirigenti 2016 soggetto al limite (€)
                </label>
                <button
                  type="button"
                  onClick={() => setActiveHelpField('fondoDirigenza2016')}
                  className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <input
                type="number"
                value={state.fondoDirigenza2016 ?? ''}
                onChange={(e) => onChange({ fondoDirigenza2016: parseVal(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
                data-testid="fondoDirigenza2016"
              />
            </div>
          ) : (
            <div className="opacity-60 bg-slate-200/50 p-4 rounded-lg flex flex-col justify-center border border-slate-300/30">
              <span className="text-xs font-bold text-slate-500">Fondo Dirigenza 2016</span>
              <span className="text-xs text-slate-500">Non applicabile (Ente senza dirigenza da Step 1)</span>
            </div>
          )}

          {/* Altre Voci */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-800">
                Altre voci di trattamento accessorio 2016 soggette al limite (€)
              </label>
              <button
                type="button"
                onClick={() => setActiveHelpField('altreVoci2016Soggette')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              value={state.altreVoci2016Soggette ?? ''}
              onChange={(e) => onChange({ altreVoci2016Soggette: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
              data-testid="altreVoci2016Soggette"
            />
          </div>

          {/* Segretario Comunale (Opzionale) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-800">
                Risorse accessorie Segretario Comunale 2016 (€)
              </label>
              <span className="text-slate-400 text-xs font-semibold">Opzionale</span>
            </div>
            <input
              type="number"
              value={state.risorseSegretario2016 ?? ''}
              onChange={(e) => onChange({ risorseSegretario2016: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
              data-testid="risorseSegretario2016"
            />
          </div>
        </div>
      </div>

      {/* Sezione 3: Adeguamento Pro Capite */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-900 text-base pl-2.5 border-l-4 border-l-[#CC4331]">Incremento del limite per invarianza del valore medio pro capite</h4>
          <p className="text-slate-500 text-xs mt-0.5">Ricalcolo del limite in funzione delle variazioni del personale in servizio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fondo 2018 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-800">
                Fondo personale dipendente 2018 soggetto al limite (€)
              </label>
              <button
                type="button"
                onClick={() => setActiveHelpField('fondoDipendenti2018Soggetto')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              value={state.fondoDipendenti2018Soggetto ?? ''}
              onChange={(e) => onChange({ fondoDipendenti2018Soggetto: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
              data-testid="fondoDipendenti2018Soggetto"
            />
          </div>

          {/* PO/EQ 2018 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-800">
                Risorse PO/EQ 2018 soggette al limite (€)
              </label>
              <button
                type="button"
                onClick={() => setActiveHelpField('risorsePoEq2018Soggette')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              value={state.risorsePoEq2018Soggette ?? ''}
              onChange={(e) => onChange({ risorsePoEq2018Soggette: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
              data-testid="risorsePoEq2018Soggette"
            />
          </div>

          {/* Fondo certificato di parte stabile dell'anno 2018 */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-800">
                Fondo certificato di parte stabile dell'anno 2018 (€)
              </label>
              <button
                type="button"
                onClick={() => setActiveHelpField('fondoCertificatoParteStabile2018')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              value={state.fondoCertificatoParteStabile2018 ?? ''}
              onChange={(e) => onChange({ fondoCertificatoParteStabile2018: parseVal(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none transition-all duration-200"
              data-testid="fondoCertificatoParteStabile2018"
              placeholder="Fondo stabile 2018 per il calcolo dell'incremento stabile da nuove assunzioni"
            />
          </div>
        </div>

        {/* Toggle per modalità manuale/automatica */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-sm font-bold text-slate-800">Metodo di quantificazione del personale</span>
            <p className="text-xs text-slate-500">Scegli se inserire i totali manualmente o calcolarli analiticamente dall'elenco del personale.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ usaCalcoloManualePersonaleArt23: false })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !state.usaCalcoloManualePersonaleArt23
                  ? 'bg-[#cc4331] text-white shadow-sm hover:bg-[#a83226]'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Calcolo analitico (Elenco)
            </button>
            <button
              type="button"
              onClick={() => onChange({ usaCalcoloManualePersonaleArt23: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                state.usaCalcoloManualePersonaleArt23
                  ? 'bg-[#cc4331] text-white shadow-sm hover:bg-[#a83226]'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Inserimento manuale
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Colonna 31.12.2018 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Personale al 31.12.2018</h4>
                <p className="text-xxs text-slate-500">Denominatore per valore medio pro-capite storico</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveHelpField('personaleServizio31122018')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {state.usaCalcoloManualePersonaleArt23 ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Totale Dipendenti Equivalenti 2018 (Manuale)
                </label>
                <input
                  type="number"
                  step="any"
                  value={state.manualDipendentiEquivalenti2018 ?? ''}
                  onChange={(e) => {
                    const val = parseVal(e.target.value);
                    onChange({
                      manualDipendentiEquivalenti2018: val,
                      personaleServizio31122018: val
                    });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-mono text-sm focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none"
                  placeholder="Es. 45.5"
                  data-testid="manualDipendentiEquivalenti2018"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">Totale calcolato:</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {(state.personaleServizio31122018 ?? 0).toFixed(4)} FTE
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-150 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-3 py-2 text-left text-xxs font-bold text-slate-500 uppercase">N.</th>
                        <th className="px-3 py-2 text-left text-xxs font-bold text-slate-500 uppercase">Part-Time %</th>
                        <th className="px-3 py-2 text-center text-xxs font-bold text-slate-500 uppercase">FTE</th>
                        <th className="px-2 py-2 text-center text-xxs font-bold text-slate-500 uppercase w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {personale2018.map((emp, index) => {
                        const pt = emp.partTimePercentage ?? 100;
                        const fte = pt / 100;
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/40">
                            <td className="px-3 py-2 text-xs font-medium text-slate-500">{index + 1}</td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={emp.partTimePercentage ?? ''}
                                onChange={(e) => {
                                  const ptVal = parseVal(e.target.value);
                                  const updatedList = personale2018.map(x => x.id === emp.id ? { ...x, partTimePercentage: ptVal } : x);
                                  const newSum = updatedList.reduce((sum, x) => sum + ((x.partTimePercentage ?? 100) / 100), 0);
                                  onChange({
                                    personale2018Art23: updatedList,
                                    personaleServizio31122018: newSum
                                  });
                                }}
                                className="w-20 px-2 py-1 rounded border border-slate-300 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-[#cc4331] outline-none"
                                placeholder="100"
                              />
                            </td>
                            <td className="px-3 py-2 text-xs font-mono text-slate-700 text-center">{fte.toFixed(2)}</td>
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedList = personale2018.filter(x => x.id !== emp.id);
                                  const newSum = updatedList.reduce((sum, x) => sum + ((x.partTimePercentage ?? 100) / 100), 0);
                                  onChange({
                                    personale2018Art23: updatedList,
                                    personaleServizio31122018: newSum
                                  });
                                }}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                                title="Rimuovi riga"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {personale2018.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-xs text-slate-400 italic">
                            Nessun dipendente inserito. Clicca su Aggiungi per iniziare.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newEmp = { id: Math.random().toString(36).substring(2, 9), partTimePercentage: 100 };
                    const updatedList = [...personale2018, newEmp];
                    const newSum = updatedList.reduce((sum, x) => sum + ((x.partTimePercentage ?? 100) / 100), 0);
                    onChange({
                      personale2018Art23: updatedList,
                      personaleServizio31122018: newSum
                    });
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:border-[#cc4331] hover:text-[#cc4331] hover:bg-[#fff4f2]/30 transition-all focus:outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Aggiungi dipendente
                </button>
              </div>
            )}
          </div>

          {/* Colonna 2026 PIAO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Personale previsto nel 2026 (PIAO)</h4>
                <p className="text-xxs text-slate-500">Consistenza organica programmata per il 2026</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveHelpField('personalePrevisto2026Piao')}
                className="text-slate-400 hover:text-[#cc4331] transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {state.usaCalcoloManualePersonaleArt23 ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Totale Dipendenti Equivalenti 2026 (Manuale)
                </label>
                <input
                  type="number"
                  step="any"
                  value={state.manualDipendentiEquivalenti2026 ?? ''}
                  onChange={(e) => {
                    const val = parseVal(e.target.value);
                    onChange({
                      manualDipendentiEquivalenti2026: val,
                      personalePrevisto2026Piao: val
                    });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white font-mono text-sm focus:ring-2 focus:ring-[#cc4331] focus:border-[#cc4331] outline-none"
                  placeholder="Es. 48.2"
                  data-testid="manualDipendentiEquivalenti2026"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">Totale calcolato:</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {(state.personalePrevisto2026Piao ?? 0).toFixed(4)} FTE
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-150 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-3 py-2 text-left text-xxs font-bold text-slate-500 uppercase">N.</th>
                        <th className="px-3 py-2 text-left text-xxs font-bold text-slate-500 uppercase">Part-Time %</th>
                        <th className="px-3 py-2 text-left text-xxs font-bold text-slate-500 uppercase">Mesi/12</th>
                        <th className="px-3 py-2 text-center text-xxs font-bold text-slate-500 uppercase">FTE</th>
                        <th className="px-2 py-2 text-center text-xxs font-bold text-slate-500 uppercase w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {personale2026.map((emp, index) => {
                        const pt = emp.partTimePercentage ?? 100;
                        const ced = emp.cedoliniEmessi ?? 12;
                        const fte = (pt / 100) * (ced / 12);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/40">
                            <td className="px-3 py-2 text-xs font-medium text-slate-500">{index + 1}</td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={emp.partTimePercentage ?? ''}
                                onChange={(e) => {
                                  const ptVal = parseVal(e.target.value);
                                  const updatedList = personale2026.map(x => x.id === emp.id ? { ...x, partTimePercentage: ptVal } : x);
                                  const newSum = updatedList.reduce((sum, x) => sum + (((x.partTimePercentage ?? 100) / 100) * ((x.cedoliniEmessi ?? 12) / 12)), 0);
                                  onChange({
                                    personale2026Art23: updatedList,
                                    personalePrevisto2026Piao: newSum
                                  });
                                }}
                                className="w-16 px-2 py-1 rounded border border-slate-300 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-[#cc4331] outline-none"
                                placeholder="100"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="1"
                                max="12"
                                value={emp.cedoliniEmessi ?? ''}
                                onChange={(e) => {
                                  const cedVal = parseVal(e.target.value);
                                  const updatedList = personale2026.map(x => x.id === emp.id ? { ...x, cedoliniEmessi: cedVal } : x);
                                  const newSum = updatedList.reduce((sum, x) => sum + (((x.partTimePercentage ?? 100) / 100) * ((x.cedoliniEmessi ?? 12) / 12)), 0);
                                  onChange({
                                    personale2026Art23: updatedList,
                                    personalePrevisto2026Piao: newSum
                                  });
                                }}
                                className="w-14 px-2 py-1 rounded border border-slate-300 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-[#cc4331] outline-none"
                                placeholder="12"
                              />
                            </td>
                            <td className="px-3 py-2 text-xs font-mono text-slate-700 text-center">{fte.toFixed(4)}</td>
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedList = personale2026.filter(x => x.id !== emp.id);
                                  const newSum = updatedList.reduce((sum, x) => sum + (((x.partTimePercentage ?? 100) / 100) * ((x.cedoliniEmessi ?? 12) / 12)), 0);
                                  onChange({
                                    personale2026Art23: updatedList,
                                    personalePrevisto2026Piao: newSum
                                  });
                                }}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                                title="Rimuovi riga"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {personale2026.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-400 italic">
                            Nessun dipendente inserito. Clicca su Aggiungi per iniziare.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newEmp = { id: Math.random().toString(36).substring(2, 9), partTimePercentage: 100, cedoliniEmessi: 12 };
                    const updatedList = [...personale2026, newEmp];
                    const newSum = updatedList.reduce((sum, x) => sum + (((x.partTimePercentage ?? 100) / 100) * ((x.cedoliniEmessi ?? 12) / 12)), 0);
                    onChange({
                      personale2026Art23: updatedList,
                      personalePrevisto2026Piao: newSum
                    });
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:border-[#cc4331] hover:text-[#cc4331] hover:bg-[#fff4f2]/30 transition-all focus:outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Aggiungi dipendente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risultati e Card Finali */}
      {res && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <h4 className="font-bold text-slate-800 text-base pl-2.5 border-l-4 border-l-[#CC4331]">Risultati Elaborazione Limite</h4>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Wizard2026ResultCard
                title="Limite 2016 Base"
                amount={res.limite2016Base}
                formula={res.fonteLimite2016 === 'CERTIFICATO' ? 'Fonte: Certificato' : 'Fonte: Ricostruito analiticamente'}
                variant="neutral"
                description="Valore storico di riferimento"
              />

              <Wizard2026ResultCard
                title="Base Accessorio 2018"
                amount={res.baseAccessorio2018ProCapite}
                formula="Dipendenti + EQ/PO"
                variant="neutral"
                description="Base per il valore medio 2018"
              />

              <Wizard2026ResultCard
                title="Valore Medio 2018"
                amount={res.valoreMedioProCapite2018}
                formula="Base 2018 / Personale 2018"
                variant="neutral"
                description="Quota pro capite del 2018"
              />

              <Wizard2026ResultCard
                title="Incremento Pro Capite"
                amount={res.incrementoProCapiteLimite}
                formula="Max(0, Diff. Pers.) * Medio 2018"
                variant="neutral"
                description="Adeguamento per aumento organico"
              />
            </div>

            {/* Card finale a larghezza piena, evidenziata con la palette FP CGIL Lombardia */}
            <div className="w-full bg-[#FFF4F2] border-2 border-[#CC4331]/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between md:flex-row md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h5 className="text-xs font-bold text-[#CC4331] uppercase tracking-wider bg-[#FCE7E2] px-2.5 py-0.5 rounded-full border border-[#CC4331]/10">
                    Risultato principale dello step
                  </h5>
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 leading-tight">
                  Limite Art. 23, comma 2, attualizzato
                </h4>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Nuovo tetto massimo complessivo del salario accessorio per l'anno 2026, comprensivo dell'adeguamento pro-capite.
                </p>
                <div className="text-xs text-[#A83226] bg-[#FCE7E2]/50 inline-block px-2.5 py-1 rounded-lg border border-[#CC4331]/15 font-semibold font-sans mt-2">
                  Formula: Limite 2016 base + incremento pro capite
                </div>
              </div>
              <div className="flex-shrink-0 bg-white border border-[#CC4331]/20 p-4 rounded-xl shadow-inner text-right">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Totale Attualizzato</span>
                <span className="text-3xl font-black text-[#A83226] font-mono whitespace-nowrap">
                  € {res.limiteArt23Attualizzato.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista Check e Validazioni */}
      <Wizard2026CheckList checks={state.checks} />

      {/* Modal di Approfondimento "Cosa includere?" */}
      {activeHelp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {activeHelp.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveHelpField(null)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-colors"
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
