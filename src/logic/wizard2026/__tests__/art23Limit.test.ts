import { describe, it, expect } from 'vitest';
import { calculateArt23Limit, validateArt23Limit, Art23LimitInput } from '../art23Limit';

describe('Art. 23, comma 2, D.Lgs. 75/2017 — Wizard 2026 (MOD-008)', () => {
  // Test 1: Limite certificato prevale sul ricostruito
  it('1. Limite certificato prevale sul ricostruito', () => {
    const input: Art23LimitInput = {
      fondoPersonaleDipendente2016: 100000,
      fondoEqPo2016: 20000,
      limite2016CertificatoEnte: 150000,
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.limite2016Base).toBe(150000);
    expect(res.fonteLimite2016).toBe('CERTIFICATO');
    expect(res.totaleVoci2016Ricostruite).toBe(120000);
    expect(res.limiteCertificatoUtilizzato).toBe(true);
  });

  // Test 2: Limite ricostruito somma i sottofondi
  it('2. Limite ricostruito somma i sottofondi', () => {
    const input: Art23LimitInput = {
      fondoPersonaleDipendente2016: 100000,
      fondoEqPo2016: 20000,
      fondoDirigenza2016: 50000,
      risorseSegretario2016: 10000,
      fondoStraordinario2016: 5000,
      altreVoci2016Soggette: 15000,
      hasDirigenza: true,
    };
    const res = calculateArt23Limit(input);
    expect(res.fonteLimite2016).toBe('RICOSTRUITO');
    expect(res.limite2016Base).toBe(200000);
    expect(res.totaleVoci2016Ricostruite).toBe(200000);
    expect(res.limiteCertificatoUtilizzato).toBe(false);
  });

  // Test 3: Fondo dirigenza escluso se hasDirigenza false
  it('3. Fondo dirigenza escluso se hasDirigenza false', () => {
    const input: Art23LimitInput = {
      fondoPersonaleDipendente2016: 100000,
      fondoDirigenza2016: 50000,
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.limite2016Base).toBe(100000);
    expect(res.totaleVoci2016Ricostruite).toBe(100000);
  });

  // Test 4: Fondo dirigenza incluso se hasDirigenza true
  it('4. Fondo dirigenza incluso se hasDirigenza true', () => {
    const input: Art23LimitInput = {
      fondoPersonaleDipendente2016: 100000,
      fondoDirigenza2016: 50000,
      hasDirigenza: true,
    };
    const res = calculateArt23Limit(input);
    expect(res.limite2016Base).toBe(150000);
    expect(res.totaleVoci2016Ricostruite).toBe(150000);
  });

  // Test 5: Altre voci 2016 e risorse segretario incluse correttamente
  it('5. Altre voci 2016 e risorse segretario incluse correttamente', () => {
    const input: Art23LimitInput = {
      fondoPersonaleDipendente2016: 100000,
      risorseSegretario2016: 8000,
      altreVoci2016Soggette: 12000,
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.totaleVoci2016Ricostruite).toBe(120000);
  });

  // Test 6: Base accessorio 2018 corretta
  it('6. Base accessorio 2018 corretta', () => {
    const input: Art23LimitInput = {
      fondoDipendenti2018Soggetto: 90000,
      risorsePoEq2018Soggette: 10000,
    };
    const res = calculateArt23Limit(input);
    expect(res.baseAccessorio2018ProCapite).toBe(100000);
  });

  // Test 7: Valore medio pro capite 2018 corretto
  it('7. Valore medio pro capite 2018 corretto', () => {
    const input: Art23LimitInput = {
      fondoDipendenti2018Soggetto: 90000,
      risorsePoEq2018Soggette: 10000,
      personaleServizio31122018: 50,
    };
    const res = calculateArt23Limit(input);
    expect(res.valoreMedioProCapite2018).toBe(2000); // 100000 / 50
  });

  // Test 8: Incremento pro capite calcolato correttamente se personale 2026 > personale 2018
  it('8. Incremento pro capite calcolato correttamente se personale 2026 > personale 2018', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      fondoDipendenti2018Soggetto: 90000,
      risorsePoEq2018Soggette: 10000,
      personaleServizio31122018: 50, // Medio = 2000
      personalePrevisto2026Piao: 60, // Diff = 10
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.differenzaPersonale).toBe(10);
    expect(res.incrementoProCapiteLimite).toBe(20000); // 10 * 2000
    expect(res.limiteArt23Attualizzato).toBe(170000); // 150000 + 20000
  });

  // Test 9: Incremento pro capite pari a zero se personale 2026 <= personale 2018 (nessuna riduzione)
  it('9. Incremento pro capite pari a zero se personale 2026 <= personale 2018', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      fondoDipendenti2018Soggetto: 90000,
      risorsePoEq2018Soggette: 10000,
      personaleServizio31122018: 50,
      personalePrevisto2026Piao: 45, // Inferiore a 50
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.differenzaPersonale).toBe(-5);
    expect(res.incrementoProCapiteLimite).toBe(0); // Nessun decremento
    expect(res.limiteArt23Attualizzato).toBe(150000);
  });

  // Test 10: Limite attualizzato finale somma base 2016 + incremento
  it('10. Limite attualizzato finale somma base 2016 + incremento', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      fondoDipendenti2018Soggetto: 50000,
      personaleServizio31122018: 20, // Medio = 2500
      personalePrevisto2026Piao: 24, // Diff = 4
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.limiteArt23Attualizzato).toBe(110000); // 100000 + 4*2500
  });

  // Test 11: Validazione - importi negativi non ammessi
  it('11. Validazione - importi negativi non ammessi', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: -100,
      fondoPersonaleDipendente2016: -500,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-NEGATIVE-LIMITE2016CERTIFICATOENTE')).toBe(true);
    expect(checks.some(c => c.id === 'ART23-NEGATIVE-FONDOPERSONALEDIPENDENTE2016')).toBe(true);
  });

  // Test 12: Validazione - limite certificato pari a zero
  it('12. Validazione - limite certificato pari a zero', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 0,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-CERT-ZERO')).toBe(true);
  });

  // Test 13: Validazione - base 2016 completamente mancante
  it('13. Validazione - base 2016 completamente mancante', () => {
    const input: Art23LimitInput = {
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-BASE-2016-MISSING')).toBe(true);
  });

  // Test 14: Validazione - mismatch/riconciliazione
  it('14. Validazione - mismatch/riconciliazione', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      fondoPersonaleDipendente2016: 100000,
      fondoEqPo2016: 30000, // Somma = 130000 != 150000
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-RECONCILIATION-MISMATCH')).toBe(true);
  });

  // Test 15: Validazione - fondo dirigenza 2016 mancante se hasDirigenza true
  it('15. Validazione - fondo dirigenza 2016 mancante se hasDirigenza true', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      hasDirigenza: true,
      fondoDirigenza2016: undefined,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-MISSING-DIR-2016')).toBe(true);
  });

  // Test 16: Validazione - fondo dirigenza 2016 non richiesto se hasDirigenza false
  it('16. Validazione - fondo dirigenza 2016 non richiesto se hasDirigenza false', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      hasDirigenza: false,
      fondoDirigenza2016: undefined,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-MISSING-DIR-2016')).toBe(false);
  });

  // Test 17: Validazione - dati pro capite incompleti
  it('17. Validazione - dati pro capite incompleti', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      fondoDipendenti2018Soggetto: 90000,
      personaleServizio31122018: undefined, // Manca
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-PRO-CAPITE-MISSING-DATA')).toBe(true);
  });

  // Test 18: Validazione - personale 2018 <= 0
  it('18. Validazione - personale 2018 <= 0', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      personaleServizio31122018: 0,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-PERS-2018-ZERO')).toBe(true);
  });

  // Test 19: Caso SKIP senza Art79 non richiede dati Art33 né personale
  it('19. Caso SKIP senza Art79: non genera warning di dati mancanti Art33 né personale', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      validateArt33Adjustment: false,
      fondoCertificatoParteStabile2018: undefined,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-PRO-CAPITE-MISSING-DATA')).toBe(false);
    expect(checks.some(c => c.id === 'ART23-AUTO-2018-MISSING')).toBe(false);
    expect(checks.some(c => c.id === 'ART23-AUTO-2026-MISSING')).toBe(false);
  });

  // Test 20: Campo legacy fondoCertificatoParteStabile2018 positivo non attiva requiredness personale con Art33 disattivato
  it('20. Campo legacy fondoCertificatoParteStabile2018 positivo non attiva requiredness personale con Art33 disattivato', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      validateArt33Adjustment: false,
      fondoCertificatoParteStabile2018: 100000,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-AUTO-2018-MISSING')).toBe(false);
    expect(checks.some(c => c.id === 'ART23-AUTO-2026-MISSING')).toBe(false);
    expect(checks.some(c => c.id === 'ART23-PRO-CAPITE-MISSING-DATA')).toBe(false);
  });

  // Test 21: Integrità part-time sempre attiva anche con validateArt33Adjustment = false
  it('21. Integrità part-time sempre attiva anche con validateArt33Adjustment = false', () => {
    const inputZero: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      validateArt33Adjustment: false,
      personale2018Art23: [{ id: 'emp1', partTimePercentage: 0 }],
      hasDirigenza: false,
    };
    const checksZero = validateArt23Limit(inputZero);
    expect(checksZero.some(c => c.id === 'ART23-AUTO-2018-INVALID-PT-emp1')).toBe(true);

    const inputOver: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      validateArt33Adjustment: false,
      personale2018Art23: [{ id: 'emp2', partTimePercentage: 150 }],
      hasDirigenza: false,
    };
    const checksOver = validateArt23Limit(inputOver);
    expect(checksOver.some(c => c.id === 'ART23-AUTO-2018-INVALID-PT-emp2')).toBe(true);
  });

  // Test 22: Integrità cedolini sempre attiva anche con validateArt33Adjustment = false
  it('22. Integrità cedolini sempre attiva anche con validateArt33Adjustment = false', () => {
    const inputZeroCed: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      validateArt33Adjustment: false,
      personale2026Art23: [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 0 }],
      hasDirigenza: false,
    };
    const checksZeroCed = validateArt23Limit(inputZeroCed);
    expect(checksZeroCed.some(c => c.id === 'ART23-AUTO-2026-INVALID-CED-emp1')).toBe(true);

    const inputOverCed: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      validateArt33Adjustment: false,
      personale2026Art23: [{ id: 'emp2', partTimePercentage: 100, cedoliniEmessi: 13 }],
      hasDirigenza: false,
    };
    const checksOverCed = validateArt23Limit(inputOverCed);
    expect(checksOverCed.some(c => c.id === 'ART23-AUTO-2026-INVALID-CED-emp2')).toBe(true);
  });

  // Test 23: FTE manuale 2018 <= 0 produce sempre errore anche con validateArt33Adjustment = false
  it('23. FTE manuale 2018 <= 0 produce ART23-MANUAL-2018-ZERO anche con validateArt33Adjustment = false', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      validateArt33Adjustment: false,
      usaCalcoloManualePersonaleArt23: true,
      manualDipendentiEquivalenti2018: 0,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-MANUAL-2018-ZERO')).toBe(true);
  });

  // Test 24: FTE manuale 2026 negativo produce sempre errore anche con validateArt33Adjustment = false
  it('24. FTE manuale 2026 negativo produce ART23-MANUAL-2026-NEGATIVE anche con validateArt33Adjustment = false', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      validateArt33Adjustment: false,
      usaCalcoloManualePersonaleArt23: true,
      manualDipendentiEquivalenti2026: -1,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-MANUAL-2026-NEGATIVE')).toBe(true);
  });

  // Test 25: Modalità manuale con Art33 disattivato non richiede FTE manuali anche con fondoCertificatoParteStabile2018 positivo
  it('25. Modalità manuale con Art33 disattivato non richiede FTE manuali anche con fondoCertificatoParteStabile2018 positivo', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 100000,
      validateArt33Adjustment: false,
      fondoCertificatoParteStabile2018: 100000,
      usaCalcoloManualePersonaleArt23: true,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-MANUAL-2018-MISSING')).toBe(false);
    expect(checks.some(c => c.id === 'ART23-MANUAL-2026-MISSING')).toBe(false);
  });

  // Test 26: Calcolo FTE analitico con PT0 o ced0 produce dipendenti equivalenti 0
  it('26. Calcolo FTE analitico con PT0 o ced0 produce dipendenti equivalenti 0', () => {
    const input: Art23LimitInput = {
      personale2018Art23: [{ id: 'e1', partTimePercentage: 0 }],
      personale2026Art23: [{ id: 'e2', partTimePercentage: 100, cedoliniEmessi: 0 }],
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.dipendentiEquivalenti2018).toBe(0);
    expect(res.dipendentiEquivalenti2026).toBe(0);

    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-AUTO-2018-INVALID-PT-e1')).toBe(true);
    expect(checks.some(c => c.id === 'ART23-AUTO-2026-INVALID-CED-e2')).toBe(true);
  });

  // Test 27: Calcolo FTE con campi undefined assume default retrocompatibili (100% e 12)
  it('27. Calcolo FTE con campi undefined assume default retrocompatibili', () => {
    const input: Art23LimitInput = {
      personale2018Art23: [{ id: 'e1' }],
      personale2026Art23: [{ id: 'e2' }],
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.dipendentiEquivalenti2018).toBe(1);
    expect(res.dipendentiEquivalenti2026).toBe(1);
  });

  // Test 28: Calcolo FTE con PT 50% e 6 cedolini produce 0.25 FTE
  it('28. Calcolo FTE con PT 50% e 6 cedolini produce 0.25 FTE', () => {
    const input: Art23LimitInput = {
      personale2026Art23: [{ id: 'e1', partTimePercentage: 50, cedoliniEmessi: 6 }],
      hasDirigenza: false,
    };
    const res = calculateArt23Limit(input);
    expect(res.dipendentiEquivalenti2026).toBe(0.25);
  });

  // Test 29: Invarianza Art. 23 / Art. 33 al variare di fondoCertificatoParteStabile2018 (undefined)
  it('29. Invarianza Art. 23: fondoCertificatoParteStabile2018 undefined non altera output Art. 23/Art. 33', () => {
    const baseInput: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      fondoDipendenti2018Soggetto: 100000,
      risorsePoEq2018Soggette: 20000,
      personaleServizio31122018: 10,
      personalePrevisto2026Piao: 12,
      hasDirigenza: false,
    };
    const resUndefined = calculateArt23Limit({
      ...baseInput,
      fondoCertificatoParteStabile2018: undefined,
    });
    expect(resUndefined.limite2016Base).toBe(150000);
    expect(resUndefined.baseAccessorio2018ProCapite).toBe(120000);
    expect(resUndefined.valoreMedioProCapite2018).toBe(12000);
    expect(resUndefined.incrementoProCapiteLimite).toBe(24000);
    expect(resUndefined.limiteArt23Attualizzato).toBe(174000);
    expect(resUndefined.dipendentiEquivalenti2018).toBe(10);
    expect(resUndefined.dipendentiEquivalenti2026).toBe(12);
    expect(resUndefined.incrementoStabileAumentoPersonale).toBe(0);
  });

  // Test 30: Invarianza Art. 23: fondoCertificatoParteStabile2018 = 100000 produce identici output Art. 23/Art. 33
  it('30. Invarianza Art. 23: fondoCertificatoParteStabile2018 = 100000 produce identici output Art. 23/Art. 33', () => {
    const baseInput: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      fondoDipendenti2018Soggetto: 100000,
      risorsePoEq2018Soggette: 20000,
      personaleServizio31122018: 10,
      personalePrevisto2026Piao: 12,
      hasDirigenza: false,
    };
    const res100k = calculateArt23Limit({
      ...baseInput,
      fondoCertificatoParteStabile2018: 100000,
    });
    expect(res100k.limite2016Base).toBe(150000);
    expect(res100k.baseAccessorio2018ProCapite).toBe(120000);
    expect(res100k.valoreMedioProCapite2018).toBe(12000);
    expect(res100k.incrementoProCapiteLimite).toBe(24000);
    expect(res100k.limiteArt23Attualizzato).toBe(174000);
    expect(res100k.dipendentiEquivalenti2018).toBe(10);
    expect(res100k.dipendentiEquivalenti2026).toBe(12);
    expect(res100k.incrementoStabileAumentoPersonale).toBe(0);
    expect(res100k.fondoCertificatoParteStabile2018).toBe(100000);
  });

  // Test 31: Invarianza Art. 23: fondoCertificatoParteStabile2018 = 9999999 produce identici output Art. 23/Art. 33
  it('31. Invarianza Art. 23: fondoCertificatoParteStabile2018 = 9999999 produce identici output Art. 23/Art. 33', () => {
    const baseInput: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      fondoDipendenti2018Soggetto: 100000,
      risorsePoEq2018Soggette: 20000,
      personaleServizio31122018: 10,
      personalePrevisto2026Piao: 12,
      hasDirigenza: false,
    };
    const resHuge = calculateArt23Limit({
      ...baseInput,
      fondoCertificatoParteStabile2018: 9999999,
    });
    expect(resHuge.limite2016Base).toBe(150000);
    expect(resHuge.baseAccessorio2018ProCapite).toBe(120000);
    expect(resHuge.valoreMedioProCapite2018).toBe(12000);
    expect(resHuge.incrementoProCapiteLimite).toBe(24000);
    expect(resHuge.limiteArt23Attualizzato).toBe(174000);
    expect(resHuge.dipendentiEquivalenti2018).toBe(10);
    expect(resHuge.dipendentiEquivalenti2026).toBe(12);
    expect(resHuge.incrementoStabileAumentoPersonale).toBe(0);
    expect(resHuge.fondoCertificatoParteStabile2018).toBe(9999999);
  });

  // Test 32: Regressione warning rimosso ART23-FONDO-STABILE-2018-MISSING con campo assente (undefined)
  it('32. Regressione warning rimosso: fondoCertificatoParteStabile2018 undefined NON genera ART23-FONDO-STABILE-2018-MISSING', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      fondoDipendenti2018Soggetto: 100000,
      risorsePoEq2018Soggette: 20000,
      personaleServizio31122018: 10,
      personalePrevisto2026Piao: 12,
      fondoCertificatoParteStabile2018: undefined,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-FONDO-STABILE-2018-MISSING')).toBe(false);
  });

  // Test 33: Regressione warning rimosso ART23-FONDO-STABILE-2018-MISSING con campo pari a 0
  it('33. Regressione warning rimosso: fondoCertificatoParteStabile2018 = 0 NON genera ART23-FONDO-STABILE-2018-MISSING', () => {
    const input: Art23LimitInput = {
      limite2016CertificatoEnte: 150000,
      fondoDipendenti2018Soggetto: 100000,
      risorsePoEq2018Soggette: 20000,
      personaleServizio31122018: 10,
      personalePrevisto2026Piao: 12,
      fondoCertificatoParteStabile2018: 0,
      hasDirigenza: false,
    };
    const checks = validateArt23Limit(input);
    expect(checks.some(c => c.id === 'ART23-FONDO-STABILE-2018-MISSING')).toBe(false);
  });
});
