# Checklist Manuale di Collaudo — Preview Wizard Istruttorio 2026

Questo documento descrive la procedura di collaudo manuale end-to-end per verificare l'accessibilità condizionale, il corretto isolamento dal sistema di produzione e la precisione algoritmica del nuovo Wizard Istruttorio 2026 in modalità preview sperimentale.

## Ambito della Verifica
La verifica assicura che:
- La modalità preview sia accessibile esclusivamente con l'apposito feature flag abilitato.
- I dati inseriti nella preview non abbiano alcun impatto sui calcoli legacy, sullo stato persistente in Supabase/localStorage o sulla sezione canonica "Costituzione Fondo".
- Le regole di calcolo CCNL 2026 e D.L. 25/2025 siano correttamente applicate e verificate.

---

## Elenco dei Controlli (Checklist)

- [x] **1. Avvio app con flag disattivo:** Configurare `VITE_ENABLE_WIZARD_2026_PREVIEW=false` in `.env`. Caricare l'applicazione.
- [x] **2. Verifica vecchio wizard e Costituzione Fondo:** Verificare che l'accesso a "Configurazione Fondo" (DataEntryPage) e "Fondo Personale" continui a funzionare regolarmente con le logiche legacy e senza alterazioni.
- [x] **3. Verifica blocco rotta sperimentale:** Accedere all'indirizzo diretto `/wizard-2026-preview`. Verificare la comparsa della pagina di blocco con messaggio *"Wizard 2026 preview non abilitato in questo ambiente."*
- [x] **4. Avvio app con flag attivo:** Configurare `VITE_ENABLE_WIZARD_2026_PREVIEW=true` in `.env`.
- [x] **5. Accesso alla rotta preview:** Aprire `/wizard-2026-preview` (o selezionare il modulo "Preview 2026" dal menu laterale).
- [x] **6. Verifica banner di sicurezza:** Constatare la presenza in testa alla pagina dell'avviso evidente: *"Modalità preview sperimentale. I dati inseriti non modificano il vecchio wizard, non aggiornano la Costituzione Fondo e non vengono salvati."*
- [x] **7. Compilazione Step 1 (Ente):** Verificare l'inserimento della popolazione residente, del numero dipendenti e dei parametri contabili pluriennali.
- [x] **8. Verifica classificazione D.L. 25 per Comune:** Selezionare "Comune" e accertare l'applicazione della tabella di calcolo per fasce di popolazione.
- [x] **9. Verifica classificazione D.L. 25 per Unione di Comuni:** Selezionare "Unione dei Comuni" e verificare l'applicazione dei criteri specifici di aggregazione demografica.
- [x] **10. Verifica classificazione D.L. 25 per Camera di Commercio:** Selezionare "Camera di Commercio" (o ente di altra tipologia) e accertare la corretta determinazione del parametro e/o disabilitazione di fasce demografiche non pertinenti.
- [x] **11. Compilazione Step 2 (Art. 23 Limite 2016):** Inserire le voci storiche del 2016 (fondo base, RIA, progressioni storiche).
- [x] **12. Verifica margine/superamento:** Constatare il calcolo in tempo reale del margine disponibile o la comparsa dell'anomalia in caso di superamento del tetto ricostruito.
- [x] **13. Compilazione Step 3 (D.L. 25 Incremento):** Inserire la spesa di personale e il monte salari 2018.
- [x] **14. Verifica soglia 48%:** Constatare la limitazione automatica o l'allerta in caso di rapporto spesa personale / entrate correnti superiore alla soglia di legge del 48%.
- [x] **15. Compilazione Step 4 (CCNL 2026 Aumenti):** Inserire il monte salari 2021.
- [x] **16. Verifica 0,14% e 0,22%:** Controllare il calcolo esatto della quota stabile (0,14% = MS × 0.0014) e della quota variabile facoltativa (fino allo 0,22%).
- [x] **17. Compilazione Step 5 (Conglobamento Art. 60):** Inserire il numero di FTE per area (Funzionari/EQ, Istruttori, Operatori esperti, Operatori).
- [x] **18. Verifica calcolo decurtazione:** Accertare la correttezza algoritmica applicando i valori annui su 12 mensilità: $435,96 \times 0.75 + 330,24 \times 0.80 = 326.97 + 264.192 = 591,162$ (arrotondato a € 591,16).
- [x] **19. Compilazione Step 6 (Straordinario con dirigenza):** Verificare l'opzione di decurtazione da fondo o la capienza sul margine Art. 23.
- [x] **20. Compilazione Step 6 (Straordinario senza dirigenza):** Accertare il corretto adeguamento dei limiti per enti privi di personale dirigente.
- [x] **21. Compilazione Step 7 (Deroghe PNRR):** Verificare l'inclusione di personale in deroga con asseverazione dell'equilibrio pluriennale di bilancio.
- [x] **22. Verifica Riepilogo Preview (Step 8):** Accedere alla schermata riepilogativa e constatare la quadratura del totale fondo costituito in anteprima.
- [x] **23. Verifica Mapping Preview:** Esplorare la sezione "Mapping Preview" nel cruscotto laterale e accertare l'assenza di errori di puntamento verso i campi legacy.
- [x] **24. Verifica non trasferimento dati:** Ricaricare l'app o spostarsi su "Configurazione Fondo" e "Fondo Personale" per confermare in modo inequivocabile che nessun dato inserito nella preview sia stato travasato o registrato.
- [x] **25. Verifica funzionamento vecchio wizard:** Eseguire una modifica sul vecchio wizard e verificare il corretto salvataggio e aggiornamento dei totali nella UI.
- [x] **26. Verifica build e test verdi:** Eseguire `npm run test` e `npm run build` accertando il superamento completo e pulito di tutte le suite di test e di compilazione.

---

## Conclusione e Visto di Conformità
Il collaudo conferma che la rotta sperimentale `/wizard-2026-preview` rispetta fedelmente la **Regola Fondamentale di Transizione**, operando in una sandbox completely isolata che protegge l'integrità operativa dell'applicazione in uso.
