import { initialWizard2026DraftState } from '../../features/wizard2026/initialState';
import { calculateCcnl2026Increments } from '../../logic/wizard2026/ccnl2026Increments';
import { createEmptyFundData } from '../../domain/emptyFund';
import { resolvedZeroState } from './ccnlRecovery';
import { AnnualSnapshotStatus, TipologiaEnte } from '../../domain';

/** Synthetic amounts with independent arithmetic expectations in COR-01 tests. */
export function cor01Fund(year = 2026, closed = false, seed = 0) {
  const contextOffset = seed + (year - 2026) * -1000;
  const fund = createEmptyFundData(year, 'Ente COR-01 sintetico');
  fund.metadata = { snapshotStatus: closed ? AnnualSnapshotStatus.CLOSED : AnnualSnapshotStatus.OPEN };
  fund.historicalData = { manualPersonalFundLimit2016: 100000, fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000, fondoStraordinario2016: 1000 };
  Object.assign(fund.annualData, { annoRiferimento: year, hasDirigenza: false, tipologiaEnte: TipologiaEnte.ALTRO, altroTipologiaEnte: 'Ente sintetico COR-01',
    art33ManualDecision: 'DO_NOT_APPLY', fondoLavoroStraordinario: 1000,
    incrementoFondoStraordinario: 500, riduzioneFondoParteStabile: true,
    pnrrExerciseDecision: 'NOT_EXERCISED',
    ccnl2024: { monteSalari2021: 1000000, fondoPersonale2025: 80000, fondoEQ2025: 20000,
      optionalIncreaseVariableFrom2026Percentage: 0.22 } });
  if (year === 2026) fund.annualData.ccnlRecovery = resolvedZeroState();
  fund.fondoAccessorioDipendenteData = { st_art79c1c_incrementoStabileConsistenzaPers: 10000 + contextOffset,
    st_riduzionePerIncrementoEQ: 17, st_art67c1_decurtazionePO_AP_EntiDirigenza: 23,
    st_riduzioneFondoStraordinario: 777, vs_art79c2c_risorseScelteOrganizzative: 200,
    st_art58c1_CCNL2026_incremento014_MS2021: 0, vn_art58c2_CCNL2026_incremento022_MS2021: 0,
    st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0 };
  fund.fondoElevateQualificazioniData = { ris_fondoPO2017: 5000 + contextOffset / 10,
    ris_incrementoConRiduzioneFondoDipendenti: 1000, va_incremento022_ms2021_eq: 70 };
  fund.fondoSegretarioComunaleData = { st_art3c6_CCNL2011_retribuzionePosizione: 1000 + contextOffset / 20,
    st_art58c1_CCNL2024_differenzialeAumento: 100, va_art61c2_CCNL2024_retribuzioneRisultato10: 200,
    fin_percentualeCoperturaPostoSegretario: 50, fin_totaleRisorseRilevantiLimite: 999 };
  return fund;
}

/** A transfer with an independently known 2200 annual split: Fondo 1760, EQ 440. */
export function cor01TransferDraft() {
  const draft = structuredClone(initialWizard2026DraftState);
  draft.ente.hasDirigenza = false;
  draft.art23.limite2016CertificatoEnte = 100000;
  draft.ccnl2026.monteSalari2021 = 1000000;
  draft.ccnl2026.applicaIncremento022 = true;
  draft.ccnl2026.percentualeApplicata022 = 0.22;
  draft.ccnl2026.result = calculateCcnl2026Increments({ annoRiferimento: 2026, monteSalari2021: 1000000,
    incremento022Anno: 2200, fondoRisorseDecentrate2024: 80000, risorseEQ2024: 20000 });
  return draft;
}
