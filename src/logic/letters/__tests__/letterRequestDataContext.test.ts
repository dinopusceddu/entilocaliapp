import { describe, it, expect } from 'vitest';
import { buildLetterContext } from '../letterRequestDataContext';
import { FundData } from '../../../domain/types';
import { TipologiaEnte } from '../../../domain/enums';

describe('letterRequestDataContext', () => {
    const mockFundData: FundData = {
        annualData: {
            annoRiferimento: 2026,
            denominazioneEnte: 'Comune di Test',
            tipologiaEnte: TipologiaEnte.COMUNE,
            hasDirigenza: true,
            manualDipendentiEquivalenti2018: 100,
            simulatoreInput: {
                simStipendiTabellari2023: 1500000,
                simSpesaPersonaleConsuntivo2023: 4000000,
            },
            ccnl2024: {
                monteSalari2021: 1200000
            }
        },
        historicalData: {
            fondoSalarioAccessorioPersonaleNonDirEQ2016: 500000,
        }
    } as any;

    it('should build a complete context from FundData', () => {
        const context = buildLetterContext(mockFundData, { firmatario: 'Dino', organizzazione: 'CGIL' });
        
        expect(context.ente.denominazione).toBe('Comune di Test');
        expect(context.annoRiferimento).toBe(2026);
        expect(context.dataStatus.fondo2016).toBe(true);
        expect(context.dataStatus.fte2018).toBe(true);
        expect(context.dataStatus.stipendi2023).toBe(true);
        expect(context.dataStatus.monteSalari2021).toBe(true);
        
        // Dati mancanti
        expect(context.dataStatus.entrate2021_2023).toBe(false);
        expect(context.dataStatus.tettoSpesa).toBe(false);
        
        expect(context.customOptions?.firmatario).toBe('Dino');
    });

    it('should handle missing data in FundData', () => {
        const emptyFundData: FundData = {
            annualData: {
                annoRiferimento: 2025,
                tipologiaEnte: TipologiaEnte.UNIONE_COMUNI,
                simulatoreInput: {},
            },
            historicalData: {}
        } as any;

        const context = buildLetterContext(emptyFundData);
        
        expect(context.ente.denominazione).toContain('INSERIRE');
        expect(context.dataStatus.fondo2016).toBe(false);
        expect(context.dataStatus.stipendi2023).toBe(false);
    });
});
