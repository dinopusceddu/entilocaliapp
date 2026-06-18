import { describe, it, expect } from 'vitest';
import { calculateDl25Increment, validateDl25Increment, getDl25ApplicabilityStatus, Dl25IncrementInput } from '../dl25Increment';

describe('D.L. 25/2025 — Wizard 2026', () => {
  it('1-8. Verifica status applicabilità per tipologia ente', () => {
    expect(getDl25ApplicabilityStatus('COMUNE')).toBe('DIRECTLY_APPLICABLE');
    expect(getDl25ApplicabilityStatus('REGIONE')).toBe('DIRECTLY_APPLICABLE');
    expect(getDl25ApplicabilityStatus('PROVINCIA')).toBe('DIRECTLY_APPLICABLE');
    expect(getDl25ApplicabilityStatus('CITTA_METROPOLITANA')).toBe('DIRECTLY_APPLICABLE');
    expect(getDl25ApplicabilityStatus('UNIONE_COMUNI')).toBe('TRANSFER_ONLY');
    expect(getDl25ApplicabilityStatus('COMUNITA_MONTANA')).toBe('TRANSFER_ONLY');
    expect(getDl25ApplicabilityStatus('CAMERA_COMMERCIO')).toBe('NOT_APPLICABLE');
    expect(getDl25ApplicabilityStatus('ALTRO')).toBe('NEEDS_MANUAL_REVIEW');
  });

  it('9. Calcolo corretto per DIRECTLY_APPLICABLE', () => {
    const input: Dl25IncrementInput = {
      entityType: 'COMUNE',
      stipendiTabellari2023NonDirigenti: 2500000,
      fondoStabile2025Certificato: 1000000,
      budgetEq2025: 100000,
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
    };
    const res = calculateDl25Increment(input);
    expect(res.soglia48).toBe(1200000);
    expect(res.limiteMassimoDL25).toBe(100000); // 1.200.000 - 1.100.000
    expect(res.isApplicabileDirettamente).toBe(true);
  });

  it('10. Ente in dissesto imposta limite a zero ed emette check di blocco', () => {
    const input: Dl25IncrementInput = {
      entityType: 'COMUNE',
      stipendiTabellari2023NonDirigenti: 2500000,
      fondoStabile2025Certificato: 1000000,
      budgetEq2025: 100000,
      isDissesto: true,
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
    };
    const res = calculateDl25Increment(input);
    expect(res.limiteMassimoDL25).toBe(0);

    const checks = validateDl25Increment(input);
    const errorCheck = checks.find((c) => c.id === 'DL25-VIRTUSTEP-BLOCKED-DISSESTO');
    expect(errorCheck).toBeDefined();
    expect(errorCheck?.severity).toBe('error');
  });

  it('11. TRANSFER_ONLY con quota > 0 e senza atti genera error', () => {
    const input: Dl25IncrementInput = {
      entityType: 'UNIONE_COMUNI',
      quotaTrasferitaAderentiDL25_2025: 50000,
      attiComuniAderentiPresenti: false,
      riduzionePermanenteFondiComuniCertificata: true,
      certificazioneRevisoriComuni: true,
    };
    const checks = validateDl25Increment(input);
    const errorCheck = checks.find((c) => c.id === 'DL25-TRANSFER-NO-ATTI');
    expect(errorCheck).toBeDefined();
    expect(errorCheck?.severity).toBe('error');
  });

  it('12. TRANSFER_ONLY non valorizza incremento diretto', () => {
    const input: Dl25IncrementInput = {
      entityType: 'UNIONE_COMUNI',
      stipendiTabellari2023NonDirigenti: 1000000,
      quotaTrasferitaAderentiDL25_2025: 50000,
      attiComuniAderentiPresenti: true,
      riduzionePermanenteFondiComuniCertificata: true,
      certificazioneRevisoriComuni: true,
    };
    const res = calculateDl25Increment(input);
    expect(res.isApplicabileDirettamente).toBe(false);
    expect(res.soglia48).toBe(0);
    expect(res.limiteMassimoDL25).toBe(50000);
    expect(res.quotaTrasferitaAderenti).toBe(50000);
  });

  it('13. Ente strutturalmente deficitario senza approvazione COSFEL genera errore', () => {
    const input: Dl25IncrementInput = {
      entityType: 'COMUNE',
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: false,
    };
    const checks = validateDl25Increment(input);
    const errorCheck = checks.find((c) => c.id === 'COSFEL-BLOCKED-DL25');
    expect(errorCheck).toBeDefined();
    expect(errorCheck?.severity).toBe('error');

    // Con COSFEL undefined (dato mancante -> warning)
    const inputMissingCosfel: Dl25IncrementInput = {
      ...input,
      hasApprovazioneCosfel: undefined,
    };
    const checksMissingCosfel = validateDl25Increment(inputMissingCosfel);
    expect(checksMissingCosfel.find((c) => c.id === 'COSFEL-BLOCKED-DL25')).toBeUndefined();
    const warnCheck = checksMissingCosfel.find((c) => c.id === 'COSFEL-MISSING-DL25');
    expect(warnCheck).toBeDefined();
    expect(warnCheck?.severity).toBe('warning');

    // Con COSFEL true (approvato -> nessun blocco o warning mancante)
    const inputWithCosfel: Dl25IncrementInput = {
      ...input,
      hasApprovazioneCosfel: true,
    };
    const checksWithCosfel = validateDl25Increment(inputWithCosfel);
    expect(checksWithCosfel.find((c) => c.id === 'COSFEL-BLOCKED-DL25')).toBeUndefined();
    expect(checksWithCosfel.find((c) => c.id === 'COSFEL-MISSING-DL25')).toBeUndefined();
  });

  // ─── Test MOD-011-ter ─────────────────────────────────────────────────────

  it('MOD-011-ter A. altreRisorse2025DaSottrarre inclusa nella formula', () => {
    // Senza altreRisorse: soglia48 = 2000000 * 0.48 = 960000; risorse = 800000 + 50000 = 850000; max = 110000
    const inputBase: Dl25IncrementInput = {
      entityType: 'COMUNE',
      stipendiTabellari2023NonDirigenti: 2000000,
      fondoStabile2025Certificato: 800000,
      budgetEq2025: 50000,
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
    };
    const resBase = calculateDl25Increment(inputBase);
    expect(resBase.limiteMassimoDL25).toBe(110000);
    expect(resBase.risorse2025DaSottrarre).toBe(850000);

    // Con altreRisorse = 20000: risorse = 870000; max = 90000
    const inputConAltre: Dl25IncrementInput = {
      ...inputBase,
      altreRisorse2025DaSottrarre: 20000,
    };
    const resConAltre = calculateDl25Increment(inputConAltre);
    expect(resConAltre.risorse2025DaSottrarre).toBe(870000);
    expect(resConAltre.limiteMassimoDL25).toBe(90000);
  });

  it('MOD-011-ter B. altreRisorse2025DaSottrarre = 0 equivale ad assenza campo', () => {
    const inputZero: Dl25IncrementInput = {
      entityType: 'COMUNE',
      stipendiTabellari2023NonDirigenti: 2000000,
      fondoStabile2025Certificato: 800000,
      budgetEq2025: 50000,
      altreRisorse2025DaSottrarre: 0,
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
    };
    const res = calculateDl25Increment(inputZero);
    expect(res.risorse2025DaSottrarre).toBe(850000);
    expect(res.limiteMassimoDL25).toBe(110000);
  });

  it('14. Distingue limite massimo e importo applicato esplicito', () => {
    const input: Dl25IncrementInput = {
      entityType: 'COMUNE',
      stipendiTabellari2023NonDirigenti: 300000,
      fondoStabile2025Certificato: 100000,
      budgetEq2025: 20000,
      incrementoApplicato: 10000,
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
    };

    const res = calculateDl25Increment(input);

    expect(res.limiteMassimoDL25).toBe(24000);
    expect(res.incrementoApplicato).toBe(10000);
    expect(validateDl25Increment(input).find((c) => c.id === 'DL25-APPLICATO-OLTRE-MASSIMO')).toBeUndefined();
  });

  it('15. Segnala importo applicato superiore al massimo teorico', () => {
    const checks = validateDl25Increment({
      entityType: 'COMUNE',
      stipendiTabellari2023NonDirigenti: 300000,
      fondoStabile2025Certificato: 100000,
      budgetEq2025: 20000,
      incrementoApplicato: 25000,
      isPrimaFasciaDl34: true,
      isEquilibrioPluriennaleAsseverato: true,
    });

    const errorCheck = checks.find((c) => c.id === 'DL25-APPLICATO-OLTRE-MASSIMO');
    expect(errorCheck).toBeDefined();
    expect(errorCheck?.severity).toBe('error');
  });
});
