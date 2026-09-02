import { describe, it, expect, vi } from 'vitest';
import { calculateFundCompletely } from '../fundEngine';
import { closeYearAndPrepareNext } from '../../../application/yearClosureWorkflow';
import { 
  NormalizedInput, 
  TipologiaEnte, 
  AnnualSnapshotStatus, 
  UserRole 
} from '../../../domain';

const createBaseFundInput = (overrides: any = {}): NormalizedInput => {
  const { fondi, annualData, historicalData, calculatedInputs, ...rest } = overrides;
  return {
    fondi: {
      dipendente: {
        cl_totaleParzialeRisorsePerConfrontoTetto2016: 100000,
        ...fondi?.dipendente,
      },
      eq: {
        ris_fondoPO2017: 10000,
        ...fondi?.eq,
      },
      segretario: {
        fin_percentualeCoperturaPostoSegretario: 100,
        ...fondi?.segretario,
      },
      dirigenza: {
        lim_totaleParzialeRisorseConfrontoTetto2016: 20000,
        ...fondi?.dirigenza,
      },
    },
    annualData: {
      annoRiferimento: 2026,
      tipologiaEnte: TipologiaEnte.COMUNE,
      numeroAbitanti: 10000,
      hasDirigenza: false,
      fondoLavoroStraordinario: 5000,
      incrementoFondoStraordinario: 0,
      manualDipendentiEquivalenti2018: 10,
      manualDipendentiEquivalentiAnnoRif: 12, // +2 FTE -> potenziale incremento Art. 33 positivo (20.000 €)
      ...annualData,
    },
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoElevateQualificazioni2016: 10000,
      risorseSegretarioComunale2016: 0,
      fondoDirigenza2016: 0,
      fondoStraordinario2016: 5000,
      fondoPersonaleNonDirEQ2018_Art23: 100000, // base 2018 per Art. 33
      ...historicalData,
    },
    distribuzione: {},
    personaleDettaglio: [],
    calculatedInputs: {
      isManualMode: true,
      manualProgressioni: 0,
      manualIndennita: 0,
      dipendentiEquivalentiAnnoRif: 12,
      isArt23FteManualMode: true,
      ...calculatedInputs,
    },
    ...rest,
  } as any;
};

const mockNormativeData = {
  riferimenti_normativi: {
    art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017',
  },
} as any;

const getArt33Increment = (res: any): number => {
  const compliance = res.compliance.art23Compliance;
  return (compliance?.limiteArt23Attualizzato ?? 0) - (compliance?.limiteStorico2016Neutralizzato ?? 0);
};

describe('Fund Engine — Art. 33 Application Policy Gate (Sections 31, 32, 33)', () => {
  describe('Section 31.A — Entità Canoniche', () => {
    it('1. COMUNE 2026 ordinario -> APPLY -> adeguamento calcolato', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: { entityType: 'COMUNE' },
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBeGreaterThan(0);
      expect(res.compliance.art23Compliance!.limiteArt23Attualizzato!).toBeGreaterThan(
        res.compliance.art23Compliance!.limiteStorico2016Neutralizzato!
      );
    });

    it('2. UNIONE_COMUNI -> SKIP -> adeguamento 0 e warning presente', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: { entityType: 'UNIONE_COMUNI' },
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBe(0);
      expect(res.compliance.art23Compliance!.limiteArt23Attualizzato).toBe(
        res.compliance.art23Compliance!.limiteStorico2016Neutralizzato
      );
      expect(
        res.compliance.art23Compliance!.warnings.some(w =>
          w.includes("Adeguamento Art. 33 non applicato perché l'ente non rientra nell'ambito di applicazione diretta")
        )
      ).toBe(true);
    });

    it('3. COMUNITA_MONTANA -> SKIP -> adeguamento 0 e warning presente', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: { entityType: 'COMUNITA_MONTANA' },
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBe(0);
      expect(
        res.compliance.art23Compliance!.warnings.some(w =>
          w.includes("Adeguamento Art. 33 non applicato perché l'ente non rientra nell'ambito di applicazione diretta")
        )
      ).toBe(true);
    });

    it('4. PROVINCIA + ORDINARY_REGIME -> APPLY -> adeguamento calcolato', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: {
            entityType: 'PROVINCIA',
            territorialContext: 'ORDINARY_REGIME',
          },
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBeGreaterThan(0);
    });

    it('5. PROVINCIA + SICILIAN_AREA_VASTA -> SKIP -> adeguamento 0 e warning presente', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: {
            entityType: 'PROVINCIA',
            territorialContext: 'SICILIAN_AREA_VASTA',
          },
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBe(0);
      expect(
        res.compliance.art23Compliance!.warnings.some(w =>
          w.includes("Adeguamento Art. 33 non applicato perché l'ente non rientra nell'ambito di applicazione diretta")
        )
      ).toBe(true);
    });

    it('6. PROVINCIA senza context -> BLOCK -> lancia eccezione', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: {
            entityType: 'PROVINCIA',
            territorialContext: undefined,
          },
          art33ManualDecision: undefined,
        },
      });

      expect(() => calculateFundCompletely(input, mockNormativeData)).toThrow(
        "Calcolo bloccato: l'applicabilità dell'adeguamento Art. 33 richiede una decisione manuale esplicita."
      );
    });

    it('7. PROVINCIA senza context + DO_NOT_APPLY -> SKIP -> adeguamento 0 e warning', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: {
            entityType: 'PROVINCIA',
            territorialContext: undefined,
          },
          art33ManualDecision: 'DO_NOT_APPLY',
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBe(0);
      expect(
        res.compliance.art23Compliance!.warnings.some(w =>
          w.includes("Adeguamento Art. 33 non applicato in base all'esito della verifica manuale registrata")
        )
      ).toBe(true);
    });

    it('8. PROVINCIA senza context + APPLY -> APPLY -> adeguamento calcolato', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: {
            entityType: 'PROVINCIA',
            territorialContext: undefined,
          },
          art33ManualDecision: 'APPLY',
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBeGreaterThan(0);
    });

    it('9. ALTRO senza decisione -> BLOCK -> lancia eccezione', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: { entityType: 'ALTRO' },
          art33ManualDecision: undefined,
        },
      });

      expect(() => calculateFundCompletely(input, mockNormativeData)).toThrow(
        "Calcolo bloccato: l'applicabilità dell'adeguamento Art. 33 richiede una decisione manuale esplicita."
      );
    });

    it('10. ALTRO + DO_NOT_APPLY -> SKIP -> adeguamento 0 e warning', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: { entityType: 'ALTRO' },
          art33ManualDecision: 'DO_NOT_APPLY',
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBe(0);
      expect(
        res.compliance.art23Compliance!.warnings.some(w =>
          w.includes("Adeguamento Art. 33 non applicato in base all'esito della verifica manuale registrata")
        )
      ).toBe(true);
    });

    it('11. ALTRO + APPLY -> APPLY -> adeguamento calcolato', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: { entityType: 'ALTRO' },
          art33ManualDecision: 'APPLY',
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBeGreaterThan(0);
    });
  });

  describe('Section 31.B — Entità Legacy senza entityClassification', () => {
    it('1. TipologiaEnte.COMUNE -> APPLY -> adeguamento calcolato', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: undefined,
          tipologiaEnte: TipologiaEnte.COMUNE,
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBeGreaterThan(0);
    });

    it('2. TipologiaEnte.PROVINCIA (senza context) -> BLOCK -> lancia eccezione', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: undefined,
          tipologiaEnte: TipologiaEnte.PROVINCIA,
          art33ManualDecision: undefined,
        },
      });

      expect(() => calculateFundCompletely(input, mockNormativeData)).toThrow(
        "Calcolo bloccato: l'applicabilità dell'adeguamento Art. 33 richiede una decisione manuale esplicita."
      );
    });

    it('3. TipologiaEnte.UNIONE_COMUNI -> SKIP -> adeguamento 0', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: undefined,
          tipologiaEnte: TipologiaEnte.UNIONE_COMUNI,
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBe(0);
    });

    it('4. TipologiaEnte.COMUNITA_MONTANA -> SKIP -> adeguamento 0', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: undefined,
          tipologiaEnte: TipologiaEnte.COMUNITA_MONTANA,
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBe(0);
    });

    it('5. TipologiaEnte.ALTRO -> BLOCK -> lancia eccezione', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: undefined,
          tipologiaEnte: TipologiaEnte.ALTRO,
          art33ManualDecision: undefined,
        },
      });

      expect(() => calculateFundCompletely(input, mockNormativeData)).toThrow(
        "Calcolo bloccato: l'applicabilità dell'adeguamento Art. 33 richiede una decisione manuale esplicita."
      );
    });
  });

  describe('Section 31.C — Precedenza Canonica sul Legacy', () => {
    it('tipologiaEnte = UNIONE ma canonical = COMUNE -> prevale COMUNE (APPLY)', () => {
      const input = createBaseFundInput({
        annualData: {
          tipologiaEnte: TipologiaEnte.UNIONE_COMUNI,
          entityClassification: { entityType: 'COMUNE' },
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBeGreaterThan(0);
    });

    it('tipologiaEnte = COMUNE ma canonical = UNIONE_COMUNI -> prevale UNIONE_COMUNI (SKIP)', () => {
      const input = createBaseFundInput({
        annualData: {
          tipologiaEnte: TipologiaEnte.COMUNE,
          entityClassification: { entityType: 'UNIONE_COMUNI' },
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);
      expect(getArt33Increment(res)).toBe(0);
    });
  });

  describe('Section 31.D — Isolamento territorialContext in HistoricalData', () => {
    it('historicalData con territorialContext ma annualData senza context -> BLOCK', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: {
            entityType: 'PROVINCIA',
            territorialContext: undefined, // Non definito in annualData
          },
          art33ManualDecision: undefined,
        },
        historicalData: {
          entityClassification: {
            entityType: 'PROVINCIA',
            territorialContext: 'ORDINARY_REGIME', // Presente solo in historicalData
          },
        },
      });

      // Deve bloccare perché annualData non eredita contesti territoriali da historicalData
      expect(() => calculateFundCompletely(input, mockNormativeData)).toThrow(
        "Calcolo bloccato: l'applicabilità dell'adeguamento Art. 33 richiede una decisione manuale esplicita."
      );
    });
  });

  describe('Section 32 — Indipendenza Art. 79 c. 1 lett. c vs Art. 33', () => {
    it('Unione o Ente SKIP: adeguamento Art. 33 è 0, ma incremento stabile Art. 79 resta intatto', () => {
      const input = createBaseFundInput({
        annualData: {
          entityClassification: { entityType: 'UNIONE_COMUNI' },
        },
        fondi: {
          dipendente: {
            // Voce contrattuale Art. 79 c. 1 lett. c
            st_art79c1c_incrementoStabileConsistenzaPers: 4500,
          },
        },
      });

      const res = calculateFundCompletely(input, mockNormativeData);

      // 1. Adeguamento Art. 33 azzerato
      expect(getArt33Increment(res)).toBe(0);
      expect(res.compliance.art23Compliance!.limiteArt23Attualizzato).toBe(
        res.compliance.art23Compliance!.limiteStorico2016Neutralizzato
      );

      // 2. Incremento contrattuale stabile Art. 79 c. 1 lett. c preservato nel fondo
      const voceArt79 = res.fondi.dipendente.constitution?.sections.stabili.items.find(
        item => item.key === 'st_art79c1c_incrementoStabileConsistenzaPers'
      );
      expect(voceArt79?.amount).toBe(4500);
    });
  });

  describe('Section 33 — Sicurezza Year Closure su Ente in stato BLOCK', () => {
    it('closeYearAndPrepareNext fallisce in modo controllato su BLOCK e non salva snapshot', async () => {
      const mockDeps: any = {
        stateRepository: {
          getState: vi.fn().mockResolvedValue({
            data: { fund_data: { metadata: { snapshotStatus: AnnualSnapshotStatus.OPEN } } },
          }),
          upsertState: vi.fn(),
          createState: vi.fn(),
        },
        entityRepository: {
          update: vi.fn(),
        },
        userRepository: {
          getUserRole: vi.fn().mockResolvedValue({ data: UserRole.ADMIN }),
        },
      };

      const mockUser = { id: 'u1', email: 'admin@test.it', role: UserRole.ADMIN };
      const mockEntity = { id: 'e1', name: 'Provincia Senza Contesto' };
      const mockYear = 2026;
      const mockKey = 'e1:2026';

      const blockingFundData = {
        annualData: {
          annoRiferimento: 2026,
          entityClassification: {
            entityType: 'PROVINCIA',
            territorialContext: undefined,
          },
          art33ManualDecision: undefined,
        },
        fondoAccessorioDipendenteData: {},
        fondoElevateQualificazioniData: {},
        historicalData: {
          fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
        },
        distribuzioneRisorseData: {},
      };

      const result = await closeYearAndPrepareNext(
        mockDeps,
        mockUser,
        mockEntity,
        mockYear,
        UserRole.ADMIN,
        blockingFundData as any,
        mockNormativeData,
        {} as any,
        mockKey
      );

      // Verifica fallimento controllato
      expect(result.success).toBe(false);
      expect(result.error).toContain("decisione manuale esplicita");

      // Verifica che non sia stato creato alcuno snapshot chiuso
      expect(mockDeps.stateRepository.upsertState).not.toHaveBeenCalled();
      expect(mockDeps.stateRepository.createState).not.toHaveBeenCalled();
    });
  });
});
