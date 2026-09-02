import { describe, it, expect } from 'vitest';
import { resolveArt33Applicability } from '../art33Applicability';
import { Wizard2026EntityType } from '../../wizard2026/types';

describe('resolveArt33Applicability — Ambito soggettivo e temporale Art. 33 D.L. 34/2019', () => {

  describe('1. Comuni (Art. 33, comma 2)', () => {
    it('1. COMUNE senza data: direttamente applicabile ex art. 33 c. 2 con decorrenza 2020-04-20', () => {
      const res = resolveArt33Applicability('COMUNE');
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_2');
      expect(res.effectiveFrom).toBe('2020-04-20');
      expect(res.reason).toContain('Applicazione diretta');
    });

    it('2. COMUNE con data 2020-04-19 (precedente alla decorrenza): non direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNE', '2020-04-19');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_2');
      expect(res.effectiveFrom).toBe('2020-04-20');
      expect(res.reason).toContain('non ancora efficace');
    });

    it('3. COMUNE con data 2020-04-20 (data esatta decorrenza): direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNE', '2020-04-20');
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_2');
      expect(res.effectiveFrom).toBe('2020-04-20');
    });

    it('COMUNE con data successiva (es. 2026-01-01): direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNE', '2026-01-01');
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_2');
    });
  });

  describe('2. Province e Città Metropolitane (Art. 33, comma 1-bis)', () => {
    it('4. PROVINCIA con data 2021-12-31 (precedente decorrenza): non direttamente applicabile', () => {
      const res = resolveArt33Applicability('PROVINCIA', '2021-12-31');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.effectiveFrom).toBe('2022-01-01');
      expect(res.reason).toContain('non ancora efficace');
    });

    it('5. PROVINCIA con data 2022-01-01 (data esatta decorrenza): direttamente applicabile', () => {
      const res = resolveArt33Applicability('PROVINCIA', '2022-01-01');
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.effectiveFrom).toBe('2022-01-01');
    });

    it('PROVINCIA senza data: direttamente applicabile con decorrenza 2022-01-01', () => {
      const res = resolveArt33Applicability('PROVINCIA');
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.effectiveFrom).toBe('2022-01-01');
    });

    it('CITTA_METROPOLITANA con data 2021-12-31: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('CITTA_METROPOLITANA', '2021-12-31');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
    });

    it('6. CITTA_METROPOLITANA con data 2022-01-01: direttamente applicabile', () => {
      const res = resolveArt33Applicability('CITTA_METROPOLITANA', '2022-01-01');
      expect(res.status).toBe('DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBe('ART33_COMMA_1_BIS');
      expect(res.effectiveFrom).toBe('2022-01-01');
    });
  });

  describe('3. Unioni di Comuni e Comunità Montane / Isolane', () => {
    it('7. UNIONE_COMUNI: non direttamente applicabile (Corte dei conti Sez. Autonomie 4/2021)', () => {
      const res = resolveArt33Applicability('UNIONE_COMUNI');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.legalBasis).toBeUndefined();
      expect(res.reason).toContain('4/SEZAUT/2021/QMIG');
    });

    it('8. COMUNITA_MONTANA: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNITA_MONTANA');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.reason).toContain('non ricompreso');
    });

    it('9. COMUNITA_ISOLANA_O_ARCIPELAGO: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('COMUNITA_ISOLANA_O_ARCIPELAGO');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
      expect(res.reason).toContain('non ricompreso');
    });
  });

  describe('4. Enti strumentali e altri enti', () => {
    it('10. CAMERA_COMMERCIO: non direttamente applicabile', () => {
      const res = resolveArt33Applicability('CAMERA_COMMERCIO');
      expect(res.status).toBe('NOT_DIRECTLY_APPLICABLE');
    });

    it('11. ASP: non direttamente applicabile', () => {
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

  describe('5. Regioni, Altro e casi non specificati (Verifica Manuale)', () => {
    it('12. REGIONE: richiede verifica manuale dello statuto ordinario vs speciale', () => {
      const res = resolveArt33Applicability('REGIONE');
      expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.legalBasis).toBe('ART33_COMMA_1');
      expect(res.effectiveFrom).toBe('2020-01-01');
      expect(res.reason).toContain('statuto ordinario');
    });

    it('13. ALTRO: richiede verifica manuale', () => {
      const res = resolveArt33Applicability('ALTRO');
      expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.reason).toContain('verifica manuale');
    });

    it('14. undefined: richiede verifica manuale', () => {
      const res = resolveArt33Applicability(undefined);
      expect(res.status).toBe('NEEDS_MANUAL_REVIEW');
      expect(res.reason).toContain('non specificata');
    });
  });
});
