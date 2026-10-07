# PRODUCTION DATABASE ALIGNMENT PLAN

Data: 2026-10-07. Repository: dinopusceddu/entilocaliapp. Fase POST_ASTRA_LOCAL_CONSOLIDATION. Source-only inventory; nessun apply/query remoto.

## 1. Executive summary

28 migration SQL censite integralmente: 18 tracked, 10 untracked, 12 ASTRA relevant. Quattro HIGH secondo data loss/integrity anche a runtime (profili reset, enti reset, promozione ADMIN, RPC iniziale che sovrascrive N+1); 27 richiedono precheck/ispezione, inclusi SQL storici esclusi. Release repository proposta: 19 SQL (7 origin/main, 11 ancestry locale, 1 nuovo Auth). I nove SQL bootstrap/history/seed sono esclusi come gia documentato da Wave1: non sono una nuova catena da applicare.

I tre SQL speciali non riscrivono righe all'apply. La migration ownership 20260921000000 contiene invece un UPDATE condizionale dei user_id: deve essere misurato e verificato su dati reali, soprattutto CLOSED. Le RPC contengono DML futuro; “no apply-time rewrite” non significa assenza di mutazioni successive o migration safe.

RELEASE_COMPATIBILITY = REQUIRES_DB_FIRST. Contratto da codice: profile authority + closure RPC finale/RLS prima delle tre Edge Auth e frontend. Tutti i gate live sono ancora non verificati. Catalogo ASTRA chiuso != produzione pronta.

## 2. Remote status disclaimer

~~~text
REMOTE_DATABASE_STATUS = NOT_QUERIED
REMOTE_MIGRATION_HISTORY = NOT_QUERIED
SUPABASE_REMOTE_CONTACTED = NO
STAGING_CONTACTED = NO
PRODUCTION_CONTACTED = NO
~~~

L'unico accesso rete e Git fetch origin autorizzato; nessun Supabase CLI, SDK runtime, SQL Editor, psql, link, staging o production. supabase/.temp e presente ma non usato; pooler-url e secret candidate escluso. History SQL, commenti “already applied staging”, report live precedenti e nome commit non attestano schema remoto corrente. Nessuna migration qui dichiarata installata.

## 3. Migration inventory

Ogni riga contiene timestamp filename esatto (20260315 e a otto cifre, non inventare una versione normalizzata), tracked/untracked, origin status, SHA-256 raw locale e chronological order. SHA conferma source censito, non payload remoto installato.

| Order | Timestamp | Filename | Git | Origin/main | SHA-256 | ASTRA relevant | Release |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 20260220000000 | 20260220000000_init_user_app_state.sql | untracked | absent | f46d6e0a646dafa96ee4534732c508d97df31752891e8b2d65db7e70a3b588c1 | NO | NO |
| 2 | 20260220000001 | 20260220000001_init_user_profiles.sql | untracked | absent | cf63dde75a0eae4f8929cfcb9ee27e588f12ae0b3afda33129dcf0b33dcfe8a6 | NO | NO |
| 3 | 20260220000002 | 20260220000002_init_multi_entity.sql | untracked | absent | 95f929934a991a5cdc7cd5ba57de6f3df303fd6fa4259de99b38ed8504fc3cb9 | NO | NO |
| 4 | 20260220000003 | 20260220000003_init_fix_admin_access.sql | untracked | absent | 5a924bd7584b3fe6929a0a8388d75add51af87579f8c888ba847e7342a86ed9d | NO | NO |
| 5 | 20260220000004 | 20260220000004_fix_profiles_recursion.sql | untracked | absent | 73d58ebc0c606bf178d9a24eee9d5063c349c7ddf209c84841b6fb7c1bca2124 | NO | NO |
| 6 | 20260220000005 | 20260220000005_confirm_email.sql | untracked | absent | 54749ce0a3c871bd0e303a4dc9c9fc28b814544b8b3c44b2c91d83cba543b108 | NO | NO |
| 7 | 20260220000006 | 20260220000006_make_admin.sql | untracked | absent | d5c66ca93d86bba97635d12ed4c81a2ef74c98eec3e6a8a4e6644fbec82c3715 | NO | NO |
| 8 | 20260220000007 | 20260220000007_seed_guest_user.sql | untracked | absent | 79dbd04b765728936cd149985fce22fd89d0948b33192c2b5f1a6d17a0b6ed6b | NO | NO |
| 9 | 20260220000022 | 20260220000022_remote_baseline.sql | untracked | absent | 1521cff930edfe26c7cb26109233d0bfd8f29833806d667a981c8f3cc7285830 | NO | NO |
| 10 | 20260221131708 | 20260221131708_create_rag_schema.sql | tracked | present | 21f490adda3a8040ec659f8975c7c35f13bf655f821b6884acd85d60f72baa38 | NO | YES |
| 11 | 20260221230945 | 20260221230945_create_knowledge_documents.sql | tracked | present | 49bd835db7e73ce030400f2133ebe0ccc6f48d2affd27b8944f3a5b553728235 | NO | YES |
| 12 | 20260222182000 | 20260222182000_create_communications_tables.sql | tracked | present | 0068fd7dba75dee11f84c98ee3223dc11cc39a0c7a610e379d9bd1ca708348bf | NO | YES |
| 13 | 20260315 | 20260315_add_user_id_to_notifications.sql | tracked | present | b701ff9a3a17f8262c84f8d3d1680d8f7eaad22c283b1f86d67105f597f3454c | NO | YES |
| 14 | 20260415120000 | 20260415120000_create_pareri_aran_staging.sql | tracked | present | 44b114319817cf5402ffb9828bfef4f6f92418f4c482e22f95221324053c9f12 | NO | YES |
| 15 | 20260602000000 | 20260602000000_create_wizard2026_drafts.sql | tracked | present | 1639338adbf6b93b34e4adee0330664d271a50dbddedbf2b083cbf158098862f | NO | YES |
| 16 | 20260602001000 | 20260602001000_adjust_wizard2026_drafts_select_policy.sql | tracked | present | e01651cc446abafe11b5cbe5f279757b8c664ba612c588271e026fb51c75c549 | NO | YES |
| 17 | 20260921000000 | 20260921000000_fix_user_app_state_ownership_rls.sql | tracked | absent | ed4920c439f03570379dc60b05306c65ee6be30eb79d793327f10063bda44d63 | YES | YES |
| 18 | 20260922000000 | 20260922000000_enforce_closed_snapshot_immutability.sql | tracked | absent | 4d60448eebd5001a152d7e86a63efcc2750d1b076adbbbe64c71feb7694dd471 | YES | YES |
| 19 | 20260922000001 | 20260922000001_close_annual_snapshot_atomic.sql | tracked | absent | 834e388c54970fa13258a016add059b53d4c2aeadf10b0f051a3dfc98df062bb | YES | YES |
| 20 | 20260922000002 | 20260922000002_grant_close_annual_snapshot_atomic.sql | tracked | absent | 604dbf542741e93088c0b16b015750fbdc3f71183abe05798ee49b31f01e008c | YES | YES |
| 21 | 20260922140000 | 20260922140000_update_immutability_trigger.sql | tracked | absent | 4295a51add45c0f6ec7f102863c2d11a670c91905dcc6fcf7e6a75ded6b58346 | YES | YES |
| 22 | 20260922140001 | 20260922140001_harden_close_annual_snapshot_atomic.sql | tracked | absent | 9d75cc6a45371899a8336eaa3e6e9c0863238b2cd7997f627d99a28cfb469e5d | YES | YES |
| 23 | 20260922140002 | 20260922140002_grant_hardened_rpc.sql | tracked | absent | 604dbf542741e93088c0b16b015750fbdc3f71183abe05798ee49b31f01e008c | YES | YES |
| 24 | 20260922150000 | 20260922150000_fix_found_in_atomic_closure.sql | tracked | absent | 5239e55c67dc62c801b4ceed74445815c9ab251b69cee6affc6fcc61f54fbeb5 | YES | YES |
| 25 | 20260928000000 | 20260928000000_harden_user_app_state_closed_boundary.sql | tracked | absent | 89726ea86cc5032729c5e2ecb0b5d8882973bb3797f7efca3437254c8dd4a454 | YES | YES |
| 26 | 20260928000001 | 20260928000001_restrict_atomic_closure_execute.sql | tracked | absent | 3a5a569f502a62698256b7e0810edfecab9f42e69e261387c15999a4db73d23d | YES | YES |
| 27 | 20260928000002 | 20260928000002_quarantine_registrazioni_calcolo_fondo.sql | tracked | absent | 3a239db6383d12ac38a4aa054053d6a6a01c9b0ce0184d30d908dabc1d20621d | YES | YES |
| 28 | 20261002000000 | 20261002000000_harden_auth_profile_role_source.sql | untracked | absent | 8670e439cd6fa8ae969652445637168491afd3388de710ce2ae9e2752ef2614d | YES | YES |


## 4. Migration chronological graph

Ordine di filesystem: timestamp lexical nella tabella, con 20260315 collocato tra febbraio e aprile. Il parser/version ledger effettivo dovra essere confrontato nella CLI futura.

~~~text
BOOTSTRAP LOCALE ESCLUSO: init00 → profiles01 → multi_entity02 → helpers03/04 → account05/06/seed07
                                     \→ remote_baseline22 (solo commento)
HISTORY RELEASE:
rag20260221131708 → knowledge20260221230945
communications20260222182000 → notifications20260315
get_my_role preesistente → pareri20260415120000
profiles/entities preesistenti → drafts20260602000000 → drafts_policy20260602001000
profiles/entities/user_app_state → ownership20260921000000
  → immutable20260922000000
  → atomic20260922000001 → grant20260922000002
  → trigger20260922140000 → hardened_rpc20260922140001 → grant20260922140002
  → FOUND20260922150000
  → closed_boundary20260928000000 → exact_acl20260928000001
external historical registrazioni_calcolo_fondo + trigger Make → quarantine20260928000002
profiles + existing on_auth_user_created_profile → role_source20261002000000
canonical DB/functions + profile role validation → Edge Auth triplet → frontend
~~~

E un grafo logico con prerequisiti, non prova di bootstrap riproducibile da DB vuoto. La history tracked assume tables/helpers Auth e stato iniziale creati altrove; la quarantena richiede tabella/trigger senza CREATE locale. Il placeholder non colma questo gap. Non introdurre i reset iniziali per “riprodurre” produzione.

## 5. Destructive-operation census

- DROP TABLE profiles CASCADE e DROP FUNCTION CASCADE: init_user_profiles. Drop/recreate perde ruoli/profile originari e puo rimuovere dipendenze.
- DROP COLUMN user_app_state.entity_id e DROP TABLE entities CASCADE: init_multi_entity; ricostruisce ente default e riscrive i riferimenti, SET NOT NULL dopo backfill e cambia PK. No replay.
- UPDATE apply-time: profiles init/backfill/conflict overwrite ruoli; multi-entity linking; confirm_email su account specifico; make_admin su profiles/user_app_state; ownership user_id solo mismatch.
- Seed Auth: account UUID fisso con password embedded, ON CONFLICT(id) DO NOTHING; non sovrascrive id presente, ma crea account se assente. Secret candidate. PRODUCTION_SEED_ALLOWED=NO.
- RPC iniziale atomic: UPDATE economico corrente da payload client e UPDATE N+1 intero, possibile overwrite CLOSED a runtime; sostituita dal hardened/FOUND. Durante migrazione chain impedire writer/closure finche versione finale completa.
- RPC hardened/FOUND: UPDATE metadati CLOSED e carryforward, INSERT N+1 solo all'invocazione; no DML apply-time. Conflitto/errore causa rollback transazione RPC.
- RLS/policy e revoche possono rendere dati esistenti non accessibili/mutabili senza cancellarli: ownership, closed boundary e quarantena sono esempi operativi.
- TRUNCATE operativo: assente. Stringa TRUNCATE nel CLOSED/quarantena e nei commenti/revoche non e esecuzione.
- DELETE_DATA operativo nella history: assente; DELETE in trigger/policy/event names non e DELETE SQL. delete-user Auth genera invece cascades future, inventory Edge separato.
- Column type rewrite: nessun ALTER COLUMN TYPE locale. SET NOT NULL su entity_id ha backfill precedente; le NOT NULL/CHECK/PK/UNIQUE nelle CREATE TABLE/INDEX richiedono precheck di strutture/dati gia presenti.
- Trigger non cancella righe direttamente: profili insert/update su eventi Auth; timestamp trigger mutate NEW.updated_at; CLOSED guard rifiuta mutazioni. Quarantena disabilita trigger outbound Make; definition remota sconosciuta.
- Nessuna safety dichiarata per effetto dei test frontend. Distingui loss fisica, perdita di identita/ruoli, access denial e future runtime mutation.

## 6. Per-migration risk and compatibility matrix

DATA_LOSS_RISK copre apply e comportamento installato; nota apply vs runtime per ogni riga. SAFE_BY_STRUCTURE e ammesso solo per placeholder senza statement; non valida history. REQUIRES_BACKFILL per ownership significa UPDATE condizionale gia nel SQL, necessario soltanto se mismatch>0. BLOCKED significa azione futura bloccata prima di qualunque apply, non preflight bloccato.

| Order / file | Operation types | Data loss risk | Existing-data compatibility | Data rewrite apply/runtime | Dependencies | Purpose / mutation | Required PRE checks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 20260220000000_init_user_app_state.sql | CREATE_TABLE,ADD_COLUMN,REPLACE_FUNCTION,RLS_POLICY,CONSTRAINT | MEDIUM | REQUIRES_PRECHECK | NO | none (bootstrap auth.users) | Schema base user_app_state; policies; get_my_role da snapshot role; ADD email idempotente | Pre P0/P1/P2/P3/P6; non replay bootstrap |
| 2 20260220000001_init_user_profiles.sql | DROP_TRIGGER,CREATE_TRIGGER,CREATE_TABLE,DROP_TABLE,CREATE_FUNCTION,REPLACE_FUNCTION,RLS_POLICY,CONSTRAINT,BACKFILL_UPDATE,AUTH_CHANGE | HIGH | BLOCKED_PENDING_REMOTE_INSPECTION | YES | 20260220000000 + auth.users | DROP profiles CASCADE e function CASCADE; recreate; backfill Auth da ultimo snapshot ruolo UPPER/TRIM; conflict sovrascrive ruoli | P0/P1/P2/P3/P6; FORBIDDEN replay su produzione |
| 3 20260220000002_init_multi_entity.sql | DROP_COLUMN,DROP_TABLE,CREATE_TABLE,ADD_COLUMN,ALTER_COLUMN,CONSTRAINT,BACKFILL_UPDATE,INSERT_SEED,RLS_POLICY | HIGH | BLOCKED_PENDING_REMOTE_INSPECTION | YES | 20260220000000 + auth.users | DROP entity_id; DROP entities CASCADE; crea ente default per user; riscrive riferimenti; SET NOT NULL dopo backfill e cambia PK | P0/P1/P2/P3; FORBIDDEN replay; backfill esplicito esiste |
| 4 20260220000003_init_fix_admin_access.sql | REPLACE_FUNCTION,RLS_POLICY,AUTH_CHANGE | MEDIUM | REQUIRES_PRECHECK | NO | 20260220000000 + 20260220000002 | is_admin da user_app_state; sostituzione policy entities; autorita storica superata | P0/P2/P3/P6; non ripristinare helper storico |
| 5 20260220000004_fix_profiles_recursion.sql | REPLACE_FUNCTION,DROP_TRIGGER,CREATE_TRIGGER,RLS_POLICY,AUTH_CHANGE | MEDIUM | REQUIRES_PRECHECK | NO (apply); CONDITIONAL (future Auth events) | 20260220000001 | check_is_admin canonico su profiles; profile trigger legge raw_user_meta_data e puo colmare role NULL su update Auth | P0/P2/P6; sostituita dalla migration 20261002 |
| 6 20260220000005_confirm_email.sql | BACKFILL_UPDATE,AUTH_CHANGE | MEDIUM | BLOCKED_PENDING_REMOTE_INSPECTION | CONDITIONAL | auth.users | UPDATE mirato di email_confirmed_at per account nominato; modifica Auth esistente | P0/P2; operazione account fuori release; niente PII nel report |
| 7 20260220000006_make_admin.sql | BACKFILL_UPDATE,AUTH_CHANGE | HIGH | BLOCKED_PENDING_REMOTE_INSPECTION | CONDITIONAL | profiles + user_app_state | Promuove ADMIN account nominato su profiles e snapshot role; overwrite semantico ruoli | P0/P2; nessuna promozione account automatica |
| 8 20260220000007_seed_guest_user.sql | INSERT_SEED,AUTH_CHANGE,OTHER | LOW | BLOCKED_PENDING_REMOTE_INSPECTION | NO existing id; inserts absent id | auth.users + pgcrypto/extensions | Seed Auth UUID fisso e password embedded; ON CONFLICT id DO NOTHING; non overwrites ma security exposure | P0/P2; SECRET candidate NO version; seed produzione vietato |
| 9 20260220000022_remote_baseline.sql | OTHER | NONE | SAFE_BY_STRUCTURE | NO | history remota non attestata | Solo commento placeholder: non prova history staging/production attuale | P0; mai aggiungere come attestazione history |
| 10 20260221131708_create_rag_schema.sql | CREATE_TABLE,CREATE_FUNCTION,REPLACE_FUNCTION,RLS_POLICY,CONSTRAINT,OTHER | LOW | REQUIRES_PRECHECK | NO | vector extension + gen_random_uuid | document_chunks e match_document_chunks(vector(1536),float,int); service_role RLS | P0/P1/P5/P6; verificare extension/schema vector e signature |
| 11 20260221230945_create_knowledge_documents.sql | CREATE_TABLE,ADD_COLUMN,CONSTRAINT,RLS_POLICY | MEDIUM | REQUIRES_PRECHECK | NO | 20260221131708 + auth.users | knowledge_documents; FK uploaded_by senza ON DELETE; document_chunks.document_id CASCADE; RLS authenticated permissiva | P0/P1/P3/P5/P6; FK uploaded_by puo bloccare delete-user |
| 12 20260222182000_create_communications_tables.sql | CREATE_TABLE,CONSTRAINT,RLS_POLICY | MEDIUM | REQUIRES_PRECHECK | NO | user_app_state + auth.users | messages/message_reads/notifications/notification_reads; policy admin leggono snapshot role; cascades future | P0/P1/P2/P3/P6; policy legacy non automaticamente sostituite da is_admin |
| 13 20260315_add_user_id_to_notifications.sql | ADD_COLUMN,CONSTRAINT,RLS_POLICY | MEDIUM | REQUIRES_PRECHECK | NO | 20260222182000 | ADD notifications.user_id nullable FK cascade; policy SELECT target/broadcast; timestamp filename 8 cifre | P0/P1/P3/P6; verificare esatta versione CLI/history 20260315 |
| 14 20260415120000_create_pareri_aran_staging.sql | CREATE_TABLE,CREATE_FUNCTION,REPLACE_FUNCTION,CREATE_TRIGGER,RLS_POLICY,INDEX,CONSTRAINT,OTHER | MEDIUM | REQUIRES_PRECHECK | NO | gen_random_uuid + get_my_role | pareri_aran_staging; unique partial current/aran_id; CHECK stato/parse_status; updated_at trigger; admin policy | P0/P1/P3/P5/P6; duplicati current pre-index; CREATE TRIGGER non idempotente |
| 15 20260602000000_create_wizard2026_drafts.sql | CREATE_TABLE,CREATE_FUNCTION,REPLACE_FUNCTION,DROP_TRIGGER,CREATE_TRIGGER,RLS_POLICY,INDEX,CONSTRAINT | MEDIUM | REQUIRES_PRECHECK | NO | profiles + entities + auth.users | wizard2026_drafts; UNIQUE(user_id,entity_id,year), indexes; timestamp trigger; owner RLS e helper dedicato | P0/P1/P2/P3/P6; soft delete e flag frontend |
| 16 20260602001000_adjust_wizard2026_drafts_select_policy.sql | RLS_POLICY | LOW | REQUIRES_PRECHECK | NO | 20260602000000 | SELECT own anche soft-deleted; consente update deleted_at; cambia visibilita futura | P0/P1/P6; verificare deliberate deleted visibility |
| 17 20260921000000_fix_user_app_state_ownership_rls.sql | REPLACE_FUNCTION,RLS_POLICY,BACKFILL_UPDATE,AUTH_CHANGE | MEDIUM | REQUIRES_BACKFILL | CONDITIONAL | profiles + entities + user_app_state | is_admin/get_my_role canonici profiles; owner policies; UPDATE user_id = entities.user_id solo mismatch | P0/P1/P2/P3/P4/P6; mismatch CLOSED con trigger gia attivo STOP |
| 18 20260922000000_enforce_closed_snapshot_immutability.sql | CREATE_FUNCTION,REPLACE_FUNCTION,CREATE_TRIGGER | MEDIUM | REQUIRES_PRECHECK | NO | user_app_state | Trigger iniziale BEFORE UPDATE rifiuta qualunque modifica su OLD CLOSED | P0/P1/P4/P6; verificare nome trigger gia presente |
| 19 20260922000001_close_annual_snapshot_atomic.sql | CREATE_FUNCTION,REPLACE_FUNCTION,BACKFILL_UPDATE,OTHER | HIGH | REQUIRES_PRECHECK | NO (apply); YES (RPC) | entities + user_app_state + is_admin + PK entity/year | RPC iniziale con FOR UPDATE; runtime sostituisce fund_data corrente e N+1 esistente; nessuna guard CLOSED N+1 conservativa | P0/P1/P2/P3/P4/P6; superseded; sospendere closure finche chain finale installata |
| 20 20260922000002_grant_close_annual_snapshot_atomic.sql | GRANT_REVOKE | LOW | REQUIRES_PRECHECK | NO | 20260922000001 exact RPC signature | GRANT EXECUTE authenticated; da sola non revoca PUBLIC | P0/P6; ACL finali da 20260928000001 |
| 21 20260922140000_update_immutability_trigger.sql | REPLACE_FUNCTION,DROP_TRIGGER,CREATE_TRIGGER | MEDIUM | REQUIRES_PRECHECK | NO | user_app_state + atomic RPC | Sostituisce trigger UPDATE/DELETE CLOSED; cleanup flag senza is_admin in questa versione | P0/P4/P6; versione intermedia non esporre |
| 22 20260922140001_harden_close_annual_snapshot_atomic.sql | REPLACE_FUNCTION,BACKFILL_UPDATE,OTHER | MEDIUM | REQUIRES_PRECHECK | NO (apply); CONDITIONAL (RPC) | is_admin + entities + user_app_state + trigger context | RPC conservativa/idempotente; bug composite record IS NULL; DML solo runtime | P0/P1/P3/P4/P6; completare fix FOUND prima di servizio |
| 23 20260922140002_grant_hardened_rpc.sql | GRANT_REVOKE | LOW | REQUIRES_PRECHECK | NO | 20260922140001 | GRANT EXECUTE authenticated RPC hardened; non revoca PUBLIC | P0/P6; ACL finali successive |
| 24 20260922150000_fix_found_in_atomic_closure.sql | REPLACE_FUNCTION,BACKFILL_UPDATE,OTHER | MEDIUM | REQUIRES_PRECHECK | NO (apply); CONDITIONAL (RPC) | is_admin + entities + user_app_state; signature/PK da precedenti | Fix FOUND; FOR UPDATE corrente/N+1; closed server metadata; merge solo carryforward; conflitti espliciti | P0/P1/P2/P3/P4/P6; validita JSON/numeric e race missing N+1 |
| 25 20260928000000_harden_user_app_state_closed_boundary.sql | REPLACE_FUNCTION,DROP_TRIGGER,CREATE_TRIGGER,RLS_POLICY,GRANT_REVOKE | MEDIUM | REQUIRES_PRECHECK | NO | user_app_state + public.is_admin() + RPC security definer owner | INSERT/UPDATE/DELETE trigger; restrictive UPDATE policy; revoke TRUNCATE/TRIGGER/REFERENCES | P0/P2/P4/P6; postgres/BYPASSRLS e no FORCE RLS da verificare |
| 26 20260928000001_restrict_atomic_closure_execute.sql | GRANT_REVOKE | LOW | REQUIRES_PRECHECK | NO | close_annual_snapshot_atomic(uuid,integer,jsonb,jsonb) | REVOKE PUBLIC/anon; GRANT authenticated/service_role exact signature; Auth uid sempre richiesto dal body | P0/P6; ACL effective e default privileges |
| 27 20260928000002_quarantine_registrazioni_calcolo_fondo.sql | RLS_POLICY,GRANT_REVOKE,OTHER | MEDIUM | BLOCKED_PENDING_REMOTE_INSPECTION | NO | registrazioni_calcolo_fondo e trigger Make (nessun CREATE nella history locale) | DISABLE Make outbound; ENABLE RLS; REVOKE ALL PUBLIC/anon/authenticated/service_role; service_role solo SELECT | P0/P1/P6/P7; topologia esterna non riproducibile; writers/integrations possono perdere accesso |
| 28 20261002000000_harden_auth_profile_role_source.sql | REPLACE_FUNCTION,AUTH_CHANGE | LOW | REQUIRES_PRECHECK | NO | profiles + handle_new_user_profile + on_auth_user_created_profile su auth.users | Sostituisce solo function source; nuovi profile GUEST; conflict update solo email/updated_at; role esistente incluso NULL preservato | P0/P1/P2/P6; AUTH_PROFILE_ROLE_PENDING_GATE resta aperto |


19 SQL release richiedono tutti confronto history/precheck prima di una futura selezione apply. 27/28 e il census dell'intera cartella locale, non il numero di migration pending sul remoto. Nessun numero pending remoto e inventato.

## 7. Profile-role migration analysis

File: 20261002000000_harden_auth_profile_role_source.sql, untracked, non su origin/main. SQL letto direttamente.

~~~text
PROFILE_ROLE_MIGRATION_PRESENT = YES
PROFILE_ROLE_MIGRATION_DATA_REWRITE = NO
PROFILE_ROLE_MIGRATION_EXISTING_ROLE_EFFECT = Preserves every existing profiles.role, including NULL, on conflict; new profiles start GUEST on future Auth events.
PROFILE_ROLE_DEPLOYMENT_GATE_REQUIRED = YES
AUTH_PROFILE_ROLE_PENDING_GATE = APPLY_PENDING / LIVE_FIX_NOT_VERIFIED
~~~

PURPOSE: sostituisce public.handle_new_user_profile() RETURNS TRIGGER, SECURITY DEFINER, search_path=public. Non legge raw_user_meta_data, non legge raw_app_meta_data. NEW.id/NEW.email + literal GUEST/NOW. ON CONFLICT(id) UPDATE modifica SOLO email/updated_at; ruolo non incluso. Nessun backfill profiles, nessuna modifica ruoli esistenti, constraint/ACL/ownership/trigger DDL assenti. Nessun user_app_state.role toccato.

SCHEMA_MUTATION: solo CREATE OR REPLACE FUNCTION, firma identica. CREATE OR REPLACE non aggiunge un trigger mancante; presuppone on_auth_user_created_profile AFTER INSERT OR UPDATE ON auth.users collegato a questa function. Precheck owner/privilege/function/trigger esatti necessario; owner esistente non cambiato dal SQL.

DATA_MUTATION: nessuna durante apply; futuri eventi Auth inseriscono GUEST se profile assente, preservano role esistente altrimenti. NULL rimane NULL, quindi Edge esatto ADMIN fail closed; non inventare un backfill a USER o una normalizzazione ADMIN.
RLS/AUTH_EFFECT: blocca trust metadata per nuovi profile e per role NULL; non cambia policies/ACL. Un trigger remoto differente potrebbe continuare a leggere metadata: gate finche confrontato realmente.
EXISTING_ROWS_REWRITTEN=NO. ROLLBACK_DIFFICULTY=MEDIUM: DDL semplice con source precedente acquisito prima, ma revert riapre trust metadata; nessun downgrade automatico.
REQUIRED_DEPLOYMENT_ORDER: verify topology + history → reviewed role source → canonical role/missing/null precheck post → Auth Edge → frontend. Trigger timestamp side effect resta per Auth UPDATE.

## 8. CLOSED boundary migration analysis

File: 20260928000000_harden_user_app_state_closed_boundary.sql, tracked nei commit locali, assente origin/main.

~~~text
CLOSED_BOUNDARY_MIGRATION_PRESENT = YES
CLOSED_BOUNDARY_EXISTING_DATA_REWRITE = NO
~~~

PURPOSE/SCHEMA: replace check_user_app_state_immutability, DROP/CREATE row trigger BEFORE INSERT OR UPDATE OR DELETE; restrictive UPDATE policy TO authenticated; revoke TRUNCATE/TRIGGER/REFERENCES PUBLIC/anon/authenticated.
INSERT: NEW snapshotStatus=CLOSED sempre rifiutato; flag sessione non autorizza INSERT CLOSED. N+1 RPC deve essere OPEN.
UPDATE: OLD CLOSED sempre rifiutato, anche admin; OPEN→CLOSED richiede app.in_atomic_closure=true. Policy restrictive WITH CHECK NEW != CLOSED rende non sufficiente spoof flag per authenticated. RPC SECURITY DEFINER attesa postgres con BYPASSRLS e tabella senza FORCE RLS; verificare realmente owner/flags.
DELETE: OLD CLOSED consentito solo se cleanup flag app.allow_admin_cleanup=true E public.is_admin() IS TRUE; normal deletion/bypass service role non basta a cancellare CLOSED. Il flag e autorizzazione application-admin, non strategia DBA di manutenzione.
RLS/AUTH: dipende public.is_admin canonico profiles, non raw metadata/snapshot role; nessuna rewrite righe. Truncate non eseguito, ACL revocata per prevenire bypass row triggers.
DATA_MUTATION apply=NONE; futuro guard modifica comportamento/rifiuta operazioni. Non risana CLOSED gia corrotti o owner mismatch.
EXISTING_ROWS_REWRITTEN=NO. ROLLBACK_DIFFICULTY=HIGH operativo: ripristinare una policy/trigger piu permissivi riapre l'immutabilita; revert source non rollback remoto.
REQUIRED_DEPLOYMENT_ORDER: ownership/helper → RPC finale FOUND → closed boundary → exact execute ACL, nella stessa finestra protetta dalla closure intermedia. Policy CREATE non IF NOT EXISTS: replay installata o drift omonimo puo fallire.

## 9. Atomic closure migration analysis

File: 20260922150000_fix_found_in_atomic_closure.sql, tracked localmente, assente origin/main.

~~~text
ATOMIC_CLOSURE_MIGRATION_PRESENT = YES
ATOMIC_CLOSURE_MIGRATION_APPLY_TIME_DATA_REWRITE = NO
~~~

Signature: public.close_annual_snapshot_atomic(p_entity_id uuid,p_current_year int,p_closed_fund_data jsonb,p_next_fund_data jsonb) RETURNS jsonb. SECURITY DEFINER/search_path public. Auth uid obbligatorio, owner da entities.user_id, admin da is_admin; p_closed_fund_data conservato in signature compatibile ma economic current data letto dalla riga persistita, non sostituito dal caller.

Fix esistenza: FOUND/NOT FOUND immediatamente dopo SELECT INTO, evitando record composite IS NULL. SELECT corrente FOR UPDATE; SELECT N+1 FOR UPDATE in closure/idempotenza. La riga N+1 mancante non puo essere bloccata con SELECT FOR UPDATE: unique(entity_id,current_year) resta essenziale; inserimenti esterni concorrenti possono produrre unique conflict da gestire/riprovare nel workflow, non assumere CAS per writer OPEN.

Alla RPC: closed server timestamp/actor + copy persisted economic values; current UPDATE; N+1 absent INSERT OPEN con carryforward; N+1 OPEN merge solo campo carryforward, nessuna sostituzione intero payload; carryforward diverso → exception; N+1 CLOSED stesso carryforward → non modificato, altrimenti conflict. Corrente CLOSED con N+1 presente → already_closed; N+1 assente → recovery OPEN. Tutto transazionale, eccezioni rollbackano closure corrente e altre mutation della RPC.

Numeric cast di carryforward esistente presuppone stringa numeric valida (altri branch controllano regexp sul parametro); JSON annualData/distribuzione/carryforward devono essere verificati prima. Non e una validazione monetaria universale DB. Dipende PK, colonne role/email/entity_id/current_year/fund_data/updated_at, is_admin/auth helpers e trigger flag. Nessun GRANT nel file: signature ACL dalle migration grant/exact-revoke.

DATA_MUTATION apply=NONE; DML solo body invocato. SCHEMA_MUTATION=REPLACE_FUNCTION, nessuna tabella/constraint. EXISTING_ROWS_REWRITTEN=NO at apply, CONDITIONAL per future RPC.
ROLLBACK_DIFFICULTY=HIGH operativo se annualita gia chiuse/riporti creati: preservare CLOSED, niente reopening/delete N+1 automatico.
REQUIRED_DEPLOYMENT_ORDER: foundation + final helper + prior RPC signature → FOUND → CLOSED boundary + exact ACL → frontend closure. Caller: src/infrastructure/persistence/SupabaseStateRepository.ts:closeYearAtomic e yearClosureWorkflow; quattro named params confermati.

## 10. Edge Function inventory

7 handler + 4 file supporto, tutti gia tracked/present origin/main. Tre handler modified vs origin/main/HEAD, quattro handler unchanged. Non verificato deployment remoto di nessuno.

| Function | Git / delta origin | ASTRA source status | Schema dependency | profiles.role | Pending source migration | Deployment required | Runtime validation required |
| --- | --- | --- | --- | --- | --- | --- | --- |
| chat | tracked; unchanged |  | match_documents RPC non creato dalla history locale; shape da ricostruire | NO | NO | Non deducibile; nessun delta source | YES per qualificare baseline se parte release |
| chat-rag | tracked; unchanged |  | match_document_chunks + vector(1536), document_chunks; client ANON, RLS locale service_role | NO | NO | Non deducibile; nessun delta source | YES: ruolo client/visibilita RLS da verificare |
| create-user | tracked; MODIFIED |  | profiles(id,role), auth.users e profile trigger; nuovi account senza entities/state automatici | YES (caller ADMIN esatto) | YES: function source per nuovi profile GUEST | YES futuro; SOURCE_FIXED; DEPLOYED/LIVE_VERIFIED=NOT_QUERIED | YES: JWT valid/invalid; forged metadata denied; missing/null/error profile fail closed; new user GUEST |
| delete-user | tracked; MODIFIED |  | profiles(id,role), auth.admin.deleteUser; FK cascade e knowledge_documents.uploaded_by; CLOSED trigger | YES | YES: canonical-source assurance; effect strongest su create/update Auth | YES futuro; SOURCE_FIXED; DEPLOYED/LIVE_VERIFIED=NOT_QUERIED | YES: canonical ADMIN only, Auth identity, fail closed; deletion only staging disposable accounts dopo FK/CLOSED review |
| process-rag-chunk | tracked; unchanged |  | document_chunks insert; vector extension/embedding(1536); external OpenAI API | NO | NO | Non deducibile; nessun delta source | YES per baseline RAG se rilasciata; evitare chiamate non autorizzate |
| sync-users | tracked; unchanged |  | auth.admin.listUsers, entities insert e user_app_state insert defaults | NO canonical role read nel source | NO diretta; inserts snapshot GUEST | Non deducibile; nessun delta source; non includere nel deploy Auth triplet | YES prima di qualunque uso; source non appartiene al fix Auth verificato |
| update-password | tracked; MODIFIED |  | profiles(id,role), auth.admin.updateUserById; AFTER UPDATE Auth → profile timestamp/email | YES | YES: impedire trigger remoto non canonico su evento Auth update | YES futuro; SOURCE_FIXED; DEPLOYED/LIVE_VERIFIED=NOT_QUERIED | YES: JWT, missing/null/error profile fail closed, actual password update e preservation role in staging |


Supporti censiti: chat-rag/.npmrc, chat-rag/deno.json, process-rag-chunk/.npmrc, process-rag-chunk/deno.json; tracked unchanged origin, CONFIG, nessuna deploy mutation. supabase/config.toml contiene verify_jwt=true per chat-rag/process-rag-chunk; non attesta configurazione live degli endpoint Auth. Le tre Auth function fanno auth.getUser() e richiedono profiles.role esatto ADMIN da service client; role NULL/lowercase/missing/query failure negano accesso. is_admin/check_is_admin SQL usano UPPER(role): precheck lowercase/whitespace indispensabile per differenza semantica, nessuna normalizzazione autorizzata qui.

Secrets richiesti per Auth: SUPABASE_URL, SUPABASE_ANON_KEY, SERVICE_ROLE_KEY. Solo nomi, nessun valore. Altri handler leggono SUPABASE_SERVICE_ROLE_KEY e OpenAI/Gemini/OpenRouter names; differenza nome SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY da verificare nel target autorizzato, senza supposizioni di presenza.

create-user crea Auth email_confirm=true; profile trigger crea GUEST. update-password genera evento UPDATE Auth: profile.role deve restare identico. delete-user non effettua cleanup preliminare/flag RPC; cascades/FK reali possono fallire. sync-users non contiene check canonical profiles.role nel sorgente e crea default entities/state: fonte invariata fuori fix ASTRA, non eseguirla automaticamente come backfill. chat usa match_documents assente dalla history locale; chat-rag usa client ANON con policy document_chunks service_role: compatibilita reale non attestata. Questi sono limiti inventario, non nuova remediation/review.

## 11. Auth dependency / order

~~~text
RECOMMENDED_AUTH_RELEASE_ORDER =
1. read-only remote history + topology + role/ACL prechecks in future authorized session
2. stage/rehearse reviewed profile-role function replacement (and DB closure chain prerequisites)
3. verify canonical profiles.role and trigger preserve existing roles, new profiles GUEST
4. deploy create-user + update-password + delete-user as one reviewed Auth source unit
5. validate JWT/canonical ADMIN/fail-closed and Auth update role preservation in staging
6. frontend after DB/Edge contracts have passed
~~~

Indispensabile se il trigger remoto e ancora raw_user_meta_data: leggere profiles.role da Edge non rende automaticamente sicura la sua origine. Ordine non implica backfill/normalizzazione ruoli gia presenti. Il gate AUTH_PROFILE_ROLE_PENDING_GATE rimane separato e aperto anche con SOURCE_FIXED Edge.

## 12. Critical production data preservation matrix

PRODUCTION_DATA_PRESERVATION_MATRIX:

| TABLE | PURPOSE | PRIMARY KEY | OWNER / USER LINK | CLOSED / IMMUTABLE DATA? | MIGRATIONS TOUCHING TABLE | REQUIRED PRE / POST CHECK |
| --- | --- | --- | --- | --- | --- | --- |
| profiles | Ruolo canonico profilo Auth; email/timestamp | id uuid | id → auth.users(id) ON DELETE CASCADE | NO; ruoli da preservare | 20260220000001, 04, 06; 20261002000000; ownership helper 20260921 legge | P1/P2/P3/P6: count, role distribution incl NULL, exact role hash, missing profiles, ACL/trigger; nessun ruolo cambia per apply20261002 |
| user_app_state | Stato annuale fund_data/personale_servizio; role mirror storico | (entity_id,current_year) dopo multi-entity | user_id → auth.users CASCADE; entity_id → entities (NO ACTION) | YES quando fund_data.metadata.snapshotStatus=CLOSED | init00/02/06; 20260921 ownership; 20260922 RPC/trigger; 20260928 boundary/ACL | P1/P3/P4/P6: count, OPEN/CLOSED/NULL, duplicates/orphans/owner mismatch, full-row/fund CLOSED hashes; drift non previsto STOP |
| entities | Identita ente e unica ownership authority | id uuid | user_id → auth.users CASCADE | Non frozen; contiene annualita CLOSED collegate | init02/03; ownership20260921 legge | P1/P3/P6: count, owner FK, name presence, join stati; preservare ID/owner; delete puo fallire su state FK |
| knowledge_documents | Registro documenti caricati | id uuid | uploaded_by → auth.users(id), NO ACTION default | NO; documenti da preservare | 20260221230945 | P1/P3/P5/P6: counts/orphan uploaded_by, FK delete-user blocker, storage pairing da verificare senza dump PII |
| document_chunks | Testi/documento, metadata ed embedding RAG | id uuid | document_id → knowledge_documents CASCADE; nessun owner autonomo | NO; preserve content/links | 20260221131708, 20260221230945 | P1/P3/P5/P6: count, links, NULL/shape embeddings; match_document_chunks signature e vector extension |
| wizard2026_drafts | Bozze Wizard remote e last_transfer/local_sources | id uuid; UNIQUE(user_id,entity_id,year) | user_id → auth.users CASCADE; entity_id → entities CASCADE | Draft mutabile; final CLOSED protetto in user_app_state | 20260602000000, 20260602001000 | P1/P3/P6: count, soft-delete distribution, duplicates/orphans; nessun backfill di draft_state qui |
| messages | Comunicazioni target/broadcast | id uuid | user_id → auth.users CASCADE nullable; author_id SET NULL | NO | 20260222182000 | P1/P3/P6 counts + role policy snapshot source, no automatic auth rewrite |
| message_reads | Stato lettura messaggi | (message_id,user_id) | messages/auth.users CASCADE | NO | 20260222182000 | P1/P3/P6 count e orphans/policy owner |
| notifications | Notifiche broadcast/target | id uuid | author_id SET NULL; user_id auth.users CASCADE nullable da 20260315 | NO | 20260222182000, 20260315 | P1/P3/P6 count/target null distribution; policy storico snapshot role |
| notification_reads | Stato lettura notifiche | (notification_id,user_id) | notifications/auth.users CASCADE | NO | 20260222182000 | P1/P3/P6 count e orphans/policy owner |
| pareri_aran_staging | Workflow editoriale versionato ARAN; non ambiente staging | record_id uuid; unique partial aran_id WHERE is_current | supersedes_record_id self FK; no user link locale | NO; current/history preserve | 20260415120000 | P1/P3/P5/P6 count, current duplicates, invalid stato/parse_status, self-FK; get_my_role canonical |
| registrazioni_calcolo_fondo | Storico registrazioni/outbound integration quarantinata | UNKNOWN: DDL non presente localmente | UNKNOWN: catalogo remoto necessario | UNKNOWN; trattare come dati storici da preservare | 20260928000002 | P0/P1/P6/P7: existence, PK/FK/counts/trigger Make e dipendenze; no drop/recreate, service_role SELECT only intended |


Sono tabelle definite/riferite dal source locale; registrazioni ha sola reference operativa, schema/PK ignoti. auth.users e critical protected system source: non dump password/token in report, nessun seed/reset/promozione account. Storage objects/bucket di knowledge UI possono essere dipendenze esterne: catalogare in futuro, non inventare DDL locale o pretendere copertura backup completa solo dal public schema.

## 13. Existing-data compatibility and release compatibility

Per-migration classificazione nella matrice; nessuna compatibilita derivata dai test.

BACKWARD_COMPATIBLE_WITH_OLD_DB: non dimostrato. La nuova app richiede tables/profile/entity PK e close_annual_snapshot_atomic finale; OLD DB senza RPC fallisce in closeYearAtomic. RLS vecchia puo accettare write CLOSED/cross-owner che l'app intende proteggere. Edge nuovo richiede canonical role source, non soltanto column presente.

FORWARD_COMPATIBLE_WITH_NEW_DB: schema base/path preservati nei SQL ASTRA; RPC firma identica, profile migration non rimuove colonne, CLOSED finali rifiutano scritture indebite. Compatibilita strutturale locale attesa, runtime remoto NOT_VERIFIED. Old app su DB nuovo non universalmente compatibile: upsert/write di CLOSED e delete possono essere rifiutati.

~~~text
RELEASE_COMPATIBILITY = REQUIRES_DB_FIRST
REQUIRES_APP_FIRST = NOT_SUPPORTED_BY_LOCAL_CALLERS
ATOMIC_DEPLOY_REQUIRED = NOT_DEMONSTRATED
~~~

Caller concreti: SupabaseUserRepository.getUserRole(profiles.role); SupabaseEntityRepository entities owner; SupabaseStateRepository entity/year reads/upsert e RPC quattro parametri; wizard2026RemoteDraftRepository wizard2026_drafts quando feature flag abilitato; UserManagementPage invokes triplet e mirrors user_app_state.role; src/components/admin/RagDocumentManager.tsx usa knowledge_documents; chatbotService chat-rag. Nuovi valori FundData (DL25/recovery/provenance metadata) sono JSONB, senza ADD COLUMN migration; hydrate/normalize non e bulk data migration. Nessuna rewrite proattiva OPEN/CLOSED per “convertire” payload storici.

## 14. Required remote prechecks — saved read-only plan

QUERIES_NOT_EXECUTED. Eseguire esclusivamente in una futura sessione autorizzata, prima staging e poi produzione. Tutte le SELECT sotto sono read-only; non chiamano RPC business, non mutano Auth, non usano password/service key in questi artifact. Adattare solo dopo P0 alle colonne/tabelle realmente presenti; assenza di un prerequisito → STOP, non CREATE implicito. Preferire counts/hash alle righe contenenti dati personali.

### P0 — environment, history and expected objects

~~~sql
SELECT current_database(), current_setting('server_version'), current_setting('search_path');
SELECT extname, extversion, n.nspname
FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace ORDER BY extname;

SELECT name, to_regclass(name) AS resolved
FROM (VALUES
 ('public.profiles'),('public.entities'),('public.user_app_state'),
 ('public.knowledge_documents'),('public.document_chunks'),
 ('public.wizard2026_drafts'),('public.pareri_aran_staging'),
 ('public.messages'),('public.message_reads'),('public.notifications'),
 ('public.notification_reads'),('public.registrazioni_calcolo_fondo'),
 ('auth.users'),('supabase_migrations.schema_migrations')
) v(name);

SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE (table_schema='public' AND table_name IN
 ('profiles','entities','user_app_state','knowledge_documents','document_chunks',
  'wizard2026_drafts','pareri_aran_staging','messages','message_reads',
  'notifications','notification_reads','registrazioni_calcolo_fondo'))
 OR (table_schema='supabase_migrations' AND table_name='schema_migrations')
ORDER BY table_schema, table_name, ordinal_position;

-- Solo se P0 conferma version/name; non stampare eventuali statements con literal sensibili.
SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;
SELECT version, count(*) FROM supabase_migrations.schema_migrations
GROUP BY version HAVING count(*)>1;
~~~

Confrontare local release history (19 file), current local dirty history (28, da NON usare per push) e remote. In particolare version 20260315 e placeholder 20260220000022: non assumere padding/riparazione/registrazione equivalente. Se statements e disponibile, eventuale digest MD5/SHA e numero statement anziche contenuto con PII; statement payload puo non essere byte-exact del file locale. Local SHA non certifica remote SQL identico.

### P1 — counts, keys and structural preservation

~~~sql
-- Eseguire solo per tabelle presenti; ripetere per tutte le 12 della preservation matrix.
SELECT count(*) AS profiles_count FROM public.profiles;
SELECT count(*) AS entities_count FROM public.entities;
SELECT count(*) AS state_count FROM public.user_app_state;
SELECT count(*) AS knowledge_count FROM public.knowledge_documents;
SELECT count(*) AS chunks_count FROM public.document_chunks;
SELECT count(*) AS draft_count FROM public.wizard2026_drafts;
SELECT count(*) AS auth_count FROM auth.users;

SELECT n.nspname, c.relname, con.conname, con.contype,
       pg_get_constraintdef(con.oid) AS definition, con.convalidated
FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' ORDER BY c.relname, con.conname;
SELECT schemaname, tablename, indexname, indexdef FROM pg_indexes
WHERE schemaname='public' ORDER BY tablename,indexname;

SELECT entity_id,current_year,count(*) FROM public.user_app_state
GROUP BY entity_id,current_year HAVING count(*)>1;
SELECT count(*) FILTER (WHERE entity_id IS NULL) AS null_entity,
       count(*) FILTER (WHERE user_id IS NULL) AS null_owner,
       count(*) FILTER (WHERE current_year IS NULL) AS null_year,
       count(*) FILTER (WHERE fund_data IS NULL) AS null_payload
FROM public.user_app_state;
SELECT user_id,entity_id,year,count(*) FROM public.wizard2026_drafts
GROUP BY user_id,entity_id,year HAVING count(*)>1;
SELECT deleted_at IS NULL AS active,count(*) FROM public.wizard2026_drafts
GROUP BY deleted_at IS NULL;
~~~

Keys in duplicate query sono tecnici; custodire output senza email/contenuto documenti. Index CREATE su tabella preesistente puo fallire anche se CREATE TABLE IF NOT EXISTS non fa nulla. Migrazioni storiche DROP/CASCADE/PK/backfill non autorizzate.

### P2 — canonical role and Auth-trigger source

~~~sql
SELECT role,count(*) FROM public.profiles GROUP BY role ORDER BY role NULLS FIRST;
SELECT count(*) AS invalid_or_noncanonical_roles
FROM public.profiles
WHERE role IS NULL OR role NOT IN ('ADMIN','USER','GUEST');
SELECT count(*) AS admin_exact FROM public.profiles WHERE role='ADMIN';
SELECT count(*) AS admin_upper FROM public.profiles WHERE upper(role)='ADMIN';
SELECT count(*) AS auth_without_profile FROM auth.users u
LEFT JOIN public.profiles p ON p.id=u.id WHERE p.id IS NULL;
SELECT count(*) AS profile_without_auth FROM public.profiles p
LEFT JOIN auth.users u ON u.id=p.id WHERE u.id IS NULL;

-- Fingerprint ruolo esistente: nessuna email/password/token.
SELECT md5(string_agg(id::text||':'||coalesce(role,'<NULL>'),'|' ORDER BY id::text))
 AS profile_role_fingerprint FROM public.profiles;

SELECT p.oid::regprocedure AS signature, pg_get_userbyid(p.proowner) AS owner,
 p.prosecdef, p.proconfig, p.proacl, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN
 ('handle_new_user_profile','is_admin','get_my_role','check_is_admin','is_wizard2026_admin');

SELECT t.tgname, t.tgenabled, t.tgfoid::regprocedure AS function,
 pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
WHERE t.tgrelid=to_regclass('auth.users') AND NOT t.tgisinternal ORDER BY t.tgname;
~~~

Prima/dopo role_source: count + fingerprint dei ruoli esistenti identici. Profile assenti restano assenti all'apply; nessuna backfill implicita. Ricercare raw_user_meta_data/raw_app_meta_data nei definition solo come source metadata, senza dump valori utenti. Lowercase/NULL e role mirror non sono automaticamente riparati; la differenza upper SQL/exact Edge va risolta come gate operativo autorizzato.

### P3 — FK, owner and orphan checks

~~~sql
SELECT count(*) AS states_without_entity FROM public.user_app_state s
LEFT JOIN public.entities e ON e.id=s.entity_id WHERE e.id IS NULL;
SELECT count(*) AS state_owner_mismatch FROM public.user_app_state s
JOIN public.entities e ON e.id=s.entity_id WHERE s.user_id IS DISTINCT FROM e.user_id;
SELECT s.fund_data->'metadata'->>'snapshotStatus' AS status,count(*) AS mismatches
FROM public.user_app_state s JOIN public.entities e ON e.id=s.entity_id
WHERE s.user_id IS DISTINCT FROM e.user_id
GROUP BY s.fund_data->'metadata'->>'snapshotStatus';
SELECT count(*) AS orphan_entity_owner FROM public.entities e
LEFT JOIN auth.users u ON u.id=e.user_id WHERE u.id IS NULL;
SELECT count(*) AS orphan_state_owner FROM public.user_app_state s
LEFT JOIN auth.users u ON u.id=s.user_id WHERE u.id IS NULL;
SELECT count(*) AS orphan_uploaded_by FROM public.knowledge_documents d
LEFT JOIN auth.users u ON u.id=d.uploaded_by WHERE d.uploaded_by IS NOT NULL AND u.id IS NULL;
SELECT count(*) AS orphan_document_link FROM public.document_chunks c
LEFT JOIN public.knowledge_documents d ON d.id=c.document_id
WHERE c.document_id IS NOT NULL AND d.id IS NULL;
SELECT count(*) AS orphan_draft_entity FROM public.wizard2026_drafts d
LEFT JOIN public.entities e ON e.id=d.entity_id WHERE e.id IS NULL;
SELECT count(*) AS orphan_draft_user FROM public.wizard2026_drafts d
LEFT JOIN auth.users u ON u.id=d.user_id WHERE u.id IS NULL;
~~~

Ripetere FK orphan per messages/message_reads/notifications/notification_reads e self supersedes_record_id pareri. Catalogo pg_constraint da P1 decide ON DELETE e constraint reali. Ownership migration expected UPDATE count=mismatch PRE e POST0; payload/CLOSED hash devono restare identici. Se OLD CLOSED e trigger gia attivo, il backfill puo essere rifiutato: STOP, nessun disable trigger/cleanup flag automatico. knowledge_documents.uploaded_by FK default NO ACTION puo bloccare Auth deletion; user_app_state.entity_id default NO ACTION e CLOSED trigger possono bloccare entity/Auth cleanup.

### P4 — CLOSED, JSON shape, carryforward and preservation

~~~sql
SELECT coalesce(fund_data->'metadata'->>'snapshotStatus','<NULL>') AS status,
 count(*) FROM public.user_app_state GROUP BY 1 ORDER BY 1;
SELECT jsonb_typeof(fund_data) AS payload_type,
 jsonb_typeof(fund_data->'metadata') AS metadata_type,
 jsonb_typeof(fund_data->'annualData') AS annual_type,
 jsonb_typeof(fund_data->'distribuzioneRisorseData') AS distribution_type,
 count(*) FROM public.user_app_state GROUP BY 1,2,3,4 ORDER BY 1,2,3,4;
SELECT count(*) AS invalid_carryforward_text FROM public.user_app_state
WHERE fund_data->'fondoAccessorioDipendenteData'->>'vn_art80c1_sommeNonUtilizzateStabiliPrec' IS NOT NULL
 AND fund_data->'fondoAccessorioDipendenteData'->>'vn_art80c1_sommeNonUtilizzateStabiliPrec'<>''
 AND NOT ((fund_data->'fondoAccessorioDipendenteData'->>'vn_art80c1_sommeNonUtilizzateStabiliPrec')
  ~ '^-?[0-9]+(\.[0-9]+)?$');
SELECT count(*) AS year_payload_mismatch FROM public.user_app_state
WHERE fund_data->'annualData'->>'annoRiferimento' IS NOT NULL
 AND fund_data->'annualData'->>'annoRiferimento' IS DISTINCT FROM current_year::text;

SELECT count(*) AS closed_count,
 md5(string_agg(entity_id::text||':'||current_year::text||':'||md5(fund_data::text),
 '|' ORDER BY entity_id::text,current_year)) AS closed_payload_fingerprint,
 md5(string_agg(entity_id::text||':'||current_year::text||':'||
 coalesce(user_id::text,'<NULL>')||':'||coalesce(role,'<NULL>'),
 '|' ORDER BY entity_id::text,current_year)) AS closed_owner_role_fingerprint
FROM public.user_app_state WHERE fund_data->'metadata'->>'snapshotStatus'='CLOSED';
~~~

Hash e counts PRE/POST no unnoticed mutation; count-only non basta a dimostrare preservation. Per dataset grandi usare batch aggregate/digest read-only riproducibili approvati; non trasferire dump PII in repo. Prima di invocare RPC futura in staging: coerenza distribuzione risparmi/carryforward, finitezza valori e current/next-year existing/CLOSED cases; niente closure di dati produzione per fare smoke test.

### P5 — knowledge / RAG / editorial data

~~~sql
SELECT count(*) FILTER (WHERE document_id IS NULL) AS unlinked_chunks,
 count(*) FILTER (WHERE embedding IS NULL) AS no_embedding
FROM public.document_chunks;
SELECT aran_id,count(*) FROM public.pareri_aran_staging
WHERE is_current GROUP BY aran_id HAVING count(*)>1;
SELECT count(*) AS invalid_editorial_state FROM public.pareri_aran_staging
WHERE stato NOT IN ('draft','review','published','discarded')
 OR parse_status NOT IN ('ok','warning','error');
SELECT count(*) AS orphan_supersedes FROM public.pareri_aran_staging p
LEFT JOIN public.pareri_aran_staging prev ON prev.record_id=p.supersedes_record_id
WHERE p.supersedes_record_id IS NOT NULL AND prev.record_id IS NULL;
~~~

Embedding dimensioni/type da P0/P1, nessuna RPC chat invocata per catalogare. match_documents legacy assente source SQL: ispezionare esistenza/signature, senza crearlo ad hoc. Storage/link documenti va verificato in sessione autorizzata come prerequisito preservation.

### P6 — RLS, function/trigger source, ACL and ownership

~~~sql
SELECT n.nspname,c.relname,c.relrowsecurity,c.relforcerowsecurity,
 pg_get_userbyid(c.relowner) AS owner,c.relacl
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind IN ('r','p') ORDER BY c.relname;
SELECT schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
FROM pg_policies WHERE schemaname='public' ORDER BY tablename,policyname;
SELECT t.tgrelid::regclass AS table_name,t.tgname,t.tgenabled,
 t.tgfoid::regprocedure AS function,pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND NOT t.tgisinternal ORDER BY 1,2;
SELECT p.oid::regprocedure AS signature,pg_get_userbyid(p.proowner) AS owner,
 p.prosecdef,p.proconfig,p.proacl,pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN
 ('close_annual_snapshot_atomic','check_user_app_state_immutability',
 'match_document_chunks','match_documents',
 'update_wizard2026_drafts_updated_at','update_pareri_aran_staging_updated_at')
ORDER BY 1;

SELECT rolname,rolbypassrls FROM pg_roles
WHERE rolname IN ('postgres','service_role','authenticated','anon');
-- Solo se P0/P6 confermano signature e roles:
SELECT has_function_privilege('anon',
 'public.close_annual_snapshot_atomic(uuid,integer,jsonb,jsonb)','EXECUTE') AS anon_execute,
 has_function_privilege('authenticated',
 'public.close_annual_snapshot_atomic(uuid,integer,jsonb,jsonb)','EXECUTE') AS auth_execute;
SELECT has_table_privilege('authenticated','public.user_app_state','TRUNCATE') AS auth_truncate,
 has_table_privilege('anon','public.user_app_state','TRUNCATE') AS anon_truncate,
 has_table_privilege('authenticated','public.user_app_state','TRIGGER') AS auth_trigger,
 has_table_privilege('authenticated','public.user_app_state','REFERENCES') AS auth_references;
~~~

Atteso RPC exact uuid/int/jsonb/jsonb, FOUND guard, canonical helper, search_path public, SECURITY DEFINER owner privilegiato compatibile, table NO FORCE RLS. No PUBLIC/anon execute, authenticated/service_role granted, ma body richiede auth.uid anche service_role. Verificare PUBLIC ACL raw, ruolo inherited/member e default privileges; GRANT in migration iniziale da solo non restringe PUBLIC. Quarantena attesa service_role SELECT only e client deny; CRUD non va provato sui dati produzione.

### P7 — external topology / quarantena

~~~sql
-- Solo se table esiste:
SELECT count(*) AS historical_registrations FROM public.registrazioni_calcolo_fondo;
SELECT t.tgname,t.tgenabled,pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t WHERE t.tgrelid=to_regclass('public.registrazioni_calcolo_fondo')
 AND NOT t.tgisinternal ORDER BY t.tgname;
SELECT has_table_privilege('service_role','public.registrazioni_calcolo_fondo','SELECT') AS can_read,
 has_table_privilege('service_role','public.registrazioni_calcolo_fondo','INSERT') AS can_insert,
 has_table_privilege('service_role','public.registrazioni_calcolo_fondo','UPDATE') AS can_update,
 has_table_privilege('service_role','public.registrazioni_calcolo_fondo','DELETE') AS can_delete,
 has_table_privilege('service_role','public.registrazioni_calcolo_fondo','TRUNCATE') AS can_truncate;
~~~

Se tabella/Make mancano, ALTER DISABLE fallira: STOP prima push; non cancellare la migration o crearne dipendenze inventate. Verificare function hook/extension/bucket/integration referenziata da Make, expected disable, no outbound runtime durante apply. Nessun contatto esterno effettuato ora.

## 15. Backup / restore prerequisites

PRODUCTION_BACKUP_REQUIRED = YES. Prima di qualunque apply:
1. backup gestito/PITR disponibile e verificato se piano Supabase lo consente, con copertura/retention documentata;
2. dump logico indipendente, protetto, fuori repository, inclusi schema/ACL/functions/policies e dati critici consentiti;
3. timestamp UTC e ambiente/punto di consistenza di entrambi;
4. restore realmente verificabile/rehearsal su ambiente isolato, inclusi Auth e Storage coverage/limiti;
5. snapshot PRE counts, distributions, role/owner/CLOSED fingerprints e history/source definitions.

Un “backup disponibile” non e prova di restore. Nessun backup/dump creato ora, nessuna chiave utilizzata. I dump gia locali sono sensibili e fuori fileset.

## 16. Staging-first plan

~~~text
LOCAL VERIFIED STATE
→ GITHUB RELEASE CANDIDATE
→ STAGING DATABASE ALIGNMENT
→ STAGING APPLICATION TEST
→ PRODUCTION BACKUP
→ PRODUCTION DB ALIGNMENT
→ EDGE FUNCTIONS (Auth triplet)
→ FRONTEND
→ POST-DEPLOY VERIFICATION
~~~

In staging DB first include anche verifiche Auth source prima dell'Edge e test applicativi. Usa copia sanitized o fixture autorizzata rappresentativa; non seed produzione. Ricostruire foundation/schema/history senza usare SQL distruttivi esclusi come shortcut; verificare external topology/quarantena. Colonne/schema e ACL reali da catturare per rehearsal byte-exact SQL selezionati.

## 17. Future migration-list gate

Solo in FUTURA sessione autorizzata e da checkout RC pulito:

~~~text
supabase migration list --linked
~~~

Primo comando CLI con contatto DB futuro; environment identification e autorizzazione separati. Non eseguito. Confrontare exact versions/names/payload disponibile e le 19 migration della RC, non 28 di questo dirty checkout. Una lista allineata non certifica functions/policies/data: P0-P7 restano necessari.

## 18. Future db-push dry-run gate

Dopo migration list, inspection/prechecks e resolution autorizzata di ogni mismatch:

~~~text
supabase db push --dry-run
~~~

Non eseguito. Output deve elencare solo pending forward migrations approvate; se compare init/reset/seed/account promotion o placeholder escluso, STOP. Conservare piano, versioni, SHA e ordine selezionato per approvazione finale apply; dry-run non certifica assenza di loss o vincoli su righe esistenti. Nessun db push reale autorizzato da questo report.

## 19. Migration-history divergence policy

LOCAL/REMOTE DIVERGE → STOP prima di qualunque migration repair.
Nessun repair autorizzato automaticamente; non inventare applied status o history versions, non rinominare file e non riscrivere SQL gia applicati per far coincidere liste. Ricostruire actual DDL/payload ed evidence, poi proporre in una nuova fase la correzione minima tracciata e approvabile. Baseline placeholder e history non riproducibile da sole richiedono questo gate.

## 20. Production maintenance strategy

Forward-only, dati correnti preservati. Prima decidere finestra/restrizione writer in funzione della pending set e lock duration. Se chain ownership/closure manca, manutenzione per closure e writer finche installate final RPC + trigger + ACL; niente esposizione degli intermedi permissivi o buggy. Backfill ownership puo toccare molte righe/locks: counts/time rehearsal e traffic plan necessari. Index/constraint/FK su preesistenti richiedono validazione e impatto locks. Auth role_source da sola e function replacement breve, ma non assumere zero race durante Auth eventi; test staging e sequenza per source/Edge.

Non mass-update payload, non disable RLS/trigger per superare errori, non cleanup CLOSED come operazione automatica. Stabilire stop thresholds: missing prerequisite, row-count/fingerprint drift inatteso, owner/role change non previsto, error constraints, grants insufficiente, deny cross-owner errato → fermare rollout e preservare evidence.

## 21. Production apply order

Il pending set reale e UNKNOWN. Sequenza condizionata, non “applica tutti”:
1. backup/PRE/history/dry-run autorizzati e verifica RC SHA;
2. prerequisiti gia presenti/aligned; se foundation manca, STOP per nuovo piano reviewed non distruttivo;
3. pending tracked history approvata in ordine timestamp (RAG/knowledge/communication/editorial/drafts se realmente missing e autorizzate);
4. ownership canonical helpers/backfill controllato, poi chain trigger/RPC/grants fino FOUND;
5. CLOSED restrictive boundary + exact ACL; postcheck no rewrite;
6. quarantena solo con table/Make/topologia verificati e nessun drift;
7. profile role_source 20261002, role fingerprint e source/event checks;
8. application runtime rollout solo dopo DB postchecks.

Se history dice gia applied, non riapplicare. Anche migration CREATE OR REPLACE puo avere CREATE POLICY/TRIGGER non idempotenti in altri file. Nessun reset/seed/drop-and-recreate.

## 22. Edge deployment order

Dopo DB/Auth canonical verification e backup: create-user, update-password, delete-user come un'unica unit source reviewed. Ordine interno preferito create-user → update-password → delete-user; tutti devono passare prima di abilitare flussi admin frontend. Non deploy automatico di sync-users/chat/RAG fuori delta Auth. Verify secrets by names/access availability in authorized environment, never in repo.

Runtime staging: forged raw metadata non authorize; verified JWT identity; canonical ADMIN pass, USER/GUEST/NULL/missing/error denied; create profile GUEST; update password non cambia existing role; delete solo disposable records dopo FK/CLOSED plan. Staging live validation richiesta; produzione verifiche non distruttive su Auth boundary.

## 23. Frontend deployment order

Ultimo dopo DB/Edge. Richiede flag remote drafts consapevole e schema/policies adeguate se attivo; non attivare per inferenza. Nessun package bump/build/deploy eseguito. Verificare fetch profile, entity/year OPEN/CLOSED, no contamination, canonical calculation/documents e transfer. Source tests verdi non coprono deployment config/cache/session refresh.

## 24. Post-deploy verification

Ripetere P0-P7 adattati, confrontare pre/post counts e fingerprints. Special migrations apply: ruoli e righe/fund CLOSED byte-equivalent attesi; ownership UPDATE solo mismatch autorizzati, niente economic JSON changes. Verify live function/triggers/policies/ACL signatures and migration history match selected SHA/evidence.

Staging application: owner/admin foreign-owner, guest denial, create/update/delete lifecycle FK, OPEN write, CLOSED no UPDATE/INSERT/DELETE, closure idempotenza/retry/conflict e N+1 conservative, reports consult/export CLOSED, remote drafts flag. Negative mutation tests su fixture staging autorizzata, non su record produzione. Produzione read-only smoke e auth/session inspection; nessuna mutation di dati critici per “verificare” backup.

## 25. Rollback strategy

Preferire stop rollout + forward corrective reviewed migration. Revert Git non cambia DB. Revert app/Edge soltanto con matrice compatibilita nuova DB/payload e senza riaprire canonical-role/immutability vulnerabilities. Prima apply acquisire function/trigger/policy/ACL definitions e roles/hash PRE.

No “down” distruttiva, no automatic reopening CLOSED o cancellazione N+1. Se loss reale: incident approval e restore da backup verificato con valutazione writes post-backup; restore non azione automatica del release plan. DDL function source e spesso reversibile tecnicamente, ma security downgrade e runtime effects non sono safe independently. Code/types commit app tenuto insieme per rollback consistente, ancora soggetto a compatibilita dati.

## 26. Explicit forbidden operations

~~~text
PRODUCTION_DB_RESET_ALLOWED = NO
PRODUCTION_SEED_ALLOWED = NO
DROP_AND_RECREATE_STRATEGY = FORBIDDEN
PRODUCTION_BACKUP_REQUIRED = YES
STAGING_FIRST_REQUIRED = YES
CURRENT_PRODUCTION_DATA + FORWARD-ONLY REVIEWED MIGRATIONS = ALIGNED_PRODUCTION
~~~

In questo task vietati/esecuiti NO: supabase link/db push/db reset/migration repair/db pull/functions deploy, SQL Editor remoto, psql remoto, staging/production access, DB password/service role use. Vietati commit/push/PR/deploy/cleanup. I comandi futuri migration list e dry-run sono solo testo del piano; non autorizzazione implicita.

## 27. Residual post-ASTRA DB debts

- AUTH_PROFILE_ROLE_PENDING_GATE: APPLY_PENDING/LIVE_FIX_NOT_VERIFIED, source SQL presente, nessuna chiusura live.
- AUTH_EDGE_DEPLOYMENT_AND_RUNTIME_VALIDATION: SOURCE_FIXED triplet; deployed/live state NOT_QUERIED.
- ARCH-PERSIST-01: multiwriter/CAS su OPEN fuori scope; row lock closure non risolve writer generico.
- AUTH_PROFILE_LOGIN_TIMESTAMP_SIDE_EFFECT: updated_at profile su eventi Auth ancora da qualificare.
- Cleanup/delete FK/CLOSED: uploaded_by NO ACTION, entity/state FK e closed cleanup flag/is_admin; failure live non affermata.
- Migration/history reproducibility: bootstrap locale escluso, placeholder non source authority, registrazioni/Make e RPC match_documents non ricreati dalla history tracked.
- RGS_SCHEMA_UNVERIFIED e TABELLA15_OUTPUT_MODE: gate documentali annuali/qualificazione output non chiusi dal DB alignment.
- Cinque famiglie accessibility debt del closure sono separate dal DB plan; nessuna remediation avviata.

## 28. Next gate

NEXT_GATE = POST_ASTRA_CONSOLIDATION_EXECUTION_PLAN. Verificare fileset e commit proposal prima di execution, e autorizzare separatamente eventuali sessioni staging/production. STOP. Nessun remote status inventato, nessun prodotto modificato.

## Appendix — local version binding

CURRENT_HEAD=d3170f959b5815c514dbf3d6e5f93366a5f14c67; ORIGIN_MAIN_HEAD=70d533a46a9fb1e11c822530beb5faa6f6bd80d6. Tutti i 28 SHA nella sezione3 sono fonte locale PRE. Version package 1.3.0 invariata. Report locale e manifest release specificano ogni file e membership della release; non usare l'inventory intera come apply allowlist.
