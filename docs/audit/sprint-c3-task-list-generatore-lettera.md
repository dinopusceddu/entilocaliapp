# Task List — Sprint C.3: Generatore Lettera Richiesta Dati

## 1. Architettura e Motore Template
- [ ] Creazione di `src/logic/letters/letterEngine.ts` per la sostituzione dei placeholder.
- [ ] Definizione del template base in Markdown (`src/data/templates/richiesta_dati_v1.md`).
- [ ] Implementazione logica condizionale (es. inclusione paragrafi dirigenza).

## 2. Integrazione UI
- [ ] Creazione pagina/sezione "Generatore Lettera" nell'ambito Dati Generali.
- [ ] Componente `LetterPreview`: visualizzazione real-time della lettera con i dati dell'ente.
- [ ] Pulsanti di azione: "Copia negli appunti", "Scarica Markdown", "Esporta PDF".

## 3. Esportazione (Export Layer)
- [ ] Integrazione libreria `jsPDF` o `react-pdf` per la generazione client-side.
- [ ] Formattazione intestazione ufficiale (Logo FP CGIL + Dati Ente).
- [ ] Gestione salti di pagina e formattazione tabelle nel PDF.

## 4. Test e Validazione
- [ ] Test unitari sul motore di sostituzione placeholder.
- [ ] Smoke test su diversi profili ente (Comune con/senza dirigenza).
- [ ] Verifica leggibilità del PDF generato.
