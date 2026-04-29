import { describe, it, expect } from 'vitest';
import { createDocumentViewModel } from './documentPresenter';
import { CalculationResult } from '../domain';

describe('DocumentPresenter', () => {
    const mockResult: Partial<CalculationResult> = {
        metadata: { annoRiferimento: 2029 } as any,
        inputs: { tipoEnte: 'Comune', hasDirigenza: true } as any,
        fondi: {
            dipendente: {
                label: 'Fondo Dipendenti',
                summary: { totaleFondo: 100000 },
                constitution: {
                    sections: {
                        stabili: { title: 'Stabili', total: 60000, items: [{ description: 'Voce 1', amount: 60000, riferimentoNormativo: 'Art. 1' }] },
                        stabili_non_soggette: { title: 'Stabili NS', total: 10000, items: [] },
                        variabili_soggette: { title: 'Variabili S', total: 20000, items: [] },
                        variabili_non_soggette: { title: 'Variabili NS', total: 10000, items: [] },
                        decurtazioni: { title: 'Tagli', total: 0, items: [] }
                    }
                }
            },
            eq: { label: 'EQ', summary: { totaleFondo: 5000 } },
            segretario: { label: 'Segretario', summary: { totaleFondo: 2000 } },
            dirigenza: { label: 'Dirigenza', summary: { totaleFondo: 3000 } }
        } as any,
        compliance: {
            art23c2: {
                limite: 90000,
                valoreSoggetto: 80000,
                delta: 10000,
                isCompliant: true
            }
        } as any
    };

    it('dovrebbe mappare correttamente il CalculationResult in DocumentViewModel', () => {
        const user = { name: 'Dino', role: 'ADMIN' };
        const vm = createDocumentViewModel(mockResult as CalculationResult, 'Comune di Prova', user);

        expect(vm.ente.denominazione).toBe('Comune di Prova');
        expect(vm.ente.anno).toBe(2029);
        expect(vm.fondi.dipendente.totale).toBe(100000);
        expect(vm.fondi.dipendente.sezioni.stabiliSoggette.items[0].desc).toBe('Voce 1');
        expect(vm.compliance.art23c2.isCompliant).toBe(true);
        expect(vm.metadati.versioneMotore).toContain('Sprint6');
    });
});
