import { describe, it, expect } from 'vitest';
import { calculateArt23Fte, Art23FteEntry } from '../art23Fte';

describe('calculateArt23Fte — Contratto Canonico Calcolo FTE Art. 23', () => {
  describe('Modalità REFERENCE_2018', () => {
    it('1. undefined list -> totalFte = 0, no issues', () => {
      const result = calculateArt23Fte(undefined, 'REFERENCE_2018');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([]);
    });

    it('2. empty list -> totalFte = 0, no issues', () => {
      const result = calculateArt23Fte([], 'REFERENCE_2018');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([]);
    });

    it('3. PT undefined -> default retrocompatibile 100% (1 FTE)', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1' }];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(1);
      expect(result.issues).toEqual([]);
    });

    it('4. PT 100 -> 1 FTE', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100 }];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(1);
      expect(result.issues).toEqual([]);
    });

    it('5. PT 50 -> 0.5 FTE', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 50 }];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(0.5);
      expect(result.issues).toEqual([]);
    });

    it('6. PT 25 -> 0.25 FTE', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 25 }];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(0.25);
      expect(result.issues).toEqual([]);
    });

    it('7. PT 0 -> issue INVALID_PART_TIME + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 0 }];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_PART_TIME', index: 0, id: 'emp1', value: 0 }
      ]);
    });

    it('8. PT -1 -> issue INVALID_PART_TIME + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: -1 }];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_PART_TIME', index: 0, id: 'emp1', value: -1 }
      ]);
    });

    it('9. PT 101 -> issue INVALID_PART_TIME + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 101 }];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_PART_TIME', index: 0, id: 'emp1', value: 101 }
      ]);
    });

    it('10. PT NaN -> issue INVALID_PART_TIME + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: Number.NaN }];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('INVALID_PART_TIME');
      expect(Number.isNaN(result.issues[0].value)).toBe(true);
    });

    it('11. PT Infinity -> issue INVALID_PART_TIME + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: Number.POSITIVE_INFINITY }];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_PART_TIME', index: 0, id: 'emp1', value: Number.POSITIVE_INFINITY }
      ]);
    });

    it('12. cedolini presenti nel record 2018 -> ignorati senza issue', () => {
      const entries: Art23FteEntry[] = [
        { id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 6 }
      ];
      const result = calculateArt23Fte(entries, 'REFERENCE_2018');
      expect(result.totalFte).toBe(1); // 100% al 31.12.2018, non 0.5
      expect(result.issues).toEqual([]);
    });
  });

  describe('Modalità CURRENT_YEAR', () => {
    it('13. PT undefined + ced undefined -> 1 FTE (100% * 12/12)', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1' }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(1);
      expect(result.issues).toEqual([]);
    });

    it('14. 100% + 12 cedolini -> 1 FTE', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 12 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(1);
      expect(result.issues).toEqual([]);
    });

    it('15. 100% + 6 cedolini -> 0.5 FTE', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 6 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0.5);
      expect(result.issues).toEqual([]);
    });

    it('16. 50% + 12 cedolini -> 0.5 FTE', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 50, cedoliniEmessi: 12 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0.5);
      expect(result.issues).toEqual([]);
    });

    it('17. 50% + 6 cedolini -> 0.25 FTE', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 50, cedoliniEmessi: 6 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0.25);
      expect(result.issues).toEqual([]);
    });

    it('18. 100% + 1 cedolino -> 1/12 FTE (senza rounding numerico)', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 1 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(1 / 12);
      expect(result.issues).toEqual([]);
    });

    it('19. cedolini 0 -> INVALID_CEDOLINI + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 0 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_CEDOLINI', index: 0, id: 'emp1', value: 0 }
      ]);
    });

    it('20. cedolini -1 -> issue INVALID_CEDOLINI + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: -1 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_CEDOLINI', index: 0, id: 'emp1', value: -1 }
      ]);
    });

    it('21. cedolini 13 -> issue INVALID_CEDOLINI + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 13 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_CEDOLINI', index: 0, id: 'emp1', value: 13 }
      ]);
    });

    it('22. cedolini 6.5 (non intero) -> issue INVALID_CEDOLINI + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 6.5 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_CEDOLINI', index: 0, id: 'emp1', value: 6.5 }
      ]);
    });

    it('23. cedolini NaN -> issue INVALID_CEDOLINI + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: Number.NaN }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('INVALID_CEDOLINI');
      expect(Number.isNaN(result.issues[0].value)).toBe(true);
    });

    it('24. cedolini Infinity -> issue INVALID_CEDOLINI + contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 100, cedoliniEmessi: Number.POSITIVE_INFINITY }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_CEDOLINI', index: 0, id: 'emp1', value: Number.POSITIVE_INFINITY }
      ]);
    });

    it('25. PT invalido e cedolini invalidi nello stesso record -> entrambe le issue e contribution 0', () => {
      const entries: Art23FteEntry[] = [{ id: 'emp1', partTimePercentage: 150, cedoliniEmessi: 0 }];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      expect(result.totalFte).toBe(0);
      expect(result.issues).toEqual([
        { code: 'INVALID_PART_TIME', index: 0, id: 'emp1', value: 150 },
        { code: 'INVALID_CEDOLINI', index: 0, id: 'emp1', value: 0 }
      ]);
    });

    it('26. più dipendenti validi -> somma corretta senza rounding', () => {
      const entries: Art23FteEntry[] = [
        { id: 'emp1', partTimePercentage: 100, cedoliniEmessi: 12 }, // 1.0
        { id: 'emp2', partTimePercentage: 50, cedoliniEmessi: 12 },  // 0.5
        { id: 'emp3', partTimePercentage: 100, cedoliniEmessi: 6 },  // 0.5
        { id: 'emp4', partTimePercentage: 80, cedoliniEmessi: 3 },   // 0.8 * 0.25 = 0.2
        { id: 'emp5', partTimePercentage: 100, cedoliniEmessi: 1 },  // 1/12
      ];
      const result = calculateArt23Fte(entries, 'CURRENT_YEAR');
      const expected = 1.0 + 0.5 + 0.5 + 0.2 + (1 / 12);
      expect(result.totalFte).toBe(expected);
      expect(result.issues).toEqual([]);
    });
  });
});
