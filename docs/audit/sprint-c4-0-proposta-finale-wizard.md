# Proposta Finale Struttura Wizard — Sprint C.4.0

Struttura definitiva del wizard "Dati Generali Ente" basata sull'audit di completezza.

## Struttura degli Step

### Step 1: Identificazione Ente
- **Finalità**: Definire l'identità dell'ente e l'anno di lavoro.
- **Campi**: Denominazione, Anno Riferimento, Tipologia Ente, Numero Abitanti, Presenza Dirigenza.
- **Obbligatori**: Tutti.
- **Validazione**: Anno coerente (>2023), Denominazione (>2 chars).

### Step 2: Strumenti di Raccolta Iniziale
- **Finalità**: Accelerare l'inserimento dati.
- **Strumenti**: 
    - Pulsante "Importa da CSV".
    - Link a "Generatore Lettera Richiesta Dati".
- **Note**: Se viene usato il CSV, gli step successivi saranno pre-popolati.

### Step 3: Dati Storici 2016 (Limite Fondo)
- **Finalità**: Consolidare il limite invalicabile del fondo.
- **Campi**: Fondo Personale 2016, Fondo EQ 2016, Fondo Dirigenza 2016 (se Step 1 ha Dirigenza), Risorse Segretario 2016, Fondo Straordinario 2016.
- **Validazione**: Tutti i campi devono essere numerici (anche 0).

### Step 4: Dati Storici 2018 (Adeguamento Art. 23)
- **Finalità**: Configurare la base per l'adeguamento pro-capite.
- **Campi**: Fondo Personale 2018, Fondo EQ 2018, Personale FTE 2018 (Manuale/Automatico).
- **Obbligatori**: Fondo Personale 2018, FTE 2018.

### Step 5: Simulatore D.L. 25/2025 e Limite 48%
- **Finalità**: Calcolare l'incremento potenziale del fondo.
- **Campi**: Stipendi Tabellari 2023, Spesa Personale 2023, Media Entrate 2021-23, Tetto Spesa L. 296/06, Costo Assunzioni PIAO.
- **Warning**: Mostrare alert se la spesa supera le entrate correnti.

### Step 6: Parametri CCNL 23.02.2026
- **Finalità**: Gestire gli incrementi e le riduzioni del nuovo contratto.
- **Campi**: Incremento 0,14%, Incremento 0,22%, Riduzione stabile per conglobamento (Calcolatrice Art. 60).
- **Nota**: Mantenere la calcolatrice modale per il dettaglio delle categorie.

### Step 7: Personale in Servizio
- **Finalità**: Definire la consistenza attuale per la distribuzione indennità.
- **Campi**: Conteggio personale per categoria, FTE Anno Riferimento (per Art. 23).
- **Obbligatori**: Almeno un dipendente dichiarato.

### Step 8: Fondo e Risorse Iniziali
- **Finalità**: Completare il quadro delle risorse disponibili.
- **Campi**: Monte Salari 2021, Fondo Personale 2024, Fondo EQ 2024, Proventi Specifici, Risorse PNRR.
- **Obbligatori**: Monte Salari 2021.

### Step 9: Controlli di Coerenza e Stato Ente
- **Finalità**: Verificare la compliance normativa generale.
- **Campi**: Ente Dissestato, Deficitario, Riequilibrio.
- **Warning**: Mostrare riepilogo di eventuali sforamenti rilevati automaticamente.

### Step 10: Conferma e Accesso al Fondo
- **Finalità**: Commit finale dei dati e scelta modalità operativa.
- **Campi**: Abilita Distribuzione Risorse (Checkbox), Metadati Determina (Numero, Data).
- **Strumenti**: Pulsante "Scarica Backup Excel Completo", Pulsante "SALVA E PROCEDI".

---

## Modalità "Vista Avanzata"
Il wizard includerà in ogni pagina un link persistente:
> 🔗 **[Passa alla Vista Completa (Avanzata)]**

Questa modalità disattiva il wizard e mostra tutti i campi in un'unica pagina (layout attuale), garantendo che utenti esperti possano intervenire rapidamente su qualsiasi valore senza navigare i 10 step.
