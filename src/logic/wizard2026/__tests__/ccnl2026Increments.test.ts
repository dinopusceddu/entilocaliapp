import { describe, it, expect } from 'vitest';
import { calculateCcnl2026Increments, validateCcnl2026Increments, Ccnl2026IncrementsInput } from '../ccnl2026Increments';

describe('Incrementi CCNL 23.02.2026 (0,14% e 0,22%) — Wizard 2026', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // TEST ESISTENTI (aggiornati per MOD-015)
  // ─────────────────────────────────────────────────────────────────────────

  it('1. Calcolo ordinario con dati completi (anno 2026)', () => {
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
    };
    const res = calculateCcnl2026Increments(input);
    expect(res.isCalcolabile).toBe(true);
    expect(res.incrementoStabile014).toBe(1_400);    // MS2021 × 0,14% × 1
    expect(res.arretrati014).toBe(2_800);             // MS2021 × 0,14% × 2
    expect(res.limiteMassimo022).toBe(4_400);         // MS2021 × 0,22% × 2 (anno 2026)
    expect(res.isMs2021Consolidato).toBe(false);

    // Nessun totale cumulato 0,14% + 0,22%
    // Il campo totalePotenzialeCcnl2026 era @deprecated — non deve comparire nei risultati attesi
    expect(res.incremento022Anno).toBeUndefined();    // non inserito → nessun riparto
    expect(res.incremento022Fondo).toBeUndefined();
    expect(res.incremento022EQ).toBeUndefined();

    // Legacy fields ancora presenti per retrocompatibilità
    expect(res.incremento014).toBe(1_400);
    expect(res.incremento022Massimo).toBe(4_400);
  });

  it('2. Gestione dati mancanti (non calcolabile)', () => {
    const input: Ccnl2026IncrementsInput = {
      annoRiferimento: 2026,
    };
    const res = calculateCcnl2026Increments(input);
    expect(res.isCalcolabile).toBe(false);
    expect(res.incrementoStabile014).toBeUndefined();
    expect(res.arretrati014).toBeUndefined();
    expect(res.limiteMassimo022).toBeUndefined();

    const checks = validateCcnl2026Increments(input);
    expect(checks.find(c => c.id === 'CCNL2026-MISSING-MS2021')).toBeDefined();
  });

  it('3. Gestione ente strutturalmente deficitario - COSFEL true', () => {
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: true,
    };
    const res = calculateCcnl2026Increments(input);
    expect(res.isCalcolabile).toBe(true);
    expect(res.incrementoStabile014).toBe(1_400);
    expect(res.limiteMassimo022).toBe(4_400);  // × 2 per il 2026

    const checks = validateCcnl2026Increments(input);
    expect(checks.find(c => c.id === 'COSFEL-BLOCKED-CCNL2026-022')).toBeUndefined();
    expect(checks.find(c => c.id === 'COSFEL-MISSING-CCNL2026-022')).toBeUndefined();
    expect(checks.find(c => c.id === 'COSFEL-WARNING-CCNL2026')).toBeDefined();
  });

  it('4. Gestione ente strutturalmente deficitario - COSFEL false (limite massimo pari a zero, blocco)', () => {
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: false,
    };
    const res = calculateCcnl2026Increments(input);
    expect(res.isCalcolabile).toBe(true);
    expect(res.incrementoStabile014).toBe(1_400);
    expect(res.limiteMassimo022).toBe(0); // Forzato a zero

    const checks = validateCcnl2026Increments(input);
    const blockError = checks.find(c => c.id === 'COSFEL-BLOCKED-CCNL2026-022');
    expect(blockError).toBeDefined();
    expect(blockError?.severity).toBe('error');
  });

  it('5. Gestione ente strutturalmente deficitario - COSFEL undefined (non forzare a zero, warning forte)', () => {
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
      isStrutturalmenteDeficitario: true,
      hasApprovazioneCosfel: undefined,
    };
    const res = calculateCcnl2026Increments(input);
    expect(res.isCalcolabile).toBe(true);
    expect(res.limiteMassimo022).toBe(4_400); // NON forzato a zero!

    const checks = validateCcnl2026Increments(input);
    expect(checks.find(c => c.id === 'COSFEL-BLOCKED-CCNL2026-022')).toBeUndefined();
    const missingWarning = checks.find(c => c.id === 'COSFEL-MISSING-CCNL2026-022');
    expect(missingWarning).toBeDefined();
    expect(missingWarning?.severity).toBe('warning');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST OBBLIGATORI MOD-015
  // ─────────────────────────────────────────────────────────────────────────

  it('6. [OBBLIGATORIO] Scenario minimo 2026 — tutti i valori attesi', () => {
    // MS2021 = 1.000.000, Fondo2024 = 800.000, EQ2024 = 200.000, incremento022Anno = 4.400
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
      fondoRisorseDecentrate2024: 800_000,
      risorseEQ2024: 200_000,
      incremento022Anno: 4_400,
    };
    const res = calculateCcnl2026Increments(input);

    expect(res.isCalcolabile).toBe(true);
    expect(res.incrementoStabile014).toBe(1_400);   // MS2021 × 0,14% × 1
    expect(res.arretrati014).toBe(2_800);            // MS2021 × 0,14% × 2
    expect(res.limiteMassimo022).toBe(4_400);        // MS2021 × 0,22% × 2

    expect(res.baseRiparto2024).toBe(1_000_000);
    expect(res.quotaFondo).toBeCloseTo(0.8, 5);
    expect(res.quotaEQ).toBeCloseTo(0.2, 5);
    expect(res.incremento022Fondo).toBeCloseTo(3_520, 2);  // 4400 × 0.8
    expect(res.incremento022EQ).toBeCloseTo(880, 2);        // 4400 × 0.2

    // Verificare assenza totale cumulato 0,14% + 0,22%
    // La somma NON deve comparire come campo di risultato
    expect((res as unknown as Record<string, unknown>).totalePotenzialeCcnl2026_new).toBeUndefined();
  });

  it('7. [OBBLIGATORIO] Scenario minimo 2027 — limiteMassimo022 × 1, riparto corretto', () => {
    // MS2021 consolidato = 1.000.000, Fondo2024 = 800.000, EQ2024 = 200.000, incremento022Anno = 2.200
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021Consolidato2026: 1_000_000,
      annoRiferimento: 2027,
      fondoRisorseDecentrate2024: 800_000,
      risorseEQ2024: 200_000,
      incremento022Anno: 2_200,
    };
    const res = calculateCcnl2026Increments(input);

    expect(res.isCalcolabile).toBe(true);
    expect(res.isMs2021Consolidato).toBe(true);
    expect(res.incrementoStabile014).toBe(1_400);   // MS2021 × 0,14% × 1 (identico)
    expect(res.arretrati014).toBe(2_800);            // MS2021 × 0,14% × 2 (identico)
    expect(res.limiteMassimo022).toBe(2_200);        // MS2021 × 0,22% × 1 (anno 2027!)

    expect(res.incremento022Fondo).toBeCloseTo(1_760, 2);  // 2200 × 0.8
    expect(res.incremento022EQ).toBeCloseTo(440, 2);        // 2200 × 0.2
  });

  it('8. [OBBLIGATORIO] Errore bloccante se incremento022Anno > limiteMassimo022', () => {
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
      incremento022Anno: 5_000,  // > 4_400 (limite massimo 2026)
    };
    const res = calculateCcnl2026Increments(input);
    expect(res.isSuperamentoLimite022).toBe(true);

    const checks = validateCcnl2026Increments(input);
    const errore = checks.find(c => c.id === 'CCNL2026-022-SUPERAMENTO');
    expect(errore).toBeDefined();
    expect(errore?.severity).toBe('error');
  });

  it('9. [OBBLIGATORIO] incremento022Anno = 0 è valido e produce quote pari a 0', () => {
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
      fondoRisorseDecentrate2024: 800_000,
      risorseEQ2024: 200_000,
      incremento022Anno: 0,  // Zero è un valore valido!
    };
    const res = calculateCcnl2026Increments(input);
    expect(res.isSuperamentoLimite022).toBe(false);
    expect(res.incremento022Fondo).toBeCloseTo(0, 5);
    expect(res.incremento022EQ).toBeCloseTo(0, 5);

    const checks = validateCcnl2026Increments(input);
    expect(checks.find(c => c.id === 'CCNL2026-022-SUPERAMENTO')).toBeUndefined();
  });

  it('10. [OBBLIGATORIO] incremento022Anno assente: calcola limiteMassimo022 ma non il riparto', () => {
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
      fondoRisorseDecentrate2024: 800_000,
      risorseEQ2024: 200_000,
      // incremento022Anno assente!
    };
    const res = calculateCcnl2026Increments(input);

    // Il limite massimo deve essere calcolato
    expect(res.isCalcolabile).toBe(true);
    expect(res.limiteMassimo022).toBe(4_400);

    // Il riparto NON deve essere calcolato
    expect(res.incremento022Fondo).toBeUndefined();
    expect(res.incremento022EQ).toBeUndefined();
    expect(res.incremento022Anno).toBeUndefined();

    // Nessun errore di superamento
    const checks = validateCcnl2026Increments(input);
    expect(checks.find(c => c.id === 'CCNL2026-022-SUPERAMENTO')).toBeUndefined();
  });

  it('11. [OBBLIGATORIO] Anno > 2026 senza MS2021 consolidato: non calcolare, non restituire 0, warning', () => {
    const input: Ccnl2026IncrementsInput = {
      annoRiferimento: 2027,
      // monteSalari2021Consolidato2026 assente!
      monteSalari2021: 999_999, // Questo deve essere ignorato per anni > 2026
    };
    const res = calculateCcnl2026Increments(input);

    // Non calcolabile
    expect(res.isCalcolabile).toBe(false);

    // Nessun valore (non 0!)
    expect(res.incrementoStabile014).not.toBe(0);
    expect(res.limiteMassimo022).not.toBe(0);
    expect(res.incrementoStabile014).toBeUndefined();
    expect(res.limiteMassimo022).toBeUndefined();

    // Warning CCNL2026-MS2021-CONSOLIDATO-MANCANTE
    const checks = validateCcnl2026Increments(input);
    const warning = checks.find(c => c.id === 'CCNL2026-MS2021-CONSOLIDATO-MANCANTE');
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('warning');
  });

  it('12. [OBBLIGATORIO] Warning se baseRiparto2024 è 0 con entrambi i campi a zero', () => {
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
      fondoRisorseDecentrate2024: 0,
      risorseEQ2024: 0,
      incremento022Anno: 1_000,
    };
    const checks = validateCcnl2026Increments(input);
    const warning = checks.find(c => c.id === 'CCNL2026-RIPARTO-BASE-ZERO');
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('warning');

    const res = calculateCcnl2026Increments(input);
    // Il riparto non viene calcolato se base è 0
    expect(res.incremento022Fondo).toBeUndefined();
    expect(res.incremento022EQ).toBeUndefined();
  });

  it('13. [VERIFICA] Nessun totale cumulato 0,14% + 0,22% nei risultati', () => {
    const input: Ccnl2026IncrementsInput = {
      monteSalari2021: 1_000_000,
      annoRiferimento: 2026,
      fondoRisorseDecentrate2024: 800_000,
      risorseEQ2024: 200_000,
      incremento022Anno: 4_400,
    };
    const res = calculateCcnl2026Increments(input);

    // I singoli valori sono presenti
    expect(res.incrementoStabile014).toBe(1_400);
    expect(res.arretrati014).toBe(2_800);
    expect(res.limiteMassimo022).toBe(4_400);
    expect(res.incremento022Fondo).toBeCloseTo(3_520, 2);
    expect(res.incremento022EQ).toBeCloseTo(880, 2);

    // Nessun campo "totale" che sommi 0,14% + 0,22%
    // Il totalePotenzialeCcnl2026 era @deprecated — non deve essere un valore calcolato nuovo
    const resultKeys = Object.keys(res);
    const hasCumulatoKey = resultKeys.some(k => k.toLowerCase().includes('potenziale') || k.toLowerCase().includes('cumulat'));
    expect(hasCumulatoKey).toBe(false);
  });
});
