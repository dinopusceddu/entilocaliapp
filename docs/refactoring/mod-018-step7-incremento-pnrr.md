# Documentazione Tecnica — MOD-018 — Revisione Step 7 "Incremento PNRR" (Art. 8, comma 3, D.L. 13/2023)

Questo documento descrive il refactoring dello Step 7 del wizard "Raccolta dati dell'Ente", dedicato all'istituto del PNRR. Lo step è stato trasformato da una schermata di inserimento dell'incremento effettivo ad una **pagina istruttoria** finalizzata a determinare il **limite massimo teorico PNRR attivabile** per il Fondo dipendenti e l'eventuale Fondo dirigenza.

---

## 1. Obiettivo e Scopo Istruttorio

Nello spirito del wizard di raccolta dati, l'utente non deve decidere in questa fase l'incremento effettivo da applicare a bilancio, operazione delegata alla successiva fase di "Costituzione Fondo". L'obiettivo dello Step 7 è raccogliere le basi di calcolo del 2016 e verificare la checklist dei requisiti normativi per attestare la capacità massima teorica dell'ente (5% delle basi stabili 2016).

I risultati mostrati comprendono:
- **Limite massimo PNRR fondo dipendenti**: 5% della componente stabile del fondo dipendenti 2016.
- **Limite massimo PNRR fondo dirigenza**: 5% della componente stabile del fondo dirigenza 2016 (se l'ente ha la dirigenza abilitata nello Step 1).
- **Totale limite massimo PNRR**: somma dei due massimali (solo per fini conoscitivi).
- **Esclusione dal limite**: indicazione chiara che si tratta di risorse escluse dal tetto del salario accessorio previsto dall'Art. 23, comma 2, D.Lgs. 75/2017.

---

## 2. Regole di Applicabilità e Validabilità

### 2.1. Controllo Preliminare di Applicabilità
L'applicabilità dello step è subordinata a due condizioni:
1. **Anno di riferimento**: deve essere compreso nel periodo di vigenza della norma (2023–2026).
2. **Soggettività PNRR** (`soggettoAttuatorePnrr`): l'ente deve attestare di essere soggetto attuatore o titolare di interventi o progetti PNRR nell'anno selezionato.
   - **Se "No"**: lo step viene marcato come **"non applicabile"** e i relativi limiti massimi sono azzerati.
   - **Se non espresso (mancante)**: lo step genera un warning istruttorio (`PNRR-MISSING-SOGGETTO-ATTUATORE`) e il risultato complessivo dello step è marcato come **"n/d / istruttoria non validabile"**.

### 2.2. Validabilità dei Dati
Lo step risulta validabile (`isValidable = true`) solo se:
- L'applicabilità è confermata (`soggettoAttuatorePnrr === true`).
- È inserita la base stabile 2016 del fondo dipendenti.
- È inserita la base stabile 2016 del fondo dirigenza (se applicabile).
- Tutti i requisiti contabili della checklist sono stati espressi (Sì/No).
- L'incidenza del salario accessorio (diretta o assistita con spesa e salario accessorio compilati) è definita.

Se uno o più dati obbligatori mancano, l'istruttoria non è validabile.

---

## 3. Checklist dei Requisiti Contabili (Anno Precedente)

La norma condiziona l'attivabilità del limite PNRR al rispetto di specifici parametri riferiti all'esercizio finanziario precedente (es. 2025 per l'istruttoria 2026). 

I requisiti normativi bloccanti sono:
1. **Equilibrio di bilancio dell'anno precedente**: rispetto dei saldi di finanza pubblica.
2. **Parametri su debito commerciale residuo e pagamenti**: rispetto dei tempi medi di pagamento e riduzione del debito commerciale residuo.
3. **Incidenza salario accessorio e incentivante sulla spesa di personale <= 8%**:
   - **Compilazione Diretta**: inserimento del valore percentuale certificato.
   - **Compilazione Assistita**: calcolo automatico basato sul rapporto tra salario accessorio/incentivante dell'anno precedente e spesa del personale dell'anno precedente.
4. **Approvazione del rendiconto**: il rendiconto dell'esercizio precedente deve essere stato approvato nei termini previsti dalla legge dall'**organo consiliare competente**.

### Comportamento in caso di violazione
Se anche un solo requisito contabile risulta non rispettato (valore **"No"** o incidenza calcolata **> 8%**):
- Il limite massimo teorico PNRR viene **automaticamente azzerato (0)**.
- Viene generato un errore bloccante nella checklist (`PNRR-NO-EQUILIBRIO`, `PNRR-NO-DEBITO-COMMERCIALE`, `PNRR-RENDICONTO-RITARDO`, `PNRR-INCIDENZA-ECCEDENTE`).

---

## 4. Gestione COSFEL (Attenzione Istruttoria)

A differenza dei requisiti contabili di legge, la verifica e l'approvazione COSFEL per gli enti in dissesto, riequilibrio finanziario pluriennale o strutturalmente deficitari **non è considerata un requisito bloccante** che azzera il limite PNRR, salvo espressa fonte normativa locale o specifica autorizzazione di bilancio.

- Il mancato inserimento o la mancata approvazione COSFEL produce solo **warning/avvisi istruttori** (`COSFEL-NOT-APPROVED-PNRR` o `COSFEL-MISSING-PNRR`) per richiamare l'attenzione dell'utente e del revisore sulla necessità di allineamento contabile.
- Il limite massimo teorico PNRR viene regolarmente calcolato al 5% se gli altri requisiti contabili generali sono soddisfatti.

---

## 5. Mappatura Preview e Flusso Dati

Poiché questo step ha natura puramente istruttoria, la simulazione del mapping del Fondo comporta che:
- I campi legacy che rappresentavano l'incremento effettivo (`vn_dl13_art8c3_incrementoPNRR_max5stabile2016` e `va_dl13_2023_art8c3_incrementoPNRR`) siano impostati a `null` con stato `NOT_APPLICABLE`, in quanto l'inserimento dell'incremento applicato avverrà nella fase successiva.
- Siano mappati a fini istruttori e conoscitivi i limiti teorici massimi:
  - `istruttorio.limiteMassimoPnrrFondoDipendenti`
  - `istruttorio.limiteMassimoPnrrFondoDirigenza` (se presente la dirigenza)
  - `istruttorio.totaleLimiteMassimoPnrr`
