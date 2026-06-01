# Documentazione Tecnica — MOD-022 — Trasferimento Controllato Wizard 2026 → Costituzione Fondo

Questo documento descrive il funzionamento del trasferimento controllato e reversibile dei dati contabili e istruttori raccolti all'interno del wizard **"Raccolta dati dell'Ente"** (Wizard 2026) alla pagina legacy **"Costituzione Fondo"**.

---

## 1. Dati Trasferiti vs Dati Non Trasferiti (Limiti Massimi)

Il trasferimento distingue rigorosamente tra risorse finanziarie effettive che alimentano la Costituzione Fondo e tetti/limiti normativi di controllo.

### A. Dati Trasferiti (Importi Effettivi e Parametri Istruttori)
Questi dati vengono applicati come valori reali nelle rispettive voci del fondo accessorio e EQ:
1. **Incremento stabile 0,14% Monte Salari 2021**
   - Campo destinazione: `st_art58c1_CCNL2026_incremento014_MS2021`
   - Allineamento parametro istruttorio: `annualData.ccnl2024.monteSalari2021`
2. **Arretrati 0,14% Monte Salari 2021** (Risorsa variabile una tantum)
   - Campo destinazione: `vn_art58_CCNL2026_arretrati2024_2025`
3. **Quota 0,22% destinata al Fondo risorse decentrate**
   - Campo destinazione: `vn_art58c2_incremento_max022_ms2021`
   - Allineamento parametro istruttorio: `annualData.ccnl2024.optionalIncreaseVariableFrom2026Percentage`
4. **Quota 0,22% destinata alle Elevate Qualificazioni (EQ)**
   - Campo destinazione: `va_incremento022_ms2021_eq`
5. **Riduzione stabile Fondo per conglobamento indennità di comparto (Art. 60)**
   - Campo destinazione: `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`
   - Allineamento parametro istruttorio: `annualData.ccnl2024.ivcConglobation`
6. **Riduzione stabile del fondo straordinario destinata alla parte stabile (Art. 79/67)**
   - Campo destinazione: `st_art79c1_art14c3_art67c2g_riduzioneStraordinario`
7. **Economie del fondo straordinario da riversare una tantum**
   - Campo destinazione: `vn_art15c1m_art67c3e_risparmiStraordinario`
8. **Fondo lavoro straordinario ordinario dell’anno** (soggetto Art. 23)
   - Campo destinazione: `annualData.fondoLavoroStraordinario`

### B. Dati Non Trasferiti (Solo Limiti Massimi e Controllo)
I seguenti valori calcolati dal wizard **non** alimentano in automatico le voci del fondo, in quanto l'ente deve definire l'importo effettivo in fase di Costituzione del Fondo (ad esempio sulla base di progetti o capacità finanziarie deliberate):
1. **D.L. 25/2025 (Teorico Stabile)**: Mostrato come limite massimo. L'importo effettivo viene inserito manualmente nella Costituzione Fondo.
2. **PNRR (Dipendenti e Dirigenti)**: Mostrato come limite massimo delle risorse escluse dal limite. L'importo effettivo dipende dai progetti reali.
3. **Limite Art. 23, comma 2 attualizzato**: Dato di controllo generale e non una risorsa finanziabile direttamente.

---

## 2. Gestione del Limite Art. 23

Il limite dell'Art. 23, comma 2, D.Lgs. 75/2017 viene trattato come segue:
- Ciascuna voce trasferita visualizza la propria classificazione rispetto al limite (Escluso dal limite, Soggetto al limite, Computo figurativo, Solo controllo).
- Il limite attualizzato calcolato nello Step 2 viene mostrato nella tabella delta per consentire un monitoraggio del margine di sicurezza residuo prima di compilare la Costituzione Fondo.

---

## 3. Gestione della Sicurezza: Snapshot e Rollback

Per garantire la massima reversibilità e sicurezza dei dati dell'utente, il trasferimento è protetto da un meccanismo di snapshot locale.

### Creazione dello Snapshot
Prima di applicare il nuovo stato `FundData` (derivante dall'applicazione del wizard 2026), viene creato un clone profondo (`structuredClone`) del `FundData` legacy attuale. Questo snapshot viene salvato in `sessionStorage` sotto la chiave `wizard2026_transfer_snapshot`.

### Messaggio e Rollback
Dopo il trasferimento, all'utente che viene reindirizzato alla pagina della Costituzione Fondo viene mostrato un banner informativo premium in cima alla pagina:
> **Trasferimento completato.** È stato creato uno snapshot di sicurezza dello stato precedente.
> `[Annulla trasferimento e ripristina dati precedenti]`

Facendo clic sul pulsante di rollback:
1. Lo snapshot viene ripristinato da `sessionStorage`.
2. Viene effettuato un dispatch di tipo `IMPORT_FUND_DATA` sul context globale per aggiornare lo stato con il valore precedente.
3. I flag temporanei di trasferimento vengono cancellati.
4. Viene salvato lo stato persistente e mostrato un messaggio di conferma del ripristino.

---

## 4. Gestione dei `useEffect` Legacy Rilevati

Durante l'audit tecnico è emerso che all'apertura della pagina `FondoAccessorioDipendentePage.tsx`, diversi `useEffect` sovrascrivono dinamicamente i dati importati. Per ovviare a questo problema, la funzione `applyWizard2026Transfer` allinea anche i seguenti parametri istruttori:
- `annualData.ccnl2024.monteSalari2021` (evita sovrascrittura dell'incremento 0,14% stabile).
- `annualData.ccnl2024.optionalIncreaseVariableFrom2026Percentage` (evita la sovrascrittura delle quote 0,22%).
- `annualData.ccnl2024.ivcConglobation` (evita la sovrascrittura del conglobamento Art. 60).

Questo garantisce che all'apertura del fondo, i calcoli automatici eseguiti dai `useEffect` legacy rimangano perfettamente sincronizzati con i valori trasferiti dal wizard.

---

## 5. Mantenimento dei Moduli Legacy

I vecchi wizard e i moduli legacy (tra cui `DataEntryPage.tsx` e i moduli di calcolo storici) **non vengono modificati o eliminati** in questa fase per garantire la massima continuità operativa ed evitare qualsiasi rischio di regressione del sistema di produzione.
