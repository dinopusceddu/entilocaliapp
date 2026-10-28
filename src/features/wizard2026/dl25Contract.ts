import { resolveDl25CarryForward, resolveDl25TotalCeiling } from '../../logic/shared/dl25CarryForward';
import type { Dl25AnnualState } from '../../domain/dl25';
import type { Wizard2026DraftState } from './types';
import type { FundData } from '../../domain/types';
import { calculateSimulazione } from '../../logic/calculation/fundEngine';
import { TipologiaEnte } from '../../domain/enums';
import { resolveDl25Regime } from '../../logic/shared/dl25Regime';
import { resolveArt33ApplicationPolicy } from '../../logic/shared/art33ApplicationPolicy';
import FinancialMath from '../../utils/financialMath';

export function dl25PresentationResult(facts: Wizard2026DraftState['dl25']) {
  const total = resolveDl25TotalCeiling(facts);
  return { ...facts.result, limiteMassimoDL25: total,
    soglia48: total === undefined ? undefined : FinancialMath.multiplyExact(facts.stipendiTabellari2023NonDirigenti!, 0.48),
    risorse2025DaSottrarre: total === undefined ? undefined : FinancialMath.sumAll(facts.fondoStabile2025Certificato, facts.budgetEq2025, facts.altreRisorse2025DaSottrarre) };
}

export function isDl25YearConsistent(state: Wizard2026DraftState, fund: FundData) {
  return fund.annualData?.annoRiferimento === undefined || state.ente.annoRiferimento === fund.annualData.annoRiferimento;
}

export function withDl25FundContext(state: Wizard2026DraftState, fund: FundData): Wizard2026DraftState {
  const raw = fund.fondoAccessorioDipendenteData?.st_incrementoDL25_2025;
  const canonical = fund.annualData?.dl25;
  return { ...state, dl25: { ...canonical, ...state.dl25,
    simulationInput: state.dl25.simulationInput ?? fund.annualData?.simulatoreInput,
    popolazioneEnte: state.dl25.popolazioneEnte ?? fund.annualData?.numeroAbitanti,
    legacyStoredAmount: state.dl25.legacyStoredAmount ?? canonical?.legacyStoredAmount ??
      (!canonical && raw !== undefined && raw > 0 ? raw : undefined),
  } };
}

export function resolveWizardDl25Regime(state: Pick<Wizard2026DraftState, 'ente' | 'dl25'>) {
  const policy = resolveArt33ApplicationPolicy({ entityType: state.ente.entityType,
    territorialContext: state.ente.territorialContext, referenceYear: state.ente.annoRiferimento,
    manualDecision: state.ente.art33ManualDecision });
  return resolveDl25Regime(state.ente.annoRiferimento, state.dl25.regimeDate, policy.action);
}

export function resolveWizardDl25Simulation(state: Pick<Wizard2026DraftState, 'ente' | 'dl25'>) {
  const type = state.ente.entityType === 'COMUNE' ? TipologiaEnte.COMUNE
    : state.ente.entityType === 'PROVINCIA' ? TipologiaEnte.PROVINCIA : TipologiaEnte.ALTRO;
  return calculateSimulazione(state.dl25.simulationInput, state.dl25.popolazioneEnte, type, {
    annoRiferimento: state.ente.annoRiferimento, dl25: wizardDl25Facts(state.dl25, state.ente.annoRiferimento),
    entityClassification: { entityType: state.ente.entityType, territorialContext: state.ente.territorialContext },
    art33ManualDecision: state.ente.art33ManualDecision,
  });
}

/** Deprecated wizard amount is legacy data, never silently a later-year delta. */
export function wizardDl25Facts(facts: Wizard2026DraftState['dl25'], _year?: number): Dl25AnnualState {
  return { ...facts,
    legacyStoredAmount: facts.legacyStoredAmount ?? (facts.currentYearDelta === undefined && (facts.incrementoApplicato ?? 0) > 0 ? facts.incrementoApplicato : undefined),
    legacyAppliedProvenance: facts.legacyAppliedProvenance,
  };
}
export function resolveWizardDl25Carry(state: Pick<Wizard2026DraftState, 'dl25' | 'ente'>) {
  const facts = wizardDl25Facts(state.dl25, state.ente.annoRiferimento);
  return resolveDl25CarryForward({ ...facts,
    referenceYear: state.ente.annoRiferimento,
    totalCeiling: resolveDl25TotalCeiling(facts),
  });
}
export function dl25AnnualFacts(state: Pick<Wizard2026DraftState, 'dl25' | 'ente'>): Dl25AnnualState {
  const f = state.dl25;
  const r = resolveWizardDl25Carry(state);
  return { version: 1, stipendiTabellari2023NonDirigenti: f.stipendiTabellari2023NonDirigenti,
    fondoStabile2025Certificato: f.fondoStabile2025Certificato, budgetEq2025: f.budgetEq2025,
    altreRisorse2025DaSottrarre: f.altreRisorse2025DaSottrarre,
    priorCumulativeApplied: r.priorCumulativeApplied, priorStockProvenance: f.priorStockProvenance,
    currentYearDelta: r.currentYearDelta, legacyQualification: f.legacyQualification,
    legacyStoredAmount: f.legacyStoredAmount, legacyAppliedProvenance: f.legacyAppliedProvenance, regimeDate: f.regimeDate };
}
