import { describe, it, expect } from 'vitest';
import { generateRequestDataLetterMarkdown } from '../letterRequestDataGenerator';
import { LetterRequestDataContext } from '../letterRequestDataTypes';
import { TipologiaEnte } from '../../../domain/enums';

describe('letterRequestDataGenerator', () => {
    const mockContext: LetterRequestDataContext = {
        ente: {
            denominazione: 'Comune di Test',
            tipologia: TipologiaEnte.COMUNE,
            hasDirigenza: false,
        },
        annoRiferimento: 2026,
        dataGenerazione: '14 Maggio 2026',
        dataStatus: {
            fondo2016: true,
            fondo2018: false,
            fte2018: true,
            stipendi2023: false,
            spesaPersonale2023: true,
            entrate2021_2023: false,
            monteSalari2021: true,
            tettoSpesa: false,
            piao: false,
        },
        values: {},
        customOptions: {
            firmatario: 'Dino Pusceddu',
            organizzazione: 'FP CGIL'
        }
    };

    it('should generate a markdown letter with placeholders for missing data', () => {
        const markdown = generateRequestDataLetterMarkdown(mockContext);
        
        expect(markdown).toContain('Comune di Test');
        expect(markdown).toContain('Anno 2026');
        expect(markdown).toContain('Dino Pusceddu');
        
        // Verifica segnaposto per dati presenti
        expect(markdown).toContain('[Dato già presente a sistema] - Ammontare complessivo delle risorse certificate per l’anno 2016.');
        
        // Verifica segnaposto per dati mancanti
        expect(markdown).toContain('[DATO DA RICHIEDERE] - Valore delle risorse stabili del Fondo certificate per l’anno 2018.');
        expect(markdown).toContain('[DATO DA RICHIEDERE] - Spesa sostenuta nel 2023 per stipendi tabellari');
    });

    it('should include dirigenza section if hasDirigenza is true', () => {
        const contextWithDirigenza = {
            ...mockContext,
            ente: { ...mockContext.ente, hasDirigenza: true }
        };
        const markdown = generateRequestDataLetterMarkdown(contextWithDirigenza);
        
        expect(markdown).toContain('### 5. Sezione Dirigenza');
        expect(markdown).toContain('Ammontare Fondo Dirigenza 2016');
    });

    it('should NOT include dirigenza section if hasDirigenza is false', () => {
        const markdown = generateRequestDataLetterMarkdown(mockContext);
        expect(markdown).not.toContain('### 5. Sezione Dirigenza');
    });
});
