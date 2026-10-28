import { describe, expect, it } from 'vitest';
import {
  DIRIGENZA_ART23_SUBJECT_FIELDS, DIRIGENZA_ART23_EXCLUDED_FIELDS,
  resolveDirigenzaArt23Subject, reconcileDirigenzaArt23Cache,
} from '../dirigenzaArt23';
import type { DirigenzaAtomicData } from '../dirigenzaArt23';

const base = 'st_art57c2a_CCNL2020_unicoImporto2020';
describe('Dirigenza Art23 atomic authority', () => {
  it.each(DIRIGENZA_ART23_SUBJECT_FIELDS)('optional subject line %s can stand alone', field => {
    expect(resolveDirigenzaArt23Subject({ [field]: 2000 }, true)).toEqual({
      status: 'VALID', subjectAmount: 2000, excludedAmount: 0, issues: [],
    });
  });
  it.each(DIRIGENZA_ART23_EXCLUDED_FIELDS)('excluded line %s never increases subject', field => {
    expect(resolveDirigenzaArt23Subject({ [base]: 2000, [field]: 300 }, true)).toMatchObject({
      status: 'VALID', subjectAmount: 2000, excludedAmount: 300,
    });
  });
  it.each([undefined, null, 0])('optional absence %s is zero beside the declared base', absent => {
    const data = Object.fromEntries(DIRIGENZA_ART23_SUBJECT_FIELDS.map(field => [field, absent]));
    data[base] = 280000;
    expect(resolveDirigenzaArt23Subject(data as DirigenzaAtomicData, true)).toMatchObject({ status: 'VALID', subjectAmount: 280000 });
  });
  it('zero is determined and never falls back to a positive cached amount', () => {
    const resolution = resolveDirigenzaArt23Subject({ [base]: 0 }, true);
    expect(resolution).toMatchObject({ status: 'VALID', subjectAmount: 0 });
    expect(reconcileDirigenzaArt23Cache(resolution, 5000).status).toBe('MISMATCH');
  });
  it.each([undefined, null])('a declared optional empty line %s is legitimate zero detail', value => {
    expect(resolveDirigenzaArt23Subject({ [base]: value } as DirigenzaAtomicData, true)).toMatchObject({ status: 'VALID', subjectAmount: 0 });
  });
  it('the complete blank UI resource model is valid zero, not fake missing', () => {
    const data = Object.fromEntries([...DIRIGENZA_ART23_SUBJECT_FIELDS, ...DIRIGENZA_ART23_EXCLUDED_FIELDS].map(field => [field, undefined]));
    expect(resolveDirigenzaArt23Subject(data, true)).toMatchObject({ status: 'VALID', subjectAmount: 0, excludedAmount: 0 });
  });
  it.each([undefined, null, {}])('no resource detail %s is genuinely unresolved', data => {
    expect(resolveDirigenzaArt23Subject(data, true)).toMatchObject({ status: 'UNDETERMINED', subjectAmount: null });
  });
  it.each([0, 2000, 999999])('cache-only %s cannot certify missing resource detail', cached => {
    const data = { lim_totaleParzialeRisorseConfrontoTetto2016: cached };
    const resolution = resolveDirigenzaArt23Subject(data as DirigenzaAtomicData, true);
    expect(resolution.status).toBe('UNDETERMINED');
    expect(reconcileDirigenzaArt23Cache(resolution, cached).status).toBe('UNAVAILABLE');
  });
  it.each([undefined, null])('required applicability %s is unresolved', flag => {
    expect(resolveDirigenzaArt23Subject({ [base]: 2000 }, flag).status).toBe('UNDETERMINED');
  });
  it('hasDirigenza false contributes zero even with stale malformed detail', () => {
    expect(resolveDirigenzaArt23Subject({ [base]: Infinity }, false)).toMatchObject({ status: 'VALID', subjectAmount: 0, excludedAmount: 0 });
  });
  it.each([NaN, Infinity, -Infinity, -1, '2000', {}, true, Number.MAX_VALUE])('invalid subject %s fails closed', value => {
    const data = { [base]: value } as unknown as DirigenzaAtomicData;
    expect(resolveDirigenzaArt23Subject(data, true)).toMatchObject({ status: 'INVALID', subjectAmount: null });
  });
  it('invalid excluded resource also fails closed', () => {
    expect(resolveDirigenzaArt23Subject({ [base]: 2000, va_art57c3_CCNL2020_residuiAnnoPrecedente: Infinity }, true).status).toBe('INVALID');
  });
  it('overflowing safe totals fail closed', () => {
    expect(resolveDirigenzaArt23Subject({ [base]: Number.MAX_SAFE_INTEGER, va_compensiExLege_rilevanti: 100 }, true).status).toBe('INVALID');
  });
  it('decimal sums are rounded after exact addition', () => {
    expect(resolveDirigenzaArt23Subject({ [base]: 0.1, va_compensiExLege_rilevanti: 0.2 }, true).subjectAmount).toBe(0.3);
  });
  it('manual limit adjustment and deductions retain their separate classification', () => {
    expect(resolveDirigenzaArt23Subject({ [base]: 2000, lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016: 900, lim_art4_DL16_2014_misureMancatoRispettoVincoli: 100 }, true).subjectAmount).toBe(2000);
  });
  it('pure resolver ignores even an unreadable legacy total', () => {
    const data = { [base]: 280000 };
    Object.defineProperty(data, 'lim_totaleParzialeRisorseConfrontoTetto2016', { get: () => { throw new Error('Cache must not be read'); } });
    Object.freeze(data);
    expect(resolveDirigenzaArt23Subject(data, true).subjectAmount).toBe(280000);
    expect(resolveDirigenzaArt23Subject(data, true).subjectAmount).toBe(280000);
  });
  it.each([
    [undefined, 'ABSENT'], [null, 'ABSENT'], [280000, 'RECONCILED'], [0, 'MISMATCH'],
    [999999, 'MISMATCH'], [NaN, 'INVALID_CACHE'], [Infinity, 'INVALID_CACHE'], ['280000', 'INVALID_CACHE'],
  ])('reconciliation %s is informational (%s)', (cached, status) => {
    const resolution = resolveDirigenzaArt23Subject({ [base]: 280000 }, true);
    expect(reconcileDirigenzaArt23Cache(resolution, cached).status).toBe(status);
    expect(resolution.subjectAmount).toBe(280000);
  });
});
