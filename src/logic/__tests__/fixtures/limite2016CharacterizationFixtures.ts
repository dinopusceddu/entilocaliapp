import { Art23LimitInput } from '../../wizard2026/art23Limit';
import {
  NormalizedInput,
  TipologiaEnte,
  NormativeData,
  AnnualData,
  HistoricalData,
  FondoAccessorioDipendenteData,
  FondoElevateQualificazioniData,
  FondoSegretarioComunaleData,
  FondoDirigenzaData,
  DistribuzioneRisorseData,
  PersonaleServizioDettaglio
} from '../../../domain';

export type CharacterizationCategory =
  | 'COMMON'
  | 'INTENTIONAL_DIVERGENCE'
  | 'WIZARD_ONLY'
  | 'FUND_ENGINE_ONLY';

export interface CharacterizationFixture<TWizardExpected = unknown, TFundExpected = unknown> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: CharacterizationCategory;
  readonly divergenceReason?: string;
  readonly wizardInput?: Art23LimitInput;
  readonly fundInput?: NormalizedInput;
  readonly expectedWizard: TWizardExpected;
  readonly expectedFund: TFundExpected;
}

export type CharacterizationFundOverrides = {
  annualData?: Partial<AnnualData>;
  historicalData?: Partial<HistoricalData>;
  fondi?: {
    dipendente?: Partial<FondoAccessorioDipendenteData>;
    eq?: Partial<FondoElevateQualificazioniData>;
    segretario?: Partial<FondoSegretarioComunaleData>;
    dirigenza?: Partial<FondoDirigenzaData>;
  };
  distribuzione?: Partial<DistribuzioneRisorseData>;
  personaleDettaglio?: PersonaleServizioDettaglio[];
  calculatedInputs?: Partial<NormalizedInput['calculatedInputs']>;
};

export const mockNormativeData: NormativeData = {
  valori_pro_capite: {
    art67_ccnl_2018: 0,
    art79_ccnl_2022_b: 0
  },
  limiti: {
    incidenza_salario_accessorio: 0,
    incremento_virtuosi_dl25_2025: 0,
    incremento_pnrr_dl13_2023: 0
  },
  riferimenti_normativi: {
    art23_dlgs75_2017: 'Art. 23 c. 2 D.Lgs. 75/2017'
  },
  progression_economic_values: {},
  indennita_comparto_values: {}
};

/**
 * Helper tipizzato per creare un NormalizedInput valido e deterministico per fundEngine.
 */
export function createCharacterizationFundInput(overrides: CharacterizationFundOverrides = {}): NormalizedInput {
  const defaultAnnualData: AnnualData = {
    annoRiferimento: 2026,
    tipologiaEnte: TipologiaEnte.COMUNE,
    numeroAbitanti: 10000,
    hasDirigenza: false,
    personaleServizioAttuale: [],
    proventiSpecifici: [],
    personale2018PerArt23: [],
    personaleAnnoRifPerArt23: [],
    simulatoreInput: {},
    fondoLavoroStraordinario: 0,
    incrementoFondoStraordinario: 0
  };

  const defaultHistoricalData: HistoricalData = {
    fondoSalarioAccessorioPersonaleNonDirEQ2016: 0,
    fondoElevateQualificazioni2016: 0,
    risorseSegretarioComunale2016: 0,
    fondoDirigenza2016: 0,
    fondoStraordinario2016: 0
  };

  const defaultCalculatedInputs: NormalizedInput['calculatedInputs'] = {
    dipendentiEquivalenti2018: 0,
    dipendentiEquivalentiAnnoRif: 0,
    variazioneDipendenti: 0,
    isArt48Applicabile: false,
    numDipendentiContrattazione: 0,
    isManualMode: true,
    manualProgressioni: 0,
    manualIndennita: 0
  };

  return {
    annualData: {
      ...defaultAnnualData,
      ...overrides.annualData
    },
    historicalData: {
      ...defaultHistoricalData,
      ...overrides.historicalData
    },
    fondi: {
      dipendente: {
        ...overrides.fondi?.dipendente
      },
      eq: {
        ris_fondoPO2017: 0,
        ...overrides.fondi?.eq
      },
      segretario: {
        fin_percentualeCoperturaPostoSegretario: 100,
        ...overrides.fondi?.segretario
      },
      dirigenza: {
        lim_totaleParzialeRisorseConfrontoTetto2016: 0,
        ...overrides.fondi?.dirigenza
      }
    },
    distribuzione: {
      ...overrides.distribuzione
    },
    personaleDettaglio: overrides.personaleDettaglio ?? [],
    calculatedInputs: {
      ...defaultCalculatedInputs,
      ...overrides.calculatedInputs
    }
  };
}

/**
 * Fixture 1: Limite Certificato Prevalente
 * Il limite asseverato dai revisori (150.000 €) prevale sulla somma delle voci analitiche (135.000 €).
 */
export const fixture01_limiteCertificatoPrevalente: CharacterizationFixture<{
  limite2016Base: number;
  fonteLimite2016: string;
  limiteArt23Attualizzato: number;
}, {
  limiteAttualizzato: number;
  valoreSoggetto: number;
  margineResiduo: number;
  isCompliant: boolean;
}> = {
  id: 'CASE_01_LIMITE_CERTIFICATO_PREVALENTE',
  name: 'Limite 2016 Certificato Prevalente',
  description: 'Il valore inserito in limite2016CertificatoEnte/manualPersonalFundLimit2016 prevale sulla somma analitica 2016',
  category: 'COMMON',
  wizardInput: {
    limite2016CertificatoEnte: 150000,
    fondoPersonaleDipendente2016: 100000,
    fondoEqPo2016: 20000,
    fondoStraordinario2016: 15000,
    fondoDipendenti2018Soggetto: 100000,
    risorsePoEq2018Soggette: 20000,
    usaCalcoloManualePersonaleArt23: true,
    manualDipendentiEquivalenti2018: 10,
    manualDipendentiEquivalenti2026: 10
  },
  fundInput: createCharacterizationFundInput({
    historicalData: {
      manualPersonalFundLimit2016: 150000,
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoElevateQualificazioni2016: 20000,
      fondoStraordinario2016: 15000,
      fondoPersonaleNonDirEQ2018_Art23: 100000,
      fondoEQ2018_Art23: 20000
    },
    annualData: {
      manualDipendentiEquivalenti2018: 10,
      manualDipendentiEquivalentiAnnoRif: 10,
      fondoLavoroStraordinario: 15000
    },
    fondi: {
      dipendente: {
        st_art79c1_art67c1_unicoImporto2017: 100000
      },
      eq: {
        ris_fondoPO2017: 20000
      }
    },
    calculatedInputs: {
      isManualMode: true,
      dipendentiEquivalentiAnnoRif: 10
    }
  }),
  expectedWizard: {
    limite2016Base: 150000,
    fonteLimite2016: 'CERTIFICATO',
    limiteArt23Attualizzato: 150000
  },
  expectedFund: {
    limiteAttualizzato: 150000,
    valoreSoggetto: 135000,
    margineResiduo: 15000,
    isCompliant: true
  }
};

/**
 * Fixture 2: Ricostruzione Analitica 2016
 * In assenza di limite certificato, la base 2016 è la somma dei singoli sottofondi.
 */
export const fixture02_limiteRicostruitoAnalitico: CharacterizationFixture<{
  limite2016Base: number;
  fonteLimite2016: string;
  totaleVoci2016Ricostruite: number;
  limiteArt23Attualizzato: number;
}, {
  limiteAttualizzato: number;
  valoreSoggetto: number;
  margineResiduo: number;
}> = {
  id: 'CASE_02_RICOSTRUZIONE_ANALITICA',
  name: 'Ricostruzione Analitica del Limite 2016',
  description: 'Senza limite certificato, la base è la somma esatta di dipendenti + EQ + straordinario + segretario',
  category: 'COMMON',
  wizardInput: {
    limite2016CertificatoEnte: undefined,
    fondoPersonaleDipendente2016: 80000,
    fondoEqPo2016: 15000,
    fondoStraordinario2016: 10000,
    risorseSegretario2016: 5000,
    fondoDipendenti2018Soggetto: 80000,
    risorsePoEq2018Soggette: 15000,
    usaCalcoloManualePersonaleArt23: true,
    manualDipendentiEquivalenti2018: 10,
    manualDipendentiEquivalenti2026: 10
  },
  fundInput: createCharacterizationFundInput({
    historicalData: {
      manualPersonalFundLimit2016: undefined,
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 80000,
      fondoElevateQualificazioni2016: 15000,
      fondoStraordinario2016: 10000,
      risorseSegretarioComunale2016: 5000,
      fondoPersonaleNonDirEQ2018_Art23: 80000,
      fondoEQ2018_Art23: 15000
    },
    annualData: {
      manualDipendentiEquivalenti2018: 10,
      manualDipendentiEquivalentiAnnoRif: 10,
      fondoLavoroStraordinario: 10000
    },
    fondi: {
      dipendente: {
        st_art79c1_art67c1_unicoImporto2017: 80000
      },
      eq: {
        ris_fondoPO2017: 15000
      },
      segretario: {
        fin_percentualeCoperturaPostoSegretario: 100,
        st_art3c6_CCNL2011_retribuzionePosizione: 5000
      }
    },
    calculatedInputs: {
      isManualMode: true,
      dipendentiEquivalentiAnnoRif: 10
    }
  }),
  expectedWizard: {
    limite2016Base: 110000,
    fonteLimite2016: 'RICOSTRUITO',
    totaleVoci2016Ricostruite: 110000,
    limiteArt23Attualizzato: 110000
  },
  expectedFund: {
    limiteAttualizzato: 110000,
    valoreSoggetto: 110000,
    margineResiduo: 0
  }
};

/**
 * Fixture 3: Dirigenza Presente vs Assente
 */
export const fixture03_dirigenzaPresenzaAssenza: CharacterizationFixture<{
  conDirigenza: { limite2016Base: number; limiteArt23Attualizzato: number };
  senzaDirigenza: { limite2016Base: number; limiteArt23Attualizzato: number };
}, {
  conDirigenza: { limiteAttualizzato: number; valoreSoggetto: number };
  senzaDirigenza: { limiteAttualizzato: number; valoreSoggetto: number };
}> = {
  id: 'CASE_03_DIRIGENZA_PRESENZA_ASSENZA',
  name: 'Condizionalità della Dirigenza nel Limite 2016',
  description: 'Nel Wizard la voce storica dirigenza rileva solo con hasDirigenza=true. In fundEngine historicalData.fondoDirigenza2016 concorre alla base storica mentre il corrente dirigenziale richiede hasDirigenza=true',
  category: 'INTENTIONAL_DIVERGENCE',
  divergenceReason: 'In fundEngine il calcolo della base storica somma historicalData.fondoDirigenza2016 se presente nel record storico dell ente, mentre il corrente dirigenza richiede hasDirigenza=true; nel Wizard Step 2 il fondoDirigenza2016 viene filtrato anche a monte della base storica',
  expectedWizard: {
    conDirigenza: { limite2016Base: 140000, limiteArt23Attualizzato: 140000 },
    senzaDirigenza: { limite2016Base: 100000, limiteArt23Attualizzato: 100000 }
  },
  expectedFund: {
    conDirigenza: { limiteAttualizzato: 140000, valoreSoggetto: 140000 },
    senzaDirigenza: { limiteAttualizzato: 140000, valoreSoggetto: 100000 }
  }
};

/**
 * Fixture 4: Adeguamento Art. 33 con FTE Corrente Maggiore di FTE 2018 (+2 FTE)
 * Base 2018 = 100.000 €, FTE 2018 = 10 -> VMP = 10.000 €/FTE.
 * FTE 2026 = 12 -> Delta = +2 -> Incremento = 20.000 €. Limite 2016 base = 100.000 € -> Attualizzato = 120.000 €.
 */
export const fixture04_adeguamentoFteMaggiore: CharacterizationFixture<{
  valoreMedioProCapite2018: number;
  differenzaPersonale: number;
  incrementoProCapiteLimite: number;
  limiteArt23Attualizzato: number;
}, {
  importoAdeguamento: number;
  limiteAttualizzato: number;
}> = {
  id: 'CASE_04_ADEGUAMENTO_FTE_MAGGIORE',
  name: 'Adeguamento Art. 33 con Variazione Personale Positiva (+2 FTE)',
  description: 'FTE 2026 (12) > FTE 2018 (10): incremento pari a 2 x 10.000 = 20.000 €',
  category: 'COMMON',
  wizardInput: {
    fondoPersonaleDipendente2016: 100000,
    fondoDipendenti2018Soggetto: 100000,
    risorsePoEq2018Soggette: 0,
    usaCalcoloManualePersonaleArt23: true,
    manualDipendentiEquivalenti2018: 10,
    manualDipendentiEquivalenti2026: 12
  },
  fundInput: createCharacterizationFundInput({
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoPersonaleNonDirEQ2018_Art23: 100000,
      fondoEQ2018_Art23: 0
    },
    annualData: {
      manualDipendentiEquivalenti2018: 10,
      manualDipendentiEquivalentiAnnoRif: 12
    },
    calculatedInputs: {
      isManualMode: true,
      dipendentiEquivalentiAnnoRif: 12
    }
  }),
  expectedWizard: {
    valoreMedioProCapite2018: 10000,
    differenzaPersonale: 2,
    incrementoProCapiteLimite: 20000,
    limiteArt23Attualizzato: 120000
  },
  expectedFund: {
    importoAdeguamento: 20000,
    limiteAttualizzato: 120000
  }
};

/**
 * Fixture 5: Adeguamento Art. 33 con FTE Corrente Minore di FTE 2018 (-2 FTE)
 * Base 2018 = 100.000 €, FTE 2018 = 10. FTE 2026 = 8.
 * Comportamento congelato dell'app: nessun decremento del limite (Math.max(0, delta) = 0).
 */
export const fixture05_adeguamentoFteMinore: CharacterizationFixture<{
  differenzaPersonale: number;
  incrementoProCapiteLimite: number;
  limiteArt23Attualizzato: number;
}, {
  importoAdeguamento: number;
  limiteAttualizzato: number;
}> = {
  id: 'CASE_05_ADEGUAMENTO_FTE_MINORE',
  name: 'Adeguamento Art. 33 con Variazione Personale Negativa (-2 FTE)',
  description: 'FTE 2026 (8) < FTE 2018 (10): incremento = 0, il limite storico 100.000 € resta invariato',
  category: 'COMMON',
  wizardInput: {
    fondoPersonaleDipendente2016: 100000,
    fondoDipendenti2018Soggetto: 100000,
    risorsePoEq2018Soggette: 0,
    usaCalcoloManualePersonaleArt23: true,
    manualDipendentiEquivalenti2018: 10,
    manualDipendentiEquivalenti2026: 8
  },
  fundInput: createCharacterizationFundInput({
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoPersonaleNonDirEQ2018_Art23: 100000,
      fondoEQ2018_Art23: 0
    },
    annualData: {
      manualDipendentiEquivalenti2018: 10,
      manualDipendentiEquivalentiAnnoRif: 8
    },
    calculatedInputs: {
      isManualMode: true,
      dipendentiEquivalentiAnnoRif: 8
    }
  }),
  expectedWizard: {
    differenzaPersonale: -2,
    incrementoProCapiteLimite: 0,
    limiteArt23Attualizzato: 100000
  },
  expectedFund: {
    importoAdeguamento: 0,
    limiteAttualizzato: 100000
  }
};

/**
 * Fixture 6: FTE Frazionari e Cedolini su 12
 * Dipendente 1: 50% part-time, 12 cedolini = 0.5 FTE
 * Dipendente 2: 100% full-time, 12 cedolini = 1.0 FTE
 * Totale corrente = 1.5 FTE; base 2018 (1 FTE) = 50.000 € -> VMP 2018 = 50.000 €/FTE.
 * Delta FTE = +0.5 -> Adeguamento = 25.000 €. Limite attualizzato = 75.000 €.
 */
export const fixture06_fteFrazionariECedolini: CharacterizationFixture<{
  dipendentiEquivalenti2026: number;
  incrementoProCapiteLimite: number;
  limiteArt23Attualizzato: number;
}, {
  importoAdeguamento: number;
  limiteAttualizzato: number;
}> = {
  id: 'CASE_06_FTE_FRAZIONARI_CEDOLINI',
  name: 'FTE Frazionari con Ponderazione Part-time e Cedolini',
  description: '50% PT per 12 mesi (0.5) + 100% FT per 12 mesi (1.0) = 1.5 FTE; variazione di +0.5 FTE con base 2018 di 50.000 € genera un incremento di 25.000 € portando il limite a 75.000 €',
  category: 'COMMON',
  wizardInput: {
    fondoPersonaleDipendente2016: 50000,
    fondoDipendenti2018Soggetto: 50000,
    risorsePoEq2018Soggette: 0,
    usaCalcoloManualePersonaleArt23: false,
    personale2018Art23: [{ id: '1', partTimePercentage: 100 }],
    personale2026Art23: [
      { id: '1', partTimePercentage: 50, cedoliniEmessi: 12 },
      { id: '2', partTimePercentage: 100, cedoliniEmessi: 12 }
    ]
  },
  fundInput: createCharacterizationFundInput({
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 50000,
      fondoPersonaleNonDirEQ2018_Art23: 50000
    },
    annualData: {
      personale2018PerArt23: [{ id: '1', partTimePercentage: 100 }],
      personaleAnnoRifPerArt23: [
        { id: '1', partTimePercentage: 50, cedoliniEmessi: 12 },
        { id: '2', partTimePercentage: 100, cedoliniEmessi: 12 }
      ]
    },
    calculatedInputs: {
      isManualMode: false,
      dipendentiEquivalentiAnnoRif: 0
    }
  }),
  expectedWizard: {
    dipendentiEquivalenti2026: 1.5,
    incrementoProCapiteLimite: 25000,
    limiteArt23Attualizzato: 75000
  },
  expectedFund: {
    importoAdeguamento: 25000,
    limiteAttualizzato: 75000
  }
};

/**
 * Fixture 7: Arrotondamento con Frazione Periodica
 * Fondo stabile 2018 = 100.000 €, FTE 2018 = 3. FTE 2026 = 4. Delta = 1.
 * Valore teorico = 100.000 / 3 = 33333.333333... -> Arrotondato a 33.333,33 €.
 */
export const fixture07_arrotondamentoPeriodico: CharacterizationFixture<{
  incrementoStabileAumentoPersonale: number;
}, unknown> = {
  id: 'CASE_07_ARROTONDAMENTO_PERIODICO',
  name: 'Arrotondamento Matematico con Frazione Periodica (1/3)',
  description: '100.000 / 3 = 33.333,3333... arrotondato esattamente a 33.333,33 €',
  category: 'WIZARD_ONLY',
  wizardInput: {
    fondoPersonaleDipendente2016: 100000,
    fondoCertificatoParteStabile2018: 100000,
    fondoDipendenti2018Soggetto: 100000,
    risorsePoEq2018Soggette: 0,
    usaCalcoloManualePersonaleArt23: true,
    manualDipendentiEquivalenti2018: 3,
    manualDipendentiEquivalenti2026: 4
  },
  expectedWizard: {
    incrementoStabileAumentoPersonale: 33333.33
  },
  expectedFund: undefined
};

/**
 * Fixture 8: Validazione Input Negativo
 * Un valore negativo per limite2016CertificatoEnte (-5000 €) genera un check di errore bloccante.
 */
export const fixture08_inputNegativoValidazione: CharacterizationFixture<{
  errorCheckId: string;
  severity: string;
}, unknown> = {
  id: 'CASE_08_INPUT_NEGATIVO_VALIDAZIONE',
  name: 'Validazione Input Negativo in Art. 23',
  description: 'Un importo negativo genera un check bloccante con severity error',
  category: 'WIZARD_ONLY',
  wizardInput: {
    limite2016CertificatoEnte: -5000
  },
  expectedWizard: {
    errorCheckId: 'ART23-NEGATIVE-LIMITE2016CERTIFICATOENTE',
    severity: 'error'
  },
  expectedFund: undefined
};

/**
 * Fixture 9: Fallback dello Straordinario Storico sul Corrente (Divergenza Runtime)
 * In fundEngine, se historicalData.fondoStraordinario2016 è undefined, viene usato annualData.fondoLavoroStraordinario (12.000 €) con warning.
 */
export const fixture09_fallbackStraordinarioStorico: CharacterizationFixture<unknown, {
  limiteAttualizzato: number;
  showWarningStraordinario2016: boolean;
}> = {
  id: 'CASE_09_FALLBACK_STRAORDINARIO_STORICO',
  name: 'Fallback Straordinario Storico 2016 su Anno Corrente',
  description: 'In assenza del dato storico 2016, fundEngine usa in fallback lo straordinario corrente emettendo un warning',
  category: 'INTENTIONAL_DIVERGENCE',
  divergenceReason: 'fundEngine implementa un meccanismo di tolleranza storica con warning per le annualità non migrate; Wizard 2026 richiede il dato esplicito',
  fundInput: createCharacterizationFundInput({
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoStraordinario2016: undefined
    },
    annualData: {
      fondoLavoroStraordinario: 12000
    }
  }),
  expectedWizard: undefined,
  expectedFund: {
    limiteAttualizzato: 112000,
    showWarningStraordinario2016: true
  }
};

/**
 * Fixture 10: Incremento Straordinario Già Incluso nel Totale
 * Quando incrementoFondoStraordinario = 3.000 € e fondoLavoroStraordinario = 15.000 € (con storico = 12.000 €),
 * fundEngine rileva che 15.000 >= 12.000 + 3.000 ed evita il doppio conteggio.
 */
export const fixture10_incrementoStraordinarioGiaIncluso: CharacterizationFixture<unknown, {
  straordinarioRilevato: number;
}> = {
  id: 'CASE_10_INCREMENTO_STRAORDINARIO_GIA_INCLUSO',
  name: 'Incremento Straordinario Già Compreso nello Stanziamento Corrente',
  description: 'fundEngine evita il doppio conteggio quando lo stanziamento include già l incremento contrattuale',
  category: 'FUND_ENGINE_ONLY',
  fundInput: createCharacterizationFundInput({
    historicalData: {
      fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoStraordinario2016: 12000
    },
    annualData: {
      fondoLavoroStraordinario: 15000,
      incrementoFondoStraordinario: 3000
    },
    fondi: {
      dipendente: {
        cl_totaleParzialeRisorsePerConfrontoTetto2016: 100000
      }
    }
  }),
  expectedWizard: undefined,
  expectedFund: {
    straordinarioRilevato: 15000
  }
};

/**
 * Fixture 11: Override Manuale Totale Soggetto FAD (Divergenza Runtime)
 * Se cl_totaleParzialeRisorsePerConfrontoTetto2016 è valorizzato (es. 90.000 €), bypassa la somma analitica delle voci dipendenti.
 */
export const fixture11_overrideManualeTotaleSoggetto: CharacterizationFixture<unknown, {
  valoreSoggetto: number;
}> = {
  id: 'CASE_11_OVERRIDE_MANUALE_TOTALE_SOGGETTO',
  name: 'Override Manuale Totale Risorse Soggette Dipendenti',
  description: 'Il campo cl_totaleParzialeRisorsePerConfrontoTetto2016 sovrascrive il ricalcolo automatico del FAD',
  category: 'INTENTIONAL_DIVERGENCE',
  divergenceReason: 'Campo di override storico presente nella Costituzione Fondo per forzature asseverate',
  fundInput: createCharacterizationFundInput({
    historicalData: {
      manualPersonalFundLimit2016: 100000
    },
    fondi: {
      dipendente: {
        st_art79c1_art67c1_unicoImporto2017: 120000,
        cl_totaleParzialeRisorsePerConfrontoTetto2016: 90000
      }
    }
  }),
  expectedWizard: undefined,
  expectedFund: {
    valoreSoggetto: 90000
  }
};

/**
 * Fixture 12: Computo Figurativo Art. 60 CCNL 2026
 * Decurtazione fondo stabile per indennità comparto (1.500 €) riduce il fondo costituito ma viene riaggiunta figurativamente al limite.
 */
export const fixture12_computoFigurativoArt60: CharacterizationFixture<unknown, {
  fondoCostituitoTotale: number;
  computoFigurativoArt60: number;
  risorseRilevantiArt23: number;
}> = {
  id: 'CASE_12_COMPUTO_FIGURATIVO_ART60',
  name: 'Computo Figurativo Decurtazione Indennità di Comparto (Art. 60)',
  description: 'Il fondo si riduce di 1.500 € ma a fini del limite 2016 la voce viene riaggiunta figurativamente',
  category: 'FUND_ENGINE_ONLY',
  fundInput: createCharacterizationFundInput({
    historicalData: {
      manualPersonalFundLimit2016: 100000
    },
    fondi: {
      dipendente: {
        st_art79c1_art67c1_unicoImporto2017: 100000,
        st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 1500
      }
    }
  }),
  expectedWizard: undefined,
  expectedFund: {
    fondoCostituitoTotale: 98500,
    computoFigurativoArt60: 1500,
    risorseRilevantiArt23: 100000
  }
};

/**
 * Fixture 13: Risorse Escluse dal Limite
 * Voci escluse (incremento 0.14% = 2.000 €, incremento DL 25 = 3.000 €, incentivi tecnici = 5.000 €).
 * In fundEngine attuale:
 * - risorseEscluseArt23 = 10.000 € (2.000 + 3.000 + 5.000)
 * - valoreSoggetto = 103.000 € (100.000 base + 3.000 DL25 perché marcato isRelevantToArt23Limit in fundFieldDefinitions)
 */
export const fixture13_risorseEscluseDalLimite: CharacterizationFixture<unknown, {
  risorseEscluseArt23: number;
  risorseRilevantiArt23: number;
}> = {
  id: 'CASE_13_RISORSE_ESCLUSE_DAL_LIMITE',
  name: 'Esclusione Voci Contrattuali e di Legge dal Limite 2016',
  description: '0.14% CCNL 2026, DL 25/2025 (con simulatore attivo) e incentivi tecnici incrementano le risorse escluse',
  category: 'FUND_ENGINE_ONLY',
  fundInput: createCharacterizationFundInput({
    historicalData: {
      manualPersonalFundLimit2016: 100000
    },
    annualData: {
      simulatoreRisultati: {
        fase5_incrementoNettoEffettivoFondo: 5000
      }
    },
    fondi: {
      dipendente: {
        st_art79c1_art67c1_unicoImporto2017: 100000,
        st_art58c1_CCNL2026_incremento014_MS2021: 2000,
        st_incrementoDL25_2025: 3000,
        vn_art15c1k_art67c3c_incentiviTecniciCondoni: 5000
      }
    }
  }),
  expectedWizard: undefined,
  expectedFund: {
    risorseEscluseArt23: 10000,
    risorseRilevantiArt23: 103000
  }
};

/**
 * Fixture 14: D.L. 19/2026 Segretario nei Piccoli Comuni (Solo Corrente vs Doppia Neutralizzazione)
 * Comune con 2.500 abitanti, retribuzione segretario 11.000 € (di cui 11.000 € esclusa D.L. 19).
 * Storico 2016 = 166.000 € (di cui 11.000 € segretario).
 */
export const fixture14_derogaDl19Segretario: CharacterizationFixture<unknown, {
  soloCorrente: { limiteAttualizzato: number; segretarioRilevante: number; segretarioEscluso: number };
  doppiaNeutralizzazione: { limiteAttualizzato: number; segretarioRilevante: number; segretarioEscluso: number };
}> = {
  id: 'CASE_14_DEROGA_DL19_SEGRETARIO',
  name: 'Deroga D.L. 19/2026 Segretario nei Comuni fino a 3.000 Abitanti',
  description: 'Modalità solo_corrente mantiene il limite a 166.000 €; doppia_neutralizzazione riduce il limite storico a 155.000 €',
  category: 'FUND_ENGINE_ONLY',
  expectedWizard: undefined,
  expectedFund: {
    soloCorrente: {
      limiteAttualizzato: 166000,
      segretarioRilevante: 0,
      segretarioEscluso: 11000
    },
    doppiaNeutralizzazione: {
      limiteAttualizzato: 155000,
      segretarioRilevante: 0,
      segretarioEscluso: 11000
    }
  }
};

/**
 * Fixture 15: Soglie di Tolleranza Delta (<= 0.01 € vs > 0.01 €)
 */
export const fixture15_soglieDeltaTolleranza: CharacterizationFixture<unknown, {
  esattamenteUnCentesimo: { isCompliant: boolean; isSforamento: boolean; delta: number };
  sottoUnCentesimo: { isCompliant: boolean; isSforamento: boolean; delta: number };
  sopraUnCentesimo: { isCompliant: boolean; isSforamento: boolean; delta: number; alertId: string };
}> = {
  id: 'CASE_15_SOGLIE_DELTA_TOLLERANZA',
  name: 'Verifica Soglie di Tolleranza Superamento (<= 0.01 €)',
  description: 'Delta <= 0.01 € è conforme; delta > 0.01 € genera errore di superamento',
  category: 'FUND_ENGINE_ONLY',
  expectedWizard: undefined,
  expectedFund: {
    esattamenteUnCentesimo: {
      isCompliant: true,
      isSforamento: false,
      delta: -0.01
    },
    sottoUnCentesimo: {
      isCompliant: true,
      isSforamento: false,
      delta: -0.01
    },
    sopraUnCentesimo: {
      isCompliant: false,
      isSforamento: true,
      delta: -0.02,
      alertId: 'alert_art23c2'
    }
  }
};
