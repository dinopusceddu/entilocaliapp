# 🧠 MEMORIA AI - Contesto di Progetto

Questo file funge da "memoria e contesto" per l'Assistente AI (Google Antigravity). Quando si avvia una nuova sessione su un computer o terminale diverso, chiedere all'AI di rileggere questo file per recuperare tutto lo storico del progetto.

## 📌 1. Contesto Generale (L'Applicazione)
L'applicazione è uno strumento web per il calcolo, la gestione e la distribuzione del **Fondo Salario Accessorio / Risorse Decentrate per i dipendenti degli Enti Locali**.
- Permette di inserire i dati finanziari e del personale.
- Effettua calcoli complessi rispettando decurtazioni, limiti di legge e regole contrattuali (Decurtazioni stabili per conglobamento, Incremento Decreto PA, ecc.).
- Valida la conformità normativa e restituisce eventuali errori o warning.
- Gestisce la corretta distribuzione delle risorse in base al grado (fondo accessorio personale non dirigente ed EQ).

## 💻 2. Stack Tecnico & Architettura
- **Frontend / Framework**: React con TypeScript (`.tsx`, `.ts`). Utilizza Vite per il build.
- **State Management**: React Context (`AppContext.tsx`) per gestire globalmente dati come `fundData`, `calculatedFund`, `complianceChecks`, ecc.
- **CSS / UI**: Tailwind CSS per il design.
- **Logica di Business Core**: Concentrata nella cartella `src/logic/` (es. `fundCalculations.ts`, `complianceChecks.ts`).

## 🛠️ 3. Cosa abbiamo fatto finora (Storico Lavori Recenti)
1. **Aggiornamento Contrattuale**: Adattati tutti i riferimenti normativi al nuovo **"CCNL Funzioni Locali 23.02.2026"**.
2. **Calcolo Elevate Qualificazioni (EQ)**: Implementazione di calcoli automatici per la parte EQ.
3. **Logica Percentuali Fondo**: Affinata la logica delle percentuali di input nella pagina della Distribuzione.
4. **Fix sui Conflitti GitHub**: Pulizia architetturale salvando il progetto nel repository `entilocaliapp`.
5. **Criticità e Compliance**: Migliorato il componente dedicato alla UI degli alert per i `complianceChecks`.
6. **Rimozione Matricola Dipendente (Data Minimization)**: Rimossa la matricola per conformità GDPR/GDL.
7. **Refactoring Calcoli Fondo (Configurazione Dinamica)**: Ristrutturata la funzione `calculateFadTotals` via JSON.
8. **Miglioramenti Pagina Panoramica (HomePage)**: Implementato calcolo automatico, hero banner e KPI sub-fondi. Aggiunto widget Limite Art. 23.
9. **Inserimento Manuale Risorse Personale**: Implementata modalità override manuale per "Indennità di Comparto" e "Progressioni Economiche" (PEO).
10. **Conteggio Personale Equivalente (FTE)**: Aggiunta la possibilità di inserire manualmente il totale del personale equivalente (FTE) nell'anno corrente. Il valore è integrato nella logica di calcolo dell'adeguamento del Limite Art. 23 c. 2. È stata aggiunta una nota descrittiva sulla logica di calcolo (testa, part-time, cedolini).
29. **Refactoring PDF Report (Premium)**: Ricreata completamente la generazione del PDF "Riepilogo Generale" trasformandolo in un documento professionale di 8 pagine, con grafici a barre, KPI box bordeaux, barre di progresso visuali per i limiti e tabelle di conformità semaforiche.
30. **Esportazione XLS Nativa Premium (ExcelJS)**: Sostituito il vecchio sistema XLS-HTML con un motore nativo basato su `ExcelJS`. Il file include ora: tema bordeaux coerente con l'app, Quadro A (Risorse), Quadro B (Utilizzi), e Quadro C (Verifica Limite Art. 23) con decurtazioni automatiche e segnalazione esito verde/rosso.
31. **Sistema Segnalazione Feedback/Bug**: Progettata e avviata l'implementazione di un sistema di feedback interno per segnalare bug o richieste di modifiche, con area dedicata agli amministratori e persistenza tramite Supabase.
32. **Aggiornamento Atto Testuale**: Revisionato il testo della determina ("Atto di Costituzione Testuale") per allinearlo perfettamente al CCNL 23.02.2026 e ai dati correnti del software.

## 🎯 4. Regole per l'IA (Istruzioni di Sviluppo)
1. **Logica Normativa e Contabile Strict**: Calcoli millimetrici per la contabilità pubblica.
2. **Architettura Pulita**: Usare i componenti UI condivisi.
3. **Tipi e Interfacce**: Usare rigorosamente le interfacce in `src/types.ts`.
4. **Commit Frequenti**: Git add, commit e push su branch `main`.

---
*Ultimo aggiornamento automatico: 12 Marzo 2026*
