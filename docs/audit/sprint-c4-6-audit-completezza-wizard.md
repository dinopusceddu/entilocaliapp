# Sprint C.4.6 — Audit di Completezza Wizard Dati Generali

## Matrice di Completezza

La seguente tabella confronta l'esigenza normativa/tecnica con lo stato attuale del Wizard Dati Generali (sviluppato fino allo Sprint C.4.5), la vecchia maschera tecnica e le interfacce di Import (CSV/Excel).

| Area dato | Campo richiesto | Fonte normativa/tecnica | Presente nel wizard attuale | Presente nella vecchia maschera | Presente nel CSV | Presente nell’Excel allegato | Azione richiesta |
|---|---|---|---|---|---|---|---|
| **1. Identificativi** | Denominazione, Anno, Tipologia, Abitanti, Dirigenza | Base Costituzione | Sì (Step 1) | Sì | Sì | Sì | Nessuna. |
| **2. Condizioni Finanz.** | Ente dissestato, Deficitario, Piano riequilibrio | Vincoli Finanziari | **No** | Sì | **No** | Sì | Aggiungere nello Step 2 (Dati Ente). Aggiornare CSV. |
| **3. Fondi Storici 2016** | Fondo dip, EQ, dirigenza, segretario, straordinario, limite manuale | Art. 23, c. 2, D.Lgs. 75/2017 | Sì (ma parziale) | Sì | Sì (solo alcuni) | Sì | Completare Step 3 aggiungendo Dirigenza (condizionata), Segretario, Straordinario e Override manuale. Aggiornare CSV. |
| **4. Personale 2018** | Personale 2018 (FTE, Teste, aggregato/analitico) | Art. 33 D.L. 34/2019 e Art. 23 | Sì (solo manualDipendentiEquivalenti2018) | Sì | Sì (solo FTE) | Sì | Rifondare Step 4 per gestire inserimento aggregato/analitico e distinzione categorie. |
| **5. Personale Anno Rif.**| Personale attuale (FTE, Teste, aggregato/analitico) | Art. 33 e Art. 23 | Sì (Step 7 base) | Sì | **No** | Sì | Integrare in Step 4 assieme al 2018 per permettere calcoli pro-capite completi. |
| **6. Calcolo Art. 23** | Riepilogo limite 2016, adeguamento pro-capite, voci escluse | Art. 23, c. 2 | **No** | Sì | N/A | Sì | Creare Step 5 dedicato al calcolo del limite (figurativo e netto) e warning. |
| **7. Incr. DL 25/2025** | Tetto 48%, importo teorico e applicato, dati base | D.L. 25/2025 | Sì (Step 5 attuale) | Sì | Sì | Sì | Spostare in Step 6, aggiungere distinzione tra teorico calcolato e importo applicato. |
| **8. Modifiche CCNL 2026**| Base calcolo (MS2021) | CCNL 23.02.2026 | Sì (Step 6 attuale) | Sì | Sì | Sì | Incorporare nello Step 7 (CCNL). |
| **9. Incremento 0,14%** | Importo automatico e applicato | CCNL 23.02.2026 | Sì (Step 5 attuale) | Sì | N/A | Sì | Spostare logica 0,14% nello Step 7 insieme agli altri incrementi contrattuali. |
| **10. Incremento 0,22%**| Permanente e Una Tantum, massimali e applicati | CCNL 23.02.2026 | Sì | Sì | N/A | Sì | Perfezionare in Step 7 aggiungendo warning sui massimali (0,22% MS2021). |
| **11. Conglobamento** | Tabella C x 12 x FTE, senza 13^, per area | Art. 60 CCNL 2026 | Sì (Step 7 attuale) | Sì | N/A | Sì | Mantenere in Step 7, consentire inserimento aggregato per area (invece di "area prevalente"). |
| **12. Lavoro Straord.** | Incremento fondo lavoro straordinario nuova disciplina | CCNL 2026 / Storico | **No** | Sì | **No** | Sì | Aggiungere a Step 7 (o sezione apposita) e raccogliere dati 2016 straordinario in Step 3. |
| **13. PNRR (DL 13/2023)**| Incremento risorse art. 8 c. 3 (max 5% limite 2016) | D.L. 13/2023, art. 8 c.3 | **No** | Sì | **No** | Sì | Creare Step 8 dedicato ai dati PNRR (importo potenziale vs applicato). |
| **14. Modalità Distrib.**| Abilitare moduli di distribuzione (`isDistributionMode`) | Logica Applicativa | **No** | Sì | **No** | N/A | Aggiungere in Step 2 per mostrare/nascondere la Distribution View in futuro. |
| **15. Regole Disattivaz.**| Disattivazione moduli per Unioni o Enti Dissestati | Logica Applicativa | **No** | Sì | N/A | N/A | Implementare regole cross-step (es. Unioni no DL25, no dirigenza no step dirigenza). |
| **16. Lettera Richiesta**| Generatore PDF Lettera Dati | Organizzazione | Presente ma Incompleta | Presente | N/A | N/A | Aggiornare `requestDataLetterPdfService.ts` con tutte le nuove sezioni introdotte. |
| **17. CSV Template** | Colonne del CSV | Import | Presente ma Incompleto | Presente | Sì | N/A | Aggiungere Condizioni Finanziarie, Straordinario, PNRR, Personale Analitico. |
| **18. Import CSV** | Mapper per la lettura CSV | Import | Presente ma Incompleto | Presente | Sì | N/A | Aggiornare `csvMapper.ts` e dizionario markdown. |
| **19. Salvataggio** | Trasferimento su Global State | Core | Sì (Step 10 attuale) | Sì | N/A | N/A | Adeguare payload `handleSaveDraft` nello Step 10 con i nuovi campi raccolti. |

## Conclusioni dell'Audit
Il Wizard attuale (C.4.5) è strutturato in modo eccellente a livello software (gestione locale `draftData`, navigazione, salvataggio isolato), ma omette concettualmente molte basi di dominio. Nello specifico, mancano intere sezioni per l'Art. 23 e il PNRR, e le condizioni di "dissesto" non sono interrogate, inficiando la precisione dei limiti applicativi.

Lo Sprint C.4.6 deve ristrutturare la navigazione in 10 nuovi Step sequenziali come richiesto, mappando in modo esaustivo il foglio di calcolo Excel e i requisiti di sistema, senza mai duplicare le schermate "analitiche" della Costituzione ma raccogliendo la *totalità dei macro-dati* che influenzano i calcoli di cap.
