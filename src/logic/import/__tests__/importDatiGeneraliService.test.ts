import { describe, it, expect } from 'vitest';
import { importDatiGeneraliFromCsv } from '../importDatiGeneraliService.ts';
import { FundData } from '../../../domain/types.ts';

describe('importDatiGeneraliService', () => {
    const mockFundData: FundData = {
        historicalData: {},
        annualData: {
            annoRiferimento: 2026,
            simulatoreInput: {},
            ccnl2024: {}
        }
    } as any;

    const createMockFile = (content: string, name: string = 'test.csv') => {
        return new File([content], name, { type: 'text/csv' });
    };

    it('should successfully process a valid CSV file', async () => {
        const csv = 'anno;denominazione_ente;tipologia_ente;numero_abitanti;has_dirigenza\n2026;Comune OK;COMUNE;5000;No';
        const file = createMockFile(csv);
        
        const result = await importDatiGeneraliFromCsv(file, mockFundData, 2026);
        
        expect(result.success).toBe(true);
        expect(result.mappedData?.annualData?.denominazioneEnte).toBe('Comune OK');
        expect(result.errors).toHaveLength(0);
    });

    it('should return error if year mismatch', async () => {
        const csv = 'anno;denominazione_ente;tipologia_ente;numero_abitanti;has_dirigenza\n2025;Comune Errato;COMUNE;5000;No';
        const file = createMockFile(csv);
        
        const result = await importDatiGeneraliFromCsv(file, mockFundData, 2026);
        
        expect(result.success).toBe(false);
        expect(result.errors[0].message).toContain('non coincide con l\'anno aperto');
    });

    it('should return error for invalid data types', async () => {
        const csv = 'anno;denominazione_ente;tipologia_ente;numero_abitanti;has_dirigenza\n2026;A;NON_ESISTE;test;forse';
        const file = createMockFile(csv);
        
        const result = await importDatiGeneraliFromCsv(file, mockFundData, 2026);
        
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle Italian number formats correctly', async () => {
        const csv = 'anno;denominazione_ente;tipologia_ente;numero_abitanti;has_dirigenza;monte_salari_2021\n2026;Ente IT;COMUNE;1.500,00;No;1.200.000,50';
        const file = createMockFile(csv);
        
        const result = await importDatiGeneraliFromCsv(file, mockFundData, 2026);
        
        expect(result.success).toBe(true);
        expect(result.mappedData?.annualData?.numeroAbitanti).toBe(1500);
        expect(result.mappedData?.annualData?.ccnl2024?.monteSalari2021).toBe(1200000.5);
    });
});
