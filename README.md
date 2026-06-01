<div align="center">
  <img src="https://fpcgil.lombardia.it/wp-content/uploads/2019/10/LOGO_LOMBARDIA.png" alt="FP CGIL Lombardia" width="300" />
  
  # Toolbox Funzioni Locali
  ### Applicazione per la costituzione, verifica, distribuzione e documentazione del Fondo risorse decentrate negli enti locali.
  
  [![Version](https://img.shields.io/badge/Versione-Beta_1.3-800000.svg)](https://github.com/dinopusceddu/entilocaliapp)
  [![React](https://img.shields.io/badge/Framework-React_18-blue.svg)](https://react.dev/)
  [![CCNL](https://img.shields.io/badge/Contratto-CCNL_2026-gold.svg)](https://www.aranagenzia.it/)
</div>

---

## 🚀 Cos'è Toolbox Funzioni Locali?

**Toolbox Funzioni Locali** è lo strumento tecnico progettato per uffici, delegati, RSU e strutture sindacali.
Nato dalla collaborazione con **FP CGIL Lombardia**, l'applicativo automatizza i calcoli finanziari, garantisce la conformità normativa e semplifica la documentazione amministrativa obbligatoria. L'applicazione è aggiornata all'ultima normativa vigente ed è in versione **Beta 1.3**.

---

## 🆕 Novità della Versione Beta 1.3 — Configurazione fondi incentivanti 2026

La versione 1.3 introduce il nuovo flusso consolidato per la configurazione e il calcolo dei fondi del salario accessorio.

### 1. Nuovo flusso principale
L'accesso al flusso 2026 avviene tramite:
**Dashboard → Enti e Annualità → Configurazione fondi incentivanti**
- **Raccolta dati** (Accesso prioritario): compilazione guidata in 8 passaggi.
- **Costituzione dei fondi**: allineamento dei dati e visualizzazione dei prospetti.
- *Nota:* Il vecchio flusso "Dati iniziali / Dati Generali Ente" è stato rimosso per evitare confusioni.

### 2. Wizard 2026 / Raccolta dati
Il percorso guidato raccoglie ed elabora:
- Limite Art. 23, comma 2, D.Lgs. 75/2017;
- Incremento stabile per aumento personale in organico;
- Adeguamenti D.L. 25/2025;
- Incrementi stabili (0,14%) e variabili (0,22%) del CCNL 23.02.2026;
- Effetti del conglobamento indennità comparto (Art. 60);
- Fondo lavoro straordinario ed economie;
- Fondi PNRR;
- Riepilogo e trasferimento dei dati verso la Costituzione dei fondi.

### 3. Costituzione dei fondi
Allineamento e trasferimento automatico per i seguenti schemi:
- Fondo accessorio personale dipendente;
- Fondo Elevate Qualificazioni (EQ);
- Fondo Segretario Comunale;
- Fondo Dirigenza;
- Prospetto complessivo di verifica limite Art. 23, con separazione automatica delle risorse escluse e soggette.

### 4. Persistenza dei dati
- **Supabase (Remoto)**: Database principale per il salvataggio definitivo.
- **localStorage (Locale)**: Protegge in modo durevole le bozze di compilazione del wizard e l'ultimo snapshot di trasferimento tra sessioni e alla chiusura del browser.
- **Chiavi locali principali**:
  - `fl_wizard2026_draft_*`: Bozza del wizard corrente.
  - `fl_wizard2026_last_transfer_*`: Snapshot dell'ultimo trasferimento andato a buon fine.
  - `fl_draft_*`: Altre bozze del fondo.
- *Nota:* Le bozze locali non sostituiscono il salvataggio remoto su Supabase.

### 5. Pulizia legacy
- Rimozione del vecchio modulo legacy `dataEntry`.
- Rimozione del vecchio Wizard "Dati Generali Ente".
- Sostituzione di tutti i link e route legacy con il nuovo modulo unificato.

### 6. Stato rilascio
La versione Beta 1.3 è predisposta per il rilascio su branch dedicato e dovrà essere portata in produzione solo dopo il superamento dei test locali, push del branch, verifica in ambiente preview e collaudo manuale.

### 7. Configurazione ambiente
Per l'attivazione locale, creare un file `.env` o configurare le variabili d'ambiente:
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
> [!IMPORTANT]
> - Non committare mai i file `.env` o `.env.local`.
> - Non inserire chiavi Supabase reali nel README.
> - Non utilizzare mai chiavi `service_role` ad alto privilegio nel frontend.

---

## 🆕 Novità della Versione Beta 1.2

La nuova versione introduce strumenti avanzati per la raccolta dati e la gestione documentale:

*   **Generatore automatico lettera richiesta dati**: Creazione istantanea della lettera formale per l'ente, con evidenza automatica dei dati mancanti nel sistema;
*   **Esportazione multi-formato**: Lettere scaricabili in PDF professionale e Markdown;
*   **Importazione CSV Dati Ente**: Sistema di caricamento rapido per la configurazione iniziale dei dati generali dell'ente;
*   **Template CSV Semplificato**: Modello scaricabile pronto all'uso per facilitare la raccolta dati dai delegati;
*   **Strumenti Import/Export Centralizzati**: Nuova barra strumenti unificata che distingue chiaramente tra:
    *   **CSV**: per la configurazione iniziale dei soli dati anagrafici e tecnici dell'ente;
    *   **Excel**: per il backup e ripristino completo di tutto lo stato del fondo (incluse risorse e decurtazioni).

---

## 🆕 Novità della Versione Beta 1.1

La versione 1.1 ha introdotto gli adeguamenti normativi per il triennio 2022-2024:

*   Aggiornamento al CCNL Funzioni Locali 23.02.2026;
*   Calcolo incrementi stabili (0,14%) e variabili (0,22%);
*   Gestione arretrati 2024-2025 e conglobamento indennità di comparto;
*   Verifica limite 48% (D.L. 25/2025) e stabilizzazione alias normativi;
*   Guida normativa contestuale voce-per-voce;
*   Aggiornamento report PDF, Determina e Tabella 15.

---

## 🛠️ Stack Tecnico

- **Frontend**: React 18 + TypeScript + Vite.
- **Styling**: Tailwind CSS v3 (Custom Brand Theme).
- **Backend**: Supabase.
- **Infrastruttura**: Cloudflare Pages / Workers.

---

## 🏃 Avvio Rapido (Sviluppo Locale)

### Prerequisiti
- **Node.js** (versione 18 o superiore)
- **NPM** o **Yarn**

### Installazione
1. Clonare il repository:
   ```bash
   git clone https://github.com/dinopusceddu/entilocaliapp.git
   ```
2. Installare le dipendenze:
   ```bash
   npm install
   ```
3. Avviare il server di sviluppo:
   ```bash
   npm run dev
   ```

---

<div align="center">
  <sub>Sviluppato per <b>FP CGIL Lombardia</b></sub>
</div>
