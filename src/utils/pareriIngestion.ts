import { NormativaArticle, NormativaSchedaGuida, ParereAranRecord } from '../types';

/**
 * Utility per il parsing del file TXT dei pareri ARAN e la correlazione automatica.
 */

const RISPOSTA_STARTS = [
    'Con riferimento', 'Si evidenzia', 'Al riguardo', 'In merito', 'In proposito',
    'Si fa presente', 'Si rappresenta', 'Occorre preliminarmente', 'Premesso che',
    'Si osserva che', 'Si precisa che', 'Nella fattispecie', 'In via preliminare',
    'Sentito il parere', 'Ad avviso di questa Agenzia', 'Al riguardo si fa',
    'Con riguardo', 'Per quanto concerne', 'In ordine al',
];

export interface StagedParere extends Partial<ParereAranRecord> {
    aranId: string;
    hashContenuto: string;
    quesito: string;
    risposta: string;
    argomenti: string[];
    hashTagsArgomento: string[];
    dataPubblicazione?: string;
    qaFlags: string[];
    parseStatus: 'ok' | 'warning' | 'error';
    needsEditorialReview: boolean;
}

/**
 * Normalizza testo per il calcolo dell'hash
 */
export function normalizzaTesto(str: string): string {
    if (!str) return '';
    return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Calcola hash SHA-256 del contenuto (quesito + risposta)
 */
export async function calculateHash(quesito: string, risposta: string): Promise<string> {
    const content = normalizzaTesto(quesito) + '\n' + normalizzaTesto(risposta);
    const msgBuffer = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Separa quesito e risposta da un blocco di testo
 */
export function separaQuesitoRisposta(contenuto: string) {
    let bestPos = -1;
    for (const marker of RISPOSTA_STARTS) {
        const pos = contenuto.indexOf(marker, 50); // skip primi 50 char (titolo/premessa)
        if (pos !== -1 && (bestPos === -1 || pos < bestPos)) bestPos = pos;
    }

    if (bestPos === -1) return { quesito: contenuto.trim(), risposta: '', splittato: false };

    return {
        quesito: contenuto.substring(0, bestPos).trim(),
        risposta: contenuto.substring(bestPos).trim(),
        splittato: true,
    };
}

/**
 * Valuta la qualità del parere filtrato
 */
function valutaQualita(quesito: string, risposta: string, splittato: boolean) {
    const flags: string[] = [];
    if (!risposta || risposta.trim().length === 0) flags.push('risposta_vuota');
    if (quesito && risposta && normalizzaTesto(quesito).substring(0, 80) === normalizzaTesto(risposta).substring(0, 80)) {
        flags.push('quesito_uguale_risposta');
    }
    if (!splittato) flags.push('split_incerto');

    const parseStatus = flags.includes('quesito_uguale_risposta') ? 'error'
        : flags.length > 0 ? 'warning' : 'ok';

    return { qaFlags: flags, parseStatus, needsEditorialReview: flags.length > 0 };
}

/**
 * Parsing del file TXT in una lista di record pareri
 */
export async function parsePareriTxt(content: string): Promise<StagedParere[]> {
    const blocks = content.split('===').map(b => b.trim()).filter(Boolean);
    const results: StagedParere[] = [];

    for (const block of blocks) {
        const lines = block.split('\n').map(l => l.trim());
        let id = '';
        let dataPubblicazione = '';
        const contenutoLines: string[] = [];
        const argomenti: string[] = [];
        const hashTagsArgomento: string[] = [];
        let fase: 'header' | 'content' | 'argomento' = 'header';

        for (const line of lines) {
            if (!line) continue;
            if (line.startsWith('Id:')) {
                id = line.replace('Id:', '').trim();
                continue;
            }
            if (line.startsWith('Data pubblicazione')) {
                dataPubblicazione = line.replace('Data pubblicazione', '').trim();
                fase = 'content';
                continue;
            }
            if (line === 'Argomento') {
                fase = 'argomento';
                continue;
            }

            if (fase === 'content') {
                contenutoLines.push(line);
            } else if (fase === 'argomento' && line.startsWith('#')) {
                const tag = line.substring(1).trim();
                hashTagsArgomento.push('#' + tag);
                argomenti.push(tag);
            }
        }

        const contenutoCompleto = contenutoLines.join('\n').trim();
        if (!id || !contenutoCompleto) continue;

        const { quesito, risposta, splittato } = separaQuesitoRisposta(contenutoCompleto);
        const { qaFlags, parseStatus, needsEditorialReview } = valutaQualita(quesito, risposta, splittato);
        const hashContenuto = await calculateHash(quesito, risposta);

        results.push({
            aranId: id,
            dataPubblicazione,
            quesito,
            risposta,
            argomenti,
            hashTagsArgomento,
            hashContenuto,
            qaFlags,
            parseStatus: parseStatus as 'ok' | 'warning' | 'error',
            needsEditorialReview,
        });
    }

    return results;
}

/**
 * Suggerisce correlazioni automatiche basate sui tag
 */
export function suggestCorrelations(
    parere: StagedParere,
    articles: NormativaArticle[],
    schede: NormativaSchedaGuida[]
): { articoli: string[]; schede: string[] } {
    const articoliIds: string[] = [];
    const schedeIds: string[] = [];

    const tags = parere.argomenti.map(t => t.toLowerCase());

    // 1. Suggerimento Schede
    for (const scheda of schede) {
        const titolo = scheda.titolo.toLowerCase();
        // Match se un tag è contenuto nel titolo o viceversa
        if (tags.some(tag => titolo.includes(tag) || tag.includes(titolo))) {
            schedeIds.push(scheda.id);
        }
    }

    // 2. Suggerimento Articoli
    for (const article of articles) {
        const label = article.label.toLowerCase();
        const testo = article.testoIntegrale?.toLowerCase() || '';

        // Match se un tag è contenuto nel titolo dell'articolo
        if (tags.some(tag => label.includes(tag))) {
            articoliIds.push(article.id);
            continue;
        }

        // Match se almeno 2 keyword distintive dei tag sono presenti nel testo (semplificato)
        const matchCount = tags.filter(tag => testo.includes(tag)).length;
        if (matchCount >= 1 && tags.length > 0) {
            // Per gli articoli siamo più selettivi: serve un tag esatto
            if (tags.some(tag => testo.includes(` ${tag} `) || testo.includes(` ${tag}.`) || testo.includes(` ${tag},`))) {
                articoliIds.push(article.id);
            }
        }
    }

    return { 
        articoli: [...new Set(articoliIds)].slice(0, 5), // limite 5 suggerimenti
        schede: [...new Set(schedeIds)].slice(0, 3)     // limite 3 suggerimenti
    };
}
