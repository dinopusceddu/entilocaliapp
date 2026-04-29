import {
  NormalizedInput,
  ReductionResult
} from '../../domain';
import FinancialMath from '../../utils/financialMath';

/**
 * Calcola tutte le decurtazioni applicabili ai fondi.
 */
export const calculateAllReductions = (
  input: NormalizedInput
): ReductionResult => {
  const { fondi } = input;
  const fad = fondi.dipendente || {};
  const eq = fondi.eq || {};
  const dir = fondi.dirigenza || {};

  // 1. Decurtazioni FAD (Fondo Accessorio Dipendente)
  const taglioDL78_2010 = Math.abs(fad.st_taglioFondoDL78_2010 || 0);
  const riduzioniPersonaleATA_PO_Esternalizzazioni = Math.abs(fad.st_riduzioniPersonaleATA_PO_Esternalizzazioni || 0);
  const decurtazionePO_AP = Math.abs(fad.st_art67c1_decurtazionePO_AP_EntiDirigenza || 0);
  const riduzionePerIncrementoEQ = Math.abs(fad.st_riduzionePerIncrementoEQ || 0);
  const riduzioneFondoStraordinario = Math.abs(fad.st_riduzioneFondoStraordinario || 0);
  const decurtazioneIndennitaComparto2026 = Math.abs(fad.st_art60c2_CCNL2026_decurtazioneIndennitaComparto || 0);
  const decurtazioneLimiteArt23 = Math.abs(fad.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016 || 0);
  const misureMancatoRispettoVincoliFad = Math.abs(fad.fin_art4_dl16_misureMancatoRispettoVincoli || 0);

  const totalFadReductions = FinancialMath.sumAll(
    taglioDL78_2010,
    riduzioniPersonaleATA_PO_Esternalizzazioni,
    decurtazionePO_AP,
    riduzionePerIncrementoEQ,
    riduzioneFondoStraordinario,
    decurtazioneIndennitaComparto2026,
    decurtazioneLimiteArt23,
    misureMancatoRispettoVincoliFad
  );

  // 2. Decurtazioni EQ
  const adeguamentoTetto2016Eq = Math.abs(eq.fin_art23c2_adeguamentoTetto2016 || 0);
  const totalEqReductions = adeguamentoTetto2016Eq;

  // 3. Decurtazioni Dirigenza
  const misureMancatoRispettoVincoliDir = Math.abs(dir.lim_art4_DL16_2014_misureMancatoRispettoVincoli || 0);
  const totalDirigenzaReductions = misureMancatoRispettoVincoliDir;

  return {
    totalFadReductions,
    totalEqReductions,
    totalDirigenzaReductions,
    details: {
      fad: {
        taglioDL78_2010,
        riduzioniPersonaleATA_PO_Esternalizzazioni,
        decurtazionePO_AP,
        riduzionePerIncrementoEQ,
        riduzioneFondoStraordinario,
        decurtazioneIndennitaComparto2026,
        decurtazioneLimiteArt23,
        misureMancatoRispettoVincoli: misureMancatoRispettoVincoliFad
      },
      eq: {
        adeguamentoTetto2016: adeguamentoTetto2016Eq
      },
      dirigenza: {
        misureMancatoRispettoVincoli: misureMancatoRispettoVincoliDir
      }
    }
  };
};
