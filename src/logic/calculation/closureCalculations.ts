import { CalculationResult, YearClosureCarryForward } from '../../domain';
import FinancialMath from '../../utils/financialMath';

/**
 * Calcola il riporto (carry-forward) autorizzato per la chiusura dell'esercizio.
 * Secondo i vincoli AG-123:
 * - Solo fondo dipendenti (FAD/Dipendente)
 * - Solo quota stabile non utilizzata
 * - Restituisce info informative per gli altri fondi
 */
export const calculateYearClosureCarryForward = (
  result: CalculationResult,
  distribuzioneRisorseData?: any // Tipo allargato o importato, per estrarre i risparmi
): YearClosureCarryForward => {
  // AG-124B: Il riporto FAD deriva ESCLUSIVAMENTE dalla somma delle voci "RISPARMI" in fase di distribuzione
  let leftoverFad = 0;

  if (distribuzioneRisorseData) {
    const fields = Object.keys(distribuzioneRisorseData);
    for (const key of fields) {
      if (key.startsWith('p_') || key.startsWith('u_')) {
        const detail = distribuzioneRisorseData[key];
        if (detail && typeof detail === 'object' && typeof detail.risparmi === 'number') {
          leftoverFad = FinancialMath.addExact(leftoverFad, detail.risparmi);
        }
      }
    }
  }
  // Calcolo informativo residui altri fondi (se disponibili)
  const calculateFundResidual = (fund: any) => {
    if (!fund || !fund.summary) return 0;
    // Calcoliamo sezioni se disponibili o summary
    const constTot = fund.summary.totaleStabile || 0;
    // Nota: per EQ/DIR/SEG non abbiamo sempre sezioni utilization distinte in DTO per stabile/var
    // ma possiamo calcolare il totale sezioni utilization se presenti.
    let utilTot = 0;
    if (fund.utilization?.sections) {
        utilTot = Object.values(fund.utilization.sections).reduce((acc: number, sec: any) => acc + (sec.total || 0), 0);
    }
    return Math.max(0, FinancialMath.subtractExact(constTot, utilTot));
  };

  return {
    year: result.metadata.annoRiferimento,
    leftoverFad,
    actualLeftoversInfo: {
      fad: leftoverFad,
      eq: calculateFundResidual(result.fondi.eq),
      dir: calculateFundResidual(result.fondi.dirigenza),
      seg: calculateFundResidual(result.fondi.segretario)
    }
  };
};
