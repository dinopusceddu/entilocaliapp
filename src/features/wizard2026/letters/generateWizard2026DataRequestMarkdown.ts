import { Wizard2026LetterContext } from './wizard2026LetterTypes';

const SECTION_TITLES: Record<number, string> = {
  1: 'A. Dati generali dell’Ente',
  2: 'B. Limite art. 23, comma 2, D.Lgs. 75/2017',
  3: 'C. Limite massimo D.L. 25/2025',
  4: 'D. Incrementi CCNL 2026 (Art. 58)',
  5: 'E. Conglobamento comparto art. 60',
  6: 'F. Fondo lavoro straordinario',
  7: 'G. Incremento PNRR (Art. 8, comma 3, D.L. 13/2023)',
};

export const generateWizard2026DataRequestMarkdown = (context: Wizard2026LetterContext): string => {
  const {
    ente,
    annoRiferimento,
    dataGenerazione,
    destinatario,
    firmatario,
    organizzazione,
    termineRisposta,
    note,
    mode,
    sections,
    allFields
  } = context;

  let md = '';

  // 1. Intestazione Formale
  md += `**${organizzazione.toUpperCase()}**\n`;
  md += `Comparto Funzioni Locali\n`;
  md += `Rappresentanza Sindacale Unitaria / Delegati Sindacali\n\n`;

  md += `Spett.le\n`;
  md += `**Amministrazione di ${ente.denominazione}**\n`;
  md += `All'attenzione di: ${destinatario}\n`;
  md += `e dei componenti della Delegazione Trattante di parte pubblica\n\n`;

  md += `Data: ${dataGenerazione}\n\n`;

  // 2. Oggetto Formale
  md += `**OGGETTO: Richiesta dati e informazioni per la costituzione del Fondo risorse decentrate anno ${annoRiferimento}**\n\n`;

  // 3. Premessa discorsiva
  md += `In vista dell'avvio della sessione negoziale decentrata per l'anno ${annoRiferimento}, ai sensi del CCNL del comparto Funzioni Locali e in conformità alle regole vigenti per la corretta determinazione dei limiti di spesa del trattamento accessorio, la scrivente organizzazione sindacale richiede formalmente la trasmissione delle informazioni e dei dati contabili sotto indicati.\n\n`;

  md += `La presente istruttoria è finalizzata ad assicurare il corretto e trasparente calcolo delle risorse stabili e variabili, con particolare riferimento ai requisiti normativi di sostenibilità e ai controlli previsti per la quantificazione delle quote applicabili.\n\n`;

  // Alerter COSFEL se applicabile
  if (ente.isDissesto || ente.isStrutturalmenteDeficitario || ente.isPianoRiequilibrio) {
    const critici = [
      ente.isDissesto ? 'Dissesto Finanziario' : '',
      ente.isStrutturalmenteDeficitario ? 'Deficitarietà Strutturale' : '',
      ente.isPianoRiequilibrio ? 'Piano di Riequilibrio Pluriennale' : ''
    ].filter(Boolean).join(', ');

    md += `> [!WARNING]\n`;
    md += `> **PRESIDI E AUTORIZZAZIONI COSFEL**\n`;
    md += `> Si segnala che l'Ente dichiara una condizione di criticità finanziaria (${critici}). Si rende pertanto necessario verificare la sussistenza delle prescritte autorizzazioni e dei pareri favorevoli della Commissione per la stabilità finanziaria degli enti locali (COSFEL) in ordine alla spesa di personale e alla costituzione dei fondi per il salario accessorio.\n\n`;
  }

  if (mode === 'MISSING_ONLY') {
    md += `Si evidenzia che la presente richiesta è limitata esclusivamente alle **informazioni mancanti** da trasmettere ed alle **voci da verificare** con riscontro documentale, necessarie per il completamento dell'istruttoria.\n\n`;
  }

  // 4. Sezioni dei dati
  sections.forEach(section => {
    // Check if there are any fields in this section
    if (section.fields.length === 0) return;

    const title = SECTION_TITLES[section.stepId] || section.stepTitle;
    md += `### ${title}\n\n`;

    section.fields.forEach(f => {
      const { label, percheServe } = f.catalogItem;
      const status = f.status;
      const valStr = f.valueString;

      if (status === 'MANCANTE') {
        md += `* 🔴 **${label}** — ${percheServe}\n`;
      } else if (status === 'DA_VERIFICARE') {
        md += `* 🟡 **${label}** — ${percheServe} (Valore attuale a sistema: **${valStr}**)\n`;
      } else if (status === 'PRESENTE') {
        md += `* 🟢 **${label}** — ${percheServe} (Valore a sistema: **${valStr}**)\n`;
      }
    });
    md += `\n`;
  });

  // 5. Note libere inserite dall'utente
  if (note && note.trim() !== '') {
    md += `### Note Aggiuntive del Richiedente\n`;
    md += `${note}\n\n`;
  }

  // 6. Appendice per la modalità MISSING_ONLY
  if (mode === 'MISSING_ONLY') {
    const nonApplicabili = allFields.filter(f => f.status === 'NON_APPLICABILE');
    const presenti = allFields.filter(f => f.status === 'PRESENTE');

    if (nonApplicabili.length > 0 || presenti.length > 0) {
      md += `---\n\n`;
      md += `## Appendice contabile informativa\n\n`;

      if (presenti.length > 0) {
        md += `### Dati già presenti ed inseriti a sistema (non richiesti)\n`;
        presenti.forEach(f => {
          md += `* 🟢 **${f.catalogItem.label}** (Valore registrato: **${f.valueString}**)\n`;
        });
        md += `\n`;
      }

      if (nonApplicabili.length > 0) {
        md += `### Dati non applicabili per le caratteristiche dell'Ente\n`;
        nonApplicabili.forEach(f => {
          md += `* ⚪ **${f.catalogItem.label}** (Dato non applicabile)\n`;
        });
        md += `\n`;
      }
    }
  }

  // 7. Chiusura e termine
  md += `Si richiede la trasmissione dei dati sopra richiamati entro il termine di **${termineRisposta}** dal ricevimento della presente, in un formato elettronico elaborabile, al fine di non ritardare la prosecuzione del tavolo negoziale.\n\n`;

  md += `Certi di un tempestivo riscontro e della consueta collaborazione, si porgono distinti saluti.\n\n`;

  md += `**Firma:**\n`;
  md += `*${firmatario}*\n`;
  md += `Rappresentanza Sindacale / Segreteria Territoriale **${organizzazione}**\n`;

  return md;
};
