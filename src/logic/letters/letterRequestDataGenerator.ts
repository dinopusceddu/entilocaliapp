import { LetterRequestDataContext } from './letterRequestDataTypes';

/**
 * Genera il testo Markdown della lettera basandosi sul contesto fornito.
 */
export const generateRequestDataLetterMarkdown = (context: LetterRequestDataContext): string => {
    const { ente, annoRiferimento, dataGenerazione, dataStatus, customOptions } = context;
    
    // Helper per formattare i dati richiesti
    const req = (isPresent: boolean, label: string, details: string) => {
        if (isPresent) {
            return `*   **${label}**: [Dato già presente a sistema] - ${details}`;
        } else {
            return `*   **${label}**: [DATO DA RICHIEDERE] - ${details}`;
        }
    };

    return `# Richiesta Dati per Costituzione Fondo Risorse Decentrate

**A:** ${ente.denominazione}
**Ufficio:** Personale / Ragioneria
**Data:** ${dataGenerazione}

**Oggetto: Richiesta dati necessari alla verifica e costituzione del Fondo risorse decentrate - Anno ${annoRiferimento}**

In riferimento alle procedure di costituzione e riparto del Fondo per le risorse decentrate, previste dal CCNL Funzioni Locali vigente e in particolare dalle novità introdotte dal **CCNL 23 febbraio 2026**, la scrivente ${customOptions?.organizzazione} richiede la trasmissione dei seguenti dati e documenti in formato elaborabile:

### 1. Dati Storici di Riferimento (Art. 23, comma 2, D.Lgs. 75/2017)
${req(dataStatus.fondo2016, 'Limite 2016', 'Ammontare complessivo delle risorse certificate per l’anno 2016.')}
${req(dataStatus.fondo2018, 'Fondo 2018', 'Valore delle risorse stabili del Fondo certificate per l’anno 2018.')}
${req(dataStatus.fte2018, 'Personale FTE 2018', 'Numero dei dipendenti equivalenti presenti al 31.12.2018 (Conto Annuale).')}

### 2. Dati Consuntivi 2023 (Limite 48% D.L. 25/2025)
${req(dataStatus.stipendi2023, 'Stipendi Tabellari 2023', 'Spesa sostenuta nel 2023 per stipendi tabellari (aree professionali, incl. 13ª).')}
${req(dataStatus.spesaPersonale2023, 'Spesa Totale Personale 2023', 'Macroaggregato U.1.01 risultante dall\'ultimo rendiconto approvato.')}
${req(dataStatus.entrate2021_2023, 'Media Entrate 2021-2023', 'Media entrate correnti triennio 2021-2023, al netto del FCDE.')}

### 3. Dati Personale e CCNL 2026
${req(dataStatus.monteSalari2021, 'Monte Salari 2021', 'Base di calcolo per gli incrementi Art. 58 CCNL 2026.')}
*   **Personale al 01.01.2026**: Numero e inquadramento per calcolo riduzione Art. 60 e Tabella C.
*   **Differenziali 2024-2025**: Prospetto dei differenziali stipendiali attribuiti.

### 4. Parametri di Bilancio e Programmazione
${req(dataStatus.tettoSpesa, 'Tetto Spesa Personale', 'Limite ex art. 1, comma 557 o 562, L. 296/06.')}
${req(dataStatus.piao, 'Costo Assunzioni PIAO', 'Costo annuo a regime delle nuove assunzioni previste.')}
*   **Risorse Specifiche**: Eventuali risorse destinate da leggi speciali (PNRR, Art. 208 CdS, etc.).

${ente.hasDirigenza ? `
### 5. Sezione Dirigenza
*   Ammontare Fondo Dirigenza 2016.
*   Risorse stabili e variabili destinate alla dirigenza e alle Elevate Qualificazioni (ove applicabile).
` : ''}

Si richiede che la suddetta documentazione venga fornita tempestivamente per consentire il corretto avvio della sessione negoziale, come previsto dall'Art. 8 del CCNL 23.02.2026.

Distinti saluti.

**${customOptions?.firmatario}**
*${customOptions?.organizzazione}*
`;
};
