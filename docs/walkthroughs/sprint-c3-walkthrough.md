# Walkthrough — Sprint C.3: Generatore Lettera Richiesta Dati

È stata completata l'implementazione del sistema di generazione automatica della lettera formale di richiesta dati per la costituzione del Fondo.

## Funzionalità Principali

### 1. Motore di Context-Awareness
Il sistema analizza in tempo reale lo stato dei dati inseriti nell'app (`FundData`) e determina quali informazioni mancano per completare il calcolo del fondo.
- **Dati Presenti**: Contrassegnati con `[Dato già a sistema]`.
- **Dati Mancanti**: Evidenziati con `[DA RICHIEDERE]` per attirare l'attenzione dell'ufficio personale dell'ente.

### 2. Personalizzazione Real-time
Dalla modale di generazione, l'utente può personalizzare:
- **Firmatario**: Nome e ruolo di chi firma la lettera.
- **Organizzazione**: Sigla sindacale (default: FP CGIL).

### 3. Anteprima e Azioni
- **Preview Premium**: Visualizzazione in formato A4 simulato con rendering Markdown.
- **Esportazione Multipla**:
    - **Copia negli appunti**: Per incollare velocemente il testo in una email.
    - **Download .md**: File Markdown per archiviazione.
    - **Genera PDF**: Documento professionale formattato con `jsPDF`, pronto per la stampa.

## Evidenze di Funzionamento
![Preview Generatore Lettera](file:///C:/Users/PuscedduD/.gemini/antigravity/brain/b2991ff0-63b4-44ff-b82b-24a37d6f430a/sprint_c3_letter_modal_preview_1778765791405.png)

## Validazione Tecnica
- **Test Unitari**: Implementati test per la logica di contesto (`letterRequestDataContext.test.ts`) e per il generatore di markdown (`letterRequestDataGenerator.test.ts`).
- **Integrità Dati**: Il processo è puramente di lettura dallo stato dell'app. **Nessun dato viene inviato a server esterni o salvato su Supabase** durante la generazione.
- **Stile**: Utilizzo di Tailwind CSS Prose per un'estetica moderna e leggibile.
