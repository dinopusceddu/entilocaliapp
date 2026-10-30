import type { CalculationResult } from './calculationResult';
import { formatCurrency } from '../utils/formatters';

export type Art23DeterminationStatus = 'VALID' | 'INVALID' | 'UNDETERMINED';
export type Art23VerificationStatus = Art23DeterminationStatus | 'STALE';

/** Read-only qualification of the existing comparison; never another economic source. */
export function presentArt23Verification(result: Pick<CalculationResult, 'compliance'> | null | undefined) {
  const check = result?.compliance?.art23c2;
  const status = check?.status ?? 'UNDETERMINED';
  const ready = check?.comparisonReady === true && (status === 'VALID' || status === 'INVALID');
  const isCompliant = ready && status === 'VALID' && check?.isCompliant === true;
  const isOverLimit = ready && status === 'INVALID' && (check?.delta ?? 0) < -0.01;
  return { status, ready, isCompliant, isOverLimit,
    issues: check?.missingPrerequisites ?? [],
    guidance: status === 'STALE' ? 'Ricalcolare la bozza modificata prima di attestare la conformità.'
      : !ready ? 'Completare e qualificare i prerequisiti prima di attestare la conformità.' : '',
    label: status === 'STALE' ? 'RISULTATO OBSOLETO - RICALCOLARE' : isCompliant ? 'CONFORME' : isOverLimit ? 'NON CONFORME' : status === 'INVALID' ? 'VERIFICA NON VALIDA' : 'NON DETERMINABILE',
    formattedLimit: ready ? formatCurrency(check!.limite) : 'Non determinabile',
    formattedMargin: ready ? formatCurrency(check!.delta) : 'Non determinabile',
  };
}

/** In-memory invalidation only: retain the previous economics, revoke its certification. */
export function markArt23ResultStale(result: CalculationResult | undefined): CalculationResult | undefined {
  if (!result?.compliance?.art23c2) return undefined;
  return { ...result, compliance: { ...result.compliance,
    checks: (result.compliance.checks ?? []).map(check => check.id === 'limite_art23_c2'
      ? { ...check, isCompliant: false, gravita: 'warning', valoreAttuale: 'RISULTATO OBSOLETO - RICALCOLARE',
          messaggio: 'Ricalcolare la bozza modificata prima della verifica.' } : check),
    art23c2: { ...result.compliance.art23c2, status: 'STALE', comparisonReady: false, isCompliant: false },
    ...(result.compliance.art23Compliance ? { art23Compliance: { ...result.compliance.art23Compliance,
      status: 'STALE', isSforamento: false, margineResiduo: undefined, margine: undefined, superamento: undefined } } : {}),
  }, alerts: (result.alerts ?? []).filter(alert => alert.id !== 'alert_art23c2') };
}
