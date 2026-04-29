import { describe, it, expect } from 'vitest';
import { calculateYearClosureCarryForward } from './closureCalculations';
import { CalculationResult } from '../../domain';

describe('closureCalculations - AG-124B', () => {
  it('deve calcolare il carry forward usando SOLO i campi risparmi (Caso 2 & 4)', () => {
    const mockResult = {
      fondi: {
        dipendente: {
          constitution: { sections: { stabili: { total: 100000 } } },
          utilization: { sections: { stabili: { total: 80000 } } } // Il motore ha allocato diversamente
        }
      },
      metadata: { annoRiferimento: 2026 }
    } as unknown as CalculationResult;

    const mockDistribuzione = {
      p_performanceIndividuale: { stanziate: 70000, risparmi: 20000 },
      p_performanceOrganizzativa: { stanziate: 10000 },
      u_incrIndennitaEducatori: { stanziate: 1000, risparmi: 5000 },
      non_matching_field: { risparmi: 999 } // Non deve essere contato
    };

    const carryForwardInfo = calculateYearClosureCarryForward(mockResult, mockDistribuzione);

    // Si attende 20000 + 5000 = 25000. Il "residuo" teorico (100000 - 80000 = 20000) viene IGNORATO.
    expect(carryForwardInfo.leftoverFad).toBe(25000);
  });

  it('deve calcolare 0 se non ci sono risparmi, anche in presenza di residui teorici (Caso 3)', () => {
    const mockResult = {
      fondi: {
        dipendente: {
          constitution: { sections: { stabili: { total: 100000 } } },
          utilization: { sections: { stabili: { total: 50000 } } }
        }
      },
      metadata: { annoRiferimento: 2026 }
    } as unknown as CalculationResult;

    const mockDistribuzione = {
      p_performanceIndividuale: { stanziate: 30000 },
      p_performanceOrganizzativa: { stanziate: 20000 }
    };

    const carryForwardInfo = calculateYearClosureCarryForward(mockResult, mockDistribuzione);

    expect(carryForwardInfo.leftoverFad).toBe(0);
  });

  it('deve calcolare i residui informativi per EQ, Dirigenza e Segretario', () => {
    const mockResult = {
      fondi: {
        dipendente: { summary: { totaleStabile: 1000 } }, // Ininfluente per i residui degli altri fondi qui
        eq: {
          summary: { totaleStabile: 5000 },
          utilization: {
            sections: {
              accessorie: { total: 3000 },
              differenziali: { total: 1000 }
            }
          }
        },
        dirigenza: {
          summary: { totaleStabile: 10000 },
          utilization: {
            sections: {
              main: { total: 9000 }
            }
          }
        },
        segretario: {
          summary: { totaleStabile: 2000 },
          utilization: {
            sections: {
              unico: { total: 2500 } // Over-utilization
            }
          }
        }
      },
      metadata: { annoRiferimento: 2026 }
    } as unknown as CalculationResult;

    const carryForwardInfo = calculateYearClosureCarryForward(mockResult, {});

    expect(carryForwardInfo.actualLeftoversInfo.eq).toBe(1000); // 5000 - 4000
    expect(carryForwardInfo.actualLeftoversInfo.dir).toBe(1000); // 10000 - 9000
    expect(carryForwardInfo.actualLeftoversInfo.seg).toBe(0); // 2000 - 2500 = -500 -> 0
  });
});
