import { CalculationResult, User, DocumentMetadata } from '../../domain/index.ts';
import { createDocumentViewModel, DocumentViewModel } from '../../presenters/documentPresenter.ts';
import { buildDeterminaV2 } from '../templates/determinaTemplateV2.ts';
import { generateRelazioneTecnicaTXT } from '../templates/relazioneTecnicaTemplate.ts';
import { generateDeterminaPDF } from './pdfDeterminaService.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import FinancialMath from '../../utils/financialMath.ts';
import { saveAs } from 'file-saver';
import { DOCUMENT_KINDS, assertDocumentFinalReady, resolveDocumentKindReadiness } from '../../domain/documentKindReadiness';
import type { DocumentKind, DocumentKindReadiness, DocumentOutputOptions } from '../../domain/documentKindReadiness';
import { resolveChecklist } from '../../logic/cabina/resolveChecklist';
import type { ComplianceCheck } from '../../domain';

/**
 * Genera il contenuto testuale del Prospetto per la Contrattazione Integrativa.
 */
export const buildProspettoContrattazione = (vm: DocumentViewModel, options?: DocumentOutputOptions): string => {
    const dip = vm.fondi.dipendente;
    const isDraftOutput = options?.mode === 'DRAFT_PREVIEW' || vm.isDraft || !vm.determina || vm.determina.exportReadiness !== 'DOCUMENT_FINAL_READY';
    const grossStabile = FinancialMath.addExact(
        dip.sezioni.stabiliSoggette.total,
        dip.sezioni.stabiliNonSoggette.total
    );
    const netStabile = FinancialMath.subtractExact(grossStabile, dip.sezioni.decurtazioni.total);
    const varTot = FinancialMath.addExact(
        dip.sezioni.variabiliSoggette.total,
        dip.sezioni.variabiliNonSoggette.total
    );

    let content = '';
    if (isDraftOutput) {
        content += `[BOZZA NON DEFINITIVA - IN ISTRUTTORIA]\n\n`;
        if (options?.draftReason) content += `Motivo: ${options.draftReason}\n\n`;
    }

    const isDetermined = !isDraftOutput && dip.isDetermined && dip.totale !== null;

    if (isDetermined) {
        content += `PROSPETTO SINTETICO PER CONTRATTAZIONE - ANNO ${vm.ente.anno}\n\n` +
                   `Ente: ${vm.ente.denominazione}\n` +
                   `Totale Disponibile Fondo Dipendenti: ${dip.formattedTotale}\n\n` +
                   `Dettaglio Risorse:\n` +
                   `- Stabili: ${formatCurrency(netStabile)}\n` +
                   `- Variabili: ${formatCurrency(varTot)}\n\n`;
    } else {
        content += `PROSPETTO SINTETICO PER CONTRATTAZIONE - ANNO ${vm.ente.anno}\n\n` +
                   `Ente: ${vm.ente.denominazione}\n` +
                   `Subtotale Risorse Verificate: ${dip.formattedVerifiedSubtotal}\n` +
                   (dip.isDetermined && options?.draftReason
                     ? `Totale economico canonico: ${dip.formattedTotale} (documento non definitivo)\n\n`
                     : `Totale Complessivo Fondo: NON ANCORA DETERMINABILE\n\n`) +
                   `Dettaglio Risorse Verificate:\n` +
                   `- Stabili: ${formatCurrency(netStabile)}\n` +
                   `- Variabili: ${formatCurrency(varTot)}\n\n`;
    }

    if (vm.unresolvedItems && vm.unresolvedItems.length > 0) {
        content += `Voci in attesa di definizione / istruttoria:\n`;
        for (const item of vm.unresolvedItems) {
            content += `- ${item.description}: ${item.formattedAmount} (${item.reason || item.status})\n`;
        }
        content += `\n`;
    }

    content += `Documento generato il ${vm.metadati.dataGenerazione}`;
    return content;
};

/**
 * AG-127 / Wave 3: Factory unificata per la modulistica amministrativa.
 * Coordina Presenter e Template per produrre documenti certificati
 * alimentati direttamente dal Canonical Fund Ledger.
 */
export class DocumentFactory {
    private viewModel: DocumentViewModel;
    private hasCanonicalFund: boolean;
    private readiness: Record<DocumentKind, DocumentKindReadiness>;

    constructor(result: CalculationResult, ente: string, user: User, docMeta?: DocumentMetadata, complianceChecks: readonly ComplianceCheck[] = []) {
        this.hasCanonicalFund = !!result.canonicalFund;
        const issues = resolveChecklist({ canonicalFund: result.canonicalFund, complianceChecks });
        this.readiness = Object.fromEntries(DOCUMENT_KINDS.map(documentKind => [documentKind,
            resolveDocumentKindReadiness({ documentKind, canonicalFund: result.canonicalFund, issues })
        ])) as Record<DocumentKind, DocumentKindReadiness>;
        this.viewModel = createDocumentViewModel(result, ente, {
            name: user.name || 'Operatore',
            role: user.role || 'UTENTE'
        }, docMeta);
    }

    /**
     * Restituisce il ViewModel interno per ispezione / test.
     */
    public getViewModel(): DocumentViewModel {
        return this.viewModel;
    }

    /**
     * Verifica se il documento può procedere all'export definitivo formale.
     * Blocca se canonicalFund è assente o se il fondo non è determinato.
     */
    public getReadiness(kind: DocumentKind): DocumentKindReadiness {
        return this.readiness[kind];
    }

    public isDefinitiveExportReady(kind: DocumentKind = 'DETERMINA'): boolean {
        return this.getReadiness(kind).status === 'FINAL_READY';
    }

    /**
     * Asserisce che l'export definitivo sia consentito, sollevando eccezione controllata in caso contrario.
     */
    public assertDefinitiveExportAllowed(kind: DocumentKind = 'DETERMINA'): void {
        if (!this.hasCanonicalFund) {
            throw new Error('Export definitivo bloccato: CalculationResult privo di CanonicalFundLedger. Consentita solo anteprima legacy.');
        }
        assertDocumentFinalReady(this.getReadiness(kind));
    }

    private outputOptions(kind: DocumentKind, requested?: DocumentOutputOptions): DocumentOutputOptions {
        if (requested?.mode === 'DEFINITIVE_EXPORT') this.assertDefinitiveExportAllowed(kind);
        const readiness = this.getReadiness(kind);
        return {
            mode: requested?.mode ?? readiness.mode,
            draftReason: readiness.primaryReason ?? undefined,
        };
    }

    /**
     * Esegue l'export definitivo della Determina (TXT). Blocca se non consentito.
     */
    public exportDefinitiveDetermina(): void {
        this.assertDefinitiveExportAllowed();
        this.generateDetermina({ mode: 'DEFINITIVE_EXPORT' });
    }

    /**
     * Esegue l'export definitivo della Determina (PDF). Blocca se non consentito.
     */
    public exportDefinitiveDeterminaPDF(): void {
        this.assertDefinitiveExportAllowed();
        this.generateDeterminaDocumentPDF({ mode: 'DEFINITIVE_EXPORT' });
    }

    /**
     * Esegue l'export definitivo della Relazione Tecnica (TXT). Blocca se non consentito.
     */
    public exportDefinitiveRelazioneTecnica(): void {
        this.assertDefinitiveExportAllowed('RELAZIONE');
        this.generateRelazioneTecnica({ mode: 'DEFINITIVE_EXPORT' });
    }

    /**
     * Esegue l'export definitivo del Prospetto Contrattazione (TXT). Blocca se non consentito.
     */
    public exportDefinitiveProspetto(): void {
        this.assertDefinitiveExportAllowed('PROSPETTO');
        this.generateProspettoContrattazione({ mode: 'DEFINITIVE_EXPORT' });
    }

    /**
     * Genera la bozza/anteprima della Determina (TXT) con modalità esplicita DRAFT_PREVIEW.
     */
    public previewDraftDetermina(): void {
        this.generateDetermina({ mode: 'DRAFT_PREVIEW' });
    }

    /**
     * Genera la bozza/anteprima della Determina (PDF) con modalità esplicita DRAFT_PREVIEW.
     */
    public previewDraftDeterminaPDF(): void {
        this.generateDeterminaDocumentPDF({ mode: 'DRAFT_PREVIEW' });
    }

    /**
     * Genera la bozza/anteprima della Relazione Tecnica (TXT) con modalità esplicita DRAFT_PREVIEW.
     */
    public previewDraftRelazioneTecnica(): void {
        this.generateRelazioneTecnica({ mode: 'DRAFT_PREVIEW' });
    }

    /**
     * Genera la bozza/anteprima del Prospetto Contrattazione (TXT) con modalità esplicita DRAFT_PREVIEW.
     */
    public previewDraftProspetto(): void {
        this.generateProspettoContrattazione({ mode: 'DRAFT_PREVIEW' });
    }

    /**
     * Genera la Determina di Costituzione del Fondo (TXT).
     */
    public generateDetermina(options?: DocumentOutputOptions): void {
        options = this.outputOptions('DETERMINA', options);
        const isDraftMode = options?.mode === 'DRAFT_PREVIEW' || this.viewModel.isDraft;
        const content = buildDeterminaV2(this.viewModel, options);
        const prefix = !this.hasCanonicalFund ? 'Determina_LEGACY_PREVIEW_' : (isDraftMode ? 'Determina_BOZZA_' : 'Determina_Costituzione_Fondo_');
        this.downloadFile(
            content, 
            `${prefix}${this.viewModel.ente.anno}.txt`,
            'text/plain;charset=utf-8'
        );
    }

    /**
     * Genera la Determina di Costituzione del Fondo (PDF).
     */
    public generateDeterminaDocumentPDF(options?: DocumentOutputOptions): void {
        options = this.outputOptions('DETERMINA', options);
        generateDeterminaPDF(this.viewModel, options);
    }

    /**
     * Genera la Relazione Tecnico-Finanziaria (TXT).
     */
    public generateRelazioneTecnica(options?: DocumentOutputOptions): void {
        options = this.outputOptions('RELAZIONE', options);
        const isDraftMode = options?.mode === 'DRAFT_PREVIEW' || this.viewModel.isDraft;
        const content = generateRelazioneTecnicaTXT(this.viewModel, options);
        const prefix = !this.hasCanonicalFund ? 'Relazione_LEGACY_PREVIEW_' : (isDraftMode ? 'Relazione_BOZZA_' : 'Relazione_Tecnica_Fondo_');
        this.downloadFile(
            content, 
            `${prefix}${this.viewModel.ente.anno}.txt`,
            'text/plain;charset=utf-8'
        );
    }

    /**
     * Genera il Prospetto per la Contrattazione (TXT).
     */
    public generateProspettoContrattazione(options?: DocumentOutputOptions): void {
        options = this.outputOptions('PROSPETTO', options);
        const isDraftMode = options?.mode === 'DRAFT_PREVIEW' || this.viewModel.isDraft;
        const content = buildProspettoContrattazione(this.viewModel, options);
        const prefix = !this.hasCanonicalFund ? 'Prospetto_LEGACY_PREVIEW_' : (isDraftMode ? 'Prospetto_BOZZA_' : 'Prospetto_Contrattazione_');
        this.downloadFile(
            content, 
            `${prefix}${this.viewModel.ente.anno}.txt`,
            'text/plain;charset=utf-8'
        );
    }

    private downloadFile(content: string, filename: string, type: string): void {
        const blob = new Blob([content], { type });
        saveAs(blob, filename);
    }
}
