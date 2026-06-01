# Documentazione Tecnica: Accesso Preview Wizard Istruttorio 2026

Questo documento illustra l'architettura tecnica e le modalità operative introdotte per rendere accessibile il nuovo **Wizard Istruttorio 2026** in modalità puramente sperimentale e isolata, in conformità alla **Regola Fondamentale di Transizione**.

---

## 1. Obiettivi e Scelte Architetturali

> **Nota di aggiornamento:** A seguito dell'approvazione della modifica utente MOD-001, il nome pubblico dell'interfaccia utente è stato variato in **"Raccolta dati dell'Ente"** e la grafica adeguata all'identità FP CGIL Lombardia (#cc4331), fermo restando il riferimento tecnico interno al modulo `wizard2026`.

La sfida principale consisteva nell'abilitare la sperimentazione e il collaudo utente del nuovo quadro normativo (CCNL 23.02.2026 e D.L. 25/2025) senza minimamente intaccare o disattivare le funzionalità correnti del software in produzione. Per questo motivo, l'accesso è regolato da una combinazione di **feature flag** e **routing virtuale isolato**.

### Il Feature Flag
È stato creato il file dedicato `src/features/wizard2026/featureFlag.ts` che espone la costante booleana `ENABLE_WIZARD_2026_PREVIEW` attraverso l'ispezione della variabile d'ambiente `VITE_ENABLE_WIZARD_2026_PREVIEW`.
L'infrastruttura è stata dotata dell'oggetto `featureFlags` per consentire ai framework di test unitari (Vitest) di eseguire lo *spionaggio dinamico* (mocking) ed esaminare tutti gli stati condizionali dell'interfaccia in esecuzione.

### Sincronizzazione Route e Tabbed Routing
Il sistema preesistente di `entilocaliapp` non adotta un URL router esterno (es. `react-router-dom`), bensì un motore interno basato sui concetti di `NavigationScope` e `activeTab` all'interno dello store globale (`AppContext`).
In `src/App.tsx`, è stato introdotto un elegante meccanismo di sincronizzazione e intercettazione:
- Qualora l'utente acceda tramite URL diretto `/wizard-2026-preview`, l'applicazione dispatcia in modo reattivo il posizionamento sulla tab `wizard2026Preview`.
- Qualora l'utente acceda dal menu laterale o dalle card di dashboard, l'URL del browser viene automaticamente allineato tramite `window.history.replaceState`.
- Se il feature flag in `.env` è impostato su `false`, il componente wrapper `Wizard2026PreviewWrapper.tsx` intercetta l'accesso e renderizza una modale di blocco invalicabile con l'avviso *"Wizard 2026 preview non abilitato in questo ambiente."*

---

## 2. Elenco dei File Modificati e Creati

### File Modificati
- `src/App.tsx`: Integrazione dell'intercettore di URL `/wizard-2026-preview` e della sincronizzazione `window.history`.
- `src/application/registry/moduleRegistry.ts`: Registrazione del modulo `wizard2026Preview` contrassegnato con lo status *"Preview sperimentale"* e protetto dalla regola condizionale in `getModuleAccessInfo`.
- `src/components/layout/Sidebar.tsx`: Aggiunta dell'icona `science` (provette da laboratorio) alla voce di menu per enfatizzare la natura sperimentale della sezione.
- `src/features/wizard2026/index.ts` & `components/index.ts`: Esposizione del nuovo wrapper di sicurezza e del modulo di feature flag.
- `src/features/wizard2026/components/Wizard2026Layout.tsx`: Normalizzazione e perfezionamento del banner di sicurezza viola in conformità alle direttive.
- `src/features/wizard2026/components/__tests__/Wizard2026PreviewPage.test.tsx`: Allineamento delle asserzioni di test al nuovo testo del banner.
- `.env` & `.env.example`: Inserimento della variabile di configurazione `VITE_ENABLE_WIZARD_2026_PREVIEW` (impostata su `true` in locale e `false` nel template di esempio).

### File Creati
- `src/features/wizard2026/featureFlag.ts`: Contenitore della logica e dell'oggetto di feature flag.
- `src/features/wizard2026/components/Wizard2026PreviewWrapper.tsx`: Componente React guardiano che orchestra l'accesso condizionale o il blocco.
- `src/features/wizard2026/components/__tests__/Wizard2026PreviewWrapper.test.tsx`: Suite di test unitari a copertura totale per verificare le variazioni di render a seconda dello stato del flag.
- `docs/refactoring/collaudo-preview-wizard-2026.md`: La checklist di collaudo in 26 punti.
- `docs/refactoring/accesso-preview-wizard-2026.md`: Il presente documento di specifica tecnica.

---

## 3. Gestione e Operatività del Feature Flag

Per abilitare o disabilitare l'accesso alla rotta in qualsiasi ambiente:
1. Modificare il file `.env` (o le impostazioni d'ambiente della piattaforma di hosting cloud):
   ```env
   # Abilita il wizard in preview
   VITE_ENABLE_WIZARD_2026_PREVIEW=true

   # Disabilita completamente il wizard in preview
   VITE_ENABLE_WIZARD_2026_PREVIEW=false
   ```
2. Riavviare il server di sviluppo in locale o rieseguire la build di produzione.
3. Con il flag impostato su `false`, la card sulla dashboard scompare, il link in sidebar non viene renderizzato e qualsiasi tentativo di accesso diretto all'URL viene bloccato.

---

## 4. Perché il Vecchio Wizard e la Costituzione Fondo Restano Invariati

Il mantenimento dell'assoluta stabilità del sistema legacy è un requisito giuridico e contabile imprescindibile per gli enti in fase di rendicontazione:
- **Il vecchio wizard** (`DataEntryPage.tsx`) continua a operare immutato, registrando e calcolando i fondi secondo le disposizioni vigenti al 2024/2025.
- **La pagina Costituzione Fondo** legge esclusivamente dallo store canonico `fundData` e dall'infrastruttura `fundEngine.ts`.
- **Nessuna mutazione di stato:** Il nuovo wizard preview possiede un proprio state container isolato gestito dall'hook `useWizard2026Draft()`. Il pulsante finale di riversamento in `Step8RiepilogoPreview` e `Wizard2026SummaryPanel` è staticamente disabilitato e riporta la dicitura *"Trasferimento non ancora attivo"*. In questo modo si azzera la possibilità di inquinamento accidentale o sovrascrittura indesiderata di dati in produzione.

---

## 5. Roadmap e Prossimi Passi verso il Trasferimento Reale

Prima di procedere alla transizione definitiva in produzione e sostituire le schermate legacy, dovranno essere completati i seguenti passaggi:
1. **Collaudo Normativo sul Campo:** Test pratico da parte dei funzionari finanziari e dei revisori contabili utilizzando la rotta sperimentale su dati reali di simulazione 2026.
2. **Sviluppo dell'Adapter di Trasferimento (Reidratazione):** Implementazione della funzione di dispatch reale che convertirà le entità del `Wizard2026DraftState` nella struttura dati canonica `FundData` (sfruttando le regole già definite in `mappingPreview.ts`).
3. **Integrazione del Database:** Abilitazione del salvataggio su Supabase e del ripristino delle bozze per il nuovo anno contrattuale 2026.
4. **Rimozione del Feature Flag:** Quando il committente delibererà il passaggio definitivo al nuovo contratto, il flag verrà eliminato, la rotta `/wizard-2026-preview` diventerà l'istruttoria standard per tutte le annualità $\ge 2026$, e il vecchio wizard rimarrà accessibile in modalità sola lettura per la consultazione storica degli esercizi antecedenti.
