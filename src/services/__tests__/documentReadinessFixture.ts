import type { CalculationResult, ComplianceCheck, FundLedgerEntry, User } from '../../domain';
import { UserRole } from '../../domain/enums';
import { deriveCanonicalFundResult } from '../../logic/calculation/canonicalFundLedger';

export const documentUser: User = { id: 'local', name: 'Responsabile', email: 'local@example.invalid', role: UserRole.ADMIN };
export function documentResult(status: 'VALID' | 'UNDETERMINED' | 'INVALID' | 'MISSING' = 'VALID', amount = 100): CalculationResult {
  const entry: FundLedgerEntry = { id: 'RIA', amount, component: 'STABLE', operation: 'ADDITION',
    competenceYear: 2026, source: 'MANUAL', art23Treatment: 'EXCLUDED', status: status === 'MISSING' ? 'VALID' : status };
  return {
    metadata: { annoRiferimento: 2026, denominazioneEnte: 'Comune Policy' },
    inputs: { tipologiaEnte: 'Comune' },
    fondi: {
      dipendente: { label: 'FAD', summary: { totaleFondo: 99999 }, constitution: { sections: {} } },
      eq: { label: 'EQ', summary: { totaleFondo: 77 } },
      segretario: { label: 'Segretario', summary: { totaleFondo: 88 } },
      dirigenza: { label: 'Dirigenza', summary: { totaleFondo: 0 } },
    },
    compliance: { art23c2: { limite: 50000, valoreSoggetto: 100, delta: 0, isCompliant: true } },
    canonicalFund: status === 'MISSING' ? undefined : deriveCanonicalFundResult([entry]),
  } as unknown as CalculationResult;
}
export function documentCheck(gravita: 'error' | 'warning' = 'error'): ComplianceCheck {
  return { id: 'CHECK', descrizione: 'Verifica pendente', messaggio: 'Risolvere la verifica della costituzione',
    isCompliant: false, riferimentoNormativo: 'Controllo esistente', gravita, relatedPage: 'fondoDipendenti' };
}
