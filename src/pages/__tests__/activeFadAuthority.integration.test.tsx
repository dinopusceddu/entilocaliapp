import { resolvedZeroState } from '../../test/fixtures/ccnlRecovery';
import { readFileSync } from 'node:fs';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { AppState, CalculationResult, FundData, FundLedgerEntry, NormativeData } from '../../domain';
import { NavigationScope } from '../../domain';
import { createEmptyFundData } from '../../domain/emptyFund';
import { projectCanonicalFadSections } from '../../domain/canonicalFadProjection';
import { deriveCanonicalFundResult, buildCanonicalFundLedger } from '../../logic/calculation/canonicalFundLedger';
import { calculateFundCompletely } from '../../logic/calculation/fundEngine';
import { normalizeInput } from '../../application/input/inputNormalizer';
import { getModuleById, getAccessibleModuleOrFallback } from '../../application/registry/moduleRegistry';
import { formatCurrency } from '../../utils/formatters';
import { UserRole } from '../../domain/enums';

const boundary = vi.hoisted(() => ({ state: {} as AppState, dispatch: vi.fn(), saveState: vi.fn(), performLocalCalculation: vi.fn() }));
vi.mock('../../contexts/AppContext.tsx', () => ({ useAppContext: () => boundary }));
vi.mock('../../hooks/useNormativeData.ts', () => ({ useNormativeData: () => ({ data: { riferimenti_normativi: {} } }) }));
const normative = { riferimenti_normativi: {} } as NormativeData;
const entry = (overrides: Partial<FundLedgerEntry>): FundLedgerEntry => ({ id: 'CCNL_014_CURRENT', amount: 1400,
  component: 'STABLE', operation: 'ADDITION', source: 'MANUAL', status: 'VALID', art23Treatment: 'EXCLUDED', competenceYear: 2026, ...overrides });
function engineFund(stable = 1400, variable = 0): FundData {
  const fund = createEmptyFundData(2026, 'Comune ARCH01');
  fund.historicalData.manualPersonalFundLimit2016 = 100000;
  fund.annualData.hasDirigenza = false; // Explicit fixture applicability, never a production default.
  fund.annualData.art33ManualDecision = 'DO_NOT_APPLY';
  fund.annualData.ccnl2024 = { monteSalari2021: 1_000_000 };
  fund.annualData.ccnlRecovery = resolvedZeroState();
  fund.fondoAccessorioDipendenteData = { st_art58c1_CCNL2026_incremento014_MS2021: stable,
    vn_art58c2_CCNL2026_incremento022_MS2021: variable, st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 0 };
  return fund;
}
function setState(fund = engineFund()) {
  const result = calculateFundCompletely(normalizeInput(fund), normative);
  boundary.state = { fundData: fund, calculationResult: result, currentYear: 2026, isLoading: false,
    currentUser: { id: 'offline', email: 'offline@example.invalid', role: UserRole.GUEST } } as AppState;
  return result;
}
function mountModule(id: string) {
  const module = getModuleById(id)!;
  expect(module.scope).toBe(NavigationScope.FONDO);
  expect(getAccessibleModuleOrFallback(module, boundary.state.currentUser!)).toBe(module);
  const Page = module.component;
  return render(<Page />);
}
function expand(label: RegExp) { fireEvent.click(screen.getByRole('button', { name: label })); }
function expectRow(label: string, amount: number | null) {
  const node = screen.getByText(content => content === label || content === `Subtotale verificato — ${label}`);
  expect(node.parentElement?.textContent).toContain(amount === null ? 'Non determinabile' : formatCurrency(amount));
}
function assertFadTotals(result: CalculationResult) {
  const view = projectCanonicalFadSections(result.canonicalFund);
  for (const label of [/^FONTI DI FINANZIAMENTO STABILI/i, /^FONTI DI FINANZIAMENTO VARIABILI SOGGETTE/i, /^FONTI DI FINANZIAMENTO VARIABILI NON SOGGETTE/i]) expand(label);
  expectRow('SOMMA RISORSE STABILI', view.sections.stabili.total);
  expectRow('SOMMA RISORSE VARIABILI SOGGETTE AL LIMITE', view.sections.vs_soggette.total);
  expectRow('SOMMA RISORSE VARIABILI NON SOGGETTE AL LIMITE', view.sections.vn_non_soggette.total);
  expectRow('TOTALE RISORSE VARIABILI', result.canonicalFund.verifiedVariableTotal);
  expectRow('RISORSE FAD SOGGETTE ART. 23', result.canonicalFund.verifiedArt23Subject);
  expectRow('RISORSE FAD ESCLUSE ART. 23', result.canonicalFund.verifiedArt23Excluded);
}

describe('ARCH01 active FAD modules and issue navigation', () => {
  beforeEach(() => { cleanup(); vi.clearAllMocks(); sessionStorage.clear(); });
  afterEach(cleanup);
  it.each([[1400, 0], [0, 600], [1400, 600]])('U1-U3/U5 real registry stable %s variable %s', (stable, variable) => {
    const result = setState(engineFund(stable, variable));
    mountModule('fundDetails');
    expectRow('Risorse Stabili - Fondo Personale Dipendente', stable);
    expectRow('Risorse Variabili - Fondo Personale Dipendente', variable);
    expectRow('Totale Risorse - Fondo Personale Dipendente', stable + variable);
    expectRow('Fondo Dipendenti - Risorse Soggette Art. 23', result.canonicalFund.art23Subject);
    expectRow('Fondo Dipendenti - Risorse Escluse Art. 23', result.canonicalFund.art23Excluded);
    expand(/Dettaglio Costituzione Fondo Accessorio/);
    expect(document.querySelector('[data-semantic-id="CCNL_014_CURRENT"]')?.textContent).toContain(formatCurrency(stable));
    cleanup(); mountModule('fondoDipendenti'); assertFadTotals(result);
    expectRow('Fondo Costituito Totale', stable + variable);
  });
  it.each(['VALID', 'UNDETERMINED', 'INVALID'] as const)('A5-A7/C2 poisoned raw fields and stored sections cannot override %s', status => {
    const result = setState();
    const canonical = deriveCanonicalFundResult([entry({ amount: status === 'VALID' ? 0 : 1400 }),
      entry({ id: 'VARIABLE', component: 'VARIABLE', amount: status === 'VALID' ? 0 : 999, status: status === 'VALID' ? 'VALID' : status })]);
    boundary.state.calculationResult = { ...result, canonicalFund: canonical, fondi: { ...result.fondi,
      dipendente: { ...result.fondi.dipendente, summary: { totaleStabile: 777777, totaleVariabile: 888888, totaleFondo: 1666665 },
        constitution: { sections: { stale: { id: 'stale', title: 'STALE ECONOMICS', items: [], total: 777777 } } } } } };
    mountModule('fundDetails');
    expectRow('Totale Risorse - Fondo Personale Dipendente', status === 'VALID' ? 0 : null);
    expectRow(status === 'VALID' ? 'TOTALE COMPLESSIVO RISORSE DISPONIBILI (DA TUTTI I FONDI)' : 'SUBTOTALE VERIFICATO RISORSE (DA TUTTI I FONDI)', canonical.verifiedTotal);
    expect(screen.queryByText('STALE ECONOMICS')).not.toBeInTheDocument();
    if (status !== 'VALID') expect(screen.getByTestId('fad-unresolved')).toHaveTextContent('Subtotale verificato');
    cleanup(); mountModule('fondoDipendenti');
    expectRow('Fondo Costituito Totale', status === 'VALID' ? 0 : null);
    assertFadTotals(boundary.state.calculationResult);
  });
  it('U6 missing calculationResult retains input fields and shows no independent total', () => {
    setState(); boundary.state.calculationResult = undefined;
    mountModule('fondoDipendenti');
    expect(screen.getByRole('status')).toHaveTextContent('Risultato canonico non disponibile');
    expand(/^FONTI DI FINANZIAMENTO STABILI/i);
    expect(screen.getByText('SOMMA RISORSE STABILI').parentElement).toHaveTextContent('Non disponibile');
    expect(screen.queryByText('Fondo Costituito Totale')).not.toBeInTheDocument();
    expect(boundary.saveState).not.toHaveBeenCalled();
  });
  it('U7 details corrective route and wizard CTA remain registered', () => {
    setState(); boundary.state.calculationResult = undefined;
    mountModule('fundDetails');
    fireEvent.click(screen.getByRole('button', { name: 'Apri Configurazione Fondo 2026' }));
    expect(boundary.dispatch).toHaveBeenCalledWith({ type: 'SET_ACTIVE_TAB', payload: 'wizard2026Preview' });
    expect(getModuleById('wizard2026Preview')).toBeDefined();
    expect(readFileSync('src/logic/verification/complianceChecks.ts', 'utf8')).toContain("relatedPage: 'fundDetails'");
    expect(readFileSync('src/pages/CabinaDiRegiaPage.tsx', 'utf8')).toContain("['fundDetails', 'distribuzioneRisorse']");
  });
  it('C1 CLOSED snapshot remains read-only and no projection is persisted', () => {
    const fund = engineFund(); fund.metadata = { snapshotStatus: 'CLOSED' } as FundData['metadata'];
    setState(fund); const before = JSON.stringify(fund);
    mountModule('fundDetails'); expand(/Dettaglio Costituzione Fondo Accessorio/);
    cleanup(); mountModule('fondoDipendenti'); expand(/^FONTI DI FINANZIAMENTO STABILI/i);
    for (const input of document.querySelectorAll('input')) expect(input).toBeDisabled();
    expect(boundary.dispatch).not.toHaveBeenCalled(); expect(boundary.saveState).not.toHaveBeenCalled();
    expect(JSON.stringify(fund)).toBe(before);
  });
  it('C3 empty new entity remains non-authoritative in both pages', () => {
    const empty = createEmptyFundData(2026);
    empty.annualData.art33ManualDecision = 'DO_NOT_APPLY'; // explicit administrative gate; economic evidence stays missing
    const result = setState(empty);
    expect(result.canonicalFund.status).toBe('UNDETERMINED');
    mountModule('fundDetails'); expectRow('Totale Risorse - Fondo Personale Dipendente', null);
    cleanup(); mountModule('fondoDipendenti'); expectRow('Fondo Costituito Totale', null);
    expect(screen.getByText(/Risultato canonico non determinabile/)).toBeInTheDocument();
  });
  it.each([false, true])('N1-N2 PNRR raw positive only authoritative when eligibility is validated (%s)', validated => {
    const fund = engineFund(0, 0);
    fund.fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016 = 3000;
    if (validated) Object.assign(fund.annualData, { pnrrExerciseDecision: 'EXERCISED', fondoStabile2016PNRR: 100000,
      rispettoEquilibrioBilancioPrecedente: true, rispettoDebitoCommercialePrecedente: true, incidenzaSalarioAccessorioUltimoRendiconto: 8, approvazioneRendicontoPrecedente: true });
    const result = setState(fund);
    const pnrr = result.canonicalFund.entries.find(row => row.id === 'PNRR_APPLIED')!;
    expect(pnrr.status).toBe(validated ? 'VALID' : 'UNDETERMINED');
    expect(pnrr.amount).toBe(validated ? 3000 : null);
    mountModule('fundDetails'); expand(/Dettaglio Costituzione Fondo Accessorio/);
    expect(document.querySelector('[data-semantic-id="PNRR_APPLIED"]')?.textContent).toContain(pnrr.status === 'VALID' ? formatCurrency(pnrr.amount!) : 'Non determinabile');
    cleanup(); mountModule('fondoDipendenti'); assertFadTotals(result);
    expectRow('Fondo Costituito Totale', result.canonicalFund.status === 'VALID' ? result.canonicalFund.total : null);
  });
  it('N3-N4 DL25 and Art60 entries project once with the existing canonical economics', () => {
    const result = setState();
    const canonical = buildCanonicalFundLedger({ year: 2026, annualData: { ...boundary.state.fundData.annualData,
      entityClassification: { entityType: "COMUNE" },
      simulatoreRisultati: { state: 'VALID', fase5_incrementoNettoEffettivoFondo: 15000 },
      dl25: { version: 1, stipendiTabellari2023NonDirigenti: 300000, fondoStabile2025Certificato: 100000, budgetEq2025: 20000,
        priorCumulativeApplied: 4000, priorStockProvenance: 'Determina 2025 n.10', currentYearDelta: 15000 } },
      fadData: { st_incrementoDL25_2025: 19000, st_art60c2_CCNL2026_decurtazioneIndennitaComparto: 127.44 }, sections: {
        stabili: { id: 'stabili', title: '', total: 999999, items: [{ key: 'st_incrementoDL25_2025', description: 'stock', amount: 19000,
          isSubtractor: false, operator: '+', isRelevantToArt23Limit: false }] } } });
    expect(canonical.entries.find(row => row.id === 'DL25_CURRENT')?.status).toBe('VALID');
    boundary.state.calculationResult = { ...result, canonicalFund: canonical };
    mountModule('fundDetails'); expand(/Dettaglio Costituzione Fondo Accessorio/);
    expect(document.querySelectorAll('[data-semantic-id="DL25_CURRENT"]')).toHaveLength(1);
    expect(document.querySelector('[data-semantic-id="DL25_CURRENT"]')).toHaveTextContent(formatCurrency(19000));
    expect(document.querySelectorAll('[data-semantic-id="ART60_CONSOLIDATION"]')).toHaveLength(1);
    expect(document.querySelector('[data-semantic-id="ART60_ART23_FIGURATIVE"]')).toBeNull();
    cleanup(); mountModule('fondoDipendenti'); assertFadTotals(boundary.state.calculationResult!);
  });
});
