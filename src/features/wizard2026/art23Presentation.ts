import { calculateHistoricalLimit2016Core } from '../../logic/shared/historicalLimit2016Core';
import { formatCurrency } from '../../utils/formatters';
import { Wizard2026Art23StepState } from './types';

/** Availability only: never changes the canonical Art. 23 calculation. */
export function presentWizardArt23(state: Wizard2026Art23StepState, hasDirigenza?: boolean) {
  // Current-year applicability cannot qualify missing historical components.
  void hasDirigenza;
  const history = calculateHistoricalLimit2016Core({ certificato: state.limite2016CertificatoEnte,
    fondoDipendenti: state.fondoPersonaleDipendente2016, fondoEqPo: state.fondoEqPo2016,
    fondoDirigenza: state.fondoDirigenza2016, risorseSegretario: state.risorseSegretario2016,
    fondoStraordinario: state.fondoStraordinario2016, altreVociSoggette: state.altreVoci2016Soggette });
  const historicalAvailable = history.status === 'VALID';
  return {
    historicalAvailable,
    base: historicalAvailable ? state.result?.limite2016Base : undefined,
    adjustedLimit: historicalAvailable ? state.result?.limiteArt23Attualizzato : undefined,
    margin: historicalAvailable ? state.result?.margineArt23 : undefined,
    missingReason: historicalAvailable ? undefined : 'Non determinabile: manca la base storica 2016 certificata o ricostruita.',
  };
}

/** Read-only presentation of transfer evidence. Legacy numbers are never repaired. */
export function presentTransferredArt23(snapshot?: {
  input?: { limiteArt23Storico2016?: unknown; limiteArt23Comma2Attualizzato?: unknown };
} | null) {
  const historical = snapshot?.input?.limiteArt23Storico2016;
  const adjusted = snapshot?.input?.limiteArt23Comma2Attualizzato;
  const supplied = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const historicalState = !supplied(historical) ? 'MISSING'
    : historical === 0 ? 'VALID_ZERO' : 'VALID_POSITIVE';
  const adjustedState = !supplied(adjusted) || !supplied(historical) ? 'INDETERMINATE'
    : adjusted === 0 ? 'VALID_ZERO' : 'VALID_POSITIVE';
  return {
    historicalState,
    adjustedState,
    historical: supplied(historical) ? formatCurrency(historical) : 'Non importato',
    adjusted: !supplied(adjusted) ? 'n/d — Non determinabile'
      : formatCurrency(adjusted) + (!supplied(historical)
        ? ' — dato tecnico: base storica non attestata nello snapshot' : ''),
  };
}
