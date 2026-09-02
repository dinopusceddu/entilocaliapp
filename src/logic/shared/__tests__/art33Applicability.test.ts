import { describe, it, expect } from 'vitest';
import { resolveArt33Applicability } from '../art33Applicability';
import { Wizard2026EntityType } from '../../wizard2026/types';

describe('resolveArt33Applicability — Ambito soggettivo, temporale e territoriale Art. 33 D.L. 34/2019', () => {

  describe('1. Comuni (Art. 33, comma 2)', () => {
    it('1. COMUNE senza opzioni: direttamente applicabile ex art. 33 c. 2 con decorrenza 2020-04-20', () => {
      const res = resolveArt33Applicability('COMUNE');
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_2');
      expect(res.effectiveFrom).toBe('2020-04-20');
      expect(res.reason).toContain('Applicazione diretta');
    });

    it('2. COMUNE con data 2020-04-19 (precedente alla decorrenza): non direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNE', { referenceDate: '2020-04-19' });
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_2');
      expect(res.effectiveFrom).toBe('2020-04-20');
      expect(res.reason).toContain('non ancora efficace');
    });

    it('3. COMUNE con data 2020-04-20 (data esatta decorrenza): direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNE', { referenceDate: '2020-04-20' });
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_2');
      expect(res.effectiveFrom).toBe('2020-04-20');
    });

    it('COMUNE con data successiva (es. 2026-01-01): direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNE', { referenceDate: '2026-01-01' });
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_2');
    });
  });

  describe('2. Province e Città Metropolitane (Art. 33, comma 1-bis e D.M. 11/01/2022)', () => {
    it('PROVINCIA con ORDINARY_REGIME senza data: direttamente applicabile dal 2022-01-01', () => {
      const res = resolveArt33Applicability('PROVINCIA', { territorialContext: 'ORDINARY_REGIME' });
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.effectiveFrom).toBe('2022-01-01');
    });

    it('PROVINCIA con ORDINARY_REGIME e data 2021-12-31: non direttamente applicabile (precedente decorrenza)', () => {
      const res = resolveArt33Applicability('PROVINCIA', {
        territorialContext: 'ORDINARY_REGIME',
        referenceDate: '2021-12-31'
      });
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.effectiveFrom).toBe('2022-01-01');
      expect(res.reason).toContain('non ancora efficace');
    });

    it('PROVINCIA con ORDINARY_REGIME e data 2022-01-01: direttamente applicabile', () => {
      const res = resolveArt33Applicability('PROVINCIA', {
        territorialContext: 'ORDINARY_REGIME',
        referenceDate: '2022-01-01'
      });
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
    });

    it('PROVINCIA con nessun context (undefined / UNKNOWN): richiede verifica manuale', () => {
      const resUndefined = resolveArt33Applicability('PROVINCIA');
      expect(resUndefined.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(resUndefined.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(resUndefined.reason).toContain('Regime territoriale non specificato');

      const resUnknown = resolveArt33Applicability('PROVINCIA', { territorialContext: 'UNKNOWN' });
      expect(resUnknown.status).toBe('NEEDS_MANUAL_REVIEW');
    });

    it('PROVINCIA con SICILIAN_AREA_VASTA: non direttamente applicabile (D.M. 11/01/2022)', () => {
      const res = resolveArt33Applicability('PROVINCIA', { territorialContext: 'SICILIAN_AREA_VASTA' });
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.reason).toContain('Regione Siciliana');
    });

    it('PROVINCIA con OTHER_SPECIAL_AUTONOMY: richiede verifica manuale', () => {
      const res = resolveArt33Applicability('PROVINCIA', { territorialContext: 'OTHER_SPECIAL_AUTONOMY' });
      expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.reason).toContain('autonomia speciale');
    });

    it('CITTA_METROPOLITANA con ORDINARY_REGIME: direttamente applicabile dal 2022-01-01', () => {
      const res = resolveArt33Applicability('CITTA_METROPOLITANA', {
        territorialContext: 'ORDINARY_REGIME',
        referenceDate: '2022-01-01'
      });
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.effectiveFrom).toBe('2022-01-01');
    });

    it('CITTA_METROPOLITANA con ORDINARY_REGIME e data 2021-12-31: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('CITTA_METROPOLITANA', {
        territorialContext: 'ORDINARY_REGIME',
        referenceDate: '2021-12-31'
      });
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
    });

    it('CITTA_METROPOLITANA con SICILIAN_AREA_VASTA: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('CITTA_METROPOLITANA', { territorialContext: 'SICILIAN_AREA_VASTA' });
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.reason).toContain('Regione Siciliana');
    });

    it('CITTA_METROPOLITANA con OTHER_SPECIAL_AUTONOMY: richiede verifica manuale', () => {
      const res = resolveArt33Applicability('CITTA_METROPOLITANA', { territorialContext: 'OTHER_SPECIAL_AUTONOMY' });
      expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
    });

    it('CITTA_METROPOLITANA senza context specificato: richiede verifica manuale', () => {
      const res = resolveArt33Applicability('CITTA_METROPOLITANA');
      expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
    });
  });

  describe('3. Regioni (Art. 33, comma 1)', () => {
    it('REGIONE con ORDINARY_REGIME: direttamente applicabile ex art. 33 c. 1 dal 2020-01-01', () => {
      const res = resolveArt33Applicability('REGIONE', { territorialContext: 'ORDINARY_REGIME' });
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1');
      expect(res.effectiveFrom).toBe('2020-01-01');
    });

    it('REGIONE con ORDINARY_REGIME e data 2019-12-31: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('REGIONE', {
        territorialContext: 'ORDINARY_REGIME',
        referenceDate: '2019-12-31'
      });
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1');
    });

    it('REGIONE con OTHER_SPECIAL_AUTONOMY: non direttamente applicabile ex art. 33 c. 1', () => {
      const res = resolveArt33Applicability('REGIONE', { territorialContext: 'OTHER_SPECIAL_AUTONOMY' });
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1');
      expect(res.reason).toContain('statuto speciale');
    });

    it('REGIONE senza context specificato (o UNKNOWN): richiede verifica manuale', () => {
      const res = resolveArt33Applicability('REGIONE');
      expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.legalBasis).toBe('ART33_COMMA_1');
      expect(res.reason).toContain('statuto ordinario');
    });
  });

  describe('4. Unioni di Comuni e Comunità Montane / Isolane', () => {
    it('UNIONE_COMUNI: non direttamente applicabile (Corte dei conti Sez. Autonomie 4/2021)', () => {
      const res = resolveArt33Applicability('UNIONE_COMUNI');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBeUndefined();
      expect(res.reason).toContain('4/SEZAUT/2021/QMIG');
    });

    it('COMUNITA_MONTANA: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNITA_MONTANA');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.reason).toContain('non ricompreso');
    });

    it('COMUNITA_ISOLANA_O_ARCIPELAGO: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNITA_ISOLANA_O_ARCIPELAGO');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.reason).toContain('non ricompreso');
    });
  });

  describe('5. Enti strumentali e altri enti', () => {
    it('CAMERA_COMMERCIO: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('CAMERA_COMMERCIO');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
    });

    it('ASP: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('ASP');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
    });

    const altriEntiNonApplicabili: Wizard2026EntityType[] = [
      'ENTE_REGIONALE',
      'ENTE_PARCO',
      'CONSORZIO',
      'AZIENDA_SPECIALE',
      'ISTITUZIONE',
      'ALTRO_ENTE_STRUMENTALE'
    ];

    altriEntiNonApplicabili.forEach((tipo) => {
      it(`${tipo}: non direttamente applicabile`, () => {
        const res = resolveArt33Applicability(tipo);
        expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
        expect(res.reason).toContain('Ente non compreso');
      });
    });
  });

  describe('6. Validazione rigorosa della data ISO e gestione errori', () => {
    const invalidDates = [
      '',
      '2020-4-01',
      '2020-04-1',
      'not-a-date',
      '2020-02-30',
      '2021-02-29',
      '2020-13-01',
      '2020-00-10'
    ];

    invalidDates.forEach((invalidDate) => {
      it(`rifiuta data non valida "${invalidDate}" restituendo NEEDS_MANUAL_REVIEW`, () => {
        const res = resolveArt33Applicability('COMUNE', { referenceDate: invalidDate });
        expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
        expect(res.reason).toContain('Data di riferimento non valida');
      });
    });

    it('accetta data bisestile valida 2020-02-29 (valutandola correttamente prima della decorrenza 2020-04-20 per Comune)', () => {
      const res = resolveArt33Applicability('COMUNE', { referenceDate: '2020-02-29' });
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.reason).toContain('non ancora efficace');
    });
  });

  describe('7. Altro e casi non specificati (Verifica Manuale)', () => {
    it('ALTRO: richiede verifica manuale', () => {
      const res = resolveArt33Applicability('ALTRO');
      expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.reason).toContain('verifica manuale');
    });

    it('undefined: richiede verifica manuale', () => {
      const res = resolveArt33Applicability(undefined);
      expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.reason).toContain('non specificata');
    });
  });
});
