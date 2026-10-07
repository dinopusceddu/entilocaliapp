import type { CalculationResult, NormalizedInput, FundResult } from '../../domain';
import type { MonetaryIssue } from '../../domain/monetaryBoundary';
import { resolveDirigenzaArt23Subject, reconcileDirigenzaArt23Cache } from './dirigenzaArt23';

/** Empty verified subtotals, never a definitive zero; no corrupt raw value in output. */
export function monetaryInvalidResult(input: NormalizedInput, issues: readonly MonetaryIssue[]): CalculationResult {
  const fund = (label: string): FundResult => ({ label, summary: { totaleStabile: 0, totaleVariabile: 0, totaleFondo: 0 } });
  const dirigenza = resolveDirigenzaArt23Subject(input.fondi.dirigenza, input.annualData.hasDirigenza);
  return {
    metadata: { annoRiferimento: input.annualData?.annoRiferimento, denominazioneEnte: input.annualData?.denominazioneEnte, timestamp: new Date().toISOString() },
    inputs: { hasDirigenza: !!input.annualData?.hasDirigenza, isEnteInCondizioniSpeciali: false, fteAnnoRiferimento: 0 },
    fondi: { dipendente: fund('Fondo dipendenti non disponibile'), eq: fund('EQ non disponibile'), segretario: fund('Segretario non disponibile'), dirigenza: fund('Dirigenza non disponibile') },
    canonicalFund: { status: 'INVALID', stableTotal: null, variableTotal: null, total: null, art23Subject: null, art23Excluded: null,
      verifiedStableTotal: 0, verifiedVariableTotal: 0, verifiedTotal: 0, verifiedArt23Subject: 0, verifiedArt23Excluded: 0,
      entries: [], warnings: issues.map(i => `${i.code}: ${i.path}`), missingPrerequisites: issues.map(i => i.code) },
    compliance: { dirigenzaArt23: { ...dirigenza, reconciliation: reconcileDirigenzaArt23Cache(dirigenza, input.fondi.dirigenza.lim_totaleParzialeRisorseConfrontoTetto2016) }, art23c2: { limite: 0, valoreSoggetto: 0, delta: 0, isCompliant: false }, checks: issues.map((i, n) => ({
      id: `${i.code}_${n}`, descrizione: 'Validazione monetaria', isCompliant: false, messaggio: `${i.path}: ${i.message}`,
      riferimentoNormativo: 'Vincolo tecnico di rappresentazione monetaria', gravita: 'error', relatedPage: 'datiGenerali' })) },
    totals: { stabile: 0, variabile: 0, totaleFondo: 0 },
    alerts: issues.map(i => ({ id: i.code, message: `${i.path}: ${i.message}`, severity: 'error' })), monetaryIssues: issues,
  };
}
