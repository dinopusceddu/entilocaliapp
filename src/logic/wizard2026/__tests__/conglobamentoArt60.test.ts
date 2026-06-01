import { describe, it, expect } from 'vitest';
import { calculateConglobamentoArt60, validateConglobamentoArt60, ConglobamentoArt60Input, CONGLOBAMENTO_ART60_2026 } from '../conglobamentoArt60';

describe('Conglobamento art. 60 CCNL 23.02.2026 — Wizard 2026', () => {
  it('1. Correttezza degli importi annui moltiplicati per 12 e assenza di importi errati', () => {
    // Verifichiamo che gli importi annui corrispondano esattamente a quota mensile * 12
    expect(10.62 * 12).toBeCloseTo(127.44, 2);
    expect(9.40 * 12).toBeCloseTo(112.80, 2);
    expect(8.06 * 12).toBeCloseTo(96.72, 2);
    expect(6.63 * 12).toBeCloseTo(79.56, 2);

    expect(CONGLOBAMENTO_ART60_2026.FUNZIONARIO_EQ).toBe(127.44);
    expect(CONGLOBAMENTO_ART60_2026.ISTRUTTORE).toBe(112.80);
    expect(CONGLOBAMENTO_ART60_2026.OPERATORE_ESPERTO).toBe(96.72);
    expect(CONGLOBAMENTO_ART60_2026.OPERATORE).toBe(79.56);
  });

  it('2. Calcolo full-time e part-time trasformato (come unità intere)', () => {
    // Nel calcolo guidato, il personale a tempo pieno e quello trasformato sono inseriti in personaleInteroArea
    const input: ConglobamentoArt60Input = {
      mode: 'guided',
      annoRiferimento: 2026,
      personaleInteroArea: {
        FUNZIONARIO_EQ: 2, // 2 dipendenti a tempo pieno
        ISTRUTTORE: 1.5,   // 1.5 FTE
      },
      partTimeNativi: [],
    };

    const res = calculateConglobamentoArt60(input);
    // Funzionari: 2 FTE * 127.44 = 254.88
    expect(res.dettaglioPerArea.FUNZIONARIO_EQ.fte).toBe(2);
    expect(res.dettaglioPerArea.FUNZIONARIO_EQ.riduzione).toBeCloseTo(254.88, 2);

    // Istruttori: 1.5 FTE * 112.80 = 169.20
    expect(res.dettaglioPerArea.ISTRUTTORE.fte).toBe(1.5);
    expect(res.dettaglioPerArea.ISTRUTTORE.riduzione).toBeCloseTo(169.20, 2);

    expect(res.riduzioneTotale).toBeCloseTo(254.88 + 169.20, 2);
  });

  it('3. Calcolo part-time nativo pro-quota', () => {
    const input: ConglobamentoArt60Input = {
      mode: 'guided',
      annoRiferimento: 2026,
      personaleInteroArea: {
        OPERATORE_ESPERTO: 1, // 1 full-time
      },
      partTimeNativi: [
        {
          id: 'pt-1',
          area: 'OPERATORE_ESPERTO',
          percentualePartTime: 50,
          numeroDipendenti: 2, // 2 dipendenti al 50% = 1 FTE
        },
        {
          id: 'pt-2',
          area: 'OPERATORE',
          percentualePartTime: 75,
          numeroDipendenti: 1, // 1 dipendente al 75% = 0.75 FTE
        }
      ],
    };

    const res = calculateConglobamentoArt60(input);

    // Operatori Esperti: 1 (intero) + 2 * 0.5 (part-time nativo) = 2 FTE
    // 2 FTE * 96.72 = 193.44
    expect(res.dettaglioPerArea.OPERATORE_ESPERTO.fte).toBe(2);
    expect(res.dettaglioPerArea.OPERATORE_ESPERTO.riduzione).toBeCloseTo(193.44, 2);

    // Operatori: 0 (intero) + 1 * 0.75 = 0.75 FTE
    // 0.75 FTE * 79.56 = 59.67
    expect(res.dettaglioPerArea.OPERATORE.fte).toBe(0.75);
    expect(res.dettaglioPerArea.OPERATORE.riduzione).toBeCloseTo(59.67, 2);

    expect(res.riduzioneTotale).toBeCloseTo(193.44 + 59.67, 2);
  });

  it('4. Inserimento manuale', () => {
    const input: ConglobamentoArt60Input = {
      mode: 'manual',
      annoRiferimento: 2026,
      valoreManuale: 1500,
      personaleInteroArea: {
        FUNZIONARIO_EQ: 10,
      },
    };

    const res = calculateConglobamentoArt60(input);
    // In modalità manuale, la riduzione totale deve essere esattamente il valore manuale,
    // ignorando il calcolo basato sul personale.
    expect(res.riduzioneTotale).toBe(1500);

    const checks = validateConglobamentoArt60(input);
    expect(checks.length).toBe(0);
  });

  it('5. Mantenimento del valore negli anni successivi al 2026', () => {
    // Se l'anno di riferimento è 2027 e valoreConsolidato2026 è presente,
    // deve essere utilizzato come riduzione totale, ignorando ogni ricalcolo sul personale.
    const input: ConglobamentoArt60Input = {
      mode: 'guided',
      annoRiferimento: 2027,
      valoreConsolidato2026: 1234.56,
      personaleInteroArea: {
        FUNZIONARIO_EQ: 5, // Se calcolasse produrrebbe 5 * 127.44 = 637.20
      },
    };

    const res = calculateConglobamentoArt60(input);
    expect(res.riduzioneTotale).toBe(1234.56);
  });

  it('6. Segnalazione warning se anno > 2026 senza valore consolidato né manuale', () => {
    const input: ConglobamentoArt60Input = {
      mode: 'guided',
      annoRiferimento: 2027,
    };
    const checks = validateConglobamentoArt60(input);
    expect(checks).toContainEqual(expect.objectContaining({
      id: 'ART60-MISSING-CONSOLIDATO',
      severity: 'warning',
    }));
  });

  it('7. Validazione input negativi', () => {
    const inputNegativoIntero: ConglobamentoArt60Input = {
      mode: 'guided',
      annoRiferimento: 2026,
      personaleInteroArea: {
        FUNZIONARIO_EQ: -1,
      },
    };
    let checks = validateConglobamentoArt60(inputNegativoIntero);
    expect(checks.some(c => c.id === 'ART60-NEG-INTERO-FUNZIONARIO_EQ')).toBe(true);

    const inputNegativoPt: ConglobamentoArt60Input = {
      mode: 'guided',
      annoRiferimento: 2026,
      partTimeNativi: [
        {
          id: 'pt-neg',
          area: 'FUNZIONARIO_EQ',
          percentualePartTime: -10,
          numeroDipendenti: 1,
        }
      ]
    };
    checks = validateConglobamentoArt60(inputNegativoPt);
    expect(checks.some(c => c.id === 'ART60-INVALID-PT-PCT-pt-neg')).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST RICHIESTI: Vincolo consolidamento temporale Art. 60 (anni > 2026)
  // ─────────────────────────────────────────────────────────────────────────────

  it('8. [CRITICO] Anno > 2026, assenza consolidato 2026: riduzioneTotale NON è 0 (è undefined)', () => {
    // Verifica che in assenza del valore consolidato 2026, la funzione NON restituisca
    // automaticamente 0 come riduzione. Il valore deve essere undefined (non calcolabile).
    const input: ConglobamentoArt60Input = {
      mode: 'guided',
      annoRiferimento: 2027,
      // Nessun valoreConsolidato2026
      // Nessun valoreManuale
      personaleInteroArea: {
        FUNZIONARIO_EQ: 10,  // Se calcolasse: 10 * 127.44 = 1274.40, ma NON deve calcolare
        ISTRUTTORE: 5,
      },
    };

    const res = calculateConglobamentoArt60(input);

    // La riduzione totale NON deve essere 0
    expect(res.riduzioneTotale).not.toBe(0);

    // La riduzione totale deve essere undefined (stato "non calcolabile")
    expect(res.riduzioneTotale).toBeUndefined();
  });

  it('9. [CRITICO] Anno > 2026, assenza consolidato: ART60-MISSING-CONSOLIDATO e NON è calcolabile in modalità guidata', () => {
    // Verifica che la validazione emetta ART60-MISSING-CONSOLIDATO quando il consolidato
    // manca e non venga calcolato automaticamente sul personale corrente.
    const input2027SenzaConsolidato: ConglobamentoArt60Input = {
      mode: 'guided',
      annoRiferimento: 2027,
      personaleInteroArea: {
        FUNZIONARIO_EQ: 8,
        ISTRUTTORE: 3,
        OPERATORE_ESPERTO: 2,
        OPERATORE: 1,
      },
    };

    // Il calcolo NON deve usare il personale corrente
    const res = calculateConglobamentoArt60(input2027SenzaConsolidato);
    expect(res.riduzioneTotale).toBeUndefined();
    expect(res.riduzioneTotale).not.toBe(0);

    // La validazione deve emettere il warning ART60-MISSING-CONSOLIDATO
    const checks = validateConglobamentoArt60(input2027SenzaConsolidato);
    expect(checks).toContainEqual(expect.objectContaining({
      id: 'ART60-MISSING-CONSOLIDATO',
      severity: 'warning',
    }));

    // Non deve emettere errore di motivazione se non c'è nemmeno un valore manuale
    expect(checks.some(c => c.id === 'ART60-MISSING-MOTIVATION')).toBe(false);
  });

  it('10. [CRITICO] Anno > 2026: motivazione obbligatoria se si inserisce valore manuale senza consolidato', () => {
    // Se si inserisce un valore manuale in assenza del consolidato 2026,
    // la notaManuale è obbligatoria.
    const inputSenzaNota: ConglobamentoArt60Input = {
      mode: 'manual',
      annoRiferimento: 2027,
      valoreManuale: 2500,
      notaManuale: '',  // Nota vuota → deve generare errore
      // Nessun valoreConsolidato2026
    };

    const checksSenzaNota = validateConglobamentoArt60(inputSenzaNota);
    expect(checksSenzaNota).toContainEqual(expect.objectContaining({
      id: 'ART60-MISSING-MOTIVATION',
      severity: 'error',
    }));

    // Con nota presente → nessun errore di motivazione
    const inputConNota: ConglobamentoArt60Input = {
      mode: 'manual',
      annoRiferimento: 2027,
      valoreManuale: 2500,
      notaManuale: 'Valore determinato sulla base del fondo 2026 certificato dalla Ragioneria.',
      // Nessun valoreConsolidato2026
    };

    const checksConNota = validateConglobamentoArt60(inputConNota);
    expect(checksConNota.some(c => c.id === 'ART60-MISSING-MOTIVATION')).toBe(false);

    // Deve ancora esserci il warning ART60-MISSING-CONSOLIDATO (dato non disponibile in sistema)
    expect(checksConNota).toContainEqual(expect.objectContaining({
      id: 'ART60-MISSING-CONSOLIDATO',
      severity: 'warning',
    }));
  });

  it('11. Anno > 2026: motivazione obbligatoria se valore manuale differisce dal consolidato 2026', () => {
    // Se il valore manuale è diverso dal consolidato 2026, la nota è obbligatoria.
    const inputDifferenzaSenzaNota: ConglobamentoArt60Input = {
      mode: 'manual',
      annoRiferimento: 2028,
      valoreConsolidato2026: 1500,
      valoreManuale: 1800,  // Diverso dal consolidato → obbliga nota
      notaManuale: '',       // Nota assente → errore
    };

    const checks = validateConglobamentoArt60(inputDifferenzaSenzaNota);
    expect(checks).toContainEqual(expect.objectContaining({
      id: 'ART60-MISSING-MOTIVATION',
      severity: 'error',
    }));

    // Se manuale === consolidato → nessuna nota necessaria
    const inputUguale: ConglobamentoArt60Input = {
      mode: 'manual',
      annoRiferimento: 2028,
      valoreConsolidato2026: 1500,
      valoreManuale: 1500,  // Uguale al consolidato
      notaManuale: '',
    };

    const checksUguale = validateConglobamentoArt60(inputUguale);
    expect(checksUguale.some(c => c.id === 'ART60-MISSING-MOTIVATION')).toBe(false);
  });

  it('12. Anno > 2026 con consolidato presente: calcola dal consolidato, non dal personale corrente', () => {
    // Con consolidato 2026 presente, il risultato deve essere esattamente il consolidato,
    // indipendentemente dal personale inserito.
    const input: ConglobamentoArt60Input = {
      mode: 'guided',
      annoRiferimento: 2029,
      valoreConsolidato2026: 9876.54,
      personaleInteroArea: {
        FUNZIONARIO_EQ: 20, // Ignorate: 20 * 127.44 = 2548.80
        ISTRUTTORE: 15,     // Ignorate: 15 * 112.80 = 1692.00
      },
    };

    const res = calculateConglobamentoArt60(input);

    // Deve restituire il consolidato, NON il ricalcolo sul personale corrente
    expect(res.riduzioneTotale).toBe(9876.54);
    expect(res.riduzioneTotale).not.toBe(2548.80 + 1692.00);

    // Nessun warning/errore
    const checks = validateConglobamentoArt60(input);
    expect(checks.some(c => c.id === 'ART60-MISSING-CONSOLIDATO')).toBe(false);
    expect(checks.some(c => c.id === 'ART60-MISSING-MOTIVATION')).toBe(false);
  });
});
