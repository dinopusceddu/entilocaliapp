import { cor01Fund } from './cor01Fund';
import { TipologiaEnte } from '../../domain';
export const cor03Stock = { version: 1 as const, stipendiTabellari2023NonDirigenti: 300000,
  fondoStabile2025Certificato: 100000, budgetEq2025: 20000,
  priorCumulativeApplied: 4000, priorStockProvenance: 'Atto sintetico Fondo 2025', currentYearDelta: 3000 };
/** Independent oracle: base 1000 + stock (4000 + 3000), no other increments. Ceiling is 24000. */
export function cor03Fund() {
  const f = cor01Fund();
  Object.assign(f.annualData, { tipologiaEnte: TipologiaEnte.COMUNE, entityClassification: { entityType: 'COMUNE' },
    manualDipendentiEquivalenti2018: 10, manualDipendentiEquivalentiAnnoRif: 10, isArt23FteManualMode: true,
    fondoLavoroStraordinario: 0, incrementoFondoStraordinario: 0, riduzioneFondoParteStabile: false,
    simulatoreRisultati: { state: 'VALID', fase5_incrementoNettoEffettivoFondo: 3000 },
    dl25: { ...cor03Stock } });
  Object.assign(f.historicalData, { fondoPersonaleNonDirEQ2018_Art23: 100000, fondoEQ2018_Art23: 0 });
  f.fondoAccessorioDipendenteData = { st_art79c1c_incrementoStabileConsistenzaPers: 1000,
    st_incrementoDL25_2025: 7000, st_art58c1_CCNL2026_incremento014_MS2021: 0,
    vn_art58c2_CCNL2026_incremento022_MS2021: 0, st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0 };
  f.fondoElevateQualificazioniData = {}; f.fondoSegretarioComunaleData = {}; f.fondoDirigenzaData = {};
  return f;
}
export const cor03Scenarios = [
  { id: 1, name: 'manual amount without structured stock despite positive numeric maximum', status: 'UNDETERMINED', make: () => {
    const f = cor03Fund(); delete f.annualData.dl25;
    f.annualData.simulatoreRisultati = { fase5_incrementoNettoEffettivoFondo: 30000 } as any; return f;
  } },
  { id: 2, name: 'valid structured stock', status: 'VALID', make: cor03Fund },
  { id: 3, name: 'explicit consistent zero', status: 'VALID', make: () => {
    const f = cor03Fund(); f.fondoAccessorioDipendenteData.st_incrementoDL25_2025 = 0;
    Object.assign(f.annualData.dl25!, { priorCumulativeApplied: 0, currentYearDelta: 0 }); return f;
  } },
  { id: 4, name: 'canonical and alias together', status: 'VALID', make: () => {
    const f = cor03Fund(); f.fondoAccessorioDipendenteData.st_incrementoDecretoPA = 9000; return f;
  } },
  { id: 5, name: 'stock exceeds existing ceiling', status: 'INVALID', make: () => {
    const f = cor03Fund(); f.annualData.dl25!.currentYearDelta = 25000; return f;
  } },
  { id: 6, name: 'CLOSED qualified stock', status: 'VALID', make: () => {
    const f = cor03Fund(); f.metadata!.snapshotStatus = 'CLOSED' as any; return f;
  } },
  { id: 7, name: 'DL25 with figurative Art60', status: 'VALID', make: () => {
    const f = cor03Fund(); f.fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto = 200; return f;
  } },
] as const;
