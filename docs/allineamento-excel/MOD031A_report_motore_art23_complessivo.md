# Report Tecnico — MOD-031A — Correzione Motore Centrale Art. 23 e Deroga Piccoli Comuni

Il presente documento illustra i dettagli tecnici dell'intervento effettuato sul motore centrale di conformità all'Art. 23, comma 2, D.Lgs. 75/2017. L'obiettivo dell'intervento è allineare le logiche di calcolo alle specifiche del foglio Excel "Nuovi Fondi Salario Accessorio Funzioni Locali 2026", integrando la gestione del Segretario Comunale e della Dirigenza, oltre alla deroga prevista dal D.L. 19/2026 per i Comuni con popolazione fino a 3.000 abitanti.

---

## Tabella Tecnica di Mappatura Chiavi

Di seguito viene riportata la mappatura esatta delle chiavi dell'applicazione utilizzate per ricostruire i componenti del limite e del consumo dell'Art. 23 c. 2:

| Componente Logica | Composizione Chiavi dell'App / Logica di Calcolo | Riferimento / Note |
| :--- | :--- | :--- |
| **`segretarioCorrenteRilevanteOrdinario`** | `(st_art3c6_CCNL2011_retribuzionePosizione + st_art60c1_CCNL2024_retribuzionePosizioneClassi + st_art60c3_CCNL2024_maggiorazioneComplessita + st_art60c5_CCNL2024_allineamentoDirigEQ + va_art61c2_CCNL2024_retribuzioneRisultato10 + va_art61c2bis_CCNL2024_retribuzioneRisultato15 + va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane) * (fin_percentualeCoperturaPostoSegretario / 100)` | Somma delle sole voci rilevanti per il limite del Segretario, ponderata per la percentuale di copertura. |
| **`segretarioCorrenteEsclusoDL19_2026`** | `(st_art3c6_CCNL2011_retribuzionePosizione + st_art60c1_CCNL2024_retribuzionePosizioneClassi + va_art61c2_CCNL2024_retribuzioneRisultato10) * (fin_percentualeCoperturaPostoSegretario / 100)` | Quote escluse ex D.L. 19/2026 (posizione base, classi demografiche, risultato nei limiti ordinari del 10%). |
| **`quotaSegretario2016Neutralizzabile`** | `fondi.segretario.quotaSegretario2016Neutralizzabile` | Quota storica 2016 disaggregata per le sole voci escluse, definita in memoria come parametro locale. |
| **`dirigenzaCorrenteRilevante`** | `fondi.dirigenza.lim_totaleParzialeRisorseConfrontoTetto2016` (se `hasDirigenza` è true, altrimenti `0`) | Totale delle risorse che incidono sul limite per l'area Dirigenza. |
| **`ammontareCorrenteArt23`** | `comparto` + `eq` + `segretario` + `dirigenza` + `straordinario` | **Comparto**: `fad_soggette_lordo - straordinarioCorrenteSoggettoArt23 + totaleRisorseAssorbitePersonale`. <br>**EQ**: `eq_soggette` (esclusa `va_dl25_2025_armonizzazione`). <br>**Segretario**: `segretarioCorrenteRilevanteEffettivo`. <br>**Dirigenza**: `dirigenzaCorrenteRilevante`. <br>**Straordinario**: `straordinarioCorrenteSoggettoArt23`. |
| **`limiteStorico2016`** | `fondoSalarioAccessorioPersonaleNonDirEQ2016` + `fondoElevateQualificazioni2016` + `fondoDirigenza2016` + `risorseSegretarioComunale2016` + `fondoStraordinario2016` (o fallback) | Base storica di riferimento complessiva per l'anno 2016. |
| **`limiteStorico2016Neutralizzato`** | Se modalità = `dl19_2026_doppia_neutralizzazione` ed è presente `quotaSegretario2016Neutralizzabile`: <br>`limiteStorico2016 - quotaSegretario2016Neutralizzabile`. <br>Altrimenti: `limiteStorico2016`. | Applica la neutralizzazione storica solo se il parametro è valorizzato. |

---

## Logica Applicativa della Deroga D.L. 19/2026

La deroga per i piccoli Comuni (fino a 3.000 abitanti) è gestita in modo puramente parametrico:
1. **Default**: Sempre impostato su `ordinario` (nessuna deroga).
2. **Requisiti di Attivazione**: Nessuna esclusione viene applicata automaticamente in assenza di tipologia ente (deve essere `Comune`), popolazione (deve essere $\le 3.000$) o scelta applicativa dell'utente.
3. **Doppia Neutralizzazione**: Se l'utente seleziona la modalità di doppia neutralizzazione, ma manca la valorizzazione del campo `quotaSegretario2016Neutralizzabile`, il motore applica un fallback di sicurezza alla modalità `solo corrente` ed emette un warning esplicito nei controlli di compliance.

---

## Modifiche Eseguite

1. **`src/domain/types.ts` & `src/schemas/fundDataSchemas.ts`**:
   - Aggiunti i campi opzionali `segretarioDerogaMode` e `quotaSegretario2016Neutralizzabile` in memoria.
2. **`src/logic/calculation/fundEngine.ts` & `src/logic/fundEngine.ts`**:
   - Riscritto il calcolo dell'Art. 23 c. 2 per aggregare Comparto, EQ (esclusa voce D.L. 25/2025), Segretario (netto deroga), Dirigenza, e Straordinario.
   - Implementata la logica della deroga D.L. 19/2026 e della doppia neutralizzazione.
   - Restituita la disaggregazione per componenti nel DTO.
3. **`src/pages/FondoSegretarioComunalePage.tsx`**:
   - Inserita la sezione UI per la deroga D.L. 19/2026 visibile solo per i Comuni $\le 3.000$ abitanti.
4. **`src/pages/FondoAccessorioDipendentePage.tsx`**:
   - Aggiornato il prospetto unico dell'Art. 23 visualizzando i dettagli di tutte le componenti che concorrono al limite a livello di Ente.

---

## Esito dei Test e Verifiche

È stata predisposta una suite di test completa in `src/logic/__tests__/art23Complessivo.test.ts` che copre i 9 casi previsti.
Tutti i test unitari e le verifiche di compilazione e build hanno avuto esito positivo.
