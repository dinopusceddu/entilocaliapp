import { DocumentViewModel } from '../../presenters/documentPresenter';

/**
 * AG-127: Template per la Relazione Tecnico-Finanziaria.
 */
export const generateRelazioneTecnicaTXT = (vm: DocumentViewModel): string => {
    const { ente, fondi, compliance, metadati } = vm;
    const dip = fondi.dipendente;

    let txt = `RELAZIONE TECNICO-FINANZIARIA AL FONDO RISORSE DECENTRATE - ANNO ${ente.anno}\n`;
    txt += `${'='.repeat(80)}\n\n`;

    txt += `1. QUADRO NORMATIVO DI RIFERIMENTO\n`;
    txt += `La presente relazione viene redatta ai sensi dell'art. 40-bis del D.Lgs. 165/2001 per certificare la compatibilità economico-finanziaria della costituzione del fondo.\n\n`;

    txt += `2. COMPOSIZIONE DEL FONDO (PERSONALE NON DIRIGENTE)\n`;
    txt += `Il fondo per l'anno ${ente.anno} risulta così composto:\n`;
    txt += `- Parte Stabile: Euro ${dip.sezioni.stabiliSoggette.total + dip.sezioni.stabiliNonSoggette.total}\n`;
    txt += `- Parte Variabile: Euro ${dip.sezioni.variabiliSoggette.total + dip.sezioni.variabiliNonSoggette.total}\n`;
    txt += `- Decurtazioni/Tagli: Euro ${dip.sezioni.decurtazioni.total}\n`;
    txt += `TOTALE GENERALE: Euro ${dip.formattedTotale}\n\n`;

    txt += `3. VERIFICA DEL RISPETTO DEL LIMITE EX ART. 23 C. 2 DLGS 75/2017\n`;
    txt += `Ai fini della verifica del limite 2016, si sono computate le risorse soggette per un totale di Euro ${compliance.art23c2.formattedValoreSoggetto}.\n`;
    txt += `Il limite di riferimento è pari a Euro ${compliance.art23c2.formattedLimite}.\n`;
    txt += `Esito: ${compliance.art23c2.esitoLabel}.\n\n`;

    txt += `4. ALTRI FONDI\n`;
    txt += `- EQ: ${fondi.eq.formatted}\n`;
    txt += `- Segretario: ${fondi.segretario.formatted}\n`;
    if (fondi.dirigenza.active) {
        txt += `- Dirigenza: ${fondi.dirigenza.formatted}\n`;
    }

    txt += `\n${'-'.repeat(80)}\n`;
    txt += `Generato il ${metadati.dataGenerazione} via DocumentFactory\n`;

    return txt;
};
