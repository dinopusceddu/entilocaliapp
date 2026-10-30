import { cor01Fund } from './cor01Fund';
import { TipologiaEnte } from '../../domain';
export function cor02Fund() { return cor01Fund(); }
function zeroCurrent() {
  const fund = cor02Fund(); fund.fondoAccessorioDipendenteData = {
    st_art58c1_CCNL2026_incremento014_MS2021: 0, vn_art58c2_CCNL2026_incremento022_MS2021: 0,
    st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0 }; fund.fondoElevateQualificazioniData = {};
  fund.fondoSegretarioComunaleData = {}; fund.annualData.fondoLavoroStraordinario = 0;
  fund.annualData.incrementoFondoStraordinario = 0; return fund;
}
export const cor02Scenarios = [
  { id: 1, name: 'all historical 2016 inputs missing', status: 'UNDETERMINED', make: () => {
    const f = zeroCurrent(); f.historicalData = {}; return f;
  } },
  { id: 2, name: 'certified explicit zero with zero current consumption', status: 'VALID', make: () => {
    const f = zeroCurrent(); f.historicalData = { manualPersonalFundLimit2016: 0 }; return f;
  } },
  { id: 3, name: 'positive certified ceiling', status: 'VALID', make: cor02Fund },
  { id: 4, name: 'analytic reconstruction without required employee fund', status: 'UNDETERMINED', make: () => {
    const f = cor02Fund(); f.historicalData = { fondoElevateQualificazioni2016: 0, fondoDirigenza2016: 0,
      risorseSegretarioComunale2016: 0, fondoStraordinario2016: 0 }; return f;
  } },
  { id: 5, name: 'complete analytic reconstruction with explicit zero components', status: 'VALID', make: () => {
    const f = cor02Fund(); f.historicalData = { fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
      fondoElevateQualificazioni2016: 0, fondoDirigenza2016: 0, risorseSegretarioComunale2016: 0,
      fondoStraordinario2016: 0 }; return f;
  } },
  { id: 6, name: 'Art33 adjustment missing current FTE', status: 'UNDETERMINED', make: () => {
    const f = cor02Fund(); f.annualData.tipologiaEnte = TipologiaEnte.COMUNE;
    f.historicalData.fondoPersonaleNonDirEQ2018_Art23 = 100000; f.historicalData.fondoEQ2018_Art23 = 0;
    f.annualData.manualDipendentiEquivalenti2018 = 10; f.annualData.isArt23FteManualMode = true;
    return f;
  } },
  { id: 7, name: 'complete history with undetermined Dirigenza applicability', status: 'UNDETERMINED', make: () => {
    const f = cor02Fund(); delete f.annualData.hasDirigenza; return f;
  } },
] as const;
