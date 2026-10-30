import { describe, it, expect } from 'vitest';
import { dl25Base, dl25Draft, dl25Fund, dl25Finance } from './dl25TestData';
import { applyWizard2026Transfer } from '../transfer/applyWizard2026Transfer';
import { simulateWizard2026Transfer, buildWizard2026TransferPreview } from '../transfer/transferPreviewEngine';
import { calculateSimulazione } from '../../../logic/calculation/fundEngine';
import { resolveWizardDl25Carry, resolveWizardDl25Simulation } from '../dl25Contract';
import { resolveAnnualDl25, carryDl25ToNextYear } from '../../../logic/shared/dl25CarryForward';
import { buildCanonicalFundLedger } from '../../../logic/calculation/canonicalFundLedger';
import { FundDataSchema } from '../../../schemas/fundDataSchemas';

describe('DL25 coherent integration: domain, transfer, simulator, ledger and hydration', () => {
  it('missing entity scope and mismatching target annuality never accept a DL25 write', () => {
    const d = dl25Draft(); d.ente.entityType = undefined;
    expect(() => applyWizard2026Transfer(d, dl25Fund())).toThrow(/DL25_ENTITY_SCOPE_MISSING/);
    d.ente.entityType = 'COMUNE';
    expect(() => applyWizard2026Transfer(d, dl25Fund(2027))).toThrow(/DL25_REFERENCE_YEAR_MISMATCH/);
    expect(simulateWizard2026Transfer(d, dl25Fund(2027)).fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBeUndefined();
  });
  it('stock 14000 then correction to19000 replaces the decision, preserving delta and base', () => {
    const d = dl25Draft(2026, 4000, 10000), source = dl25Fund();
    const original = JSON.stringify(source);
    const first = applyWizard2026Transfer(d, source);
    expect(first.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(14000);
    d.dl25.currentYearDelta = 15000;
    // A correction within the live wizard session has a known source, as recorded by WizardTransferAction.
    const second = applyWizard2026Transfer(d, first,
      { 'fondoAccessorioDipendenteData.st_incrementoDL25_2025': 'wizard2026' });
    expect(second.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(19000);
    expect(second.annualData.dl25?.currentYearDelta).toBe(15000);
    expect(second.wizard2026TransferSnapshot.computed.dl25CurrentYearDelta).toBe(15000);
    expect(second.wizard2026TransferSnapshot.computed.dl25MassimoTeorico).toBe(24000);
    expect(JSON.stringify(source)).toBe(original);
    const again = applyWizard2026Transfer(d, second);
    expect(again.annualData.dl25).toEqual(second.annualData.dl25);
    expect(again.fondoAccessorioDipendenteData).toEqual(second.fondoAccessorioDipendenteData);
  });
  it.each(['manual', undefined, 'unrecognized'])('manual/unknown conflict (%s) preserves applied stock/delta and reports pending decision without certifying an unapplied write', source => {
    const d = dl25Draft(2026, 4000, 10000);
    const first = applyWizard2026Transfer(d, dl25Fund());
    d.dl25.currentYearDelta = 15000;
    const path = 'fondoAccessorioDipendenteData.st_incrementoDL25_2025';
    const local = source ? { [path]: source } : undefined;
    expect(buildWizard2026TransferPreview(d, first, local).items.find(i => i.id === 'st_incrementoDL25_2025')?.status).toBe('CONFLICT');
    const kept = applyWizard2026Transfer(d, first, local);
    expect(kept.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(14000);
    expect(kept.annualData.dl25?.currentYearDelta).toBe(10000);
    expect(kept.wizard2026TransferSnapshot.computed.dl25CurrentYearDelta).toBe(10000);
    expect(kept.wizard2026TransferSnapshot.computed.dl25RequestedCurrentYearDelta).toBe(15000);
    expect(kept.wizard2026TransferSnapshot.computed.dl25ImportoApplicato).toBe(14000);
    expect(kept.wizard2026TransferSnapshot.transferPlan.find((p: any) => p.destinationPath === path)?.status).toBe('CONFLICT');
    expect(applyWizard2026Transfer(d, kept, { [path]: 'wizard2026' }).fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(19000);
  });
  it.each([['CUMULATIVE_STOCK', 19000], ['CURRENT_YEAR_DELTA', 15000]] as const)('qualified legacy %s yields stock19000 without mutation before transfer', (legacyQualification, raw) => {
    const d = dl25Draft(); d.dl25.currentYearDelta = undefined;
    Object.assign(d.dl25, { legacyStoredAmount: raw, legacyQualification });
    const f = dl25Fund(); f.fondoAccessorioDipendenteData.st_incrementoDL25_2025 = raw;
    const before = JSON.stringify(f);
    expect(buildWizard2026TransferPreview(d, f).items.find(i => i.id === 'st_incrementoDL25_2025')?.valoreProposto).toBe(19000);
    expect(JSON.stringify(f)).toBe(before);
    // Explicitly qualified live legacy proposal; an unknown adopted amount is tested separately above.
    const r = applyWizard2026Transfer(d, f,
      { 'fondoAccessorioDipendenteData.st_incrementoDL25_2025': 'wizard2026' });
    expect(r.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(19000);
    expect(r.annualData.dl25?.currentYearDelta).toBe(15000);
    expect(r.annualData.dl25?.legacyQualification).toBe(legacyQualification);
  });
  it.each(['UNKNOWN', undefined] as const)('unqualified raw never becomes stock even with a new delta (%s)', legacyQualification => {
    const d = dl25Draft(); d.dl25.legacyQualification = legacyQualification;
    const f = dl25Fund(); f.fondoAccessorioDipendenteData.st_incrementoDL25_2025 = 19000;
    expect(simulateWizard2026Transfer(d, f).fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(19000);
    expect(applyWizard2026Transfer.bind(null, d, f)).toThrow(/LEGACY_CARRY_FORWARD_UNQUALIFIED/);
  });
  it('prior missing is blocked, explicit zero with provenance is valid', () => {
    const d = dl25Draft(2026, 0, 1000);
    expect(applyWizard2026Transfer(d, dl25Fund()).fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(1000);
    d.dl25.priorCumulativeApplied = undefined;
    expect(() => applyWizard2026Transfer(d, dl25Fund())).toThrow(/PRIOR_DL25_STOCK_MISSING/);
  });
  it('CLOSED never rewrites and a legacy OPEN amount is not changed by simulation', () => {
    const f = dl25Fund(); f.metadata!.snapshotStatus = 'CLOSED' as any;
    const before = JSON.stringify(f);
    expect(() => applyWizard2026Transfer(dl25Draft(), f)).toThrow(/SNAPSHOT_CLOSED/);
    expect(JSON.stringify(f)).toBe(before);
  });
  it('N+1 progression and canonical ledger count a single stock, never stock plus delta or alias', () => {
    const a = applyWizard2026Transfer(dl25Draft(2025, 0, 4000), dl25Fund(2025));
    const b = carryDl25ToNextYear(a, dl25Fund(), 2026);
    expect(resolveAnnualDl25(b).remainingCapacity).toBe(20000);
    // The carry helper produced this live system value; it is not an unknown hydrated input.
    const c = applyWizard2026Transfer(dl25Draft(), b,
      { 'fondoAccessorioDipendenteData.st_incrementoDL25_2025': 'system' });
    const n = carryDl25ToNextYear(c, dl25Fund(2027), 2027);
    expect(resolveAnnualDl25(n).remainingCapacity).toBe(5000);
    const ledger = buildCanonicalFundLedger({ year: 2026, annualData: c.annualData, fadData: c.fondoAccessorioDipendenteData, sections: {
      stabili: { id: 'stabili', title: 'Stabili', total: 123000, items: [
        { key: 'st_base', amount: 100000, isRelevantToArt23Limit: true },
        { key: 'st_incrementoDL25_2025', amount: 19000 },
        { key: 'st_incrementoDecretoPA', amount: 4000 },
      ] as any },
    } });
    const economic = ledger.entries.filter(e => e.economicEffect !== false && e.id.startsWith('DL25'));
    expect(economic).toHaveLength(1); expect(economic[0].amount).toBe(19000);
    expect(ledger.verifiedStableTotal).toBe(119000);
  });
  it('schema and JSON reload preserve canonical facts, qualification, date and stock', () => {
    const d = dl25Draft(); Object.assign(d.dl25, { legacyStoredAmount: 15000, legacyQualification: 'CURRENT_YEAR_DELTA' });
    const f = applyWizard2026Transfer(d, dl25Fund());
    const reloaded = FundDataSchema.parse(JSON.parse(JSON.stringify(f)));
    expect(reloaded.annualData.dl25).toEqual(f.annualData.dl25);
    expect(reloaded.fondoAccessorioDipendenteData?.st_incrementoDL25_2025).toBe(19000);
    expect(resolveAnnualDl25(reloaded as any)).toEqual(resolveWizardDl25Carry(d));
  });
  it.each([['2026-08-07', 5000], ['2026-08-08', 24000], ['2026-08-09', 24000]] as const)('core temporal boundary %s', (regimeDate, expected) => {
    const f = dl25Fund(); f.annualData.dl25 = { ...dl25Base, priorCumulativeApplied: 0, priorStockProvenance: 'Costituzione 2025', currentYearDelta: 0, regimeDate };
    const r = calculateSimulazione({ ...dl25Finance, simTettoSpesaPersonaleL296_06: 6370 }, 5000, f.annualData.tipologiaEnte, f.annualData);
    expect(r?.fase5_incrementoNettoEffettivoFondo).toBe(expected);
  });
  it('financial binding room12740 converts to10000, and a larger annual delta cannot transfer', () => {
    const d = dl25Draft(2026, 0, 15000);
    d.dl25.simulationInput = { ...dl25Finance, simMediaEntrateCorrenti2021_2023: 100000, simSpesaPersonaleConsuntivo2023: 14160 };
    expect(resolveWizardDl25Simulation(d)?.fase5_incrementoNettoEffettivoFondo).toBe(10000);
    expect(() => applyWizard2026Transfer(d, dl25Fund())).toThrow(/DL25_DELTA_EXCEEDS_FINANCIAL_ROOM/);
    expect(buildWizard2026TransferPreview(d, dl25Fund()).items.find(i => i.id === 'st_incrementoDL25_2025')?.status).toBe('BLOCKED');
  });
  it('missing material business date blocks transfer, nonbinding historical margin documents indifference', () => {
    const d = dl25Draft(2026, 0, 1000); d.dl25.regimeDate = undefined;
    d.dl25.simulationInput = { ...dl25Finance, simTettoSpesaPersonaleL296_06: 6370 };
    expect(resolveWizardDl25Simulation(d)?.state).toBe('UNDETERMINED');
    expect(() => applyWizard2026Transfer(d, dl25Fund())).toThrow(/DL25_FINANCIAL_REGIME_UNDETERMINED/);
    d.dl25.simulationInput.simTettoSpesaPersonaleL296_06 = 100000;
    expect(resolveWizardDl25Simulation(d)?.dateIndifferent).toBe(true);
    d.dl25.regimeDate = '2025-08-08';
    expect(resolveWizardDl25Simulation(d)?.state).toBe('UNDETERMINED');
  });
  it('legacy later-year simulator remains undetermined despite sufficient numeric margins', () => {
    const f = dl25Fund();
    expect(calculateSimulazione({ ...dl25Finance, simStipendiTabellari2023: 300000, simFondoStabileAnnoApplicazione: 100000, simRisorsePOEQAnnoApplicazione: 20000 }, 5000, f.annualData.tipologiaEnte, f.annualData)?.state).toBe('UNDETERMINED');
    expect(calculateSimulazione({ ...dl25Finance, referenceYear: 2026, simStipendiTabellari2023: 300000, simFondoStabileAnnoApplicazione: 100000, simRisorsePOEQAnnoApplicazione: 20000 }, 5000, f.annualData.tipologiaEnte)?.state).toBe('UNDETERMINED');
  });
});

it('explicit DL25 transfer retains financial qualification through preview, apply and hydration without mutating its source', () => {
  const draft = dl25Draft(); const source = dl25Fund(); const before = JSON.stringify(source);
  const preview = simulateWizard2026Transfer(draft, source);
  const applied = applyWizard2026Transfer(draft, source);
  const reloaded = FundDataSchema.parse(JSON.parse(JSON.stringify(applied)));
  for (const fund of [preview, applied, reloaded]) {
    expect(fund.annualData?.simulatoreRisultati).toMatchObject({ state: 'VALID', fase5_incrementoNettoEffettivoFondo: 20000 });
    expect(fund.fondoAccessorioDipendenteData?.st_incrementoDL25_2025).toBe(19000);
  }
  expect(JSON.stringify(source)).toBe(before);
});
