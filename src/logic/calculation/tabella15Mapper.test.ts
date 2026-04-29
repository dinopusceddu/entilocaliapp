import { describe, it, expect } from 'vitest';
import { mapToTabella15 } from './tabella15Mapper';
import { CalculationResult, NormativeData } from '../../domain';

describe('tabella15Mapper - AG-126', () => {
  const mockNorme = {
    riferimenti_normativi: {
      art67_ccnl2018: 'Art. 67'
    }
  } as unknown as NormativeData;

  const mockResult = {
    metadata: {
      annoRiferimento: 2026,
      denominazioneEnte: 'Comune Test'
    },
    fondi: {
      dipendente: {
        constitution: {
          sections: {
            stabili: {
              id: 'stabili',
              items: [
                { key: 'st_art79c1_art67c1_unicoImporto2017', description: 'Unico 2017', amount: 10000 },
                { key: 'st_art79c1_art67c2a_incr8320', description: 'Incr 83.20', amount: 2000 }
              ]
            },
            variabili: {
              id: 'variabili',
              items: [
                { key: 'vs_art4c3_art15c1k_art67c3c_recuperoEvasione', description: 'Evasione', amount: 5000 },
                { key: 'vn_art80c1_sommeNonUtilizzateStabiliPrec', description: 'Risparmi', amount: 3000 }
              ]
            }
          }
        }
      }
    }
  } as unknown as CalculationResult;

  it('deve mappare correttamente le voci stabili con i codici colonna', () => {
    const res = mapToTabella15(mockResult, mockNorme);
    
    expect(res.entityName).toBe('Comune Test');
    expect(res.year).toBe(2026);
    
    const s600 = res.sections.stabile.entries.find(e => e.columnCode === 'S600');
    expect(s600?.amount).toBe(10000);
    expect(s600?.source).toBe('Constitution/stabili');

    const s612 = res.sections.stabile.entries.find(e => e.columnCode === 'S612');
    expect(s612?.amount).toBe(2000);
  });

  it('deve mappare correttamente le voci variabili', () => {
    const res = mapToTabella15(mockResult, mockNorme);
    
    const v621 = res.sections.variabile.entries.find(e => e.columnCode === 'V621');
    expect(v621?.amount).toBe(5000);

    const v620 = res.sections.variabile.entries.find(e => e.columnCode === 'V620');
    expect(v620?.amount).toBe(3000);
  });

  it('deve calcolare correttamente i totali di sezione', () => {
    const res = mapToTabella15(mockResult, mockNorme);
    
    expect(res.sections.stabile.total).toBe(12000);
    expect(res.sections.variabile.total).toBe(8000);
    expect(res.grandTotal).toBe(20000);
  });
});
