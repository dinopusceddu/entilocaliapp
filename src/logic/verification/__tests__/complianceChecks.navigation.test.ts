import { describe, it, expect } from 'vitest';
import { runAllComplianceChecks } from '../complianceChecks';
import { getModuleById } from '../../../application/registry/moduleRegistry';
import mockNormativeData from '../../../../public/normativa.json';

describe('complianceChecks navigation targets', () => {
  it('emits canonical relatedPage targets matching registered modules', () => {
    const calculationResult: any = {
      compliance: {
        art23c2: {
          limite: 100000,
          valoreSoggetto: 90000,
          delta: 10000,
          isCompliant: true,
        },
      },
      fondi: {
        dipendente: {
          totaleDisponibile: 100000,
          totaleSoggettoLimite: 90000,
          limite2016: 95000,
          rispettaLimite: true,
          differenzaLimite: 5000,
          summary: { totaleFondo: 100000 },
        },
        eq: {
          totaleDisponibile: 20000,
          totaleSoggettoLimite: 20000,
          limite2016: 25000,
          rispettaLimite: true,
          differenzaLimite: 5000,
          summary: { totaleFondo: 0 },
        },
        dirigenza: {
          totaleDisponibile: 0,
          totaleSoggettoLimite: 0,
          limite2016: 0,
          rispettaLimite: true,
          differenzaLimite: 0,
          summary: { totaleFondo: 0 },
        },
      },
      complessivo: {
        totaleAccessorio: 110000,
        limiteComplessivo2016: 120000,
        rispettaLimite: true,
        differenza: 10000,
      },
    };

    const annualData: any = {
      annoRiferimento: 2026,
      denominazioneEnte: 'Ente Test',
      isDistributionMode: true,
      hasDirigenza: false,
      ccnl2026: {
        monteSalari2021: 1000000,
        art58c2_022_applicato: true,
        art58c2_022_importo: 10000, // exceeds 0.22% of 1,000,000 to trigger error
      },
      simulatoreRisultati: {
        fase5_incrementoNettoEffettivoFondo: 1000,
      },
    };

    const fondi: any = {
      dipendente: {
        st_art79c1c_incrementoStabileConsistenzaPers: 500,
        st_incrementoDL25_2025: 5000, // exceeds maxIncrementoSimulatore to trigger warning
      },
      eq: {},
    };

    const distribuzione: any = {
      p_performance: 150000,
    };

    const normalizedInput: any = {
      annualData,
      fondi,
      distribuzione,
      historicalData: {},
      calculatedInputs: {},
    };

    const checks = runAllComplianceChecks(calculationResult, normalizedInput, mockNormativeData);

    // Verify specific updated relatedPage targets
    const consistenzaCheck = checks.find(c => c.id === 'verifica_incremento_consistenza');
    expect(consistenzaCheck).toBeDefined();
    expect(consistenzaCheck?.relatedPage).toBe('fondoDipendenti');

    const art58Check = checks.find(c => c.id === 'limite_022_ms2021_complessivo');
    expect(art58Check).toBeDefined();
    expect(art58Check?.relatedPage).toBe('wizard2026Preview');

    const dl25Check = checks.find(c => c.id === 'coerenza_simulatore_decreto_pa');
    expect(dl25Check).toBeDefined();
    expect(dl25Check?.relatedPage).toBe('fondoDipendenti');

    // Verify all checks with relatedPage have valid registered modules
    for (const check of checks) {
      if (check.relatedPage) {
        const targetModule = getModuleById(check.relatedPage);
        expect(
          targetModule,
          `Check "${check.id}" has invalid relatedPage "${check.relatedPage}" not found in moduleRegistry`
        ).toBeDefined();
      }
    }
  });
});
