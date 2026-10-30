import type { CalculationResult } from './calculationResult';
import { formatCurrency } from '../utils/formatters';

export type Art23VerificationStatus = 'VALID' | 'INVALID' | 'UNDETERMINED';

/** Read-only qualification of the existing comparison; never another economic source. */
export function presentArt23Verification(result: Pick<CalculationResult, 'compliance'> | null | undefined) {
  const check = result?.compliance?.art23c2;
  const status = check?.status ?? 'UNDETERMINED';
  const ready = check?.comparisonReady === true && (status === 'VALID' || status === 'INVALID');
  const isCompliant = ready && status === 'VALID' && check?.isCompliant === true;
  const isOverLimit = ready && status === 'INVALID' && (check?.delta ?? 0) < -0.01;
  return { status, ready, isCompliant, isOverLimit,
    issues: check?.missingPrerequisites ?? [],
    label: isCompliant ? 'CONFORME' : isOverLimit ? 'NON CONFORME' : status === 'INVALID' ? 'VERIFICA NON VALIDA' : 'NON DETERMINABILE',
    formattedLimit: ready ? formatCurrency(check!.limite) : 'Non determinabile',
    formattedMargin: ready ? formatCurrency(check!.delta) : 'Non determinabile',
  };
}
