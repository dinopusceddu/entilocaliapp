# Implementation Plan — Sprint C.3: Generatore Lettera Richiesta Dati

## 1. Obiettivo
Automatizzare la creazione della lettera formale di richiesta dati che i delegati/segretari FP CGIL inviano agli enti locali. La lettera utilizzerà i dati generali dell'ente già presenti nel sistema per pre-compilare i campi tecnici.

## 2. Architettura Proposta
Il sistema si baserà su un approccio "Data-Driven Template":
1. **Sorgente Dati**: `state.fundData` (Dati Generali, Storici e Annuali).
2. **Template**: File Markdown con tag di sostituzione (es. `{{denominazioneEnte}}`).
3. **Motore**: Funzione pure `generateLetter(data, template)` che restituisce una stringa Markdown.
4. **View**: Pagina React con anteprima interattiva e opzioni di download.

## 3. Tecnologie
- **Rendering**: `react-markdown` per la preview nella UI.
- **PDF**: `html2pdf.js` o similare per convertire il DOM renderizzato in un documento PDF formattato.
- **Styling**: Tailwind CSS per il layout della lettera (foglio A4 simulato).

## 4. Flusso Utente
1. L'utente completa i Dati Generali (manualmente o via CSV).
2. Clicca su "Genera Lettera di Richiesta".
3. Visualizza l'anteprima con i dati pre-compilati.
4. Può modificare manualmente alcuni testi (opzionale).
5. Scarica il file per l'invio ufficiale.

## 5. Vincoli
- Funzionamento 100% locale (nessun invio dati a server esterni per la generazione PDF).
- Rispetto della gerarchia normativa citata (CCNL 23.02.2026).
