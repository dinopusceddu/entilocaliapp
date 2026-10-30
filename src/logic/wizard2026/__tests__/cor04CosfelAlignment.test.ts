import { describe, it, expect } from 'vitest';
import { qualifyCcnl022AnnualAllocation, validateCcnl2026Increments } from '../ccnl2026Increments';
import { validateWizard2026Ccnl2026Step } from '../../../features/wizard2026/validation';
import { buildWizard2026TransferPreview } from '../../../features/wizard2026/transfer/transferPreviewEngine';
import { applyWizard2026Transfer } from '../../../features/wizard2026/transfer/applyWizard2026Transfer';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { calculateFundCompletely } from '../../calculation/fundEngine';
import { cor04Fund, cor04Draft } from '../../../test/fixtures/cor04Ccnl022';
import { FundDataSchema } from '../../../schemas/fundDataSchemas';
import type { NormativeData } from '../../../domain';
const normative = { riferimenti_normativi: {} } as NormativeData;
const cases = [
 { deficit: false, approval: true, status: 'VALID' }, { deficit: false, approval: false, status: 'VALID' },
 { deficit: false, approval: undefined, status: 'VALID' }, { deficit: true, approval: true, status: 'VALID' },
 { deficit: true, approval: false, status: 'INVALID' }, { deficit: true, approval: undefined, status: 'UNDETERMINED' },
] as const;
describe('COR-04 final targeted review: authorization evidence and annual cap are separate', () => {
 it.each(cases)('deficit=$deficit approval=$approval', ({ deficit, approval, status }) => {
  const result = qualifyCcnl022AnnualAllocation({ annoRiferimento: 2026, monteSalari2021: 1000000, amount: 2200,
   isStrutturalmenteDeficitario: deficit, hasApprovazioneCosfel: approval });
  expect(result.status).toBe(status);
  const d = cor04Draft(2200); Object.assign(d.ente, { isStrutturalmenteDeficitario: deficit, hasApprovazioneCosfel: approval });
  expect(validateWizard2026Ccnl2026Step(d).some(c => c.severity === 'error')).toBe(status !== 'VALID');
 });
 it.each([undefined, 0])('an unexercised choice (%s) does not require COSFEL evidence', amount => {
  for (const approval of [true, false, undefined]) {
   const checks = validateCcnl2026Increments({ annoRiferimento: 2026, monteSalari2021: 1000000,
    incremento022Anno: amount, isStrutturalmenteDeficitario: true, hasApprovazioneCosfel: approval });
   expect(checks.filter(c => c.severity === 'error')).toEqual([]);
  }
 });
 it('canonical deficit flag prevents false qualification even though no persisted COSFEL field exists', () => {
  const f = cor04Fund(); f.annualData.isEnteStrutturalmenteDeficitario = true;
  const before = JSON.stringify(f); const r = calculateFundCompletely(normalizeInput(f), normative);
  expect(r.canonicalFund.status).toBe('UNDETERMINED');
  expect(r.canonicalFund.verifiedTotal).toBe(2760); // raw economic subtotal stays 1000 + 1760
  const c = r.compliance.checks.find(c => c.id === 'limite_022_ms2021_complessivo')!;
  expect(c.isCompliant).toBe(false); expect(c.messaggio).toMatch(/COSFEL/);
  expect(JSON.stringify(f)).toBe(before);
 });
 it('a canonical deficit flag cannot be overridden by a wizard ordinary flag or transient approval', () => {
  const f = cor04Fund(); f.annualData.isEnteStrutturalmenteDeficitario = true;
  delete f.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021;
  delete f.fondoElevateQualificazioniData.va_incremento022_ms2021_eq;
  const before = JSON.stringify(f);
  for (const deficit of [false, true]) {
   const d = cor04Draft(2200); Object.assign(d.ente, { isStrutturalmenteDeficitario: deficit, hasApprovazioneCosfel: true });
   expect(buildWizard2026TransferPreview(d, f).items.find(i => i.id === 'CCNL_022_CURRENT')?.status).toBe('BLOCKED');
   expect(() => applyWizard2026Transfer(d, f)).toThrow(/COSFEL/);
  }
  expect(JSON.stringify(f)).toBe(before);
 });
 it('zero, hydration and CLOSED preserve the distinction without inventing persisted evidence', () => {
  for (const amount of [0, 1760]) {
   const f = cor04Fund(amount, amount ? 440 : 0); f.annualData.isEnteStrutturalmenteDeficitario = true;
   const reloaded = FundDataSchema.parse(JSON.parse(JSON.stringify(f))) as ReturnType<typeof cor04Fund>;
   const r = calculateFundCompletely(normalizeInput(reloaded), normative);
   expect(r.canonicalFund.status).toBe(amount ? 'UNDETERMINED' : 'VALID');
   reloaded.metadata!.snapshotStatus = 'CLOSED' as any; const before = JSON.stringify(reloaded);
   calculateFundCompletely(normalizeInput(reloaded), normative);
   expect(() => applyWizard2026Transfer(cor04Draft(2200), reloaded)).toThrow(/SNAPSHOT_CLOSED/);
   expect(JSON.stringify(reloaded)).toBe(before);
  }
 });
});

it('a transient deficit declaration cannot be lost while APPLY leaves the canonical fund classified ordinary', () => {
 const f = cor04Fund(0, 0); f.annualData.isEnteStrutturalmenteDeficitario = false;
 delete f.fondoAccessorioDipendenteData.vn_art58c2_CCNL2026_incremento022_MS2021;
 delete f.fondoElevateQualificazioniData.va_incremento022_ms2021_eq;
 const d = cor04Draft(2200); Object.assign(d.ente, { isStrutturalmenteDeficitario: true, hasApprovazioneCosfel: true });
 const before = JSON.stringify(f);
 expect(buildWizard2026TransferPreview(d, f).items.find(i => i.id === 'CCNL_022_CURRENT')?.status).toBe('BLOCKED');
 expect(() => applyWizard2026Transfer(d, f)).toThrow(/COSFEL-CANONICAL-SCOPE-UNQUALIFIED/);
 expect(JSON.stringify(f)).toBe(before);
});
it('non-exercise adds no 0.22 cap prerequisite when unrelated parameters are missing', () => {
 const f = cor04Fund(0, 0); f.annualData.isEnteStrutturalmenteDeficitario = true;
 delete f.annualData.ccnl2024!.monteSalari2021;
 const r = calculateFundCompletely(normalizeInput(f), normative);
 expect(r.canonicalFund.missingPrerequisites.some(code => code.includes('CCNL2026-022') || code.includes('COSFEL'))).toBe(false);
 expect(r.canonicalFund.entries.find(e => e.id === 'CCNL_022_ANNUAL_CAP')).toBeUndefined();
 expect(r.compliance.checks.find(c => c.id === 'limite_022_ms2021_complessivo')?.messaggio).toMatch(/NON DETERMINABILE/);
 const d = cor04Draft(0); delete d.ccnl2026.incremento022Anno; delete d.ccnl2026.monteSalari2021;
 Object.assign(d.ente, { isStrutturalmenteDeficitario: true, hasApprovazioneCosfel: false });
 expect(validateWizard2026Ccnl2026Step(d).filter(c => c.severity === 'error')).toEqual([]);
});
