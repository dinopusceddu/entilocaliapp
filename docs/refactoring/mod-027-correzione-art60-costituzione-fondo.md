# Correzione Coerenza Art. 60 — MOD-027

Questo documento descrive la correzione e la ristrutturazione della logica del conglobamento compartments (Art. 60 CCNL 23.02.2026) apportate per risolvere le anomalie di calcolo riscontrate in **MOD-026**.

---

## 1. Descrizione del Problema (MOD-026)
Nel precedente collaudo è emerso che se la decurtazione permanente dell'Art. 60 venisse valorizzata direttamente nella Costituzione Fondo senza che l'utente avesse completato o impostato lo Step 5 del wizard (cioè senza popolare i parametri contrattuali del CCNL), il fondo reale dell'ente non calava affatto.
Questo era causato dal fatto che il motore escludeva la voce dalla somma stabile per via del flag `isAlreadyInCcnlTotal` (evitando duplicazioni con la riduzione del CCNL netta), ma di fatto impedendo l'applicazione della decurtazione quando il wizard era disattivo o non compilato.

---

## 2. Soluzione Implementata in MOD-027

Per risolvere l'anomalia in modo coerente e conforme ai vincoli normativi, è stata implementata una **logica unica centralizzata di priorità e calcolo** che gestisce in maniera uniforme le due origini dei dati:

### A. Regola di Priorità (Calcolo di `valoreArt60Effettivo`)
Il motore di calcolo determina la decurtazione effettiva (`valoreArt60Effettivo`) come segue:
1. **Solo Voce Fondo presente** (`st_art60c2...` > 0): `valoreArt60Effettivo = valoreVoceFondo`.
2. **Solo Parametri CCNL presenti** (`ccnlResults.riduzioneConglobamento` > 0): `valoreArt60Effettivo = valoreContrattuale`.
3. **Entrambi presenti e coincidenti**: `valoreArt60Effettivo = valoreVoceFondo` (applicata una sola volta).
4. **Entrambi presenti ma divergenti**: `valoreArt60Effettivo = valoreVoceFondo` (ha priorità il dato contabile inserito a mano). In questo caso viene valorizzato il flag `showWarningDisallineamento = true`.

### B. Effetti Contabili e Limite Art. 23
La decurtazione Art. 60 effettivo produce esattamente due effetti bilanciati:
1. **Fondo Reale**: Il totale stabili del fondo viene calcolato al lordo degli incrementi contrattuali e poi decrementato esplicitamente del `valoreArt60Effettivo`. Questo riduce la liquidità reale del fondo dell'ente.
2. **Limite Art. 23**: L'ammontare delle risorse stabili soggette all'Art. 23 viene ridotto del `valoreArt60Effettivo` (in quanto riduzione reale permanente della parte stabile), ma nel prospetto di compliance viene sommatamente reintegrato a titolo di **computo figurativo positivo (+ valoreArt60Effettivo)**. L'effetto netto sul tetto storico di spesa è quindi nullo (neutro), preservando lo spazio finanziario accessorio dell'ente.

---

## 3. Scenari di Test Verificati

La suite di test unitari in `mod025ComplianceProspetto.test.ts` è stata estesa per coprire i 4 scenari richiesti:

* **Scenario 1 — Solo valore da wizard/parametri CCNL**
  * *Input*: parametro CCNL = € 1.500,00; voce fondo = € 0,00.
  * *Esito*: il fondo reale si riduce di € 1.500,00; il valore viene riaggiunto figurativamente ai fini dell'Art. 23; nessun warning. **(PASSED)**
* **Scenario 2 — Solo valore manuale in Costituzione Fondo**
  * *Input*: voce fondo = € 1.500,00; parametro CCNL = € 0,00.
  * *Esito*: il fondo reale si riduce di € 1.500,00; il valore viene riaggiunto figurativamente ai fini dell'Art. 23; non si verifica l'anomalia di MOD-026. **(PASSED)**
* **Scenario 3 — Valori coincidenti**
  * *Input*: voce fondo = € 1.500,00; parametro CCNL = € 1.500,00.
  * *Esito*: applicata una sola detrazione reale di € 1.500,00; un solo computo figurativo; nessun warning. **(PASSED)**
* **Scenario 4 — Valori divergenti**
  * *Input*: voce fondo = € 1.800,00; parametro CCNL = € 1.500,00.
  * *Esito*: usa il valore della voce fondo contabile (€ 1.800,00); genera il warning di disallineamento; gli importi non vengono sommati. **(PASSED)**

---

## 4. Modifiche UI nella Costituzione Fondo

### A. Warning di Disallineamento
Se l'utente inserisce a mano un valore divergente da quello del wizard (Scenario 4), in cima al Prospetto Art. 23 viene visualizzato un banner ambra di avviso (non bloccante):
> ⚠️ **Attenzione:** il valore della decurtazione Art. 60 inserito nella Costituzione Fondo (€ X) non coincide con il valore calcolato o consolidato nei parametri CCNL/wizard (€ Y). Ai fini del fondo reale viene utilizzato il valore inserito nella voce contabile; verificare la coerenza della costituzione del fondo.

### B. Help Text e Note di Riga
Sulla riga contabile `st_art60c2_CCNL2026_decurtazioneIndennitaComparto`:
* Il campo è ora **editabile manualmente** (rimosso il blocco coercitivo `currentDisabled = true`) per consentire la correzione motivata.
* Sotto il campo è visualizzato l'help text normativo:
  > La decurtazione Art. 60 riduce realmente la parte stabile del Fondo risorse decentrate. Ai fini del limite Art. 23, comma 2, D.Lgs. 75/2017, il valore viene però computato figurativamente per evitare che la riduzione liberi nuovo spazio finanziario.
* Se il valore coincide ed è importato dal wizard, compare il badge:
  > Dato proveniente dal wizard Raccolta dati dell’Ente. Il valore è consolidato dal 2026 e resta invariato negli anni successivi, salvo correzione manuale motivata.

### C. Dettagli nel Prospetto Art. 23
All'interno del box in evidenza in alto (Sezione A) è stato arricchito il pannello di dettaglio che espone in modo cristallino all'Organo di Revisione:
* **Valore in Costituzione Fondo**: il dato inserito nella tabella contabile.
* **Parametro Wizard / CCNL**: il dato registrato nel modulo contrattuale.
* **Valore Effettivo Applicato**: il valore reale che riduce il fondo e viene conteggiato figurativamente ai fini del limite.
* Nota esplicativa che chiarisce il raccordo algebrico.
