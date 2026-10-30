import { describe, it, expect } from 'vitest';
import { cor03Fund } from '../../../test/fixtures/cor03Dl25';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { calculateFundCompletely } from '../fundEngine';
import { resolveAnnualDl25 } from '../../shared/dl25CarryForward';
import { presentArt23Verification } from '../../../domain/art23Verification';
import { createReportViewModel } from '../../../presenters/reportPresenter';
import { projectFundDocument } from '../../../domain/documentProjection';
import type { SimulatoreIncrementoRisultati, NormativeData } from '../../../domain';
const cases: { name: string; financial?: SimulatoreIncrementoRisultati; delta: number; expected: string }[] = [
  { name: 'missing financial verification', delta: 3000, expected: 'UNDETERMINED' },
  { name: 'unqualified numeric maximum', financial: { fase5_incrementoNettoEffettivoFondo: 3000 }, delta: 3000, expected: 'UNDETERMINED' },
  { name: 'verified financial room', financial: { state: 'VALID', fase5_incrementoNettoEffettivoFondo: 3000 }, delta: 3000, expected: 'VALID' },
  { name: 'undetermined financial verification', financial: { state: 'UNDETERMINED', fase5_incrementoNettoEffettivoFondo: 3000 }, delta: 3000, expected: 'UNDETERMINED' },
  { name: 'invalid financial verification', financial: { state: 'INVALID', fase5_incrementoNettoEffettivoFondo: 3000 }, delta: 3000, expected: 'INVALID' },
  { name: 'annual decision exceeds verified room', financial: { state: 'VALID', fase5_incrementoNettoEffettivoFondo: 2999 }, delta: 3000, expected: 'INVALID' },
  { name: 'consolidated prior stock, no current increment', delta: 0, expected: 'VALID' },
];
describe('COR-03 independent review: stock is not financial qualification', () => {
  it.each(cases)('$name', ({ financial, delta, expected }) => {
    const f = cor03Fund(); f.annualData.simulatoreRisultati = financial;
    f.annualData.dl25!.currentYearDelta = delta;
    f.fondoAccessorioDipendenteData.st_incrementoDL25_2025 = 4000 + delta;
    const before = JSON.stringify(f);
    // Accounting and the statutory 48% ceiling are valid in every scenario.
    expect(resolveAnnualDl25(f)).toMatchObject({ state: 'VALID', totalCeiling: 24000 });
    const r = calculateFundCompletely(normalizeInput(f), { riferimenti_normativi: {} } as NormativeData);
    expect(r.canonicalFund.entries.find(e => e.id === 'DL25_CURRENT')).toMatchObject({ status: expected, amount: 4000 + delta });
    if (expected === 'VALID') expect(r.canonicalFund).toMatchObject({ total: 5000 + delta, art23Subject: 1000, art23Excluded: 4000 + delta });
    else {
      expect(r.canonicalFund.total).toBeNull();
      expect(presentArt23Verification(r).isCompliant).toBe(false);
      expect(createReportViewModel(r, 'Comune').fondoDipendenti.limiteArt23.esitoLabel).not.toBe('CONFORME');
      expect(projectFundDocument(r).isDefinitiveDocumentReady).toBe(false);
    }
    // Financial validity is not an administrative attestation or adoption by the entity.
    const doc = projectFundDocument(r);
    expect(doc.hasRevisoriParere).toBe(false); expect(doc.hasDeliberaGC).toBe(false);
    expect(doc.revisoriAttestationText).toContain("non risultano documentati");
    expect(doc.gcAttestationText).toContain("non risulta documentata");
    expect(JSON.stringify(f)).toBe(before);
    f.metadata!.snapshotStatus = 'CLOSED' as any; const closed = JSON.stringify(f);
    calculateFundCompletely(normalizeInput(f), { riferimenti_normativi: {} } as NormativeData);
    expect(JSON.stringify(f)).toBe(closed);
  });
});
