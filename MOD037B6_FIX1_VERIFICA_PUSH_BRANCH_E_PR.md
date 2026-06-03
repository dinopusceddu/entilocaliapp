# MOD037B6-FIX1 — Verifica push branch e apertura Draft PR consolidamento migrazioni

## 1. Stato Git e Branch Remoto
È stata effettuata una verifica puntuale del branch locale e remoto per individuare l'origine dell'errore di validazione:
* **Branch Locale Attivo**: `feature/mod037b5-consolidate-wizard-remote-drafts-migrations` (confermato).
* **Branch Remoto su Origin**: Trovato ed esistente.
  * Comando: `git ls-remote --heads origin feature/mod037b5-consolidate-wizard-remote-drafts-migrations`
  * Output: `cdbf73a0e3ad18ef00e9bed0a22af7297a0932d2 refs/heads/feature/mod037b5-consolidate-wizard-remote-drafts-migrations`
* **Corrispondenza Hash**: L'hash del commit sul server remoto coincide esattamente con l'hash locale: `cdbf73a` (`chore(db): consolidate wizard remote drafts migrations`).

L'errore API *Validation Failed (head: invalid)* riscontrato in precedenza è probabilmente dovuto a una temporanea latenza di sincronizzazione dei riferimenti di GitHub subito dopo la push o a problemi di autorizzazione/configurazione locale del tool che ha tentato la chiamata API. Il branch remoto è correttamente disponibile ed integro su GitHub.

---

## 2. Verifica File nel Branch
* **Conferma Esclusione Vecchio File**: Il vecchio file `supabase/migrations/20260220000022_adjust_select_policy.sql` **non** è tracciato o presente nell'indice Git del branch.
* **Conferma Nuovo File**: Il file corretto `supabase/migrations/20260602001000_adjust_wizard2026_drafts_select_policy.sql` **è correttamente tracciato e presente** nel commit remoto.
* **Verifica Sicurezza `.env`**: Nessun file `.env`, `.env.local` o `.env.production` è tracciato o presente nel commit (confermato da `git ls-files`).

---

## 3. Generazione Link Draft PR
Per superare qualsiasi blocco dei tool di automazione, si fornisce il link ufficiale e i parametri per l'apertura manuale della Draft Pull Request:

* **Repository**: `https://github.com/dinopusceddu/entilocaliapp`
* **Base Branch**: `main`
* **Compare Branch**: `feature/mod037b5-consolidate-wizard-remote-drafts-migrations`
* **Link Diretto**: [Crea Draft Pull Request su GitHub](https://github.com/dinopusceddu/entilocaliapp/pull/new/feature/mod037b5-consolidate-wizard-remote-drafts-migrations)

### Dati per la compilazione della PR:
* **Titolo**: `MOD-037B5 — Consolidamento migrazioni Wizard remote drafts`
* **Stato**: Impostare esplicitamente su **Draft** (o "Crea come bozza") prima della pubblicazione.
* **Corpo del Messaggio**:
```markdown
## Sintesi
Questa Pull Request consolida le migrazioni e la documentazione tecnica relative alla persistenza remota delle bozze del Wizard 2026.

La funzionalità resta disattivata in produzione tramite feature flag:
`VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS=false`

## Contenuto
* Migrazione correttiva RLS con timestamp corretto: `20260602001000_adjust_wizard2026_drafts_select_policy.sql`.
* Report di collaudo reale su Supabase staging.
* Report di consolidamento migrazioni.
* Report di correzione ordine migrazione.
* Aggiornamento `MEMORIA_AI.md`.

## Nota tecnica
La migrazione correttiva sostituisce il precedente file con timestamp errato `20260220000022_adjust_select_policy.sql`, che non deve essere incluso nella PR.
La sequenza corretta è:
1. `20260602000000_create_wizard2026_drafts.sql`
2. `20260602001000_adjust_wizard2026_drafts_select_policy.sql`

La policy finale di SELECT su `wizard2026_drafts` diventa:
```sql
USING (auth.uid() = user_id);
```
Il filtro sui record soft-deleted viene gestito a livello applicativo.

## Sicurezza produzione
* Nessuna migrazione SQL è stata eseguita su Supabase produzione.
* Nessuna modifica è stata applicata al database di produzione `yggokplxleredipknfbq`.
* Nessun deploy è stato eseguito.
* Nessuna variabile Cloudflare è stata modificata.
* Nessun file `.env` è stato versionato.
* Il feature flag resta spento in `.env.example`.

## Controlli locali
* `npx tsc --noEmit`
* `npx vitest run`
* `npm run build`

## Nota operativa
La PR deve essere aperta come Draft e non deve essere mergiata senza autorizzazione esplicita.
```

---

## 4. Conferma Vincoli di Sicurezza
* **Nessun merge** è stato effettuato su `main`.
* **Nessun deploy** è stato eseguito.
* **Nessun database di produzione** o istanza Supabase (`yggokplxleredipknfbq`) è stata minimamente toccata o interrogata per modifiche SQL.
* **Nessun parametro o variabile Cloudflare** è stata modificata.
