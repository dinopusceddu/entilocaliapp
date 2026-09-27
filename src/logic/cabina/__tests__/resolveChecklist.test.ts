import { describe, expect, it } from 'vitest';
import type { ComplianceCheck } from '../../../domain';
import { resolveChecklist } from '../resolveChecklist';

function check(overrides: Partial<ComplianceCheck>): ComplianceCheck {
  return {
    id: 'CHECK-1',
    descrizione: 'Verifica strutturata',
    isCompliant: false,
    messaggio: 'Messaggio per l’utente',
    riferimentoNormativo: 'Norma',
    gravita: 'error',
    ...overrides,
  };
}

describe('resolveChecklist', () => {
  it('maps compliance errors and warnings to their operational severities', () => {
    const issues = resolveChecklist({
      complianceChecks: [
        check({ id: 'ERR', gravita: 'error' }),
        check({ id: 'WARN', gravita: 'warning' }),
        check({ id: 'INFO', gravita: 'info' }),
      ],
    });

    expect(issues).toEqual([
      expect.objectContaining({ code: 'ERR', severity: 'BLOCKING' }),
      expect.objectContaining({ code: 'WARN', severity: 'WARNING' }),
    ]);
  });

  it('copies relatedPage exactly without parsing the message', () => {
    const [withTarget, withoutTarget] = resolveChecklist({
      complianceChecks: [
        check({ id: 'WITH', relatedPage: 'custom-exact-target' }),
        check({
          id: 'WITHOUT',
          relatedPage: undefined,
          messaggio: 'Apri compliance o fondoDipendenti per correggere il dato',
        }),
      ],
    });

    expect(withTarget.target).toBe('custom-exact-target');
    expect(withoutTarget).not.toHaveProperty('target');
  });

  it('routes every free-form missing prerequisite to fondoDipendenti', () => {
    expect(resolveChecklist({
      canonicalFund: {
        missingPrerequisites: ['Testo libero senza pagina strutturata'],
        warnings: [],
      },
    })).toContainEqual({
      severity: 'MISSING_PREREQUISITE',
      code: 'Testo libero senza pagina strutturata',
      message: 'Testo libero senza pagina strutturata',
      userMessage: 'Testo libero senza pagina strutturata',
      target: 'fondoDipendenti',
    });
  });

  it('preserves multiple canonical warnings without targets or deduplication', () => {
    const issues = resolveChecklist({
      canonicalFund: {
        missingPrerequisites: [],
        warnings: ['Avviso duplicato', 'Avviso duplicato', 'Apri compliance'],
      },
    });

    expect(issues).toHaveLength(3);
    expect(issues.every(issue => issue.severity === 'WARNING')).toBe(true);
    expect(issues.every(issue => issue.target === undefined)).toBe(true);
  });
});
