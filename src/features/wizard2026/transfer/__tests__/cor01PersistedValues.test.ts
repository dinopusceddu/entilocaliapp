import { describe, expect, it } from 'vitest';
import { cor01Fund, cor01TransferDraft } from '../../../../test/fixtures/cor01Fund';
import { buildWizard2026TransferPreview, simulateWizard2026Transfer } from '../transferPreviewEngine';
import { applyWizard2026Transfer } from '../applyWizard2026Transfer';
const path = 'fondoElevateQualificazioniData.va_incremento022_ms2021_eq';
describe('COR-01 conservative transfer of adopted values, including hydrated zero', () => {
  it.each([
    [0, 'manual'], [70, 'manual'], [0, undefined], [70, undefined], [0, 'unrecognized'],
  ] as const)('preserves adopted %s with source %s in simulation, preview, apply and repeated transfer', (value, source) => {
    const fund = cor01Fund(); fund.fondoElevateQualificazioniData.va_incremento022_ms2021_eq = value;
    const before = structuredClone(fund); const draft = cor01TransferDraft();
    const sources = source ? { [path]: source } : undefined;
    expect(simulateWizard2026Transfer(draft, fund, sources).fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(value);
    expect(buildWizard2026TransferPreview(draft, fund, sources).items.find(item => item.campoDestinazione === path))
      .toMatchObject({ status: 'CONFLICT', valoreAttuale: value, valoreProposto: 440, differenza: 440 - value });
    const applied = applyWizard2026Transfer(draft, fund, sources);
    expect(applied.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(value);
    expect(applyWizard2026Transfer(draft, applied, sources).fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(value);
    expect(fund).toEqual(before);
  });
  it('a genuinely missing resource can be transferred and a repeated equal proposal is not a conflict', () => {
    const fund = cor01Fund(); delete fund.fondoElevateQualificazioniData.va_incremento022_ms2021_eq;
    const draft = cor01TransferDraft();
    expect(buildWizard2026TransferPreview(draft, fund).items.find(item => item.campoDestinazione === path)?.status).not.toBe('CONFLICT');
    const applied = applyWizard2026Transfer(draft, fund);
    expect(applied.fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(440);
    expect(buildWizard2026TransferPreview(draft, applied).items.find(item => item.campoDestinazione === path)?.status).not.toBe('CONFLICT');
    expect(applyWizard2026Transfer(draft, applied).fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(440);
  });
  it.each(['system', 'wizard2026'])('uses a known live %s origin to recognize a replaceable proposal', source => {
    const fund = cor01Fund(); fund.fondoElevateQualificazioniData.va_incremento022_ms2021_eq = 0;
    expect(applyWizard2026Transfer(cor01TransferDraft(), fund, { [path]: source }).fondoElevateQualificazioniData.va_incremento022_ms2021_eq).toBe(440);
  });
  it('keeps confirmed configuration transfer separate from adopted resource protection', () => {
    const fund = cor01Fund(); fund.historicalData.manualPersonalFundLimit2016 = 0;
    const draft = cor01TransferDraft();
    expect(applyWizard2026Transfer(draft, fund).historicalData.manualPersonalFundLimit2016).toBe(100000);
  });
  it('CLOSED blocks both simulation variants, preview and application without mutating the snapshot', () => {
    const fund = cor01Fund(2026, true); const before = structuredClone(fund); const draft = cor01TransferDraft();
    expect(simulateWizard2026Transfer(draft, fund)).toEqual(before);
    expect(simulateWizard2026Transfer(draft, fund, undefined, true)).toEqual(before);
    const preview = buildWizard2026TransferPreview(draft, fund);
    expect(preview.hasBlockingIssues).toBe(true);
    expect(preview.items.find(item => item.campoDestinazione === path)?.status).toBe('BLOCKED');
    expect(() => applyWizard2026Transfer(draft, fund)).toThrow('SNAPSHOT_CLOSED'); expect(fund).toEqual(before);
  });
});
