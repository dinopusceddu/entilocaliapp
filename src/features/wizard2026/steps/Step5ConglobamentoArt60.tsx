import React from 'react';
import { Wizard2026ConglobamentoArt60StepState, AreaConglobamentoArt60, PartTimeNativoRow } from '../types';
import { CONGLOBAMENTO_ART60_2026 } from '../../../logic/wizard2026';
import { Wizard2026StepHeader, Wizard2026CheckList, Wizard2026ResultCard } from '../components';
import { Plus, Trash2, Info, AlertTriangle } from 'lucide-react';

export interface Step5ConglobamentoArt60Props {
  state: Wizard2026ConglobamentoArt60StepState;
  annoRiferimento?: number;
  onChange: (payload: Partial<Wizard2026ConglobamentoArt60StepState>) => void;
}

const AREAS_CONFIG: { key: AreaConglobamentoArt60; label: string; desc: string; monthly: number }[] = [
  { key: 'FUNZIONARIO_EQ', label: 'Area Funzionari ed Elevate Qualificazioni', desc: 'Quota mensile: € 10,62 (annua: € 127,44)', monthly: 10.62 },
  { key: 'ISTRUTTORE', label: 'Area Istruttori', desc: 'Quota mensile: € 9,40 (annua: € 112,80)', monthly: 9.4 },
  { key: 'OPERATORE_ESPERTO', label: 'Area Operatori Esperti', desc: 'Quota mensile: € 8,06 (annua: € 96,72)', monthly: 8.06 },
  { key: 'OPERATORE', label: 'Area Operatori', desc: 'Quota mensile: € 6,63 (annua: € 79,56)', monthly: 6.63 },
];

export const Step5ConglobamentoArt60: React.FC<Step5ConglobamentoArt60Props> = ({ state, annoRiferimento, onChange }) => {
  const parseVal = (val: string) => (val === '' ? undefined : parseFloat(val) || undefined);
  const res = state.result;
  const currentYear = annoRiferimento ?? 2026;
  const isPost2026 = currentYear > 2026;

  const handleInteroChange = (area: AreaConglobamentoArt60, val?: number) => {
    onChange({
      personaleInteroArea: {
        ...state.personaleInteroArea,
        [area]: val,
      },
    });
  };

  const handleAddPartTimeRow = (area: AreaConglobamentoArt60) => {
    const newRow: PartTimeNativoRow = {
      id: Math.random().toString(36).substring(2, 9),
      area,
      percentualePartTime: 50,
      numeroDipendenti: 1,
      nota: '',
    };
    onChange({
      partTimeNativi: [...(state.partTimeNativi || []), newRow],
    });
  };

  const handleUpdatePartTimeRow = (id: string, updates: Partial<PartTimeNativoRow>) => {
    const updated = (state.partTimeNativi || []).map((row) => {
      if (row.id === id) {
        return { ...row, ...updates };
      }
      return row;
    });
    onChange({ partTimeNativi: updated });
  };

  const handleDeletePartTimeRow = (id: string) => {
    const filtered = (state.partTimeNativi || []).filter((row) => row.id !== id);
    onChange({ partTimeNativi: filtered });
  };

  return (
    <div className="space-y-8">
      <Wizard2026StepHeader
        stepNumber={5}
        title="Conglobamento Indennità di Comparto — Art. 60 CCNL 23.02.2026"
        subtitle="Decurtazione permanente della componente stabile"
        description="L'articolo 60 del CCNL 23.02.2026 dispone il conglobamento di una quota parte dell'indennità di comparto nello stipendio tabellare a decorrere dall'1.1.2026. Di conseguenza, il fondo decentrato deve subire una corrispondente decurtazione stabile pari alla somma delle riduzioni per ciascun dipendente in servizio al 1° gennaio 2026."
      />

      <div className="bg-[#FFF4F2] border border-[#FCE7E2] rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-[#A83226] text-base flex items-center gap-2">
          <Info className="w-5 h-5 text-[#CC4331]" />
          Inquadramento Normativo e Consolidamento Temporale (Art. 60)
        </h4>
        <div className="text-slate-700 text-sm space-y-3 leading-relaxed">
          <p>
            Dal 1° gennaio 2026 una quota dell’indennità di comparto confluisce nello stipendio tabellare. Per questo motivo il Fondo risorse decentrate deve essere ridotto in modo stabile.
          </p>
          <p className="font-semibold text-slate-800">
            Principio di Consolidamento Temporale:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>
              <strong>Calcolo unico:</strong> Il calcolo si effettua una sola volta con decorrenza 1° gennaio 2026 sulla base del personale destinatario dell’indennità in servizio a tale data.
            </li>
            <li>
              <strong>Stabilità negli anni successivi:</strong> La decurtazione resta stabile ed è consolidata per gli anni successivi (2027 e seguenti), senza alcun ricalcolo sul personale in servizio negli anni futuri.
            </li>
            <li>
              <strong>Correzione manuale limitata:</strong> Eventuali variazioni future sono ammesse solo mediante correzione manuale con motivazione obbligatoria (es. per rettifica errore materiale del dato 2026 o ricostruzione certificata diversa).
            </li>
          </ul>
          <p>
            La riduzione si calcola moltiplicando la quota mensile prevista per ciascuna Area per dodici mensilità (importo già annuo) e per il personale destinatario dell’indennità in servizio all’<strong>1.1.2026</strong>.
          </p>
          <p>
            I lavoratori part-time assunti originariamente a tempo parziale si computano in proporzione alla percentuale di lavoro. I lavoratori assunti a tempo pieno e successivamente trasformati in part-time si computano invece per intero.
          </p>
          <p className="font-semibold text-slate-800">
            La riduzione non libera spazi sul limite del salario accessorio di cui all’art. 23, comma 2, del D.Lgs. 75/2017: l’importo decurtato continua a rilevare figurativamente ai fini del rispetto del limite.
          </p>
        </div>
      </div>

      {isPost2026 ? (
        <div className="space-y-6">
          <div className="bg-[#FFF4F2] border border-[#FCE7E2] rounded-xl p-5 text-sm text-slate-700 leading-relaxed">
            La decurtazione Art. 60 è stata determinata con riferimento al personale in servizio all’1.1.2026. Negli anni successivi non deve essere ricalcolata sul personale in servizio nell’anno corrente, ma riportata come riduzione stabile già consolidata nel Fondo.
          </div>

          {state.valoreConsolidato2026 !== undefined && state.valoreConsolidato2026 !== null && state.mode !== 'manual' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">Valore Consolidato dall'anno 2026</h5>
                  <p className="text-xs text-slate-500 mt-1">
                    Questo è il valore calcolato o definito per l'anno 2026, riportato in automatico come decurtazione strutturale.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Riduzione Strutturale</div>
                  <div className="font-mono font-bold text-[#A83226] text-xl mt-1">
                    -{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(state.valoreConsolidato2026)}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => onChange({ mode: 'manual', valoreManuale: state.valoreConsolidato2026 })}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                >
                  Modifica manualmente con motivazione
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {(state.valoreConsolidato2026 === undefined || state.valoreConsolidato2026 === null) && (
                <div className="bg-[#FFF4F2] border border-[#FCE7E2] rounded-xl p-5 text-sm text-[#A83226] font-medium leading-relaxed flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#CC4331] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Dato consolidato 2026 non disponibile.</strong> Recuperare il valore della riduzione Art. 60 determinato nel Fondo 2026 oppure inserirlo manualmente con motivazione.
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-800 text-sm">Inserimento Manuale Riduzione Stabile Art. 60</h5>
                  <p className="text-xs text-slate-500">
                    {state.valoreConsolidato2026 !== undefined
                      ? "È attiva la modalità di modifica manuale. Il valore inserito sostituirà il dato consolidato del 2026."
                      : "Non è stato trovato un valore consolidato per il 2026 nel sistema. Inserisci manualmente la riduzione strutturale determinata nel 2026."
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-800">
                      Importo Riduzione Stabile (€) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={state.valoreManuale !== undefined ? state.valoreManuale : ''}
                      onChange={(e) => onChange({ valoreManuale: parseVal(e.target.value) })}
                      placeholder="es. 1250.00"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-800">
                      Motivazione della correzione manuale del valore consolidato 2026 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={state.notaManuale || ''}
                      onChange={(e) => onChange({ notaManuale: e.target.value })}
                      placeholder="Fornire una motivazione obbligatoria..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-700 focus:ring-2 focus:ring-[#CC4331] outline-none"
                    />
                  </div>
                </div>

                {state.valoreConsolidato2026 !== undefined && state.valoreConsolidato2026 !== null && (
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-amber-600 font-medium">Attenzione: stai sovrascrivendo il valore consolidato ({new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(state.valoreConsolidato2026)})</span>
                    <button
                      type="button"
                      onClick={() => onChange({ mode: 'guided', valoreManuale: undefined, notaManuale: '' })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Ripristina valore consolidato
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-slate-800 text-base">Modalità di Inserimento</h4>
            <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => onChange({ mode: 'guided' })}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  state.mode !== 'manual'
                    ? 'bg-[#CC4331] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Calcolo guidato
              </button>
              <button
                type="button"
                onClick={() => onChange({ mode: 'manual' })}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  state.mode === 'manual'
                    ? 'bg-[#CC4331] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Inserimento manuale
              </button>
            </div>
          </div>

          {state.mode === 'manual' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="bg-[#FFF4F2] border border-[#FCE7E2] rounded-xl p-4 text-xs text-[#A83226] font-medium">
                È attiva la modalità manuale: il valore inserito sostituisce il calcolo guidato.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    Importo Riduzione Stabile (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={state.valoreManuale !== undefined ? state.valoreManuale : ''}
                    onChange={(e) => onChange({ valoreManuale: parseVal(e.target.value) })}
                    placeholder="es. 1250.00"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    Nota / Fonte del dato
                  </label>
                  <input
                    type="text"
                    value={state.notaManuale || ''}
                    onChange={(e) => onChange({ notaManuale: e.target.value })}
                    placeholder="es. verbale di certificazione n. 12/2026..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-700 focus:ring-2 focus:ring-[#CC4331] outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {AREAS_CONFIG.map((area) => {
                const k = area.key;
                const interoVal = state.personaleInteroArea?.[k];
                const partTimeRows = (state.partTimeNativi || []).filter((p) => p.area === k);

                const sumPt = partTimeRows.reduce((acc, row) => {
                  return acc + (row.numeroDipendenti * row.percentualePartTime) / 100;
                }, 0);
                const totalComputable = (interoVal ?? 0) + sumPt;
                const quotaAnnua = CONGLOBAMENTO_ART60_2026[k];
                const riduzioneArea = totalComputable * quotaAnnua;

                return (
                  <div key={k} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                      <div>
                        <h5 className="font-bold text-slate-800 text-base">{area.label}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">{area.desc}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Quota Annua</span>
                        <span className="font-mono font-bold text-slate-700 text-sm">
                          {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(quotaAnnua)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">
                          A. Personale da computare per intero
                        </label>
                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                          Fornire dipendenti a tempo pieno all’1.1.2026, dipendenti originariamente full-time poi trasformati in part-time, o a tempo determinato in servizio all’1.1.2026 se destinatari dell’indennità.
                        </p>
                        <div className="w-48">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={interoVal !== undefined ? interoVal : ''}
                            onChange={(e) => handleInteroChange(k, parseVal(e.target.value))}
                            placeholder="N. dipendenti (es. 12)"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-800 focus:ring-2 focus:ring-[#CC4331] outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <label className="block text-sm font-semibold text-slate-800">
                              B. Personale part-time nativo
                            </label>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Dipendenti assunti originariamente a tempo parziale. Vengono computati in quota percentuale.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddPartTimeRow(k)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFF4F2] text-[#CC4331] border border-[#FCE7E2] hover:bg-[#FCE7E2] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Aggiungi dipendente
                          </button>
                        </div>

                        {partTimeRows.length === 0 ? (
                          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                            Nessun dipendente part-time nativo inserito per quest'area.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                              <thead>
                                <tr className="text-left text-slate-500 uppercase tracking-wider font-semibold">
                                  <th className="pb-2 w-32">Percentuale %</th>
                                  <th className="pb-2 w-32">N. Dipendenti</th>
                                  <th className="pb-2">Nota (opzionale)</th>
                                  <th className="pb-2 text-right w-16">Azione</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {partTimeRows.map((row) => (
                                  <tr key={row.id}>
                                    <td className="py-2 pr-4">
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="number"
                                          min="1"
                                          max="100"
                                          value={row.percentualePartTime}
                                          onChange={(e) => handleUpdatePartTimeRow(row.id, { percentualePartTime: parseFloat(e.target.value) || 0 })}
                                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-800 outline-none focus:ring-1 focus:ring-[#CC4331]"
                                        />
                                        <span className="text-slate-400 font-semibold">%</span>
                                      </div>
                                    </td>
                                    <td className="py-2 pr-4">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={row.numeroDipendenti}
                                        onChange={(e) => handleUpdatePartTimeRow(row.id, { numeroDipendenti: parseFloat(e.target.value) || 0 })}
                                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-800 outline-none focus:ring-1 focus:ring-[#CC4331]"
                                      />
                                    </td>
                                    <td className="py-2 pr-4">
                                      <input
                                        type="text"
                                        value={row.nota || ''}
                                        placeholder="es. part-time 18 ore..."
                                        onChange={(e) => handleUpdatePartTimeRow(row.id, { nota: e.target.value })}
                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-slate-700 outline-none focus:ring-1 focus:ring-[#CC4331]"
                                      />
                                    </td>
                                    <td className="py-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePartTimeRow(row.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50 -mx-6 -mb-6 px-6 py-4">
                        <div className="text-xs text-slate-600">
                          Personale computabile: <span className="font-mono font-bold text-slate-800">{totalComputable.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} FTE</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Riduzione di Area</span>
                          <span className="font-mono font-bold text-[#A83226] text-base">
                            -{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(riduzioneArea)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {res && (
        <div className="pt-6 border-t border-slate-200 space-y-6">
          <div className="max-w-md mx-auto">
            <Wizard2026ResultCard
              title={
                isPost2026
                  ? "Riduzione Art. 60 consolidata dal 2026"
                  : "Riduzione Art. 60 calcolata per il 2026"
              }
              amount={res.riduzioneTotale}
              formula={
                isPost2026
                  ? "Valore non ricalcolato sull'anno corrente"
                  : "Valore consolidato dal 2026"
              }
              variant="warning"
              description={
                res.riduzioneTotale === undefined
                  ? "Dato consolidato 2026 non disponibile. Si prega di valorizzarlo inserendo l'importo manuale e la motivazione."
                  : "Riduzione neutrale rispetto al limite Art. 23: l'importo decurtato continua a rilevare figurativamente ai fini del rispetto del limite dell'art. 23, comma 2, del D.Lgs. 75/2017."
              }
            />
          </div>
        </div>
      )}

      <Wizard2026CheckList checks={state.checks} />
    </div>
  );
};

