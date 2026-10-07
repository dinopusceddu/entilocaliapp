# CCNL_RECOVERY_INSTRUCTION — implementation V2

## Executive result

Policy resolution PASS sul contratto esplicitamente fornito dall'utente. Il precedente STOP `CCNL_RECOVERY_POLICY_AMBIGUITY` è risolto: recupero nel 2026, prima qualificazione successiva e riporto di risorsa già costituita sono fattispecie distinte. Non è stata inventata una finestra universale.

L'implementazione aggiunge istruzioni per kind/competence year, decisione, evidenza amministrativa, clausola performance, importi già riconosciuti, importi richiesti, residui derivati e provenance. `canonicalFundLedger` determina il contributo al Fondo. CURRENT non cambia. Gli importi non istruiti/invalidi non diventano budget definitivo.

RESULT=PASS; CCNL_RECOVERY_INSTRUCTION_STATUS=CLOSED_LOCALLY; NORM_02_STATUS_AFTER_SLICE=CANDIDATE_VERIFIED_FIXED. Gate sul contenuto finale: full product2041/2041,147 file; regression8/8; oracle14/14; TypeScript,diff check,scope integrity PASS. Evidenze `ccnl_recovery_instruction_evidence/v2-terminal-output.txt` e `v2-exits.json`. Nessuna reconciliation ASTRA aggiornata. Il report precedente BLOCKED è preservato.

## Baseline

Branch verificato `ux/toolbox-area-fondo-prototype`; HEAD `d3170f959b5815c514dbf3d6e5f93366a5f14c67`. Eseguiti branch, HEAD, status completo, diff e diff cached prima delle modifiche. Working tree dirty intenzionale; index vuoto. Evidenze `v2-pre-status.txt`, `v2-pre-diff.txt`.

Inventario PRE SHA-256: 638 file pertinenti restituiti da rg sotto src/scripts/tests/public/docs. POST confronta gli stessi file e i sette file di sorgente/test creati nello slice: 645 file. Non attribuisce allo slice documenti audit preesistenti ignorati da rg. `v2-scope.json` attribuisce 29 file di sorgente/test allo slice; il diff globale rispetto a HEAD comprende anche tutti gli slice precedenti.

ASTRA: VF17/PF5/OPEN3, TOTAL25, blockers0. NORM-02 PRE PARTIALLY_FIXED. Baseline product dichiarata 1988/1988, 144 file. Nessun checkout/reset/restore/stash/pull/merge/rebase/add/commit/push/PR/deploy.

## NORM-02 original acceptance

`RECOVERY IS EXPLICITLY INSTRUCTED PER COMPETENCE YEAR`. La separazione CURRENT/RECOVERY preesistente viene completata con la decisione per annualità, riconosciuto precedente, residuo, recupero parziale, destinazione e provenance. Missing non equivale a decisione zero. Un massimo teorico non equivale a diritto automaticamente attivato.

## Normative preflight

Il contratto risolutivo dell'ultimo messaggio dell'utente è l'authority applicativa autorizzata per questa ripresa. L'utente dichiara verificati testo integrale ARAN37357 e fonti 39114/35083; questa esecuzione assume tale verifica come richiesto, senza ripetere ricerca esterna o accesso Drive. Non viene presentata come nuova verifica indipendente delle fonti svolta da questi tool.

| Fonte autorizzata | Contratto applicato |
|---|---|
| CCNL23.02.2026 art58c1/c2 e art59c1 ultimo periodo | Corrente distinta; residui una tantum; riparto0,22 su basi2024 |
| ARAN37357,18.05.2026 | 0,14 competenza2024/25 nel Fondo variabile2026 quando annualità chiuse e definite; alternativa performance con clausola automatica originaria; analoghe considerazioni0,22competenza2025; esclusioneArt23 |
| ARAN39114,23.09.2026 | Conferma corrente stabile e quote2024/25 variabili2026 viaart59c1 |
| ARAN35083,09.07.2025 | Utilizzo negli anni successivi di residui stabili già qualificati, natura una tantum |
| Autonomie20/2024/QMIG | Risorsa mai costituita distinta da risorsa validamente costituita/certificata e vincolata |

Nessun uso dell'ipotesi CCNL2025–2027 come norma vigente. La prima qualificazione post2026 richiede la regola applicabile; il modello restituisce UNDETERMINED, senza impedire l'implementazione del contratto2026 risolto.

## Existing current formulas

`src/logic/wizard2026/ccnl2026Increments.ts` SHA-256 identico PRE/POST. Nessun cambiamento delle formule, rounding corrente, riparto corrente, COSFEL, classificazione Art23 o componenti correnti. I test correnti e l'oracle congelato sono rieseguiti. Nuove formule nel resolver recovery calcolano esclusivamente il massimo di competenza e il riparto dell'importo amministrativamente attivato; non il totale del Fondo.

## Existing recovery behavior

PRE: Wizard lasciava arretrati undefined; eventuale aggregato legacy era UNDETERMINED senza origine qualificata. POST: nel2026, per MS2021 non zero, tre candidate014/2024,014/2025,022/2025 vengono istruite separatamente. La creazione di candidate non crea denaro né decisioni. MS2021 zero senza istruzioni non richiede una recovery materialmente inutile. Nei successivi anni non vengono rigenerate candidate2024/25 automaticamente.

## 0.14 current contract

MS2021×0,0014, stabile annuale dal2024. MS2021=1000000 →1400 corrente2026. Nessuna trasformazione corrente→recovery e nessuna quota EQ0,14 introdotta.

## 0.14 recovery contract

Competenza2024 e2025 distinte, riconoscimento2026. CLOSED_AND_DEFINED è evidenza amministrativa esplicita. ABSENT → FUND_VARIABLE_RESIDUAL; PRESENT → PERFORMANCE_ARREARS secondo criteri CCDI originario, senza riapertura; UNKNOWN → UNDETERMINED. Il percorso performance registra amount/provenance ma contribuisce zero al Fondo corrente.

Entrambe full1400 → variabile2800 derivata da due istruzioni. Full2024 e zero2025 →1400. Già riconosciuto400, richiesto1000 → recupero1000 e residuo successivo0. Nessuna formula automatica0,0028 è authority recovery.

## 0.22 current contract

MS2021=1000000: current max2024=0;2025=2200;2026=2200;2027=2200 secondo contratto corrente applicabile. Oracle invariato. Il current2026 non ingloba2025. Con basi80000/20000 la scelta corrente2200 produce1760Fondo/440EQ, senza accumulazione automatica.

## 0.22 recovery contract

Competenza2025, riconoscimento2026: massimo2200 distinto da activatedAmount2025 esplicito e activationDecisionAttested. Missing scelta/attestazione → UNDETERMINED. Activated zero attestato e richieste zero istruite → VALID_ZERO. Activated>max → INVALID.

Activated1000 su basi80000/20000 → autorizzato800Fondo/200EQ. Already/requested/residual sono separati per Fondo ed EQ: non si assume che una precedente utilizzazione abbia rispettato una quota proporzionale implicita. Quote richieste non possono superare i rispettivi residui.

Per la quota Fondo si applica la clausola performance; EQ resta componente distinta una tantum. La clausola generica Fondo non estende la destinazione performance alla quota EQ. Un'estensione espressa ha `eqPerformanceClauseSource` distinta; il modello conserva tale fonte e la quota non viene sommata allo stanziamento EQ ordinario. Non viene costruito un motore di pagamento performance.

## Competence-year model

`src/domain/ccnlRecovery.ts`: `CcnlRecoveryInstruction`, `CcnlRecoveryState`, `ResolvedCcnlRecovery`. Identità obbligatoria kind+competenceYear e recognitionYear. Campi opzionali nella bozza consentono istruttoria incompleta; non consentono una recovery VALID incompleta. FundData annualData.ccnlRecovery e Wizard ccnl2026.recoveryInstructions sono optional JSON backward-compatible.

## Instruction statuses

Input: UNINSTRUCTED, NOT_TO_RECOVER, RECOVER_PARTIAL, RECOVER_FULL. Read model: UNINSTRUCTED, RESOLVED_ZERO, RECOVER_PARTIAL, RECOVER_FULL, NOT_APPLICABLE, BOUND_RESIDUAL_CARRY, INVALID. Stato economico VALID/UNDETERMINED/INVALID. Una decisione zero richiede fonte e fatti materiali: nessun undefined→0 amministrativo. Non chiusa/definita + decisione esplicita non recuperare zero → NOT_APPLICABLE; richiesta positiva incoerente → INVALID.

## Provenance model

Entry canonical source RECOVERY; originYear=competenceYear; provenance include instruction, recognitionYear, stato/decisione/route, massimo, autorizzati Fondo/EQ, importi già riconosciuti/richiesti, residui prima/dopo e issues. Fonte amministrativa libera, senza obbligo artificiale di numero determina. La versione zero istruita conserva la stessa lineage. Le identità malformed sono INVALID e non fabbricano entry VALID.

## Already-recognized / residual

Residuo recuperabile = autorizzato−già riconosciuto; residuo successivo = recuperabile−richiesto. Derivazione pura con Big.js e checkedMonetaryOutput; non vengono persistiti nuovi campi residual authority. Already>autorizzato → INVALID senza clamp. Gli importi esterni usano la shared policy DATA03.

## Partial recovery

È ammesso qualsiasi importo istruito non negativo entro il residuo. Caso014: teorico1400, già200, richiesto1000 → residuo recuperabile1200 e successivo200. Caso022: autorizzato800/200, già100/0, richiesto300/100 → residuo successivo400/100. Superamento di una quota → INVALID e nessun importo definitivo.

## Closed competence years

Snapshot CLOSED non viene letto per inferire CLOSED_AND_DEFINED. Il resolver usa esclusivamente i campi amministrativi; recovery vive nel riconoscimento corrente. Nessun load/write/update dell'anno originario effettuato per recuperare. Zero writeback. Non viene riaperto il CCDI.

## Canonical ledger integration

`buildCanonicalFundLedger` chiama il resolver qualificante e crea entry per-year. Solo route FUND_VARIABLE_RESIDUAL VALID contribuisce l'importo al Fondo; performance/carry/not-applicable contribuiscono zero con lineage. Missing/INVALID amount=null. Una issue upstream per requisito/anno passa alle readiness condivise; nessun gate speciale solo nel writer.

La quota EQ è letta dalla provenance delle entry canoniche dal fundEngine e aggiunta una sola volta alla componente EQ distinta. Non viene introdotta Dirigenza nel ledger FAD. Il ledger e le sue somme finali restano la sola authority FAD.

## Semantic IDs / duplicate prevention

CCNL_014_CURRENT/CCNL_022_CURRENT preservati. Recovery IDs CCNL_014_RECOVERY_2024/2025 e CCNL_022_RECOVERY_2025. Doppio kind/year → singola identità INVALID con issue DUPLICATE_COMPETENCE_YEAR: non somma, non lancia l'errore duplicate-ID del ledger. Identità malformed hanno namespace INVALID distinto. Entry VALID hanno originYear non null.

## Legacy aggregate retirement

| Occurrence | POST role |
|---|---|
| `ccnl2024Calculations.ts` MS2021×0,0028 | COMPATIBILITY_THEORETICAL; il relativo valore non governa il Fondo canonico. La funzione contiene altri calcoli ancora usati, non è stata cancellata |
| Wizard result arretrati014 legacy | Rimane undefined nel resolver CURRENT; non nuova authority |
| FAD vn_art58_CCNL2026_arretrati2024_2025 | Senza istruzioni qualificate resta legacy UNDETERMINED; con istruzioni non è un fallback economico |
| Nuovo resolver per-year | Input qualificato/massimi/residui per ledger, non secondo totale Fondo |
| Document projection / writer PDF/XLS | CANONICAL_PROJECTION; nessun ricalcolo0,0028 o annualità autonome |

Census testuale completo nei path pertinenti: `v2-recovery-census.txt`. Active automatic recovery authorities=0.

## annualita022Considerate

`considered022Years` usa Set delle annualità: corrente dal2025 più competence year022 risolta, escluso bound carry. Solo corrente2026 →1; corrente2026+2025 istruita →2; recovery non istruita non aggiunge anno. Il campo è metadata compatibility, non moltiplicatore economico.

## Wizard / UI

Editor circoscritto Step4: anno competenza/riconoscimento, decisione, stato amministrativo, clausola, fonte, attivazione2025, attestazione bilancio, già riconosciuto/richiesto Fondo ed EQ, residui read-only. Errori monetari visibili e associati aria-invalid/aria-describedby tramite MonetaryInput; errori dominio sulle richieste associati alla relativa istruttoria. Correzione invalid→valid elimina errore. Ordine e key delle righe stabili; nessun append su edit ripetuto. Nessun redesign globale.

## Transfer

Transfer scrive una copia delle istruzioni e delle basi2024 nell'annualità corrente, non residui/totali. Preview mostra istruzione, competenza, riconoscimento, fonte, quote/destinazione e stato. Invalid blocca il transfer; incompleta può essere trasferita come bozza, senza promozione economica. Re-transfer sostituisce, non appende. Il snapshot computed annualita022Considerate deriva dalle istruzioni effettive. Nessun legacy arretrato è fallback.

## Save/reload

Schema reale valida i nuovi campi; repository mock con snapshot workflow reale verifica source/status/year/amounts/zero preserved. Salvataggi ripetuti e reload mantengono le tre istruzioni e l'importo recovery1000. Nessun residuo calcolato viene scritto automaticamente per sincronizzare campi legacy. Wizard hydration OPEN riusa fatti annuali disponibili senza fabbricare decisioni.

## CLOSED

Wizard corrente CLOSED presenta recovery snapshot in sola lettura; fieldset disabilitati e update guard. Transfer CLOSED rifiutato dalla guard preesistente; nessun writer nuovo. N+1 vuoto non copia le istruzioni2026. BOUND_RESIDUAL_CARRY richiede attestazione booleana esplicita di costituzione/certificazione2026 e reference/fonte, restituisce zero nuova recovery e non ricostruisce massimo. L'utilizzo monetario rimane nel workflow residui esistente; non è una nuova migrazione o carry engine.

## Document projection

Read model canonico conserva lineage. Descrizioni moderne distinguono componente, competenza, riconoscimento, decisione/route, fonte, riconosciuto, recuperato e residuo; importo riga Fondo è effettivo, non massimo teorico. Performance/EQ distinte sono qualificate nella provenance/descrizione, senza aggiungerle al Fondo. Missing mostra da istruire; nessun already missing stampato come zero.

Test reali PDF/jsPDF/autoTable/pdfjs e XLS/ExcelJS, oltre alle projection: partial1000 visibile, competence2025 e recognition2026 mantenuti; uninstructed draft con nessuna recovery definitiva. Le fonti e i calcoli dei writer non cambiano. PDF test artifacts: `v2-pdf/`.

## Cabina

UNDETERMINED → TO_COMPLETE; INVALID → BLOCKED; VALID → comportamento ordinario. Una issue canonica rimanda al Wizard per l'istruttoria recovery. Priorità operativa generale invariata.

## Distribution

Il budget definitivo deriva dal canonico: authoritativeTotal null per unresolved/INVALID, nessuna quota recovery spendibile automatica. Nessuna modifica alla policy CALC02. Gli existing tests Distribution e nuovi test read model verificano tale gate.

## Closure readiness

Upstream status/issues canonici → NOT_READY prima del workflow closure per missing/INVALID; READY con recovery zero validata e restanti prerequisiti risolti. DocumentKindReadiness: DRAFT_ONLY per unresolved/INVALID, FINAL_READY in scenario risolto. Resolver readiness generali e document-kind policy invariati.

## Monetary boundary

Dodici nuovi pattern registry: cinque importi su annualData.ccnlRecovery.instructions.*, gli stessi cinque su ccnl2026.recoveryInstructions.*, due basi2024 annuali. Scala2, NONNEGATIVE_RESOURCE, optional missing, zero ammesso; schema/UI/import-restore/reducer/transfer/save riusano la shared authority. Le basi2024 Wizard erano già registrate. Nessuna logica range duplicata, nessuna modifica alla boundary/FinancialMath DATA03.

Test nuovi: negativi, malformed, NaN, Infinity,1e308, boolean/array,precisione123.456 rifiutati; unsafe save chiama repository zero volte; hydration legacy invalid calcola fail-closed senza Big.js throw. No monetary .any bypass nuovo; no mutation bypass sui nuovi field path.

## Protected regressions

Tutti i17 finding VERIFIED_FIXED sono protetti dalla full product suite: SEC01,DATA01/02/03,CALC01..05,DOC01/02,NORM01/03/04,ARCH01,FUNC01/02. Core current,PNRR,DL25,Art60,Dirigenza,empty initialization,shared monetary boundary e FinancialMath identici PRE/POST. Golden/oracle identici SHA-256; regression8/8 e oracle14/14 non aggiornati.

## Tests

Tre nuovi test file (resolver31, canonical/workflow integration12, UI8), due nuovi test real-PDF in suite esistente:53 nuovi test. Prima esecuzione verde e conferma sul contenuto finale2041/2041,147 file,zero pending/skip; conteggi per file in `v2-product-verified.json` / `v2-terminal-output.txt`. Unica esclusione preesistente dell'offline product config: historical wave3HardeningEvidence generator.

I sei test esistenti dedicati a CURRENT/read models/ARCH01/documents hanno input economici e expected economici invariati, con nuove istruzioni esplicitamente zero per isolare la quota corrente. Il vecchio assert globale «nessuna checkbox Step4» è circoscritto ai controlli CURRENT, consentendo l'attestazione recovery2025. Nessun golden modificato. I nove fallimenti intermedi sono documentati nel JSON first; i nuovi test verificano separatamente la nuova incompleteness e i gate. Il problema intermedio delle key UI è corretto e coperto da test.

| Gate finale | Esito |
|---|---|
| Full product offline |2041/2041 PASS,147 file,0 pending |
| Recovery resolver |31/31 PASS |
| Recovery canonical/workflows |12/12 PASS |
| Nuovo editor reale Step4 |8/8 PASS |
| Current CCNL resolver esistente |17/17 PASS |
| Suite real-PDF estesa |19/19 PASS |
| Regression congelata |8/8 PASS |
| Oracle congelato |14/14 PASS |
| TypeScript locale --noEmit |PASS,exit0 |
| git diff --check |PASS,exit0 |
| Scope integrity/hash protetti |PASS |

Evidenze degli exit code conservate. Il tentativo sandbox iniziale esbuild era un problema di lettura parent, non un conflitto oracle/golden; rieseguito con permesso di lettura e guard offline.

## Scope integrity

18 file prodotto,11 test/fixture; nessun file rimosso. Dettaglio in `v2-scope.json`.

| Gruppo di file prodotto | Motivazione strettamente NORM02 |
|---|---|
| domain/ccnlRecovery,domain/types,schemas/fundDataSchemas | Modello optional e contratto JSON recovery |
| logic/shared/ccnlRecovery | Qualificazione per-year, massimi/residui/routing e safety |
| canonicalFundLedger,fundEngine,domain/documentProjection | Entry canoniche recovery; quota EQ dalla stessa provenance; read models |
| domain/monetaryPolicies | Solo dodici nuovi pattern monetari |
| Wizard types,selectors,validation | Istruzioni e validazione condivisa, invalid transfer blocked |
| Step4,CcnlRecoveryEditor | UI circoscritta all'istruttoria |
| WizardPreviewPage,useWizard2026Draft | Wiring CLOSED read-only e recupero fatti snapshot OPEN |
| transferPreviewEngine,applyWizard2026Transfer | Input transfer idempotente, preview e metadata annualità |
| Cabina resolveChecklist | Target correttivo degli upstream issue recovery |

Nessuna modifica Auth,DB,migration,PNRR/DL25/Art60 core,Dirigenza resolver,empty initialization,golden,oracle,ASTRA reconciliation. Nessuna connessione a Supabase/staging/production/registry. Network guard: product attempts0,tooling16 lookup localhost risolti in memoria,outbound0,real connections0; contatori in `v2-network-summary.json`. Nessuna connessione reale aperta dai tool/prodotto.

## NORM-02 reassessment

Tutti i gate finali PASS: CCNL_RECOVERY_INSTRUCTION_STATUS=CLOSED_LOCALLY; NORM_02_STATUS_AFTER_SLICE=CANDIDATE_VERIFIED_FIXED. Non dichiarato VERIFIED_FIXED prima della review indipendente. Formalmente ASTRA resta VF17/PF5/OPEN3 e blockers0.

## UX-01 residual

Provenance migliorata solo per recovery CCNL. UX01 resta PARTIALLY_FIXED; ACCESS02 OPEN con miglioramento accessibile circoscritto. Nessun dossier o audit UX/accessibility globale.

## Next gate

`CCNL_RECOVERY_INSTRUCTION_INDEPENDENT_REVIEW` dopo gate verdi. Nessuna nuova implementation di altri finding. Fermarsi qui, senza aggiornare reconciliation ASTRA.
