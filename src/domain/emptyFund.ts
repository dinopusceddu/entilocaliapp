import { EmployeeCategory } from './enums';
import type {
  AnnualData, HistoricalData, FundData, SimulatoreIncrementoInput,
  FondoAccessorioDipendenteData, FondoElevateQualificazioniData,
  FondoSegretarioComunaleData, FondoDirigenzaData, DistribuzioneRisorseData,
} from './types';

/** Missing historical evidence is deliberately not a certified zero. */
export const createEmptyHistoricalData = (): HistoricalData => ({});
export const createEmptySimulatoreInput = (): SimulatoreIncrementoInput => ({});
export const createEmptyFondoAccessorioDipendenteData = (): FondoAccessorioDipendenteData => ({});
export const createEmptyFondoElevateQualificazioniData = (): FondoElevateQualificazioniData => ({});
export const createEmptyFondoSegretarioComunaleData = (): FondoSegretarioComunaleData => ({});
// Own resource properties are determination evidence for CALC-04. Never invent them.
export const createEmptyFondoDirigenzaData = (): FondoDirigenzaData => ({});
export const createEmptyDistribuzioneRisorseData = (): DistribuzioneRisorseData => ({
  criteri_isConsuntivoMode: false,
});

export const createEmptyIvcData = () => ({
  mode: 'aggregated' as const,
  aggregatedCounts: {},
  analyticEmployees: [],
  totalReduction: 0, // Derived from the empty personnel collection; no demo personnel.
});

export const createEmptyAnnualData = (
  year: number = new Date().getFullYear(),
  entityName = '',
): AnnualData => ({
  annoRiferimento: year,
  denominazioneEnte: entityName,
  isDistributionMode: false,
  personaleServizioAttuale: Object.values(EmployeeCategory).map(category => ({ category, count: undefined })),
  proventiSpecifici: [],
  personale2018PerArt23: [],
  personaleAnnoRifPerArt23: [],
  simulatoreInput: createEmptySimulatoreInput(),
  // The conglobation model is evidence for Art.60: it starts missing, not zero.
  ccnl2024: {},
});

/** Every call owns its mutable sub-objects. No previous entity/year is an input. */
export const createEmptyFundData = (
  year: number = new Date().getFullYear(),
  entityName = '',
): FundData => ({
  historicalData: createEmptyHistoricalData(),
  annualData: createEmptyAnnualData(year, entityName),
  fondoAccessorioDipendenteData: createEmptyFondoAccessorioDipendenteData(),
  fondoElevateQualificazioniData: createEmptyFondoElevateQualificazioniData(),
  fondoSegretarioComunaleData: createEmptyFondoSegretarioComunaleData(),
  fondoDirigenzaData: createEmptyFondoDirigenzaData(),
  distribuzioneRisorseData: createEmptyDistribuzioneRisorseData(),
  personaleServizio: { dettagli: [], isManualMode: false },
});
