# Lettera Richiesta Dati — Raccolta dati dell'Ente (Preview 2026)
> [!NOTE]
> Questa documentazione fa parte del piano di verifica e validazione delle modifiche richieste dall'utente (**MOD-003**).

La funzione **Lettera Richiesta Dati** consente ai delegati sindacali di generare una nota formale di richiesta informazioni indirizzata ai diversi uffici dell'Ente (Personale, Ragioneria, o Entrambi). La richiesta viene formulata basandosi sui dati effettivamente mancanti o che presentano anomalie/incoerenze nello stato dell'istruttoria corrente.

---

## 1. Architettura del Modulo Lettere

Tutto il codice del modulo è isolato e indipendente dal sistema di lettere legacy:
*   **Tipi e Catalogazione**:
    *   `src/features/wizard2026/letters/wizard2026LetterTypes.ts` (Definizione di contesti, modalità, stati del catalogo).
    *   `src/features/wizard2026/letters/wizard2026LetterCatalog.ts` (Mappatura esaustiva dei 30+ campi distribuiti nei 7 step istruttori con relativi riferimenti normativi e uffici competenti).
*   **Motore e Logiche**:
    *   `src/features/wizard2026/letters/buildWizard2026LetterContext.ts` (Costruzione del contesto con risoluzione dello stato di ciascun campo).
    *   `src/features/wizard2026/letters/generateWizard2026DataRequestMarkdown.ts` (Rendering in testo formattato Markdown).
    *   `src/features/wizard2026/letters/generateWizard2026DataRequestPdf.ts` (Generazione PDF client-side con `jsPDF` con colori istituzionali).
*   **Interfaccia Utente (UI)**:
    *   `Wizard2026DataRequestPanel.tsx` (Pannello compatto in ogni step, collassato in accordion su tablet/mobile).
    *   `Wizard2026DataRequestModal.tsx` (Modale di configurazione e visualizzazione live dell'anteprima).
    *   `Wizard2026DataRequestPreview.tsx` e `Wizard2026DataRequestActions.tsx` (Azioni di copia e download PDF).

---

## 2. Regole di Stato e Applicabilità dei Dati

### 2.1 Determinazione dello Stato del Dato
La determinazione dello stato di presenza dei dati istruttori risponde a regole precise per evitare falsi positivi:
1.  **PRESENTE**:
    *   Qualsiasi stringa non vuota.
    *   Qualsiasi valore numerico, **incluso lo `0` (zero)**.
    *   Qualsiasi valore booleano, **incluso `false`**.
2.  **MANCANTE**:
    *   Valori `undefined` o `null`.
    *   Stringa vuota (`""`).
    *   Valore numerico pari a `NaN`.
3.  **DA_VERIFICARE**:
    *   Il dato è valorizzato (quindi presente) ma nello stato locale dello step corrispondente è presente un avviso di anomalia (`Warning` o `Error`) che cita direttamente quel campo.
4.  **NON_APPLICABILE**:
    *   La condizione `includeWhen` associata al campo restituisce `false` in base alla tipologia di Ente locale configurata nello Step 1.

### 2.2 Condizionamento D.L. 25/2025 per Tipologia Ente
*   **Comuni / Province / Regioni / Città Metropolitane** (`DIRECTLY_APPLICABLE`):
    *   Vengono richiesti: stipendi tabellari 2023, fondo stabile 2025 certificato, budget EQ 2025 e incremento applicato.
*   **Unioni di Comuni / Comunità Montane** (`TRANSFER_ONLY`):
    *   Vengono richiesti: quota trasferita dai Comuni aderenti, atti dei Comuni aderenti presenti, riduzione permanente dei fondi comunali certificata e parere favorevole dei revisori dei Comuni.
*   **Camere di Commercio / Enti Regionali ed altri** (`NOT_APPLICABLE`):
    *   Le sezioni relative al D.L. 25/2025 vengono marcate come **NON_APPLICABILE** e omesse dalla lettera.

### 2.3 Richiesta Estremi COSFEL per Enti Deficitari
*   **Ente in stato di deficitarietà strutturale** (`isStrutturalmenteDeficitario` impostato su `true`):
    *   Viene inclusa condizionatamente la richiesta degli **estremi della delibera di approvazione/autorizzazione COSFEL**, della documentazione a supporto, dell'elenco degli incrementi del fondo autorizzati e del parere dell'organo di revisione contabile.
    *   Se il flag `hasApprovazioneCosfel` è `undefined` o mancante, viene marcato come **MANCANTE [DA TRASMETTERE]** con priorità elevata, in quanto bloccante per la validazione del fondo.


---

## 3. Esito del Collaudo e Verifica

### 3.1 Test Automatici
La stabilità del modulo è validata tramite la suite di test unitari `wizard2026Letters.test.tsx` situata in `src/features/wizard2026/letters/__tests__/`.

I test verificano:
*   [x] La corretta inclusione dei dati presenti e zeri/booleani false come `PRESENTE`.
*   [x] La corretta marcatura come `MANCANTE` di valori nulli/undefined.
*   [x] L'omissione/stato `NON_APPLICABILE` dei campi D.L. 25/2025 per enti esclusi.
*   [x] La transizione a `DA_VERIFICARE` in caso di avvisi/errori associati al campo.
*   [x] La generazione corretta del Markdown con layout formale FP CGIL Lombardia.
*   [x] Il corretto montaggio dell'accordion responsive e delle modali interattive.

Tutti i **169 test unitari globali** e la **build di produzione** completano con successo (codice di uscita 0).
