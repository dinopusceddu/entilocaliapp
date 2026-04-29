import { CalculationResult, User, DocumentMetadata } from '../../domain/index.ts';
import { createDocumentViewModel, DocumentViewModel } from '../../presenters/documentPresenter.ts';
import { buildDeterminaV2 } from '../templates/determinaTemplateV2.ts';
import { generateRelazioneTecnicaTXT } from '../templates/relazioneTecnicaTemplate.ts';
import { generateDeterminaPDF } from './pdfDeterminaService.ts';
import { saveAs } from 'file-saver';

/**
 * AG-127: Factory unificata per la modulistica amministrativa.
 * Coordina Presenter e Template per produrre documenti certificati.
 */
export class DocumentFactory {
    private viewModel: DocumentViewModel;

    constructor(result: CalculationResult, ente: string, user: User, docMeta?: DocumentMetadata) {
        this.viewModel = createDocumentViewModel(result, ente, {
            name: user.name || 'Operatore',
            role: user.role || 'UTENTE'
        }, docMeta);
    }

    /**
     * Genera la Determina di Costituzione del Fondo (TXT).
     */
    public generateDetermina(): void {
        const content = buildDeterminaV2(this.viewModel);
        this.downloadFile(
            content, 
            `Determina_Costituzione_Fondo_${this.viewModel.ente.anno}.txt`,
            'text/plain;charset=utf-8'
        );
    }

    /**
     * Genera la Determina di Costituzione del Fondo (PDF).
     */
    public generateDeterminaDocumentPDF(): void {
        generateDeterminaPDF(this.viewModel);
    }

    /**
     * Genera la Relazione Tecnico-Finanziaria (TXT).
     */
    public generateRelazioneTecnica(): void {
        const content = generateRelazioneTecnicaTXT(this.viewModel);
        this.downloadFile(
            content, 
            `Relazione_Tecnica_Fondo_${this.viewModel.ente.anno}.txt`,
            'text/plain;charset=utf-8'
        );
    }

    /**
     * Genera il Prospetto per la Contrattazione (TXT).
     */
    public generateProspettoContrattazione(): void {
        const content = `PROSPETTO SINTETICO PER CONTRATTAZIONE - ANNO ${this.viewModel.ente.anno}\n\n` +
                        `Ente: ${this.viewModel.ente.denominazione}\n` +
                        `Totale Disponibile Fondo Dipendenti: ${this.viewModel.fondi.dipendente.formattedTotale}\n\n` +
                        `Dettaglio Risorse:\n` +
                        `- Stabili: ${this.viewModel.fondi.dipendente.sezioni.stabiliSoggette.formattedTotal}\n` +
                        `- Variabili: ${this.viewModel.fondi.dipendente.sezioni.variabiliSoggette.formattedTotal}\n\n` +
                        `Documento generato il ${this.viewModel.metadati.dataGenerazione}`;
        
        this.downloadFile(
            content, 
            `Prospetto_Contrattazione_${this.viewModel.ente.anno}.txt`,
            'text/plain;charset=utf-8'
        );
    }

    private downloadFile(content: string, filename: string, type: string): void {
        const blob = new Blob([content], { type });
        saveAs(blob, filename);
    }
}
