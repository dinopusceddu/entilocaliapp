import { describe, expect, it } from 'vitest';
import { validateFundData } from '../../validation';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { cor01Fund } from '../../../test/fixtures/cor01Fund';
import { calculateFundCompletely } from '../fundEngine';
import type { NormativeData } from '../../../domain';
import { initialWizard2026DraftState } from '../../../features/wizard2026/initialState';
import { calculateCcnl2026Increments } from '../../wizard2026/ccnl2026Increments';
import { simulateWizard2026Transfer, buildWizard2026TransferPreview } from '../../../features/wizard2026/transfer/transferPreviewEngine';
const normative = { riferimenti_normativi: {} } as NormativeData;
const calculate = (fund: ReturnType<typeof cor01Fund>) => calculateFundCompletely(normalizeInput(fund), normative);

describe('COR-01 independent economic projections; no input materialization', () => {
  it('uses a complete synthetic fixture accepted by the real calculation workflow', () => { expect(validateFundData(cor01Fund())).toEqual({}); });
  it.each([0, 17])('T2/T3/T11 projects EQ and overtime without replacing adopted EQ %s or overtime 777', value => {
    const fund = cor01Fund(); fund.fondoAccessorioDipendenteData.st_riduzionePerIncrementoEQ = value;
    const before = structuredClone(fund); const result = calculate(fund);
    expect(fund).toEqual(before);
    expect(result.canonicalFund.status).toBe('VALID');
    expect(result.fondi.dipendente.summary).toMatchObject({ totaleStabile: 8500, totaleVariabile: 200, totaleFondo: 8700 });
    expect(result.reductions?.totalFadReductions).toBe(1500);
    expect(result.canonicalFund.verifiedArt23Subject).toBe(10200); // FAD 8700 + ordinary overtime 1500
    expect(result.canonicalFund.verifiedArt23Excluded).toBe(0);
    expect(result.fondi.eq.summary.totaleFondo).toBe(6070);
    expect(result.fondi.segretario.summary).toMatchObject({ totaleStabile: 550, totaleVariabile: 100, totaleFondo: 650 });
    expect(result.compliance.art23Compliance?.art23Componenti?.segretario).toBe(600);
    const repeated = calculate(fund);
    expect(repeated.fondi).toEqual(result.fondi);
    expect(repeated.canonicalFund).toEqual(result.canonicalFund);
    expect(repeated.reductions).toEqual(result.reductions);
  });
  it('T11 moves the same EQ reduction to the existing PO/AP treatment with dirigenza', () => {
    const fund = cor01Fund(); fund.annualData.hasDirigenza = true;
    // The independent FAD reduction remains 1000; current dirigenza readiness is a separate check.
    const result = calculate(fund);
    expect(result.reductions?.details.fad).toMatchObject({ riduzionePerIncrementoEQ: 0, decurtazionePO_AP: 1000, riduzioneFondoStraordinario: 500 });
    expect(result.canonicalFund.verifiedStableTotal).toBe(8500);
  });
  it.each(['isEnteDissestato', 'isEnteStrutturalmenteDeficitario', 'isEnteRiequilibrioFinanziario'] as const)(
    'T4 retains raw resources but excludes their economic effect under %s', flag => {
      const fund = cor01Fund(); fund.annualData[flag] = true; const before = structuredClone(fund);
      const result = calculate(fund);
      expect(fund).toEqual(before); expect(fund.fondoAccessorioDipendenteData.vs_art79c2c_risorseScelteOrganizzative).toBe(200);
      expect(result.canonicalFund.verifiedVariableTotal).toBe(0);
      expect(result.canonicalFund.verifiedStableTotal).toBe(8500);
    });
  it('T9 preserves the existing CLOSED overtime projection instead of applying OPEN synchronization', () => {
    const fund = cor01Fund(2026, true); const before = structuredClone(fund);
    const result = calculate(fund);
    expect(normalizeInput(fund).snapshotStatus).toBe('CLOSED');
    expect(result.canonicalFund.verifiedStableTotal).toBe(8223); // 10000 - 1000 EQ - adopted overtime 777
    expect(fund).toEqual(before);
  });
  it('T10 manual zero remains a conflict in preview and cannot be silently replaced by transfer', () => {
    const fund = cor01Fund(); fund.fondoElevateQualificazioniData.va_incremento022_ms2021_eq = 0;
    const draft = structuredClone(initialWizard2026DraftState);
    draft.ccnl2026.result = calculateCcnl2026Increments({ annoRiferimento: 2026, monteSalari2021: 1000000,
      incremento022Anno: 2200, fondoRisorseDecentrate2024: 80000, risorseEQ2024: 20000 });
    const sources = { 'fondoElevateQualificazioniData.va_incremento022_ms2021_eq': 'manual' };
    const next = simulateWizard2026Transfer(draft, fund, sources);
    expect(next.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(0);
    const row = buildWizard2026TransferPreview(draft, fund, sources).items.find(i => i.campoDestinazione === 'fondoElevateQualificazioniData.va_incremento022_ms2021_eq');
    expect(row).toMatchObject({ status: 'CONFLICT', valoreAttuale: 0 });
    expect(simulateWizard2026Transfer(draft, fund, sources, true).fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(440);
  });
});
