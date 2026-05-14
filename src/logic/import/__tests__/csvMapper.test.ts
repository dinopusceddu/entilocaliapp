import { describe, it, expect } from 'vitest';
import { mapCsvRowToFundData } from '../csvMapper.ts';
import { ImportDatiGeneraliRow } from '../../../schemas/importSchema.ts';
import { TipologiaEnte } from '../../../enums.ts';
import { FundData } from '../../../domain/types.ts';

describe('csvMapper', () => {
    const mockFundData: FundData = {
        historicalData: {},
        annualData: {
            annoRiferimento: 2026,
            simulatoreInput: {},
            proventiSpecifici: [],
            personaleServizioAttuale: [],
            personale2018PerArt23: [],
            personaleAnnoRifPerArt23: [],
        },
        fondoAccessorioDipendenteData: {},
        fondoElevateQualificazioniData: {},
        fondoSegretarioComunaleData: {},
        fondoDirigenzaData: {},
        distribuzioneRisorseData: {},
        personaleServizio: { dettagli: [] }
    } as any;

    const mockRow: ImportDatiGeneraliRow = {
        anno: 2026,
        denominazione_ente: 'Ente Test',
        tipologia_ente: TipologiaEnte.COMUNE,
        numero_abitanti: 10000,
        has_dirigenza: true,
        monte_salari_2021: 1000000,
        fondo_personale_2016: 50000,
        fondo_eq_2016: 10000,
        fondo_dirigenza_2016: 5000,
        risorse_segretario_2016: 2000,
        fondo_straordinario_2016: 15000,
        fondo_personale_2018: 55000,
        fondo_eq_2018: 11000,
        personale_fte_2018: 25.5,
        stipendi_tabellari_2023: 900000,
        spesa_personale_2023: 2000000,
        media_entrate_correnti: 5000000,
        tetto_spesa_l296: 2500000,
        costo_assunzioni_piao: 100000,
    };

    it('should map a valid row to FundData structure', () => {
        const { mappedData, previewRows } = mapCsvRowToFundData(mockRow, mockFundData);
        
        expect(mappedData.annualData?.denominazioneEnte).toBe('Ente Test');
        expect(mappedData.historicalData?.fondoSalarioAccessorioPersonaleNonDirEQ2016).toBe(50000);
        expect(mappedData.annualData?.simulatoreInput?.simStipendiTabellari2023).toBe(900000);
        expect(mappedData.annualData?.ccnl2024?.monteSalari2021).toBe(1000000);
        
        expect(previewRows).toHaveLength(19);
        expect(previewRows.every(r => r.status === 'modificato' || r.status === 'nuovo')).toBe(true);
    });

    it('should identify unchanged fields', () => {
        const dataWithSameName = {
            ...mockFundData,
            annualData: { ...mockFundData.annualData, denominazioneEnte: 'Ente Test' }
        };
        const { previewRows } = mapCsvRowToFundData(mockRow, dataWithSameName);
        const nameRow = previewRows.find(r => r.path === 'annualData.denominazioneEnte');
        expect(nameRow?.status).toBe('invariato');
    });

    it('should generate a warning for missing dirigenza fund when has_dirigenza is true', () => {
        const rowWithWarning = { ...mockRow, fondo_dirigenza_2016: 0 };
        const { previewRows } = mapCsvRowToFundData(rowWithWarning, mockFundData);
        const dirRow = previewRows.find(r => r.path === 'historicalData.fondoDirigenza2016');
        expect(dirRow?.status).toBe('warning');
        expect(dirRow?.message).toContain('fondo 2016 assente');
    });
});
