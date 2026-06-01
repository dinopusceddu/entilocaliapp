import { Wizard2026Check } from './checks';

export const CONGLOBAMENTO_ART60_2026 = {
  FUNZIONARIO_EQ: 127.44,
  ISTRUTTORE: 112.80,
  OPERATORE_ESPERTO: 96.72,
  OPERATORE: 79.56,
} as const;

export type AreaConglobamentoArt60 =
  | 'FUNZIONARIO_EQ'
  | 'ISTRUTTORE'
  | 'OPERATORE_ESPERTO'
  | 'OPERATORE';

export interface PartTimeNativoRow {
  id: string;
  area: AreaConglobamentoArt60;
  percentualePartTime: number;
  numeroDipendenti: number;
  nota?: string;
}

export interface ConglobamentoArt60Input {
  mode?: 'guided' | 'manual';
  personaleInteroArea?: Partial<Record<AreaConglobamentoArt60, number>>;
  partTimeNativi?: PartTimeNativoRow[];
  valoreManuale?: number;
  notaManuale?: string;
  valoreConsolidato2026?: number;
  annoRiferimento?: number;
  ftePerArea?: Partial<Record<AreaConglobamentoArt60, number>>; // per retrocompatibilità/chiamate legacy
}

export interface ConglobamentoArt60Result {
  dettaglioPerArea: Record<AreaConglobamentoArt60, {
    fte: number;
    importoAnnuo: number;
    riduzione: number;
  }>;
  riduzioneTotale?: number;
  ftePerArea: Record<AreaConglobamentoArt60, number>;
}

const AREE: AreaConglobamentoArt60[] = [
  'FUNZIONARIO_EQ',
  'ISTRUTTORE',
  'OPERATORE_ESPERTO',
  'OPERATORE',
];

export function calculateConglobamentoArt60(input: ConglobamentoArt60Input): ConglobamentoArt60Result {
  const annoRiferimento = input.annoRiferimento ?? 2026;
  const isPost2026 = annoRiferimento > 2026;

  const dettaglioPerArea = {} as Record<AreaConglobamentoArt60, { fte: number; importoAnnuo: number; riduzione: number }>;
  const ftePerArea = {} as Record<AreaConglobamentoArt60, number>;

  for (const area of AREE) {
    const intero = input.personaleInteroArea?.[area] ?? input.ftePerArea?.[area] ?? 0;

    // Somma part-time nativi per questa area
    const partTimeNativiArea = (input.partTimeNativi || []).filter(p => p.area === area);
    const sumPartTime = partTimeNativiArea.reduce((acc, row) => {
      const quota = (row.numeroDipendenti * row.percentualePartTime) / 100;
      return acc + (isNaN(quota) ? 0 : quota);
    }, 0);

    const fte = intero + sumPartTime;
    ftePerArea[area] = fte;

    const importoAnnuo = CONGLOBAMENTO_ART60_2026[area];
    const riduzione = fte * importoAnnuo;

    dettaglioPerArea[area] = {
      fte,
      importoAnnuo,
      riduzione,
    };
  }

  const guidedTotal = Object.values(dettaglioPerArea).reduce((acc, d) => acc + d.riduzione, 0);

  let riduzioneTotale: number | undefined = undefined;
  if (isPost2026) {
    if (input.mode === 'manual') {
      riduzioneTotale = input.valoreManuale;
    } else if (input.valoreConsolidato2026 !== undefined && input.valoreConsolidato2026 !== null) {
      riduzioneTotale = input.valoreConsolidato2026;
    } else {
      riduzioneTotale = input.valoreManuale; // Could be undefined (non calcolabile)
    }
  } else {
    if (input.mode === 'manual') {
      riduzioneTotale = input.valoreManuale ?? 0;
    } else {
      riduzioneTotale = guidedTotal;
    }
  }

  return {
    dettaglioPerArea,
    riduzioneTotale,
    ftePerArea,
  };
}

export function validateConglobamentoArt60(input: ConglobamentoArt60Input): Wizard2026Check[] {
  const checks: Wizard2026Check[] = [];

  const annoRiferimento = input.annoRiferimento ?? 2026;
  const isPost2026 = annoRiferimento > 2026;

  if (isPost2026) {
    const hasConsolidato = input.valoreConsolidato2026 !== undefined && input.valoreConsolidato2026 !== null;
    const hasManuale = input.valoreManuale !== undefined && input.valoreManuale !== null;

    if (!hasConsolidato) {
      checks.push({
        id: 'ART60-MISSING-CONSOLIDATO',
        severity: 'warning',
        step: 'Step 5 — Conglobamento art. 60',
        message: 'Dato consolidato 2026 non disponibile. Recuperare il valore della riduzione Art. 60 determinato nel Fondo 2026 oppure inserirlo manualmente con motivazione.',
        field: 'valoreManuale',
        norma: 'Art. 60, CCNL 23.02.2026',
        currentValue: undefined,
        expectedValue: 0,
      });
    }

    if (hasManuale && input.valoreManuale! < 0) {
      checks.push({
        id: 'ART60-NEG-MANUALE',
        severity: 'error',
        step: 'Step 5 — Conglobamento art. 60',
        message: 'La riduzione manuale inserita non può essere negativa.',
        field: 'valoreManuale',
        norma: 'Art. 60, CCNL 23.02.2026',
        currentValue: input.valoreManuale,
        expectedValue: 0,
      });
    }

    if (input.mode === 'manual' && !hasManuale) {
      checks.push({
        id: 'ART60-MISSING-MANUALE',
        severity: 'warning',
        step: 'Step 5 — Conglobamento art. 60',
        message: 'La modalità manuale è attiva, ma non è stato inserito alcun importo.',
        field: 'valoreManuale',
        norma: 'Art. 60, CCNL 23.02.2026',
        currentValue: undefined,
        expectedValue: 0,
      });
    }

    // Nota obbligatoria se si modifica il valore consolidato, si inserisce in sua assenza o differisce
    if (hasManuale) {
      const isDifferent = !hasConsolidato || input.valoreManuale !== input.valoreConsolidato2026;
      if (isDifferent) {
        if (!input.notaManuale || input.notaManuale.trim() === '') {
          checks.push({
            id: 'ART60-MISSING-MOTIVATION',
            severity: 'error',
            step: 'Step 5 — Conglobamento art. 60',
            message: 'La motivazione della correzione manuale del valore consolidato 2026 è obbligatoria.',
            field: 'notaManuale',
            norma: 'Art. 60, CCNL 23.02.2026',
            currentValue: input.notaManuale,
            expectedValue: 'Motivazione della correzione manuale del valore consolidato 2026.',
          });
        }
      }
    }

    return checks;
  }

  if (input.mode === 'manual') {
    if (input.valoreManuale === undefined || input.valoreManuale === null) {
      checks.push({
        id: 'ART60-MISSING-MANUALE',
        severity: 'warning',
        step: 'Step 5 — Conglobamento art. 60',
        message: 'La modalità manuale è attiva, ma non è stato inserito alcun importo.',
        field: 'valoreManuale',
        norma: 'Art. 60, CCNL 23.02.2026',
        currentValue: undefined,
        expectedValue: 0,
      });
    } else if (input.valoreManuale < 0) {
      checks.push({
        id: 'ART60-NEG-MANUALE',
        severity: 'error',
        step: 'Step 5 — Conglobamento art. 60',
        message: 'La riduzione manuale inserita non può essere negativa.',
        field: 'valoreManuale',
        norma: 'Art. 60, CCNL 23.02.2026',
        currentValue: input.valoreManuale,
        expectedValue: 0,
      });
    }
  } else {
    for (const area of AREE) {
      const intero = input.personaleInteroArea?.[area];
      if (intero !== undefined && intero !== null && intero < 0) {
        checks.push({
          id: `ART60-NEG-INTERO-${area}`,
          severity: 'error',
          step: 'Step 5 — Conglobamento art. 60',
          message: `Il personale a tempo pieno inserito per l'area ${area} (${intero}) non può essere negativo.`,
          field: `personaleInteroArea.${area}`,
          norma: 'Art. 60, CCNL 23.02.2026',
          currentValue: intero,
          expectedValue: 0,
        });
      }
    }

    if (input.partTimeNativi) {
      for (let i = 0; i < input.partTimeNativi.length; i++) {
        const row = input.partTimeNativi[i];
        if (row.numeroDipendenti < 0) {
          checks.push({
            id: `ART60-NEG-PT-NUM-${row.id}`,
            severity: 'error',
            step: 'Step 5 — Conglobamento art. 60',
            message: `Il numero di dipendenti part-time inserito nella riga ${i + 1} (${row.numeroDipendenti}) non può essere negativo.`,
            field: `partTimeNativi.${row.id}.numeroDipendenti`,
            norma: 'Art. 60, CCNL 23.02.2026',
            currentValue: row.numeroDipendenti,
            expectedValue: 0,
          });
        }
        if (row.percentualePartTime < 0 || row.percentualePartTime > 100) {
          checks.push({
            id: `ART60-INVALID-PT-PCT-${row.id}`,
            severity: 'error',
            step: 'Step 5 — Conglobamento art. 60',
            message: `La percentuale part-time inserita nella riga ${i + 1} (${row.percentualePartTime}%) deve essere compresa tra 0 e 100.`,
            field: `partTimeNativi.${row.id}.percentualePartTime`,
            norma: 'Art. 60, CCNL 23.02.2026',
            currentValue: row.percentualePartTime,
            expectedValue: 100,
          });
        }
      }
    }
  }

  return checks;
}

