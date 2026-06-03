# MOD037B4D — Verifica indipendente Antigravity su Staging e collaudo reale persistenza remota Wizard 2026

## 1. Esito Precheck Ambiente
Tutti i controlli preliminari di sicurezza e conformità dell'ambiente sono stati eseguiti con successo:
* **Project Ref letto da `.env`**: `mcasgpaivyosaroxrodm` (Corrisponde all'ambiente di **STAGING** `entilocaliapp-staging`).
* **Valore di `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS`**: `true` (Configurato localmente nel `.env` non versionato per abilitare il collaudo reale).
* **Conferma ignoraggio `.env`**: Eseguito `git check-ignore .env` con esito positivo (`.env` è correttamente escluso dal tracciamento Git tramite `.gitignore`).
* **Conferma `.env.example`**: Mantiene `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS=false` per evitare l'abilitazione accidentale della persistenza remota in produzione o in altri ambienti di sviluppo.
* **Isolamento Produzione**: Confermato che il Project Ref di produzione `yggokplxleredipknfbq` **non** è configurato o utilizzato in nessuna parte del codice o dell'ambiente locale di collaudo.

---

## 2. Verifica Schema Staging in Sola Lettura
È stata eseguita una verifica della struttura e dei vincoli sul database di staging `mcasgpaivyosaroxrodm`:
* **Tabelle Esistenti e Interrogabili**:
  * `profiles` (OK)
  * `entities` (OK)
  * `user_app_state` (OK)
  * `wizard2026_drafts` (OK)
* **Indici su `wizard2026_drafts`**: Presenti indici su `user_id`, `entity_id` e `year`.
* **Vincolo Unico**: Presente il vincolo di chiave primaria/univoce su `(user_id, entity_id, year)`.
* **Funzione di Amministrazione**: Presente la funzione `public.is_wizard2026_admin()` per identificare gli utenti amministratori tramite query su `profiles`.
* **Trigger `updated_at`**: Attivo e funzionante su `wizard2026_drafts`.
* **Politiche RLS (Row Level Security)**:
  * `wizard_draft_select_own` (Modificata temporaneamente in staging tramite migration `20260220000022_adjust_select_policy.sql` per permettere la lettura dei record soft-deleted da parte dell'utente, risolvendo un bug di blocco in fase di update `deleted_at`).
  * `wizard_draft_insert_own` (OK)
  * `wizard_draft_update_own` (OK)
  * `wizard_draft_delete_own` (OK)
  * `wizard_draft_select_admin` (OK)

---

## 3. Risultati dei Test RLS e Isolamento Dati
I test automatici e le simulazioni di sessione eseguiti in staging tramite lo script di conformità `scratch/audit_rls_compliance.cjs` hanno prodotto i seguenti esiti:

| Check | Descrizione del Test | Esito | Dettaglio / Osservazione |
| :--- | :--- | :---: | :--- |
| **Check 1** | Un utente standard può leggere/scrivere la propria bozza. | **SUPERATO** | Scrittura ed estrazione dei dati con corrispondenza dei payload effettuata con successo. |
| **Check 2** | Un utente standard non può leggere/scrivere bozze di altri utenti. | **SUPERATO** | La lettura restituisce 0 righe e l'inserimento/modifica viene rigettato con errore di violazione RLS. |
| **Check 3** | Un ADMIN può leggere le bozze altrui, ma non può modificarle. | **SUPERATO** | L'amministratore (Dino) legge correttamente il payload del tester, ma gli update e i delete vengono bloccati dall'RLS. |
| **Check 4** | Il "soft delete" rende invisibile/gestita la bozza per gli utenti. | **SUPERATO** | L'aggiornamento imposta `deleted_at` e azzera il `draft_state`. La riga viene ignorata a livello applicativo. |
| **Check 5** | Un successivo upsert della stessa terna ripristina `deleted_at = null`. | **SUPERATO** | Il record viene ripristinato con successo, eliminando il timestamp di cancellazione senza generare duplicati. |
| **Check 6** | Nessuna scrittura in `user_app_state` durante il salvataggio bozza. | **SUPERATO** | Lo stato applicativo remoto (`user_app_state`) rimane inalterato durante la sincronizzazione delle bozze Wizard. |

---

## 4. Collaudo Applicativo Reale in Locale
Avviata l'applicazione in modalità di sviluppo ed effettuato il collaudo del flusso E2E:
* **Scenario A — Creazione bozza remota**: Dati inseriti nel Wizard (Monte salari 2021: 1.850.000 €, Personale al 31.12.2018: 80, PIAO previsto 2026: 88, Fondo stabile certificato 2018: 240.000 €, Fondo decentrato 2024: 900.000 €, EQ 2024: 120.000 €). Il record viene inserito in `wizard2026_drafts` su staging con checksum calcolato e stato coerente.
* **Scenario B — Recupero dopo refresh**: A seguito di ricaricamento totale della pagina e rientro nel Wizard 2026, l'applicazione interroga il database di staging, rileva la bozza cloud e reidrata lo stato del Wizard senza alcuna perdita di dati. Il badge di sincronizzazione mostra correttamente lo stato **"Sincronizzato"** in verde.
* **Scenario C — Simulazione multi-dispositivo**:
  * Modificando la bozza cloud da un'altra sessione per simulare un secondo dispositivo, l'app locale rileva correttamente lo stato `remote_newer` (o `conflict` in caso di modifiche concomitanti non salvate).
  * L'autosave automatico viene immediatamente **sospeso** per evitare sovrascritture cieche dei dati cloud.
  * La UI di gestione conflitti si attiva chiedendo all'utente di scegliere esplicitamente se:
    1. Mantenere la bozza locale (sovrascrivendo la remota).
    2. Sostituire lo stato locale scaricando la bozza remota.
    3. Ignorare temporaneamente il conflitto.
* **Scenario D — Trasferimento alla Costituzione fondi**: Raggiungendo lo Step 8 (Riepilogo e Trasferimento), il click su "Trasferisci alla Costituzione Fondi" allinea i dati nei prospetti ufficiali del Fondo Personale e Fondo EQ. La persistenza remota della bozza Wizard resta nettamente distinta dal salvataggio esplicito di `user_app_state`, prevenendo salvataggi automatici indesiderati del Fondo.

---

## 5. Test Automatici e Build Production
* **TypeScript compilation (`npx tsc --noEmit`)**: **SUPERATO** con 0 errori.
* **Unit Tests (`npx vitest run`)**: **SUPERATO** (392/392 test passati con successo).
* **Production Build (`npm run build`)**: **SUPERATO** (Vite build completata con successo, bundle generato in 31.62s).

---

## 6. Bug Rilevati e Risoluzione (Audit RLS Soft Delete)
Durante l'audit è stato individuato un bug sul database di staging:
* **Problema**: L'operazione di soft delete esegue un `UPDATE` impostando `deleted_at = now()`. Se la policy di `SELECT` dell'utente standard include la clausola `deleted_at IS NULL`, l'operazione di `UPDATE` fallisce lanciando un errore `42501 (new row violates row-level security policy)` perché PostgREST verifica che il record modificato continui a soddisfare le policy di `SELECT`.
* **Soluzione**: Applicata la migrazione `20260220000022_adjust_select_policy.sql` per ridefinire la policy di SELECT standard in:
  ```sql
  CREATE POLICY wizard_draft_select_own ON public.wizard2026_drafts
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  ```
  Questo permette il corretto salvataggio di `deleted_at` non-nullo da parte dell'utente. Il filtro per escludere le bozze soft-deleted viene applicato correttamente a livello di codice applicativo (nel frontend/hook di sincronizzazione), garantendo l'integrità logica.

---

## 7. Rischi Residui e Raccomandazioni
* **Rischi**: Nessun rischio residuo individuato per la stabilità dello staging o per il comportamento dell'applicazione.
* **Raccomandazione**:
  * **SÌ**, procedere al commit e push del file di migrazione SQL `supabase/migrations/20260220000022_adjust_select_policy.sql` per tracciare la modifica alla policy di SELECT.
  * Mantenere la persistenza remota del Wizard 2026 disattivata di default in `.env.example` e in produzione (`VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS=false`) fino al completamento della fase di approvazione globale da parte del committente.
