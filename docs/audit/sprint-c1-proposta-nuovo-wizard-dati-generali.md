# Proposta Nuovo Wizard Dati Generali — Sprint C.1

L'obiettivo è trasformare l'attuale data entry in un wizard guidato che riduca il carico cognitivo e guidi l'utente passo-passo nella configurazione iniziale dell'ente.

## Struttura del Nuovo Wizard (8 Step)

### Step 1: Identità Ente
- **Dati**: Denominazione, Tipologia, Abitanti, Anno, Presenza Dirigenza.
- **Perché**: Definisce il perimetro normativo e abilita gli step successivi.
- **Controlli**: Validazione ISTAT per numero abitanti.

### Step 2: Parametri Storici (Il Limite 2016)
- **Dati**: Fondi 2016 (Stabile, EQ, Dirigenza, Segretario, Straordinario).
- **Perché**: Calcola la base del tetto Art. 23 c. 2.
- **Controlli**: Verifica coerenza con il totale manuale se fornito.

### Step 3: Base Adeguamento (Dati 2018)
- **Dati**: Fondi 2018 e Personale FTE 2018.
- **Perché**: Calcola il valore medio pro-capite per l'adeguamento del limite.
- **Calcolo Auto**: Se l'utente ha già censito il personale 2018, l'FTE viene pre-compilato.

### Step 4: Sostenibilità e Limite 48% (Dati 2023)
- **Dati**: Stipendi Tabellari 2023, Spesa Personale 2023, Media Entrate 2021-2023.
- **Perché**: Calcola lo spazio di incremento del Fondo secondo il D.L. 25/2025.
- **Messaggi Guida**: Note esplicative dalla Circolare RGS 175706/2025.

### Step 5: CCNL 2026 (Parametri Base)
- **Dati**: Monte Salari 2021, Fondi 2024.
- **Perché**: Abilita gli incrementi dello 0,14% e 0,22%.
- **Calcolo Auto**: Incremento 0,14% calcolato istantaneamente.

### Step 6: Conglobamento (Tabella C)
- **Dati**: Personale in servizio al 01.01.2026 (Aggregato o Analitico).
- **Perché**: Calcola la riduzione stabile obbligatoria Art. 60.
- **Messaggi Guida**: Riferimento alla Tabella C del CCNL 23.02.2026.

### Step 7: Altri Limiti e Vincoli
- **Dati**: Tetto spesa L. 296/06, Costo assunzioni PIAO.
- **Perché**: Verifica la sostenibilità complessiva.

### Step 8: Riepilogo e Generazione Lettera
- **Contenuto**: Tabella riassuntiva di tutti i parametri chiave.
- **Azioni**: 
  - Pulsante "Salva Configurazione".
  - Pulsante "Genera Lettera Richiesta Dati" (per i campi mancanti).

## Miglioramenti UX
- **ProgressBar**: Indicatore visibile della percentuale di completamento.
- **Salvataggio Intermedio**: Auto-save dello stato locale (Zustand/Context) per evitare perdite di dati.
- **Smart Hints**: Popover con estratti normativi contestuali per ogni campo complesso.

---
*Proposta wizard completata per lo Sprint C.1.*
