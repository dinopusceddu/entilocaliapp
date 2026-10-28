import { INITIAL_ANNUAL_DATA, INITIAL_HISTORICAL_DATA } from '../../../test/fixtures/legacyDemoFund';
import { initialWizard2026DraftState } from '../initialState';
import { calculateDl25Increment } from '../../../logic/wizard2026/dl25Increment';
import type { FundData } from '../../../domain/types';

export const dl25Base = { stipendiTabellari2023NonDirigenti: 300000, fondoStabile2025Certificato: 100000, budgetEq2025: 20000 };
export const dl25Finance = { simSpesaPersonaleConsuntivo2023: 0, simMediaEntrateCorrenti2021_2023: 1000000, simTettoSpesaPersonaleL296_06: 100000, simPercentualeOneriIncremento: 27.4 };
export function dl25Draft(year = 2026, prior = 4000, delta = 15000) {
  const d = structuredClone(initialWizard2026DraftState);
  Object.assign(d.ente, { entityType: 'COMUNE', annoRiferimento: year, isPrimaFasciaDl34: true, isEquilibrioPluriennaleAsseverato: true });
  Object.assign(d.dl25, dl25Base, { priorCumulativeApplied: prior, priorStockProvenance: `Costituzione Fondo ${year - 1}`,
    currentYearDelta: delta, regimeDate: `${year}-08-08`, popolazioneEnte: 5000, simulationInput: { ...dl25Finance } });
  d.dl25.result = calculateDl25Increment({ ...d.dl25, entityType: 'COMUNE' });
  return d;
}
export function dl25Fund(year = 2026): FundData {
  return structuredClone({ historicalData: INITIAL_HISTORICAL_DATA,
    annualData: { ...INITIAL_ANNUAL_DATA, annoRiferimento: year, numeroAbitanti: 5000, simulatoreInput: dl25Finance,
      entityClassification: { entityType: 'COMUNE' } }, fondoAccessorioDipendenteData: {}, fondoElevateQualificazioniData: {},
    fondoDirigenzaData: {}, fondoSegretarioComunaleData: {}, distribuzioneRisorseData: {}, personaleServizio: { dettagli: [] },
    metadata: { snapshotStatus: 'OPEN' } }) as FundData;
}
