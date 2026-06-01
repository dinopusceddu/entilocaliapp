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

});
