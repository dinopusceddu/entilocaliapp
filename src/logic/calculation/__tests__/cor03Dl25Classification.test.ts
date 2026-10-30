import { describe, it, expect } from 'vitest';
import { normalizeInput } from '../../../application/input/inputNormalizer';
import { calculateFundCompletely } from '../fundEngine';
import { deriveCanonicalFundResult } from '../canonicalFundLedger';
import { cor03Fund, cor03Scenarios } from '../../../test/fixtures/cor03Dl25';
import { resolveAnnualDl25 } from '../../shared/dl25CarryForward';
import { resolveDL25IncrementValue } from '../fundCalculations';
import type { NormativeData } from '../../../domain';
const normative = { riferimenti_normativi: {} } as NormativeData;
const calc = (f: ReturnType<typeof cor03Fund>) => calculateFundCompletely(normalizeInput(f), normative);
describe('COR-03 single DL25 resource and classification', () => {
  it.each(cor03Scenarios)('scenario $id: $name', ({ make, status, id }) => {
    const f = make(); const before = JSON.stringify(f); const r = calc(f); const ledger = r.canonicalFund;
    const entries = ledger.entries.filter(e => e.id.startsWith('DL25'));
    expect(entries).toHaveLength(1); const dl25 = entries[0];
    expect(dl25.id).toBe('DL25_CURRENT'); expect(dl25.status).toBe(status);
    expect(dl25.art23Treatment).toBe('EXCLUDED');
    expect(ledger.entries.some(e => e.id === 'DL25_ART23_EXCLUSION')).toBe(false);
    if (status === 'VALID') {
      const x = id === 3 ? 0 : 7000; const deduction = id === 7 ? 200 : 0;
      expect(dl25.amount).toBe(x);
      expect(ledger.verifiedStableTotal).toBe(1000 + x - deduction);
      expect(ledger.verifiedArt23Subject).toBe(1000);
      expect(ledger.verifiedArt23Excluded).toBe(x);
      expect(r.compliance.art23c2.valoreSoggetto).toBe(1000);
      expect(r.fondi.dipendente.summary.totaleFondo).toBe(1000 + x - deduction);
    } else {
      expect(ledger.status).toBe(status);
      expect(ledger.total).toBeNull(); expect(ledger.art23Excluded).toBeNull();
      expect(dl25.amount).toBe(7000); // preserve raw adopted input even when unqualified
      expect(r.compliance.art23c2.isCompliant).toBe(false);
    }
    expect(JSON.stringify(f)).toBe(before);
    expect(calc(JSON.parse(before)).canonicalFund).toEqual(ledger);
  });
  it('canonical zero wins over a nonzero alias and does not revive it', () => {
    const f = cor03Scenarios[2].make(); f.fondoAccessorioDipendenteData.st_incrementoDecretoPA = 9000;
    expect(resolveDL25IncrementValue(f.fondoAccessorioDipendenteData)).toBe(0);
    expect(calc(f).canonicalFund).toMatchObject({ verifiedTotal: 1000, verifiedArt23Subject: 1000, verifiedArt23Excluded: 0 });
  });
  it('aggregates multiple excluded resources once rather than accidentally cancelling an isolated duplication', () => {
    const f = cor03Fund(); f.fondoAccessorioDipendenteData.st_art79c1_art67c2a_incr8320 = 500;
    f.fondoAccessorioDipendenteData.st_art79c1_art67c2b_incrStipendialiDiff = 300;
    expect(calc(f).canonicalFund).toMatchObject({ verifiedTotal: 8800, verifiedArt23Subject: 1000, verifiedArt23Excluded: 7800 });
  });
  it('removes only the obsolete DL25 classification row from controls, preserving Art60 and other control-only entries', () => {
    const r = calc(cor03Scenarios[6].make()); const dl25 = r.canonicalFund.entries.find(e => e.id === 'DL25_CURRENT')!;
    const withLegacyInfo = deriveCanonicalFundResult([...r.canonicalFund.entries,
      { ...dl25, id: 'DL25_ART23_EXCLUSION', economicEffect: false },
      { id: 'OTHER_CONTROL', amount: 50, component: 'VARIABLE', operation: 'ADDITION',
        competenceYear: 2026, source: 'MANUAL', status: 'VALID', art23Treatment: 'EXCLUDED', economicEffect: false }]);
    expect(withLegacyInfo.verifiedArt23Excluded).toBe(7050);
    expect(withLegacyInfo.verifiedArt23Subject).toBe(1000);
    expect(withLegacyInfo.verifiedTotal).toBe(7800);
    expect(withLegacyInfo.entries.find(e => e.id === 'ART60_ART23_FIGURATIVE')).toMatchObject({ amount: 200, economicEffect: false, art23Treatment: 'SUBJECT' });
  });
  it('the stock resolver and ledger accept only the authoritative alias value, including zero', () => {
    const f = cor03Fund(); delete f.fondoAccessorioDipendenteData.st_incrementoDL25_2025;
    f.fondoAccessorioDipendenteData.st_incrementoDecretoPA = 7000;
    delete f.annualData.dl25!.version; delete f.annualData.dl25!.currentYearDelta;
    f.annualData.dl25!.legacyQualification = 'CUMULATIVE_STOCK';
    expect(resolveAnnualDl25(f)).toMatchObject({ state: 'VALID', currentCumulativeApplied: 7000 });
    expect(calc(f).canonicalFund).toMatchObject({ verifiedTotal: 8000, verifiedArt23Excluded: 7000 });
    f.fondoAccessorioDipendenteData.st_incrementoDL25_2025 = 0;
    Object.assign(f.annualData.dl25!, { priorCumulativeApplied: 0, currentYearDelta: 0 });
    expect(resolveAnnualDl25(f).currentCumulativeApplied).toBe(0);
    expect(calc(f).canonicalFund.verifiedTotal).toBe(1000);
  });
  it('a missing constituted amount is not filled from an otherwise valid stock decision', () => {
    const f = cor03Fund(); delete f.fondoAccessorioDipendenteData.st_incrementoDL25_2025;
    expect(calc(f).canonicalFund.entries.find(e => e.id === 'DL25_CURRENT')).toMatchObject({ amount: null, status: 'MISSING' });
    expect(f.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBeUndefined();
  });
  it('neither a maximum nor an unexercised decision automatically creates a resource', () => {
    const f = cor03Scenarios[2].make(); delete f.fondoAccessorioDipendenteData.st_incrementoDL25_2025;
    expect(calc(f).canonicalFund.entries.some(e => e.id === 'DL25_CURRENT')).toBe(false);
    delete f.annualData.dl25; f.annualData.simulatoreRisultati = { fase5_incrementoNettoEffettivoFondo: 30000 } as any;
    expect(calc(f).canonicalFund.verifiedTotal).toBe(1000);
    expect(f.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBeUndefined();
  });
  it('explicit manual zero without stock remains present and does not require inventing a stock', () => {
    const f = cor03Scenarios[2].make(); delete f.annualData.dl25;
    expect(calc(f).canonicalFund.entries.find(e => e.id === 'DL25_CURRENT')).toMatchObject({ amount: 0, status: 'VALID' });
  });
  it.each(['UNDETERMINED', 'INVALID'] as const)('a positive maximum cannot override financial state %s', state => {
    const f = cor03Fund(); f.annualData.simulatoreRisultati = { state, fase5_incrementoNettoEffettivoFondo: 30000 } as any;
    expect(calc(f).canonicalFund.entries.find(e => e.id === 'DL25_CURRENT')?.status).toBe(state);
  });
  it('financial room applies to the annual delta, not to the cumulative stock', () => {
    const f = cor03Fund(); f.annualData.simulatoreRisultati = { state: 'VALID', fase5_incrementoNettoEffettivoFondo: 3000 } as any;
    expect(calc(f).canonicalFund.verifiedTotal).toBe(8000);
    f.annualData.simulatoreRisultati!.fase5_incrementoNettoEffettivoFondo = 2500;
    expect(calc(f).canonicalFund.status).toBe('INVALID');
  });
  it.each(['UNIONE_COMUNI', 'ENTE_PARCO', undefined] as const)('existing direct scope rules are preserved for %s; no EQ allocation or transfer is invented', entityType => {
    const f = cor03Fund(); f.annualData.entityClassification = { entityType }; f.annualData.tipologiaEnte = undefined;
    const entry = calc(f).canonicalFund.entries.find(e => e.id === 'DL25_CURRENT')!;
    expect(entry.status).toBe(entityType === 'ENTE_PARCO' ? 'INVALID' : 'UNDETERMINED');
    expect(f.fondoElevateQualificazioniData).toEqual({});
    if (entityType === 'UNIONE_COMUNI') expect(calc(f).canonicalFund.missingPrerequisites).toContain('DL25_TRANSFER_REQUIRES_LEGAL_REVIEW');
  });
  it.each(cor03Scenarios)('CLOSED preserves the persisted JSON for scenario $id', ({ make }) => {
    const f = make(); f.metadata!.snapshotStatus = 'CLOSED' as any;
    const before = JSON.stringify(f); calc(f); calc(JSON.parse(before)); expect(JSON.stringify(f)).toBe(before);
  });

});
