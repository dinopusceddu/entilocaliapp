import { DocumentViewModel } from '../../presenters/documentPresenter';
import { formatCurrency } from '../../utils/formatters';
import FinancialMath from '../../utils/financialMath';

/**
 * AG-127 / Wave 3: Template per la Relazione Tecnico-Finanziaria.
 * Risolve DOC-02:
 * - Riconciliazione aritmetica esatta delle componenti con il totale generale.
 * - Esplicitazione dello stato di bozza/istruttoria in caso di dati incompleti o non determinati.
 * - Evidenza separata di voci in istruttoria escluse dal totale certificato.
 */
export const generateRelazioneTecnicaTXT = (vm: DocumentViewModel, options?: { mode?: 'DRAFT_PREVIEW' | 'DEFINITIVE_EXPORT' }): string => {
    const isDraftOutput = options?.mode === 'DRAFT_PREVIEW' || vm.isDraft || !vm.determina || vm.determina.exportReadiness !== 'DOCUMENT_FINAL_READY';
    const { ente, fondi, compliance, metadati } = vm;
    const dip = fondi.dipendente;

    const grossStabile = FinancialMath.addExact(
        dip.sezioni.stabiliSoggette.total,
        dip.sezioni.stabiliNonSoggette.total
    );
    const decurtazioniStabili = dip.sezioni.decurtazioni.total;
    const netStabile = FinancialMath.subtractExact(grossStabile, decurtazioniStabili);
    const varTot = FinancialMath.addExact(
        dip.sezioni.variabiliSoggette.total,
        dip.sezioni.variabiliNonSoggette.total
    );

    let txt = '';
    if (isDraftOutput) {
        txt += `[DOCUMENTO NON DEFINITIVO - BOZZA IN ISTRUTTORIA]\n`;
        txt += `AVVERTENZA: L'annualità contiene voci prive di istruttoria o requisiti normativi completi.\n`;
        txt += `I valori esposti rappresentano il subtotale verificato e non costituiscono quantificazione definitiva.\n\n`;
    }

    txt += `RELAZIONE TECNICO-FINANZIARIA AL FONDO RISORSE DECENTRATE - ANNO ${ente.anno}\n`;
    txt += `${'='.repeat(80)}\n\n`;

    txt += `1. QUADRO NORMATIVO DI RIFERIMENTO\n`;
    if (isDraftOutput) {
        txt += `La presente relazione viene redatta ai sensi dell'art. 40-bis del D.Lgs. 165/2001 in schema di proposta per l'istruttoria tecnico-finanziaria della costituzione del fondo.\n\n`;
    } else {
        txt += `La presente relazione viene redatta ai sensi dell'art. 40-bis del D.Lgs. 165/2001 per certificare la compatibilità economico-finanziaria della costituzione del fondo.\n\n`;
    }

    txt += `2. COMPOSIZIONE DEL FONDO (PERSONALE NON DIRIGENTE)\n`;
    txt += `Il fondo per l'anno ${ente.anno} risulta così composto:\n`;
    if (decurtazioniStabili > 0) {
        txt += `- Parte Stabile Lorda: Euro ${formatCurrency(grossStabile)}\n`;
        txt += `- Decurtazioni/Tagli Stabili: Euro -${formatCurrency(decurtazioniStabili)}\n`;
        txt += `- Parte Stabile Netta: Euro ${formatCurrency(netStabile)}\n`;
    } else {
        txt += `- Parte Stabile: Euro ${formatCurrency(grossStabile)}\n`;
    }
    txt += `- Parte Variabile: Euro ${formatCurrency(varTot)}\n`;

    const isDetermined = !isDraftOutput && dip.isDetermined && dip.totale !== null;
    if (isDetermined) {
        txt += `TOTALE GENERALE: Euro ${formatCurrency(dip.totale!)}\n\n`;
    } else {
        txt += `SUBTOTALE DELLE RISORSE VERIFICATE: Euro ${formatCurrency(dip.verifiedSubtotal)}\n`;
        txt += `TOTALE COMPLESSIVO DEL FONDO: NON ANCORA DETERMINABILE\n\n`;
    }

    if (vm.unresolvedItems && vm.unresolvedItems.length > 0) {
        txt += `COMPONENTI IN CORSO DI ISTRUTTORIA / DA DETERMINARE:\n`;
        for (const item of vm.unresolvedItems) {
            txt += `- ${item.description}: Euro ${item.formattedAmount} [Stato: ${item.status}] - ${item.reason || 'in corso di accertamento'}\n`;
        }
        txt += `\n`;
    }

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
    txt += `Generato il ${metadati.dataGenerazione} via DocumentFactory (versione ${metadati.versioneMotore})\n`;

    return txt;
};
