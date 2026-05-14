import { describe, it, expect } from 'vitest';
import { calculateIvcReduction } from '../ivcCalculations';
import { calculateAbsorbedIndennitaComparto } from '../personaleCalculations';
import { AreaQualifica, IvcConglobationData, PersonaleServizioDettaglio, NormativeData } from '../../domain';
import { IVC_VALUES } from '../../constants';

describe('Audit Art. 60 CCNL 2026 - Conglobamento Indennità di Comparto', () => {

    // Casi 1-4: Full-time per ogni area
    const testCasesFT = [
        { area: AreaQualifica.FUNZIONARIO_EQ, expected: IVC_VALUES[AreaQualifica.FUNZIONARIO_EQ], label: 'Caso 1 — Funzionario/EQ full-time' },
        { area: AreaQualifica.ISTRUTTORE, expected: IVC_VALUES[AreaQualifica.ISTRUTTORE], label: 'Caso 2 — Istruttore full-time' },
        { area: AreaQualifica.OPERATORE_ESPERTO, expected: IVC_VALUES[AreaQualifica.OPERATORE_ESPERTO], label: 'Caso 3 — Operatore Esperto full-time' },
        { area: AreaQualifica.OPERATORE, expected: IVC_VALUES[AreaQualifica.OPERATORE], label: 'Caso 4 — Operatore full-time' },
    ];

    testCasesFT.forEach(({ area, expected, label }) => {
        it(label, () => {
            const data: IvcConglobationData = {
                mode: 'aggregated',
                aggregatedCounts: { [area]: 1 },
                analyticEmployees: [],
                totalReduction: 0
            };
            const result = calculateIvcReduction(data);
            expect(result).toBeCloseTo(expected, 2);
        });
    });

    // Caso 5: Part-time
    it('Caso 5 — Part-time (Funzionario/EQ al 50%)', () => {
        const data: IvcConglobationData = {
            mode: 'analytic',
            aggregatedCounts: {},
            analyticEmployees: [
                { id: '1', area: AreaQualifica.FUNZIONARIO_EQ, partTimePercentage: 50 }
            ],
            totalReduction: 0
        };
        const result = calculateIvcReduction(data);
        const expected = IVC_VALUES[AreaQualifica.FUNZIONARIO_EQ] * 0.5;
        expect(result).toBeCloseTo(expected, 2); 
    });

    // Caso 6: Verifica anti-13 mensilità
    it('Caso 6 — Verifica anti-13 mensilità (non deve mai restituire valori basati su 13)', () => {
        const data: IvcConglobationData = {
            mode: 'aggregated',
            aggregatedCounts: {
                [AreaQualifica.FUNZIONARIO_EQ]: 1,
                [AreaQualifica.ISTRUTTORE]: 1,
                [AreaQualifica.OPERATORE_ESPERTO]: 1,
                [AreaQualifica.OPERATORE]: 1
            },
            analyticEmployees: [],
            totalReduction: 0
        };

        const result = calculateIvcReduction(data);
        
        // Calcolo errato basato su 13 mensilità (se i valori fossero mensili)
        const wrongTotal = (10.62 * 13) + (9.40 * 13) + (8.06 * 13) + (6.63 * 13);
        
        expect(result).not.toBeCloseTo(wrongTotal, 2);
        
        const expectedTotal = IVC_VALUES[AreaQualifica.FUNZIONARIO_EQ] + 
                              IVC_VALUES[AreaQualifica.ISTRUTTORE] + 
                              IVC_VALUES[AreaQualifica.OPERATORE_ESPERTO] + 
                              IVC_VALUES[AreaQualifica.OPERATORE];
                              
        expect(result).toBeCloseTo(expectedTotal, 2);
    });

    // Caso 7 — Separazione tra riduzione e distribuzione
    it('Caso 7 — Separazione tra riduzione e distribuzione (l\'indennità di comparto distribuita deve restare distinta)', () => {
        // Mock dati normativi per la distribuzione
        const mockNormative: Partial<NormativeData> = {
            indennita_comparto_values: {
                [AreaQualifica.FUNZIONARIO_EQ]: 435.96,
                [AreaQualifica.ISTRUTTORE]: 384.72,
                [AreaQualifica.OPERATORE_ESPERTO]: 330.24,
                [AreaQualifica.OPERATORE]: 272.16
            }
        };

        const employees: PersonaleServizioDettaglio[] = [
            { id: '1', areaQualifica: AreaQualifica.FUNZIONARIO_EQ, fullYearService: true, partTimePercentage: 100 }
        ];

        // 1. Verifichiamo la distribuzione (Utilizzo)
        const distribuzione = calculateAbsorbedIndennitaComparto(employees, 2026, mockNormative as any);
        expect(distribuzione).toBe(435.96);

        // 2. Verifichiamo la riduzione (Costituzione)
        const riduzioneData: IvcConglobationData = {
            mode: 'aggregated',
            aggregatedCounts: { [AreaQualifica.FUNZIONARIO_EQ]: 1 },
            analyticEmployees: [],
            totalReduction: 0
        };
        const riduzione = calculateIvcReduction(riduzioneData);
        expect(riduzione).toBe(IVC_VALUES[AreaQualifica.FUNZIONARIO_EQ]);

        // Verifica che siano importi diversi
        expect(riduzione).not.toBe(distribuzione);
    });
});
