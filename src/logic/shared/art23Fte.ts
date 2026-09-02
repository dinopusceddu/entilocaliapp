/**
 * Canonical FTE contract. Not wired into production runtime yet.
 * Runtime wiring is intentionally deferred to a dedicated follow-up PR
 * because existing layers currently have characterized divergent boundary
 * semantics.
 */

export interface Art23FteEntry {
  id?: string;
  partTimePercentage?: number;
  cedoliniEmessi?: number;
}

export type Art23FteReferenceMode =
  | 'REFERENCE_2018'
  | 'CURRENT_YEAR';

export type Art23FteIssueCode =
  | 'INVALID_PART_TIME'
  | 'INVALID_CEDOLINI';

export interface Art23FteIssue {
  code: Art23FteIssueCode;
  index: number;
  id?: string;
  value?: number;
}

export interface Art23FteCalculationResult {
  totalFte: number;
  issues: Art23FteIssue[];
}

/**
 * Calcola i dipendenti equivalenti (FTE) secondo la semantica canonica unificata.
 * 
 * Regole:
 * - Distingue dato assente (undefined) da zero esplicito.
 * - Part-time: se undefined assume 100 (retrocompatibilità); se esplicito è valido solo se finito e in (0, 100].
 * - Cedolini (solo CURRENT_YEAR): se undefined assume 12 (retrocompatibilità); se esplicito è valido solo se intero in [1, 12].
 * - In REFERENCE_2018 la consistenza al 31.12.2018 prescinde dalla durata: cedoliniEmessi viene ignorato e non genera issue.
 * - Record con valori invalidi generano issue e contribuiscono con 0 FTE (fail-safe).
 * - Nessun arrotondamento su contributi o totale.
 */
export function calculateArt23Fte(
  entries: readonly Art23FteEntry[] | undefined,
  mode: Art23FteReferenceMode
): Art23FteCalculationResult {
  if (!entries || entries.length === 0) {
    return {
      totalFte: 0,
      issues: []
    };
  }

  const issues: Art23FteIssue[] = [];
  let totalFte = 0;

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    let ptValid = false;
    let ptFactor = 0;

    if (entry.partTimePercentage === undefined) {
      ptValid = true;
      ptFactor = 1; // 100% default retrocompatibile
    } else if (
      typeof entry.partTimePercentage === 'number' &&
      Number.isFinite(entry.partTimePercentage) &&
      entry.partTimePercentage > 0 &&
      entry.partTimePercentage <= 100
    ) {
      ptValid = true;
      ptFactor = entry.partTimePercentage / 100;
    } else {
      issues.push({
        code: 'INVALID_PART_TIME',
        index,
        id: entry.id,
        value: entry.partTimePercentage
      });
    }

    if (mode === 'REFERENCE_2018') {
      if (ptValid) {
        totalFte += ptFactor;
      }
    } else {
      // CURRENT_YEAR
      let cedValid = false;
      let cedFactor = 0;

      if (entry.cedoliniEmessi === undefined) {
        cedValid = true;
        cedFactor = 1; // 12/12 default retrocompatibile
      } else if (
        typeof entry.cedoliniEmessi === 'number' &&
        Number.isFinite(entry.cedoliniEmessi) &&
        Number.isInteger(entry.cedoliniEmessi) &&
        entry.cedoliniEmessi >= 1 &&
        entry.cedoliniEmessi <= 12
      ) {
        cedValid = true;
        cedFactor = entry.cedoliniEmessi / 12;
      } else {
        issues.push({
          code: 'INVALID_CEDOLINI',
          index,
          id: entry.id,
          value: entry.cedoliniEmessi
        });
      }

      if (ptValid && cedValid) {
        totalFte += ptFactor * cedFactor;
      }
    }
  }

  return {
    totalFte,
    issues
  };
}
