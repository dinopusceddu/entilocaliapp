<div align="center">
  <img src="https://fpcgil.lombardia.it/wp-content/uploads/2019/10/LOGO_LOMBARDIA.png" alt="FP CGIL Lombardia" width="300" />
  
  # Toolbox Funzioni Locali
  ### Soluzione integrata per la gestione del Fondo Salario Accessorio
  
  [![Version](https://img.shields.io/badge/Versione-Beta_1.0-800000.svg)](https://github.com/dinopusceddu/entilocaliapp)
  [![React](https://img.shields.io/badge/Framework-React_18-blue.svg)](https://react.dev/)
  [![CCNL](https://img.shields.io/badge/Contratto-CCNL_2024--2026-gold.svg)](https://www.aranagenzia.it/)
</div>

---

## 🚀 Cos'è Toolbox Funzioni Locali?

**Toolbox Funzioni Locali** è lo strumento avanzato progettato per supportare gli operatori degli Enti Locali nella complessa gestione delle **Risorse Decentrate** e del **Fondo Salario Accessorio**. 

Nato dalla collaborazione con **FP CGIL Lombardia**, l'applicativo automatizza i calcoli finanziari, garantisce la conformità normativa e semplifica la produzione della documentazione amministrativa obbligatoria.

---

## ✨ Funzionalità Principali

### 📊 1. Costituzione del Fondo (Motore di Calcolo)
*   **Gestione CCNL 2024-2026**: Calcoli aggiornati con le ultime disposizioni contrattuali (Conglobamento 2026, Incremento Decreto PA, ecc.).
*   **Automazione Elevate Qualificazioni (EQ)**: Ripartizione e calcolo automatico per le posizioni EQ.
*   **Verifica Limite Art. 23 c. 2**: Controllo automatico del tetto di spesa 2016 con adeguamenti dinamici per il personale in servizio (FTE).

### ⚖️ 2. Compliance e Validazione
*   **Semafori Normativi**: Sistema di alert real-time che segnala incongruenze, superamento limiti o errori di ripartizione.
*   **Controlli di Corrispondenza**: Verifica che le risorse a destinazione vincolata siano correttamente allocate.

### 🧭 3. Bussola Normativa & ARAN
*   **Database Integrato**: Accesso a oltre 160 articoli della raccolta contrattuale e 40+ schede tematiche.
*   **Ricerca Pareri ARAN**: Archivio di centinaia di pareri ufficiali con sistema di "Smart Splitting" per una lettura chiara di quesito e risposta.
*   **Deep Linking**: Navigazione diretta dall'indice analitico ai testi normativi specifici.

### 📄 4. Reportistica Premium & Esportazione
*   **PDF Professionali**: Generazione di report di riepilogo generale in formato premium con grafici e KPI.
*   **XLSX Nativo**: Esportazione in Excel (Quadri A, B, C) con formattazione istituzionale bordeaux.
*   **Tabella 15 Conto Annuale**: Mappatura automatica delle voci per il monitoraggio SICO.
*   **Modulistica Amministrativa**: Generazione di Determine di Costituzione e Relazioni Tecnico-Finanziarie pronte all'uso.

---

## 🛠️ Stack Tecnico

L'applicazione utilizza le tecnologie più moderne per garantire velocità, sicurezza e portabilità:
- **Frontend**: React 18 + TypeScript + Vite.
- **Styling**: Tailwind CSS v3 (Custom Brand Theme).
- **Backend**: Supabase (Database Postgres, Auth, Edge Functions).
- **Documenti**: ExcelJS + React-PDF.

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
3. Configurare le variabili d'ambiente:
   Creare un file `.env.local` e inserire le chiavi Supabase e Gemini:
   ```env
   VITE_SUPABASE_URL=tuo_url
   VITE_SUPABASE_ANON_KEY=tua_chiave
   VITE_GEMINI_API_KEY=tua_chiave_gemini
   ```
4. Avviare il server di sviluppo:
   ```bash
   npm run dev
   ```

---

<div align="center">
  <sub>Sviluppato per <b>FP CGIL Lombardia</b></sub>
</div>

