# Collaudo Manuale — MOD-011-bis — Step 3 Istruttoria Incremento D.L. 25/2025

**Data:** 2026-05-20  
**Versione:** MOD-011-bis finale  
**File principale:** `src/features/wizard2026/steps/Step3Dl25.tsx`  
**Logica di calcolo:** `src/logic/wizard2026/dl25Increment.ts`

---

## 1. Verifica Campi Presenti

### A. Applicabilità Soggettiva

Analisi del componente (`Step3Dl25.tsx`, linee 14–35 e 156–175):

| Tipologia Ente | Etichetta mostrata all'utente | Stato UI |
|---|---|---|
| COMUNE | "Comune" | ✅ Applicazione diretta — testo discorsivo |
| PROVINCIA | "Provincia" | ✅ Applicazione diretta — testo discorsivo |
| CITTA_METROPOLITANA | "Città Metropolitana" | ✅ Applicazione diretta — testo discorsivo |
| REGIONE | "Regione" | ✅ Applicazione diretta — testo discorsivo |
| UNIONE_COMUNI | "Unione di Comuni" | ✅ Solo trasferimento — testo discorsivo |
| COMUNITA_MONTANA | "Comunità Montana" | ✅ Solo trasferimento — testo discorsivo |
| COMUNITA_ISOLANA_O_ARCIPELAGO | "Comunità Isolana o Arcipelago" | ✅ Solo trasferimento |
| ALTRO | "Altro Ente (Verifica Manuale)" | ✅ Richiede verifica manuale |
| Enti strumentali/ASP/Consorzi ecc. | Label estesa senza sigle | ✅ Non applicabile |

**Esito sigle tecniche**: Le sigle `DIRECTLY_APPLICABLE`, `TRANSFER_ONLY`, `NOT_APPLICABLE`, `NEEDS_MANUAL_REVIEW` **non compaiono mai nella UI**. La funzione `formatEntityTypeLabel` e la logica condizionale usano esclusivamente testi discorsivi in italiano. ✅

---

### B. Requisiti Preliminari

Analisi dei dati letti da `enteState` (Step 1) e visualizzati in sola lettura nella Sezione 2:

| Campo | Presente | Sola lettura | Note |
|---|---|---|---|
| Prima fascia D.L. 34/2019 / D.M. 17 marzo 2020 | ✅ | ✅ | Calcolato automaticamente per Comuni; letto da Step 1 |
| Equilibrio pluriennale asseverato | ✅ | ✅ | Visualizzato nella sotto-sezione "Requisiti Formali di Bilancio" |
| Ente in dissesto | ✅ (indiretto) | ✅ | Contribuisce a `isBlocked`, banner rosso se attivo |
| Ente in piano di riequilibrio | ✅ (indiretto) | ✅ | Contribuisce a `isBlocked` |
| Ente strutturalmente deficitario | ✅ (indiretto) | ✅ | Contribuisce a `isBlocked` + condiziona la voce COSFEL |
| Approvazione COSFEL | ✅ | ✅ | Mostrata solo se `isDeficitario === true` |
| Atto dell'ente | ✅ | ❌ | Campo `attiAutorizzazioneDl25` editabile nella Sezione 3 |
| Parere organo di revisione | ✅ | ❌ | Campo `parereRevisoriDl25` con bottoni Sì/No nella Sezione 3 |

**Anomalia B1**: I campi dissesto, piano di riequilibrio, prima fascia e deficitario sono letti silenziosamente da `enteState` e contribuiscono al `isBlocked`, ma **non sono elencati esplicitamente** in una sezione "Requisiti Preliminari" visibile all'utente. Il banner di blocco mostra il risultato (blocco) ma non specifica quale requisito è negativo. Questo riduce la leggibilità istruttoria.

**Anomalia B2**: Il campo `documentazioneCosfelDl25` (estremi autorizzazione COSFEL) è presente nel codice ma appare **solo nel Quadro Documentale** della Sezione 5 se `isDeficitario === true` e il calcolo è già applicabile. Non esiste un campo di input esplicito per inserire gli estremi dell'autorizzazione COSFEL durante la fase di raccolta dati.

---

### C. Verifica Finanziaria D.M. 17 marzo 2020

Analisi della Sezione 2 e del prospetto di calcolo (`dl25Increment.ts`, linee 145–166):

| Campo | Presente in UI | Calcolato | Note |
|---|---|---|---|
| Popolazione ente / fascia demografica | ✅ | ✅ (fascia derivata) | Campo `popolazioneEnte`, fascia mostrata tramite `getSogliaComuneDM17Marzo` |
| Entrate correnti rendiconto N-1 | ✅ | — | Campo `entrateCorrentiN1` |
| Entrate correnti rendiconto N-2 | ✅ | — | Campo `entrateCorrentiN2` |
| Entrate correnti rendiconto N-3 | ✅ | — | Campo `entrateCorrentiN3` |
| Media entrate correnti triennio | ✅ | ✅ | Mostrata nel prospetto calcolato `mediaEntrateCorrentiTriennio` |
| FCDE | ✅ | — | Campo `fcdeStanziato` |
| Entrate correnti nette | ✅ | ✅ | `entrateNette = media - FCDE` |
| Spesa personale ultimo rendiconto | ✅ | — | Campo `spesaPersonaleUltimoRendiconto` |
| Soglia percentuale applicabile | ✅ | ✅ | Calcolata da `getSogliaComuneDM17Marzo(popolazione)` e mostrata |
| Rapporto spesa/entrate nette | ✅ | ✅ | Mostrato in percentuale nel prospetto |
| Margine di spesa personale disponibile | ✅ | ✅ | `margineSpesaPersonale` |
| Esito della verifica (Virtuoso/Non virtuoso) | ✅ | ✅ | Badge colorato: verde/rosso/grigio |

**Per Province, Regioni, Città metropolitane**: Presente il box "Soglia non codificata — da verificare manualmente". ✅ Non vengono classificate automaticamente come non virtuose.

**Anomalia C1**: La formula di calcolo delle entrate nette (`media - FCDE`) usa il valore `fcdeStanziato` (da bilancio di previsione) anziché il FCDE accantonato nel rendiconto. Per un'istruttoria precisa, il FCDE da usare è quello del rendiconto (non quello del preventivo). **Nota tecnica da comunicare all'utente** nella tooltip del campo.

---

### D. Base di Calcolo D.L. 25/2025

Analisi della Sezione 3 (`Step3Dl25.tsx`, linee 372–514):

| Campo | Presente | Note |
|---|---|---|
| Spesa stipendi tabellari 2023 non dirigenti | ✅ | Campo `stipendiTabellari2023NonDirigenti` |
| Fonte del dato stipendi tabellari 2023 | ✅ | Campo `fonteDatoStipendi2023` |
| Fondo risorse decentrate parte stabile 2025 | ✅ | Campo `fondoStabile2025Certificato` |
| Budget EQ 2025 | ✅ | Campo `budgetEq2025` |
| Eventuali altre risorse 2025 da sottrarre | ❌ | **MANCANTE**: Non esiste un campo per risorse aggiuntive da detrarre oltre a fondo stabile + EQ |
| Incremento richiesto dall'ente | ✅ | Campo `incrementoApplicato` |
| Estremi atto di indirizzo/delibera | ✅ | Campo `attiAutorizzazioneDl25` |
| Estremi parere organo di revisione | ⚠️ | Solo stato Sì/No/Non espresso, non i riferimenti documentali |
| Estremi asseverazione equilibrio pluriennale | ❌ | **MANCANTE**: non è raccolta la stringa con estremi documento |
| Autorizzazione COSFEL (estremi) | ⚠️ | Campo `documentazioneCosfelDl25` solo nel quadro documentale |

**Tooltip presenti**: Il campo stipendi 2023 ha la `Wizard2026FieldHelp`. La nota sulle aliquote è presente. Non tutti i campi hanno popup esplicativi.

**Anomalia D1**: Manca un campo per "altre risorse 2025 da sottrarre" oltre al fondo stabile e al budget EQ. Se l'ente ha altre componenti storiche stabili da dedurre, il sistema non le raccoglie.

**Anomalia D2**: Il parere dei revisori è raccolto come stato booleano (Sì/No), ma non come riferimento documentale (numero, data delibera). Questo è sufficiente per il calcolo ma non per l'istruttoria completa.

---

### E. Sostenibilità dell'Incremento

Analisi della Sezione 4 (`Step3Dl25.tsx`, linee 517–648):

| Campo | Presente | Note |
|---|---|---|
| Aliquota oneri riflessi | ✅ | Default 23.8%, modificabile |
| Aliquota IRAP | ✅ | Default 8.5%, modificabile |
| Costo complessivo stimato dell'incremento | ✅ | `costoTotaleIncremento` calcolato |
| Margine disponibile di spesa personale | ✅ | `margineSpesaPersonale` calcolato |
| Incremento massimo sostenibile | ✅ | `incrementoMassimoSostenibilePerSpesaPersonale` |
| Accettazione riduzione per sostenibilità | ✅ | Checkbox condizionale |

**Nota**: Le aliquote non sono presentate come dati certificati. La nota informativa a piè di sezione avvisa esplicitamente che sono stime modificabili. ✅

**Anomalia E1**: Il costo `costoTotaleIncremento` è calcolato `incrementoApplicato * (1 + oneri + IRAP)`. Questo calcolo usa l'incremento finale (già ridotto), non quello richiesto. L'utente potrebbe voler vedere anche il costo lordo dell'incremento richiesto prima della riduzione.

---

### F. Limite Storico di Spesa Personale

Analisi della Sezione 4, sotto-sezione limite storico:

| Campo | Presente | Note |
|---|---|---|
| Limite storico spesa personale | ✅ | Campo `limiteStoricoSpesaPersonale` |
| Base del limite (media 2011-2013, anno 2008, ecc.) | ❌ | **MANCANTE in UI**: Il campo `baseCalcoloLimiteStorico` esiste nel tipo ma non è esposto in UI |
| Spesa prevista 2026 ante-incremento | ✅ | Campo `spesaPersonalePrevista2026AnteIncremento` |
| Spesa prevista 2026 dopo-incremento | ✅ | `spesaPrevistaDopoIncremento` calcolata e mostrata |
| Scostamento | ✅ | `scostamentoLimiteStorico` calcolato (non mostrato esplicitamente in UI come dato separato) |
| Accettazione riduzione per rispetto limite storico | ✅ | Checkbox condizionale |

**Anomalia F1**: Il campo `baseCalcoloLimiteStorico` (stringa che descrive la base normativa del limite) è definito nel tipo `Dl25IncrementInput` ma non è esposto nella UI. L'utente non può specificare se il limite è "media 2011-2013", "anno 2008" o altro.

**Anomalia F2**: Lo `scostamentoLimiteStorico` è calcolato ma non esposto esplicitamente come dato nella UI della Sezione 4. Appare solo implicitamente nel confronto "Spesa dopo incremento vs tetto storico".

---

### G. Risultato Finale

Analisi della Sezione 5 (`Step3Dl25.tsx`, linee 789–954):

| Card/Voce | Presente | Note |
|---|---|---|
| Soglia teorica 48% | ✅ | Card "Soglia Limite 48%" con formula |
| Risorse 2025 da sottrarre | ✅ | Card "Risorse 2025 da Detrarre" con formula |
| Incremento massimo teorico | ✅ | Card "Incremento Massimo Teorico" |
| Margine di sostenibilità finanziaria | ✅ | Mostrato nella Sezione 4, non come card separata nella Sezione 5 |
| Incremento massimo sostenibile | ✅ | Mostrato nella checkbox di riduzione sostenibilità |
| Incremento richiesto | ⚠️ | Il valore richiesto è il campo di input; non c'è una card di riepilogo separata per l'importo richiesto vs l'importo iscrivibile |
| **Incremento effettivamente iscrivibile** | ✅ | Card principale: sfondo `#FFF4F2`, bordo `#CC4331`, importo in rosso scuro |
| Quota non iscrivibile | ⚠️ | Non c'è una card esplicita "Quota non iscrivibile = richiesto - iscrivibile" |
| Motivazione riduzione/blocco | ✅ | `motivoRiduzione` mostrato nel box informativo |

**Card principale**: Conforme alla palette FP CGIL Lombardia. Badge "Risultato principale dello step". Importo in grande (3xl, font-mono). ✅

**Anomalia G1**: Non è presente una card esplicita "Quota non iscrivibile" che mostri la differenza tra incremento richiesto e incremento effettivamente iscrivibile. Questo sarebbe utile per far capire all'utente la perdita di risorse.

**Anomalia G2**: Il "Margine di sostenibilità finanziaria" e l'"Incremento massimo sostenibile" sono mostrati nella Sezione 4 ma non sono riassunti come card nella Sezione 5 insieme alle altre card di riepilogo.

---

### H. Unioni / Comunità Montane

Analisi della Sezione D trasferimento (`Step3Dl25.tsx`, linee 650–787):

| Campo tabella | Presente | Note |
|---|---|---|
| Ente aderente (nome) | ✅ | Campo testo |
| Tipologia ente aderente | ❌ | **MANCANTE**: Non c'è un campo per la tipologia ente aderente |
| Quota trasferita | ✅ | Campo numerico |
| Estremi atto ente aderente | ✅ | Campo testo |
| Riduzione permanente fondo ente aderente | ✅ | Bottoni Sì/No/Non espresso |
| Parere revisori ente aderente | ✅ | Bottoni Sì/No/Non espresso |
| Parere revisori ente ricevente | ✅ | Bottoni Sì/No/Non espresso |
| Autorizzazione COSFEL ente aderente | ❌ | **MANCANTE**: non c'è colonna per eventuale COSFEL |
| Note | ✅ | Campo testo |
| Codice ISTAT | ✅ | Campo opzionale |

**Calcoli per Unioni/Comunità montane:**

| Calcolo | Presente | Note |
|---|---|---|
| Quota totale inserita | ✅ | `quotaTotaleInserita` — card risultato |
| Quota totale validata | ✅ | `quotaTotaleValidata` — card risultato |
| Quota non validata | ✅ | `quotaNonValidata` — card risultato |
| Importo trasferibile | ✅ | Card principale con `quotaTrasferitaAderenti` |

**Logica di validazione**: Una quota è validata se e solo se: quota > 0 AND riduzione permanente = true AND parere aderente = true AND parere ricevente = true. Solo le quote validate alimentano il risultato. ✅

**Anomalia H1**: Manca il campo "Tipologia ente aderente" (es. Comune, Comunità Montana, ecc.).  
**Anomalia H2**: Manca la colonna "Autorizzazione COSFEL" per le quote degli enti aderenti strutturalmente deficitari.

---

## 2. Scenari Testati Manualmente (Analisi Logica sul Codice)

### Scenario 1 — Comune virtuoso, incremento pienamente iscrivibile

**Input simulato** (da `dl25Increment.ts`):  
- entityType: COMUNE  
- isPrimaFasciaDl34: true, isEquilibrioPluriennaleAsseverato: true  
- isDissesto: false, isPianoRiequilibrio: false  
- stipendiTabellari2023: 2.000.000 → soglia48 = 960.000  
- fondoStabile2025: 800.000, budgetEq2025: 50.000 → risorse da detrarre = 850.000  
- incrementoMassimoTeorico = 110.000  
- incrementoApplicato richiesto: 70.000  
- Dati finanziari presenti e virtuosi  

**Esito atteso**: incrementoApplicato = 70.000 (≤ massimo teorico). Card principale mostra 70.000. Nessun blocco.  
**Mapping**: `st_incrementoDL25_2025 = 70.000`. ✅  
**Esito rilevato dal codice**: ✅ Corretto

---

### Scenario 2 — Dato mancante (es. FCDE o spesa personale assenti)

**Input simulato**:  
- stipendiTabellari2023: 2.000.000, fondoStabile2025: 800.000, budgetEq2025: 50.000  
- incrementoApplicato: 70.000  
- spesaPersonaleUltimoRendiconto: **undefined**  

**Esito logica** (`dl25Increment.ts`, linea 154): Il blocco di calcolo virtuosità è condizionato a `entratePresenti && spesaPresente`. Se `spesaPersonaleUltimoRendiconto` manca, `margineSpesaPersonale` rimane `undefined`.  
- La logica di calcolo procede ugualmente se i campi base (stipendi, fondo, budget EQ, incremento) sono presenti.  
- La sostenibilità non viene verificata (margine undefined).  
- Il risultato viene restituito con `isCalcolabile: true` ma senza margine.  
- In UI, la Sezione 4 mostra il warning "Dati finanziari per la verifica della sostenibilità incompleti. Istruttoria non validabile." ✅

**Esito check** (`validateDl25Increment`, linea 478): Genera warning `DL25-SOSTENIBILITA-MISSING`. ✅  
**Risultato NON forzato a zero**: ✅ Conforme al vincolo utente.

---

### Scenario 3 — Equilibrio pluriennale No

**Input**: `isEquilibrioPluriennaleAsseverato: false`  
**Logica** (`dl25Increment.ts`, linea 174): `isEquilibrioNegativo = true` → `isBlocked = true`  
**Ritorno** (linee 193–214): incrementoApplicato = 0, isCalcolabile = true, motivoRiduzione = "Escluso per requisiti negativi".  
**UI**: Banner "Blocco Istruttorio: Requisiti Negativi" mostrato. Card risultato mostra 0.  
**Esito**: ✅ Corretto.

---

### Scenario 4 — Ente in dissesto

**Input**: `isDissesto: true`  
**Logica**: `isDissesto = true` → `isBlocked = true` → incrementoApplicato = 0.  
**UI**: Banner di blocco mostrato. ✅  
**Esito**: ✅ Corretto.

---

### Scenario 5 — Strutturalmente deficitario con COSFEL mancante

**Input**: `isStrutturalmenteDeficitario: true`, `hasApprovazioneCosfel: undefined`  
**Logica** (`dl25Increment.ts`, linea 173): `isDeficitarioSenzaCosfel = (true && false)` → false (undefined ≠ false).  
- Il blocco NON scatta (COSFEL mancante non è uguale a COSFEL negativo).  
- Il check `COSFEL-MISSING-DL25` viene generato come warning (linea 450–458).  
- Il calcolo procede ma è segnalato come non validabile.  
**Esito warning**: ✅ Conforme al vincolo utente (dato mancante ≠ blocco automatico).  
**Esito UI**: Il banner di blocco NON appare (COSFEL undefined non attiva `isBlocked`). ⚠️ **Anomalia S5**: L'UI mostra il campo COSFEL solo quando `isDeficitario === true`, ma non segnala un warning visivo esplicito se COSFEL è undefined con ente deficitario. Il warning è solo nel `checks` array.

---

### Scenario 6 — Strutturalmente deficitario con COSFEL No

**Input**: `isStrutturalmenteDeficitario: true`, `hasApprovazioneCosfel: false`  
**Logica**: `isDeficitarioSenzaCosfel = true` → `isBlocked = true` → incrementoApplicato = 0.  
**UI**: Banner blocco mostrato. ✅  
**Esito**: ✅ Corretto.

---

### Scenario 7 — Superamento sostenibilità spesa personale

**Con riduzione accettata** (`accettaRiduzioneSostenibilita: true`):  
- `dl25Increment.ts` linea 261: `targetIncremento = incrementoMassimoSostenibilePerSpesaPersonale`  
- Motivazione aggiunta. ✅

**Senza riduzione accettata** (`accettaRiduzioneSostenibilita: false/undefined`):  
- Linea 265: `targetIncremento = 0`  
- Motivazione aggiunta. ✅  
**Esito**: ✅ Corretto per entrambi i casi.

---

### Scenario 8 — Superamento limite storico spesa personale

**Con riduzione accettata** (`accettaRiduzioneLimiteStorico: true`):  
- Linea 281: `targetIncremento = incrementoMassimoStorico`. ✅

**Senza riduzione**:  
- Linea 284: `targetIncremento = 0`. ✅  
**Esito**: ✅ Corretto.

---

### Scenario 9 — Provincia / Regione / Città metropolitana con soglia non codificata

**Input**: entityType = PROVINCIA  
**Logica**: `getDl25ApplicabilityStatus('PROVINCIA') = 'DIRECTLY_APPLICABLE'`  
- `isComune = false` → il blocco di calcolo virtuosità non esegue.  
- `margineSpesaPersonale` rimane `undefined`.  
- Check `DL25-SOGLIA-NON-CODIFICATA` generato come warning (linea 490–498).  
**UI** (Sezione 2, linea 329–339): Box ambra "Soglia non codificata — da verificare manualmente". ✅  
**L'ente NON viene classificato automaticamente come non virtuoso**: ✅  
**Esito**: ✅ Corretto.

---

### Scenario 10 — Unione di Comuni con quote validate e non validate

**Input**: entityType = UNIONE_COMUNI, quoteAderenti con 3 voci:  
1. quota validata (riduzione = true, parere aderente = true, parere ricevente = true)  
2. quota con parere revisori mancante (parere aderente = undefined)  
3. quota con riduzione permanente = false  

**Logica** (`dl25Increment.ts`, linee 325–338):  
- quota 1: `isValid = true` → aggiunta a `quotaTotaleValidata`  
- quota 2: `isValid = false` (parere aderente ≠ true) → aggiunta a `quotaNonValidata`  
- quota 3: `isValid = false` (riduzione ≠ true) → aggiunta a `quotaNonValidata`  

**Risultato**: Solo la quota 1 concorre al totale. Le altre rimangono visibili ma non validate. ✅  
**Mapping**: Solo `quotaTrasferitaAderentiDL25_2025` valorizzata. `st_incrementoDL25_2025` non valorizzato. ✅  
**Esito**: ✅ Corretto.

---

## 3. Verifica Mapping Preview

Analisi di `src/features/wizard2026/__tests__/mappingPreview.test.ts` e del mapping:

| Condizione | Campo valorizzato | Campo non valorizzato |
|---|---|---|
| DIRECTLY_APPLICABLE + calcolo riuscito | `st_incrementoDL25_2025` | `quotaTrasferitaAderentiDL25_2025` |
| TRANSFER_ONLY + quote validate | `quotaTrasferitaAderentiDL25_2025` | `st_incrementoDL25_2025` |
| NOT_APPLICABLE | Nessuno dei due | — |
| Calcolo non riuscito (dati mancanti) | Nessuno | — |

**Mutua esclusività**: ✅ Confermata dalla logica di mapping.

---

## 4. Verifica Lettera Richiesta Dati

Analisi di `src/features/wizard2026/letters/wizard2026LetterCatalog.ts` (Step 3):

| Campo richiesto nella lettera | Presente nel catalogo | Note |
|---|---|---|
| Spesa stipendi tabellari 2023 non dirigenti | ✅ | `dl25.stipendiTabellari2023NonDirigenti` |
| Fonte del dato | ✅ | `dl25.fonteDatoStipendi2023` |
| Fondo stabile 2025 | ✅ | `dl25.fondoStabile2025Certificato` |
| Budget EQ 2025 | ✅ | `dl25.budgetEq2025` |
| Atto di indirizzo/delibera | ✅ | `dl25.attiAutorizzazioneDl25` |
| Parere revisori | ✅ | `dl25.parereRevisoriDl25` |
| Asseverazione equilibrio pluriennale (estremi) | ❌ | Non presente come campo lettera |
| Entrate correnti N-1, N-2, N-3 | ✅ | Tre voci separate in catalogo (COMUNE) |
| Popolazione ente | ✅ | `dl25.popolazioneEnte` (COMUNE) |
| FCDE | ❌ | **MANCANTE** nel catalogo lettera |
| Spesa personale ultimo rendiconto | ✅ | `dl25.spesaPersonaleUltimoRendiconto` |
| Limite storico spesa personale | ✅ | `dl25.limiteStoricoSpesaPersonale` |
| Spesa personale prevista 2026 | ✅ | `dl25.spesaPersonalePrevista2026AnteIncremento` |
| Aliquote oneri riflessi/IRAP | ❌ | **MANCANTI** nel catalogo lettera |
| Documentazione COSFEL | ❌ | **MANCANTE** come voce esplicita |
| Atti e pareri enti aderenti (Unioni) | ✅ | `dl25.quoteAderenti` |

**Trattamento valori booleani "No"**: Il catalogo usa `includeWhen` per escludere il campo dalla lettera solo se il valore è già noto. I campi booleani con valore `false` (es. parere revisori = No) sono considerati dati **presenti**, non mancanti. ✅

---

## 5. Verifica UI

### Responsive (desktop/tablet/smartphone)
- Griglia a 3 colonne su desktop, 2 su tablet, 1 su mobile (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`). ✅
- La tabella quote usa `overflow-x-auto` per scorrimento orizzontale su schermi stretti. ✅
- Padding e gap adeguati per la lettura.

### Palette FP CGIL Lombardia
- `#CC4331` e `#A83226`: usati per accenti, icone, badge, bordi card principale, importo principale. ✅
- `#FFF4F2` e `#FCE7E2`: usati per sfondi informativi e card principale. ✅
- Nessun colore blu/viola nelle card principali. ✅
- Gli stati di successo/validità usano `emerald` (verde), solo per contesti semantici (equilibrio sì, costo sostenibile). ✅

### Leggibilità
- I box sono ordinati e non compressi. Sezioni ben separate con bordi e sfondo bianco.
- Le formule sono visibili nelle card risultato (`formula="..."` esposta da `Wizard2026ResultCard`). ✅
- I risultati principali sono chiari e in primo piano. ✅

---

## 6. Riepilogo Anomalie

| Cod. | Gravità | Descrizione | Tipo |
|---|---|---|---|
| B1 | 🟡 Media | I requisiti negativi specifici (dissesto, piano, fascia) non sono elencati esplicitamente nella UI — il banner mostra solo il blocco generico | UX |
| B2 | 🟡 Media | Campo estremi autorizzazione COSFEL non esposto come input in fase di raccolta dati | Dato mancante |
| C1 | 🟠 Tecnica | FCDE usato è quello del bilancio di previsione, non del rendiconto — la formula è tecnicamente corretta per la norma ma andrebbe esplicitato | Tooltip |
| D1 | 🟡 Media | Manca campo "altre risorse 2025 da sottrarre" oltre a fondo stabile + EQ | Dato mancante |
| D2 | 🟢 Bassa | Parere revisori raccolto come Sì/No, non come riferimento documentale | Completezza |
| F1 | 🟡 Media | Campo `baseCalcoloLimiteStorico` non esposto in UI | Dato mancante |
| F2 | 🟢 Bassa | Scostamento dal limite storico non mostrato come dato esplicito separato | UX |
| G1 | 🟡 Media | Manca card "Quota non iscrivibile" (differenza richiesto – iscrivibile) | UX |
| G2 | 🟢 Bassa | Margine sostenibilità e incremento massimo sostenibile non riassunti nella Sezione 5 | UX |
| H1 | 🟡 Media | Manca colonna "Tipologia ente aderente" nella tabella quote | Dato mancante |
| H2 | 🟡 Media | Manca colonna "Autorizzazione COSFEL" nella tabella quote | Dato mancante |
| S5 | 🟡 Media | COSFEL undefined con ente deficitario non produce warning visivo diretto — solo nel checks array | UX |
| L1 | 🟡 Media | FCDE mancante nel catalogo lettera richiesta dati | Lettera |
| L2 | 🟡 Media | Aliquote oneri riflessi/IRAP mancanti nel catalogo lettera | Lettera |
| L3 | 🟡 Media | Documentazione COSFEL mancante nel catalogo lettera | Lettera |

---

## 7. Esito Test e Build

### Test unitari (`npx vitest run`)

**Totale file:** 40 ✅  
**Totale test:** 205 ✅  
**Esito:** TUTTI PASSATI

File di test rilevanti per Step 3:
- `src/features/wizard2026/steps/__tests__/Step3Dl25.test.tsx` — 4 test ✅
- `src/logic/wizard2026/__tests__/dl25Increment.test.ts` — 6 test ✅
- `src/features/wizard2026/__tests__/mappingPreview.test.ts` — 4 test ✅

### Build di produzione (`npm run build`)

**Esito:** ✅ BUILD RIUSCITA (0 errori TypeScript, 0 errori bundle)

```
✓ 2757 modules transformed.
✓ built in 38.15s
```

---

## 8. Conferma Vincoli

| Vincolo | Rispettato |
|---|---|
| Non modificato il vecchio wizard legacy | ✅ |
| Non modificato `fundEngine.ts` | ✅ |
| Non modificata Costituzione Fondo legacy | ✅ |
| Nessuna scrittura su Supabase | ✅ |
| Nessuna scrittura su localStorage | ✅ |
| Trasferimento finale dati rimasto disabilitato | ✅ |
| Non modificato `DataEntryPage.tsx` | ✅ |
| Non modificato `FondoAccessorioDipendentePage.tsx` | ✅ |
| Palette FP CGIL Lombardia rispettata | ✅ |
| Dati mancanti non forzano incremento a zero | ✅ |

---

## 9. Proposte per MOD-011-ter (se necessaria)

In ordine di priorità discendente:

1. **[Alta]** Elenco esplicito requisiti negativi nel banner blocco (B1) — specificare quale tra dissesto/piano/fascia/equilibrio/COSFEL ha causato il blocco.
2. **[Alta]** Aggiungere campo `baseCalcoloLimiteStorico` in UI (F1).
3. **[Alta]** Aggiungere card "Quota non iscrivibile" nella Sezione 5 (G1).
4. **[Media]** Aggiungere campo estremi COSFEL come input esplicito in Sezione 3 (B2).
5. **[Media]** Aggiungere FCDE, aliquote e COSFEL al catalogo lettera (L1, L2, L3).
6. **[Media]** Aggiungere colonne "Tipologia ente" e "COSFEL" alla tabella quote Unioni (H1, H2).
7. **[Media]** Warning visivo diretto nella UI quando ente deficitario + COSFEL undefined (S5).
8. **[Bassa]** Campo "altre risorse 2025 da sottrarre" per componenti aggiuntive (D1).
9. **[Bassa]** Scostamento limite storico come dato esplicito in UI (F2).
