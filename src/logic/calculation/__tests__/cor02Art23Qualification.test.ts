import { describe, expect, it } from 'vitest';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { calculateFundCompletely } from '../fundEngine';
import { calculateHistoricalLimit2016Core } from '../../shared/historicalLimit2016Core';
import { cor02Fund, cor02Scenarios } from '../../../test/fixtures/cor02Art23';
import { presentArt23Verification } from '../../../domain/art23Verification';
import { createDocumentViewModel } from '../../../presenters/documentPresenter';
import type { NormativeData } from '../../../domain';
const normative = { riferimenti_normativi: {} } as NormativeData;
const calculate = (f: ReturnType<typeof cor02Fund>) => calculateFundCompletely(normalizeInput(f), normative);
describe('COR-02 qualified Art23 comparison, separate from economic resources', () => {
  it.each(cor02Scenarios)('scenario $id: $name', ({ make, status }) => {
    const fund = make(); const before = structuredClone(fund); const result = calculate(fund);
    const check = result.compliance.checks.find(c => c.id === 'limite_art23_c2')!;
    expect(result.compliance.art23c2.status, JSON.stringify(result.compliance.art23c2.missingPrerequisites)).toBe(status);
    expect(result.compliance.art23Compliance?.status).toBe(status);
    expect(result.compliance.art23c2.isCompliant).toBe(status === 'VALID');
    expect(check.isCompliant).toBe(status === 'VALID');
    const view = presentArt23Verification(result);
    expect(createDocumentViewModel(result, 'Ente sintetico', { name: 'Revisore', role: 'GUEST' }).compliance.art23c2.esitoLabel).toBe(view.label);
    expect(view.label).toBe(status === 'VALID' ? 'CONFORME' : 'NON DETERMINABILE');
    if (status !== 'VALID') {
      expect(result.compliance.art23Compliance?.isSforamento).toBe(false);
      expect(result.compliance.art23Compliance?.margineResiduo).toBeUndefined();
      expect(view.formattedLimit).toBe('Non determinabile');
    }
    expect(fund).toEqual(before);
  });
  it('zero is present: certified zero exceeds a positive consumption rather than becoming missing', () => {
    const f = cor02Fund(); f.historicalData.manualPersonalFundLimit2016 = 0;
    const r = calculate(f); expect(r.compliance.art23c2).toMatchObject({ status: 'INVALID', comparisonReady: true, limite: 0, isCompliant: false });
    expect(presentArt23Verification(r).isOverLimit).toBe(true);
    expect(r.compliance.art23Compliance?.isSforamento).toBe(true);
  });
  it('preserves complete economic arithmetic: FAD 8700, whole-entity subject 16800 and margin 83200', () => {
    const r = calculate(cor02Fund());
    expect(r.canonicalFund.verifiedTotal).toBe(8700);
    expect(r.fondi.dipendente.summary).toMatchObject({ totaleStabile: 8500, totaleVariabile: 200, totaleFondo: 8700 });
    expect(r.compliance.art23c2).toMatchObject({ status: 'VALID', valoreSoggetto: 16800, limite: 100000, delta: 83200 });
  });
  it('does not reconstruct historical overtime using a current-year amount', () => {
    const f = cor02Scenarios[4].make(); delete f.historicalData.fondoStraordinario2016;
    f.annualData.fondoLavoroStraordinario = 99999; const r = calculate(f);
    expect(r.compliance.art23Compliance?.limiteStorico2016).toBe(100000);
    expect(r.compliance.art23c2.status).toBe('UNDETERMINED');
    expect(r.compliance.art23c2.missingPrerequisites).toContain('HISTORICAL_2016_MISSING:fondoStraordinario');
  });
  it('Art33 applicability BLOCK qualifies the comparison without throwing away the economic read result', () => {
    const f = cor02Fund(); delete f.annualData.art33ManualDecision;
    const r = calculate(f); expect(r.compliance.art23c2.status).toBe('UNDETERMINED');
    expect(r.compliance.art23c2.missingPrerequisites).toContain('ART33_APPLICABILITY_UNDETERMINED');
    expect(r.canonicalFund.verifiedTotal).toBe(8700);
  });
  it.each(cor02Scenarios)('CLOSED scenario $id keeps persisted inputs byte-identical', ({ make }) => {
    const f = make(); f.metadata!.snapshotStatus = 'CLOSED' as any;
    const serialized = JSON.stringify(f); calculate(f); calculate(JSON.parse(serialized)); expect(JSON.stringify(f)).toBe(serialized);
  });
  it('a legacy cached result without a qualification cannot certify conformity', () => {
    const result = calculate(cor02Fund());
    const cached = { ...result, compliance: { ...result.compliance, art23c2: { limite: 100000, valoreSoggetto: 0, delta: 100000, isCompliant: true } } };
    expect(presentArt23Verification(cached)).toMatchObject({ status: 'UNDETERMINED', ready: false, isCompliant: false, label: 'NON DETERMINABILE' });
    expect(createDocumentViewModel(cached, 'Ente sintetico', { name: 'Revisore', role: 'GUEST' }).compliance.art23c2.esitoLabel).toBe('NON DETERMINABILE');
  });
  it('historical Dirigenza resources do not depend on current-year presence', () => {
    const f = cor02Scenarios[4].make(); f.historicalData.fondoDirigenza2016 = 50;
    const without = calculate(f); f.annualData.hasDirigenza = true;
    f.fondoDirigenzaData = { st_art57c2a_CCNL2020_unicoImporto2020: 0 };
    const withDirigenza = calculate(f);
    expect(without.compliance.art23c2.limite).toBe(100050);
    expect(withDirigenza.compliance.art23c2.limite).toBe(100050);
    expect(f.historicalData.fondoDirigenza2016).toBe(50);
  });
  it('Art33 recognizes explicit current FTE zero rather than borrowing another count', () => {
    const f = cor02Scenarios[5].make(); f.annualData.manualDipendentiEquivalentiAnnoRif = 0;
    const r = calculate(f);
    expect(r.compliance.art23c2).toMatchObject({ status: 'VALID', comparisonReady: true, limite: 100000 });
    expect(f.annualData.manualDipendentiEquivalentiAnnoRif).toBe(0);
  });
  it('core qualifies reconstruction without changing historical components based on current Dirigenza', () => {
    expect(calculateHistoricalLimit2016Core({}).status).toBe('UNDETERMINED');
    expect(calculateHistoricalLimit2016Core({ certificato: 0 })).toMatchObject({ status: 'VALID', limite2016Base: 0 });
    expect(calculateHistoricalLimit2016Core({ certificato: -1 }).status).toBe('INVALID');
    expect(calculateHistoricalLimit2016Core({ fondoDipendenti: 100, fondoEqPo: 0, fondoDirigenza: 50,
      risorseSegretario: 0, fondoStraordinario: 0 })).toMatchObject({ status: 'VALID', limite2016Base: 150 });
  });
});
