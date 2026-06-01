# MOD-008 — Revisione Step 2 "Limite globale Art. 23, comma 2"

Questo documento descrive i dettagli e la logica implementata per la revisione dello Step 2 del wizard "Raccolta dati dell'Ente", finalizzata a isolare la determinazione del limite finanziario attualizzato ed eliminare i vecchi controlli di capienza basati sulle risorse correnti.

---

## 1. Obiettivo della modifica

*   **Esclusività del Limite**: Lo Step 2 calcola esclusivamente il "Limite Art. 23, comma 2, attualizzato". Non effettua verifiche di superamento o capienza rispetto alle risorse correnti (che sono rinviate alla successiva fase di Costituzione Fondo).
*   **Deprecazione Campi**: Sono stati rimossi dalla UI e contrassegnati come `@deprecated` nei tipi i campi:
    *   `risorseSoggetteAttuali`
    *   `risorseEscluseAttuali`
*   **Prevalenza del Limite Certificato**: Se è presente il limite certificato 2016 dell'Organo di Revisione, esso prevale ed è assunto come limite base 2016. In caso di differenza rispetto alla ricostruzione analitica, viene generato un avviso di riconciliazione (Warning).
*   **Calcolo Pro Capite**: Implementato l'adeguamento del limite per salvaguardare l'invarianza del valore medio pro capite storico del 2018 in caso di aumento dell'organico previsto nel 2026. Non sono applicate riduzioni automatiche in caso di personale inferiore al 2018.
*   **Dettagli Personale 2026**: Introdotta la possibilità (opzionale) di specificare la suddivisione del personale 2026 (tempo indeterminato, determinato, assunzioni, cessazioni). Viene generato un warning se la somma di indeterminato e determinato differisce dal totale programmato secondo il PIAO.

---

## 2. Dettaglio dei Calcoli e Formule

### Base di calcolo 2016 (`limite2016Base`)
Se `limite2016CertificatoEnte` è inserito e $> 0$:
$$\text{limite2016Base} = \text{limite2016CertificatoEnte}$$
Altrimenti, si calcola la somma analitica delle voci ricostruite:
$$\text{totaleVoci2016Ricostruite} = \text{fondoPersonaleDipendente2016} + \text{fondoEqPo2016} + \text{fondoStraordinario2016} + \text{altreVoci2016Soggette} + \text{risorseSegretario2016} + (\text{hasDirigenza} ? \text{fondoDirigenza2016} : 0)$$

### Formula Pro Capite 2018
1.  **Base Accessorio 2018**:
    $$\text{Base accessorio 2018} = \text{fondoDipendenti2018Soggetto} + \text{risorsePoEq2018Soggette}$$
2.  **Valore Medio Pro Capite 2018**:
    $$\text{Valore medio pro capite 2018} = \frac{\text{Base accessorio 2018}}{\text{personaleServizio31122018}}$$
3.  **Differenza Personale**:
    $$\text{Differenza personale} = \text{personalePrevisto2026Piao} - \text{personaleServizio31122018}$$
4.  **Incremento Pro Capite**:
    $$\text{Incremento pro capite} = \max(0, \text{Differenza personale}) \times \text{Valore medio pro capite 2018}$$
5.  **Limite Art. 23 Attualizzato**:
    $$\text{Limite Art. 23 attualizzato} = \text{limite2016Base} + \text{Incremento pro capite}$$

---

## 3. Validazioni e Warning Introdotti

*   **ART23-NEGATIVE-*** (Errore): Generato se uno dei campi numerici contiene un valore negativo.
*   **ART23-CERT-ZERO** (Warning): Generato se `limite2016CertificatoEnte` è impostato a 0.
*   **ART23-BASE-2016-MISSING** (Warning): Generato se la base del limite 2016 (certificato o analitico) è completamente assente o pari a zero.
*   **ART23-RECONCILIATION-MISMATCH** (Warning): Generato se il limite certificato 2016 e la ricostruzione analitica differiscono.
*   **ART23-MISSING-DIR-2016** (Warning): Generato se `hasDirigenza` è `true` ma `fondoDirigenza2016` è mancante.
*   **ART23-PRO-CAPITE-MISSING-DATA** (Warning): Generato se mancano i dati necessari per il calcolo pro capite (fondo 2018, EQ 2018, personale 2018, o personale 2026).
*   **ART23-PERS-2018-ZERO** (Errore): Generato se il personale 2018 è $\le 0$ (per evitare la divisione per zero).
*   **ART23-PERS-DETTAGLI-MISMATCH** (Warning): Generato se la somma del personale a tempo indeterminato e a tempo determinato previsto per il 2026 differisce dal personale previsto totale PIAO.

---

## 4. Impatto su Lettera Dati e Mapping Preview

*   La **lettera di richiesta dati** per lo Step 2 è stata aggiornata per richiedere tutti i parametri sopra elencati e rimuovere le domande relative alle risorse attuali del fondo.
*   Il **mapping preview** ora include 5 variabili simulate dello Step 2 per permettere una chiara trasparenza e visualizzazione degli importi calcolati prima del trasferimento reale nella parte legacy del fondo.
