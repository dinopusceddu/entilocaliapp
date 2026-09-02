import { describe, it, expect } from 'vitest';
import { TipologiaEnte } from '../enums';
import { EntityClassification, EntityClassificationType, EntityTerritorialContext } from '../entityClassification';
import { AnnualData } from '../types';
import { AnnualDataSchema, EntityClassificationSchema, EntityClassificationTypeSchema, EntityTerritorialContextSchema } from '../../schemas/fundDataSchemas';
import { Wizard2026EntityType } from '../../logic/wizard2026/types';
import { Art33TerritorialContext } from '../../logic/shared/art33Applicability';

describe('EntityClassification — Domain Model & Schema Compatibility', () => {

  describe('1. Backward Compatibility — Legacy TipologiaEnte', () => {
    it('AnnualData con solo tipologiaEnte (es. TipologiaEnte.COMUNE) e senza entityClassification è valido', () => {
      const legacyData: Partial<AnnualData> = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
        personaleServizioAttuale: [],
        proventiSpecifici: [],
        personale2018PerArt23: [],
        personaleAnnoRifPerArt23: [],
        simulatoreInput: {} as any
      };

      const parsed = AnnualDataSchema.safeParse(legacyData);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.tipologiaEnte).toBe(TipologiaEnte.COMUNE);
        expect(parsed.data.entityClassification).toBeUndefined();
      }
    });

    it('Non effettua alcuna migrazione o trasformazione automatica da TipologiaEnte a entityClassification', () => {
      const rawData = {
        annoRiferimento: 2026,
        tipologiaEnte: TipologiaEnte.COMUNE,
        personaleServizioAttuale: [],
        proventiSpecifici: [],
        personale2018PerArt23: [],
        personaleAnnoRifPerArt23: [],
        simulatoreInput: {}
      };

      const parsed = AnnualDataSchema.parse(rawData);
      expect(parsed.entityClassification).toBeUndefined();
    });
  });

  describe('2. Canonical EntityClassification Schema & Types', () => {
    it('Valida tutti i tipi di ente tramite EntityClassificationTypeSchema', () => {
      const types: EntityClassificationType[] = [
        'REGIONE',
        'CITTA_METROPOLITANA',
        'PROVINCIA',
        'COMUNE',
        'UNIONE_COMUNI',
        'COMUNITA_MONTANA',
        'COMUNITA_ISOLANA_O_ARCIPELAGO',
        'CAMERA_COMMERCIO',
        'ENTE_REGIONALE',
        'ENTE_PARCO',
        'CONSORZIO',
        'ASP',
        'AZIENDA_SPECIALE',
        'ISTITUZIONE',
        'ALTRO_ENTE_STRUMENTALE',
        'ALTRO'
      ];

      for (const t of types) {
        expect(EntityClassificationTypeSchema.safeParse(t).success).toBe(true);
      }
    });

    it('Valida tutti i contesti territoriali tramite EntityTerritorialContextSchema', () => {
      const contexts: EntityTerritorialContext[] = [
        'ORDINARY_REGIME',
        'SICILIAN_AREA_VASTA',
        'OTHER_SPECIAL_AUTONOMY',
        'UNKNOWN'
      ];

      for (const c of contexts) {
        expect(EntityTerritorialContextSchema.safeParse(c).success).toBe(true);
      }
    });

    it('Valida correttamente le combinazioni canoniche tramite EntityClassificationSchema', () => {
      const cases: EntityClassification[] = [
        { entityType: 'COMUNE' },
        { entityType: 'PROVINCIA', territorialContext: 'ORDINARY_REGIME' },
        { entityType: 'CITTA_METROPOLITANA', territorialContext: 'ORDINARY_REGIME' },
        { entityType: 'REGIONE', territorialContext: 'OTHER_SPECIAL_AUTONOMY' },
        { entityType: 'UNIONE_COMUNI' },
        { entityType: 'ALTRO', territorialContext: 'UNKNOWN' },
        { territorialContext: 'SICILIAN_AREA_VASTA' },
        {}
      ];

      for (const c of cases) {
        const parsed = EntityClassificationSchema.safeParse(c);
        expect(parsed.success).toBe(true);
      }
    });

    it('Mantiene territorialContext undefined se non fornito (nessun default implicito)', () => {
      const parsed = EntityClassificationSchema.parse({ entityType: 'COMUNE' });
      expect(parsed.entityType).toBe('COMUNE');
      expect(parsed.territorialContext).toBeUndefined();
    });

    it('Rifiuta tipi di ente o contesti territoriali non ammessi', () => {
      const invalidType = EntityClassificationSchema.safeParse({ entityType: 'INVALID_TYPE' as any });
      expect(invalidType.success).toBe(false);

      const invalidContext = EntityClassificationSchema.safeParse({ territorialContext: 'INVALID_CONTEXT' as any });
      expect(invalidContext.success).toBe(false);
    });
  });

  describe('3. Type Aliases & Module Coherence', () => {
    it('Wizard2026EntityType è pienamente compatibile con EntityClassificationType', () => {
      const wizardType: Wizard2026EntityType = 'COMUNE';
      const domainType: EntityClassificationType = wizardType;
      expect(domainType).toBe('COMUNE');
    });

    it('Art33TerritorialContext è pienamente compatibile con EntityTerritorialContext', () => {
      const resolverContext: Art33TerritorialContext = 'ORDINARY_REGIME';
      const domainContext: EntityTerritorialContext = resolverContext;
      expect(domainContext).toBe('ORDINARY_REGIME');
    });
  });
});
