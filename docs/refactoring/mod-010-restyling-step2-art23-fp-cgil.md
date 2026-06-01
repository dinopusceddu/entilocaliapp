# MOD-010 — Restyling grafico Step 2 Art. 23 con palette FP CGIL Lombardia

Questo documento riassume le modifiche grafiche apportate allo Step 2 "Limite globale Art. 23, comma 2" del wizard "Raccolta dati dell'Ente", per allinearlo ai colori istituzionali della FP CGIL Lombardia.

## Modifiche Apportate

### 1. Componente Result Card (`Wizard2026ResultCard.tsx`)
- Aggiunta della variante `cgil` con i colori istituzionali della FP CGIL:
  - Sfondo: `#FFF4F2` (`bg-[#FFF4F2]`)
  - Bordo: `#CC4331` (`border-[#CC4331]/30`)
  - Titolo: `#CC4331` (`text-[#CC4331]`)
  - Importo: `#A83226` (`text-[#A83226]`)
- Ammorbidita la variante `success` per gli stati di validazione semantica positiva usando toni smeraldo (emerald) in linea con la nuova palette.

### 2. Componente Step 2 (`Step2Art23Limite.tsx`)
- **Sezioni di Input**:
  - Aggiunto un bordo colorato a sinistra (`border-l-4 border-l-[#CC4331]`) a tutti i titoli di sezione (1, 2, 3 e Risultati).
  - Sostituite tutte le evidenziazioni, anelli di focus, stati hover ed elementi blu/purple con le varianti grigio/neutre o rosso/arancio FP CGIL.
  - Sostituito l'InfoBox di descrizione del limite con la variante `cgil` (rossa).
  - Allineati gli stili dei pulsanti del toggle manuale/automatico del personale in servizio con lo sfondo rosso FP CGIL per l'opzione attiva.
  - Allineati i bottoni tratteggiati "Aggiungi dipendente" con l'accento rosso FP CGIL.
- **Griglia dei Risultati**:
  - Le 4 card di calcolo intermedie ("Limite 2016 Base", "Base Accessorio 2018", "Valore Medio 2018", "Incremento Pro Capite") sono disposte in una griglia a 2 colonne su desktop e tablet, e 1 colonna su mobile.
  - La card dell'Incremento Pro Capite utilizza la variante neutra (`neutral`) invece del verde smeraldo per evitare fraintendimenti contabili.
  - La card finale "Limite Art. 23, comma 2, attualizzato" è posizionata al di sotto a larghezza piena (`w-full`), evidenziata con i colori della palette CGIL (sfondo `#FFF4F2`, bordo `#CC4331`/`#A83226`).
  - È stato inserito il badge ufficiale "Risultato principale dello step" ed evidenziata la formula contabile.

### 3. Pannello Riepilogativo Laterale (`Wizard2026SummaryPanel.tsx`)
- Sostituito il focus/accento blu con il rosso FP CGIL per la riga dell'incremento D.L. 25/2025.
- Evidenziata la riga "Limite Art. 23, comma 2, attualizzato" con uno sfondo rosso sfumato soft e bordo in contrasto.

### 4. Pannello Lettera Dati (`Wizard2026DataRequestPanel.tsx`)
- Aggiunto l'accento rosso a sinistra all'header principale sia nella visualizzazione desktop che in quella mobile ad accordion.

### 5. Lista Check e Validazioni (`Wizard2026CheckList.tsx`)
- Sostituito lo stato info/default blu con classi grigio/ardesia neutre, mantenendo il rosso e l'arancio per errori e warning semantici.

## Verifiche e Test
- Aggiornati i test in `Step2Art23Limite.test.tsx` per riflettere i nuovi titoli delle card e verificare il layout, la presenza dei badge, delle 5 card totali e l'assenza di classi blu principali.
- Eseguiti tutti i test con esito positivo (`201 passed`).
- Compilato il build di produzione con esito positivo (`built in 23.69s`).
