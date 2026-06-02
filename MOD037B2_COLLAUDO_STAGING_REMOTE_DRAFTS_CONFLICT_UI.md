# Report MOD-037B2 — Collaudo Staging Persistenza Remota Wizard 2026 e UI Conflitti

**Data:** 2026-06-02  
**Versione:** Beta 1.3 (post-MOD-037B1)  
**Stato:** 🟢 IN ATTESA DI APPROVAZIONE (Modifiche locali verificate e collaudate con successo)  
**Autore:** Antigravity AI  

---

## 1. Esito Generale

L'implementazione delle logiche visive di gestione e risoluzione dei conflitti (Fase 5 e 6) e l'allestimento dell'ambiente di collaudo tecnico locale/staging hanno dato **esito positivo al 100%**. 
Tutti i vincoli normativi, applicativi ed architetturali richiesti sono stati rigorosamente rispettati. Nessun dato o configurazione di produzione (database Supabase o hosting Cloudflare) è stato alterato.

Il sistema è pronto per procedere al successivo step **MOD-037B3** (migrazione in staging ed attivazione controllata del feature flag).

---

## 2. File Modificati ed Esito Git

### File Modificati:
- [Wizard2026PreviewPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/Wizard2026PreviewPage.tsx) (UI gestione conflitti e sincronizzazione)
- [wizard2026RemoteDraftSync.test.ts](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/__tests__/wizard2026RemoteDraftSync.test.ts) (Aggiunto test 11 per la risoluzione manuale dei conflitti)
- `.env` (Modificato localmente abilitando `VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS=true`)

### Stato Git:
- **Branch Dedicato**: `feature/mod037b2-remote-drafts-staging-conflict-ui` (creato e allineato preventivamente a `main`)
- **Ignorati**: `.env` confermato come non tracciato/staged (protetto da `.gitignore`). `.env.example` è mantenuto con flag impostato a `false` per sicurezza.

---

## 3. SQL Migrazione & Staging Supabase

### 3.1 Allestimento ambiente Supabase Staging/Collaudo (Guida Operativa):
Per procedere con i test reali, l'amministratore dovrà configurare un progetto Supabase parallelo per lo Staging:
- **Variabili d'ambiente**:
  - `VITE_SUPABASE_URL`: Impostare l'endpoint del DB di collaudo.
  - `VITE_SUPABASE_ANON_KEY`: Impostare la anon key del DB di collaudo.
- **SQL Migration**: Eseguire il file [20260602000000_create_wizard2026_drafts.sql](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/supabase/migrations/20260602000000_create_wizard2026_drafts.sql) **esclusivamente** sul DB di collaudo tramite SQL Editor o Supabase CLI.
- **Dati minimi da replicare**: Tabella `public.profiles` e `public.entities` per associare l'utente di test alle relative entità.
- **Rischi da evitare**: Non utilizzare credenziali del DB di produzione, non eseguire script SQL senza specificare il search_path o al di fuori dell'ambiente di collaudo.

### 3.2 Verifica SQL pre-migrazione:
- La tabella `wizard2026_drafts` è fisicamente separata da `user_app_state`.
- La chiave unica logica `CONSTRAINT wizard2026_drafts_unique UNIQUE (user_id, entity_id, year)` garantisce l'upsert corretto ed evita la duplicazione delle bozze.
- RLS abilitate:
  - Gli utenti standard possono leggere (`SELECT`) solo le proprie bozze attive (`auth.uid() = user_id AND deleted_at IS NULL`) e scrivere (`INSERT`, `UPDATE`, `DELETE`) solo sulle proprie righe.
  - Gli utenti ADMIN possono leggere tutte le bozze per supporto/debug via `public.is_wizard2026_admin()` (funzione di auditing sicura, che legge da `public.profiles` in modo isolato e non sovrascrive altre definizioni).

---

## 4. UI Gestione Sincronizzazione e Conflitti

È stato integrato un pannello interattivo in [Wizard2026PreviewPage.tsx](file:///c:/Users/PuscedduD/Il%20mio%20Drive/Progetto%20FL%20APP/entilocaliapp/src/features/wizard2026/components/Wizard2026PreviewPage.tsx) che mostra in modo trasparente lo stato di allineamento locale/remoto ed offre opzioni esplicite e non ambigue:

1. **Bozza salvata solo locale (`local_only`)**:
   - Mostra: "Bozza presente solo su questo dispositivo. Salvala nel cloud per renderla disponibile altrove."
   - Azioni: Bottone "Salva bozza nel cloud".
2. **Bozza locale più recente (`local_newer`)**:
   - Mostra: "Hai apportato modifiche locali che non sono ancora state salvate sul cloud."
   - Azioni: Bottone "Aggiorna bozza cloud" e bottone "Continua solo localmente" (sospende temporaneamente la visualizzazione del pannello).
3. **Bozza cloud più recente (`remote_newer`)**:
   - Mostra: "È presente una compilazione nel cloud più recente rispetto a quella su questo dispositivo."
   - Azioni: Bottone "Scarica bozza cloud" e bottone "Continua solo localmente".
4. **Conflitto rilevato (`conflict`)**:
   - Mostra un alert critico: "I dati di questo dispositivo e quelli nel cloud differiscono ed entrambi sono stati modificati."
   - Azioni:
     - "Sostituisci bozza locale con quella cloud" (richiede conferma esplicita tramite `window.confirm`).
     - "Sovrascrivi bozza cloud con quella locale" (richiede conferma esplicita tramite `window.confirm`).
     - "Continua temporaneamente offline".
5. **Errore / Offline (`error`)**:
   - Mostra: "Non è stato possibile contattare il server cloud. Le modifiche verranno salvate solo localmente."

---

## 5. Sicurezza Sincronizzazione ed Autosave

Durante gli stati di disallineamento (`remote_newer`, `local_newer` o `conflict`):
- Il debounce dell'autosave automatico viene **completamente sospeso** nel hook `useWizard2026RemoteDraftSync.ts` (early return sulle righe 190-196).
- Nessun dato su `localStorage` o sul DB cloud viene sovrascritto in modo silenzioso o cieco. L'azione dell'utente è rigorosamente esplicita per ciascuno scenario distruttivo.

---

## 6. Validazione e Test Automatici

- **Typecheck** (`npx tsc --noEmit`): **SUCCESS (0 errori)**.
- **Unit Tests** (`npx vitest run`): **SUCCESS (392 test superati su 392, 100% Pass)**.
  - È stata aggiunta una nuova suite di test (`11. resolveConflict can be called to manually resolve conflicts by picking local or remote`) per validare il corretto indirizzamento delle decisioni manuali di risoluzione.
- **Vite Build** (`npm run build`): **SUCCESS** (generazione bundle Vite riuscita).

---

## 7. Rischi Residui & Raccomandazioni

- **Rischi Residui**: Nessuno identificato in locale. Le RLS a livello DB prevengono fughe di dati anche in caso di anomalie dell'applicazione.
- **Raccomandazione**: Si raccomanda di approvare il commit e la Pull Request del branch locale in modalità Draft per procedere al successivo **MOD-037B3** (attivazione staging remota e test reali sul database di collaudo).

---

### Dichiarazione di Integrità e Sicurezza
Si conferma esplicitamente che:
* Nessun comando SQL o migrazione è stata eseguita sul database Supabase di produzione.
* Nessun deploy è stato effettuato in produzione.
* Il feature flag di produzione in `.env.example` è mantenuto a `false`.
* Nessun dato reale della Costituzione del Fondo (`user_app_state`) è stato in alcun modo scritto o alterato.
