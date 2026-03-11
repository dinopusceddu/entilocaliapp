# 🧠 MEMORIA AI - Contesto di Progetto

Questo file funge da "memoria e contesto" per l'Assistente AI (Google Antigravity). Quando si avvia una nuova sessione su un computer o terminale diverso, chiedere all'AI di rileggere questo file per recuperare tutto lo storico del progetto.

## 📌 1. Contesto Generale (L'Applicazione)
L'applicazione è uno strumento web per il calcolo, la gestione e la distribuzione del **Fondo Salario Accessorio / Risorse Decentrate per i dipendenti degli Enti Locali**.
- Permette di inserire i dati finanziari e del personale.
- Effettua calcoli complessi rispettando decurtazioni, limiti di legge e regole contrattuali (Decurtazioni stabili per conglobamento, Incremento Decreto PA, ecc.).
- Valida la conformità normativa e restituisce eventuali errori o warning (es. sforamento controlli di spesa).
- Gestisce la corretta distribuzione delle risorse in base al grado (fondo accessorio personale non dirigente ed EQ).

## 💻 2. Stack Tecnico & Architettura
- **Frontend / Framework**: React con TypeScript (`.tsx`, `.ts`). Utilizza Vite per il build.
- **State Management**: React Context (`AppContext.tsx`) per gestire globalmente dati come `fundData`, `calculatedFund`, `complianceChecks`, ecc.
- **CSS / UI**: Tailwind CSS per il design, in modo rapido e responsivo. I file UI riutilizzabili (Card, Input, Componenti di Layout) si trovano in `src/components/`.
- **Logica di Business Core**: Concentrata nella cartella `src/logic/` (es. `fundCalculations.ts`, `complianceChecks.ts`) per disaccoppiare la logica matematica e legislativa dai componenti visivi React.

## 🛠️ 3. Cosa abbiamo fatto finora (Storico Lavori Recenti)
1. **Aggiornamento Contrattuale**: Adattati tutti i riferimenti normativi e le logiche di app per conformarle al nuovo **"CCNL Funzioni Locali 23.02.2026"**.
2. **Calcolo Elevate Qualificazioni (EQ)**: Implementazione di calcoli automatici per la parte EQ (come ad esempio l'incremento 0,22% Monte Salari 2021 sia proporzionale che separato).
3. **Logica Percentuali Fondo**: Affinata la logica delle percentuali di input nella pagina della Distribuzione. Il sistema ora gestisce l'ammontare in modo da ricalcolarlo sempre correttamente fino all'ultimo centesimo sulla parte variabile o stabile per assicurare un totale esatto del 100%.
4. **Fix sui Conflitti GitHub**: Pulizia architetturale salvando il progetto sul nuovo repository remoto pulito `entilocaliapp` e allineamento per risolvere le deviazioni dovute a Replit e all'importazione in locale di moduli conflittuali.
5. **Criticità e Compliance**: Migliorato il componente dedicato alla UI degli alert per i `complianceChecks`.
6. **Rimozione Matricola Dipendente (Data Minimization)**: Rimossa la compilazione e la visualizzazione della "matricola" da interfacce e moduli dipendenti (es. `Art23EmployeeDetail`) per conformità legata alla minimizzazione dei dati (Art. 23, c. 2).
7. **Refactoring Calcoli Fondo (Configurazione Dinamica)**: Ristrutturata e refattorizzata la funzione `calculateFadTotals` affinché usi una configurazione dinamica via JSON, rimpiazzando somme cablate e agevolando la scalabilità dei calcoli.

## 🎯 4. Regole per l'IA (Istruzioni di Sviluppo)
1. **Logica Normativa e Contabile Strict**: Le regole di matematica degli enti locali vanno applicate in modo millimetrico. Se si toccano le costanti CCNL o i file in `src/logic/`, bisogna prima testarne o verificarne accuratamente gli effetti collaterali (ad es. sul limite art. 23 c. 2 d.lgs 75/2017).
2. **Architettura Pulita**: Continuare a utilizzare i componenti UI condivisi se possibile, al fine di assicurare omogeneità.
3. **Tipi e Interfacce**: Evitare `any` nei dati sparsi. Usare rigorosamente le interfacce presenti in `src/types.ts`.
4. **Commit Frequenti**: Quando l'utente richiede un salvataggio ("Carica su GitHub"), effettuare l'aggiunta totale (`git add .`), un commit per le modifiche fatte e, in ultimo, un push sul branch `main`.

---
*Ultimo aggiornamento automatico: Marzo 2026*
