# Simulatore individuale CCNL 2025–2027

Modulo `simulatoreCcnl20252027`, disponibile dalla sezione **Contrattazione e Salario** della Toolbox, senza selezione di un ente e senza permessi amministrativi.

## Perimetro

I soli file preesistenti modificati sono `src/application/registry/moduleRegistry.ts` e `src/pages/ToolboxHomePage.tsx`. Dati, tipi, schemi, motori, componenti, export e test del simulatore sono file nuovi. Il modulo non legge né scrive dati del Fondo o del Wizard 2026. La bozza usa esclusivamente `fl_simulatore_ccnl_2025_2027_v1` in localStorage. Non sono state aggiunte dipendenze.

## Fonte e scelte di calcolo

Fonte dei dati: `report_calcolatore_ccnl_2025_2027.md`, Master Blueprint v8.0 fornito dall’utente. Le Tabelle A/B/C e la mappa dei 27 livelli sono trascritte dal blocco TypeScript del report. Gli importi mensili e annuali della Tabella B sono conservati come forniti; i motori mensili usano i valori mensili, senza ricostruirli dagli annuali.

I calcoli monetari usano Big.js, con arrotondamento half-up degli importi erogabili al centesimo. Le somme monetarie passano anche dall’utility FinancialMath esistente. Le tariffe intermedie conservano la precisione; il cedolino arrotonda la tariffa maggiorata prima della moltiplicazione per le ore, come da §3.4. Gli arretrati accessori arrotondano il totale della singola voce, come da §3.3.

Per i differenziali si applica il codice della sezione 3.1: `(valore annuo singolo × numero) / 13`, arrotondando il totale. Ciò produce 115,38 € per due differenziali ordinari Istruttori e 169,23 € per due differenziali con maggiorazione da 350 €. La matrice iniziale del report propone invece l’arrotondamento del singolo rateo prima della moltiplicazione: questa alternativa non produrrebbe gli esempi richiesti.

### Rettifica degli esempi arretrati

L’utente ha confermato esplicitamente in chat di usare le **formule analitiche §3.3**, poiché i risultati esemplificativi del documento obiettivo e delle slide non sono compatibili con le costanti del blueprint.

Istruttori, 100%, in servizio, posizione invariata, nessuna ora accessoria:

| Scenario | Formula | Risultato adottato | Esempio incompatibile |
| --- | --- | ---: | ---: |
| Novembre, IVC esatta | `45,20 × 13 − 11,93 × 10 + (91,40 − 19,88) × 10` | 1.183,50 € | 1.139,65 € |
| Dicembre, IVC esatta | `45,20 × 13 − 11,93 × 10 + (91,40 − 19,88) × 11` | 1.255,02 € | 1.212,33 € |
| Dicembre, formula slide | `(45,20 − 19,88) × 13 + (91,40 − 19,88) × 11` | 1.115,88 € | 1.211,25 € |

Non vengono applicate correzioni artificiali per riprodurre gli esempi incompatibili. Il risultato dopo IVC resta un importo **lordo prima di contributi e imposte**.

## Date, tranche e cessazione

- Gli arretrati ordinari terminano al 31.10.2026 oppure al 30.11.2026, o alla cessazione se anteriore.
- La 13ª 2026 è esclusa per gli attivi. Per i cessati nel 2026 si riconoscono i ratei fino alla cessazione, anche se successiva al limite degli arretrati ordinari.
- I mesi completi, incluso febbraio, valgono uno. I mesi parziali seguono il criterio in trentesimi oppure la regola dei 15 giorni. Una variazione inframensile ripartisce il mese tra le tranche senza duplicarlo.
- La timeline deve coprire il servizio dal 01.01.2025 al termine utile senza vuoti, sovrapposizioni o identificativi duplicati. Il profilo a regime è separato dai profili storici.
- Le ore pregresse sono totali effettivi riferiti esclusivamente ai periodi di arretrato. Non si applica una seconda riduzione per il part-time. Il selettore delle indennità propone l’incremento pieno della Tabella A oppure l’incremento al netto dell’IVC già inclusa nelle basi. Nel secondo caso si sottrae la media ordinaria `mesi IVC / mesi ordinari × IVC mensile` del metodo di scorporo selezionato, senza quota di tredicesima. La modalità accessori non modifica il conguaglio tabellare.
- Per ogni voce ammessa dal profilo il motore conserva vecchia tariffa, nuova tariffa e delta unitario anche con ore a zero (20 voci nel part-time, 18 nel tempo pieno). Il totale della singola voce è `round(ore × delta, 2)` con precisione piena del delta.
- Il valore complessivo del compenso ferie non fruite resta separato ed è calcolato su RIM/22 o RIM/26. Per i cessati si somma agli arretrati soltanto il differenziale sui giorni già liquidati al vecchio tabellare: incremento dell’anno di cessazione / divisore giornaliero × rapporto PT × giorni. Si usa il profilo della tranche di cessazione; il differenziale entra una sola volta nei totali dell’anno e complessivi.

## Export e persistenza

Excel contiene i tre fogli richiesti, il confronto tra cinque epoche, le dodici componenti mensili a tempo pieno, le quattro basi effettive, le quattro tariffe, il dettaglio per anno/tranche e il cedolino completo. Le formule conservano anche il risultato memorizzato. Le ore inizialmente a zero restano disponibili nel foglio per il ricalcolo. Una protezione di 1e-9 nelle operazioni ROUND su importi positivi evita scarti al mezzo centesimo causati dalla moltiplicazione binaria di alcuni motori di foglio elettronico.

La sezione delle indennità arretrate è sempre aperta, con Turni come istituto iniziale e confronto affiancato 2025/2026 per ciascuna tranche. I preset PL e PT comprendono ore pregresse per rendere immediati i risultati degli accessori.

Excel mostra sempre tutte le tariffe ammesse, incluse quelle con ore zero, e formula il confronto vecchia/nuova/delta, le ore e gli importi. Il correttivo IVC è collegato al selettore del foglio; il differenziale ferie mantiene l’incremento pieno previsto dalla formula specifica.

Il PDF conserva il riepilogo e il cedolino nelle prime due pagine A4. Fino a sei voci arretrate il confronto delle tariffe rientra nella prima pagina; nei casi più estesi segue un’appendice analitica paginata, così il nuovo dettaglio richiesto resta leggibile e completo.

Solo le bozze validate sono salvate automaticamente. Una bozza corrotta o incompatibile carica i valori predefiniti con messaggio esplicito. Con campi non validi il prospetto monetario e gli export sono sospesi, evitando risultati obsoleti.

## Verifica

```text
npx vitest run src/logic/__tests__/ccnl2025_2027Engine.test.ts
npx vitest run src/services/__tests__/ccnl2025_2027Exports.test.ts src/pages/__tests__/SimulatoreCcnl20252027Page.test.tsx
npx tsc --noEmit
git -c core.fsmonitor=false status --short
```

Il flag Git disattiva il solo fsmonitor per il comando, senza cambiare la configurazione del repository. Gli altri file non tracciati già presenti nel workspace non fanno parte del modulo.

I materiali temporanei di verifica sono in `tmp/ccnl20252027-qa`: PDF di stress e rendering, workbook e controllo indipendente delle formule, harness browser con i componenti reali e il solo contesto di navigazione simulato. Non vengono usati account o dati remoti nel collaudo UI.
