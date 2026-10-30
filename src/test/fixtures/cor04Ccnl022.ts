import { cor01Fund, cor01TransferDraft } from './cor01Fund';
import { calculateCcnl2026Increments } from '../../logic/wizard2026/ccnl2026Increments';
export function cor04Fund(fondo = 1760, eq = 440, year = 2026) {
  const f = cor01Fund(year);
  Object.assign(f.annualData, { incrementoFondoStraordinario: 0, fondoLavoroStraordinario: 0, riduzioneFondoParteStabile: false });
  f.fondoAccessorioDipendenteData = { st_art79c1c_incrementoStabileConsistenzaPers: 1000,
    st_art58c1_CCNL2026_incremento014_MS2021: 0, vn_art58c2_CCNL2026_incremento022_MS2021: fondo,
    st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0 };
  f.fondoElevateQualificazioniData = { ris_fondoPO2017: 500, va_incremento022_ms2021_eq: eq };
  f.fondoSegretarioComunaleData = {}; f.fondoDirigenzaData = {};
  return f;
}
export function cor04Draft(amount: number | undefined = 2200, year = 2026) {
  const d = cor01TransferDraft(); d.ente.annoRiferimento = year;
  Object.assign(d.ccnl2026, { incremento022Anno: amount, fondoRisorseDecentrate2024: 80000, risorseEQ2024: 20000,
    monteSalari2021Consolidato2026: year > 2026 ? 1000000 : undefined });
  d.ccnl2026.result = calculateCcnl2026Increments({ ...d.ccnl2026, annoRiferimento: year });
  return d;
}
