import { describe, it, expect } from 'vitest';
import {
  resolveArt33ApplicationAction,
  mapLegacyTipologiaEnteToArt33EntityType,
  resolveArt33ApplicationPolicy,
  resolveArt33AnnualDataPolicy,
} from '../art33ApplicationPolicy';
import { TipologiaEnte } from '../../../domain/enums';
import type { AnnualData } from '../../../domain/types';

describe('art33ApplicationPolicy — Policy Pura e Risolutore Contestuale per Art. 33 D.L. 34/2019', () => {
  describe('1. Matrice Pura: resolveArt33ApplicationAction', () => {
    it('DIRECTLY_APPLICABLE restituisce sempre APPLY indipendentemente da manualDecision', () => {
      expect(resolveArt33ApplicationAction('DIRECTLY_APPLICABLE', undefined)).toBe('APPLY');
      expect(resolveArt33ApplicationAction('DIRECTLY_APPLICABLE', 'APPLY')).toBe('APPLY');
      expect(resolveArt33ApplicationAction('DIRECTLY_APPLICABLE', 'DO_NOT_APPLY')).toBe('APPLY');
    });

    it('NOT_DIRECTLY_APPLICABLE restituisce sempre SKIP indipendentemente da manualDecision', () => {
      expect(resolveArt33ApplicationAction('NOT_DIRECTLY_APPLICABLE', undefined)).toBe('SKIP');
      expect(resolveArt33ApplicationAction('NOT_DIRECTLY_APPLICABLE', 'APPLY')).toBe('SKIP');
      expect(resolveArt33ApplicationAction('NOT_DIRECTLY_APPLICABLE', 'DO_NOT_APPLY')).toBe('SKIP');
    });

    it('NEEDS_MANUAL_REVIEW gestisce la decisione manuale ed effettua BLOCK in assenza di decisione', () => {
      expect(resolveArt33ApplicationAction('NEEDS_MANUAL_REVIEW', undefined)).toBe('BLOCK');
      expect(resolveArt33ApplicationAction('NEEDS_MANUAL_REVIEW', 'APPLY')).toBe('APPLY');
      expect(resolveArt33ApplicationAction('NEEDS_MANUAL_REVIEW', 'DO_NOT_APPLY')).toBe('SKIP');
    });
  });

  describe('2. Legacy TipologiaEnte Mapping: mapLegacyTipologiaEnteToArt33EntityType', () => {
    it('Mappa ciascun valore della vecchia TipologiaEnte al corrispondente EntityClassificationType', () => {
      expect(mapLegacyTipologiaEnteToArt33EntityType(TipologiaEnte.COMUNE)).toBe('COMUNE');
      expect(mapLegacyTipologiaEnteToArt33EntityType(TipologiaEnte.PROVINCIA)).toBe('PROVINCIA');
      expect(mapLegacyTipologiaEnteToArt33EntityType(TipologiaEnte.UNIONE_COMUNI)).toBe('UNIONE_COMUNI');
      expect(mapLegacyTipologiaEnteToArt33EntityType(TipologiaEnte.COMUNITA_MONTANA)).toBe('COMUNITA_MONTANA');
      expect(mapLegacyTipologiaEnteToArt33EntityType(TipologiaEnte.ALTRO)).toBe('ALTRO');
      expect(mapLegacyTipologiaEnteToArt33EntityType(undefined)).toBeUndefined();
    });
  });

  describe('3. Risolutore Contestuale: resolveArt33ApplicationPolicy', () => {
    it('COMUNE 2026 -> DIRECTLY_APPLICABLE -> APPLY', () => {
      const res = resolveArt33ApplicationPolicy({
        entityType: 'COMUNE',
        referenceYear: 2026,
      });
      expect(res.applicability.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.action).toBe('APPLY');
      expect(res.reason).toContain('regime di applicazione diretta');
    });

    it('COMUNE 2019 (pre-vigore D.L. 34/2019) -> NOT_DIRECTLY_APPLICABLE -> SKIP', () => {
      const res = resolveArt33ApplicationPolicy({
        entityType: 'COMUNE',
        referenceYear: 2019,
      });
      expect(res.applicability.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.action).toBe('SKIP');
    });

    it('UNIONE_COMUNI 2026 -> NOT_DIRECTLY_APPLICABLE -> SKIP', () => {
      const res = resolveArt33ApplicationPolicy({
        entityType: 'UNIONE_COMUNI',
        referenceYear: 2026,
      });
      expect(res.applicability.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.action).toBe('SKIP');
    });

    it('PROVINCIA con regime ordinario -> DIRECTLY_APPLICABLE -> APPLY', () => {
      const res = resolveArt33ApplicationPolicy({
        entityType: 'PROVINCIA',
        territorialContext: 'ORDINARY_REGIME',
        referenceYear: 2026,
      });
      expect(res.applicability.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.action).toBe('APPLY');
    });

    it('PROVINCIA in Sicilia (area vasta) -> NOT_DIRECTLY_APPLICABLE -> SKIP', () => {
      const res = resolveArt33ApplicationPolicy({
        entityType: 'PROVINCIA',
        territorialContext: 'SICILIAN_AREA_VASTA',
        referenceYear: 2026,
      });
      expect(res.applicability.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.action).toBe('SKIP');
    });

    it('PROVINCIA senza territorialContext -> NEEDS_MANUAL_REVIEW -> BLOCK se non decisa', () => {
      const res = resolveArt33ApplicationPolicy({
        entityType: 'PROVINCIA',
        territorialContext: undefined,
        referenceYear: 2026,
      });
      expect(res.applicability.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.action).toBe('BLOCK');
      expect(res.reason).toContain('richiede una verifica manuale');
    });

    it('PROVINCIA senza territorialContext -> NEEDS_MANUAL_REVIEW -> APPLY se deciso APPLY', () => {
      const res = resolveArt33ApplicationPolicy({
        entityType: 'PROVINCIA',
        territorialContext: undefined,
        referenceYear: 2026,
        manualDecision: 'APPLY',
      });
      expect(res.applicability.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.action).toBe('APPLY');
    });

    it('PROVINCIA senza territorialContext -> NEEDS_MANUAL_REVIEW -> SKIP se deciso DO_NOT_APPLY', () => {
      const res = resolveArt33ApplicationPolicy({
        entityType: 'PROVINCIA',
        territorialContext: undefined,
        referenceYear: 2026,
        manualDecision: 'DO_NOT_APPLY',
      });
      expect(res.applicability.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.action).toBe('SKIP');
    });

    it('ALTRO -> NEEDS_MANUAL_REVIEW -> BLOCK / APPLY / SKIP', () => {
      const blockRes = resolveArt33ApplicationPolicy({ entityType: 'ALTRO', referenceYear: 2026 });
      expect(blockRes.action).toBe('BLOCK');

      const applyRes = resolveArt33ApplicationPolicy({ entityType: 'ALTRO', referenceYear: 2026, manualDecision: 'APPLY' });
      expect(applyRes.action).toBe('APPLY');

      const skipRes = resolveArt33ApplicationPolicy({ entityType: 'ALTRO', referenceYear: 2026, manualDecision: 'DO_NOT_APPLY' });
      expect(skipRes.action).toBe('SKIP');
    });
  });

  describe('4. Risoluzione AnnualData: resolveArt33AnnualDataPolicy', () => {
    it('Precedenza CANONICAL su LEGACY discordante (legacy PROVINCIA, canonical COMUNE -> COMUNE)', () => {
      const annualData: Partial<AnnualData> = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.PROVINCIA,
        entityClassification: {
          entityType: 'COMUNE',
        },
      };

      const res = resolveArt33AnnualDataPolicy(annualData);
      expect(res.classificationSource).toBe('CANONICAL');
      expect(res.effectiveEntityType).toBe('COMUNE');
      expect(res.action).toBe('APPLY');
    });

    it('Legacy fallback quando manca entityClassification (legacy COMUNE -> COMUNE -> APPLY)', () => {
      const annualData: Partial<AnnualData> = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
      };

      const res = resolveArt33AnnualDataPolicy(annualData);
      expect(res.classificationSource).toBe('LEGACY_FALLBACK');
      expect(res.effectiveEntityType).toBe('COMUNE');
      expect(res.action).toBe('APPLY');
    });

    it('Legacy fallback con PROVINCIA senza territorialContext (NON deduce regime ordinario -> NEEDS_MANUAL_REVIEW -> BLOCK)', () => {
      const annualData: Partial<AnnualData> = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.PROVINCIA,
      };

      const res = resolveArt33AnnualDataPolicy(annualData);
      expect(res.classificationSource).toBe('LEGACY_FALLBACK');
      expect(res.effectiveEntityType).toBe('PROVINCIA');
      expect(res.territorialContext).toBeUndefined();
      expect(res.applicability.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.action).toBe('BLOCK');
    });

    it('Legacy fallback con PROVINCIA e decisione manuale APPLY -> APPLY', () => {
      const annualData: Partial<AnnualData> = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.PROVINCIA,
        art33ManualDecision: 'APPLY',
      };

      const res = resolveArt33AnnualDataPolicy(annualData);
      expect(res.action).toBe('APPLY');
    });

    it('Dati vuoti -> MISSING -> NEEDS_MANUAL_REVIEW -> BLOCK', () => {
      const res = resolveArt33AnnualDataPolicy({});
      expect(res.classificationSource).toBe('MISSING');
      expect(res.effectiveEntityType).toBeUndefined();
      expect(res.action).toBe('BLOCK');
    });
  });
});
