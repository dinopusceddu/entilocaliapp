import { fixtureRow, confirmedFixtureWrite } from '../../test/fixtures/b1Persistence';
import { describe, expect, it, vi } from 'vitest';
import Big from 'big.js';
import { parseMonetaryValue, defaultMonetaryPolicy, monetaryLocaleDecimal, validateMonetaryData } from '../monetaryBoundary';
import { monetaryPolicies } from '../monetaryPolicies';
import { createEmptyFundData } from '../emptyFund';
import { FundDataSchema } from '../../schemas/fundDataSchemas';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { checkedMonetarySum, checkedMonetaryCalculation, FinancialMath } from '../../utils/financialMath';
import { validateMonetaryProcessing } from '../../application/input/monetaryProcessingSafety';
import { saveAnnualSnapshot, loadAnnualSnapshot } from '../../application/snapshots/snapshotWorkflow';
import { saveAppStateWorkflow } from '../../application/stateWorkflow';
import { ImportDatiGeneraliRowSchema } from '../../schemas/importSchema';
import { UserRole, TipologiaEnte } from '../enums';
import normativa from '../../../public/normativa.json';

const key = 'st_art79c1_art67c1_unicoImporto2017';
const base = () => {
  const data = createEmptyFundData(2025);
  Object.assign(data.annualData, { denominazioneEnte: 'Ente locale', tipologiaEnte: TipologiaEnte.UNIONE_COMUNI, hasDirigenza: false, ccnl2024: { monteSalari2021: 0 } });
  data.historicalData.manualPersonalFundLimit2016 = 100000;
  return data;
};
const fund = (raw: unknown) => { const data = base(); Object.assign(data.fondoAccessorioDipendenteData, { [key]: raw }); return data; };
const rawCases = [-100, 'malformed', NaN, Infinity, -Infinity, 1e308, true, false, {}, [], [100], '123.456'];
describe('DATA-03 shared monetary representation boundary', () => {
  it.each(rawCases)('rejects primary raw %j with an exact schema path; normalizer quarantines explicitly', raw => {
    const data = fund(raw);
    const parsed = FundDataSchema.safeParse(data);
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.some(i => i.path.join('.') === `fondoAccessorioDipendenteData.${key}`)).toBe(true);
    const before = structuredClone(data);
    const input = normalizeInput(data);
    expect(input.monetaryIssues?.length).toBeGreaterThan(0);
    expect(input.fondi.dipendente[key]).toBeUndefined();
    const result = calculateFundCompletely(input, normativa);
    expect(result.canonicalFund.status).toBe('INVALID'); expect(result.canonicalFund.total).toBeNull();
    expect(data).toEqual(before);
  });
  it.each([undefined, null, '', '  ', '\t'])('optional blank %j remains missing', raw => {
    expect(parseMonetaryValue(raw, defaultMonetaryPolicy)).toEqual({ status: 'MISSING', value: undefined });
    const result = FundDataSchema.parse(fund(raw));
    expect(result.fondoAccessorioDipendenteData?.[key]).toBeUndefined();
  });
  it.each([0, 100, '100', '1e3'])('preserves zero/positive/scientific %j', raw => {
    const r = parseMonetaryValue(raw, defaultMonetaryPolicy);
    expect(r.status).toBe('VALID');
    if (r.status === 'VALID') expect(r.value).toBe(Number(raw));
  });
  it('derives the boundary from safe minor units, without unsafe multiplication or rounding', () => {
    const maximum = new Big(Number.MAX_SAFE_INTEGER.toString()).div(100);
    // Largest boundary form that also round-trips through this JS-number DTO.
    expect(parseMonetaryValue(maximum.round(1, Big.roundDown).toString(), defaultMonetaryPolicy).status).toBe('VALID');
    expect(parseMonetaryValue(maximum.plus('0.01').toString(), defaultMonetaryPolicy)).toMatchObject({ status: 'INVALID', issue: { code: 'MONEY_OUT_OF_SAFE_RANGE' } });
    expect(parseMonetaryValue('1e308', defaultMonetaryPolicy)).toMatchObject({ status: 'INVALID', issue: { code: 'MONEY_OUT_OF_SAFE_RANGE' } });
    expect(parseMonetaryValue('123.456', defaultMonetaryPolicy)).toMatchObject({ status: 'INVALID', issue: { code: 'MONEY_INVALID_PRECISION' } });
    expect(parseMonetaryValue('123.456', { scale: null, sign: 'DERIVED_ONLY' })).toEqual({ status: 'VALID', value: 123.456 });
    expect(parseMonetaryValue('-100', { scale: 2, sign: 'SIGNED_ADJUSTMENT' }).status).toBe('VALID');
    expect(parseMonetaryValue(100, { scale: 2, sign: 'NONNEGATIVE_DEDUCTION_MAGNITUDE' }).status).toBe('VALID');
    expect(parseMonetaryValue(100.1, { scale: 0, sign: 'NONNEGATIVE_RESOURCE' }).status).toBe('INVALID');
  });
  it('preserves internal precision until the existing rounding point', () => {
    const result = checkedMonetaryCalculation(() => FinancialMath.addExact(123.456, 0.001));
    expect(result).toEqual({ status: 'VALID', value: 123.457 });
    expect(FinancialMath.roundTo2DP(123.457)).toBe(123.46);
  });
  it('two individually valid inputs fail closed as an aggregate, engine and save', async () => {
    const amount = 60000000000000;
    expect(parseMonetaryValue(amount, defaultMonetaryPolicy).status).toBe('VALID');
    expect(checkedMonetarySum([new Big(amount), new Big(amount)])).toMatchObject({ status: 'INVALID', issue: { code: 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE' } });
    const data = fund(amount);
    data.fondoAccessorioDipendenteData.vs_art79c2c_risorseScelteOrganizzative = amount;
    expect(validateMonetaryData(data)).toEqual([]);
    const result = calculateFundCompletely(normalizeInput(data), normativa);
    expect(result.canonicalFund.status).toBe('INVALID'); expect(result.canonicalFund.total).toBeNull();
    expect(result.monetaryIssues?.some(i => i.code === 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE')).toBe(true);
    expect(JSON.stringify(result)).not.toContain('Infinity');
    expect(validateMonetaryProcessing(data).length).toBeGreaterThan(0);
    data.annualData.tipologiaEnte = TipologiaEnte.ALTRO;
    expect(validateMonetaryProcessing(data).some(i => i.code === 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE')).toBe(true);
    const repo = { upsertState: vi.fn(), getState: vi.fn() };
    const saved = await saveAnnualSnapshot({ stateRepository: repo } as never, { id: 'u' }, { id: 'e', user_id: 'u' }, 2025, UserRole.ADMIN, data);
    expect(saved.reason).toBe('VALIDATION_ERROR'); expect(repo.upsertState).not.toHaveBeenCalled(); expect(repo.getState).not.toHaveBeenCalled();
  });
  it('missing own-properties and retired Dirigenza cache survive schema and normalization', () => {
    const data = base();
    const parsed = FundDataSchema.parse(data);
    expect(Object.keys(parsed.fondoDirigenzaData!)).toEqual([]);
    data.fondoDirigenzaData.lim_totaleParzialeRisorseConfrontoTetto2016 = Infinity;
    expect(validateMonetaryData(data)).toEqual([]);
    expect(normalizeInput(data).fondi.dirigenza.lim_totaleParzialeRisorseConfrontoTetto2016).toBe(Infinity);
  });
  it.each(rawCases)('OPEN malformed %j load is lossless, both saves blocked with zero calls, then correction succeeds', async raw => {
    const data = fund(raw), before = structuredClone(data);
    const user = { id: 'u', role: UserRole.ADMIN }, entity = { id: 'e', user_id: 'u', name: 'Other' };
    const repo = { getState: vi.fn(async () => ({ data: fixtureRow(data, user, entity, 2025), error: null })),
      upsertState: vi.fn(async record => confirmedFixtureWrite(record)) };
    const deps = { stateRepository: repo, entityRepository: { update: vi.fn() } };
    const loaded = await loadAnnualSnapshot(deps as never, user, 'e', 2025);
    expect(loaded.snapshot?.fundData).toEqual(before); repo.getState.mockClear();
    for (const save of [() => saveAnnualSnapshot(deps as never, user, entity, 2025, UserRole.ADMIN, data), () => saveAppStateWorkflow(deps as never, user, entity, 2025, UserRole.ADMIN, data, vi.fn())]) {
      const r = await save(); expect(r.reason).toBe('VALIDATION_ERROR'); expect(r.issues?.length).toBeGreaterThan(0);
    }
    expect(repo.upsertState).not.toHaveBeenCalled(); expect(repo.getState).not.toHaveBeenCalled();
    data.fondoAccessorioDipendenteData[key] = 100;
    expect((await saveAnnualSnapshot(deps as never, user, entity, 2025, UserRole.ADMIN, data, loaded.baseline)).success).toBe(true);
    expect(repo.upsertState.mock.calls[0]?.[0].fund_data.fondoAccessorioDipendenteData[key]).toBe(100);
  });
  it('CSV uses locale adaptation then the shared decimal precision/range policy', () => {
    const row = { anno: '2025', denominazione_ente: 'Ente', tipologia_ente: 'UNIONE_COMUNI', monte_salari_2021: '1.234,56' };
    expect(ImportDatiGeneraliRowSchema.parse(row).monte_salari_2021).toBe(1234.56);
    for (const value of ['123.456', '12abc', '1e308', '-100', true, [], 'Infinity']) expect(ImportDatiGeneraliRowSchema.safeParse({ ...row, monte_salari_2021: value }).success).toBe(false);
    expect(monetaryLocaleDecimal('1,234.56')).toBe('1234.56');
  });
  it('registry policies all declare scale and sign; unknown legacy properties remain metadata', () => {
    expect(monetaryPolicies.every(p => p.scale === 2 || (p.scale === null && p.sign === 'DERIVED_ONLY'))).toBe(true);
    const data = base(); Object.assign(data.fondoAccessorioDipendenteData, { unrelatedLegacy: 'opaque' });
    expect(FundDataSchema.parse(data).fondoAccessorioDipendenteData?.unrelatedLegacy).toBe('opaque');
  });
  it('the actual signed Dirigenza adjustment permits both signs without changing its resolver', () => {
    const data = base(); data.fondoDirigenzaData.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016 = -100;
    expect(validateMonetaryData(data)).toEqual([]);
    expect(FundDataSchema.parse(data).fondoDirigenzaData?.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016).toBe(-100);
  });
  it('checked FinancialMath prevents the frozen Big.js/JSON overflow counterexample', () => {
    expect(checkedMonetaryCalculation(() => FinancialMath.sumAll(1e308, 1e308))).toMatchObject({ status: 'INVALID', issues: [{ code: 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE' }] });
    expect(checkedMonetaryCalculation(() => FinancialMath.sumAll(Infinity))).toMatchObject({ status: 'INVALID', issues: [{ code: 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE' }] });
  });
  it('nested monetary containers cannot hide known values behind primitive or array types', () => {
    for (const bad of [true, 'bad', 100, []]) expect(validateMonetaryData({ annualData: { ccnl2024: bad } })).toMatchObject([{ path: 'annualData.ccnl2024', code: 'MONEY_MALFORMED' }]);
  });
});
