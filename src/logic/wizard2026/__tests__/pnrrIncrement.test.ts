import { describe, it, expect } from 'vitest';
import { calculatePnrrIncrement, validatePnrrIncrement, PnrrIncrementInput } from '../pnrrIncrement';

describe('PNRR art. 8, commi 3 e 4, D.L. 13/2023 — Wizard 2026', () => {
  it('1. Se non applicabile (anno fuori range o non soggetto attuatore), restituisce isApplicabile: false e limiti 0', () => {
    // Caso fuori periodo
    const inputFuoriPeriodo: PnrrIncrementInput = {
      annoRiferimento: 2022,
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
    };
    const resFuori = calculatePnrrIncrement(inputFuoriPeriodo);
    expect(resFuori.isApplicabile).toBe(false);

    // Caso non soggetto attuatore
    const inputNonSoggetto: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: false,
      componenteStabileFondoDipendenti2016: 1000000,
    };
    const resNonSog = calculatePnrrIncrement(inputNonSoggetto);
    expect(resNonSog.isApplicabile).toBe(false);
  });

  it('2. Se mancano dati obbligatori, l\'istruttoria non è validabile (isValidable: false)', () => {
    // Manca indicazione del soggetto attuatore (undefined)
    const inputMissingSoggetto: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: undefined,
      componenteStabileFondoDipendenti2016: 1000000,
    };
    const res1 = calculatePnrrIncrement(inputMissingSoggetto);
    expect(res1.isApplicabile).toBe(true);
    expect(res1.isValidable).toBe(false);

    const checks1 = validatePnrrIncrement(inputMissingSoggetto);
    expect(checks1.some(c => c.id === 'PNRR-MISSING-SOGGETTO-ATTUATORE')).toBe(true);

    // Manca indicazione del soggetto attuatore (null)
    const inputNullSoggetto: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: null,
      componenteStabileFondoDipendenti2016: 1000000,
    };
    const resNull = calculatePnrrIncrement(inputNullSoggetto);
    expect(resNull.isApplicabile).toBe(true);
    expect(resNull.isValidable).toBe(false);

    const checksNull = validatePnrrIncrement(inputNullSoggetto);
    expect(checksNull.some(c => c.id === 'PNRR-MISSING-SOGGETTO-ATTUATORE')).toBe(true);

    // Mancano i requisiti contabili
    const inputMissingChecks: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
      hasDirigenza: false,
      equilibrioEsercizioPrecedente: undefined, // Mancante
    };
    const res2 = calculatePnrrIncrement(inputMissingChecks);
    expect(res2.isValidable).toBe(false);

    const checks2 = validatePnrrIncrement(inputMissingChecks);
    expect(checks2.some(c => c.id === 'PNRR-REQUISITI-MANCANTI')).toBe(true);
  });

  it('3. Se i dati sono completi e i requisiti rispettati, calcola i limiti teorici corretti (5% della base 2016)', () => {
    const inputValido: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
      hasDirigenza: true,
      componenteStabileFondoDirigenza2016: 200000,
      equilibrioEsercizioPrecedente: true,
      parametriDebitoCommercialeEsercizioPrecedente: true,
      rendicontoApprovatoTermini: true,
      incidenzaSalarioAccessorioScelta: 'diretto',
      incidenzaSalarioAccessorioPercentuale: 6.5,
    };

    const res = calculatePnrrIncrement(inputValido);
    expect(res.isApplicabile).toBe(true);
    expect(res.isValidable).toBe(true);
    expect(res.limiteMassimoPnrrFondoDipendenti).toBe(50000); // 5% di 1.000.000
    expect(res.limiteMassimoPnrrFondoDirigenza).toBe(10000);   // 5% di 200.000
    expect(res.totaleLimiteMassimoPnrr).toBe(60000);

    const checks = validatePnrrIncrement(inputValido);
    expect(checks.filter(c => c.severity === 'error').length).toBe(0);
  });

  it('4. Se un requisito contabile obbligatorio è negativo, il limite teorico viene azzerato (bloccante)', () => {
    const inputNegativo: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
      hasDirigenza: false,
      equilibrioEsercizioPrecedente: false, // Negativo
      parametriDebitoCommercialeEsercizioPrecedente: true,
      rendicontoApprovatoTermini: true,
      incidenzaSalarioAccessorioScelta: 'diretto',
      incidenzaSalarioAccessorioPercentuale: 5.0,
    };

    const res = calculatePnrrIncrement(inputNegativo);
    expect(res.isValidable).toBe(true);
    expect(res.limiteMassimoPnrrFondoDipendenti).toBe(0);
    expect(res.totaleLimiteMassimoPnrr).toBe(0);

    const checks = validatePnrrIncrement(inputNegativo);
    expect(checks.some(c => c.id === 'PNRR-NO-EQUILIBRIO' && c.severity === 'error')).toBe(true);
  });

  it('5. Se l\'incidenza del salario accessorio supera l\'8%, il limite è azzerato e viene prodotto un errore', () => {
    const inputIncidenzaAlta: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
      hasDirigenza: false,
      equilibrioEsercizioPrecedente: true,
      parametriDebitoCommercialeEsercizioPrecedente: true,
      rendicontoApprovatoTermini: true,
      incidenzaSalarioAccessorioScelta: 'assistito',
      salarioAccessorioIndicatori: 9000,
      spesaPersonaleIndicatori: 100000, // 9% di incidenza
    };

    const res = calculatePnrrIncrement(inputIncidenzaAlta);
    expect(res.isValidable).toBe(true);
    expect(res.limiteMassimoPnrrFondoDipendenti).toBe(0);
    expect(res.incidenzaSalarioAccessorioPercentualeCalcolata).toBe(9);

    const checks = validatePnrrIncrement(inputIncidenzaAlta);
    expect(checks.some(c => c.id === 'PNRR-INCIDENZA-ECCEDENTE' && c.severity === 'error')).toBe(true);
  });

  it('6. L\'ente in criticità finanziaria genera warning COSFEL se manca approvazione, ma il limite NON è azzerato', () => {
    const inputCosfel: PnrrIncrementInput = {
      annoRiferimento: 2026,
      soggettoAttuatorePnrr: true,
      componenteStabileFondoDipendenti2016: 1000000,
      hasDirigenza: false,
      equilibrioEsercizioPrecedente: true,
      parametriDebitoCommercialeEsercizioPrecedente: true,
      rendicontoApprovatoTermini: true,
      incidenzaSalarioAccessorioScelta: 'diretto',
      incidenzaSalarioAccessorioPercentuale: 5.0,
      isDissesto: true,
      hasApprovazioneCosfel: false, // Manca approvazione
    };

    const res = calculatePnrrIncrement(inputCosfel);
    expect(res.isValidable).toBe(true);
    expect(res.limiteMassimoPnrrFondoDipendenti).toBe(50000); // Rimane calcolato!

    const checks = validatePnrrIncrement(inputCosfel);
    expect(checks.some(c => c.id === 'COSFEL-NOT-APPROVED-PNRR' && c.severity === 'warning')).toBe(true);
    expect(checks.some(c => c.severity === 'error')).toBe(false); // Nessun blocco
  });
});
