import { describe, expect, it } from 'vitest';
import type {
  CalculationResult,
  CanonicalFundResult,
  ComplianceCheck,
  DistribuzioneRisorseData,
} from '../../../domain';
import { AnnualSnapshotStatus } from '../../../domain';
import { resolveCabinaViewModel } from '../resolveCabinaViewModel';

function calculation(overrides: Partial<CanonicalFundResult>): Pick<CalculationResult, 'canonicalFund'> {
  return {
    canonicalFund: {
      status: 'VALID',
      stableTotal: 100,
      variableTotal: 0,
      total: 100,
      verifiedStableTotal: 100,
      verifiedVariableTotal: 0,
      verifiedTotal: 100,
      art23Subject: 100,
      art23Excluded: 0,
      verifiedArt23Subject: 100,
      verifiedArt23Excluded: 0,
      entries: [],
      warnings: [],
      missingPrerequisites: [],
      ...overrides,
    },
  };
}

const warningCheck: ComplianceCheck = {
  id: 'WARN-1',
  descrizione: 'Avviso compliance',
  isCompliant: false,
  messaggio: 'Verificare il dato',
  riferimentoNormativo: 'Norma',
  gravita: 'warning',
};

const distributionWork = {
  p_performanceIndividuale: { stanziate: 100 },
} as DistribuzioneRisorseData;

describe('resolveCabinaViewModel', () => {
  it('G4: missing calculation is NOT_STARTED and hides the definitive total', () => {
    const result = resolveCabinaViewModel({});

    expect(result.status).toBe('NOT_STARTED');
    expect(result.constitution).toEqual({
      canonicalStatus: 'NOT_STARTED',
      total: null,
      verifiedSubtotal: 0,
      showDefinitiveTotal: false,
    });
  });

  it('G5/G8d: UNDETERMINED exposes the verified subtotal and routes prerequisites', () => {
    const result = resolveCabinaViewModel({
      calculationResult: calculation({
        status: 'UNDETERMINED',
        total: 999,
        verifiedTotal: 250,
        missingPrerequisites: ['Prerequisito libero'],
      }),
    });

    expect(result.status).toBe('TO_COMPLETE');
    expect(result.constitution).toEqual({
      canonicalStatus: 'UNDETERMINED',
      total: null,
      verifiedSubtotal: 250,
      showDefinitiveTotal: false,
    });
    expect(result.issues).toContainEqual(expect.objectContaining({
      severity: 'MISSING_PREREQUISITE',
      target: 'fondoDipendenti',
    }));
  });

  it('G6: INVALID is BLOCKED even without displayable compliance errors', () => {
    const result = resolveCabinaViewModel({
      calculationResult: calculation({ status: 'INVALID', total: 500, verifiedTotal: 300 }),
      complianceChecks: [],
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.primaryAction).toEqual({ label: 'Apri le verifiche', target: 'compliance' });
    expect(result.constitution).toEqual(expect.objectContaining({
      total: null,
      verifiedSubtotal: 300,
      showDefinitiveTotal: false,
    }));
  });

  it('G7: VALID without distribution work exposes the canonical definitive total', () => {
    const result = resolveCabinaViewModel({
      calculationResult: calculation({ total: 420, verifiedTotal: 420 }),
    });

    expect(result.status).toBe('CONSTITUTION_VERIFIED');
    expect(result.constitution).toEqual({
      canonicalStatus: 'VALID',
      total: 420,
      verifiedSubtotal: 420,
      showDefinitiveTotal: true,
    });
  });

  it('G8: warnings do not degrade a VALID operational status', () => {
    const result = resolveCabinaViewModel({
      calculationResult: calculation({ warnings: ['Avviso canonico 1', 'Avviso canonico 2'] }),
      complianceChecks: [warningCheck],
    });

    expect(result.status).toBe('CONSTITUTION_VERIFIED');
    expect(result.issues).toHaveLength(3);
    expect(result.issues.every(issue => issue.severity === 'WARNING')).toBe(true);
  });

  it('G8e: 100% Wizard progress is accessory and cannot override UNDETERMINED', () => {
    const result = resolveCabinaViewModel({
      calculationResult: calculation({ status: 'UNDETERMINED' }),
      wizardProgressAccessory: { completed: 8, total: 8, hasData: true },
    });

    expect(result.status).toBe('TO_COMPLETE');
    expect(result.wizardProgressAccessory).toEqual({ completed: 8, total: 8, hasData: true });
  });

  it('derives distribution work only from positive structured financial details', () => {
    const result = resolveCabinaViewModel({
      calculationResult: calculation({}),
      distribuzioneRisorseData: distributionWork,
    });

    expect(result.status).toBe('DISTRIBUTION_IN_PROGRESS');
    expect(result.distribution).toEqual({ status: 'IN_PROGRESS', hasExistingWork: true });
  });

  it('G9: keeps TO_COMPLETE primary action and exposes resume distribution as secondary', () => {
    const result = resolveCabinaViewModel({
      calculationResult: calculation({ status: 'UNDETERMINED', verifiedTotal: 250 }),
      distribuzioneRisorseData: distributionWork,
    });

    expect(result.status).toBe('TO_COMPLETE');
    expect(result.constitution.canonicalStatus).toBe('UNDETERMINED');
    expect(result.primaryAction).toEqual({
      label: 'Vai alla Costituzione',
      target: 'fondoDipendenti',
    });
    expect(result.secondaryActions).toEqual([{
      label: 'Riprendi la Distribuzione',
      target: 'distribuzioneRisorse',
    }]);
  });

  it('G9: does not expose a secondary action without existing distribution work', () => {
    const result = resolveCabinaViewModel({
      calculationResult: calculation({ status: 'UNDETERMINED' }),
    });

    expect(result.status).toBe('TO_COMPLETE');
    expect(result.secondaryActions).toEqual([]);
  });

  it('G9: CLOSED suppresses primary and secondary actions despite existing distribution work', () => {
    const result = resolveCabinaViewModel({
      snapshotStatus: AnnualSnapshotStatus.CLOSED,
      calculationResult: calculation({ status: 'UNDETERMINED' }),
      distribuzioneRisorseData: distributionWork,
    });

    expect(result.status).toBe('CLOSED');
    expect(result.primaryAction).toBeNull();
    expect(result.secondaryActions).toEqual([]);
  });

  it('G9: DISTRIBUTION_IN_PROGRESS uses only the primary resume action', () => {
    const result = resolveCabinaViewModel({
      calculationResult: calculation({ status: 'VALID' }),
      distribuzioneRisorseData: distributionWork,
    });

    expect(result.status).toBe('DISTRIBUTION_IN_PROGRESS');
    expect(result.primaryAction).toEqual({
      label: 'Riprendi la Distribuzione',
      target: 'distribuzioneRisorse',
    });
    expect(result.secondaryActions).toEqual([]);
  });

  it('G9: returns independent secondary action objects for each call', () => {
    const input = {
      calculationResult: calculation({ status: 'UNDETERMINED' as const }),
      distribuzioneRisorseData: distributionWork,
    };
    const first = resolveCabinaViewModel(input);

    first.secondaryActions[0].label = 'Etichetta corrotta';
    first.secondaryActions[0].target = 'target-corrotto';

    const second = resolveCabinaViewModel(input);
    expect(second.secondaryActions).toEqual([{
      label: 'Riprendi la Distribuzione',
      target: 'distribuzioneRisorse',
    }]);
    expect(second.secondaryActions[0]).not.toBe(first.secondaryActions[0]);
  });

  it('gives CLOSED precedence', () => {
    const result = resolveCabinaViewModel({
      snapshotStatus: AnnualSnapshotStatus.CLOSED,
      calculationResult: calculation({ status: 'INVALID' }),
      distribuzioneRisorseData: distributionWork,
    });

    expect(result.status).toBe('CLOSED');
    expect(result.primaryAction).toBeNull();
  });

  it.each([
    ['NOT_STARTED', {}, { label: 'Inizia raccolta dati', target: 'wizard2026Preview' }],
    ['TO_COMPLETE', { calculationResult: calculation({ status: 'UNDETERMINED' }) }, { label: 'Vai alla Costituzione', target: 'fondoDipendenti' }],
    ['BLOCKED', { calculationResult: calculation({ status: 'INVALID' }) }, { label: 'Apri le verifiche', target: 'compliance' }],
    ['CONSTITUTION_VERIFIED', { calculationResult: calculation({}) }, { label: 'Inizia la Distribuzione', target: 'distribuzioneRisorse' }],
    ['DISTRIBUTION_IN_PROGRESS', { calculationResult: calculation({}), distribuzioneRisorseData: distributionWork }, { label: 'Riprendi la Distribuzione', target: 'distribuzioneRisorse' }],
  ] as const)('%s exposes the approved primary action', (_status, input, expected) => {
    expect(resolveCabinaViewModel(input).primaryAction).toEqual(expected);
  });

  it('F-02: returns an independent primary action object for each call', () => {
    const input = { calculationResult: calculation({}) };
    const first = resolveCabinaViewModel(input);

    expect(first.primaryAction).toEqual({
      label: 'Inizia la Distribuzione',
      target: 'distribuzioneRisorse',
    });
    if (!first.primaryAction) {
      throw new Error('Expected a primary action for CONSTITUTION_VERIFIED');
    }

    first.primaryAction.label = 'Etichetta corrotta';
    first.primaryAction.target = 'target-corrotto';

    const second = resolveCabinaViewModel(input);

    expect(second.primaryAction).toEqual({
      label: 'Inizia la Distribuzione',
      target: 'distribuzioneRisorse',
    });
    expect(second.primaryAction).not.toBe(first.primaryAction);
  });

  it('copies Wave 3 document projection fields without recalculating readiness', () => {
    const result = resolveCabinaViewModel({
      documentProjection: {
        exportReadiness: 'DOCUMENT_FINAL_READY',
        hasRevisoriParere: true,
        hasDeliberaGC: true,
      },
    });

    expect(result.documents).toEqual({
      exportReadiness: 'DOCUMENT_FINAL_READY',
      hasRevisoriParere: true,
      hasDeliberaGC: true,
    });
  });
});
